// The planes' sturdiness against what a model can hold, in Node (no browser): a place that is not an object
// (core/adapter.ts, rule 1 of project(), and build()), a store whose projection throws (plane/viewStore.ts, storesOf),
// and a watcher of `drawn` (ViewStore.watch). Written after the fixes of the independent review of step 6.

import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, test } from 'node:test';
import { EXAMPLE, FIXTURES, clock, lib, loadPlanes, plain, readJSON, readText } from './core.mjs';

const VIEW = 'v-proof';
const fixture = (name) => readText(path.join(FIXTURES, name));
const el = (s, id) => s.model.elements.find((e) => e.id === id);
const viewIn = (s, id) => s.model.views.find((v) => v.id === id);

/** A session of a file's text; `mistakes` collects what the history reports (a listener that threw, among them). */
async function open(text, name) {
  const core = await loadPlanes();
  const mistakes = [];
  const session = core.openText(lib, text, { name }, { now: clock(), mistake: (error) => mistakes.push(error) });
  return { core, session, mistakes };
}

describe('a model the planes cannot rely on', () => {
  test('a place that is not an object places nothing and throws nothing', async () => {
    const core = await loadPlanes();
    const model = lib.normalize(readJSON(EXAMPLE).model);
    const view = model.views[0];
    const whole = core.project(lib, model, view);
    assert.ok(whole.nodes.length >= 13, 'The untouched example must place its 13 elements.');

    // A copy of the model, in this realm, with three places spoilt: a null, a string and a number.
    const spoilt = plain(model);
    const bad = { DevHost: null, OnlineHost: 'left', ServerHost: 42 };
    for (const id of Object.keys(bad)) assert.ok(view.layout[id], `The example's view must place ${id}.`);
    const copy = spoilt.views[0];
    for (const [id, place] of Object.entries(bad)) copy.layout[id] = place;
    // The library normalizes a model it is given; the spoilt places must stay as they are, which is the page's case
    // for a file edited by hand.
    let projection;
    assert.doesNotThrow(() => { projection = core.project(lib, spoilt, copy); }, 'project() must not throw for a place that is null, a string or a number.');

    const ids = new Set(projection.nodes.map((n) => n.id));
    for (const id of Object.keys(bad)) assert.ok(!ids.has(id), `A place that is ${JSON.stringify(bad[id])} must place nothing: ${id} has a node.`);
    for (const edge of projection.edges) {
      assert.ok(!(edge.source in bad) && !(edge.target in bad), `The edge ${edge.id} has an end (${edge.source} to ${edge.target}) that is not placed.`);
    }
    const others = whole.nodes.filter((n) => !(n.id in bad));
    assert.deepEqual(projection.nodes.map((n) => n.id), others.map((n) => n.id), 'Every other element must still have its node, in the same order.');
    for (const node of others) {
      assert.deepEqual(plain(projection.nodes.find((n) => n.id === node.id)), plain(node), `The node of ${node.id} must be as it is in the untouched projection.`);
    }
  });

  test("a store whose projection throws does not keep the session's other stores from hearing the change", async () => {
    const { core, session: s, mistakes } = await open(fixture('interconnection.json'), 'interconnection.json');
    // The history lists its listeners in the order they were added, and a session's stores are heard in the order they
    // were made: v-ic's store is made first, so the store that throws (v-ic places the two parts the new line joins,
    // v-defs does not) is heard BEFORE the one that must still hear the change.
    const ic = core.viewStoreOf(s, 'v-ic');
    const defs = core.viewStoreOf(s, 'v-defs');
    assert.deepEqual([...core.viewStoresOf(s).keys()], ['v-ic', 'v-defs'], 'The store that throws must have been made first, or the test proves nothing.');
    assert.ok(viewIn(s, 'v-ic').layout['System.tank'] && viewIn(s, 'v-ic').layout['System.controller'], 'v-ic must place the two parts.');
    assert.ok(!viewIn(s, 'v-defs').layout['System.tank'] && !viewIn(s, 'v-defs').layout['System.controller'], 'v-defs must not place them.');
    assert.ok(viewIn(s, 'v-defs').layout.Fuel, 'v-defs must place Fuel, which is renamed.');
    const oldIc = ic.getSnapshot();
    const oldDefs = defs.getSnapshot();
    const told = { ic: 0, defs: 0 };
    ic.subscribe(() => { told.ic++; });
    defs.subscribe(() => { told.defs++; });

    s.history.edit(() => {
      s.model.relationships.push({ id: 'broken', kind: 'ConnectionUsage', from: 'System.controller', to: 'System.pump', doc: '' });
      el(s, 'Fuel').name = 'Petrol';
      return 'Added a connection without a name and renamed Fuel';
    });

    assert.equal(told.defs, 1, "The other view's subscriber must be called once although v-ic's projection threw before it.");
    assert.equal(plain(defs.getSnapshot().nodes.find((n) => n.id === 'Fuel').data.name), 'Petrol', "The other view's snapshot must show the new name.");
    assert.notEqual(defs.getSnapshot(), oldDefs, "The other view's snapshot must be a new object.");
    assert.equal(told.ic, 0, 'The store whose projection threw must tell nobody.');
    assert.equal(mistakes.length, 1, "The error must reach the history's report of a listener that threw, once, not be swallowed.");
    assert.match(mistakes[0].message, /trim/, 'The reported error must be the label hook\'s own.');
    let seen;
    assert.doesNotThrow(() => { seen = ic.getSnapshot(); }, 'getSnapshot() of the store that threw must not throw.');
    assert.equal(seen, oldIc, 'The store that threw must still give the snapshot it showed before.');

    s.history.edit(() => {
      s.model.relationships.splice(s.model.relationships.findIndex((r) => r.id === 'broken'), 1);
      return 'Removed the connection';
    });
    assert.equal(mistakes.length, 1, 'Taking the relationship out must report nothing more.');
    assert.equal(told.ic, 1, 'The store that threw must be told when it projects again.');
    assert.notEqual(ic.getSnapshot(), oldIc, 'The store must give a new snapshot once it projects again.');
    assert.equal(plain(ic.getSnapshot().nodes.find((n) => n.id === 'Fuel').data.name), 'Petrol', 'It must show the renamed element.');
    assert.ok(!ic.getSnapshot().edges.some((e) => e.id === 'broken'), 'It must draw no line for the relationship taken out.');
  });

  test('a watcher is told when its view stops being drawn, and watching does not make the store live', async () => {
    const { core, session: s } = await open(readText(EXAMPLE), 'example.json');
    const store = core.viewStoreOf(s, VIEW);
    const view = () => viewIn(s, VIEW);
    let calls = 0;
    const stop = store.watch(() => { calls++; });
    // A read of getSnapshot() projects a stale store, so each read is followed by taking the count again: what must
    // not rise is the count across an edit, which only a live store (one with a subscriber) would project for.
    let projected = store.projected;
    const unchanged = (what) => assert.equal(store.projected, projected, `Watching must not make the store live: it projected at ${what}.`);
    assert.equal(store.drawn, true, 'The example\'s view must be drawn to begin with.');

    s.history.edit(() => { el(s, 'Host').name = 'Machine'; return 'Renamed Host'; });
    assert.equal(calls, 0, 'A rename must call no watcher.');
    unchanged('a rename');

    const kind = view().kind;
    s.history.edit(() => { view().kind = 'SequenceView'; return 'Made the view a sequence view'; });
    assert.equal(calls, 1, 'A view that becomes a kind no plane draws must call its watcher once.');
    unchanged('a change of kind');
    assert.equal(store.drawn, false, 'The store must say the view is not drawn.');
    assert.deepEqual(plain(store.getSnapshot()), { nodes: [], edges: [], far: false }, 'A view not drawn must have the empty snapshot.');
    projected = store.projected;

    s.history.edit(() => { view().kind = kind; return 'Made the view what it was'; });
    assert.equal(calls, 2, 'A view that is drawn again must call its watcher again.');
    unchanged('a change of kind back');
    assert.equal(store.drawn, true, 'The store must say the view is drawn again.');

    const removed = view();
    const at = s.model.views.indexOf(removed);
    s.history.edit(() => { s.model.views.splice(at, 1); return 'Removed the view'; });
    assert.equal(calls, 3, 'A view that leaves the model must call its watcher.');
    unchanged('the view leaving the model');
    assert.equal(store.drawn, false, 'A view that left the model is not drawn.');
    assert.deepEqual(plain(store.getSnapshot()), { nodes: [], edges: [], far: false }, 'A view that left the model must have the empty snapshot.');
    projected = store.projected;

    s.history.edit(() => { s.model.views.splice(at, 0, removed); return 'Put the view back'; });
    assert.equal(calls, 4, 'A view that comes back must call its watcher.');
    unchanged('the view coming back');
    assert.equal(store.drawn, true, 'The store must say a view that came back is drawn.');
    assert.ok(store.getSnapshot().nodes.length > 0, 'The view that came back must draw its nodes at the next getSnapshot().');

    stop();
    s.history.edit(() => { view().kind = 'SequenceView'; return 'Made the view a sequence view again'; });
    assert.equal(calls, 4, 'The function watch returned must stop the calls.');
  });
});
