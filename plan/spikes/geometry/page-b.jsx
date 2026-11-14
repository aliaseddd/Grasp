// The page of candidate B, the component body. ?bar=zoom redraws the scale bar for the zoom.
import { ComponentBody } from './b.jsx';
import { start } from './harness.jsx';

window.SPIKE_BAR_REDRAWN = new URLSearchParams(location.search).get('bar') === 'zoom';
start('B: component body', ComponentBody);
