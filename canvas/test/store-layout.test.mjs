// The page and its store in layout 2 (the library's stored.js): a store an older page kept, its model in model/working,
// is upgraded once; a save the store refuses says what went wrong, by the store's code, and leaves the page editable
// unless the store says this viewer may not write; a model too large for the store's pieces is named, not sent; and a
// head written by a newer canvas is left alone.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  embeddedModel, finish, launch, openCanvas, placeElement, rename, storeDoc, storedModel, until, untilStored,
} from './helpers.mjs';

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

/** Makes the fake store refuse the next `times` writes (set) the page makes through db.doc, with { code, message }. */
const refuseWrites = (page, code, message, times = 1) => page.evaluate(([c, m, n]) => {
  const db = window.__store.db;
  const doc = db.doc;
  let left = n;
  db.doc = (p) => {
    const ref = doc(p);
    return Object.assign({}, ref, {
      set: (data) => {
        if (left <= 0) return ref.set(data);
        left -= 1;
        if (!left) db.doc = doc;
        return Promise.reject({ code: c, message: m });
      },
    });
  };
}, [code, message, times]);
const status = (page) => page.textContent('#status');
const editable = (page) => page.evaluate(() => window.SysMLCanvas.editable());
const modelWrites = (page) => page.evaluate(() => window.__store.log.filter((c) => (c.op === 'set' || c.op === 'update' || c.op === 'delete') && c.path.startsWith('model/')).length);

