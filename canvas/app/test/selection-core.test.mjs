// The selection: canvas/app/src/core/selection.ts, the contract in the comment of `Selection`. It is kept for a session
// outside React; every plane and panel reads and sets it. These tests run it in Node, on a session of the example (and,
// for the last, of the 5,000-element model), and check what the contract promises: what set, toggle, click and front do,
// what the listeners are told, and what becomes of what is picked when the model changes.
//
// The model library runs in another realm: compare ITS objects as JSON. What the selection gives belongs to this realm,
// and a Picked is compared by its type and id.

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { scaleState } from '../../test/scale-model.mjs';
import { EXAMPLE, clock, lib, loadCore, readText } from './core.mjs';

const VIEW = 'v-proof';

/** A session of the example. */
async function session(text = readText(EXAMPLE), name = 'example.json') {
  const core = await loadCore();
  return core.openText(lib, text, { name }, { now: clock() });
}
/** A session of the example and its selection. */
async function example() {
  const { selectionOf } = await loadCore();
  const s = await session();
  return { session: s, selection: selectionOf(s) };
}

const el = (id) => ({ type: 'el', id });
const rel = (id) => ({ type: 'rel', id });
const view = (id) => ({ type: 'view', id });
const Host = el('Host');
const App = el('App');
const DevHost = el('DevHost');
/** A Picked as the tests compare it: its type and its id. */
const key = (p) => ({ type: p.type, id: p.id });
const keys = (items) => items.map(key);
const hit = (type, id, add = false) => ({ view: VIEW, type, id, at: { x: 0, y: 0 }, add });
/** A listener that counts its calls. */
function counting(selection) {
  const calls = { n: 0 };
  const stop = selection.listen(() => { calls.n++; });
  return { calls, stop };
}
const elementOf = (s, id) => s.model.elements.find((e) => e.id === id);

