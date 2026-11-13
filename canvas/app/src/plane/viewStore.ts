// A view's store: one view's state outside React (plan/slice-1.md, section 3; plan/notes.md, session 17, "The
// architecture", and session 20, "Step 6: the outline, part 2"). Dockview takes a hidden tab's body out of the
// document and its plane unmounts React Flow; the store keeps what the tab must find again: the view's projection,
// its camera, far or near, and React Flow's own `selected`. React reads it through useSyncExternalStore.
//
// It knows no React, no Dockview and no DOM, how no node looks, and no rule of place or size: those are the
// adapter's (core/adapter.ts), which it calls. It imports React Flow's types only, so Node tests load it
// (canvas/app/test/core.mjs).

import type { EdgeChange, NodeChange } from '@xyflow/react';
import { FAR, fit, isDrawn, linesDrawn, notDrawnText, placesFor, project, projectStep } from '../core';
import type { Ask, PlaneEdge, PlaneNode, Projection, Session, Told, Viewport } from '../core';

/**
 * What a plane renders. A new object only when something in it changed; `nodes` and `edges` each likewise. `nodes` is
 * the projection's nodes. `edges` is the projection's edges while the adapter's linesDrawn(nodes.length, far) is
 * true, and one empty array, the same each time, while it is false.
 */
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
 *   from the viewport's zoom wherever one is set (camera's first fit, fit(), sized(), moved()): when it changes, the
 *   view is projected again, far or near, and the subscribers are called. A pan step of a far or a near view calls
 *   nobody.
 * - **Fitted, or placed by hand.** A view is "as fitted" from a fit (camera's first, fit(), sized()) until moved() is
 *   told of a viewport that is not that fit's (x or y more than 0.01 off, or the zoom more than 0.000001): from then
 *   on somebody has placed it by hand, until the next fit(). While a view is as fitted, sized(width, height) fits it
 *   again for a plane of another size and returns the new viewport, for the plane to set; it returns null when the
 *   fit for that size is the viewport the view has, and always for a view placed by hand. So a view first fitted into
 *   a small plane (a tab that Dockview passes through a small size as it floats, a narrow window) fills its plane
 *   when that grows, a split or a sash drag keeps a fitted view fitted, and a view somebody has panned or zoomed
 *   stays where they put it.
 * - **React Flow's changes: select.** The node or edge named gets a new object with `selected` set, in a new array,
 *   and only when it differs; the projection kept as `previous` holds the same objects, so the next projection keeps
 *   what was selected.
 * - **React Flow's changes: a gesture (step 7).** A `position` change with `dragging` true, and a `dimensions` change
 *   with `resizing` true (with the `position` change NodeResizer sends beside it for a top or left handle), are a
 *   step of a gesture. The first step keeps the projection as the gesture's start. A press is not yet a gesture: until
 *   a step has gone CLICK_DISTANCE screen px from where the press began (the largest of the |dx| and |dy| of a drag's
 *   position against the node's at the press, or of the position and the size of a resize, times the zoom of the
 *   viewport last seen, 1 when none), the steps are kept but write and draw nothing, tell nobody, and the end of such a
 *   press writes nothing: a click that slips a pixel or two is a click. Once past, the gesture runs from the press's
 *   start, whatever the later steps do. Each step adds its asks (the
 *   adapter's Ask: `move` for a position, `resize` for a resizer's position and size, the size kept until it changes
 *   again) to the gesture's asks by node id, works out the adapter's placesFor(lib, model, view, start, asks), and
 *   projects the view with those `places` and the projection before as `previous`, through the adapter's
 *   projectStep(lib, model, view, start, places, { far, previous }); a node React Flow reports as
 *   dragging keeps `dragging: true`. Its subscribers are called once a step. Nothing is written to the model during a
 *   gesture, and the session's history hears nothing.
 * - **A gesture's end.** A `position` change with `dragging` false, or a `dimensions` change with `resizing` false,
 *   for a node of the gesture ends it: its last asks' places are written, the keys that differ only
 *   (`place.x = ...`), each place an object of the view's layout as before, in one history.edit() with key null, in
 *   placesFor's words. So a gesture is one undo step, and one that ends where it began is none. The history then tells
 *   the store of the change, which projects the model as written: that projection reads the same as the gesture's
 *   last step, so its nodes are the same objects. `dragging` is false on every node after the end. A change of the
 *   history heard during a gesture (an undo by the keyboard mid-drag; not the store's own write) cancels it: the
 *   snapshot shows the model's projection, with no `dragging`, and every later step of that gesture (a position with
 *   `dragging` true, dimensions with `resizing` true) is ignored until its end (`dragging` false, `resizing` false),
 *   which writes nothing and clears the mark, so that the history keeps what Redo holds. While a gesture is open and
 *   not cancelled, every projection of the view (a view crossing FAR, say) draws with the gesture's places.
 * - React Flow's `remove`, `add` and `replace` changes, and `dimensions` with no `resizing` (React Flow measuring a
 *   node it was told the size of), change nothing: the model is changed only through the history.
 * - A view the model no longer holds, and a view of a kind no plane draws, have the empty snapshot.
 * - **Step 9: what is selected is the session's selection** (core/selection.ts; plan/swarm/step-9.md), no longer
 *   React Flow's own, kept view by view. A node carries `selected: true` when selectionOf(session).has('el', its id)
 *   and an edge when has('rel', its id), in every view that shows it; no other node or edge is selected. The store
 *   sets this after every projection and after every change of the selection it hears (selection.listen): a new
 *   object for each node or edge whose `selected` differs, in a new array, every other the object it was. A live
 *   store then tells its subscribers, once; a store with no subscriber sets it at its next getSnapshot(). A `select`
 *   change from React Flow picks nothing, ever. But React Flow has by then changed its own record of the nodes the
 *   change names (a click sets `selected` there before it tells), and it takes a node's record from the store again
 *   only with a new object. So each node or edge that a `select` change names, and that the projection holds, gets a
 *   new object that reads as the selection says, in a new array, and the subscribers are told once for the call;
 *   without this a later drag would move the boxes React Flow's records call selected, not the picked ones. A
 *   `select` change that names nothing the projection holds changes nothing and tells nobody.
 * - **Step 9: the marquee.** marquee(rect) picks what a rectangle covers, in the view's own units from the view's
 *   origin; the plane calls it at each move of React Flow's selection rectangle (plan/swarm/step-9.md). The nodes of
 *   the snapshot whose whole rectangle (the projection's `rects`) lies inside `rect`, its edges counting as inside,
 *   are picked as elements, in the snapshot's order; then the edges of the snapshot both of whose ends are among
 *   those nodes, as relationships, in the snapshot's order. It calls selectionOf(session).set() with that list, or
 *   with the view alone (`[{ type: 'view', id: viewId }]`) when no node is covered. So what is picked is what the
 *   rectangle covers at that moment and nothing else, and a rectangle that covers what the last one did tells
 *   nobody. An edge the snapshot leaves out (linesDrawn) is not picked.
 * - **Step 11** changes nothing in this file: a first end's mark is the plane's own (Plane.tsx).
 * - **A projection that throws** (a model the adapter cannot read) leaves the store showing what it showed, until
 *   the next change that can have altered its view projects again. It does not keep the session's other stores from
 *   hearing the change: each store hears it, and the first error is thrown on to the history, which reports it.
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
  /**
   * Calls `listener` when `drawn` changes: the view's kind became one a plane draws or stopped being one, or the view
   * left the model or came back. A watcher does not make the store live, so a hidden tab's plane watches for nothing.
   */
  watch(listener: () => void): () => void;
  /** The viewport to mount React Flow with, in a window `width` by `height`: the remembered one, or the fit. */
  camera(width: number, height: number): Viewport;
  /** Fits the view into the window now (the adapter's fit over the projection's bounds), remembers and returns it. */
  fit(width: number, height: number): Viewport;
  /** React Flow's onViewportChange: remembers the viewport, and that the view was placed by hand when it is not the fit's. */
  moved(viewport: Viewport): void;
  /** The plane has this size now: fits a view that is still as fitted again, and returns the viewport to set, or null. */
  sized(width: number, height: number): Viewport | null;
  /** React Flow's onNodesChange. */
  nodesChanged(changes: NodeChange<PlaneNode>[]): void;
  /** React Flow's onEdgesChange. */
  edgesChanged(changes: EdgeChange<PlaneEdge>[]): void;
  /** The marquee's rectangle now, in the view's own units from the view's origin: picks what it covers (step 9). */
  marquee(rect: { x: number; y: number; width: number; height: number }): void;
}

