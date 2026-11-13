// A view's tab body (plan/slice-1.md, step 6; plan/notes.md, session 17, "The architecture", and session 20, "Step 6:
// the outline, part 2"). For a kind no plane draws it shows the card. Otherwise it is the gate that mounts React Flow
// only while the tab has a size, and React Flow's props and gestures, the ground, the zoom buttons and the minimap.
// It knows no Dockview, none of the model's elements, no history and no file: it draws what its view's store gives.

import { useCallback, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { CSSProperties, RefObject } from 'react';
import { Background, BackgroundVariant, ControlButton, Controls, MiniMap, ReactFlow, useReactFlow } from '@xyflow/react';
import type { EdgeTypes, NodeTypes } from '@xyflow/react';
import { LOOK, MAX_ZOOM, MIN_ZOOM } from '../core';
import type { PlaneEdge, PlaneNode, Session, Shape } from '../core';
import { LineEdge } from './edges/LineEdge';
import { BoxNode } from './nodes/BoxNode';
import { PortNode } from './nodes/PortNode';
import { SmallNode } from './nodes/SmallNode';
import { NotDrawnYet } from './NotDrawnYet';
import { viewStoreOf } from './viewStore';
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
 *   app.css (LOOK's header, head, lead, pad and port, as `--grasp-node-*`), so that each number is written once.
 * - **A kind no plane draws** (`store.drawn` false): NotDrawnYet with `store.notDrawn`. React Flow is not mounted.
 * - **The gate.** A ResizeObserver on the root. While the root has a width and a height, the inner component is
 *   mounted; at 0 by 0 (Dockview has taken the tab's body out of the document) it is not. The inner component reads
 *   `store.camera(width, height)` once, as it mounts and before its first snapshot, and gives it to React Flow as
 *   `defaultViewport`; so a view is fitted when it first has a size, and a tab shown again finds its camera. A later
 *   change of size fits nothing.
 * - **The snapshot**: `useSyncExternalStore(store.subscribe, store.getSnapshot)`; its `nodes` and `edges` go to React
 *   Flow as they are.
 * - **React Flow's props**, every object and function among them the same at each render: `nodeTypes` (all 13 SHAPES:
 *   a type that is missing falls back to React Flow's `default`, silently), `edgeTypes` ({ line }), `onNodesChange`,
 *   `onEdgesChange` and `onViewportChange` (the store's nodesChanged, edgesChanged, moved), `defaultViewport`,
 *   `minZoom` and `maxZoom` (the adapter's MIN_ZOOM, MAX_ZOOM), `onlyRenderVisibleElements`, `panOnScroll` with
 *   `panOnScrollSpeed={1}`, `zoomOnScroll={false}`, `zoomOnPinch`, `zoomOnDoubleClick={false}`,
 *   `nodesDraggable={false}` (until step 7), `nodesConnectable={false}`, `nodesFocusable={false}`,
 *   `edgesFocusable={false}`, `disableKeyboardA11y`, `proOptions` hiding the attribution. No `fitView`, `viewport`,
 *   `width` or `height` prop, no `extent` and no `expandParent` on a node.
 * - **Around the nodes**: the ground's dots (`Background`), left out when far; `Controls` at the bottom left without
 *   the lock (`showInteractive={false}`) and without React Flow's own fit (`showFitView={false}`), which would fit a
 *   frame later by its own rule: a `ControlButton` named "Fit the view" calls `store.fit(width, height)` with the
 *   root's size now and sets that viewport; `MiniMap` at the bottom right, 200 by 150.
 * - Nothing of Grasp's renders on a viewport change: `moved` is the store's, and the component reads no viewport.
 */
export function Plane({ session, viewId }: PlaneProps): JSX.Element {
  const store = viewStoreOf(session, viewId);
  const root = useRef<HTMLDivElement>(null);
  // Whether the root has a size: React Flow is mounted only then. The size itself is read where it is used.
  const [sized, setSized] = useState(false);
  const drawn = store.drawn;

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
} as CSSProperties;

const NODE_TYPES = {
  rect: BoxNode, rounded: BoxNode, item: BoxNode, action: BoxNode, state: BoxNode,
  port: PortNode, param: PortNode,
  bar: SmallNode, diamond: SmallNode, dot: SmallNode, bullseye: SmallNode, entry: SmallNode, event: SmallNode,
} satisfies Record<Shape, unknown> as unknown as NodeTypes;
const EDGE_TYPES = { line: LineEdge } as unknown as EdgeTypes;
const PRO_OPTIONS = { hideAttribution: true };
const MINIMAP_STYLE = { width: 200, height: 150 };

interface FlowProps {
  store: ViewStore;
  root: RefObject<HTMLDivElement>;
}

/** React Flow, mounted while the tab's body has a size. */
function Flow({ store, root }: FlowProps): JSX.Element {
  // Before the first snapshot: the camera decides far or near, and a view that is first seen is fitted to this window.
  const [camera] = useState(() => store.camera(root.current?.clientWidth ?? 0, root.current?.clientHeight ?? 0));
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
      onlyRenderVisibleElements
      panOnScroll
      panOnScrollSpeed={1}
      zoomOnScroll={false}
      zoomOnPinch
      zoomOnDoubleClick={false}
      nodesDraggable={false}
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
      <MiniMap style={MINIMAP_STYLE} />
    </ReactFlow>
  );
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
