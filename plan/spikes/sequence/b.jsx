// Candidate B's page: the component body alone in its host.
//
//   ?spill=1    a head's name is not cut at the head's edges (with ?long=1, it spills)

import { createRoot } from 'react-dom/client';
import './common.css';
import { drawn, SequenceBody } from './b-body.jsx';
import { Markers } from './markers.jsx';
import { start } from './harness.js';

start('B: a component body (one SVG component)', (store, host, query) => {
  const root = createRoot(host);
  root.render(<><Markers /><SequenceBody store={store} spill={query.has('spill')} /></>);
  return () => root.unmount();
}, drawn);
