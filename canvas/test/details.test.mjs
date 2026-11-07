// The details view, as SysON's: the library's titles, core features and Advanced rows for each kind of element, line
// and view (in Node, on the Stronghold example and the fixtures); then the panel: the Core and Advanced tabs and their
// titles, the tab kept as the selection changes, the rows the canvas knows or doesn't hold yet, Is Abstract on
// Advanced, Specializes and Subsets retargeting or taking away the first specialization line, a choice as radio
// buttons, Is Parallel locked while a state holds transitions, the groups hidden when empty, a view's and a line's
// details, and a page that can't be changed.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { EXAMPLE, choose, chosen, detailsTab, finish, launch, modelLibSource, openCanvas, until } from './helpers.mjs';

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const SAVED = 'v-proof';

// As in model-lib.test.mjs: the library in a vm context; its values compared as JSON.
function loadLib() {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.runInContext(modelLibSource(), vm.createContext(sandbox), { filename: 'canvas/index.html#model-lib' });
  return sandbox.SysMLModel;
}
const M = loadLib();
const json = (v) => JSON.parse(JSON.stringify(v));
const modelOf = (file) => M.normalize(json(JSON.parse(fs.readFileSync(file, 'utf8')).model));
// A details row in words: Label[field], Label=value, or Label[-] for what the canvas doesn't hold yet.
const words = (rows) => json(rows).map((r) => r.label + (r.field ? '[' + r.field + ']' : r.held === false ? '[-]' : '=' + JSON.stringify(r.value)));

