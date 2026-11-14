// The marks: canvas/app/src/core/marks.ts (plan/slice-2.md, section 4, seams 4 and 5; plan/architecture.md, contract
// 7). For an element or a relationship, how many problems it has and the notes pinned to it; for a view, the free
// notes that float on it. They are worked out from the entries of the checks and from the open notes, and nobody
// writes them. A node and an edge carry theirs in `data.marks`: the adapter gives every new one NO_MARKS and carries
// the field over from the node before, and a view's store sets it.
//
// The entries and the notes are their packages' (2-6, 2-7), so most tests here load the core with the stand-ins of
// core.mjs in their place. They run in Node. The last tests are the store's part (plane/viewStore.ts): how it puts the marks on its nodes and
// edges, and that it listens to the marks only while it is itself listened to.

import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, test } from 'node:test';
import { EXAMPLE, FIXTURES, STAND_IN_ENTRIES, STAND_IN_NOTES, clock, lib, loadCore, loadCoreWith, plain, readText, stateFiles } from './core.mjs';

const ANNOTATIONS = path.join(FIXTURES, 'annotations.json');
const withStandIns = () => loadCoreWith({ 'core/notes': STAND_IN_NOTES, 'core/checks': STAND_IN_ENTRIES });
const sessionOf = (core, file) => core.openText(lib, readText(file), { name: path.basename(file) }, { now: clock() });
/** A timer that never runs: the checks are heard here only when a change makes them stale. */
const never = { later: () => () => {} };
/** Any change of the model: the checks then tell, and whoever reads the entries reads them again. */
let touches = 0;
const touch = (s) => s.history.edit(() => { s.model.package.doc = `touched ${touches += 1}`; return 'Touched the package'; });
const entry = (type, id, message = 'A problem.', list = 'problems') => ({ list, message, about: type === null ? null : { type, id } });
const pin = (id, no, resolved = false, hot = false) => ({ id, no, resolved, hot });

