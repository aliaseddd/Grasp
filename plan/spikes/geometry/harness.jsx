// What the spike's pages share: the test data's stores, mounting a body into #host, and window.spike, which run.cjs
// and a person at the console use. A page gives its body component; the body gets { store } and whatever show() is given.

import { createRoot } from 'react-dom/client';
import { ROOM_MARKS, emptyModel, roomModel, syntheticModel } from './data.js';
import * as layout from './layout.js';
import { makeStore } from './store.js';

const NO_MARKS = { badges: {}, pins: {}, free: [] };

/** Resolves at the end of the next frame: after its animation callbacks, style, layout and paint. */
export function frameEnd() {
  return new Promise((resolve) => requestAnimationFrame(() => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => resolve(performance.now());
    channel.port2.postMessage(0);
  }));
}

export function start(name, Body) {
  const M = window.SysMLModel;
  const fixture = window.GEO_FIXTURE;
  const made = {
    room: () => makeStore(M, roomModel(M, fixture), 'v-plan', ROOM_MARKS),
    empty: () => makeStore(M, emptyModel(M, fixture), 'v-plan', NO_MARKS),
    fixture: () => makeStore(M, M.normalize(JSON.parse(JSON.stringify(fixture.model))), 'v-plan', NO_MARKS),
    synthetic: () => makeStore(M, syntheticModel(M, fixture), 'v-plan', NO_MARKS),
    synthetic5000: () => makeStore(M, syntheticModel(M, fixture, 500), 'v-plan', NO_MARKS),
  };
  const stores = new Map();
  const host = document.getElementById('host');
  let root = null;
  const steps = [];
  let lastStep = Promise.resolve();
  let measuring = false;
  // A step of a drag or of a pan, timed inside the page: from the pointermove or the wheel to the end of the next
  // frame. `frame` is the part from that frame's animation callbacks to its end: style, layout and paint.
  const timed = () => {
    if (!measuring) return;
    const t0 = performance.now();
    lastStep = new Promise((resolve) => requestAnimationFrame(() => {
      const t1 = performance.now();
      const end = new MessageChannel();
      end.port1.onmessage = () => { const now = performance.now(); steps.push({ total: now - t0, frame: now - t1 }); resolve(); };
      end.port2.postMessage(0);
    }));
  };
  window.addEventListener('pointermove', timed, true);
  window.addEventListener('wheel', timed, true);

  const spike = window.spike = {
    name,
    layout,
    M,
    store: null,
    /** The store of one of the test views, the same one each time: 'room', 'empty', 'fixture', 'synthetic' or 'synthetic5000'. */
    storeOf(which) { if (!stores.has(which)) stores.set(which, made[which]()); return stores.get(which); },
    /** Forgets a test view's store, so that it is next shown as first seen. */
    forget(which) { stores.delete(which); },
    /**
     * Mounts the body with a test view, and resolves at the end of the first frame in which every footprint of the
     * view is in the document and shown: { ms } from just before the mount.
     */
    async show(which = 'room', options = {}) {
      spike.hide();
      const store = spike.store = spike.storeOf(which);
      const want = store.layout.feet.length;
      const t0 = performance.now();
      root = createRoot(host);
      root.render(<Body store={store} {...options} />);
      for (;;) {
        const now = await frameEnd();
        const feet = host.querySelectorAll('[data-el]');
        const axes = host.querySelector('.geo-axes');
        const shown = axes && feet.length >= want && (feet.length === 0 || feet[0].checkVisibility({ visibilityProperty: true }));
        if (shown) return { ms: now - t0, drawn: feet.length };
        if (now - t0 > 20000) throw new Error(`Only ${feet.length} of ${want} footprints were drawn after 20 s.`);
      }
    },
    hide() { if (root) { root.unmount(); root = null; } },
    /** Sets the camera through what the mounted body offers, and waits for the frame. */
    async setCamera(camera) { spike.store.host.setCamera(camera); await frameEnd(); await frameEnd(); return spike.store.camera; },
    frameEnd,
    measure(on) { measuring = on; if (on) steps.length = 0; },
    stepDone() { return lastStep; },
    steps,
  };
  document.title = name;
  const asked = new URLSearchParams(location.search);
  if (asked.get('show') !== 'none') spike.show(asked.get('show') || 'room');
}
