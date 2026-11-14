// The body of a grid view. THE SCAFFOLD'S SKELETON: package 2-12 owns this file and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-12; section 4, seams 1, 2, 4 and 9; section 5, flow 14):
// `GridBody`, in place of null: a component that takes BodyProps ({ session, viewId }) and nothing else, and draws a
// grid view as a table of its elements, or as a matrix of the relationships between them.
//
// What the scaffold fixes for it:
// - It draws itself inside `<BodyFrame session viewId renderer="grid" toView reveal onShown>` (views/BodyFrame.tsx),
//   which gives it its root, its clicks, its right-click palette, its context (useBody()) and its hand to the shell.
// - It reads its view with readView(session, viewId) (core/readers), never a record of the model, when it is shown
//   and after each change the history tells of that can have altered the view; and it draws again when
//   marksOf(session).listen tells.
// - A row carries data-thing="el:<id>" on the element that takes its click, and a line of a matrix's cell
//   data-thing="rel:<id>". Nothing in a grid carries data-label. Its marks are <Pins /> and <Badge />
//   (plane/marks/), and its view's free notes <FreePins />, inside the scrolling content whose top left corner is the
//   view's origin.
// - What it must find again (its scroll place, how many rows are shown) it keeps outside React, for the session and
//   the view's id: a hidden tab's body is taken out of the document.
// - What is saved (the sort) is the view's option, written through setViewOption (core/actions/views.ts).
//
// While this is null, or the reader of core/readers/grid.ts is, a grid view's tab shows the card (views/ViewHost.tsx).

import type { BodyProps } from './bodies';

/** The body of the renderer `grid`. Null until package 2-12 builds it. */
export const GridBody: ((props: BodyProps) => JSX.Element) | null = null;
