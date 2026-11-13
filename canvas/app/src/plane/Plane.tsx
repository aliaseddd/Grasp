// A view's tab body (plan/slice-1.md, step 6; plan/notes.md, session 17, "The architecture", and session 20, "Step 6:
// the outline, part 2"). For a kind no plane draws it shows the card. Otherwise it is the gate that mounts React Flow
// only while the tab has a size, and React Flow's props and gestures, the ground, the zoom buttons and the minimap.
// It knows no Dockview, none of the model's elements, no history and no file: it draws what its view's store gives.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { CSSProperties, RefObject } from 'react';
import { Background, BackgroundVariant, ControlButton, Controls, MiniMap, ReactFlow, useReactFlow } from '@xyflow/react';
import type { EdgeTypes, NodeTypes } from '@xyflow/react';
import { hasMinimap, LOOK, MAX_ZOOM, MINIMAP, MIN_ZOOM } from '../core';
import type { PlaneEdge, PlaneNode, Session, Shape } from '../core';
import { LineEdge } from './edges/LineEdge';
import { BoxNode } from './nodes/BoxNode';
import { PortNode } from './nodes/PortNode';
import { SmallNode } from './nodes/SmallNode';
import { NotDrawnYet } from './NotDrawnYet';
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
 *   CULL_OVER nodes, `panOnScroll` with `panOnScrollSpeed={1}`, `zoomOnScroll={false}`, `zoomOnPinch`,
 *   `zoomOnDoubleClick={false}`, `paneClickDistance` (a press that moves a few pixels is still a click),
 *   `selectionKeyCode={null}` (no rectangle is drawn with Shift until step 9 gives the marquee its meaning),
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
 *   root's size now and sets that viewport; `MiniMap` at the bottom right, the adapter's MINIMAP in size, only
 *   while the root is as large as the adapter's hasMinimap(width, height) asks: in a narrow plane it would cover the
 *   zoom buttons. The fit keeps the minimap's band free only where it is shown (the adapter's fitMargins).
 * - **The pointer and the keyboard.** A border item's name and a small node's name take the pointer, so a click on a
 *   name selects its node (app.css). The zoom buttons and the fit button show the theme's focus ring, teal,
 *   `--grasp-focus-width` wide, inside the button.
 * - Nothing of Grasp's renders on a viewport change: `moved` is the store's, and the component reads no viewport.
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

  return (
    <div ref={root} className="grasp-plane" data-testid="plane" data-view={viewId} style={LOOK_VARIABLES}>
      {!drawn ? <NotDrawnYet text={store.notDrawn} /> : sized ? <Flow store={store} root={root} /> : null}
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
// A view of more nodes than this mounts only what its window shows. React Flow culls a node by its own rectangle
// and a line by its two nodes', with no margin, so a name outside its node and a line's label leave with them while
// still in the window: a view of few nodes is therefore not culled at all, and a far view has no words to lose.
const CULL_OVER = 300;
// How far the pointer may move between press and release and still click is the store's CLICK_DISTANCE: React Flow's
// own click distances (the ground's and a node's) are set to it, and the store starts no gesture of a drag or a resize
// that has not gone as far (nodeDragThreshold is 0, so a drag begins at the press and the node does not trail the
// pointer; the store, not React Flow, tells a click that slipped from a drag).
const MINIMAP_STYLE = { width: MINIMAP.width, height: MINIMAP.height };

interface FlowProps {
  store: ViewStore;
  root: RefObject<HTMLDivElement>;
}

/** React Flow, mounted while the tab's body has a size. */
function Flow({ store, root }: FlowProps): JSX.Element {
  // Before the first snapshot: the camera decides far or near, and a view that is first seen is fitted to this window.
  const [camera] = useState(() => store.camera(root.current?.clientWidth ?? 0, root.current?.clientHeight ?? 0));
  // Whether the root is large enough for the minimap: set again only when a new size crosses the line.
  const [minimap, setMinimap] = useState(() => hasMinimap(root.current?.clientWidth ?? 0, root.current?.clientHeight ?? 0));
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
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
      onlyRenderVisibleElements={snapshot.nodes.length > CULL_OVER}
      panOnScroll
      panOnScrollSpeed={1}
      zoomOnScroll={false}
      zoomOnPinch
      zoomOnDoubleClick={false}
      paneClickDistance={CLICK_DISTANCE}
      selectionKeyCode={null}
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
      {minimap && <MiniMap style={MINIMAP_STYLE} />}
      <Follow store={store} root={root} setMinimap={setMinimap} />
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
