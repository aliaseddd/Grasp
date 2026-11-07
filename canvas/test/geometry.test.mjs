// The geometry view, a plan drawn to scale: a new GeometryView offers the part tool only and refuses a part def; a part
// placed in it is a footprint sized by its fields, which the panel shows; typing a length resizes it; dragging it changes
// posX and posY in one undo step; the export carries the shape, the position and the imports; the spatial fields are
// hidden for the same part selected in the general view; a part shown from the general view is dashed until it has a shape.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { emptyPointIn, exportText, finish, launch, openCanvas, placeElement, rename, until } from './helpers.mjs';

const SAVED = 'v-proof'; // the view the embedded model saves

async function addView(page, kind) {
  const before = await page.locator('#drawing g.frame[data-view]').count();
  await page.selectOption('#new-view-kind', kind);
  await page.click('#new-view');
  await until(page, (count) => document.querySelectorAll('#drawing g.frame[data-view]').length > count, before, 'a new frame appears');
  return page.getAttribute('#drawing g.frame.is-active', 'data-view');
}

/** Selects a view by clicking its frame's tab, and waits until it is the active one. */
async function activate(page, viewId) {
  await page.locator(`#drawing g.frame[data-view="${viewId}"] rect.tab`).click();
  await until(page, (id) => document.querySelector(`#drawing g.frame[data-view="${id}"]`)?.classList.contains('is-active'), viewId, `view ${viewId} is active`);
}

/** Clicks the outline of an element as drawn in one view's frame (the same element may be drawn in several); the name over
 * a box's middle is in the same group, so a click that lands on it still selects the element. */
async function clickIn(page, viewId, id) {
  await page.locator(`#drawing g.frame[data-view="${viewId}"] g[data-el="${id}"] .outline`).first().click({ force: true });
  await until(page, ([v, elId]) => document.querySelector(`#drawing g.frame[data-view="${v}"] g[data-el="${elId}"]`)?.classList.contains('is-selected'), [viewId, id], `${id} is selected in view ${viewId}`);
}

/** A footprint as drawn in the active frame: the outline's size (a rect's width and height), its classes and its text. */
function footprint(page, id) {
  return page.evaluate((elId) => {
    const g = document.querySelector(`#drawing g.frame.is-active g.footprint[data-el="${elId}"]`);
    const o = g && g.querySelector('.outline');
    return g && o ? { width: +o.getAttribute('width'), height: +o.getAttribute('height'), classes: g.getAttribute('class'), text: g.textContent } : null;
  }, id);
}

