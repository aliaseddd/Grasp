// The body of a view that a plane draws: a graph body (plan/slice-1.md, step 6; plan/notes.md, session 17, "The
// architecture", and session 20, "Step 6: the outline, part 2"; plan/slice-2.md, section 4, seams 2 to 7). It is the
// gate that mounts React Flow only while the tab has a size, and React Flow's props and gestures, the ground, the zoom
// buttons and the minimap. views/ViewHost.tsx renders it for a view whose kind has a graph body, and the card for a
// kind no body draws yet. It knows no Dockview, none of the model's records, no history and no file: it draws what its
// view's store gives.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent, RefObject } from 'react';
import { Background, BackgroundVariant, ControlButton, Controls, ReactFlow, SelectionMode, useReactFlow, useStoreApi, ViewportPortal } from '@xyflow/react';
import type { ReactFlowProps } from '@xyflow/react';
import { drawsLines, elementOf, hasMinimap, LARGE_VIEW, LOOK, marksOf, MAX_ZOOM, MIN_ZOOM, relationshipOf, selectionOf, toolsOf, viewsOf } from '../core';
import type { Hit, PlaneEdge, PlaneNode, Session, Viewport } from '../core';
import { bodyOf, FLOW_PROPS, planeTypes } from '../views/bodies';
import type { BodyEntry } from '../views/bodies';
import { BodyContext } from '../views/bodyContext';
import type { BodyHands } from '../views/bodyContext';
import { lend } from '../views/lends';
import type { CameraMove, ViewRect } from '../views/lends';
import { ConnectMenu } from './ConnectMenu';
import { connectOf } from './gestures/connect';
import type { GripPress } from './gestures/connect';
import { ConnectLayer } from './gestures/ConnectLayer';
import { FreePins } from './marks/Pin';
import './marks/marks.css';
import { PlaneMiniMap } from './MiniMap';
import { Palette } from './Palette';
import type { PaletteAt } from './Palette';
import './marquee.css';
import { CLICK_DISTANCE, viewStoreOf } from './viewStore';
import type { ViewStore } from './viewStore';
import './zoom.css';
import { ZoomReadout } from './ZoomReadout';

export interface PlaneProps {
  /** The session the tab was made for (ViewParams in shell/Dock.tsx says why not the dock's). */
  session: Session;
  viewId: string;
}

