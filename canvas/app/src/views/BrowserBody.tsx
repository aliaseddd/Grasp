// The body of a browser view. THE SCAFFOLD'S SKELETON: package 2-13 owns this file and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-13; section 4, seams 1, 2, 4 and 7; section 5, flows 4 and
// 15): `BrowserBody`, in place of null: a component that takes BodyProps ({ session, viewId }) and nothing else, and
// draws a browser view as the Explorer's tree under the view's roots.
//
// What the scaffold fixes for it:
// - It draws itself inside `<BodyFrame session viewId renderer="browser" toView reveal onShown>`
//   (views/BodyFrame.tsx), which gives it its root, its clicks, its right-click palette, its context (useBody()) and
//   its hand to the shell.
// - It reads its view with readView(session, viewId) (core/readers), never a record of the model.
// - A row carries data-thing="<type>:<id>" on the element that takes its click, and data-label="<type>:<id>" on its
//   name. A row shows <Pins /> and <Badge /> (plane/marks/) at its right end; the view's free notes are <FreePins />
//   inside the scrolling content.
// - A row's triangle stops its own click (BodyFrame's contract says why), and writes the view's `collapsed` option
//   through setViewOption (core/actions/views.ts). A row is renamed through rename() of core/labels.ts.
// - Expand all is an ActionButton (shell/ActionControl.tsx) for the action `expand-all`, in a bar at the top of the
//   body, above the tree. Neither the view's section of Details nor the palette shows it.
//
// While this is null, or the reader of core/readers/browser.ts is, a browser view's tab shows the card
// (views/ViewHost.tsx).

import type { BodyProps } from './bodies';

/** The body of the renderer `browser`. Null until package 2-13 builds it. */
export const BrowserBody: ((props: BodyProps) => JSX.Element) | null = null;
