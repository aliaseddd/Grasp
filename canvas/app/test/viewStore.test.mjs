// A view's store: canvas/app/src/plane/viewStore.ts, the contract in the comment of ViewStore. It keeps one view of an
// open file outside React: its projection, its camera, far or near, and which nodes are selected. The tests open
// sessions from the example, from the interconnection fixture, from the grid fixture and from the 5,000-element model,
// and check what the store promises, not how it keeps it (plan/notes.md, "The store's tests").
//
// The model library runs in another realm: compare ITS objects as JSON. What the store returns belongs to this realm.

import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, test } from 'node:test';
import { scaleState } from '../../test/scale-model.mjs';
import { EXAMPLE, FIXTURES, clock, lib, loadPlanes, plain, readText } from './core.mjs';

const VIEW = 'v-proof';
const PLACED = ['Page', 'Page.hosts', 'Page.hosts.api', 'Page.app', 'Page.app.api', 'Host', 'Host.api', 'App', 'App.api', 'StrongholdApp', 'ServerHost', 'OnlineHost', 'DevHost'];

/** A session from a file's text. */
async function session(text = readText(EXAMPLE), name = 'example.json') {
  const core = await loadPlanes();
  return core.openText(lib, text, { name }, { now: clock() });
}
const fixture = (name) => readText(path.join(FIXTURES, name));
/** A session of the example and the store of its one view. */
async function example() {
  const { viewStoreOf } = await loadPlanes();
  const s = await session();
  return { session: s, store: viewStoreOf(s, VIEW) };
}

const el = (s, id) => s.model.elements.find((e) => e.id === id);
const rename = (s, id, name) => s.history.edit(() => { el(s, id).name = name; return 'Renamed to part def ' + name; });
const node = (snapshot, id) => snapshot.nodes.find((n) => n.id === id);
const edge = (snapshot, id) => snapshot.edges.find((e) => e.id === id);
/** Subscribes, counting the calls and keeping what getSnapshot() and `projected` gave inside each. */
function listen(store) {
  const calls = { n: 0, seen: [] };
  const stop = store.subscribe(() => { calls.n++; calls.seen.push({ snapshot: store.getSnapshot(), projected: store.projected }); });
  return { calls, stop };
}

