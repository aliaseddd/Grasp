// A badge: the round "!" on a node or a line that has a problem. THE SCAFFOLD'S SKELETON: package 2-6 owns this file
// and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-6; section 4, seam 4; section 6, "A badge"):
// `Badge({ marks, of })` shows one badge when `marks.problems` is above 0, whatever the count: round, 16 px
// (`--grasp-badge`), "!" in white on the theme's warning colour (`--grasp-warning`). It carries
// `data-testid="badge"` and `data-pass`. Its tooltip lists the thing's sentences, one a line, read from
// entriesOf(session) when the pointer comes over it, through useBody().session. A click on a badge is a click on its
// node or line.
//
// What the scaffold fixes for it:
// - It is rendered inside `.grasp-marks` (plane/marks/marks.css), after the pins, by every node component and, for a
//   line, by the edge component through React Flow's EdgeLabelRenderer; and by a component body in its rows. That
//   element exists only on a marked thing, keeps its size on the screen at any zoom, carries `nodrag nopan`, and lets
//   the pointer through to its children only.
// - `of` is 'el:<id>' or 'rel:<id>': the element or the relationship the marks are of.
// - Badge writes NO click handler. On a node the badge is inside the node's own element, so its click reaches the
//   node. On a line it is in React Flow's label renderer, outside the edge's element in the DOM, but
//   EdgeLabelRenderer is a React portal of the edge component, and React carries the click through the portal to the
//   edge's onClick (plane/Plane.tsx's onEdgeClick), so a click on a line's badge is a click on the line too. A
//   handler of its own would handle the click twice: Ctrl + click on a line's badge would add the line and take it
//   away again.
// - It may read useBody(): a badge exists only on a marked thing. Its stylesheet is plane/marks/badge.css.
//   The package creates it and imports it from this file.

import type { Marks } from '../../core';

export interface BadgeProps {
  marks: Marks;
  /** 'el:<id>' or 'rel:<id>'. */
  of: string;
}

/** The badge of a thing's problems. It renders nothing until package 2-6 builds it. */
export function Badge(_props: BadgeProps): JSX.Element | null {
  return null;
}