/**
 * The contract.
 *
 * - **The root** fills the tab's body and carries `data-testid="plane"` and `data-view` (the view's id), as the card
 *   of a view no body draws does (views/ViewHost.tsx), and the class `grasp-plane`. It sets the adapter's measures as
 *   CSS variables for app.css (LOOK's header, head, lead, tail, pad, port and rowType, as `--grasp-node-*`), so that
 *   each number is written once.
 * - **A kind no body draws** is not the plane's any more: ViewHost shows its card, and follows a view whose kind
 *   changes or that leaves the model.
 * - **The gate.** A ResizeObserver on the root. While the root has a width and a height, the inner component is
 *   mounted; at 0 by 0 (Dockview has taken the tab's body out of the document) it is not. The inner component reads
 *   `store.camera(width, height)` once, as it mounts and before its first snapshot, and gives it to React Flow as
 *   `defaultViewport`; so a view is fitted when it first has a size, and a tab shown again finds its camera.
 * - **A change of size.** While React Flow is mounted, each new size of the root (the same ResizeObserver's kind, in
 *   the inner component) is given to `store.sized(width, height)`; when that returns a viewport, it is set
 *   (`setViewport`), so a view that is still as fitted follows its plane and one placed by hand stays. The size
 *   renders nothing by itself: only the minimap's coming and going does.
 * - **The snapshot**: `useSyncExternalStore(store.subscribe, store.getSnapshot)`; its `nodes` and `edges` go to React
 *   Flow as they are.
 * - **React Flow's props**, every object and function among them the same at each render: `nodeTypes` and `edgeTypes`
 *   from the registry (planeTypes() of views/bodies.ts: the 13 SHAPES and the line, and what the entries with a graph
 *   body add; a type that is missing falls back to React Flow's `default`, silently), `onNodesChange`,
 *   `onEdgesChange` and `onViewportChange` (the store's nodesChanged, edgesChanged, moved), `defaultViewport`,
 *   `minZoom` and `maxZoom` (the adapter's MIN_ZOOM, MAX_ZOOM), `onlyRenderVisibleElements` for a view of more than
 *   LARGE_VIEW nodes (the adapter's, which says why), `panOnScroll` with `panOnScrollSpeed={1}`, `zoomOnScroll={false}`, `zoomOnPinch`,
 *   `zoomOnDoubleClick={false}`, `paneClickDistance` (a press that moves a few pixels is still a click),
 *   `selectionKeyCode="Shift"` (Shift with a drag draws the marquee, step 9),
 *   `deleteKeyCode={null}` (React Flow's own Delete removes nothing until slice 2 gives Delete its meaning),
 *   nodes draggable (step 7: boxes, small nodes and border items, React Flow's default; a press on a box drags it, a
 *   press on the ground pans) with `nodeDragThreshold={0}` (a drag begins at the press: with the default 1 px React
 *   Flow starts its tracking at the first move and the node trails the pointer by that move; the store, not React Flow,
 *   tells a click that slips from a drag: it starts no gesture until the pointer is CLICK_DISTANCE from the press),
 *   `selectNodesOnDrag={false}` (a drag selects nothing; a click does, within `nodeClickDistance`, the same
 *   CLICK_DISTANCE as the ground's),
 *   `autoPanOnNodeDrag={false}` (the plane does not pan under a drag near its edge: a box stays under the pointer),
 *   `nodesConnectable={false}`, `nodesFocusable={false}`,
 *   `edgesFocusable={false}`, `disableKeyboardA11y`, `proOptions` hiding the attribution. No `fitView`, `viewport`,
 *   `width` or `height` prop, no `extent` and no `expandParent` on a node.
 * - **Around the nodes**: the ground's dots (`Background`), left out when far; `Controls` at the bottom left without
 *   the lock (`showInteractive={false}`) and without React Flow's own fit (`showFitView={false}`), which would fit a
 *   frame later by its own rule: a `ControlButton` named "Fit the view" calls `store.fit(width, height)` with the
 *   root's size now and sets that viewport; PlaneMiniMap (MiniMap.tsx) at the bottom right, the adapter's MINIMAP in size, only
 *   while the root is as large as the adapter's hasMinimap(width, height) asks: in a narrow plane it would cover the
 *   zoom buttons. The fit keeps the minimap's band free only where it is shown (the adapter's fitMargins).
 * - **The pointer and the keyboard.** A border item's name and a small node's name take the pointer, so a click on a
 *   name selects its node (app.css). The zoom buttons and the fit button show the theme's focus ring, teal,
 *   `--grasp-focus-width` wide, inside the button.
 * - **A press** of the main button (a mousedown, heard by a capturing listener on the root) on the ground, a node or a
 *   line, and not on something that takes typing, has its default prevented when the focus is already where the press
 *   would put it: on the press's nearest focusable ancestor (FOCUSABLE; in a tab, Dockview's content element), or,
 *   with none, on nothing. So the browser starts no text selection's drag, whose handling of each move of the pressed
 *   mouse was a third of a pan step at 2,112 nodes (session 28). A press that must move the focus keeps its default:
 *   the browser moves the focus, as a press of the pointer (which `:focus-visible` and Dockview's group both hear), and
 *   that one gesture pays for the drag. The plane focuses nothing by script. Other buttons' presses, and presses on
 *   the zoom buttons, the fit button and the minimap, which are outside React Flow's pane, are left as they are.
 * - Nothing of Grasp's renders on a viewport change: `moved` is the store's, and the component reads no viewport.
 *
 * What the plane takes from each of steps 8 to 12 (plan/swarm/shared.md, "What the plane takes from each step"):
 *
 * - **Step 8** changes nothing in this file. Its changes are the adapter's projectStep and linesDrawn, which the
 *   store calls, and the minimap of our own in MiniMap.tsx.
 * - **Step 9, the selection** (plan/swarm/step-9.md). Every click on the plane that is not the end of a drag becomes
 *   one Hit (core/selection.ts) and goes through one function of this file, `clicked(hit)`: from React Flow's
 *   onPaneClick (the ground), onNodeClick (a node, wherever in it) and onEdgeClick (a line), with `at` from
 *   screenToFlowPosition and `add` from the event's ctrlKey or metaKey. `clicked` calls
 *   selectionOf(session).click(hit). React Flow's own `select` changes pick nothing (the store's contract says what
 *   it does with them). The props that change: `selectionKeyCode="Shift"`, `selectionMode={SelectionMode.Full}`,
 *   `multiSelectionKeyCode` the constant `['Control', 'Meta']`, and the three click callbacks, each the same function
 *   at every render. A marquee (Shift + drag, begun anywhere on the plane) is the one gesture whose picks come from
 *   React Flow, and they come from its rectangle, not from its changes: a child component of ReactFlow subscribes to
 *   React Flow's own store (useStoreApi) and, while `userSelectionActive` is true, hands each new
 *   `userSelectionRect`, turned into the view's units with the state's `transform`, to the store's marquee(rect). The
 *   same subscriber sets React Flow's `nodesSelectionActive` back to false whenever it finds it true, so the
 *   rectangle React Flow would leave around the picked boxes, which lies over them and takes their clicks, is never
 *   drawn. And the click that ends a marquee is no click: a flag set while a marquee is drawn and cleared at the next
 *   pointerdown on the root (a capturing listener) makes the three callbacks do nothing, since React Flow lets that
 *   click through to a node when Shift is let go before the button. The marquee's look is marquee.css, beside this
 *   file. What is selected on the plane is what the store's snapshot says, from the session's selection.
 * - **Step 11, the tool in hand and the palette** (plan/swarm/step-11.md, "The plane's part"; core/commands.ts, Tools).
 *   - `clicked(hit)` offers the click to the tool first: `if (!toolsOf(session).click(hit)) selectionOf(session).click(hit)`.
 *     Nothing else of step 9's picking changes.
 *   - While a tool is in hand (`toolsOf(session).armed`, read through useSyncExternalStore(tools.listen, ...)) the root
 *     carries `data-tool`, the tool's kind, and plane/palette.css makes the pointer a crosshair over the ground, the
 *     nodes and the lines. A press that moves is still a drag or a pan; only a click is the tool's.
 *   - While a line's first end is taken (`tools.first`) the root carries `data-first`, that element's id, and holds one
 *     `<style>` element whose one rule gives that element's node on this plane a dashed teal outline:
 *     `[data-testid="plane"][data-view="<view id>"] .react-flow__node[data-id="<element id>"] { outline: 2px dashed
 *     var(--grasp-teal); outline-offset: 3px; }`. With no first end: no attribute and no `<style>`.
 *   - The plane renders again only when `armed` or `first` changes: nothing more on a pan or a drag step.
 *   - The root's own onContextMenu prevents the browser's menu for every right-click inside it (the zoom buttons, the
 *     minimap, a marquee's rectangle and the card of a view no plane draws included). React Flow's onPaneContextMenu,
 *     onNodeContextMenu and onEdgeContextMenu open the palette at the pointer (clientX, clientY) with the Hit of that
 *     right-click: `at` from screenToFlowPosition, `add` false. A right-click picks nothing and is no click for the tool.
 *   - One `<Palette session at onClose />` (Palette.tsx) for the plane; `at` is the plane's state, null while closed.
 * - **Steps 10 and 12** change nothing in this file.
 *
 * What slice 2's scaffold adds (plan/slice-2.md, section 4, seams 2 to 7; section 8, package 2-1). The packages that
 * draw in a plane read this part.
 *
 * - **Who a node is, in the document** (seam 5). The plane builds every Hit from elementOf(node) and
 *   relationshipOf(edge) of the node or edge React Flow hands it, never from a node's id; a click or a right-click on
 *   a node that stands for no element is one on the ground. In the document, one element inside each node's and each
 *   edge's own React Flow element carries `data-of="el:<element id>"` or `data-of="rel:<relationship id>"`, far and
 *   near (BoxNode.tsx and LineEdge.tsx say where; a node with no element carries none; two nodes of one element both
 *   carry it). That is how a test finds what a plane shows (`thingsIn`), how the label editor finds a thing with no
 *   anchor, and how `mark` finds what to outline. Nothing reads `data-id` as an element's or a relationship's id.
 * - **The body's hands** (seam 2; views/bodyContext.ts). The plane provides BodyContext around React Flow and the
 *   connect menu: `toView` is React Flow's screenToFlowPosition; `hitAt` goes through document.elementsFromPoint,
 *   looks only at what is inside this root, answers a node's grip (an element with `data-grip` that is a child of a
 *   node's React Flow element), and the way from the node's side to it, with that node's element, passes over
 *   whatever else carries `data-pass` or is inside something that does (a line's grips, the pins, the badges, the
 *   line in hand), stops at one of React Flow's panels (the ground), and answers with the first that is a node with
 *   an element or an edge, else the ground; `zoom` is the store's; `menu` opens the palette; `inside` asks the root's
 *   rectangle; `mark` sets `data-over` ('fits' or 'no') on the React Flow element of each node of that element, or of that
 *   relationship's edge, and takes it off the ones before (plane/nodes/grips.css draws it); `swallow` raises the flag
 *   that drops the next click. Before React Flow is mounted `toView` gives the point back and `hitAt` the ground.
 * - **The click that follows a gesture's release is no click** (seam 6): one flag, raised while a marquee is drawn,
 *   by `swallow()`, and at every press on a grip; the three click callbacks do nothing while it is up, and the next
 *   press on the root takes it down first.
 * - **The grips** (seam 6). Two attributes of the root, which plane/nodes/grips.css is written under: `data-grips`
 *   while `connectOf` is not null and a line can be drawn in the view (the core's drawsLines: its kind's tools hold a
 *   relationship kind), and `data-connecting` while the gesture's `state` is not null (read through
 *   useSyncExternalStore(gesture.listen, ...), so the plane renders again only when a line is taken in hand or let
 *   go). The capturing `pointerdown` listener on the root hands a press of the main button on an element with
 *   `data-grip` inside this plane to `connectOf(store).press(press, body)` as a GripPress: for a node's grip the
 *   element of the node it is in; for a line's grip (`from`, `to`) the relationship of the edge it is in and its two
 *   drawn ends, read from the two grips of that edge (`cx`, `cy`). It neither stops nor prevents the event. A grip in
 *   a node that stands for no element hands nothing on.
 * - **What the plane mounts for the packages**: `<ConnectLayer session viewId />` as a child of React Flow;
 *   `<ConnectMenu session viewId />` beside the palette; `<FreePins session viewId />` inside React Flow's viewport
 *   (its ViewportPortal, whose top left corner is the view's origin), near and only while the view has a free pin
 *   (marksOf(session).free(viewId)), so a view with none holds no subscription for it; `<ZoomReadout session viewId />`
 *   in the zoom controls, which plane/zoom.css puts between the two zoom buttons.
 * - **`--grasp-zoom`** is the plane's zoom, as a CSS variable, written when the store's zoom changes (watchZoom) and
 *   never on a pan, without a render. plane/marks/marks.css scales a mark by its inverse, so a mark keeps its size on
 *   the screen. It is given by one rule of a `<style>` element the root holds, to the three places that draw at a
 *   size of the screen and to what is inside them: every `.grasp-marks`, React Flow's viewport portal (the free pins,
 *   the line in hand) and its label renderer (a line's marks). It is NOT on the root itself, as the plan's seam 4 has
 *   it: a custom property on the root is inherited by every node, and at 2,112 nodes writing it cost 110 to 150 ms of
 *   each step of a zoom; the rule costs about 5 (plan/notes.md keeps the numbers). So a node's own stylesheet cannot
 *   read it outside those places; whatever else needs the zoom asks the store (`zoom`, `watchZoom`) or
 *   useBody().zoom().
 * - **`panOnDrag`** is the main and the middle button (PAN_BUTTONS): the middle mouse button drags the plane, from
 *   the ground and from a node or a line alike.
 * - **`onNodeDragStart`** tells the store which node a press named (dragStarted), for a graph body of another
 *   renderer.
 * - **An entry's plane props** (seam 3): the `flow` of the view kind's entry in the registry, cut to FLOW_PROPS
 *   (`elevateNodesOnSelect`), is spread onto React Flow.
 * - **A selected line is drawn over the boxes it crosses**, on every plane, by the zIndex the store gives a selected
 *   edge (SELECTED_LINE_Z, plane/viewStore.ts), so that its end grips (EndGrips) can be pressed where an end lies on
 *   a node or under another line. The plane does not set React Flow's `elevateEdgesOnSelect`, which would raise every
 *   line of a picked box as well. (React Flow still draws a line that ends on a nested node at that node's z, so the
 *   lines of a picked nested box lie over its siblings, as in slice 1.)
 * - **The camera's hand** (seam 8; views/lends.ts): while React Flow is mounted the plane lends its camera and its
 *   `reveal`. The camera zooms by a step of ZOOM_STEP about the plane's middle ('in', 'out'), held between MIN_ZOOM
 *   and MAX_ZOOM; moves the window over the view by PAN_STEP screen px ('left', 'right', 'up', 'down': 'left' shows
 *   what is to the left, as the old page's arrow key does); or fits, as the fit button does. `reveal(rect)` moves the
 *   camera, at its zoom, only as far as brings the rectangle REVEAL_PAD inside the window, a rectangle larger than
 *   the window to its middle; a rectangle that is inside already moves nothing. A view moved so is placed by hand.
 */
