// Drawing on the plane: placing elements from the palette, what the inspector shows for the selection, renaming,
// the three relationship tools, a port on a part definition, deleting with its edges, and a part dragged inside its
// part definition staying inside it.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import {
  clickElement, drawRelationship, exportText, finish, launch, openCanvas, placeElement, rename, selectedId, until, zoomLevel,
} from './helpers.mjs';

describe('drawing', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('placing a part definition draws it selected and shows it in the inspector', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const id = await placeElement(page, 'PartDefinition');
    assert.equal(await page.getAttribute(`g[data-el="${id}"]`, 'data-kind'), 'PartDefinition');
    assert.equal(await selectedId(page), id, 'the new element is selected');
    assert.ok(await page.locator('#inspector #f-name').isVisible(), 'the inspector shows #f-name');
    assert.ok(await page.locator('#f-abstract').isVisible(), 'the inspector shows #f-abstract for a definition');
    assert.match(await page.textContent('#status'), /\S/, '#status reports the placement in words');
    await finish(ctx);
  });

  test('typing in #f-name renames the element in the drawing and in the export', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const id = await placeElement(page, 'PartDefinition');
    await rename(page, id, 'Host');
    assert.match(await exportText(page), /\bpart def Host\b/);
    await finish(ctx);
  });

  test('a Specialization between two part definitions draws an edge', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const base = await placeElement(page, 'PartDefinition');
    await rename(page, base, 'Base');
    const sub = await placeElement(page, 'PartDefinition');
    await rename(page, sub, 'Sub');
    const rel = await drawRelationship(page, 'Specialization', sub, base);
    assert.equal(await page.getAttribute(`g[data-rel="${rel}"]`, 'data-kind'), 'Specialization');
    assert.match(await exportText(page), /\bSub\s*(:>|specializes)\s*Base\b/, 'the export specializes Sub from Base');
    await finish(ctx);
  });

  test('a FeatureTyping edge from a part usage to a part definition types it in the export', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const def = await placeElement(page, 'PartDefinition');
    await rename(page, def, 'Host');
    const usage = await placeElement(page, 'PartUsage');
    assert.equal(await page.getAttribute(`g[data-el="${usage}"]`, 'data-kind'), 'PartUsage');
    assert.ok(await page.locator('#f-multiplicity').isVisible(), 'the inspector shows #f-multiplicity for a usage');
    await rename(page, usage, 'host');
    const rel = await drawRelationship(page, 'FeatureTyping', usage, def);
    assert.equal(await page.getAttribute(`g[data-rel="${rel}"]`, 'data-kind'), 'FeatureTyping');
    assert.match(await exportText(page), /\bpart\s+host\s*:\s*Host\b/, 'the export types the usage by the definition');
    await finish(ctx);
  });

  test('placing a port usage inside a part definition puts a PortUsage group inside it', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const part = await placeElement(page, 'PartDefinition');
    const box = await page.locator(`g[data-el="${part}"]`).boundingBox();
    const port = await placeElement(page, 'PortUsage', { x: box.x + box.width / 2, y: box.y + box.height / 2 });
    assert.equal(await page.locator(`g[data-el="${part}"] g[data-el="${port}"][data-kind="PortUsage"]`).count(), 1,
      'the port is a PortUsage group inside the part definition');
    assert.equal(await selectedId(page), port, 'the new port is selected');
    assert.ok(await page.locator('#f-conjugated').isVisible(), 'the inspector shows #f-conjugated for a port');
    await finish(ctx);
  });

  test('deleting the selected element removes it and every edge attached to it', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const a = await placeElement(page, 'PartDefinition');
    const b = await placeElement(page, 'PartDefinition');
    const rel = await drawRelationship(page, 'Specialization', b, a);
    await clickElement(page, a);
    await until(page, (id) => document.querySelector(`g[data-el="${id}"]`)?.classList.contains('is-selected'), a, 'clicking A selects it');
    await page.click('#delete-selected');
    await until(page, (id) => !document.querySelector(`g[data-el="${id}"]`), a, 'A is gone after delete');
    assert.equal(await page.locator(`g[data-rel="${rel}"]`).count(), 0, 'the edge attached to A went with it');
    assert.equal(await page.locator(`g[data-el="${b}"]`).count(), 1, 'B stays');
    await finish(ctx);
  });

  test('a part dragged a little down inside its part definition stays inside it, which is drawn to hold it at once', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const def = await placeElement(page, 'PartDefinition');
    const box = await page.locator(`g[data-el="${def}"] > rect.outline`).boundingBox();
    const part = await placeElement(page, 'PartUsage', { x: box.x + box.width / 2, y: box.y + box.height * 0.8 });
    assert.equal(await page.locator(`g[data-el="${def}"] g[data-el="${part}"]`).count(), 1, 'the part is drawn inside the definition');
    // Dragged by its header 40 drawing units down: still inside the definition as it was drawn holding the part.
    const k = (await zoomLevel(page)) / 100;
    const r = await page.locator(`g[data-el="${part}"] > rect.outline`).boundingBox();
    const from = { x: r.x + r.width * 0.35, y: r.y + r.height * 0.35 };
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(from.x, from.y + 20 * k, { steps: 4 });
    await page.mouse.move(from.x, from.y + 40 * k, { steps: 4 });
    await page.mouse.up();
    await until(page, () => /^Moved part/.test(document.querySelector('#status').textContent), null, 'the move is reported');
    assert.match(await page.textContent('#status'), /^Moved part \w+ in \w+\.$/, 'the part stays in its definition');
    assert.equal(await page.locator(`g[data-el="${def}"] g[data-el="${part}"]`).count(), 1, 'and is still drawn inside it');
    const rect = (id) => page.$eval(`g[data-el="${id}"] > rect.outline`, (e) => ({ y: +e.getAttribute('y'), h: +e.getAttribute('height') }));
    const d = await rect(def);
    const p = await rect(part);
    assert.ok(d.y + d.h >= p.y + p.h + 12 - 0.01, `right after the drop the definition holds the part: def bottom ${d.y + d.h}, part bottom ${p.y + p.h}`);
    await finish(ctx);
  });
});
