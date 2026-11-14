// Candidate B, a component body: one React component that draws the whole geometry view as SVG, with its own handling
// of clicks, drags and the camera. It reads the same store and the same layout as candidate A.
//
// `fixed` is the body inside a frame on a plane (slice 3): it has no camera of its own (the plane's zoom and pan are
// the frame's), it leaves the wheel and a drag on its ground to the plane, and it stands at `at` in the frame.

import { memo, useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { Axes, AxisMarker } from './axes.jsx';
import { CLICK_DISTANCE, PAD, barFor, marksAt } from './layout.js';

const MIN_ZOOM = 0.02;
const MAX_ZOOM = 4;
const NONE = [];
// React Flow's own rule: a pinch on a Mac's trackpad comes as a Ctrl wheel of a tenth the size.
const MAC = typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Mac') >= 0;

/** A footprint: the outline, the two lines of words (inside when there is room, else below), the marks on its top edge. */
const Foot = memo(function Foot({ foot, selected, badge, pins }) {
  const x = foot.inside ? foot.x + PAD : foot.x + foot.w / 2;
  const y = foot.inside ? foot.y + 16 : foot.y + foot.h + 15;
  const anchor = foot.inside ? 'start' : 'middle';
  const mark = marksAt(foot);
  return (
    // nodrag and nopan are React Flow's own class names: inside a node of a plane, a press here is the body's.
    <g className={'footprint nodrag nopan' + (foot.toScale ? '' : ' no-shape') + (selected ? ' selected' : '')} data-el={foot.id}>
      {foot.shape === 'circle'
        ? <circle className="outline" cx={foot.x + foot.w / 2} cy={foot.y + foot.h / 2} r={foot.w / 2} />
        : <rect className="outline" x={foot.x} y={foot.y} width={foot.w} height={foot.h} />}
      <text className="head" x={x} y={y} textAnchor={anchor}><tspan className="kw">{foot.keyword}</tspan><tspan className="uname">{foot.name}</tspan></text>
      <text className="geo-dims" x={x} y={y + 15} textAnchor={anchor}>{foot.text}</text>
      {badge > 0 && <g className="badge" data-badge={foot.id} transform={`translate(${mark.x - 20 * pins.length},${mark.y})`}><rect x="-8" y="-8" width="16" height="16" rx="4" /><text>{badge}</text></g>}
      {pins.map((no, i) => <g className="pin" data-pin={no} key={no} transform={`translate(${mark.x - 20 * i},${mark.y})`}><circle r="9" /><text>{no}</text></g>)}
    </g>
  );
});

/** The axes with the scale bar redrawn for the zoom (window.SPIKE_BAR_REDRAWN): the one part that renders when the zoom changes. */
function ZoomedAxes({ store, L }) {
  const zoom = useSyncExternalStore(store.watch, useCallback(() => (store.camera ? store.camera.zoom : 1), [store]));
  const now = barFor(store.M, L.scale * zoom, L.unit);
  return <Axes ox={L.origin.x} oy={L.origin.y} bar={{ len: now.n * L.scale, words: now.words }} marker="m-geo-axis" />;
}

export function ComponentBody({ store, fixed, at }) {
  const { L, selection, marks } = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const svg = useRef(null);
  const plane = useRef(null);

  // The camera is the store's, and is set on the drawing's <g> without a render.
  useLayoutEffect(() => {
    if (fixed) return undefined;
    const apply = () => { const c = store.camera; plane.current.setAttribute('transform', `translate(${c.x},${c.y}) scale(${c.zoom})`); };
    store.cameraFor(svg.current.clientWidth, svg.current.clientHeight);
    apply();
    store.host = { setCamera: (camera) => store.moved(camera) };
    const stop = store.watch(apply);
    return () => { stop(); store.host = null; };
  }, [store, fixed]);

  // The pointer: one set of listeners on the <svg>. A press on a footprint that moves is a drag, a press on the ground
  // that moves pans, and a press that stays within CLICK_DISTANCE is a click.
  useEffect(() => {
    const el = svg.current;
    let press = null;
    // A point of the screen in the view's units, whatever scales the body: its own camera, or a plane's around it.
    const toView = (event) => {
      const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(plane.current.getScreenCTM().inverse());
      return { x: p.x, y: p.y };
    };
    const down = (event) => {
      if (event.button !== 0) return;
      const target = event.target instanceof Element ? event.target : null;
      const pin = target && target.closest('[data-pin]');
      const foot = target && target.closest('[data-el]');
      const ground = !pin && !foot;
      press = { pointer: event.pointerId, pin: pin ? pin.getAttribute('data-pin') : null, id: foot ? foot.getAttribute('data-el') : null, x: event.clientX, y: event.clientY, at: toView(event), camera: store.camera, moved: false, ground };
      // Inside a frame, a press on the ground is the plane's (it pans): the body only hears whether it was a click.
      if (!(fixed && ground)) el.setPointerCapture(event.pointerId);
    };
    const move = (event) => {
      if (!press || event.pointerId !== press.pointer) return;
      const dx = event.clientX - press.x;
      const dy = event.clientY - press.y;
      if (!press.moved && Math.max(Math.abs(dx), Math.abs(dy)) < CLICK_DISTANCE) return;
      press.moved = true;
      if (press.id && !press.pin) {
        // How many screen px one of the view's units is now.
        const k = plane.current.getScreenCTM().a;
        store.step([{ id: press.id, dx: dx / k, dy: dy / k }]);
      } else if (press.ground && !fixed) store.moved({ x: press.camera.x + dx, y: press.camera.y + dy, zoom: press.camera.zoom });
    };
    const up = (event) => {
      if (!press || event.pointerId !== press.pointer) return;
      const was = press;
      press = null;
      if (was.moved) { if (was.id && !was.pin) store.end(); return; }
      if (was.pin) store.click({ type: 'pin', id: was.pin, at: was.at, add: false });
      else store.click({ type: was.id ? 'el' : 'ground', id: was.id, at: was.at, add: event.ctrlKey || event.metaKey });
    };
    const cancel = () => { if (press && press.moved && press.id) store.cancel(); press = null; };
    // The wheel pans, and with Ctrl it zooms about the pointer, by React Flow's own measure.
    const wheel = (event) => {
      if (fixed) return;
      event.preventDefault();
      const c = store.camera;
      const unit = event.deltaMode === 1 ? 20 : 1;
      if (!event.ctrlKey) { store.moved({ x: c.x - event.deltaX * unit, y: c.y - event.deltaY * unit, zoom: c.zoom }); return; }
      const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, c.zoom * Math.pow(2, -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) * (MAC ? 10 : 1))));
      const box = el.getBoundingClientRect();
      const px = event.clientX - box.left;
      const py = event.clientY - box.top;
      store.moved({ x: px - (px - c.x) * (zoom / c.zoom), y: py - (py - c.y) * (zoom / c.zoom), zoom });
    };
    // A right-click, where the page's plane opens its palette: the same Hit, marked `menu`.
    const menu = (event) => {
      event.preventDefault();
      const foot = event.target instanceof Element ? event.target.closest('[data-el]') : null;
      store.click({ type: foot ? 'el' : 'ground', id: foot ? foot.getAttribute('data-el') : null, at: toView(event), add: false, menu: true });
    };
    el.addEventListener('contextmenu', menu);
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', cancel);
    el.addEventListener('wheel', wheel, { passive: false });
    return () => {
      el.removeEventListener('contextmenu', menu);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', cancel);
      el.removeEventListener('wheel', wheel);
    };
  }, [store, fixed]);

  // Inside a frame, a click in the body is the body's, not a click on the plane's node around it.
  const own = fixed ? (event) => event.stopPropagation() : undefined;
  return (
    <svg ref={svg} className={'geo-host geo-body' + (fixed ? ' fixed' : '')} onClick={own}>
      <defs><AxisMarker id="m-geo-axis" /></defs>
      <g ref={plane} className="geo-plane" transform={fixed && at ? `translate(${at.x},${at.y})` : undefined}>
        {L.feet.map((foot) => <Foot key={foot.id} foot={foot} selected={selection.has(foot.id)} badge={marks.badges[foot.id] || 0} pins={marks.pins[foot.id] || NONE} />)}
        {window.SPIKE_BAR_REDRAWN && !fixed ? <ZoomedAxes store={store} L={L} /> : <Axes ox={L.origin.x} oy={L.origin.y} bar={L.bar} marker="m-geo-axis" />}
        {marks.free.map((pin) => <g className="pin is-free nodrag nopan" data-pin={pin.no} key={pin.no} transform={`translate(${pin.x},${pin.y})`}><circle r="9" /><text>{pin.no}</text></g>)}
      </g>
    </svg>
  );
}
