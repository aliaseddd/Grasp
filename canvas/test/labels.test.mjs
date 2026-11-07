// Label editing, as SysON's direct edit: the library's reading of a label's text (readLabel), the text an editor starts
// from (labelText), and what a text changes (applyLabel), in Node on the Stronghold example and the fixtures; then the
// page's box over a label: F2, a typed key and the panel's button open it, Enter or leaving it makes one undo step,
// logged and saved, Escape puts it away; the zoom keys type while something editable is selected; a browser view's row
// is renamed as typed; a line's label, a transition's (not edited), and a page that can't be changed.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { EXAMPLE, checked, emptyPointIn, exportText, finish, launch, modelLibSource, openCanvas, until, zoomLevel } from './helpers.mjs';

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const SAVED = 'v-proof';   // the example's general view

// As in model-lib.test.mjs: the library run in a vm context with a bare window; its values belong to the context's
// realm, so the checks compare strings and JSON, never deepEqual.
function loadLib() {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.runInContext(modelLibSource(), vm.createContext(sandbox), { filename: 'canvas/index.html#model-lib' });
  return sandbox.SysMLModel;
}
const M = loadLib();
const json = (v) => JSON.parse(JSON.stringify(v));
const stateOf = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const modelOf = (file) => M.normalize(json(stateOf(file).model));
// The page's makers, as plain objects: a new element with its kind's fields blank, a new line, each with an id of its
// own, as the page's newId gives.
let made = 0;
function maker() {
  const next = () => ++made;
  return {
    element(kind, name) {
      const e = { id: 'new' + next(), kind, name, doc: '' };
      M.KINDS[kind].fields.forEach((f) => {
        const s = M.FIELDS[f];
        if (!s || s.stored === false || e[f] !== undefined) return;
        e[f] = s.type === 'bool' ? false : s.type === 'enum' ? s.values[0] : '';
      });
      return e;
    },
    line(kind, from, to) { return { id: 'rnew' + next(), kind, from, to }; },
  };
}
// Applies text to the element or line id of a model; returns { model, item, res } as plain JSON.
function edit(model, id, text) {
  const item = model.elements.find((e) => e.id === id) || model.relationships.find((r) => r.id === id);
  const type = model.elements.indexOf(item) >= 0 ? 'el' : 'rel';
  const res = M.applyLabel(model, { type, item }, text, maker());
  return { model, item, res: json(res), text: M.labelText(model, { type, item }) };
}
const read = (text) => json(M.readLabel(text));
const typing = (model, id) => json(model.relationships.filter((r) => r.kind === 'FeatureTyping' && r.from === id));
const generals = (model, id) => json(model.relationships.filter((r) => r.kind === 'Specialization' && r.from === id).map((r) => r.to));

