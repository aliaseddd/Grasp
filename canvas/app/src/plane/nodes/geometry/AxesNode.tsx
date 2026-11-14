// The coordinate frame of a geometry view: its two axes and its scale bar. THE SCAFFOLD'S SKELETON: package 2-11
// owns this file and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-11, "Decided"): the node component
// plane/nodes/geometry/index.ts names in `nodeTypes` as `axes`.
// - **One node** at the view's origin: the x and y axes, 96 long, with their names, and under the x axis a scale bar
//   of the shortest of 1, 2, 5 × 10ⁿ units that is at least 40 px long, reading as "1 m". It is drawn over the
//   footprints. An empty view shows it alone.
// - **It stands for no element**: its `data.element` is null, with `selectable: false` and `draggable: false`, and
//   it takes no pointer. So it carries no `data-of`, a click where it lies is a click on what is under it, and the
//   view's store never marks or selects it (plan/slice-2.md, section 4, seam 3, "A node that is no element").
//
// Nothing imports this file until index.ts names its component. Its stylesheet is
// plane/nodes/geometry/geometry.css, beside it.

import type { NodeProps } from '@xyflow/react';

/** The axes' node. It renders nothing until package 2-11 builds it. */
export function AxesNode(_props: NodeProps): JSX.Element | null {
  return null;
}
