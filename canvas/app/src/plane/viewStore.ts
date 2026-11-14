// A view's store: one view's state outside React (plan/slice-1.md, section 3; plan/notes.md, session 17, "The
// architecture", and session 20, "Step 6: the outline, part 2"). Dockview takes a hidden tab's body out of the
// document and its plane unmounts React Flow; the store keeps what the tab must find again: the view's projection,
// its camera, far or near, and which of its nodes and lines the session's selection names. React reads it through useSyncExternalStore.
//
// It knows no React, no Dockview and no DOM, how no node looks, and no rule of place or size: those are the
// adapter's (core/adapter.ts) and, for a graph body of another renderer, its kind's reader's (core/readers), which it
// calls. It imports React Flow's types only, so Node tests load it (canvas/app/test/core.mjs).
//
// From the scaffold of slice 2 on, package 2-5 owns this file (plan/slice-2.md, section 3).

import type { EdgeChange, NodeChange } from '@xyflow/react';
import {
  elementOf, enderOf, FAR, fit, graphBodied, hasReader, linesDrawn, marksOf, NO_MARKS, notDrawnText, placesFor, project, projectStep, readerOf,
  relationshipOf, rendererOf, saysOf, selectionOf,
} from '../core';
import type { Ask, Listed, ModelView, Picked, PlaneEdge, PlaneNode, Projection, Reader, Session, Told, Viewport } from '../core';

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
 * - **React Flow's changes: select.** They pick nothing (see "Step 9" below): React Flow's own record of the nodes
 *   and lines a `select` change names has changed by then, and the store answers with a new object for each of them
 *   that the projection holds, reading as the selection says.
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
 *   and an edge when has('rel', its id), in every view that shows it; no other node or edge is selected. A selected
 *   edge, and no other, carries `zIndex` SELECTED_LINE_Z beside `selected` (slice 2), so that a picked line is drawn
 *   over the boxes it crosses and its two end grips (plane/nodes/Grips.tsx, EndGrips) can be pressed where an end
 *   lies on a node or under another line; the zIndex goes when the edge is no longer selected. The store gives the
 *   lines of a picked box none (the plane does not set React Flow's elevateEdgesOnSelect, which would raise them
 *   all); React Flow itself still draws a line that ends on a nested node at that node's z, which is 1000 and more
 *   while the node is picked (elevateNodesOnSelect), as in slice 1. A reader gives an edge no zIndex: it is the
 *   store's. The store
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
 *
 * Slice 2 (plan/slice-2.md, section 4, seams 3, 4 and 5), built by its scaffold:
 *
 * - **Who a node is.** A node says its element in `data.element` (elementOf), which is null for a node that stands
 *   for none, and two nodes can name one element. An edge says its relationship (relationshipOf). The store sets
 *   `selected` and the marks by those, never by a node's or an edge's id: a node is selected when its element is
 *   picked, and a node with no element is never selected and never marked.
 * - **The marks** (seam 4), beside `selected`: each node carries `data.marks`, the very object
 *   marksOf(session).of('el', its element) gives (NO_MARKS for a node with no element), and each edge
 *   of('rel', its relationship). The store sets them after every projection and after every change of the marks it
 *   hears: a new object only for a node or an edge whose marks or `selected` differ, with a new `data` only where the
 *   marks differ, in a new array, every other the object it was. A change of the marks that changes a node of the
 *   snapshot tells the subscribers once. **Live or idle**: the store listens to marksOf(session) only while it has a
 *   subscriber itself. So the marks, and through them the checks, are live while a plane is shown, and a hidden tab
 *   runs no check. Marks that changed while nobody listened are set at the first read after the next subscription.
 * - **A graph body of another renderer** (seam 3: the sequence view, the geometry view), told by graphBodied() and
 *   readerOf() of core/readers. What differs from a view of the four graph kinds:
 *   - **The projection** is the kind's reader's: `reader.read(lib, model, view, { far, previous })`, which gives a
 *     Projection. It carries no `read`, and never goes through projectStep.
 *   - **Which nodes a drag moves**: only the node the press named. dragStarted(nodeId) is React Flow's
 *     onNodeDragStart, which comes before the first step; React Flow drags every selected node, and the store leaves
 *     the changes of every other node out, so the others stay where the reader puts them. A gesture whose press was
 *     not named takes the first node its first step reports as dragged. In a view of the four graph kinds
 *     dragStarted changes nothing: every node React Flow reports moves, as before.
 *   - **A step** is `reader.step(start, asks)`: the projection of that step, from the projection the gesture began
 *     from and what React Flow asks of the pressed node. The reader holds the node to what its kind allows. A reader
 *     with no step() draws no step. When the view crosses FAR during the gesture, the steps go on from the reader's
 *     far (or near) projection of the model.
 *   - **The gesture's end** is `enderOf(renderer)(session, viewId, start, asks)`, a function of
 *     core/actions/<renderer>.ts, with the projection the gesture began from and the asks of the pressed node at the
 *     release. It writes through history.edit() and answers with what it touched; the store then shows the model as
 *     written. A sentence (`{ refused }`) is said, saysOf(session).say(sentence), and the store shows the model's own
 *     projection again, as it does after an end that wrote nothing (null, and a renderer with no ender).
 *   - **A marquee** picks the things whose rectangle, as the reader's `listed(projection)` gives it, lies whole
 *     inside the rectangle: elements and relationships alike, each once, in the order they are listed; a thing with
 *     no rectangle is never picked, and a line is left out while the snapshot draws no lines.
 * - **The marquee of a view of the four graph kinds** is as step 9 has it, by each node's element: a node with no
 *   element is left out.
 * - **A view whose body is a component** (a grid view, a browser view: graphBodied() is false) has the empty
 *   snapshot, whatever its reader: such a reader gives no Projection, and the store never asks it. `drawn` is still
 *   whether a body draws the view.
 * - **preview(next)** draws a step that is no node's drag (a message moved by its line, which React Flow does not
 *   report): the store shows `next`, with `selected` and the marks set as on any projection, tells its subscribers
 *   when the snapshot is new, and writes nothing. preview(null) puts the model's projection back. A change of the
 *   history the store hears, and a view crossing FAR, put the model's projection back by themselves; the gesture's
 *   next step draws its preview again.
 * - **`zoom`** is the zoom of the viewport last seen, 1 before any. watchZoom(listener) calls listener whenever it
 *   changes, and never for a pan. A watcher does not make the store live.
 * - **Package 2-5** (a box moved into another owner) builds here: it asks core/actions/reparent.ts at a step and at
 *   the end. The box a dragged box would land in is outlined when its node's `className` holds the word `landing`
 *   beside the adapter's words (plane/nodes/grips.css draws it).
 */
