// A plane's minimap, at its bottom right (plan/slice-1.md, section 4; plan/swarm/step-8.md, change 3). Until step 8
// draws one of our own, it is React Flow's. Plane.tsx renders it inside React Flow, only while the plane is as large
// as the adapter's hasMinimap(width, height) asks.

import { MiniMap } from '@xyflow/react';
import { MINIMAP } from '../core';
import type { ViewStore } from './viewStore';

export interface PlaneMiniMapProps {
  /** The store of the view the plane shows. */
  store: ViewStore;
}

const STYLE = { width: MINIMAP.width, height: MINIMAP.height };

/**
 * The minimap of a plane. Today it is React Flow's `MiniMap`, which keeps one subscription to React Flow's store for
 * every node of the view and changes its picture's viewBox at every step of a pan: at 5,000 elements that is 5 to 8
 * ms of every step (plan/swarm/step-8.md). Step 8 draws one of our own, which shows the same picture. Its contract:
 *
 * - **Where.** A React Flow `Panel` at `position="bottom-right"`, with the classes `react-flow__minimap` (the tests
 *   and the plane's own code find a minimap by it) and `grasp-minimap`; so it stands 15 px from the plane's right and
 *   bottom edges, as React Flow's did, and counts as a panel (`.react-flow__panel`). Inside it one `<svg>`, the
 *   adapter's MINIMAP in size (200 by 150), with `role="img"` and a `<title>` that reads "Minimap". The panel's ground
 *   is white (`--grasp-white`). It takes the pointer, so a click on it does not reach the ground, and does nothing
 *   with it: the minimap is a picture, not a control.
 * - **The picture.** One `<path class="grasp-minimap-nodes">` whose `d` holds one closed rectangle for every node of
 *   the store's snapshot, in the snapshot's order, each as `M<x>,<y>h<width>v<height>h<-width>z`: the node's `width`
 *   and `height`, at its place from the view's origin, which is its own `position` added to its parent's place (a
 *   parent comes before its children in `nodes`). Its fill is `--grasp-line-strong`; it has no stroke. The path is
 *   made again only when the snapshot's `nodes` array is another array: a pan makes nothing again. Far or near, the
 *   picture is the same. A view with no node has the path with an empty `d`.
 * - **The viewBox is the picture's, not the window's.** From the rectangle around every node's rectangle (`b`): with
 *   `scale = max(b.w / MINIMAP.width, b.h / MINIMAP.height)` (1 when that is 0), `vw = scale * MINIMAP.width`,
 *   `vh = scale * MINIMAP.height` and `off = 5 * scale`, the viewBox is `x = b.x - (vw - b.w) / 2 - off`,
 *   `y = b.y - (vh - b.h) / 2 - off`, `width = vw + 2 * off`, `height = vh + 2 * off`: the picture centred, 5 px of
 *   the minimap clear on every side. It changes only when `nodes` does. React Flow's own minimap widens its viewBox
 *   to hold the window too, which redraws every rectangle at each step of a pan; ours does not, so a window panned
 *   away from the view shows as a mask over the whole picture. A view with no node has the viewBox
 *   `0 0 200 150`.
 * - **The window.** One `<path class="grasp-minimap-mask">` with `fill-rule="evenodd"` and the fill
 *   `--grasp-minimap-mask`, whose `d` is two rectangles: the viewBox grown by its own width and height on every
 *   side, then the plane's window in the view's units, `x = -tx / zoom`, `y = -ty / zoom`, `width / zoom` by
 *   `height / zoom`, from React Flow's store (`transform`, `width`, `height`, read with `useStore`). So what the
 *   window shows is clear and the rest is veiled. At a step of a pan or a zoom only this path's `d` changes.
 * - **What it costs.** One subscription to the view's store (`useSyncExternalStore(store.subscribe,
 *   store.getSnapshot)`) and one to React Flow's store, whose selector gives a string or a number so that equal
 *   states compare equal; no subscription per node, and none of React Flow's `.react-flow__minimap-node` elements.
 * - While a drag moves nodes the picture follows, since each step's snapshot has a new `nodes` array.
 * - Its rules are in `plane/minimap.css`, which this file imports; every colour is a CSS variable of shell/theme.ts.
 */
export function PlaneMiniMap(_props: PlaneMiniMapProps): JSX.Element {
  return <MiniMap style={STYLE} />;
}
