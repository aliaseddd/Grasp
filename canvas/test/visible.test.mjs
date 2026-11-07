// Drawing what the window shows: on a generated model (scale-model.mjs) the page draws only the part of the plane the
// window shows, with a margin, and draws the rest as the window moves there; far out, a graph view draws its boxes as
// outlines, without their words; a change that only moves things draws again just what moved, and what that leaves on
// the drawing is what drawing everything again would draw; and the checks wait for the changes to pause, except when
// the export needs them.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { SCALE_WAIT, finish, importLarge, launch, lookAt, openCanvas, placeElement, until } from './helpers.mjs';
import { VIEWS, middleService, scaleState } from './scale-model.mjs';

const ELEMENTS = 1000;

/** The ids of the elements the drawing holds a group for, in one view's frame. */
const drawnIn = (page, view) => page.$$eval(`#drawing g.frame[data-view="${view}"] g[data-el]`, (groups) => groups.map((g) => g.getAttribute('data-el')));

/**
 * In the page: whether the drawing as it stands is what drawing everything again makes, compared frame by frame, with
 * the hover and drop marks (which follow the pointer, not the model) left out. Returns the first frame that differs
 * and where, or null.
 */
const sameAsRedrawn = (page) => page.evaluate(() => {
  const C = window.SysMLCanvas;
  const frames = () => Array.from(document.querySelectorAll('#drawing > g.frame')).map((g) => {
    const copy = g.cloneNode(true);
    [copy].concat(Array.from(copy.querySelectorAll('[class]'))).forEach((n) => {
      n.classList.remove('is-hover');
      n.classList.remove('is-drop');
    });
    return { id: g.getAttribute('data-view'), html: copy.outerHTML };
  });
  const patched = frames();
  C.drawAll();
  const redrawn = frames();
  for (let i = 0; i < Math.max(patched.length, redrawn.length); i++) {
    const a = patched[i] ? patched[i].html : '';
    const b = redrawn[i] ? redrawn[i].html : '';
    if (a === b) continue;
    let at = 0;
    while (a[at] === b[at]) at++;
    return { view: (patched[i] || redrawn[i]).id, patched: a.slice(Math.max(0, at - 80), at + 120), redrawn: b.slice(Math.max(0, at - 80), at + 120) };
  }
  return null;
});

/** In the page: marks every group drawn in a view's frame, so a later look can tell the groups kept from new ones. */
const markGroups = (page, view) => page.evaluate((v) => {
  document.querySelectorAll(`#drawing g.frame[data-view="${v}"] g[data-el], #drawing g.frame[data-view="${v}"] g[data-rel]`).forEach((g) => { g.__kept = true; });
}, view);
/** In the page: how many of a view's element groups and line groups are new since markGroups, and how many there are. */
const newGroups = (page, view) => page.evaluate((v) => {
  const count = (sel) => { const all = Array.from(document.querySelectorAll(`#drawing g.frame[data-view="${v}"] ${sel}`)); return { all: all.length, fresh: all.filter((g) => !g.__kept).length }; };
  return { elements: count('g[data-el]'), lines: count('g[data-rel]') };
}, view);

/**
 * Drags element `id`, drawn in view `view`, by its outline through moves of [dx, dy] screen px. After each move the
 * drawing must have drawn again only what moved, in place (every element group kept, a few lines new), and be what
 * drawing everything again draws; after the drop, the latter.
 */
async function dragChecking(page, view, id, moves) {
  const box = await page.locator(`#drawing g.frame[data-view="${view}"] g[data-el="${id}"] > rect.outline`).first().boundingBox();
  assert.ok(box, `${id} is drawn in ${view}`);
  const from = { x: box.x + box.width * 0.35, y: box.y + box.height * 0.35 };
  await page.evaluate(() => { document.querySelector('#status').textContent = ''; });
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (const [dx, dy] of moves) {
    await markGroups(page, view);
    await page.mouse.move(from.x + dx, from.y + dy);
    const fresh = await newGroups(page, view);
    assert.equal(fresh.elements.fresh, 0, `a move of ${id} by ${dx}, ${dy} keeps every element group, drawing their insides again: ${JSON.stringify(fresh)}`);
    assert.ok(fresh.lines.fresh <= 6, `and draws again only the lines on what moved: ${JSON.stringify(fresh)}`);
    const diff = await sameAsRedrawn(page);
    assert.equal(diff, null, `after a move of ${id} by ${dx}, ${dy}, the drawing differs from one drawn again:\n${JSON.stringify(diff, null, 1)}`);
  }
  await page.mouse.up();
  await until(page, () => /^Moved /.test(document.querySelector('#status').textContent), null, `the drop of ${id} is reported`);
  const diff = await sameAsRedrawn(page);
  assert.equal(diff, null, `after the drop of ${id}, the drawing differs from one drawn again:\n${JSON.stringify(diff, null, 1)}`);
}

