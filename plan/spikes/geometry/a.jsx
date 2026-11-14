// Candidate A, a graph body: the geometry view as nodes that React Flow draws on a plane, built as the page builds its
// planes (canvas/app/src/plane/Plane.tsx and viewStore.ts): controlled nodes from a store outside React, React Flow's
// own changes read as the steps of a gesture, and only the gesture's end written.
//
// Three parts: project() (what a reader would give: the layout as React Flow's nodes), sideOf() (what the view's store
// would do with React Flow's changes), and the components (the plane's props and three node components).

import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Background, BackgroundVariant, Controls, ReactFlow, useReactFlow, useStore } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Axes, AxisMarker } from './axes.jsx';
import { AXIS, CLICK_DISTANCE, barFor, drawnBox } from './layout.js';

// ---- The projection: the layout as React Flow's nodes.

/** A node's own element takes no pointer: only what is drawn in it does, so a circle's corners and a footprint's overflowing words hit right. */
const PASS = { pointerEvents: 'none' };
const NONE = [];
const AXES_PAD = 16;
const DATA_KEYS = ['el', 'shape', 'w', 'h', 'ox', 'oy', 'inside', 'keyword', 'name', 'text', 'toScale', 'badge', 'pins', 'picked', 'no', 'bar', 'scale', 'unit'];
const sameData = (a, b) => DATA_KEYS.every((k) => a[k] === b[k]);

/**
 * The view as React Flow's nodes: a footprint, then what it holds, then the axes, then the free notes' pins.
 * - A footprint's node is the rectangle around everything it draws (drawnBox: its outline, its marks, its words below
 *   it), so that React Flow, which mounts a node only while its rectangle is in sight when onlyRenderVisibleElements
 *   is on, keeps the words of a footprint whose outline has left the plane. The outline stands at data.ox, data.oy in
 *   it. With window.SPIKE_BOX_FOOT the node is the outline's rectangle alone, to show what that does.
 * - Its `position` is its node's corner from its owner's node's corner (React Flow's parent-relative place), which
 *   the layout works out from the owner's origin (its bottom-left corner, or a round owner's centre) and y up.
 * - `zIndex` is the place in the drawing order, so that what the layout draws later lies on top, as footAt() says.
 *   (window.SPIKE_NO_Z leaves it out, and window.SPIKE_NO_PASS the `style` below, to show what each is for.)
 * - `selected` is React Flow's own field, as the page's store sets it. With window.SPIKE_PICK_IN_DATA the pick goes
 *   into the node's `data` instead and `selected` stays false, so that React Flow never raises a picked footprint.
 * - A node that reads the same as in `previous` is the same object; one that only moved keeps its `data`.
 * - `frame` ({ id, dx, dy }): the nodes become children of the frame node `id`, their ids carry its id, and the
 *   view's origin is at dx, dy from the frame's corner.
 */
