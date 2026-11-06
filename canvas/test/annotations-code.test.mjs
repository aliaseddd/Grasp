// Code attached to elements: Add code puts a link on the selected element whose path shows in the box's code
// compartment, the export holds the link as a textual representation (rep) with its text, and Remove is one undo step
// that Ctrl+Z takes back.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { exportText, finish, launch, openCanvas, placeElement, rename, until } from './helpers.mjs';

/** Adds a code link to the selected element `el` and types its path; returns the link's row in #code-list. */
async function addCodeLink(page, el, path) {
  const before = await page.locator('#code-list li.code-link').count();
  await page.click('#add-code');
  await until(page, (count) => document.querySelectorAll('#code-list li.code-link').length > count, before, 'a code link row appears');
  const row = page.locator('#code-list li.code-link').last();
  await row.locator('input.code-path').fill(path);
  await until(page, ([id, p]) => document.querySelector(`g[data-el="${id}"]`)?.textContent.includes(p), [el, path], 'the box shows the path');
  return row;
}

describe('code links', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('Add code adds a link whose path shows in the box\'s code compartment', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const el = await placeElement(page, 'PartDefinition');
    await rename(page, el, 'Loader');
    assert.ok(await page.locator('#code').isVisible(), 'the code section shows for an element');
    assert.ok(await page.locator('#code-empty').isVisible(), 'and says there is no code yet');
    await addCodeLink(page, el, 'app/src/host/load-app.ts');
    assert.equal(await page.locator('#code-list li.code-link').count(), 1, 'the panel lists the link');
    const heads = await page.locator(`g[data-el="${el}"] text.head-c`).allTextContents();
    assert.ok(heads.includes('code'), `the box has a code compartment: ${JSON.stringify(heads)}`);
    assert.match(await page.locator(`g[data-el="${el}"]`).first().textContent(), /load-app\.ts/, 'with the path');
    assert.match(await page.textContent('#status'), /Added a code link/);
    await page.focus('#canvas');
    await page.keyboard.press('Escape');
    await until(page, () => !document.querySelector('#inspector-empty').hidden, null, 'the selection is cleared');
    assert.ok(await page.locator('#code').isHidden(), 'the code section hides when no element is selected');
    await finish(ctx);
  });

  test('the export holds the link as a rep with its language and text, a star-slash written * /', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const el = await placeElement(page, 'PartDefinition');
    await rename(page, el, 'Loader');
    const row = await addCodeLink(page, el, 'app/src/host/load-app.ts');
    await row.locator('select.code-language').selectOption('typescript');
    await row.locator('textarea.code-text').fill('export function loadApp() {}\n// ends with */ here');
    const text = await exportText(page);
    assert.match(text, /rep 'app\/src\/host\/load-app\.ts' language "typescript"/, 'the rep names the path and the language');
    assert.ok(text.includes(' * export function loadApp() {}'), `the text is in the block:\n${text}`);
    assert.ok(text.includes('* / here'), 'a star-slash in the text is written * /');
    assert.ok(!text.includes('*/ here'), 'and not as it was');
    await finish(ctx);
  });

  test('Remove takes the link off the box and the panel, and Ctrl+Z brings it back', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const el = await placeElement(page, 'PartDefinition');
    const row = await addCodeLink(page, el, 'hosts/README.md');
    await row.locator('button.code-remove').click();
    await until(page, (id) => !document.querySelector(`g[data-el="${id}"]`)?.textContent.includes('README'), el, 'the compartment is gone');
    assert.equal(await page.locator('#code-list li.code-link').count(), 0, 'the panel lists no link');
    assert.match(await page.getAttribute('#undo', 'title'), /Undo: Removed the code link hosts\/README\.md/, 'Undo names the removal');
    await page.focus('#canvas');
    await page.keyboard.press('Control+z');
    await until(page, (id) => document.querySelector(`g[data-el="${id}"]`)?.textContent.includes('README'), el, 'the compartment is back');
    assert.equal(await page.locator('#code-list li.code-link').count(), 1, 'and so is the link in the panel');
    assert.equal(await page.inputValue('#code-list li.code-link input.code-path'), 'hosts/README.md');
    await finish(ctx);
  });
});
