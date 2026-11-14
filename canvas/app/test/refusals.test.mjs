// Criterion 6 of slice 2 as a test, "no silent refusal" (plan/slice-2.md, sections 5, 9 and 10): whenever an action
// is asked where it does not apply, the page says why in a sentence. This is its first test of three, in Node, through
// ask() of core/commands.ts, the one way an action is asked: check 12 of plan/status.json and line 108 of section 7.
//
// What the test holds (section 8, "Package 2-14", "The tests"):
// 1. Every row of section 5's table is in the action table. The rows are read out of the plan itself: its ids, and
//    its title and its key where the plan's cell gives one for each id.
// 2. Each row that can be refused is asked at a place where it does not apply, and gives a sentence that ends in a
//    full stop: applies() answers it, ask() returns it as `{ refused }` and says it through saysOf, and nothing of the
//    model, the history, the notes or the selection has changed.
// 3. The five that always apply are named as such, here and in the plan (save, put-down, new-view, open-text,
//    copy-text), and each applies at every place of this file.
// A row of the action table that section 5 does not hold has no place here, so it is a finding too.
//
// The scaffold (package 2-1) wrote the test first and marked it todo: it builds four of the 32 rows, so the test
// fails for the rows that are not in the table yet, and node's runner reports that failure as todo. The rows that ARE
// built are asked all the same, and what is wrong with one of them comes first in the failure, before the list of the
// rows still to be built: as each package lands its rows, the list shrinks and its rows are held (criterion 6 is
// checked "as each package adds its actions"). Package 2-14 owns the file and takes the todo mark off at the slice's
// close, when every row is in the table.
//
// The places. A place is a state file as it opens, the view in front, what is picked, and no hit (an action asked
// from the top bar or from a key). Each is made from the "Applies" column of section 5 alone, and `says` beside a row
// is the plan's sentence for it there, which a failure quotes. The test does not compare the sentence word for word:
// its `<…>` are the model library's words, and each package's own tests hold its sentences. Sentences that only run()
// can give (the table's "Then, from run") need a state their package's tests build, and are not asked here.
//
// PACKAGE 2-14 WRITES TWO MORE TESTS HERE AT THE SLICE'S CLOSE, in the page, which cannot be written against the
// scaffold's four rows (section 8, "Package 2-14"; section 10, "Criterion 6 has three tests"):
// - "every key of the table, pressed where its action does not apply, shows that sentence as a toast": each row with
//   a `key`, pressed in the built page at a place where the row does not apply; the toast (data-testid "toast", its
//   `data-said` larger than before) reads the sentence applies() gives.
// - "every control of an action that is shown where the action does not apply is greyed and carries its sentence":
//   every `[data-action]` in the document, in six states of the example; a control whose action does not apply there
//   is `disabled` or `aria-disabled="true"` and carries the sentence as its `aria-description`.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { EXAMPLE, FIXTURES, ROOT, clock, lib, loadCore, plain, readText } from './core.mjs';

const PLAN = path.join(ROOT, 'plan', 'slice-2.md');
/** How many actions section 5 names, in how many lines of its table. A table of another size is not that table. */
const ROWS = 32;
const LINES = 25;
/** The five that always apply (section 8, "Package 2-14"): nothing refuses them, so they have no place below. */
const ALWAYS = ['save', 'put-down', 'new-view', 'open-text', 'copy-text'];
/** "The four arrow keys" of the plan's row, for pan-left, pan-right, pan-up and pan-down in that order. */
const ARROWS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

/**
 * The rows of section 5's table: `{ id, title, key, file, pack, always }` for each action it names, in its order,
 * and what is wrong with the table itself. A line is `| ids | titles | keys | file (package) | Applies | Says |`;
 * `title` and `key` are undefined where the line does not give one for each of its ids (`key` is null where the cell
 * is empty: the action has no shortcut).
 */
