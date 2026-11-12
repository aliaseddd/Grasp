// The history: canvas/app/src/core/history.ts, the old page's changes.js ported, with redo. Every change to the model
// goes through edit(), which records an undo step with the ids of the elements, relationships and views the change
// touched, logs it for Claude, and tells its listeners what it touched and whether it altered the structure. A run of
// changes made with one key (the keystrokes of a name, the moves of a drag) is one undo step, logged once when it
// ends, and a run that ends where it started is no step. A step that Undo took back, Redo makes again, until a new
// change comes. A change made to the model any other way is reported as a mistake.
//
// The changes here are made as the page makes them (canvas/src/core/page/: tools.js, pointing.js, panel.js, views.js),
// on the example, and what each is said to touch is what canvas/test/edit.test.mjs checks on the old page.

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { EXAMPLE, clock, lib, loadCore, plain, readJSON, stateFiles } from './core.mjs';

const VIEW = 'v-proof';   // the example's one view
const touches = (elements, relationships, views) => ({ elements, relationships, views });
const NOTHING = touches([], [], []);

/** A history of the example, with what its listeners were told (told) and the mistakes it reported (mistakes). */
async function open(options = {}) {
  const { createHistory } = await loadCore();
  const told = [];
  const mistakes = [];
  const history = createHistory(lib.normalize(readJSON(EXAMPLE).model), { now: clock(), mistake: (error) => mistakes.push(error.message), ...options });
  history.listen((event) => told.push(event));
  return { history, told, mistakes };
}

const el = (history, id) => history.model.elements.find((e) => e.id === id);
const rel = (history, id) => history.model.relationships.find((r) => r.id === id);
const view = (history, id = VIEW) => history.model.views.find((v) => v.id === id);
const json = (history) => JSON.stringify(history.model);
const texts = (history) => history.changes.map((entry) => entry.text);
/** The newest undo step, as the old page's tests read it: its words, its run's key (null once ended), what it touched. */
const top = (history) => {
  const step = history.steps.at(-1);
  return step ? { what: step.what, key: step.key, touched: step.touched } : null;
};
/** What a listener is told of a change, with the flags a change that only renames has. */
const telling = (by, touched, flags = {}) => ({ by, touched, structure: false, replaced: false, views: null, moved: false, shown: false, ...flags });

// ---- Changes, made as the page's scripts make them.

/** Sets an element's name, as the panel's Name field does; with a key, as one keystroke of a run. */
function rename(history, id, name, key) {
  return history.edit(() => { el(history, id).name = name; return 'Renamed to part def ' + name; }, key);
}
/** Places a new part def in the example's view, as the palette's tool does. */
function place(history, id) {
  return history.edit(() => {
    history.model.elements.push({ id, kind: 'PartDefinition', name: id, doc: '', abstract: false, code: [] });
    view(history).layout[id] = { x: 40, y: 800, w: 220, h: 72 };
    return 'Added part def ' + id;
  });
}
/** Draws a specialization, as the line tools do. */
function draw(history, id, from, to) {
  return history.edit(() => {
    history.model.relationships.push({ id, kind: 'Specialization', from, to });
    return 'Drew ' + id;
  });
}
/** Moves a box in the example's view, as one move of a drag does: one change of the drag's run. */
function move(history, id, dx, dy) {
  return history.edit(() => {
    const at = view(history).layout[id];
    at.x += dx;
    at.y += dy;
    return 'Moved part def ' + id;
  }, 'move:' + id);
}
/** Deletes an element with what it holds, the lines on them and their places, as the panel's Delete does: new lists. */
function remove(history, id) {
  return history.edit(() => {
    const model = history.model;
    const ids = new Set([id, ...lib.descendants(model, id).map((e) => e.id)]);
    model.relationships.filter((r) => ids.has(r.from) || ids.has(r.to)).forEach((r) => ids.add(r.id));
    model.elements = model.elements.filter((e) => !ids.has(e.id));
    model.relationships = model.relationships.filter((r) => !ids.has(r.id));
    model.views.forEach((v) => ids.forEach((gone) => { delete v.layout[gone]; }));
    return 'Deleted part def ' + id;
  });
}

