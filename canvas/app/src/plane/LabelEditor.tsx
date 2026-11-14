// The label editor: one text box for the page, laid over the label that is being edited. THE SCAFFOLD'S SKELETON:
// package 2-3 owns this file and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-3; section 4, seam 7; section 5, flow 3; section 6, "The label
// editor"): `LabelEditor({ session })` reads labelEditOf(session) (core/labels.ts) and, while `editing` is not null,
// lays one text box over the label's anchor in the root of the view it names. It carries
// `data-testid="label-editor"`.
//
// What the scaffold fixes for it:
// - shell/App.tsx renders the one `<LabelEditor session />` for the page, while a file is open.
// - **A view's root** is the element with `data-view="<view id>"`: a plane's (`data-testid="plane"`) or a component
//   body's (`data-testid="body"`).
// - **An anchor** is whatever element shows a label that can be edited; it carries `data-label="<type>:<id>"`
//   ('el:<element id>' or 'rel:<relationship id>'). The scaffold puts it on a box's name line (`.grasp-node-name`), a
//   border item's name and a small node's name (svg `text`), and a line's label (svg `text`). A row of a browser view
//   carries one on its name; a grid's cells carry none. The editor finds it with
//   `[data-view="<id>"] [data-label="<type>:<id>"]`.
// - **A thing with no anchor in the document** (a line that has no label yet, a node drawn far, a small node with no
//   name) gets the box over the middle of the thing itself. In a plane the thing is found by `data-of`: one element
//   inside each node's and each edge's own React Flow element carries `data-of="<type>:<id>"`, far and near, and the
//   thing's rectangle is that of the `.react-flow__node` it is in (the first, when an element has two nodes) or, for a
//   line, of the element that carries it, which is the path that takes the line's pointer. Never read a node's
//   `data-id` as an element's id (contract 5). In a component body the thing is the element with
//   `data-thing="<type>:<id>"`.
// - **The zoom** of a plane is its store's: viewStoreOf(session, viewId).zoom, and `watchZoom` tells when it changes
//   (plane/viewStore.ts). A component body has no zoom: 1. The CSS variable `--grasp-zoom` is given only to a plane's
//   marks and to React Flow's two portals (plane/Plane.tsx says why), so the editor, which is outside the plane, does
//   not find it.
// - A label outside the window is brought into it first: handsOf(session).hands?.reveal(viewId, rect).
// - Its stylesheet is plane/label-editor.css, beside it. The package creates it and imports it from this file.

import type { Session } from '../core';

export interface LabelEditorProps {
  session: Session;
}

/** The label editor. It renders nothing until package 2-3 builds it. */
export function LabelEditor(_props: LabelEditorProps): JSX.Element | null {
  return null;
}
