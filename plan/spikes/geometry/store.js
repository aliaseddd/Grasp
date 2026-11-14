// One geometry view's state outside React, shared by both candidates: the layout, the picked ids, the marks, the
// camera, and the drag in progress. It stands for what the page's view store (plane/viewStore.ts), selection and
// history would hold. It knows no DOM and no React.

import { fit, layOut, movedBy, readView } from './layout.js';

export function makeStore(M, model, viewId, marks) {
  const viewOf = () => model.views.find((v) => v.id === viewId);
  let read = readView(M, model, viewOf());
  let L = layOut(read, null, null);
  let selection = new Set();
  let snapshot = { L, selection, marks };
  const listeners = new Set();
  const tell = () => { snapshot = { L, selection, marks }; for (const l of [...listeners]) l(); };
  /** A drag in progress: the layout it began from, and the positions it asks so far. Nothing is written until its end. */
  let gesture = null;
  let camera = null;
  const watchers = new Set();

  const store = {
    M, model, viewId,
    /** Every click the body reported, and every drag's final result: for the script that tests the spike. */
    hits: [],
    results: [],
    /** What a click does. The default picks; the test sets null to see that a body picks nothing by itself. */
    onHit: (hit) => {
      if (hit.type !== 'el') { if (!hit.add) store.select([]); return; }
      if (!hit.add) store.select([hit.id]);
      else store.select(selection.has(hit.id) ? [...selection].filter((id) => id !== hit.id) : [...selection, hit.id]);
    },
    /** What the mounted body offers its host: setCamera(camera). */
    host: null,
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getSnapshot() { return snapshot; },
    get layout() { return L; },
    get dragging() { return gesture !== null; },

    /** A step of a drag: each ask is { id, dx, dy }, how far the footprint went from where it began, in the view's units. */
    step(asks) {
      if (!gesture) gesture = { start: L, moves: new Map() };
      const asked = new Set(asks.map((a) => a.id));
      for (const ask of asks) {
        // A footprint asked together with one that holds it moves with that one, and keeps its own position.
        let up = gesture.start.byId.get(ask.id);
        let held = false;
        while (up && up.parent !== null) { if (asked.has(up.parent)) { held = true; break; } up = gesture.start.byId.get(up.parent); }
        if (!held && gesture.start.byId.has(ask.id)) gesture.moves.set(ask.id, movedBy(gesture.start, ask.id, ask.dx, ask.dy));
      }
      const next = layOut(read, gesture.moves, L);
      if (next !== L) { L = next; tell(); }
    },
    /** The drag's end: its last positions are written to the model, and reported once. */
    end() {
      if (!gesture) return null;
      const moved = [];
      for (const [id, to] of gesture.moves) {
        const el = model.elements.find((e) => e.id === id);
        const from = gesture.start.byId.get(id);
        if (!el || (from.posX === to.posX && from.posY === to.posY)) continue;
        el.posX = to.posX;
        el.posY = to.posY;
        moved.push({ id, posX: to.posX, posY: to.posY, unit: from.unit });
      }
      gesture = null;
      read = readView(M, model, viewOf());
      const next = layOut(read, null, L);
      const result = { moved };
      store.results.push(result);
      L = next;
      tell();
      return result;
    },
    cancel() {
      if (!gesture) return;
      gesture = null;
      L = layOut(read, null, L);
      tell();
    },
    click(hit) { store.hits.push(hit); if (store.onHit) store.onHit(hit); },
    select(ids) { selection = new Set(ids); tell(); },
    setMarks(next) { marks = next; tell(); },
    /** The model was changed from outside (a dimension set in a panel): read it again. */
    changed() { read = readView(M, model, viewOf()); L = layOut(read, null, L); tell(); },

    /** The camera to mount with, in a window width by height: the one last seen, or the fit. */
    cameraFor(width, height) { if (!camera) camera = fit(L.bounds, width, height); return camera; },
    get camera() { return camera; },
    /** The body's camera changed (React Flow's onViewportChange; the component body's own pan and zoom). */
    moved(next) { camera = { x: next.x, y: next.y, zoom: next.zoom }; for (const w of [...watchers]) w(); },
    watch(listener) { watchers.add(listener); return () => { watchers.delete(listener); }; },
    /** How large the view's content is: its bounds, axes and scale bar included. */
    sizeOf() { return { width: L.bounds.w, height: L.bounds.h, bounds: L.bounds }; },
  };
  return store;
}
