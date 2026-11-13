// Details, the panel of the new page (step 10): every field that every kind of element, line and view lists, changed
// through its widget in the page, is one undo step, undone and redone; a rename shows on the box, the tab and the row
// as it is typed; picking another definition moves the end of the usage's typing. Written in step 10, before what it
// checks (plan/swarm/step-10.md, section 3 is what the page must render and section 4 the list of these tests).
//
// A test opens the page through openIn, finds what the application renders by the names of section 3 and reads
// nothing of the application's own objects: the library and the files are read here, in Node, only to choose what to
// pick and to look up what the saved file holds.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, afterEach, before, describe, test } from 'node:test';
import {
  BROWSER_FRAMES, byTestId, closePages, DETAILS, EDGE, EXAMPLE, FIXTURES, fieldIn, finish, groundPoint, launch, lib, modelOf,
  nodeOf, nothingPicked, openIn, pickBox, pickRow, planeOf, redo, rowIn, rowOf, rowOfField, showTab, soon, stateFileAt, stateFileOf,
  tabTitle, TEN, TESTIDS, undo, untilDrawn, untilShown, viewTab, wordsOf,
} from './helpers.mjs';

/**
 * The fixtures' models in one, kept small, since every change draws it all: a fixture that holds no kind of element,
 * line or view the ones before it don't is left out, and so is a view of a kind an earlier view has. Each fixture's ids
 * get a prefix of their own (a-, b-, …), wherever they are named, as the base model the fixtures share is there once
 * for each. Every usage whose kind has a definition is typed by the first definition of that kind, so the box that
 * draws the typing's line shows for every such kind. The first element of each kind that lists Specializes or Subsets,
 * and starts no specialization line, specializes another of its kind that the line's rule allows (in the same box, for
 * a usage; made beside it when there is none), so those fields, which show while there is such a line, show for every
 * such kind.
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
  for (const kind of Object.keys(lib.KINDS)) {
    const e = model.elements.find((x) => x.kind === kind);
    const lists = lib.KINDS[kind].fields.includes('specializes') || lib.KINDS[kind].fields.includes('subsets');
    if (!e || !lists || model.relationships.some((r) => r.kind === 'Specialization' && r.from === e.id)) continue;
    const allowed = (x) => x.kind === kind && x.id !== e.id && (!lib.KINDS[kind].usage || x.owner === e.owner) &&
      !model.relationships.some((r) => r.kind === 'Specialization' && r.from === x.id && r.to === e.id);
    let general = model.elements.find(allowed);
    if (!general) {
      general = Object.assign(JSON.parse(JSON.stringify(e)), { id: e.id + '-general', name: (e.name || kind) + 'General' });
      model.elements.push(general);
    }
    model.relationships.push({ id: 'general-' + e.id, kind: 'Specialization', from: e.id, to: general.id });
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

const VIEW = modelOf(EXAMPLE).views[0];
const FIELDS_FILE = () => stateFileOf('fields.json', { model: mergedFixtures(lib), notes: [], archive: [] });
/** The model the page holds for the merged fixtures: 124 elements, 117 relationships, 10 views. */
const MERGED = JSON.parse(JSON.stringify(lib.normalize(mergedFixtures(lib))));

// What the page shows, read as a person sees it.

/** The text of the first element a selector finds, or null. */
const textAt = (page, selector) => page.evaluate((s) => document.querySelector(s)?.textContent ?? null, selector);
/** How many elements a selector finds. */
const countAt = (page, selector) => page.evaluate((s) => document.querySelectorAll(s).length, selector);
/** Waits until `read()` gives `wanted`, and fails with `missing`, a sentence, and what it gave. */
const untilIs = (page, read, wanted, missing) => soon(page, async () => (await read()) === wanted,
  async () => `${missing}: it is ${JSON.stringify(await read())}, not ${JSON.stringify(wanted)}.`);