describe('label editing: reading a label', () => {
  test('a node label: keywords, ref, a short name, a name with spaces, a multiplicity before or after the type', () => {
    assert.deepEqual(read('wheels[4] : Wheel'), { prefixes: [], ref: false, suffixes: [], unread: [], blank: false, name: 'wheels', multiplicity: { text: '4' }, typing: { steps: ['Wheel'], conjugated: false } });
    const after = read('wheels : Wheel [1 .. *]');
    assert.equal(after.name, 'wheels');
    assert.equal(after.multiplicity.text, '1..*', 'the bounds are written the canvas\'s way');
    assert.deepEqual(after.typing.steps, ['Wheel']);
    const keyed = read('abstract variation ref <1.1> front wheel :> wheels');
    assert.deepEqual(keyed.prefixes, ['abstract', 'variation']);
    assert.equal(keyed.ref, true);
    assert.equal(keyed.short, '1.1');
    assert.equal(keyed.name, 'front wheel', 'a name keeps its inner spaces');
    assert.deepEqual(keyed.subsets.steps, ['wheels']);
    assert.equal(read('abstractPart').name, 'abstractPart', 'a keyword with no space after it starts a name');
    assert.equal(read('ref').name, 'ref');
  });

  test('references: qualified, quoted, conjugated; a bare operator takes its part away only when it comes first', () => {
    assert.deepEqual(read('x : Package1::Engine').typing.steps, ['Package1', 'Engine']);
    assert.deepEqual(read('x : \'My: Type\'').typing.steps, ['My: Type'], 'a quoted name may hold what ends a name');
    assert.deepEqual(read('x : My Type').typing.steps, ['My Type'], 'an unquoted reference keeps its inner spaces');
    assert.equal(read('port : ~Api').typing.conjugated, true);
    assert.equal(read(': ~Api').name, undefined, 'a text that starts with its typing leaves the name out');
    assert.deepEqual(read('x :').typing, { remove: true });
    assert.deepEqual(read('x [4] :>').subsets, { remove: true }, 'after the multiplicity, :> is still the first part');
    assert.deepEqual(read('x :>>').redefines, { remove: true });
    assert.deepEqual(read('[]').multiplicity, { text: '' });
    const late = read('x : T :>');
    assert.deepEqual(late.typing.steps, ['T']);
    assert.equal(late.subsets, undefined, 'a bare :> after another part takes nothing away');
    assert.deepEqual(late.unread, [':>']);
  });

  test('what a label doesn\'t set, and what can\'t be read', () => {
    assert.equal(read('x = 5').value, '= 5');
    assert.equal(read('x := 5').value, ':= 5');
    assert.equal(read('x default 5').value, 'default 5');
    assert.equal(read('defaultValue').name, 'defaultValue');
    assert.deepEqual(read('x ordered nonunique').suffixes, ['ordered', 'nonunique']);
    assert.deepEqual(read('x [a]').unread, ['[a]']);
    assert.deepEqual(read('x [4] [5]').unread, ['[5]'], 'one multiplicity is read');
    assert.deepEqual(read('a::b').unread, ['::b']);
    assert.deepEqual(read('x :> y :>> z').unread, [':>> z'], 'one of :> and :>> is read');
    assert.equal(read('   ').blank, true);
  });
});

describe('label editing: the text an editor starts from', () => {
  test('a usage: its name, its multiplicity, its definition (~ when conjugated); a definition: what it specializes', () => {
    const model = modelOf(EXAMPLE);
    const text = (id) => M.labelText(model, { type: 'el', item: model.elements.find((e) => e.id === id) });
    assert.equal(text('Page.hosts'), 'hosts[1..*] : Host');
    assert.equal(text('Page.hosts.api'), 'api : ~StrongholdApp');
    assert.equal(text('Page.app.api'), 'api : StrongholdApp');
    assert.equal(text('ServerHost'), 'ServerHost :> Host');
    assert.equal(text('Host'), 'Host', 'a definition\'s abstract is not in the text, as in SysON');
    const mount = model.relationships.find((r) => r.id === 'mount');
    assert.equal(M.labelText(model, { type: 'rel', item: mount }), 'mount');
  });

  test('an interface\'s definition; a name that would end a reference is quoted, and read back whole', () => {
    const model = modelOf(path.join(FIXTURES, 'interconnection.json'));
    const fuelLine = model.relationships.find((r) => r.id === 'fuelLine');
    assert.equal(M.labelText(model, { type: 'rel', item: fuelLine }), 'fuelLine : FuelLine');
    const host = modelOf(EXAMPLE);
    host.elements.find((e) => e.id === 'Host').name = 'Host: base';
    const server = { type: 'el', item: host.elements.find((e) => e.id === 'ServerHost') };
    assert.equal(M.labelText(host, server), 'ServerHost :> \'Host: base\'');
    assert.equal(json(M.applyLabel(host, server, M.labelText(host, server), maker())).done.length, 0, 'read back, it names the same one');
  });

  test('every label in the example and the fixtures, edited to the text it starts from, stays as it is', () => {
    const files = [EXAMPLE].concat(fs.readdirSync(FIXTURES).filter((f) => f.endsWith('.json')).map((f) => path.join(FIXTURES, f)));
    let count = 0;
    files.forEach((file) => {
      const model = modelOf(file);
      const before = JSON.stringify(model);
      const targets = model.elements.map((item) => ({ type: 'el', item })).concat(model.relationships.map((item) => ({ type: 'rel', item })));
      targets.filter((t) => M.labelEditable(t.type, t.item)).forEach((t) => {
        const res = json(M.applyLabel(model, t, M.labelText(model, t), maker()));
        assert.deepEqual(res, { done: [], created: [], notKept: [], unread: [], refused: [] }, path.basename(file) + ' ' + t.item.id);
        count++;
      });
      assert.equal(JSON.stringify(model), before, path.basename(file) + ' is as it was');
    });
    assert.ok(count > 100, 'many labels were tried: ' + count);
  });
});