export function project(snapshot, previous, frame) {
  const { L, selection, marks } = snapshot;
  const before = new Map();
  if (previous) for (const n of previous) before.set(n.id, n);
  const prefix = frame ? frame.id + '/' : '';
  const dx = frame ? frame.dx : 0;
  const dy = frame ? frame.dy : 0;
  const top = frame ? frame.id : undefined;
  let same = !!previous;
  const nodes = [];
  const put = (node) => {
    const was = before.get(node.id);
    if (was && sameData(was.data, node.data)) {
      node.data = was.data;
      if (was.position.x === node.position.x && was.position.y === node.position.y && was.width === node.width && was.height === node.height
        && was.parentId === node.parentId && was.zIndex === node.zIndex && !!was.selected === !!node.selected && was.className === node.className) node = was;
    }
    if (!previous || previous[nodes.length] !== node) same = false;
    nodes.push(node);
  };
  const boxes = new Map();
  L.feet.forEach((foot, i) => {
    const box = window.SPIKE_BOX_FOOT ? foot : drawnBox(foot);
    boxes.set(foot.id, box);
    const owner = foot.parent === null ? null : boxes.get(foot.parent);
    put({
      id: prefix + foot.id,
      type: 'foot',
      position: owner ? { x: box.x - owner.x, y: box.y - owner.y } : { x: box.x + dx, y: box.y + dy },
      parentId: owner ? prefix + foot.parent : top,
      width: box.w,
      height: box.h,
      measured: { width: box.w, height: box.h },
      zIndex: window.SPIKE_NO_Z ? undefined : i + 1,
      style: window.SPIKE_NO_PASS ? undefined : PASS,
      selected: !window.SPIKE_PICK_IN_DATA && selection.has(foot.id),
      className: 'geo-node',
      data: { el: foot.id, shape: foot.shape, w: foot.w, h: foot.h, ox: foot.x - box.x, oy: foot.y - box.y, inside: foot.inside, keyword: foot.keyword, name: foot.name, text: foot.text, toScale: foot.toScale, badge: marks.badges[foot.id] || 0, pins: marks.pins[foot.id] || NONE, picked: !!window.SPIKE_PICK_IN_DATA && selection.has(foot.id) },
    });
  });
  const size = { width: AXIS + AXES_PAD + 80, height: AXIS + AXES_PAD + 32 };
  put({
    id: prefix + '§axes', type: 'axes', position: { x: L.origin.x - AXES_PAD + dx, y: L.origin.y - AXIS - AXES_PAD + dy }, parentId: top,
    ...size, measured: size, zIndex: L.feet.length + 1, style: PASS, selectable: false, draggable: false, className: 'geo-node', data: { bar: L.bar, scale: L.scale, unit: L.unit },
  });
  marks.free.forEach((pin, i) => put({
    id: prefix + '§pin' + pin.no, type: 'pin', position: { x: pin.x - 9 + dx, y: pin.y - 9 + dy }, parentId: top,
    width: 18, height: 18, measured: { width: 18, height: 18 }, zIndex: L.feet.length + 2 + i, selectable: false, draggable: false, className: 'geo-node', data: { no: pin.no },
  }));
  return same && previous.length === nodes.length ? previous : nodes;
}

// ---- The store's graph side: React Flow's changes.

const SIDES = new WeakMap();

/**
 * What the view's store does for a graph body, kept with the store: the nodes as one array that changes only when a
 * node does, and React Flow's own changes. A `position` change with `dragging` true is a step of a drag, by how far
 * the node is from where it was at the press; it is no gesture until it has gone CLICK_DISTANCE screen px. The step
 * is the store's (store.step), which answers with the rounded place, and React Flow draws that. `dragging` false
 * ends it (store.end). A `select` change picks nothing: the nodes it names get a new object that reads as the
 * selection says, since React Flow has by then changed its own record of them.
 */
export function sideOf(store, frame) {
  const kept = SIDES.get(store);
  if (kept) return kept;
  const prefix = frame ? frame.id + '/' : '';
  const elOf = (id) => id.slice(prefix.length);
  const listeners = new Set();
  let seen = null;
  let nodes = [];
  let gesture = null;
  const tell = () => { for (const l of [...listeners]) l(); };
  const refresh = () => {
    const s = store.getSnapshot();
    if (s === seen) return false;
    seen = s;
    const next = project(s, nodes, frame);
    if (next === nodes) return false;
    nodes = next;
    return true;
  };
  store.subscribe(() => { if (refresh()) tell(); });
  const side = {
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getNodes() { refresh(); return nodes; },
    nodesChanged(changes) {
      refresh();
      let renewed = null;
      const steps = [];
      let ended = false;
      for (const c of changes) {
        if (c.type === 'select') {
          const at = (renewed || nodes).findIndex((n) => n.id === c.id);
          if (at < 0) continue;
          renewed = renewed || [...nodes];
          renewed[at] = { ...renewed[at], selected: !window.SPIKE_PICK_IN_DATA && store.getSnapshot().selection.has(elOf(c.id)) };
        } else if (c.type === 'position' && c.position) {
          if (c.dragging === true) steps.push(c);
          else if (c.dragging === false && gesture && gesture.asks.has(c.id)) { steps.push(c); ended = true; }
        }
      }
      if (renewed) nodes = renewed;
      if (steps.length > 0 && !gesture && !ended) gesture = { start: new Map(nodes.map((n) => [n.id, n.position])), asks: new Map(), passed: false };
      if (steps.length === 0 || !gesture) { if (renewed) tell(); return; }
      for (const c of steps) {
        const from = gesture.start.get(c.id);
        if (from) gesture.asks.set(c.id, { id: elOf(c.id), dx: c.position.x - from.x, dy: c.position.y - from.y });
      }
      const zoom = store.camera ? store.camera.zoom : 1;
      const asks = [...gesture.asks.values()];
      if (!gesture.passed && asks.some((a) => Math.max(Math.abs(a.dx), Math.abs(a.dy)) * zoom >= CLICK_DISTANCE)) gesture.passed = true;
      const passed = gesture.passed;
      if (ended) gesture = null;
      // The store tells its subscribers, which refreshes the nodes and tells React once for the step.
      if (passed) { store.step(asks); if (ended) store.end(); }
      if (renewed) tell();
    },
  };
  SIDES.set(store, side);
  return side;
}

