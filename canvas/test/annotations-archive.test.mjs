// The archive, in shared mode with the fake store: archiving a resolved note moves its document from the collection
// notes to the collection archive, takes its pin off the drawing and lists it under Archive; Restore brings it back;
// an unresolved note has no Archive button.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { addNote, finish, launch, openCanvas, placeElement, rename, storeDump, until } from './helpers.mjs';

/** Places a part def named `name`, notes it with `text`, and has Claude's side resolve the note in the store. */
async function resolvedNote(page, name, text) {
  const el = await placeElement(page, 'PartDefinition');
  await rename(page, el, name);
  const note = await addNote(page);
  await page.fill(`#notes-list li[data-note="${note}"] textarea.text`, text);
  await until(page, ([n, t]) => { const d = window.__store.get('notes/' + n); return Boolean(d) && d.text === t; }, [note, text], 'the note reaches the store');
  await page.evaluate((n) => window.__store.db.doc('notes/' + n).update({ response: 'Done.', resolved: true }), note);
  await until(page, (n) => document.querySelector(`#notes-list li[data-note="${n}"]`)?.classList.contains('is-resolved'), note, 'the note is resolved');
  return note;
}

const archivedInStore = (n) => { const d = window.__store.dump(); return Boolean(d['archive/' + n]) && !d['notes/' + n]; };

describe('the archive', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('archiving a resolved note moves its document from notes to archive, and its pin goes', async () => {
    const ctx = await openCanvas(browser, { shared: true });
    const { page } = ctx;
    const note = await resolvedNote(page, 'Ledger', 'Is this done?');
    const li = page.locator(`#notes-list li[data-note="${note}"]`);
    assert.equal(await li.locator('button.archive').count(), 1, 'a resolved note has an Archive button');
    await li.locator('button.archive').click();
    await until(page, (n) => !document.querySelector(`#notes-list li[data-note="${n}"]`) && !document.querySelector(`#drawing .pin[data-note="${n}"]`),
      note, 'the note and its pin are gone from the notes');
    assert.match(await page.textContent('#status'), /Archived note \d+/);
    await until(page, archivedInStore, note, 'the document moved from notes to archive');
    const archived = (await storeDump(page))[`archive/${note}`];
    assert.equal(archived.text, 'Is this done?', 'the archived document keeps the text');
    assert.equal(archived.resolution, 'Done.', 'and carries the response as its resolution');
    assert.equal(archived.resolved, true);
    assert.ok(typeof archived.archived === 'string' && archived.archived.length > 0, 'and the time it was archived');
    assert.match(await page.textContent('#archive-toggle'), /Archive · 1/, 'the panel counts it');
    await page.click('#archive-toggle');
    const row = page.locator(`#archive-list li.archived[data-note="${note}"]`);
    assert.equal(await row.count(), 1, 'the archive lists it');
    assert.match(await row.textContent(), /Ledger/, 'with its target');
    assert.match(await row.textContent(), /Done\./, 'and its resolution');
    assert.equal(await row.locator('textarea').count(), 0, 'as read-only text');
    await finish(ctx);
  });

  test('Restore brings an archived note back to the notes, its pin and its document with it', async () => {
    const ctx = await openCanvas(browser, { shared: true });
    const { page } = ctx;
    const note = await resolvedNote(page, 'Vault', 'Restore me');
    await page.locator(`#notes-list li[data-note="${note}"] button.archive`).click();
    await until(page, archivedInStore, note, 'archived in the store');
    await page.click('#archive-toggle');
    await page.locator(`#archive-list li.archived[data-note="${note}"] button.restore`).click();
    await until(page, (n) => Boolean(document.querySelector(`#notes-list li[data-note="${n}"]`)) && document.querySelectorAll(`#drawing .pin[data-note="${n}"]`).length === 1,
      note, 'the note and its pin are back');
    await until(page, (n) => { const d = window.__store.dump(); return Boolean(d['notes/' + n]) && !d['archive/' + n]; }, note, 'the document moved back to notes');
    const back = (await storeDump(page))[`notes/${note}`];
    assert.equal(back.response, 'Done.', 'the restored note keeps its response');
    assert.equal(back.resolved, true, 'and stays resolved');
    assert.equal(back.archived, undefined, 'and carries no archived time any more');
    assert.equal(await page.locator(`#notes-list li[data-note="${note}"].is-resolved`).count(), 1, 'it is listed resolved again');
    assert.ok(await page.locator('#archive-toggle').isHidden(), 'the Archive button hides once the archive is empty');
    assert.match(await page.textContent('#status'), /Restored note \d+/);
    await finish(ctx);
  });

  test('an unresolved note has no Archive button', async () => {
    const ctx = await openCanvas(browser, { shared: true });
    const { page } = ctx;
    await placeElement(page, 'PartDefinition');
    const note = await addNote(page);
    const li = page.locator(`#notes-list li[data-note="${note}"]`);
    assert.equal(await li.locator('button.archive').count(), 0, 'an open note has no Archive button');
    assert.equal(await li.locator('button.remove').count(), 1, 'but it has Delete');
    assert.ok(await page.locator('#archive-toggle').isHidden(), 'and there is no archive to show');
    await finish(ctx);
  });
});