export function Plane({ session, viewId }: PlaneProps): JSX.Element {
  const store = viewStoreOf(session, viewId);
  const root = useRef<HTMLDivElement>(null);
  // Whether the root has a size: React Flow is mounted only then. The size itself is read where it is used.
  const [sized, setSized] = useState(false);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) { setSized(false); return undefined; }
    const has = (width: number, height: number): boolean => width > 0 && height > 0;
    setSized(has(el.clientWidth, el.clientHeight));
    const observer = new ResizeObserver((entries) => {
      const box = entries[entries.length - 1].contentRect;
      const next = has(box.width, box.height);
      setSized((was) => (was === next ? was : next));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The plane's zoom, for the stylesheets: one rule, written when the zoom changes and never on a pan. It names the
  // places that use it, and not the root, whose every descendant would otherwise be styled again at each step.
  const zoomRule = useRef<HTMLStyleElement>(null);
  useLayoutEffect(() => {
    const style = zoomRule.current;
    if (!style) return undefined;
    const here = `[data-testid="plane"][data-view=${JSON.stringify(viewId)}]`;
    const places = ZOOMED.map((place) => `${here} ${place}`).join(', ');
    const write = (): void => { style.textContent = `${places} { --grasp-zoom: ${store.zoom}; }`; };
    write();
    return store.watchZoom(write);
  }, [store, viewId]);

  // The tool in hand and its first end, as one string, so the plane renders only when either changes.
  const tools = toolsOf(session);
  const handKey = useSyncExternalStore(tools.listen, () => `${tools.armed ? tools.armed.kind : ''}|${tools.first ?? ''}`);
  const bar = handKey.indexOf('|');
  const armed = handKey.slice(0, bar);
  const first = handKey.slice(bar + 1);
  const [palette, setPalette] = useState<PaletteAt | null>(null);
  const closePalette = useCallback(() => setPalette(null), []);
  const openPalette = useCallback((at: PaletteAt) => setPalette(at), []);
  const noBrowserMenu = useCallback((event: ReactMouseEvent) => event.preventDefault(), []);
  // Seam 6: whether grips are drawn in this view at all, and whether a line is in hand. The plane renders again only
  // when a line is taken in hand or let go, not at a step of it.
  const gesture = connectOf ? connectOf(store) : null;
  const grips = gesture !== null && drawsLines(session, viewId);
  const connecting = useSyncExternalStore(gesture ? gesture.listen : never, () => gesture !== null && gesture.state !== null);
  // The view kind's entry, for the props it sets. ViewHost renders the plane again when the kind changes.
  const kind = viewsOf(session).find((view) => view.id === viewId)?.kind;
  const flow = flowOf(kind === undefined ? null : bodyOf(session.lib, kind));
  // What the body's hands reach: React Flow's inside (put there by Picking while it is mounted), the flag that makes
  // the next click no click, and what a gesture has outlined.
  const reach = useRef<Reach>({ inner: null, noClick: false, over: { key: '', marked: [] } }).current;
  const body = useMemo(() => planeHands(store, root, reach, openPalette), [store, reach, openPalette]);

  // A press of the main button on the ground or on what lies on it starts no text selection's drag when it need not
  // move the focus: Chromium handles every move of a pressed mouse as such a drag, which at 2,112 mounted nodes cost
  // about 5 ms of each step of a pan (plan/notes.md, sessions 25 and 28). A press that must move the focus keeps its
  // default, so that the browser moves it as a press of the pointer, which :focus-visible hears as one.
  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const pressed = (event: MouseEvent): void => {
      const target = event.target instanceof Element ? event.target : null;
      if (event.button !== 0 || !target || !target.closest('.react-flow__pane') || target.closest(TYPED_INTO)) return;
      const to = target.closest(FOCUSABLE);
      const active = document.activeElement;
      if (to ? active === to : !active || active === document.body) event.preventDefault();
    };
    el.addEventListener('mousedown', pressed, true);
    return () => el.removeEventListener('mousedown', pressed, true);
  }, []);
  return (
    <div
      ref={root}
      className="grasp-plane"
      data-testid="plane"
      data-view={viewId}
      data-tool={armed || undefined}
      data-first={first || undefined}
      data-grips={grips ? '' : undefined}
      data-connecting={connecting ? '' : undefined}
      style={LOOK_VARIABLES}
      onContextMenu={noBrowserMenu}
    >
      {first && (
        <style>{`[data-testid="plane"][data-view="${viewId}"] .react-flow__node[data-id="${first}"] { outline: 2px dashed var(--grasp-teal); outline-offset: 3px; }`}</style>
      )}
      <style ref={zoomRule} />
      <BodyContext.Provider value={body}>
        {sized ? <Flow store={store} root={root} openPalette={openPalette} reach={reach} body={body} flow={flow} /> : null}
        <ConnectMenu session={session} viewId={viewId} />
      </BodyContext.Provider>
      <Palette session={session} at={palette} onClose={closePalette} />
    </div>
  );
}

