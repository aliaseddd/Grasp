// The shared selection, in the page (plan/slice-1.md, step 9, "Done when"; plan/swarm/step-9.md, section 4): the plan's
// six tests, under the plan's own words, and four more that need every part of the step together: a plane, the Explorer
// and the dock. Each opens the built page from file:// and picks as a person does: clicks, Ctrl, Shift with a drag, the
// keyboard. A test finds what it reads as section 3 of step-9.md says, and asserts what that contract says.

import assert from 'node:assert/strict';
import { after, afterEach, before, describe, test } from 'node:test';
import { scaleState } from '../../test/scale-model.mjs';
import {
  boxOf, byTestId, closePages, cssColor, EDGE, EXAMPLE, finish, frame, headerOf, launch, linesOf, modelOf, openIn,
  openPage, openStateFile, planeOf, rectsOf, rowIn, rowItemIn, rowOf, selectBox, showSide, showView, soon, stateFileAt, stateFileOf,
  TEAL, TEN, TESTIDS, untilDrawn, viewTab,
} from './helpers.mjs';

const EX = modelOf(EXAMPLE);
const VIEW = EX.views[0];
const LINES = linesOf(EX, VIEW).length;
const FIXTURE = (name) => TEN.find((file) => file.endsWith(`${name}.json`));
const IC_FILE = FIXTURE('interconnection');
const IC = modelOf(IC_FILE);
const BROWSER = modelOf(FIXTURE('browser'));
const viewOf = (model, id) => model.views.find((view) => view.id === id);
const EXPLORER = byTestId(TESTIDS.explorer);
const EDGE_OF = (view, id) => `${planeOf(view.id)} ${EDGE}[data-id=${JSON.stringify(id)}]`;

// The three small helpers of step-9.md, section 4.

/** The ids of the plane's selected nodes and of its selected lines, each in document order. */
const selectedIn = (page, view) => page.evaluate((plane) => ({
  nodes: [...document.querySelectorAll(`${plane} .react-flow__node.selected`)].map((el) => el.getAttribute('data-id')),
  edges: [...document.querySelectorAll(`${plane} .react-flow__edge.selected`)].map((el) => el.getAttribute('data-id')),
}), planeOf(view.id));
/** The data-row of every row whose tree item has aria-selected "true", in document order. */
const selectedRows = (page) => page.evaluate((root) => [...document.querySelectorAll(`${root} [role="treeitem"][aria-selected="true"]`)]
  .map((item) => item.querySelector('[data-row]').getAttribute('data-row')), EXPLORER);
/** The data-row of every row in the Explorer, in document order. */
const rowsNow = (page) => page.evaluate((root) => [...document.querySelectorAll(`${root} [data-row]`)].map((el) => el.getAttribute('data-row')), EXPLORER);

// What only this file needs.

/** A row's id, "<type>:<id>", as its type and its id (an id may hold colons). */
const rowParts = (row) => { const at = row.indexOf(':'); return [row.slice(0, at), row.slice(at + 1)]; };

/** Waits for a row of the Explorer to be in the document, and fails with the sentence of the tree not being built. */
async function untilRow(page, type, id = '', what = id || type) {
  await soon(page, async () => (await rowIn(page, type, id).count()) > 0,
    `The Explorer has no row for ${what} (data-row "${type}:${id}"): its tree is not built.`);
}

/** Waits until exactly these rows (their ids, in any order) are the selected ones, after waiting for each to be there. */
async function untilSelectedRows(page, expected, what) {
  for (const row of expected) {
    const [type, id] = rowParts(row);
    await untilRow(page, type, id);
  }
  const wanted = [...expected].sort();
  await soon(page, async () => JSON.stringify((await selectedRows(page)).sort()) === JSON.stringify(wanted),
    async () => `${what}: the Explorer's selected rows are ${JSON.stringify(await selectedRows(page))}, not ${JSON.stringify(wanted)}.`);
}

/** Waits until the plane's selected nodes and lines are exactly these (in any order). */
async function untilSelectedOn(page, view, nodes, edges, what) {
  const wanted = JSON.stringify([[...nodes].sort(), [...edges].sort()]);
  await soon(page, async () => { const now = await selectedIn(page, view); return JSON.stringify([[...now.nodes].sort(), [...now.edges].sort()]) === wanted; },
    async () => { const now = await selectedIn(page, view); return `${what}: the plane of ${view.name} has the nodes ${JSON.stringify(now.nodes)} and the lines ${JSON.stringify(now.edges)} selected, not ${wanted}.`; });
}

