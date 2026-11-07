// Several views on one plane: New view adds a second frame of the chosen kind, active and selected, with that kind's
// palette; back on the general view a part def still goes in; Remove from view takes an element off the drawing but
// not out of the export; Delete view takes the frame away and leaves its elements in the model.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { emptyPointIn, exportText, finish, launch, openCanvas, placeElement, rename, until } from './helpers.mjs';

const SAVED = 'v-proof'; // the view the embedded model saves

async function addView(page, kind) {
  const before = await page.locator('#drawing g.frame[data-view]').count();
  await page.selectOption('#new-view-kind', kind);
  await page.click('#new-view');
  await until(page, (count) => document.querySelectorAll('#drawing g.frame[data-view]').length > count, before, 'a new frame appears');
  return page.getAttribute('#drawing g.frame.is-active', 'data-view');
}

describe('views', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('New view adds a second frame of the chosen kind, active and selected, with its own empty palette', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    assert.equal(await page.locator('#drawing g.frame[data-view]').count(), 1, 'the saved model has one frame');
    assert.equal(await page.getAttribute('#drawing g.frame.is-active', 'data-view'), SAVED, 'the saved view starts active');
    assert.ok((await page.locator('.palette button[data-tool]').count()) >= 7, 'the general view offers its tools');
    const id = await addView(page, 'InterconnectionView');
    assert.notEqual(id, SAVED, 'the new frame is the active one');
    assert.equal(await page.locator(`#drawing g.frame[data-view="${id}"].is-selected`).count(), 1, 'the new view is selected');
    assert.ok(await page.locator('#view-fields').isVisible(), 'the panel shows the view fields');
    assert.equal(await page.textContent('#v-kind'), 'InterconnectionView');
    assert.match(await page.inputValue('#v-name'), /^view\d+$/, 'the view gets a free name');
    assert.match(await page.textContent('.eyebrow'), /interconnection view/);
    assert.match(await page.textContent(`#drawing g.frame[data-view="${id}"]`), /InterconnectionView/, 'the frame tab names the kind');
    // A kind that keeps tools: [] (the grid view) gets no buttons of its own; the free tools (the Note tool, once a slice
    // adds it) are in every palette, so they don't count.
    await addView(page, 'GridView');
    assert.equal(await page.locator('.palette button[data-tool]:not([data-tool="Note"])').count(), 0, 'a grid view has no tools of its own');
    assert.ok(await page.locator('#undo').isEnabled(), 'making a view can be undone');
    await finish(ctx);
  });

  test('back on the general view, its palette is back and a part def goes into its frame', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await addView(page, 'InterconnectionView');
    await page.locator(`#drawing g.frame[data-view="${SAVED}"] rect.tab`).click();
    await until(page, (id) => document.querySelector(`#drawing g.frame[data-view="${id}"]`)?.classList.contains('is-active'), SAVED, 'the general view is active again');
    assert.equal(await page.locator('.palette button[data-tool="PartDefinition"]').count(), 1, 'its palette is back');
    assert.match(await page.textContent('.eyebrow'), /general view · proofStructure/);
    const id = await placeElement(page, 'PartDefinition', await emptyPointIn(page, SAVED));
    assert.equal(await page.locator(`#drawing g.frame[data-view="${SAVED}"] g[data-el="${id}"]`).count(), 1, 'the part def is drawn in the general view');
    assert.match(await page.textContent('#f-views'), /proofStructure/, 'the panel says where it is shown');
    await finish(ctx);
  });

  test('Remove from view takes an element off the drawing but keeps it in the export', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const id = await placeElement(page, 'PartDefinition');
    await rename(page, id, 'Kept');
    await page.click('#remove-from-view');
    await until(page, (elId) => !document.querySelector(`g[data-el="${elId}"]`), id, 'the element is no longer drawn');
    assert.match(await page.textContent('#f-views'), /no view/i, 'the panel says it is shown in no view');
    assert.match(await page.textContent('#status'), /stays in the model/);
    assert.match(await exportText(page), /\bpart def Kept\b/, 'the export still has it');
    await finish(ctx);
  });

  test('Delete view takes the frame away and keeps its elements in the export', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await addView(page, 'GeneralView');
    await page.locator(`#drawing g.frame[data-view="${SAVED}"] rect.tab`).click();
    await until(page, (id) => document.querySelector(`#drawing g.frame[data-view="${id}"]`)?.classList.contains('is-selected'), SAVED, 'the saved view is selected');
    await page.click('#delete-view');
    await until(page, () => document.querySelectorAll('#drawing g.frame[data-view]').length === 1, null, 'one frame is left');
    assert.equal(await page.locator('g[data-el="Page"]').count(), 0, 'the elements of the deleted view are no longer drawn');
    assert.match(await page.textContent('#status'), /stay in the model/);
    assert.match(await exportText(page), /\bpart def Page\b/, 'the export keeps the elements');
    await finish(ctx);
  });
});
