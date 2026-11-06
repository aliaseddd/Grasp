// The grid view: a new one has no rows and no tool of its own; Show all makes a row of every element in one undo step
// and the export gains the table's rendering; clicking a row selects its element; a column can be unticked and a header
// sorts the rows; matrix mode puts the relationship between two elements in their cell; a start node, which has no name,
// goes by its label; the fixture's table and matrix load from a state file.

import assert from 'node:assert/strict';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { embeddedModel, exportText, finish, launch, openCanvas, until } from './helpers.mjs';

const FIXTURE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'grid.json');
const ACTIONS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'behavior-actions.json'); // holds a start and a done node
const COUNT = embeddedModel().elements.length; // how many rows Show all makes of the saved model
const rows = (id) => `#drawing g.frame[data-view="${id}"] g.grid-row[data-el]`;
const heads = (id, col) => `#drawing g.frame[data-view="${id}"] g[data-action="sort"]${col ? `[data-for="${col}"]` : ''}`;

async function addView(page, kind) {
  const before = await page.locator('#drawing g.frame[data-view]').count();
  await page.selectOption('#new-view-kind', kind);
  await page.click('#new-view');
  await until(page, (count) => document.querySelectorAll('#drawing g.frame[data-view]').length > count, before, 'a new frame appears');
  return page.getAttribute('#drawing g.frame.is-active', 'data-view');
}

/** Clicks Show all for the selected grid view and waits for a row per element of the saved model. */
async function showAll(page, id) {
  await page.click('#grid-show-all');
  await until(page, ([vid, count]) => document.querySelectorAll(`#drawing g.frame[data-view="${vid}"] g.grid-row[data-el]`).length === count, [id, COUNT], 'every element is a row');
}

