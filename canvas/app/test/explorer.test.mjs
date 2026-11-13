// The Explorer in the page (plan/slice-1.md, step 9; plan/swarm/step-9.md, sections 3 and 4, rows X1 to X8). These
// read the Explorer only: no test here clicks a view's row or reads aria-current, and one click on a plane is the
// anchor of a range (a pick on the plane anchors a range in the tree too).

import assert from 'node:assert/strict';
import path from 'node:path';
import { after, afterEach, before, describe, test } from 'node:test';
import { scaleState } from '../../test/scale-model.mjs';
import {
  byTestId, closePages, cssColor, EXAMPLE, finish, FIXTURES, frame, launch, modelOf, near, openIn, openPage, openStateFile, rowIn, rowItemIn,
  selectBox, showSide, showView, soon, stateFileAt, stateFileOf, TEAL, TESTIDS,
} from './helpers.mjs';

const ROOT_SELECTOR = byTestId(TESTIDS.explorer);
const SECONDARY = 'var(--grasp-text-secondary)';
const TEAL_SOFT = 'var(--grasp-teal-soft)';

/** The example's rows, in order: each one's row id and its text. */
const EXAMPLE_ROWS = [
  ['package:', '«package» StrongholdProof'],
  ['view:v-proof', '«general view» proofStructure'],
  ['el:Page', '«part def» Page'],
  ['el:Page.hosts', '«part» hosts : Host [1..*]'],
  ['el:Page.hosts.api', '«port» api : ~StrongholdApp'],
  ['el:Page.app', '«part» app : App [1]'],
  ['el:Page.app.api', '«port» api : StrongholdApp'],
  ['rel:mount', '«connection» mount, api to api'],
  ['el:Host', '«part def» Host'],
  ['el:Host.api', '«port» api : ~StrongholdApp'],
  ['el:App', '«part def» App'],
  ['el:App.api', '«port» api : StrongholdApp'],
  ['el:StrongholdApp', '«port def» StrongholdApp'],
  ['el:ServerHost', '«part def» ServerHost'],
  ['el:OnlineHost', '«part def» OnlineHost'],
  ['el:DevHost', '«part def» DevHost'],
  ['rel:t-hosts', '«defined by» hosts defined by Host'],
  ['rel:t-app', '«defined by» app defined by App'],
  ['rel:t-hosts-api', '«defined by» api defined by StrongholdApp'],
  ['rel:t-app-api', '«defined by» api defined by StrongholdApp'],
  ['rel:t-Host-api', '«defined by» api defined by StrongholdApp'],
  ['rel:t-App-api', '«defined by» api defined by StrongholdApp'],
  ['rel:s-ServerHost', '«specializes» ServerHost specializes Host'],
  ['rel:s-OnlineHost', '«specializes» OnlineHost specializes Host'],
  ['rel:s-DevHost', '«specializes» DevHost specializes Host'],
];

/** A row id ("el:Page.hosts") as the type and id rowIn takes. */
const split = (row) => { const at = row.indexOf(':'); return [row.slice(0, at), row.slice(at + 1)]; };
const rowAt = (page, row) => rowIn(page, ...split(row));
const itemAt = (page, row) => rowItemIn(page, ...split(row));

/** The row ids of every row in the Explorer's tree, in document order. */
const rowsNow = (page) => page.evaluate((root) => [...document.querySelectorAll(`${root} [data-row]`)].map((el) => el.getAttribute('data-row')), ROOT_SELECTOR);

/** The row ids of the rows whose tree item says aria-selected "true", in document order. */
const selectedRows = (page) => page.evaluate((root) => [...document.querySelectorAll(`${root} [role="treeitem"][aria-selected="true"]`)]
  .map((item) => item.querySelector('[data-row]').getAttribute('data-row')), ROOT_SELECTOR);

