// The canvas's own start, index.html as it is published: a blank model, as SysON's empty SysML v2 project starts (the
// package Package1 holding one general view, view1, and nothing else). It exports as the package holding the view,
// with no problems; the page opens on it with the general view's palette, nothing to undo, and no name but its own;
// and a part def placed in view1 goes into Package1. The other tests open the canvas holding the Stronghold example
// instead (helpers.mjs); these open index.html itself.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import vm from 'node:vm';
import {
  INDEX, checked, embeddedModel, emptyPointIn, exportText, finish, launch, modelLibSource, openCanvas, pageSource, placeElement,
} from './helpers.mjs';

// The text the blank model exports: the package, holding the view, which shows nothing.
const TEXT = 'package Package1 {\n\n    view view1 : StandardViewDefinitions::GeneralView;\n}\n';

function loadLib(source) {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.runInContext(modelLibSource(source), vm.createContext(sandbox), { filename: 'canvas/index.html#model-lib' });
  assert.ok(sandbox.SysMLModel, 'the model-lib script sets window.SysMLModel');
  return sandbox.SysMLModel;
}

/** The notes and the archive the page saves, in <script type="application/json" id="saved-notes">, parsed. */
function savedNotes(source) {
  const match = source.match(/<script\b[^>]*\bid=["']saved-notes["'][^>]*>([\s\S]*?)<\/script>/);
  assert.ok(match, 'index.html holds the saved notes in <script type="application/json" id="saved-notes">');
  return JSON.parse(match[1]);
}

describe('the canvas\'s start', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('index.html saves a blank model: the package Package1, holding one general view, view1, and nothing else', () => {
    const source = pageSource(INDEX);
    const lib = loadLib(source);
    const model = embeddedModel(source);
    assert.equal(model.format, lib.FORMAT, 'it is saved in the current version of the format');
    assert.deepEqual(model.package, { name: 'Package1', doc: '' }, 'the package is Package1, with no doc');
    assert.deepEqual([model.elements.length, model.relationships.length], [0, 0], 'no elements and no lines');
    assert.equal(model.views.length, 1, 'one view');
    const [view] = model.views;
    assert.deepEqual([view.kind, view.name, view.doc], ['GeneralView', 'view1', ''], 'a general view named view1, with no doc');
    assert.deepEqual(Object.keys(view.layout), [], 'it shows nothing');
    const saved = savedNotes(source);
    assert.equal(saved.saved, model.revision, 'the notes are saved with the model\'s revision');
    assert.deepEqual([saved.notes.length, saved.archive.length], [0, 0], 'no notes, and none archived');
  });

  test('the blank model exports as the package holding the view, and the checks find nothing wrong', () => {
    const source = pageSource(INDEX);
    const lib = loadLib(source);
    const model = lib.normalize(embeddedModel(source));
    assert.equal(lib.validate(model).length, 0, 'no problems');
    assert.equal(lib.toSysML(model, [], []), TEXT);
  });

  test('the page opens on it: one empty general view, active, with its palette, nothing to undo, and its own name', async () => {
    const ctx = await openCanvas(browser, { file: INDEX });
    const { page } = ctx;
    const view = embeddedModel(pageSource(INDEX)).views[0];
    assert.equal(await page.title(), 'Grasp');
    assert.equal((await page.textContent('h1')).trim(), 'Grasp');
    assert.doesNotMatch(await page.evaluate(() => document.title + '\n' + document.body.innerText), /stronghold/i,
      'nothing the page shows names Stronghold');
    assert.equal(await page.locator('#drawing g.frame[data-view]').count(), 1, 'one frame');
    assert.equal(await page.getAttribute('#drawing g.frame.is-active', 'data-view'), view.id, 'the view is active');
    assert.match(await page.textContent(`#drawing g.frame[data-view="${view.id}"]`), /view1\s*:\s*GeneralView/, 'its tab names it and its kind');
    assert.match(await page.textContent('.eyebrow'), /general view · view1/);
    assert.equal(await page.locator('#drawing g[data-el], #drawing g[data-rel]').count(), 0, 'nothing is drawn in it');
    const tools = await page.$$eval('.palette button[data-tool]', (buttons) => buttons.map((b) => b.getAttribute('data-tool')));
    for (const tool of ['PartDefinition', 'PortDefinition', 'PartUsage', 'PortUsage']) assert.ok(tools.includes(tool), `the palette offers ${tool}`);
    assert.ok(await page.locator('#undo').isDisabled(), 'nothing to undo');
    await checked(page);
    assert.ok(await page.locator('#problems').isHidden(), 'no problems');
    assert.equal(await exportText(page), TEXT, 'the export panel shows the same text');
    await finish(ctx);
  });

  test('a part def placed in view1 goes into Package1, and the view shows it', async () => {
    const ctx = await openCanvas(browser, { file: INDEX });
    const { page } = ctx;
    const view = embeddedModel(pageSource(INDEX)).views[0];
    const id = await placeElement(page, 'PartDefinition', await emptyPointIn(page, view.id));
    assert.equal(await page.locator(`#drawing g.frame[data-view="${view.id}"] g[data-el="${id}"]`).count(), 1, 'it is drawn in view1');
    assert.ok(await page.locator('#undo').isEnabled(), 'placing it can be undone');
    const name = await page.inputValue('#f-name');
    assert.equal(await exportText(page), `package Package1 {\n\n    part def ${name};\n\n` +
      '    view view1 : StandardViewDefinitions::GeneralView {\n        expose Package1::*::**;\n    }\n}\n',
    'the package holds the part def, and the view, showing all there is, exposes the package');
    await finish(ctx);
  });
});