export interface ViewStore {
  readonly session: Session;
  readonly viewId: string;
  /** Whether a body draws this view's kind (hasReader of core/readers). When false the tab shows the card. */
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
  /** React Flow's onNodeDragStart: the node the press named. In a graph body of another renderer only that node moves. */
  dragStarted(nodeId: string): void;
  /** Draws a step that is no node's drag, and writes nothing; null puts the model's projection back. */
  preview(next: Projection | null): void;
  /** The zoom of the viewport last seen; 1 before any. */
  readonly zoom: number;
  /** Calls `listener` whenever `zoom` changes, never for a pan, and returns what stops it. */
  watchZoom(listener: () => void): () => void;
}

/** How far, in screen px, the pointer must go from where a drag or a resize began before it is a gesture and not a click. */
export const CLICK_DISTANCE = 4;

/** How a view is read: by the adapter (`reader` null), or by the reader of another renderer whose body is a graph body. */
interface How {
  readonly renderer: string;
  readonly reader: Reader<Projection> | null;
}

/** A gesture in progress: the projection it began from, what it has asked by node id, and the nodes React Flow drags. */
interface Gesture {
  readonly start: Projection;
  /** For another renderer: the projection its steps go on from. It is `start` until the view crosses FAR. */
  base: Projection;
  /** How the view was read when the gesture began. */
  readonly how: How;
  /** For another renderer: the one node the gesture moves, which the press named. Null in a view of the graph kinds. */
  readonly only: string | null;
  readonly asks: Map<string, Ask>;
  readonly dragging: Set<string>;
  /** Whether a step has gone CLICK_DISTANCE from the press: until then the press writes and draws nothing. */
  passed: boolean;
  /** Whether a change of the history was heard in the middle of it: its steps are ignored until its end. */
  cancelled: boolean;
}

