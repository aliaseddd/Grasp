// The menu that asks which kind of line, where more than one fits. THE SCAFFOLD'S SKELETON: package 2-2 owns this
// file and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-2; section 2, "The connect menu's design"; section 4, seam 6):
// `ConnectMenu({ session, viewId })` reads `connectOf(viewStoreOf(session, viewId)).menu` and, while it is not null,
// shows a Material UI menu, dense, at `menu.left`, `menu.top` (the window's px, where the line was let go), with one
// entry for each of `menu.kinds`, by the kind's label, in their order; the first has the keyboard's focus. A choice
// calls `choose(kind)`; Escape or a click outside calls `closeMenu()` and draws nothing. Its list carries
// `data-testid="connect-menu"`, and each entry `data-kind`.
//
// What the scaffold fixes for it: plane/Plane.tsx renders it beside the palette, outside React Flow, in the plane's
// root, so React hands its events on to the root: it stops its own right-click, as the palette does.

import type { BodyProps } from '../views/bodies';

/** The connect menu. It renders nothing until package 2-2 builds it. */
export function ConnectMenu(_props: BodyProps): JSX.Element | null {
  return null;
}
