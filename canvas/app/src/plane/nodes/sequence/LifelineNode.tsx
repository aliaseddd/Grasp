// A lifeline of a sequence view: its head, and the dashed line under it. THE SCAFFOLD'S SKELETON: package 2-10 owns
// this file and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-10, "Decided"; section 2, "The sequence view and the geometry
// view: a graph body each"): the two node components a lifeline is drawn by, which plane/nodes/sequence/index.ts
// names in `nodeTypes` as `lifeline` and `lifeline-line`.
// - **The head** has the element's id as its node id, takes clicks and drags, and carries the marks and the anchor
//   (`data-label`). It moves sideways only: the reader holds it to its row (core/readers/sequence.ts, `step`).
// - **The line** is the node `<id>:line`, as tall as the view, `zIndex: -1`, `selectable: false` and
//   `draggable: false`; its `data.element` is the lifeline's id too. It takes the pointer along a strip 16 px wide
//   down the dashed line, and nowhere else, so that a click, a drop of a line or of a pin, and a tool's click on the
//   dashed line count for the lifeline, and a drag there pans the plane. An event is a child node of it, drawn by
//   slice 1's shape `event` (plane/nodes/SmallNode.tsx).
//
// What the scaffold fixes for a node component of another renderer is said in plane/nodes/sequence/index.ts and, in
// full, in plane/Plane.tsx: who it is (`data-of`), its marks (`.grasp-marks`, with `<Pins />` and `<Badge />`), its
// anchors (`data-label`), its grips (`{NodeGrips({ far, side? })}`), its own selected look and its own look while a
// gesture is over it (`data-over`). A node component never reads the body's context (views/bodyContext.ts).
//
// Nothing imports this file until index.ts names its components: the registry (views/bodies.ts) reads index.ts and
// nothing else of this folder. Its stylesheet is plane/nodes/sequence/sequence.css, beside it.

import type { NodeProps } from '@xyflow/react';

/** A lifeline's node. It renders nothing until package 2-10 builds it. */
export function LifelineNode(_props: NodeProps): JSX.Element | null {
  return null;
}