describe("a view's store", () => {
  test("a session's view has one store", async () => {
    const { viewStoreOf, viewStoresOf } = await loadPlanes();
    const a = await session(fixture('interconnection.json'));
    const b = await session(fixture('interconnection.json'));
    const ic = viewStoreOf(a, 'v-ic');
    assert.equal(viewStoreOf(a, 'v-ic'), ic, 'The same view of the same session must give the same store at each call.');
    assert.equal(viewStoreOf(a, 'v-ic'), viewStoreOf(a, 'v-ic'), 'A third call must still give that store.');
    const defs = viewStoreOf(a, 'v-defs');
    assert.notEqual(defs, ic, 'Another view of the session must have a store of its own.');
    assert.notEqual(viewStoreOf(b, 'v-ic'), ic, "Another session must have its own store for the same view id.");
    const stores = viewStoresOf(a);
    assert.equal(stores.size, 2, 'viewStoresOf must hold the two stores made so far for the session.');
    assert.equal(stores.get('v-ic'), ic, 'viewStoresOf must hold the store of v-ic by its view id.');
    assert.equal(stores.get('v-defs'), defs, 'viewStoresOf must hold the store of v-defs by its view id.');
    assert.equal(viewStoresOf(b).size, 1, "viewStoresOf of another session must hold only that session's stores.");
  });

  test('a snapshot is the same object until something in it changes', async () => {
    const { store } = await example();
    const first = store.getSnapshot();
    assert.equal(store.getSnapshot(), first, 'getSnapshot() twice with nothing changed must give one object.');
    assert.deepEqual(first.nodes.map((n) => n.id).sort(), [...PLACED].sort(), 'The snapshot must have a node for each element the view places.');
    assert.equal(first.edges.length, 6, 'The snapshot must have an edge for each of the six lines.');
    assert.ok(edge(first, 'mount'), 'The snapshot must have an edge for the line mount.');
    assert.equal(first.far, false, 'A view not yet moved to a far zoom must not be far.');
  });

  test('a store with no subscriber only goes stale', async () => {
    const { session: s, store } = await example();
    store.getSnapshot();
    assert.equal(store.projected, 1, 'The first getSnapshot() must project once.');
    rename(s, 'Host', 'Machine');
    assert.equal(store.projected, 1, 'A store with no subscriber must not project at a change, only go stale.');
    const next = store.getSnapshot();
    assert.equal(store.projected, 2, 'The next getSnapshot() after a change must project again.');
    assert.equal(node(next, 'Host').data.name, 'Machine', 'The new snapshot must show the new name.');
    store.getSnapshot();
    assert.equal(store.projected, 2, 'Another getSnapshot() with nothing changed must not project.');
  });

  test('a live store projects when its view can have changed, and tells its subscribers once', async () => {
    const { session: s, store } = await example();
    const before = store.getSnapshot();
    const { calls, stop } = listen(store);
    const projected = store.projected;
    rename(s, 'Host', 'Machine');
    assert.equal(calls.n, 1, 'A rename must call the subscriber exactly once.');
    assert.equal(store.projected, projected + 1, 'A rename must make a live store project once.');
    assert.notEqual(calls.seen[0].snapshot, before, 'getSnapshot() inside the listener must already give the new snapshot, not the old one.');
    assert.equal(node(calls.seen[0].snapshot, 'Host').data.name, 'Machine', 'The snapshot read inside the listener must show the new name.');
    assert.equal(calls.seen[0].projected, projected + 1, 'The store must have projected before it calls its subscribers.');
    stop();
    rename(s, 'Host', 'Engine');
    assert.equal(calls.n, 1, 'After unsubscribing, a further rename must call nobody.');
  });

  test("a change to another view's places leaves the snapshot the object it was", async () => {
    const { viewStoreOf } = await loadPlanes();
    const s = await session(fixture('interconnection.json'));
    const ic = viewStoreOf(s, 'v-ic');
    const defs = viewStoreOf(s, 'v-defs');
    const first = ic.getSnapshot();
    defs.getSnapshot();
    const onIc = listen(ic);
    const onDefs = listen(defs);
    const projected = ic.projected;
    s.history.edit(() => { s.model.views.find((v) => v.id === 'v-defs').layout.Fuel.x += 10; return 'Moved part def Fuel'; });
    assert.equal(onIc.calls.n, 0, "A change to a place in v-defs only must not call a listener of v-ic's store.");
    assert.equal(ic.projected, projected, "A change to a place in v-defs only must not make v-ic's store project.");
    assert.equal(ic.getSnapshot(), first, "v-ic's snapshot must be the very object it was.");
    assert.equal(onDefs.calls.n, 1, 'A live store on v-defs must be told of the change to its own places.');

    // v-ic places every element of the file, so an element it does not place is added first, outside any layout.
    s.history.edit(() => {
      s.model.elements.push({ id: 'Spare', kind: 'PartDefinition', name: 'Spare', doc: '', abstract: false, code: [] });
      return 'Added part def Spare';
    });
    const settled = ic.getSnapshot();
    const told = onIc.calls.n;
    s.history.edit(() => { s.model.elements.find((e) => e.id === 'Spare').name = 'Reserve'; return 'Renamed to part def Reserve'; });
    assert.equal(ic.getSnapshot(), settled, 'A rename of an element v-ic does not place must leave its snapshot the very object it was.');
    assert.equal(onIc.calls.n, told, "A rename of an element v-ic does not place must call no listener of v-ic's store.");
  });

  test('the end of a run projects nothing', async () => {
    const { session: s, store } = await example();
    store.getSnapshot();
    const { calls } = listen(store);
    s.history.edit(() => { el(s, 'Host').name = 'Machine'; return 'Renamed to part def Machine'; }, 'name:Host');
    const projected = store.projected;
    const told = calls.n;
    const snapshot = store.getSnapshot();
    s.history.endEdit();
    assert.equal(store.projected, projected, 'The end of a run must not make the store project.');
    assert.equal(calls.n, told, "The end of a run must call no subscriber beyond the edit's own.");
    assert.equal(store.getSnapshot(), snapshot, 'The end of a run must leave the snapshot the object it was.');
  });

  test('a selection renews only the node or the line it names, and is kept through the next change', async () => {
    const { session: s, store } = await example();
    const sel = (await loadPlanes()).selectionOf(s);
    const before = store.getSnapshot();
    const { calls } = listen(store);
    const host = node(before, 'Host');
    sel.set([{ type: 'el', id: 'Host' }]);
    const after = store.getSnapshot();
    assert.notEqual(after, before, 'Selecting a node must give a new snapshot object.');
    assert.notEqual(after.nodes, before.nodes, 'Selecting a node must give a new nodes array.');
    assert.equal(after.edges, before.edges, 'Selecting a node must leave the edges the very array they were.');
    assert.notEqual(node(after, 'Host'), host, 'The selected node must be a new object.');
    assert.equal(node(after, 'Host').selected, true, 'The selected node must say selected.');
    assert.notEqual(host.selected, true, 'The node before must not have been changed in place.');
    for (const n of before.nodes) {
      if (n.id !== 'Host') assert.equal(node(after, n.id), n, 'Node ' + n.id + ' was not selected and must be the very object it was.');
    }
    assert.equal(calls.n, 1, 'A selection must call the listener once.');
    sel.set([{ type: 'el', id: 'Host' }]);
    assert.equal(store.getSnapshot(), after, 'The same selection again must change nothing.');
    assert.equal(calls.n, 1, 'The same selection again must call nobody.');

    const selected = node(after, 'Host');
    rename(s, 'Page', 'Site');
    assert.equal(node(store.getSnapshot(), 'Host'), selected, "A rename of Page must leave Host's node the same object.");
    assert.equal(node(store.getSnapshot(), 'Host').selected, true, 'Host must stay selected through a rename of Page.');
    rename(s, 'Host', 'Machine');
    const renamed = node(store.getSnapshot(), 'Host');
    assert.notEqual(renamed, selected, 'A rename of Host must give it a new node object.');
    assert.equal(renamed.selected, true, 'Host must stay selected through its own rename.');

    const now = store.getSnapshot();
    const mount = edge(now, 'mount');
    const callsBefore = calls.n;
    sel.toggle({ type: 'rel', id: 'mount' });
    const last = store.getSnapshot();
    assert.notEqual(last, now, 'Selecting an edge must give a new snapshot object.');
    assert.notEqual(last.edges, now.edges, 'Selecting an edge must give a new edges array.');
    assert.equal(last.nodes, now.nodes, 'Selecting an edge must leave the nodes the very array they were.');
    assert.notEqual(edge(last, 'mount'), mount, 'The selected edge must be a new object.');
    assert.equal(edge(last, 'mount').selected, true, 'The selected edge must say selected.');
    for (const e of now.edges) {
      if (e.id !== 'mount') assert.equal(edge(last, e.id), e, 'Edge ' + e.id + ' was not selected and must be the very object it was.');
    }
    assert.equal(calls.n, callsBefore + 1, "An edge's selection must call the listener once.");
    sel.set([{ type: 'rel', id: 'mount' }, { type: 'el', id: 'Host' }]);
    assert.equal(store.getSnapshot(), last, 'The same edge selection again must change nothing.');
    assert.equal(calls.n, callsBefore + 1, 'The same edge selection again must call nobody.');
  });

  test('a change React Flow sends that is not a selection changes nothing', async () => {
    const { store } = await example();
    const snapshot = store.getSnapshot();
    const { calls } = listen(store);
    store.nodesChanged([{ id: 'Host', type: 'dimensions', dimensions: { width: 300, height: 90 } }]);
    // A position with no `dragging` and no resize beside it is no gesture (step 7): a drag says `dragging`.
    store.nodesChanged([{ id: 'Host', type: 'position', position: { x: 5, y: 6 } }]);
    store.nodesChanged([{ id: 'Host', type: 'remove' }]);
    store.edgesChanged([{ id: 'mount', type: 'remove' }]);
    assert.equal(store.getSnapshot(), snapshot, 'A dimensions, a position and a remove must leave the snapshot the very object it was.');
    assert.equal(calls.n, 0, 'A change that is not a selection must call nobody.');
  });

  test('the camera is the fit the first time and what was last seen after', async () => {
    const { fit } = await loadPlanes();
    const { store } = await example();
    const bounds = { x: 32, y: 72, w: 1176, h: 648 };
    const first = store.camera(736, 828);
    assert.deepEqual(plain(first), plain(fit(bounds, 736, 828)), "The first camera must be the fit of the view's bounds into the window.");
    assert.ok(Math.abs(first.zoom - 640 / 1176) < 1e-9, "The first camera's zoom must be 640 / 1176.");
    store.moved({ x: 5, y: 6, zoom: 0.8 });
    assert.deepEqual(plain(store.camera(736, 828)), { x: 5, y: 6, zoom: 0.8 }, 'After moved(), camera() must give the viewport last seen.');
    assert.deepEqual(plain(store.camera(500, 500)), { x: 5, y: 6, zoom: 0.8 }, 'After moved(), camera() in another window must still give the viewport last seen.');
    const refit = store.fit(1336, 828);
    assert.ok(Math.abs(refit.zoom - 600 / 648) < 1e-9, 'fit() into 1336 by 828 must give the zoom 600 / 648.');
    assert.deepEqual(plain(refit), plain(fit(bounds, 1336, 828)), "fit() must be the adapter's fit of the view's bounds.");
    assert.deepEqual(plain(store.camera()), plain(refit), 'camera() after fit() must give what fit() remembered.');
  });

  test('crossing 25% projects again, far or near, and tells; a step that does not cross it tells nobody', async () => {
    const { viewStoreOf } = await loadPlanes();
    const { store } = await example();
    store.getSnapshot();
    const { calls } = listen(store);
    store.moved({ x: 0, y: 0, zoom: 0.2 });
    assert.equal(calls.n, 1, 'Crossing under 25% must call the listener once.');
    const far = store.getSnapshot();
    assert.equal(far.far, true, 'Under 25% the snapshot must be far.');
    for (const n of far.nodes) assert.match(n.className, /(^| )far( |$)/, 'Node ' + n.id + ' must have the class far in a far snapshot.');
    assert.equal(node(far, 'Host').data.name, '', "Host's name must be left out in a far snapshot.");
    store.moved({ x: 3, y: 0, zoom: 0.21 });
    assert.equal(calls.n, 1, 'A step that stays far must call nobody.');
    assert.equal(store.getSnapshot(), far, 'A step that stays far must leave the snapshot the object it was.');
    store.moved({ x: 0, y: 0, zoom: 0.3 });
    assert.equal(calls.n, 2, 'Crossing back over 25% must call the listener again.');
    assert.equal(store.getSnapshot().far, false, 'Over 25% the snapshot must be near again.');

    const big = await session(JSON.stringify(scaleState(5000)), 'scale.json');
    const bigStore = viewStoreOf(big, 'v-definitions');
    assert.ok(bigStore.camera(736, 828).zoom < 0.25, 'The fit of the 5,000-element definitions view must be under 25%.');
    assert.equal(bigStore.getSnapshot().far, true, 'A view whose first fit is under 25% must be far from its first snapshot.');
  });

  test('a view of a kind no plane draws is not drawn and has the empty snapshot', async () => {
    const { viewStoreOf } = await loadPlanes();
    const s = await session(fixture('grid.json'));
    const grid = viewStoreOf(s, 'v-table');
    assert.equal(grid.drawn, false, 'A grid view must not be drawn.');
    assert.equal(grid.notDrawn, 'A grid view is not drawn yet.', 'The card must say what the adapter says of a grid view.');
    assert.equal(grid.getSnapshot().nodes.length, 0, 'A grid view must have no nodes.');
    assert.equal(grid.getSnapshot().edges.length, 0, 'A grid view must have no edges.');
    const none = viewStoreOf(s, 'v-nothing');
    assert.equal(none.drawn, false, 'A view the model does not hold must not be drawn.');
    assert.equal(none.getSnapshot().nodes.length, 0, 'A view the model does not hold must have no nodes.');
    assert.equal(none.getSnapshot().edges.length, 0, 'A view the model does not hold must have no edges.');
  });

  test("the store's methods can be handed over as they are", async () => {
    const { store } = await example();
    const { subscribe, getSnapshot, nodesChanged, edgesChanged, moved, camera, fit, marquee } = store;
    assert.equal(store.subscribe, store.subscribe, 'subscribe must be the same function each time it is read.');
    let calls = 0;
    const stop = subscribe(() => { calls++; });
    assert.equal(typeof stop, 'function', 'A bare subscribe must give back what unsubscribes.');
    assert.equal(getSnapshot().nodes.length, PLACED.length, 'A bare getSnapshot must give the snapshot.');
    nodesChanged([{ id: 'Host', type: 'select', selected: true }]);
    assert.notEqual(node(getSnapshot(), 'Host').selected, true, 'A select change from React Flow must pick nothing: Host says selected.');
    edgesChanged([{ id: 'mount', type: 'select', selected: true }]);
    assert.notEqual(edge(getSnapshot(), 'mount').selected, true, 'A select change from React Flow must pick nothing: mount says selected.');
    assert.ok(fit(736, 828).zoom > 0, 'A bare fit must give a viewport.');
    moved({ x: 5, y: 6, zoom: 0.8 });
    assert.deepEqual(plain(camera(736, 828)), { x: 5, y: 6, zoom: 0.8 }, 'A bare moved and a bare camera must work together.');
    marquee({ x: -100000, y: -100000, width: 200000, height: 200000 });
    for (const n of getSnapshot().nodes) assert.equal(n.selected, true, 'A bare marquee over everything must pick every node: ' + n.id + ' does not say selected.');
    assert.ok(calls >= 2, 'The bare subscriber must have been called by the changes.');
    stop();
  });
});

