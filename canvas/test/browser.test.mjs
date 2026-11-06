// The browser view: the whole model as a tree of rows, where an element that is in no other view can still be found. A
// new BrowserView lists every element and relationship of the proof model as rows and offers no tools and no Show list,
// and exports as the package exposed recursively, rendered as a tree; clicking a row selects the element in every
// frame; the disclosure folds a part def's insides as one undo step, and Expand all unfolds; an element taken out of
// the general view keeps its row; the roots option narrows the tree and the export exposes each root recursively.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { clickElement, embeddedModel, exportText, finish, launch, openCanvas, placeElement, rename, until } from './helpers.mjs';

const SAVED = 'v-proof'; // the view the embedded model saves

async function addView(page, kind) {
  const before = await page.locator('#drawing g.frame[data-view]').count();
  await page.selectOption('#new-view-kind', kind);
  await page.click('#new-view');
  await until(page, (count) => document.querySelectorAll('#drawing g.frame[data-view]').length > count, before, 'a new frame appears');
  return page.getAttribute('#drawing g.frame.is-active', 'data-view');
}

/** The ids of the element rows (g.el[data-el]) drawn in the frame of view `id`, top to bottom. */
const rowIds = (page, id) => page.$$eval(`#drawing g.frame[data-view="${id}"] g.el[data-el]`, (groups) => groups.map((g) => g.getAttribute('data-el')));
/** The ids of the relationship rows (g.rel[data-rel]) drawn in the frame of view `id`, top to bottom. */
const relRowIds = (page, id) => page.$$eval(`#drawing g.frame[data-view="${id}"] g.rel[data-rel]`, (groups) => groups.map((g) => g.getAttribute('data-rel')));

