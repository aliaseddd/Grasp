// What a spike page starts with: the model the address asks for, the store, and window.Spike, which run.cjs drives.
//
//   ?data=synthetic[&lifelines=20&messages=300]   the synthetic view instead of the fixture
//   ?camera=x,y,zoom                               the camera to begin with instead of the fit
//   ?later=1                                       do not mount: run.cjs calls Spike.mountTimed()
//   ?long=1                                        the fixture with a name too long for its head
// and each candidate's own (a.jsx, b.jsx, c.jsx say which).

import { fixture, synthetic } from './data.js';
import { makeStore } from './store.js';

/**
 * `render(store, host, query)` mounts the candidate into `host` and returns the function that unmounts it.
 * `ready(store, host)` says whether the whole view is in the document, drawn.
 */
export function start(name, render, ready) {
  const M = window.SysMLModel;
  const query = new URLSearchParams(location.search);
  const made = query.get('data') === 'synthetic'
    ? synthetic(M, +query.get('lifelines') || 20, +query.get('messages') || 300)
    : fixture(M);
  // ?long=1: a name too long for its head.
  if (query.has('long')) made.model.elements.find((e) => e.id === 'Login.auth').name = 'authenticationAndSessionService';
  const store = makeStore(M, made);
  if (query.get('camera')) {
    const [x, y, zoom] = query.get('camera').split(',').map(Number);
    store.moved({ x, y, zoom });
  }
  const host = document.getElementById('host');
  let unmount = null;
  const afterFrame = (fn) => { const ch = new MessageChannel(); ch.port1.onmessage = () => fn(); ch.port2.postMessage(0); };
  const Spike = {
    name, store, host,
    mount() { if (!unmount) unmount = render(store, host, query); },
    unmount() { if (unmount) unmount(); unmount = null; },
    ready: () => ready(store, host),
    /** Where the view's origin is on the plane the camera moves: a frame moves it (a page sets its own). */
    origin: () => ({ x: 0, y: 0 }),
    /** The camera that moves the view on the screen, and how to set it from outside (a page with a plane of its own sets both). */
    camera: () => store.camera(host.clientWidth, host.clientHeight),
    setCamera: (next) => store.setCamera(next),
    /** A point of the view, in its own units, on the screen. */
    toScreen(p) {
      const r = host.getBoundingClientRect();
      const c = Spike.camera();
      const o = Spike.origin();
      return { x: r.left + c.x + (o.x + p.x) * c.zoom, y: r.top + c.y + (o.y + p.y) * c.zoom };
    },
    /** Mounts, and gives the ms from before the mount to the end of the first frame in which the whole view is drawn. */
    mountTimed() {
      return new Promise((resolve) => {
        const t0 = performance.now();
        Spike.mount();
        const look = () => requestAnimationFrame(() => {
          if (!ready(store, host)) { look(); return; }
          afterFrame(() => resolve(performance.now() - t0));
        });
        look();
      });
    },
    /**
     * The steps measured since timeMoves(true): for each pointermove, `total` is from the move to the end of the next
     * animation frame (its callbacks, style, layout and paint, on the main thread), and `script` the part of it before
     * that frame's callbacks begin: the handlers of the move and React's render.
     */
    moves: [],
    timeMoves(on) { timing = on; if (on) Spike.moves = []; },
    /** Resolves at the end of the next frame. */
    frame: () => new Promise((resolve) => requestAnimationFrame(() => afterFrame(resolve))),
  };
  // The first listener of every move: the window's, capturing, added before anything is mounted.
  let timing = false;
  window.addEventListener('pointermove', () => {
    if (!timing) return;
    const t0 = performance.now();
    requestAnimationFrame(() => {
      const t1 = performance.now();
      afterFrame(() => { const t2 = performance.now(); Spike.moves.push({ script: t1 - t0, rest: t2 - t1, total: t2 - t0 }); });
    });
  }, true);
  window.Spike = Spike;
  if (!query.has('later')) Spike.mount();
}