/** A zoom step of the camera's hand, as React Flow's own zoom buttons take it. */
export const ZOOM_STEP = 1.2;
/** How far the camera's hand moves the window over the view at a step, in screen px. */
export const PAN_STEP = 80;
/** How far inside the window `reveal` brings a place, in screen px. */
export const REVEAL_PAD = 24;
/** Where `--grasp-zoom` is given: what holds a thing's marks, and React Flow's two containers for what is drawn over the view. */
const ZOOMED = ['.grasp-marks', '.react-flow__viewport-portal', '.react-flow__edgelabel-renderer'];
/** The buttons that drag the plane: the main one and the middle one. */
const PAN_BUTTONS = [0, 1];

// The adapter's measures, once each, for app.css.
const LOOK_VARIABLES = {
  '--grasp-node-header': `${LOOK.header}px`,
  '--grasp-node-head': `${LOOK.head}px`,
  '--grasp-node-lead': `${LOOK.lead}px`,
  '--grasp-node-tail': `${LOOK.tail}px`,
  '--grasp-node-pad': `${LOOK.pad}px`,
  '--grasp-node-port': `${LOOK.port}px`,
  '--grasp-node-row-type': `${LOOK.rowType}px`,
} as CSSProperties;

const PRO_OPTIONS = { hideAttribution: true };
// What a press may focus, nearest first, as the browser's own press would; and what takes typing, whose press is left as it is.
const FOCUSABLE = '[tabindex], a[href], button, input, select, textarea, [contenteditable="true"]';
const TYPED_INTO = 'input, select, textarea, [contenteditable="true"]';
// So that React Flow's own idea of "adding" is Hit.add on every machine (its default is Meta on a Mac, Control elsewhere).
const MULTI_SELECTION_KEYS = ['Control', 'Meta'];