/** How far, in screen px, the pointer must go from where a drag or a resize began before it is a gesture and not a click. */
export const CLICK_DISTANCE = 4;

/** A gesture in progress: the projection it began from, what it has asked by node id, and the nodes React Flow drags. */
interface Gesture {
  readonly start: Projection;
  readonly asks: Map<string, Ask>;
  readonly dragging: Set<string>;
  /** Whether a step has gone CLICK_DISTANCE from the press: until then the press writes and draws nothing. */
  passed: boolean;
  /** Whether a change of the history was heard in the middle of it: its steps are ignored until its end. */
  cancelled: boolean;
}

const EMPTY: ViewSnapshot = { nodes: [], edges: [], far: false };
/** What a snapshot has for `edges` while the adapter's linesDrawn says no line is drawn. */
const NO_EDGES: PlaneEdge[] = [];

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
    session.history.listen((told) => {
      // Every store hears the change, whatever another store's projection does; the first error goes on to the history.
      let failed: { error: unknown } | null = null;
      for (const hear of [...made.hear.values()]) {
        try { hear(told); } catch (error) { failed ??= { error }; }
      }
      if (failed) throw failed.error;
    });
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

/** Whether two viewports are one: React Flow hands a viewport back as it was set, to the last bit or nearly. */
function sameViewport(a: Viewport, b: Viewport): boolean {
  return Math.abs(a.x - b.x) <= 0.01 && Math.abs(a.y - b.y) <= 0.01 && Math.abs(a.zoom - b.zoom) <= 0.000001;
}

