// The loop's other direction: Claude writes into the store from its side, and the open page picks it up live. A
// response to a note appears under the note, and a changed working model redraws the drawing.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { addNote, embeddedModel, finish, launch, openCanvas, placeElement, rename, storeDoc, until } from './helpers.mjs';

describe('the loop from the store side', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('a response written to a note document shows under the note, and resolved draws it dashed', async () => {
    const ctx = await openCanvas(browser, { shared: true });
    const { page } = ctx;
    const id = await placeElement(page, 'PartDefinition');
    await rename(page, id, 'Host');
    const note = await addNote(page);
    await page.fill(`#notes-list li[data-note="${note}"] textarea.text`, 'Should this be abstract?');
    await until(page, (n) => { const d = window.__store.get('notes/' + n); return Boolean(d) && d.text === 'Should this be abstract?'; }, note, 'the note reaches the store');
    // Claude's side: the same store, written through the fake's db.
    await page.evaluate((n) => window.__store.db.doc('notes/' + n).update({ response: 'Yes: it is only ever specialized.', resolved: true }), note);
    await until(page, (n) => {
      const li = document.querySelector(`#notes-list li[data-note="${n}"]`);
      return Boolean(li) && li.classList.contains('is-resolved') && /Yes: it is only ever specialized\./.test(li.textContent);
    }, note, 'the note shows the response and is resolved');
    assert.ok(await page.locator(`.pin[data-note="${note}"].is-resolved`).count() === 1, 'the pin is drawn resolved');
    await finish(ctx);
  });

  test('a working model written to the store redraws the page', async () => {
    const ctx = await openCanvas(browser, { shared: true });
    const { page } = ctx;
    const saved = embeddedModel();
    const model = JSON.parse(JSON.stringify(saved));
    model.elements.push({ id: 'e-from-claude', kind: 'PartDefinition', name: 'Logbook', x: 1300, y: 400, w: 220, h: 72, doc: 'Added by Claude.' });
    await page.evaluate((body) => window.__store.db.doc('model/working').set(body),
      { baseRevision: saved.revision, model, changes: [{ at: '2026-11-06T09:00:00.000Z', text: 'Added part def Logbook' }], updated: '2026-11-06T09:00:00.000Z' });
    await until(page, () => Boolean(document.querySelector('g[data-el="e-from-claude"]')), null, 'the element Claude added is drawn');
    assert.match(await page.textContent('g[data-el="e-from-claude"]'), /Logbook/);
    assert.match(await page.textContent('#status'), /updated elsewhere/i);
    // A working model from another revision of the file is left alone.
    const stale = JSON.parse(JSON.stringify(model));
    stale.elements.push({ id: 'e-stale', kind: 'PartDefinition', name: 'Stale', x: 0, y: 0, w: 220, h: 72, doc: '' });
    await page.evaluate((body) => window.__store.db.doc('model/working').set(body), { baseRevision: 'some-other-revision', model: stale, changes: [], updated: '2026-11-06T09:01:00.000Z' });
    await page.waitForTimeout(600);
    assert.equal(await page.locator('g[data-el="e-stale"]').count(), 0, 'a working model based on another revision is not shown');
    await finish(ctx);
  });

  test('a page that changes the model and then hears its own write back does not loop or lose the change', async () => {
    const ctx = await openCanvas(browser, { shared: true });
    const { page } = ctx;
    const id = await placeElement(page, 'PortDefinition');
    await rename(page, id, 'Api');
    await until(page, (i) => { const w = window.__store.get('model/working'); return Boolean(w) && JSON.stringify(w.model).includes(JSON.stringify(i)) && JSON.stringify(w.model).includes('"Api"'); }, id, 'the renamed element reaches the store');
    await page.waitForTimeout(1200);
    const working = await storeDoc(page, 'model/working');
    assert.equal(working.model.elements.filter((e) => e.id === id).length, 1, 'the element is in the store once');
    assert.equal(await page.locator(`g[data-el="${id}"]`).count(), 1, 'and drawn once');
    assert.doesNotMatch(await page.textContent('#status'), /updated elsewhere/i, 'its own write is not reported as a change from elsewhere');
    await finish(ctx);
  });
});
