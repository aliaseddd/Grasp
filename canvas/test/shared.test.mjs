// Shared mode: with window.claude.use('db') resolving a store (the fake in fake-claude.mjs), the page keeps the model in
// the store's layout 2, a head model/current and the parts it names, and notes in the collection notes, and shows a
// model it finds in the store.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import {
  addNote, embeddedModel, finish, launch, modelElementIds, openCanvas, placeElement, rename, storeDoc, storeDump, storedModel,
  until, untilStored,
} from './helpers.mjs';

const holds = (id, name) => (model) => model.elements.some((e) => e.id === id && (!name || e.name === name));

describe('shared mode', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('a placed element is written to the store\'s model within the debounce', async () => {
    const ctx = await openCanvas(browser, { shared: true });
    const { page } = ctx;
    const id = await placeElement(page, 'PartDefinition');
    const model = await untilStored(page, holds(id), 'the store\'s model holds the new element');
    const head = await storeDoc(page, 'model/current');
    for (const field of ['layout', 'baseRevision', 'parts', 'changes', 'updated']) assert.ok(field in head, `model/current has ${field}`);
    assert.equal(head.layout, 2, 'the head is in layout 2');
    assert.equal(head.baseRevision, embeddedModel().revision, 'the head is based on the embedded revision');
    assert.ok(head.changes.length > 0 && head.changes.every((c) => typeof c.text === 'string'), `the head carries the change log: ${JSON.stringify(head.changes)}`);
    assert.ok(modelElementIds(model).includes(id), `model.elements includes ${id}: ${JSON.stringify(model)}`);
    assert.equal(await storeDoc(page, 'model/working'), undefined, 'the page writes no model/working');
    await finish(ctx);
  });

  test('a note with text becomes a document in the notes collection', async () => {
    const ctx = await openCanvas(browser, { shared: true });
    const { page } = ctx;
    const id = await placeElement(page, 'PartDefinition');
    const note = await addNote(page);
    await page.locator(`#notes-list li[data-note="${note}"] textarea.text`).fill('Check the port');
    await until(page, (text) => Object.entries(window.__store.dump()).some(([path, doc]) => path.startsWith('notes/') && doc.text === text),
      'Check the port', 'a notes document holds the typed text');
    const [path, doc] = Object.entries(await storeDump(page)).find(([p, d]) => p.startsWith('notes/') && d.text === 'Check the port');
    assert.equal(path.split('/').length, 2, `the note is a document directly in notes, not ${path}`);
    for (const field of ['no', 'target', 'targetLabel', 'text', 'by', 'created', 'updated']) assert.ok(field in doc, `the note has ${field}: ${JSON.stringify(doc)}`);
    assert.equal(doc.target, id, 'the note targets the element it was added on');
    await finish(ctx);
  });

  test('a model already in the store, based on the embedded revision, is what a fresh page shows', async () => {
    // First a page writes the model with one renamed element...
    const first = await openCanvas(browser, { shared: true });
    const id = await placeElement(first.page, 'PartDefinition');
    await rename(first.page, id, 'Seeded');
    await untilStored(first.page, holds(id, 'Seeded'), 'the store\'s model holds the renamed element');
    const written = Object.fromEntries(Object.entries(await storeDump(first.page)).filter(([path]) => path.startsWith('model/')));
    await finish(first);

    // ...then a fresh page finds what it wrote in its store, as a reload would.
    const { revision } = embeddedModel();
    assert.notEqual(revision, undefined, 'the embedded model has a revision');
    const seed = { ...written, 'model/current': { ...written['model/current'], baseRevision: revision } };
    const second = await openCanvas(browser, { shared: true, seed });
    await until(second.page, (elementId) => Boolean(document.querySelector(`g[data-el="${elementId}"]`)), id, 'the seeded element is drawn');
    assert.ok((await second.page.textContent(`g[data-el="${id}"]`)).includes('Seeded'), 'the seeded element shows its name');
    assert.equal(JSON.stringify(await second.page.evaluate(() => window.SysMLCanvas.state.model)), JSON.stringify(await storedModel(second.page)),
      'the fresh page shows the model the store holds');
    await finish(second);
  });
});
