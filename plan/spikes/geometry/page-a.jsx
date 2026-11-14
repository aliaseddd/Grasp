// The page of candidate A, the graph body. ?snap=10 gives the plane a snap grid; ?css=1 draws a rectangle's outline by
// CSS; ?bar=zoom redraws the scale bar for the zoom; ?pick=data keeps the picks out of React Flow's own `selected`.
import { GraphBody } from './a.jsx';
import { start } from './harness.jsx';

const asked = new URLSearchParams(location.search);
window.SPIKE_CSS_OUTLINE = asked.get('css') === '1';
window.SPIKE_BAR_REDRAWN = asked.get('bar') === 'zoom';
window.SPIKE_PICK_IN_DATA = asked.get('pick') === 'data';
const snap = +asked.get('snap') || 0;
start('A: graph body', (props) => <GraphBody snap={snap} {...props} />);
