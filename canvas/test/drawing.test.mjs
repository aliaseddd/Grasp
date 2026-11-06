// Drawing on the plane: placing elements from the palette, what the inspector shows for the selection, renaming,
// the three relationship tools, a port on a part definition, and deleting with its edges.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import {
  clickElement, drawRelationship, exportText, finish, launch, openCanvas, placeElement, rename, selectedId, until,
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
});
