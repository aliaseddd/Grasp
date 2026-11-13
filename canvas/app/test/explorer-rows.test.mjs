// The Explorer's rows: canvas/app/src/panels/explorerRows.ts, the contract in the comments of RowWords, RowItem and
// ExplorerRows, and section 3 of plan/swarm/step-9.md. They run in Node: the rows have no React in them. The model
// library runs in another realm: compare ITS objects as JSON.

import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, test } from 'node:test';
import { scaleState } from '../../test/scale-model.mjs';
import { EXAMPLE, FIXTURES, ROOT, clock, lib, loadWith, plain, readText } from './core.mjs';

const BLANK = path.join(ROOT, 'canvas', 'state.json');
const OPTIONS = { options: { roots: null, collapsed: [] } };

/** A session from a file's text, with a library of its own when given. */
async function session(text = readText(EXAMPLE), name = 'example.json', library = lib) {
  const m = await loadWith('panels/explorerRows');
  return m.openText(library, text, { name }, { now: clock() });
}
const fixture = (name) => readText(path.join(FIXTURES, name));
const scale = (n) => JSON.stringify(scaleState(n));

const el = (s, id) => s.model.elements.find((e) => e.id === id);
const rename = (s, id, name) => s.history.edit(() => { el(s, id).name = name; return 'Renamed to ' + name; });
/** The tree flattened into [depth, id] pairs, in order. */
function flatten(items, depth = 0, out = []) {
  for (const item of items) {
    out.push([depth, item.id]);
    flatten(item.children, depth + 1, out);
  }
  return out;
}
const textOf = (rows, id) => {
  const w = rows.wordsOf(id);
  return w === null ? null : w.kw + w.name + w.type;
};
/** Counts the calls of a listener. */
function counter(rows) {
  const calls = { n: 0 };
  const stop = rows.listen(() => { calls.n++; });
  return { calls, stop };
}
const sorted = (list) => [...list].sort();

const EXAMPLE_ROWS = [
  [0, 'package:', '«package» StrongholdProof'],
  [1, 'view:v-proof', '«general view» proofStructure'],
  [1, 'el:Page', '«part def» Page'],
  [2, 'el:Page.hosts', '«part» hosts : Host [1..*]'],
  [3, 'el:Page.hosts.api', '«port» api : ~StrongholdApp'],
  [2, 'el:Page.app', '«part» app : App [1]'],
  [3, 'el:Page.app.api', '«port» api : StrongholdApp'],
  [2, 'rel:mount', '«connection» mount, api to api'],
  [1, 'el:Host', '«part def» Host'],
  [2, 'el:Host.api', '«port» api : ~StrongholdApp'],
  [1, 'el:App', '«part def» App'],
  [2, 'el:App.api', '«port» api : StrongholdApp'],
  [1, 'el:StrongholdApp', '«port def» StrongholdApp'],
  [1, 'el:ServerHost', '«part def» ServerHost'],
  [1, 'el:OnlineHost', '«part def» OnlineHost'],
  [1, 'el:DevHost', '«part def» DevHost'],
  [1, 'rel:t-hosts', '«defined by» hosts defined by Host'],
  [1, 'rel:t-app', '«defined by» app defined by App'],
  [1, 'rel:t-hosts-api', '«defined by» api defined by StrongholdApp'],
  [1, 'rel:t-app-api', '«defined by» api defined by StrongholdApp'],
  [1, 'rel:t-Host-api', '«defined by» api defined by StrongholdApp'],
  [1, 'rel:t-App-api', '«defined by» api defined by StrongholdApp'],
  [1, 'rel:s-ServerHost', '«specializes» ServerHost specializes Host'],
  [1, 'rel:s-OnlineHost', '«specializes» OnlineHost specializes Host'],
  [1, 'rel:s-DevHost', '«specializes» DevHost specializes Host'],
];

