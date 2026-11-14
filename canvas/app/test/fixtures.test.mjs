// The example and the nine fixtures in the page, as wholes (plan/slice-2.md: criteria 1 and 2; section 8, package
// 2-14; section 9, checks 1 and 2). Written by the scaffold; package 2-14, the lead's, keeps them true as the
// packages land.
//
//   - Check 1, criterion 2: every view of the ten files is drawn by its own body, and shows one thing for each entry
//     its reader lists. Marked todo by the scaffold: six of the 17 views are of kinds whose body packages 2-10 to
//     2-13 build, and show the card until then. The mark comes off when the last of those four lands.
//   - Check 2: each file, opened and saved from the page, exports its pinned text. It passes from the scaffold on,
//     and is held.
//   - Line 23 of section 7: two views of one model side by side, each drawn.
//
// What a view must show is asked of its kind's reader in Node (core/readers: readView and listed), on the file as the
// core opens it; what it shows is read from the page through thingsIn(). Both sides are sets of things (`el:<id>`,
// `rel:<id>`), since one thing may be drawn twice (a lifeline's head and line, a matrix's two heads of one element).
// So a body that draws a card, leaves out a thing its reader lists, or draws a thing its reader does not list fails
// here, whatever its kind; one that draws a listed thing more often than it should does not.

import assert from 'node:assert/strict';
import path from 'node:path';
import { after, afterEach, before, describe, test } from 'node:test';
import { clock, loadCore, readText, stateFiles } from './core.mjs';
import {
  bodyOf, cardOf, closePages, exportOf, finish, frame, launch, lib, modelOf, openIn, planeOf, saveAndRead, soon, stateFileAt, TEN, thingsIn, viewTab,
} from './helpers.mjs';

/** The ten files, each with the file that pins its text: the example's is format1.sysml (core.mjs, stateFiles). */
const FILES = stateFiles().filter(({ file }) => TEN.includes(file));

/** What each view of a file must show: for each of the model's views, the things its kind's reader lists, sorted, or null for a kind with no reader yet. */
async function listedIn(file) {
  const core = await loadCore();
  const session = core.openText(lib, readText(file), { name: path.basename(file) }, { now: clock() });
  return new Map(session.model.views.map((view) => {
    const read = core.readView(session, view.id);
    return [view.id, read ? [...new Set(core.readerOf(read.renderer).listed(read.data).map((entry) => `${entry.type}:${entry.id}`))].sort() : null];
  }));
}

/** Brings a view's tab to the front, whatever draws the view. */
async function showTab(page, view) {
  const tab = await viewTab(page, view);
  if ((await tab.getAttribute('aria-selected')) !== 'true') await tab.click();
}

/** What a view's tab holds now: whether a plane or a component body is its root, and the card's words when it shows the card. */
const rootOf = (page, view) => page.evaluate(([plane, body, sentence]) => {
  const el = document.querySelector(body) ?? document.querySelector(plane);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { body: el.matches(body) ? 'component' : 'plane', card: el.textContent.includes(sentence), x: r.x, y: r.y, width: r.width, height: r.height };
}, [planeOf(view.id), bodyOf(view.id), cardOf(view)[0]]);

/** Waits until a view's body shows exactly the things listed, and returns null; or says how what it shows differs. */
async function differs(page, view, listed) {
  let shown = [];
  for (let frames = 0; frames < 60; frames++) {
    shown = await thingsIn(page, view.id);
    if (JSON.stringify(shown) === JSON.stringify(listed)) return null;
    await frame(page);
  }
  const missing = listed.filter((thing) => !shown.includes(thing));
  const extra = shown.filter((thing) => !listed.includes(thing));
  return `it shows ${shown.length} things for the ${listed.length} its reader lists${missing.length ? `; missing: ${missing.join(', ')}` : ''}${extra.length ? `; not listed: ${extra.join(', ')}` : ''}`;
}

