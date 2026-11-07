// The panel's fields. Every field goes the one way: its row in FIELDS, by which the panel shows it, and the panel's
// one pair of listeners, which make every change through edit(). So a change to any field through its input is one
// undo step, logged for Claude in that step's words, and saved, and Undo takes it back; and no field's input has
// listeners of its own. The fixtures together hold every kind of element, line and view, so the second test merges
// them into one model and changes, one at a time, every field each kind lists. Then the fields whose rows don't say it
// all: the definition, which is the usage's typing, with the box that draws its line; the core's words; the fields
// whose rows trim; and a view's name, which the eyebrow and the notes on the view follow.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { after, before, describe, test } from 'node:test';
import { clickElement, embeddedModel, finish, launch, modelLibSource, openCanvas, pageSource, relationshipIds, until } from './helpers.mjs';

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
/** Where a field's input and label are, by what is selected: #fields for an element or a line, #view-fields for a view. */
const INPUT = { el: 'f-', rel: 'f-', view: 'v-' };
const LABEL = { el: 'l-', rel: 'l-', view: 'l-v-' };

// As in model-lib.test.mjs: the library the page holds, run in a vm context with a bare window.
function loadLib(source) {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.runInContext(modelLibSource(source), vm.createContext(sandbox), { filename: 'canvas/index.html#model-lib' });
  assert.ok(sandbox.SysMLModel, 'the model-lib script sets window.SysMLModel');
  return sandbox.SysMLModel;
}

/**
 * The fixtures' models in one, kept small, since every change draws it all: a fixture that holds no kind of element,
 * line or view the ones before it don't is left out, and so is a view of a kind an earlier view has. Each fixture's ids
 * get a prefix of their own (a-, b-, …), wherever they are named, as the base model the fixtures share is there once
 * for each. Every usage whose kind has a definition is typed by the first definition of that kind, so the box that
 * draws the typing's line shows for every such kind.
 */
function mergedFixtures(lib) {
  const model = { format: lib.FORMAT, package: { name: 'Fields', doc: '' }, elements: [], relationships: [], views: [] };
  const refs = (row) => row.fields.filter((f) => lib.FIELDS[f] && lib.FIELDS[f].type === 'ref' && lib.FIELDS[f].stored !== false);
  const has = new Set();
  const kindsOf = (m) => [].concat(m.elements.map((e) => e.kind), m.relationships.map((r) => r.kind), m.views.map((v) => 'view ' + v.kind));
  fs.readdirSync(FIXTURES).filter((name) => name.endsWith('.json')).sort().forEach((name, i) => {
    const m = JSON.parse(JSON.stringify(lib.normalize(JSON.parse(fs.readFileSync(path.join(FIXTURES, name), 'utf8')).model)));
    if (kindsOf(m).every((k) => has.has(k))) return;
    const p = String.fromCharCode(97 + i) + '-';
    const ids = new Set(m.elements.map((e) => e.id));
    const id = (x) => (ids.has(x) ? p + x : x);
    for (const e of m.elements) {
      e.id = p + e.id;
      if (e.owner !== undefined) e.owner = p + e.owner;
      for (const f of refs(lib.KINDS[e.kind])) if (e[f]) e[f] = p + e[f];
      model.elements.push(e);
    }
    for (const r of m.relationships) {
      Object.assign(r, { id: p + r.id, from: p + r.from, to: p + r.to });
      for (const f of refs(lib.RELATIONSHIPS[r.kind])) if (r[f]) r[f] = p + r[f];
      model.relationships.push(r);
    }
    for (const v of m.views) {
      if (has.has('view ' + v.kind)) continue;
      v.id = p + v.id;
      v.layout = Object.fromEntries(Object.entries(v.layout).map(([key, place]) => [p + key, place]));
      for (const key of Object.keys(v.options)) if (Array.isArray(v.options[key])) v.options[key] = v.options[key].map(id);
      model.views.push(v);
    }
    kindsOf(m).forEach((k) => has.add(k));
  });
  for (const e of model.elements) {
    const kind = lib.KINDS[e.kind];
    if (!kind.fields.includes('type') || model.relationships.some((r) => r.kind === 'FeatureTyping' && r.from === e.id)) continue;
    const def = model.elements.find((d) => d.kind === kind.definedBy);
    if (def) model.relationships.push({ id: 'typing-' + e.id, kind: 'FeatureTyping', from: e.id, to: def.id, hidden: true });
  }
  // A field that shows only in some kinds of view: the first element of each kind that lists one is shown in a view of
  // such a kind too, when none shows it yet.
  for (const kind of Object.keys(lib.KINDS)) {
    const e = model.elements.find((x) => x.kind === kind);
    for (const f of e ? lib.KINDS[kind].fields : []) {
      const kinds = lib.FIELDS[f] && lib.FIELDS[f].views;
      if (!kinds || model.views.some((v) => kinds.includes(v.kind) && v.layout[e.id])) continue;
      const view = model.views.find((v) => kinds.includes(v.kind) && lib.admits(v.kind, e.kind));
      if (view) view.layout[e.id] = {};
    }
  }
  return model;
}