/** What a widget of Details holds, by its row's type, or undefined when the form has no widget for the field. */
const readField = (page, field, type) => page.evaluate(([root, f, t]) => {
  const el = document.querySelector(`${root} [data-testid="field-${f}"]`);
  if (!el) return undefined;
  if (t === 'enum') return el.querySelector('input:checked')?.value ?? '';
  if (t === 'bool') return el.checked;
  if (t === 'ref') return el.getAttribute('data-value');
  return el.value;
}, [DETAILS, field, type]);
/** The label a field's widget is known by, in the page's words. */
const labelOf = (field) => lib.FIELDS[field].label;
/** The aria-label of a line's edge on a plane, or null when it is not drawn. */
const edgeOf = (page, viewId, id) => page.evaluate((s) => document.querySelector(s)?.getAttribute('aria-label') ?? null,
  `${planeOf(viewId)} ${EDGE}[data-id=${JSON.stringify(id)}]`);
/** The name line of a box on a plane. */
const boxName = (page, viewId, id) => textAt(page, `${nodeOf(viewId, id)} .grasp-node-name`).then((text) => text?.trim() ?? null);
/** The options of the list that is open, as { id, label }, or null when no list is open. */
const optionsOpen = (page) => page.evaluate(() => {
  const list = document.querySelector('[role="listbox"]');
  return list ? [...list.querySelectorAll('[role="option"]')].map((o) => ({ id: o.getAttribute('data-option'), label: o.textContent.trim() })) : null;
});
/** Whether a field's widget has the focus. */
const focused = (page, field) => page.evaluate(([root, f]) => {
  const el = document.querySelector(`${root} [data-testid="field-${f}"]`);
  return !!el && (el === document.activeElement || el.contains(document.activeElement));
}, [DETAILS, field]);
/** Whether a view's tab, by its title, is the tab shown. */
const tabShown = (page, title) => page.getByRole('tab', { name: title, exact: true }).getAttribute('aria-selected');

/** Opens a picker's list by a click and waits for it. Returns the options. */
async function openList(page, field, what) {
  await fieldIn(page, field).click();
  return soon(page, () => optionsOpen(page), `A click on the ${labelOf(field)} picker of ${what} opens no list ([role="listbox"]).`);
}
/** Picks a choice of a picker by its id: opens the list, clicks the option. */
async function pickOption(page, field, id, what) {
  const options = await openList(page, field, what);
  assert.ok(options.some((o) => o.id === id), `The ${labelOf(field)} list of ${what} offers no option "${id}": it offers ${options.map((o) => JSON.stringify(o.id)).join(', ')}.`);
  await page.locator(`[role="listbox"] [role="option"][data-option=${JSON.stringify(id)}]`).click();
}

/** Clicks the bar's Save and returns the saved file's model, as the page's download holds it. */
async function savedModel(page) {
  let download = null;
  page.waitForEvent('download', { timeout: 5000 }).then((got) => { download = got; }, () => {});
  await page.locator(byTestId(TESTIDS.save)).click();
  await soon(page, async () => download, 'Save downloaded no file (the page has no file picker).', BROWSER_FRAMES);
  return JSON.parse(fs.readFileSync(await download.path(), 'utf8')).model;
}

// The walk: every field a kind lists, changed once through its widget.

/**
 * Changes one field of what Details shows through its widget, and checks the change is one step with words of its own,
 * undone and redone. Returns what to look up in the saved file.
 */
