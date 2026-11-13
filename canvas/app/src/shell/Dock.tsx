// Everything under the top bar (data-testid "dock"): Dockview with the two strips, their side panels, and the editor
// group holding one tab per view of the open file. Step 5 built it with every panel an empty state and each view's
// tab body empty; step 6 put a plane in each tab (Plane.tsx). Each side panel's body is its own file under panels/,
// which its step builds: Explorer (step 9), Details (10), Tools (11), Validation (12).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DockviewReact, themeLight } from 'dockview-react';
import type {
  DockviewApi, DockviewGroupPanelApi, DockviewReadyEvent, IDockviewPanelHeaderProps, IDockviewPanelProps, IWatermarkPanelProps,
} from 'dockview-react';
import type { ModelView, Session } from '../core';
import { DetailsPanel } from '../panels/Details';
import { ExplorerPanel } from '../panels/Explorer';
import { ToolsPanel } from '../panels/Tools';
import { ValidationPanel } from '../panels/Validation';
import { Plane } from '../plane/Plane';
import { DockContext, useDock } from './dockContext';
import type { DockState } from './dockContext';
import { EmptyCard } from './EmptyCard';
import { TAB_BAR_HEIGHT } from './theme';

/** Where the dock's layout is kept in this browser: localStorage, under this key. */
export const LAYOUT_KEY = 'grasp-app:layout:1';

/** The side panels, by Dockview panel id, in their strip's order. Left: Explorer (in front at first), Tools, Validation. Right: Details. */
export const LEFT_PANELS = ['explorer', 'tools', 'validation'] as const;
export const RIGHT_PANELS = ['details'] as const;
export type SidePanelId = (typeof LEFT_PANELS)[number] | (typeof RIGHT_PANELS)[number];

/** The panels' titles, which the strips show running up the strip. */
export const PANEL_TITLES: Readonly<Record<SidePanelId, string>> = {
  explorer: 'Explorer', tools: 'Tools', validation: 'Validation', details: 'Details',
};

/** The width of each side's panel in a fresh browser, beside its strip (plan/slice-1.md, section 4), and the strip's own. */
export const LEFT_WIDTH = 280;
export const RIGHT_WIDTH = 320;
export const STRIP_WIDTH = TAB_BAR_HEIGHT;
/** The least a side can be while open, strip included: Dockview's own minimum for an edge group, its strip and 50 px. */
export const MIN_SIDE = STRIP_WIDTH + 50;
/** The most of the dock's width a side opens at, so that the two together leave the editor a fifth of it. */
export const MAX_SIDE_SHARE = 0.4;

/**
 * What the dock remembers across reloads: each side's width (strip included, as Dockview counts it) and whether it is
 * collapsed, and which left panel is in front. Not Dockview's own toJSON(), which would hold the open file's tabs.
 */
export interface LayoutRecord {
  left: { size: number; collapsed: boolean; front: (typeof LEFT_PANELS)[number] };
  right: { size: number; collapsed: boolean };
}

/** The layout of a fresh browser: both sides open, Explorer in front. */
export const DEFAULT_LAYOUT: LayoutRecord = {
  left: { size: LEFT_WIDTH + STRIP_WIDTH, collapsed: false, front: 'explorer' },
  right: { size: RIGHT_WIDTH + STRIP_WIDTH, collapsed: false },
};

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
// A size under what a side can be is none the page wrote: a sash stops at MIN_SIDE.
const sizeOr = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) && value >= MIN_SIDE ? Math.round(value) : fallback;

/**
 * The width a side takes in a dock `dockWidth` px wide, for a remembered `size`: the size itself where it fits, and
 * no more than MAX_SIDE_SHARE of the dock, since a width remembered in a wide window would leave a narrow one no
 * editor. The record keeps the size as it was remembered.
 */
export const fitSide = (size: number, dockWidth: number): number =>
  (dockWidth > 0 ? Math.max(MIN_SIDE, Math.min(size, Math.floor(dockWidth * MAX_SIDE_SHARE))) : size);

/**
 * Reads the layout record from what localStorage held under LAYOUT_KEY: null, or any text. Tolerant: what is missing,
 * of the wrong type, too small to be a side's width or not JSON at all takes its value from DEFAULT_LAYOUT, and it
 * never throws.
 */
export function readLayout(text: string | null): LayoutRecord {
  let raw: unknown = null;
  try { raw = text ? JSON.parse(text) : null; } catch { raw = null; }
  const left = isRecord(raw) && isRecord(raw.left) ? raw.left : {};
  const right = isRecord(raw) && isRecord(raw.right) ? raw.right : {};
  const front = (LEFT_PANELS as readonly string[]).includes(left.front as string)
    ? (left.front as LayoutRecord['left']['front'])
    : DEFAULT_LAYOUT.left.front;
  return {
    left: { size: sizeOr(left.size, DEFAULT_LAYOUT.left.size), collapsed: left.collapsed === true, front },
    right: { size: sizeOr(right.size, DEFAULT_LAYOUT.right.size), collapsed: right.collapsed === true },
  };
}

