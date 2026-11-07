// The sequence view: a new SequenceView's palette and two lifelines placed left to right; a message drawn between
// them as a horizontal row that exports as message … from … to …; a second message swapping rows when its order is
// set in the panel; an event placed on a lifeline, exported inside it; a message refused between lifelines in two
// contexts; the sequence fixture imported, drawn in time order with its then chain in the export, and a connection
// drawn in its structure view not counted as drawn in the sequence view; a succession between two events drawn as a
// line from dot to dot; a refused drag leaving the layout as it was; the pin on a message above its label.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { embeddedModel, exportText, finish, launch, openCanvas, placeElement, rename, until } from './helpers.mjs';

const FIXTURE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'sequence.json');
const STATE_KEY = 'stronghold-canvas:' + embeddedModel().revision; // where local mode keeps the page's state

/** The layout entry of an element in a view as the page has persisted it, after its pending save is flushed. */
async function savedLayout(page, viewId, elId) {
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
  return page.evaluate(([key, v, id]) => {
    const raw = localStorage.getItem(key);
    const view = raw ? JSON.parse(raw).model.views.find((x) => x.id === v) : null;
    return view ? view.layout[id] : null;
  }, [STATE_KEY, viewId, elId]);
}

async function addView(page, kind) {
  const before = await page.locator('#drawing g.frame[data-view]').count();
  await page.selectOption('#new-view-kind', kind);
  await page.click('#new-view');
  await until(page, (count) => document.querySelectorAll('#drawing g.frame[data-view]').length > count, before, 'a new frame appears');
  return page.getAttribute('#drawing g.frame.is-active', 'data-view');
}

/** The frame of view `id` on screen, so clicks can be placed inside it. */
async function frameBox(page, id) {
  const box = await page.locator(`#drawing g.frame[data-view="${id}"] > rect.outline`).boundingBox();
  assert.ok(box, `the frame of view ${id} has a box`);
  return box;
}

/** A horizontal line's d attribute as its two end points. */
function points(d) {
  return d.split(/[ML]/).filter(Boolean).map((s) => s.split(',').map(Number));
}

/** The y of a message's line in a view, from its path. */
async function rowOf(page, viewId, relId) {
  const d = await page.getAttribute(`#drawing g.frame[data-view="${viewId}"] g[data-rel="${relId}"] path.line`, 'd');
  const pts = points(d);
  assert.equal(pts[0][1], pts[1][1], `the message ${relId} is a horizontal line: ${d}`);
  return pts[0][1];
}

/** Arms the Message tool and clicks two points on the drawing; a horizontal line's box has no height, so clicks go through the mouse. */
async function drawMessage(page, from, to) {
  await page.click('.palette button[data-tool="Message"]');
  await page.mouse.click(from.x, from.y);
  await page.mouse.click(to.x, to.y);
}

