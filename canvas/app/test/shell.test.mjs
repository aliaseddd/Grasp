// The page's shell, opened from file:// in Chromium: the first four of slice 1's "Done when" checks. The first passes.
// The other three were written in step 3, before what they check, and each is marked todo until its step builds it:
// node's runner then reports its failure as todo, not as a failure.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { after, afterEach, before, describe, test } from 'node:test';
import { buildFiles } from '../build.mjs';
import {
  byTestId, closePages, drawn, EXAMPLE, finish, frame, launch, nodeOf, openPage, openStateFile, soon, stateFileAt, tabTitle,
  TESTIDS, untilDrawn, viewTab,
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
  test('no header palette or button row exists', { todo: 'step 5 builds the shell' }, async () => {
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
  test('a sash drag resizes the Explorer', { todo: 'step 5 builds the shell' }, async () => {
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
});