describe('the marks', () => {
  test('NO_MARKS is the one object every unmarked thing carries', async () => {
    const core = await loadCore();
    assert.deepEqual(plain(core.NO_MARKS), { problems: 0, pins: [] });
    assert.ok(Object.isFrozen(core.NO_MARKS) && Object.isFrozen(core.NO_MARKS.pins), 'NO_MARKS is shared by every unmarked thing, so nobody may write it.');
    for (const { name, file } of stateFiles()) {
      const s = sessionOf(core, file);
      for (const view of s.model.views) {
        for (const far of [false, true]) {
          const p = core.project(lib, s.model, view, { far });
          for (const node of p.nodes) assert.equal(node.data.marks, core.NO_MARKS, `${name}, ${view.id}: the adapter gives the new node ${node.id} NO_MARKS itself.`);
          for (const edge of p.edges) assert.equal(edge.data.marks, core.NO_MARKS, `${name}, ${view.id}: the adapter gives the new edge ${edge.id} NO_MARKS itself.`);
        }
      }
    }
    // The marks of a session with no problem and no note are NO_MARKS for everything, listened to or not.
    const s = sessionOf(core, EXAMPLE);
    const marks = core.marksOf(s);
    assert.equal(core.marksOf(s), marks, 'marksOf must give the same object at each call for one session.');
    const stop = marks.listen(() => {});
    assert.equal(marks.of('el', 'Host'), core.NO_MARKS);
    assert.equal(marks.of('rel', 'mount'), core.NO_MARKS);
    assert.equal(marks.of('el', 'nobody'), core.NO_MARKS, 'A thing the model does not hold is unmarked.');
    assert.deepEqual([...marks.free('v-proof')], []);
    stop();
  });

  test('an unmarked node keeps NO_MARKS and stays the same object through a projection, and a mark put on a node is carried over', async () => {
    const core = await loadCore();
    const s = sessionOf(core, EXAMPLE);
    const view = s.model.views[0];
    const first = core.project(lib, s.model, view);
    const again = core.project(lib, s.model, view, { previous: first });
    assert.equal(again, first, 'A projection that reads the same is the projection before.');

    // What a view's store does: a new object only for the node and the edge whose marks differ.
    const onHost = Object.freeze({ problems: 2, pins: Object.freeze([pin('n1', 1)]) });
    const onMount = Object.freeze({ problems: 1, pins: Object.freeze([]) });
    const marked = {
      ...first,
      nodes: first.nodes.map((n) => (n.id === 'Host' ? { ...n, data: { ...n.data, marks: onHost } } : n)),
      edges: first.edges.map((e) => (e.id === 'mount' ? { ...e, data: { ...e.data, marks: onMount } } : e)),
    };
    const node = (p, id) => p.nodes.find((n) => n.id === id);
    const edge = (p, id) => p.edges.find((e) => e.id === id);

    // A projection after it: every node and edge is the object it was, the marked ones with their marks.
    const next = core.project(lib, s.model, view, { previous: marked });
    for (const n of next.nodes) assert.equal(n, node(marked, n.id), `${n.id} reads the same, so it must be the object it was.`);
    for (const e of next.edges) assert.equal(e, edge(marked, e.id), `${e.id} reads the same, so it must be the object it was.`);
    assert.equal(node(next, 'Host').data.marks, onHost);
    assert.equal(node(next, 'App').data.marks, core.NO_MARKS, 'An unmarked node keeps NO_MARKS.');
    assert.equal(edge(next, 'mount').data.marks, onMount);

    // After a change: the node that changed is a new object and keeps its marks, as it keeps `selected`.
    s.history.edit(() => { s.model.elements.find((e) => e.id === 'Host').name = 'Hostess'; return 'Renamed to part def Hostess'; });
    s.history.edit(() => { s.model.relationships.find((r) => r.id === 'mount').name = 'mounts'; return 'Renamed the connection'; });
    const renamed = core.project(lib, s.model, view, { previous: next });
    assert.notEqual(node(renamed, 'Host'), node(next, 'Host'), 'A renamed node is a new object.');
    assert.equal(node(renamed, 'Host').data.name, 'Hostess');
    assert.equal(node(renamed, 'Host').data.marks, onHost, 'A node that changed carries the marks of the node before.');
    assert.equal(edge(renamed, 'mount').data.label, 'mounts');
    assert.equal(edge(renamed, 'mount').data.marks, onMount, 'An edge that changed carries the marks of the edge before.');
    assert.equal(node(renamed, 'App'), node(next, 'App'), 'A node nothing touched stays the object it was.');
    assert.equal(node(renamed, 'App').data.marks, core.NO_MARKS);

    // Through a gesture's steps and across far and near, which give every node a new object.
    const start = renamed;
    const host = node(start, 'Host');
    const places = new Map([['Host', { ...plain(view.layout.Host), x: host.position.x + 50, y: host.position.y + 20 }]]);
    const step = core.projectStep(lib, s.model, view, start, places, { previous: start });
    assert.notEqual(node(step, 'Host'), host, 'A moved node is a new object.');
    assert.equal(node(step, 'Host').data, host.data, 'A node that only moved keeps its data object, marks and all.');
    assert.equal(edge(step, 'mount'), edge(start, 'mount'), 'A step alters no edge.');
    const back = core.projectStep(lib, s.model, view, start, new Map(), { previous: step });
    assert.equal(node(back, 'Host').data.marks, onHost);
    const far = core.project(lib, s.model, view, { far: true, previous: back });
    assert.equal(node(far, 'Host').data.marks, onHost, 'Far, a marked node keeps its marks: the plane draws none far, the store forgets none.');
    assert.equal(edge(far, 'mount').data.marks, onMount);
    assert.equal(node(far, 'App').data.marks, core.NO_MARKS);
    const near = core.project(lib, s.model, view, { previous: far });
    assert.equal(node(near, 'Host').data.marks, onHost);

    // The adapter never sets a mark: a node with no node before it gets NO_MARKS, whatever was read before.
    const fresh = core.project(lib, s.model, view);
    assert.equal(node(fresh, 'Host').data.marks, core.NO_MARKS);
    const freshStep = core.projectStep(lib, s.model, view, near, places);
    assert.equal(node(freshStep, 'Host').data.marks, core.NO_MARKS, 'A step with no projection before it gives new nodes, each with NO_MARKS.');
    assert.equal(edge(freshStep, 'mount').data.marks, core.NO_MARKS);
  });

  test('marks from stand-in entries and notes', async () => {
    const core = await withStandIns();
    const s = sessionOf(core, ANNOTATIONS);
    core.checksOf(s, never);
    const notes = core.notesOf(s);
    core.standInEntries(s, [
      entry('el', 'Host', 'Two elements are named Host.'), entry('el', 'Host', 'A rule of the specification.', 'rules'),
      entry('rel', 'mount'), entry('view', 'v-proof'), entry(null, null),
    ]);
    const marks = core.marksOf(s);
    let calls = 0;
    const stop = marks.listen(() => { calls += 1; });
    assert.equal(calls, 0, 'Whoever listens reads next: listen() itself calls nobody.');

    // Problems are counted for a thing whatever list an entry is in; pins carry their note's id, number and state.
    const host = marks.of('el', 'Host');
    assert.deepEqual(plain(host), { problems: 2, pins: [pin('n-host-abstract', 1)] });
    assert.deepEqual(plain(marks.of('rel', 'mount')), { problems: 1, pins: [pin('n-mount-one', 2, true)] }, 'A resolved note\'s pin says so.');
    assert.equal(marks.of('el', 'Host'), host, 'A thing\'s marks are the same object until they change.');
    assert.ok(Object.isFrozen(host) && Object.isFrozen(host.pins), 'Marks are handed to every node of a thing: nobody may write them.');
    assert.equal(marks.of('el', 'App'), core.NO_MARKS, 'A thing with no problem and no note carries NO_MARKS itself.');
    assert.equal(marks.of('el', 'Page'), core.NO_MARKS, 'An archived note is no pin.');
    assert.equal(marks.of('rel', 'Host').problems, 0, 'A problem of an element is not a problem of a line.');
    assert.equal(marks.of('el', 'v-proof'), core.NO_MARKS, 'An entry about a view marks no element.');
    const none = marks.free('v-proof');
    assert.deepEqual([...none], [], 'A free note with no view floats on none: the scaffold converts no state file\'s point.');
    assert.equal(marks.free('v-other'), none, 'Every view with no free note has the same empty list.');

    // A free note: its view's list changes, and nothing else does.
    const free = notes.add({ view: 'v-proof', x: 40, y: 50 });
    assert.equal(calls, 1, 'One change of the notes that changes a mark tells once.');
    const floating = marks.free('v-proof');
    assert.deepEqual(plain(floating), [{ id: free.id, no: 5, resolved: false, hot: false, x: 40, y: 50 }]);
    assert.equal(marks.free('v-proof'), floating, 'A view\'s free pins are the same array until they change.');
    assert.equal(marks.free('v-other'), none);
    assert.equal(marks.of('el', 'Host'), host, 'A thing whose marks did not change keeps its object.');

    // A second note on Host: the pins are in the order of their numbers.
    const second = notes.add({ type: 'el', id: 'Host' });
    assert.equal(calls, 2);
    assert.deepEqual(plain(marks.of('el', 'Host').pins), [pin('n-host-abstract', 1), pin(second.id, 6)]);
    assert.notEqual(marks.of('el', 'Host'), host);
    assert.equal(marks.free('v-proof'), floating);

    // The panel points at a note: its pins are hot, wherever they are, and only they change.
    const mount = marks.of('rel', 'mount');
    notes.point('n-host-abstract');
    assert.equal(calls, 3);
    assert.deepEqual(plain(marks.of('el', 'Host').pins), [pin('n-host-abstract', 1, false, true), pin(second.id, 6)]);
    assert.equal(marks.of('rel', 'mount'), mount);
    notes.point(free.id);
    assert.deepEqual(plain(marks.free('v-proof')), [{ id: free.id, no: 5, resolved: false, hot: true, x: 40, y: 50 }]);
    assert.equal(marks.of('el', 'Host').pins[0].hot, false);
    notes.point(null);
    assert.equal(calls, 5);

    // A change of the notes that changes no mark tells nobody.
    notes.setText(second.id, 'Why abstract?');
    assert.equal(calls, 5, 'A note\'s text is no mark.');

    // A note moved: off its target, onto the next.
    notes.moveTo(second.id, { type: 'rel', id: 'mount' });
    assert.equal(calls, 6);
    assert.deepEqual(plain(marks.of('el', 'Host')), { problems: 2, pins: [pin('n-host-abstract', 1)] });
    assert.deepEqual(plain(marks.of('rel', 'mount').pins), [pin('n-mount-one', 2, true), pin(second.id, 6)]);

    // The entries change: the marks follow when the checks tell.
    core.standInEntries(s, [entry('rel', 'mount')]);
    assert.equal(marks.of('el', 'Host').problems, 2, 'The marks follow the checks, which have not told yet.');
    touch(s);
    assert.equal(calls, 7);
    assert.deepEqual(plain(marks.of('el', 'Host')), { problems: 0, pins: [pin('n-host-abstract', 1)] });
    touch(s);
    assert.equal(calls, 7, 'The checks telling of the same entries changes no mark.');

    // A free note moved to another point of its view: its view's list is a new array, with the new point.
    const was = marks.free('v-proof');
    notes.moveTo(free.id, { view: 'v-proof', x: 60, y: 70 });
    assert.equal(calls, 8, 'A free pin moved within its view tells once.');
    const moved = marks.free('v-proof');
    assert.notEqual(moved, was, 'A view\'s free pins that moved are a new array.');
    assert.deepEqual(plain(moved), [{ id: free.id, no: 5, resolved: false, hot: false, x: 60, y: 70 }]);

    // Everything taken away: the thing carries NO_MARKS itself again.
    notes.remove('n-host-abstract');
    assert.equal(marks.of('el', 'Host'), core.NO_MARKS);
    notes.remove(free.id);
    assert.equal(marks.free('v-proof'), none);

    // What is no note is passed over, and a note on something the model does not hold is kept for when it comes back.
    const odd = sessionOf(core, ANNOTATIONS);
    core.checksOf(odd, never);
    const oddNotes = core.notesOf(odd);
    oddNotes.file().notes.push('no note', null, { text: 'no id' }, { id: 'n-gone', no: 7, target: 'gone', text: '', resolved: false }, { id: 'n-nowhere', target: null, text: '' });
    const oddMarks = core.marksOf(odd);
    oddMarks.listen(() => {});
    assert.deepEqual(plain(oddMarks.of('el', 'Host').pins), [pin('n-host-abstract', 1)]);
    assert.deepEqual(plain(oddMarks.of('el', 'gone').pins), [pin('n-gone', 7)], 'A pin is by its note\'s target, in the model or not.');
    assert.deepEqual(plain(oddMarks.of('rel', 'gone').pins), [pin('n-gone', 7)], 'A note names its target by id alone, so its pin answers for an element and for a line of that id.');
    assert.deepEqual([...oddMarks.free('v-proof')], []);
    stop();
  });

  test('every listener is told even when another throws, and a listener that stopped is not told', async () => {
    const core = await withStandIns();
    const s = sessionOf(core, ANNOTATIONS);
    core.checksOf(s, never);
    const marks = core.marksOf(s);
    let told = 0;
    marks.listen(() => { throw new Error('first'); });
    const stop = marks.listen(() => { told += 1; });
    assert.throws(() => core.notesOf(s).point('n-host-abstract'), /first/);
    assert.equal(told, 1);
    assert.equal(marks.of('el', 'Host').pins[0].hot, true, 'The marks are worked out though a listener threw.');
    stop();
    stop();
    assert.throws(() => core.notesOf(s).point(null), /first/);
    assert.equal(told, 1);
  });

  test('idle with no listener: the marks listen to the checks and the notes only while something listens to them', async () => {
    const core = await withStandIns();
    const s = sessionOf(core, ANNOTATIONS);
    let waits = 0;
    const checks = core.checksOf(s, { later: () => { waits += 1; return () => {}; } });
    const notes = core.notesOf(s);
    const base = core.NOTES_LISTENERS.now;   // the session listens to its notes itself, for `unsaved`
    core.standInEntries(s, [entry('el', 'App')]);

    const marks = core.marksOf(s);
    assert.equal(core.NOTES_LISTENERS.now, base, 'Asking for the marks listens to nothing.');
    assert.equal(checks.state.found, null, 'Asking for the marks runs no check.');
    assert.equal(marks.of('el', 'App'), core.NO_MARKS, 'Idle, the marks are what was last worked out: nothing yet.');
    assert.deepEqual([...marks.free('v-proof')], []);
    touch(s);
    notes.add({ type: 'el', id: 'Page' });
    assert.equal(waits, 0, 'Idle, a change of the model starts no check.');
    assert.equal(checks.state.found, null);
    assert.equal(marks.of('el', 'Page'), core.NO_MARKS, 'Idle, a change of the notes is not heard.');

    // The first listener: the checks run and the marks are worked out before listen() returns.
    let calls = 0;
    const stopA = marks.listen(() => { calls += 1; });
    assert.equal(core.NOTES_LISTENERS.now, base + 1, 'Live, the marks listen to the notes.');
    assert.notEqual(checks.state.found, null, 'Live, the marks make the checks live: they ran.');
    assert.equal(checks.state.stale, false);
    assert.equal(calls, 0);
    assert.equal(marks.of('el', 'App').problems, 1);
    assert.equal(marks.of('el', 'Page').pins.length, 1);
    const stopB = marks.listen(() => {});
    assert.equal(core.NOTES_LISTENERS.now, base + 1, 'A second listener adds no listener to the notes.');
    touch(s);
    assert.equal(waits, 1, 'Live, a change of the model makes the checks wait for a pause.');

    // The last listener gone: idle again, and the marks stay what they were.
    stopA();
    assert.equal(core.NOTES_LISTENERS.now, base + 1, 'While one listener is left the marks stay live.');
    stopB();
    assert.equal(core.NOTES_LISTENERS.now, base, 'With no listener the marks listen to the notes no more.');
    touch(s);
    assert.equal(waits, 1, 'With no listener the checks are idle again: a change starts no wait.');
    core.standInEntries(s, []);
    notes.remove(notes.open.at(-1).id);
    assert.equal(marks.of('el', 'App').problems, 1, 'Idle, the marks stay what was last worked out.');
    assert.equal(marks.of('el', 'Page').pins.length, 1);

    // Listened to again: brought up to date at once, and nobody is called for it.
    let late = 0;
    const stopC = marks.listen(() => { late += 1; });
    assert.equal(marks.of('el', 'App'), core.NO_MARKS);
    assert.equal(marks.of('el', 'Page'), core.NO_MARKS);
    assert.equal(late, 0);
    assert.equal(calls, 0, 'A listener that stopped is not told.');
    stopC();
  });

  test('the notes a file holds reach the marks as pins on what they are on', async () => {
    const core = await loadCore();
    const s = sessionOf(core, ANNOTATIONS);
    const marks = core.marksOf(s);
    const stop = marks.listen(() => {});
    assert.deepEqual(plain(marks.of('el', 'Host').pins), [pin('n-host-abstract', 1)], 'Note 1 is pinned to Host.');
    assert.deepEqual(plain(marks.of('rel', 'mount').pins), [pin('n-mount-one', 2, true)], 'Note 2 is pinned to the connection mount, and is resolved.');
    assert.equal(marks.of('el', 'Page').pins.length, 0, 'The archived note 4 is no pin.');
    stop();
  });
});

