// Undo: #undo is disabled while there is nothing to take back, enabled after a change, and takes it back; a rename is
// one step however many keystrokes it took; Ctrl+Z on the canvas does the same as the button.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { finish, launch, openCanvas, placeElement, rename, until } from './helpers.mjs';

describe('undo', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('#undo starts disabled, is enabled after placing, and undo removes the element and disables it again', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    assert.ok(await page.locator('#undo').isDisabled(), '#undo starts disabled');
    const id = await placeElement(page, 'PartDefinition');
    assert.ok(await page.locator('#undo').isEnabled(), '#undo is enabled after placing');
    assert.match(await page.getAttribute('#undo', 'title'), /Undo: Added/, 'its title names the change');
    await page.click('#undo');
    await until(page, (elId) => !document.querySelector(`g[data-el="${elId}"]`), id, 'the element is gone after undo');
    assert.ok(await page.locator('#undo').isDisabled(), '#undo is disabled again');
    assert.match(await page.textContent('#status'), /Undid/);
    assert.ok(await page.locator('#inspector-empty').isVisible(), 'nothing is selected once the element is gone');
    await finish(ctx);
  });

  test('a rename is one undo step: undo brings the old name back and keeps the element', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const id = await placeElement(page, 'PartDefinition');
    const oldName = await page.inputValue('#f-name');
    assert.ok(oldName, 'a placed element has a name to start from');
    await rename(page, id, 'Renamed');
    await page.click('#undo');
    await until(page, ([elId, name]) => document.querySelector(`g[data-el="${elId}"]`)?.textContent.includes(name), [id, oldName], 'the old name is back in the drawing');
    assert.equal(await page.locator(`g[data-el="${id}"]`).count(), 1, 'the element itself stays');
    assert.equal(await page.inputValue('#f-name'), oldName, 'the panel shows the old name');
    assert.ok(await page.locator('#undo').isEnabled(), 'placing it is still there to undo');
    await finish(ctx);
  });

  test('Ctrl+Z on the canvas undoes', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const id = await placeElement(page, 'PartDefinition');
    await page.focus('#canvas');
    await page.keyboard.press('Control+z');
    await until(page, (elId) => !document.querySelector(`g[data-el="${elId}"]`), id, 'the element is gone after Ctrl+Z');
    assert.match(await page.textContent('#status'), /Undid/);
    await finish(ctx);
  });
});