describe('browser view', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('a new BrowserView lists every element and relationship as a row, offers no tools and no Show list, and exports the package as a tree', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const model = embeddedModel();
    const id = await addView(page, 'BrowserView');
    const rows = await rowIds(page, id);
    assert.equal(rows.length, model.elements.length, 'one row per element of the model');
    assert.deepEqual(new Set(rows), new Set(model.elements.map((e) => e.id)), 'every element has its row');
    assert.equal((await relRowIds(page, id)).length, model.relationships.length, 'one row per relationship, the hidden defined-by lines included');
    assert.equal(await page.locator('.palette button[data-tool]:not([data-tool="Note"])').count(), 0, 'no element or relationship tool');
    assert.ok(await page.locator('#v-show').isDisabled(), 'the Show list offers nothing');
    assert.match(await page.textContent('#v-show'), /every element/, 'and says the view shows everything');
    assert.match(await page.textContent('#v-meta'), new RegExp(`^${model.elements.length} elements shown`));
    assert.match(await exportText(page), /view view\d+ : StandardViewDefinitions::BrowserView \{\s+expose StrongholdProof::\*::\*\*;\s+render Views::asTreeDiagram;\s+\}/,
      'the export exposes the whole package and renders it as a tree');
    await finish(ctx);
  });

  test('clicking a row selects the element in the browser and in the general view, and the panel shows it', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const id = await addView(page, 'BrowserView');
    await page.locator(`#drawing g.frame[data-view="${id}"] g.el[data-el="Host"]`).click();
    await until(page, () => document.querySelectorAll('g[data-el="Host"].is-selected').length === 2, null, 'the row and the general view\'s box of Host are both selected');
    assert.equal(await page.locator(`#drawing g.frame[data-view="${SAVED}"] g[data-el="Host"].is-selected`).count(), 1, 'the box in the general view is selected too');
    assert.equal(await page.textContent('#f-kind'), 'part def Host');
    assert.ok(await page.locator('#f-abstract').isChecked(), 'the panel shows Host as abstract');
    assert.match(await page.textContent('#f-views'), /proofStructure/, 'the panel says where else Host is shown');
    assert.match(await page.textContent('.eyebrow'), /browser view/, 'the browser view is the active one');
    await finish(ctx);
  });

  test('the disclosure folds a part def, hiding what is inside it, as one undo step; Expand all unfolds it', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const id = await addView(page, 'BrowserView');
    const all = (await rowIds(page, id)).length;
    const toggle = page.locator(`#drawing g.frame[data-view="${id}"] g.browser-toggle[data-for="Page"]`);
    await toggle.click();
    await until(page, (vid) => !document.querySelector(`#drawing g.frame[data-view="${vid}"] g.el[data-el="Page.hosts"]`), id, 'the rows inside Page are gone');
    const folded = await rowIds(page, id);
    assert.equal(folded.length, all - 4, 'the two parts in Page and their two ports are hidden');
    assert.ok(folded.includes('Page'), 'Page itself stays');
    assert.ok(!(await relRowIds(page, id)).includes('mount'), 'the connection declared in Page is hidden with it');
    assert.match(await page.getAttribute('#undo', 'title'), /^Undo: Folded part def Page/, 'folding is one undo step');
    assert.match(await page.textContent('#status'), /Folded part def Page/);
    await page.click('#undo');
    await until(page, (vid) => !!document.querySelector(`#drawing g.frame[data-view="${vid}"] g.el[data-el="Page.hosts"]`), id, 'undo unfolds Page');
    assert.equal((await rowIds(page, id)).length, all, 'every row is back');
    await toggle.click();
    await until(page, (vid) => !document.querySelector(`#drawing g.frame[data-view="${vid}"] g.el[data-el="Page.hosts"]`), id, 'Page is folded again');
    assert.ok(await page.locator('#browser-expand-all').isEnabled(), 'Expand all is offered while something is folded');
    await page.click('#browser-expand-all');
    await until(page, (vid) => !!document.querySelector(`#drawing g.frame[data-view="${vid}"] g.el[data-el="Page.hosts"]`), id, 'Expand all unfolds Page');
    assert.match(await page.getAttribute('#undo', 'title'), /^Undo: Unfolded everything/);
    assert.ok(await page.locator('#browser-expand-all').isDisabled(), 'Expand all has nothing left to do');
    await finish(ctx);
  });

  test('an element taken out of the general view keeps its row in the browser, which refuses to take anything out', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    // Placed while the general view is the only frame (the helper counts g[data-el] over the whole drawing, and a
    // browser view would draw the new element a second time, as a row).
    const id = await placeElement(page, 'PartDefinition');
    await rename(page, id, 'Hidden');
    const tree = await addView(page, 'BrowserView');
    assert.equal(await page.locator(`#drawing g.frame[data-view="${tree}"] g.el[data-el="${id}"]`).count(), 1, 'the new part def has a row in the browser at once');
    // Back in the general view: selecting the box there makes that view active, and Remove from view takes it out of it.
    await clickElement(page, id);
    await until(page, ([vid, elId]) => document.querySelector(`#drawing g.frame[data-view="${vid}"] g[data-el="${elId}"]`)?.classList.contains('is-selected'), [SAVED, id], 'the box is selected in the general view');
    await page.click('#remove-from-view');
    await until(page, ([vid, elId]) => !document.querySelector(`#drawing g.frame[data-view="${vid}"] g[data-el="${elId}"]`), [SAVED, id], 'the box is gone from the general view');
    assert.equal(await page.locator(`#drawing g.frame[data-view="${tree}"] g.el[data-el="${id}"]`).count(), 1, 'its row in the browser stays');
    assert.match(await page.textContent('#f-views'), /^Shown in view\d+$/, 'the panel says the browser view is the only one showing it');
    assert.match(await page.textContent('#status'), /stays in the model/);
    // The row is the way back to it, and the browser itself gives nothing up.
    await page.locator(`#drawing g.frame[data-view="${tree}"] g.el[data-el="${id}"]`).click();
    await until(page, (vid) => document.querySelector(`#drawing g.frame[data-view="${vid}"]`)?.classList.contains('is-active'), tree, 'clicking the row makes the browser view active');
    await page.click('#remove-from-view');
    await until(page, () => /shows every element/.test(document.querySelector('#status').textContent), null, 'the browser refuses Remove from view');
    assert.equal(await page.locator(`#drawing g.frame[data-view="${tree}"] g.el[data-el="${id}"]`).count(), 1, 'the row is still there');
    await finish(ctx);
  });

  test('the roots option narrows the tree to the chosen subtrees, one undo step, and the export exposes each root recursively', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const id = await addView(page, 'BrowserView');
    assert.deepEqual(await page.$$eval('#browser-roots option', (options) => options.filter((o) => o.selected).map((o) => o.value)), [''], 'the whole package starts selected');
    await page.selectOption('#browser-roots', ['Page', 'Host']);
    await until(page, (vid) => !document.querySelector(`#drawing g.frame[data-view="${vid}"] g.el[data-el="App"]`), id, 'App, under no root, is gone');
    assert.deepEqual(await rowIds(page, id), ['Page', 'Page.hosts', 'Page.hosts.api', 'Page.app', 'Page.app.api', 'Host', 'Host.api'], 'the rows are the two subtrees, in model order');
    assert.deepEqual(await relRowIds(page, id), ['mount', 't-hosts'], 'the connection under Page, then the package\'s defined-by whose ends are both rows');
    assert.match(await page.getAttribute('#undo', 'title'), /^Undo: Set the roots of view view\d+ to part def Page, part def Host/);
    assert.match(await exportText(page), /view view\d+ : StandardViewDefinitions::BrowserView \{\s+expose StrongholdProof::Page::\*\*;\s+expose StrongholdProof::Host::\*\*;\s+render Views::asTreeDiagram;\s+\}/,
      'the export exposes each root with everything inside it');
    await page.click('#undo');
    await until(page, (vid) => !!document.querySelector(`#drawing g.frame[data-view="${vid}"] g.el[data-el="App"]`), id, 'undo shows the whole package again');
    await finish(ctx);
  });
});