describe('drawing what the window shows', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('at 100% the drawing holds what the window shows, and moving the window draws what it comes to', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await importLarge(page, scaleState(ELEMENTS));
    const middle = middleService(ELEMENTS);
    await lookAt(page, VIEWS.definitions, middle);
    const here = await drawnIn(page, VIEWS.definitions);
    assert.ok(here.includes(middle), `the service looked at is drawn: ${middle}`);
    assert.ok(here.length < ELEMENTS / 3, `only what the window shows is drawn: ${here.length} of the view's elements`);
    assert.ok(!here.includes('Service1'), 'a service far from the window is not drawn');
    await lookAt(page, VIEWS.definitions, 'Service1');
    const there = await drawnIn(page, VIEWS.definitions);
    assert.ok(there.includes('Service1'), 'moving the window to the first service draws it');
    assert.ok(!there.includes(middle), 'and the one it left is no longer drawn');
    await finish(ctx);
  });

  test('far out, a graph view draws its boxes and border items as outlines and its lines without labels', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await importLarge(page, scaleState(ELEMENTS));
    await lookAt(page, VIEWS.deployment, 'Site1');
    const words = () => page.evaluate((view) => {
      const frame = document.querySelector(`#drawing g.frame[data-view="${view}"]`);
      return {
        boxes: frame.querySelectorAll('g[data-el]').length,
        texts: frame.querySelectorAll('g[data-el] text').length,
        glyphs: frame.querySelectorAll('g[data-el] .glyph').length,
        lines: frame.querySelectorAll('g[data-rel]').length,
        labels: frame.querySelectorAll('g[data-rel] text').length,
      };
    }, VIEWS.deployment);
    const near = await words();
    assert.ok(near.texts > 0 && near.glyphs > 0 && near.labels > 0, `at 100% the boxes have their words, the ports their glyphs and the lines their labels: ${JSON.stringify(near)}`);
    await page.evaluate(() => { const C = window.SysMLCanvas; C.state.camera = Object.assign({}, C.state.camera, { k: 0.2 }); C.applyCamera(); });
    const far = await words();
    assert.ok(far.boxes > near.boxes, `at 20% more is drawn: ${JSON.stringify(far)}`);
    assert.deepEqual([far.texts, far.glyphs, far.labels], [0, 0, 0], `and none of it with words, glyphs or labels: ${JSON.stringify(far)}`);
    assert.ok(far.lines > 0, 'the lines are still drawn');
    await page.evaluate(() => { const C = window.SysMLCanvas; C.state.camera = Object.assign({}, C.state.camera, { k: 1 }); C.applyCamera(); });
    assert.ok((await words()).texts > 0, 'back at 100% the words are drawn again');
    await finish(ctx);
  });

  test('a drag draws again only what moved, and leaves what drawing everything again would draw', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await importLarge(page, scaleState(ELEMENTS));
    // A part with two ports, a connection and a binding, inside its site: the part, its ports, the two lines and the
    // ports at their other ends move or turn their names; dragged out past the site's corner, the site grows.
    await lookAt(page, VIEWS.deployment, 'Site1');
    await dragChecking(page, VIEWS.deployment, 'Site1.service', [[12, 6], [24, 12], [40, 30], [-30, 140], [-60, 150]]);
    // A box on the view's ground at the frame's corner: the frame follows it.
    await dragChecking(page, VIEWS.deployment, 'Site1', [[-20, -10], [-40, -30], [-10, -5]]);
    // A port along its owner's border.
    await dragChecking(page, VIEWS.deployment, 'Site1.gateway', [[0, 20], [0, 40], [30, 120]]);
    await finish(ctx);
  });

  test('the checks wait for the changes to pause, and the export runs them at once', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const a = await placeElement(page, 'PartDefinition');
    const name = await page.inputValue('#f-name');
    await placeElement(page, 'PartDefinition');
    await until(page, () => !window.SysMLCanvas.state.checkTimer, null, 'the checks catch up with the placing');
    assert.ok(await page.locator('#problems').isHidden(), 'two part defs with their own names are fine');
    // Typing the first one's name into the second makes twins, which the checks find once the typing pauses.
    await page.fill('#f-name', name);
    const now = await page.evaluate(() => ({ waiting: !!window.SysMLCanvas.state.checkTimer, shown: !document.querySelector('#problems').hidden }));
    assert.deepEqual(now, { waiting: true, shown: false }, 'right after the keystroke the checks wait, and the HUD shows nothing yet');
    await until(page, () => /^2 problems$/.test(document.querySelector('#problems').textContent) && !document.querySelector('#problems').hidden, null, 'once the typing pauses the twins are found', SCALE_WAIT);
    assert.ok(await page.locator(`g[data-el="${a}"].is-problem`).count() >= 1, 'and marked');
    // A change and the export at once: the export lists what is wrong now.
    await page.fill('#f-name', name + 'X');
    await page.click('#export');
    await page.waitForSelector('#export-panel', { state: 'visible' });
    assert.equal(await page.locator('#export-problems li').count(), 0, 'the export panel lists no problem once the twin is renamed');
    assert.ok(await page.locator('#problems').isHidden(), 'and the HUD follows it');
    await finish(ctx);
  });
});