describe('the selection', () => {
  test('a session has one selection, empty at first', async () => {
    const { selectionOf } = await loadCore();
    const a = await session();
    const b = await session();
    const selection = selectionOf(a);
    assert.equal(selectionOf(a), selection, 'The same session must give the same selection at each call.');
    assert.notEqual(selectionOf(b), selection, 'Another session must have a selection of its own.');
    assert.deepEqual(keys(selection.items), [], 'A new session must have nothing picked.');
    assert.equal(selection.last, null, 'A new session has no last picked.');
    assert.equal(selection.view, null, 'A new session has no view in front.');
    assert.equal(selection.has('el', 'Host'), false, 'A new session must have no element picked.');
  });

  test('set picks exactly what it is given, the first of them the last picked', async () => {
    const { selection } = await example();
    selection.set([Host, rel('mount'), view(VIEW)]);
    assert.deepEqual(keys(selection.items), [Host, rel('mount'), view(VIEW)], 'set must pick the three, in the order given.');
    assert.deepEqual(key(selection.last), Host, 'The last picked must be the first given.');
    assert.equal(selection.has('el', 'Host'), true, 'has must say the element is picked.');
    assert.equal(selection.has('rel', 'mount'), true, 'has must say the relationship is picked.');
    assert.equal(selection.has('view', VIEW), true, 'has must say the view is picked.');
    assert.equal(selection.has('rel', 'Host'), false, 'has must tell the types apart: Host is no relationship.');
    selection.set([rel('mount'), Host]);
    assert.deepEqual(keys(selection.items), [rel('mount'), Host], 'set must pick exactly these two and let the rest go.');
    assert.equal(selection.has('view', VIEW), false, 'A view not given must no longer be picked.');
    selection.set([]);
    assert.deepEqual(keys(selection.items), [], 'set of nothing must let everything go.');
    assert.equal(selection.last, null, 'With nothing picked there is no last picked.');
  });

  test('an item given twice counts once, and one that names nothing is never picked', async () => {
    const { selection } = await example();
    selection.set([Host, Host, el('Nobody'), rel('Host'), view('v-nothing'), App]);
    assert.deepEqual(keys(selection.items), [Host, App], 'set must keep each item once, where it first stands, and leave out what the model does not hold.');
    const { calls } = counting(selection);
    selection.toggle(el('Nobody'));
    assert.deepEqual(keys(selection.items), [Host, App], 'toggle of an item that names nothing must change nothing.');
    assert.equal(calls.n, 0, 'toggle of an item that names nothing must call no listener.');
  });

  test('the same list again changes nothing and tells nobody', async () => {
    const { selection } = await example();
    const { calls } = counting(selection);
    const before = selection.items;
    selection.set([Host]);
    assert.equal(calls.n, 1, 'set of a new list must tell the listener once.');
    assert.notEqual(selection.items, before, 'A change must give a new array.');
    assert.deepEqual(keys(before), [], 'The array before the change must be unchanged.');
    const after = selection.items;
    selection.set([Host]);
    assert.equal(calls.n, 1, 'set of the same list must tell nobody.');
    assert.equal(selection.items, after, 'set of the same list must leave items the very same array.');
    selection.set([Host, App]);
    assert.equal(calls.n, 2, 'set of a longer list must tell the listener.');
    selection.set([App, Host]);
    assert.equal(calls.n, 3, 'The same items in another order are another list: the listener must be told.');
    assert.deepEqual(keys(selection.items), [App, Host], 'set must keep the order given.');
  });

  test('toggle puts an item first, or takes it out', async () => {
    const { selection } = await example();
    selection.set([Host, App]);
    const { calls } = counting(selection);
    selection.toggle(DevHost);
    assert.deepEqual(keys(selection.items), [DevHost, Host, App], 'toggle of an item not picked must put it first.');
    assert.equal(calls.n, 1, 'toggle must tell the listener once.');
    selection.toggle(Host);
    assert.deepEqual(keys(selection.items), [DevHost, App], 'toggle of an item picked must take it out, the others keeping their order.');
    assert.equal(calls.n, 2, 'The second toggle must tell the listener once more.');
  });

  test('a click picks a box or a line alone, with Ctrl adds it or lets it go, and on the ground picks the view', async () => {
    const { selection } = await example();
    selection.click(hit('el', 'Host'));
    assert.deepEqual(keys(selection.items), [Host], 'A click on a box must pick it alone.');
    selection.click(hit('el', 'App', true));
    assert.deepEqual(keys(selection.items), [App, Host], 'A click with Ctrl on a box must add it first.');
    selection.click(hit('el', 'App', true));
    assert.deepEqual(keys(selection.items), [Host], 'A click with Ctrl on a box picked must let it go.');
    selection.click(hit('rel', 'mount'));
    assert.deepEqual(keys(selection.items), [rel('mount')], 'A click on a line must pick it alone.');
    selection.click(hit('ground', null));
    assert.deepEqual(keys(selection.items), [view(VIEW)], 'A click on the ground must pick the plane\'s view alone.');
    selection.set([Host]);
    selection.click(hit('ground', null, true));
    assert.deepEqual(keys(selection.items), [view(VIEW)], 'A click on the ground with Ctrl must still pick the view alone.');
  });

  test('the view in front is what the dock last said, and none for a view the model does not hold', async () => {
    const { selection } = await example();
    selection.set([Host]);
    const { calls } = counting(selection);
    selection.front(VIEW);
    assert.equal(selection.view, VIEW, 'front must make the view the one in front.');
    assert.equal(calls.n, 1, 'front must tell the listener once.');
    assert.deepEqual(keys(selection.items), [Host], 'front must leave what is picked.');
    selection.front(VIEW);
    assert.equal(calls.n, 1, 'front of the view already in front must tell nobody.');
    selection.front('v-nothing');
    assert.equal(selection.view, null, 'front of a view the model does not hold must set none.');
    assert.equal(calls.n, 2, 'That change must tell the listener once.');
    selection.front(null);
    assert.equal(calls.n, 2, 'front(null) with none in front must tell nobody.');
  });

  test('what leaves the model is let go, and nothing comes back by itself', async () => {
    const { session: s, selection } = await example();
    selection.set([DevHost, Host, rel('s-DevHost'), view(VIEW)]);
    selection.front(VIEW);
    const { calls } = counting(selection);
    s.history.edit(() => {
      s.model.relationships = s.model.relationships.filter((r) => r.id !== 's-DevHost');
      s.model.elements = s.model.elements.filter((e) => e.id !== 'DevHost');
      s.model.views.forEach((v) => { delete v.layout.DevHost; });
      return 'Deleted part def DevHost';
    });
    assert.deepEqual(keys(selection.items), [Host, view(VIEW)], 'An edit that takes an element and a line out of the model must let them go.');
    assert.equal(selection.view, VIEW, 'The view in front is still in the model.');
    assert.equal(calls.n, 1, 'The change must tell the listener once.');
    s.history.undo();
    assert.deepEqual(keys(selection.items), [Host, view(VIEW)], 'An undo that brings them back must not pick them again.');
    assert.equal(calls.n, 1, 'An undo that lets nothing go must tell nobody.');
    s.history.edit(() => { elementOf(s, 'Host').name = 'Host2'; return 'Renamed to part def Host2'; });
    assert.equal(calls.n, 1, 'An edit that only renames must tell nobody.');
    assert.deepEqual(keys(selection.items), [Host, view(VIEW)], 'A rename must leave what is picked.');
    s.history.edit(() => {
      s.model.views = s.model.views.filter((v) => v.id !== VIEW);
      return 'Deleted view ' + VIEW;
    });
    assert.deepEqual(keys(selection.items), [Host], 'An edit that takes the view out of the model must let it go.');
    assert.equal(selection.view, null, 'The view in front is gone: view must be null.');
    assert.equal(calls.n, 2, 'That change must tell the listener once.');
  });

  test('every listener is told even when one throws, and a stopped one is told no more', async () => {
    const { selection } = await example();
    const boom = new Error('the first listener threw');
    let second = 0;
    selection.listen(() => { throw boom; });
    const stop = selection.listen(() => { second++; });
    assert.throws(() => selection.set([Host]), (error) => error === boom, 'set must throw the first error once all have been told.');
    assert.equal(second, 1, 'The second listener must be told although the first threw.');
    stop();
    assert.throws(() => selection.set([App]), (error) => error === boom, 'The first listener still throws.');
    assert.equal(second, 1, 'A listener that was stopped must be told no more.');
  });

  test('the methods can be handed over as they are', async () => {
    const { selection } = await example();
    const { set, toggle, click, front, has, listen } = selection;
    let calls = 0;
    const stop = listen(() => { calls++; });
    set([Host]);
    assert.equal(has('el', 'Host'), true, 'A bare set and has must work.');
    toggle(App);
    assert.equal(has('el', 'App'), true, 'A bare toggle must work.');
    click({ view: VIEW, type: 'el', id: 'DevHost', at: { x: 0, y: 0 }, add: false });
    assert.deepEqual(keys(selection.items), [DevHost], 'A bare click must work.');
    front(VIEW);
    assert.equal(selection.view, VIEW, 'A bare front must work.');
    assert.equal(calls, 4, 'A bare listen must tell once for each of the four changes.');
    stop();
    set([]);
    assert.equal(calls, 4, 'A bare stop must stop it.');
  });

  test('picking does not search the model: 2,000 picks on the 5,000-element model take under 300 ms', async (t) => {
    const { selectionOf } = await loadCore();
    const s = await session(JSON.stringify(scaleState(5000)), 'scale.json');
    const selection = selectionOf(s);
    const ids = s.model.elements.slice(-500).map((e) => e.id);
    assert.equal(ids.length, 500, 'The 5,000-element model must hold at least 500 elements.');
    let picked = 0;
    const started = performance.now();
    for (let round = 0; round < 4; round++) {
      for (const id of ids) {
        selection.set([{ type: 'el', id }]);
        if (selection.has('el', id)) picked++;
      }
    }
    const ms = performance.now() - started;
    t.diagnostic(`2,000 picks on the 5,000-element model took ${ms.toFixed(0)} ms`);
    assert.equal(picked, 2000, 'Every pick of an element of the model must be held.');
    assert.ok(ms < 300, `2,000 picks took ${ms.toFixed(0)} ms; the model's ids must be answered from an index, not searched at each call (limit 300 ms).`);
  });
});
