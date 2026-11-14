// Candidate A, a graph body: the sequence view as React Flow nodes and edges, built as the page builds its planes
// (canvas/app/src/plane/Plane.tsx and viewStore.ts): the nodes and edges are kept in a store outside React and handed
// to React Flow as controlled props; a drag's steps are worked out by the store, and only its end writes.
//
// What the reader gives (`project` below, the `Projection` of contract 5):
// - a lifeline is two nodes. Its head is a node with the element's id, 180 by 60 as the layout says, which is what a
//   person picks and drags. Its dashed line is a second node, `<id>:line`, as wide as the head and as tall as the
//   view, under everything (`zIndex: -1`), which takes no pointer and is never selected or dragged.
// - an event is a 16 by 16 node, a child of its lifeline's line node.
// - a message is an edge from the node its line starts on to the node it ends on (an event's node, else the
//   lifeline's line node), whose data holds how far under each node's top the line runs. A succession is an edge too.
//   Both have `zIndex: 1`.
// - a free pin is a node that takes no pointer.
//
// The other shapes are kept to show what each loses (the README says what):
//   ?shape=tall   a lifeline is one node as tall as the view, head and dashed line together, that takes no pointer but on its head
//   ?shape=heads  a lifeline is one node, its head alone, with the dashed line drawn out of it
//   ?flat=1       the edges keep React Flow's own depth, under every node
//   ?rows=nodes   a message is a node as wide as its line and 16 high, so that React Flow's own node drag moves its row
// `?frame=1` is the slice 3 case: every node is a child of one frame node.
// `?connect=1` gives the nodes real connection handles: an event's dot, and a strip down a lifeline's dashed line.
// `?connect=inert` gives them those and keeps the page's inert handle too.

import { createContext, memo, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Background, BackgroundVariant, ConnectionMode, Controls, Handle, MiniMap, Position, ReactFlow, SelectionMode, useInternalNode, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CLICK_DISTANCE, EVENT_GAP, linkPoints, messageMid, messagePoints } from './layout.js';
import { MAX_ZOOM, MIN_ZOOM } from './store.js';
import './a.css';

const HANDLES = [{ type: 'source', position: 'top', x: 0, y: 0 }, { type: 'target', position: 'top', x: 0, y: 0 }];
const NO_POINTER = { pointerEvents: 'none' };
const FRAME = { title: 28, pad: 24 };
const LARGE_VIEW = 300;   // the page's: more nodes than this, and only what the window shows is mounted

// ---- The store: the layout as nodes and edges, and React Flow's changes as steps of a gesture.

