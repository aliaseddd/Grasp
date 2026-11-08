import React, { useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ReactFlow, Background, MiniMap, applyNodeChanges, applyEdgeChanges, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
const N = Number(new URLSearchParams(location.search).get('n') || 1000);
function PartNode({ data }) {
  return (<div style={{ border: '1px solid #333', background: '#fff', width: 150, height: 60, fontSize: 11, fontFamily: 'sans-serif', padding: 3, boxSizing: 'border-box' }}>
    <div style={{ textAlign: 'center', color: '#666', fontSize: 9 }}>«part»</div><div style={{ textAlign: 'center', fontWeight: 'bold' }}>{data.label}</div>
    <Handle type="target" position={Position.Left} /><Handle type="source" position={Position.Right} /></div>);
}
const nodeTypes = { part: PartNode };
const cols = Math.ceil(Math.sqrt(N));
const initialNodes = Array.from({ length: N }, (_, i) => ({ id: 'n' + i, type: 'part', position: { x: (i % cols) * 200, y: Math.floor(i / cols) * 100 }, data: { label: 'part' + i + ' : Def' + (i % 7) } }));
const initialEdges = Array.from({ length: N }, (_, i) => ({ id: 'e' + i, source: 'n' + i, target: 'n' + ((i * 7 + 1) % N), type: 'smoothstep' }));
function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const onNodesChange = useCallback(ch => setNodes(n => applyNodeChanges(ch, n)), []);
  const onEdgesChange = useCallback(ch => setEdges(e => applyEdgeChanges(ch, e)), []);
  return (<div style={{ width: '100%', height: '100%' }}>
    <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onlyRenderVisibleElements fitView minZoom={0.02} onInit={() => { window.__inited = performance.now(); }}>
      <Background /><MiniMap />
    </ReactFlow></div>);
}
window.__start = performance.now();
createRoot(document.getElementById('root')).render(<App />);
