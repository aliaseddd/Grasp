// The planes' pointer, their culling and their gate, in the browser (plan/notes.md, "Step 6: the independent review, which
// came after the commit"): written after the fixes, from the contract in canvas/app/src/plane/Plane.tsx. From file:// in
// Chromium; every test ends with finish(), which fails on any console error or warning.

import assert from 'node:assert/strict';
import path from 'node:path';
import { after, afterEach, before, describe, test } from 'node:test';
import { VIEWS, middleService, scaleState } from '../../test/scale-model.mjs';
import {
  boxOf, byTestId, closePages, EXAMPLE, finish, FIXTURES, frame, groundPoint, headerOf, launch, modelOf, NODE, nodeOf, openPage, openStateFile,
  planeOf, rectsOf, selectBox, showView, soon, stateFileAt, stateFileOf, TESTIDS, untilDrawn, viewTab, zoomTo,
} from './helpers.mjs';

const EX = modelOf(EXAMPLE);
const EX_VIEW = EX.views[0];
const IC_FILE = path.join(FIXTURES, 'interconnection.json');
const IC = modelOf(IC_FILE);
const IC_VIEW = IC.views.find((view) => view.id === 'v-ic');
const DEFS_VIEW = IC.views.find((view) => view.id === 'v-defs');

describe('the planes: culling, the pointer and the gate', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  /** Opens the page and a state file in it. */
  async function open(file) {
    const opened = await openPage(browser, { picker: false });
    await openStateFile(opened.page, typeof file === 'string' ? stateFileAt(file) : file);
    return opened;
  }
  const planeBox = (page, view) => page.evaluate((selector) => { const r = document.querySelector(selector).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }, planeOf(view.id));
  const selectedIn = (page, view) => page.evaluate((selector) => [...document.querySelectorAll(`${selector} .react-flow__node.selected`)].map((n) => n.getAttribute('data-id')), planeOf(view.id));

  test('a name outside its node stays drawn while its node is just outside the plane', async () => {
    const opened = await open(IC_FILE);
    const { page } = opened;
    await showView(page, IC_VIEW);
    await zoomTo(page, IC_VIEW, 'System', 1);
    for (let i = 0; i < 3; i++) await frame(page);
    const plane = await planeBox(page, IC_VIEW);

    // A port whose name stands to the right of its square (a port on a right side), from the page's own rectangles.
    const ports = await page.evaluate(([selector]) => [...document.querySelectorAll(`${selector} .react-flow__node`)].flatMap((node) => {
      const name = node.querySelector('.grasp-port-name');
      if (!name) return [];
      const n = node.getBoundingClientRect();
      const t = name.getBoundingClientRect();
      return [{ id: node.getAttribute('data-id'), node: { x: n.x, y: n.y, right: n.right, width: n.width }, name: { x: t.x, right: t.right, width: t.width } }];
    }), [planeOf(IC_VIEW.id)]);
    assert.ok(ports.length > 0, 'The plane of the interconnection view draws no port name (.grasp-port-name).');
    const wide = ports.filter((p) => p.name.x >= p.node.right - 1 && p.name.width >= 24 && p.node.right > plane.x + 20);
    assert.ok(wide.length > 0, `No port of the view has its name to the right of its square (ports: ${ports.map((p) => p.id).join(', ')}).`);
    wide.sort((a, b) => a.node.right - b.node.right);
    const port = wide[0];

    // Pan with the wheel until the square's right edge is 4 px outside the plane's left side: its name then reaches in.
    const dx = port.node.right - (plane.x - 4);
    await page.mouse.move(plane.x + plane.width / 2, plane.y + plane.height / 2);
    await page.mouse.wheel(dx, 0);
    const selector = `${planeOf(IC_VIEW.id)} ${NODE}[data-id=${JSON.stringify(port.id)}]`;
    const there = await soon(page, () => page.evaluate(([sel, left]) => {
      const node = document.querySelector(sel);
      if (!node) return { gone: true };
      const r = node.getBoundingClientRect();
      return r.right <= left - 1 ? { right: r.right } : null;
    }, [selector, plane.x]), `A turn of the wheel by ${dx.toFixed(0)} px did not pan the view until the square of ${port.id} is outside the plane.`);
    assert.ok(!there.gone, `The node of ${port.id} left the document when the view was panned until its square was outside the plane's left side (by ${dx.toFixed(0)} px), while its name, ${port.name.width.toFixed(0)} px wide, is still partly inside it.`);
    await frame(page);
    const after = await page.evaluate((sel) => {
      const node = document.querySelector(sel);
      if (!node) return null;
      const n = node.getBoundingClientRect();
      const name = node.querySelector('.grasp-port-name').getBoundingClientRect();
      return { right: n.right, name: { x: name.x, right: name.right, width: name.width } };
    }, selector);
    assert.ok(after, `The node of ${port.id} left the document once its square was outside the plane's left side, though its name is still partly inside.`);
    assert.ok(after.right < plane.x && after.right > plane.x - 12, `The square of ${port.id} is ${(plane.x - after.right).toFixed(1)} px outside the plane: the test wanted it a few pixels outside.`);
    assert.ok(after.name.width > 0 && after.name.right > plane.x + 4, `The name of ${port.id} ends at ${after.name.right.toFixed(1)}, which does not reach into the plane (its left side is ${plane.x}).`);
    await finish(opened);
  });

  test('a view of thousands of nodes mounts only what its window shows', async () => {
    const STATE = scaleState(5000);
    const view = STATE.model.views.find((v) => v.id === VIEWS.definitions);
    const service = middleService(5000);
    const opened = await open(stateFileOf('scale-5000.json', STATE));
    const { page } = opened;
    await showView(page, view);
    await zoomTo(page, view, service, 1);
    for (let i = 0; i < 3; i++) await frame(page);
    const placed = Object.keys(view.layout).length;
    const mounted = await page.evaluate((selector) => document.querySelectorAll(selector).length, `${planeOf(view.id)} ${NODE}`);
    assert.ok(placed > 1000, `The view ${view.name} places only ${placed} elements.`);
    assert.ok(mounted >= 1, `The plane of ${view.name}, at 100%, mounts no node at all.`);
    assert.ok(mounted < placed / 5, `The plane of ${view.name}, at 100%, mounts ${mounted} of the ${placed} nodes the view places: it must mount only what its window shows (under a fifth).`);
    await finish(opened);
  });

  test('Shift with a drag draws its rectangle only while it is drawn, and leaves nothing over the boxes', async () => {
    const opened = await open(EXAMPLE);
    const { page } = opened;
    await showView(page, EX_VIEW);
    const plane = await planeBox(page, EX_VIEW);
    const from = { x: plane.x + 6, y: plane.y + 6 };
    const bare = await page.evaluate(([x, y]) => String(document.elementFromPoint(x, y)?.className ?? ''), [from.x, from.y]);
    assert.ok(bare.includes('react-flow__pane'), `The plane's top left corner, 6 px in each way, is not bare ground: the page has ${JSON.stringify(bare)} there.`);
    const count = (selector) => page.evaluate(([plane_, what]) => document.querySelectorAll(`${plane_} ${what}`).length, [planeOf(EX_VIEW.id), selector]);
    const rects = await rectsOf(page, EX_VIEW.id);
    const host = rects.Host;
    assert.ok(host, 'The plane draws no node for Host.');
    const to = { x: host.x + host.width + 6, y: host.y + host.height + 6 };
    const inside = Object.entries(rects).filter(([, r]) => r.x >= from.x && r.x + r.width <= to.x && r.y >= from.y && r.y + r.height <= to.y).map(([id]) => id).sort();
    const crossed = Object.values(rects).filter((r) => r.x + r.width > from.x && r.y + r.height > from.y && r.x < to.x && r.y < to.y).length;
    const over = () => page.evaluate((selector) => document.querySelectorAll(`${selector} .react-flow__nodesselection, ${selector} .react-flow__nodesselection-rect`).length, planeOf(EX_VIEW.id));
    await page.keyboard.down('Shift');
    try {
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      for (let step = 1; step <= 8; step++) {
        await page.mouse.move(from.x + ((to.x - from.x) * step) / 8, from.y + ((to.y - from.y) * step) / 8);
        await frame(page);
      }
      await soon(page, async () => (await count('.react-flow__selection')) > 0,
        `With Shift held and the pointer dragged across the plane (over ${crossed} boxes), the plane draws no marquee (.react-flow__selection).`);
      assert.equal(await count('.react-flow__selection'), 1, 'With Shift held and the pointer dragged across the plane, the plane draws more than one marquee (.react-flow__selection).');
      assert.equal(await over(), 0, 'While the marquee is drawn the plane has a rectangle over its boxes (.react-flow__nodesselection).');
      await page.mouse.up();
    } finally {
      await page.keyboard.up('Shift');
    }
    for (let i = 0; i < 3; i++) await frame(page);
    assert.equal(await count('.react-flow__selection'), 0, 'After the release the plane still draws the marquee (.react-flow__selection).');
    assert.equal(await over(), 0, 'After the release the plane still has a rectangle over its boxes (.react-flow__nodesselection).');
    assert.deepEqual([...await selectedIn(page, EX_VIEW)].sort(), inside, `The marquee covered ${inside.join(', ')}, and the plane leaves ${(await selectedIn(page, EX_VIEW)).join(', ') || 'nothing'} selected.`);
    await selectBox(page, EX_VIEW, 'Host');
    await soon(page, async () => (await selectedIn(page, EX_VIEW)).join() === 'Host', async () => `A plain click on Host after the marquee leaves ${(await selectedIn(page, EX_VIEW)).join(', ') || 'nothing'} selected, not Host alone.`);
    const hosts = headerOf(await boxOf(page, EX_VIEW.id, 'Page.hosts'));
    await page.mouse.click(hosts.x, hosts.y);
    await soon(page, async () => (await selectedIn(page, EX_VIEW)).join() === 'Page.hosts', async () => `A click on the header of Page.hosts after the marquee leaves ${(await selectedIn(page, EX_VIEW)).join(', ') || 'nothing'} selected, not Page.hosts alone: something lies over the boxes the marquee covered.`);
    assert.equal(await over(), 0, 'After the clicks the plane has a rectangle over its boxes (.react-flow__nodesselection).');
    await finish(opened);
  });

  test('a press that moves 3 px before its release still selects the box', async () => {
    const opened = await open(EXAMPLE);
    const { page } = opened;
    await showView(page, EX_VIEW);
    const press = async (id, steps) => {
      const box = await boxOf(page, EX_VIEW.id, id);
      assert.ok(box, `The plane draws no node for ${id}.`);
      const at = headerOf(box);
      await page.mouse.move(at.x, at.y);
      await page.mouse.down();
      let x = at.x;
      for (const step of steps) { x += step; await page.mouse.move(x, at.y); await frame(page); }
      await page.mouse.up();
      for (let i = 0; i < 3; i++) await frame(page);
    };
    await press('Host', [6, 6]);
    assert.deepEqual(await selectedIn(page, EX_VIEW), [], 'A press on a box that moves 12 px before its release must select nothing.');
    // The 12 px press was a drag, and wrote its step: Undo takes it back, and Undo is then disabled again.
    const undoOff = () => page.evaluate((selector) => { const el = document.querySelector(selector); return el ? el.disabled || el.getAttribute('aria-disabled') === 'true' : null; }, byTestId(TESTIDS.undo));
    await page.locator(byTestId(TESTIDS.undo)).click();
    for (let i = 0; i < 3; i++) await frame(page);
    assert.equal(await undoOff(), true, 'One Undo did not take back the 12 px drag of Host.');
    await press('Host', [2, 1]);
    await soon(page, async () => (await selectedIn(page, EX_VIEW)).includes('Host'), 'A press on the header of Host that moves 3 px (in two steps) before its release did not select the box: its node has no class "selected".');
    assert.equal(await undoOff(), true, 'A press that moved 3 px before its release made an undo step: Undo is enabled.');
    await finish(opened);
  });

  test("a hidden tab's body is out of the document and holds no React Flow", async () => {
    const opened = await open(IC_FILE);
    const { page } = opened;
    await showView(page, IC_VIEW);
    const handle = await page.locator(planeOf(IC_VIEW.id)).elementHandle();
    assert.ok(handle, 'The first view has no plane while it is shown.');
    const state = () => handle.evaluate((el, node) => ({ connected: el.isConnected, flows: el.querySelectorAll('.react-flow').length, nodes: el.querySelectorAll(node).length }), NODE);
    const shown = await state();
    assert.ok(shown.connected && shown.flows === 1 && shown.nodes > 0, `The shown plane is connected ${shown.connected}, with ${shown.flows} React Flow and ${shown.nodes} nodes.`);

    await showView(page, DEFS_VIEW);
    const hidden = await soon(page, async () => { const s = await state(); return !s.connected ? s : null; },
      async () => `After the other view was shown, the first view's plane element is still in the document (${JSON.stringify(await state())}).`);
    assert.equal(hidden.flows, 0, `The plane of a hidden tab, out of the document, still holds ${hidden.flows} React Flow.`);
    assert.equal(hidden.nodes, 0, `The plane of a hidden tab, out of the document, still holds ${hidden.nodes} nodes.`);

    await showView(page, IC_VIEW);
    const back = await page.locator(planeOf(IC_VIEW.id)).elementHandle();
    const again = await back.evaluate((el, node) => ({ connected: el.isConnected, flows: el.querySelectorAll('.react-flow').length, nodes: el.querySelectorAll(node).length }), NODE);
    assert.ok(again.connected && again.flows === 1 && again.nodes >= Object.keys(IC_VIEW.layout).length, `When the first view is shown again its plane is connected ${again.connected} with ${again.flows} React Flow and ${again.nodes} of ${Object.keys(IC_VIEW.layout).length} nodes.`);
    await finish(opened);
  });
});