export function makeFlowStore(shared, options) {
  const cache = new Map();
  const renew = new Set();
  let frame = options.frame ? { x: 60, y: 30 } : null;
  let snapshot = { nodes: [], edges: [] };
  let seen = null;
  let gesture = null;    // a node's drag: { id, kind, from, passed }
  let pressed = null;    // the node under the pointer, from onNodeDragStart
  let rowDragged = false;
  const inFrame = () => (frame ? { x: FRAME.pad, y: FRAME.title + FRAME.pad } : { x: 0, y: 0 });
  /** The node a lifeline's events hang on and its messages end on: its line node, or the one node it has. */
  const anchor = (id) => (options.shape === 'split' ? id + ':line' : id);

  /** The same object while its key is the same, so React Flow renders only what changed. */
  const kept = (id, key, make) => {
    const was = cache.get(id);
    if (was && was.key === key && !renew.has(id)) return was.item;
    const item = make();
    cache.set(id, { key, item });
    return item;
  };
  const sameList = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

  const project = () => {
    const d = shared.data();
    const picked = shared.picked();
    const marks = shared.marks();
    if (seen && seen.d === d && seen.picked === picked && seen.marks === marks && seen.frame === frame && renew.size === 0) return;
    seen = { d, picked, marks, frame };
    const off = inFrame();
    const parentId = frame ? 'frame' : undefined;
    const nodes = [];
    if (frame) {
      const width = d.size.width + 2 * FRAME.pad;
      const height = d.size.height + FRAME.title + 2 * FRAME.pad;
      nodes.push(kept('frame', ['f', frame.x, frame.y, width, height].join('|'), () => ({
        id: 'frame', type: 'frame', position: frame, width, height, measured: { width, height }, dragHandle: '.seq-frame-title',
        selectable: false, data: { title: 'loginSequence' },
      })));
    }
    const eventsOf = new Map(d.lifelines.map((l) => [l.id, []]));
    for (const e of d.events) eventsOf.get(e.lifeline).push(e);
    for (const l of d.lifelines) {
      const mark = marks.by.get(l.id);
      const selected = picked.has(l.id);
      const column = d.bottom - l.y;
      const position = { x: l.x + off.x, y: l.y + off.y };
      if (options.shape === 'split') {
        nodes.push(kept(anchor(l.id), ['d', l.x, l.y, l.w, l.h, column, off.x, off.y].join('|'), () => ({
          id: anchor(l.id), type: 'line', parentId, position, width: l.w, height: column, measured: { width: l.w, height: column },
          handles: HANDLES, zIndex: -1, selectable: false, draggable: false, style: NO_POINTER,
          data: { lifeline: l.id, head: l.h, bottom: column, connect: options.connect },
        })));
      }
      const height = options.shape === 'tall' ? column : l.h;
      nodes.push(kept(l.id, [l.key, height, selected, JSON.stringify(mark), off.x, off.y].join('|'), () => ({
        id: l.id, type: 'lifeline', parentId, position, width: l.w, height, measured: { width: l.w, height }, handles: HANDLES, selected,
        style: options.shape === 'tall' ? NO_POINTER : undefined,
        data: { name: l.name, keyword: l.keyword, head: l.h, bottom: options.shape === 'split' ? null : column, mark, connect: options.connect },
      })));
      for (const e of eventsOf.get(l.id)) {
        const emark = marks.by.get(e.id);
        const eselected = picked.has(e.id);
        nodes.push(kept(e.id, ['e', l.id, e.name, l.w, e.cy - l.y, eselected, JSON.stringify(emark)].join('|'), () => ({
          id: e.id, type: 'event', parentId: anchor(l.id), position: { x: l.w / 2 - 8, y: e.cy - l.y - 8 },
          width: 16, height: 16, measured: { width: 16, height: 16 }, handles: HANDLES, selected: eselected,
          data: { name: e.name, mark: emark, connect: options.connect },
        })));
      }
    }
    for (const n of marks.free) {
      nodes.push(kept('pin:' + n.no, ['p', n.x, n.y, off.x, off.y].join('|'), () => ({
        id: 'pin:' + n.no, type: 'pin', parentId, position: { x: n.x + off.x, y: n.y + off.y }, width: 1, height: 1,
        measured: { width: 1, height: 1 }, draggable: false, selectable: false, style: NO_POINTER, zIndex: 10, data: { no: n.no },
      })));
    }
    const edges = [];
    for (const m of options.rowNodes ? d.messages : []) {
      // A message as a node: its rectangle is its line's, 8 above and below; its line is drawn inside it.
      const x1 = Math.min(...m.points.map((p) => p.x));
      const width = Math.max(...m.points.map((p) => p.x)) - x1;
      const height = 16 + (m.self ? EVENT_GAP : 0);
      const mark = marks.by.get(m.id);
      const selected = picked.has(m.id);
      const inside = m.points.map((p) => ({ x: p.x - x1, y: p.y - m.y + 8 }));
      nodes.push(kept(m.id, ['r', x1, m.y, JSON.stringify(inside), m.label, m.lifted, selected, JSON.stringify(mark), off.x, off.y].join('|'), () => ({
        id: m.id, type: 'row', parentId, position: { x: x1 + off.x, y: m.y - 8 + off.y }, width, height, measured: { width, height },
        selected, className: m.lifted ? 'lifted' : '', data: { points: inside, label: m.label, mark },
      })));
    }
    for (const m of options.rowNodes ? [] : d.messages) {
      // How far under each end's node the line runs: through an event's middle, or at the row's height down the lifeline.
      const sy = m.dotA ? 8 : m.y;
      const ty = m.dotB ? 8 : m.y + (m.self ? EVENT_GAP : 0);
      const mark = marks.by.get(m.id);
      const selected = picked.has(m.id);
      const source = m.dotA ? m.from : anchor(m.fromLifeline);
      const target = m.dotB ? m.to : anchor(m.toLifeline);
      edges.push(kept(m.id, ['m', source, target, sy, ty, m.self, m.label, m.lifted, selected, JSON.stringify(mark)].join('|'), () => ({
        id: m.id, type: 'message', source, target, selected, className: 'message' + (m.lifted ? ' lifted' : ''), zIndex: options.flat ? undefined : 1,
        data: { sy, ty, self: m.self, dotA: m.dotA, dotB: m.dotB, label: m.label, mark },
      })));
    }
    for (const s of d.links) {
      const selected = picked.has(s.id);
      edges.push(kept(s.id, ['s', s.from, s.to, selected].join('|'), () => ({
        id: s.id, type: 'link', source: s.from, target: s.to, selected, className: 'succession', zIndex: options.flat ? undefined : 1, data: {},
      })));
    }
    renew.clear();
    snapshot = {
      nodes: sameList(nodes, snapshot.nodes) ? snapshot.nodes : nodes,
      edges: sameList(edges, snapshot.edges) ? snapshot.edges : edges,
    };
  };

  const zoom = () => (shared.hasCamera() ? shared.camera().zoom : 1);
  const tellers = new Set();
  const tell = () => { for (const fn of [...tellers]) fn(); };
  shared.subscribe(tell);

  const store = {
    shared, options,
    subscribe(fn) { tellers.add(fn); return () => { tellers.delete(fn); }; },
    getSnapshot() { project(); return snapshot; },
    /** Whether only what the window shows is mounted: as asked, else by the page's rule (more than LARGE_VIEW nodes). */
    culled() { project(); return options.cull === null ? snapshot.nodes.length > LARGE_VIEW : options.cull; },
    /** Where the view's origin is on the plane: the frame's inside, or the plane's own origin. */
    origin() { const off = inFrame(); return frame ? { x: frame.x + off.x, y: frame.y + off.y } : off; },
    /** onNodeDragStart: the node under the pointer is the one that moves, whatever else is selected. */
    pressedNode(id) { pressed = id; },
    /**
     * onNodesChange. A `select` change picks nothing: the node gets a new object that reads as the selection says (the
     * page's rule). A `position` change with `dragging` true is a step of a gesture: of a lifeline, its x alone is
     * asked; of an event, its height alone. With `dragging` false it is the gesture's end. Nothing else changes anything.
     */
    nodesChanged(changes) {
      let touched = false;
      for (const c of changes) {
        if (c.type === 'select') { if (cache.has(c.id)) { renew.add(c.id); touched = true; } continue; }
        if (c.type !== 'position' || !c.position) continue;
        if (c.id === 'frame') {
          if (frame && c.dragging !== undefined && (pressed === null || pressed === 'frame')) { frame = { x: c.position.x, y: c.position.y }; touched = true; }
          continue;
        }
        const thing = shared.data().byId.get(c.id);
        if (!thing) continue;
        if (c.dragging === true) {
          if (pressed !== null && pressed !== c.id) continue;
          if (!gesture) gesture = { id: c.id, kind: thing.lifeline ? 'event' : thing.points ? 'message' : 'lifeline', from: cache.get(c.id).item.position, passed: false };
          if (gesture.id !== c.id) continue;
          if (!gesture.passed) {
            // A press that has not gone CLICK_DISTANCE on the screen is still a click: it draws and writes nothing.
            const gone = Math.max(Math.abs(c.position.x - gesture.from.x), Math.abs(c.position.y - gesture.from.y)) * zoom();
            if (gone < CLICK_DISTANCE) continue;
            gesture.passed = true;
          }
          if (gesture.kind === 'lifeline') shared.step({ kind: 'lifeline', id: c.id, x: c.position.x - inFrame().x });
          else if (gesture.kind === 'event') shared.step({ kind: 'event', id: c.id, y: c.position.y + 8 });
          else shared.step({ kind: 'message', id: c.id, y: c.position.y + 8 - inFrame().y });   // ?rows=nodes
        } else if (c.dragging === false && gesture && gesture.id === c.id) {
          const g = gesture;
          gesture = null;
          if (g.passed) shared.end();
        }
      }
      if (touched) tell();
    },
    nodeDragStopped() { pressed = null; },
    edgesChanged(changes) {
      let touched = false;
      for (const c of changes) if (c.type === 'select' && cache.has(c.id)) { renew.add(c.id); touched = true; }
      if (touched) tell();
    },
    /**
     * A press on a message's line or label. React Flow drags nodes, not edges, so the row's drag is this store's own:
     * it follows the pointer on the window until the button is let go. `toFlow` is React Flow's screenToFlowPosition.
     */
    pressRow(id, event, toFlow) {
      if (event.button !== 0) return;
      rowDragged = false;
      const row = shared.data().byId.get(id);
      const heightAt = (e) => toFlow({ x: e.clientX, y: e.clientY }).y - store.origin().y;
      const grab = heightAt(event) - row.y;
      const from = { x: event.clientX, y: event.clientY };
      let passed = false;
      const move = (e) => {
        if (!passed && Math.max(Math.abs(e.clientX - from.x), Math.abs(e.clientY - from.y)) < CLICK_DISTANCE) return;
        passed = true;
        shared.step({ kind: 'message', id, y: heightAt(e) - grab });
      };
      const up = () => {
        window.removeEventListener('pointermove', move, true);
        window.removeEventListener('pointerup', up, true);
        window.removeEventListener('pointercancel', cancel, true);
        if (passed) { rowDragged = true; shared.end(); }
      };
      const cancel = () => { passed = false; up(); shared.cancel(); };
      window.addEventListener('pointermove', move, true);
      window.addEventListener('pointerup', up, true);
      window.addEventListener('pointercancel', cancel, true);
    },
    /** Whether the click that follows is the end of a row's drag, and so no click. Any new press forgets it. */
    wasRowDrag() { const was = rowDragged; rowDragged = false; return was; },
    pressedAnywhere() { rowDragged = false; },
  };
  return store;
}

