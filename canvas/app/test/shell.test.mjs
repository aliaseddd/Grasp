// The page's shell, opened from file:// in Chromium: the first four of slice 1's "Done when" checks. The first passes.
// The example's test was written in step 3, before what it checks, and is marked todo until step 6 builds it: node's
// runner then reports its failure as todo, not as a failure. The rest are step 5's.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, afterEach, before, describe, test } from 'node:test';
import { buildFiles } from '../build.mjs';
import {
  BROWSER_FRAMES, byTestId, closePages, DIST_URL, drawn, EXAMPLE, finish, frame, launch, nodeOf, openPage, openStateFile, ROOT, soon,
  stateFileAt, stateFileOf, tabTitle, TESTIDS, untilDrawn, viewTab, WAIT,
} from './helpers.mjs';

/** The window's height in every test, and the widths the bar is measured at. */
const HEIGHT = 900;
const WIDTHS = [1400, 800];
/** The bar's five icon buttons, by data-testid. */
const ACTIONS = [TESTIDS.open, TESTIDS.save, TESTIDS.undo, TESTIDS.redo, TESTIDS.about];

/**
 * Runs in the page: the top bar as it is now, or null when there is none. Its rectangle, its text, its buttons (each
 * with its data-testid, its name for a screen reader, the text it shows and its rectangle), the dock's rectangle, how
 * far the page could scroll, and the names a tool would have: the labels and keywords of the library's element and
 * relationship kinds, in lower case.
 */
function readBar([topBar, dock]) {
  const bar = document.querySelector(topBar);
  if (!bar) return null;
  const rect = (el) => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
  const M = window.SysMLModel;
  const tools = Object.values(M.KINDS).flatMap((kind) => [kind.label, kind.keyword]).concat(Object.values(M.RELATIONSHIPS).map((kind) => kind.label));
  return {
    rect: rect(bar),
    text: bar.innerText,
    buttons: [...bar.querySelectorAll('button, [role="button"]')].map((button) => ({
      testid: button.getAttribute('data-testid'),
      name: (button.getAttribute('aria-label') || button.getAttribute('title') || '').trim(),
      text: button.innerText.trim(),
      rect: rect(button),
    })),
    dock: document.querySelector(dock) ? rect(document.querySelector(dock)) : null,
    scroll: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
    tools: [...new Set(tools.filter(Boolean).map((name) => name.toLowerCase()))],
  };
}

/** Runs in the page: a point within a few px of x = `edge`, at height y, where the cursor says a drag resizes sideways. */
function sashAt([edge, y]) {
  const resizes = (x) => {
    const el = document.elementFromPoint(x, y);
    return !!el && /^(ew|col|e|w)-resize$/.test(getComputedStyle(el).cursor);
  };
  for (let x = Math.round(edge) - 6; x <= Math.round(edge) + 12; x++) if (resizes(x)) return { x: resizes(x + 1) ? x + 1 : x, y };
  return null;
}

/** Browser.json, the fixture with three views, and its views. */
const BROWSER = path.join(ROOT, 'canvas', 'test', 'fixtures', 'browser.json');
const browserViews = () => JSON.parse(fs.readFileSync(BROWSER, 'utf8')).model.views;

/** Runs in the page: the rectangle of what a data-testid names, or null when nothing has it or it takes no room. */
function rectOfTestId(testid) {
  const el = document.querySelector(`[data-testid="${testid}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height } : null;
}

/** The names on the two strips: three on the left, one on the right. */
const STRIP_TABS = ['Explorer', 'Tools', 'Validation', 'Details'];

/** Where each strip's name is now: the rectangle of its tab (role "tab"), by name; null for one that is not shown. */
async function stripRects(page) {
  const rects = {};
  for (const name of STRIP_TABS) rects[name] = await page.getByRole('tab', { name, exact: true }).boundingBox();
  return rects;
}

/** The first strip name that is not where it was, as a sentence, or null when all four are (within half a px). */
function movedStrip(before, now) {
  for (const name of STRIP_TABS) {
    const a = before[name];
    const b = now[name];
    const at = (r) => (r ? `${r.x}, ${r.y}, ${r.width} by ${r.height} px` : 'nowhere');
    if (!a || !b || ['x', 'y', 'width', 'height'].some((key) => Math.abs(a[key] - b[key]) > 0.5)) return `the strip's name "${name}" was at ${at(a)} and is at ${at(b)}`;
  }
  return null;
}

/** Drags with the mouse as a person does: pressed at `from`, moved to `to` in steps, released; then two frames for the page. */
async function dragMouse(page, from, to, steps = 8) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) await page.mouse.move(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
  await page.mouse.up();
  await frame(page);
  await frame(page);
}

/**
 * Runs in the page: the computed font-size of the innermost element that holds a text, looked for in and under what
 * `root` (a selector) names; null when nothing holds it. The text is `text` whole, or what begins with it when
 * `starts`; with no `text`, it is all the text of the first thing `root` names.
 */
function fontSizeOf([root, text, starts]) {
  for (const top of document.querySelectorAll(root)) {
    const wanted = text ?? top.textContent.trim();
    if (!wanted) continue;
    const holds = (el) => { const has = el.textContent.trim(); return starts ? has.startsWith(wanted) : has === wanted; };
    // In the document's order an element comes before what is inside it, so the last that holds the text is the innermost.
    const inner = [top, ...top.querySelectorAll('*')].filter(holds).pop();
    if (inner) return getComputedStyle(inner).fontSize;
  }
  return null;
}

