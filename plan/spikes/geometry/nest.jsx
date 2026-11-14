// Slice 3's host, tried cheaply: one React Flow plane with two frames, each holding the room's geometry view.
//   frame "fa": candidate A's nodes as children of the frame node (project() with a frame);
//   frame "fb": candidate B drawn inside the frame node (ComponentBody with `fixed`).
// The plane's zoom and pan are both frames' camera. A frame is dragged by its title (React Flow's dragHandle).
// ?frame=any makes frame fb draggable from anywhere in it, and ?frame=fixed not draggable at all (a drag on its ground
// then pans the plane): the two cases in which a press inside the component body could be taken by the plane.

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { Background, BackgroundVariant, ReactFlow, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { NODE_TYPES, hitOf, sideOf } from './a.jsx';
import { ComponentBody } from './b.jsx';
import { ROOM_MARKS, roomModel } from './data.js';
import { frameEnd } from './harness.jsx';
import * as layout from './layout.js';
import { makeStore } from './store.js';

const MODE = new URLSearchParams(location.search).get('frame') || 'handle';
const HOW = { handle: { dragHandle: '.frame-title' }, any: {}, fixed: { draggable: false } };
const TITLE = 24;
const ROOM = 16;
const M = window.SysMLModel;
const storeA = makeStore(M, roomModel(M, window.GEO_FIXTURE), 'v-plan', ROOM_MARKS);
const storeB = makeStore(M, roomModel(M, window.GEO_FIXTURE), 'v-plan', ROOM_MARKS);
const bounds = storeA.layout.bounds;
const size = { width: bounds.w + 2 * ROOM, height: bounds.h + TITLE + 2 * ROOM };
/** Where the view's origin lies from its frame's corner. */
const origin = { x: ROOM - bounds.x, y: TITLE + ROOM - bounds.y };
const frameA = { id: 'fa', dx: origin.x, dy: origin.y };
const sideA = sideOf(storeA, frameA);

function FrameNode({ data }) {
  return (
    <div className="frame">
      <div className="frame-title">{data.title}</div>
      {data.store && <div className="frame-body"><ComponentBody store={data.store} fixed at={data.at} /></div>}
    </div>
  );
}
const TYPES = { ...NODE_TYPES, frame: FrameNode };
const DATA = {
  fa: { title: 'fa: a graph body, its nodes the frame\'s children' },
  fb: { title: 'fb: a component body inside the frame\'s node', store: storeB, at: { x: origin.x, y: origin.y - TITLE } },
};

// The plane's own store: where the frames stand, and the nodes of everything on it.
const plane = (() => {
  const places = { fa: { x: 0, y: 0 }, fb: { x: 0, y: size.height + 40 } };
  const frames = {};
  const listeners = new Set();
  let nodes = null;
  const frame = (id) => {
    const was = frames[id];
    if (was && was.position === places[id]) return was;
    frames[id] = { id, type: 'frame', position: places[id], ...size, measured: size, zIndex: 0, ...(id === 'fb' ? HOW[MODE] : HOW.handle), selectable: false, data: DATA[id] };
    return frames[id];
  };
  let inner = null;
  const build = () => {
    const a = sideA.getNodes();
    if (nodes && inner === a && nodes[0] === frame('fa') && nodes[nodes.length - 1] === frame('fb')) return nodes;
    inner = a;
    nodes = [frame('fa'), ...a, frame('fb')];
    return nodes;
  };
  const tell = () => { for (const l of [...listeners]) l(); };
  sideA.subscribe(tell);
  return {
    places,
    viewport: { x: 20, y: 10, zoom: 1 },
    frameClicks: [],
    paneClicks: 0,
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getNodes: build,
    nodesChanged(changes) {
      let moved = false;
      for (const c of changes) {
        if (c.type === 'position' && c.position && places[c.id]) { places[c.id] = c.position; moved = true; }
      }
      const own = changes.filter((c) => typeof c.id === 'string' && c.id.startsWith('fa/'));
      if (own.length > 0) sideA.nodesChanged(own);
      if (moved) tell();
    },
  };
})();

function Plane() {
  const nodes = useSyncExternalStore(plane.subscribe, plane.getNodes);
  const toFlow = useRef(null);
  const onNodeClick = useCallback((event, node) => {
    if (node.type === 'frame') { plane.frameClicks.push(node.id); return; }
    const p = toFlow.current({ x: event.clientX, y: event.clientY });
    const at = { x: p.x - plane.places.fa.x - origin.x, y: p.y - plane.places.fa.y - origin.y };
    storeA.click(hitOf(event, node, at, (id) => id.slice(3)));
  }, []);
  const onPaneClick = useCallback(() => { plane.paneClicks += 1; }, []);
  const moved = useCallback((viewport) => { plane.viewport = viewport; storeA.moved(viewport); }, []);
  return (
    <ReactFlow
      nodes={nodes}
      edges={[]}
      nodeTypes={TYPES}
      onNodesChange={plane.nodesChanged}
      onViewportChange={moved}
      defaultViewport={plane.viewport}
      minZoom={0.02}
      maxZoom={4}
      panOnScroll
      panOnScrollSpeed={1}
      zoomOnScroll={false}
      zoomOnPinch
      zoomOnDoubleClick={false}
      paneClickDistance={layout.CLICK_DISTANCE}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      deleteKeyCode={null}
      selectNodesOnDrag={false}
      nodeClickDistance={layout.CLICK_DISTANCE}
      nodeDragThreshold={0}
      autoPanOnNodeDrag={false}
      nodesConnectable={false}
      nodesFocusable={false}
      disableKeyboardA11y
      elevateNodesOnSelect={false}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} />
      <Reach toFlow={toFlow} />
    </ReactFlow>
  );
}

function Reach({ toFlow }) {
  const { screenToFlowPosition, setViewport } = useReactFlow();
  useEffect(() => {
    toFlow.current = screenToFlowPosition;
    window.spike.setViewport = setViewport;
  }, [toFlow, screenToFlowPosition, setViewport]);
  return null;
}

window.spike = { name: 'nest', layout, M, storeA, storeB, plane, origin, size, TITLE, frameEnd };
document.title = 'Frames on a plane';
createRoot(document.getElementById('host')).render(<div className="geo-host graph-body"><Plane /></div>);