/** Imports a state file made of `state` through Import state, and waits for the page to say so. */
async function importState(page, state, name = 'fields.json') {
  await page.setInputFiles('#import-file', { name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(state)) });
  await until(page, () => /^Imported /.test(document.querySelector('#status')?.textContent || ''), null, `the page says it imported ${name}`);
}

/**
 * In the page: selects an item ({ type, id }) as picked in a view (or none), and returns, for each field its kind
 * lists, whether the panel has an input for it, whether it is shown, and a select's choices; null when the selection
 * didn't land on the item (a line that isn't drawn selects the element it starts from).
 */
const selectItem = (page, item, viewId) => page.evaluate(([it, vid, input, label]) => {
  const C = window.SysMLCanvas;
  const M = window.SysMLModel;
  C.select({ type: it.type, id: it.id }, vid || undefined);
  const s = C.resolve(C.state.selection);
  if (!s || s.type !== it.type || s.item.id !== it.id) return null;
  const table = it.type === 'el' ? M.KINDS : it.type === 'rel' ? M.RELATIONSHIPS : M.VIEW_KINDS;
  return table[s.item.kind].fields.map((fld) => {
    const field = document.getElementById(input + fld);
    const caption = document.getElementById(label + fld);
    const spec = M.FIELDS[fld];
    return {
      fld,
      spec: spec ? { type: spec.type, trim: !!spec.trim } : null,
      input: !!field,
      shown: !!field && !!caption && !caption.hidden && field.offsetParent !== null,
      options: field && field.tagName === 'SELECT' ? Array.from(field.options).map((o) => o.value) : null
    };
  });
}, [item, viewId, INPUT[item.type], LABEL[item.type]]);

/**
 * In the page: the value of a field of an item, from the model: for the definition, the id of what the usage's typing
 * names (or ''), for the box that draws its line, whether the typing is drawn; for any other field, the item's
 * property. Also the model as JSON, the number of undo steps, the newest step, what was logged since the last call (the
 * log's newest entry is marked, window.__lastLog), whether a save is scheduled, and what the field's input shows. With
 * save, it then makes the scheduled save now, as its timer would, and says whether this browser's store holds the model.
 */
const fieldState = (page, item, fld, save = false) => page.evaluate(([it, f, saveNow, prefix]) => {
  const C = window.SysMLCanvas;
  const S = C.state;
  const M = window.SysMLModel;
  const found = (it.type === 'el' ? S.model.elements : it.type === 'rel' ? S.model.relationships : S.model.views).find((x) => x.id === it.id);
  const typing = it.type === 'el' ? M.typingOf(S.model, found) : null;
  const value = f === 'type' ? (typing ? typing.to : '') : f === 'typeLine' ? !!typing && !typing.hidden : found[f];
  const top = S.history[S.history.length - 1];
  const mark = window.__lastLog;
  const logged = mark ? S.changes.slice(S.changes.indexOf(mark) + 1) : S.changes.slice();
  window.__lastLog = S.changes[S.changes.length - 1];
  const input = document.getElementById(prefix + f);
  const state = {
    value, json: JSON.stringify(S.model), steps: S.history.length, top: top ? { what: top.what, key: top.key } : null,
    logged: logged.map((c) => c.text), saving: S.saveTimer !== null, shows: input.type === 'checkbox' ? input.checked : input.value
  };
  if (saveNow) {
    clearTimeout(S.saveTimer);
    C.persist();
    const key = Object.keys(localStorage).find((k) => k.indexOf('stronghold-canvas:') === 0);
    const stored = key ? JSON.parse(localStorage.getItem(key)) : null;
    state.saved = !!stored && JSON.stringify(stored.model) === state.json;
  }
  return state;
}, [item, fld, save, INPUT[item.type]]);