/** A subscription to nothing, for a plane with no gesture to listen to. */
const never = (): (() => void) => () => {};

type FlowSet = Partial<Pick<ReactFlowProps<PlaneNode, PlaneEdge>, (typeof FLOW_PROPS)[number]>>;
const NO_FLOW: FlowSet = {};
const FLOWS = new WeakMap<BodyEntry, FlowSet>();
/** The props an entry sets for its planes, cut to the short list the registry allows: the same object each time for one entry. */
function flowOf(entry: BodyEntry | null): FlowSet {
  if (!entry || !entry.flow) return NO_FLOW;
  let kept = FLOWS.get(entry);
  if (!kept) {
    kept = {};
    for (const name of FLOW_PROPS) if (entry.flow[name] !== undefined) kept[name] = entry.flow[name];
    FLOWS.set(entry, kept);
  }
  return kept;
}

type ToFlow = (point: { x: number; y: number }) => { x: number; y: number };
type FlowApi = ReturnType<typeof useStoreApi<PlaneNode, PlaneEdge>>;

/** What the body's hands reach, kept for the plane's life. */
interface Reach {
  /** React Flow's inside, while it is mounted. */
  inner: { toFlow: ToFlow; flow: FlowApi } | null;
  /** Whether the next click is no click: a marquee was drawn since the last press, a gesture asked for it (swallow), or the press was on a grip. */
  noClick: boolean;
  /** What a gesture has outlined: the thing and how, and the elements that carry `data-over` for it. */
  over: { key: string; marked: Element[] };
}

/** The element of the node with that id in React Flow's own record, or null: for no such node, and for a node that stands for none. */
function elementAt(reach: Reach, nodeId: string | null): string | null {
  const node = nodeId === null ? undefined : reach.inner?.flow.getState().nodeLookup.get(nodeId);
  return node ? elementOf(node) : null;
}
/** The relationship of the edge with that id in React Flow's own record, or null for no such edge. */
function relationshipAt(reach: Reach, edgeId: string | null): string | null {
  const edge = edgeId === null ? undefined : reach.inner?.flow.getState().edgeLookup.get(edgeId);
  return edge ? relationshipOf(edge) : null;
}