/** Clicks a row of the Explorer, with the keys held that are named (Control, Meta, Shift). */
async function clickRow(page, type, id, modifiers = []) {
  await untilRow(page, type, id);
  await rowIn(page, type, id).click({ modifiers });
}

/** Clicks a row's fold control. */
async function clickFold(page, type, id) {
  await untilRow(page, type, id);
  await rowIn(page, type, id).locator('.grasp-row-icon').click();
}

/** A click on a box's header on its plane, with Control held or not. */
async function clickBox(page, view, id, { control = false } = {}) {
  const box = await boxOf(page, view.id, id);
  assert.ok(box, `The plane of ${view.name} draws no node for ${id}.`);
  const at = headerOf(box);
  if (control) await page.keyboard.down('Control');
  try {
    await page.mouse.click(at.x, at.y);
  } finally {
    if (control) await page.keyboard.up('Control');
  }
}

/** The point at half the length of a line on its plane, where a click picks it. */
async function middleOf(page, view, id) {
  const mid = await page.evaluate((selector) => {
    const path = document.querySelector(`${selector} path.grasp-line`);
    if (!path) return null;
    const p = path.getPointAtLength(path.getTotalLength() / 2);
    const q = new DOMPoint(p.x, p.y).matrixTransform(path.getScreenCTM());
    return { x: q.x, y: q.y };
  }, EDGE_OF(view, id));
  assert.ok(mid, `The line ${id} has no path.grasp-line.`);
  return mid;
}

/** Closes a view's tab by its close control, which shows when the pointer is on the tab. */
async function closeTab(page, view) {
  const tab = await viewTab(page, view);
  await tab.hover();
  const close = tab.locator('.dv-default-tab-action');
  await soon(page, async () => (await close.count()) > 0, `The tab "${view.name} : ${view.kind}" has no close control (class dv-default-tab-action).`);
  await close.first().click();
  await soon(page, async () => (await page.getByRole('tab', { name: `${view.name} : ${view.kind}`, exact: true }).count()) === 0,
    `The close control of "${view.name} : ${view.kind}" was clicked and its tab is still there.`);
}

/** Whether a view's tab is in front of its group. */
const inFront = async (page, view) => (await (await viewTab(page, view)).getAttribute('aria-selected')) === 'true';

/** The data-row of every row whose tree item says aria-current "true". */
const currentRows = (page) => page.evaluate((root) => [...document.querySelectorAll(`${root} [role="treeitem"][aria-current="true"]`)]
  .map((item) => item.querySelector('[data-row]').getAttribute('data-row')), EXPLORER);

/** Waits until exactly these rows are marked as the view in front. */
const untilCurrent = (page, expected, what) => soon(page, async () => JSON.stringify(await currentRows(page)) === JSON.stringify(expected),
  async () => `${what}: the rows marked aria-current are ${JSON.stringify(await currentRows(page))}, not ${JSON.stringify(expected)}.`);

/** Whether the keyboard's focus is on a row's tree item. */
const focusedOn = (page, type, id) => rowItemIn(page, type, id).evaluate((item) => document.activeElement === item);

/** The same-sized point of a node's rectangle, 6 px right of and below its bottom right corner. */
const past = (rects, id) => ({ x: rects[id].x + rects[id].width + 6, y: rects[id].y + rects[id].height + 6 });

/** The ids of the nodes whose whole rectangle lies inside the rectangle between two points (edges included), and of the lines between them. */
function covered(rects, from, to, model, view) {
  const left = Math.min(from.x, to.x), right = Math.max(from.x, to.x), top = Math.min(from.y, to.y), bottom = Math.max(from.y, to.y);
  const nodes = Object.keys(rects).filter((id) => {
    const r = rects[id];
    return r.x >= left && r.x + r.width <= right && r.y >= top && r.y + r.height <= bottom;
  });
  const have = new Set(nodes);
  const rels = model.relationships.filter((rel) => linesOf(model, view).includes(rel.id) && have.has(rel.from) && have.has(rel.to)).map((rel) => rel.id);
  return { nodes, rels };
}

/** The Explorer's root rectangle and a row's, for what lies where. */
const rectsOfRow = (page, row) => page.evaluate(([root, selector]) => {
  const el = document.querySelector(selector);
  const r = document.querySelector(root).getBoundingClientRect();
  const q = el ? el.getBoundingClientRect() : null;
  return { root: { top: r.top, bottom: r.bottom }, row: q && { top: q.top, bottom: q.bottom } };
}, [EXPLORER, rowOf(...rowParts(row))]);