async function changeOnce(page, type, id, field) {
  const spec = lib.FIELDS[field];
  const what = `${type} ${id}, field ${field} (${spec.label})`;
  const gone = (value) => ((field === 'specializes' || field === 'subsets') && value === '' ? undefined : value);
  const reads = () => readField(page, field, spec.type);
  const untilShows = (wanted, then) => untilIs(page, reads, wanted, `Details shows the wrong ${spec.label} for ${id}, ${then}`);

  const before = await reads();
  assert.notEqual(before, undefined, `Details shows no ${spec.label} widget for ${id}.`);
  const undoBefore = await wordsOf(page, 'undo');
  let expected;
  if (spec.type === 'bool') {
    expected = !before;
    await fieldIn(page, field).click();
  } else if (spec.type === 'enum') {
    const values = await page.evaluate(([root, f]) => [...document.querySelectorAll(`${root} [data-testid="field-${f}"] input[type="radio"]`)].map((r) => r.value), [DETAILS, field]);
    expected = values.find((v) => v !== before && v !== '') ?? '';
    assert.ok(values.length && expected !== before, `${spec.label} of ${id} offers no other choice: ${JSON.stringify(values)}.`);
    await page.locator(`${DETAILS} [data-testid="field-${field}"] input[value=${JSON.stringify(expected)}]`).click();
  } else if (spec.type === 'ref') {
    const options = await openList(page, field, id);
    const ids = options.map((o) => o.id);
    expected = ids.find((o) => o !== before && o !== '') ?? (before !== '' ? '' : null);
    assert.notEqual(expected, null, `${spec.label} of ${id} offers no other choice: ${JSON.stringify(ids)}.`);
    await page.locator(`[role="listbox"] [role="option"][data-option=${JSON.stringify(expected)}]`).click();
  } else if (spec.type === 'number') {
    expected = before === '42' ? '43' : '42';
    await fieldIn(page, field).click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type(expected);
    await page.keyboard.press('Tab');
  } else {
    const typed = spec.trim ? '  xy  ' : 'xy';
    expected = spec.trim ? (before + typed).trim() : before + typed;
    await fieldIn(page, field).click();
    await page.keyboard.press('Control+End');
    await page.keyboard.type(typed);
    await page.keyboard.press('Tab');
  }
  await untilShows(gone(expected), 'changed through its widget');
  const words = await soon(page, async () => { const w = await wordsOf(page, 'undo'); return w !== null && w !== undoBefore ? w : null; },
    async () => `The change of the ${spec.label} of ${id} is no step with words of its own: Undo says ${JSON.stringify(await wordsOf(page, 'undo'))}, as before the change.`);
  assert.equal(typeof words, 'string');

  await undo(page);
  await untilShows(before, 'after Undo');
  await untilIs(page, () => wordsOf(page, 'undo'), undoBefore, `Undo of the ${spec.label} of ${id} took more or less than the one step: Undo's words`);
  await untilIs(page, () => wordsOf(page, 'redo'), words, `Redo's words after Undo of the ${spec.label} of ${id}`);
  await redo(page);
  await untilShows(gone(expected), 'after Redo');
  await untilIs(page, () => wordsOf(page, 'undo'), words, `Undo's words after Redo of the ${spec.label} of ${id}`);
  await untilIs(page, () => wordsOf(page, 'redo'), null, `Redo's words after Redo of the ${spec.label} of ${id}`);
  return { type, id, field, expected, spec };
}

/**
 * Changes every field the kinds list once, on the first item of each kind that shows it unlocked (in a view that shows
 * it, where the field shows only in some views), picking each by its row of the Explorer. Returns the changes.
 */
async function walk(page, type, kinds) {
  const table = type === 'el' ? lib.KINDS : type === 'rel' ? lib.RELATIONSHIPS : lib.VIEW_KINDS;
  const items = type === 'el' ? MERGED.elements : type === 'rel' ? MERGED.relationships : MERGED.views;
  const kept = [];
  for (const kind of kinds) {
    const left = Array.from(table[kind].fields).filter((f) => f !== 'code' && f !== 'order'); // a plain array: the library's realm is not the test's
    for (const item of items.filter((x) => x.kind === kind)) {
      if (!left.length) break;
      const advanced = lib.detailsOf(MERGED, type, item).advanced;
      const shownIn = new Set(left.flatMap((f) => lib.FIELDS[f].views ?? []));
      const fronts = [null, ...MERGED.views.filter((v) => shownIn.has(v.kind) && v.layout[item.id])];
      for (const front of fronts) {
        if (!left.length) break;
        if (front) {
          const tab = await viewTab(page, front);
          await tab.click();
          await untilIs(page, () => tabShown(page, tabTitle(front)), 'true', `A click on the tab of ${front.name} does not bring it forward (aria-selected)`);
        }
        await pickRow(page, type, item.id);
        for (const field of [...left]) {
          await showTab(page, advanced.some((r) => r.field === field) ? 'Advanced' : 'Core');
          const row = await rowOfField(page, field);
          if (!row || row.locked) continue;
          kept.push(await changeOnce(page, type, item.id, field));
          left.splice(left.indexOf(field), 1);
        }
      }
    }
    assert.deepEqual(left, [], `${kind}'s ${left.join(', ')} was not changed through its widget: no ${table[kind].label} of the merged fixtures shows it unlocked.`);
  }
  return kept;
}

