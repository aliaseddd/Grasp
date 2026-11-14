// The slice 3 case for candidate B: the component body drawn inside one node of a React Flow plane, a frame with a
// title to drag it by. The plane has the page's props. The body is b-body.jsx as it is, with `framed`.

import { createRoot } from 'react-dom/client';
import { memo, useCallback, useEffect, useState } from 'react';
import { applyNodeChanges, Background, BackgroundVariant, Controls, ReactFlow, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './common.css';
import { drawn, FRAME_PAD, SequenceBody } from './b-body.jsx';
import { Markers } from './markers.jsx';
import { start } from './harness.js';
import { CLICK_DISTANCE } from './layout.js';

const TITLE = 28;   // the frame's title, under its 1 px border
const BORDER = 1;
const HostedNode = memo(function HostedNode({ data }) {
  return (
    <div className="seq-frame">
      <div className="seq-frame-title">loginSequence</div>
      <SequenceBody store={data.store} framed />
    </div>
  );
});
const NODE_TYPES = { hosted: HostedNode };
const START = { x: 0, y: 0, zoom: 1 };

function Plane({ store, state }) {
  const [nodes, setNodes] = useState(() => [{ id: 'frame', type: 'hosted', position: state.at, dragHandle: '.seq-frame-title', selectable: false, data: { store } }]);
  const onNodesChange = useCallback((changes) => setNodes((now) => {
    const next = applyNodeChanges(changes, now);
    state.at = next[0].position;
    return next;
  }), [state]);
  return (
    <div className="seq-plane">
      <ReactFlow
        nodes={nodes} edges={[]} nodeTypes={NODE_TYPES} onNodesChange={onNodesChange}
        defaultViewport={state.camera} onViewportChange={(v) => { state.camera = v; }}
        minZoom={0.02} maxZoom={4} panOnScroll panOnScrollSpeed={1} zoomOnScroll={false} zoomOnPinch zoomOnDoubleClick={false}
        paneClickDistance={CLICK_DISTANCE} nodeClickDistance={CLICK_DISTANCE} nodeDragThreshold={0} selectNodesOnDrag={false}
        autoPanOnNodeDrag={false} nodesConnectable={false} nodesFocusable={false} deleteKeyCode={null} disableKeyboardA11y
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} />
        <Controls position="bottom-left" showInteractive={false} />
        <Reach state={state} />
      </ReactFlow>
    </div>
  );
}
function Reach({ state }) {
  const { setViewport } = useReactFlow();
  useEffect(() => { state.set = (v) => { state.camera = v; void setViewport(v); }; }, [state, setViewport]);
  return null;
}

start('C: the component body inside one node of a React Flow plane', (store, host) => {
  const state = { at: { x: 60, y: 30 }, camera: START, set: null };
  Object.assign(window.Spike, {
    plane: state,
    origin: () => ({ x: state.at.x + BORDER + FRAME_PAD, y: state.at.y + BORDER + TITLE + FRAME_PAD }),
    camera: () => state.camera,
    setCamera: (v) => state.set(v),
  });
  const root = createRoot(host);
  root.render(<><Markers /><Plane store={store} state={state} /></>);
  return () => root.unmount();
}, drawn);