describe("the Explorer's rows", () => {
  test("a row's id names its type and what it is a row of", async () => {
    const { rowId, rowOf, pickedOf, PACKAGE_ROW } = await loadWith('panels/explorerRows');
    assert.equal(rowId('el', 'Page.hosts'), 'el:Page.hosts', "rowId('el', 'Page.hosts') must be 'el:Page.hosts'.");
    assert.equal(rowId('package'), 'package:', "rowId('package') must be 'package:'.");
    assert.equal(PACKAGE_ROW, 'package:', "PACKAGE_ROW must be 'package:'.");
    assert.equal(rowId('more', 'el:Release'), 'more:el:Release', "rowId('more', 'el:Release') must be 'more:el:Release'.");
    assert.deepEqual(plain(rowOf('el:Page.hosts')), { type: 'el', id: 'Page.hosts' }, 'rowOf must read an element row back.');
    assert.deepEqual(plain(rowOf('package:')), { type: 'package', id: '' }, "rowOf('package:') must read the package's row back with an empty id.");
    assert.deepEqual(plain(rowOf('more:el:Release')), { type: 'more', id: 'el:Release' }, 'rowOf must read a "Show more" row back.');
    assert.deepEqual(plain(rowOf('el:a:b')), { type: 'el', id: 'a:b' }, 'rowOf must split at the first colon: the id may hold colons.');
    assert.equal(rowOf('nonsense'), null, "rowOf('nonsense') must be null: it has no colon.");
    assert.equal(rowOf('thing:1'), null, "rowOf('thing:1') must be null: 'thing' is no row type.");
    for (const type of ['el', 'rel', 'view']) {
      assert.deepEqual(plain(pickedOf(`${type}:Host`)), { type, id: 'Host' }, `pickedOf('${type}:Host') must pick a ${type}.`);
    }
    assert.equal(pickedOf('package:'), null, "pickedOf('package:') must be null.");
    assert.equal(pickedOf('more:package:'), null, "pickedOf('more:package:') must be null.");
  });

  test("the example's tree: the package, its view, then the library's rows", async () => {
    const { explorerRowsOf } = await loadWith('panels/explorerRows');
    const rows = explorerRowsOf(await session());
    assert.equal(rows.items.length, 1, "rows.items must be one item, the package's.");
    assert.deepEqual(flatten(rows.items), EXAMPLE_ROWS.map(([depth, id]) => [depth, id]), "The example's rows must be the 25 of the step's file, with their depths.");
    assert.equal(rows.built, 1, 'rows.built must be 1 once explorerRowsOf has returned.');
  });

  test("what the example's rows say", async () => {
    const { explorerRowsOf } = await loadWith('panels/explorerRows');
    const rows = explorerRowsOf(await session());
    for (const [, id, text] of EXAMPLE_ROWS) assert.equal(textOf(rows, id), text, `The row ${id} must say ${text}.`);
    assert.deepEqual(plain(rows.wordsOf('el:Page.hosts')), { kw: '«part» ', name: 'hosts', type: ' : Host [1..*]' }, "The words of el:Page.hosts must be kw '«part» ', name 'hosts', type ' : Host [1..*]'.");
    assert.equal(rows.wordsOf('el:Page.hosts.api').type, ' : ~StrongholdApp', 'A conjugated port must say its type with a ~.');
    assert.deepEqual(plain(rows.wordsOf('package:')), { kw: '«package» ', name: 'StrongholdProof', type: '' }, "The package's words must be '«package» ', 'StrongholdProof', ''.");
    const labels = new Map();
    const walk = (items) => items.forEach((item) => { labels.set(item.id, item.label); walk(item.children); });
    walk(rows.items);
    for (const [id, label] of [['package:', 'StrongholdProof'], ['view:v-proof', 'proofStructure'], ['el:Page', 'Page'], ['el:Page.hosts', 'hosts'], ['rel:mount', 'connection']]) {
      assert.equal(labels.get(id), label, `The item ${id} must have the label ${label}.`);
    }
  });

  test("what the fixtures' rows say", async () => {
    const { explorerRowsOf } = await loadWith('panels/explorerRows');
    const pins = {
      'behavior-actions.json': [
        ['el:Release.start', 'start'],
        ['el:Release.split', '«fork» split'],
        ['rel:s-start', '«succession» start in Release to compile'],
        ['el:maintainer', '«part» maintainer [1]'],
      ],
      'behavior-states.json': [
        ['el:HostLifecycle.initial', 'initial node'],
        ['rel:t-mount', '«transition» mount, idle to loading'],
      ],
      'sequence.json': [
        ['el:Login.client.loginSent', '«event occurrence» loginSent'],
        ['rel:m-login', '«message» login, loginSent to server'],
      ],
      'interconnection.json': [
        ['el:Tank.stored', '«item» stored : Fuel [0..*]'],
        ['el:FuelLine.b', '«port» b : ~FuelPort'],
        ['rel:fuelLine', '«interface» fuelLine, fuelOut to fuelIn'],
      ],
    };
    for (const [file, list] of Object.entries(pins)) {
      const rows = explorerRowsOf(await session(fixture(file), file));
      for (const [id, text] of list) assert.equal(textOf(rows, id), text, `${file}: the row ${id} must say ${text}.`);
    }
    const blank = explorerRowsOf(await session(readText(BLANK), 'state.json'));
    assert.deepEqual(flatten(blank.items), [[0, 'package:'], [1, 'view:v-1']], "The blank model's rows must be the package's and the view's.");
    assert.equal(textOf(blank, 'package:'), '«package» Package1', "The blank model's package row must say '«package» Package1'.");
    assert.equal(textOf(blank, 'view:v-1'), '«general view» view1', "The blank model's view row must say '«general view» view1'.");
  });

  test('a model of no more than 500 elements starts wholly unfolded, a larger one with only the package\'s row', async () => {
    const { explorerRowsOf, PACKAGE_ROW } = await loadWith('panels/explorerRows');
    const s = await session(scale(500), 'scale.json');
    const rows = explorerRowsOf(s);
    const library = lib.browserRows(s.model, OPTIONS);
    const expected = [PACKAGE_ROW];
    library.forEach((row, i) => {
      const next = library[i + 1];
      if (row.type === 'el' && next && next.depth > row.depth) expected.push('el:' + row.id);
    });
    assert.ok(expected.length > 1, 'The 500-element model must have rows with rows inside them.');
    assert.deepEqual(sorted(rows.unfolded), sorted(expected), 'A model of 500 elements must start with every row that has rows inside it unfolded.');
    const big = explorerRowsOf(await session(scale(501), 'scale.json'));
    assert.deepEqual([...big.unfolded], ['package:'], 'A model of 501 elements must start with only the package\'s row unfolded.');
    const example = explorerRowsOf(await session());
    assert.deepEqual(sorted(example.unfolded), sorted(['package:', 'el:Page', 'el:Page.hosts', 'el:Page.app', 'el:Host', 'el:App']), "The example must start with its six rows that have rows inside them unfolded.");
  });

  test('a long list shows its first 200 rows and ends in Show more, which shows 200 more', async () => {
    const { explorerRowsOf } = await loadWith('panels/explorerRows');
    const rows = explorerRowsOf(await session(scale(5000), 'scale.json'));
    const { calls } = counter(rows);
    const pkg = () => rows.items[0];
    assert.equal(pkg().children.length, 201, "The package's item must have 201 children: 200 rows and Show more.");
    assert.deepEqual(plain(pkg().children.slice(0, 3).map((c) => c.id.split(':')[0])), ['view', 'view', 'view'], 'The first three rows inside the package must be the views.');
    assert.equal(pkg().children[200].id, 'more:package:', "The last row inside the package must be 'more:package:'.");
    assert.equal(textOf(rows, 'more:package:'), 'Show more (3651 not shown)', 'The Show more row must say how many rows are not shown.');
    assert.equal(rows.items[0].children[200].label, 'Show more', "The Show more item's label must be 'Show more'.");
    const first = rows.items;
    rows.showMore('package:');
    assert.equal(pkg().children.length, 401, 'showMore must show 200 more rows: 400 and Show more.');
    assert.equal(textOf(rows, 'more:package:'), 'Show more (3451 not shown)', 'The Show more row must say 3451 not shown after one showMore.');
    assert.notEqual(rows.items, first, 'showMore must give a new items array.');
    assert.equal(calls.n, 1, 'showMore must tell the listeners once.');
    assert.equal(rows.built, 1, 'showMore must not build the rows again.');
    for (let i = 0; i < 18; i++) rows.showMore('package:');
    assert.equal(pkg().children.length, 3851, 'After 19 showMore calls all 3851 rows inside the package must be shown.');
    assert.ok(!pkg().children.some((c) => c.id === 'more:package:'), 'The Show more row must go when all rows are shown.');
    assert.equal(rows.wordsOf('more:package:'), null, 'wordsOf of a Show more row that is gone must be null.');
    const told = calls.n;
    rows.showMore('package:');
    rows.showMore('el:Nobody');
    assert.equal(calls.n, told, 'showMore with nothing more to show, or of no row, must tell nobody.');
  });

  test("folding is the rows' own: it is kept, and it tells once", async () => {
    const { explorerRowsOf } = await loadWith('panels/explorerRows');
    const rows = explorerRowsOf(await session());
    const { calls } = counter(rows);
    const before = rows.unfolded;
    const less = before.filter((id) => id !== 'el:Page');
    rows.setUnfolded(less);
    assert.ok(!rows.unfolded.includes('el:Page'), 'el:Page must no longer be unfolded.');
    assert.notEqual(rows.unfolded, before, 'unfolded must be a new array after a change.');
    assert.notEqual(rows.wordsOf('el:Page'), null, 'A folded row is itself shown: wordsOf must give its words.');
    assert.equal(rows.wordsOf('el:Page.hosts'), null, 'A row inside a folded row is not shown: wordsOf must be null.');
    assert.equal(calls.n, 1, 'setUnfolded must tell the listeners once.');
    const kept = rows.unfolded;
    rows.setUnfolded(less);
    assert.equal(calls.n, 1, 'setUnfolded with what is already unfolded must tell nobody.');
    assert.equal(rows.unfolded, kept, 'unfolded must be the very array when nothing changed.');
    rows.setUnfolded([...less, 'el:Nobody', 'el:DevHost']);
    assert.ok(!rows.unfolded.includes('el:Nobody') && !rows.unfolded.includes('el:DevHost'), 'An id that names no row, and a row with nothing inside it, must be left out of unfolded.');
    assert.equal(calls.n, 1, 'setUnfolded that changes nothing must tell nobody.');
  });

  test('a rename works out the words of the shown rows again, and only the rows whose words differ are new', async () => {
    const { explorerRowsOf } = await loadWith('panels/explorerRows');
    const s = await session();
    const rows = explorerRowsOf(s);
    const { calls } = counter(rows);
    const ids = EXAMPLE_ROWS.map(([, id]) => id);
    const snapshot = () => new Map(ids.map((id) => [id, rows.wordsOf(id)]));
    const changed = (was) => ids.filter((id) => rows.wordsOf(id) !== was.get(id));
    const items = rows.items;

    let was = snapshot();
    rename(s, 'Host', 'Machine');
    assert.equal(calls.n, 1, 'A rename must tell the listeners once.');
    assert.equal(rows.built, 1, 'A rename must not build the rows again.');
    assert.equal(rows.items, items, 'A rename must leave rows.items the very array.');
    assert.deepEqual(sorted(changed(was)), sorted(['el:Host', 'el:Page.hosts', 'rel:t-hosts', 'rel:s-ServerHost', 'rel:s-OnlineHost', 'rel:s-DevHost']), 'Only the six rows that say Host must have new words.');
    assert.equal(textOf(rows, 'el:Host'), '«part def» Machine');
    assert.equal(textOf(rows, 'el:Page.hosts'), '«part» hosts : Machine [1..*]');
    assert.equal(textOf(rows, 'rel:t-hosts'), '«defined by» hosts defined by Machine');
    assert.equal(textOf(rows, 'rel:s-DevHost'), '«specializes» DevHost specializes Machine');

    was = snapshot();
    s.history.edit(() => { s.model.package.name = 'Proof'; return 'Renamed the package'; });
    assert.deepEqual(changed(was), ['package:'], "A change of the package's name must give new words to the package's row alone.");
    assert.equal(textOf(rows, 'package:'), '«package» Proof');
    assert.equal(calls.n, 2, "A change of the package's name must tell the listeners once.");

    was = snapshot();
    s.history.edit(() => { s.model.views[0].name = 'renamedView'; return 'Renamed the view'; });
    assert.deepEqual(changed(was), ['view:v-proof'], "A change of the view's name must give new words to its row alone.");
    assert.equal(calls.n, 3, "A change of the view's name must tell the listeners once.");

    was = snapshot();
    s.history.edit(() => { el(s, 'Host').doc = 'A host.'; return 'Documented Host'; });
    assert.deepEqual(changed(was), [], "A change of a doc must give no row new words.");
    assert.equal(calls.n, 3, 'A change that alters no words must tell nobody.');
    assert.equal(rows.built, 1, 'None of these must build the rows again.');
    assert.equal(rows.items, items, 'None of these must change rows.items.');
  });

  test('a row inside a folded row gets its words when it comes to be shown, as the model then says them', async () => {
    const { explorerRowsOf } = await loadWith('panels/explorerRows');
    const s = await session();
    const rows = explorerRowsOf(s);
    const all = rows.unfolded;
    rows.setUnfolded(all.filter((id) => id !== 'el:Page'));
    rename(s, 'Page.hosts', 'machines');
    assert.equal(rows.wordsOf('el:Page.hosts'), null, 'A row inside a folded row must have no words.');
    assert.equal(textOf(rows, 'rel:t-hosts'), '«defined by» machines defined by Host', 'A shown relationship row must say the new name.');
    rows.setUnfolded(all);
    assert.equal(textOf(rows, 'el:Page.hosts'), '«part» machines : Host [1..*]', 'A row that comes to be shown must say the model as it is then.');
  });

  test('a move, a resize and the end of a run cost nothing', async () => {
    const { explorerRowsOf } = await loadWith('panels/explorerRows');
    const reads = { browserRows: 0, reading: 0 };
    const counted = new Proxy(lib, {
      get(target, key) {
        if (key === 'browserRows') reads.browserRows++;
        if (key === 'reading') reads.reading++;
        return target[key];
      },
    });
    const s = await session(readText(EXAMPLE), 'example.json', counted);
    const rows = explorerRowsOf(s);
    const { calls } = counter(rows);
    const ids = EXAMPLE_ROWS.map(([, id]) => id);
    const words = () => ids.map((id) => rows.wordsOf(id));
    const sameWords = (a, b) => a.every((w, i) => w === b[i]);
    const view = () => s.model.views.find((v) => v.id === 'v-proof');
    const kept = words();
    const noted = { ...reads };

    s.history.edit(() => { view().layout.Host.x += 10; return 'Moved Host'; });
    s.history.edit(() => { view().layout.Host.w += 10; return 'Resized Host'; });
    assert.deepEqual({ ...reads }, noted, 'A move and a resize must read the library no more.');
    assert.equal(calls.n, 0, 'A move and a resize must tell nobody.');
    assert.ok(sameWords(words(), kept), 'A move and a resize must leave every words object as it was.');

    s.history.edit(() => { el(s, 'Host').name = 'Machine'; return 'Renamed Host'; }, 'name:Host');
    assert.equal(reads.reading, noted.reading + 1, 'A rename must read the library inside one reading().');
    assert.equal(reads.browserRows, noted.browserRows, 'A rename must not ask for the rows of the library.');
    assert.equal(calls.n, 1, 'A rename must tell the listeners once.');
    const afterRename = { ...reads };
    const wordsAfter = words();

    s.history.endEdit();
    assert.deepEqual({ ...reads }, afterRename, 'The end of a run must read the library no more.');
    assert.equal(calls.n, 1, 'The end of a run must tell nobody.');
    assert.ok(sameWords(words(), wordsAfter), 'The end of a run must leave every words object as it was.');
  });

  test('a change of the structure builds the rows again, and keeps what was folded and how much is shown', async () => {
    const { explorerRowsOf } = await loadWith('panels/explorerRows');
    const s = await session();
    const rows = explorerRowsOf(s);
    const { calls } = counter(rows);
    rows.setUnfolded(rows.unfolded.filter((id) => id !== 'el:Host'));
    const told = calls.n;
    const items = rows.items;
    s.history.edit(() => { s.model.elements.push({ id: 'NewDef', kind: 'PartDefinition', name: 'NewDef', doc: '' }); return 'Added NewDef'; });
    assert.equal(rows.built, 2, 'A new element must build the rows again.');
    assert.equal(calls.n, told + 1, 'A build must tell the listeners once.');
    assert.notEqual(rows.items, items, 'A build must give a new items array.');
    assert.ok(flatten(rows.items).some(([depth, id]) => depth === 1 && id === 'el:NewDef'), 'el:NewDef must be a row at depth 1.');
    assert.equal(textOf(rows, 'el:NewDef'), '«part def» NewDef');
    assert.ok(!rows.unfolded.includes('el:Host'), 'el:Host must still be folded.');
    assert.ok(rows.unfolded.includes('el:Page'), 'el:Page must still be unfolded.');

    s.history.edit(() => { s.model.elements.push({ id: 'DevHost.p', kind: 'PartUsage', name: 'p', doc: '', owner: 'DevHost' }); return 'Added a part to DevHost'; });
    assert.ok(rows.unfolded.includes('el:DevHost'), 'A row that newly has rows inside it must start unfolded in a small model.');
    s.history.undo();
    s.history.undo();
    assert.equal(rows.built, 5, 'Each of the four changes (two edits, two undos) must have built the rows again: 1 + 4.');
    const ids = flatten(rows.items).map(([, id]) => id);
    assert.ok(!ids.includes('el:NewDef') && !ids.includes('el:DevHost.p'), 'Both rows must be gone after the two undos.');

    const big = await session(scale(5000), 'scale.json');
    const bigRows = explorerRowsOf(big);
    bigRows.showMore('package:');
    big.history.edit(() => { big.model.elements.push({ id: 'ExtraDef', kind: 'PartDefinition', name: 'ExtraDef', doc: '' }); return 'Added ExtraDef'; });
    assert.equal(bigRows.items[0].children.length, 401, 'How much a row shows must be kept through a build.');
    assert.deepEqual([...bigRows.unfolded], ['package:'], 'In a large model only the package\'s row must stay unfolded.');
    const owners = new Set(big.model.elements.map((e) => e.owner));
    const bare = big.model.elements.find((e) => !owners.has(e.id));
    big.history.edit(() => { big.model.elements.push({ id: bare.id + '.p', kind: 'PartUsage', name: 'p', doc: '', owner: bare.id }); return 'Added a part'; });
    assert.ok(!bigRows.unfolded.includes('el:' + bare.id), 'A row that newly has rows inside it must start folded in a large model.');
  });

  test('the rows are a session\'s, and their methods can be handed over', async () => {
    const { explorerRowsOf } = await loadWith('panels/explorerRows');
    const s = await session();
    const rows = explorerRowsOf(s);
    assert.equal(explorerRowsOf(s), rows, 'explorerRowsOf of one session must give one object.');
    assert.notEqual(explorerRowsOf(await session()), rows, "Another session's rows must be another object.");
    const { wordsOf, setUnfolded, showMore, listen } = rows;
    assert.equal(wordsOf('el:Host').name, 'Host', 'wordsOf must work handed over bare.');
    const calls = { n: 0 };
    const stop = listen(() => { calls.n++; });
    setUnfolded(rows.unfolded.filter((id) => id !== 'el:Page'));
    assert.equal(calls.n, 1, 'setUnfolded must work handed over bare.');
    assert.doesNotThrow(() => showMore('package:'), 'showMore must work handed over bare.');
    stop();
    setUnfolded(rows.unfolded.concat('el:Page'));
    assert.equal(calls.n, 1, 'What listen returns must stop the listener.');
  });

  test("the 5,000-element model's rows are built in under 300 ms, and 100 renames reword them in under 200", async (t) => {
    const { explorerRowsOf } = await loadWith('panels/explorerRows');
    const s = await session(scale(5000), 'scale.json');
    const start = performance.now();
    const rows = explorerRowsOf(s);
    const built = performance.now() - start;
    t.diagnostic(`explorerRowsOf on 5000 elements: ${built.toFixed(1)} ms`);
    assert.ok(built < 300, `Building the rows of the 5,000-element model took ${built.toFixed(1)} ms; it must take under 300.`);
    assert.ok(rows.built === 1);
    const first = s.model.elements[0];
    const begin = performance.now();
    for (let i = 0; i < 100; i++) s.history.edit(() => { first.name += 'x'; return 'Renamed'; });
    const renamed = performance.now() - begin;
    t.diagnostic(`100 renames on 5000 elements: ${renamed.toFixed(1)} ms`);
    assert.ok(renamed < 200, `100 renames took ${renamed.toFixed(1)} ms; they must take under 200.`);
  });
});
