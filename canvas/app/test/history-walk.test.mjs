// The history, walked at random: canvas/app/src/core/history.ts over the example and every fixture, through changes a
// seeded generator chooses from the kinds the page makes (a name typed, a box dragged, an element placed, deleted,
// shown or hidden, a list reordered, a layout or the whole model put in place of another) and some it shouldn't make
// (a write behind edit(), a change that says nothing). Two walks:
//
// 1. Beside the old page's changes.js, which runs here with stand-ins for the page around it. After every change,
//    Undo and end of a run, the two agree on what edit() returned, on what was told (what the old script handed its
//    render()), on the steps, the log and the mistakes reported, and on the model. The two places where the new
//    history differs by design are allowed for where they are checked, each with its reason.
// 2. Alone, with Redo. After every change, Undo, Redo and end of a run, the model is, as text, exactly what it was
//    after the step that is now the newest, and mark() gives that state's number.
//
// Between the two, every difference from changes.js that is meant, beyond Redo and the listeners, is made on both
// sides, and each side does what is said of it.
//
// The first walk and those differences go when the old page goes: they read canvas/src/core/page/changes.js.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';
import { EXAMPLE, ROOT, clock, lib, loadCore, plain, readJSON, stateFiles } from './core.mjs';

const LISTS = ['elements', 'relationships', 'views'];
const sorted = (list) => list.slice().sort();
/** A value as JSON text with every object's keys sorted, so two values that hold the same read the same. */
const inOrder = (value) => JSON.stringify(value, (key, held) => (
  held && typeof held === 'object' && !Array.isArray(held) ? Object.fromEntries(sorted(Object.keys(held)).map((k) => [k, held[k]])) : held
));
/** What was touched as sets, a sorted list each, without the ids in `without`. */
const sets = (touched, without) => Object.fromEntries(LISTS.map((list) => (
  [list, sorted(touched[list].filter((id) => !(without && without[list].includes(id))))]
)));

/** A generator of numbers from 0 up to 1, the same for the same seed (mulberry32). */
function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- The changes.

/**
 * Chooses the next step of a walk from the model as it is: `{ name, run(model, replace), key }` for a change (run
 * makes it on the model it is given, by ids, so both sides of the first walk make the same one; replace puts a whole
 * new model in place), or `{ name, stray(model) }`, `{ name, end }`, `{ name, undo }`, `{ name, redo }`. Nothing it
 * chooses depends on the order of an object's keys, which the old script's Undo changes and the new history keeps.
 */