describe('label editing: what a text changes', () => {
  test('only what is typed changes: a name keeps the type and the multiplicity; the same text changes nothing', () => {
    const model = modelOf(EXAMPLE);
    const before = JSON.stringify(model);
    const same = edit(model, 'Page.hosts', 'hosts[1..*] : Host');
    assert.deepEqual(same.res.done, []);
    assert.equal(JSON.stringify(model), before, 'the model is as it was');
    const renamed = edit(model, 'Page.hosts', 'servers');
    assert.deepEqual(renamed.res.done, ['renamed it servers']);
    assert.equal(renamed.text, 'servers[1..*] : Host');
    const counted = edit(model, 'Page.hosts', '[2..*]');
    assert.equal(counted.item.multiplicity, '2..*');
    assert.equal(counted.item.name, 'servers', 'a text without a name keeps the name');
    assert.deepEqual(edit(model, 'Page.hosts', 'servers []').res.done, ['took its multiplicity away']);
    assert.deepEqual(edit(model, 'Page.hosts', '  ').res.done, ['took its name away'], 'a blank text takes the name away');
  });

  test('a type: retyped on the same typing line, made when no definition has the name, taken away by a bare colon', () => {
    const model = modelOf(EXAMPLE);
    const line = typing(model, 'Page.hosts')[0].id;
    const app = edit(model, 'Page.hosts', 'hosts : App');
    assert.deepEqual(app.res.done, ['defined it by App']);
    assert.deepEqual(typing(model, 'Page.hosts').map((r) => [r.id, r.to]), [[line, 'App']], 'the same line takes the new end, so its notes stay');
    const wheel = edit(model, 'Page.hosts', 'hosts : Wheel');
    assert.deepEqual(wheel.res.done, ['defined it by Wheel, a new part def']);
    const made = model.elements.find((e) => e.name === 'Wheel');
    assert.equal(made.kind, 'PartDefinition');
    assert.equal(made.owner, undefined, 'a new definition sits at the top of the package');
    assert.ok(model.views.every((v) => !v.layout[made.id]), 'it is shown in no view');
    assert.equal(typing(model, 'Page.hosts')[0].to, made.id);
    const gone = edit(model, 'Page.hosts', 'hosts :');
    assert.deepEqual(gone.res.done, ['took its definition away']);
    assert.equal(typing(model, 'Page.hosts').length, 0);
    const fresh = edit(model, 'Page.app', 'app : Wheel [2]');
    assert.equal(typing(model, 'Page.app')[0].to, made.id, 'a name now known is found, not made again');
    assert.equal(model.elements.filter((e) => e.name === 'Wheel').length, 1);
    assert.equal(fresh.item.multiplicity, '2');
    const untyped = modelOf(EXAMPLE);
    untyped.relationships = untyped.relationships.filter((r) => !(r.kind === 'FeatureTyping' && r.from === 'Page.app'));
    edit(untyped, 'Page.app', 'app : Host');
    assert.equal(typing(untyped, 'Page.app')[0].hidden, true, 'a new typing shows as text, as one picked in the panel');
  });

  test('a port\'s ~; the definition\'s kind; a path that names nothing; a definition\'s own type part is left aside', () => {
    const model = modelOf(EXAMPLE);
    assert.deepEqual(edit(model, 'Page.hosts.api', 'api : StrongholdApp').res.done, ['unconjugated it']);
    assert.deepEqual(edit(model, 'Page.hosts.api', 'api : ~StrongholdApp').res.done, ['conjugated it']);
    const wrong = edit(model, 'Page.hosts.api', 'api : ~App');
    assert.deepEqual(wrong.res.done, []);
    assert.deepEqual(wrong.res.refused, ['port api in hosts can only be defined by a port def.']);
    const nothing = edit(model, 'Page.hosts.api', 'api : ~Nothing');
    assert.deepEqual(nothing.res.refused, ['There is no port def Nothing to conjugate.'], '~ never makes a definition');
    assert.deepEqual(edit(model, 'Page.hosts', 'hosts : Nope::Host').res.refused, ['There is no part def at Nope::Host to define part hosts in Page by.']);
    assert.deepEqual(edit(model, 'Page.hosts', 'hosts : StrongholdProof::App').res.done, ['defined it by App'], 'a path from the package');
    const def = edit(model, 'Host', 'Host : App');
    assert.deepEqual(def.res, { done: [], created: [], notKept: [], unread: [], refused: [] }, 'a definition\'s typing is left aside');
    assert.deepEqual(edit(model, 'Page.app', 'app : ~App').res.refused, ['A part isn\'t conjugated with ~; only a port is.']);
  });

  test(':> on a definition specializes, keeps the canvas\'s rules, and makes the general one; :> on a usage subsets beside it', () => {
    const model = modelOf(EXAMPLE);
    assert.deepEqual(edit(model, 'ServerHost', 'ServerHost :> OnlineHost').res.done, ['made it specialize OnlineHost']);
    assert.deepEqual(generals(model, 'ServerHost'), ['OnlineHost'], 'the first line takes the new end');
    const circle = edit(model, 'Host', 'Host :> ServerHost');
    assert.deepEqual(circle.res.refused, ['Specializing part def ServerHost would go round in a circle: it already specializes part def Host.']);
    const kind = edit(model, 'Host', 'Host :> StrongholdApp');
    assert.deepEqual(kind.res.refused, ['part def Host can only specialize another part def.']);
    const made = edit(model, 'DevHost', 'DevHost :> Local Host');
    assert.deepEqual(made.res.done, ['made it specialize Local Host, a new part def']);
    assert.deepEqual(edit(model, 'DevHost', 'DevHost :>').res.done, ['took its specialization away']);
    assert.deepEqual(generals(model, 'DevHost'), []);
    // Usages: a part subsets a part in the same box; one elsewhere is refused by the rule; a new one is made beside it.
    assert.deepEqual(edit(model, 'Page.hosts', 'hosts :> app').res.done, ['made it subset app']);
    assert.deepEqual(edit(model, 'Host.api', 'api :> api').res.refused, ['port api in Host can\'t be made to subset itself.'], 'a usage never finds itself');
    model.elements.push({ id: 'spare', kind: 'PartUsage', name: 'spare', multiplicity: '', doc: '' });
    const far = edit(model, 'Page.hosts', 'hosts :> spare');
    assert.equal(far.res.done.length, 0);
    assert.deepEqual(far.res.refused, ['part hosts in Page and part spare must sit in the same box for one to specialize the other.']);
    model.elements.push({ id: 'Wheel', kind: 'PartUsage', name: 'Wheel', multiplicity: '', doc: '' });
    assert.deepEqual(edit(model, 'Wheel', 'Wheel : Wheel').res.refused, ['part Wheel can\'t be defined by itself.'], 'no part def is made beside the part with its name');
    model.elements.pop();
    model.elements.pop();
    const beside = edit(model, 'Page.app', 'app :> base');
    assert.deepEqual(beside.res.done, ['made it subset base, a new part']);
    assert.equal(model.elements.find((e) => e.name === 'base').owner, 'Page', 'beside the part that subsets it');
    assert.equal(M.validate(model).filter((p) => /round in a circle|same box|can only/.test(p.message)).length, 0, 'nothing the rules refuse was made');
  });

  test('what the canvas doesn\'t hold yet is not kept; a definition\'s keywords are left aside; its abstract stays', () => {
    const model = modelOf(EXAMPLE);
    const usage = edit(model, 'Page.hosts', 'abstract ref <1.1> hosts :>> base = 5 ordered');
    assert.deepEqual(usage.res.done, []);
    assert.deepEqual(usage.res.notKept, ['abstract', 'ref', '<1.1>', ':>> base', '= 5 ordered']);
    const def = edit(model, 'Host', 'abstract Host [3]');
    assert.deepEqual(def.res.notKept, ['[3]'], 'a definition has no multiplicity here');
    assert.equal(def.item.abstract, true, 'a label never changes a definition\'s abstract');
    assert.equal(edit(model, 'Host', 'Host').item.abstract, true, 'leaving abstract out doesn\'t clear it either');
    assert.deepEqual(edit(model, 'Page.hosts', 'hosts [many]').res.unread, ['[many]']);
    assert.equal(M.labelLeftOut(json({ refused: ['No.'], notKept: ['ref', '<1>'], unread: ['[a]'] })),
      'No. Not kept, as the canvas doesn\'t hold it yet: ref, <1>. Couldn\'t read: [a].');
  });

  test('lines: a name, an interface\'s definition; a flow\'s typing isn\'t kept; a binding ignores :>; a transition isn\'t edited', () => {
    const model = modelOf(path.join(FIXTURES, 'interconnection.json'));
    assert.deepEqual(edit(model, 'sensing', 'sensor link').res.done, ['renamed it sensor link']);
    const iface = edit(model, 'fuelLine', 'fuelLine : CtrlLink');
    assert.deepEqual(iface.res.done, ['defined it by CtrlLink']);
    assert.equal(iface.item.interfaceDef, 'CtrlLink');
    assert.deepEqual(edit(model, 'fuelLine', 'fuelLine : DataLink').res.done, ['defined it by DataLink, a new interface def']);
    assert.deepEqual(edit(model, 'fuelLine', 'fuelLine :').res.done, ['took its interface def away']);
    assert.deepEqual(edit(model, 'fuelLine', 'fuelLine : Fuel').res.refused, ['The interface fuelLine can only be defined by an interface def; item def Fuel isn\'t one.']);
    assert.deepEqual(edit(model, 'command', 'command : Fuel [2]').res.notKept, ['[2]', ': Fuel']);
    const binding = edit(model, 'outletBinding', 'tie :> other :>> more');
    assert.deepEqual(binding.res.done, ['renamed it tie']);
    assert.deepEqual(binding.res.notKept, [], 'a binding\'s label leaves :> and :>> aside, as SysON\'s does');
    const states = modelOf(path.join(FIXTURES, 'behavior-states.json'));
    const before = JSON.stringify(states);
    assert.deepEqual(edit(states, 't-mount', 'renamed').res.done, []);
    assert.equal(JSON.stringify(states), before, 'a transition\'s label is not edited');
    const actions = modelOf(path.join(FIXTURES, 'behavior-actions.json'));
    assert.deepEqual(edit(actions, 's-compiled', 'built :> x').res, { done: ['renamed it built'], created: [], notKept: [':> x'], unread: [], refused: [] });
    assert.deepEqual(edit(actions, 'Release.start', 'go').res.done, [], 'a start node has no name in the text');
  });

  test('the text a model written by label edits exports is valid, and says what the labels said', () => {
    const model = modelOf(EXAMPLE);
    edit(model, 'Page.hosts', 'wheels[4] : Wheel');
    edit(model, 'ServerHost', 'ServerHost :> Machine');
    edit(model, 'Page.hosts.api', 'api : StrongholdApp');
    const text = M.toSysML(M.normalize(json(model)), []);
    assert.match(text, /part wheels : Wheel \[4\]/);
    assert.match(text, /part def Wheel;/);
    assert.match(text, /part def ServerHost :> Machine/);
    assert.match(text, /part def Machine;/);
    assert.match(text, /port api : StrongholdApp;/);
    assert.deepEqual(json(M.validate(M.normalize(json(model))).map((p) => p.message)), [], 'no problems');
  });
});