// ---- A gesture in the store (step 7): the "gesture" bullets of ViewStore's comment in viewStore.ts.
//
// The numbers are worked out by hand from the example's places (Host at 32, 400, 368 by 130) and from placesFor's rules
// (canvas/app/test/adapter.test.mjs holds the working): a box moved is placed at its position; Host resized to 200 wide
// is 182 high, its header and its 8 rows of doc at that width, whatever height is asked.

describe('a gesture in the store', () => {
  const layoutOf = (s, id) => plain(s.model.views.find((v) => v.id === VIEW).layout[id]);
  const at = (snapshot, id) => ({ x: node(snapshot, id).position.x, y: node(snapshot, id).position.y });
  const position = (id, x, y, dragging) => ({ type: 'position', id, position: { x, y }, dragging });
  const dimensions = (id, width, height, resizing) => ({ type: 'dimensions', id, dimensions: { width, height }, resizing, setAttributes: true });
  const HOST = { x: 32, y: 400, w: 368, h: 130 };

  test("a drag's steps move the node and tell the subscribers once a step, and write nothing", async () => {
    const { session: s, store } = await example();
    const first = store.getSnapshot();
    const model = JSON.stringify(s.model);
    const { calls } = listen(store);
    const page = node(first, 'Page');

    store.nodesChanged([position('Host', 60, 420, true)]);
    let snapshot = store.getSnapshot();
    assert.notEqual(snapshot, first, 'A step of a drag must give a new snapshot.');
    assert.deepEqual(at(snapshot, 'Host'), { x: 60, y: 420 }, 'The first step must put Host at 60, 420.');
    assert.equal(node(snapshot, 'Host').dragging, true, 'A node being dragged must have dragging true.');
    assert.equal(calls.n, 1, 'A step must call the subscriber once.');
    store.nodesChanged([position('Host', 100.4, 449.6, true)]);
    snapshot = store.getSnapshot();
    assert.deepEqual(at(snapshot, 'Host'), { x: 100, y: 450 }, 'The second step must put Host at 100, 450: the places are whole numbers.');
    assert.equal(node(snapshot, 'Host').dragging, true, 'Host must still say dragging in the second step.');
    assert.equal(calls.n, 2, 'Two steps must call the subscriber twice.');
    assert.equal(node(snapshot, 'Page'), page, 'A node that was not dragged must be the very object it was.');
    assert.equal(JSON.stringify(s.model), model, 'No step of a drag may write to the model.');
    assert.equal(s.history.steps.length, 0, 'No step of a drag may make an undo step.');
    assert.deepEqual(layoutOf(s, 'Host'), HOST, 'Host must keep its saved place during the drag.');
  });

  test("a drag's end writes one undo step in placesFor's words; undo and redo move the snapshot with it", async () => {
    const { session: s, store } = await example();
    store.getSnapshot();
    listen(store);
    store.nodesChanged([position('Host', 60, 420, true)]);
    store.nodesChanged([position('Host', 100, 450, true)]);
    store.nodesChanged([position('Host', 100, 450, false)]);
    assert.equal(s.history.steps.length, 1, 'The end of a drag must write one undo step.');
    assert.equal(s.history.steps[0].what, 'Moved part def Host', "The step must have placesFor's words.");
    assert.deepEqual(layoutOf(s, 'Host'), { x: 100, y: 450, w: 368, h: 130 }, 'The end must write Host\'s place, its size as it was.');
    const done = store.getSnapshot();
    assert.deepEqual(at(done, 'Host'), { x: 100, y: 450 }, 'The snapshot must show Host where it was dropped.');
    assert.ok(!node(done, 'Host').dragging, 'After the end Host must not say dragging.');
    for (const n of done.nodes) assert.ok(!n.dragging, 'After the end no node may say dragging: ' + n.id + '.');

    s.history.undo();
    assert.deepEqual(layoutOf(s, 'Host'), HOST, 'Undo must put Host\'s place back.');
    assert.deepEqual(at(store.getSnapshot(), 'Host'), { x: 32, y: 400 }, 'After undo the snapshot must show Host where it was.');
    s.history.redo();
    assert.deepEqual(layoutOf(s, 'Host'), { x: 100, y: 450, w: 368, h: 130 }, 'Redo must write the place again.');
    assert.deepEqual(at(store.getSnapshot(), 'Host'), { x: 100, y: 450 }, 'After redo the snapshot must show Host dropped again.');
  });

  test('a drag that ends where it began writes no step', async () => {
    const { session: s, store } = await example();
    store.getSnapshot();
    listen(store);
    store.nodesChanged([position('Host', 60, 420, true)]);
    assert.deepEqual(at(store.getSnapshot(), 'Host'), { x: 60, y: 420 }, 'The drag must have moved Host in the snapshot before it ended.');
    store.nodesChanged([position('Host', 32, 400, false)]);
    assert.equal(s.history.steps.length, 0, 'A drag that ends where it began must write no undo step.');
    assert.deepEqual(layoutOf(s, 'Host'), HOST, 'Host must keep its place.');
    const snapshot = store.getSnapshot();
    assert.deepEqual(at(snapshot, 'Host'), { x: 32, y: 400 }, 'The snapshot must show Host where it began.');
    assert.ok(!node(snapshot, 'Host').dragging, 'Host must not say dragging after the end.');
  });

  test('three nodes dragged in one change list are one undo step', async () => {
    const { session: s, store } = await example();
    store.getSnapshot();
    const { calls } = listen(store);
    store.nodesChanged([position('Host', 100, 450, true), position('App', 700, 450, true), position('ServerHost', 32, 700, true)]);
    assert.equal(calls.n, 1, 'One change list must be one step: the subscriber must be called once.');
    store.nodesChanged([position('Host', 100, 450, false), position('App', 700, 450, false), position('ServerHost', 32, 700, false)]);
    assert.equal(s.history.steps.length, 1, 'Three nodes dragged together must be one undo step.');
    assert.equal(s.history.steps[0].what, 'Moved 3 elements', 'The step must say "Moved 3 elements".');
    assert.deepEqual(layoutOf(s, 'App'), { x: 700, y: 450, w: 368, h: 130 }, 'App must be written where it was dropped.');
    assert.deepEqual(layoutOf(s, 'ServerHost'), { x: 32, y: 700, w: 368, h: 100 }, 'ServerHost must be written where it was dropped.');
    s.history.undo();
    assert.deepEqual(layoutOf(s, 'Host'), HOST, 'One undo must put all three back: Host.');
    assert.deepEqual(layoutOf(s, 'App'), { x: 600, y: 400, w: 368, h: 130 }, 'One undo must put all three back: App.');
    assert.deepEqual(layoutOf(s, 'ServerHost'), { x: 32, y: 620, w: 368, h: 100 }, 'One undo must put all three back: ServerHost.');
  });

  test("a resize's steps and end write the size, and from a top left handle the position, as one step", async () => {
    const { session: s, store } = await example();
    store.getSnapshot();
    const { calls } = listen(store);
    const model = JSON.stringify(s.model);
    // By the bottom right handle: 200 by 50 is held at 182 high by the 8 rows of Host's doc in 200 wide.
    store.nodesChanged([dimensions('Host', 200, 50, true)]);
    let host = node(store.getSnapshot(), 'Host');
    assert.deepEqual([host.width, host.height], [200, 182], 'A step must show Host 200 wide and 182 high, held by its rows.');
    assert.deepEqual(at(store.getSnapshot(), 'Host'), { x: 32, y: 400 }, 'A resize by the bottom right must not move Host.');
    assert.equal(calls.n, 1, 'A step of a resize must call the subscriber once.');
    assert.equal(JSON.stringify(s.model), model, 'No step of a resize may write to the model.');
    assert.equal(s.history.steps.length, 0, 'No step of a resize may make an undo step.');
    store.nodesChanged([dimensions('Host', 200, 300, true)]);
    host = node(store.getSnapshot(), 'Host');
    assert.deepEqual([host.width, host.height], [200, 300], 'The next step must show the size asked, which holds its rows.');
    store.nodesChanged([dimensions('Host', 200, 300, false)]);
    assert.equal(s.history.steps.length, 1, 'The end of a resize must write one undo step.');
    assert.equal(s.history.steps[0].what, 'Resized part def Host', "The step must have placesFor's words.");
    assert.deepEqual(layoutOf(s, 'Host'), { x: 32, y: 400, w: 200, h: 300 }, 'The end must write w and h.');
    s.history.undo();
    assert.deepEqual(layoutOf(s, 'Host'), HOST, 'Undo must put the size back.');

    // By a top left handle: the position changes beside the size. 40, 300 and 360 by 230 keep the corner 400, 530 and need no holding.
    // NodeResizer's own form: a top or left handle's position comes with no `dragging`, beside the resizing dimensions.
    store.nodesChanged([{ type: 'position', id: 'Host', position: { x: 40, y: 300 } }, dimensions('Host', 360, 230, true)]);
    host = node(store.getSnapshot(), 'Host');
    assert.deepEqual([host.position.x, host.position.y, host.width, host.height], [40, 300, 360, 230], 'A step from the top left must show the position and the size.');
    store.nodesChanged([dimensions('Host', 360, 230, false)]);
    assert.equal(s.history.steps.length, 1, 'The end of a top left resize must be one more undo step, and only one.');
    assert.equal(s.history.steps[0].what, 'Resized part def Host', 'It must be a resize.');
    assert.deepEqual(layoutOf(s, 'Host'), { x: 40, y: 300, w: 360, h: 230 }, 'The end must write x, y, w and h.');
  });

  test('an undo heard in the middle of a gesture cancels it: the steps after it are ignored, and its end writes nothing', async () => {
    const { session: s, store } = await example();
    store.getSnapshot();
    listen(store);
    rename(s, 'Page', 'Site');
    assert.equal(s.history.steps.length, 1, 'The rename must be one undo step.');
    store.nodesChanged([position('Host', 100, 450, true)]);
    assert.deepEqual(at(store.getSnapshot(), 'Host'), { x: 100, y: 450 }, 'The drag must have begun.');
    s.history.undo();
    assert.equal(node(store.getSnapshot(), 'Page').data.name, 'Page', 'The undo must take the rename back.');
    assert.deepEqual(at(store.getSnapshot(), 'Host'), { x: 32, y: 400 }, 'The snapshot must show the model\'s Host as soon as the undo is heard.');
    assert.ok(!node(store.getSnapshot(), 'Host').dragging, 'Host must not say dragging after the undo.');
    // React Flow goes on with the drag: its steps are ignored.
    const cancelled = store.getSnapshot();
    store.nodesChanged([position('Host', 120, 470, true)]);
    store.nodesChanged([position('Host', 160, 500, true)]);
    assert.equal(store.getSnapshot(), cancelled, 'The steps of a gesture that an undo cancelled must change nothing.');
    assert.deepEqual(at(store.getSnapshot(), 'Host'), { x: 32, y: 400 }, 'Host must stay at its saved place while the cancelled drag goes on.');
    store.nodesChanged([position('Host', 160, 500, false)]);
    assert.equal(s.history.steps.length, 0, 'The end of a gesture that an undo cancelled must write no step.');
    assert.equal(s.history.undone.length, 1, 'It must not empty what Redo holds.');
    assert.deepEqual(layoutOf(s, 'Host'), HOST, 'Host must keep its saved place.');
    const snapshot = store.getSnapshot();
    assert.deepEqual(at(snapshot, 'Host'), { x: 32, y: 400 }, 'The snapshot must show the model\'s Host, not the dropped one.');
    assert.ok(!node(snapshot, 'Host').dragging, 'Host must not say dragging.');
    // The end cleared the mark: the next drag is a gesture again.
    store.nodesChanged([position('Host', 60, 420, true)]);
    assert.deepEqual(at(store.getSnapshot(), 'Host'), { x: 60, y: 420 }, 'A drag after the cancelled one must move Host again.');
    store.nodesChanged([position('Host', 60, 420, false)]);
    assert.deepEqual(layoutOf(s, 'Host'), { x: 60, y: 420, w: 368, h: 130 }, 'A drag after the cancelled one must be written at its end.');
  });

  test('an undo heard in the middle of a resize cancels it too: the size does not come back', async () => {
    const { session: s, store } = await example();
    store.getSnapshot();
    listen(store);
    rename(s, 'Page', 'Site');
    store.nodesChanged([dimensions('Host', 200, 300, true)]);
    assert.deepEqual([node(store.getSnapshot(), 'Host').width, node(store.getSnapshot(), 'Host').height], [200, 300], 'The resize must have begun.');
    s.history.undo();
    assert.deepEqual([node(store.getSnapshot(), 'Host').width, node(store.getSnapshot(), 'Host').height], [368, 130], 'The snapshot must show the model\'s size as soon as the undo is heard.');
    const cancelled = store.getSnapshot();
    store.nodesChanged([{ type: 'position', id: 'Host', position: { x: 40, y: 300 } }, dimensions('Host', 360, 230, true)]);
    store.nodesChanged([dimensions('Host', 380, 240, true)]);
    assert.equal(store.getSnapshot(), cancelled, 'The steps of a resize that an undo cancelled must change nothing.');
    store.nodesChanged([dimensions('Host', 380, 240, false)]);
    assert.equal(s.history.steps.length, 0, 'The end of a resize that an undo cancelled must write no step.');
    assert.equal(s.history.undone.length, 1, 'It must not empty what Redo holds.');
    assert.deepEqual(layoutOf(s, 'Host'), HOST, 'Host must keep its saved place and size.');
    assert.deepEqual([node(store.getSnapshot(), 'Host').width, node(store.getSnapshot(), 'Host').height], [368, 130], 'The snapshot must show the model\'s size.');
  });

  test('a drag step under 4 screen px is no gesture', async () => {
    const { session: s, store } = await example();
    const first = store.getSnapshot();
    const model = JSON.stringify(s.model);
    const { calls } = listen(store);
    store.nodesChanged([position('Host', 34, 401, true)]);
    store.nodesChanged([position('Host', 35, 403, true)]);
    assert.equal(store.getSnapshot(), first, 'Steps of 2 and 3 px must leave the snapshot the very object it was.');
    assert.equal(calls.n, 0, 'Steps under 4 px must call nobody.');
    store.nodesChanged([position('Host', 35, 403, false)]);
    assert.equal(store.getSnapshot(), first, 'The end of a press that never moved 4 px must leave the snapshot the very object it was.');
    assert.equal(calls.n, 0, 'The end of such a press must call nobody.');
    assert.equal(s.history.steps.length, 0, 'Such a press must write no undo step.');
    assert.equal(JSON.stringify(s.model), model, 'Such a press must write nothing to the model.');

    // At a zoom of 0.5 a step of 6 view units is 3 px: no gesture; 8 units is 4 px: one, from the press's start.
    store.moved({ x: 0, y: 0, zoom: 0.5 });
    store.nodesChanged([position('Host', 38, 400, true)]);
    assert.equal(calls.n, 0, '6 view units at a zoom of 0.5 are 3 px: no gesture, no call.');
    store.nodesChanged([position('Host', 40, 400, true)]);
    assert.equal(calls.n, 1, '8 view units at a zoom of 0.5 are 4 px: the gesture begins and calls the subscriber.');
    assert.deepEqual(at(store.getSnapshot(), 'Host'), { x: 40, y: 400 }, 'The gesture must put Host where the pointer has it.');
    assert.equal(node(store.getSnapshot(), 'Host').dragging, true, 'Host must say dragging once the gesture has begun.');
    // Once begun, it runs: a step back under 4 px is still a step.
    store.nodesChanged([position('Host', 33, 400, true)]);
    assert.deepEqual(at(store.getSnapshot(), 'Host'), { x: 33, y: 400 }, 'A begun gesture goes on to a step that is back near the start.');
    store.nodesChanged([position('Host', 33, 400, false)]);
    assert.equal(s.history.steps.length, 1, 'A gesture that began and ended off its start writes its step.');
  });

  test('a resize step under 4 screen px is no gesture', async () => {
    const { session: s, store } = await example();
    const first = store.getSnapshot();
    const { calls } = listen(store);
    store.nodesChanged([dimensions('Host', 370, 131, true)]);
    store.nodesChanged([dimensions('Host', 371, 133, true)]);
    store.nodesChanged([{ type: 'position', id: 'Host', position: { x: 30, y: 399 } }, dimensions('Host', 370, 131, true)]);
    assert.equal(store.getSnapshot(), first, 'Resize steps of 3 px or less must leave the snapshot the very object it was.');
    assert.equal(calls.n, 0, 'Resize steps under 4 px must call nobody.');
    store.nodesChanged([dimensions('Host', 371, 133, false)]);
    assert.equal(store.getSnapshot(), first, 'The end of such a resize must leave the snapshot the very object it was.');
    assert.equal(s.history.steps.length, 0, 'Such a resize must write no undo step.');
    store.nodesChanged([dimensions('Host', 372, 130, true)]);
    assert.equal(calls.n, 1, 'A resize step of 4 px must begin the gesture.');
    store.nodesChanged([dimensions('Host', 372, 130, false)]);
    assert.equal(s.history.steps.length, 1, 'A resize that went past 4 px must write its step.');
  });

  test('crossing 25% during a drag keeps the dragged node where the drag put it', async () => {
    const { session: s, store } = await example();
    store.getSnapshot();
    listen(store);
    store.nodesChanged([position('Host', 100, 450, true)]);
    store.moved({ x: 0, y: 0, zoom: 0.2 });
    const far = store.getSnapshot();
    assert.equal(far.far, true, 'The snapshot must be far under 25%.');
    assert.deepEqual(at(far, 'Host'), { x: 100, y: 450 }, 'A far projection during a drag must keep Host where the drag put it.');
    assert.equal(node(far, 'Host').dragging, true, 'Host must still say dragging.');
    store.moved({ x: 0, y: 0, zoom: 0.3 });
    assert.deepEqual(at(store.getSnapshot(), 'Host'), { x: 100, y: 450 }, 'Crossing back over 25% must keep it there too.');
    store.nodesChanged([position('Host', 100, 450, false)]);
    assert.deepEqual(layoutOf(s, 'Host'), { x: 100, y: 450, w: 368, h: 130 }, 'The drag must still be written at its end.');
  });

  test('a dimensions change with no resizing, and a remove, change nothing and write nothing', async () => {
    const { session: s, store } = await example();
    const { calls } = listen(store);
    const model = JSON.stringify(s.model);
    // In the middle of a drag, so that a change that moved anything would show.
    store.nodesChanged([position('Host', 60, 420, true)]);
    const snapshot = store.getSnapshot();
    assert.deepEqual(at(snapshot, 'Host'), { x: 60, y: 420 }, 'The drag must have moved Host in the snapshot.');
    const told = calls.n;
    store.nodesChanged([{ type: 'dimensions', id: 'Host', dimensions: { width: 300, height: 90 } }]);
    store.nodesChanged([{ type: 'dimensions', id: 'Host', dimensions: { width: 300, height: 90 }, setAttributes: true }]);
    store.nodesChanged([{ type: 'remove', id: 'Host' }]);
    assert.equal(store.getSnapshot(), snapshot, 'A dimensions change with no resizing and a remove must leave the snapshot the very object it was.');
    assert.equal(calls.n, told, 'They must call nobody.');
    assert.equal(s.history.steps.length, 0, 'They must write no step.');
    assert.equal(JSON.stringify(s.model), model, 'They must write nothing to the model.');
    // The drag ends where it began: no step. A dimensions change ending a resize that never began ends nothing and writes nothing.
    store.nodesChanged([position('Host', 32, 400, false)]);
    store.nodesChanged([dimensions('Host', 200, 300, false)]);
    assert.equal(s.history.steps.length, 0, 'Neither end may write a step.');
    assert.equal(JSON.stringify(s.model), model, 'They must write nothing to the model.');
  });

  test("after the end, the model's projection holds the gesture's last step's node objects", async () => {
    const { session: s, store } = await example();
    store.getSnapshot();
    listen(store);
    store.nodesChanged([position('Host', 60, 420, true)]);
    store.nodesChanged([position('Host', 100, 450, true)]);
    const last = store.getSnapshot();
    store.nodesChanged([position('Host', 100, 450, false)]);
    assert.equal(s.history.steps.length, 1, 'The end must write the step.');
    const done = store.getSnapshot();
    assert.equal(node(done, 'Host').data, node(last, 'Host').data, "The moved node's data must be the very object it was in the last step.");
    assert.equal(done.edges.length, last.edges.length, 'The edges must be as many.');
    for (const n of last.nodes) {
      if (n.id !== 'Host') assert.equal(node(done, n.id), n, 'Node ' + n.id + ' must be the very object it was in the last step.');
    }
    for (const e of last.edges) assert.equal(edge(done, e.id), e, 'Edge ' + e.id + ' must be the very object it was in the last step.');
  });
});