/**
 * Changes one field of the selected item through its input, as a person does: types two more characters into a text
 * field (a number field gets a new number) and leaves it with Tab, clicks a checkbox, picks another choice in a select.
 * Then checks the change is one undo step, logged in its words, and saved, and that Undo takes it back.
 */
async function changeField(page, item, field) {
  const what = `${item.kind} ${item.id}, field ${field.fld}`;
  const selector = '#' + INPUT[item.type] + field.fld;
  const before = await fieldState(page, item, field.fld);
  before.normal = await page.evaluate((json) => JSON.stringify(window.SysMLModel.normalize(JSON.parse(json))), before.json);
  let expected;
  if (field.spec.type === 'bool') {
    expected = !before.value;
    await page.click(selector);
  } else if (field.spec.type === 'enum' || field.spec.type === 'ref') {
    expected = field.options.find((o) => o !== before.value && o !== '') ?? '';
    assert.notEqual(expected, before.value, `${what}: the select offers another choice`);
    await page.selectOption(selector, expected);
  } else {
    await page.focus(selector);
    if (field.spec.type === 'number') {
      expected = before.value === 42 ? 43 : 42;
      await page.keyboard.press('Control+A');
      await page.keyboard.type(String(expected));
    } else {
      // A field whose row trims gets spaces round what is typed, and holds the value without them.
      const typed = field.spec.trim ? '  xy  ' : 'xy';
      expected = field.spec.trim ? (String(before.value) + typed).trim() : String(before.value) + typed;
      await page.keyboard.press('Control+End');
      await page.keyboard.type(typed);
    }
    await page.keyboard.press('Tab');
  }
  const changed = await fieldState(page, item, field.fld, true);
  assert.deepEqual(changed.value, expected, `${what}: the model holds the new value`);
  assert.equal(changed.steps, before.steps + 1, `${what}: the change is one undo step`);
  assert.equal(changed.top.key, null, `${what}: and the step is closed`);
  assert.deepEqual(changed.logged, [changed.top.what], `${what}: the log has the change once, in the step's words`);
  assert.ok(changed.saving, `${what}: the change schedules the save`);
  assert.ok(changed.saved, `${what}: and the save writes it`);
  // The Undo button, pressed in the page: its own listener runs, without Playwright's checks before a click, which
  // took this test a third of its time.
  await page.evaluate(() => document.getElementById('undo').click());
  const undone = await fieldState(page, item, field.fld);
  assert.equal(undone.value, before.value, `${what}: Undo brings the old value back`);
  assert.equal(undone.json, before.normal, `${what}: and the model as it was`);
  assert.equal(undone.shows, before.shows, `${what}: and the panel shows the old value again`);
}

