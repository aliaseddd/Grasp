import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ReactFlow, Background, MiniMap, Controls, NodeResizer, Handle, Position, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DockviewReact, themeLight } from 'dockview-react';
import 'dockview-react/dist/styles/dockview.css';
import ELK from 'elkjs/lib/elk.bundled.js';

function PartNode({ data, selected }) {
  return (
    <div style={{ border: '1px solid #333', background: '#fff', width: '100%', height: '100%', boxSizing: 'border-box', padding: 4, fontFamily: 'sans-serif', fontSize: 12 }}>
      <NodeResizer isVisible={selected} minWidth={100} minHeight={40} />
      <div style={{ textAlign: 'center', fontSize: 10, color: '#666' }}>«part»</div>
      <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{data.label}</div>
      <div style={{ borderTop: '1px solid #333', marginTop: 4, paddingTop: 2, fontSize: 10, color: '#444' }}>attributes<br />mass : Real</div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
const nodeTypes = { part: PartNode };

function Flow() {
  const [nodes, setNodes] = useState([
    { id: 'a', type: 'part', position: { x: 0, y: 0 }, style: { width: 170, height: 80 }, data: { label: 'hosts : Host[1..*]' } },
    { id: 'b', type: 'part', position: { x: 0, y: 0 }, style: { width: 170, height: 80 }, data: { label: 'app : App' } },
    { id: 'c', type: 'part', position: { x: 0, y: 0 }, style: { width: 170, height: 80 }, data: { label: 'page : Page' } },
  ]);
  const [edges, setEdges] = useState([
    { id: 'e1', source: 'a', target: 'b', type: 'smoothstep', label: 'mount' },
    { id: 'e2', source: 'c', target: 'a', type: 'smoothstep' },
  ]);
  const onNodesChange = useCallback(ch => setNodes(n => applyNodeChanges(ch, n)), []);
  const onEdgesChange = useCallback(ch => setEdges(e => applyEdgeChanges(ch, e)), []);
  const onConnect = useCallback(c => setEdges(e => addEdge(c, e)), []);
  useEffect(() => {
    (async () => {
      const elk = new ELK();
      const g = {
        id: 'root', layoutOptions: { 'elk.algorithm': 'layered', 'elk.direction': 'RIGHT', 'elk.spacing.nodeNode': '40', 'elk.layered.spacing.nodeNodeBetweenLayers': '60' },
        children: nodes.map(n => ({ id: n.id, width: 170, height: 80 })),
        edges: edges.map(e => ({ id: e.id, sources: [e.source], targets: [e.target] })),
      };
      const out = await elk.layout(g);
      setNodes(ns => ns.map(n => { const c = out.children.find(x => x.id === n.id); return { ...n, position: { x: c.x, y: c.y } }; }));
      window.__layoutDone = true;
    })();
  }, []);
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView snapToGrid>
        <Background /><MiniMap /><Controls />
      </ReactFlow>
    </div>
  );
}

const components = {
  flow: () => <Flow />,
  text: () => <pre style={{ padding: 8, margin: 0, fontFamily: 'monospace', fontSize: 12 }}>{'package Package1 {\n  part def Host;\n  part def App;\n  part hosts : Host[1..*];\n}'}</pre>,
  tree: () => <ul style={{ fontFamily: 'sans-serif', fontSize: 12 }}><li>Package1<ul><li>part def Host</li><li>part def App</li><li>view1 : GeneralView</li></ul></li></ul>,
  details: () => <div style={{ fontFamily: 'sans-serif', fontSize: 12, padding: 8 }}><b>Part Properties</b><div>Declared name: hosts</div><div>Multiplicity: [1..*]</div></div>,
};
function App() {
  const onReady = (e) => {
    const api = e.api;
    api.addPanel({ id: 'explorer', component: 'tree', title: 'Explorer' });
    api.addPanel({ id: 'view1', component: 'flow', title: 'view1 : GeneralView', position: { referencePanel: 'explorer', direction: 'right' } });
    api.addPanel({ id: 'text1', component: 'text', title: 'Package1.sysml', position: { referencePanel: 'view1', direction: 'within' } });
    api.addPanel({ id: 'details', component: 'details', title: 'Details', position: { referencePanel: 'view1', direction: 'right' } });
    api.getPanel('view1').api.setActive();
    api.getPanel('explorer').api.setSize({ width: 220 });
    api.getPanel('details').api.setSize({ width: 260 });
    window.__dockReady = true;
  };
  return <DockviewReact components={components} onReady={onReady} theme={themeLight} />;
}
createRoot(document.getElementById('root')).render(<App />);
