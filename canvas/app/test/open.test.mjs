// Opening the example and the nine fixtures: every view of each has its tab, and a plane or a card on it, and the page
// logs nothing (slice 1's criterion 2). Written before the planes, to the DOM contract of plan/notes.md.

import assert from 'node:assert/strict';
import { after, afterEach, before, describe, test } from 'node:test';
import {
  cardOf, closePages, drawn, EXAMPLE, finish, isGraph, launch, linesOf, modelOf, openPage, openStateFile, placedOf, planeOf, showView, soon,
  stateFileAt, TEN, viewTab,
} from './helpers.mjs';

describe('opening a model', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  test('the example and the nine fixtures each open: 17 tabs, 11 planes, 6 cards, nothing logged', async () => {
    const total = { tabs: 0, planes: 0, cards: 0 };
    for (const file of TEN) {
      const name = file.split('/').pop();
      const model = modelOf(file);
      const opened = await openPage(browser, { picker: false });
      const { page } = opened;
      await openStateFile(page, stateFileAt(file));
      for (const view of model.views) {
        total.tabs++;
        if (isGraph(view)) {
          total.planes++;
          const lines = linesOf(model, view);
          await showView(page, view, lines.length);
          const shown = await drawn(page, view.id);
          assert.deepEqual([...shown.nodes].sort(), [...placedOf(view)].sort(), `In ${name}, the plane of ${view.name} has not one node for each element the view places, and no other.`);
          assert.deepEqual([...shown.edges].sort(), [...lines].sort(), `In ${name}, the plane of ${view.name} has not one edge for each line that is not hidden and has both ends placed, and no other.`);
        } else {
          total.cards++;
          const tab = await viewTab(page, view);
          if ((await tab.getAttribute('aria-selected')) !== 'true') await tab.click();
          const card = await soon(page, () => page.evaluate((selector) => {
            const plane = document.querySelector(selector);
            return plane ? { text: plane.textContent, flow: plane.querySelectorAll('.react-flow').length } : null;
          }, planeOf(view.id)), `In ${name}, no plane holds the card of ${view.name} (a ${view.kind}; data-testid "plane", data-view "${view.id}").`);
          for (const sentence of cardOf(view)) assert.ok(card.text.includes(sentence), `In ${name}, the card of ${view.name} does not say "${sentence}". It reads "${card.text}".`);
          assert.equal(card.flow, 0, `In ${name}, the card of ${view.name} holds a React Flow.`);
        }
      }
      const tabs = await page.evaluate(() => [...document.querySelectorAll('[role="tab"]')].filter((el) => / : /.test(el.getAttribute('aria-label') || el.textContent)).length);
      assert.equal(tabs, model.views.length, `${name} has ${model.views.length} views, and the page has ${tabs} view tabs.`);
      await finish(opened);
    }
    assert.deepEqual([total.tabs, total.planes, total.cards], [17, 11, 6], 'The ten files are not the ones this test was written for: 17 views, 11 of a graph kind.');
  });

  test('another file opened takes the first file\'s planes away', async () => {
    const example = modelOf(EXAMPLE);
    const other = modelOf(TEN.find((file) => file.endsWith('interconnection.json')));
    const first = example.views[0];
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    await openStateFile(page, stateFileAt(EXAMPLE));
    await showView(page, first, linesOf(example, first).length);
    await openStateFile(page, stateFileAt(TEN.find((file) => file.endsWith('interconnection.json'))));
    await soon(page, async () => !(await drawn(page, first.id)).plane, `After interconnection.json was opened, the plane of ${first.name}, a view of the example, is still in the page.`);
    for (const view of other.views) await showView(page, view, linesOf(other, view).length);
    const stale = await page.evaluate(([plane, node]) => document.querySelectorAll(`${plane} ${node}`).length, [planeOf(first.id), '.react-flow__node']);
    assert.equal(stale, 0, `The example's view still draws ${stale} nodes.`);
    await finish(opened);
  });
});
