// The export panel and notes, in local mode (no window.claude): the saved model exports as a package, and a note on an
// element gets a list entry and a pin, exports as a comment, and goes away with its Delete button.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { addNote, exportText, finish, launch, openCanvas, placeElement, rename, until } from './helpers.mjs';

describe('export', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('the embedded saved model exports as textual SysML v2 with a package, in local mode', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    assert.ok(await page.locator('#download-state').isVisible(), 'local mode offers #download-state');
    assert.ok(await page.locator('#import-state').isVisible(), 'local mode offers #import-state');
    assert.equal(await page.locator('#import-file').count(), 1, 'local mode has the #import-file input');
    const text = await exportText(page);
    assert.match(text, /\bpackage\b/);
    assert.notEqual(await page.getAttribute('#export-text', 'readonly'), null, '#export-text is readonly');
    assert.ok(await page.locator('#copy-export').isVisible(), 'the export panel offers #copy-export');
    await finish(ctx);
  });

  test('a note on the selected element gets an li and a pin, exports as a comment, and its Delete button removes it', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const id = await placeElement(page, 'PartDefinition');
    await rename(page, id, 'Host');
    const note = await addNote(page);
    const li = page.locator(`#notes-list li[data-note="${note}"]`);
    assert.equal(await page.locator(`#drawing g.pin[data-note="${note}"]`).count(), 1, 'the note has a pin in the svg');

    await li.locator('textarea.text').fill('Rename this to Server');
    const text = await exportText(page);
    assert.match(text, /\bcomment\b/, 'the note exports as a comment');
    assert.ok(text.includes('Rename this to Server'), `the export holds the note's text:\n${text}`);

    const remove = li.locator('button', { hasText: /delete/i });
    assert.ok((await remove.count()) >= 1, 'the note has a Delete button in its li');
    await remove.first().click();
    await until(page, (noteId) => !document.querySelector(`li[data-note="${noteId}"]`) && !document.querySelector(`.pin[data-note="${noteId}"]`),
      note, 'the note and its pin are gone after Delete');
    await finish(ctx);
  });
});