// ---- The node components.

/**
 * A footprint: its outline as SVG, its two lines of words, its marks on its top edge. SVG, because a circle needs it for
 * its hit area, and because the size of a box drawn by CSS (as BoxNode's is) is rounded to whole px of the view before
 * the plane's zoom, so it is not to scale: run.cjs measures both (window.SPIKE_CSS_OUTLINE draws the CSS box). For
 * the same reason the outline is put at data.ox, data.oy in its node by a transform, not by left and top: a place
 * given by CSS layout is rounded to whole px too (window.SPIKE_PLACE_BY_LAYOUT shows it: 1.2 px off at zoom 4).
 */
const Foot = memo(function Foot({ data, selected }) {
  const { w, h } = data;
  const mark = data.shape === 'circle' ? w / 2 : w - 12;
  return (
    <div className={'footprint' + (data.toScale ? '' : ' no-shape') + (selected || data.picked ? ' selected' : '')} data-el={data.el} style={window.SPIKE_PLACE_BY_LAYOUT ? { left: data.ox, top: data.oy, width: w, height: h } : { transform: `translate(${data.ox}px,${data.oy}px)`, width: w, height: h }}>
      {window.SPIKE_CSS_OUTLINE && data.shape === 'rect'
        ? <div className="outline css-outline" style={{ width: w, height: h }} />
        : (
          <svg className="foot-shape" width={w} height={h}>
            {data.shape === 'circle' ? <circle className="outline" cx={w / 2} cy={h / 2} r={w / 2} /> : <rect className="outline" x="0" y="0" width={w} height={h} />}
          </svg>
        )}
      <div className={data.inside ? 'words inside' : 'words below'}>
        <div className="head"><span className="kw">{data.keyword}</span><span className="uname">{data.name}</span></div>
        <div className="geo-dims">{data.text}</div>
      </div>
      {data.badge > 0 && <span className="badge" data-badge={data.el} style={{ left: mark - 20 * data.pins.length }}>{data.badge}</span>}
      {data.pins.map((no, i) => <span className="pin" data-pin={no} key={no} style={{ left: mark - 20 * i }}>{no}</span>)}
    </div>
  );
}, (a, b) => a.data === b.data && a.selected === b.selected);

function FootNode({ data, selected }) { return <Foot data={data} selected={!!selected} />; }

const zoomOf = (state) => state.transform[2];

/** The axes and the scale bar. With window.SPIKE_BAR_REDRAWN the bar is redrawn for the zoom (React Flow's useStore): "5 m" far out, "0.5 m" close in. */
const AxesNode = memo(function AxesNode({ data }) {
  const zoom = useStore(window.SPIKE_BAR_REDRAWN ? zoomOf : () => 1);
  const now = zoom === 1 ? data.bar : barFor(window.SysMLModel, data.scale * zoom, data.unit);
  const bar = zoom === 1 ? data.bar : { len: now.n * data.scale, words: now.words };
  return (
    <svg className="axes-shape" width="1" height="1">
      <defs><AxisMarker id="m-geo-axis" /></defs>
      <Axes ox={AXES_PAD} oy={AXIS + AXES_PAD} bar={bar} marker="m-geo-axis" />
    </svg>
  );
}, (a, b) => a.data === b.data);

const PinNode = memo(function PinNode({ data }) {
  return <span className="pin is-free" data-pin={data.no}>{data.no}</span>;
}, (a, b) => a.data === b.data);

export const NODE_TYPES = { foot: FootNode, axes: AxesNode, pin: PinNode };

// ---- The plane: React Flow's props, as Plane.tsx gives them.

const NO_EDGES = [];
const PRO_OPTIONS = { hideAttribution: true };
const KEYS = ['Control', 'Meta'];
const LARGE_VIEW = 300;

/** What a click on a node is: a pin, a badge or a footprint, by what was pressed in it. */
export function hitOf(event, node, at, elOf) {
  const target = event.target instanceof Element ? event.target : null;
  const pin = target && target.closest('[data-pin]');
  if (pin) return { type: 'pin', id: pin.getAttribute('data-pin'), at, add: false };
  return { type: 'el', id: elOf(node.id), at, add: event.ctrlKey || event.metaKey };
}

