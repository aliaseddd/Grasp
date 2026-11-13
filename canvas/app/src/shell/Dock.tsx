// Everything under the top bar (data-testid "dock"): Dockview with the two strips, their side panels, and the editor
// group holding one tab per view of the open file. Step 5 builds it with every panel an empty state and each view's
// tab body empty; step 6 puts a plane in each tab (Plane.tsx), step 9 the Explorer, step 10 Details, step 11 Tools,
// step 12 Validation.
//
// Skeleton: the types, the layout record and its reader are final; the component is the implementer's.

import type { ModelView, Session } from '../core';

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
 *   goes in with `position: { direction: 'right' }` of the left group when the centre is empty, the rest into its
 *   group; the first is in front. A view's tab body is empty until step 6.
 * - With no group in the centre, Dockview's `watermarkComponent` shows EmptyCard: with no file, "Open a model"; with
 *   a file whose tabs are all closed, also "Show the views again", which adds back only the views with no panel
 *   (adding a live panel's id throws).
 * - Panel bodies, the watermark and the tab component are module-level components that read a context Dock provides,
 *   so their identities never change between renders.
 */
export function Dock(_props: DockProps): JSX.Element {
  throw new Error('Dock: not built yet (step 5).');
}
