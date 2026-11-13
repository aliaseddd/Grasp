// A view's store: one view's state outside React (plan/slice-1.md, section 3; plan/notes.md, session 17, "The
// architecture", and session 20, "Step 6: the outline, part 2"). Dockview takes a hidden tab's body out of the
// document and its plane unmounts React Flow; the store keeps what the tab must find again: the view's projection,
// its camera, far or near, and React Flow's own `selected`. React reads it through useSyncExternalStore.
//
// It knows no React, no Dockview and no DOM, how no node looks, and no rule of place or size: those are the
// adapter's (core/adapter.ts), which it calls. It imports React Flow's types only, so Node tests load it
// (canvas/app/test/core.mjs).

import type { EdgeChange, NodeChange } from '@xyflow/react';
import { FAR, fit, isDrawn, notDrawnText, project } from '../core';
import type { PlaneEdge, PlaneNode, Projection, Session, Told, Viewport } from '../core';

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

const EMPTY: ViewSnapshot = { nodes: [], edges: [], far: false };

type Hear = (told: Told) => void;

/** What a session's stores are: by view id, and what each hears of the history, through one shared listener. */
interface Stores {
  readonly byView: Map<string, ViewStore>;
  readonly hear: Map<string, Hear>;
}
const KEPT = new WeakMap<Session, Stores>();

function storesOf(session: Session): Stores {
  let kept = KEPT.get(session);
  if (!kept) {
    const made: Stores = { byView: new Map(), hear: new Map() };
    kept = made;
    KEPT.set(session, made);
    session.history.listen((told) => { for (const hear of [...made.hear.values()]) hear(told); });
  }
  return kept;
}

interface Item { id: string; selected?: boolean }
interface Select { type: string; id?: string; selected?: boolean }

/** The list with the items the `select` changes name set as they say: a new array, new objects for those; null if none differs. */
function selected<T extends Item>(list: T[], changes: readonly Select[]): T[] | null {
  let out: T[] | null = null;
  for (const change of changes) {
    if (change.type !== 'select' || change.id === undefined) continue;
    const current: T[] = out ?? list;
    const at = current.findIndex((item) => item.id === change.id);
    if (at < 0 || (current[at].selected ?? false) === (change.selected ?? false)) continue;
    out ??= [...list];
    out[at] = { ...current[at], selected: change.selected ?? false };
  }
  return out;
}

function make(session: Session, viewId: string, hear: Map<string, Hear>): ViewStore {
  const listeners = new Set<() => void>();
  let projection: Projection | null = null;
  let snapshot: ViewSnapshot = EMPTY;
  let stale = true;
  let far = false;
  let viewport: Viewport | null = null;
  let projected = 0;

  const viewOf = () => session.model.views.find((view) => view.id === viewId);

  /** Makes the snapshot of the projection: the object it was while its nodes, edges and far are the same. */
  const adopt = (): void => {
    const p = projection;
    if (!p) { snapshot = EMPTY; return; }
    if (snapshot.nodes !== p.nodes || snapshot.edges !== p.edges || snapshot.far !== p.far) snapshot = { nodes: p.nodes, edges: p.edges, far: p.far };
  };

  /** Projects again when stale. Returns whether the snapshot is a new object. */
  const refresh = (): boolean => {
    if (!stale && projection) return false;
    stale = false;
    const before = snapshot;
    const view = viewOf();
    if (!view) {
      projection = null;
    } else {
      projected++;
      projection = project(session.lib, session.model, view, { far, previous: projection });
    }
    adopt();
    return snapshot !== before;
  };

  const tell = (): void => { for (const listener of [...listeners]) listener(); };

  /** Remembers a viewport. When it crosses FAR, the view is far or near from then on, and a live store tells. */
  const see = (next: Viewport): Viewport => {
    viewport = { x: next.x, y: next.y, zoom: next.zoom };
    const now = next.zoom < FAR;
    if (now !== far) {
      far = now;
      stale = true;
      if (listeners.size > 0 && refresh()) tell();
    }
    return viewport;
  };

  const getSnapshot = (): ViewSnapshot => {
    refresh();
    return snapshot;
  };

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  };

  const camera = (width?: number, height?: number): Viewport => {
    if (viewport) return viewport;
    refresh();
    if (width === undefined || height === undefined) return { x: 0, y: 0, zoom: 1 };
    return see(fit(projection ? projection.bounds : null, width, height));
  };

  const fitNow = (width: number, height: number): Viewport => {
    refresh();
    return see(fit(projection ? projection.bounds : null, width, height));
  };

  const moved = (next: Viewport): void => { see(next); };

  const nodesChanged = (changes: NodeChange<PlaneNode>[]): void => {
    refresh();
    if (!projection) return;
    const nodes = selected(projection.nodes, changes);
    if (!nodes) return;
    projection = { ...projection, nodes };
    adopt();
    tell();
  };

  const edgesChanged = (changes: EdgeChange<PlaneEdge>[]): void => {
    refresh();
    if (!projection) return;
    const edges = selected(projection.edges, changes);
    if (!edges) return;
    projection = { ...projection, edges };
    adopt();
    tell();
  };

  hear.set(viewId, (told) => {
    if (told.by === 'end') return;
    if (told.views !== null && !told.views.includes(viewId)) return;
    stale = true;
    if (listeners.size > 0 && refresh()) tell();
  });

  return {
    session,
    viewId,
    get drawn() { const view = viewOf(); return !!view && isDrawn(session.lib, view.kind); },
    get notDrawn() { const view = viewOf(); return view ? notDrawnText(session.lib, view.kind) : 'This view is not in the model.'; },
    get projected() { return projected; },
    subscribe,
    getSnapshot,
    camera,
    fit: fitNow,
    moved,
    nodesChanged,
    edgesChanged,
  };
}

/**
 * The store of a session's view: the same one each time it is asked for. A session's stores share one listener on
 * its history, added with the first store. Stores are kept by the session object itself, weakly, so a session that is
 * replaced takes its stores with it.
 */
export function viewStoreOf(session: Session, viewId: string): ViewStore {
  const kept = storesOf(session);
  let store = kept.byView.get(viewId);
  if (!store) {
    store = make(session, viewId, kept.hear);
    kept.byView.set(viewId, store);
  }
  return store;
}

/** The stores made so far for a session, by view id: what window.Grasp.views shows. */
export function viewStoresOf(session: Session): ReadonlyMap<string, ViewStore> {
  return storesOf(session).byView;
}
