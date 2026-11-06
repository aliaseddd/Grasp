// The camera: dragging the empty plane and the wheel pan (the svg viewBox moves), the zoom buttons and ctrl+wheel zoom
// (#zoom-level shows the percentage). Run: node --test canvas/test/   (from the repo root; see index.js)

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { elementIds, emptyPoint, finish, launch, openCanvas, until, viewBox, zoomLevel } from './helpers.mjs';

describe('camera', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('dragging the empty plane pans, and so does the wheel: the viewBox changes', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const start = await viewBox(page);
    assert.ok(start, '#drawing has a viewBox');
    const drawnBefore = await elementIds(page);

    const { x, y } = await emptyPoint(page);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 150, y + 90, { steps: 10 });
    await page.mouse.up();
    await until(page, (was) => document.getElementById('drawing').getAttribute('viewBox') !== was, start, 'the viewBox moves when the plane is dragged');
    const dragged = await viewBox(page);
    assert.deepEqual(await elementIds(page), drawnBefore, 'dragging with no tool armed placed nothing');

    await page.mouse.move(x, y);
    await page.mouse.wheel(0, 120);
    await until(page, (was) => document.getElementById('drawing').getAttribute('viewBox') !== was, dragged, 'the viewBox moves on wheel');
    await finish(ctx);
  });

  test('the zoom buttons and ctrl+wheel change #zoom-level', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const initial = await zoomLevel(page);

    await page.click('#zoom-in');
    await until(page, (was) => document.getElementById('zoom-level').textContent !== was, `${initial}%`, '#zoom-level changes on zoom in');
    const zoomedIn = await zoomLevel(page);
    assert.ok(zoomedIn > initial, `zoom in raised ${initial}% to ${zoomedIn}%`);

    await page.click('#zoom-out');
    await until(page, (was) => parseFloat(document.getElementById('zoom-level').textContent) !== was, zoomedIn, '#zoom-level changes on zoom out');
    const zoomedOut = await zoomLevel(page);
    assert.ok(zoomedOut < zoomedIn, `zoom out lowered ${zoomedIn}% to ${zoomedOut}%`);

    const { x, y } = await emptyPoint(page);
    await page.mouse.move(x, y);
    await page.keyboard.down('Control');
    await page.mouse.wheel(0, -240);
    await page.keyboard.up('Control');
    await until(page, (was) => parseFloat(document.getElementById('zoom-level').textContent) !== was, zoomedOut, '#zoom-level changes on ctrl+wheel');

    await page.click('#zoom-fit');
    await zoomLevel(page); // still a percentage after fitting
    await finish(ctx);
  });
});