describe('details view: what the tabs hold', () => {
  test('the groups\' title is the metaclass in words, a usage\'s without Usage, then Properties', () => {
    const titles = ['PartUsage', 'PartDefinition', 'PortUsage', 'ItemUsage', 'StateUsage', 'ForkNode', 'EventOccurrenceUsage',
      'ConnectionUsage', 'FlowUsage', 'ViewUsage', 'FeatureTyping'].map((c) => M.detailsTitle(c));
    assert.deepEqual(titles, ['Part Properties', 'Part Definition Properties', 'Port Properties', 'Item Properties', 'State Properties',
      'Fork Node Properties', 'Event Occurrence Properties', 'Connection Properties', 'Flow Properties', 'View Properties', 'Feature Typing Properties']);
  });

  test('SysON\'s core features: the names, a feature\'s direction, isIndividual, isAbstract, isParallel, a line\'s ends', () => {
    const base = ['declaredName', 'qualifiedName', 'declaredShortName'];
    const core = (c) => json(M.coreFeatures(c));
    assert.deepEqual(core('PartUsage'), base.concat('direction', 'isIndividual'));
    assert.deepEqual(core('PartDefinition'), base.concat('isIndividual'), 'an occurrence definition shows isIndividual in isAbstract\'s place');
    assert.deepEqual(core('PortUsage'), base.concat('direction'), 'a port shows a feature\'s set only');
    assert.deepEqual(core('StateUsage'), base.concat('direction', 'isParallel'));
    assert.deepEqual(core('StateDefinition'), base.concat('isIndividual', 'isParallel'));
    assert.deepEqual(core('AttributeDefinition'), base.concat('isAbstract'), 'a type that is no feature and no occurrence definition shows isAbstract');
    assert.deepEqual(core('ViewUsage'), base.concat('direction', 'exposedElement'));
    assert.deepEqual(core('Specialization'), base.concat('general', 'specific'));
    assert.deepEqual(core('FeatureTyping'), base.concat('general', 'specific', 'type', 'typedFeature'));
  });

  test('a part: its fields, the values the canvas knows, the rest not held yet, supertypes\' attributes first', () => {
    const model = modelOf(EXAMPLE);
    const d = M.detailsOf(model, 'el', model.elements.find((e) => e.id === 'Page.hosts'));
    assert.equal(d.title, 'Part Properties');
    assert.deepEqual(words(d.core), ['Declared Name[name]', 'Qualified Name="StrongholdProof::Page::hosts"', 'Declared Short Name[-]', 'Direction[-]', 'Is Individual[-]']);
    const advanced = words(d.advanced);
    assert.deepEqual(advanced.slice(0, 5), ['Element Id="Page.hosts"', 'Is Implied Included[-]', 'Is Library Element=false', 'Name="hosts"', 'Short Name[-]']);
    assert.ok(advanced.indexOf('Is Abstract[-]') < advanced.indexOf('Is Composite[-]') && advanced.indexOf('Is Composite[-]') < advanced.indexOf('Portion Kind[-]'),
      'Type\'s attributes, then Feature\'s, then OccurrenceUsage\'s');
    assert.ok(!advanced.some((w) => /^Alias Ids|^Owning Relationship/.test(w)), 'a list and a reference have no row');
    const host = M.detailsOf(model, 'el', model.elements.find((e) => e.id === 'Host'));
    assert.ok(words(host.advanced).includes('Is Abstract[abstract]'), 'a definition\'s abstract is on Advanced, where SysON puts it');
  });

  test('every kind, line and view: each field that holds an attribute is in one tab, once; nothing else claims a field', () => {
    const files = [EXAMPLE].concat(fs.readdirSync(FIXTURES).filter((f) => f.endsWith('.json')).map((f) => path.join(FIXTURES, f)));
    const seen = new Set();
    files.forEach((file) => {
      const model = modelOf(file);
      const items = model.elements.map((item) => ['el', item]).concat(model.relationships.map((item) => ['rel', item]), model.views.map((item) => ['view', item]));
      items.forEach(([type, item]) => {
        const d = json(M.detailsOf(model, type, item));
        const table = type === 'el' ? M.KINDS : type === 'rel' ? M.RELATIONSHIPS : M.VIEW_KINDS;
        const held = json(table[item.kind].fields.filter((f) => M.FIELDS[f] && M.FIELDS[f].attribute));
        const rows = d.core.concat(d.advanced).filter((r) => r.field);
        assert.deepEqual(rows.map((r) => r.field).sort(), held.slice().sort(), item.kind + ' ' + item.id);
        assert.equal(d.advanced[0].label, 'Element Id');
        assert.equal(d.advanced[0].value, item.id);
        seen.add(type + ' ' + item.kind);
      });
    });
    assert.ok(seen.size >= 25, 'many kinds were tried: ' + seen.size);
  });

  test('a view\'s exposed elements and qualified name; a line\'s ends and its name; Specializes\' choices keep the rules', () => {
    const model = modelOf(EXAMPLE);
    const view = M.detailsOf(model, 'view', model.views[0]);
    assert.equal(view.title, 'View Properties');
    assert.equal(json(view.core).find((r) => r.name === 'qualifiedName').value, 'StrongholdProof::proofStructure');
    assert.match(json(view.core).find((r) => r.name === 'exposedElement').value, /^Page, hosts, api, app, api, Host and \d+ more$/);
    const spec = M.detailsOf(model, 'rel', model.relationships.find((r) => r.id === 's-ServerHost'));
    assert.deepEqual(words(spec.core).slice(3), ['General="part def Host"', 'Specific="part def ServerHost"']);
    const mount = M.detailsOf(model, 'rel', model.relationships.find((r) => r.id === 'mount'));
    assert.equal(json(mount.core).find((r) => r.name === 'qualifiedName').value, 'StrongholdProof::Page::mount');
    const host = model.elements.find((e) => e.id === 'Host');
    const server = model.elements.find((e) => e.id === 'ServerHost');
    assert.ok(!json(M.generals(model, host)).some((e) => e.id === 'ServerHost'), 'a definition that specializes it would make a circle');
    assert.ok(!json(M.generals(model, host)).some((e) => e.id === 'Host'), 'nor itself');
    assert.deepEqual(json(M.generals(model, server)).map((e) => e.id).sort(), ['App', 'DevHost', 'Host', 'OnlineHost', 'Page']);
    const hosts = model.elements.find((e) => e.id === 'Page.hosts');
    assert.deepEqual(json(M.generals(model, hosts)).map((e) => e.id), ['Page.app'], 'a part subsets a part in the same box');
  });
});