/**
 * The body: React Flow, mounted only while the host has a size (the page's gate). Three props are there only to try
 * to break it: `snap` (a snap grid on the plane), `cull` (onlyRenderVisibleElements, which the page sets for a view of
 * more than 300 nodes) and `elevate` (elevateNodesOnSelect, React Flow's default, which the page does not turn off).
 */
export function GraphBody({ store, snap, cull, elevate }) {
  const root = useRef(null);
  const [sized, setSized] = useState(false);
  useLayoutEffect(() => {
    const el = root.current;
    const has = (width, height) => width > 0 && height > 0;
    setSized(has(el.clientWidth, el.clientHeight));
    const observer = new ResizeObserver((entries) => {
      const box = entries[entries.length - 1].contentRect;
      const next = has(box.width, box.height);
      setSized((was) => (was === next ? was : next));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return <div ref={root} className="geo-host graph-body">{sized && <Flow store={store} root={root} snap={snap} cull={cull} elevate={elevate} />}</div>;
}

function Flow({ store, root, snap, cull, elevate }) {
  const side = sideOf(store);
  const [camera] = useState(() => store.cameraFor(root.current.clientWidth, root.current.clientHeight));
  const nodes = useSyncExternalStore(side.subscribe, side.getNodes);
  const toFlow = useRef(null);
  const at = (event) => (toFlow.current ? toFlow.current({ x: event.clientX, y: event.clientY }) : { x: 0, y: 0 });
  const onNodeClick = useCallback((event, node) => store.click(hitOf(event, node, at(event), (id) => id)), [store]);
  const onPaneClick = useCallback((event) => store.click({ type: 'ground', id: null, at: at(event), add: event.ctrlKey || event.metaKey }), [store]);
  // A right-click, where the page's plane opens its palette: the same Hit, marked `menu`.
  const onNodeContextMenu = useCallback((event, node) => { event.preventDefault(); store.click({ ...hitOf(event, node, at(event), (id) => id), menu: true }); }, [store]);
  const onPaneContextMenu = useCallback((event) => { event.preventDefault(); store.click({ type: 'ground', id: null, at: at(event), add: false, menu: true }); }, [store]);
  return (
    <ReactFlow
      nodes={nodes}
      edges={NO_EDGES}
      nodeTypes={NODE_TYPES}
      onNodesChange={side.nodesChanged}
      onViewportChange={store.moved}
      defaultViewport={camera}
      minZoom={0.02}
      maxZoom={4}
      onlyRenderVisibleElements={cull === undefined ? nodes.length > LARGE_VIEW : cull}
      panOnScroll
      panOnScrollSpeed={1}
      zoomOnScroll={false}
      zoomOnPinch
      zoomOnDoubleClick={false}
      paneClickDistance={CLICK_DISTANCE}
      selectionKeyCode="Shift"
      multiSelectionKeyCode={KEYS}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      onNodeContextMenu={onNodeContextMenu}
      onPaneContextMenu={onPaneContextMenu}
      deleteKeyCode={null}
      selectNodesOnDrag={false}
      nodeClickDistance={CLICK_DISTANCE}
      nodeDragThreshold={0}
      autoPanOnNodeDrag={false}
      nodesConnectable={false}
      nodesFocusable={false}
      edgesFocusable={false}
      disableKeyboardA11y
      elevateNodesOnSelect={!!elevate}
      snapToGrid={!!snap}
      snapGrid={snap ? [snap, snap] : undefined}
      proOptions={PRO_OPTIONS}
    >
      <Background variant={BackgroundVariant.Dots} />
      <Controls position="bottom-left" showInteractive={false} />
      <Reach store={store} toFlow={toFlow} />
    </ReactFlow>
  );
}

/** Draws nothing: reaches React Flow's screenToFlowPosition for the clicks, and its setViewport for the host. */
function Reach({ store, toFlow }) {
  const { screenToFlowPosition, setViewport } = useReactFlow();
  useEffect(() => {
    toFlow.current = screenToFlowPosition;
    store.host = { setCamera: (camera) => setViewport(camera) };
    return () => { toFlow.current = null; store.host = null; };
  }, [store, toFlow, screenToFlowPosition, setViewport]);
  return null;
}
