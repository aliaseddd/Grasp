// Checks while drawing: two part defs with one name are marked on the drawing (is-problem and a badge), counted in
// the HUD's #problems button, which selects an offender, listed in #problems-list for the selection, and the marks go
// when one is renamed.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { clickElement, finish, launch, openCanvas, placeElement, rename, selectedId, until } from './helpers.mjs';

describe('checks while drawing', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('two part defs named the same are marked, counted, listed for the selection, and clear on rename', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    assert.ok(await page.locator('#problems').isHidden(), 'the saved model has no problems');
    const a = await placeElement(page, 'PartDefinition');
    await rename(page, a, 'Twin');
    const b = await placeElement(page, 'PartDefinition');
    await rename(page, b, 'Twin');
    await until(page, ([x, y]) => ['is-problem'].every((cls) => document.querySelector(`g[data-el="${x}"]`)?.classList.contains(cls) && document.querySelector(`g[data-el="${y}"]`)?.classList.contains(cls)),
      [a, b], 'both twins carry is-problem');
    assert.ok((await page.locator(`#drawing g.problem[data-for="${a}"]`).count()) >= 1, 'the first twin has a badge');
    assert.ok((await page.locator(`#drawing g.problem[data-for="${b}"]`).count()) >= 1, 'the second twin has a badge');
    assert.ok(await page.locator('#problems').isVisible(), 'the HUD shows the problems button');
    assert.match(await page.textContent('#problems'), /^2 problems$/);

    await clickElement(page, a);
    await until(page, (id) => document.querySelector(`g[data-el="${id}"]`)?.classList.contains('is-selected'), a, 'the first twin is selected');
    const listed = await page.locator('#problems-list li').allTextContents();
    assert.equal(listed.length, 1, `the panel lists the selection's problem: ${JSON.stringify(listed)}`);
    assert.match(listed[0], /Twin/);

    await page.click('#problems');
    await until(page, ([x, y]) => { const s = document.querySelector('.is-selected'); const id = s && s.getAttribute('data-el'); return id === x || id === y; }, [a, b], 'the HUD button selects an offender');
    assert.ok([a, b].includes(await selectedId(page)));

    await clickElement(page, a);
    await rename(page, a, 'Single');
    await until(page, (id) => !document.querySelector(`g[data-el="${id}"]`)?.classList.contains('is-problem'), b, 'the other twin is clear once this one is renamed');
    assert.equal(await page.locator('#drawing g.problem').count(), 0, 'no badges are left');
    assert.ok(await page.locator('#problems').isHidden(), 'the HUD button is gone');
    assert.equal(await page.locator('#problems-list li').count(), 0, 'the panel lists nothing');
    await finish(ctx);
  });
});
