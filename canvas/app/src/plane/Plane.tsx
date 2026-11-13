// A view's tab body (plan/slice-1.md, step 6; plan/notes.md, session 17, "The architecture", and session 20, "Step 6:
// the outline, part 2"). For a kind no plane draws it shows the card. Otherwise it is the gate that mounts React Flow
// only while the tab has a size, and React Flow's props and gestures, the ground, the zoom buttons and the minimap.
// It knows no Dockview, none of the model's elements, no history and no file: it draws what its view's store gives.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent, MutableRefObject, RefObject } from 'react';
import { Background, BackgroundVariant, ControlButton, Controls, ReactFlow, SelectionMode, useReactFlow, useStoreApi } from '@xyflow/react';
import type { EdgeTypes, NodeTypes } from '@xyflow/react';
import { hasMinimap, LARGE_VIEW, LOOK, MAX_ZOOM, MIN_ZOOM, selectionOf, toolsOf } from '../core';
import type { Hit, PlaneEdge, PlaneNode, Session, Shape } from '../core';
import { LineEdge } from './edges/LineEdge';
import { PlaneMiniMap } from './MiniMap';
import { BoxNode } from './nodes/BoxNode';
import { PortNode } from './nodes/PortNode';
import { SmallNode } from './nodes/SmallNode';
import { NotDrawnYet } from './NotDrawnYet';
import { Palette } from './Palette';
import type { PaletteAt } from './Palette';
import './marquee.css';
import { CLICK_DISTANCE, viewStoreOf } from './viewStore';
import type { ViewStore } from './viewStore';

export interface PlaneProps {
  /** The session the tab was made for (ViewParams in shell/Dock.tsx says why not the dock's). */
  session: Session;
  viewId: string;
}

/**
 * The contract.
 *
 * - **The root** fills the tab's body and carries `data-testid="plane"` and `data-view` (the view's id), for a drawn
 *   view and for a card alike, and the class `grasp-plane`. It sets the adapter's measures as CSS variables for
 *   app.css (LOOK's header, head, lead, tail, pad, port and rowType, as `--grasp-node-*`), so that each number is written once.
 * - **A kind no plane draws** (`store.drawn` false, watched through `store.watch`, so a tab follows its view's kind
 *   and a view that leaves the model): NotDrawnYet with `store.notDrawn`. React Flow is not mounted.
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
 * - **React Flow's props**, every object and function among them the same at each render: `nodeTypes` (all 13 SHAPES:
 *   a type that is missing falls back to React Flow's `default`, silently), `edgeTypes` ({ line }), `onNodesChange`,
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
 */
export function Plane({ session, viewId }: PlaneProps): JSX.Element {
  const store = viewStoreOf(session, viewId);
  const root = useRef<HTMLDivElement>(null);
  // Whether the root has a size: React Flow is mounted only then. The size itself is read where it is used.
  const [sized, setSized] = useState(false);
  // Whether a plane draws the view, which can change under a tab: its kind changed, or it left the model.
  const drawn = useSyncExternalStore(store.watch, () => store.drawn);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !drawn) { setSized(false); return undefined; }
    const has = (width: number, height: number): boolean => width > 0 && height > 0;
    setSized(has(el.clientWidth, el.clientHeight));
    const observer = new ResizeObserver((entries) => {
      const box = entries[entries.length - 1].contentRect;
      const next = has(box.width, box.height);
      setSized((was) => (was === next ? was : next));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [drawn]);

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
      style={LOOK_VARIABLES}
      onContextMenu={noBrowserMenu}
    >
      {first && (
        <style>{`[data-testid="plane"][data-view="${viewId}"] .react-flow__node[data-id="${first}"] { outline: 2px dashed var(--grasp-teal); outline-offset: 3px; }`}</style>
      )}
      {!drawn ? <NotDrawnYet text={store.notDrawn} /> : sized ? <Flow store={store} root={root} openPalette={openPalette} /> : null}
      <Palette session={session} at={palette} onClose={closePalette} />
    </div>
  );
}

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

const NODE_TYPES = {
  rect: BoxNode, rounded: BoxNode, item: BoxNode, action: BoxNode, state: BoxNode,
  port: PortNode, param: PortNode,
  bar: SmallNode, diamond: SmallNode, dot: SmallNode, bullseye: SmallNode, entry: SmallNode, event: SmallNode,
} satisfies Record<Shape, unknown> as unknown as NodeTypes;
const EDGE_TYPES = { line: LineEdge } as unknown as EdgeTypes;
const PRO_OPTIONS = { hideAttribution: true };
// What a press may focus, nearest first, as the browser's own press would; and what takes typing, whose press is left as it is.
const FOCUSABLE = '[tabindex], a[href], button, input, select, textarea, [contenteditable="true"]';
const TYPED_INTO = 'input, select, textarea, [contenteditable="true"]';
// So that React Flow's own idea of "adding" is Hit.add on every machine (its default is Meta on a Mac, Control elsewhere).
const MULTI_SELECTION_KEYS = ['Control', 'Meta'];