/** A view's tab title, as tests find it (helpers.mjs, tabTitle): its name, then its kind. */
export const viewTitle = (view: Pick<ModelView, 'name' | 'kind'>): string => `${view.name} : ${view.kind}`;

/** A view's Dockview panel id. */
export const viewPanelId = (viewId: string): string => `view:${viewId}`;

/**
 * What a view's panel is made with: the view's id and the session it is a view of. A tab draws the session in its own
 * params, never the one in the dock's context: when another file is opened, React renders the old file's tabs once
 * more before the dock takes them away, and by then the context holds the new file.
 */
export interface ViewParams {
  viewId: string;
  session: Session;
}

export interface DockProps {
  /** The open file, or null before one is opened. */
  session: Session | null;
  /** Opens a file: what the empty editor's card calls (App's open, the same as the bar's Open). */
  onOpen: () => void;
}

/**
 * The dock. Its contract:
 *
 * - Its root carries data-testid "dock" and fills the window under the bar; the page never scrolls.
 * - DockviewReact with `theme={themeLight}` (without it the edge groups are dark) and `className` for app.css's
 *   rules. In `onReady`: `api.addEdgeGroup('left', { id: 'left', initialSize, collapsed })` and the same for 'right',
 *   from readLayout(localStorage), each size fitted to the dock (fitSide); then the side panels join them with
 *   `position: { referenceGroup }`, in the order of LEFT_PANELS and RIGHT_PANELS, the record's `front` made active.
 *   Never `api.clear()`: it empties the edge groups.
 * - Each side panel's body is its component under panels/ (COMPONENTS below), as wide as its panel, inside SidePanel
 *   (panels/SidePanel.tsx): its root carries data-testid "explorer", "tools", "validation" or "details" (helpers.mjs,
 *   TESTIDS). A panel reads the open file through useDock() (dockContext.ts). The dock makes each once, in onReady,
 *   and Dockview keeps it mounted while its tab is hidden or its side collapsed.
 * - Strips: names run up the left strip, first name on top; the name of the view that is shown is teal, and none is
 *   while its side is collapsed. A click on the name in front collapses the side to its strip; a click on a name
 *   opens it (Dockview's own behaviour for edge groups).
 * - Side tabs have no close button (a tab component of our own). Neither a side tab nor a side group can be dragged
 *   (`onWillDragPanel` / `onWillDragGroup` call preventDefault for them), floated by Shift + press (cancelled by a
 *   native `pointerdown` listener on the tab's own element: React's handler would run after Dockview's), or dropped
 *   onto (both edge groups `locked`). Editor tabs keep Dockview's dragging, splitting and floating; no tab pops out.
 * - The record. A width is remembered when a sash was dragged, once, when the drag ends, for each open side the drag
 *   changed: nothing else is the user's own choice of a width, so a window too narrow for the sides does not rewrite
 *   one. When the dock gets wider again, or a side is opened, a side that was squeezed goes back to its remembered
 *   width. `onDidCollapsedChange` on each edge group writes whether it is collapsed, `onDidActivePanelChange` on the
 *   left one `front`. (Dockview tells a group of its size at every layout, changed or not, and `api.width` is the
 *   editor's width, not the dock's: neither says whose doing a width is.)
 * - Views: when `session` changes, every `view:` panel goes and one is added per view of `session.model.views`, in
 *   the model's order: id viewPanelId(view.id), component 'view', params ViewParams, title viewTitle(view). The first
 *   goes into a group of its own, `api.addGroup()`, when the editor holds no view (with no position, or one relative
 *   to the left group, Dockview puts it into the edge group), the rest beside it by `referencePanel`; the first is in
 *   front. A view that floats over the editor is not in it. A view's tab body is empty until step 6.
 * - With no group in the editor, Dockview's `watermarkComponent` shows EmptyCard: with no file, "Open a model"; with
 *   a file, also how many of its views are closed and "Show the views again", which adds back only the views with no
 *   panel (adding a live panel's id throws), into the editor.
 * - Panel bodies, the watermark and the tab component are module-level components that read a context Dock provides
 *   (DockContext in dockContext.ts), so their identities never change between renders.
 * - **Step 9** (plan/swarm/step-9.md): `showView` of the context opens a view's tab or brings it forward, as
 *   DockState says; and the dock tells the session's selection which view is in front (selectionOf(session).front):
 *   the view of the view panel that Dockview made active last (`api.onDidActivePanelChange`, for a panel whose id
 *   begins `view:`; a side panel made active changes nothing), and null once that panel is closed with no other view
 *   panel taking its place, or when another file is opened.
 * - **Step 10** (plan/swarm/step-10.md): a view's tab is titled viewTitle(view) at every moment: when the session's
 *   history tells of a change that touched a view (`told.touched.views`, or `told.views === null`), the panel of each
 *   view that has one gets its title again (`panel.api.setTitle`), so a name typed into Details shows on the tab as
 *   it is typed.
 */
