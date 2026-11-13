// A gesture's step, and a large view's lines (plan/swarm/step-8.md, sections 2, 4 and 5): `projectStep` and
// `linesDrawn` of canvas/app/src/core/adapter.ts, and the snapshot of a view's store (canvas/app/src/plane/viewStore.ts).
// Written before the code, from the contract in the comments of `Projection`, `ProjectionRead`, `projectStep` and
// `linesDrawn`. A step must give what project() gives with the same places, by value and by object, whichever way it is
// worked out; the tests of that read both sides and compare them. The rest check what only the fast way does: no read
// of the model, edges kept, a `read` carried, and the time.
//
// The model library runs in another realm than this file: its objects are compared as JSON (plain). What the adapter
// and the store return belongs to this realm.

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { VIEWS, middleService, scaleState } from '../../test/scale-model.mjs';
import { EXAMPLE, clock, lib, loadPlanes, plain, readJSON, readText, stateFiles } from './core.mjs';

const planes = await loadPlanes();
const { project, projectStep, placesFor, linesDrawn, LARGE_VIEW, isDrawn, BOX_SHAPES, openText, viewStoreOf } = planes;

// ---- What the tests open.

const VIEW = 'v-proof';
/** The ten files' models, read through the library's normalize. */
const FILES = stateFiles().map(({ name, file }) => ({ name, model: lib.normalize(readJSON(file).model) }));
/** Each view of the ten files that a plane draws (11 views): { label, model, view }. */
const GRAPH = FILES.flatMap(({ name, model }) => Array.from(model.views).filter((view) => isDrawn(lib, view.kind)).map((view) => ({ label: `${name}, ${view.id}`, model, view })));
const viewOf = (model, id) => Array.from(model.views).find((view) => view.id === id);
/** A session of the example. */
const example = () => openText(lib, readText(EXAMPLE), { name: 'example.json' }, { now: clock() });
const BIG_TEXT = JSON.stringify(scaleState(5000));
/** A session of the 5,000-element model. */
const big = () => openText(lib, BIG_TEXT, { name: 'scale.json' }, { now: clock() });

// ---- What they compare.

const same = (a, b) => ({ nodes: plain(a.nodes), edges: plain(a.edges), rects: plain([...a.rects]), bounds: plain(a.bounds) });
/** The two projections are the same by value. */
function assertSameValue(got, want, message) {
  assert.deepEqual(same(got), same(want), message);
}
/** The two are the same by object against `p`: each node and edge is `p`'s object at its index in one exactly when it is in the other. */
function assertSameObjects(got, want, p, message) {
  assert.equal(got.nodes.length, want.nodes.length, `${message} (the nodes differ in number)`);
  assert.equal(got.edges.length, want.edges.length, `${message} (the edges differ in number)`);
  for (let i = 0; i < want.nodes.length; i++) {
    assert.equal(got.nodes[i] === p.nodes[i], want.nodes[i] === p.nodes[i], `${message} (node ${want.nodes[i].id} is ${want.nodes[i] === p.nodes[i] ? '' : 'not '}the object the start has in project(), and is ${got.nodes[i] === p.nodes[i] ? '' : 'not '}in the step)`);
  }
  for (let i = 0; i < want.edges.length; i++) {
    assert.equal(got.edges[i] === p.edges[i], want.edges[i] === p.edges[i], `${message} (edge ${want.edges[i].id} is ${want.edges[i] === p.edges[i] ? '' : 'not '}the object the start has in project(), and is ${got.edges[i] === p.edges[i] ? '' : 'not '}in the step)`);
  }
}

/**
 * One ask (or several), tried alone from `start`: its places by the plain lib and view, then the step and the whole
 * projection with the same `previous` (start) and places. Asserts they are the same by value, and by object when `objects`.
 */