function planRows(plan) {
  const from = plan.indexOf('\n### The action table');
  const to = plan.indexOf('\nFour things about the table:');
  if (from < 0 || to < from) return { rows: [], wrong: ['plan/slice-2.md, section 5, has no action table before "Four things about the table:".'] };
  const wrong = [];
  const rows = [];
  let lines = 0;
  for (const line of plan.slice(from, to).split('\n')) {
    if (!line.startsWith('| `')) continue;
    lines++;
    const cells = line.replace(/^\|/, '').replace(/\|\s*$/, '').split('|').map((cell) => cell.trim()); // a cell may be empty
    const ticked = (cell) => [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    const ids = ticked(cells[0]);
    const home = cells.length === 6 ? cells[3].match(/^`([a-z]+\.ts)` \((2-\d+)\)$/) : null;
    if (!ids.length || !home) { wrong.push(`A line of section 5's table does not read "| ids | titles | keys | \`file.ts\` (2-N) | Applies | Says |": ${line}`); continue; }
    const titles = cells[1].split(', ');
    const keys = cells[2] === 'the four arrow keys' ? ARROWS : ticked(cells[2]);
    ids.forEach((id, i) => rows.push({
      id,
      title: titles.length === ids.length && titles.every((title) => /^[A-Z]/.test(title)) ? titles[i] : undefined,
      key: cells[2] === '' ? null : keys.length === ids.length ? keys[i] : undefined,
      file: home[1],
      pack: home[2],
      always: /^Always\b/.test(cells[4]),
    }));
  }
  if (lines !== LINES || rows.length !== ROWS) wrong.push(`Section 5's table names ${rows.length} actions in ${lines} lines, not ${ROWS} in ${LINES}.`);
  const always = rows.filter((row) => row.always).map((row) => row.id);
  if (JSON.stringify(always) !== JSON.stringify(ALWAYS)) wrong.push(`Section 5 says that ${always.join(', ')} always apply; this test names ${ALWAYS.join(', ')}.`);
  return { rows, wrong };
}

const fixture = (name) => path.join(FIXTURES, `${name}.json`);
const el = (id) => ({ type: 'el', id });
/** The first element of a model that `fits`, or a failure that says which place could not be made. */
function elementWhere(session, what, fits) {
  const found = session.model.elements.find(fits);
  assert.ok(found, `${path.basename(session.name ?? 'the file')} holds no ${what}: this test's place cannot be made.`);
  return found;
}

/**
 * The places. `file` is opened afresh for every row asked; `set(session, selection)` brings a view to the front and
 * picks; `rows` are the actions that do not apply there, each with the plan's sentence for it.
 */
const PLACES = [
  {
    name: 'the example as it opens, its one general view in front, nothing picked',
    file: EXAMPLE,
    set: (s, sel) => sel.front(s.model.views[0].id),
    rows: {
      undo: 'There is nothing to undo.',
      redo: 'There is nothing to redo.',
      delete: 'Nothing is picked. Click a box or a line first.',
      'remove-from-view': 'Nothing is picked…',
      'show-in-view': 'Everything <a general view> can show is shown in <view Y> already.',
      'show-all': 'Show all is for a grid view. In <a general view>, pick what to show from the list.',
      'show-kind': 'Show all is for a grid view. In <a general view>, pick what to show from the list.',
      'delete-view': 'This is the only view, so it stays. Add another view first to delete this one.',
      'edit-label': 'Nothing is picked. Click a box or a line to edit its label.',
      'type-label': 'Nothing is picked. Click a box or a line to edit its label.',
      'add-note': 'Pick a box or a line to note it, or right-click the plane where the note goes.',
      'show-note': 'There is no note to show.',
      'archive-note': 'No note is resolved yet. A note can be archived once it is resolved.',
      'restore-note': 'The archive is empty.',
      'delete-note': 'There is no note to delete.',
      'add-code-link': 'Pick an element to link code to it.',
      'remove-code-link': 'Pick an element to link code to it.',
      'message-up': 'Pick a message in a sequence view first.',
      'message-down': 'Pick a message in a sequence view first.',
      'expand-all': 'Expand all is for a browser view.',
    },
  },
  {
    name: 'the example as it opens, before any view is in front',
    file: EXAMPLE,
    set: () => {},
    rows: Object.fromEntries(['zoom-in', 'zoom-out', 'fit-view', 'pan-left', 'pan-right', 'pan-up', 'pan-down'].map((id) => [id, 'No view is in front.'])),
  },
  {
    name: 'the grid fixture, its table (a grid view, which has no camera) in front',
    file: fixture('grid'),
    set: (s, sel) => sel.front('v-table'),
    rows: Object.fromEntries(['zoom-in', 'zoom-out', 'fit-view', 'pan-left', 'pan-right', 'pan-up', 'pan-down'].map((id) => [id, '<A grid view> has no zoom: it scrolls.'])),
  },
  {
    name: 'the example, its view picked by a click on the ground',
    file: EXAMPLE,
    set: (s, sel) => { sel.front(s.model.views[0].id); sel.set([{ type: 'view', id: s.model.views[0].id }]); },
    rows: { delete: 'Delete takes elements and lines out of the model. To delete <the view X>, use Delete view in Details.' },
  },
  {
    name: 'the browser fixture, its tree (a browser view, which shows every element) in front, nothing picked',
    file: fixture('browser'),
    set: (s, sel) => sel.front('v-tree'),
    rows: { 'show-in-view': '<View Y> shows every element.' },
  },
  {
    name: 'the browser fixture, its tree in front, the part def Host picked',
    file: fixture('browser'),
    set: (s, sel) => { sel.front('v-tree'); sel.set([el('Host')]); },
    rows: { 'remove-from-view': '<View Y> shows every element, so nothing can be taken out of it.' },
  },
  {
    name: 'the interconnection fixture, its general view in front, an element picked that this view does not show',
    file: fixture('interconnection'),
    set: (s, sel) => {
      const view = s.model.views.find((v) => v.id === 'v-defs');
      sel.front(view.id);
      sel.set([el(elementWhere(s, 'element without a place in v-defs', (e) => !view.layout[e.id]).id)]);
    },
    rows: {
      'remove-from-view': '<part def X> is not shown in <view Y>.',
      'edit-label': '<View Y> does not show <part def X>, so its label cannot be edited here.',
      'type-label': '<View Y> does not show <part def X>, so its label cannot be edited here.',
    },
  },
  {
    name: 'the action flow fixture, its view in front, the start node picked (an element with no name in the text)',
    file: fixture('behavior-actions'),
    set: (s, sel) => { sel.front(s.model.views[0].id); sel.set([el(elementWhere(s, 'start node', (e) => e.kind === 'StartNode').id)]); },
    rows: {
      'edit-label': '<A start> has no label to edit.',
      'type-label': '<A start> has no label to edit.',
      'add-note': '<A start> can\'t carry a note. Note the element it belongs to instead.',
      'add-code-link': '<A start> holds no code links.',
    },
  },
  {
    name: 'the example, its view in front, a part def picked that has no code link',
    file: EXAMPLE,
    set: (s, sel) => { sel.front(s.model.views[0].id); sel.set([el(elementWhere(s, 'part def without a code link', (e) => e.kind === 'PartDefinition' && !(e.code && e.code.length)).id)]); },
    rows: { 'remove-code-link': '<Part def X> has no code link.' },
  },
  {
    name: 'the sequence fixture, its general view (not its sequence view) in front, a message picked',
    file: fixture('sequence'),
    set: (s, sel) => {
      sel.front('v-all');
      const message = s.model.relationships.find((r) => r.kind === 'Message');
      assert.ok(message, 'The sequence fixture holds no message: this test\'s place cannot be made.');
      sel.set([{ type: 'rel', id: message.id }]);
    },
    rows: { 'message-up': 'Pick a message in a sequence view first.', 'message-down': 'Pick a message in a sequence view first.' },
  },
];

/** Whether a refusal is a sentence: words, nothing around them, and a full stop at the end. */
const isSentence = (text) => typeof text === 'string' && text === text.trim() && /\S\s\S/.test(text) && text.endsWith('.');

test('every action of the table, asked where it does not apply, says why', { todo: 'The scaffold builds four of the 32 rows; each package builds its own. Package 2-14 takes this mark off at the slice\'s close.' }, async () => {
  const core = await loadCore();
  const { rows, wrong } = planRows(fs.readFileSync(PLAN, 'utf8'));
  const table = core.actions();
  const built = rows.filter((row) => core.actionOf(row.id));
  const unbuilt = rows.filter((row) => !core.actionOf(row.id));
  /** What is wrong with a row that is built, one sentence each. */
  const found = [...wrong];

  // Every row of the action table is one of section 5's, and reads as its line does.
  for (const action of table) if (!rows.some((row) => row.id === action.id)) found.push(`The table holds a row ${action.id}, which section 5 does not: no place is known where it would be refused.`);
  for (const row of built) {
    const action = core.actionOf(row.id);
    if (row.title !== undefined && action.title !== row.title) found.push(`${row.id} is titled "${action.title}"; section 5 titles it "${row.title}".`);
    if (row.key !== undefined && (action.key ?? null) !== row.key) found.push(`${row.id} has the key ${action.key ?? 'none'}; section 5 gives it ${row.key ?? 'none'}.`);
  }

  // Every row that can be refused has a place, whether it is built yet or not; and no place names a row twice over.
  for (const row of rows) {
    const places = PLACES.filter((place) => Object.hasOwn(place.rows, row.id)).length;
    if (row.always && places) found.push(`${row.id} always applies, by section 5, and this test asks it at a place where it should not.`);
    if (!row.always && !places) found.push(`${row.id} can be refused, by section 5, and this test asks it at no place.`);
  }
  for (const place of PLACES) for (const id of Object.keys(place.rows)) if (!rows.some((row) => row.id === id)) found.push(`This test asks ${id}, which section 5 does not name.`);

  /** A session of a place's file, brought to the place. */
  const at = (place) => {
    const s = core.openText(lib, readText(place.file), { name: path.basename(place.file) }, { now: clock() });
    place.set(s, core.selectionOf(s));
    return s;
  };
  const state = (s) => JSON.stringify({
    model: plain(s.model), steps: s.history.steps.length, notes: plain(core.notesOf(s).file()),
    picked: plain(core.selectionOf(s).items), front: core.selectionOf(s).view, unsaved: s.unsaved,
  });

  let asked = 0;
  for (const place of PLACES) {
    // The rows that do not apply here, each asked in a session of its own.
    for (const [id, says] of Object.entries(place.rows)) {
      const action = core.actionOf(id);
      if (!action) continue;
      asked++;
      const where = `${id}, at ${place.name}`;
      const s = at(place);
      const before = state(s);
      const said = core.saysOf(s).said?.n ?? 0;
      const applies = action.applies(s, null);
      if (applies === true) { found.push(`${where}: it applies, where section 5 says it does not. The plan's sentence there: "${says}"`); continue; }
      if (!isSentence(applies)) found.push(`${where}: applies() answers ${JSON.stringify(applies)}, which is no sentence that ends in a full stop. The plan's sentence there: "${says}"`);
      const out = core.ask(s, id);
      if (!out || out.refused !== applies) found.push(`${where}: ask() returns ${JSON.stringify(out)}, not { refused } with the sentence applies() gives, ${JSON.stringify(applies)}.`);
      const now = core.saysOf(s).said;
      if (!now || now.text !== applies || !(now.n > said)) found.push(`${where}: the refusal was not said: saysOf(session).said is ${JSON.stringify(now)} after ask().`);
      if (state(s) !== before) found.push(`${where}: the refused action changed the model, the history, the notes or what is picked.`);
    }
    // The five that always apply, here as everywhere.
    const s = at(place);
    for (const id of ALWAYS) {
      const action = core.actionOf(id);
      if (!action) continue;
      const applies = action.applies(s, null);
      if (applies !== true) found.push(`${id}, at ${place.name}: it always applies, by section 5, and here it answers ${JSON.stringify(applies)}.`);
    }
  }

  if (!found.length && !unbuilt.length) return;
  const said = [];
  said.push(`${unbuilt.length} of the ${rows.length} actions of plan/slice-2.md, section 5, ${unbuilt.length === 1 ? 'is' : 'are'} not in the table yet, and ${found.length} thing${found.length === 1 ? ' is' : 's are'} wrong with the ${built.length} that are`
    + ` (asked ${asked} time${asked === 1 ? '' : 's'} where they do not apply)${found.length || unbuilt.length ? ':' : '.'}`);
  said.push(...found.map((line) => `  ${line}`));
  for (const file of [...new Set(unbuilt.map((row) => row.file))]) {
    const mine = unbuilt.filter((row) => row.file === file);
    said.push(`  core/actions/${file} (package ${mine[0].pack}), not built: ${mine.map((row) => row.id).join(', ')}`);
  }
  assert.fail(said.join('\n'));
});