export function Dock({ session, onOpen }: DockProps): JSX.Element {
  const root = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<DockviewApi | null>(null);
  // Counts the panels added and removed, so that what the card says of the closed views is read again.
  const [panels, setPanels] = useState(0);
  const showViews = useCallback(() => {
    if (api && session) addViews(api, session);
  }, [api, session]);
  const context = useMemo<DockState>(() => {
    const closed = api && session ? session.model.views.filter((view) => !api.getPanel(viewPanelId(view.id))).length : 0;
    return { session, onOpen, showViews, closed, showView };
    // `panels` is here for its changes only: a panel added or removed changes what getPanel answers.
  }, [api, session, onOpen, showViews, panels]);

  useEffect(() => {
    if (!api) return undefined;
    const count = (): void => setPanels((n) => n + 1);
    const added = api.onDidAddPanel(count);
    const removed = api.onDidRemovePanel(count);
    return () => { added.dispose(); removed.dispose(); };
  }, [api]);

  // A new session: its views replace the old ones.
  useEffect(() => {
    if (!api) return;
    for (const panel of [...api.panels]) if (panel.id.startsWith(VIEW_PREFIX)) api.removePanel(panel);
    if (session) addViews(api, session);
  }, [api, session]);

  const onReady = useCallback((event: DockviewReadyEvent) => {
    if (root.current) setUpSides(event.api, root.current);
    setApi(event.api);
  }, []);

  return (
    <DockContext.Provider value={context}>
      <div ref={root} data-testid="dock" className="grasp-dock">
        <DockviewReact
          className="grasp-dockview"
          theme={themeLight}
          components={COMPONENTS}
          tabComponents={TAB_COMPONENTS}
          watermarkComponent={Watermark}
          onReady={onReady}
        />
      </div>
    </DockContext.Provider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// What the panels read.

// Step 9 builds it: DockState in dockContext.ts says what it does. Nothing calls it until the Explorer does.
const showView = (_viewId: string): void => {
  throw new Error('Dock.showView: step 9 builds it');
};

const VIEW_PREFIX = 'view:';
const isSidePanel = (id: string): boolean => (LEFT_PANELS as readonly string[]).includes(id) || (RIGHT_PANELS as readonly string[]).includes(id);
const SIDES = ['left', 'right'] as const;
type Side = (typeof SIDES)[number];

// A view's tab draws `params.session`'s view `params.viewId` (ViewParams says why not the context's session).
const ViewPanel = ({ params }: IDockviewPanelProps<ViewParams>): JSX.Element => <Plane session={params.session} viewId={params.viewId} />;

const COMPONENTS = {
  explorer: ExplorerPanel, tools: ToolsPanel, validation: ValidationPanel, details: DetailsPanel, view: ViewPanel,
};

/** A side panel's tab: its title and no close button. Shift + press must not float it, which Dockview does on pointerdown. */
function SideTab({ api }: IDockviewPanelHeaderProps): JSX.Element {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const tab = ref.current?.closest('.dv-tab');
    if (!tab) return undefined;
    const stop = (event: Event): void => { if ((event as PointerEvent).shiftKey) event.preventDefault(); };
    tab.addEventListener('pointerdown', stop, true);
    return () => tab.removeEventListener('pointerdown', stop, true);
  }, []);
  return <span ref={ref} className="grasp-side-tab">{api.title}</span>;
}
const TAB_COMPONENTS = { side: SideTab };

function Watermark(_props: IWatermarkPanelProps): JSX.Element {
  const { session, onOpen, showViews, closed } = useDock();
  const file = session ? { name: session.name, views: session.model.views.length, closed } : null;
  return <EmptyCard file={file} onOpen={onOpen} onShowViews={showViews} />;
}

// ---------------------------------------------------------------------------------------------------------------------
// The sides.

function readStored(): LayoutRecord {
  let text: string | null = null;
  try { text = localStorage.getItem(LAYOUT_KEY); } catch { text = null; }
  return readLayout(text);
}

function keep(record: LayoutRecord): void {
  try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(record)); } catch { /* the layout is only a convenience */ }
}