function checkAsks(model, view, start, asks, label, objects = true) {
  const places = placesFor(lib, model, view, start, asks).places;
  const step = projectStep(lib, model, view, start, places, { previous: start });
  const whole = project(lib, model, view, { far: start.far, look: start.look, previous: start, places });
  assertSameValue(step, whole, `${label}: a step must read as project() with the same places, nodes, edges, rects and bounds.`);
  if (objects) assertSameObjects(step, whole, start, `${label}: a step must keep and renew the same nodes and edges as project() with the same places.`);
}

/** A node moved by (dx, dy) from where it is, as an ask. */
const moveBy = (node, dx, dy) => ({ id: node.id, move: { x: node.position.x + dx, y: node.position.y + dy } });
/** A box's resize ask: at its position, to width by height. */
const resizeTo = (node, width, height) => ({ id: node.id, resize: { x: node.position.x, y: node.position.y, width, height } });
const OPPOSITE = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
/** A border item moved to the middle of the opposite side of its owner's rectangle, as React Flow would give its square's corner. */
function acrossBorder(start, node) {
  const owner = start.rects.get(node.parentId);
  const centre = { top: { x: owner.w / 2, y: 0 }, bottom: { x: owner.w / 2, y: owner.h }, left: { x: 0, y: owner.h / 2 }, right: { x: owner.w, y: owner.h / 2 } }[OPPOSITE[node.data.side]];
  return { id: node.id, move: { x: centre.x - node.width / 2, y: centre.y - node.height / 2 } };
}
const isBox = (node) => BOX_SHAPES.includes(node.type);
const median = (numbers) => [...numbers].sort((a, b) => a - b)[Math.floor(numbers.length / 2)];
const node = (p, id) => p.nodes.find((n) => n.id === id);
/** The model's view of the 5,000-element model: { session, model, view, start, id } for the named view. */
function bigView(name, far = false) {
  const session = big();
  const view = viewOf(session.model, VIEWS[name]);
  return { session, model: session.model, view, start: project(lib, session.model, view, { far }) };
}
const MIDDLE = middleService(5000);
const N = MIDDLE.replace('Service', '');

