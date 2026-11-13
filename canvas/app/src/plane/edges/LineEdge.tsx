// The edge of every relationship a plane draws (plan/slice-1.md, step 6, rule 4, and section 4). It works out its own
// two ends from the rectangles of its two nodes, as the old page's straight and elbow do: the adapter's route().

import type { EdgeProps } from '@xyflow/react';
import type { PlaneEdge } from '../../core';

export type LineEdgeProps = EdgeProps<PlaneEdge>;

/**
 * The contract.
 *
 * - **The ends.** It reads its two nodes' rectangles from React Flow (`useInternalNode`: the absolute position and
 *   the size), so it follows a node that moves and renders again only when one of its two nodes changes, and calls
 *   `route(data.route, a, b)` with `border` from data.sourceBorder and data.targetBorder. It reads neither the model
 *   nor the store, and not React Flow's own sourceX, sourceY.
 * - **What it draws**, all inside the edge's own svg, which carries the edge's z-index, so that a label inside a box
 *   is over that box: `path.grasp-line` through the points (1.25 px, ink; dashed 5 3 for the class `succession`),
 *   with `marker-end="url(#<data.marker>)"` when data.marker names one, set here and not through React Flow's
 *   `markerEnd`; a wider `path.grasp-line-hit` with no paint, for the pointer; and, when data.label is not empty,
 *   `text.grasp-line-label` centred on the route's `mid`, its baseline data.labelOffset below it. Neither path has
 *   the class `react-flow__edge-path`, which the library's stylesheet paints grey.
 * - A selected line is teal, and its marker with it (the markers paint with `context-stroke`).
 */
export function LineEdge(props: LineEdgeProps): JSX.Element {
  void props;
  throw new Error('plane/edges/LineEdge.tsx: LineEdge is not built yet (step 6).');
}