describe('the history', () => {
  test('a change is one step, undone and redone', async () => {
    const { history, told } = await open();
    const start = json(history);
    assert.equal(history.steps.length, 0, 'a history starts with no step');
    assert.equal(history.undo(), null, 'so there is nothing to take back');
    assert.equal(history.redo(), null, 'and nothing to make again');
    assert.deepEqual(told, [], 'and nobody is told');

    assert.deepEqual(rename(history, 'Host', 'Hosting'), touches(['Host'], [], []), 'edit returns what the change touched');
    assert.equal(history.steps.length, 1, 'a change is one step');
    assert.deepEqual(top(history), { what: 'Renamed to part def Hosting', key: null, touched: touches(['Host'], [], []) });
    const renamed = json(history);
    assert.equal(el(history, 'Host').name, 'Hosting');

    assert.equal(history.undo(), 'Renamed to part def Hosting', 'undo says what it took back');
    assert.equal(json(history), start, 'and the model is as it was');
    assert.equal(history.steps.length, 0);
    assert.deepEqual(history.undone.map((step) => step.what), ['Renamed to part def Hosting'], 'the step waits to be made again');

    assert.equal(history.redo(), 'Renamed to part def Hosting', 'redo says what it made again');
    assert.equal(json(history), renamed, 'and the model is as the change left it');
    assert.deepEqual(top(history), { what: 'Renamed to part def Hosting', key: null, touched: touches(['Host'], [], []) });
    assert.equal(history.undone.length, 0);

    assert.deepEqual(texts(history), ['Renamed to part def Hosting', 'Undid: Renamed to part def Hosting', 'Redid: Renamed to part def Hosting'],
      'each is logged');
    assert.deepEqual(told, [
      telling('edit', touches(['Host'], [], [])),
      telling('undo', touches(['Host'], [], [])),
      telling('redo', touches(['Host'], [], [])),
    ], 'and each tells the listeners what it touched');
  });

  test('changes that add and take away are undone and redone in order, with the model\'s own objects', async () => {
    const { history } = await open();
    const states = [json(history)];
    place(history, 'Logbook');
    states.push(json(history));
    const made = el(history, 'Logbook');
    draw(history, 's-Logbook', 'Logbook', 'Host');
    states.push(json(history));
    const lines = ['t-hosts', 't-Host-api', 's-ServerHost', 's-OnlineHost', 's-DevHost', 's-Logbook'];
    assert.deepEqual(remove(history, 'Host'), touches(['Host', 'Host.api'], lines, [VIEW]),
      'deleting a box touches it and what it holds, the lines on them, and the views they were in');
    states.push(json(history));
    assert.equal(el(history, 'Host'), undefined);
    assert.equal(view(history).layout['Host.api'], undefined);
    assert.equal(history.steps.length, 3);

    for (let i = 2; i >= 0; i -= 1) {
      history.undo();
      assert.equal(json(history), states[i], `undo ${3 - i} brings back the model before change ${i + 1}`);
    }
    assert.equal(el(history, 'Logbook'), undefined);
    assert.equal(view(history).layout.Logbook, undefined, 'the place went with the element');
    assert.equal(history.undo(), null, 'and then there is nothing left to take back');

    for (let i = 1; i <= 3; i += 1) {
      history.redo();
      assert.equal(json(history), states[i], `redo ${i} makes change ${i} again`);
      if (i === 1) assert.equal(el(history, 'Logbook'), made, 'with the object the change put in, not a copy of it');
    }
    assert.equal(history.redo(), null, 'and then there is nothing left to make again');

    // A step made again is taken back again, as often as asked.
    history.undo();
    assert.equal(json(history), states[2]);
    history.redo();
    assert.equal(json(history), states[3]);
    assert.deepEqual(history.steps.map((step) => step.what), ['Added part def Logbook', 'Drew s-Logbook', 'Deleted part def Host']);
  });

  test('the keystrokes of one key are one step', async () => {
    const { history, told } = await open();
    const start = json(history);
    for (const name of ['E', 'En', 'Eng', 'Engi', 'Engin', 'Engine']) rename(history, 'Host', name, 'name:Host');
    assert.equal(history.steps.length, 1, 'six keystrokes are one undo step');
    assert.deepEqual(top(history), { what: 'Renamed to part def Engine', key: 'name:Host', touched: touches(['Host'], [], []) },
      'in its last words, its run open while the field is');
    assert.deepEqual(texts(history), [], 'nothing is logged while the name is typed');
    assert.equal(told.length, 6, 'each keystroke is told to the listeners');
    assert.ok(told.every((event) => event.by === 'edit'));

    history.endEdit();
    assert.equal(top(history).key, null, 'leaving the field ends the run');
    assert.deepEqual(history.changes, [{ at: history.changes[0].at, text: 'Renamed to part def Engine', key: 'name:Host' }],
      'and logs it once, in its last words');
    assert.deepEqual(told.at(-1), telling('end', NOTHING, { views: [] }), 'the end of a run is told too: the steps changed, the model did not');
    history.endEdit();
    assert.equal(told.length, 7, 'ending a run that has ended does nothing');

    rename(history, 'Host', 'Engines', 'name:Host');
    assert.equal(history.steps.length, 2, 'the next keystroke in the field is a step of its own');
    history.endEdit();
    assert.deepEqual(texts(history), ['Renamed to part def Engines'], 'whose log entry takes the place of the one before it with its key');

    history.undo();
    assert.equal(el(history, 'Host').name, 'Engine');
    history.undo();
    assert.equal(json(history), start, 'undo takes the whole name back');
    history.redo();
    assert.equal(el(history, 'Host').name, 'Engine', 'and redo puts the whole name back');
  });

  test('a run ends when a change with another key comes, or one with no key, or Undo', async () => {
    const { history } = await open();
    rename(history, 'Host', 'H', 'name:Host');
    rename(history, 'App', 'A', 'name:App');
    assert.deepEqual(history.steps.map((step) => step.key), [null, 'name:App'], 'a change with another key ends the run before it');
    assert.deepEqual(texts(history), ['Renamed to part def H'], 'which is logged then');
    place(history, 'Logbook');
    assert.deepEqual(history.steps.map((step) => step.key), [null, null, null], 'and so does a change with no key');
    assert.deepEqual(texts(history), ['Renamed to part def H', 'Renamed to part def A', 'Added part def Logbook']);
    rename(history, 'Host', 'Ho', 'name:Host');
    history.undo();
    assert.deepEqual(texts(history).slice(3), ['Renamed to part def Ho', 'Undid: Renamed to part def Ho'], 'Undo ends the run, then takes it back');
    assert.equal(el(history, 'Host').name, 'H');
    assert.equal(history.steps.length, 3);
  });

  test('a run back where it started is no step', async () => {
    const { history, told } = await open();
    place(history, 'Logbook');
    const before = json(history);
    const logged = history.changes.length;
    for (const [dx, dy] of [[40, 10], [40, 10], [-80, -20]]) move(history, 'Host', dx, dy);
    assert.equal(history.steps.length, 2, 'while the drag is under way its run is a step');
    assert.equal(json(history), before, 'the box is back where it was');
    history.endEdit();
    assert.equal(history.steps.length, 1, 'a drag out and back is no undo step');
    assert.equal(history.changes.length, logged, 'and logs nothing');
    assert.equal(top(history).what, 'Added part def Logbook', 'Undo still takes back the change before it');
    assert.equal(told.at(-1).by, 'end', 'the listeners are told the run ended');

    // A name typed and deleted again.
    rename(history, 'Host', 'Hosts', 'name:Host');
    rename(history, 'Host', 'Host', 'name:Host');
    history.endEdit();
    assert.equal(history.steps.length, 1);
    assert.equal(history.changes.length, logged);

    // A run that was no step forgets nothing: Redo still makes the step before it again.
    history.undo();
    move(history, 'App', 10, 0);
    assert.equal(history.undone.length, 0, 'while the run is under way there is nothing to make again');
    move(history, 'App', -10, 0);
    history.endEdit();
    assert.deepEqual(history.undone.map((step) => step.what), ['Added part def Logbook'], 'the step Undo took back is still there to make again');
    assert.equal(history.redo(), 'Added part def Logbook');
    assert.equal(json(history), before);
  });

  test('a write outside edit() is reported', async () => {
    const { history, mistakes } = await open();
    el(history, 'Host').doc = 'written behind edit()';
    assert.deepEqual(mistakes, [], 'nothing is said until the next change comes');
    place(history, 'Logbook');
    assert.deepEqual(mistakes, ['The model was changed outside edit(): Host']);
    history.undo();
    assert.equal(el(history, 'Host').doc, 'written behind edit()', 'the write is in no undo step, so Undo leaves it');
    assert.equal(mistakes.length, 1, 'and it is reported once');

    // Undo and Redo report one too, each before it does its own work; a place names its element and its view.
    view(history).layout.App.x += 8;
    history.redo();
    assert.equal(mistakes.at(-1), 'The model was changed outside edit(): App; ' + VIEW);
    history.model.package.name = 'Other';
    history.undo();
    assert.equal(mistakes.at(-1), 'The model was changed outside edit(): the package');
    assert.equal(mistakes.length, 3);

    // A write that leaves what it wrote as it was is no change.
    el(history, 'Host').name = el(history, 'Host').name;
    rename(history, 'App', 'Application');
    assert.equal(mistakes.length, 3);
  });

  test('a mistake is thrown as an error of its own, once what the page is doing now is done', async () => {
    const { createHistory } = await loadCore();
    const history = createHistory(lib.normalize(readJSON(EXAMPLE).model));
    const later = [];
    const setTimeout = globalThis.setTimeout;
    globalThis.setTimeout = (fn, ms) => { later.push({ fn, ms }); return 0; };
    try {
      el(history, 'Host').doc = 'written behind edit()';
      assert.deepEqual(rename(history, 'App', 'Application'), touches(['App'], [], []), 'the change that finds the mistake is made all the same');
    } finally {
      globalThis.setTimeout = setTimeout;
    }
    assert.equal(later.length, 1);
    assert.equal(later[0].ms, 0);
    assert.throws(later[0].fn, { name: 'Error', message: 'The model was changed outside edit(): Host' });
  });

  test('a change that says it did nothing yet changed the model is reported, and recorded all the same', async () => {
    const { history, mistakes } = await open();
    const touched = history.edit(() => { el(history, 'Host').doc = 'changed'; return null; });
    assert.deepEqual(mistakes, ['A change given to edit() said it did nothing, yet it changed: Host']);
    assert.deepEqual(touched, touches(['Host'], [], []));
    assert.deepEqual(top(history), { what: 'Changed the model', key: null, touched: touches(['Host'], [], []) }, 'the change is an undo step');
    history.undo();
    assert.notEqual(el(history, 'Host').doc, 'changed', 'which Undo takes back');
  });

  test('an equal list or item put in place of another is a change too, so the steps before it still undo', async () => {
    const { history, mistakes } = await open();
    const start = json(history);
    place(history, 'Logbook');
    // Nothing reads differently after these, yet the model is made of other objects than the steps before them
    // noted: were they dropped as changes that did nothing, Undo would put Logbook's step back into a list the model
    // no longer holds.
    assert.deepEqual(history.edit(() => { history.model.elements = history.model.elements.slice(); return null; }), NOTHING);
    assert.deepEqual(mistakes, ['A change given to edit() said it did nothing, yet it changed: an equal list, item or model put in place of another']);
    history.edit(() => { history.model.elements[0] = { ...history.model.elements[0] }; return 'Put a copy of Page in its place'; }, 'copy');
    history.endEdit();
    assert.deepEqual(history.steps.map((step) => step.what), ['Added part def Logbook', 'Changed the model', 'Put a copy of Page in its place'],
      'a run of them is a step as well');
    history.model.views = history.model.views.slice();
    history.undo();
    assert.equal(mistakes.at(-1), 'The model was changed outside edit(): an equal list, item or model put in place of another',
      'and one made outside edit() is reported');
    history.undo();
    history.undo();
    assert.equal(el(history, 'Logbook'), undefined, 'Undo takes Logbook back');
    assert.equal(json(history), start);
    while (history.redo() !== null);
    assert.ok(el(history, 'Logbook'));
  });

  test('a change that did nothing is no step, and one that throws leaves the model as it was', async () => {
    const { history, told, mistakes } = await open();
    const start = json(history);
    assert.equal(history.edit(() => null), null, 'a change that did nothing returns null');
    assert.equal(history.edit(() => {}), null);
    assert.equal(history.steps.length, 0);
    assert.deepEqual(told, []);
    assert.deepEqual(texts(history), []);

    // A change that took a key away and put it back did nothing, and leaves the key where it was among the others.
    const takeAndPut = (key) => history.edit(() => {
      const layout = view(history).layout;
      const place = layout.Host;
      delete layout.Host;
      layout.Host = place;
      const owner = el(history, 'Page.app').owner;
      delete el(history, 'Page.app').owner;
      el(history, 'Page.app').owner = owner;
      return key ? 'Took Host out and put it back' : null;
    }, key);
    assert.equal(takeAndPut(), null);
    assert.equal(json(history), start, 'the model reads as it did, key for key');
    takeAndPut('move:Host');
    history.endEdit();
    assert.equal(history.steps.length, 0, 'and a run of such changes is no step');
    assert.equal(json(history), start);
    told.length = 0;

    assert.throws(() => history.edit(() => {
      el(history, 'Host').name = 'Half';
      history.model.elements.pop();
      delete view(history).layout.App;
      throw new Error('the change failed half way');
    }), /the change failed half way/);
    assert.equal(json(history), start, 'what a change wrote before it threw is put back');
    assert.equal(history.steps.length, 0, 'and it is no step');
    assert.deepEqual(told, []);

    assert.throws(() => history.edit(() => {
      el(history, 'Host').name = 'Outer';
      history.edit(() => 'a change inside a change');
      return 'Renamed';
    }), /^Error: edit\(\) was called inside a change/, 'a change made inside a change is refused');
    for (const inside of ['undo', 'redo', 'endEdit']) {
      const refused = new RegExp(`^Error: ${inside}\\(\\) was called inside a change`);
      assert.throws(() => history.edit(() => { history[inside](); return 'Called inside'; }), refused, `and so is ${inside}()`);
    }
    assert.equal(json(history), start);

    rename(history, 'Host', 'Hosting');
    assert.deepEqual(mistakes, [], 'none of it counts as a write outside edit()');
    assert.equal(history.steps.length, 1);
  });

  test('a new change forgets the redo list', async () => {
    const { history } = await open();
    rename(history, 'Host', 'Hosting');
    place(history, 'Logbook');
    history.undo();
    history.undo();
    assert.equal(history.undone.length, 2);

    // A change that did nothing forgets nothing.
    assert.equal(history.edit(() => null), null);
    assert.equal(history.undone.length, 2);
    assert.equal(history.redo(), 'Renamed to part def Hosting');

    rename(history, 'App', 'Application');
    assert.equal(history.undone.length, 0, 'a new change forgets what Undo took back');
    const now = json(history);
    assert.equal(history.redo(), null, 'so there is nothing to make again');
    assert.equal(json(history), now);
    assert.equal(el(history, 'Logbook'), undefined);
    assert.deepEqual(history.steps.map((step) => step.what), ['Renamed to part def Hosting', 'Renamed to part def Application']);
  });

  test('a change says what it touched', async () => {
    const { history, told } = await open();
    const last = () => told.at(-1);

    assert.deepEqual(place(history, 'A'), touches(['A'], [], [VIEW]), 'placing a box touches it and the view it is placed in');
    assert.deepEqual(last(), telling('edit', touches(['A'], [], [VIEW]), { structure: true, shown: true }), 'and alters the structure');
    place(history, 'B');
    assert.deepEqual(draw(history, 'r1', 'B', 'A'), touches([], ['r1'], []), 'drawing a line touches the line');
    assert.deepEqual(last(), telling('edit', touches([], ['r1'], []), { structure: true }));

    assert.deepEqual(move(history, 'B', 30, 0), touches(['B'], [], [VIEW]), 'moving a box touches it and its view');
    assert.deepEqual(last(), telling('edit', touches(['B'], [], [VIEW]), { views: [VIEW], moved: true }), 'and can have altered no other view');
    history.endEdit();

    assert.deepEqual(rename(history, 'DevHost', 'Dev'), touches(['DevHost'], [], []), 'a rename touches the element');
    assert.deepEqual(last(), telling('edit', touches(['DevHost'], [], [])), 'whichever views show it: the structure stays');

    assert.deepEqual(history.edit(() => { rel(history, 'mount').name = 'mounting'; return 'Renamed the connection'; }), touches([], ['mount'], []),
      'a line\'s field touches the line');
    assert.equal(last().structure, false);
    assert.deepEqual(history.edit(() => { rel(history, 'r1').to = 'Host'; return 'Moved an end'; }), touches([], ['r1'], []), 'and so does a line\'s end');
    assert.equal(last().structure, true, 'which alters the structure');
    assert.deepEqual(history.edit(() => { el(history, 'Page.app').owner = 'App'; return 'Moved into App'; }), touches(['Page.app'], [], []));
    assert.equal(last().structure, true, 'as an element\'s owner does');

    assert.deepEqual(remove(history, 'A'), touches(['A'], [], [VIEW]), 'deleting a box touches it and the views it was in');
    assert.deepEqual(remove(history, 'B'), touches(['B'], ['r1'], [VIEW]), 'and the lines on it');
    assert.deepEqual(last(), telling('edit', touches(['B'], ['r1'], [VIEW]), { structure: true, shown: true }));

    const added = history.edit(() => {
      history.model.views.push({ id: 'v2', kind: 'GeneralView', name: 'second', doc: '', x: 1400, y: 0, layout: {}, options: {} });
      return 'Added the general view second';
    });
    assert.deepEqual(added, touches([], [], ['v2']), 'a new view touches only itself');
    assert.equal(last().structure, true);
    const shown = history.edit(() => { view(history, 'v2').layout.Host = { x: 0, y: 0, w: 368, h: 130 }; return 'Showed part def Host in second'; });
    assert.deepEqual(shown, touches(['Host'], [], ['v2']), 'showing an element in it touches the element and the view');
    assert.deepEqual(last(), telling('edit', touches(['Host'], [], ['v2']), { views: ['v2'], shown: true }));
    assert.deepEqual(history.edit(() => { view(history, 'v2').x += 96; return 'Moved the view'; }, 'move:v2'), touches([], [], ['v2']),
      'moving a view touches it');
    assert.deepEqual(last(), telling('edit', touches([], [], ['v2']), { views: ['v2'], moved: true }));
    history.endEdit();
    assert.deepEqual(history.edit(() => { view(history, 'v2').name = 'other'; return 'Renamed the view'; }), touches([], [], ['v2']));
    assert.deepEqual(last(), telling('edit', touches([], [], ['v2'])));

    // What is inside an element is the element's: its code links, and what a link holds.
    const link = { path: 'hosts/README.md', language: 'markdown', text: '' };
    assert.deepEqual(history.edit(() => { el(history, 'Host').code.push(link); return 'Added a code link'; }), touches(['Host'], [], []));
    assert.deepEqual(history.edit(() => { el(history, 'Host').code[0].path = 'hosts/readme.md'; return 'Set the path'; }), touches(['Host'], [], []));
    assert.deepEqual(last(), telling('edit', touches(['Host'], [], [])));

    // A place is an element's or a line's, by whose id it carries: a line the model has, one the change draws, one it
    // deletes.
    const placed = history.edit(() => { view(history).layout.mount = { x: 300, y: 160, w: 80, h: 40 }; return 'Placed the connection'; });
    assert.deepEqual(placed, touches([], ['mount'], [VIEW]), 'a line\'s place touches the line and the view');
    const drawn = history.edit(() => {
      history.model.relationships.push({ id: 's-new', kind: 'Specialization', from: 'ServerHost', to: 'DevHost' });
      view(history).layout['s-new'] = { x: 0, y: 0, w: 80, h: 40 };
      return 'Drew and placed a line';
    });
    assert.deepEqual(drawn, touches([], ['s-new'], [VIEW]));
    const gone = history.edit(() => {
      history.model.relationships = history.model.relationships.filter((r) => r.id !== 'mount');
      view(history).layout.mount.x += 4;
      return 'Deleted a line, by a new list, and moved its place';
    });
    assert.deepEqual(gone, touches([], ['mount'], [VIEW]));
    const spliced = history.edit(() => {
      const lines = history.model.relationships;
      lines.splice(lines.indexOf(rel(history, 's-new')), 1);
      delete view(history).layout['s-new'];
      delete view(history).layout.mount;
      return 'Deleted a line, out of its list, with its place, and a place left behind';
    });
    assert.deepEqual(spliced, touches(['mount'], ['s-new'], [VIEW]), 'a place whose id names nothing any more reads as an element\'s');
    // Should a line ever carry an element's id (the library gives each id once), the place is the element's.
    draw(history, 'Host', 'ServerHost', 'OnlineHost');
    assert.deepEqual(history.edit(() => { view(history).layout.Host.x += 4; return 'Moved part def Host'; }), touches(['Host'], [], [VIEW]));

    // The package is in none of the three lists.
    assert.deepEqual(history.edit(() => { history.model.package.doc = 'One app.'; return 'Set the package\'s doc'; }), NOTHING,
      'a change to the package touches no element, line or view');
    assert.deepEqual(top(history), { what: 'Set the package\'s doc', key: null, touched: NOTHING }, 'and is a step all the same');

    // In the model's order, whatever order the change wrote them in; what it added comes last.
    const several = history.edit(() => {
      history.model.elements.push({ id: 'Z', kind: 'PartDefinition', name: 'Z', doc: '', abstract: false, code: [] });
      el(history, 'DevHost').doc = 'changed';
      el(history, 'Page').doc = 'changed';
      return 'Changed three';
    });
    assert.deepEqual(several, touches(['Page', 'DevHost', 'Z'], [], []));
  });

  test('a change that reorders a list touches what moved in it, not what only shifted', async () => {
    const { history, told } = await open();
    const order = () => plain(history.model.elements.map((e) => e.id));
    const ids = order();
    const touched = history.edit(() => {
      const elements = history.model.elements;
      elements.push(elements.shift());
      return 'Put the first element last';
    });
    assert.deepEqual(touched, touches([ids[0]], [], []), `moving the first of ${ids.length} elements to the end touches it alone`);
    assert.equal(told.at(-1).structure, true, 'the order is part of the structure');
    assert.deepEqual(order(), [...ids.slice(1), ids[0]]);
    history.undo();
    assert.deepEqual(order(), ids);
  });

  test('undo and redo tell the listeners what the step touched', async () => {
    const { history, told } = await open();
    place(history, 'Logbook');
    for (const dx of [10, 20, 30]) move(history, 'Host', dx, 0);
    move(history, 'App', 5, 5);   // another key: a step of its own
    history.endEdit();
    told.length = 0;

    history.undo();
    history.undo();
    history.undo();
    history.redo();
    assert.deepEqual(told, [
      telling('undo', touches(['App'], [], [VIEW]), { views: [VIEW], moved: true }),
      telling('undo', touches(['Host'], [], [VIEW]), { views: [VIEW], moved: true }),
      telling('undo', touches(['Logbook'], [], [VIEW]), { structure: true, shown: true }),
      telling('redo', touches(['Logbook'], [], [VIEW]), { structure: true, shown: true }),
    ]);

    // What a listener was told, and what edit returned, stay as they were, whatever the run does next: a run's later
    // changes add to what its step touched, not to what was said of its first change.
    history.redo();
    told.length = 0;
    const first = history.edit(() => { el(history, 'Host').doc = 'a'; return 'Set the docs'; }, 'docs');
    history.edit(() => { el(history, 'App').doc = 'b'; rel(history, 'mount').doc = 'c'; return 'Set the docs'; }, 'docs');
    assert.deepEqual(top(history).touched, touches(['Host', 'App'], ['mount'], []), 'the step touched what each change of its run touched');
    assert.deepEqual(first, touches(['Host'], [], []));
    assert.deepEqual(told.map((event) => event.touched), [touches(['Host'], [], []), touches(['App'], ['mount'], [])]);
    history.undo();
    assert.deepEqual(told.at(-1), telling('undo', touches(['Host', 'App'], ['mount'], [])), 'which Undo takes back, and says, together');
    told.at(-1).touched.elements.push('written by a listener');
    assert.deepEqual(history.undone.at(-1).touched, touches(['Host', 'App'], ['mount'], []), 'a listener holds its own copy');

    // A listener that stopped listening hears no more, and the others still do.
    const heard = [];
    const stop = history.listen((event) => heard.push(event.by));
    rename(history, 'Host', 'Hosting');
    stop();
    rename(history, 'Host', 'Host');
    assert.deepEqual(heard, ['edit']);
    assert.equal(told.at(-1).by, 'edit');
  });

  test('a listener that throws is reported as a mistake, and the change and the other listeners go on', async () => {
    const { createHistory } = await loadCore();
    const mistakes = [];
    const heard = [];
    const history = createHistory(lib.normalize(readJSON(EXAMPLE).model), { mistake: (error) => mistakes.push(error) });
    const failure = new Error('the panel could not draw');
    history.listen(() => { throw failure; });
    history.listen(() => { throw 'not even an error'; });
    history.listen((event) => heard.push(event.by));
    assert.deepEqual(rename(history, 'Host', 'Hosting'), touches(['Host'], [], []), 'edit returns as it does');
    assert.equal(history.steps.length, 1);
    assert.deepEqual(heard, ['edit'], 'the listener after the one that threw is told');
    assert.equal(mistakes[0], failure, 'the error itself is what is reported');
    assert.equal(mistakes[1].message, 'not even an error');
    history.undo();
    assert.deepEqual(heard, ['edit', 'undo']);
    assert.equal(mistakes.length, 4);
  });

  test('what a change puts into the model becomes part of it, and what is read from the model is the model\'s own', async () => {
    const { history, mistakes } = await open();
    const made = { id: 'New', kind: 'PartDefinition', name: 'New', doc: '', abstract: false, code: [] };
    history.edit(() => { history.model.elements.push(made); return 'Added part def New'; });
    const mine = el(history, 'New');
    assert.notEqual(mine, made, 'read it back from the model to change it later');
    assert.equal(history.model.elements.indexOf(mine), history.model.elements.length - 1, 'what is read is always the same object, so indexOf finds it');
    assert.equal(el(history, 'New'), mine);
    const linked = history.edit(() => { mine.code.push({ path: 'a.ts', language: 'typescript', text: '' }); return 'Added a code link'; });
    assert.deepEqual(linked, touches(['New'], [], []), 'and a write to it, or to what is inside it, is the model\'s');
    assert.deepEqual(mistakes, []);
    assert.equal(JSON.stringify(plain(history.model)), json(history), 'the model reads as plain data');
  });

  test('a change may put a whole new model in place of the old one, as one step', async () => {
    const { history, told, mistakes } = await open();
    const old = history.model;
    const start = json(history);
    const other = plain(old);
    other.elements.find((e) => e.id === 'Host').name = 'Hosting';
    other.elements = other.elements.filter((e) => e.id !== 'DevHost');   // normalize drops its line and its place with it
    other.views[0].layout.App.x += 8;
    const touched = history.edit(() => { history.model = lib.normalize(other); return 'Imported the state from other.json'; });
    assert.deepEqual(touched, touches(['Host', 'DevHost', 'App'], ['s-DevHost'], [VIEW]), 'what it touched is what differs between the two');
    assert.deepEqual(told.at(-1), telling('edit', touched, { structure: true, replaced: true }));
    const fresh = history.model;
    assert.notEqual(fresh, old);
    assert.equal(el(history, 'Host').name, 'Hosting');
    assert.deepEqual(rename(history, 'App', 'Application'), touches(['App'], [], []), 'the new model records its changes as the old one did');

    history.undo();
    assert.equal(history.undo(), 'Imported the state from other.json');
    assert.equal(history.model, old, 'undo gives the old model back, itself');
    assert.equal(json(history), start);
    assert.deepEqual(told.at(-1), telling('undo', touched, { structure: true, replaced: true }));
    history.redo();
    assert.equal(history.model, fresh, 'and redo the new one');
    history.redo();
    assert.equal(el(history, 'App').name, 'Application');

    assert.throws(() => { history.model = lib.normalize(other); }, /inside a change/, 'outside a change, the model can\'t be replaced');
    assert.deepEqual(mistakes, []);
  });

  test('undo remembers the last 100 changes', async () => {
    const { history } = await open();
    for (let i = 1; i <= 104; i += 1) rename(history, 'Host', 'Host' + i);
    assert.equal(history.steps.length, 100);
    let undone = 0;
    while (history.undo() !== null) undone += 1;
    assert.equal(undone, 100);
    assert.equal(el(history, 'Host').name, 'Host4', 'the four oldest changes can\'t be taken back');
    for (let i = 0; i < 100; i += 1) history.redo();
    assert.equal(el(history, 'Host').name, 'Host104');
  });

  test('the log keeps the last 200 entries, each with its time, and a change may give its entry other words or another key', async () => {
    const before = [{ at: '2026-11-06T09:00:00.000Z', text: 'Added part def Logbook' }];
    const { history } = await open({ changes: before, now: clock('2026-11-12T12:00:00.000Z') });
    assert.deepEqual(history.changes, before, 'a history starts from the log it is given');
    rename(history, 'Host', 'Hosting');
    assert.deepEqual(history.changes.at(-1), { at: '2026-11-12T12:00:00.000Z', text: 'Renamed to part def Hosting' });

    // { what, log, key }: the words for Undo, the words for the log, and the key that joins the entry to the one before
    // it.
    history.edit(() => { el(history, 'App').doc = 'a'; return { what: 'Set the doc', log: 'Set the doc of part def App to a', key: 'doc:App' }; });
    history.edit(() => { el(history, 'App').doc = 'ab'; return { what: 'Set the doc', log: 'Set the doc of part def App to ab', key: 'doc:App' }; });
    assert.equal(top(history).what, 'Set the doc');
    assert.equal(history.steps.length, 3, 'two changes with no key of their own are two steps');
    assert.deepEqual(history.changes.slice(2), [{ at: '2026-11-12T12:00:02.000Z', text: 'Set the doc of part def App to ab', key: 'doc:App' }],
      'whose entries the log joins by their key');
    history.edit(() => { el(history, 'App').doc = 'abc'; return { what: 'Set the doc', key: null }; }, 'doc:App');
    history.endEdit();
    assert.deepEqual(history.changes.slice(3), [{ at: '2026-11-12T12:00:03.000Z', text: 'Set the doc' }], 'key: null joins the entry to no other');

    history.logChange('Wrote the file');
    assert.equal(history.changes.at(-1).text, 'Wrote the file', 'the page may log what it did besides');

    for (let i = 0; i < 250; i += 1) rename(history, 'Host', 'Host' + i);
    assert.equal(history.changes.length, 200);
    assert.equal(history.changes.at(-1).text, 'Renamed to part def Host249');
    assert.equal(history.changes[0].text, 'Renamed to part def Host50');
  });

  test('mark() names the state the model is in: the same number again means the same model', async () => {
    const { history } = await open();
    const start = history.mark();
    rename(history, 'Host', 'Hosting');
    const renamed = history.mark();
    assert.notEqual(renamed, start);
    history.undo();
    assert.equal(history.mark(), start, 'Undo is back at the state before the change');
    history.redo();
    assert.equal(history.mark(), renamed, 'and Redo at the state after it');

    // Each change of a run is a state of its own; a run that was no step is back at the state before it.
    move(history, 'Host', 10, 0);
    const moving = history.mark();
    assert.notEqual(moving, renamed);
    move(history, 'Host', 10, 0);
    assert.notEqual(history.mark(), moving);
    const moved = history.mark();
    history.endEdit();
    assert.equal(history.mark(), moved, 'ending a run changes nothing in the model');
    move(history, 'App', 10, 0);
    move(history, 'App', -10, 0);
    history.endEdit();
    assert.equal(history.mark(), moved);

    // A new change after Undo is a new state, never an old one's number.
    history.undo();
    rename(history, 'App', 'Application');
    assert.ok(![start, renamed, moving, moved].includes(history.mark()));

    // Once the oldest change is forgotten, taking everything back no longer reaches the first state.
    for (let i = 0; i < 100; i += 1) rename(history, 'Host', 'Host' + i);
    while (history.undo() !== null);
    assert.notEqual(history.mark(), start);
  });

  test('a history holds any model the library reads: the example\'s and every fixture\'s, changed, undone and redone', async () => {
    const { createHistory } = await loadCore();
    for (const { name, file } of stateFiles()) {
      const mistakes = [];
      const history = createHistory(lib.normalize(readJSON(file).model), { mistake: (error) => mistakes.push(error.message) });
      const start = json(history);
      const first = history.model.elements[0];
      const showing = history.model.views.find((v) => v.layout[first.id]);
      history.edit(() => { first.doc += ' More.'; return 'Set the doc'; });
      if (showing) history.edit(() => { delete showing.layout[first.id]; return 'Removed from the view'; });
      history.edit(() => { history.model.relationships.reverse(); return 'Reversed the lines'; });
      const changed = json(history);
      assert.notEqual(changed, start, name);
      while (history.undo() !== null);
      assert.equal(json(history), start, `${name}: undone, the model is as the library read it`);
      while (history.redo() !== null);
      assert.equal(json(history), changed, `${name}: redone, it is as the changes left it`);
      assert.deepEqual(mistakes, [], name);
    }
  });
});