type ToFlow = (point: { x: number; y: number }) => { x: number; y: number };
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
function Flow({ store, root, openPalette }: FlowProps & { openPalette: OpenPalette }): JSX.Element {
  // Before the first snapshot: the camera decides far or near, and a view that is first seen is fitted to this window.
  const [camera] = useState(() => store.camera(root.current?.clientWidth ?? 0, root.current?.clientHeight ?? 0));
  // Whether the root is large enough for the minimap: set again only when a new size crosses the line.
  const [minimap, setMinimap] = useState(() => hasMinimap(root.current?.clientWidth ?? 0, root.current?.clientHeight ?? 0));
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  // What the click callbacks reach: React Flow's screenToFlowPosition (put there by Picking), and whether a marquee was
  // drawn since the last press, which makes the click that ends it no click.
  const toFlow = useRef<ToFlow | null>(null);
  const marqueed = useRef(false);
  const clicked = useCallback((event: ReactMouseEvent, type: Hit['type'], id: string | null): void => {
    if (marqueed.current) return;
    const at = toFlow.current ? toFlow.current({ x: event.clientX, y: event.clientY }) : { x: 0, y: 0 };
    const hit: Hit = { view: store.viewId, type, id, at, add: event.ctrlKey || event.metaKey };
    if (!toolsOf(store.session).click(hit)) selectionOf(store.session).click(hit);
  }, [store]);
  const rightClicked = useCallback((event: ReactMouseEvent, type: Hit['type'], id: string | null): void => {
    event.preventDefault();
    const at = toFlow.current ? toFlow.current({ x: event.clientX, y: event.clientY }) : { x: 0, y: 0 };
    openPalette({ hit: { view: store.viewId, type, id, at, add: false }, left: event.clientX, top: event.clientY });
  }, [store, openPalette]);
  const onNodeContextMenu = useCallback((event: ReactMouseEvent, node: PlaneNode) => rightClicked(event, 'el', node.id), [rightClicked]);
  const onEdgeContextMenu = useCallback((event: ReactMouseEvent, edge: PlaneEdge) => rightClicked(event, 'rel', edge.id), [rightClicked]);
  const onPaneContextMenu = useCallback((event: ReactMouseEvent | MouseEvent) => rightClicked(event as ReactMouseEvent, 'ground', null), [rightClicked]);
  const onNodeClick = useCallback((event: ReactMouseEvent, node: PlaneNode) => clicked(event, 'el', node.id), [clicked]);
  const onEdgeClick = useCallback((event: ReactMouseEvent, edge: PlaneEdge) => clicked(event, 'rel', edge.id), [clicked]);
  const onPaneClick = useCallback((event: ReactMouseEvent) => clicked(event, 'ground', null), [clicked]);
  return (
    <ReactFlow<PlaneNode, PlaneEdge>
      nodes={snapshot.nodes}
      edges={snapshot.edges}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      onNodesChange={store.nodesChanged}
      onEdgesChange={store.edgesChanged}
      onViewportChange={store.moved}
      defaultViewport={camera}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      onlyRenderVisibleElements={snapshot.nodes.length > LARGE_VIEW}
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
    >
      {!snapshot.far && <Background variant={BackgroundVariant.Dots} />}
      <Controls position="bottom-left" showInteractive={false} showFitView={false}>
        <FitButton store={store} root={root} />
      </Controls>
      {minimap && <PlaneMiniMap store={store} />}
      <Follow store={store} root={root} setMinimap={setMinimap} />
      <Picking store={store} root={root} toFlow={toFlow} marqueed={marqueed} />
    </ReactFlow>
  );
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
 * Draws nothing. It reaches what only React Flow's inside holds: screenToFlowPosition for the click callbacks, and the
 * marquee's rectangle, which goes to the store at each move (step 9, "Picking on a plane"). It also sets React Flow's
 * `nodesSelectionActive` back to false whenever it is true, so the rectangle that would lie over the picked boxes is
 * never drawn, and raises the flag that drops the click ending a marquee, which the next press on the root clears.
 */
function Picking({ store, root, toFlow, marqueed }: FlowProps & { toFlow: MutableRefObject<ToFlow | null>; marqueed: MutableRefObject<boolean> }): null {
  const { screenToFlowPosition } = useReactFlow();
  const flow = useStoreApi();
  useEffect(() => {
    toFlow.current = screenToFlowPosition;
    return () => { toFlow.current = null; };
  }, [toFlow, screenToFlowPosition]);
  useEffect(() => {
    const el = root.current;
    const clear = (): void => { marqueed.current = false; };
    el?.addEventListener('pointerdown', clear, true);
    const stop = flow.subscribe((state, before) => {
      if (state.nodesSelectionActive) flow.setState({ nodesSelectionActive: false });
      if (!state.userSelectionActive) return;
      marqueed.current = true;
      const rect = state.userSelectionRect;
      if (!rect || (state.userSelectionActive === before.userSelectionActive && rect === before.userSelectionRect)) return;
      const [tx, ty, zoom] = state.transform;
      store.marquee({ x: (rect.x - tx) / zoom, y: (rect.y - ty) / zoom, width: rect.width / zoom, height: rect.height / zoom });
    });
    return () => {
      stop();
      el?.removeEventListener('pointerdown', clear, true);
    };
  }, [store, root, flow, marqueed]);
  return null;
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
