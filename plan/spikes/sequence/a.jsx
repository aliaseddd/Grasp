// Candidate A's page: the graph body alone in its host.
//
//   ?frame=1    every node is a child of one frame node (slice 3)
//   ?shape=tall | heads   a lifeline as one node, not two (a-body.jsx says what each is)
//   ?cull=1|0   mount only what the window shows, or everything; left out, the page's rule (more than 300 nodes)
//   ?minimap=1  React Flow's minimap
//   ?rows=nodes a message is a node, not an edge
//   ?connect=1  real connection handles, and React Flow's connecting by a drag from one (?connect=inert: with the page's inert handle kept)
//   ?flat=1     the edges keep React Flow's own depth, under every node

import { createRoot } from 'react-dom/client';
import './common.css';
import { drawn, makeFlowStore, SequenceFlow } from './a-body.jsx';
import { Markers } from './markers.jsx';
import { start } from './harness.js';

const asked = new URLSearchParams(location.search);
const cull = asked.has('cull') ? asked.get('cull') === '1' : null;

start('A: a graph body (React Flow)', (store, host, query) => {
  const flow = makeFlowStore(store, {
    frame: query.has('frame'), shape: query.get('shape') || 'split', minimap: query.has('minimap'), cull,
    rowNodes: query.get('rows') === 'nodes', connect: query.get('connect'), flat: query.has('flat'),
  });
  window.Spike.flow = flow;
  window.Spike.origin = () => flow.origin();
  const root = createRoot(host);
  root.render(<><Markers /><SequenceFlow store={flow} /></>);
  return () => root.unmount();
// With only what the window shows mounted, the view is drawn once some of it is.
}, (store, host) => (window.Spike.flow && window.Spike.flow.culled() ? host.querySelectorAll('.react-flow__node').length > 0 : drawn(store, host)));
