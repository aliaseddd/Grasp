// Moving and resizing boxes on a plane, as a person does it: with the mouse on a box's header, on a port's square and
// on the eight controls of a selected box, and with the bar's Undo and Redo. Written in step 7, before what it checks.
//
// Every test opens the example through the file input and reads only what the page shows: a node's rectangle on the
// screen (boxOf, rectsOf) and the bar's buttons. None reads the application's own objects.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { after, afterEach, before, describe, test } from 'node:test';
import {
  BROWSER_FRAMES, boxOf, byTestId, closePages, collapseSides, EXAMPLE, finish, frame, HANDLE, headerOf, launch, modelOf, near, NODE, nodeOf, openPage,
  openStateFile, planeOf, rectsOf, selectBox, soon, stateFileAt, TESTIDS, untilDrawn, viewTab,
} from './helpers.mjs';

const VIEW = modelOf(EXAMPLE).views[0];
const EDGES = (page) => page.evaluate((plane) => document.querySelectorAll(`${plane} .react-flow__edge`).length, planeOf(VIEW.id));

/** Opens the example with both sides collapsed, so that the plane has room, and waits until it is drawn. */
async function openExample(browser) {
  const opened = await openPage(browser, { picker: false });
  const { page } = opened;
  await collapseSides(page);
  await openStateFile(page, stateFileAt(EXAMPLE));
  await viewTab(page, VIEW);
  await untilDrawn(page, VIEW);
  await frame(page);
  return opened;
}

/** The pointer goes down at `from`, moves in `steps` equal moves to `to`, and goes up; the page then gets a frame. */
async function dragTo(page, from, to, steps = 6) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) await page.mouse.move(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
  await page.mouse.up();
  await frame(page);
}

/** The middle of a rectangle. */
const middleOf = (r) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });

/** Whether one of the bar's buttons is disabled, by the DOM's own flags. */
const disabled = (page, name) => page.evaluate((selector) => {
  const el = document.querySelector(selector);
  return el ? el.disabled || el.getAttribute('aria-disabled') === 'true' : null;
}, byTestId(TESTIDS[name]));

/** Clicks one of the bar's buttons, which must be enabled. */
async function press(page, name) {
  assert.equal(await disabled(page, name), false, `${name[0].toUpperCase()}${name.slice(1)} is not enabled.`);
  await page.locator(byTestId(TESTIDS[name])).click();
  await frame(page);
}

/** Waits until a box is drawn where `check` says, and returns where. */
const untilBox = (page, id, check, missing) => soon(page, async () => {
  const now = await boxOf(page, VIEW.id, id);
  return now && check(now) ? now : null;
}, missing);

/** Fails if the plane panned instead of the box moving: StrongholdApp, which no test here touches, must be where it was. */
async function notPanned(page, was, what) {
  const now = await boxOf(page, VIEW.id, 'StrongholdApp');
  assert.ok(near(now.x, was.x, 1) && near(now.y, was.y, 1), `${what} did not move a box: it panned the plane by ${(now.x - was.x).toFixed(0)} x ${(now.y - was.y).toFixed(0)} px (a node is not draggable).`);
}

/** Hovers a bar button and reads its tooltip (MUI's, role tooltip). */
async function tooltipOf(page, name) {
  await page.locator(byTestId(TESTIDS[name])).hover();
  const tip = page.getByRole('tooltip');
  await soon(page, async () => (await tip.count()) > 0, `Hovering ${name} shows no tooltip (role "tooltip").`);
  return (await tip.last().textContent()).trim();
}

/** The handle of a selected box at a corner, as a point on the screen. */
async function handleOf(page, id, corner) {
  const handle = page.locator(`${nodeOf(VIEW.id, id)} ${HANDLE}.${corner}`);
  await soon(page, async () => (await handle.count()) === 1, `${id}, selected, shows no resize handle at its ${corner.replace('.', ' ')} corner (${HANDLE}.${corner}).`);
  const grip = await handle.boundingBox();
  assert.ok(grip, `The resize handle at the ${corner.replace('.', ' ')} corner of ${id} is not shown.`);
  return middleOf(grip);
}