/** The row id of the tree item with the keyboard's focus, or null when the focus is on none. */
const focusedRow = (page) => page.evaluate(() => {
  const el = document.activeElement;
  return el && el.getAttribute('role') === 'treeitem' ? el.querySelector('[data-row]')?.getAttribute('data-row') ?? null : null;
});

/** Waits for a row to be in the tree, and fails saying so when it is not. */
async function rowReady(page, row) {
  const [type, id] = split(row);
  await soon(page, async () => (await rowAt(page, row).count()) > 0,
    `The Explorer has no row for ${type === 'package' ? 'the package' : `${type} ${id}`} (data-row "${row}"): its tree is not built.`);
}

/** Waits until selectedRows is `wanted`, and fails saying what is selected instead. */
const untilSelected = async (page, wanted, what) => {
  let seen = null;
  await soon(page, async () => { seen = await selectedRows(page); return JSON.stringify(seen) === JSON.stringify(wanted); },
    () => `${what}: the selected rows are ${JSON.stringify(seen)}, not ${JSON.stringify(wanted)}.`);
};

/** Waits until the focus is on a row's tree item. */
const untilFocused = (page, row, what) => soon(page, async () => (await focusedRow(page)) === row,
  async () => `${what}: the keyboard's focus is on ${JSON.stringify(await focusedRow(page))}, not on ${JSON.stringify(row)}.`);

/** Opens the example in the Explorer and waits for its tree. */
async function openExample(browser, file = stateFileAt(EXAMPLE), first = 'package:') {
  const opened = await openIn(browser, file);
  await showSide(opened.page, 'Explorer');
  await rowReady(opened.page, first);
  return opened;
}

