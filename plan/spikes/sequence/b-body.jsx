// Candidate B, a component body: one React component that draws the whole sequence view as SVG and handles the
// pointer, the wheel and the camera itself. It reads the view through the shared store and layout only.
//
// `framed` is the slice 3 case: the body is drawn inside one node of a React Flow plane. It then has no camera of its
// own (the plane's is the camera), takes its content's size, and leaves the ground and the wheel to the plane.

import { memo, useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { CLICK_DISTANCE } from './layout.js';
import { MAX_ZOOM, MIN_ZOOM } from './store.js';
import './b.css';

export const FRAME_PAD = 24;
const FRAMED = { x: FRAME_PAD, y: FRAME_PAD, zoom: 1 };
const path = (points) => points.map((p, i) => (i ? 'L' : 'M') + p.x + ',' + p.y).join(' ');
const cls = (name, selected, more) => name + (selected ? ' selected' : '') + (more ? ' ' + more : '');

/** A thing's marks: how many problems, and the numbers of the notes pinned to it, in a row from (x, y). */
const Marks = memo(function Marks({ id, mark, x, y }) {
  if (!mark) return null;
  const pins = mark.pins.map((no, i) => (
    <g key={no} data-pin={id} className="seq-pin" transform={`translate(${x + (mark.problems ? 20 : 0) + i * 20},${y})`}>
      <rect x="-8" y="-8" width="16" height="16" rx="3" /><text y="3.5" textAnchor="middle">{no}</text>
    </g>
  ));
  return (
    <>
      {mark.problems > 0 && (
        <g data-badge={id} className="seq-badge" transform={`translate(${x},${y})`}>
          <circle r="8" /><text y="3.5" textAnchor="middle">{mark.problems}</text>
        </g>
      )}
      {pins}
    </>
  );
});

const Lifeline = memo(function Lifeline({ l, bottom, selected, mark, spill }) {
  const words = (
    <>
      <text className="seq-keyword" x={l.w / 2} y="24" textAnchor="middle">{l.keyword}</text>
      <text className="seq-name" data-label={l.id} x={l.w / 2} y="42" textAnchor="middle">{l.name}</text>
    </>
  );
  return (
    <g className={cls('seq-lifeline', selected)}>
      <path data-shape="line" data-id={l.id} className="seq-dashed" d={`M${l.cx},${l.y + l.h} V${bottom}`} />
      <g data-seq="head" data-id={l.id} className="nodrag nopan">
        <rect data-shape="head" data-id={l.id} className="seq-head" x={l.x + 0.5} y={l.y + 0.5} width={l.w - 1} height={l.h - 1} rx="10" />
        {/* An svg inside the svg cuts what it holds at its own edges: a name too long for the head does not spill.
            SVG text has no ellipsis and does not wrap; `spill` (?spill=1) leaves the cut out, to show what then happens. */}
        {spill ? <g transform={`translate(${l.x},${l.y})`}>{words}</g> : <svg x={l.x + 4} y={l.y} width={l.w - 8} height={l.h} viewBox={`4 0 ${l.w - 8} ${l.h}`}>{words}</svg>}
        <Marks id={l.id} mark={mark} x={l.x + l.w - 4} y={l.y + 2} />
      </g>
    </g>
  );
});

const EventDot = memo(function EventDot({ e, selected, mark }) {
  return (
    <g data-seq="event" data-id={e.id} className={cls('seq-event', selected, 'nodrag nopan')}>
      <circle className="seq-event-hit" cx={e.cx} cy={e.cy} r="10" />
      <circle data-shape="event" data-id={e.id} className="seq-dot" cx={e.cx} cy={e.cy} r="6" />
      <text className="seq-event-name" data-label={e.id} x={e.cx + 10} y={e.cy - 5}>{e.name}</text>
      <Marks id={e.id} mark={mark} x={e.cx - 14} y={e.cy - 12} />
    </g>
  );
});

const Message = memo(function Message({ m, selected, mark }) {
  const d = path(m.points);
  return (
    <g data-seq="message" data-id={m.id} className={cls('seq-message', selected, 'nodrag nopan' + (m.lifted ? ' lifted' : ''))}>
      <path data-shape="message" data-id={m.id} className="seq-line" d={d} markerEnd="url(#seq-message)" />
      <path className="seq-line-hit" d={d} />
      {m.label !== '' && <text className="seq-label" data-label={m.id} x={m.mid.x} y={m.mid.y - 8} textAnchor="middle">{m.label}</text>}
      <Marks id={m.id} mark={mark} x={m.mid.x} y={m.mid.y + 12} />
    </g>
  );
});

const Link = memo(function Link({ s, selected }) {
  const d = path(s.points);
  return (
    <g data-seq="link" data-id={s.id} className={cls('seq-link', selected, 'nodrag nopan')}>
      <path data-shape="link" data-id={s.id} className="seq-line" d={d} markerEnd="url(#seq-open)" />
      <path className="seq-line-hit" d={d} />
    </g>
  );
});

export function SequenceBody({ store, framed = false, spill = false }) {
  const data = useSyncExternalStore(store.subscribe, store.data);
  const picked = useSyncExternalStore(store.subscribe, store.picked);
  const marks = useSyncExternalStore(store.subscribe, store.marks);
  const host = useRef(null);
  const plane = useRef(null);
  const press = useRef(null);

  // The camera is the store's, outside React, and is written to the DOM here: a pan or a zoom renders nothing.
  const cameraNow = useCallback(() => {
    if (framed) return FRAMED;
    return store.camera(host.current.clientWidth, host.current.clientHeight);
  }, [store, framed]);
  const show = useCallback(() => {
    const c = cameraNow();
    plane.current.setAttribute('transform', `translate(${c.x},${c.y}) scale(${c.zoom})`);
  }, [cameraNow]);
  useLayoutEffect(() => { show(); return store.onCamera(show); }, [store, show]);

  // A point of the screen in the view's own units, whatever scales the host from outside (a plane's zoom, in a frame).
  const scaleOf = () => { const el = host.current; return el.getBoundingClientRect().width / el.offsetWidth || 1; };
  const toView = useCallback((clientX, clientY) => {
    const r = host.current.getBoundingClientRect();
    const k = scaleOf();
    const c = cameraNow();
    return { x: ((clientX - r.left) / k - c.x) / c.zoom, y: ((clientY - r.top) / k - c.y) / c.zoom };
  }, [cameraNow]);

  const onPointerDown = useCallback((event) => {
    if (event.button !== 0) return;
    const target = event.target.closest('[data-seq]');
    const type = target ? target.dataset.seq : 'ground';
    const id = target ? target.dataset.id : null;
    const at = toView(event.clientX, event.clientY);
    const thing = id ? store.data().byId.get(id) : null;
    // Where the thing was taken: it keeps that distance from the pointer through the drag.
    const grab = type === 'head' ? at.x - thing.x : type === 'event' ? at.y - thing.cy : type === 'message' ? at.y - thing.y : 0;
    press.current = { type, id, at, grab, x: event.clientX, y: event.clientY, add: event.ctrlKey || event.metaKey, passed: false, camera: cameraNow() };
    // In a frame the ground is the plane's to drag: the body only hears a click on it, and takes no hold of the pointer.
    if (framed && type === 'ground') return;
    host.current.setPointerCapture(event.pointerId);
    event.preventDefault();   // no text selection's drag
  }, [store, framed, toView, cameraNow]);

  const onPointerMove = useCallback((event) => {
    const p = press.current;
    if (!p) return;
    const dx = event.clientX - p.x;
    const dy = event.clientY - p.y;
    if (!p.passed && Math.max(Math.abs(dx), Math.abs(dy)) < CLICK_DISTANCE) return;   // a press that slips is still a click
    p.passed = true;
    if (p.type === 'ground') {
      if (framed) return;
      const k = scaleOf();
      store.moved({ x: p.camera.x + dx / k, y: p.camera.y + dy / k, zoom: p.camera.zoom });
      show();
      return;
    }
    const v = toView(event.clientX, event.clientY);
    if (p.type === 'head') store.step({ kind: 'lifeline', id: p.id, x: v.x - p.grab });        // sideways only
    else if (p.type === 'event') store.step({ kind: 'event', id: p.id, y: v.y - p.grab });       // up and down only
    else if (p.type === 'message') store.step({ kind: 'message', id: p.id, y: v.y - p.grab });   // its row
  }, [store, framed, toView, show]);

  const onPointerUp = useCallback((event) => {
    const p = press.current;
    if (!p) return;
    press.current = null;
    if (host.current.hasPointerCapture(event.pointerId)) host.current.releasePointerCapture(event.pointerId);
    if (!p.passed) store.hit({ type: p.type, id: p.id, at: p.at, add: p.add });
    else if (store.stepping()) store.end();
  }, [store]);
  const onPointerCancel = useCallback(() => { press.current = null; store.cancel(); }, [store]);

  // The wheel pans, Ctrl with the wheel zooms about the pointer. React's own wheel listener is passive, so this one
  // is added by hand, to keep the page from scrolling or zooming.
  useEffect(() => {
    if (framed) return undefined;
    const el = host.current;
    const wheel = (event) => {
      event.preventDefault();
      const c = cameraNow();
      const unit = event.deltaMode === 1 ? 20 : 1;
      if (event.ctrlKey || event.metaKey) {
        const r = el.getBoundingClientRect();
        const px = event.clientX - r.left;
        const py = event.clientY - r.top;
        const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, c.zoom * Math.pow(2, -event.deltaY * (event.deltaMode === 1 ? 0.05 : 0.002))));
        store.moved({ x: px - ((px - c.x) / c.zoom) * zoom, y: py - ((py - c.y) / c.zoom) * zoom, zoom });
      } else {
        store.moved({ x: c.x - event.deltaX * unit, y: c.y - event.deltaY * unit, zoom: c.zoom });
      }
      show();
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  }, [store, framed, cameraNow, show]);

  const size = framed ? { width: data.size.width + 2 * FRAME_PAD, height: data.size.height + 2 * FRAME_PAD } : null;
  return (
    <div
      ref={host}
      className={'seq-b' + (framed ? ' framed' : '')}
      style={size || undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <svg className="seq-svg" width="100%" height="100%">
        <g ref={plane}>
          {data.lifelines.map((l) => <Lifeline key={l.id} l={l} bottom={data.bottom} selected={picked.has(l.id)} mark={marks.by.get(l.id)} spill={spill} />)}
          {data.links.map((s) => <Link key={s.id} s={s} selected={picked.has(s.id)} />)}
          {data.messages.map((m) => <Message key={m.id} m={m} selected={picked.has(m.id)} mark={marks.by.get(m.id)} />)}
          {data.events.map((e) => <EventDot key={e.id} e={e} selected={picked.has(e.id)} mark={marks.by.get(e.id)} />)}
          {marks.free.map((n) => (
            <g key={n.no} data-free-pin={n.no} className="seq-pin free" transform={`translate(${n.x},${n.y})`}>
              <path d="M0,0 L-7,-12 A8,8 0 1 1 7,-12 Z" /><text y="-12" textAnchor="middle">{n.no}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

/** Whether the whole view is drawn: every lifeline, event, message and succession has its shape in the document. */
export function drawn(store, host) {
  const d = store.data();
  return host.querySelectorAll('[data-shape]').length === d.lifelines.length * 2 + d.events.length + d.messages.length + d.links.length;
}