// ---- A view's store (seam 4): the marks beside `selected`.

describe('the marks on a view\'s nodes and edges', () => {
  const load = () => loadCoreWith({ 'core/notes': STAND_IN_NOTES, 'core/checks': STAND_IN_ENTRIES }, 'plane/viewStore');
  const VIEW = 'v-proof';
  const node = (snapshot, id) => snapshot.nodes.find((n) => n.id === id);
  const edge = (snapshot, id) => snapshot.edges.find((e) => e.id === id);
  /** The ids of the nodes and of the edges that are not the objects they were. */
  const renewed = (before, after) => [
    ...after.nodes.filter((n) => n !== node(before, n.id)).map((n) => n.id),
    ...after.edges.filter((e) => e !== edge(before, e.id)).map((e) => `rel ${e.id}`),
  ];
  function listen(store) {
    const calls = { n: 0 };
    const stop = store.subscribe(() => { calls.n += 1; });
    return { calls, stop };
  }

  test('the store puts the marks on its nodes and edges, a new object only where the marks differ, and an unmarked node keeps NO_MARKS and stays the same object through a projection', async () => {
    const core = await load();
    const s = sessionOf(core, ANNOTATIONS);
    // The checks' pause, run by hand: after a change of the model, settle() lets the check that waits run, as the
    // timer would. The marks hear of new entries when the checks tell.
    const waiting = [];
    core.checksOf(s, { later: (run) => { waiting.push(run); return () => {}; } });
    const settle = () => { const run = waiting.pop(); waiting.length = 0; if (run) run(); };
    const notes = core.notesOf(s);
    const marks = core.marksOf(s);
    const store = core.viewStoreOf(s, VIEW);

    // With no subscriber the marks are idle, and every node and edge carries NO_MARKS.
    const idle = store.getSnapshot();
    for (const n of idle.nodes) assert.equal(n.data.marks, core.NO_MARKS, `Idle, the node ${n.id} carries NO_MARKS.`);
    for (const e of idle.edges) assert.equal(e.data.marks, core.NO_MARKS, `Idle, the edge ${e.id} carries NO_MARKS.`);

    // Subscribed to, the store reads the marks: the two notes of the file are pins on Host and on mount.
    const { calls } = listen(store);
    const live = store.getSnapshot();
    assert.deepEqual(renewed(idle, live), ['Host', 'rel mount'], 'Only the node and the edge whose marks differ are new objects.');
    assert.equal(node(live, 'Host').data.marks, marks.of('el', 'Host'), 'A node carries the very Marks the marks give for its element.');
    assert.deepEqual(plain(node(live, 'Host').data.marks), { problems: 0, pins: [pin('n-host-abstract', 1)] });
    assert.equal(edge(live, 'mount').data.marks, marks.of('rel', 'mount'));
    assert.deepEqual(plain(edge(live, 'mount').data.marks.pins), [pin('n-mount-one', 2, true)]);
    assert.equal(node(live, 'Page').data.marks, core.NO_MARKS, 'An unmarked node keeps NO_MARKS itself.');
    assert.equal(store.getSnapshot(), live, 'The snapshot is the same object until something changes.');

    // Through a projection: the unmarked nodes stay the objects they were, and a marked node keeps its marks.
    s.history.edit(() => { s.model.elements.find((e) => e.id === 'App').name = 'Application'; return 'Renamed to part def Application'; });
    const renamed = store.getSnapshot();
    assert.notEqual(renamed, live);
    assert.ok(renewed(live, renamed).includes('App'), 'The renamed box is drawn again.');
    assert.equal(node(renamed, 'Page'), node(live, 'Page'), 'An unmarked node that reads the same is the same object through a projection.');
    assert.equal(node(renamed, 'Page').data.marks, core.NO_MARKS);
    assert.equal(node(renamed, 'Host'), node(live, 'Host'), 'A marked node that reads the same is the same object too: its marks are carried over.');
    assert.equal(edge(renamed, 'mount'), edge(live, 'mount'));
    // A gesture's step keeps them as well.
    const position = (id, x, y, dragging) => ({ type: 'position', id, position: { x, y }, dragging });
    const host = node(renamed, 'Host').position;
    store.nodesChanged([position('Host', host.x + 40, host.y + 40, true)]);
    assert.equal(node(store.getSnapshot(), 'Host').data.marks, marks.of('el', 'Host'), 'A dragged node keeps its marks at each step.');
    assert.equal(node(store.getSnapshot(), 'Page').data.marks, core.NO_MARKS);
    store.nodesChanged([position('Host', host.x, host.y, false)]);

    // A change of the marks: a problem on App and one on the line t-hosts. One telling, two new objects.
    let before = store.getSnapshot();
    let told = calls.n;
    settle();
    core.standInEntries(s, [entry('el', 'App'), entry('rel', 't-hosts'), entry('view', VIEW), entry(null)]);
    touch(s);
    settle();
    let after = store.getSnapshot();
    assert.deepEqual(renewed(before, after), ['App', 'rel t-hosts'], 'A change of the marks renews only what it marks.');
    assert.equal(calls.n, told + 1, 'A change of the marks tells the store\'s subscribers once.');
    assert.equal(node(after, 'App').data.marks.problems, 1);
    assert.equal(edge(after, 't-hosts').data.marks.problems, 1);
    assert.equal(node(after, 'App').selected ?? false, false, 'Marks change nothing of what is selected.');

    // The panel points at a note: its pin is hot, on its node alone.
    before = after;
    told = calls.n;
    notes.point('n-host-abstract');
    after = store.getSnapshot();
    assert.deepEqual(renewed(before, after), ['Host']);
    assert.deepEqual(plain(node(after, 'Host').data.marks.pins), [pin('n-host-abstract', 1, false, true)]);
    assert.equal(calls.n, told + 1);

    // Selected and marked are set apart: picking a marked node keeps its marks, and its data is the object it was.
    before = after;
    core.selectionOf(s).set([{ type: 'el', id: 'Host' }]);
    after = store.getSnapshot();
    assert.deepEqual(renewed(before, after), ['Host']);
    assert.equal(node(after, 'Host').selected, true);
    assert.equal(node(after, 'Host').data, node(before, 'Host').data, 'A pick changes `selected` and leaves the node\'s data the object it was.');

    // A mark that goes: the node carries NO_MARKS again.
    before = after;
    core.standInEntries(s, []);
    touch(s);
    settle();
    after = store.getSnapshot();
    assert.deepEqual(renewed(before, after), ['App', 'rel t-hosts']);
    assert.equal(node(after, 'App').data.marks, core.NO_MARKS);
    assert.equal(edge(after, 't-hosts').data.marks, core.NO_MARKS);
  });

  test('the store listens to the marks only while it is itself listened to: a hidden tab runs no check', async () => {
    const core = await load();
    const s = sessionOf(core, ANNOTATIONS);
    let waits = 0;
    const checks = core.checksOf(s, { later: () => { waits += 1; return () => {}; } });
    const notes = core.notesOf(s);
    const base = core.NOTES_LISTENERS.now;
    const store = core.viewStoreOf(s, VIEW);
    const other = core.viewStoreOf(s, 'no-such-view');

    store.getSnapshot();
    store.camera(800, 600);
    touch(s);
    assert.equal(core.NOTES_LISTENERS.now, base, 'A store with no subscriber listens to no note.');
    assert.equal(checks.state.found, null, 'A store with no subscriber runs no check.');
    assert.equal(waits, 0);

    const a = listen(store);
    assert.equal(core.NOTES_LISTENERS.now, base + 1, 'A store that is listened to makes the marks live.');
    assert.notEqual(checks.state.found, null, 'Live, the checks ran.');
    assert.equal(a.calls.n, 0, 'Nobody is told for the marks read at the first subscription: the subscriber reads next.');
    assert.equal(store.getSnapshot().nodes.find((n) => n.id === 'Host').data.marks.pins.length, 1);
    const b = listen(other);
    assert.equal(core.NOTES_LISTENERS.now, base + 1, 'Two stores share the session\'s marks.');
    a.stop();
    assert.equal(core.NOTES_LISTENERS.now, base + 1, 'While one store is listened to the marks stay live.');
    b.stop();
    assert.equal(core.NOTES_LISTENERS.now, base, 'With no store listened to the marks are idle again.');
    touch(s);
    assert.equal(waits, 0, 'Idle again, a change starts no check.');

    // What changed while nobody listened is read at the next subscription.
    notes.add({ type: 'el', id: 'Page' });
    assert.equal(store.getSnapshot().nodes.find((n) => n.id === 'Page').data.marks, core.NO_MARKS, 'Idle, a new note is not heard.');
    const c = listen(store);
    assert.equal(store.getSnapshot().nodes.find((n) => n.id === 'Page').data.marks.pins.length, 1, 'Listened to again, the store is brought up to date.');
    c.stop();
  });
});