function make(session: Session, viewId: string, hear: Map<string, Hear>): ViewStore {
  const listeners = new Set<() => void>();
  const watchers = new Set<() => void>();
  let projection: Projection | null = null;
  let snapshot: ViewSnapshot = EMPTY;
  let stale = true;
  let far = false;
  let viewport: Viewport | null = null;
  /** The viewport the last fit gave, while the view is as fitted; null once somebody has placed it by hand. */
  let fitted: Viewport | null = null;
  let projected = 0;
  let gesture: Gesture | null = null;

  const viewOf = () => session.model.views.find((view) => view.id === viewId);

  /** Makes the snapshot of the projection: the object it was while its nodes, edges and far are the same. */
  const adopt = (): void => {
    const p = projection;
    if (!p) { snapshot = EMPTY; return; }
    const edges = linesDrawn(p.nodes.length, p.far) ? p.edges : NO_EDGES;
    if (snapshot.nodes !== p.nodes || snapshot.edges !== edges || snapshot.far !== p.far) snapshot = { nodes: p.nodes, edges, far: p.far };
  };

  /** Projects again when stale. Returns whether the snapshot is a new object. */
  const refresh = (): boolean => {
    if (!stale && projection) return false;
    // Not stale from here on, even if the projection throws: the store then shows what it showed, and projects again
    // at the next change, not at the next read, which is React's render.
    stale = false;
    const before = snapshot;
    const view = viewOf();
    if (!view) {
      projection = null;
    } else {
      projected++;
      const open = gesture && gesture.passed && !gesture.cancelled ? gesture : null;
      if (open) {
        const { places } = placesFor(session.lib, session.model, view, open.start, [...open.asks.values()]);
        projection = dragged(projectStep(session.lib, session.model, view, open.start, places, { far, previous: projection }), open);
      } else {
        projection = project(session.lib, session.model, view, { far, previous: projection });
      }
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
    return fitNow(width, height);
  };

  const fitNow = (width: number, height: number): Viewport => {
    refresh();
    fitted = see(fit(projection ? projection.bounds : null, width, height));
    return fitted;
  };

  const moved = (next: Viewport): void => {
    if (fitted && !sameViewport(next, fitted)) fitted = null;
    see(next);
  };

  const sized = (width: number, height: number): Viewport | null => {
    if (!fitted) return null;
    refresh();
    const next = fit(projection ? projection.bounds : null, width, height);
    if (sameViewport(next, fitted)) return null;
    fitted = see(next);
    return fitted;
  };

  /** The projection with `dragging` taken off the nodes that have it; the projection itself when none has. */
  const undragged = (p: Projection): Projection => {
    if (!p.nodes.some((n) => n.dragging)) return p;
    return { ...p, nodes: p.nodes.map((n) => (n.dragging ? { ...n, dragging: false } : n)) };
  };

  /** The projection with `dragging: true` on the nodes React Flow drags in the gesture. */
  const dragged = (p: Projection, g: Gesture): Projection => {
    if (!p.nodes.some((n) => g.dragging.has(n.id) && !n.dragging)) return p;
    return { ...p, nodes: p.nodes.map((n) => (g.dragging.has(n.id) && !n.dragging ? { ...n, dragging: true } : n)) };
  };

  type View = NonNullable<ReturnType<typeof viewOf>>;

  /** Whether one of the steps is CLICK_DISTANCE screen px from where its node was at the press. */
  const crossed = (g: Gesture, steps: readonly Ask[]): boolean => {
    const zoom = viewport ? viewport.zoom : 1;
    for (const ask of steps) {
      const node = g.start.nodes.find((n) => n.id === ask.id);
      if (!node) continue;
      let gone = 0;
      if ('move' in ask) {
        gone = Math.max(Math.abs(ask.move.x - node.position.x), Math.abs(ask.move.y - node.position.y));
      } else {
        const r = ask.resize;
        gone = Math.max(Math.abs(r.x - node.position.x), Math.abs(r.y - node.position.y),
          Math.abs(r.width - (node.width ?? r.width)), Math.abs(r.height - (node.height ?? r.height)));
      }
      if (gone * zoom >= CLICK_DISTANCE) return true;
    }
    return false;
  };

  /** A step of the gesture: its asks worked out, the view projected with their places, the subscribers told. */
  const step = (view: View, g: Gesture): void => {
    if (!projection) return;
    const { places } = placesFor(session.lib, session.model, view, g.start, [...g.asks.values()]);
    projection = dragged(projectStep(session.lib, session.model, view, g.start, places, { far, previous: projection }), g);
    adopt();
    tell();
  };

  /** The gesture's end: its last asks' places written as one undo step in placesFor's words, or nothing written. */
  const finish = (view: View, g: Gesture): void => {
    gesture = null;
    if (!projection) return;
    projection = undragged(projection);
    const { places, words } = placesFor(session.lib, session.model, view, g.start, [...g.asks.values()]);
    let touched = null;
    if (words !== null) {
      // The gesture is over before its end is written (`gesture` is null above), so the history's telling of this
      // write is not taken for a change heard in the middle of one.
      touched = session.history.edit(() => {
        const written = session.model.views.find((v) => v.id === viewId);
        if (!written) return undefined;
        for (const [id, place] of places) {
          const lay = written.layout[id] as unknown as Record<string, unknown> | undefined;
          if (!lay) { written.layout[id] = { ...place } as never; continue; }
          for (const [key, value] of Object.entries(place)) if (lay[key] !== value) lay[key] = value;
        }
        return words;
      }, null);
    }
    if (!touched) {
      // Nothing written: the model's own projection takes the place of the gesture's last step.
      stale = true;
      refresh();
      adopt();
      tell();
    }
  };

  const nodesChanged = (changes: NodeChange<PlaneNode>[]): void => {
    refresh();
    if (!projection) return;
    const chosen = selected(projection.nodes, changes);
    if (chosen) {
      projection = { ...projection, nodes: chosen };
      adopt();
    }
    const view = viewOf();
    // The nodes this array resizes: a position with no `dragging` is a resize's only beside such a dimensions change.
    const steps: Ask[] = [];
    const draggedNow: string[] = [];
    const ends: Ask[] = [];
    let ended = false;
    for (const c of changes) {
      if (c.type === 'position' && c.position) {
        if (c.dragging === true) { if (!gesture?.cancelled) { steps.push({ id: c.id, move: c.position }); draggedNow.push(c.id); } }
        else if (c.dragging === false && gesture?.dragging.has(c.id)) { ends.push({ id: c.id, move: c.position }); ended = true; }
      } else if (c.type === 'dimensions' && c.resizing === false && gesture?.asks.has(c.id)) {
        ended = true;
      } else if (c.type === 'dimensions' && c.resizing === true && c.dimensions) {
        if (gesture?.cancelled) continue;
        const own = changes.find((o) => o.type === 'position' && o.id === c.id && o.dragging === undefined);
        const before = gesture?.asks.get(c.id);
        const was = before && 'resize' in before ? before.resize : null;
        const first = (gesture ? gesture.start : projection).nodes.find((n) => n.id === c.id)?.position;
        const from = own && own.type === 'position' && own.position ? own.position : was ?? first;
        if (from) steps.push({ id: c.id, resize: { x: from.x, y: from.y, width: c.dimensions.width, height: c.dimensions.height } });
      }
    }
    if (!view || (steps.length === 0 && !ended)) {
      if (chosen) tell();
      return;
    }
    if (!gesture) {
      if (steps.length === 0) { if (chosen) tell(); return; }
      gesture = { start: projection, asks: new Map(), dragging: new Set(), passed: false, cancelled: false };
    }
    if (gesture.cancelled) {
      // An undo (or another change of the history) was heard in the middle of it: only its end is heard.
      if (ended) gesture = null;
      if (chosen) tell();
      return;
    }
    for (const ask of steps) gesture.asks.set(ask.id, ask);
    for (const id of draggedNow) gesture.dragging.add(id);
    if (ended) {
      if (!gesture.passed) {
        // A press that never went CLICK_DISTANCE from where it began: a click, which writes and draws nothing.
        gesture = null;
        if (chosen) tell();
        return;
      }
      for (const ask of ends) gesture.asks.set(ask.id, ask);
      finish(view, gesture);
    } else {
      if (!gesture.passed && crossed(gesture, steps)) gesture.passed = true;
      if (gesture.passed) step(view, gesture);
      else if (chosen) tell();
    }
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

  const drawnNow_ = (): boolean => { const view = viewOf(); return !!view && isDrawn(session.lib, view.kind); };
  let drawnWas = drawnNow_();
  const watch = (listener: () => void): (() => void) => {
    watchers.add(listener);
    return () => { watchers.delete(listener); };
  };

  hear.set(viewId, (told) => {
    if (told.by === 'end') return;
    let cancelling = false;
    if (gesture && !gesture.cancelled) {
      // Heard in the middle of a gesture (an undo by the keyboard): it is cancelled, and its steps ignored until its end.
      gesture.cancelled = true;
      cancelling = true;
      if (projection) projection = undragged(projection);
    }
    const now = drawnNow_();
    if (now !== drawnWas) {
      drawnWas = now;
      stale = true;
      for (const watcher of [...watchers]) watcher();
    }
    if (!cancelling && told.views !== null && !told.views.includes(viewId)) return;
    stale = true;
    if (listeners.size > 0 && refresh()) tell();
  });

  return {
    session,
    viewId,
    get drawn() { return drawnNow_(); },
    get notDrawn() { const view = viewOf(); return view ? notDrawnText(session.lib, view.kind) : 'This view is not in the model.'; },
    get projected() { return projected; },
    subscribe,
    getSnapshot,
    watch,
    camera,
    fit: fitNow,
    moved,
    sized,
    nodesChanged,
    edgesChanged,
    marquee: () => { throw new Error('ViewStore.marquee: step 9 builds it'); },
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