// ---- The node and edge components. Each draws from its `data` and knows no model and no store.

const Store = createContext(null);
const round = (n) => Math.round(n * 100) / 100;
const path = (points) => points.map((p, i) => (i ? 'L' : 'M') + round(p.x) + ',' + round(p.y)).join(' ');

/** A thing's marks, as svg: how many problems, and the numbers of the notes pinned to it, in a row from (x, y). */
function Marks({ id, mark, x, y }) {
  if (!mark) return null;
  return (
    <>
      {mark.problems > 0 && (
        <g data-badge={id} className="seq-badge" transform={`translate(${x},${y})`}>
          <circle r="8" /><text y="3.5" textAnchor="middle">{mark.problems}</text>
        </g>
      )}
      {mark.pins.map((no, i) => (
        <g key={no} data-pin={id} className="seq-pin" transform={`translate(${x + (mark.problems ? 20 : 0) + i * 20},${y})`}>
          <rect x="-8" y="-8" width="16" height="16" rx="3" /><text y="3.5" textAnchor="middle">{no}</text>
        </g>
      ))}
    </>
  );
}

/** A lifeline's dashed line, and with ?connect=1 the handle along it. */
function Dashed({ id, data, width }) {
  return (
    <>
      {/* The page's inert handle, so React Flow draws lines to the node. With real handles (?connect=1) it must go, or
          come after them: it counts as the node's first source handle and has no side, so a connection begun from a
          real handle that has no id is taken to begin from it, and React Flow's connection line throws
          (?connect=inert keeps it, first, to show that). */}
      {data.connect !== '1' && <span className="seq-handle source target" />}
      {data.connect && <Handle type="source" position={Position.Bottom} className="seq-strip" style={{ top: data.head, height: data.bottom - data.head }} />}
      <svg className="seq-over" width={width} height={data.bottom}>
        <path data-shape="line" data-id={id} className="seq-dashed" d={`M${width / 2},${data.head} V${data.bottom}`} />
      </svg>
    </>
  );
}