describe('geometry view', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('a new geometry view offers the part tool only, refuses a part def, and draws a placed part as a footprint to scale', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const view = await addView(page, 'GeometryView');
    const tools = page.locator('.palette button[data-tool]:not([data-tool="Note"])');
    assert.equal(await tools.count(), 2, 'two tools of its own: a part and an item');
    assert.equal(await tools.first().getAttribute('data-tool'), 'PartUsage');
    assert.match(await page.textContent('.eyebrow'), /geometry view/);
    assert.equal(await page.locator(`#drawing g.frame[data-view="${view}"] .geo-axes`).count(), 1, 'the frame draws the coordinate frame');
    assert.equal(await page.textContent(`#drawing g.frame[data-view="${view}"] .geo-scale`), '1 m', 'the scale bar reads one metre at 40 px per metre');
    // A part def is refused: armed from the general view's palette, clicked inside the geometry frame.
    await activate(page, SAVED);
    await page.click('.palette button[data-tool="PartDefinition"]');
    const spot = await emptyPointIn(page, view);
    await page.mouse.click(spot.x, spot.y);
    await until(page, () => /part def can't go in a geometry view/.test(document.querySelector('#status').textContent), null, 'the status says a part def can\'t go there');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator(`#drawing g.frame[data-view="${view}"] g[data-el]`).count(), 0, 'nothing was placed');
    // A part goes in, a one by one metre box at the click: 40 by 40 px.
    await activate(page, view);
    const id = await placeElement(page, 'PartUsage', await emptyPointIn(page, view));
    const fp = await footprint(page, id);
    assert.ok(fp, 'the part is drawn as a footprint in the geometry frame');
    assert.equal(fp.width, 40, 'one metre long is 40 px wide');
    assert.equal(fp.height, 40, 'one metre wide is 40 px high');
    assert.match(fp.text, /Box 1 × 1 × 1 m/, 'the footprint names its shape and dimensions');
    assert.equal(await page.inputValue('#f-shape'), 'Box', 'the panel shows the shape');
    assert.equal(await page.inputValue('#f-length'), '1');
    assert.equal(await page.inputValue('#f-unit'), 'm');
    assert.ok(await page.locator('#f-posX').isVisible(), 'the panel shows the position');
    assert.match(await page.textContent('#status'), /Added part/);
    await finish(ctx);
  });

  test('typing a length in the panel resizes the footprint as one undo step; without one it is dashed, not to scale', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const view = await addView(page, 'GeometryView');
    const id = await placeElement(page, 'PartUsage', await emptyPointIn(page, view));
    await page.fill('#f-length', '3');
    await until(page, (elId) => +document.querySelector(`#drawing g.frame.is-active g.footprint[data-el="${elId}"] .outline`)?.getAttribute('width') === 120, id, 'the footprint is 120 px wide');
    assert.match((await footprint(page, id)).text, /Box 3 × 1 × 1 m/);
    assert.match(await page.getAttribute('#undo', 'title'), /Undo: Set the length of part/, 'the typing is one undo step');
    await page.fill('#f-length', '');
    await until(page, (elId) => document.querySelector(`g.footprint[data-el="${elId}"]`)?.classList.contains('no-shape'), id, 'without a length the footprint is dashed');
    assert.match((await footprint(page, id)).text, /Box · set its length and width/);
    await finish(ctx);
  });

  test('dragging a footprint changes posX and posY in the model, which the panel shows, as one undo step', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const view = await addView(page, 'GeometryView');
    const id = await placeElement(page, 'PartUsage', await emptyPointIn(page, view));
    const x0 = +(await page.inputValue('#f-posX'));
    const y0 = +(await page.inputValue('#f-posY'));
    const box = await page.locator(`#drawing g.frame.is-active g.footprint[data-el="${id}"] .outline`).boundingBox();
    const k = await page.evaluate(() => { const svg = document.getElementById('drawing'); return svg.clientWidth / svg.viewBox.baseVal.width; });
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 40, cy - 20, { steps: 4 });
    await page.mouse.move(cx + 80, cy - 40, { steps: 4 });
    await page.mouse.up();
    await until(page, (x) => +document.querySelector('#f-posX').value > x, x0, 'the panel shows a larger x');
    const x1 = +(await page.inputValue('#f-posX'));
    const y1 = +(await page.inputValue('#f-posY'));
    assert.ok(Math.abs((x1 - x0) - 80 / k / 40) < 0.06, `80 screen px to the right is ${80 / k / 40} m, not ${x1 - x0}`);
    assert.ok(Math.abs((y1 - y0) - 40 / k / 40) < 0.06, `40 screen px up is ${40 / k / 40} m, not ${y1 - y0}`);
    assert.match(await page.textContent('#status'), /Moved part .* to .* m\./);
    assert.match(await page.getAttribute('#undo', 'title'), /Undo: Moved part/, 'the drag is one undo step');
    await page.click('#undo');
    await until(page, (x) => document.querySelector('#f-posX').value === String(x), x0, 'undo puts x back');
    assert.equal(+(await page.inputValue('#f-posY')), y0, 'and y');
    assert.equal(await page.locator(`g.footprint[data-el="${id}"]`).count(), 1, 'the part stays');
    await finish(ctx);
  });

  test('the export carries the shape with its dimensions, the position as a spatial item, and the imports they need', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const view = await addView(page, 'GeometryView');
    const id = await placeElement(page, 'PartUsage', await emptyPointIn(page, view));
    await rename(page, id, 'desk');
    await page.fill('#f-height', '0.75');
    await until(page, () => /Box 1 × 1 × 0.75 m/.test(document.querySelector('#drawing g.frame.is-active g.footprint')?.textContent), null, 'the footprint shows the new height');
    const text = await exportText(page);
    for (const lib of ['MeasurementReferences', 'SI', 'ShapeItems', 'SpatialItems']) assert.match(text, new RegExp(`\\n    private import ${lib}::\\*;\\n`), `the text imports ${lib}`);
    assert.match(text, /\n    part desk : SpatialItem \{\n/, 'a positioned part is typed as a spatial item');
    assert.match(text, /item :>> shape : Box \{\n\s+:>> length = 1 \[m\];\n\s+:>> width = 1 \[m\];\n\s+:>> height = 0\.75 \[m\];\n\s+\}/, 'the shape with its dimensions');
    assert.match(text, /attribute :>> coordinateFrame \{\n\s+:>> transformation : TranslationRotationSequence \{\n\s+:>> elements = \(new Translation\(\(-?[\d.]+ \[m\], -?[\d.]+ \[m\], 0 \[m\]\)\)\);\n/, 'the position as a translation');
    assert.match(text, /view view\d+ : StandardViewDefinitions::GeometryView \{\n\s+expose StrongholdProof::desk;\n\s+\}/, 'the view exposes the part');
    assert.equal(await page.locator('#export-problems li').count(), 0, 'the export has no problems');
    await finish(ctx);
  });

  test('the spatial fields show for a part in the geometry view and hide for the same part selected in the general view', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const view = await addView(page, 'GeometryView');
    const id = await placeElement(page, 'PartUsage', await emptyPointIn(page, view));
    assert.ok(await page.locator('#l-shape').isVisible(), 'the shape shows in the geometry view');
    assert.ok(await page.locator('#l-posX').isVisible(), 'so does the position');
    // The same part, shown in the general view through its Show list, then selected there.
    await activate(page, SAVED);
    await page.selectOption('#v-show', id);
    await page.click('#v-show-add');
    await until(page, (elId) => !!document.querySelector(`#drawing g.frame[data-view="v-proof"] g[data-el="${elId}"]`), id, 'the part is drawn in the general view too');
    await clickIn(page, SAVED, id);
    assert.ok(await page.locator('#l-shape').isHidden(), 'the shape is hidden in the general view');
    assert.ok(await page.locator('#l-length').isHidden(), 'so are the dimensions');
    assert.ok(await page.locator('#l-posX').isHidden(), 'and the position');
    assert.ok(await page.locator('#l-multiplicity').isVisible(), 'the core fields stay');
    assert.match(await page.textContent('#f-views'), /proofStructure/, 'the panel says it is shown in both views');
    await clickIn(page, view, id);
    assert.ok(await page.locator('#l-shape').isVisible(), 'back in the geometry view the shape is back');
    assert.ok(await page.locator('#l-radius').isVisible());
    await finish(ctx);
  });

  test('a part shown from the general view is dashed until it has a shape, and a sphere draws as a circle of its radius', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const view = await addView(page, 'GeometryView');
    await activate(page, SAVED);
    const id = await placeElement(page, 'PartUsage', await emptyPointIn(page, SAVED));
    assert.ok(await page.locator('#l-shape').isHidden(), 'no spatial fields for a part placed in the general view');
    await activate(page, view);
    await until(page, (elId) => Array.from(document.querySelectorAll('#v-show option')).some((o) => o.value === elId), id, 'the Show list offers the part');
    await page.selectOption('#v-show', id);
    await page.click('#v-show-add');
    await until(page, (elId) => document.querySelector(`g.footprint[data-el="${elId}"]`)?.classList.contains('no-shape'), id, 'the part is drawn dashed');
    assert.match(await page.textContent(`g.footprint[data-el="${id}"]`), /no shape yet/);
    await clickIn(page, view, id);
    await page.selectOption('#f-shape', 'Sphere');
    await until(page, (elId) => /Sphere · set its radius/.test(document.querySelector(`g.footprint[data-el="${elId}"]`)?.textContent), id, 'a sphere without a radius says so');
    await page.fill('#f-radius', '0.5');
    await until(page, (elId) => { const c = document.querySelector(`#drawing g.frame.is-active g.footprint[data-el="${elId}"] circle.outline`); return !!c && +c.getAttribute('r') === 20; }, id, 'half a metre is a 20 px circle');
    assert.doesNotMatch(await page.getAttribute(`g.footprint[data-el="${id}"]`, 'class'), /no-shape/, 'the footprint is to scale now');
    assert.match(await page.textContent(`g.footprint[data-el="${id}"]`), /Sphere r 0\.5 m/);
    await finish(ctx);
  });
});