describe('the panel\'s fields', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('no field\'s input has listeners of its own: the panel listens for all of them', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const cdp = await page.context().newCDPSession(page);
    const listenersOf = async (id) => {
      const { result } = await cdp.send('Runtime.evaluate', { expression: `document.getElementById(${JSON.stringify(id)})` });
      if (!result.objectId) return null;
      const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId });
      return listeners.map((l) => l.type).sort();
    };
    const names = await page.evaluate(() => Object.keys(window.SysMLModel.FIELDS));
    const without = [];
    for (const fld of names) {
      const types = await listenersOf('f-' + fld);
      if (types === null) { without.push(fld); continue; }
      assert.deepEqual(types, [], `#f-${fld} has no listeners of its own`);
    }
    assert.deepEqual(without, ['code'], 'every field but the code links, which their own section edits, has an input in the panel');
    const viewInputs = [];
    for (const fld of names) {
      const types = await listenersOf('v-' + fld);
      if (types === null) continue;
      viewInputs.push(fld);
      assert.deepEqual(types, [], `#v-${fld} has no listeners of its own`);
    }
    assert.deepEqual(viewInputs, ['name', 'doc'], 'a view\'s fields have their inputs too');
    assert.deepEqual(await listenersOf('fields'), ['change', 'input'], '#fields has the one pair of listeners');
    assert.deepEqual(await listenersOf('view-fields'), ['change', 'input'], 'and so has #view-fields');
    await finish(ctx);
  });

  test('every field of every kind of element, line and view: a change through its input is one undo step, logged, saved and undone', async () => {
    const lib = loadLib(pageSource());
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await importState(page, { model: mergedFixtures(lib), notes: [], archive: [] });
    const items = await page.evaluate(() => {
      const S = window.SysMLCanvas.state;
      const where = (id) => S.layout.where.get(id) || [];
      return S.model.elements.map((e) => ({ type: 'el', id: e.id, kind: e.kind, views: where(e.id) }))
        .concat(S.model.relationships.map((r) => ({ type: 'rel', id: r.id, kind: r.kind, views: where(r.id) })))
        .concat(S.model.views.map((v) => ({ type: 'view', id: v.id, kind: v.kind, views: [] })));
    });
    const kinds = new Set(items.map((item) => item.kind));
    for (const kind of Object.keys(lib.KINDS).concat(Object.keys(lib.RELATIONSHIPS), Object.keys(lib.VIEW_KINDS))) {
      assert.ok(kinds.has(kind), `a fixture holds ${kind}, so its fields are tried here`);
    }
    // Each kind's fields, each changed once: the first item of the kind that shows the field, in a view that shows it
    // (some fields show only in some views).
    const listed = new Map();
    const tried = new Map();
    const noInput = new Set();
    for (const item of items) {
      const row = (item.type === 'el' ? lib.KINDS : item.type === 'rel' ? lib.RELATIONSHIPS : lib.VIEW_KINDS)[item.kind];
      if (!listed.has(item.kind)) { listed.set(item.kind, Array.from(row.fields)); tried.set(item.kind, new Set()); }
      const left = () => listed.get(item.kind).filter((f) => !tried.get(item.kind).has(f) && !noInput.has(f));
      for (const viewId of item.views.length ? item.views : [null]) {
        if (!left().length) break;
        const fields = await selectItem(page, item, viewId);
        if (!fields) break;
        for (const field of fields) {
          if (!field.input) { noInput.add(field.fld); continue; }
          if (!field.shown || tried.get(item.kind).has(field.fld)) continue;
          await changeField(page, item, field);
          tried.get(item.kind).add(field.fld);
        }
      }
    }
    assert.deepEqual(Array.from(noInput).sort(), ['code'], 'the one field with no input is the code links, which their own section edits');
    let count = 0;
    for (const [kind, fields] of listed) {
      for (const fld of fields) {
        if (fld === 'code') continue;
        assert.ok(tried.get(kind).has(fld), `${kind}'s ${fld} was changed through the panel`);
        count += 1;
      }
    }
    assert.ok(count >= 90, `every listed field was tried (${count})`);
    await finish(ctx);
  });

  test('the definition is the usage\'s typing: picking another moves the line\'s end and keeps its notes, the box draws or hides the line, nothing undefines', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const model = () => page.evaluate(() => window.SysMLCanvas.state.model);
    const typingOf = async (id) => (await model()).relationships.filter((r) => r.kind === 'FeatureTyping' && r.from === id);
    const step = () => page.evaluate(() => { const h = window.SysMLCanvas.state.history; return h.length ? h[h.length - 1].what : null; });
    const lastLog = () => page.evaluate(() => { const c = window.SysMLCanvas.state.changes; return c.length ? c[c.length - 1].text : null; });

    // A note on the typing line, which stays on it while its end moves.
    await page.evaluate(() => window.SysMLCanvas.select({ type: 'rel', id: 't-hosts' }));
    await page.click('#add-note');
    await until(page, () => window.SysMLCanvas.state.notes.length === 1, null, 'a note on the line');
    const noteLabel = () => page.evaluate(() => window.SysMLCanvas.state.notes[0].targetLabel);
    assert.equal(await page.evaluate(() => window.SysMLCanvas.state.notes[0].target), 't-hosts');
    assert.equal(await noteLabel(), 'hosts defined by Host');

    await clickElement(page, 'Page.hosts');
    assert.equal(await page.inputValue('#f-type'), 'Host', 'Defined by shows the part\'s definition');
    assert.equal(await page.locator('#f-type option').first().textContent(), 'nothing yet', 'with nothing yet first');
    assert.ok(await page.locator('#f-typeLine').isChecked(), 'and the box is ticked, since its line is drawn');
    assert.ok((await relationshipIds(page)).includes('t-hosts'), 'the line is drawn');

    await page.selectOption('#f-type', 'ServerHost');
    assert.deepEqual((await typingOf('Page.hosts')).map((r) => [r.id, r.to]), [['t-hosts', 'ServerHost']], 'the same typing, its end moved');
    assert.equal(await step(), 'Defined part hosts in Page by ServerHost', 'one undo step, in its words');
    assert.equal(await lastLog(), 'Defined part hosts in Page by ServerHost', 'logged in the same words');
    assert.equal(await page.evaluate(() => window.SysMLCanvas.state.notes[0].target), 't-hosts', 'the note stays on the line');
    assert.equal(await noteLabel(), 'hosts defined by ServerHost', 'and its label follows the new end');
    // The save the change schedules, when it comes, writes the moved end.
    await until(page, () => Object.keys(localStorage).some((k) => k.indexOf('stronghold-canvas:') === 0 &&
      JSON.parse(localStorage.getItem(k)).model.relationships.some((r) => r.id === 't-hosts' && r.to === 'ServerHost')), null, 'the change is saved');

    await page.click('#f-typeLine');
    assert.equal((await typingOf('Page.hosts'))[0].hidden, true, 'unticking the box hides the line');
    assert.ok(!(await relationshipIds(page)).includes('t-hosts'), 'which is no longer drawn');
    assert.equal(await step(), 'Hid the line hosts defined by ServerHost');
    await page.click('#f-typeLine');
    assert.equal((await typingOf('Page.hosts'))[0].hidden, undefined, 'ticking it draws the line again');
    assert.equal(await step(), 'Drew the line hosts defined by ServerHost');

    await page.selectOption('#f-type', '');
    assert.deepEqual(await typingOf('Page.hosts'), [], 'nothing takes the typing away');
    assert.equal(await step(), 'Undefined part hosts in Page');
    assert.ok(await page.locator('#l-typeLine').isHidden(), 'and the box goes with it');

    await page.selectOption('#f-type', 'Host');
    const fresh = await typingOf('Page.hosts');
    assert.equal(fresh.length, 1, 'a definition picked for an undefined part is a new typing');
    assert.equal(fresh[0].to, 'Host');
    assert.equal(fresh[0].hidden, true, 'shown as text, its line not drawn');
    assert.ok(!(await page.locator('#f-typeLine').isChecked()), 'so the box is there, unticked');
    assert.match(await page.textContent('#status'), /It shows as text; tick the box to draw the line too\./);

    for (let i = 0; i < 5; i++) await page.click('#undo');
    assert.deepEqual((await typingOf('Page.hosts')).map((r) => [r.id, r.to, r.hidden]), [['t-hosts', 'Host', undefined]], 'five Undos bring the first typing back');
    assert.equal(await noteLabel(), 'hosts defined by Host', 'and the note\'s label with it');
    await finish(ctx);
  });

  test('the core\'s fields say what a change did in their own words, for the Undo button and the log', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const said = async () => page.evaluate(() => {
      const S = window.SysMLCanvas.state;
      return [S.history[S.history.length - 1].what, S.changes[S.changes.length - 1].text];
    });
    const select = (type, id) => page.evaluate(([t, i]) => window.SysMLCanvas.select({ type: t, id: i }), [type, id]);
    const typeInto = async (selector, text) => { await page.focus(selector); await page.keyboard.press('Control+End'); await page.keyboard.type(text); await page.keyboard.press('Tab'); };
    const cases = [
      [() => select('el', 'Page.hosts'), () => typeInto('#f-name', 'x'), 'Renamed to part hostsx in Page'],
      [() => select('el', 'Page'), () => page.click('#f-abstract'), 'Made abstract: part def Page'],
      [() => select('el', 'Page'), () => page.click('#f-abstract'), 'Made concrete: part def Page'],
      [() => select('el', 'Page.hosts.api'), () => page.click('#f-conjugated'), 'Unconjugated port api in hostsx'],
      [() => select('el', 'Page.hosts.api'), () => page.click('#f-conjugated'), 'Conjugated port api in hostsx'],
      [() => select('el', 'Page'), () => typeInto('#f-doc', ' More.'), 'Wrote the doc of part def Page'],
      [() => select('el', 'Page.app'), () => typeInto('#f-multiplicity', '..2'), 'Set the multiplicity of part app in Page to 1..2'],
      [() => select('rel', 'mount'), () => typeInto('#f-name', 'x'), 'Named the connection mountx, api to api'],
      [() => select('rel', 'mount'), () => typeInto('#f-doc', 'A doc.'), 'Wrote the doc of the connection mountx, api to api'],
    ];
    for (const [pick, change, words] of cases) {
      await pick();
      await change();
      assert.deepEqual(await said(), [words, words], `the step and the log say: ${words}`);
    }
    await finish(ctx);
  });

  test('a view\'s name: the eyebrow follows it as it is typed, the notes on the view once it is left, in one undo step', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    // A note on the view, as Claude leaves one: the page adds notes to elements and lines, the store and files bring
    // notes on views too.
    const note = { id: 'n-view', no: 1, target: 'v-proof', targetLabel: 'view proofStructure', text: 'Why these hosts?', by: 'claude' };
    await importState(page, { model: embeddedModel(), notes: [note], archive: [] }, 'with-a-view-note.json');
    await page.evaluate(() => window.SysMLCanvas.select({ type: 'view', id: 'v-proof' }));
    const noteLabel = () => page.evaluate(() => window.SysMLCanvas.state.notes[0].targetLabel);
    assert.equal(await noteLabel(), 'view proofStructure');
    await page.focus('#v-name');
    await page.keyboard.press('Control+End');
    await page.keyboard.type('Xy');
    assert.match(await page.textContent('.eyebrow'), / · proofStructureXy$/, 'the eyebrow follows each keystroke');
    assert.equal(await noteLabel(), 'view proofStructure', 'the note keeps its label while the name is typed');
    await page.keyboard.press('Tab');
    assert.equal(await noteLabel(), 'view proofStructureXy', 'and takes the new name once the field is left');
    const steps = await page.evaluate(() => window.SysMLCanvas.state.history.map((h) => h.what));
    assert.equal(steps[steps.length - 1], 'Renamed the view to proofStructureXy', 'one step, in its words');
    await page.focus('#v-doc');
    await page.keyboard.type('Why.');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => window.SysMLCanvas.state.history.slice(-1)[0].what), 'Wrote the doc of view proofStructureXy');
    await finish(ctx);
  });

  test('a field whose row trims holds the value trimmed as it is typed, as the file read again would hold it', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await clickElement(page, 'Page.hosts');
    await page.fill('#f-multiplicity', '');
    await page.focus('#f-multiplicity');
    await page.keyboard.type('  0..1  ');
    assert.equal(await page.evaluate(() => window.SysMLCanvas.state.model.elements.find((e) => e.id === 'Page.hosts').multiplicity), '0..1');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => window.SysMLCanvas.state.history.slice(-1)[0].what), 'Set the multiplicity of part hosts in Page to 0..1');
    await finish(ctx);
  });
});