describe('details view on the page', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  const select = (page, sel, view) => page.evaluate(([s, v]) => window.SysMLCanvas.select(s, v), [sel, view]);
  const rows = (page, tab) => page.$$eval(`#fields .details-page[data-tab="${tab}"] .group-body > :not([hidden])`, (nodes) => nodes.map((n) => {
    if (n.classList.contains('detail')) return n.querySelector('.detail-label').textContent + '=' + n.querySelector('.detail-value').textContent;
    return n.id;
  }));
  const steps = (page) => page.evaluate(() => window.SysMLCanvas.state.history.length);
  const lastStep = (page) => page.evaluate(() => { const h = window.SysMLCanvas.state.history; return h[h.length - 1].what; });
  const lines = (page, from) => page.evaluate((f) => JSON.parse(JSON.stringify(window.SysMLCanvas.state.model.relationships.filter((r) => r.kind === 'Specialization' && r.from === f))), from);
  async function importState(page, file) {
    await page.setInputFiles('#import-file', file);
    await until(page, () => /^Imported /.test(document.querySelector('#status')?.textContent || ''), null, 'the page says it imported the state');
  }

  test('Core and Advanced: the title, SysON\'s order, the rows the canvas doesn\'t hold yet; the tab is kept as the selection changes', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    assert.equal(await page.textContent('#inspector-title'), 'Details');
    await select(page, { type: 'el', id: 'Page.hosts' }, SAVED);
    assert.equal(await page.textContent('#g-main-title'), 'Part Properties');
    assert.deepEqual(await rows(page, 'Core'), ['l-name', 'Qualified Name=StrongholdProof::Page::hosts', 'Declared Short Name=not held yet', 'Direction=not held yet',
      'Is Individual=not held yet', 'l-multiplicity', 'l-doc'], 'SysON\'s core features, then the canvas\'s own, the documentation last');
    assert.equal(await page.textContent('#f-path'), 'StrongholdProof::Page::hosts');
    assert.ok(await page.locator('#l-type').isVisible(), 'Typed by, in its own group');
    assert.ok(await page.locator('#g-general').isHidden(), 'no Subsets while the part subsets nothing');
    assert.ok(await page.locator('#page-advanced').isHidden());
    await detailsTab(page, 'Advanced');
    assert.equal(await page.getAttribute('#tab-advanced', 'aria-selected'), 'true');
    assert.ok(await page.locator('#page-core').isHidden());
    const advanced = await rows(page, 'Advanced');
    assert.deepEqual(advanced.slice(0, 4), ['Element Id=Page.hosts', 'Is Implied Included=not held yet', 'Is Library Element=', 'Name=hosts']);
    assert.ok(advanced.includes('Is Composite=not held yet') && advanced.includes('Portion Kind=not held yet'));
    await select(page, { type: 'el', id: 'Host' }, SAVED);
    assert.equal(await page.textContent('#g-advanced-title'), 'Part Definition Properties');
    assert.ok(await page.locator('#page-advanced').isVisible(), 'the tab stays as the selection changes');
    assert.ok((await rows(page, 'Advanced')).includes('l-abstract'), 'Is Abstract is on Advanced for a definition');
    assert.ok(await page.locator('#f-abstract').isChecked(), 'and Host is abstract');
    // The arrow keys move between the tabs.
    await page.focus('#tab-advanced');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.getAttribute('#tab-core', 'aria-selected'), 'true');
    assert.ok(await page.locator('#page-core').isVisible());
    await finish(ctx);
  });

  test('Is Abstract on Advanced is one undo step; a definition\'s Core has no Typed by', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await select(page, { type: 'el', id: 'App' }, SAVED);
    assert.ok(await page.locator('#g-typing').isHidden(), 'a definition is typed by nothing, so the group is hidden');
    await detailsTab(page, 'Advanced');
    const before = await steps(page);
    await page.click('#f-abstract');
    assert.equal(await steps(page), before + 1);
    assert.equal(await lastStep(page), 'Made abstract: part def App');
    assert.equal(await page.evaluate(() => window.SysMLCanvas.state.model.elements.find((e) => e.id === 'App').abstract), true);
    await finish(ctx);
  });

  test('Specializes moves the first line\'s end, keeping the line; nothing takes it away; Undo brings it back', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await select(page, { type: 'el', id: 'ServerHost' }, SAVED);
    assert.ok(await page.locator('#l-specializes').isVisible());
    assert.ok(await page.locator('#l-subsets').isHidden(), 'a definition specializes; a usage subsets');
    assert.equal(await page.inputValue('#f-specializes'), 'Host');
    const options = await page.$$eval('#f-specializes option', (os) => os.map((o) => o.value));
    assert.ok(!options.includes('ServerHost'), 'not itself');
    const [line] = await lines(page, 'ServerHost');
    await page.selectOption('#f-specializes', 'OnlineHost');
    assert.deepEqual((await lines(page, 'ServerHost')).map((r) => [r.id, r.to]), [[line.id, 'OnlineHost']], 'the same line, its end moved');
    assert.equal(await lastStep(page), 'Made part def ServerHost specialize OnlineHost');
    assert.equal(await page.textContent('#status'), 'Made part def ServerHost specialize OnlineHost.');
    await page.selectOption('#f-specializes', '');
    assert.deepEqual(await lines(page, 'ServerHost'), [], 'nothing takes the line away');
    assert.equal(await lastStep(page), 'Took away the specialization of part def ServerHost');
    await until(page, () => document.getElementById('l-specializes').hidden, null, 'and the field goes with it');
    await page.click('#undo');
    await page.click('#undo');
    assert.deepEqual((await lines(page, 'ServerHost')).map((r) => [r.id, r.to]), [[line.id, 'Host']]);
    // A usage's: Subsets, among the parts in its box.
    await page.evaluate(() => window.SysMLCanvas.edit(() => {
      window.SysMLCanvas.state.model.relationships.push({ id: 'sub-1', kind: 'Specialization', from: 'Page.hosts', to: 'Page.app' });
      return 'Drew a subsetting';
    }));
    await select(page, { type: 'el', id: 'Page.hosts' }, SAVED);
    assert.ok(await page.locator('#l-subsets').isVisible());
    assert.equal(await page.inputValue('#f-subsets'), 'Page.app');
    await page.selectOption('#f-subsets', '');
    assert.equal(await lastStep(page), 'Took away the subsetting of part hosts in Page');
    await finish(ctx);
  });

  test('a choice is radio buttons, unset among them; Is Parallel is locked while a state holds transitions', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await importState(page, path.join(FIXTURES, 'interconnection.json'));
    await select(page, { type: 'el', id: 'FuelPort.supply' }, 'v-ic');
    assert.deepEqual(await page.$$eval('#f-direction input', (rs) => rs.map((r) => r.parentNode.textContent.trim())), ['unset', 'in', 'out', 'inout']);
    assert.equal(await chosen(page, '#f-direction'), 'out');
    assert.ok((await rows(page, 'Core')).indexOf('l-direction') === 3, 'Direction is a core feature, after the names');
    await choose(page, '#f-direction', 'inout');
    assert.equal(await lastStep(page), 'Set the direction of item supply in FuelPort to inout');
    await choose(page, '#f-direction', '');
    assert.equal(await page.evaluate(() => window.SysMLCanvas.state.model.elements.find((e) => e.id === 'FuelPort.supply').direction), '', 'unset');
    await importState(page, path.join(FIXTURES, 'behavior-states.json'));
    await select(page, { type: 'el', id: 'HostLifecycle' }, 'v-host');
    assert.ok(await page.locator('#f-parallel').isDisabled(), 'a state def holding transitions can\'t change Is Parallel');
    assert.match(await page.getAttribute('#l-parallel', 'title'), /^Is Parallel can't change while state def HostLifecycle holds transitions, as in SysON\.$/);
    await select(page, { type: 'el', id: 'HostLifecycle.running.serving' }, 'v-host');
    assert.ok(await page.locator('#f-parallel').isEnabled(), 'a state that holds none can');
    assert.equal(await page.getAttribute('#l-parallel', 'title'), null);
    await finish(ctx);
  });

  test('a view\'s details, a line\'s, and a page that can\'t be changed', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await select(page, { type: 'view', id: SAVED });
    assert.equal(await page.textContent('#v-g-main-title'), 'View Properties');
    assert.equal(await page.textContent('#v-path'), 'StrongholdProof::proofStructure');
    assert.match(await page.textContent('#view-fields [data-detail="exposedElement"]'), /^Exposed ElementPage, hosts, api/);
    await page.click('#v-tab-advanced');
    assert.equal(await page.textContent('#view-fields [data-detail="elementId"] .detail-value'), SAVED);
    await page.click('#v-tab-core');
    await select(page, { type: 'rel', id: 'mount' }, SAVED);
    assert.equal(await page.textContent('#g-main-title'), 'Connection Properties');
    assert.equal(await page.textContent('#f-path'), 'StrongholdProof::Page::mount');
    await importState(page, path.join(FIXTURES, 'interconnection.json'));
    await select(page, { type: 'el', id: 'FuelPort.supply' }, 'v-ic');
    await page.evaluate(() => { window.SysMLCanvas.state.mode = 'read'; window.SysMLCanvas.renderInspector(); });
    assert.ok(await page.$$eval('#f-direction input', (rs) => rs.every((r) => r.disabled)), 'the choices can\'t be changed');
    await page.evaluate(() => { window.SysMLCanvas.state.mode = 'local'; window.SysMLCanvas.renderInspector(); });
    await finish(ctx);
  });
});