describe('moving and resizing boxes', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  test('a drag is one undo step, undone and redone', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    const was = await boxOf(page, VIEW.id, 'Host');
    const still = await boxOf(page, VIEW.id, 'StrongholdApp');
    assert.equal(await disabled(page, 'undo'), true, 'Undo is enabled before anything was done.');
    const start = headerOf(was);
    await dragTo(page, start, { x: start.x + 80, y: start.y + 40 }, 8);
    await notPanned(page, still, 'A drag of Host by its header');
    const moved = await untilBox(page, 'Host', (b) => Math.abs(b.x - was.x) > 1 || Math.abs(b.y - was.y) > 1,
      'Host did not move when it was dragged by its header (a node is not draggable).');
    assert.ok(near((moved.x - was.x) / was.zoom, 80 / was.zoom, 1) && near((moved.y - was.y) / was.zoom, 40 / was.zoom, 1),
      `Host was dragged by 80 x 40 px, which is ${(80 / was.zoom).toFixed(1)} x ${(40 / was.zoom).toFixed(1)} units, and moved by ${((moved.x - was.x) / was.zoom).toFixed(1)} x ${((moved.y - was.y) / was.zoom).toFixed(1)}.`);
    assert.equal(await disabled(page, 'undo'), false, 'Undo is not enabled after a drag.');
    const tip = await tooltipOf(page, 'undo');
    assert.ok(tip.includes('Undo Moved part def Host'), `Undo's tooltip reads "${tip}"; it should read "Undo Moved part def Host".`);

    await press(page, 'undo');
    const back = await untilBox(page, 'Host', (b) => near(b.x, was.x, 1) && near(b.y, was.y, 1), 'One Undo did not put Host back where it was.');
    assert.ok(near(back.width, was.width, 1), 'Undo changed the size of Host.');
    assert.equal(await disabled(page, 'undo'), true, 'The drag took more than one undo step: Undo is still enabled after one.');
    assert.equal(await disabled(page, 'redo'), false, 'Redo is not enabled after Undo.');

    await press(page, 'redo');
    await untilBox(page, 'Host', (b) => near(b.x, moved.x, 1) && near(b.y, moved.y, 1), 'Redo did not move Host again.');
    await finish(opened);
  });

  test('three boxes dragged together are one step', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    const ids = ['ServerHost', 'OnlineHost', 'DevHost'];
    await selectBox(page, VIEW, ids[0]);
    await page.keyboard.down('Control');
    try {
      for (const id of ids.slice(1)) {
        const at = headerOf(await boxOf(page, VIEW.id, id));
        await page.mouse.click(at.x, at.y);
        await soon(page, async () => (await boxOf(page, VIEW.id, id)).selected, `Ctrl + click on ${id} does not add it to the selection.`);
      }
    } finally {
      await page.keyboard.up('Control');
    }
    const was = Object.fromEntries(await Promise.all(ids.map(async (id) => [id, await boxOf(page, VIEW.id, id)])));
    for (const id of ids) assert.ok(was[id].selected, `${id} is not selected.`);
    const start = headerOf(was.OnlineHost);
    const still = await boxOf(page, VIEW.id, 'StrongholdApp');
    await dragTo(page, start, { x: start.x + 60, y: start.y - 30 }, 6);
    await notPanned(page, still, 'A drag of OnlineHost by its header');
    const dragged = await untilBox(page, 'OnlineHost', (b) => Math.abs(b.x - was.OnlineHost.x) > 1, 'OnlineHost did not move when it was dragged by its header (a node is not draggable).');
    const dx = dragged.x - was.OnlineHost.x;
    const dy = dragged.y - was.OnlineHost.y;
    for (const id of ids) {
      const now = await boxOf(page, VIEW.id, id);
      assert.ok(near(now.x - was[id].x, dx, 1) && near(now.y - was[id].y, dy, 1),
        `${id} moved by ${(now.x - was[id].x).toFixed(1)} x ${(now.y - was[id].y).toFixed(1)} px; OnlineHost, which was dragged, moved by ${dx.toFixed(1)} x ${dy.toFixed(1)}.`);
    }
    await press(page, 'undo');
    for (const id of ids) {
      await untilBox(page, id, (b) => near(b.x, was[id].x, 1) && near(b.y, was[id].y, 1), `One Undo did not put ${id} back where it was.`);
    }
    assert.equal(await disabled(page, 'undo'), true, 'The drag of three boxes took more than one undo step.');
    await finish(opened);
  });

  test('a click that slips a few pixels moves nothing', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    const host0 = await boxOf(page, VIEW.id, 'Host');
    const app0 = await boxOf(page, VIEW.id, 'App');
    const at = headerOf(host0);
    await page.mouse.move(at.x, at.y);
    await page.mouse.down();
    await page.mouse.move(at.x + 2, at.y);
    await frame(page);
    await page.mouse.move(at.x + 3, at.y);
    await frame(page);
    await page.mouse.up();
    for (let i = 0; i < 3; i++) await frame(page);
    await soon(page, async () => (await boxOf(page, VIEW.id, 'Host')).selected, 'A press on the header of Host that slipped 3 px before its release did not select it.');
    const host = await boxOf(page, VIEW.id, 'Host');
    const app = await boxOf(page, VIEW.id, 'App');
    assert.ok(near(host.x - app.x, host0.x - app0.x, 0.5) && near(host.y - app.y, host0.y - app0.y, 0.5),
      `A press that slipped 3 px moved Host by ${((host.x - app.x) - (host0.x - app0.x)).toFixed(1)} x ${((host.y - app.y) - (host0.y - app0.y)).toFixed(1)} px against App.`);
    assert.equal(await disabled(page, 'undo'), true, 'A click that slipped 3 px made an undo step: Undo is enabled.');
    const name = await page.locator(byTestId(TESTIDS.fileName)).textContent();
    assert.ok(!name.includes(' •'), `A click that slipped 3 px left the file marked as changed: "${name}".`);
    await finish(opened);
  });

  test('an undo by the keyboard in the middle of a drag cancels the drag', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    const app0 = await boxOf(page, VIEW.id, 'App');
    const host0 = await boxOf(page, VIEW.id, 'Host');
    const grab = headerOf(app0);
    await dragTo(page, grab, { x: grab.x + 40, y: grab.y + 60 }, 6);
    const app1 = await untilBox(page, 'App', (b) => Math.abs(b.x - app0.x) > 5, 'App did not move when it was dragged by its header.');

    const at = headerOf(host0);
    await page.mouse.move(at.x, at.y);
    await page.mouse.down();
    for (let i = 1; i <= 4; i++) { await page.mouse.move(at.x + i * 15, at.y + i * 5); await frame(page); }
    await untilBox(page, 'Host', (b) => b.x - host0.x > 20, 'Host did not follow the pointer in the first half of the drag.');
    await page.keyboard.press('Control+z');
    await frame(page);
    await untilBox(page, 'App', (b) => near(b.x, app0.x, 1) && near(b.y, app0.y, 1), 'Ctrl + Z in the middle of the drag did not undo the move of App.');
    for (let i = 5; i <= 8; i++) { await page.mouse.move(at.x + i * 15, at.y + i * 5); await frame(page); }
    await page.mouse.up();
    for (let i = 0; i < 3; i++) await frame(page);
    const host = await boxOf(page, VIEW.id, 'Host');
    const app = await boxOf(page, VIEW.id, 'App');
    assert.ok(near(host.x, host0.x, 1) && near(host.y, host0.y, 1),
      `Host is ${((host.x - host0.x) / host.zoom).toFixed(1)} x ${((host.y - host0.y) / host.zoom).toFixed(1)} units from where it was: the drag that an undo interrupted was written.`);
    assert.ok(near(app.x, app0.x, 1) && near(app.y, app0.y, 1), `App is not back where it was after the undo (it was moved by ${((app1.x - app0.x) / app.zoom).toFixed(0)} units).`);
    assert.equal(await disabled(page, 'undo'), true, 'The interrupted drag wrote an undo step.');
    assert.equal(await disabled(page, 'redo'), false, "The interrupted drag emptied Redo: App's undone move is gone.");
    const tip = await tooltipOf(page, 'redo');
    assert.ok(tip.includes('Redo Moved part def App'), `Redo's tooltip reads "${tip}"; it should read "Redo Moved part def App".`);
    await finish(opened);
  });

  test('a nested box cannot leave its owner, and the owner grows', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    const page0 = await boxOf(page, VIEW.id, 'Page');
    const hosts0 = await boxOf(page, VIEW.id, 'Page.hosts');
    // Dragged until its top left corner would lie 30 px up and to the left of its owner's.
    const start = headerOf(hosts0);
    const still = await boxOf(page, VIEW.id, 'StrongholdApp');
    await dragTo(page, start, { x: start.x - (hosts0.x - page0.x) - 30, y: start.y - (hosts0.y - page0.y) - 30 }, 8);
    await notPanned(page, still, 'A drag of Page.hosts by its header');
    const hosts = await untilBox(page, 'Page.hosts', (b) => Math.abs(b.x - hosts0.x) > 1 || Math.abs(b.y - hosts0.y) > 1,
      'Page.hosts did not move when it was dragged by its header (a nested node is not draggable).');
    const owner = await boxOf(page, VIEW.id, 'Page');
    const left = (hosts.x - owner.x) / owner.zoom;
    const top = (hosts.y - owner.y) / owner.zoom;
    assert.ok(near(left, 12, 1), `Page.hosts, dragged up and left past its owner, stops ${left.toFixed(1)} units from Page's left edge; it should stop at 12.`);
    assert.ok(near(top, 48, 1), `Page.hosts, dragged up and left past its owner, stops ${top.toFixed(1)} units from Page's top edge; it should stop at 48.`);

    // Page.app is at its owner's right limit already: dragged to the right, it takes Page's right edge with it.
    const app0 = await boxOf(page, VIEW.id, 'Page.app');
    const planeRight = await page.evaluate((sel) => document.querySelector(sel).getBoundingClientRect().right, planeOf(VIEW.id));
    const dx = Math.max(20, Math.min(120, planeRight - 30 - (app0.x + app0.width)));
    const grab = headerOf(app0);
    await dragTo(page, grab, { x: grab.x + dx, y: grab.y }, 6);
    await notPanned(page, still, 'A drag of Page.app by its header');
    const app = await untilBox(page, 'Page.app', (b) => b.x - app0.x > 1, 'Page.app did not move when it was dragged by its header (a nested node is not draggable).');
    const grown = await untilBox(page, 'Page', (b) => b.width > owner.width + 1, `Page's drawn width is still ${(owner.width / owner.zoom).toFixed(0)} units after Page.app was dragged to the right: the owner did not grow.`);
    const gap = (grown.x + grown.width - (app.x + app.width)) / grown.zoom;
    assert.ok(near(gap, 12, 1), `Page's right edge is ${gap.toFixed(1)} units beyond Page.app's right edge; it should be 12.`);
    await finish(opened);
  });

  test('a port dragged past a corner changes side', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    const host = await boxOf(page, VIEW.id, 'Host');
    const port0 = (await rectsOf(page, VIEW.id))['Host.api'];
    assert.ok(port0, 'The plane draws no node for Host.api.');
    const grab = middleOf(port0);
    // Down past the corner at the bottom right, then along below the box to the left.
    await page.mouse.move(grab.x, grab.y);
    await page.mouse.down();
    await page.mouse.move(grab.x + 4, grab.y + 20);
    await page.mouse.move(host.x + host.width + 12, host.y + host.height + 14);
    await page.mouse.move(host.x + host.width * 0.7, host.y + host.height + 14);
    await page.mouse.move(host.x + host.width * 0.4, host.y + host.height + 14);
    await page.mouse.up();
    await frame(page);
    await soon(page, async () => {
      const r = (await rectsOf(page, VIEW.id))['Host.api'];
      const o = await boxOf(page, VIEW.id, 'Host');
      return r && (Math.abs((r.x - o.x) - (port0.x - host.x)) > 1 || Math.abs((r.y - o.y) - (port0.y - host.y)) > 1);
    }, 'Host.api did not move along Host when it was dragged by its square (a port is not draggable: the plane panned instead).');
    const now = (await rectsOf(page, VIEW.id))['Host.api'];
    const owner = await boxOf(page, VIEW.id, 'Host');
    const middle = middleOf(now);
    assert.ok(near(middle.y, owner.y + owner.height, 1.5),
      `Host.api, dragged past Host's bottom right corner and along below it, is centred at y ${middle.y.toFixed(1)}; Host's bottom border is at ${(owner.y + owner.height).toFixed(1)}: the port did not change to the bottom side.`);
    assert.ok(middle.x > owner.x && middle.x < owner.x + owner.width, `Host.api is centred at x ${middle.x.toFixed(1)}, outside Host's bottom border (${owner.x.toFixed(1)} to ${(owner.x + owner.width).toFixed(1)}).`);

    // What was written: the step's words, and the place in the saved file.
    const tip = await tooltipOf(page, 'undo');
    assert.ok(tip.includes('Undo Moved port api in Host to the bottom side'), `Undo's tooltip reads "${tip}"; it should read "Undo Moved port api in Host to the bottom side".`);
    let download = null;
    page.waitForEvent('download', { timeout: 5000 }).then((got) => { download = got; }, () => {});
    await page.locator(byTestId(TESTIDS.save)).click();
    await soon(page, async () => download, 'Save downloaded no file (the page has no file picker).', BROWSER_FRAMES);
    const saved = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
    const layout = saved.model.views.find((v) => v.id === VIEW.id).layout['Host.api'];
    assert.deepEqual(Object.keys(layout).sort(), ['at', 'side'], `The saved place of Host.api is ${JSON.stringify(layout)}; it should be { side, at } only.`);
    assert.equal(layout.side, 'bottom', `The saved place of Host.api is ${JSON.stringify(layout)}; its side should be "bottom".`);
    assert.ok(typeof layout.at === 'number' && layout.at >= 0.05 && layout.at <= 0.95, `The saved place of Host.api is ${JSON.stringify(layout)}; its "at" should be a number from 0.05 to 0.95.`);
    await finish(opened);
  });

  test('a resize from the top left keeps the opposite corner', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    const was = await selectBox(page, VIEW, 'Host');
    const corner = { x: was.x + was.width, y: was.y + was.height };
    const grip = await handleOf(page, 'Host', 'top.left');
    await dragTo(page, grip, { x: grip.x - 40, y: grip.y - 30 }, 6);
    const larger = await untilBox(page, 'Host', (b) => b.width > was.width + 10, 'Host did not grow when its top left handle was dragged up and to the left.');
    assert.ok(near(larger.x + larger.width, corner.x, 1.5) && near(larger.y + larger.height, corner.y, 1.5),
      `Host's bottom right corner is at ${(larger.x + larger.width).toFixed(1)}, ${(larger.y + larger.height).toFixed(1)} after a resize from the top left; it was at ${corner.x.toFixed(1)}, ${corner.y.toFixed(1)}.`);
    assert.ok(larger.height > was.height + 10, 'Host grew in width only; it should grow in height too.');

    // Far down and to the right, past what the box can be: it stops at its least, with its corner still in place.
    const grip2 = await handleOf(page, 'Host', 'top.left');
    await dragTo(page, grip2, { x: grip2.x + larger.width + 120, y: grip2.y + larger.height + 60 }, 8);
    const least = await untilBox(page, 'Host', (b) => b.width < larger.width - 20, 'Host did not shrink when its top left handle was dragged down and to the right.');
    assert.ok(near(least.x + least.width, corner.x, 1.5) && near(least.y + least.height, corner.y, 1.5),
      `After a resize down and to the right, Host's bottom right corner is at ${(least.x + least.width).toFixed(1)}, ${(least.y + least.height).toFixed(1)}; it was at ${corner.x.toFixed(1)}, ${corner.y.toFixed(1)}.`);
    assert.ok(near(least.w, 80, 1), `Host was resized down to ${least.w} units wide; the least a part def can be is 80.`);
    assert.ok(least.h >= 40, `Host was resized down to ${least.h} units high; it cannot be smaller than what it holds (its header is 40 high).`);
    assert.ok(least.x < corner.x - 20 && least.y < corner.y - 20, 'Host was turned inside out by the handle: its top left is past its bottom right.');
    await finish(opened);
  });

  test('a resize of an owner from its top left leaves what it holds where it was, in one undo step', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    const was = await selectBox(page, VIEW, 'Page');
    const inside = async () => ({ hosts: await boxOf(page, VIEW.id, 'Page.hosts'), app: await boxOf(page, VIEW.id, 'Page.app') });
    const before = await inside();
    const still = (now, what) => {
      for (const id of ['hosts', 'app']) {
        assert.ok(near(now[id].x, before[id].x, 1.5) && near(now[id].y, before[id].y, 1.5),
          `${what}, Page.${id} is drawn ${(now[id].x - before[id].x).toFixed(1)} by ${(now[id].y - before[id].y).toFixed(1)} px from where it was: what a box holds must stay where it is when the box is resized from its top left.`);
      }
    };
    const grip = await handleOf(page, 'Page', 'top.left');
    await dragTo(page, grip, { x: grip.x - 50, y: grip.y - 36 }, 6);
    const larger = await untilBox(page, 'Page', (b) => b.x < was.x - 20 && b.y < was.y - 20, 'Page did not grow when its top left handle was dragged up and to the left.');
    assert.ok(near(larger.x + larger.width, was.x + was.width, 1.5) && near(larger.y + larger.height, was.y + was.height, 1.5), 'Page\'s bottom right corner moved in a resize from its top left.');
    still(await inside(), 'After Page was resized from its top left');

    // One step: Undo names the resize, puts Page and its parts back, and has nothing more to undo.
    assert.equal(await tooltipOf(page, 'undo'), 'Undo Resized part def Page', 'Undo names the resize of Page.');
    await press(page, 'undo');
    await untilBox(page, 'Page', (b) => near(b.x, was.x, 1.5) && near(b.y, was.y, 1.5) && near(b.width, was.width, 1.5), 'Undo did not put Page back where it was before the resize.');
    still(await inside(), 'After the resize was undone');
    assert.equal(await disabled(page, 'undo'), true, 'The resize of Page with what it holds was more than one undo step.');
    await press(page, 'redo');
    await untilBox(page, 'Page', (b) => near(b.x, larger.x, 1.5) && near(b.y, larger.y, 1.5), 'Redo did not resize Page again.');
    still(await inside(), 'After the resize was redone');

    // Far down and to the right: the corner stops where Page.hosts would pass 12 or 48 from it, and nothing inside moves.
    const grip2 = await handleOf(page, 'Page', 'top.left');
    await dragTo(page, grip2, { x: grip2.x + 400, y: grip2.y + 260 }, 10);
    const smaller = await untilBox(page, 'Page', (b) => b.x > larger.x + 20, 'Page did not shrink when its top left handle was dragged down and to the right.');
    const now = await inside();
    still(now, 'After Page was resized from its top left down and to the right');
    const gap = { x: (now.hosts.x - smaller.x) / smaller.zoom, y: (now.hosts.y - smaller.y) / smaller.zoom };
    assert.ok(near(gap.x, 12, 1) && near(gap.y, 48, 1), `Page's corner stopped ${gap.x.toFixed(1)} by ${gap.y.toFixed(1)} units from Page.hosts; it should stop at 12 by 48.`);
    await finish(opened);
  });

  test('a selected box shows eight resize controls', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    const count = (selector) => page.evaluate(([node, sel]) => document.querySelectorAll(`${node} ${sel}`).length, [nodeOf(VIEW.id, 'Host'), selector]);
    assert.equal(await count('.react-flow__resize-control'), 0, 'Host, not selected, shows resize controls.');
    await selectBox(page, VIEW, 'Host');
    await soon(page, async () => (await count('.react-flow__resize-control')) > 0, 'Host, selected, shows no resize controls (.react-flow__resize-control).');
    const all = await count('.react-flow__resize-control');
    assert.equal(all, 8, `Host, selected, shows ${all} resize controls; it should show 8.`);
    assert.equal(await count('.react-flow__resize-control.handle'), 4, 'Host, selected, should show 4 corner handles.');
    assert.equal(await count('.react-flow__resize-control.line'), 4, 'Host, selected, should show 4 side lines.');
    await finish(opened);
  });

  test('a port stays on the border after a resize', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    const was = await selectBox(page, VIEW, 'Host');
    const grip = await handleOf(page, 'Host', 'bottom.right');
    await dragTo(page, grip, { x: grip.x + 60, y: grip.y + 40 }, 6);
    const grown = await untilBox(page, 'Host', (b) => b.width > was.width + 10 && b.height > was.height + 10, 'Host did not grow when its bottom right handle was dragged.');
    const port = middleOf((await rectsOf(page, VIEW.id))['Host.api']);
    assert.ok(near(port.x, grown.x + grown.width, 1.5), `Host.api is centred at x ${port.x.toFixed(1)}; Host's right border is at ${(grown.x + grown.width).toFixed(1)} after the resize.`);
    const at = (port.y - grown.y) / grown.height;
    assert.ok(near(at, 0.5, 0.02), `Host.api lies at ${at.toFixed(3)} of Host's height after the resize; it lay at 0.5.`);
    await finish(opened);
  });

  test('a resize never leaves a box smaller than what it holds', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    const was = await selectBox(page, VIEW, 'Page');
    const grip = await handleOf(page, 'Page', 'bottom.right');
    const top = await page.evaluate((sel) => document.querySelector(sel).getBoundingClientRect().top, planeOf(VIEW.id));
    await dragTo(page, grip, { x: Math.max(4, grip.x - 600), y: Math.max(top + 4, grip.y - 300) }, 10);
    const shrunk = await untilBox(page, 'Page', (b) => b.width < was.width - 20 || b.height < was.height - 20, 'Page did not shrink when its bottom right handle was dragged up and to the left.');
    const hosts = await boxOf(page, VIEW.id, 'Page.hosts');
    const app = await boxOf(page, VIEW.id, 'Page.app');
    for (const [id, inner] of [['Page.hosts', hosts], ['Page.app', app]]) {
      const right = (shrunk.x + shrunk.width - (inner.x + inner.width)) / shrunk.zoom;
      const bottom = (shrunk.y + shrunk.height - (inner.y + inner.height)) / shrunk.zoom;
      assert.ok(right >= 12 - 1, `Page, resized small, ends ${right.toFixed(1)} units beyond the right edge of ${id}; it must keep 12.`);
      assert.ok(bottom >= 12 - 1, `Page, resized small, ends ${bottom.toFixed(1)} units beyond the bottom edge of ${id}; it must keep 12.`);
    }
    const heads = await page.evaluate((sel) => {
      const node = document.querySelector(sel);
      const sum = (selector) => [...node.querySelectorAll(selector)].filter((el) => el.parentElement === node).reduce((total, el) => total + el.offsetHeight, 0);
      return sum('.grasp-node-header') + sum('.grasp-compartment');
    }, nodeOf(VIEW.id, 'Page'));
    assert.ok(heads > 40, `Page's header and doc compartment are ${heads} px high: the test found no doc compartment.`);
    assert.ok(shrunk.h >= heads - 1, `Page was resized to ${shrunk.h} units high; its header and doc compartment need ${heads}.`);
    await finish(opened);
  });

  test('Backspace and Delete remove nothing', async () => {
    // Passes at 695a789, before step 7: nothing deletes a node then. It is checked later by breaking the code.
    const opened = await openExample(browser);
    const { page } = opened;
    await selectBox(page, VIEW, 'Host');
    const edges = await EDGES(page);
    const nodes = () => page.evaluate((sel) => document.querySelectorAll(sel).length, `${planeOf(VIEW.id)} ${NODE}`);
    const before = await nodes();
    for (const key of ['Backspace', 'Delete']) {
      await page.keyboard.press(key);
      await frame(page);
      assert.ok(await boxOf(page, VIEW.id, 'Host'), `${key} removed Host from the plane.`);
      assert.equal(await EDGES(page), edges, `${key} changed the number of lines drawn (${edges}).`);
    }
    assert.equal(await nodes(), before, 'Backspace and Delete changed the number of nodes drawn.');
    assert.equal(await disabled(page, 'undo'), true, 'Backspace and Delete made an undo step.');
    await finish(opened);
  });
});
