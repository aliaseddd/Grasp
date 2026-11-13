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
  // its three names stays. A click on the name again opens it at the width it had.
  test('a side panel collapses to its strip and opens again', async () => {
    const opened = await openPage(browser);
    const { page } = opened;
    const widthOf = async () => (await page.evaluate(rectOfTestId, TESTIDS.explorer))?.width ?? 0;
    const names = ['Explorer', 'Tools', 'Validation'];
    const tab = (name) => page.getByRole('tab', { name, exact: true });
    await soon(page, async () => (await tab('Explorer').count()) > 0,
      'The page has no strip tab named Explorer (role "tab"), so there is no name to click to collapse the left side.');
    const before = await soon(page, widthOf, `The Explorer takes no room before anything is clicked (data-testid "${TESTIDS.explorer}").`);
    await tab('Explorer').click();
    await soon(page, async () => (await widthOf()) < 1,
      async () => `A click on the Explorer's name in front left it ${await widthOf()} px wide, from ${before}: the left side did not collapse.`);
    for (const name of names) {
      assert.ok(await tab(name).isVisible(), `With the left side collapsed, the strip does not show the name "${name}".`);
    }
    await tab('Explorer').click();
    const after = await soon(page, async () => { const w = await widthOf(); return Math.abs(w - before) <= 4 ? w : null; },
      async () => `A click on the Explorer's name again opened it ${await widthOf()} px wide, where it was ${before} px wide before it collapsed.`);
    assert.ok(after > 0, 'the Explorer is shown again');
    await finish(opened);
  });

  // The sash is dragged 80 px, the page reloaded, and the Explorer has the width the drag gave it. Then the window is
  // made 800 px wide, back to 1400, and reloaded: a narrow window must not have rewritten the width. The right side is
  // collapsed last (a click on Details) and stays collapsed through a reload. All through the page, never the storage.
  test('the panels\' sizes are remembered across a reload, and a narrow window does not rewrite them', async () => {
    const opened = await openPage(browser);
    const { page } = opened;
    const rectOf = (testid) => page.evaluate(rectOfTestId, testid);
    const reload = async () => { await page.reload(); await page.waitForSelector(byTestId(TESTIDS.app)); };
    const start = await rectOf(TESTIDS.explorer);
    assert.ok(start, `The page shows no Explorer (data-testid "${TESTIDS.explorer}"), so there is no width to keep.`);
    const grip = await page.evaluate(sashAt, [start.right, (start.top + start.bottom) / 2]);
    assert.ok(grip, 'Nothing at the Explorer\'s right edge shows a resize cursor: no sash lies between the Explorer and the editor.');
    await page.mouse.move(grip.x, grip.y);
    await page.mouse.down();
    await page.mouse.move(grip.x + 40, grip.y);
    await page.mouse.move(grip.x + 80, grip.y);
    await page.mouse.up();
    const dragged = await soon(page, async () => { const now = await rectOf(TESTIDS.explorer); return now && Math.abs(now.width - start.width - 80) <= 4 ? now : null; },
      async () => `The sash was dragged 80 px, and the Explorer went from ${start.width} px wide to ${(await rectOf(TESTIDS.explorer))?.width} px.`);

    const widthNow = async (when) => {
      await soon(page, () => rectOf(TESTIDS.explorer), `${when}: the page shows no Explorer.`);
      return soon(page, async () => { const now = await rectOf(TESTIDS.explorer); return now && Math.abs(now.width - dragged.width) <= 4 ? now.width : null; },
        async () => `${when}: the Explorer is ${(await rectOf(TESTIDS.explorer))?.width} px wide; the drag left it ${dragged.width} px wide.`);
    };
    await reload();
    await widthNow('After a reload');
    await page.setViewportSize({ width: 800, height: HEIGHT });
    await frame(page);
    await page.setViewportSize({ width: 1400, height: HEIGHT });
    await frame(page);
    await reload();
    await widthNow('After the window was made 800 px wide, then 1400 again, and reloaded');

    await page.getByRole('tab', { name: 'Details', exact: true }).click();
    await soon(page, async () => !(await rectOf(TESTIDS.details)),
      'A click on the Details name in front did not collapse the right side: Details still takes room.');
    await reload();
    await soon(page, async () => (await page.getByRole('tab', { name: 'Details', exact: true }).count()) > 0, 'After a reload, the strip of Details is gone.');
    assert.equal(await rectOf(TESTIDS.details), null, 'After a reload, Details takes room again: the collapsed right side was not remembered.');
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

  // The card's button asks for a file through a file input; the test answers with browser.json, which has three views.
  // The bar then names the file and each view has one tab.
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
  // Details, with Shift held. After each, the tabs are the same, the Explorer's is still at the window's left edge,
  // and Details's at the right edge, and nothing floats.
  test('a side view cannot leave its strip', async () => {
    const opened = await openPage(browser);
    const { page } = opened;
    const tab = (name) => page.getByRole('tab', { name, exact: true });
    await soon(page, async () => (await tab('Explorer').count()) > 0, 'The page has no strip tab named Explorer (role "tab"), so there is nothing to drag.');
    const names = () => page.getByRole('tab').evaluateAll((tabs) => tabs.map((el) => el.textContent.trim()));
    const before = await names();
    const drag = async (from, to, steps = 8) => {
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      for (let i = 1; i <= steps; i++) await page.mouse.move(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
      await page.mouse.up();
      await frame(page);
      await frame(page);
    };
    const centre = async (name) => { const box = await tab(name).boundingBox(); return { x: box.x + box.width / 2, y: box.y + box.height / 2, box }; };
    const check = async (when) => {
      assert.deepEqual(await names(), before, `${when}: the page's tabs changed.`);
      const explorer = await tab('Explorer').boundingBox();
      assert.ok(explorer && explorer.x <= 40, `${when}: the Explorer's tab is at ${explorer?.x} px from the window's left, no longer in the left strip.`);
      const details = await tab('Details').boundingBox();
      assert.ok(details && details.x + details.width >= 1400 - 40, `${when}: the Details tab ends at ${details?.x + details?.width} px of a window 1400 wide, no longer in the right strip.`);
      const floating = await page.locator('.dv-resize-container, .dv-floating-overlay-host > *').count();
      assert.equal(floating, 0, `${when}: ${floating} floating panel(s) appeared.`);
    };
    const middle = { x: 700, y: 450 };
    await drag(await centre('Explorer'), middle);
    await check('After the Explorer was dragged by its name into the editor');
    const last = await centre('Validation');
    await drag({ x: last.x, y: last.box.y + last.box.height + 120 }, middle);
    await check('After the left strip was dragged by its blank part into the editor');
    const details = await centre('Details');
    await page.keyboard.down('Shift');
    await drag(details, { x: 700, y: 300 });
    await page.keyboard.up('Shift');
    await check('After Details was pressed with Shift and moved');
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
});