function choose(r, model, counter, withRedo) {
  const pick = (list) => list[Math.floor(r() * list.length)];
  const els = model.elements.map((e) => e.id);
  const rels = model.relationships.map((x) => x.id);
  const views = model.views.map((v) => v.id);
  const placed = model.views.flatMap((v) => sorted(Object.keys(v.layout)).map((id) => ({ view: v.id, id, box: 'x' in v.layout[id] })));
  const boxes = placed.filter((p) => p.box);
  const ports = placed.filter((p) => !p.box);
  const el = (m, id) => m.elements.find((e) => e.id === id);
  const rel = (m, id) => m.relationships.find((x) => x.id === id);
  const view = (m, id) => m.views.find((v) => v.id === id);
  const fresh = (prefix) => prefix + (counter.n += 1);
  const table = [
    [8, () => { // a name, typed: a run
      if (!els.length) return null;
      const id = pick(els); const name = 'n' + Math.floor(r() * 5);
      return { name: 'type a name', key: 'name:' + id, run: (m) => { el(m, id).name = name; return 'Renamed ' + id + ' to ' + name; } };
    }],
    [5, () => { // a doc, set at once
      if (!els.length) return null;
      const id = pick(els); const doc = 'd' + Math.floor(r() * 3);
      return { name: 'set a doc', run: (m) => { el(m, id).doc = doc; return 'Set the doc of ' + id; } };
    }],
    [4, () => { // a line's field, or whether it is drawn, in words of its own for the log
      if (!rels.length) return null;
      const id = pick(rels); const hide = r() < 0.5; const doc = 'r' + Math.floor(r() * 3);
      return { name: 'change a line', run: (m) => {
        const x = rel(m, id);
        if (!hide) x.doc = doc; else if (x.hidden) delete x.hidden; else x.hidden = true;
        return { what: 'Changed the line ' + id, log: 'Changed the line ' + id + ', at length' };
      } };
    }],
    [14, () => { // a move of a drag: a run, often back where it started
      if (!boxes.length) return null;
      const p = pick(boxes); const dx = pick([-20, 0, 20, 20]); const dy = pick([-10, 0, 10]);
      return { name: 'move', key: 'move:' + p.id, run: (m) => { const at = view(m, p.view).layout[p.id]; at.x += dx; at.y += dy; return 'Moved ' + p.id; } };
    }],
    [4, () => { // a resize
      if (!boxes.length) return null;
      const p = pick(boxes); const w = 100 + Math.floor(r() * 4) * 40;
      return { name: 'resize', run: (m) => { Object.assign(view(m, p.view).layout[p.id], { w, h: w / 2 }); return 'Resized ' + p.id; } };
    }],
    [3, () => { // a port slid along its border
      if (!ports.length) return null;
      const p = pick(ports); const side = pick(['top', 'right', 'bottom', 'left']); const at = pick([0.25, 0.5, 0.75]);
      return { name: 'slide a port', key: 'move:' + p.id, run: (m) => { Object.assign(view(m, p.view).layout[p.id], { side, at }); return 'Moved ' + p.id; } };
    }],
    [6, () => { // a new element, placed
      const id = fresh('E'); const into = pick(views); const owner = r() < 0.4 && els.length ? pick(els) : undefined;
      return { name: 'place', run: (m) => {
        const made = { id, kind: owner ? 'PartUsage' : 'PartDefinition', name: id, doc: '', code: [] };
        if (owner) made.owner = owner;
        m.elements.push(made);
        view(m, into).layout[id] = { x: 10, y: 20, w: 220, h: 72 };
        return 'Added ' + id;
      } };
    }],
    [5, () => { // a new line
      if (els.length < 2) return null;
      const id = fresh('R'); const from = pick(els); const to = pick(els);
      return { name: 'draw', run: (m) => { m.relationships.push({ id, kind: 'Specialization', from, to }); return 'Drew ' + id; } };
    }],
    [4, () => { // Delete, as the old panel's: new lists in place of the old
      if (els.length < 3) return null;
      const id = pick(els);
      return { name: 'delete an element', run: (m) => {
        const ids = new Set([id]);
        m.elements.filter((e) => e.owner === id).forEach((e) => ids.add(e.id));
        m.relationships.filter((x) => ids.has(x.from) || ids.has(x.to)).forEach((x) => ids.add(x.id));
        m.elements = m.elements.filter((e) => !ids.has(e.id));
        m.relationships = m.relationships.filter((x) => !ids.has(x.id));
        m.views.forEach((v) => ids.forEach((gone) => { delete v.layout[gone]; }));
        return 'Deleted ' + id;
      } };
    }],
    [3, () => { // a line taken out of its list
      if (!rels.length) return null;
      const id = pick(rels);
      return { name: 'delete a line', run: (m) => { m.relationships.splice(m.relationships.indexOf(rel(m, id)), 1); return 'Deleted the line ' + id; } };
    }],
    [4, () => { // removed from a view
      if (!placed.length) return null;
      const p = pick(placed);
      return { name: 'hide', run: (m) => { delete view(m, p.view).layout[p.id]; return 'Removed ' + p.id + ' from ' + p.view; } };
    }],
    [4, () => { // shown in a view, unless it is there
      if (!els.length) return null;
      const id = pick(els); const into = pick(views);
      return { name: 'show', run: (m) => {
        const layout = view(m, into).layout;
        if (layout[id]) return null;
        layout[id] = { x: 0, y: 0, w: 200, h: 60 };
        return 'Showed ' + id + ' in ' + into;
      } };
    }],
    [2, () => { // a new view
      const id = fresh('V');
      const made = { id, kind: 'GeneralView', name: id, doc: '', x: 0, y: 0, layout: {}, options: {} };
      return { name: 'add a view', run: (m) => { m.views.push(plain(made)); return 'Added ' + id; } };
    }],
    [1, () => { // a view deleted, while another is left
      if (views.length < 2) return null;
      const id = pick(views);
      return { name: 'delete a view', run: (m) => { m.views.splice(m.views.indexOf(view(m, id)), 1); return 'Deleted the view ' + id; } };
    }],
    [3, () => { // a view's frame moved: a run
      const id = pick(views); const dx = pick([-50, 50]);
      return { name: 'move a view', key: 'move:' + id, run: (m) => { view(m, id).x += dx; return 'Moved the view ' + id; } };
    }],
    [2, () => { // a view's name
      const id = pick(views); const name = 'v' + Math.floor(r() * 3);
      return { name: 'name a view', key: 'name:' + id, run: (m) => { view(m, id).name = name; return 'Renamed the view ' + id; } };
    }],
    [3, () => { // one item of a list moved to another place in it
      const list = pick(LISTS); const n = model[list].length;
      if (n < 2) return null;
      const from = Math.floor(r() * n); const to = Math.floor(r() * n);
      return { name: 'reorder the ' + list, run: (m) => {
        const [item] = m[list].splice(from, 1);
        m[list].splice(to, 0, item);
        return 'Moved one of the ' + list;
      } };
    }],
    [2, () => { // a layout put in place of another, with one place gone and one moved
      const id = pick(views); const keys = sorted(Object.keys(view(model, id).layout));
      const drop = keys.length ? pick(keys) : null; const nudge = keys.length ? pick(keys) : null;
      return { name: 'put a new layout', run: (m) => {
        const v = view(m, id);
        const next = {};
        for (const key of sorted(Object.keys(v.layout))) if (key !== drop) next[key] = Object.assign({}, v.layout[key]);
        if (nudge && next[nudge] && 'x' in next[nudge]) next[nudge].x += 5;
        v.layout = next;
        return 'Laid out ' + id + ' again';
      } };
    }],
    [3, () => { // code links: one more, one less, or a path typed
      if (!els.length) return null;
      const id = pick(els); const what = pick(['add', 'remove', 'path']); const text = 'p' + Math.floor(r() * 3);
      return { name: 'code link: ' + what, key: what === 'path' ? 'code:' + id : undefined, run: (m) => {
        const item = el(m, id);
        if (!Array.isArray(item.code)) item.code = [];
        if (what === 'add') { item.code.push({ path: '', language: 'typescript', text: '' }); return 'Added a code link to ' + id; }
        if (!item.code.length) return null;
        if (what === 'remove') { item.code.splice(0, 1); return 'Removed a code link from ' + id; }
        item.code[0].path = text;
        return 'Set the path of a code link of ' + id;
      } };
    }],
    [3, () => { // an owner given or taken away
      if (els.length < 2) return null;
      const id = pick(els); const owner = r() < 0.5 ? pick(els.filter((other) => other !== id)) : undefined;
      return { name: 'change an owner', run: (m) => { if (owner === undefined) delete el(m, id).owner; else el(m, id).owner = owner; return 'Moved ' + id; } };
    }],
    [2, () => { // an end of a line
      if (!rels.length || !els.length) return null;
      const id = pick(rels); const to = pick(els);
      return { name: 'move an end', run: (m) => { rel(m, id).to = to; return 'Moved an end of ' + id; } };
    }],
    [3, () => { // a place under a line's id: put, moved or taken away, sometimes with the line deleted by the same change
      if (!rels.length) return null;
      const id = pick(rels); const into = pick(views); const how = pick(['keep', 'splice', 'filter']); const dx = pick([0, 7]);
      return { name: 'place a line (' + how + ')', run: (m) => {
        const layout = view(m, into).layout;
        if (!layout[id]) layout[id] = { x: 1, y: 2, w: 80, h: 40 };
        else if (dx) layout[id].x += dx;
        else delete layout[id];
        if (how === 'splice') m.relationships.splice(m.relationships.indexOf(rel(m, id)), 1);
        if (how === 'filter') m.relationships = m.relationships.filter((x) => x.id !== id);
        return 'Changed the place of the line ' + id;
      } };
    }],
    [2, () => { // a place whose id names nothing, or names a line that is gone, which an element may then take
      const into = pick(views); const id = pick(['ghost', 'R1', 'R2']); const taken = r() < 0.3;
      return { name: 'leave a stale place', run: (m) => {
        const layout = view(m, into).layout;
        if (layout[id]) delete layout[id]; else layout[id] = { x: 9, y: 9, w: 80, h: 40 };
        if (taken && !el(m, id) && !rel(m, id)) m.elements.push({ id, kind: 'PartDefinition', name: id, doc: '', code: [] });
        return 'Changed a stale place';
      } };
    }],
    [2, () => { // the package
      const doc = 'p' + Math.floor(r() * 3);
      return { name: 'set the package\'s doc', run: (m) => { m.package.doc = doc; return 'Set the package\'s doc'; } };
    }],
    [2, () => ({ name: 'do nothing', key: r() < 0.5 ? 'name:x' : undefined, run: () => null })],
    [2, () => ({ name: 'do nothing, in words', key: r() < 0.5 ? 'move:x' : undefined, run: () => 'Did nothing' })],
    [1, () => { // a change that says nothing, yet changes: a mistake, recorded all the same
      if (!els.length) return null;
      const id = pick(els);
      return { name: 'change and say nothing', run: (m) => { el(m, id).doc += '!'; return null; } };
    }],
    [2, () => { // a write behind edit(): a mistake, reported when the next change comes
      if (!els.length) return null;
      const id = pick(els);
      return { name: 'write behind edit()', stray: (m) => { el(m, id).doc += '?'; } };
    }],
    [1, () => { // a whole new model: the one there is, with a doc changed and perhaps an element less
      const other = plain(model);
      if (other.elements.length) other.elements[Math.floor(r() * other.elements.length)].doc = 'imported';
      if (other.elements.length > 3 && r() < 0.5) other.elements.pop();
      return { name: 'import', run: (m, replace) => { replace(lib.normalize(plain(other))); return 'Imported the state'; } };
    }],
    [8, () => ({ name: 'end the run', end: true })],
    [10, () => ({ name: 'undo', undo: true })],
    [withRedo ? 9 : 0, () => ({ name: 'redo', redo: true })],
  ];
  let at = r() * table.reduce((sum, [weight]) => sum + weight, 0);
  for (const [weight, make] of table) {
    if (at < weight) return make() || { name: 'end the run', end: true };
    at -= weight;
  }
  return { name: 'end the run', end: true };
}

