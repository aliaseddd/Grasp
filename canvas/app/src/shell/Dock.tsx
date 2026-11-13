// Everything under the top bar (data-testid "dock"): Dockview with the two strips, their side panels, and the editor
// group holding one tab per view of the open file. Step 5 builds it with every panel an empty state and each view's
// tab body empty; step 6 puts a plane in each tab (Plane.tsx), step 9 the Explorer, step 10 Details, step 11 Tools,
// step 12 Validation.
//
// Skeleton: the types, the layout record and its reader are final; the component is the implementer's.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DockviewReact, themeLight } from 'dockview-react';
import type {
  DockviewApi, DockviewGroupPanelApi, DockviewReadyEvent, IDockviewPanelHeaderProps, IDockviewPanelProps, IWatermarkPanelProps,
} from 'dockview-react';
import type { ModelView, Session } from '../core';
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

/** The width of each side, strip included, in a fresh browser. Dockview's `initialSize` counts the strip. */
export const LEFT_WIDTH = 280;
export const RIGHT_WIDTH = 320;

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
  left: { size: LEFT_WIDTH, collapsed: false, front: 'explorer' },
  right: { size: RIGHT_WIDTH, collapsed: false },
};

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const sizeOr = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.round(value) : fallback;

/**
 * Reads the layout record from what localStorage held under LAYOUT_KEY: null, or any text. Tolerant: what is missing,
 * of the wrong type or not JSON at all takes its value from DEFAULT_LAYOUT, and it never throws.
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
    left: { size: sizeOr(left.size, LEFT_WIDTH), collapsed: left.collapsed === true, front },
    right: { size: sizeOr(right.size, RIGHT_WIDTH), collapsed: right.collapsed === true },
  };
}

/** A view's tab title, as tests find it (helpers.mjs, tabTitle): its name, then its kind. */
export const viewTitle = (view: Pick<ModelView, 'name' | 'kind'>): string => `${view.name} : ${view.kind}`;