const LineNode = memo(function LineNode({ data, width }) {
  return <Dashed id={data.lifeline} data={data} width={width} />;
}, (a, b) => a.data === b.data && a.width === b.width);

const LifelineNode = memo(function LifelineNode({ id, data, width }) {
  return (
    <>
      {data.bottom === null ? <span className="seq-handle source target" /> : <Dashed id={id} data={data} width={width} />}
      <div data-shape="head" data-id={id} className="seq-head" style={{ height: data.head }}>
        <div className="seq-keyword">{data.keyword}</div>
        <div className="seq-name"><span data-label={id}>{data.name}</span></div>
      </div>
      <svg className="seq-over" width={width} height={data.head}><Marks id={id} mark={data.mark} x={width - 4} y={2} /></svg>
    </>
  );
}, (a, b) => a.data === b.data && a.width === b.width);

const EventNode = memo(function EventNode({ id, data }) {
  return (
    <>
      {data.connect !== '1' && <span className="seq-handle source target" />}
      {data.connect && <Handle type="source" position={Position.Right} className="seq-on-dot" />}
      <svg className="seq-over" width="16" height="16">
        <circle data-shape="event" data-id={id} className="seq-dot" cx="8" cy="8" r="6" />
        <text className="seq-event-name" data-label={id} x="18" y="3">{data.name}</text>
        <Marks id={id} mark={data.mark} x={-6} y={-4} />
      </svg>
    </>
  );
}, (a, b) => a.data === b.data);

