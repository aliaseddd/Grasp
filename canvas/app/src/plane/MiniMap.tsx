// A plane's minimap, at its bottom right (plan/slice-1.md, section 4; plan/swarm/step-8.md, change 3): one of our own
// since step 8, in place of React Flow's. Plane.tsx renders it inside React Flow, only while the plane is as large as
// the adapter's hasMinimap(width, height) asks.

import { Panel, useStore } from '@xyflow/react';
import { useMemo, useSyncExternalStore } from 'react';
import { MINIMAP } from '../core';
import type { PlaneNode } from '../core';
import type { ViewStore } from './viewStore';
import './minimap.css';

export interface PlaneMiniMapProps {
  /** The store of the view the plane shows. */
  store: ViewStore;
}

const rect = (x: number, y: number, w: number, h: number): string => `M${x},${y}h${w}v${h}h${-w}z`;

interface Picture {
  d: string;
  /** x, y, width, height of the viewBox. */
  box: [number, number, number, number];
}

/** The nodes' path and the viewBox around it: made again only when the nodes are another array. */
function pictureOf(nodes: readonly PlaneNode[]): Picture {
  if (nodes.length === 0) return { d: '', box: [0, 0, MINIMAP.width, MINIMAP.height] };
  const at = new Map<string, { x: number; y: number }>();
  let d = '';
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const node of nodes) {
    const parent = node.parentId ? at.get(node.parentId) : undefined;
    const x = node.position.x + (parent?.x ?? 0);
    const y = node.position.y + (parent?.y ?? 0);
    at.set(node.id, { x, y });
    d += rect(x, y, node.width, node.height);
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x + node.width);
    y1 = Math.max(y1, y + node.height);
  }
  const bw = x1 - x0;
  const bh = y1 - y0;
  const scale = Math.max(bw / MINIMAP.width, bh / MINIMAP.height) || 1;
  const vw = scale * MINIMAP.width;
  const vh = scale * MINIMAP.height;
  const off = 5 * scale;
  return { d, box: [x0 - (vw - bw) / 2 - off, y0 - (vh - bh) / 2 - off, vw + 2 * off, vh + 2 * off] };
}

/**
 * The minimap of a plane. Until step 8 it was React Flow's `MiniMap`, which keeps one subscription to React Flow's
 * store for every node of the view and changes its picture's viewBox at every step of a pan: at 5,000 elements that
 * was 5 to 8 ms of every step (plan/swarm/step-8.md). This one shows the same picture. Its contract:
 *
 * - **Where.** A React Flow `Panel` at `position="bottom-right"`, with the classes `react-flow__minimap` (the tests
 *   and the plane's own code find a minimap by it) and `grasp-minimap`; so it stands 15 px from the plane's right and
 *   bottom edges, as React Flow's did, and counts as a panel: `Panel` puts its own class, `react-flow__panel`, and
 *   ours on one and the same element. Inside it one `<svg>`, the adapter's MINIMAP in size (200 by 150, as its
 *   `width` and `height` attributes), drawn as a block (`display: block`), so that the panel is exactly 200 by 150
 *   and no line's gap is left under the picture; with `role="img"` and a `<title>` that reads "Minimap". The panel's ground
 *   is white (`--grasp-white`). It takes the pointer, so a click on it does not reach the ground, and does nothing
 *   with it: the minimap is a picture, not a control.
 * - **The picture.** One `<path class="grasp-minimap-nodes">` whose `d` holds one closed rectangle for every node of
 *   the store's snapshot, in the snapshot's order, each as `M<x>,<y>h<width>v<height>h<-width>z`: the node's `width`
 *   and `height`, at its place from the view's origin, which is its own `position` added to its parent's place (a
 *   parent comes before its children in `nodes`). Its fill is `--grasp-line-strong`; it has no stroke. The path is
 *   made again only when the snapshot's `nodes` array is another array: a pan makes nothing again. Far or near, the
 *   picture is the same. A view with no node has the path with an empty `d`.
 * - **The viewBox is the picture's, not the window's.** From the rectangle around every node's rectangle (`b`): with
 *   `scale = max(b.w / MINIMAP.width, b.h / MINIMAP.height)` (1 when that is 0: nodes of no size), `vw = scale * MINIMAP.width`,
 *   `vh = scale * MINIMAP.height` and `off = 5 * scale`, the viewBox is `x = b.x - (vw - b.w) / 2 - off`,
 *   `y = b.y - (vh - b.h) / 2 - off`, `width = vw + 2 * off`, `height = vh + 2 * off`: the picture centred, 5 px of
 *   the minimap clear on every side. It changes only when `nodes` does. React Flow's own minimap widens its viewBox
 *   to hold the window too, which redraws every rectangle at each step of a pan; ours does not, so a window panned
 *   away from the view shows as a mask over the whole picture. For a view with no node the formula is not used: its
 *   viewBox is `0 0 200 150`.
 * - **The window.** One `<path class="grasp-minimap-mask">` with `fill-rule="evenodd"` and the fill
 *   `--grasp-minimap-mask`, whose `d` is two rectangles written as the nodes' are, with nothing between them: the
 *   viewBox grown by its own width and height on every side (from `x - width`, `y - height`, three times as wide and
 *   as high), then the plane's window in the view's units, `x = -tx / zoom`, `y = -ty / zoom`, `width / zoom` by
 *   `height / zoom`, from React Flow's store (`transform`, `width`, `height`, read with `useStore`). So what the
 *   window shows is clear and the rest is veiled. At a step of a pan or a zoom only this path's `d` changes.
 * - **What it costs.** One subscription to the view's store (`useSyncExternalStore(store.subscribe,
 *   store.getSnapshot)`) and one to React Flow's store, whose selector gives a string or a number so that equal
 *   states compare equal; no subscription per node, and none of React Flow's `.react-flow__minimap-node` elements.
 * - While a drag moves nodes the picture follows, since each step's snapshot has a new `nodes` array.
 * - Its rules are in `plane/minimap.css`, which this file imports; every colour is a CSS variable of shell/theme.ts.
 */
export function PlaneMiniMap({ store }: PlaneMiniMapProps): JSX.Element {
  const { nodes } = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const picture = useMemo(() => pictureOf(nodes), [nodes]);
  const window = useStore((s) => `${s.transform[0]},${s.transform[1]},${s.transform[2]},${s.width},${s.height}`);
  const [tx, ty, zoom, width, height] = window.split(',').map(Number);
  const [x, y, w, h] = picture.box;
  const mask = rect(x - w, y - h, 3 * w, 3 * h) + rect(-tx / zoom, -ty / zoom, width / zoom, height / zoom);
  return (
    <Panel position="bottom-right" className="react-flow__minimap grasp-minimap">
      <svg width={MINIMAP.width} height={MINIMAP.height} viewBox={`${x} ${y} ${w} ${h}`} role="img">
        <title>Minimap</title>
        <path className="grasp-minimap-nodes" d={picture.d} />
        <path className="grasp-minimap-mask" fillRule="evenodd" d={mask} />
      </svg>
    </Panel>
  );
}