/** The body's hands of a plane (views/bodyContext.ts): the same object for the plane's life. */
function planeHands(store: ViewStore, root: RefObject<HTMLDivElement>, reach: Reach, openPalette: OpenPalette): BodyHands {
  const view = store.viewId;
  const toView = (client: { x: number; y: number }): { x: number; y: number } => (reach.inner ? reach.inner.toFlow(client) : { x: client.x, y: client.y });
  const hitAt = (client: { x: number; y: number }): Hit => {
    const at = toView(client);
    const el = root.current;
    if (el && reach.inner) {
      for (const found of document.elementsFromPoint(client.x, client.y)) {
        if (!el.contains(found)) continue;
        // A node's grip, and the way from its side to the grip (the grip's ::before), is that node's: while a line is
        // in hand every near node shows its grips, and a person lets go on the handle they aim at. A line's grips,
        // in its edge, are passed over with the rest of what carries data-pass.
        const holder = found.closest('[data-grip]')?.parentElement;
        if (holder?.classList.contains('react-flow__node')) {
          const id = elementAt(reach, holder.getAttribute('data-id'));
          if (id === null) continue;
          return { view, type: 'el', id, at, add: false };
        }
        if (found.closest('[data-pass]')) continue;
        if (found.closest('.react-flow__panel')) break;
        const node = found.closest('.react-flow__node');
        if (node) {
          const id = elementAt(reach, node.getAttribute('data-id'));
          if (id === null) continue;
          return { view, type: 'el', id, at, add: false };
        }
        const edge = found.closest('.react-flow__edge');
        if (edge) {
          const id = relationshipAt(reach, edge.getAttribute('data-id'));
          if (id === null) continue;
          return { view, type: 'rel', id, at, add: false };
        }
      }
    }
    return { view, type: 'ground', id: null, at, add: false };
  };
  return {
    session: store.session,
    viewId: view,
    toView,
    hitAt,
    zoom: () => store.zoom,
    menu: (hit, client) => openPalette({ hit, left: client.x, top: client.y }),
    inside: (client) => {
      const r = root.current?.getBoundingClientRect();
      return !!r && client.x >= r.left && client.x <= r.right && client.y >= r.top && client.y <= r.bottom;
    },
    mark: (hit, fits) => {
      const thing = hit && hit.id !== null && hit.type !== 'ground' ? `${hit.type}:${hit.id}` : '';
      const key = thing === '' ? '' : `${thing}|${fits ? 'fits' : 'no'}`;
      const was = reach.over;
      if (key === was.key && was.marked.every((el) => el.isConnected)) return;
      for (const el of was.marked) el.removeAttribute('data-over');
      const marked: Element[] = [];
      if (thing !== '' && root.current) {
        for (const carrier of root.current.querySelectorAll(`[data-of=${JSON.stringify(thing)}]`)) {
          const el = carrier.closest('.react-flow__node, .react-flow__edge');
          if (!el || marked.includes(el)) continue;
          el.setAttribute('data-over', fits ? 'fits' : 'no');
          marked.push(el);
        }
      }
      reach.over = { key, marked };
    },
    swallow: () => { reach.noClick = true; },
  };
}

// How far the pointer may move between press and release and still click is the store's CLICK_DISTANCE: React Flow's
// own click distances (the ground's and a node's) are set to it, and the store starts no gesture of a drag or a resize
// that has not gone as far (nodeDragThreshold is 0, so a drag begins at the press and the node does not trail the
// pointer; the store, not React Flow, tells a click that slipped from a drag).

interface FlowProps {
  store: ViewStore;
  root: RefObject<HTMLDivElement>;
}
type OpenPalette = (at: PaletteAt) => void;

/** React Flow, mounted while the tab's body has a size. */
function Flow({ store, root, openPalette, reach, body, flow }: FlowProps & { openPalette: OpenPalette; reach: Reach; body: BodyHands; flow: FlowSet }): JSX.Element {
  // Before the first snapshot: the camera decides far or near, and a view that is first seen is fitted to this window.
  const [camera] = useState(() => store.camera(root.current?.clientWidth ?? 0, root.current?.clientHeight ?? 0));
  // Whether the root is large enough for the minimap: set again only when a new size crosses the line.
  const [minimap, setMinimap] = useState(() => hasMinimap(root.current?.clientWidth ?? 0, root.current?.clientHeight ?? 0));
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const types = planeTypes();
  // What a click or a right-click hit: the thing the node or the edge stands for, never its id. A node that stands
  // for no element is the ground. `id` is null for the ground.
  const hitOf = useCallback((event: ReactMouseEvent | MouseEvent, type: 'el' | 'rel' | 'ground', id: string | null, add: boolean): Hit => {
    const at = body.toView({ x: event.clientX, y: event.clientY });
    return id === null ? { view: store.viewId, type: 'ground', id: null, at, add } : { view: store.viewId, type, id, at, add };
  }, [store, body]);
  const clicked = useCallback((event: ReactMouseEvent, type: 'el' | 'rel' | 'ground', id: string | null): void => {
    // No click: the one that ends a marquee, and the one that follows a gesture's release (swallow) or a press on a grip.
    if (reach.noClick) return;
    const hit = hitOf(event, type, id, event.ctrlKey || event.metaKey);
    if (!toolsOf(store.session).click(hit)) selectionOf(store.session).click(hit);
  }, [store, reach, hitOf]);
  const rightClicked = useCallback((event: ReactMouseEvent | MouseEvent, type: 'el' | 'rel' | 'ground', id: string | null): void => {
    event.preventDefault();
    openPalette({ hit: hitOf(event, type, id, false), left: event.clientX, top: event.clientY });
  }, [openPalette, hitOf]);
  const onNodeContextMenu = useCallback((event: ReactMouseEvent, node: PlaneNode) => rightClicked(event, 'el', elementOf(node)), [rightClicked]);
  const onEdgeContextMenu = useCallback((event: ReactMouseEvent, edge: PlaneEdge) => rightClicked(event, 'rel', relationshipOf(edge)), [rightClicked]);
  const onPaneContextMenu = useCallback((event: ReactMouseEvent | MouseEvent) => rightClicked(event, 'ground', null), [rightClicked]);
  const onNodeClick = useCallback((event: ReactMouseEvent, node: PlaneNode) => clicked(event, 'el', elementOf(node)), [clicked]);
  const onEdgeClick = useCallback((event: ReactMouseEvent, edge: PlaneEdge) => clicked(event, 'rel', relationshipOf(edge)), [clicked]);
  const onPaneClick = useCallback((event: ReactMouseEvent) => clicked(event, 'ground', null), [clicked]);
  const onNodeDragStart = useCallback((_event: ReactMouseEvent, node: PlaneNode) => store.dragStarted(node.id), [store]);
  return (
    <ReactFlow<PlaneNode, PlaneEdge>
      nodes={snapshot.nodes}
      edges={snapshot.edges}
      nodeTypes={types.nodeTypes}
      edgeTypes={types.edgeTypes}
      onNodesChange={store.nodesChanged}
      onEdgesChange={store.edgesChanged}
      onViewportChange={store.moved}
      defaultViewport={camera}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      onlyRenderVisibleElements={snapshot.nodes.length > LARGE_VIEW}
      panOnDrag={PAN_BUTTONS}
      panOnScroll
      panOnScrollSpeed={1}
      zoomOnScroll={false}
      zoomOnPinch
      zoomOnDoubleClick={false}
      paneClickDistance={CLICK_DISTANCE}
      selectionKeyCode="Shift"
      selectionMode={SelectionMode.Full}
      multiSelectionKeyCode={MULTI_SELECTION_KEYS}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      onPaneClick={onPaneClick}
      onNodeContextMenu={onNodeContextMenu}
      onEdgeContextMenu={onEdgeContextMenu}
      onPaneContextMenu={onPaneContextMenu}
      onNodeDragStart={onNodeDragStart}
      deleteKeyCode={null}
      selectNodesOnDrag={false}
      nodeClickDistance={CLICK_DISTANCE}
      nodeDragThreshold={0}
      autoPanOnNodeDrag={false}
      nodesConnectable={false}
      nodesFocusable={false}
      edgesFocusable={false}
      disableKeyboardA11y
      proOptions={PRO_OPTIONS}
      {...flow}
    >
      {!snapshot.far && <Background variant={BackgroundVariant.Dots} />}
      <Controls position="bottom-left" showInteractive={false} showFitView={false}>
        <ZoomReadout session={store.session} viewId={store.viewId} />
        <FitButton store={store} root={root} />
      </Controls>
      {minimap && <PlaneMiniMap store={store} />}
      <Follow store={store} root={root} setMinimap={setMinimap} />
      <Picking store={store} root={root} reach={reach} body={body} />
      <Camera store={store} root={root} />
      {!snapshot.far && <Floating store={store} />}
      <ConnectLayer session={store.session} viewId={store.viewId} />
    </ReactFlow>
  );
}