/** A view's Dockview panel id. */
export const viewPanelId = (viewId: string): string => `view:${viewId}`;

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
 *   from readLayout(localStorage); then the side panels join them with `position: { referenceGroup }`, in the order
 *   of LEFT_PANELS and RIGHT_PANELS, the record's `front` made active. Never `api.clear()`: it empties the edge groups.
 * - Each side panel's body is an empty state for now, as wide as its panel: Explorer's root carries data-testid
 *   "explorer", Details's "details" (helpers.mjs, TESTIDS). Tools and Validation say what step brings them.
 * - Strips: names run up the left strip, first name on top; the name in front is teal. A click on the name in front
 *   collapses the side to its strip; a click on a name opens it (Dockview's own behaviour for edge groups).
 * - Side tabs have no close button (a tab component of our own). Neither a side tab nor a side group can be dragged
 *   (`onWillDragPanel` / `onWillDragGroup` call preventDefault for them), floated by Shift + press (cancelled by a
 *   native `pointerdown` listener on the tab's own element: React's handler would run after Dockview's), or dropped
 *   onto (both edge groups `locked`). Editor tabs keep Dockview's dragging, splitting and floating; no tab pops out.
 * - The record: each edge group's `onDidDimensionsChange` and `onDidCollapsedChange` (not `onDidLayoutChange`, which
 *   does not fire for them) write LAYOUT_KEY. A width is the user's only when the dock's own size did not change with
 *   it, so a narrow window does not rewrite it. `onDidActivePanelChange` on the left group writes `front`.
 * - Views: when `session` changes, every `view:` panel goes and one is added per view of `session.model.views`, in
 *   the model's order: id viewPanelId(view.id), component 'view', params { viewId }, title viewTitle(view). The first
 *   goes into a group of its own, `api.addGroup()`, when the centre is empty (with no position, or one relative to
 *   the left group, Dockview puts it into the edge group), the rest beside it by `referencePanel`; the first is in
 *   front. A view's tab body is empty until step 6.
 * - With no group in the centre, Dockview's `watermarkComponent` shows EmptyCard: with no file, "Open a model"; with
 *   a file whose tabs are all closed, also "Show the views again", which adds back only the views with no panel
 *   (adding a live panel's id throws).
 * - Panel bodies, the watermark and the tab component are module-level components that read a context Dock provides,
 *   so their identities never change between renders.
 */
export function Dock({ session, onOpen }: DockProps): JSX.Element {
  const [api, setApi] = useState<DockviewApi | null>(null);
  const showViews = useCallback(() => {
    if (api && session) addViews(api, session);
  }, [api, session]);
  const context = useMemo<DockState>(() => ({ session, onOpen, showViews }), [session, onOpen, showViews]);

  // A new session: its views replace the old ones.
  useEffect(() => {
    if (!api) return;
    for (const panel of [...api.panels]) if (panel.id.startsWith(VIEW_PREFIX)) api.removePanel(panel);
    if (session) addViews(api, session);
  }, [api, session]);

  const onReady = useCallback((event: DockviewReadyEvent) => {
    setUpSides(event.api);
    setApi(event.api);
  }, []);

  return (
    <DockContext.Provider value={context}>
      <div data-testid="dock" className="grasp-dock">
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

interface DockState {
  session: Session | null;
  onOpen: () => void;
  showViews: () => void;
}
const DockContext = createContext<DockState>({ session: null, onOpen: () => {}, showViews: () => {} });

const VIEW_PREFIX = 'view:';
const isSidePanel = (id: string): boolean => (LEFT_PANELS as readonly string[]).includes(id) || (RIGHT_PANELS as readonly string[]).includes(id);
const SIDE_GROUPS: readonly string[] = ['left', 'right'];

function EmptyState({ testId, title, text }: { testId?: string; title: string; text: string }): JSX.Element {
  return (
    <div className="grasp-side-body" data-testid={testId}>
      <div className="grasp-side-title">{title}</div>
      <div className="grasp-side-text">{text}</div>
    </div>
  );
}

const ExplorerPanel = (): JSX.Element => <EmptyState testId="explorer" title="Explorer" text="The model's tree comes in step 9." />;
const ToolsPanel = (): JSX.Element => <EmptyState title="Tools" text="The view's tools come in step 11." />;
const ValidationPanel = (): JSX.Element => <EmptyState title="Validation" text="The model's problems come in step 12." />;
const DetailsPanel = (): JSX.Element => <EmptyState testId="details" title="Details" text="The selection's fields come in step 10." />;
const ViewPanel = (_props: IDockviewPanelProps): JSX.Element => <div className="grasp-view-body" />;

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
  const { session, onOpen, showViews } = useContext(DockContext);
  return <EmptyCard fileName={session ? session.name : null} onOpen={onOpen} onShowViews={session ? showViews : undefined} />;
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

/** Makes both edge groups with their panels, and wires what they remember. Runs once, from onReady. */
function setUpSides(api: DockviewApi): void {
  const record = readStored();
  const left = api.addEdgeGroup('left', { id: 'left', initialSize: record.left.size, collapsed: record.left.collapsed, collapsedSize: TAB_BAR_HEIGHT });
  const right = api.addEdgeGroup('right', { id: 'right', initialSize: record.right.size, collapsed: record.right.collapsed, collapsedSize: TAB_BAR_HEIGHT });
  const add = (ids: readonly SidePanelId[], group: DockviewGroupPanelApi): void => {
    for (const id of ids) {
      api.addPanel({ id, component: id, tabComponent: 'side', title: PANEL_TITLES[id], position: { referenceGroup: group.id } });
    }
  };
  add(LEFT_PANELS, left);
  add(RIGHT_PANELS, right);
  api.getPanel(record.left.front)?.api.setActive();
  left.locked = 'no-drop-target';
  right.locked = 'no-drop-target';

  // The side tabs and side groups stay where they are.
  api.onWillDragPanel((event) => { if (isSidePanel(event.panel.id)) event.nativeEvent.preventDefault(); });
  api.onWillDragGroup((event) => { if (SIDE_GROUPS.includes(event.group.id)) event.nativeEvent.preventDefault(); });

  // What is remembered. A width is the user's only when the dock's own width did not change with it.
  let dockWidth = api.width;
  const remember = (side: 'left' | 'right', group: DockviewGroupPanelApi): void => {
    group.onDidDimensionsChange((size) => {
      const own = api.width === dockWidth;
      dockWidth = api.width;
      if (!own || group.isCollapsed() || !(size.width > 0)) return;
      record[side].size = Math.round(size.width);
      keep(record);
    });
    group.onDidCollapsedChange((event) => {
      record[side].collapsed = event.isCollapsed;
      keep(record);
    });
  };
  remember('left', left);
  remember('right', right);
  left.onDidActivePanelChange(() => {
    const front = api.getPanel('explorer')?.group.activePanel?.id;
    if ((LEFT_PANELS as readonly string[]).includes(front ?? '')) {
      record.left.front = front as LayoutRecord['left']['front'];
      keep(record);
    }
  });
}

// ---------------------------------------------------------------------------------------------------------------------
// The views.

/** Adds a tab for each view of the session that has none. The first goes in beside the sides, the rest into its group, and the first is in front. */
function addViews(api: DockviewApi, session: Session): void {
  const views: readonly ModelView[] = session.model.views;
  const missing = views.filter((view) => !api.getPanel(viewPanelId(view.id)));
  let anchor = views.find((view) => api.getPanel(viewPanelId(view.id)));
  let first: ReturnType<DockviewApi['addPanel']> | null = null;
  for (const view of missing) {
    // With nothing in the centre, a new group of its own: with no position the panel would join an edge group.
    const position = anchor ? { referencePanel: viewPanelId(anchor.id) } : { referenceGroup: api.addGroup() };
    const panel = api.addPanel({ id: viewPanelId(view.id), component: 'view', title: viewTitle(view), params: { viewId: view.id }, position });
    anchor = anchor ?? view;
    first = first ?? panel;
  }
  first?.api.setActive();
}
