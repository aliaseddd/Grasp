// The edge of every relationship a plane draws (plan/slice-1.md, step 6, rule 4, and section 4). It works out its own
// two ends from the rectangles of its two nodes, as the old page's straight and elbow do: the adapter's route().

import { memo } from 'react';
import { useInternalNode } from '@xyflow/react';
import type { EdgeProps, InternalNode } from '@xyflow/react';
import { route } from '../../core';
import type { EdgeData, End, PlaneEdge } from '../../core';

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
export function LineEdge({ source, target, data }: LineEdgeProps): JSX.Element {
  const a = useInternalNode(source);
  const b = useInternalNode(target);
  return <Line data={data} a={a} b={b} />;
}

interface LineViewProps {
  data: EdgeData;
  a: InternalNode | undefined;
  b: InternalNode | undefined;
}

// Memoized below the component React Flow calls: it draws again when its data or one of its two nodes changes.
const Line = memo(function Line({ data, a, b }: LineViewProps): JSX.Element {
  if (!a || !b) return <></>;
  const { points, mid } = route(data.route, end(a, data.sourceBorder), end(b, data.targetBorder));
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${round(p.x)},${round(p.y)}`).join(' ');
  return (
    <>
      <path className="grasp-line" d={d} markerEnd={data.marker ? `url(#${data.marker})` : undefined} />
      <path className="grasp-line-hit" d={d} />
      {data.label !== '' && (
        <text className="grasp-line-label" x={round(mid.x)} y={round(mid.y + data.labelOffset)} textAnchor="middle">{data.label}</text>
      )}
    </>
  );
}, (x, y) => x.data === y.data && x.a === y.a && x.b === y.b);

const round = (n: number): number => Math.round(n * 100) / 100;

/** A node's rectangle from the view's origin, as the adapter's route() takes it: React Flow's absolute position and size. */
function end(node: InternalNode, border: boolean): End {
  const { x, y } = node.internals.positionAbsolute;
  return { x, y, w: node.measured.width ?? node.width ?? 0, h: node.measured.height ?? node.height ?? 0, border };
}
