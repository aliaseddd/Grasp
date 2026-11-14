// What both candidates stand on: one view's state outside React (as plane/viewStore.ts keeps it on the page). It
// holds the model, the picked ids, the marks, the camera and the gesture in progress, lays the view out with the
// shared rule, and keeps a log of the hits and of the gestures' ends for run.cjs to read.

import { at, layout, write } from './layout.js';

export const MIN_ZOOM = 0.02;
export const MAX_ZOOM = 4;
const FIT_PAD = 40;

/** The camera that shows the bounds whole in a window, at most at scale 1: centred sideways, from the top. */
export function fit(bounds, width, height) {
  if (!bounds || !bounds.w || !bounds.h || !width || !height) return { x: FIT_PAD, y: FIT_PAD, zoom: 1 };
  const zoom = Math.max(MIN_ZOOM, Math.min(1, (width - 2 * FIT_PAD) / bounds.w, (height - 2 * FIT_PAD) / bounds.h));
  return { x: Math.round((width - bounds.w * zoom) / 2 - bounds.x * zoom), y: FIT_PAD, zoom };
}

export function makeStore(M, made) {
  const { model, viewId } = made;
  const view = model.views.find((v) => v.id === viewId);
  const listeners = new Set();
  const cameraListeners = new Set();
  let data = null;
  let last = null;
  let step = null;
  let picked = new Set();
  let marks = { by: new Map(Object.entries(made.marks.by)), free: made.marks.free };
  let camera = null;
  const tell = () => { for (const fn of [...listeners]) fn(); };
  const store = {
    M, model, view,
    /** Every click: { type, id, at, add, where }, `where` the reader's answer for the point. */
    hits: [],
    /** Every gesture's end: the layout's `result`, with the words of what was written (null: nothing). */
    results: [],
    /** How long each layout took, in ms. */
    layouts: [],
    /** What React Flow's connecting joined (candidate A with ?connect=1), and where each such drag ended. */
    connects: [],
    connectEnds: [],
    /** The reader's answer for a point of the view. */
    at: (point) => at(store.data(), point),
    subscribe(fn) { listeners.add(fn); return () => { listeners.delete(fn); }; },
    /** The view laid out, as the gesture in progress leaves it: the same object until something changes. */
    data() {
      if (!data) {
        const t = performance.now();
        data = layout(M, model, view, step, last);
        store.layouts.push(performance.now() - t);
        last = data;
      }
      return data;
    },
    picked: () => picked,
    marks: () => marks,
    select(ids, add = false) {
      const next = new Set(add ? picked : []);
      for (const id of ids) { if (add && picked.has(id)) next.delete(id); else next.add(id); }
      picked = next;
      tell();
    },
    setMarks(next) { marks = { by: new Map(Object.entries(next.by)), free: next.free }; tell(); },
    /** A step of a gesture: nothing is written. */
    step(next) { step = next; data = null; tell(); },
    stepping: () => step,
    /** The gesture's end: its result is written to the model and logged, once. */
    end() {
      const result = store.data().result;
      step = null;
      data = null;
      const words = result ? write(M, model, view, result) : null;
      store.results.push({ ...result, words });
      tell();
      return result;
    },
    cancel() { if (step) { step = null; data = null; tell(); } },
    /** A click, already told apart by the body: logged with the reader's answer, and picked as the page picks. */
    hit(h) {
      store.hits.push({ ...h, where: at(store.data(), h.at) });
      if (h.type === 'ground') store.select([]); else store.select([h.id], h.add);
    },
    /** The camera the view was last seen with; the first time, the fit into the window. */
    camera(width, height) {
      if (!camera) camera = fit(store.data().bounds, width, height);
      return camera;
    },
    hasCamera: () => !!camera,
    /** The body moved the camera (a pan, a zoom). */
    moved(next) { camera = { x: next.x, y: next.y, zoom: next.zoom }; },
    /** Somebody else sets the camera: the mounted body is told. */
    setCamera(next) { store.moved(next); for (const fn of [...cameraListeners]) fn(camera); },
    onCamera(fn) { cameraListeners.add(fn); return () => { cameraListeners.delete(fn); }; },
    /** How large the view wants to be (contract 6, duty 6). */
    size: () => store.data().size,
  };
  return store;
}