/** Runs a walk's steps, and says where it was when one of them failed. */
function walk(name, seed, steps, each) {
  const trail = [];
  try {
    for (let i = 0; i < steps; i += 1) each(i, trail);
  } catch (error) {
    error.message = `${name}, seed ${seed}, at step ${trail.length}; the last ten: ${trail.slice(-10).join(', ')}\n${error.message}`;
    throw error;
  }
}

// ---- The old page's changes.js, with stand-ins for the page around it: what it shares with the page's other
// scripts (window.SysMLCanvas, its state, the functions it takes and the ones it calls), a render() that keeps the
// element index as the page's layout does and notes what it was handed, and timers that are kept instead of run: one
// set for 0 ms is a mistake to throw, any other is the page's pause before it saves and checks.
function oldPage(model) {
  const timers = [];
  const rendered = [];
  const C = {
    state: { model, history: [], changes: [], layout: null, selection: null, active: null, pending: null },
    M: lib, PAUSE: 800, HISTORY: 100, undoButton: {}, now: clock(), say() {}, editable: () => true,
    viewById: (id) => C.state.model.views.find((v) => v.id === id) || null,
    render: (touched, how) => { C.state.layout = { ids: lib.idsOf(C.state.model) }; rendered.push({ touched, how }); },
    applyMarks() {}, check() {}, persist() {}, resolve: () => null, setActive() {}, renderInspector() {}, renderNotes() {}, syncNoteLabels() {},
  };
  const script = fs.readFileSync(path.join(ROOT, 'canvas', 'src', 'core', 'page', 'changes.js'), 'utf8');
  new Function('window', 'setTimeout', 'clearTimeout', script)({ SysMLCanvas: C }, (fn, ms) => { timers.push({ fn, ms }); return timers.length; }, () => {});
  C.state.layout = { ids: lib.idsOf(C.state.model) };
  /** The mistakes thrown since the last call. */
  const mistakes = () => timers.splice(0).filter((timer) => timer.ms === 0).map((timer) => {
    try { timer.fn(); } catch (error) { return error.message; }
    return null;
  });
  return { C, S: C.state, rendered, mistakes };
}
/** What the old script's howToDraw says, in the words listeners are told. */
const flagsOf = (how) => (how === null ? { structure: true, replaced: true, views: null, moved: false, shown: false }
  : { structure: how.structure, replaced: false, views: how.views ? Array.from(how.views) : null, moved: how.patch, shown: how.shown });

