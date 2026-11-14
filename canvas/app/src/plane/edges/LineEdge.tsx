// The edge of every relationship a plane draws (plan/slice-1.md, step 6, rule 4, and section 4). It works out its own
// two ends from the rectangles of its two nodes, as the old page's straight and elbow do: the adapter's route().

import { memo } from 'react';
import { EdgeLabelRenderer, useInternalNode } from '@xyflow/react';
import type { EdgeProps, InternalNode } from '@xyflow/react';
import { NO_MARKS, route } from '../../core';
import type { EdgeData, End, PlaneEdge } from '../../core';
import { Badge } from '../marks/Badge';
import { Pins } from '../marks/Pin';
import { EndGrips } from '../nodes/Grips';

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
 *
 * Slice 2 (plan/slice-2.md, section 4, seams 4 to 7). What is said here holds for every edge component, of any
 * renderer:
 * - **Who it is.** One element inside the edge's own React Flow element carries `data-of="rel:<data.relationship>"`,
 *   far and near: here the path that takes the pointer. It is how a test, the label editor and the body's outline
 *   find the line of a relationship. Nothing reads the edge's id as a relationship's.
 * - **The anchor** (seam 7): the label, when there is one, carries `data-label="rel:<id>"`.
 * - **The grips** (seam 6): a selected, near line renders `{EndGrips({ points })}` last, so one grip lies at
 *   each drawn end, over the line.
 * - **The marks** (seam 4): near, and only for a line whose `data.marks` is not NO_MARKS, one element `.grasp-marks`
 *   with the classes `nodrag nopan`, at the line's middle (`left` and `top`, in the view's units), rendered through
 *   React Flow's EdgeLabelRenderer and holding `<Pins marks of="rel:<id>" />` and then `<Badge marks of />`.
 *   plane/marks/marks.css centres it there at its size on the screen. An unmarked line renders none, and so holds no
 *   subscription to React Flow's store for it.
 */
export function LineEdge({ source, target, data, selected }: LineEdgeProps): JSX.Element {
  const a = useInternalNode(source);
  const b = useInternalNode(target);
  return <Line data={data} a={a} b={b} selected={!!selected} />;
}

interface LineViewProps {
  data: EdgeData;
  a: InternalNode | undefined;
  b: InternalNode | undefined;
  selected: boolean;
}

// Memoized below the component React Flow calls: it draws again when its data or one of its two nodes changes.
const Line = memo(function Line({ data, a, b, selected }: LineViewProps): JSX.Element {
  if (!a || !b) return <></>;
  const { points, mid } = route(data.route, end(a, data.sourceBorder), end(b, data.targetBorder));
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${round(p.x)},${round(p.y)}`).join(' ');
  const of = `rel:${data.relationship}`;
  return (
    <>
      <path className="grasp-line" d={d} markerEnd={data.marker ? `url(#${data.marker})` : undefined} />
      <path className="grasp-line-hit" d={d} data-of={of} />
      {data.label !== '' && (
        <text className="grasp-line-label" data-label={of} x={round(mid.x)} y={round(mid.y + data.labelOffset)} textAnchor="middle">{data.label}</text>
      )}
      {selected && !data.far && EndGrips({ points })}
      {!data.far && data.marks !== NO_MARKS && (
        <EdgeLabelRenderer>
          <div className="grasp-marks nodrag nopan" style={{ left: round(mid.x), top: round(mid.y) }}>
            <Pins marks={data.marks} of={of} />
            <Badge marks={data.marks} of={of} />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}, (x, y) => x.data === y.data && x.a === y.a && x.b === y.b && x.selected === y.selected);

const round = (n: number): number => Math.round(n * 100) / 100;

/** A node's rectangle from the view's origin, as the adapter's route() takes it: React Flow's absolute position and size. */
function end(node: InternalNode, border: boolean): End {
  const { x, y } = node.internals.positionAbsolute;
  return { x, y, w: node.measured.width ?? node.width ?? 0, h: node.measured.height ?? node.height ?? 0, border };
}