describe('the shared selection', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  /** The example opened, its view in front and drawn, and the Explorer shown. */
  async function openExample() {
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    await showView(opened.page, VIEW, LINES);
    await showSide(opened.page, 'Explorer');
    return opened;
  }

  test('a box picked on the plane is the selected row, and a row picked is the selected box', async () => {
    const opened = await openExample();
    const { page } = opened;
    await selectBox(page, VIEW, 'Host');
    await untilSelectedRows(page, ['el:Host'], 'A click on the box Host');
    assert.ok(await rowIn(page, 'el', 'Host').evaluate((el) => el.hasAttribute('data-selected')), 'The row el:Host is the selected row and has no attribute data-selected.');
    await clickRow(page, 'el', 'App');
    await untilSelectedOn(page, VIEW, ['App'], [], 'A click on the row el:App');
    await untilSelectedRows(page, ['el:App'], 'A click on the row el:App');
    await finish(opened);
  });

  test('a marquee selects what it covers', async () => {
    const opened = await openExample();
    const { page } = opened;
    const rects = await rectsOf(page, VIEW.id);
    const plane = await page.evaluate((selector) => {
      const b = document.querySelector(selector).getBoundingClientRect();
      const hit = document.elementFromPoint(b.x + 6, b.y + 6);
      return { x: b.x + 6, y: b.y + 6, ground: !!hit && hit.classList.contains('react-flow__pane') };
    }, planeOf(VIEW.id));
    assert.ok(plane.ground, 'The plane\'s top left corner, 6 px in each way, is not bare ground (class react-flow__pane).');
    const from = { x: plane.x, y: plane.y };
    const to = past(rects, 'Host');
    const { nodes, rels } = covered(rects, from, to, EX, VIEW);
    assert.ok(nodes.includes('Host') && nodes.includes('Page.hosts') && !nodes.includes('Page'), `The marquee should cover Host and Page.hosts and not Page, and covers ${nodes.join(', ')}.`);
    const rows = [...nodes.map((id) => `el:${id}`), ...rels.map((id) => `rel:${id}`)];

    await page.keyboard.down('Shift');
    try {
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      for (let step = 1; step <= 6; step++) {
        await page.mouse.move(from.x + (to.x - from.x) * step / 6, from.y + (to.y - from.y) * step / 6);
        await frame(page);
      }
      await soon(page, async () => (await page.locator(`${planeOf(VIEW.id)} .react-flow__selection`).count()) === 1,
        'With Shift held and the pointer dragged from the plane\'s corner to past Host, the plane draws no marquee (.react-flow__selection).');
      await untilSelectedOn(page, VIEW, nodes, rels, 'Before the release');
      await untilSelectedRows(page, rows, 'Before the release');
      await page.mouse.up();
    } finally {
      await page.keyboard.up('Shift');
    }
    for (let i = 0; i < 3; i++) await frame(page);
    await untilSelectedOn(page, VIEW, nodes, rels, 'After the release');
    await untilSelectedRows(page, rows, 'After the release');
    await finish(opened);
  });

  test('Ctrl + click adds', async () => {
    const opened = await openExample();
    const { page } = opened;
    await selectBox(page, VIEW, 'Host');
    await clickBox(page, VIEW, 'App', { control: true });
    await untilSelectedOn(page, VIEW, ['Host', 'App'], [], 'Ctrl + click on the box App');
    await untilSelectedRows(page, ['el:Host', 'el:App'], 'Ctrl + click on the box App');
    await clickRow(page, 'el', 'DevHost', ['Control']);
    await untilSelectedOn(page, VIEW, ['Host', 'App', 'DevHost'], [], 'Ctrl + click on the row el:DevHost');
    await untilSelectedRows(page, ['el:Host', 'el:App', 'el:DevHost'], 'Ctrl + click on the row el:DevHost');
    await clickRow(page, 'el', 'Host', ['Control']);
    await untilSelectedOn(page, VIEW, ['App', 'DevHost'], [], 'Ctrl + click on the picked row el:Host');
    await untilSelectedRows(page, ['el:App', 'el:DevHost'], 'Ctrl + click on the picked row el:Host');
    await finish(opened);
  });

  test('a line\'s row selects its line', async () => {
    const opened = await openExample();
    const { page } = opened;
    const teal = await cssColor(page, TEAL);
    await clickRow(page, 'rel', 'mount');
    await untilSelectedOn(page, VIEW, [], ['mount'], 'A click on the row rel:mount');
    const stroke = await page.evaluate((selector) => getComputedStyle(document.querySelector(`${selector} path.grasp-line`)).stroke, EDGE_OF(VIEW, 'mount'));
    assert.equal(stroke, teal, `The selected line mount is stroked ${stroke}, not teal (${teal}).`);
    await untilSelectedRows(page, ['rel:mount'], 'A click on the row rel:mount');
    const mid = await middleOf(page, VIEW, 't-hosts');
    await page.mouse.click(mid.x, mid.y);
    await untilSelectedRows(page, ['rel:t-hosts'], 'A click on the middle of the line t-hosts');
    await untilSelectedOn(page, VIEW, [], ['t-hosts'], 'A click on the middle of the line t-hosts');
    await finish(opened);
  });

  test('a closed tab opens again from its view\'s row', async () => {
    const opened = await openIn(browser, stateFileAt(FIXTURE('browser')));
    const { page } = opened;
    const proof = viewOf(BROWSER, 'v-proof');
    const tree = viewOf(BROWSER, 'v-tree');
    await showSide(page, 'Explorer');
    await closeTab(page, proof);
    await clickRow(page, 'view', 'v-proof');
    await soon(page, async () => (await page.getByRole('tab', { name: `${proof.name} : ${proof.kind}`, exact: true }).count()) === 1 && (await inFront(page, proof)),
      `A click on the row view:v-proof does not bring the tab of ${proof.name} back in front.`);
    await untilDrawn(page, proof);
    await untilSelectedRows(page, ['view:v-proof'], 'A click on the row view:v-proof');
    await soon(page, () => focusedOn(page, 'view', 'v-proof'), 'After a click on the row view:v-proof the keyboard\'s focus is not on its tree item.');
    await clickRow(page, 'view', 'v-tree');
    await soon(page, () => inFront(page, tree), `A click on the row view:v-tree does not bring the tab of ${tree.name} in front.`);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    const next = viewOf(BROWSER, 'v-page');
    await untilSelectedRows(page, ['view:v-page'], 'ArrowDown and Enter after the row view:v-tree');
    await soon(page, () => inFront(page, next), `ArrowDown and Enter on the row view:v-page do not bring the tab of ${next.name} in front.`);
    await finish(opened);
  });

  test('with the 5,000-element model only the package\'s row is unfolded, and a long list ends in "Show more"', async () => {
    const opened = await openIn(browser, stateFileOf('scale-5000.json', scaleState(5000)));
    const { page } = opened;
    await showSide(page, 'Explorer');
    await untilRow(page, 'more', 'package:', 'the end of the package\'s list');
    const rows = await rowsNow(page);
    assert.equal(rows.length, 202, `The Explorer has ${rows.length} rows, not 202.`);
    assert.equal(rows[0], 'package:');
    assert.ok(rows.slice(1, 4).every((row) => row.startsWith('view:')), `The three rows after the package's are ${rows.slice(1, 4).join(', ')}, not the views'.`);
    assert.equal(rows[201], 'more:package:');
    assert.equal(await rowItemIn(page, 'package').getAttribute('aria-expanded'), 'true', 'The package\'s row is not unfolded.');
    const unfolded = await page.evaluate((root) => document.querySelectorAll(`${root} [role="treeitem"][aria-expanded="true"]`).length, EXPLORER);
    assert.equal(unfolded, 1, `${unfolded} rows are unfolded, not the package's alone.`);
    assert.equal((await rowIn(page, 'more', 'package:').textContent()).trim(), 'Show more (3651 not shown)');
    assert.equal(await rowItemIn(page, 'more', 'package:').getAttribute('aria-selected'), null, 'The tree item of "Show more" has aria-selected.');

    await rowIn(page, 'more', 'package:').click();
    await soon(page, async () => (await rowsNow(page)).length === 402, async () => `A click on "Show more" leaves ${(await rowsNow(page)).length} rows, not 402.`);
    assert.equal((await rowIn(page, 'more', 'package:').textContent()).trim(), 'Show more (3451 not shown)');
    assert.deepEqual(await selectedRows(page), [], 'A click on "Show more" picked a row.');
    await soon(page, () => focusedOn(page, 'more', 'package:'), 'After a click on "Show more" the keyboard\'s focus is not on its tree item.');
    await page.keyboard.press('Enter');
    await soon(page, async () => (await rowsNow(page)).length === 602, async () => `Enter on "Show more" leaves ${(await rowsNow(page)).length} rows, not 602.`);
    await finish(opened);
  });

  test('the row of the view in front is marked, and follows the tabs', async () => {
    const opened = await openIn(browser, stateFileAt(IC_FILE));
    const { page } = opened;
    const one = viewOf(IC, 'v-ic');
    const two = viewOf(IC, 'v-defs');
    await showSide(page, 'Explorer');
    await untilRow(page, 'view', 'v-ic');
    await untilCurrent(page, ['view:v-ic'], 'As the file opens');
    const teal = await cssColor(page, TEAL);
    const colour = await rowIn(page, 'view', 'v-ic').locator('.grasp-row-name').evaluate((el) => getComputedStyle(el).color);
    assert.equal(colour, teal, `The name of the row of the view in front is ${colour}, not teal (${teal}).`);
    await (await viewTab(page, two)).click();
    await untilCurrent(page, ['view:v-defs'], 'A click on the tab of definitions');
    await clickRow(page, 'view', 'v-ic');
    await soon(page, () => inFront(page, one), 'A click on the row view:v-ic does not bring its tab in front.');
    await untilCurrent(page, ['view:v-ic'], 'A click on the row view:v-ic');
    await closeTab(page, one);
    await untilCurrent(page, ['view:v-defs'], 'After the tab of fuelSystem is closed');
    await closeTab(page, two);
    await untilCurrent(page, [], 'After both tabs are closed');
    await page.getByRole('button', { name: 'Show the views again', exact: true }).click();
    await untilCurrent(page, ['view:v-ic'], 'After "Show the views again"');
    await finish(opened);
  });

  test('the row of the view left in front is marked when a split group is closed', async () => {
    const opened = await openIn(browser, stateFileAt(IC_FILE));
    const { page } = opened;
    const one = viewOf(IC, 'v-ic');
    const two = viewOf(IC, 'v-defs');
    await untilDrawn(page, one);
    await showSide(page, 'Explorer');
    await untilCurrent(page, ['view:v-ic'], 'As the file opens');
    // The tab of definitions is dragged to the right edge of the editor, which splits it in two groups.
    const tab = await (await viewTab(page, two)).boundingBox();
    const plane = await page.evaluate((selector) => { const r = document.querySelector(selector).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, planeOf(one.id));
    await page.mouse.move(tab.x + tab.width / 2, tab.y + tab.height / 2);
    await page.mouse.down();
    for (let i = 1; i <= 15; i++) {
      await page.mouse.move(tab.x + tab.width / 2 + (plane.x + plane.w - 20 - tab.x - tab.width / 2) * i / 15, tab.y + tab.height / 2 + (plane.y + plane.h / 2 - tab.y - tab.height / 2) * i / 15);
      await frame(page);
    }
    await page.mouse.up();
    await soon(page, async () => (await (await viewTab(page, two)).boundingBox()).x > (await (await viewTab(page, one)).boundingBox()).x + tab.width,
      'The tab of definitions, dragged to the right edge of the editor, is not in a group of its own on the right.');
    await untilCurrent(page, ['view:v-defs'], 'After the tab of definitions is dropped on the right edge');
    await closeTab(page, two);
    await untilCurrent(page, ['view:v-ic'], 'After the tab of definitions, in a group of its own, is closed and the tab of fuelSystem is the one left');
    await finish(opened);
  });

  test('the row of the view left in front is marked when a floating group is closed', async () => {
    const opened = await openIn(browser, stateFileAt(IC_FILE));
    const { page } = opened;
    const one = viewOf(IC, 'v-ic');
    const two = viewOf(IC, 'v-defs');
    await untilDrawn(page, one);
    await showSide(page, 'Explorer');
    await untilCurrent(page, ['view:v-ic'], 'As the file opens');
    // The tab of definitions is dragged with Shift held, so it floats over the editor.
    const tab = await (await viewTab(page, two)).boundingBox();
    await page.keyboard.down('Shift');
    await page.mouse.move(tab.x + tab.width / 2, tab.y + tab.height / 2);
    await page.mouse.down();
    for (let i = 1; i <= 15; i++) {
      await page.mouse.move(tab.x + tab.width / 2 + 300 * i / 15, tab.y + tab.height / 2 + 250 * i / 15);
      await frame(page);
    }
    await page.mouse.up();
    await page.keyboard.up('Shift');
    await soon(page, async () => (await page.locator('.dv-resize-container').count()) > 0, 'The tab of definitions, dragged with Shift held, does not float.');
    await untilCurrent(page, ['view:v-defs'], 'After the tab of definitions floats');
    await closeTab(page, two);
    await untilCurrent(page, ['view:v-ic'], 'After the floating tab of definitions is closed and the tab of fuelSystem is the one left');
    await finish(opened);
  });

  test('another file opened shows its own rows, with nothing picked', async () => {
    const opened = await openExample();
    const { page } = opened;
    await clickRow(page, 'el', 'Host');
    await untilSelectedRows(page, ['el:Host'], 'A click on the row el:Host');
    await clickFold(page, 'el', 'Page');
    await soon(page, async () => (await rowsNow(page)).length === 20, async () => `With el:Page folded the Explorer has ${(await rowsNow(page)).length} rows, not 20.`);
    await openStateFile(page, stateFileAt(IC_FILE));
    await untilRow(page, 'view', 'v-ic');
    await soon(page, async () => (await rowsNow(page)).length === 51, async () => `The Explorer of interconnection.json has ${(await rowsNow(page)).length} rows, not 51.`);
    assert.equal((await rowIn(page, 'package').textContent()).trim(), '«package» FuelSystem');
    assert.equal((await rowsNow(page))[0], 'package:');
    await untilSelectedRows(page, [], 'After another file is opened');
    await untilCurrent(page, ['view:v-ic'], 'After another file is opened');
    await openStateFile(page, stateFileAt(EXAMPLE));
    await untilRow(page, 'el', 'Page');
    await soon(page, async () => (await rowsNow(page)).length === 25, async () => `The Explorer of the example, opened again, has ${(await rowsNow(page)).length} rows, not 25.`);
    await untilSelectedRows(page, [], 'After the example is opened again');
    await finish(opened);
  });

  test('what is picked on a plane is scrolled into view in the Explorer', async () => {
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    await page.setViewportSize({ width: 1400, height: 500 });
    await openStateFile(page, stateFileAt(IC_FILE));
    const view = viewOf(IC, 'v-ic');
    await untilDrawn(page, view);
    await showSide(page, 'Explorer');
    await clickRow(page, 'el', 'Fuel');
    await untilRow(page, 'el', 'System.pump');
    const before = await rectsOfRow(page, 'el:System.pump');
    assert.ok(before.row.bottom > before.root.bottom + 0.5, `The row el:System.pump lies from ${before.row.top} to ${before.row.bottom} px, not below the Explorer's bottom edge, ${before.root.bottom} px.`);
    await selectBox(page, view, 'System.pump');
    await untilSelectedRows(page, ['el:System.pump'], 'A click on the box System.pump');
    await soon(page, async () => {
      const now = await rectsOfRow(page, 'el:System.pump');
      return now.row.top >= now.root.top - 0.5 && now.row.bottom <= now.root.bottom + 0.5;
    }, async () => {
      const now = await rectsOfRow(page, 'el:System.pump');
      return `The row el:System.pump lies from ${now.row.top} to ${now.row.bottom} px, not wholly inside the Explorer, from ${now.root.top} to ${now.root.bottom} px.`;
    });
    await finish(opened);
  });

  test('a pick whose row is folded away marks no row until the row is unfolded', async () => {
    const opened = await openExample();
    const { page } = opened;
    await clickFold(page, 'el', 'Page');
    await soon(page, async () => (await rowIn(page, 'el', 'Page.hosts').count()) === 0, 'The row el:Page was folded and its row el:Page.hosts is still in the document.');
    await selectBox(page, VIEW, 'Page.hosts');
    await untilSelectedOn(page, VIEW, ['Page.hosts'], [], 'A click on the box Page.hosts');
    await frame(page);
    assert.deepEqual(await selectedRows(page), [], 'With el:Page folded, a pick of Page.hosts marks a row.');
    assert.equal(await rowItemIn(page, 'el', 'Page').getAttribute('aria-expanded'), 'false', 'A pick of Page.hosts unfolded the row el:Page.');
    await clickFold(page, 'el', 'Page');
    await untilSelectedRows(page, ['el:Page.hosts'], 'After el:Page is unfolded');
    await finish(opened);
  });
});
