// The one edit function: every change to the model goes through edit() in src/core/page/changes.js, which records the
// undo step with the ids of the elements, relationships and views the change touched, logs the change for Claude,
// redraws, and schedules the save. A run of changes made with one key (the keystrokes of a name, the moves of a drag)
// is one undo step, logged once when it ends, and a run that ends where it started is no step. A change made to the
// model any other way is reported as an error, which these tests and finish() see.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { WAIT, clickElement, drawRelationship, finish, launch, openCanvas, placeElement, until } from './helpers.mjs';

/** The newest undo step, as the page keeps it: its words, its run's key (null once the run ended), what it touched; and how many steps there are. */
const lastStep = (page) => page.evaluate(() => {
  const history = window.SysMLCanvas.state.history;
  const top = history[history.length - 1];
  return { count: history.length, what: top ? top.what : null, key: top ? top.key : null, touched: top ? top.touched : null };
});
/** The texts of the change log Claude reads. */
const logTexts = (page) => page.evaluate(() => window.SysMLCanvas.state.changes.map((c) => c.text));
const activeView = (page) => page.evaluate(() => window.SysMLCanvas.state.active);
const touches = (elements, relationships, views) => ({ elements, relationships, views });

/**
 * Drags a box by its outline through the moves given, each [dx, dy] in screen px from where it starts, lets go, and
 * waits for the status line to say the box moved (it is cleared first, so two drags in a row are told apart).
 */
async function drag(page, id, moves) {
  const box = await page.locator(`g[data-el="${id}"] > rect.outline`).boundingBox();
  assert.ok(box, `box ${id} is drawn`);
  const from = { x: box.x + box.width * 0.35, y: box.y + box.height * 0.35 };
  await page.evaluate(() => { document.querySelector('#status').textContent = ''; });
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (const [dx, dy] of moves) await page.mouse.move(from.x + dx, from.y + dy, { steps: 4 });
  await page.mouse.up();
  await until(page, () => /^Moved /.test(document.querySelector('#status').textContent), null, `the drop of ${id} is reported`);
}