// ---- Step 9: what is selected is the session's selection (the last two entries of ViewStore's comment in viewStore.ts).

describe('the selection in the store', () => {
  const EL = (id) => ({ type: 'el', id });
  const selectedIds = (snapshot) => snapshot.nodes.filter((n) => n.selected === true).map((n) => n.id);
  const added = (s, id) => s.model.views.find((v) => v.id === id);

  test('a picked element is selected in every view that shows it', async () => {
    const { viewStoreOf, selectionOf } = await loadPlanes();
    const s = await session(fixture('interconnection.json'));
    const sel = selectionOf(s);
    const ic = viewStoreOf(s, 'v-ic');
    const defs = viewStoreOf(s, 'v-defs');
    const a = listen(ic);
    const b = listen(defs);
    ic.getSnapshot();
    defs.getSnapshot();
    sel.set([EL('Pump')]);
    assert.deepEqual(selectedIds(ic.getSnapshot()), ['Pump'], 'Picking Pump must select Pump, and only Pump, in v-ic.');
    assert.deepEqual(selectedIds(defs.getSnapshot()), ['Pump'], 'Picking Pump must select Pump, and only Pump, in v-defs.');
    assert.equal(a.calls.n, 1, 'The store of v-ic must call its listener once for the pick.');
    assert.equal(b.calls.n, 1, 'The store of v-defs must call its listener once for the pick.');
    sel.set([EL('System.pump')]);
    assert.deepEqual(selectedIds(ic.getSnapshot()), ['System.pump'], 'Picking System.pump must select it in v-ic, which places it.');
    assert.deepEqual(selectedIds(defs.getSnapshot()), [], 'Picking System.pump, which v-defs does not place, must leave nothing selected in v-defs.');
    assert.equal(a.calls.n, 2, 'The store of v-ic must call its listener once more.');
    assert.equal(b.calls.n, 2, 'The store of v-defs must call its listener once more, for Pump let go.');
    sel.set([{ type: 'view', id: 'v-ic' }]);
    assert.deepEqual(selectedIds(ic.getSnapshot()), [], 'Picking a view must leave nothing selected in v-ic.');
    assert.deepEqual(selectedIds(defs.getSnapshot()), [], 'Picking a view must leave nothing selected in v-defs.');
    assert.equal(a.calls.n, 3, 'The store of v-ic must call its listener once more, for System.pump let go.');
    for (const store of [ic, defs]) for (const e of store.getSnapshot().edges) assert.notEqual(e.selected, true, 'No line may be selected: ' + e.id + '.');
    a.stop();
    b.stop();
  });

  test('a store with no subscriber marks what is picked at its next read, and projects nothing for it', async () => {
    const { session: s, store } = await example();
    const sel = (await loadPlanes()).selectionOf(s);
    const before = store.getSnapshot();
    const projected = store.projected;
    sel.set([EL('Host')]);
    const after = store.getSnapshot();
    assert.equal(node(after, 'Host').selected, true, 'A store nobody listens to must say Host selected at its next read.');
    for (const n of before.nodes) {
      if (n.id !== 'Host') assert.equal(node(after, n.id), n, 'Node ' + n.id + ' was not picked and must be the very object it was.');
    }
    assert.equal(store.projected, projected, 'Marking what is picked must not project the view again.');
  });

  test('a select change from React Flow picks nothing, and what it names is a new object that reads the same', async () => {
    const { session: s, store } = await example();
    const sel = (await loadPlanes()).selectionOf(s);
    const before = store.getSnapshot();
    const { calls } = listen(store);
    store.nodesChanged([{ id: 'Host', type: 'select', selected: true }, { id: 'App', type: 'select', selected: false }]);
    assert.equal(sel.items.length, 0, 'A select change from React Flow must pick nothing.');
    const after = store.getSnapshot();
    assert.notEqual(after, before, 'A select change that names nodes must give a new snapshot.');
    for (const id of ['Host', 'App']) {
      assert.notEqual(node(after, id), node(before, id), id + ' is named by a select change and must be a new object.');
      assert.deepEqual(plain(node(after, id)), plain(node(before, id)), id + ' must read as it did before the select change.');
      assert.notEqual(node(after, id).selected, true, id + ' must not say selected: nothing is picked.');
    }
    for (const n of before.nodes) {
      if (n.id !== 'Host' && n.id !== 'App') assert.equal(node(after, n.id), n, 'Node ' + n.id + ' was not named and must be the very object it was.');
    }
    assert.equal(after.edges, before.edges, 'A select change of nodes must leave the edges the very array they were.');
    assert.equal(calls.n, 1, 'A select change must call the listener once.');

    sel.set([EL('Host')]);
    const picked = store.getSnapshot();
    const callsBefore = calls.n;
    store.nodesChanged([{ id: 'Host', type: 'select', selected: false }]);
    const unselected = store.getSnapshot();
    assert.notEqual(node(unselected, 'Host'), node(picked, 'Host'), 'A select change that names Host must give it a new object even when the selection says otherwise.');
    assert.equal(node(unselected, 'Host').selected, true, 'Host is picked and must still say selected after a select change that unselects it.');
    assert.equal(calls.n, callsBefore + 1, 'That select change must call the listener once.');

    const edgesBefore = store.getSnapshot();
    const callsEdge = calls.n;
    store.edgesChanged([{ id: 'mount', type: 'select', selected: true }]);
    const edgesAfter = store.getSnapshot();
    assert.notEqual(edge(edgesAfter, 'mount'), edge(edgesBefore, 'mount'), 'mount is named by a select change and must be a new object.');
    assert.notEqual(edge(edgesAfter, 'mount').selected, true, 'mount must not say selected: nothing picked it.');
    assert.equal(calls.n, callsEdge + 1, 'A select change of an edge must call the listener once.');

    const last = store.getSnapshot();
    const callsEnd = calls.n;
    store.nodesChanged([{ id: 'Nobody', type: 'select', selected: true }]);
    store.edgesChanged([{ id: 'Nobody', type: 'select', selected: true }]);
    assert.equal(store.getSnapshot(), last, 'A select change that names nothing the view holds must leave the snapshot the very object it was.');
    assert.equal(calls.n, callsEnd, 'A select change that names nothing the view holds must call nobody.');
  });

  test('a marquee picks the nodes it covers whole, in the view\'s order, and the lines between them', async () => {
    const { viewStoreOf, selectionOf, project } = await loadPlanes();
    const s = await session();
    const store = viewStoreOf(s, VIEW);
    const sel = selectionOf(s);
    const { calls } = listen(store);
    store.camera(736, 828);
    store.getSnapshot();
    const { rects } = project(lib, s.model, s.model.views.find((v) => v.id === VIEW), { far: false });
    const four = ['Page.hosts', 'Page.hosts.api', 'Host', 'Host.api'].map((id) => rects.get(id));
    const x1 = Math.min(...four.map((r) => r.x)) - 1;
    const y1 = Math.min(...four.map((r) => r.y)) - 1;
    const x2 = Math.max(...four.map((r) => r.x + r.w)) + 1;
    const y2 = Math.max(...four.map((r) => r.y + r.h)) + 1;
    const R = { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
    store.marquee(R);
    assert.deepEqual(plain(sel.items), [EL('Page.hosts'), EL('Page.hosts.api'), EL('Host'), EL('Host.api'), { type: 'rel', id: 't-hosts' }],
      'A marquee around Page.hosts, Page.hosts.api, Host and Host.api must pick those four in the order of the view, then the line t-hosts, and not Page.');
    const covered = store.getSnapshot().nodes.filter((n) => {
      const r = rects.get(n.id);
      return r.x >= R.x && r.y >= R.y && r.x + r.w <= R.x + R.width && r.y + r.h <= R.y + R.height;
    }).map((n) => n.id);
    assert.deepEqual(plain(sel.items.filter((i) => i.type === 'el').map((i) => i.id)), covered, 'What is picked must be exactly the nodes whose rectangle lies wholly inside the marquee.');
    assert.ok(calls.n >= 1, 'The marquee must have told the store\'s listener.');

    const host = rects.get('Host');
    store.marquee({ x: host.x, y: host.y, width: host.w, height: host.h });
    assert.deepEqual(plain(sel.items), [EL('Host')], "A marquee of Host's own rectangle must pick Host alone: the edges of the rectangle count as inside.");
    store.marquee({ x: host.x, y: host.y, width: host.w - 1, height: host.h });
    assert.deepEqual(plain(sel.items), [{ type: 'view', id: VIEW }], 'A marquee one unit narrower than Host cuts it and must pick the view.');
  });

  test('a marquee that covers nothing picks the view, and the same marquee again tells nobody', async () => {
    const { session: s, store } = await example();
    const sel = (await loadPlanes()).selectionOf(s);
    const { calls } = listen(store);
    store.getSnapshot();
    sel.set([EL('Host')]);
    const callsBefore = calls.n;
    let told = 0;
    const stop = sel.listen(() => { told++; });
    store.marquee({ x: -5000, y: -5000, width: 10, height: 10 });
    assert.deepEqual(plain(sel.items), [{ type: 'view', id: VIEW }], 'A marquee that covers no node must pick the view alone.');
    assert.equal(calls.n, callsBefore + 1, 'Letting Host go must call the store\'s listener once.');
    assert.equal(told, 1, 'The selection must tell its listener once.');
    store.marquee({ x: -5000, y: -5000, width: 10, height: 10 });
    assert.equal(calls.n, callsBefore + 1, 'The same marquee again must not call the store\'s listener.');
    assert.equal(told, 1, 'The same marquee again must not call a listener on the selection.');
    stop();
  });

  test('a picked element that a view comes to show is selected there, and what is picked stays marked through a drag', async () => {
    const { viewStoreOf, selectionOf } = await loadPlanes();
    const ic = await session(fixture('interconnection.json'));
    const defs = viewStoreOf(ic, 'v-defs');
    selectionOf(ic).set([EL('System')]);
    listen(defs);
    assert.deepEqual(selectedIds(defs.getSnapshot()), [], 'System is not placed in v-defs and nothing may be selected there.');
    ic.history.edit(() => { added(ic, 'v-defs').layout.System = { x: 0, y: 0, w: 200, h: 100 }; return 'Placed System'; });
    assert.equal(node(defs.getSnapshot(), 'System')?.selected, true, 'System is picked, and the node that v-defs now shows for it must say selected.');

    const { session: s, store } = await example();
    const sel = selectionOf(s);
    const { calls } = listen(store);
    store.getSnapshot();
    sel.set([EL('Host')]);
    const position = (x, y, dragging) => ({ type: 'position', id: 'Host', position: { x, y }, dragging });
    store.nodesChanged([position(60, 420, true)]);
    assert.equal(node(store.getSnapshot(), 'Host').selected, true, 'Host must say selected at the first step of its drag.');
    store.nodesChanged([position(82, 450, true)]);
    assert.equal(node(store.getSnapshot(), 'Host').selected, true, 'Host must say selected at the second step of its drag.');
    store.nodesChanged([position(82, 450, false)]);
    assert.equal(node(store.getSnapshot(), 'Host').selected, true, 'Host must say selected after the end of its drag.');
    assert.ok(calls.n >= 3, 'The drag must have called the listener.');
  });
});
