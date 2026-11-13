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
    const before = store.getSnapshot();
    const { calls } = listen(store);
    const host = node(before, 'Host');
    store.nodesChanged([{ id: 'Host', type: 'select', selected: true }]);
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
    store.nodesChanged([{ id: 'Host', type: 'select', selected: true }]);
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
    store.edgesChanged([{ id: 'mount', type: 'select', selected: true }]);
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
    store.edgesChanged([{ id: 'mount', type: 'select', selected: true }]);
    assert.equal(store.getSnapshot(), last, 'The same edge selection again must change nothing.');
    assert.equal(calls.n, callsBefore + 1, 'The same edge selection again must call nobody.');
  });

  test('a change React Flow sends that is not a selection changes nothing', async () => {
    const { store } = await example();
    const snapshot = store.getSnapshot();
    const { calls } = listen(store);
    store.nodesChanged([{ id: 'Host', type: 'dimensions', dimensions: { width: 300, height: 90 } }]);
    store.nodesChanged([{ id: 'Host', type: 'position', position: { x: 5, y: 6 }, dragging: true }]);
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
    const { subscribe, getSnapshot, nodesChanged, edgesChanged, moved, camera, fit } = store;
    assert.equal(store.subscribe, store.subscribe, 'subscribe must be the same function each time it is read.');
    let calls = 0;
    const stop = subscribe(() => { calls++; });
    assert.equal(typeof stop, 'function', 'A bare subscribe must give back what unsubscribes.');
    assert.equal(getSnapshot().nodes.length, PLACED.length, 'A bare getSnapshot must give the snapshot.');
    nodesChanged([{ id: 'Host', type: 'select', selected: true }]);
    assert.equal(node(getSnapshot(), 'Host').selected, true, 'A bare nodesChanged must select.');
    edgesChanged([{ id: 'mount', type: 'select', selected: true }]);
    assert.equal(edge(getSnapshot(), 'mount').selected, true, 'A bare edgesChanged must select.');
    assert.ok(fit(736, 828).zoom > 0, 'A bare fit must give a viewport.');
    moved({ x: 5, y: 6, zoom: 0.8 });
    assert.deepEqual(plain(camera(736, 828)), { x: 5, y: 6, zoom: 0.8 }, 'A bare moved and a bare camera must work together.');
    assert.ok(calls >= 2, 'The bare subscriber must have been called by the changes.');
    stop();
  });
});