describe('the store in layout 2', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('an old store, a format-1 model in model/working, opens with that model, then holds it in layout 2 and no model/working', async () => {
    const old = JSON.parse(fs.readFileSync(path.join(FIXTURES, 'format1.json'), 'utf8')).model;
    assert.equal(old.format, 'stronghold-canvas/1', 'the fixture is in format 1');
    const { revision } = embeddedModel();
    const seed = { 'model/working': { baseRevision: revision, model: old, changes: [{ at: '2026-11-01T09:00:00.000Z', text: 'Drawn on an older page' }], updated: '2026-11-01T09:00:00.000Z' } };
    const ctx = await openCanvas(browser, { shared: true, seed });
    const { page } = ctx;
    const ids = old.elements.map((e) => e.id);
    await until(page, (want) => want.every((id) => document.querySelector(`g[data-el="${id}"]`)), ids, 'the page draws the old store\'s model');
    const shown = await page.evaluate((raw) => ({ model: JSON.stringify(window.SysMLCanvas.state.model), upgraded: JSON.stringify(window.SysMLModel.normalize(raw)) }), old);
    assert.equal(shown.model, shown.upgraded, 'the page shows the model upgraded from format 1');
    await until(page, () => !window.__store.get('model/working') && window.__store.get('model/current'), null, 'the page saves it in layout 2 and deletes model/working');
    assert.equal(JSON.stringify(await storedModel(page)), shown.model, 'the store holds that model in layout 2');
    const head = await storeDoc(page, 'model/current');
    assert.equal(head.layout, 2);
    assert.equal(head.baseRevision, revision);
    assert.deepEqual(head.changes.map((c) => c.text), ['Drawn on an older page'], 'the change log comes along');
    assert.doesNotMatch(await status(page), /updated elsewhere/i, 'a model found as the page opens is taken without a word');
    await finish(ctx);
  });

  test('a save the store refuses says what went wrong and leaves the page editable; the next save goes through', async () => {
    const ctx = await openCanvas(browser, { shared: true });
    const { page } = ctx;
    const id = await placeElement(page, 'PartDefinition');
    await untilStored(page, (m) => m.elements.some((e) => e.id === id), 'the element is saved');

    await refuseWrites(page, 'quota_exceeded', 'documents in this artifact\'s database: it holds at most 25,000');
    await rename(page, id, 'Full');
    await until(page, () => /full/i.test(document.querySelector('#status').textContent), null, 'the page says the store is full');
    let said = await status(page);
    assert.match(said, /wasn't saved/, said);
    assert.match(said, /it holds at most 25,000/, `the store's own words say which cap: ${said}`);
    assert.match(said, /Delete some notes/, `and what to do: ${said}`);
    assert.ok(await editable(page), 'the page stays editable');

    await refuseWrites(page, 'invalid_argument', 'the body breaks a rule');
    await rename(page, id, 'Refused');
    await until(page, () => /refused it/.test(document.querySelector('#status').textContent), null, 'the page says the store refused the save');
    said = await status(page);
    assert.match(said, /The change to the model wasn't saved\. The shared store refused it \(the body breaks a rule\)\./, said);
    assert.ok(await editable(page), 'a refusal while the viewer may write leaves the page editable');
    assert.doesNotMatch(await page.textContent('#where'), /not change it/, 'and doesn\'t say the model can\'t be changed');

    await rename(page, id, 'Saved');
    await untilStored(page, (m) => m.elements.some((e) => e.id === id && e.name === 'Saved'), 'the next save goes through');
    await finish(ctx);
  });

  test('a store too busy to take a save: the page says so, tries again a little later, and does', async () => {
    const ctx = await openCanvas(browser, { shared: true });
    const { page } = ctx;
    const id = await placeElement(page, 'PartDefinition');
    await untilStored(page, (m) => m.elements.some((e) => e.id === id), 'the element is saved');
    // The page tries a busy write again twice by itself; the third refusal is the save's, which it tries again later.
    await refuseWrites(page, 'resource_exhausted', 'too many calls', 3);
    await rename(page, id, 'Patient');
    await until(page, () => /busy/.test(document.querySelector('#status').textContent), null, 'the page says the store is busy', 15000);
    const said = await status(page);
    assert.match(said, /isn't saved yet\. The shared store is busy \(too many calls\); the page tries again in \d+ s\./, said);
    assert.ok(await editable(page), 'the page stays editable');
    await untilStored(page, (m) => m.elements.some((e) => e.id === id && e.name === 'Patient'), 'the page tries again, and the save goes through', 15000);
    await finish(ctx);
  });

  test('a refusal while the platform says nothing of this viewer\'s permission turns the page read-only, saying the store didn\'t take the change', async () => {
    const init = () => {
      const use = window.claude.use;
      window.claude.use = (name) => (name === 'user' ? Promise.resolve(null) : use(name));
    };
    const ctx = await openCanvas(browser, { shared: true, init });
    const { page } = ctx;
    const id = await placeElement(page, 'PartDefinition');
    await refuseWrites(page, 'invalid_argument', 'below the viewer\'s permitted level');
    await rename(page, id, 'Nope');
    await until(page, () => !window.SysMLCanvas.editable(), null, 'the page turns read-only');
    assert.match(await page.textContent('#where'), /didn't take this viewer's change/, 'it says the store didn\'t take this viewer\'s change');
    await finish(ctx);
  });

  test('an element whose doc alone is too large to save is named, the page stays editable, and the model saves once the doc is shortened', async () => {
    const ctx = await openCanvas(browser, { shared: true });
    const { page } = ctx;
    const id = await placeElement(page, 'PartDefinition');
    await rename(page, id, 'Huge');
    await untilStored(page, (m) => m.elements.some((e) => e.id === id && e.name === 'Huge'), 'the element is saved');
    await until(page, () => window.__store.idle() > 300, null, 'the store goes quiet');
    const writes = await modelWrites(page);

    await page.fill('#f-doc', 'x'.repeat(200 * 1024));
    await until(page, () => /Changes aren't saved/.test(document.querySelector('#status').textContent), null, 'the page says the model can\'t be saved');
    const said = await status(page);
    assert.match(said, /part def Huge/, `the status names the element: ${said}`);
    assert.match(said, /is 200(\.\d)? KiB, more than the shared store keeps in one piece \(192 KiB\)/, `and says why: ${said}`);
    assert.match(said, /Shorten its doc/, `and what to do: ${said}`);
    assert.ok(await editable(page), 'the page stays editable');
    await page.waitForTimeout(300);
    assert.equal(await modelWrites(page), writes, 'nothing of the model is sent');
    assert.equal((await storedModel(page)).elements.find((e) => e.id === id).doc, '', 'the store keeps the model as it was');

    await page.fill('#f-doc', 'Short enough.');
    await untilStored(page, (m) => m.elements.some((e) => e.id === id && e.doc === 'Short enough.'), 'the model saves once the doc is shortened');
    assert.doesNotMatch(await status(page), /aren't saved/, 'and the page no longer says it can\'t be saved');
    await finish(ctx);
  });

  test('a model from elsewhere that comes while a change here waits to be saved isn\'t taken: this page\'s write follows and wins, saying so', async () => {
    const ctx = await openCanvas(browser, { shared: true });
    const { page } = ctx;
    const id = await placeElement(page, 'PartDefinition');
    await untilStored(page, (m) => m.elements.some((e) => e.id === id), 'the element is saved');
    await page.fill('#f-name', 'Mine');
    // Within the pause before the save, another page writes its model: its parts, then its head, as a page does.
    await page.evaluate(() => {
      const M = window.SysMLModel;
      const db = window.__store.db;
      const theirs = M.readStore(window.__store.dump()).model;   // what the store holds: the element, not renamed yet
      theirs.elements.push({ id: 'e-theirs', kind: 'PartDefinition', name: 'Theirs', abstract: false, doc: '', code: [] });
      const split = M.splitModel(theirs);
      const head = M.storeHead(split, { baseRevision: window.__store.get('model/current').baseRevision, changes: [], updated: '2026-11-07T12:00:00.000Z' });
      return Promise.all(split.parts.map((part) => db.doc('model/current/parts/' + part.id).set(JSON.parse(part.text)))).then(() => db.doc('model/current').set(head));
    });
    const model = await untilStored(page, (m) => m.elements.some((e) => e.id === id && e.name === 'Mine'), 'this page\'s write follows');
    assert.ok(!model.elements.some((e) => e.id === 'e-theirs'), 'and wins: the store holds this page\'s model');
    assert.equal(await page.locator('g[data-el="e-theirs"]').count(), 0, 'the model from elsewhere was never shown');
    assert.match(await status(page), /changed elsewhere while you were editing; this page's version was written over it/);
    const head = await storeDoc(page, 'model/current');
    assert.match(head.changes[head.changes.length - 1].text, /^Wrote this page's model over a change made elsewhere at 2026-11-07T12:00:00\.000Z/, 'the change log Claude reads says so');
    await finish(ctx);
  });

  test('a part the head names that goes from the store is written again by the page that shows it', async () => {
    const ctx = await openCanvas(browser, { shared: true });
    const { page } = ctx;
    const id = await placeElement(page, 'PartDefinition');
    await untilStored(page, (m) => m.elements.some((e) => e.id === id), 'the element is saved');
    const part = (await storeDoc(page, 'model/current')).parts[0];
    // Another page, saving at the same time, deletes a part it thinks no head names.
    await page.evaluate((p) => window.__store.db.doc('model/current/parts/' + p).delete(), part);
    await until(page, (p) => Boolean(window.__store.get('model/current/parts/' + p)), part, 'the page writes the part again');
    assert.ok(await storedModel(page), 'the store holds the whole model again');
    await finish(ctx);
  });

  test('a head a newer canvas wrote, in a layout this page doesn\'t know, turns the page read-only and is never written over', async () => {
    const { revision } = embeddedModel();
    const newer = { layout: 3, baseRevision: revision, format: 'stronghold-canvas/9', shards: ['a'], changes: [], updated: '2026-12-01T00:00:00.000Z' };
    const ctx = await openCanvas(browser, { shared: true, seed: { 'model/current': newer } });
    const { page } = ctx;
    await until(page, () => !window.SysMLCanvas.editable(), null, 'the page turns read-only');
    assert.match(await page.textContent('#where'), /newer version of the canvas/, 'it says a newer version of the canvas saved the model');
    assert.match(await page.textContent('#where'), /Reload the page/, 'and to reload to get it');
    await page.waitForTimeout(300);
    assert.equal(await modelWrites(page), 0, 'the page writes nothing of the model');
    assert.deepEqual(await storeDoc(page, 'model/current'), newer, 'the newer head stays as it was');
    await finish(ctx);
  });
});