/**
 * The free pins of the view, inside React Flow's viewport, whose top left corner is the view's origin. The portal is
 * mounted only while the view has a free pin: a view with none holds no subscription to React Flow's store for it.
 */
function Floating({ store }: { store: ViewStore }): JSX.Element | null {
  const marks = marksOf(store.session);
  const free = useSyncExternalStore(marks.listen, () => marks.free(store.viewId));
  if (free.length === 0) return null;
  return <ViewportPortal><FreePins session={store.session} viewId={store.viewId} /></ViewportPortal>;
}

/**
 * Draws nothing. While React Flow is mounted it lends the plane's camera and its `reveal` to the shell's hand
 * (views/lends.ts): the contract of Plane says what each does.
 */
function Camera({ store, root }: FlowProps): null {
  const { setViewport } = useReactFlow();
  useEffect(() => {
    const go = (next: Viewport): void => {
      // The store hears it first, so a view that crosses 25% is projected far or near before React Flow draws.
      store.moved(next);
      void setViewport(next);
    };
    const camera = (how: CameraMove): void => {
      const el = root.current;
      if (!el || el.clientWidth <= 0 || el.clientHeight <= 0) return;
      const { clientWidth: width, clientHeight: height } = el;
      if (how === 'fit') { void setViewport(store.fit(width, height)); return; }
      const at = store.camera(width, height);
      if (how === 'in' || how === 'out') {
        const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, how === 'in' ? at.zoom * ZOOM_STEP : at.zoom / ZOOM_STEP));
        const by = zoom / at.zoom;
        go({ x: width / 2 - (width / 2 - at.x) * by, y: height / 2 - (height / 2 - at.y) * by, zoom });
        return;
      }
      const dx = how === 'left' ? PAN_STEP : how === 'right' ? -PAN_STEP : 0;
      const dy = how === 'up' ? PAN_STEP : how === 'down' ? -PAN_STEP : 0;
      go({ x: at.x + dx, y: at.y + dy, zoom: at.zoom });
    };
    const reveal = (rect: ViewRect): void => {
      const el = root.current;
      if (!el || el.clientWidth <= 0 || el.clientHeight <= 0) return;
      const { clientWidth: width, clientHeight: height } = el;
      const at = store.camera(width, height);
      // How far one axis must move: not at all when the place is inside, to the window's middle when it is larger
      // than the window, and else just as far as brings it inside.
      const shift = (from: number, size: number, room: number): number => {
        const to = from + size;
        if (size > room - 2 * REVEAL_PAD) return room / 2 - (from + to) / 2;
        if (from < REVEAL_PAD) return REVEAL_PAD - from;
        if (to > room - REVEAL_PAD) return room - REVEAL_PAD - to;
        return 0;
      };
      const dx = shift(rect.x * at.zoom + at.x, rect.w * at.zoom, width);
      const dy = shift(rect.y * at.zoom + at.y, rect.h * at.zoom, height);
      if (dx !== 0 || dy !== 0) go({ x: at.x + dx, y: at.y + dy, zoom: at.zoom });
    };
    return lend(store.session, store.viewId, { camera, reveal });
  }, [store, root, setViewport]);
  return null;
}