/** ?rows=nodes: a message drawn inside a node of its own. */
const RowNode = memo(function RowNode({ id, data }) {
  const d = path(data.points);
  const mid = messageMid(data.points);
  return (
    <svg className="seq-over" width="1" height="1">
      <path data-shape="message" data-id={id} className="seq-line" d={d} markerEnd="url(#seq-message)" />
      {data.label !== '' && <text className="seq-label" data-label={id} x={round(mid.x)} y={round(mid.y - 8)} textAnchor="middle">{data.label}</text>}
      <Marks id={id} mark={data.mark} x={round(mid.x)} y={round(mid.y + 12)} />
    </svg>
  );
}, (a, b) => a.data === b.data);

const PinNode = memo(function PinNode({ data }) {
  return (
    <svg className="seq-over" width="1" height="1">
      <g data-free-pin={data.no} className="seq-pin free"><path d="M0,0 L-7,-12 A8,8 0 1 1 7,-12 Z" /><text y="-12" textAnchor="middle">{data.no}</text></g>
    </svg>
  );
});

const FrameNode = memo(function FrameNode({ data }) {
  return <div className="seq-frame"><div className="seq-frame-title">{data.title}</div></div>;
});

/** A node's rectangle on the plane, from React Flow's own record of it. */
const rectOf = (node) => ({
  x: node.internals.positionAbsolute.x, y: node.internals.positionAbsolute.y,
  w: node.measured.width ?? node.width ?? 0, h: node.measured.height ?? node.height ?? 0,
});