describe('the Explorer', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  test('with no file open the Explorer says so, and with one it shows the package, its views, then the elements and the lines', async () => {
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    await showSide(page, 'Explorer');
    const says = () => page.evaluate((root) => document.querySelector(`${root} .grasp-side-text`)?.textContent ?? document.querySelector(root)?.textContent ?? null, ROOT_SELECTOR);
    const said = await says();
    assert.ok(said && said.includes('No model is open.'), `The Explorer says ${JSON.stringify(said)}, not "No model is open."`);
    assert.equal(await page.locator(`${ROOT_SELECTOR} [role="tree"]`).count(), 0, 'The Explorer holds a tree while no file is open.');

    await openStateFile(page, stateFileAt(EXAMPLE));
    await rowReady(page, 'package:');
    const trees = page.locator(`${ROOT_SELECTOR} div.grasp-explorer [role="tree"]`);
    assert.equal(await trees.count(), 1, 'The Explorer should hold one element with the role tree, inside a div.grasp-explorer.');
    assert.equal(await trees.first().getAttribute('aria-label'), 'Model', 'The Explorer\'s tree should be named Model.');
    await soon(page, async () => (await rowsNow(page)).length >= EXAMPLE_ROWS.length, async () => `The Explorer shows ${(await rowsNow(page)).length} rows, not ${EXAMPLE_ROWS.length}.`);
    assert.deepEqual(await rowsNow(page), EXAMPLE_ROWS.map(([id]) => id), 'The example\'s rows are not these, in this order.');
    const texts = await page.evaluate((root) => [...document.querySelectorAll(`${root} [data-row]`)].map((el) => el.textContent), ROOT_SELECTOR);
    assert.deepEqual(texts, EXAMPLE_ROWS.map(([, text]) => text), 'The words of the example\'s rows are not these.');
    const inside = (inner, outer) => page.evaluate(([root, a, b]) => {
      const item = (row) => document.querySelector(`${root} [data-row=${JSON.stringify(row)}]`).closest('[role="treeitem"]');
      const x = item(a); const y = item(b);
      return x !== y && y.contains(x);
    }, [ROOT_SELECTOR, inner, outer]);
    assert.ok(await inside('el:Page.hosts', 'el:Page'), 'The tree item of el:Page.hosts is not inside that of el:Page.');
    assert.ok(await inside('el:Page', 'package:'), 'The tree item of el:Page is not inside the package\'s.');
    assert.ok(await inside('rel:mount', 'el:Page'), 'The tree item of rel:mount is not inside that of el:Page.');
    await finish(opened);
  });

  test('a row is 28 px high, in Roboto at 13 px, with its name in medium weight, and steps in 16 px a level', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await page.evaluate(() => document.fonts.ready);
    const secondary = await cssColor(page, SECONDARY);
    const read = await page.evaluate((root) => [...document.querySelectorAll(`${root} [data-row]`)].map((row) => {
      const style = (el) => (el ? getComputedStyle(el) : null);
      const name = row.querySelector('.grasp-row-name');
      const kw = row.querySelector('.grasp-row-kw');
      const words = row.querySelector('.grasp-row-words');
      return {
        row: row.getAttribute('data-row'),
        height: row.getBoundingClientRect().height,
        left: words ? words.getBoundingClientRect().left : null,
        name: name && { family: style(name).fontFamily, size: style(name).fontSize, weight: style(name).fontWeight },
        kw: kw && style(kw).color,
      };
    }), ROOT_SELECTOR);
    assert.ok(read.length > 0, 'The Explorer shows no rows.');
    for (const row of read) {
      assert.ok(near(row.height, 28, 0.5), `The row ${row.row} is ${row.height} px high, not 28 px.`);
      assert.ok(row.name, `The row ${row.row} has no .grasp-row-name.`);
      assert.ok(/^["']?Roboto\b/i.test(row.name.family), `The name of the row ${row.row} is drawn in ${row.name.family}, not in Roboto first.`);
      assert.equal(row.name.size, '13px', `The name of the row ${row.row} is ${row.name.size}, not 13px.`);
      assert.equal(row.name.weight, '500', `The name of the row ${row.row} is in weight ${row.name.weight}, not 500.`);
      if (row.kw !== null) assert.equal(row.kw, secondary, `The keyword of the row ${row.row} is ${row.kw}, not the secondary colour ${secondary}.`);
    }
    const left = (id) => read.find((row) => row.row === id).left;
    const chain = ['package:', 'el:Page', 'el:Page.hosts', 'el:Page.hosts.api'];
    for (let i = 1; i < chain.length; i++) {
      const step = left(chain[i]) - left(chain[i - 1]);
      assert.ok(near(step, 16, 0.5), `The words of ${chain[i]} begin ${step} px right of those of ${chain[i - 1]}, not 16 px.`);
    }
    await finish(opened);
  });

  test('the Explorer stays as wide as its panel, and a row too long for it is cut and says itself whole in its title', async () => {
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    await showSide(page, 'Explorer');
    const rightOf = () => page.evaluate((root) => document.querySelector(root).getBoundingClientRect().right, ROOT_SELECTOR);
    const before = await rightOf();
    await openStateFile(page, stateFileAt(EXAMPLE));
    await rowReady(page, 'rel:t-hosts-api');
    const after = await rightOf();
    assert.ok(near(before, after, 0.5), `The Explorer's right edge is at ${before} px with no file and at ${after} px with the example: the tree widened its panel.`);
    const read = await page.evaluate((root) => {
      const box = document.querySelector(root);
      return {
        scrollWidth: box.scrollWidth,
        clientWidth: box.clientWidth,
        rows: [...box.querySelectorAll('[data-row]')].map((row) => {
          const words = row.querySelector('.grasp-row-words');
          return {
            row: row.getAttribute('data-row'),
            text: row.textContent,
            title: words ? words.getAttribute('title') : null,
            wordsRight: words ? words.getBoundingClientRect().right : null,
            rowRight: row.getBoundingClientRect().right,
            cut: words ? words.scrollWidth > words.clientWidth : null,
          };
        }),
      };
    }, ROOT_SELECTOR);
    assert.ok(read.scrollWidth <= read.clientWidth, `The Explorer's scrollWidth is ${read.scrollWidth} px, over its clientWidth ${read.clientWidth} px.`);
    for (const row of read.rows) {
      assert.ok(row.wordsRight !== null && row.wordsRight <= row.rowRight + 0.5, `The words of ${row.row} run to ${row.wordsRight} px, past their row's right edge ${row.rowRight} px.`);
      assert.equal(row.title, row.text, `The title of the words of ${row.row} is ${JSON.stringify(row.title)}, not the row's text ${JSON.stringify(row.text)}.`);
    }
    const long = read.rows.find((row) => row.row === 'rel:t-hosts-api');
    assert.ok(long.cut, 'The words of rel:t-hosts-api are not cut: their scrollWidth is no more than their clientWidth.');
    await finish(opened);
  });

  test('a click on a row\'s words picks it and does not fold it, and its fold control folds it and picks nothing', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await rowAt(page, 'el:Page').click();
    await untilSelected(page, ['el:Page'], 'A click on the words of el:Page should pick it alone');
    assert.equal(await itemAt(page, 'el:Page').getAttribute('aria-expanded'), 'true', 'A click on the words of el:Page folded it.');
    await rowAt(page, 'el:Page').locator('.grasp-row-icon').click();
    await soon(page, async () => (await itemAt(page, 'el:Page').getAttribute('aria-expanded')) === 'false', 'A click on the fold control of el:Page did not fold it (aria-expanded "false").');
    for (const gone of ['el:Page.hosts', 'el:Page.app', 'rel:mount']) {
      assert.equal(await rowAt(page, gone).count(), 0, `The row ${gone} is in the document while el:Page is folded.`);
    }
    assert.equal((await rowsNow(page)).length, 20, `The Explorer shows ${(await rowsNow(page)).length} rows with el:Page folded, not 20.`);
    assert.deepEqual(await selectedRows(page), ['el:Page'], 'A click on the fold control changed what is picked.');
    await rowAt(page, 'el:Page').locator('.grasp-row-icon').click();
    await soon(page, async () => (await rowsNow(page)).length === 25, async () => `The Explorer shows ${(await rowsNow(page)).length} rows after el:Page is unfolded again, not 25.`);
    assert.equal(await itemAt(page, 'el:DevHost').getAttribute('aria-expanded'), null, 'The row el:DevHost has nothing inside it and has aria-expanded.');
    assert.equal(await rowAt(page, 'el:DevHost').locator('.grasp-row-icon svg').count(), 0, 'The fold control of el:DevHost holds an svg.');
    await finish(opened);
  });

  test('Ctrl or ⌘ with a click on a row adds it or lets it go, and Shift with a click picks the rows between', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await rowAt(page, 'el:Host').click();
    await untilSelected(page, ['el:Host'], 'A click on el:Host should pick it');
    await rowAt(page, 'el:App').click({ modifiers: ['Control'] });
    await untilSelected(page, ['el:Host', 'el:App'], 'Ctrl + click on el:App should add it');
    await rowAt(page, 'el:Host').click({ modifiers: ['Control'] });
    await untilSelected(page, ['el:App'], 'Ctrl + click on el:Host should let it go');
    await rowAt(page, 'el:DevHost').click({ modifiers: ['Meta'] });
    await untilSelected(page, ['el:App', 'el:DevHost'], 'Meta + click on el:DevHost should add it');
    await rowAt(page, 'el:Host').click();
    await untilSelected(page, ['el:Host'], 'A click on el:Host should pick it alone');
    await rowAt(page, 'el:ServerHost').click({ modifiers: ['Shift'] });
    await untilSelected(page, ['el:Host', 'el:Host.api', 'el:App', 'el:App.api', 'el:StrongholdApp', 'el:ServerHost'],
      'Shift + click on el:ServerHost should pick the rows from el:Host to it');
    await finish(opened);
  });

  test('Shift with a click on a row picks a range after another file is opened, whose rows the old anchor is not among', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await rowAt(page, 'el:Host').click();
    await untilSelected(page, ['el:Host'], 'A click on el:Host should pick it');
    await openStateFile(page, stateFileAt(path.join(FIXTURES, 'interconnection.json')));
    await rowReady(page, 'el:Fuel');
    await rowAt(page, 'el:Fuel').click({ modifiers: ['Shift'] });
    await untilSelected(page, ['el:Fuel'], 'Shift + click on el:Fuel in the file opened after another, with nothing picked, should pick that row alone');
    await finish(opened);
  });

  test('Shift with a click on a row stretches from what was picked on the plane, and picks the row alone when nothing was', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await rowAt(page, 'el:DevHost').click({ modifiers: ['Shift'] });
    await untilSelected(page, ['el:DevHost'], 'Shift + click on el:DevHost with nothing picked should pick that row alone');
    const view = modelOf(EXAMPLE).views[0];
    await showView(page, view);
    await selectBox(page, view, 'App');
    await untilSelected(page, ['el:App'], 'A click on the box App of the plane should pick it, and mark its row');
    await rowAt(page, 'el:DevHost').click({ modifiers: ['Shift'] });
    await untilSelected(page, ['el:App', 'el:App.api', 'el:StrongholdApp', 'el:ServerHost', 'el:OnlineHost', 'el:DevHost'],
      'Shift + click on el:DevHost after a click on the box App of the plane should pick the rows from el:App to it');
    await finish(opened);
  });

  /** A model of 60 elements in the Explorer, whose list is long enough to scroll, with the row ids of its elements in order. */
  async function openLong() {
    const opened = await openIn(browser, stateFileOf('long.json', scaleState(60)));
    await showSide(opened.page, 'Explorer');
    await rowReady(opened.page, 'package:');
    const elements = (await rowsNow(opened.page)).filter((row) => row.startsWith('el:'));
    assert.ok(elements.length >= 60, `The Explorer shows ${elements.length} element rows for 60 elements.`);
    return { ...opened, first: elements[0], last: elements[elements.length - 1] };
  }

  /** Whether a row is inside what the Explorer shows of its list (the Explorer's body is what scrolls). */
  const inView = (page, row) => page.evaluate(([root, id]) => {
    const body = document.querySelector(root).getBoundingClientRect();
    const rect = document.querySelector(`${root} [data-row=${JSON.stringify(id)}]`).getBoundingClientRect();
    return rect.top >= body.top - 0.5 && rect.bottom <= body.bottom + 0.5;
  }, [ROOT_SELECTOR, row]);

  test('after Shift with a click the row clicked is the last picked, and the Explorer scrolls to it, not to the row the range began at', async () => {
    const opened = await openLong();
    const { page, first, last } = opened;
    await rowAt(page, first).click();
    await untilSelected(page, [first], `A click on ${first} should pick it`);
    await rowAt(page, last).click({ modifiers: ['Shift'] });
    await soon(page, async () => (await selectedRows(page)).length > 40, async () => `Shift + click on ${last} picked ${(await selectedRows(page)).length} rows, not the rows from ${first} to it.`);
    for (let i = 0; i < 4; i++) await frame(page);
    assert.ok(await inView(page, last), `The row ${last} that Shift + click picked the range to is out of view: the Explorer scrolled to the row the range began at (${first}) as the last picked, not to the row clicked.`);
    await finish(opened);
  });

  test('after Shift with an arrow key the row moved to is the last picked, and the Explorer keeps it in view', async () => {
    const opened = await openLong();
    const { page, first } = opened;
    await rowAt(page, first).click();
    await untilSelected(page, [first], `A click on ${first} should pick it`);
    for (let i = 0; i < 40; i++) await page.keyboard.press('Shift+ArrowDown');
    await soon(page, async () => (await selectedRows(page)).length >= 41, async () => `40 Shift+ArrowDown picked ${(await selectedRows(page)).length} rows, not 41.`);
    for (let i = 0; i < 4; i++) await frame(page);
    const at = await focusedRow(page);
    assert.ok(at && await inView(page, at), `The row ${at} that Shift+ArrowDown moved to is out of view: the Explorer scrolled to the row the range began at (${first}) as the last picked, not to the row moved to.`);
    await finish(opened);
  });

  test('the package\'s row picks nothing and lets nothing go', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await rowAt(page, 'el:Host').click();
    await untilSelected(page, ['el:Host'], 'A click on el:Host should pick it');
    await rowAt(page, 'package:').click();
    await untilFocused(page, 'package:', 'A click on the package\'s row should give it the keyboard\'s focus');
    assert.deepEqual(await selectedRows(page), ['el:Host'], 'A click on the package\'s row changed what is picked.');
    assert.equal(await itemAt(page, 'package:').getAttribute('aria-selected'), null, 'The package\'s tree item has aria-selected.');
    assert.equal(await page.locator(`${ROOT_SELECTOR} [aria-checked]`).count(), 0, 'A tree item in the Explorer has aria-checked.');
    await finish(opened);
  });

  test('the keys move the focus, pick and fold', async () => {
    const opened = await openExample(browser, stateFileAt(path.join(FIXTURES, 'interconnection.json')), 'el:Fuel');
    const { page } = opened;
    await rowAt(page, 'el:Fuel').click();
    await untilSelected(page, ['el:Fuel'], 'A click on el:Fuel should pick it');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await untilFocused(page, 'el:FuelPort', 'Two ArrowDown from el:Fuel should reach el:FuelPort');
    assert.deepEqual(await selectedRows(page), ['el:Fuel'], 'ArrowDown changed what is picked.');
    await page.keyboard.press('Space');
    await untilSelected(page, ['el:Fuel', 'el:FuelPort'], 'Space on el:FuelPort should pick it and keep el:Fuel');
    await page.keyboard.press('ArrowLeft');
    await soon(page, async () => (await itemAt(page, 'el:FuelPort').getAttribute('aria-expanded')) === 'false', 'ArrowLeft on el:FuelPort did not fold it.');
    await page.keyboard.press('ArrowRight');
    await soon(page, async () => (await itemAt(page, 'el:FuelPort').getAttribute('aria-expanded')) === 'true', 'ArrowRight on el:FuelPort did not unfold it.');
    await page.keyboard.press('Shift+ArrowDown');
    await soon(page, async () => (await selectedRows(page)).includes('el:FuelPort.supply'),
      async () => `Shift+ArrowDown did not pick el:FuelPort.supply: the selected rows are ${JSON.stringify(await selectedRows(page))}.`);
    await page.keyboard.press('Home');
    await untilFocused(page, 'package:', 'Home should put the focus on the package\'s row');
    await finish(opened);
  });

  test('a selected row is on the soft teal, and the row with the keyboard\'s focus has the theme\'s ring', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    const backgroundOf = (row) => rowAt(page, row).evaluate((el) => getComputedStyle(el).backgroundColor);
    const soft = await cssColor(page, TEAL_SOFT);
    await rowAt(page, 'el:Host').click();
    await untilSelected(page, ['el:Host'], 'A click on el:Host should pick it');
    await soon(page, async () => (await backgroundOf('el:Host')) === soft, async () => `The selected row el:Host is on ${await backgroundOf('el:Host')}, not the soft teal ${soft}.`);
    assert.notEqual(await backgroundOf('el:App'), soft, 'A row that is not selected is on the soft teal.');
    await page.keyboard.press('ArrowDown');
    await untilFocused(page, 'el:Host.api', 'ArrowDown from el:Host should reach el:Host.api');
    const ring = await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement.querySelector('[data-row]'));
      return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) || 0, color: style.outlineColor };
    });
    const teal = await cssColor(page, TEAL);
    assert.ok(ring.style === 'solid' && near(ring.width, 2, 0.01) && ring.color === teal,
      `The row with the keyboard's focus has an outline ${ring.style} ${ring.width}px ${ring.color}, not solid 2px ${teal}.`);
    await finish(opened);
  });
});