/**
 * Follows the root's size while React Flow is mounted, and draws nothing: each new size goes to the store, which fits
 * a view that is still as fitted again, and says whether the minimap has room.
 */
function Follow({ store, root, setMinimap }: FlowProps & { setMinimap: (shown: boolean) => void }): null {
  const { setViewport } = useReactFlow();
  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(() => {
      // The size as the camera and the fit button read it. At 0 by 0 the tab is hidden, and the gate unmounts this.
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (width <= 0 || height <= 0) return;
      setMinimap(hasMinimap(width, height));
      const next = store.sized(width, height);
      if (next) void setViewport(next);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [store, root, setMinimap, setViewport]);
  return null;
}

/**
 * Draws nothing. It reaches what only React Flow's inside holds: screenToFlowPosition and React Flow's own store, which
 * it leaves where the body's hands reach them, and the marquee's rectangle, which goes to the store at each move (step
 * 9, "Picking on a plane"). It also sets React Flow's `nodesSelectionActive` back to false whenever it is true, so the
 * rectangle that would lie over the picked boxes is never drawn, and raises the flag that drops the click ending a
 * marquee, which the next press on the root clears.
 *
 * Slice 2, seam 6: the same press on the root, when it is the main button's on a grip, goes to the gesture as a
 * GripPress, with the body's hands.
 */
function Picking({ store, root, reach, body }: FlowProps & { reach: Reach; body: BodyHands }): null {
  const { screenToFlowPosition } = useReactFlow();
  const flow = useStoreApi<PlaneNode, PlaneEdge>();
  useEffect(() => {
    reach.inner = { toFlow: screenToFlowPosition, flow };
    return () => { reach.inner = null; };
  }, [reach, screenToFlowPosition, flow]);
  useEffect(() => {
    const el = root.current;
    const pressed = (event: PointerEvent): void => {
      reach.noClick = false;
      const gesture = connectOf ? connectOf(store) : null;
      const target = event.target instanceof Element ? event.target.closest('[data-grip]') : null;
      if (!gesture || event.button !== 0 || !target || !el?.contains(target)) return;
      const press = gripPress(reach, target, event);
      if (!press) return;
      gesture.press(press, body);
      // A press on a grip is never a click on the grip's node, whether or not it becomes a gesture: a release before
      // the gesture's distance does nothing at all.
      reach.noClick = true;
    };
    el?.addEventListener('pointerdown', pressed, true);
    const stop = flow.subscribe((state, before) => {
      if (state.nodesSelectionActive) flow.setState({ nodesSelectionActive: false });
      if (!state.userSelectionActive) return;
      reach.noClick = true;
      const rect = state.userSelectionRect;
      if (!rect || (state.userSelectionActive === before.userSelectionActive && rect === before.userSelectionRect)) return;
      const [tx, ty, zoom] = state.transform;
      store.marquee({ x: (rect.x - tx) / zoom, y: (rect.y - ty) / zoom, width: rect.width / zoom, height: rect.height / zoom });
    });
    return () => {
      stop();
      el?.removeEventListener('pointerdown', pressed, true);
    };
  }, [store, root, flow, reach, body]);
  return null;
}

const GRIPS: readonly GripPress['grip'][] = ['top', 'right', 'bottom', 'left', 'from', 'to'];

/**
 * The GripPress of a press on a grip: for a node's grip the element of the node it is in; for a line's grip the
 * relationship of the edge it is in and the two drawn ends, which are the middles of that edge's two grips, in the
 * view's units. Null for a grip that is in neither, a grip in a node that stands for no element, and a line's grip
 * whose other is not there.
 */
function gripPress(reach: Reach, target: Element, event: PointerEvent): GripPress | null {
  const grip = GRIPS.find((name) => name === target.getAttribute('data-grip'));
  if (!grip) return null;
  const base = { grip, target, client: { x: event.clientX, y: event.clientY }, pointerId: event.pointerId };
  if (grip !== 'from' && grip !== 'to') {
    const element = elementAt(reach, target.closest('.react-flow__node')?.getAttribute('data-id') ?? null);
    return element === null ? null : { ...base, element, relationship: null, ends: null };
  }
  const edge = target.closest('.react-flow__edge');
  const relationship = relationshipAt(reach, edge?.getAttribute('data-id') ?? null);
  const at = (name: string): { x: number; y: number } | null => {
    const el = edge?.querySelector(`[data-grip="${name}"]`);
    return el ? { x: Number(el.getAttribute('cx')), y: Number(el.getAttribute('cy')) } : null;
  };
  const from = at('from');
  const to = at('to');
  return relationship !== null && from && to ? { ...base, element: null, relationship, ends: { from, to } } : null;
}

/** The fit button: the adapter's fit, into the root as it is now, set as the viewport. */
function FitButton({ store, root }: FlowProps): JSX.Element {
  const { setViewport } = useReactFlow();
  const fitNow = useCallback(() => {
    const el = root.current;
    if (el) void setViewport(store.fit(el.clientWidth, el.clientHeight));
  }, [store, root, setViewport]);
  return (
    <ControlButton onClick={fitNow} title="Fit the view" aria-label="Fit the view">
      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
        <path className="grasp-fit-icon" d="M1,5 V1 H5 M11,1 H15 V5 M15,11 V15 H11 M5,15 H1 V11" />
      </svg>
    </ControlButton>
  );
}