/** A message: it works out its line from its two nodes' rectangles, as the page's LineEdge does, and from its row. */
function MessageEdge({ id, source, target, data }) {
  const a = useInternalNode(source);
  const b = useInternalNode(target);
  const store = useContext(Store);
  const { screenToFlowPosition } = useReactFlow();
  const press = useCallback((event) => store.pressRow(id, event, screenToFlowPosition), [store, id, screenToFlowPosition]);
  return <MessageLine id={id} data={data} a={a} b={b} press={press} />;
}
const MessageLine = memo(function MessageLine({ id, data, a, b, press }) {
  if (!a || !b) return null;
  const ra = rectOf(a);
  const rb = rectOf(b);
  const points = messagePoints(ra.x + ra.w / 2, rb.x + rb.w / 2, ra.y + data.sy, data.self, data.dotA, data.dotB);
  const mid = messageMid(points);
  const d = path(points);
  return (
    <>
      <path data-shape="message" data-id={id} className="seq-line" d={d} markerEnd="url(#seq-message)" />
      <path className="seq-line-hit" d={d} onPointerDown={press} />
      {data.label !== '' && <text className="seq-label" data-label={id} x={round(mid.x)} y={round(mid.y - 8)} textAnchor="middle" onPointerDown={press}>{data.label}</text>}
      <Marks id={id} mark={data.mark} x={round(mid.x)} y={round(mid.y + 12)} />
    </>
  );
}, (x, y) => x.data === y.data && x.a === y.a && x.b === y.b && x.press === y.press);

function LinkEdge({ id, source, target }) {
  const a = useInternalNode(source);
  const b = useInternalNode(target);
  return <LinkLine id={id} a={a} b={b} />;
}
const LinkLine = memo(function LinkLine({ id, a, b }) {
  if (!a || !b) return null;
  const ra = rectOf(a);
  const rb = rectOf(b);
  const d = path(linkPoints({ x: ra.x + ra.w / 2, y: ra.y + ra.h / 2 }, { x: rb.x + rb.w / 2, y: rb.y + rb.h / 2 }));
  return (
    <>
      <path data-shape="link" data-id={id} className="seq-line" d={d} markerEnd="url(#seq-open)" />
      <path className="seq-line-hit" d={d} />
    </>
  );
});

const NODE_TYPES = { lifeline: LifelineNode, line: LineNode, event: EventNode, row: RowNode, pin: PinNode, frame: FrameNode };
const EDGE_TYPES = { message: MessageEdge, link: LinkEdge };
const PRO_OPTIONS = { hideAttribution: true };
const MULTI_SELECTION_KEYS = ['Control', 'Meta'];
const HIT_OF = { lifeline: 'head', event: 'event', row: 'message', message: 'message', link: 'link' };

// ---- The plane: React Flow with the page's props (Plane.tsx), and the clicks as hits.

export function SequenceFlow({ store }) {
  const shared = store.shared;
  const root = useRef(null);
  // The gate: React Flow is mounted while the host has a size, and reads the camera once, as it mounts.
  const [sized, setSized] = useState(false);
  useEffect(() => { setSized(root.current.clientWidth > 0 && root.current.clientHeight > 0); }, []);
  return (
    <div ref={root} className="seq-a seq-plane" onContextMenu={(e) => e.preventDefault()} onPointerDownCapture={store.pressedAnywhere}>
      {sized && <Store.Provider value={store}><Flow store={store} shared={shared} root={root} /></Store.Provider>}
    </div>
  );
}