/** The centre of an element's head or dot in a view, in page pixels. */
async function centreOf(page, viewId, elId) {
  const box = await page.locator(`#drawing g.frame[data-view="${viewId}"] g[data-el="${elId}"] > .outline`).boundingBox();
  assert.ok(box, `${elId} is drawn in view ${viewId}`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Two lifelines placed in a new sequence view, left and right, and the view's id. */
async function twoLifelines(page) {
  const view = await addView(page, 'SequenceView');
  const frame = await frameBox(page, view);
  const left = await placeElement(page, 'PartUsage', { x: frame.x + frame.width * 0.3, y: frame.y + 120 });
  const right = await placeElement(page, 'PartUsage', { x: frame.x + frame.width * 0.72, y: frame.y + 120 });
  return { view, left, right };
}

describe('sequence view', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('a new SequenceView offers part, event and message, and two parts placed become lifelines left to right', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const { view, left, right } = await twoLifelines(page);
    const tools = await page.$$eval('.palette button[data-tool]:not([data-tool="Note"])', (bs) => bs.map((b) => b.getAttribute('data-tool')));
    assert.deepEqual(tools, ['PartUsage', 'EventOccurrenceUsage', 'Message', 'SuccessionAsUsage'], 'the palette of a sequence view');
    assert.match(await page.textContent('.eyebrow'), /sequence view/);
    const a = await page.locator(`#drawing g.frame[data-view="${view}"] g[data-el="${left}"][data-kind="PartUsage"]`).boundingBox();
    const b = await page.locator(`#drawing g.frame[data-view="${view}"] g[data-el="${right}"][data-kind="PartUsage"]`).boundingBox();
    assert.ok(a && b, 'both heads are drawn in the sequence frame');
    assert.ok(a.x + a.width <= b.x, `the heads sit left to right: ${a.x}+${a.width} and ${b.x}`);
    assert.ok(Math.abs(a.y - b.y) < 1, 'the heads share the top of the view');
    assert.equal(await page.locator(`#drawing g.frame[data-view="${view}"] path.lifeline`).count(), 2, 'a dashed lifeline under each head');
    assert.match(await page.textContent('#status'), /Added part part2/);
    await finish(ctx);
  });

  test('a message between two lifelines is a horizontal row and exports as message … from … to …', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const { view, left, right } = await twoLifelines(page);
    const before = await page.locator('g[data-rel]').count();
    await drawMessage(page, await centreOf(page, view, left), await centreOf(page, view, right));
    await until(page, (count) => document.querySelectorAll('g[data-rel]').length > count, before, 'the message appears');
    const id = await page.getAttribute(`#drawing g.frame[data-view="${view}"] g[data-rel][data-kind="Message"]`, 'data-rel');
    assert.ok(id, 'a Message line is drawn in the sequence frame');
    const y = await rowOf(page, view, id);
    const head = page.locator(`#drawing g.frame[data-view="${view}"] g[data-el="${left}"] > .outline`);
    const headBottom = +(await head.getAttribute('y')) + +(await head.getAttribute('height'));
    assert.ok(y > headBottom, `the row (${y}) is below the heads (${headBottom})`);
    assert.match(await page.textContent('#status'), /Drew message part1 to part2/);
    assert.ok(await page.locator('#l-order').isVisible(), 'the panel shows the order field for a message');
    assert.ok(await page.locator('#l-item').isVisible(), 'and the item field');
    await page.fill('#f-name', 'hello');
    await until(page, (relId) => document.querySelector(`g[data-rel="${relId}"]`)?.textContent.includes('hello'), id, 'the label shows the name');
    assert.match(await exportText(page), /message hello from part1 to part2;/);
    assert.equal(await page.locator('#export-problems li').count(), 0, 'the export has no problems');
    await finish(ctx);
  });

  test('a second message lands on the next row, and setting its order in the panel swaps the rows', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const { view, left, right } = await twoLifelines(page);
    const from = await centreOf(page, view, left);
    const to = await centreOf(page, view, right);
    await drawMessage(page, from, to);
    await until(page, () => document.querySelectorAll('g[data-rel][data-kind="Message"]').length === 1, null, 'the first message appears');
    await drawMessage(page, to, from);
    await until(page, () => document.querySelectorAll('g[data-rel][data-kind="Message"]').length === 2, null, 'the second message appears');
    const ids = await page.$$eval(`#drawing g.frame[data-view="${view}"] g[data-rel][data-kind="Message"]`, (gs) => gs.map((g) => g.getAttribute('data-rel')));
    const [first, second] = ids;
    const y1 = await rowOf(page, view, first);
    const y2 = await rowOf(page, view, second);
    assert.ok(y2 > y1, `the second message is below the first: ${y1}, ${y2}`);
    assert.equal(await page.inputValue('#f-order'), '', 'a new message has no order yet');
    await page.fill('#f-order', '1');
    await until(page, ([v, a, b]) => {
      const y = (id) => +(document.querySelector(`#drawing g.frame[data-view="${v}"] g[data-rel="${id}"] path.line`)?.getAttribute('d') || 'M0,0').split(/[ML]/).filter(Boolean)[0].split(',')[1];
      return y(b) < y(a);
    }, [view, first, second], 'the second message moves above the first');
    assert.equal(await rowOf(page, view, second), y1, 'the second message took the first row');
    assert.equal(await rowOf(page, view, first), y2, 'the first message took the second row');
    assert.match(await page.getAttribute('#undo', 'title'), /Set the order of the message/);
    await finish(ctx);
  });

  test('setting a message\'s order and the reordering of the messages it brings are one undo step', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const { view, left, right } = await twoLifelines(page);
    const from = await centreOf(page, view, left);
    const to = await centreOf(page, view, right);
    await drawMessage(page, from, to);
    await until(page, () => document.querySelectorAll('g[data-rel][data-kind="Message"]').length === 1, null, 'the first message appears');
    await drawMessage(page, to, from);
    await until(page, () => document.querySelectorAll('g[data-rel][data-kind="Message"]').length === 2, null, 'the second message appears');
    const messages = () => page.evaluate(() => window.SysMLCanvas.state.model.relationships.filter((r) => r.kind === 'Message').map((r) => ({ id: r.id, order: r.order })));
    const [first, second] = (await messages()).map((m) => m.id);
    const steps = await page.evaluate(() => window.SysMLCanvas.state.history.length);
    await page.fill('#f-order', '1'); // the second message, just drawn, is selected
    await until(page, (id) => window.SysMLCanvas.state.model.relationships.find((r) => r.kind === 'Message').id === id, second, 'the second message comes first in the model');
    assert.equal(await page.evaluate(() => window.SysMLCanvas.state.history.length), steps + 1, 'the order and the reordering are one undo step');
    await page.click('#undo');
    await until(page, (id) => window.SysMLCanvas.state.model.relationships.find((r) => r.kind === 'Message').id === id, first, 'undo puts the first message back in front');
    assert.deepEqual(await messages(), [{ id: first, order: '' }, { id: second, order: '' }], 'and takes the order back with it');
    await finish(ctx);
  });

  test('an event placed on a lifeline is drawn on it and exported inside the part as event occurrence', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const { view, left } = await twoLifelines(page);
    const head = await page.locator(`#drawing g.frame[data-view="${view}"] g[data-el="${left}"] > .outline`).boundingBox();
    const event = await placeElement(page, 'EventOccurrenceUsage', { x: head.x + head.width / 2, y: head.y + head.height + 70 });
    assert.equal(await page.locator(`#drawing g.frame[data-view="${view}"] g[data-el="${left}"] g[data-el="${event}"][data-kind="EventOccurrenceUsage"]`).count(), 1,
      'the event is drawn on its lifeline');
    assert.match(await page.textContent('#status'), /Added event event1 in part1/);
    assert.ok(await page.locator('#f-name').isVisible(), 'the panel shows the name');
    assert.ok(await page.locator('#l-multiplicity').isHidden() && await page.locator('#l-type').isHidden(), 'no multiplicity and no definition for an event');
    await rename(page, event, 'sent');
    const text = await exportText(page);
    assert.match(text, /part part1 \{\s+event occurrence sent;\s+\}/, 'the export has the event inside its lifeline');
    await page.click('#close-export');
    // An event off every lifeline is refused with a message.
    const count = await page.locator('g[data-el]').count();
    await page.click('.palette button[data-tool="EventOccurrenceUsage"]');
    const frame = await frameBox(page, view);
    await page.mouse.click(frame.x + frame.width / 2, frame.y + frame.height - 30);
    await until(page, () => /Click a lifeline/.test(document.querySelector('#status').textContent), null, 'the status refuses an event off a lifeline');
    assert.equal(await page.locator('g[data-el]').count(), count, 'nothing was added');
    await finish(ctx);
  });

  test('a message between a lifeline inside a part def and one in the package is refused with a message', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const { view, right } = await twoLifelines(page);
    // Page.hosts, a part inside the part def Page, shown as a third lifeline through the Show list.
    await page.locator(`#drawing g.frame[data-view="${view}"] rect.tab`).click();
    await until(page, () => document.querySelector('#view-fields') && !document.querySelector('#view-fields').hidden, null, 'the view is selected');
    await page.selectOption('#v-show', 'Page.hosts');
    await page.click('#v-show-add');
    await until(page, (v) => !!document.querySelector(`#drawing g.frame[data-view="${v}"] g[data-el="Page.hosts"]`), view, 'Page.hosts is drawn as a lifeline');
    // The new lifeline lands beside the others and pushes the rightmost head under the panel, so the panel goes away first.
    await page.click('#hide-panel');
    const before = await page.locator('g[data-rel]').count();
    await drawMessage(page, await centreOf(page, view, 'Page.hosts'), await centreOf(page, view, right));
    await until(page, () => /reaches across definitions/.test(document.querySelector('#status').textContent), null, 'the status says why');
    assert.match(await page.textContent('#status'), /A message between part hosts in Page and part part2 reaches across definitions/);
    assert.equal(await page.locator('g[data-rel]').count(), before, 'no line was drawn');
    await page.keyboard.press('Escape');
    await finish(ctx);
  });

  test('the login fixture imports with its rows in time order, its events on their rows, and a then chain in the export', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await page.setInputFiles('#import-file', FIXTURE);
    await until(page, () => !!document.querySelector('#drawing g.frame[data-view="v-seq"]'), null, 'the fixture\'s sequence view is drawn');
    const seq = '#drawing g.frame[data-view="v-seq"] ';
    assert.equal(await page.locator(seq + 'g[data-el][data-kind="PartUsage"]').count(), 3, 'three lifelines');
    assert.equal(await page.locator(seq + 'g[data-rel][data-kind="Message"]').count(), 4, 'four messages');
    const rows = [];
    for (const id of ['m-login', 'm-check', 'm-ok', 'm-done']) rows.push(await rowOf(page, 'v-seq', id));
    assert.ok(rows[0] < rows[1] && rows[1] < rows[2] && rows[2] < rows[3], `the rows run top to bottom: ${rows.join(', ')}`);
    assert.equal(rows[1] - rows[0], 56, 'rows a spacing apart');
    const dot = await page.getAttribute(seq + 'g[data-el="Login.client.loginDone"] circle.outline', 'cy');
    assert.equal(+dot, rows[3], 'the event loginDone sits on the row of its message');
    assert.ok((await page.locator('#drawing g.pin[data-note="n1"]').count()) >= 1, 'the note on the login message is pinned');
    const text = await exportText(page);
    assert.match(text, /part client : Client \{\s+event occurrence loginSent;\s+then event occurrence loginDone \{/, 'the events are a then chain in the lifeline');
    assert.match(text, /message loggedIn from server to client\.loginDone \{/, 'a message ends on the event by its path');
    assert.match(text, /view loginSequence : StandardViewDefinitions::SequenceView \{/, 'the view is exported');
    assert.equal(await page.locator('#export-problems li').count(), 0, 'no problems');
    await page.click('#close-export');
    // A connection drawn in the structure view between two lifelines is drawn there only: the sequence view draws
    // no such line, so it is not counted as drawn in it.
    await page.locator('#drawing g.frame[data-view="v-all"] rect.tab').click();
    await until(page, () => document.querySelector('#drawing g.frame[data-view="v-all"]')?.classList.contains('is-active'), null, 'the structure view is active');
    await page.click('#zoom-fit'); // the structure view's parts sit under the panel at the import's zoom
    await page.click('.palette button[data-tool="ConnectionUsage"]');
    for (const id of ['Login.server', 'Login.auth']) {
      const box = await page.locator(`#drawing g.frame[data-view="v-all"] g[data-el="${id}"] > rect.outline`).boundingBox();
      await page.mouse.click(box.x + box.width / 2, box.y + 12);
    }
    await until(page, () => /^Drew connection server to auth/.test(document.querySelector('#status').textContent), null, 'the connection is drawn');
    assert.equal(await page.textContent('#f-views'), 'Drawn in loginStructure', 'the sequence view is not named among the views that draw it');
    assert.equal(await page.locator('#drawing g.frame[data-view="v-seq"] g[data-rel][data-kind="ConnectionUsage"]').count(), 0, 'and draws no line for it');
    await finish(ctx);
  });

  test('a succession between two events is drawn in the sequence frame as a line from dot to dot, and counted as drawn there', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const { view, left, right } = await twoLifelines(page);
    const headL = await page.locator(`#drawing g.frame[data-view="${view}"] g[data-el="${left}"] > .outline`).boundingBox();
    const headR = await page.locator(`#drawing g.frame[data-view="${view}"] g[data-el="${right}"] > .outline`).boundingBox();
    const sent = await placeElement(page, 'EventOccurrenceUsage', { x: headL.x + headL.width / 2, y: headL.y + headL.height + 70 });
    await rename(page, sent, 'sent');
    const got = await placeElement(page, 'EventOccurrenceUsage', { x: headR.x + headR.width / 2, y: headR.y + headR.height + 130 });
    await rename(page, got, 'got');
    await page.click('.palette button[data-tool="SuccessionAsUsage"]');
    assert.match(await page.textContent('#hint'), /Click the action, node or event that comes first/, 'the hint fits a sequence view');
    const a = await centreOf(page, view, sent);
    const b = await centreOf(page, view, got);
    await page.mouse.click(a.x, a.y);
    await page.mouse.click(b.x, b.y);
    await until(page, (v) => !!document.querySelector(`#drawing g.frame[data-view="${v}"] g[data-rel][data-kind="SuccessionAsUsage"]`), view, 'the succession is drawn in the sequence frame');
    assert.match(await page.textContent('#status'), /^Drew succession sent to got\.$/, 'and the status has no doubt about where');
    assert.match(await page.textContent('#f-views'), /^Drawn in view\d+$/, 'the panel names the sequence view');
    const d = await page.getAttribute(`#drawing g.frame[data-view="${view}"] g[data-rel][data-kind="SuccessionAsUsage"] path.line`, 'd');
    assert.equal(points(d).length, 2, `a straight line from dot to dot: ${d}`);
    assert.match(await exportText(page), /first part1\.sent then part2\.got;/);
    await finish(ctx);
  });

  test('a refused drag of an event that a message pins to its row leaves the layout as it was, with nothing new to undo', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const { view, left, right } = await twoLifelines(page);
    const head = await page.locator(`#drawing g.frame[data-view="${view}"] g[data-el="${left}"] > .outline`).boundingBox();
    const event = await placeElement(page, 'EventOccurrenceUsage', { x: head.x + head.width / 2, y: head.y + head.height + 90 });
    await drawMessage(page, await centreOf(page, view, event), await centreOf(page, view, right));
    await until(page, () => document.querySelectorAll('g[data-rel][data-kind="Message"]').length === 1, null, 'the message appears');
    const before = await savedLayout(page, view, event);
    const title = await page.getAttribute('#undo', 'title');
    const dot = await centreOf(page, view, event);
    await page.mouse.move(dot.x, dot.y);
    await page.mouse.down();
    await page.mouse.move(dot.x, dot.y + 40, { steps: 5 });
    await page.mouse.move(dot.x, dot.y + 80, { steps: 5 });
    await page.mouse.up();
    await until(page, () => /sits on the row of the message|went back/.test(document.querySelector('#status').textContent), null, 'the drag is refused');
    assert.deepEqual(await savedLayout(page, view, event), before, 'the event keeps the layout entry it had');
    assert.equal(await page.getAttribute('#undo', 'title'), title, 'the refused drag is not an undo step');
    await finish(ctx);
  });

  test('the pin on a message sits above the label that sits above the line, not on it', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await page.setInputFiles('#import-file', FIXTURE);
    await until(page, () => !!document.querySelector('#drawing g.pin[data-note="n1"][data-view="v-seq"]'), null, 'the note on the login message is pinned in the sequence view');
    const pin = await page.locator('#drawing g.pin[data-note="n1"][data-view="v-seq"] circle').boundingBox();
    const label = await page.locator('#drawing g.frame[data-view="v-seq"] g[data-rel="m-login"] text.uname').boundingBox();
    const line = await page.locator('#drawing g.frame[data-view="v-seq"] g[data-rel="m-login"] path.line').boundingBox();
    assert.ok(label.y + label.height <= line.y + 1, `the label is above the line: label ${JSON.stringify(label)}, line ${JSON.stringify(line)}`);
    assert.ok(pin.y + pin.height <= label.y, `the pin is above the label, not on it: pin ${JSON.stringify(pin)}, label ${JSON.stringify(label)}`);
    await finish(ctx);
  });
});