/** Saves the file once and looks each change up in it: what the widgets showed is what the model holds. */
async function holdsEach(page, kept) {
  const saved = await savedModel(page);
  for (const { type, id, field, expected, spec } of kept) {
    const list = type === 'el' ? saved.elements : type === 'rel' ? saved.relationships : saved.views;
    const item = list.find((x) => x.id === id);
    const what = `The saved file's ${type} ${id}, field ${field}`;
    assert.ok(item, `${what}: the file holds no such ${type}.`);
    if (field === 'type') {
      const typing = lib.typingOf(saved, item);
      assert.equal(typing ? typing.to : '', expected, `${what}: its typing ends at ${typing ? typing.to : 'nothing'}, and the widget showed "${expected}".`);
    } else if (field === 'typeLine') {
      const typing = lib.typingOf(saved, item);
      assert.equal(!!typing && !typing.hidden, expected, `${what}: its typing line is ${typing && !typing.hidden ? 'drawn' : 'hidden'}, and the widget showed ${expected}.`);
    } else if (field === 'specializes' || field === 'subsets') {
      const general = lib.firstGeneral(saved, item);
      assert.equal(general ? general.to : '', expected, `${what}: its line ends at ${general ? general.to : 'nothing'}, and the widget showed "${expected}".`);
    } else {
      const stored = item[field] ?? (spec.type === 'bool' ? false : '');
      const wanted = spec.type === 'number' ? Number(expected) : expected;
      assert.strictEqual(stored, wanted, `${what} holds ${JSON.stringify(item[field])}, and the widget showed ${JSON.stringify(expected)}.`);
    }
  }
}

/** Opens the merged fixtures, and checks Details says nothing is picked. */
async function openMerged(browser) {
  const opened = await openIn(browser, FIELDS_FILE());
  await nothingPicked(opened.page);
  return opened;
}

/** Picks an item by its row and returns what the panel's titles and fields say of it, on each tab. */
async function noFields(page, type, id, title) {
  await pickRow(page, type, id);
  await untilIs(page, () => textAt(page, `${DETAILS} .grasp-details-title`), title, `Details's title for ${id}`);
  for (const tab of ['Core', 'Advanced']) {
    await showTab(page, tab);
    assert.equal(await countAt(page, `${DETAILS} .grasp-field`), 0, `Details shows a field for ${id} on its ${tab} tab; it lists none.`);
  }
}

let browser;
before(async () => { browser = await launch(); });
afterEach(() => closePages(browser));
after(async () => { await browser?.close(); });

describe('every field that every kind, line and view lists in the example and the fixtures, changed through its widget, is one undo step, undone and redone', () => {
  test('the definitions: part def, port def, item def, interface def, action def, state def', async () => {
    const opened = await openMerged(browser);
    const kept = await walk(opened.page, 'el', ['PartDefinition', 'PortDefinition', 'ItemDefinition', 'InterfaceDefinition', 'ActionDefinition', 'StateDefinition']);
    await holdsEach(opened.page, kept);
    await finish(opened);
  });

  test('the usages of structure: part, port, item, parameter', async () => {
    const opened = await openMerged(browser);
    const kept = await walk(opened.page, 'el', ['PartUsage', 'PortUsage', 'ItemUsage', 'ParameterUsage']);
    await holdsEach(opened.page, kept);
    await finish(opened);
  });

  test('the usages of behaviour: action, fork, join, decision, merge, state, event; a start, a done and an initial node have no field', async () => {
    const opened = await openMerged(browser);
    const { page } = opened;
    const kept = await walk(page, 'el', ['ActionUsage', 'ForkNode', 'JoinNode', 'DecisionNode', 'MergeNode', 'StateUsage', 'EventOccurrenceUsage']);
    for (const id of ['b-Release.start', 'b-Release.done', 'c-HostLifecycle.initial']) {
      assert.ok(MERGED.elements.some((e) => e.id === id), `The merged fixtures hold no element ${id}.`);
      await noFields(page, 'el', id, 'Action Properties');
    }
    await holdsEach(page, kept);
    await finish(opened);
  });

  test('the lines: connection, interface, flow, binding, succession, transition, message; a specialization and a defined-by line have no field', async () => {
    const opened = await openMerged(browser);
    const { page } = opened;
    const kept = await walk(page, 'rel', ['ConnectionUsage', 'InterfaceUsage', 'FlowConnectionUsage', 'BindingConnectorAsUsage', 'SuccessionAsUsage', 'TransitionUsage', 'Message']);
    await pickRow(page, 'rel', 'i-m-login');
    await showTab(page, lib.detailsOf(MERGED, 'rel', MERGED.relationships.find((r) => r.id === 'i-m-login')).advanced.some((r) => r.field === 'order') ? 'Advanced' : 'Core');
    const row = await rowOfField(page, 'order');
    assert.ok(row, 'Details shows no Order row for the message i-m-login.');
    assert.equal(row.locked, true, 'The Order row of i-m-login is not locked (class "locked").');
    assert.equal(row.why, "The order can't be changed here yet. The old page changes it until slice 2.", `The Order row of i-m-login says ${JSON.stringify(row.why)}.`);
    assert.equal(await fieldIn(page, 'order').isDisabled(), true, 'The Order field of i-m-login is not disabled.');
    assert.equal(await fieldIn(page, 'order').inputValue(), '1', 'The Order field of i-m-login does not show 1.');
    await noFields(page, 'rel', 'a-s-ServerHost', 'Specialization Properties');
    await noFields(page, 'rel', 'a-t-hosts', 'Feature Typing Properties');
    await holdsEach(page, kept);
    await finish(opened);
  });

  test('the views: one of each of the eight kinds', async () => {
    const opened = await openMerged(browser);
    const kept = await walk(opened.page, 'view', Object.keys(lib.VIEW_KINDS));
    await holdsEach(opened.page, kept);
    await finish(opened);
  });
});