const EMPTY: ViewSnapshot = { nodes: [], edges: [], far: false };
/** How a view of the four graph kinds is read: by the adapter itself. */
const GRAPH: How = { renderer: 'graph', reader: null };
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

/**
 * The zIndex the store gives a selected edge, and no other (see "Step 9" of ViewStore's comment): over every node,
 * a picked box too, which React Flow raises by 1000 (elevateNodesOnSelect), and its nested boxes one above it; and
 * under a line's marks, which marks.css puts at 1500. React Flow adds to it the z of an end node that is nested in
 * another (getElevatedEdgeZIndex).
 */
export const SELECTED_LINE_Z = 1100;

/** A node that reads as `is` says of its `selected`. */
const nodeAs = <T extends Item>(node: T, is: boolean): T => ({ ...node, selected: is });

/** An edge that reads as `is` says of its `selected`, with SELECTED_LINE_Z while selected and no zIndex otherwise. */
function edgeAs(edge: PlaneEdge, is: boolean): PlaneEdge {
  const { zIndex: _was, ...rest } = edge;
  return is ? { ...rest, selected: true, zIndex: SELECTED_LINE_Z } : { ...rest, selected: false };
}

/**
 * The list with a new object for each item a `select` change names, reading as `says` says of that item: a new array;
 * null when the changes name no item of the list. `as` makes an item that reads as selected or not.
 */
