// The coordinate frame at the view's origin, as the old page's drawGeometryAxes draws it: the x and y axes with their
// names, and under the x axis the scale bar with its words ("1 m"). SVG; both candidates draw it (candidate A inside a
// node's own <svg>, candidate B inside its one <svg>).

import { AXIS } from './layout.js';

/** The arrow's marker. `id` must be one of a kind in the document. */
export function AxisMarker({ id }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto">
      <path className="geo-arrow" d="M1,1 L9,5 L1,9 Z" />
    </marker>
  );
}

/** The axes from the origin ox, oy, and the bar ({ len, words }) 20 below it. */
export function Axes({ ox, oy, bar, marker }) {
  const by = oy + 20;
  return (
    <g className="geo-axes">
      <path className="geo-axis geo-x" d={`M${ox},${oy} H${ox + AXIS}`} markerEnd={`url(#${marker})`} />
      <path className="geo-axis geo-y" d={`M${ox},${oy} V${oy - AXIS}`} markerEnd={`url(#${marker})`} />
      <circle className="geo-origin" cx={ox} cy={oy} r="2.5" />
      <text className="geo-label" x={ox + AXIS + 8} y={oy + 4}>x</text>
      <text className="geo-label" x={ox - 7} y={oy - AXIS - 2} textAnchor="end">y</text>
      <path className="geo-axis geo-bar" d={`M${ox},${by - 4} V${by + 4} M${ox},${by} H${ox + bar.len} M${ox + bar.len},${by - 4} V${by + 4}`} />
      <text className="geo-scale" x={ox + bar.len + 6} y={by + 4}>{bar.words}</text>
    </g>
  );
}