describe('the example and the nine fixtures', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  test('the example and the nine fixtures each open: 17 views, each drawn by its own body, nothing logged', { todo: 'the last of packages 2-10 to 2-13 lands' }, async () => {
    assert.equal(FILES.length, 10, 'The example and the nine fixtures.');
    const kinds = {};
    const wrong = [];
    for (const { name, file } of FILES) {
      const model = modelOf(file);
      const listed = await listedIn(file);
      const opened = await openIn(browser, stateFileAt(file));
      const { page } = opened;
      for (const view of model.views) {
        const renderer = lib.VIEW_KINDS[view.kind].renderer;
        kinds[renderer] = (kinds[renderer] ?? 0) + 1;
        const where = `In ${name}, ${view.name} (${lib.an(lib.VIEW_KINDS[view.kind].label)})`;
        await showTab(page, view);
        const root = await soon(page, () => rootOf(page, view), `${where} has nothing in its tab: no plane and no component body carries data-view "${view.id}".`);
        if (root.card) { wrong.push(`${where} shows the card "${cardOf(view)[0]}", not the view drawn by its own body.`); continue; }
        if (listed.get(view.id) === null) { wrong.push(`${where} shows no card, and its kind has no reader that lists what it must show.`); continue; }
        const how = await differs(page, view, listed.get(view.id));
        if (how) wrong.push(`${where} is not drawn one thing for each entry its reader lists: ${how}.`);
      }
      const tabs = await page.evaluate(() => [...document.querySelectorAll('[role="tab"]')].filter((el) => / : /.test(el.getAttribute('aria-label') || el.textContent)).length);
      assert.equal(tabs, model.views.length, `${name} has ${model.views.length} views, and the page has ${tabs} view tabs.`);
      await finish(opened);   // nothing logged: no error and no warning
    }
    assert.deepEqual(kinds, { graph: 11, browser: 2, grid: 2, geometry: 1, sequence: 1 }, 'The ten files are not the ones this test was written for: 17 views, 11 of a graph kind, 2 browser, 2 grid, 1 geometry, 1 sequence.');
    assert.ok(wrong.length === 0, `${wrong.length} of the 17 views ${wrong.length === 1 ? 'is' : 'are'} not drawn by ${wrong.length === 1 ? 'its' : 'their'} own body:\n${wrong.join('\n')}`);
  });

  test('each of the ten files, opened and saved from the page, exports its pinned text', async () => {
    assert.equal(FILES.length, 10, 'The example and the nine fixtures.');
    for (const { name, file, pinned } of FILES) {
      const opened = await openIn(browser, stateFileAt(file));
      const saved = await saveAndRead(opened.page);
      assert.equal(exportOf(saved), readText(pinned), `${name}, opened and saved from the page, does not export the text pinned in ${path.basename(pinned)}, byte for byte.`);
      await finish(opened);
    }
  });

  test('two views of one model are shown side by side, each drawn', async () => {
    // The interconnection fixture holds two views: its interconnection view and a general view.
    const { name, file } = FILES.find((entry) => entry.name === 'interconnection.json');
    const model = modelOf(file);
    const [left, right] = model.views;
    const listed = await listedIn(file);
    const opened = await openIn(browser, stateFileAt(file));
    const { page } = opened;
    await showTab(page, left);
    const alone = await soon(page, async () => { const root = await rootOf(page, left); return root && root.width > 0 ? root : null; }, `In ${name}, ${left.name} has nothing in its tab.`);
    assert.equal(await page.locator(`:is(${planeOf(right.id)}, ${bodyOf(right.id)})`).count(), 0, `In ${name}, ${right.name} is drawn while its tab is behind ${left.name}'s: the two are not yet side by side.`);

    // A person drags the second view's tab to the right half of the first view: the editor is split in two.
    const tab = await (await viewTab(page, right)).boundingBox();
    await page.mouse.move(tab.x + tab.width / 2, tab.y + tab.height / 2);
    await page.mouse.down();
    await page.mouse.move(tab.x + tab.width / 2 + 10, tab.y + tab.height / 2 + 30, { steps: 3 });
    await page.mouse.move(alone.x + alone.width - 40, alone.y + alone.height / 2, { steps: 8 });
    await frame(page);
    await page.mouse.up();

    const both = await soon(page, async () => {
      const a = await rootOf(page, left);
      const b = await rootOf(page, right);
      return a && b && a.width > 0 && b.width > 0 ? [a, b] : null;
    }, `In ${name}, ${right.name}'s tab was dragged to the right half of ${left.name}, and the two views are not both shown.`);
    const [a, b] = both;
    assert.ok(a.x + a.width <= b.x + 1 && Math.abs(a.y - b.y) <= 1 && Math.abs(a.height - b.height) <= 1 && a.width > 100 && b.width > 100,
      `In ${name}, ${left.name} and ${right.name} are not side by side: ${JSON.stringify(a)} and ${JSON.stringify(b)}.`);
    for (const view of [left, right]) {
      const root = await rootOf(page, view);
      assert.ok(!root.card, `In ${name}, side by side, ${view.name} shows the card, not the view drawn.`);
      const how = await differs(page, view, listed.get(view.id));
      assert.equal(how, null, `In ${name}, side by side, ${view.name} is not drawn one thing for each entry its reader lists: ${how}.`);
    }
    await finish(opened);
  });
});
