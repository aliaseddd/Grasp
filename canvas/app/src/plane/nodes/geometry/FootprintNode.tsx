// A footprint of a geometry view: a spatial element's shape, to scale, with its words. THE SCAFFOLD'S SKELETON:
// package 2-11 owns this file and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-11, "Decided"; section 2, "The sequence view and the geometry
// view: a graph body each"): the node component plane/nodes/geometry/index.ts names in `nodeTypes` as `footprint`.
// - **The node takes no pointer itself** (`style: { pointerEvents: 'none' }`, which the reader gives it); its
//   outline, its words and its marks take the pointer. So a circle is hit inside the circle only, and a click in the
//   corner of its square falls to what lies under it.
// - **The outline is SVG inside the node**, put in its place by a `transform`, never a box sized by CSS.
// - **The node's rectangle covers everything the footprint draws**: its words under it and its marks over it. The
//   reader's `listed`, and so the marquee, use the outline's rectangle.
// - **Its words** are two lines: «part» and its name line; its shape with its dimensions and unit ("Box 2 × 1 ×
//   0.75 m"). They are inside a footprint of at least 120 by 44, and under a smaller one. A part with no shape, or
//   without the dimensions the plan needs, is drawn dashed at its kind's usual size and says why.
// - **Marks and anchors.** Its name carries `data-label`; a badge and its pins sit on its top edge. It has no resize
//   handles: its dimensions are fields of Details.
//
// What the scaffold fixes for a node component of another renderer is said in plane/nodes/sequence/index.ts and, in
// full, in plane/Plane.tsx: who it is (`data-of`), its marks (`.grasp-marks`), its anchors (`data-label`), its own
// selected look and its own look while a gesture is over it (`data-over`). The entry of the registry already sets
// `flow: { elevateNodesOnSelect: false }` (views/bodies.ts), so a picked footprint is not raised over what lies on
// it. A node component never reads the body's context (views/bodyContext.ts).
//
// Nothing imports this file until index.ts names its component. Its stylesheet is
// plane/nodes/geometry/geometry.css, beside it. The package creates it and imports it from the folder's index.ts.

import type { NodeProps } from '@xyflow/react';

/** A footprint's node. It renders nothing until package 2-11 builds it. */
export function FootprintNode(_props: NodeProps): JSX.Element | null {
  return null;
}
