// A message of a sequence view: an edge between two lifelines, on its row. THE SCAFFOLD'S SKELETON: package 2-10 owns
// this file and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-10, "Decided"; section 4, seam 3, "A gesture that React Flow
// does not report as a node's drag"): the edge component plane/nodes/sequence/index.ts names in `edgeTypes` as
// `message`. A succession is slice 1's edge `line` (plane/edges/LineEdge.tsx).
// - **Where it runs.** A message is an edge with `zIndex: 1`. It ends on an event's node when its end is a drawn
//   event, else on the lifeline's line node. Its `data` holds `sy` and `ty` (how far under each of those nodes' tops
//   its line runs), `self`, `dotA`, `dotB` and its label; the edge works its line out from its two nodes'
//   rectangles, as LineEdge does. A message back to its own lifeline is a loop 48 out.
// - **Its drag is its own gesture.** `pointerdown` on its line or its label, the pointer followed on the window,
//   sequenceStep() of core/readers/sequence.ts for each step, the view's store's preview() (plane/viewStore.ts), and
//   moveMessage() of core/actions/sequence.ts at the release. A press that does not go 4 px is a click on the
//   message. The gesture adds itself to gesturesOf(session), so Escape calls it off, and calls useBody().swallow()
//   once it has moved.
// - **Marks, anchors and grips.** Its label carries `data-label`; a badge and its pins sit at its middle; selected
//   and near, it shows a grip at each end (criterion 5).
//
// What the scaffold fixes for an edge component of another renderer is said in plane/nodes/sequence/index.ts and, in
// full, in plane/Plane.tsx: who it is (`data-of="rel:<data.relationship>"` on one element inside its own), its marks
// (the pair `<Pins />` and `<Badge />` in `.grasp-marks`, through React Flow's EdgeLabelRenderer, only when marked
// and near), its anchor, `{EndGrips({ points })}` last in a selected, near edge, and its own selected look and its
// own look while a gesture is over it (`data-over`).
//
// Nothing imports this file until index.ts names its component. Its stylesheet is
// plane/nodes/sequence/sequence.css, beside it.

import type { EdgeProps } from '@xyflow/react';

/** A message's edge. It renders nothing until package 2-10 builds it. */
export function MessageEdge(_props: EdgeProps): JSX.Element | null {
  return null;
}