function renewed<T extends Item>(list: T[], changes: readonly Select[], says: (item: T) => boolean, as: (item: T, is: boolean) => T): T[] | null {
  let out: T[] | null = null;
  for (const change of changes) {
    if (change.type !== 'select' || change.id === undefined) continue;
    const current: T[] = out ?? list;
    const at = current.findIndex((item) => item.id === change.id);
    if (at < 0) continue;
    out ??= [...list];
    const is = says(current[at]);
    // A copy that reads as the selection says: `selected` is written only where it would otherwise differ.
    out[at] = (current[at].selected ?? false) === is ? { ...current[at] } : as(current[at], is);
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
  const selection = selectionOf(session);
  const marks = marksOf(session);
  /** What takes the store's listener off the marks, while the store has a subscriber. */
  let stopMarks: (() => void) | null = null;
  /**
   * Whether the nodes' and lines' `selected` and marks may differ from what the selection and the marks say: set by a
   * change of the selection that a stale or hidden store heard, and when the store begins to listen to the marks.
   */
  let outdated = false;
  const zoomWatchers = new Set<() => void>();
  /** The node the last press named (React Flow's onNodeDragStart), until its gesture ends. */
  let pressed: string | null = null;
  /** Whether the projection is a preview's, not the model's. */
  let previewing = false;
  /** What the reader of another renderer lists of the projection, for the marquee: worked out when first asked for. */
  let listed: Listed[] | null = null;

  const viewOf = () => session.model.views.find((view) => view.id === viewId);
  /** How a view is read; null for a kind with no reader yet, and for one whose body is a component: nothing to project. */
  const howOf = (view: ModelView): How | null => {
    const renderer = rendererOf(session.lib, view.kind);
    if (renderer === null || !graphBodied(renderer)) return null;
    if (renderer === 'graph') return GRAPH;
    const reader = readerOf(renderer) as Reader<Projection> | null;
    return reader ? { renderer, reader } : null;
  };
  const picked = (node: PlaneNode): boolean => { const el = elementOf(node); return el !== null && selection.has('el', el); };
  const pickedEdge = (edge: PlaneEdge): boolean => selection.has('rel', relationshipOf(edge));

  /** Makes the snapshot of the projection: the object it was while its nodes, edges and far are the same. */
  const adopt = (): void => {
    const p = projection;
    if (!p) { snapshot = EMPTY; return; }
    const edges = linesDrawn(p.nodes.length, p.far) ? p.edges : NO_EDGES;
    if (snapshot.nodes !== p.nodes || snapshot.edges !== edges || snapshot.far !== p.far) snapshot = { nodes: p.nodes, edges, far: p.far };
  };

  /**
   * Sets `selected` and the marks on the projection's nodes and edges as the selection and the marks say: a new object
   * for each that differs, with a new `data` only where its marks differ, in a new array, every other the object it
   * was. Nothing is replaced when nothing differs.
   */
  const mark = (): void => {
    outdated = false;
    const p = projection;
    if (!p) return;
    let nodes: PlaneNode[] | null = null;
    p.nodes.forEach((n, i) => {
      const el = elementOf(n);
      const is = el !== null && selection.has('el', el);
      const now = el !== null ? marks.of('el', el) : NO_MARKS;
      const same = (n.selected ?? false) === is;
      if (same && n.data.marks === now) return;
      nodes ??= [...p.nodes];
      const data = n.data.marks === now ? n.data : { ...n.data, marks: now };
      nodes[i] = same ? { ...n, data } : { ...n, selected: is, data };
    });
    let edges: PlaneEdge[] | null = null;
    p.edges.forEach((e, i) => {
      const rel = relationshipOf(e);
      const is = selection.has('rel', rel);
      const now = marks.of('rel', rel);
      const same = (e.selected ?? false) === is;
      if (same && e.data.marks === now) return;
      edges ??= [...p.edges];
      const data = e.data.marks === now ? e.data : { ...e.data, marks: now };
      edges[i] = same ? { ...e, data } : { ...edgeAs(e, is), data };
    });
    if (nodes || edges) projection = { ...p, nodes: nodes ?? p.nodes, edges: edges ?? p.edges };
  };

  /** Projects again when stale. Returns whether the snapshot is a new object. */
  const refresh = (): boolean => {
    if (!stale && projection) return false;
    // Not stale from here on, even if the projection throws: the store then shows what it showed, and projects again
    // at the next change, not at the next read, which is React's render.
    stale = false;
    previewing = false;
    listed = null;
    const before = snapshot;
    const view = viewOf();
    const how = view ? howOf(view) : null;
    if (!view || !how) {
      projection = null;
    } else {
      projected++;
      const open = gesture && gesture.passed && !gesture.cancelled ? gesture : null;
      if (how.reader) {
        // A graph body of another renderer: its reader's projection, and for an open gesture its reader's step.
        const reader = how.reader;
        if (open && reader.step) {
          open.base = reader.read(session.lib, session.model, view, { far, previous: open.base });
          projection = dragged(reader.step(open.base, [...open.asks.values()]), open);
        } else {
          projection = reader.read(session.lib, session.model, view, { far, previous: projection });
        }
      } else if (open) {
        const { places } = placesFor(session.lib, session.model, view, open.start, [...open.asks.values()]);
        projection = dragged(projectStep(session.lib, session.model, view, open.start, places, { far, previous: projection }), open);
      } else {
        projection = project(session.lib, session.model, view, { far, previous: projection });
      }
    }
    mark();
    adopt();
    return snapshot !== before;
  };

  const tell = (): void => { for (const listener of [...listeners]) listener(); };

  /**
   * Remembers a viewport. When it crosses FAR, the view is far or near from then on, and a live store tells. When its
   * zoom is another than the one before, whoever watches the zoom is told.
   */
  const see = (next: Viewport): Viewport => {
    const was = viewport ? viewport.zoom : 1;
    const seen = { x: next.x, y: next.y, zoom: next.zoom };
    viewport = seen;
    const now = next.zoom < FAR;
    if (now !== far) {
      far = now;
      stale = true;
      if (listeners.size > 0 && refresh()) tell();
    }
    if (next.zoom !== was) for (const watcher of [...zoomWatchers]) watcher();
    return seen;
  };

  const getSnapshot = (): ViewSnapshot => {
    refresh();
    if (outdated) { mark(); adopt(); }
    return snapshot;
  };

  /** A change of the marks, heard while the store has a subscriber: they are set, and the subscribers told when a node or an edge is new. */
  const marksChanged = (): void => {
    if (stale || !projection) { outdated = true; return; }
    const before = snapshot;
    mark();
    adopt();
    if (snapshot !== before) tell();
  };

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    if (!stopMarks) {
      // Live from here: the marks are worked out before listen() returns, and nobody is told for it; the subscriber
      // reads next, and that read sets them.
      stopMarks = marks.listen(marksChanged);
      outdated = true;
    }
    return () => {
      if (!listeners.delete(listener) || listeners.size > 0 || !stopMarks) return;
      const stop = stopMarks;
      stopMarks = null;
      stop();
    };
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

  /**
   * A step of the gesture: its asks worked out, the view projected with their places, the subscribers told. In a
   * graph body of another renderer the step is its reader's.
   */
  const step = (view: View, g: Gesture): void => {
    if (!projection) return;
    if (g.how.reader) {
      if (!g.how.reader.step) return;
      projection = dragged(g.how.reader.step(g.base, [...g.asks.values()]), g);
      previewing = false;
      listed = null;
    } else {
      const { places } = placesFor(session.lib, session.model, view, g.start, [...g.asks.values()]);
      projection = dragged(projectStep(session.lib, session.model, view, g.start, places, { far, previous: projection }), g);
    }
    mark();
    adopt();
    tell();
  };

  /** Shows the model's own projection in place of a gesture's last step, or of a preview. */
  const showModel = (): void => {
    const before = snapshot;
    stale = true;
    refresh();
    adopt();
    if (snapshot !== before) tell();
  };

  /**
   * The gesture's end: its last asks' places written as one undo step in placesFor's words, or nothing written. In a
   * graph body of another renderer the end is its kind's ender's, which writes or says why not.
   */
  const finish = (view: View, g: Gesture): void => {
    gesture = null;
    pressed = null;
    if (!projection) return;
    projection = undragged(projection);
    if (g.how.reader) {
      // The gesture is over before its end is written, as below. What the ender wrote reaches the store through the
      // history; when nothing did (a refusal, an end where it began, a renderer with no ender), the model's own
      // projection takes the place of the gesture's last step.
      const ender = enderOf(g.how.renderer);
      const before = projected;
      const result = ender ? ender(session, viewId, g.start, [...g.asks.values()]) : null;
      if (result && 'refused' in result) saysOf(session).say(result.refused);
      if (projected === before) {
        stale = true;
        refresh();
        adopt();
        tell();
      }
      return;
    }
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
    const chosen = renewed(projection.nodes, changes, picked, nodeAs);
    if (chosen) {
      projection = { ...projection, nodes: chosen };
      adopt();
    }
    const view = viewOf();
    // In a graph body of another renderer only one node moves: the one the press named, or, when no press was named,
    // the first this gesture's first step reports as dragged. `only` is null in a view of the graph kinds.
    const how = gesture ? gesture.how : view ? howOf(view) : null;
    let only: string | null = null;
    if (how && how.reader) {
      const first = changes.find((c) => c.type === 'position' && c.dragging === true);
      only = gesture ? gesture.only : pressed ?? (first && first.type === 'position' ? first.id : null);
    }
    // The nodes this array resizes: a position with no `dragging` is a resize's only beside such a dimensions change.
    const steps: Ask[] = [];
    const draggedNow: string[] = [];
    const ends: Ask[] = [];
    let ended = false;
    for (const c of changes) {
      if (only !== null && (c.type === 'position' || c.type === 'dimensions') && c.id !== only) continue;
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
      if (steps.length === 0 || !how) { if (chosen) tell(); return; }
      gesture = { start: projection, base: projection, how, only, asks: new Map(), dragging: new Set(), passed: false, cancelled: false };
    }
    if (gesture.cancelled) {
      // An undo (or another change of the history) was heard in the middle of it: only its end is heard.
      if (ended) { gesture = null; pressed = null; }
      if (chosen) tell();
      return;
    }
    for (const ask of steps) gesture.asks.set(ask.id, ask);
    for (const id of draggedNow) gesture.dragging.add(id);
    if (ended) {
      if (!gesture.passed) {
        // A press that never went CLICK_DISTANCE from where it began: a click, which writes and draws nothing.
        gesture = null;
        pressed = null;
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
    const edges = renewed(projection.edges, changes, pickedEdge, edgeAs);
    if (!edges) return;
    projection = { ...projection, edges };
    adopt();
    tell();
  };

  const drawnNow_ = (): boolean => { const view = viewOf(); return !!view && hasReader(session.lib, view.kind); };
  let drawnWas = drawnNow_();
  const watch = (listener: () => void): (() => void) => {
    watchers.add(listener);
    return () => { watchers.delete(listener); };
  };

  const marquee = (rect: { x: number; y: number; width: number; height: number }): void => {
    refresh();
    const covered: Picked[] = [];
    const within = (r: { x: number; y: number; w: number; h: number }): boolean => (
      r.x >= rect.x && r.y >= rect.y && r.x + r.w <= rect.x + rect.width && r.y + r.h <= rect.y + rect.height
    );
    const view = viewOf();
    const how = view ? howOf(view) : null;
    if (projection && how && how.reader) {
      // Another renderer: the things whose rectangle, as its reader lists it, lies inside. A message between two
      // lifelines has no node of its own, so a line is picked by its own rectangle and not by its two ends.
      listed ??= how.reader.listed(projection);
      const seen = new Set<string>();
      for (const thing of listed) {
        if (!thing.rect || !within(thing.rect) || (thing.type === 'rel' && snapshot.edges === NO_EDGES)) continue;
        const key = `${thing.type}:${thing.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        covered.push({ type: thing.type, id: thing.id });
      }
    } else if (projection) {
      const { rects } = projection;
      const inside = new Set<string>();
      for (const node of snapshot.nodes) {
        const el = elementOf(node);
        const r = rects.get(node.id);
        if (el !== null && r && within(r)) {
          inside.add(node.id);
          covered.push({ type: 'el', id: el });
        }
      }
      if (inside.size > 0) {
        for (const edge of snapshot.edges) if (inside.has(edge.source) && inside.has(edge.target)) covered.push({ type: 'rel', id: relationshipOf(edge) });
      }
    }
    selection.set(covered.length > 0 ? covered : [{ type: 'view', id: viewId }]);
  };

  const dragStarted = (nodeId: string): void => { pressed = nodeId; };

  const preview = (next: Projection | null): void => {
    if (next === null) {
      if (previewing) showModel();
      return;
    }
    const before = snapshot;
    projection = next;
    stale = false;
    previewing = true;
    listed = null;
    mark();
    adopt();
    if (snapshot !== before) tell();
  };

  const watchZoom = (listener: () => void): (() => void) => {
    zoomWatchers.add(listener);
    return () => { zoomWatchers.delete(listener); };
  };

  // Every change of the selection: a live store marks its nodes and lines and tells once if the snapshot is new; a
  // store with no subscriber only notes that its marks are out of date.
  selection.listen(() => {
    if (listeners.size === 0) { outdated = true; return; }
    const before = snapshot;
    mark();
    adopt();
    if (snapshot !== before) tell();
  });

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
    marquee,
    dragStarted,
    preview,
    get zoom() { return viewport ? viewport.zoom : 1; },
    watchZoom,
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