/**
 * Runs in the page: what has the keyboard's focus and the outline drawn for it, on the element itself or, with
 * `pseudo`, on that pseudo-element of it. Null when nothing but the body has focus.
 */
function focusRing(pseudo) {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const style = getComputedStyle(el, pseudo || undefined);
  return {
    testid: el.getAttribute('data-testid'),
    role: el.getAttribute('role') || el.tagName.toLowerCase(),
    text: (el.getAttribute('aria-label') || el.textContent || '').trim(),
    focusVisible: el.matches(':focus-visible'),
    style: style.outlineStyle,
    width: parseFloat(style.outlineWidth) || 0,
    color: style.outlineColor,
  };
}

/** Grasp's teal and white, as a computed colour reads. */
const TEAL = 'rgb(23, 107, 97)';
const WHITE = 'rgb(255, 255, 255)';

describe('the shell', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  test('from file://, the page opens with no console error', async () => {
    const { vendorModules } = await buildFiles();
    const opened = await openPage(browser);
    const { page } = opened;
    assert.match(await page.textContent(byTestId(TESTIDS.app)), /Grasp/);
    assert.equal(await page.evaluate(() => window.SysMLModel && window.SysMLModel.FORMAT), 'grasp/2');
    const keys = await page.evaluate(() => Object.keys(window.GraspVendor || {}));
    assert.deepEqual([...keys].sort(), [...vendorModules].sort());
    await finish(opened);
  });

  // The example's one view, proofStructure, on its tab: every element the view places is a node of the tab's plane,
  // every line that is not hidden is an edge, and each box says its name.
  test('the example shows its general view on a tab', { todo: 'step 6 draws a view on its tab\'s plane' }, async () => {
    const { model } = JSON.parse(fs.readFileSync(EXAMPLE, 'utf8'));
    const view = model.views[0];
    const placed = Object.keys(view.layout);
    const lines = model.relationships.filter((rel) => !rel.hidden && placed.includes(rel.from) && placed.includes(rel.to)).map((rel) => rel.id);
    assert.deepEqual([view.kind, placed.length, lines.length], ['GeneralView', 13, 6], 'the example is the one this test was written for');

    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    await openStateFile(page, stateFileAt(EXAMPLE));
    const tab = await viewTab(page, view);
    assert.equal(await tab.getAttribute('aria-selected'), 'true', `the tab "${tabTitle(view)}" is the one in front (aria-selected)`);
    await untilDrawn(page, view);
    // A line is drawn once both its ends are, which may be a frame later.
    await soon(page, async () => (await drawn(page, view.id)).edges.length >= lines.length,
      async () => `The plane of ${view.name} draws ${(await drawn(page, view.id)).edges.length} edges for the ${lines.length} lines of the view that are not hidden.`);
    const shown = await drawn(page, view.id);
    assert.deepEqual([...shown.nodes].sort(), [...placed].sort(), 'the plane has one node for each element the view places, and no other');
    assert.deepEqual([...shown.edges].sort(), [...lines].sort(), 'the plane has one edge for each line that is not hidden, and no other');
    // A box says its name; an item on a border has its name beside it, which the plane may draw apart from the item.
    for (const el of model.elements.filter((el) => 'x' in view.layout[el.id])) {
      const text = await page.textContent(nodeOf(view.id, el.id));
      assert.ok(text.includes(el.name), `The box of ${el.id} does not show its name, ${el.name}. It reads "${text}".`);
    }
    await finish(opened);
  });

  // The old page's header holds a palette of tools and a row of text buttons. The new page has one bar, a single row
  // of at most 40 px at any width, holding the name Grasp, the open file's name and icon buttons, none of them a tool,
  // and under it the dock, with nothing between them. The test looks for the bar first: a page with no shell at all
  // has no palette either.
  test('no header palette or button row exists', async () => {
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    const check = async (width, when) => {
      await page.setViewportSize({ width, height: HEIGHT });
      await frame(page);
      const bar = await page.evaluate(readBar, [byTestId(TESTIDS.topBar), byTestId(TESTIDS.dock)]);
      assert.ok(bar, `The page has no top bar (data-testid "${TESTIDS.topBar}"): the shell that replaces the old header is not built.`);
      const near = (a, b) => Math.abs(a - b) <= 0.5;
      assert.ok(near(bar.rect.left, 0) && near(bar.rect.top, 0) && near(bar.rect.width, width),
        `${when}: the bar does not lie across the top of the window. It is at ${bar.rect.left}, ${bar.rect.top}, and ${bar.rect.width} px wide.`);
      assert.ok(bar.rect.height <= 40, `${when}: the bar is ${bar.rect.height} px high, more than the one row of 40 px.`);
      assert.match(bar.text, /Grasp/, `${when}: the bar does not say Grasp.`);
      assert.ok(bar.dock, `${when}: there is no dock under the bar (data-testid "${TESTIDS.dock}").`);
      assert.ok(near(bar.dock.top, bar.rect.bottom) && near(bar.dock.bottom, HEIGHT) && near(bar.dock.left, 0) && near(bar.dock.width, width),
        `${when}: the dock does not fill the window under the bar, so something else has a row. ` +
        `The bar ends at ${bar.rect.bottom} px; the dock runs from ${bar.dock.top} to ${bar.dock.bottom} px.`);
      assert.ok(bar.scroll.width <= width && bar.scroll.height <= HEIGHT,
        `${when}: the page scrolls: it is ${bar.scroll.width} by ${bar.scroll.height} px in a window of ${width} by ${HEIGHT}.`);
      for (const id of ACTIONS) {
        assert.ok(bar.buttons.filter((button) => button.testid === id).length === 1, `${when}: the bar does not have one button with data-testid "${id}".`);
      }
      for (const button of bar.buttons) {
        const called = button.name || button.text ? `the button "${button.name || button.text}"` : `a button (data-testid "${button.testid}")`;
        assert.ok(!button.text, `${when}: ${called} shows text; the bar holds icon buttons only.`);
        assert.ok(button.name, `${when}: ${called} has no name (aria-label) to go with its icon.`);
        assert.ok(!bar.tools.includes(button.name.toLowerCase()), `${when}: ${called} is a tool; the bar holds none.`);
        assert.ok(button.rect.width > 0 && button.rect.height > 0 &&
          button.rect.left >= bar.rect.left && button.rect.right <= bar.rect.right && button.rect.top >= bar.rect.top && button.rect.bottom <= bar.rect.bottom,
        `${when}: ${called} does not lie inside the bar: it is wrapped onto another row, or cut off.`);
      }
    };
    for (const width of WIDTHS) await check(width, `With no file open, ${width} px wide`);
    // With a file open the bar also shows the file's name, and the view kind's tools have somewhere else to be.
    await openStateFile(page, stateFileAt(EXAMPLE));
    for (const width of [...WIDTHS].reverse()) await check(width, `With the example open, ${width} px wide`);
    await finish(opened);
  });

  // The sash is found as a person finds it, by the resize cursor at the Explorer's right edge, and dragged with the
  // mouse: 120 px to the right, then 60 px back. The Explorer's right edge follows it, and its left edge stays.
  test('a sash drag resizes the Explorer', async () => {
    const opened = await openPage(browser);
    const { page } = opened;
    const rectOf = (testid) => page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    }, byTestId(testid));
    const start = await rectOf(TESTIDS.explorer);
    assert.ok(start && start.width > 0 && start.height > 0, `The page shows no Explorer (data-testid "${TESTIDS.explorer}"), so there is no sash to drag.`);

    let explorer = start;
    for (const by of [120, -60]) {
      const from = explorer;
      const grip = await page.evaluate(sashAt, [from.right, (from.top + from.bottom) / 2]);
      assert.ok(grip, 'Nothing at the Explorer\'s right edge shows a resize cursor: no sash lies between the Explorer and the editor.');
      await page.mouse.move(grip.x, grip.y);
      await page.mouse.down();
      await page.mouse.move(grip.x + by / 2, grip.y);
      await page.mouse.move(grip.x + by, grip.y);
      await page.mouse.up();
      explorer = await soon(page, async () => {
        const now = await rectOf(TESTIDS.explorer);
        return now && Math.abs(now.width - from.width - by) <= 4 ? now : null;
      }, async () => `The sash was dragged ${by} px, and the Explorer went from ${from.width} px wide to ${(await rectOf(TESTIDS.explorer))?.width} px.`);
    }
    assert.ok(Math.abs(explorer.left - start.left) <= 0.5,
      `The Explorer's left edge went from ${start.left} to ${explorer.left} px: it is not its right edge, where the sash is, that the drag moved.`);
    await finish(opened);
  });

  // A strip's name in front, clicked, collapses its side to the strip: the Explorer takes no room, and the strip with
  // its three names stays. A click on the name again opens it at the width it had. The name is teal while its panel is
  // shown, and only then: a collapsed side shows no view, so none of its names is marked.
  test('a side panel collapses to its strip and opens again', async () => {
    const opened = await openPage(browser);
    const { page } = opened;
    const widthOf = async () => (await page.evaluate(rectOfTestId, TESTIDS.explorer))?.width ?? 0;
    const names = ['Explorer', 'Tools', 'Validation'];
    const tab = (name) => page.getByRole('tab', { name, exact: true });
    await soon(page, async () => (await tab('Explorer').count()) > 0,
      'The page has no strip tab named Explorer (role "tab"), so there is no name to click to collapse the left side.');
    // The colour of the innermost element that holds the name on the strip.
    const colourOf = (name) => page.evaluate((wanted) => {
      const strip = [...document.querySelectorAll('[role="tab"]')].find((el) => el.textContent.trim() === wanted);
      if (!strip) return null;
      const inner = [strip, ...strip.querySelectorAll('*')].filter((el) => el.textContent.trim() === wanted).pop();
      return getComputedStyle(inner).color;
    }, name);
    const before = await soon(page, widthOf, `The Explorer takes no room before anything is clicked (data-testid "${TESTIDS.explorer}").`);
    await soon(page, async () => (await colourOf('Explorer')) === TEAL,
      async () => `With the Explorer shown, its name on the strip is ${await colourOf('Explorer')}, not teal (${TEAL}).`);
    await tab('Explorer').click();
    await soon(page, async () => (await widthOf()) < 1,
      async () => `A click on the Explorer's name in front left it ${await widthOf()} px wide, from ${before}: the left side did not collapse.`);
    for (const name of names) {
      assert.ok(await tab(name).isVisible(), `With the left side collapsed, the strip does not show the name "${name}".`);
    }
    await soon(page, async () => { const colour = await colourOf('Explorer'); return colour && colour !== TEAL; },
      `With the left side collapsed, the Explorer's name on the strip is still teal (${TEAL}): it is marked as shown, and no view is.`);
    await tab('Explorer').click();
    const after = await soon(page, async () => { const w = await widthOf(); return Math.abs(w - before) <= 4 ? w : null; },
      async () => `A click on the Explorer's name again opened it ${await widthOf()} px wide, where it was ${before} px wide before it collapsed.`);
    assert.ok(after > 0, 'the Explorer is shown again');
    await soon(page, async () => (await colourOf('Explorer')) === TEAL,
      async () => `With the Explorer opened again, its name on the strip is ${await colourOf('Explorer')}, not teal (${TEAL}).`);
    await finish(opened);
  });

  // The Explorer's sash is dragged 80 px and the page reloaded: the Explorer has the width the drag gave it. The same
  // for Details, whose sash is dragged 60 px. Then the window is made 500 px wide, too narrow for both sides, and 1400
  // again: both sides come back to the widths the drags gave them, at once and after a reload, so a narrow window has
  // rewritten nothing. The right side is collapsed last (a click on Details): it stays collapsed through a reload, and
  // opens at the width it had. All through the page, never the storage.
  test('the panels\' sizes are remembered across a reload, and a narrow window does not rewrite them', async () => {
    const opened = await openPage(browser);
    const { page } = opened;
    const rectOf = (testid) => page.evaluate(rectOfTestId, testid);
    const reload = async () => { await page.reload(); await page.waitForSelector(byTestId(TESTIDS.app)); };
    // Drags the sash at x = `edge` of the panel `testid` names by `by` px, and returns the panel once it is `wider` px wider.
    const dragSash = async (testid, name, edge, by, wider) => {
      const from = await rectOf(testid);
      assert.ok(from, `The page shows no ${name} (data-testid "${testid}"), so there is no width to keep.`);
      const grip = await page.evaluate(sashAt, [from[edge], (from.top + from.bottom) / 2]);
      assert.ok(grip, `Nothing at the ${name}'s ${edge} edge shows a resize cursor: no sash lies between the ${name} and the editor.`);
      await page.mouse.move(grip.x, grip.y);
      await page.mouse.down();
      await page.mouse.move(grip.x + by / 2, grip.y);
      await page.mouse.move(grip.x + by, grip.y);
      await page.mouse.up();
      return soon(page, async () => { const now = await rectOf(testid); return now && Math.abs(now.width - from.width - wider) <= 4 ? now : null; },
        async () => `The ${name}'s sash was dragged ${by} px, and the ${name} went from ${from.width} px wide to ${(await rectOf(testid))?.width} px.`);
    };
    // Waits until the panel is as wide as its drag left it.
    const widthNow = async (testid, name, dragged, when) => {
      await soon(page, () => rectOf(testid), `${when}: the page shows no ${name}.`);
      return soon(page, async () => { const now = await rectOf(testid); return now && Math.abs(now.width - dragged.width) <= 4 ? now.width : null; },
        async () => `${when}: the ${name} is ${(await rectOf(testid))?.width} px wide; the drag left it ${dragged.width} px wide.`);
    };

    const explorer = await dragSash(TESTIDS.explorer, 'Explorer', 'right', 80, 80);
    await reload();
    await widthNow(TESTIDS.explorer, 'Explorer', explorer, 'After a reload');

    const details = await dragSash(TESTIDS.details, 'Details', 'left', -60, 60);
    await reload();
    await widthNow(TESTIDS.details, 'Details', details, 'After Details\'s sash was dragged and the page reloaded');
    await widthNow(TESTIDS.explorer, 'Explorer', explorer, 'After Details\'s sash was dragged and the page reloaded');

    await page.setViewportSize({ width: 500, height: HEIGHT });
    await frame(page);
    await page.setViewportSize({ width: 1400, height: HEIGHT });
    await frame(page);
    await widthNow(TESTIDS.explorer, 'Explorer', explorer, 'After the window was made 500 px wide, then 1400 again');
    await widthNow(TESTIDS.details, 'Details', details, 'After the window was made 500 px wide, then 1400 again');
    await reload();
    await widthNow(TESTIDS.explorer, 'Explorer', explorer, 'After the window was made 500 px wide, then 1400 again, and reloaded');
    await widthNow(TESTIDS.details, 'Details', details, 'After the window was made 500 px wide, then 1400 again, and reloaded');

    const detailsTab = page.getByRole('tab', { name: 'Details', exact: true });
    await detailsTab.click();
    await soon(page, async () => !(await rectOf(TESTIDS.details)),
      'A click on the Details name in front did not collapse the right side: Details still takes room.');
    await reload();
    await soon(page, async () => (await detailsTab.count()) > 0, 'After a reload, the strip of Details is gone.');
    assert.equal(await rectOf(TESTIDS.details), null, 'After a reload, Details takes room again: the collapsed right side was not remembered.');
    await detailsTab.click();
    await widthNow(TESTIDS.details, 'Details', details, 'After Details was collapsed, the page reloaded and Details opened again');
    await finish(opened);
  });

  // In a fresh browser each side panel has the plan's width beside its strip, which the strip adds to.
  test('in a fresh browser the Explorer is 280 px wide and Details 320 px, beside their strips', async () => {
    const opened = await openPage(browser);
    const { page } = opened;
    const widthOf = async (testid) => (await page.evaluate(rectOfTestId, testid))?.width ?? null;
    for (const [testid, name, width] of [[TESTIDS.explorer, 'Explorer', 280], [TESTIDS.details, 'Details', 320]]) {
      await soon(page, async () => { const now = await widthOf(testid); return now !== null && Math.abs(now - width) <= 1; },
        async () => `In a fresh browser the ${name} (data-testid "${testid}") is ${await widthOf(testid)} px wide beside its strip, not ${width} px.`);
    }
    await finish(opened);
  });

  // The layout record is written as another window left it, then the page reloaded. Widths of 5000 px, as a far wider
  // screen could leave them, are cut down: neither side takes more than 40% of the window, and the editor keeps at
  // least 20% of it between them. Widths of 10 px, too narrow for any panel, give way to a fresh browser's widths.
  test('a remembered width that does not fit the window is not taken as it is', async () => {
    const opened = await openPage(browser);
    const { page } = opened;
    const WINDOW = 1400;
    const rectOf = (testid) => page.evaluate(rectOfTestId, testid);
    const remembered = async (size) => {
      await page.evaluate(([key, text]) => localStorage.setItem(key, text),
        ['grasp-app:layout:1', JSON.stringify({ left: { size, collapsed: false, front: 'explorer' }, right: { size, collapsed: false } })]);
      await page.reload();
      await page.waitForSelector(byTestId(TESTIDS.app));
      const explorer = await soon(page, () => rectOf(TESTIDS.explorer), `With widths of ${size} px remembered, the page shows no Explorer.`);
      const details = await soon(page, () => rectOf(TESTIDS.details), `With widths of ${size} px remembered, the page shows no Details.`);
      await frame(page);
      return { explorer: (await rectOf(TESTIDS.explorer)) ?? explorer, details: (await rectOf(TESTIDS.details)) ?? details };
    };

    const wide = await remembered(5000);
    for (const [name, rect] of [['Explorer', wide.explorer], ['Details', wide.details]]) {
      assert.ok(rect.width <= 0.4 * WINDOW,
        `With widths of 5000 px remembered, the ${name} is ${rect.width} px wide in a window of ${WINDOW}: more than 40% of it.`);
    }
    const editor = wide.details.left - wide.explorer.right;
    assert.ok(editor >= 0.2 * WINDOW,
      `With widths of 5000 px remembered, the editor is left ${editor} px between the Explorer and Details, in a window of ${WINDOW}: less than 20% of it.`);

    const narrow = await remembered(10);
    for (const [name, rect, width] of [['Explorer', narrow.explorer, 280], ['Details', narrow.details, 320]]) {
      assert.ok(Math.abs(rect.width - width) <= 1,
        `With widths of 10 px remembered, the ${name} is ${rect.width} px wide, not the ${width} px of a fresh browser.`);
    }
    await finish(opened);
  });

  // The computed font-family of the bar, of a strip's name and of the empty editor's card title starts with Roboto;
  // the document holds a loaded Roboto face; and the page's requests include its fonts/roboto-*.woff2 files, none of
  // them (nor any other request) outside the page's folder.
  test('the text is drawn in Roboto, loaded from the page\'s folder', async () => {
    const opened = await openPage(browser);
    const { page } = opened;
    await soon(page, async () => (await page.locator(byTestId(TESTIDS.topBar)).count()) > 0,
      `The page has no top bar (data-testid "${TESTIDS.topBar}"), so there is no text of the shell to look at.`);
    await page.evaluate(() => document.fonts.ready);
    const families = await page.evaluate(([bar]) => {
      const family = (el) => (el ? getComputedStyle(el).fontFamily : null);
      const strip = [...document.querySelectorAll('[role="tab"]')].find((el) => el.textContent.trim() === 'Explorer');
      const card = [...document.querySelectorAll('*')].find((el) => el.children.length === 0 && el.textContent.trim() === 'Open a model');
      return { 'top bar': family(document.querySelector(bar)), 'strip\'s name': family(strip), 'empty editor\'s card title': family(card) };
    }, [byTestId(TESTIDS.topBar)]);
    for (const [where, family] of Object.entries(families)) {
      assert.ok(family && /^["']?Roboto\b/i.test(family), `The ${where} is drawn in ${family === null ? 'nothing: it is not on the page' : family}, not in Roboto first.`);
    }
    const loaded = await page.evaluate(() => ({
      check: document.fonts.check('13px Roboto'),
      faces: [...document.fonts].filter((face) => /roboto/i.test(face.family)).map((face) => face.status),
    }));
    assert.ok(loaded.check && loaded.faces.includes('loaded'),
      `The document holds no loaded Roboto face: check('13px Roboto') is ${loaded.check}, and its Roboto faces are ${JSON.stringify(loaded.faces)}.`);
    const fonts = opened.requests.filter((url) => url.startsWith(DIST_URL) && /\/fonts\/roboto-[^/]*\.woff2$/.test(url));
    assert.ok(fonts.length > 0, `The page asked for no fonts/roboto-*.woff2 file under its folder. Its requests: ${opened.requests.join(', ')}.`);
    const outside = opened.requests.filter((url) => !/^(data|blob|about):/.test(url) && !url.startsWith(DIST_URL));
    assert.deepEqual(outside, [], `The page asked for ${outside.length} URLs outside its own folder: ${outside.join(', ')}.`);
    await finish(opened);
  });

  // The computed font-size of the innermost element holding each text: 13 px for the bar's name, a strip's name, the
  // Explorer panel's title, the card's sentence and its button; with the example open, for the bar's file name and
  // the view's tab too. The tooltip of the bar's Open, shown by hovering it, is 12 px.
  test('the shell\'s text is 13 px', async () => {
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    await soon(page, async () => (await page.locator(byTestId(TESTIDS.topBar)).count()) > 0,
      `The page has no top bar (data-testid "${TESTIDS.topBar}"), so there is no text of the shell to measure.`);
    await page.evaluate(() => document.fonts.ready);
    const check = async (what, size, root, text, starts = false) => {
      const found = await soon(page, () => page.evaluate(fontSizeOf, [root, text, starts]), `The page does not show ${what}, so its size cannot be read.`);
      assert.equal(found, size, `${what[0].toUpperCase()}${what.slice(1)} is drawn at ${found}, not at ${size}.`);
    };
    await check('the bar\'s "Grasp"', '13px', byTestId(TESTIDS.topBar), 'Grasp');
    await check('the strip\'s name "Explorer"', '13px', '[role="tab"]', 'Explorer');
    await check('the Explorer panel\'s title', '13px', byTestId(TESTIDS.explorer), 'Explorer');
    await check('the card\'s sentence on where the example is', '13px', 'body', 'The example is', true);
    await check('the card\'s button "Open a file…"', '13px', 'button', 'Open a file…');

    await openStateFile(page, stateFileAt(EXAMPLE));
    const view = JSON.parse(fs.readFileSync(EXAMPLE, 'utf8')).model.views[0];
    await viewTab(page, view);
    await check('the bar\'s file name', '13px', byTestId(TESTIDS.fileName), 'stronghold-proof.json', true);
    await check(`the tab "${tabTitle(view)}"`, '13px', '[role="tab"]', tabTitle(view));

    await page.locator(byTestId(TESTIDS.open)).hover();
    await soon(page, async () => (await page.getByRole('tooltip').count()) > 0, 'Hovering the bar\'s Open shows no tooltip (role "tooltip").', BROWSER_FRAMES);
    await check('the tooltip of the bar\'s Open', '12px', '[role="tooltip"]', null);
    await finish(opened);
  });

  // Tab, pressed in a fresh page, goes to the bar's Open, then to the Explorer's name on its strip, then to the card's
  // button. Each shows where the focus is by a solid outline of at least 2 px: white on the ink bar, teal elsewhere.
  // The strip's name draws it on its ::after, as Dockview does for a tab.
  test('keyboard focus can be seen', async () => {
    const opened = await openPage(browser);
    const { page } = opened;
    const button = page.getByRole('button', { name: 'Open a file…', exact: true });
    await soon(page, async () => (await button.count()) > 0, 'The empty editor shows no card with a button named "Open a file…", so there are not three stops for Tab.');
    const stop = async (what, is, colour, pseudo = null) => {
      await page.keyboard.press('Tab');
      await frame(page);
      const ring = await page.evaluate(focusRing, pseudo);
      assert.ok(ring && is(ring), `Tab should have reached ${what}; the focus is on ${ring ? `a ${ring.role} "${ring.text}"` : 'nothing'}.`);
      assert.ok(ring.focusVisible, `With the keyboard's focus on ${what}, it does not match :focus-visible.`);
      const where = pseudo ? `${what} (its ${pseudo})` : what;
      assert.ok(ring.style === 'solid' && ring.width >= 2 && ring.color === colour,
        `With the keyboard's focus on ${where}, its outline is ${ring.style} ${ring.width}px ${ring.color}: not solid, 2 px or more, and ${colour}, so the focus cannot be seen.`);
    };
    await stop('the bar\'s Open', (ring) => ring.testid === TESTIDS.open, WHITE);
    await stop('the Explorer\'s name on its strip', (ring) => ring.role === 'tab' && ring.text === 'Explorer', TEAL, '::after');
    await stop('the card\'s button "Open a file…"', (ring) => ring.role === 'button' && ring.text === 'Open a file…', TEAL);
    await finish(opened);
  });

  // The card's button asks for a file through a file input; the test answers with browser.json, which has three views.
  // The bar then names the file, in full in its title too, for when the bar cuts it short, and each view has one tab.
  test('a file opens from the card, and each of its views gets a tab', async () => {
    const views = browserViews();
    assert.deepEqual(views.map(tabTitle), ['proofStructure : GeneralView', 'modelTree : BrowserView', 'pageTree : BrowserView'], 'the fixture is the one this test was written for');
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    const button = page.getByRole('button', { name: 'Open a file…', exact: true });
    await soon(page, async () => (await button.count()) > 0, 'The empty editor shows no card with a button named "Open a file…".');
    let chooser = null;
    page.waitForEvent('filechooser', { timeout: WAIT }).then((asked) => { chooser = asked; }, () => {});
    await button.click();
    await soon(page, async () => chooser, 'A click on the card\'s button "Open a file…" asked for no file through a file input.', BROWSER_FRAMES);
    await chooser.setFiles({ name: 'browser.json', mimeType: 'application/json', buffer: fs.readFileSync(BROWSER) });
    await soon(page, () => page.evaluate((selector) => (document.querySelector(selector)?.textContent ?? '').includes('browser.json'), byTestId(TESTIDS.fileName)),
      async () => `The bar's file name (data-testid "${TESTIDS.fileName}") reads "${await page.locator(byTestId(TESTIDS.fileName)).textContent()}", not browser.json.`);
    const title = await page.locator(byTestId(TESTIDS.fileName)).getAttribute('title');
    assert.equal(title, 'browser.json', `The bar's file name (data-testid "${TESTIDS.fileName}") has the title ${JSON.stringify(title)}, not the file's name: cut short, the name could not be read in full.`);
    for (const view of views) await viewTab(page, view);
    await finish(opened);
  });

  // The example is open; the bar's Open is given a file the session refuses (a "model" that is a string). An alert says
  // why and names broken.json, and the example stays: the bar names it and its tab is there. The page logs no error.
  test('a file that cannot be opened says why, and the open file stays', async () => {
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    await openStateFile(page, stateFileAt(EXAMPLE));
    const view = JSON.parse(fs.readFileSync(EXAMPLE, 'utf8')).model.views[0];
    await viewTab(page, view);
    const broken = stateFileOf('broken.json', { format: 'grasp/2', model: 'not a model' });
    let chooser = null;
    page.waitForEvent('filechooser', { timeout: WAIT }).then((asked) => { chooser = asked; }, () => {});
    await page.locator(byTestId(TESTIDS.open)).click();
    await soon(page, async () => chooser, 'A click on the bar\'s Open asked for no file through a file input.', BROWSER_FRAMES);
    await chooser.setFiles({ name: broken.name, mimeType: 'application/json', buffer: broken.buffer });
    const alert = await soon(page, async () => {
      const texts = await page.getByRole('alert').allTextContents();
      return texts.find((text) => text.includes('broken.json')) ?? null;
    }, 'The page was given broken.json, which cannot be opened, and shows no element with role "alert" that names it.');
    assert.match(alert, /state file|holds no model/, `The alert does not say why broken.json cannot be opened. It reads "${alert}".`);
    const name = await page.locator(byTestId(TESTIDS.fileName)).textContent();
    assert.ok(name.includes('stronghold-proof.json') && !name.includes('broken.json'), `The bar reads "${name}": the file that was open did not stay.`);
    await viewTab(page, view);
    await finish(opened);
  });

  // Three tries to take Explorer or Details out of its strip, as a person does, with the mouse pressed, moved in
  // several steps and released: by the name into the editor; by the blank part of the strip below the names; and, for
  // Details, with Shift held. After each, the page's tabs are the same, each of the four names is exactly where it
  // was on its strip, and nothing floats.
  test('a side view cannot leave its strip', async () => {
    const opened = await openPage(browser);
    const { page } = opened;
    const tab = (name) => page.getByRole('tab', { name, exact: true });
    await soon(page, async () => (await tab('Explorer').count()) > 0, 'The page has no strip tab named Explorer (role "tab"), so there is nothing to drag.');
    const names = () => page.getByRole('tab').evaluateAll((tabs) => tabs.map((el) => el.textContent.trim()));
    const before = await names();
    const places = await stripRects(page);
    const centre = async (name) => { const box = await tab(name).boundingBox(); return { x: box.x + box.width / 2, y: box.y + box.height / 2, box }; };
    const check = async (when) => {
      assert.deepEqual(await names(), before, `${when}: the page's tabs changed.`);
      const moved = movedStrip(places, await stripRects(page));
      assert.equal(moved, null, `${when}: ${moved}, so it is no longer in its strip as it was.`);
      const floating = await page.locator('.dv-resize-container, .dv-floating-overlay-host > *').count();
      assert.equal(floating, 0, `${when}: ${floating} floating panel(s) appeared.`);
    };
    const middle = { x: 700, y: 450 };
    await dragMouse(page, await centre('Explorer'), middle);
    await check('After the Explorer was dragged by its name into the editor');
    const last = await centre('Validation');
    await dragMouse(page, { x: last.x, y: last.box.y + last.box.height + 120 }, middle);
    await check('After the left strip was dragged by its blank part into the editor');
    const details = await centre('Details');
    await page.keyboard.down('Shift');
    await dragMouse(page, details, { x: 700, y: 300 });
    await page.keyboard.up('Shift');
    await check('After Details was pressed with Shift and moved');
    await finish(opened);
  });

  // With browser.json open, the tab of modelTree is dragged with the mouse onto the middle of the Explorer, onto the
  // name Tools on the left strip, and onto the middle of Details. After each, the four names are where they were on
  // their strips, and the view's tab is still in the editor, between the Explorer and Details.
  test('a view\'s tab cannot be dropped into a strip or a side panel', async () => {
    const view = browserViews().find((v) => v.name === 'modelTree');
    assert.ok(view, 'the fixture is the one this test was written for');
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    await openStateFile(page, stateFileAt(BROWSER));
    const tab = await viewTab(page, view);
    const rectOf = (testid) => page.evaluate(rectOfTestId, testid);
    const middleOf = (rect) => ({ x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 });
    const explorer = await soon(page, () => rectOf(TESTIDS.explorer), 'The page shows no Explorer to drop a tab on.');
    const details = await soon(page, () => rectOf(TESTIDS.details), 'The page shows no Details to drop a tab on.');
    const places = await stripRects(page);
    const tools = places.Tools;
    assert.ok(tools, 'The left strip shows no name "Tools" to drop a tab on.');
    const targets = [
      ['the Explorer', middleOf(explorer)],
      ['the name Tools on the left strip', { x: tools.x + tools.width / 2, y: tools.y + tools.height / 2 }],
      ['Details', middleOf(details)],
    ];
    for (const [where, to] of targets) {
      const box = await tab.boundingBox();
      await dragMouse(page, { x: box.x + box.width / 2, y: box.y + box.height / 2 }, to, 12);
      const when = `After the tab "${tabTitle(view)}" was dragged onto ${where}`;
      const moved = movedStrip(places, await stripRects(page));
      assert.equal(moved, null, `${when}: ${moved}.`);
      assert.equal(await tab.count(), 1, `${when}: the page has ${await tab.count()} tabs of that title.`);
      const now = await tab.boundingBox();
      assert.ok(now && now.x >= explorer.right - 0.5 && now.x + now.width <= details.left + 0.5,
        `${when}: the tab runs from ${now?.x} to ${now ? now.x + now.width : undefined} px, outside the editor, which lies between ${explorer.right} and ${details.left} px.`);
    }
    await finish(opened);
  });

  // With browser.json open, each view's tab is closed by its close control (inside the tab, found by hovering the tab
  // and the class of Dockview's default close action). The card then offers "Show the views again", and a click on it
  // brings back all three tabs.
  test('with every tab closed, the card offers to show the views again', async () => {
    const views = browserViews();
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    await openStateFile(page, stateFileAt(BROWSER));
    for (const view of views) {
      const tab = await viewTab(page, view);
      await tab.hover();
      const close = tab.locator('.dv-default-tab-action');
      await soon(page, async () => (await close.count()) > 0, `The tab "${tabTitle(view)}" has no close control (class dv-default-tab-action).`);
      await close.first().click();
      await soon(page, async () => (await page.getByRole('tab', { name: tabTitle(view), exact: true }).count()) === 0,
        `The close control of "${tabTitle(view)}" was clicked and its tab is still there.`);
    }
    const show = page.getByRole('button', { name: 'Show the views again', exact: true });
    await soon(page, async () => (await show.count()) > 0, 'With every tab closed, the editor shows no button "Show the views again".');
    await show.click();
    for (const view of views) await viewTab(page, view);
    await finish(opened);
  });

  // With browser.json open, the tab of modelTree is dragged with Shift held, so it floats over the editor, and the
  // other two views' tabs are closed. The card then says how many views are closed, two of three, not that all are;
  // and "Show the views again" brings the two back into the editor, between the Explorer and Details, not into the
  // floating window, and with nothing left to show the card offers it no more.
  test('with a view floating, the card says what is closed, and the views come back into the editor', async () => {
    const views = browserViews();
    const floated = views.find((v) => v.name === 'modelTree');
    const closed = views.filter((v) => v !== floated);
    assert.deepEqual([views.length, closed.length], [3, 2], 'the fixture is the one this test was written for');
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    await openStateFile(page, stateFileAt(BROWSER));
    const floats = () => page.locator('.dv-resize-container').count();
    const box = await (await viewTab(page, floated)).boundingBox();
    await page.keyboard.down('Shift');
    await dragMouse(page, { x: box.x + box.width / 2, y: box.y + box.height / 2 }, { x: 700, y: 500 });
    await page.keyboard.up('Shift');
    await soon(page, async () => (await floats()) === 1,
      async () => `The tab "${tabTitle(floated)}" was dragged with Shift held, and ${await floats()} panels float (class dv-resize-container), not one.`);
    for (const view of closed) {
      const tab = await viewTab(page, view);
      await tab.hover();
      const close = tab.locator('.dv-default-tab-action');
      await soon(page, async () => (await close.count()) > 0, `The tab "${tabTitle(view)}" has no close control (class dv-default-tab-action).`);
      await close.first().click();
      await soon(page, async () => (await page.getByRole('tab', { name: tabTitle(view), exact: true }).count()) === 0,
        `The close control of "${tabTitle(view)}" was clicked and its tab is still there.`);
    }
    const show = page.getByRole('button', { name: 'Show the views again', exact: true });
    await soon(page, async () => (await show.count()) > 0, 'With two views closed and one floating, the editor shows no button "Show the views again".');
    const said = await page.locator(byTestId(TESTIDS.dock)).textContent();
    assert.ok(!said.includes('All of browser.json’s views are closed'),
      'With modelTree floating, the card says "All of browser.json’s views are closed": one of them is open.');
    assert.ok(said.includes('2 of browser.json’s 3 views are closed'), `The card does not say "2 of browser.json’s 3 views are closed". The dock reads "${said}".`);

    await show.click();
    const explorer = await page.evaluate(rectOfTestId, TESTIDS.explorer);
    const details = await page.evaluate(rectOfTestId, TESTIDS.details);
    assert.ok(explorer && details, 'The page shows the Explorer and Details, between which the editor lies.');
    for (const view of closed) {
      const tab = await viewTab(page, view);
      assert.ok(!(await tab.evaluate((el) => !!el.closest('.dv-resize-container'))),
        `"Show the views again" put the tab "${tabTitle(view)}" into the floating window, not back into the editor.`);
      const now = await tab.boundingBox();
      assert.ok(now && now.x >= explorer.right - 0.5 && now.x + now.width <= details.left + 0.5,
        `"Show the views again" put the tab "${tabTitle(view)}" from ${now?.x} to ${now ? now.x + now.width : undefined} px, outside the editor, which lies between ${explorer.right} and ${details.left} px.`);
    }
    await soon(page, async () => (await show.count()) === 0, 'With every view shown again, the page still has a button "Show the views again".');
    await finish(opened);
  });
});