describe('a rename shows on the box, the tab and the row as it is typed', () => {
  test("an element's name, on its box and its row", async () => {
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    const { page } = opened;
    await nothingPicked(page);
    await viewTab(page, VIEW);
    await untilDrawn(page, VIEW);
    await pickBox(page, VIEW, 'Host');
    const name = fieldIn(page, 'name');
    /** Waits until the field, the box, the row, what Details says and the undo step all read `now`. */
    const untilAll = (now, { inField }) => soon(page, async () => (await readAll(now, inField)).problem === null,
      async () => `After the name of Host was typed to ${now}: ${(await readAll(now, inField)).problem}`);
    const readAll = async (now, inField) => {
      const got = await page.evaluate(([root, node, row, field]) => {
        const q = (s) => document.querySelector(s);
        return {
          field: q(field)?.value ?? null, box: q(`${node} .grasp-node-name`)?.textContent.trim() ?? null, row: q(row)?.textContent ?? null,
          what: q(`${root} .grasp-details-what`)?.textContent ?? null, qualified: q(`${root} [data-detail="qualifiedName"] .grasp-detail-value`)?.textContent ?? null,
          focus: document.activeElement === q(field),
        };
      }, [DETAILS, nodeOf(VIEW.id, 'Host'), rowOf('el', 'Host'), `${DETAILS} input[data-testid="field-name"]`]);
      const words = await wordsOf(page, 'undo');
      const bad = [];
      if (got.field !== now) bad.push(`the field holds ${JSON.stringify(got.field)}`);
      if (got.box !== now) bad.push(`the box reads ${JSON.stringify(got.box)}`);
      if (!(got.row ?? '').split(/\s+/).includes(now)) bad.push(`the Explorer's row reads ${JSON.stringify(got.row)}`);
      if (got.what !== `part def ${now}`) bad.push(`Details says ${JSON.stringify(got.what)}`);
      if (got.qualified !== `StrongholdProof::${now}`) bad.push(`Qualified Name reads ${JSON.stringify(got.qualified)}`);
      if (inField && !got.focus) bad.push('the field lost the focus');
      if (inField ? words !== `Renamed to part def ${now}` : words !== (now === 'Host' ? null : `Renamed to part def ${now}`)) bad.push(`Undo's words are ${JSON.stringify(words)}`);
      return { problem: bad.length ? bad.join('; ') + '.' : null };
    };
    await name.click();
    await page.keyboard.press('End');
    let typed = 'Host';
    for (const key of ['X', 'y']) {
      await page.keyboard.type(key);
      typed += key;
      await untilAll(typed, { inField: true });
    }
    await page.keyboard.press('Tab');
    await undo(page);
    await untilAll('Host', { inField: false });
    await redo(page);
    await untilAll('HostXy', { inField: false });
    await finish(opened);
  });

  test("a view's name, on its tab and its row", async () => {
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    const { page } = opened;
    await nothingPicked(page);
    await viewTab(page, VIEW);
    await untilDrawn(page, VIEW);
    const ground = await groundPoint(page, VIEW);
    await page.mouse.click(ground.x, ground.y);
    await untilShown(page, 'view', VIEW.id, 'picked by a click on its ground');
    const titled = (name) => tabTitle({ name, kind: VIEW.kind });
    const untilNamed = (name) => soon(page, async () => (await page.getByRole('tab', { name: titled(name), exact: true }).count()) === 1
      && (await rowIn(page, 'view', VIEW.id).textContent()).split(/\s+/).includes(name),
    async () => `After the view's name was typed to ${name}, no single tab is titled "${titled(name)}", or its row of the Explorer does not read it (${JSON.stringify(await rowIn(page, 'view', VIEW.id).textContent())}).`);
    await fieldIn(page, 'name').click();
    await page.keyboard.press('End');
    let typed = VIEW.name;
    for (const key of ['X', 'y']) {
      await page.keyboard.type(key);
      typed += key;
      await untilNamed(typed);
    }
    await page.keyboard.press('Tab');
    await untilIs(page, () => wordsOf(page, 'undo'), `Renamed the view to ${VIEW.name}Xy`, "Undo's words after the view was renamed");
    await undo(page);
    await untilNamed(VIEW.name);
    await redo(page);
    await untilNamed(`${VIEW.name}Xy`);
    await finish(opened);
  });

  test("picking another definition moves the typing's end", async () => {
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    const { page } = opened;
    await nothingPicked(page);
    await viewTab(page, VIEW);
    await untilDrawn(page, VIEW);
    await pickBox(page, VIEW, 'Page.hosts');
    const typedBy = () => fieldIn(page, 'type').getAttribute('data-value');
    const label = () => fieldIn(page, 'type').inputValue();
    const edge = () => edgeOf(page, VIEW.id, 't-hosts');
    const box = () => boxName(page, VIEW.id, 'Page.hosts');
    const ticked = () => page.evaluate((root) => document.querySelector(`${root} input[type="checkbox"][data-testid="field-typeLine"]`)?.checked ?? null, DETAILS);
    const words = () => wordsOf(page, 'undo');
    const boxHolds = (text) => soon(page, async () => ((await box()) ?? '').includes(text), async () => `The box of Page.hosts reads ${JSON.stringify(await box())}, not ${text}.`);
    const boxLacks = (text) => soon(page, async () => !((await box()) ?? text).includes(text), async () => `The box of Page.hosts still reads ${JSON.stringify(await box())}.`);

    await untilIs(page, typedBy, 'Host', 'Typed by of Page.hosts (data-value)');
    await untilIs(page, label, 'Host', 'Typed by of Page.hosts (its label)');
    await untilIs(page, ticked, true, '"draw the defined-by line" of Page.hosts');
    await untilIs(page, edge, 'Edge from Page.hosts to Host', 'The edge t-hosts');
    const options = await openList(page, 'type', 'Page.hosts');
    assert.deepEqual(options[0], { id: '', label: 'nothing yet' }, `The first choice of the list is ${JSON.stringify(options[0])}, not the empty one, "nothing yet".`);
    assert.deepEqual(options.slice(1).map((o) => o.label), ['Page', 'Host', 'App', 'ServerHost', 'OnlineHost', 'DevHost'],
      `The list offers ${options.slice(1).map((o) => o.label).join(', ')}, not Page, Host, App, ServerHost, OnlineHost, DevHost.`);
    await page.locator('[role="listbox"] [role="option"][data-option="ServerHost"]').click();
    await untilIs(page, typedBy, 'ServerHost', 'Typed by of Page.hosts after ServerHost was picked (data-value)');
    await untilIs(page, edge, 'Edge from Page.hosts to ServerHost', 'The edge t-hosts after ServerHost was picked (the same line, its end moved)');
    await boxHolds('hosts : ServerHost');
    await untilIs(page, words, 'Defined part hosts in Page by ServerHost', "Undo's words after ServerHost was picked");

    await fieldIn(page, 'typeLine').click();
    await untilIs(page, edge, null, 'The edge t-hosts after the line was unticked (it should not be drawn)');
    await untilIs(page, words, 'Hid the line hosts defined by ServerHost', "Undo's words after the line was unticked");
    await fieldIn(page, 'typeLine').click();
    await untilIs(page, edge, 'Edge from Page.hosts to ServerHost', 'The edge t-hosts after the line was ticked again');
    await untilIs(page, words, 'Drew the line hosts defined by ServerHost', "Undo's words after the line was ticked again");

    await pickOption(page, 'type', '', 'Page.hosts');
    await untilIs(page, label, 'nothing yet', 'Typed by after the empty choice was picked (its label)');
    await untilIs(page, typedBy, '', 'Typed by after the empty choice was picked (data-value)');
    await soon(page, async () => (await rowOfField(page, 'typeLine')) === null, 'Details still shows the typeLine row after the empty choice was picked.');
    await boxLacks('ServerHost');
    await untilIs(page, words, 'Undefined part hosts in Page', "Undo's words after the empty choice was picked");

    await pickOption(page, 'type', 'Host', 'Page.hosts');
    await untilIs(page, typedBy, 'Host', 'Typed by after Host was picked again (data-value)');
    await untilIs(page, ticked, false, '"draw the defined-by line" after Host was picked again (a new typing is not drawn)');
    await soon(page, async () => (await page.evaluate((s) => [...document.querySelectorAll(s)].every((e) => e.getAttribute('aria-label') !== 'Edge from Page.hosts to Host'), `${planeOf(VIEW.id)} ${EDGE}`)),
      'The plane draws an edge from Page.hosts to Host, though the new typing is hidden.');
    await boxHolds('hosts : Host');
    await untilIs(page, words, 'Defined part hosts in Page by Host', "Undo's words after Host was picked again");

    const saved = await savedModel(page);
    const typings = saved.relationships.filter((r) => r.kind === 'FeatureTyping' && r.from === 'Page.hosts');
    assert.equal(typings.length, 1, `The saved file holds ${typings.length} typings of Page.hosts, not one.`);
    assert.equal(typings[0].to, 'Host', `The saved typing of Page.hosts ends at ${typings[0].to}, not Host.`);
    assert.equal(typings[0].hidden, true, 'The saved typing of Page.hosts is not hidden.');
    assert.notEqual(typings[0].id, 't-hosts', 'The saved typing of Page.hosts is the old line t-hosts, not a new one.');

    for (let i = 0; i < 5; i++) await undo(page);
    await untilIs(page, edge, 'Edge from Page.hosts to Host', 'The edge t-hosts after five Undos');
    await untilIs(page, ticked, true, '"draw the defined-by line" after five Undos');
    await untilIs(page, words, null, 'Undo after five Undos: its words');
    await finish(opened);
  });
});

