// How far a plane is zoomed, as a percentage, between its zoom buttons. THE SCAFFOLD'S SKELETON: package 2-14 owns
// this file and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-14; section 7, line 10): `ZoomReadout({ session, viewId })`
// reads its view's store (viewStoreOf(session, viewId), plane/viewStore.ts): `store.zoom`, through
// useSyncExternalStore(store.watchZoom, () => store.zoom), so it renders when the zoom changes and never on a pan. It
// says the zoom in whole per cent: "100%".
//
// What the scaffold fixes for it:
// - plane/Plane.tsx renders it inside React Flow's Controls, after the two zoom buttons in the document.
//   plane/zoom.css puts it between them on the screen, and gives it its box: its root is one element with the class
//   `grasp-zoom-readout`, which that stylesheet makes as wide as a button, with the readout's words centred in 11 px.
// - It is no button and takes no focus. It carries no `data-testid` of the scaffold's: the test of line 10 finds it
//   by its class or by a name its package gives it.

import type { BodyProps } from '../views/bodies';

/** The zoom's readout. It renders nothing until package 2-14 builds it. */
export function ZoomReadout(_props: BodyProps): JSX.Element | null {
  return null;
}
