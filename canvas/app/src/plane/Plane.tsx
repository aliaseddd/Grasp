// A view's tab body (plan/slice-1.md, step 6; plan/notes.md, session 17, "The architecture", and session 20, "Step 6:
// the outline, part 2"). For a kind no plane draws it shows the card. Otherwise it is the gate that mounts React Flow
// only while the tab has a size, and React Flow's props and gestures, the ground, the zoom buttons and the minimap.
// It knows no Dockview, none of the model's elements, no history and no file: it draws what its view's store gives.

import type { Session } from '../core';

export interface PlaneProps {
  /** The session the tab was made for (ViewParams in shell/Dock.tsx says why not the dock's). */
  session: Session;
  viewId: string;
}

/**
 * The contract.
 *
 * - **The root** fills the tab's body and carries `data-testid="plane"` and `data-view` (the view's id), for a drawn
 *   view and for a card alike, and the class `grasp-plane`. It sets the adapter's measures as CSS variables for
 *   app.css (LOOK's header, head, lead, pad and port, as `--grasp-node-*`), so that each number is written once.
 * - **A kind no plane draws** (`store.drawn` false): NotDrawnYet with `store.notDrawn`. React Flow is not mounted.
 * - **The gate.** A ResizeObserver on the root. While the root has a width and a height, the inner component is
 *   mounted; at 0 by 0 (Dockview has taken the tab's body out of the document) it is not. The inner component reads
 *   `store.camera(width, height)` once, as it mounts and before its first snapshot, and gives it to React Flow as
 *   `defaultViewport`; so a view is fitted when it first has a size, and a tab shown again finds its camera. A later
 *   change of size fits nothing.
 * - **The snapshot**: `useSyncExternalStore(store.subscribe, store.getSnapshot)`; its `nodes` and `edges` go to React
 *   Flow as they are.
 * - **React Flow's props**, every object and function among them the same at each render: `nodeTypes` (all 13 SHAPES:
 *   a type that is missing falls back to React Flow's `default`, silently), `edgeTypes` ({ line }), `onNodesChange`,
 *   `onEdgesChange` and `onViewportChange` (the store's nodesChanged, edgesChanged, moved), `defaultViewport`,
 *   `minZoom` and `maxZoom` (the adapter's MIN_ZOOM, MAX_ZOOM), `onlyRenderVisibleElements`, `panOnScroll` with
 *   `panOnScrollSpeed={1}`, `zoomOnScroll={false}`, `zoomOnPinch`, `zoomOnDoubleClick={false}`,
 *   `nodesDraggable={false}` (until step 7), `nodesConnectable={false}`, `nodesFocusable={false}`,
 *   `edgesFocusable={false}`, `disableKeyboardA11y`, `proOptions` hiding the attribution. No `fitView`, `viewport`,
 *   `width` or `height` prop, no `extent` and no `expandParent` on a node.
 * - **Around the nodes**: the ground's dots (`Background`), left out when far; `Controls` at the bottom left without
 *   the lock (`showInteractive={false}`) and without React Flow's own fit (`showFitView={false}`), which would fit a
 *   frame later by its own rule: a `ControlButton` named "Fit the view" calls `store.fit(width, height)` with the
 *   root's size now and sets that viewport; `MiniMap` at the bottom right, 200 by 150.
 * - Nothing of Grasp's renders on a viewport change: `moved` is the store's, and the component reads no viewport.
 */
export function Plane(props: PlaneProps): JSX.Element {
  void props;
  throw new Error('plane/Plane.tsx: Plane is not built yet (step 6).');
}