test('the example and the nine fixtures: Details shows an element, a line, a line that is not drawn and a view of each', async () => {
  for (const file of TEN) {
    const opened = await openIn(browser, stateFileAt(file));
    const { page } = opened;
    const name = path.basename(file);
    await nothingPicked(page);
    const m = modelOf(file);
    const picks = [['el', m.elements[0]], ['rel', m.relationships[0]], ['rel', m.relationships.find((r) => r.hidden)], ['view', m.views[0]]].filter(([, item]) => item);
    for (const [type, item] of picks) {
      const where = `${name}, ${type} ${item.id}`;
      await pickRow(page, type, item.id);
      const details = lib.detailsOf(m, type, item);
      const said = type === 'el' ? lib.describe(m, item) : type === 'rel' ? lib.describeRel(m, item) : lib.describeView(m, item);
      await untilIs(page, () => textAt(page, `${DETAILS} .grasp-details-title`), details.title, `Details's title (${where})`);
      await untilIs(page, () => textAt(page, `${DETAILS} .grasp-details-what`), said, `What Details says it shows (${where})`);
      for (const [tab, rows] of [['Core', details.core], ['Advanced', details.advanced]]) {
        await showTab(page, tab);
        const names = await page.evaluate((root) => [...document.querySelectorAll(`${root} .grasp-details-page .grasp-detail`)].map((el) => el.getAttribute('data-detail')), DETAILS);
        assert.deepEqual(names, Array.from(rows.filter((r) => !r.field), (r) => r.name), `The rows that are not fields on the ${tab} tab (${where}).`);
      }
    }
    await finish(opened);
  }
});
