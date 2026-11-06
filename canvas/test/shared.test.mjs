// Shared mode: with window.claude.use('db') resolving a store (the fake in fake-claude.mjs), the page keeps the model in
// the document model/working and notes in the collection notes, and shows a working copy it finds in the store.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import {
  addNote, embeddedModel, finish, launch, modelElementIds, openCanvas, placeElement, rename, storeDoc, storeDump, until,
} from './helpers.mjs';

const holdsElement = ([id, name]) => {
  const working = window.__store.get('model/working');
  const model = working && JSON.stringify(working.model ?? null);
  return Boolean(model) && model.includes(JSON.stringify(id)) && (!name || model.includes(name));
};

describe('shared mode', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('a placed element is written to model/working within the debounce', async () => {
    const ctx = await openCanvas(browser, { shared: true });
    const { page } = ctx;
    const id = await placeElement(page, 'PartDefinition');
    await until(page, holdsElement, [id], 'model/working holds the new element');
    const working = await storeDoc(page, 'model/working');
    for (const field of ['baseRevision', 'model', 'changes', 'updated']) assert.ok(field in working, `model/working has ${field}`);
    assert.ok(modelElementIds(working.model).includes(id), `model.elements includes ${id}: ${JSON.stringify(working.model)}`);
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

  test('a working copy already in the store, based on the embedded revision, is what the page shows', async () => {
    // First a page writes a working copy with one renamed element...
    const first = await openCanvas(browser, { shared: true });
    const id = await placeElement(first.page, 'PartDefinition');
    await rename(first.page, id, 'Seeded');
    await until(first.page, holdsElement, [id, 'Seeded'], 'model/working holds the renamed element');
    const working = await storeDoc(first.page, 'model/working');
    await finish(first);

    // ...then a fresh page finds that copy in its store, as a reload would.
    const { revision } = embeddedModel();
    assert.notEqual(revision, undefined, 'the embedded model has a revision');
    const second = await openCanvas(browser, { shared: true, seed: { 'model/working': { ...working, baseRevision: revision } } });
    await until(second.page, (elementId) => Boolean(document.querySelector(`g[data-el="${elementId}"]`)), id, 'the seeded element is drawn');
    assert.ok((await second.page.textContent(`g[data-el="${id}"]`)).includes('Seeded'), 'the seeded element shows its name');
    await finish(second);
  });
});