/** Makes both edge groups with their panels, and wires what they remember. Runs once, from onReady. `root` is the dock's own element. */
function setUpSides(api: DockviewApi, root: HTMLElement): void {
  const record = readStored();
  const dockWidth = (): number => root.clientWidth;
  const edge = (side: Side): DockviewGroupPanelApi => api.addEdgeGroup(side, {
    id: side, initialSize: fitSide(record[side].size, dockWidth()), collapsed: record[side].collapsed, collapsedSize: STRIP_WIDTH,
  });
  const sides: Record<Side, DockviewGroupPanelApi> = { left: edge('left'), right: edge('right') };
  const add = (ids: readonly SidePanelId[], group: DockviewGroupPanelApi): void => {
    for (const id of ids) {
      api.addPanel({ id, component: id, tabComponent: 'side', title: PANEL_TITLES[id], position: { referenceGroup: group.id } });
    }
  };
  add(LEFT_PANELS, sides.left);
  add(RIGHT_PANELS, sides.right);
  api.getPanel(record.left.front)?.api.setActive();
  for (const side of SIDES) sides[side].locked = 'no-drop-target';

  // The side tabs and side groups stay where they are.
  api.onWillDragPanel((event) => { if (isSidePanel(event.panel.id)) event.nativeEvent.preventDefault(); });
  api.onWillDragGroup((event) => { if ((SIDES as readonly string[]).includes(event.group.id)) event.nativeEvent.preventDefault(); });

  // A width is the user's when a sash was dragged. It is read once, at the release that ends the drag, for each open
  // side whose width the drag changed: the widths are as the drag's last move left them, and Dockview's own end of
  // the drag changes none. It is written there and then, so a reload straight after a drag finds it.
  const widths = (): Record<Side, number> => ({ left: Math.round(sides.left.width), right: Math.round(sides.right.width) });
  root.addEventListener('pointerdown', (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('.dv-sash')) return;
    const before = widths();
    const end = (): void => {
      removeEventListener('pointerup', end, true);
      removeEventListener('pointercancel', end, true);
      const after = widths();
      let changed = false;
      for (const side of SIDES) {
        if (after[side] === before[side] || sides[side].isCollapsed() || after[side] < MIN_SIDE) continue;
        record[side].size = after[side];
        changed = true;
      }
      if (changed) keep(record);
    };
    addEventListener('pointerup', end, true);
    addEventListener('pointercancel', end, true);
  }, true);

  // A window too narrow for the sides squeezes them, and Dockview gives a wider window's room to the editor alone. So
  // when the dock has grown, or a side is opened, a side narrower than it is remembered goes back to its width, once
  // the layout that told of it is over. The dock's width is the one Dockview laid out with, the three parts' sum,
  // read when the right side, the last of a layout, is told its size: Dockview lays out a frame after the window
  // changed, and by then the element may be another width again.
  let dock = dockWidth();
  const restore = (): void => {
    for (const side of SIDES) {
      const width = fitSide(record[side].size, dock);
      if (!sides[side].isCollapsed() && sides[side].width < width) sides[side].setSize({ width });
    }
  };
  sides.right.onDidDimensionsChange(() => {
    const now = sides.left.width + api.width + sides.right.width;
    if (now > dock) queueMicrotask(restore);
    dock = now;
  });
  for (const side of SIDES) {
    sides[side].onDidCollapsedChange((event) => {
      record[side].collapsed = event.isCollapsed;
      keep(record);
      if (!event.isCollapsed) queueMicrotask(restore);
    });
  }
  sides.left.onDidActivePanelChange(() => {
    const front = api.getPanel('explorer')?.group.activePanel?.id;
    if ((LEFT_PANELS as readonly string[]).includes(front ?? '') && front !== record.left.front) {
      record.left.front = front as LayoutRecord['left']['front'];
      keep(record);
    }
  });
}

// ---------------------------------------------------------------------------------------------------------------------
// The views.

/**
 * Adds a tab for each view of the session that has none. They go into the editor: beside a view that is there, or,
 * when it holds none, into a new group of its own. A view floating over the editor is no place to put the others.
 * The first one added is in front.
 */
function addViews(api: DockviewApi, session: Session): void {
  const views: readonly ModelView[] = session.model.views;
  const panelOf = (view: ModelView) => api.getPanel(viewPanelId(view.id));
  const missing = views.filter((view) => !panelOf(view));
  let anchor = views.find((view) => panelOf(view)?.group.api.location.type === 'grid');
  let first: ReturnType<DockviewApi['addPanel']> | null = null;
  for (const view of missing) {
    // With no view in the editor, a new group of its own: with no position the panel would join an edge group.
    const position = anchor ? { referencePanel: viewPanelId(anchor.id) } : { referenceGroup: api.addGroup() };
    const params: ViewParams = { viewId: view.id, session };
    const panel = api.addPanel({ id: viewPanelId(view.id), component: 'view', title: viewTitle(view), params, position });
    anchor = anchor ?? view;
    first = first ?? panel;
  }
  first?.api.setActive();
}
