// A pin: the round mark with a note's number, on what the note is on or free on a view. THE SCAFFOLD'S SKELETON:
// package 2-7 owns this file and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-7; section 4, seam 4; section 6, "A pin"):
// - `Pins({ marks, of })` draws one pin for each of `marks.pins`, in their order: round, 22 px (`--grasp-pin`), the
//   note's number; teal with a white number; grey (`--grasp-resolved`) for a resolved note. Each carries
//   `data-testid="pin"`, `data-note` (the note's id), `data-pass`, and `data-resolved` or `data-hot` when it is; a hot
//   pin has a ring of 2 px in the ink.
// - `FreePins({ session, viewId })` draws `marksOf(session).free(viewId)` the same way, hollow (white with a teal
//   border and a teal number; a grey border when resolved), each at its `x` and `y` from the top left corner of its
//   offset parent, and draws again when marksOf(session).listen tells.
// - A pin hears its own pointerdown and calls pinOf(session).press(noteId, pointer, useBody())
//   (plane/gestures/pin.ts). It stops its click from reaching its node, so a click on a pin picks nothing.
//
// What the scaffold fixes for it:
// - `Pins` is rendered inside `.grasp-marks` (plane/marks/marks.css), before the badge, by every node component and,
//   for a line, by the edge component through React Flow's EdgeLabelRenderer; and by a component body in its rows.
//   That element exists only on a marked thing, keeps its size on the screen at any zoom, carries `nodrag nopan`, and
//   lets the pointer through to its children only.
// - `FreePins` is rendered by plane/Plane.tsx inside React Flow's viewport (its ViewportPortal), whose top left corner
//   is the view's origin and which is in the view's units: a free pin keeps its size on the screen by the inverse of
//   `--grasp-zoom` (`transform: scale(calc(1 / var(--grasp-zoom, 1)))`), which the plane gives to that portal and to
//   every `.grasp-marks`, and nowhere else (plane/Plane.tsx says why). The plane mounts the portal only while the view
//   has a free pin, and far (below 25% zoom) it renders none. A component body renders it inside the element whose top left corner is the
//   view's origin, so the pins scroll with what they float on.
// - Both may read useBody(): a pin exists only on a marked thing. Its stylesheet is plane/marks/pin.css.

import type { Marks } from '../../core';
import type { BodyProps } from '../../views/bodies';

export interface PinsProps {
  marks: Marks;
  /** 'el:<id>' or 'rel:<id>'. */
  of: string;
}

/** The pins of the notes on one thing. It renders nothing until package 2-7 builds it. */
export function Pins(_props: PinsProps): JSX.Element | null {
  return null;
}

/** The pins of the free notes that float on a view. It renders nothing until package 2-7 builds it. */
export function FreePins(_props: BodyProps): JSX.Element | null {
  return null;
}