function Flow({ store, shared, root }) {
  const [camera] = useState(() => shared.camera(root.current.clientWidth, root.current.clientHeight));
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const toFlow = useRef(null);
  const clicked = useCallback((event, type, id) => {
    if (store.wasRowDrag()) return;
    const p = toFlow.current({ x: event.clientX, y: event.clientY });
    const o = store.origin();
    shared.hit({ type, id, at: { x: p.x - o.x, y: p.y - o.y }, add: event.ctrlKey || event.metaKey });
  }, [store, shared]);
  const onNodeClick = useCallback((event, node) => clicked(event, HIT_OF[node.type] || 'ground', HIT_OF[node.type] ? node.id : null), [clicked]);
  const onEdgeClick = useCallback((event, edge) => clicked(event, HIT_OF[edge.type], edge.id), [clicked]);
  const onPaneClick = useCallback((event) => clicked(event, 'ground', null), [clicked]);
  const onNodeDragStart = useCallback((event, node) => store.pressedNode(node.id), [store]);
  // ?connect=1: React Flow's own connecting, from a handle to a handle. What it joins is logged, with where it ended.
  const onConnect = useCallback((c) => { shared.connects.push({ source: c.source.replace(/:line$/, ''), target: c.target.replace(/:line$/, '') }); }, [shared]);
  const onConnectEnd = useCallback((event, state) => {
    const p = toFlow.current({ x: event.clientX, y: event.clientY });
    const o = store.origin();
    shared.connectEnds.push({ valid: state.isValid, where: shared.at({ x: p.x - o.x, y: p.y - o.y }) });
  }, [store, shared]);
  return (
    <ReactFlow
      nodes={snapshot.nodes}
      edges={snapshot.edges}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      onNodesChange={store.nodesChanged}
      onEdgesChange={store.edgesChanged}
      onViewportChange={shared.moved}
      onNodeDragStart={onNodeDragStart}
      onNodeDragStop={store.nodeDragStopped}
      defaultViewport={camera}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      onlyRenderVisibleElements={store.culled()}
      panOnScroll
      panOnScrollSpeed={1}
      zoomOnScroll={false}
      zoomOnPinch
      zoomOnDoubleClick={false}
      paneClickDistance={CLICK_DISTANCE}
      selectionKeyCode="Shift"
      selectionMode={SelectionMode.Full}
      multiSelectionKeyCode={MULTI_SELECTION_KEYS}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      onPaneClick={onPaneClick}
      deleteKeyCode={null}
      selectNodesOnDrag={false}
      nodeClickDistance={CLICK_DISTANCE}
      nodeDragThreshold={0}
      autoPanOnNodeDrag={false}
      nodesConnectable={!!store.options.connect}
      connectionMode={ConnectionMode.Loose}
      onConnect={onConnect}
      onConnectEnd={onConnectEnd}
      nodesFocusable={false}
      edgesFocusable={false}
      disableKeyboardA11y
      proOptions={PRO_OPTIONS}
    >
      <Background variant={BackgroundVariant.Dots} />
      <Controls position="bottom-left" showInteractive={false} />
      {store.options.minimap && <MiniMap pannable zoomable />}
      <Reach shared={shared} toFlow={toFlow} />
    </ReactFlow>
  );
}

/** Draws nothing: it hands screenToFlowPosition to the click callbacks, and sets a camera that comes from outside. */
function Reach({ shared, toFlow }) {
  const { screenToFlowPosition, setViewport } = useReactFlow();
  useEffect(() => { toFlow.current = screenToFlowPosition; }, [toFlow, screenToFlowPosition]);
  useEffect(() => shared.onCamera((camera) => { void setViewport(camera); }), [shared, setViewport]);
  return null;
}

/** Whether the whole view is drawn: every node is in the document and shown, and every message and succession has its line. */
export function drawn(store, host) {
  const d = store.data();
  const nodes = host.querySelectorAll('.react-flow__node');
  if (nodes.length < d.lifelines.length + d.events.length) return false;
  for (const n of nodes) if (n.style.visibility === 'hidden') return false;
  return host.querySelectorAll('[data-shape="message"], [data-shape="link"]').length === d.messages.length + d.links.length;
}