describe('grid view', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('a new grid view has no rows and no tool of its own, and the panel shows its options', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const id = await addView(page, 'GridView');
    assert.equal(await page.locator('.palette button[data-tool]:not([data-tool="Note"])').count(), 0, 'no element or relationship tool');
    assert.equal(await page.locator(rows(id)).count(), 0, 'no rows yet');
    assert.match(await page.textContent(`#drawing g.frame[data-view="${id}"]`), /No rows yet/, 'the frame says so');
    assert.equal(await page.locator(heads(id)).count(), 6, 'the six default columns have their headers');
    assert.ok(await page.locator('.view-options[data-view-kind="GridView"]').isVisible(), 'the grid options show for the view');
    assert.equal(await page.inputValue('#grid-mode'), 'table');
    assert.equal(await page.locator('#grid-columns .grid-column:checked').count(), 6, 'the default columns are ticked');
    assert.equal(await page.locator('#grid-columns .grid-column[value="code"]').count(), 1, 'the code column is offered');
    assert.match(await page.textContent('#v-meta'), /^0 elements shown/);
    await finish(ctx);
  });

  test('Show all makes a row of every element in one undo step, and the export renders the view as a table', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const id = await addView(page, 'GridView');
    await showAll(page, id);
    assert.equal(await page.locator(rows(id)).count(), COUNT);
    assert.match(await page.textContent('#v-meta'), new RegExp(`^${COUNT} elements shown`));
    assert.match(await page.textContent('#status'), /Showed every element/);
    assert.match(await page.getAttribute('#undo', 'title'), /^Undo: Showed every element/, 'one undo step');
    assert.ok(await page.locator('#grid-show-all').isDisabled(), 'nothing is left to show');
    const text = await exportText(page);
    assert.match(text, /view view1 : StandardViewDefinitions::GridView \{\s+expose StrongholdProof::\*::\*\*;\s+render Views::asElementTable;\s+\}/,
      'the view exposes everything and renders as the element table');
    await page.click('#close-export');
    await page.click('#undo');
    await until(page, (vid) => document.querySelectorAll(`#drawing g.frame[data-view="${vid}"] g.grid-row[data-el]`).length === 0, id, 'the rows are gone after one undo');
    await finish(ctx);
  });

  test('clicking a row selects its element and the panel shows its fields', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const id = await addView(page, 'GridView');
    await showAll(page, id);
    await page.click('#zoom-fit');
    await page.locator(`#drawing g.frame[data-view="${id}"] g[data-el="Host"]`).click();
    await until(page, (vid) => document.querySelector(`#drawing g.frame[data-view="${vid}"] g[data-el="Host"]`)?.classList.contains('is-selected'), id, 'the Host row is selected');
    assert.ok(await page.locator('#fields').isVisible(), 'the panel shows the element fields');
    assert.match(await page.textContent('#f-kind'), /part def Host/);
    assert.equal(await page.inputValue('#f-name'), 'Host');
    assert.ok(await page.isChecked('#f-abstract'), 'Host is abstract');
    assert.match(await page.textContent('#f-views'), /view1/, 'the panel says the grid shows it');
    assert.equal(await page.getAttribute('#drawing g.frame.is-active', 'data-view'), id, 'the grid view is active');
    await finish(ctx);
  });

  test('unticking a column takes it out of the table, and a header sorts the rows', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const id = await addView(page, 'GridView');
    await showAll(page, id);
    const pageRow = `#drawing g.frame[data-view="${id}"] g[data-el="Page"]`;
    assert.equal(await page.locator(heads(id, 'doc')).count(), 1, 'the doc column has a header');
    assert.match(await page.textContent(pageRow), /SharePoint/, 'the doc column shows the doc');
    await page.uncheck('#grid-columns .grid-column[value="doc"]');
    await until(page, (vid) => !document.querySelector(`#drawing g.frame[data-view="${vid}"] g[data-action="sort"][data-for="doc"]`), id, 'the doc header is gone');
    assert.equal(await page.locator(heads(id)).count(), 5, 'five columns are left');
    assert.doesNotMatch(await page.textContent(pageRow), /SharePoint/, 'the row lost its doc cell');
    assert.match(await page.getAttribute('#undo', 'title'), /Removed the doc column/);
    const order = () => page.$$eval(rows(id), (groups) => groups.map((g) => g.getAttribute('data-el')));
    await page.click('#zoom-fit');
    await page.locator(heads(id, 'name')).click();
    await until(page, (vid) => /▲/.test(document.querySelector(`#drawing g.frame[data-view="${vid}"] g[data-action="sort"][data-for="name"]`)?.textContent || ''), id, 'the name header shows the sort');
    let ids = await order();
    assert.ok(ids.indexOf('App') < ids.indexOf('Page') && ids.indexOf('DevHost') < ids.indexOf('Host'), `sorted by name: ${ids.join(', ')}`);
    await page.locator(heads(id, 'name')).click();
    await until(page, (vid) => /▼/.test(document.querySelector(`#drawing g.frame[data-view="${vid}"] g[data-action="sort"][data-for="name"]`)?.textContent || ''), id, 'the name header shows the sort reversed');
    ids = await order();
    assert.ok(ids.indexOf('Page') < ids.indexOf('App'), `sorted by name, descending: ${ids.join(', ')}`);
    assert.match(await page.textContent('#status'), /descending/);
    await finish(ctx);
  });

  test('matrix mode puts the relationship between two elements in their cell', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const id = await addView(page, 'GridView');
    await showAll(page, id);
    await page.selectOption('#grid-mode', 'matrix');
    await until(page, (vid) => document.querySelectorAll(`#drawing g.frame[data-view="${vid}"] g[data-col]`).length > 0, id, 'the matrix has cells');
    const cell = (row, col) => page.textContent(`#drawing g.frame[data-view="${id}"] g[data-el="${row}"] g[data-col="${col}"] text`);
    assert.equal(await cell('ServerHost', 'Host'), ':>', 'ServerHost specializes Host');
    assert.equal(await cell('Page.hosts', 'Host'), ':', 'hosts is defined by Host');
    assert.equal(await cell('Page.hosts.api', 'Page.app.api'), '—', 'the connection mount joins the two ports');
    assert.equal(await page.locator(rows(id)).count(), COUNT, 'every element is still a row');
    assert.ok(await page.locator('#grid-columns .grid-column[value="doc"]').isDisabled(), 'the table\'s columns are idle in a matrix');
    assert.match(await page.textContent('#status'), /matrix/);
    const text = await exportText(page);
    assert.match(text, /view view1 : StandardViewDefinitions::GridView \{\s+expose StrongholdProof::\*::\*\*;\s+\}/, 'a matrix exposes without the table rendering');
    await finish(ctx);
  });

  test('a start or done node, which has no name, goes by its label in the table and in a matrix row header, as in a browser', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await page.setInputFiles('#import-file', ACTIONS);
    await until(page, () => !!document.querySelector('#drawing g.frame[data-view="v-release"] g[data-el="Release.start"]'), null, 'the release flow is drawn');
    const id = await addView(page, 'GridView');
    await page.click('#grid-show-all');
    await until(page, (vid) => !!document.querySelector(`#drawing g.frame[data-view="${vid}"] g.grid-row[data-el="Release.start"]`), id, 'the start node has a row');
    const cells = (elId) => page.$$eval(`#drawing g.frame[data-view="${id}"] g.grid-row[data-el="${elId}"] text.grid-cell`, (ts) => ts.map((t) => t.textContent));
    assert.deepEqual(await cells('Release.start'), ['start', 'start', 'Release'], 'the kind and the name columns both say start, the owner column Release; an empty column draws no cell');
    assert.deepEqual(await cells('Release.done'), ['done', 'done', 'Release']);
    assert.ok(!(await page.textContent(`#drawing g.frame[data-view="${id}"]`)).includes('(unnamed)'), 'nothing in the table is (unnamed)');
    await page.selectOption('#grid-mode', 'matrix');
    await until(page, (vid) => document.querySelector(`#drawing g.frame[data-view="${vid}"] g.grid-row[data-el="Release.start"] text.grid-name`)?.textContent === 'Release.start', id, 'the matrix row header is the start node\'s path by its label');
    await finish(ctx);
  });

  test('the grid fixture loads with its table, its matrix, and its notes pinned on a row and beside the table', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await page.setInputFiles('#import-file', FIXTURE);
    await until(page, () => document.querySelectorAll('#drawing g.frame[data-view]').length === 3, null, 'the three views of the fixture are drawn');
    assert.equal(await page.locator(rows('v-table')).count(), COUNT, 'the table has a row per element');
    assert.equal(await page.locator(rows('v-matrix')).count(), 7, 'the matrix has the seven definitions');
    assert.equal(await page.textContent('#drawing g.frame[data-view="v-matrix"] g[data-el="OnlineHost"] g[data-col="Host"] text'), ':>');
    assert.equal(await page.locator('#drawing g.pin[data-note="n-host-package"][data-view="v-table"]').count(), 1, 'the note on Host is pinned on its row');
    assert.equal(await page.locator('#drawing g.pin[data-note="n-mount-interface"][data-view="v-table"]').count(), 1, 'the note on the connection is pinned beside the table, whose rows hold both ends');
    assert.equal(await page.locator('#drawing g.pin[data-note="n-mount-interface"][data-view="v-matrix"]').count(), 0, 'and not on the matrix, which shows neither end');
    const text = await exportText(page);
    assert.match(text, /view elementTable : StandardViewDefinitions::GridView \{[^}]*render Views::asElementTable;/);
    assert.match(text, /view definitionMatrix : StandardViewDefinitions::GridView \{\s+doc[^}]*expose StrongholdProof::Page;/);
    assert.equal((text.match(/render Views::asElementTable;/g) || []).length, 1, 'only the table renders as a table');
    await finish(ctx);
  });
});
