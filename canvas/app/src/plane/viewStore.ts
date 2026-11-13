// A view's store: one view's state outside React (plan/slice-1.md, section 3; plan/notes.md, session 17, "The
// architecture", and session 20, "Step 6: the outline, part 2"). Dockview takes a hidden tab's body out of the
// document and its plane unmounts React Flow; the store keeps what the tab must find again: the view's projection,
// its camera, far or near, and React Flow's own `selected`. React reads it through useSyncExternalStore.
//
// It knows no React, no Dockview and no DOM, how no node looks, and no rule of place or size: those are the
// adapter's (core/adapter.ts), which it calls. It imports React Flow's types only, so Node tests load it
// (canvas/app/test/core.mjs).

import type { EdgeChange, NodeChange } from '@xyflow/react';
import type { PlaneEdge, PlaneNode, Session, Viewport } from '../core';

/** What a plane renders. A new object only when something in it changed; `nodes` and `edges` each likewise. */
export interface ViewSnapshot {
  readonly nodes: PlaneNode[];
  readonly edges: PlaneEdge[];
  /** Whether the plane is far: its zoom is under FAR. */
  readonly far: boolean;
}

/**
 * One view's store. Its methods are bound: each can be handed to React or to React Flow as it is, and is the same
 * function for the store's life (a new `subscribe` would make useSyncExternalStore subscribe again at every render).
 *
 * - **Live or stale.** A store with a subscriber is live. When the session's history tells of a change that can have
 *   altered the view (`told.views` is null or names it; never for `by: 'end'`), a live store projects again, with
 *   the projection before as `previous`, and calls its subscribers if the snapshot is a new object. A store with no
 *   subscriber only marks itself stale, and projects at the next getSnapshot(). So a hidden tab costs nothing per
 *   change, and a change to another view's places leaves this one's snapshot the very object it was.
 * - **The camera.** camera() gives the viewport the view was last seen with; the first time, the fit. far is decided
 *   from the viewport's zoom wherever one is set (camera's first fit, fit(), moved()): when it changes, the view is
 *   projected again, far or near, and the subscribers are called. moved() does nothing else: a pan step of a far or a
 *   near view calls nobody.
 * - **React Flow's changes.** Step 6 takes `select` only: the node or edge named gets a new object with `selected`
 *   set, in a new array, and only when it differs; the projection kept as `previous` holds the same objects, so the
 *   next projection keeps what was selected. Every other change (`dimensions`, `position`, `remove`, `add`,
 *   `replace`) changes nothing until step 7.
 * - A view the model no longer holds, and a view of a kind no plane draws, have the empty snapshot.
 */
export interface ViewStore {
  readonly session: Session;
  readonly viewId: string;
  /** Whether a plane draws this view's kind (the adapter's isDrawn). When false the tab shows the card. */
  readonly drawn: boolean;
  /** What the card says first (the adapter's notDrawnText). */
  readonly notDrawn: string;
  /** How many times the store has projected its view: for the tests, and for looking through window.Grasp. */
  readonly projected: number;
  subscribe(listener: () => void): () => void;
  getSnapshot(): ViewSnapshot;
  /** The viewport to mount React Flow with, in a window `width` by `height`: the remembered one, or the fit. */
  camera(width: number, height: number): Viewport;
  /** Fits the view into the window now (the adapter's fit over the projection's bounds), remembers and returns it. */
  fit(width: number, height: number): Viewport;
  /** React Flow's onViewportChange: remembers the viewport. */
  moved(viewport: Viewport): void;
  /** React Flow's onNodesChange. */
  nodesChanged(changes: NodeChange<PlaneNode>[]): void;
  /** React Flow's onEdgesChange. */
  edgesChanged(changes: EdgeChange<PlaneEdge>[]): void;
}

/**
 * The store of a session's view: the same one each time it is asked for. A session's stores share one listener on
 * its history, added with the first store. Stores are kept by the session object itself, weakly, so a session that is
 * replaced takes its stores with it.
 */
export function viewStoreOf(session: Session, viewId: string): ViewStore {
  void [session, viewId];
  throw new Error('plane/viewStore.ts: viewStoreOf() is not built yet (step 6).');
}

/** The stores made so far for a session, by view id: what window.Grasp.views shows. */
export function viewStoresOf(session: Session): ReadonlyMap<string, ViewStore> {
  void session;
  throw new Error('plane/viewStore.ts: viewStoresOf() is not built yet (step 6).');
}
