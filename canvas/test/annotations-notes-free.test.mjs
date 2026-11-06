// Free notes and the Note tool: with the Note tool armed, a click on the empty plane leaves a note on nothing, pinned
// where the plane was clicked and listed "on the plane"; dragging that pin onto a box puts the note on the box and the
// list follows; the Note tool on a box notes the box, as Add note does for the selection.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { emptyPoint, exportText, finish, launch, openCanvas, placeElement, rename, until } from './helpers.mjs';

/** Arms the Note tool and clicks the point (page pixels), returning the id of the note that appears in the list. */
async function noteAt(page, point) {
  const before = await page.$$eval('#notes-list li[data-note]', (items) => items.map((li) => li.getAttribute('data-note')));
  await page.click('.palette button[data-tool="Note"]');
  await page.mouse.click(point.x, point.y);
  await until(page, (count) => document.querySelectorAll('#notes-list li[data-note]').length > count, before.length, 'a note appears in #notes-list');
  const ids = await page.$$eval('#notes-list li[data-note]', (items) => items.map((li) => li.getAttribute('data-note')));
  const added = ids.filter((id) => !before.includes(id));
  assert.equal(added.length, 1, `the Note tool added one note, not ${JSON.stringify(added)}`);
  return added[0];
}

describe('free notes and the Note tool', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('the Note tool drops a free pin where the plane was clicked and lists the note on the plane', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    assert.equal(await page.locator('.palette button[data-tool="Note"]').count(), 1, 'the palette offers the Note tool');
    const point = await emptyPoint(page);
    const note = await noteAt(page, point);
    const pin = page.locator(`#drawing g.pin.is-free[data-note="${note}"]`);
    assert.equal(await pin.count(), 1, 'the note has one free pin');
    const box = await pin.boundingBox();
    assert.ok(Math.abs(box.x + box.width / 2 - point.x) < 4 && Math.abs(box.y + box.height / 2 - point.y) < 4,
      `the pin sits where the plane was clicked: ${JSON.stringify(box)} against ${JSON.stringify(point)}`);
    assert.match(await page.textContent(`#notes-list li[data-note="${note}"] .on`), /on the plane/, 'the list says the note is on the plane');
    assert.match(await page.textContent('#status'), /on the plane/, 'and so does the status');
    assert.equal(await page.locator('.palette button[data-tool="Note"].is-active').count(), 0, 'the tool is put down after one note');
    assert.match(await exportText(page), /\bmetadata <n\d+> : Issue \{ text = ""; \}/, 'a free note exports as an Issue about nothing');
    await finish(ctx);
  });

  test('dragging the free pin onto a box puts the note on the box, and its label follows', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const el = await placeElement(page, 'PartDefinition');
    await rename(page, el, 'Ledger');
    const note = await noteAt(page, await emptyPoint(page));
    const from = await page.locator(`#drawing g.pin[data-note="${note}"]`).boundingBox();
    const box = await page.locator(`g[data-el="${el}"]`).first().boundingBox();
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.6, { steps: 12 });
    await page.mouse.up();
    await until(page, (id) => { const on = document.querySelector(`#notes-list li[data-note="${id}"] .on`); return Boolean(on) && /Ledger/.test(on.textContent); },
      note, 'the note is listed on Ledger');
    assert.equal(await page.locator(`#drawing g.pin.is-free[data-note="${note}"]`).count(), 0, 'the pin is no longer free');
    assert.equal(await page.locator(`#drawing g.pin[data-note="${note}"]`).count(), 1, 'the note has a pin on the box');
    assert.match(await page.textContent('#status'), /Moved note \d+ onto part def Ledger/);
    await finish(ctx);
  });

  test('the Note tool on a box adds a note on it', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const el = await placeElement(page, 'PartDefinition');
    await rename(page, el, 'Vault');
    const box = await page.locator(`g[data-el="${el}"]`).first().boundingBox();
    const note = await noteAt(page, { x: box.x + box.width * 0.35, y: box.y + box.height * 0.35 });
    assert.match(await page.textContent(`#notes-list li[data-note="${note}"] .on`), /part def Vault/, 'the note is on the box');
    assert.equal(await page.locator(`#drawing g.pin[data-note="${note}"]:not(.is-free)`).count(), 1, 'its pin sits on the box, not free');
    assert.match(await exportText(page), /\bmetadata <n\d+> : Issue about StrongholdProof::Vault\b/, 'it exports as an Issue about the box');
    await finish(ctx);
  });
});