describe("a gesture's step, and a large view's lines", () => {
  test('a step reads as the whole projection does: every node of the ten files, moved', () => {
    for (const { label, model, view } of GRAPH) {
      const start = project(lib, model, view);
      for (const n of start.nodes) {
        const ask = n.data.form === 'border' ? acrossBorder(start, n) : moveBy(n, 37, 23);
        checkAsks(model, view, start, [ask], `${label}, ${n.id} moved`);
      }
    }
  });

  test('a step reads as the whole projection does: every box of the ten files, resized', () => {
    for (const { label, model, view } of GRAPH) {
      const start = project(lib, model, view);
      for (const n of start.nodes.filter(isBox)) {
        checkAsks(model, view, start, [resizeTo(n, n.width + 60, n.height)], `${label}, ${n.id} resized wider`);
        checkAsks(model, view, start, [resizeTo(n, Math.max(80, n.width - 40), n.height)], `${label}, ${n.id} resized narrower`);
      }
    }
  });

  test('a step reads as the whole projection does: an owner resized from its top left', () => {
    const model = lib.normalize(readJSON(EXAMPLE).model);
    const view = viewOf(model, VIEW);
    const start = project(lib, model, view);
    checkAsks(model, view, start, [{ id: 'Page', resize: { x: -28, y: 32, width: 820, height: 290 } }], 'Page resized from its top left to 820 by 290');
    checkAsks(model, view, start, [{ id: 'Page', resize: { x: 232, y: 172, width: 560, height: 150 } }], 'Page resized from its top left to 560 by 150');
  });

  test("a step reads as the whole projection does: the 5,000-element model, forty asks", () => {
    const heart = { definitions: MIDDLE, deployment: `Site${N}.service`, workflows: `Handle${N}` };
    for (const name of Object.keys(VIEWS)) {
      const { model, view, start } = bigView(name);
      const label = `the 5,000-element model's ${name}`;
      const first = node(start, heart[name]);
      assert.ok(first, `${label} must draw ${heart[name]}, the box that holds border items in the middle service's cell.`);
      checkAsks(model, view, start, [resizeTo(first, first.width + 120, first.height + 60)], `${label}, ${first.id} resized 120 wider and 60 higher`, false);
      let s = 8;
      const next = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
      for (let k = 1; k < 40; k++) {
        const n = start.nodes[Math.floor(next() * start.nodes.length)];
        if (isBox(n) && next() < 0.5) {
          const width = Math.max(80, n.width + Math.floor(next() * 180) - 60);
          const height = Math.max(40, n.height + Math.floor(next() * 180) - 60);
          checkAsks(model, view, start, [resizeTo(n, width, height)], `${label}, ask ${k}: ${n.id} resized to ${width} by ${height}`, false);
        } else {
          checkAsks(model, view, start, [moveBy(n, Math.floor(next() * 400) - 200, Math.floor(next() * 400) - 200)], `${label}, ask ${k}: ${n.id} moved`, false);
        }
      }
    }
  });

  test("steps follow one another: each is laid out from the gesture's start and takes over what the last one made", () => {
    const s = example();
    const view = viewOf(s.model, VIEW);
    const start = project(lib, s.model, view);
    const host = node(start, 'Host');
    let previous = start;
    for (let k = 1; k <= 5; k++) {
      const places = placesFor(lib, s.model, view, start, [moveBy(host, 10 * k, 0)]).places;
      const step = projectStep(lib, s.model, view, start, places, { previous });
      const whole = project(lib, s.model, view, { look: start.look, previous, places });
      assertSameValue(step, whole, `Step ${k} of Host moved must read as project() with the same previous and places.`);
      step.nodes.forEach((n, i) => {
        if (n.id !== 'Host') assert.equal(n, node(start, n.id), `Step ${k} must leave ${n.id}, which did not change, the object the start has.`);
      });
      assert.equal(node(step, 'Host').data, host.data, `Step ${k} must keep Host's data object: only its place changed.`);
      previous = step;
    }
  });

  test('a step that alters nothing gives back the projection before it', () => {
    const s = example();
    const view = viewOf(s.model, VIEW);
    const start = project(lib, s.model, view);
    assert.equal(projectStep(lib, s.model, view, start, new Map(), { previous: start }), start, 'A step with no place must give back previous itself.');
    const host = node(start, 'Host');
    const stays = placesFor(lib, s.model, view, start, [moveBy(host, 0, 0)]).places;
    assert.equal(projectStep(lib, s.model, view, start, stays, { previous: start }), start, 'A step that moves Host to where it is must give back previous itself.');
  });

  test('a step keeps what React Flow set on a node', () => {
    const s = example();
    const view = viewOf(s.model, VIEW);
    const start = project(lib, s.model, view);
    const picked = { ...node(start, 'Host'), selected: true, dragging: true };
    const previous = { ...start, nodes: start.nodes.map((n) => (n.id === 'Host' ? picked : n)) };
    const moveHost = placesFor(lib, s.model, view, start, [moveBy(node(start, 'Host'), 40, 0)]).places;
    const hostStep = projectStep(lib, s.model, view, start, moveHost, { previous });
    const moved = node(hostStep, 'Host');
    assert.notEqual(moved, picked, 'A step that moves Host must give Host a new node.');
    assert.equal(moved.selected, true, "A step that moves Host must keep the node's `selected`.");
    assert.equal(moved.dragging, true, "A step that moves Host must keep the node's `dragging`.");
    const moveApp = placesFor(lib, s.model, view, start, [moveBy(node(start, 'App'), 0, 40)]).places;
    const appStep = projectStep(lib, s.model, view, start, moveApp, { previous });
    assert.equal(node(appStep, 'Host'), picked, "A step that moves App must give Host's node as the very object previous has.");
  });

  test('a step makes no edge anew', () => {
    const message = 'A step gave a new edges array: no edge reads a place, so edges must be previous.edges itself.';
    const cases = [];
    const s = example();
    const view = viewOf(s.model, VIEW);
    cases.push({ model: s.model, view, start: project(lib, s.model, view), id: 'Host', label: "the example's Host" });
    const w = bigView('workflows');
    cases.push({ ...w, id: `Handle${N}.receive`, label: "workflows' receive" });
    for (const { model, view: v, start, id, label } of cases) {
      const n = node(start, id);
      const first = placesFor(lib, model, v, start, [moveBy(n, 20, 0)]).places;
      const one = projectStep(lib, model, v, start, first, { previous: start });
      assert.ok(one !== start, `${label} moved must give a step of its own.`);
      assert.equal(one.edges, start.edges, `${label}, from the start: ${message}`);
      const second = placesFor(lib, model, v, start, [moveBy(n, 40, 10)]).places;
      const two = projectStep(lib, model, v, start, second, { previous: one });
      assert.equal(two.edges, one.edges, `${label}, from a step before: ${message}`);
    }
  });

  test('a projection carries what it read, and a step\'s projection the same', () => {
    const s = example();
    const view = viewOf(s.model, VIEW);
    const start = project(lib, s.model, view);
    const read = start.read;
    assert.ok(typeof read === 'object' && read !== null, 'project() gave a projection with no read: step 8 keeps what was read of the model with the projection.');
    assert.equal(read.model, s.model, "A projection's read must name the model object it was read from.");
    assert.equal(read.view, view.id, "A projection's read must name the id of the view it was read for.");
    const places = placesFor(lib, s.model, view, start, [moveBy(node(start, 'Host'), 40, 0)]).places;
    assert.equal(projectStep(lib, s.model, view, start, places, { previous: start }).read, start.read, "A step's projection must carry the read the start has.");
    assert.equal({ ...start, nodes: [...start.nodes] }.read, start.read, 'A copy of a projection must carry its read: read is an own property of the object.');
  });

  test('a step reads the model no more: no lookups, no layout', () => {
    const { model, view, start } = bigView('definitions');
    const n = node(start, MIDDLE);
    let reading = 0;
    let layout = 0;
    const counting = Object.create(lib);
    Object.defineProperty(counting, 'reading', { value: (...args) => { reading++; return lib.reading(...args); } });
    const watched = new Proxy(view, { get(target, key) { if (key === 'layout') layout++; return Reflect.get(target, key); } });
    const run = (what, from, steps, ask, far) => {
      reading = 0;
      layout = 0;
      let previous = from;
      for (let k = 1; k <= steps; k++) {
        const places = placesFor(lib, model, view, from, [ask(k)]).places;
        const options = far ? { far: true, previous } : { previous };
        const before = { reading, layout };
        previous = projectStep(counting, model, watched, from, places, options);
        void before;
      }
      assert.equal(reading, 0, `${steps} steps ${what} called lib.reading ${reading} times: a step is worked out from what the gesture's start read.`);
      assert.equal(layout, 0, `${steps} steps ${what} read view.layout ${layout} times: a step is worked out from what the gesture's start read.`);
    };
    run('moving the middle service', start, 20, (k) => moveBy(n, k, 0), false);
    run('resizing the middle service', start, 5, (k) => resizeTo(n, n.width + 10 * k, n.height), false);
    const farStart = project(lib, model, view, { far: true });
    run('moving the middle service of a far view', farStart, 5, (k) => moveBy(node(farStart, MIDDLE), k, 0), true);
  });

  test("a step of the 5,000-element model's general view is worked out in under 5 ms", (t) => {
    const { model, view, start } = bigView('definitions');
    const n = node(start, MIDDLE);
    let previous = start;
    const times = [];
    for (let k = 1; k <= 60; k++) {
      const places = placesFor(lib, model, view, start, [moveBy(n, k, 0)]).places;
      const from = performance.now();
      previous = projectStep(lib, model, view, start, places, { previous });
      if (k > 10) times.push(performance.now() - from);
    }
    const ms = median(times);
    t.diagnostic(`A step is worked out in ${ms.toFixed(2)} ms by the median of 50`);
    assert.ok(ms < 5, `A step of definitions is worked out in ${ms.toFixed(1)} ms by the median of 50, against 5 ms.`);
  });

  test('a change that altered no node is in what the next gesture starts from', () => {
    const state = {
      model: {
        format: lib.FORMAT,
        package: { name: 'Hand', doc: '' },
        elements: [
          { id: 'Outer', kind: 'PartDefinition', name: 'Outer', abstract: false, doc: '' },
          { id: 'inner', kind: 'PartUsage', name: 'inner', owner: 'Outer', multiplicity: '', doc: '' },
        ],
        relationships: [],
        views: [{ id: 'v', kind: 'GeneralView', name: 'v', layout: { Outer: { x: 0, y: 0, w: 200, h: 120 }, inner: { x: 300, y: 60, w: 100, h: 40 } } }],
      },
      notes: [],
      archive: [],
      changes: [],
    };
    const s = openText(lib, JSON.stringify(state), { name: 'hand.json' }, { now: clock() });
    const at = () => viewOf(s.model, 'v');
    const p1 = project(lib, s.model, at());
    assert.equal(node(p1, 'Outer').width, 412, 'Outer must be drawn 412 wide: it holds inner, which ends at 400, and the padding.');
    s.history.edit(() => { at().layout.Outer.w = 240; return 'Resized part def Outer'; });
    const p2 = project(lib, s.model, at(), { previous: p1 });
    assert.equal(p2, p1, 'A saved width under what Outer holds alters no node: project() must give back previous.');
    const places = placesFor(lib, s.model, at(), p2, [{ id: 'inner', move: { x: 40, y: 60 } }]).places;
    const step = projectStep(lib, s.model, at(), p2, places, { previous: p2 });
    assert.equal(node(step, 'Outer').width, 240, "A step from p2 must draw Outer 240 wide, the saved width the change wrote, as project() with those places does.");
    assertSameValue(step, project(lib, s.model, at(), { look: p2.look, previous: p2, places }), 'A step from p2 must read as project() with the same places.');
  });

  test('what the fast way does not cover goes the slow way, with the same result', () => {
    const s = example();
    const view = viewOf(s.model, VIEW);
    const start = project(lib, s.model, view);
    const places = placesFor(lib, s.model, view, start, [moveBy(node(start, 'Host'), 40, 20)]).places;
    const whole = (options) => project(lib, s.model, view, { look: start.look, places, ...options });

    // A start with no read.
    const noRead = { ...start, read: undefined };
    assertSameValue(projectStep(lib, s.model, view, noRead, places, { previous: start }), whole({ far: false, previous: start }), 'A start with no read must give what project() gives.');
    // Far, with a near start.
    assertSameValue(projectStep(lib, s.model, view, start, places, { far: true, previous: start }), whole({ far: true, previous: start }), 'A far step from a near start must give what project() gives.');
    const farStep = projectStep(lib, s.model, view, start, places, { far: true, previous: start });
    assert.ok(farStep.nodes.every((n) => n.className.split(' ').includes('far')), 'A far step must give far nodes.');
    // A place for an element the view does not place.
    const extra = example();
    extra.history.edit(() => { extra.model.elements.push({ id: 'Extra', kind: 'PartDefinition', name: 'Extra', doc: '', abstract: false, code: [] }); return 'Added part def Extra'; });
    const extraView = viewOf(extra.model, VIEW);
    const extraStart = project(lib, extra.model, extraView);
    assert.equal(node(extraStart, 'Extra'), undefined, 'The view must not place Extra: no layout holds it.');
    const extraPlaces = new Map(placesFor(lib, extra.model, extraView, extraStart, [moveBy(node(extraStart, 'Host'), 40, 20)]).places);
    extraPlaces.set('Extra', { x: 40, y: 700, w: 200, h: 80 });
    assertSameValue(
      projectStep(lib, extra.model, extraView, extraStart, extraPlaces, { previous: extraStart }),
      project(lib, extra.model, extraView, { look: extraStart.look, previous: extraStart, places: extraPlaces }),
      'A place for an element the start does not show must give what project() gives.',
    );
    // A start projected from another session's model of the same file.
    const other = example();
    const otherView = viewOf(other.model, VIEW);
    const otherStart = project(lib, other.model, otherView);
    assertSameValue(projectStep(lib, s.model, view, otherStart, places, { previous: start }), whole({ far: false, previous: start }), "A start read from another session's model must give what project() gives.");
    // A near step after a far one.
    const farBefore = whole({ far: true });
    assert.equal(farBefore.edges.find((e) => e.id === 'mount').data.label, '', 'The far projection must have no label on mount.');
    const back = projectStep(lib, s.model, view, start, places, { far: false, previous: farBefore });
    assertSameValue(back, whole({ far: false, previous: farBefore }), 'A near step after a far one must give what project() gives.');
    assert.notEqual(back.edges, farBefore.edges, "A near step after a far one must give edges of its own, not the far projection's.");
    assert.notEqual(back.edges.find((e) => e.id === 'mount').data.label, '', 'A near step after a far one must give mount its label again.');
  });

  test('linesDrawn: a large view draws no line while it is far', () => {
    assert.equal(LARGE_VIEW, 300, 'A large view is one of more than 300 nodes.');
    assert.equal(linesDrawn(301, true), false, 'linesDrawn(301, true) is true: a view of more than 300 nodes draws no line while it is far.');
    assert.equal(linesDrawn(300, true), true, 'A far view of exactly 300 nodes must draw its lines.');
    assert.equal(linesDrawn(301, false), true, 'A near view of 301 nodes must draw its lines.');
    assert.equal(linesDrawn(5000, false), true, 'A near view of 5,000 nodes must draw its lines.');
    assert.equal(linesDrawn(0, true), true, 'A far view of no node must draw its lines.');
    assert.equal(linesDrawn(13, true), true, 'A far view of 13 nodes must draw its lines.');
  });

  test("a large view's snapshot has no edge while it is far, and its edges again when it is near", () => {
    const s = big();
    const store = viewStoreOf(s, VIEWS.workflows);
    let calls = 0;
    store.subscribe(() => { calls++; });
    store.camera(736, 828);
    const far = store.getSnapshot();
    assert.equal(far.far, true, "The fit of workflows must be far.");
    assert.equal(far.edges.length, 0, `The far snapshot of workflows holds ${far.edges.length} edges: a large view hands its plane no line while it is far.`);
    assert.equal(store.getSnapshot().edges, far.edges, 'The far snapshot must hand the same edges array at every read.');
    store.moved({ x: 0, y: 0, zoom: 1 });
    const near = store.getSnapshot();
    assert.equal(near.far, false, 'At 100% the snapshot must be near.');
    assert.equal(near.edges.length, 1536, `The near snapshot of workflows holds ${near.edges.length} edges, not its 1,536.`);
    store.moved({ x: 0, y: 0, zoom: 0.05 });
    const again = store.getSnapshot();
    assert.equal(again.edges.length, 0, `The far snapshot of workflows holds ${again.edges.length} edges again: a large view hands its plane no line while it is far.`);
    assert.equal(again.edges, far.edges, 'The far snapshot must hand the same empty array each time it is far.');
    store.moved({ x: 0, y: 0, zoom: 1 });
    const last = store.getSnapshot();
    assert.deepEqual(last.edges.map((e) => e.id), near.edges.map((e) => e.id), 'The lines must come back with the same ids in the same order.');
    assert.equal(calls, 4, 'The subscriber must be called once at the fit (a crossing to far) and once at each move over 25%: four times in all.');
  });

  test('a small view keeps its lines while it is far', () => {
    const s = example();
    const store = viewStoreOf(s, VIEW);
    store.subscribe(() => {});
    store.camera(736, 828);
    store.moved({ x: 0, y: 0, zoom: 0.1 });
    const snapshot = store.getSnapshot();
    assert.equal(snapshot.far, true, 'At 10% the example must be far.');
    assert.equal(snapshot.edges.length, 6, 'A view of 13 nodes must keep its 6 lines while far.');
  });
});
