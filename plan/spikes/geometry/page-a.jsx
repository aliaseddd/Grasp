// The page of candidate A, the graph body. ?snap=10 gives the plane a snap grid; ?css=1 draws a rectangle's outline by
// CSS; ?bar=zoom redraws the scale bar for the zoom; ?pick=data keeps the picks out of React Flow's own `selected`;
// ?box=foot makes a footprint's node its outline's rectangle alone, without its words; ?place=layout puts the outline in
// its node by left and top instead of a transform; ?pass=0 lets a node's own element take the pointer; ?z=none gives
// the nodes no zIndex.
import { GraphBody } from './a.jsx';
import { start } from './harness.jsx';

const asked = new URLSearchParams(location.search);
window.SPIKE_CSS_OUTLINE = asked.get('css') === '1';
window.SPIKE_BAR_REDRAWN = asked.get('bar') === 'zoom';
window.SPIKE_PICK_IN_DATA = asked.get('pick') === 'data';
window.SPIKE_BOX_FOOT = asked.get('box') === 'foot';
window.SPIKE_PLACE_BY_LAYOUT = asked.get('place') === 'layout';
window.SPIKE_NO_PASS = asked.get('pass') === '0';
window.SPIKE_NO_Z = asked.get('z') === 'none';
const snap = +asked.get('snap') || 0;
start('A: graph body', (props) => <GraphBody snap={snap} {...props} />);