describe('label editing on the page', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  const select = (page, sel, view) => page.evaluate(([s, v]) => window.SysMLCanvas.select(s, v), [sel, view]);
  const box = (page) => page.locator('.label-editor');
  const steps = (page) => page.evaluate(() => window.SysMLCanvas.state.history.length);
  const lastStep = (page) => page.evaluate(() => { const h = window.SysMLCanvas.state.history; const top = h[h.length - 1]; return { what: top.what, key: top.key }; });
  const logTexts = (page) => page.evaluate(() => window.SysMLCanvas.state.changes.map((c) => c.text));
  const element = (page, id) => page.evaluate((i) => JSON.parse(JSON.stringify(window.SysMLCanvas.state.model.elements.find((e) => e.id === i))), id);
  async function importState(page, file) {
    await page.setInputFiles('#import-file', file);
    await until(page, () => /^Imported /.test(document.querySelector('#status')?.textContent || ''), null, 'the page says it imported the state');
  }

  test('F2 opens a box over the label with its text selected; Enter makes one step, logged and saved; Undo takes it back', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await select(page, { type: 'el', id: 'Page.hosts' }, SAVED);
    await page.keyboard.press('F2');
    await until(page, () => !!document.querySelector('.label-editor'), null, 'the box opens');
    assert.equal(await box(page).inputValue(), 'hosts[1..*] : Host');
    assert.equal(await page.evaluate(() => { const b = document.querySelector('.label-editor'); return b.selectionStart === 0 && b.selectionEnd === b.value.length; }), true, 'all of it is selected');
    // The box sits over the label it edits.
    const label = await page.locator(`.frame[data-view="${SAVED}"] [data-el="Page.hosts"] > text[data-label]`).boundingBox();
    const over = await box(page).boundingBox();
    assert.ok(Math.abs((over.x + over.width / 2) - (label.x + label.width / 2)) < 4 && Math.abs((over.y + over.height / 2) - (label.y + label.height / 2)) < 8, 'the box is centred on the label');
    const stepsBefore = await steps(page);
    const logged = (await logTexts(page)).length;
    await page.keyboard.type('wheels[4] : Wheel');
    await page.keyboard.press('Enter');
    await until(page, () => !document.querySelector('.label-editor'), null, 'Enter closes the box');
    assert.equal(await steps(page), stepsBefore + 1, 'one undo step');
    assert.deepEqual(await lastStep(page), { what: 'Edited the label of part wheels in Page', key: null });
    assert.deepEqual((await logTexts(page)).slice(logged), ['Edited the label of part wheels in Page: renamed it wheels, set its multiplicity to 4, defined it by Wheel, a new part def']);
    assert.ok(await page.evaluate(() => window.SysMLCanvas.state.saveTimer !== null), 'the save is scheduled');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'canvas', 'the keys go back to the drawing');
    assert.match(await page.textContent('#status'), /^Edited the label of part wheels in Page\. Part def Wheel is new, in no view yet; a view's Show list brings it in\.$/);
    await until(page, () => /wheels : Wheel \[4\]/.test(document.querySelector('[data-el="Page.hosts"] > text[data-label]')?.textContent || ''), null, 'the drawing shows the new label');
    assert.equal(await page.inputValue('#f-name'), 'wheels', 'the panel follows');
    assert.match(await exportText(page), /part wheels : Wheel \[4\]/);
    await page.click('#undo');
    await until(page, () => window.SysMLCanvas.state.model.elements.find((e) => e.id === 'Page.hosts').name === 'hosts', null, 'Undo brings the name back');
    const hosts = await element(page, 'Page.hosts');
    assert.equal(hosts.multiplicity, '1..*');
    assert.ok(await page.evaluate(() => !window.SysMLCanvas.state.model.elements.some((e) => e.name === 'Wheel')), 'and takes the new definition away');
    await finish(ctx);
  });

  test('a key typed on the drawing opens the box with that key; Escape puts it away and changes nothing', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await select(page, { type: 'el', id: 'ServerHost' }, SAVED);
    await page.focus('#canvas');
    const stepsBefore = await steps(page);
    await page.keyboard.press('W');
    await until(page, () => !!document.querySelector('.label-editor'), null, 'the box opens');
    assert.equal(await box(page).inputValue(), 'W', 'the key typed replaces the label\'s text');
    assert.equal(await page.evaluate(() => document.querySelector('.label-editor').selectionStart), 1, 'the caret is after it');
    await page.keyboard.type('ebHost');
    await page.keyboard.press('Delete');   // in the box, Delete edits the text, not the model
    await page.keyboard.press('Escape');
    await until(page, () => !document.querySelector('.label-editor'), null, 'Escape closes the box');
    assert.equal(await steps(page), stepsBefore, 'nothing changed');
    assert.equal((await element(page, 'ServerHost')).name, 'ServerHost');
    assert.equal(await page.evaluate(() => window.SysMLCanvas.state.selection?.id), 'ServerHost', 'the selection stays');
    await finish(ctx);
  });

  test('the zoom keys type while an editable thing is selected, and zoom while nothing is', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await select(page, { type: 'el', id: 'Page.app' }, SAVED);
    await page.focus('#canvas');
    const zoom = await zoomLevel(page);
    await page.keyboard.press('+');
    await until(page, () => !!document.querySelector('.label-editor'), null, 'the box opens');
    assert.equal(await box(page).inputValue(), '+');
    assert.equal(await zoomLevel(page), zoom, 'the zoom stays');
    await page.keyboard.press('Escape');
    await select(page, null);
    await page.focus('#canvas');
    await page.keyboard.press('+');
    await until(page, (z) => { const t = document.querySelector('#zoom-level')?.textContent; return t && parseInt(t, 10) > z; }, zoom, 'with nothing selected, + zooms in');
    assert.equal(await box(page).count(), 0);
    await finish(ctx);
  });

  test('leaving the box makes the change; the button opens it too; what isn\'t kept and what is refused are said', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await select(page, { type: 'el', id: 'Page.app' }, SAVED);
    assert.ok(await page.locator('#edit-label').isVisible(), 'the panel has Edit label');
    assert.equal(await page.textContent('#edit-label'), 'Edit label');
    await page.click('#edit-label');
    await until(page, () => !!document.querySelector('.label-editor'), null, 'the button opens the box');
    assert.equal(await box(page).inputValue(), 'app[1] : App');
    await page.keyboard.type('ref <A1> application[2] :>> other');
    await page.click('#inspector-title');
    await until(page, () => !document.querySelector('.label-editor'), null, 'leaving the box closes it');
    const app = await element(page, 'Page.app');
    assert.equal(app.name, 'application');
    assert.equal(app.multiplicity, '2');
    assert.equal(await page.textContent('#status'), 'Edited the label of part application in Page. Not kept, as the canvas doesn\'t hold it yet: ref, <A1>, :>> other.');
    // A click on the drawing leaves the box too, and selects what it is on.
    await page.keyboard.press('F2');
    await until(page, () => !!document.querySelector('.label-editor'), null, 'F2 opens the box again');
    await page.keyboard.type('app');
    const empty = await emptyPointIn(page, SAVED);
    await page.mouse.click(empty.x, empty.y);
    await until(page, () => !document.querySelector('.label-editor'), null, 'a click on the drawing closes the box');
    assert.equal((await element(page, 'Page.app')).name, 'app', 'and makes the change');
    await select(page, { type: 'el', id: 'Host' }, SAVED);
    await page.keyboard.press('F2');
    await page.keyboard.type('Host :> ServerHost');
    await page.keyboard.press('Enter');
    await until(page, () => /go round in a circle/.test(document.querySelector('#status').textContent), null, 'the refusal is said');
    await finish(ctx);
  });

  test('a start node, a view and a page that can\'t be changed have no box; the button is not there for them', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await importState(page, path.join(FIXTURES, 'behavior-actions.json'));
    await select(page, { type: 'el', id: 'Release.start' }, 'v-release');
    assert.equal(await page.locator('#edit-label').isVisible(), false);
    await page.focus('#canvas');
    await page.keyboard.press('F2');
    await page.keyboard.press('x');
    assert.equal(await box(page).count(), 0, 'a start node has no label to edit');
    await select(page, { type: 'el', id: 'Release.compile' }, 'v-release');
    await page.evaluate(() => { window.SysMLCanvas.state.mode = 'read'; });
    await page.keyboard.press('F2');
    assert.equal(await box(page).count(), 0, 'a page that can\'t be changed opens no box');
    await page.evaluate(() => { window.SysMLCanvas.state.mode = 'local'; });
    await page.keyboard.press('F2');
    await until(page, () => !!document.querySelector('.label-editor'), null, 'the box opens once the page can be changed');
    await page.keyboard.press('Escape');
    await finish(ctx);
  });

  test('a grid\'s cells are not labels: neither F2, a key nor the button opens a box there', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await importState(page, path.join(FIXTURES, 'grid.json'));
    await select(page, { type: 'el', id: 'Page.hosts' }, 'v-table');
    assert.equal(await page.locator('#edit-label').isVisible(), false);
    await page.keyboard.press('F2');
    await page.focus('#canvas');
    await page.keyboard.press('x');
    assert.equal(await box(page).count(), 0);
    await select(page, { type: 'el', id: 'Page.hosts' }, 'v-proof');
    assert.ok(await page.locator('#edit-label').isVisible(), 'the same part in a general view has a label to edit');
    await finish(ctx);
  });

  test('the box opens over the label wherever it is drawn: a lifeline, a message, a footprint, a port', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    // Whether the box is centred on the drawn label, within a few pixels across and a line down.
    async function overLabel(view, type, id, text) {
      await select(page, { type, id }, view);
      await page.keyboard.press('F2');
      await until(page, () => !!document.querySelector('.label-editor'), null, 'the box opens on ' + id);
      assert.equal(await box(page).inputValue(), text);
      const label = await page.locator(`.frame[data-view="${view}"] [data-${type}="${id}"] [data-label]`).first().boundingBox();
      const over = await box(page).boundingBox();
      const anchor = await page.locator(`.frame[data-view="${view}"] [data-${type}="${id}"] [data-label]`).first().evaluate((l) => (l.tagName === 'tspan' ? l.parentNode : l).getAttribute('text-anchor') || 'start');
      const x = anchor === 'middle' ? [over.x + over.width / 2, label.x + label.width / 2] : [over.x, label.x];
      assert.ok(Math.abs(x[0] - x[1]) < 12, id + ': the box is where the label is across (' + x + ')');
      assert.ok(Math.abs((over.y + over.height / 2) - (label.y + label.height / 2)) < 10, id + ': and down');
      await page.keyboard.press('Escape');
    }
    await overLabel(SAVED, 'el', 'Page.hosts.api', 'api : ~StrongholdApp');
    await importState(page, path.join(FIXTURES, 'sequence.json'));
    await page.evaluate(() => window.SysMLCanvas.fit());
    await overLabel('v-seq', 'el', 'Login.client', 'client : Client');
    await overLabel('v-seq', 'rel', 'm-login', 'login');
    await importState(page, path.join(FIXTURES, 'geometry.json'));
    await page.evaluate(() => window.SysMLCanvas.fit());
    await overLabel('v-plan', 'el', 'room.desk', 'desk : Desk');
    await finish(ctx);
  });

  test('a line\'s label: a connection is renamed; an interface takes its definition; a transition\'s is not edited', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await select(page, { type: 'rel', id: 'mount' }, SAVED);
    await page.keyboard.press('F2');
    await until(page, () => !!document.querySelector('.label-editor'), null, 'the box opens on the line');
    assert.equal(await box(page).inputValue(), 'mount');
    await page.keyboard.type('mounting');
    await page.keyboard.press('Enter');
    await until(page, () => window.SysMLCanvas.state.model.relationships.find((r) => r.id === 'mount').name === 'mounting', null, 'the connection is renamed');
    assert.deepEqual(await lastStep(page), { what: 'Edited the label of the connection mounting, api to api', key: null });
    await importState(page, path.join(FIXTURES, 'interconnection.json'));
    await select(page, { type: 'rel', id: 'fuelLine' }, 'v-ic');
    await page.keyboard.press('F2');
    assert.equal(await box(page).inputValue(), 'fuelLine : FuelLine');
    await page.keyboard.type('fuelLine : CtrlLink');
    await page.keyboard.press('Enter');
    await until(page, () => window.SysMLCanvas.state.model.relationships.find((r) => r.id === 'fuelLine').interfaceDef === 'CtrlLink', null, 'the interface takes its new definition');
    await importState(page, path.join(FIXTURES, 'behavior-states.json'));
    await select(page, { type: 'rel', id: 't-mount' }, 'v-host');
    assert.equal(await page.locator('#edit-label').isVisible(), false);
    await page.keyboard.press('F2');
    await page.focus('#canvas');
    await page.keyboard.press('x');
    assert.equal(await box(page).count(), 0, 'a transition\'s label is not edited');
    await finish(ctx);
  });

  test('in a browser view a row is renamed as typed: a key or Rename opens it, F2 doesn\'t', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await importState(page, path.join(FIXTURES, 'browser.json'));
    await select(page, { type: 'el', id: 'Page.hosts' }, 'v-tree');
    assert.equal(await page.textContent('#edit-label'), 'Rename');
    await page.keyboard.press('F2');
    assert.equal(await box(page).count(), 0, 'F2 doesn\'t rename a row');
    await page.focus('#canvas');
    await page.keyboard.press('s');
    await until(page, () => !!document.querySelector('.label-editor'), null, 'a key opens the row\'s box');
    await page.keyboard.type('ervers : Machine [2]');
    await page.keyboard.press('Enter');
    await until(page, () => window.SysMLCanvas.state.model.elements.find((e) => e.id === 'Page.hosts').name === 'servers : Machine [2]', null, 'the name is what was typed');
    const hosts = await element(page, 'Page.hosts');
    assert.equal(hosts.multiplicity, '1..*', 'nothing else is read');
    assert.deepEqual(await lastStep(page), { what: 'Renamed to part servers : Machine [2] in Page', key: null });
    await page.click('#edit-label');
    assert.equal(await box(page).inputValue(), 'servers : Machine [2]', 'Rename starts from the name');
    await page.keyboard.press('Escape');
    await checked(page);
    await finish(ctx);
  });
});