describe('the one edit function', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('each change records the elements, relationships and views it touched', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const view = await activeView(page);
    const a = await placeElement(page, 'PartDefinition');
    assert.deepEqual((await lastStep(page)).touched, touches([a], [], [view]), 'placing a box touches it and the view it is placed in');
    const b = await placeElement(page, 'PartDefinition');
    const rel = await drawRelationship(page, 'Specialization', b, a);
    assert.deepEqual((await lastStep(page)).touched, touches([], [rel], []), 'drawing a line touches the line');
    await drag(page, b, [[30, 0], [60, 0]]);
    assert.deepEqual((await lastStep(page)).touched, touches([b], [], [view]), 'moving a box touches it and its view');
    await clickElement(page, a);
    await page.click('#delete-selected');
    await until(page, (id) => !document.querySelector(`g[data-el="${id}"]`), a, 'A is gone after Delete');
    assert.deepEqual((await lastStep(page)).touched, touches([a], [rel], [view]), 'deleting a box touches it, the lines on it, and the views it was in');
    await finish(ctx);
  });

  test('adding a view touches the view, and showing an element in it touches the element and the view', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await page.selectOption('#new-view-kind', 'GeneralView');
    await page.click('#new-view');
    await until(page, () => document.querySelectorAll('#drawing g.frame[data-view]').length === 2, null, 'a second frame appears');
    const view = await activeView(page);
    assert.deepEqual((await lastStep(page)).touched, touches([], [], [view]), 'a new view touches only itself');
    const el = await page.evaluate(() => window.SysMLCanvas.state.model.elements.find((e) => e.owner === undefined).id);
    await page.selectOption('#v-show', el);
    await page.click('#v-show-add');
    await until(page, ([v, id]) => !!document.querySelector(`#drawing g.frame[data-view="${v}"] g[data-el="${id}"]`), [view, el], 'the element is drawn in the new view');
    assert.deepEqual((await lastStep(page)).touched, touches([el], [], [view]), 'showing it touches the element and the view');
    await finish(ctx);
  });

  test('a change that reorders a list touches what moved in it, not what only shifted', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const ids = await page.evaluate(() => window.SysMLCanvas.state.model.elements.map((e) => e.id));
    const touched = await page.evaluate(() => window.SysMLCanvas.edit(() => {
      const elements = window.SysMLCanvas.state.model.elements;
      elements.push(elements.shift());
      return 'Put the first element last';
    }));
    assert.deepEqual(touched, touches([ids[0]], [], []), `moving the first of ${ids.length} elements to the end touches it alone`);
    await finish(ctx);
  });

  test('typing a name is one undo step, logged once when the field is left', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const a = await placeElement(page, 'PartDefinition'); // focuses the name with its text selected
    const steps = (await lastStep(page)).count;
    const logged = (await logTexts(page)).length;
    await page.keyboard.type('Engine');
    await until(page, (id) => document.querySelector(`g[data-el="${id}"]`)?.textContent.includes('Engine'), a, 'the drawing follows the typing');
    const typing = await lastStep(page);
    assert.equal(typing.count, steps + 1, 'six keystrokes are one undo step');
    assert.equal(typing.key, 'name:' + a, 'its run is open while the field is');
    assert.deepEqual(typing.touched, touches([a], [], []), 'and it touched the element');
    assert.equal((await logTexts(page)).length, logged, 'nothing is logged while the name is typed');
    await page.keyboard.press('Tab');
    await until(page, (n) => window.SysMLCanvas.state.changes.length > n, logged, 'leaving the field logs the rename');
    assert.deepEqual((await logTexts(page)).slice(logged), ['Renamed to part def Engine'], 'once, in its last words');
    assert.equal((await lastStep(page)).key, null, 'and ends the run');
    await page.click('#undo');
    await until(page, (id) => !document.querySelector(`g[data-el="${id}"]`)?.textContent.includes('Engine'), a, 'undo takes the whole name back');
    await finish(ctx);
  });

  test('a drag is one undo step, logged once at the drop, and a box dragged out and back is no step', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const a = await placeElement(page, 'PartDefinition');
    const steps = (await lastStep(page)).count;
    const logged = (await logTexts(page)).length;
    await drag(page, a, [[20, 10], [40, 20], [60, 30]]);
    const moved = await lastStep(page);
    assert.equal(moved.count, steps + 1, 'twelve moves are one undo step');
    assert.match(moved.what, /^Moved part def/);
    assert.equal(moved.key, null, 'whose run ended with the drop');
    const log = await logTexts(page);
    assert.equal(log.length, logged + 1, 'the drag is logged once');
    assert.match(log[log.length - 1], /^Moved part def/);
    const place = () => page.evaluate((id) => JSON.stringify(window.SysMLCanvas.state.model.views.find((v) => v.layout[id]).layout[id]), a);
    const was = await place();
    await drag(page, a, [[40, 0], [80, 0], [0, 0]]);
    assert.equal(await place(), was, 'the box is back where it was');
    assert.equal((await lastStep(page)).count, steps + 1, 'a drag out and back is no undo step');
    assert.equal((await logTexts(page)).length, logged + 1, 'and logs nothing');
    assert.match(await page.getAttribute('#undo', 'title'), /^Undo: Moved part def/, 'Undo still takes back the first drag');
    await finish(ctx);
  });

  test('a change made to the model outside edit() is reported as an error when the next change comes', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const a = await placeElement(page, 'PartDefinition');
    await page.evaluate((id) => { window.SysMLCanvas.state.model.elements.find((e) => e.id === id).doc = 'written behind edit()'; }, a);
    const reported = page.waitForEvent('pageerror', { timeout: WAIT });
    await placeElement(page, 'PartDefinition');
    assert.equal((await reported).message, 'The model was changed outside edit(): ' + a);
    ctx.errors.length = 0; // the error this test asked for
    await finish(ctx);
  });

  test('a change that says it did nothing yet changed the model is reported, and recorded all the same', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const a = await placeElement(page, 'PartDefinition');
    const steps = (await lastStep(page)).count;
    const reported = page.waitForEvent('pageerror', { timeout: WAIT });
    const touched = await page.evaluate((id) => window.SysMLCanvas.edit(() => {
      window.SysMLCanvas.state.model.elements.find((e) => e.id === id).doc = 'changed';
      return null;
    }), a);
    assert.equal((await reported).message, 'A change given to edit() said it did nothing, yet it changed: ' + a);
    assert.deepEqual(touched, touches([a], [], []));
    const step = await lastStep(page);
    assert.equal(step.count, steps + 1, 'the change is an undo step');
    assert.equal(step.what, 'Changed the model');
    ctx.errors.length = 0; // the error this test asked for
    await finish(ctx);
  });

  test('no script but changes.js can record an undo step or schedule a save', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const exposed = await page.evaluate(() => ['commit', 'snapshot', 'changed'].filter((name) => name in window.SysMLCanvas));
    assert.deepEqual(exposed, [], 'the old routine\'s pieces are not on the shared object');
    await finish(ctx);
  });
});