describe('the history, walked at random', () => {
  const files = stateFiles();

  test('change for change, it does what the old page\'s changes.js does', async (t) => {
    const { createHistory } = await loadCore();
    const count = { changes: 0, keyOrder: 0, stale: 0 };
    for (const { name, file } of files) {
      // Seed 22 is among them because one of its walks meets the rarer of the two differences allowed for below.
      for (const seed of [1, 2, 22]) {
        const r = random(seed * 7919 + name.length);
        const old = oldPage(lib.normalize(readJSON(file).model));
        const mistakes = [];
        const told = [];
        const history = createHistory(lib.normalize(readJSON(file).model), { now: clock(), mistake: (error) => mistakes.push(error.message) });
        history.listen((event) => told.push(event));
        const extras = new WeakMap();   // an old step made by an import -> what it says it touched only for the order of keys
        const counter = { n: 0 };
        const sameModel = () => assert.deepEqual(plain(history.model), plain(old.S.model), 'the model');
        walk(name, seed, 120, (i, trail) => {
          const step = choose(r, old.S.model, counter, false);
          trail.push(step.name);
          const before = plain(old.S.model);
          told.length = 0;
          old.rendered.length = 0;
          if (step.stray) { step.stray(old.S.model); step.stray(history.model); }
          else if (step.end) { old.C.endEdit(); history.endEdit(); }
          else if (step.undo) { old.C.undo(); history.undo(); }
          else {
            const a = old.C.edit(() => step.run(old.S.model, (model) => { old.S.model = model; }), step.key) ?? null;
            const b = history.edit(() => step.run(history.model, (model) => { history.model = model; }), step.key);
            const known = (list, id) => before[list].some((x) => x.id === id) || history.model[list].some((x) => x.id === id);
            if (step.name === 'import' && a && b) {
              // An import is told apart from the model before it as JSON text. The old script's Undo puts a key it
              // brings back last, so there an item that holds the same things in another order reads as touched; the
              // new history keeps the order. What the old side says may so hold more: items that are the same but for
              // the order of their keys, which is checked here, and which the comparisons below leave out.
              const more = { elements: [], relationships: [], views: [] };
              for (const list of LISTS) {
                for (const id of a[list].filter((other) => !b[list].includes(other))) {
                  assert.deepEqual(plain(history.model[list].find((x) => x.id === id)), before[list].find((x) => x.id === id), `${id} holds what it held`);
                  more[list].push(id);
                  count.keyOrder += 1;
                }
              }
              extras.set(old.S.history.at(-1), more);
              assert.deepEqual(sets(b), sets(a, more), 'what an import touched');
            } else if (a && b && LISTS.some((list) => a[list].some((id) => !known(list, id)))) {
              // A place whose id names nothing, before the change or after it, reads as an element's. The old script
              // sorts what was touched with a comparison that says nothing of such an id, so where it and the others
              // end up is the sort's choice; the new history puts the model's own in the model's order, and it last.
              assert.deepEqual(sets(b), sets(a), 'what a change with a stale place touched');
              for (const list of LISTS) {
                const order = history.model[list].map((x) => x.id);
                const own = b[list].filter((id) => order.includes(id));
                assert.deepEqual(own, own.slice().sort((x, y) => order.indexOf(x) - order.indexOf(y)), 'the model\'s own, in the model\'s order');
              }
              count.stale += 1;
            } else assert.deepEqual(b, plain(a), 'what edit returned');
            if (a) {
              assert.equal(old.rendered.length, 1, 'the old script drew once');
              const event = told.at(-1);
              assert.equal(event.by, 'edit');
              const { structure, replaced, views, moved, shown } = event;
              assert.deepEqual({ structure, replaced, views, moved, shown }, flagsOf(old.rendered[0].how), 'what the listeners are told to do about it');
              assert.deepEqual(sets(event.touched), sets(old.rendered[0].touched, extras.get(old.S.history.at(-1))), 'and what it touched');
            } else assert.equal(told.filter((event) => event.by === 'edit').length, 0, 'a change that did nothing is told to nobody');
            count.changes += 1;
          }
          assert.equal(history.steps.length, old.S.history.length, 'how many steps there are');
          const [mine, its] = [history.steps.at(-1), old.S.history.at(-1)];
          if (its) {
            assert.deepEqual({ what: mine.what, key: mine.key }, { what: its.what, key: its.key }, 'the newest step');
            assert.deepEqual(sets(mine.touched), sets(its.touched, extras.get(its)), 'and what it touched');
          }
          assert.equal(history.changes.length, old.S.changes.length, 'how many entries the log has');
          assert.deepEqual(history.changes.at(-1) ?? null, plain(old.S.changes.at(-1) ?? null), 'and its newest entry');
          assert.deepEqual(mistakes.splice(0), old.mistakes(), 'the mistakes reported');
          if (i % 10 === 9) sameModel();
        });
        sameModel();
        assert.deepEqual(history.changes, plain(old.S.changes), 'the log');
      }
    }
    t.diagnostic(`${count.changes} changes compared: ${count.stale} with a stale place, ${count.keyOrder} items an import touched on the old side only`);
    assert.ok(count.changes > 2000, `the walks made ${count.changes} changes`);
    assert.ok(count.stale > 0 && count.keyOrder > 0, 'and met both of the differences that are allowed for');
  });

  test('where it differs from changes.js by design, each difference is the one meant', async () => {
    const { createHistory } = await loadCore();
    // The same things asked of either side: the old script, and the new history.
    const sides = () => {
      const old = oldPage(lib.normalize(readJSON(EXAMPLE).model));
      const mistakes = [];
      const history = createHistory(lib.normalize(readJSON(EXAMPLE).model), { now: clock(), mistake: (error) => mistakes.push(error.message) });
      return [{
        get model() { return old.S.model; },
        replace: (model) => { old.S.model = model; },
        edit: (change, key) => old.C.edit(change, key),
        undo: () => old.C.undo(),
        steps: () => old.S.history.map((step) => step.what),
        mistakes: old.mistakes,
      }, {
        get model() { return history.model; },
        replace: (model) => { history.model = model; },
        edit: history.edit,
        undo: history.undo,
        steps: () => history.steps.map((step) => step.what),
        mistakes: () => mistakes.splice(0),
      }];
    };
    /** What a scenario gives on each side: [the old script's, the new history's]. */
    const both = (scenario) => sides().map((side) => scenario(side, (id) => side.model.elements.find((e) => e.id === id), () => side.model.views[0].layout));

    // 1. Undo puts a key it brings back where it was; the old script puts it last. The model holds the same either way.
    const [oldOrder, newOrder] = both((side, el, layout) => {
      const start = JSON.stringify(side.model);
      side.edit(() => { delete el('Page.app').owner; delete layout().Host; return 'Took two keys away'; });
      side.undo();
      const now = JSON.stringify(side.model);
      return { sameText: now === start, sameModel: inOrder(JSON.parse(now)) === inOrder(JSON.parse(start)), last: Object.keys(layout()).at(-1) };
    });
    assert.deepEqual(oldOrder, { sameText: false, sameModel: true, last: 'Host' });
    assert.deepEqual(newOrder, { sameText: true, sameModel: true, last: 'DevHost' });

    // 2. So a model put in place of an equal one touches nothing; on the old side, what Undo left in another order.
    const [oldImport, newImport] = both((side, el) => {
      const start = plain(side.model);
      side.edit(() => { delete el('Page.app').owner; return 'Took the owner away'; });
      side.undo();
      return side.edit(() => { side.replace(lib.normalize(start)); return 'Imported the state'; });
    });
    assert.deepEqual(plain(oldImport), { elements: ['Page.app'], relationships: [], views: [] });
    assert.deepEqual(newImport, { elements: [], relationships: [], views: [] });

    // 3. What was touched is in the model's order, a place's id that names nothing last; the old script's sort is
    // unsettled by such an id.
    const [oldStale, newStale] = both((side, el, layout) => side.edit(() => {
      el('DevHost').doc = 'changed';
      layout().ghost = { x: 1, y: 1, w: 80, h: 40 };
      el('Host').doc = 'changed';
      return 'Changed two and left a place';
    }));
    assert.deepEqual(sorted(plain(oldStale).elements), ['DevHost', 'Host', 'ghost']);
    assert.deepEqual(newStale.elements, ['Host', 'DevHost', 'ghost']);

    // 4. An equal list put in place of another is a change, though nothing reads differently. The old script drops
    // it when it says nothing, and then Undo no longer takes back the step before it: the list that step noted is
    // not the model's any more.
    const [oldEqual, newEqual] = both((side, el) => {
      const logbook = { id: 'Logbook', kind: 'PartDefinition', name: 'Logbook', doc: '', abstract: false, code: [] };
      side.edit(() => { side.model.elements.push(logbook); return 'Added part def Logbook'; });
      const returned = side.edit(() => { side.model.elements = side.model.elements.slice(); return null; });
      const out = { returned: plain(returned), steps: side.steps(), mistakes: side.mistakes() };
      while (side.steps().length) side.undo();
      return { ...out, logbookIsLeft: !!el('Logbook') };
    });
    assert.deepEqual(oldEqual, { returned: null, steps: ['Added part def Logbook'], mistakes: [], logbookIsLeft: true });
    assert.deepEqual(newEqual, {
      returned: { elements: [], relationships: [], views: [] }, steps: ['Added part def Logbook', 'Changed the model'],
      mistakes: ['A change given to edit() said it did nothing, yet it changed: an equal list, item or model put in place of another'], logbookIsLeft: false,
    });

    // 5. A change that throws is put back; the old script leaves what it wrote, in no step.
    const [oldThrow, newThrow] = both((side, el) => {
      assert.throws(() => side.edit(() => { el('Host').name = 'Half'; throw new Error('failed half way'); }), /failed half way/);
      return { name: el('Host').name, steps: side.steps() };
    });
    assert.deepEqual(oldThrow, { name: 'Half', steps: [] });
    assert.deepEqual(newThrow, { name: 'Host', steps: [] });

    // 6. A change made inside a change is refused; the old script records the inner one first and takes what the
    // outer one writes after it for a write behind edit().
    const [oldInside, newInside] = both((side, el) => {
      let refused = false;
      try {
        side.edit(() => {
          el('Host').name = 'Outer';
          side.edit(() => { el('App').doc = 'inner'; return 'Inner'; });
          el('Host').doc = 'written after the inner change';
          return 'Outer';
        });
      } catch (error) { refused = /inside a change/.test(error.message); }
      const steps = side.steps();
      side.edit(() => { el('DevHost').doc = 'next'; return 'Next'; });
      return { refused, steps, mistakes: side.mistakes(), name: el('Host').name };
    });
    assert.deepEqual(oldInside, { refused: false, steps: ['Inner', 'Outer'], mistakes: ['The model was changed outside edit(): Host'], name: 'Outer' });
    assert.deepEqual(newInside, { refused: true, steps: [], mistakes: [], name: 'Host' });
  });

  test('Undo and Redo bring back every state exactly, as text, and mark() names it', async (t) => {
    const { createHistory } = await loadCore();
    const count = { undone: 0, redone: 0, noStep: 0 };
    for (const { name, file } of files) {
      for (const seed of [1, 2, 3]) {
        const r = random(seed * 104729 + name.length);
        const mistakes = [];
        const history = createHistory(lib.normalize(readJSON(file).model), { now: clock(), mistake: (error) => mistakes.push(error.message) });
        const state = () => ({ text: JSON.stringify(history.model), mark: history.mark() });
        const after = new Map();   // a step -> the state after it
        let floor = state();       // the state under the oldest step
        const same = (when) => {
          const want = history.steps.length ? after.get(history.steps.at(-1)) : floor;
          assert.ok(want, when + ': the newest step has its state on record');
          assert.deepEqual(state(), want, when);
        };
        const counter = { n: 0 };
        walk(name, seed, 200, (i, trail) => {
          const step = choose(r, history.model, counter, true);
          trail.push(step.name);
          if (step.stray || step.end) {   // a write behind edit() is in no step, so this walk makes none
            const steps = history.steps.length;
            history.endEdit();
            if (history.steps.length < steps) count.noStep += 1;
            same('after the end of a run');
          } else if (step.undo) {
            history.endEdit();
            same('before Undo');
            assert.equal(history.undo() === null, history.undone.length === 0 && history.steps.length === 0);
            count.undone += 1;
            same('after Undo');
          } else if (step.redo) {
            history.endEdit();
            if (history.redo() !== null) count.redone += 1;
            same('after Redo');
          } else {
            const [first, full] = [history.steps[0], history.steps.length === 100];
            const touched = history.edit(() => step.run(history.model, (model) => { history.model = model; }), step.key);
            if (full && history.steps[0] !== first) floor = after.get(first);   // the oldest step was forgotten
            if (touched) {
              after.set(history.steps.at(-1), state());
              assert.equal(history.undone.length, 0, 'a new change forgets the redo list');
            } else same('after a change that did nothing');
          }
          assert.deepEqual(mistakes.splice(0).filter((message) => !/said it did nothing/.test(message)), [], 'no mistake but the one the walk makes');
        });
        // Everything made again, then everything taken back, then everything made again.
        history.endEdit();
        while (history.redo() !== null) same('redoing what was left');
        const end = state();
        while (history.undo() !== null) { count.undone += 1; same('undoing everything'); }
        assert.deepEqual(state(), floor);
        while (history.redo() !== null) { count.redone += 1; same('redoing everything'); }
        assert.deepEqual(state(), end);
      }
    }
    const walked = `${count.undone} steps undone, ${count.redone} redone, ${count.noStep} runs that were no step`;
    t.diagnostic(walked);
    assert.ok(count.undone > 500 && count.redone > 500 && count.noStep > 5, walked);
  });
});
