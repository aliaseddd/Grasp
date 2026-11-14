// The line that follows the pointer while a line is drawn or an end is moved. THE SCAFFOLD'S SKELETON: package 2-2
// owns this file and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-2; section 4, seam 6; section 6, "The line in hand"):
// `ConnectLayer({ session, viewId })` reads `connectOf(viewStoreOf(session, viewId))` (plane/gestures/connect.ts) and,
// while its `state` is not null, draws the line in hand from `state.start` to `state.at`: straight, 1.5 px, dashed,
// teal when something fits under the pointer (`--grasp-teal`) and grey when nothing does (`--grasp-unfit`).
//
// What the scaffold fixes for it:
// - plane/Plane.tsx renders it as a child of React Flow, so it may use React Flow's hooks, and it draws through React
//   Flow's `ViewportPortal`, in the view's units. Inside that portal the plane's zoom is the CSS variable
//   `--grasp-zoom`, for a line that keeps its width on the screen.
// - What it draws carries `data-pass`, so that the body's hitAt looks past the line at what is under the pointer, and
//   takes no pointer.
// - Its stylesheet is plane/gestures/connect.css, beside it. The package creates it and imports it from this file.

import type { BodyProps } from '../../views/bodies';

/** The line in hand. It renders nothing until package 2-2 builds it. */
export function ConnectLayer(_props: BodyProps): JSX.Element | null {
  return null;
}
