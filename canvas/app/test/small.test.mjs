// The planes' small sizes and their pointer and keyboard, in the browser (plan/notes.md, "Step 6: the independent
// review, which came after the commit", items 2, 3, 5 and 8): written before the fixes, from the contracts in
// canvas/app/src/plane/Plane.tsx, plane/viewStore.ts and core/adapter.ts. From file:// in Chromium. fit.test.mjs has
// the same contracts in Node.

import assert from 'node:assert/strict';
import { after, afterEach, before, describe, test } from 'node:test';
import {
  boxOf, byTestId, collapseSides, closePages, cssColor, EXAMPLE, finish, frame, groundPoint, launch, linesOf, modelOf, near, NODE,
  openPage, openStateFile, planeOf, rectsOf, showView, soon, stateFileAt, TEAL, TEN, TESTIDS,
} from './helpers.mjs';

const EX = modelOf(EXAMPLE);
const VIEW = EX.views[0];
const LINES = linesOf(EX, VIEW).length;
const BOUNDS = { w: 1176, h: 648 }; // the example's, as plane.test.mjs and adapter.test.mjs have them
const ACTIONS_FILE = TEN.find((file) => file.endsWith('behavior-actions.json'));

/** The zoom the contract's fit gives the example in a plane `width` by `height`. */
function fitZoom(width, height) {
  const pad = Math.min(48, Math.floor(Math.min(width, height) / 12));
  const band = width >= 480 && height >= 480 ? 180 : pad;
  return Math.max(0.02, Math.min(1, (width - 2 * pad) / BOUNDS.w, (height - pad - band) / BOUNDS.h));
}

describe('the planes at their small sizes', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  /** Opens the page (at `size`, a viewport, if given) and a state file in it, and shows the file's first view, drawn. */
  async function open(file, view, lines, { size, collapsed = false } = {}) {
    const opened = await openPage(browser, { picker: false });
    if (size) await opened.page.setViewportSize(size);
    if (collapsed) await collapseSides(opened.page);
    await openStateFile(opened.page, stateFileAt(file));
    await showView(opened.page, view, lines);
    return opened;
  }
  const openExample = (options) => open(EXAMPLE, VIEW, LINES, options);
  const planeRect = (page, view = VIEW) => page.evaluate((selector) => { const r = document.querySelector(selector).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }, planeOf(view.id));
  const zoomOf = async (page, id = 'Page') => (await boxOf(page, VIEW.id, id)).zoom;
  /** Waits until the example is drawn at the zoom the contract's fit gives for the plane as it is now. */
  const untilFitted = async (page, what) => {
    const plane = await planeRect(page);
    const want = fitZoom(plane.width, plane.height);
    await soon(page, async () => near(await zoomOf(page), want, 0.002), async () => `${what}: the plane is ${plane.width} by ${plane.height}, so the view should be fitted at ${(want * 100).toFixed(2)}%, and it is at ${((await zoomOf(page)) * 100).toFixed(2)}%.`);
    return { plane, want };
  };
  /** A click on a strip's name, which collapses its side or opens it. */
  const toggle = (page, name) => page.getByRole('tab', { name, exact: true }).click();
  const widthOf = (page, testid) => page.evaluate((selector) => document.querySelector(selector)?.getBoundingClientRect().width ?? 0, byTestId(testid));

  test('a view nobody has moved follows its plane\'s size', async () => {
    const opened = await openExample();
    const { page } = opened;
    const first = await untilFitted(page, 'With both sides open');
    assert.ok(near(first.want, 640 / 1176, 0.01), `With both sides open the plane is ${first.plane.width} by ${first.plane.height}, and its fit 640 / 1176.`);
    await collapseSides(page);
    const { plane, want } = await untilFitted(page, 'With both sides collapsed');
    assert.ok(plane.width > first.plane.width + 100, `The plane is ${plane.width} px wide with the sides collapsed, and was ${first.plane.width}.`);
    assert.ok(near(want, 600 / 648, 0.01), `The contract's fit for ${plane.width} by ${plane.height} is 600 / 648, not ${want}.`);
    await frame(page);
    for (const [id, r] of Object.entries(await rectsOf(page, VIEW.id))) {
      assert.ok(r.x >= plane.x - 1 && r.y >= plane.y - 1 && r.x + r.width <= plane.x + plane.width + 1 && r.y + r.height <= plane.y + plane.height + 1,
        `${id} is drawn at ${r.x.toFixed(1)}, ${r.y.toFixed(1)}, ${r.width.toFixed(1)} by ${r.height.toFixed(1)}, not inside the plane (${plane.x}, ${plane.y}, ${plane.width} by ${plane.height}).`);
    }
    await finish(opened);
  });

  test('a view somebody has panned stays where it was put when its plane\'s size changes', async () => {
    const opened = await openExample();
    const { page } = opened;
    await untilFitted(page, 'With both sides open');
    const ground = await groundPoint(page, VIEW);
    const corner = async () => { const p = await planeRect(page); const rects = await rectsOf(page, VIEW.id); return Object.fromEntries(Object.entries(rects).map(([id, r]) => [id, { x: r.x - p.x, y: r.y - p.y, width: r.width, height: r.height }])); };
    const before = await corner();
    await page.mouse.move(ground.x, ground.y);
    await page.mouse.wheel(90, 140);
    await soon(page, async () => Math.abs((await corner()).Host.y - before.Host.y) > 1, 'A turn of the wheel over the ground moved no node.');
    for (let i = 0; i < 3; i++) await frame(page);
    const panned = await corner();
    const widthBefore = (await planeRect(page)).width;
    await collapseSides(page);
    await soon(page, async () => (await planeRect(page)).width > widthBefore + 100, 'The plane did not grow when the sides collapsed.');
    for (let i = 0; i < 4; i++) await frame(page);
    const now = await corner();
    for (const [id, r] of Object.entries(panned)) {
      assert.ok(now[id] && near(now[id].x, r.x, 1) && near(now[id].y, r.y, 1) && near(now[id].width, r.width, 1),
        `${id} was ${r.x.toFixed(1)}, ${r.y.toFixed(1)} from the plane's left top corner when somebody had panned the view, and is ${now[id] ? `${now[id].x.toFixed(1)}, ${now[id].y.toFixed(1)}` : 'not drawn'} after the plane grew: a view placed by hand must stay.`);
    }
    // The fit button fits it again, and then it follows its plane again.
    await page.locator(planeOf(VIEW.id)).getByRole('button', { name: 'Fit the view', exact: true }).click();
    await untilFitted(page, 'After a click on "Fit the view"');
    await toggle(page, 'Explorer');
    await soon(page, async () => (await widthOf(page, TESTIDS.explorer)) > 100, 'A click on Explorer did not open the left side.');
    const { plane, want } = await untilFitted(page, 'After the fit button, and a side opened');
    assert.ok(plane.width < 1336 - 100, `The plane is ${plane.width} px wide with the Explorer open.`);
    assert.ok(want < 600 / 648 - 0.05, `The fit in a plane ${plane.width} px wide is ${want}, which is not smaller than the one in 1336.`);
    await finish(opened);
  });

  test('a narrow plane has no minimap, and a wide one has', async () => {
    const opened = await openExample({ size: { width: 800, height: 600 } });
    const { page } = opened;
    const count = (selector) => page.evaluate(([plane, s]) => document.querySelectorAll(`${plane} ${s}`).length, [planeOf(VIEW.id), selector]);
    const narrow = await planeRect(page);
    assert.ok(narrow.width < 480, `At 800 by 600 with both sides open the plane is ${narrow.width} by ${narrow.height}: this test needs it under 480 wide.`);
    assert.equal(await count('.react-flow__minimap'), 0, `A plane ${narrow.width} px wide has a minimap.`);
    assert.equal(await count('.react-flow__controls'), 1, 'The plane has no zoom buttons.');
    const inside = await page.evaluate((plane) => {
      const p = document.querySelector(plane).getBoundingClientRect();
      const c = document.querySelector(`${plane} .react-flow__controls`).getBoundingClientRect();
      return { c: [c.left, c.top, c.right, c.bottom], p: [p.left, p.top, p.right, p.bottom], ok: c.width > 0 && c.left >= p.left - 0.5 && c.top >= p.top - 0.5 && c.right <= p.right + 0.5 && c.bottom <= p.bottom + 0.5 };
    }, planeOf(VIEW.id));
    assert.ok(inside.ok, `The zoom buttons (${inside.c.join(', ')}) are not wholly inside the plane (${inside.p.join(', ')}).`);
    await untilFitted(page, 'In the narrow plane, with the small margins');

    await collapseSides(page);
    const wide = await planeRect(page);
    assert.ok(wide.width >= 480 && wide.height >= 480, `At 800 by 600 with both sides collapsed the plane is ${wide.width} by ${wide.height}: this test needs it at least 480 each way.`);
    await soon(page, async () => (await count('.react-flow__minimap')) === 1, `A plane ${wide.width} by ${wide.height} has no minimap.`);
    await untilFitted(page, 'In the wide plane');

    await toggle(page, 'Explorer');
    await toggle(page, 'Details');
    await soon(page, async () => (await planeRect(page)).width < 480, 'The plane did not narrow when the sides opened.');
    await soon(page, async () => (await count('.react-flow__minimap')) === 0, 'With the sides open again the plane is narrow, and still has its minimap.');
    await untilFitted(page, 'In the narrow plane again');
    await finish(opened);
  });

  /** Clicks the middle of the box of `selector`'s first element, and waits for its node to be selected. */
  async function clickName(page, view, selector, what) {
    const found = await page.evaluate(([plane, s]) => {
      for (const el of document.querySelectorAll(`${plane} ${s}`)) {
        const r = el.getBoundingClientRect();
        const node = el.closest('.react-flow__node');
        if (r.width > 0 && r.height > 0 && node) return { x: r.x + r.width / 2, y: r.y + r.height / 2, id: node.getAttribute('data-id'), text: el.textContent };
      }
      return null;
    }, [planeOf(view.id), selector]);
    assert.ok(found, `The plane of ${view.name} draws no ${what} (${selector}).`);
    await page.mouse.click(found.x, found.y);
    await soon(page, async () => (await boxOf(page, view.id, found.id))?.selected, `A click on the name "${found.text}" of ${found.id} does not select it: its node has no class "selected".`);
    return found;
  }

  test('a click on a port\'s name selects the port, and on a control node\'s name the node', async () => {
    const opened = await openExample({ collapsed: true });
    const { page } = opened;
    const port = await clickName(page, VIEW, '.grasp-port-name', "port's name");
    assert.ok(/\./.test(port.id) || port.id.length > 0, 'The port has an id.');
    await finish(opened);

    const model = modelOf(ACTIONS_FILE);
    const view = model.views[0];
    const again = await open(ACTIONS_FILE, view, linesOf(model, view).length);
    await clickName(again.page, view, '.grasp-small-name', "small node's name");
    await finish(again);
  });

  test('the zoom buttons and the fit button show the theme\'s focus ring', async () => {
    const opened = await openExample();
    const { page } = opened;
    const teal = await cssColor(page, TEAL);
    const width = await page.evaluate(() => { const el = document.createElement('div'); el.style.width = 'var(--grasp-focus-width)'; document.body.appendChild(el); const w = getComputedStyle(el).width; el.remove(); return w; });
    assert.ok(/^[1-9]/.test(width), `--grasp-focus-width is ${width}.`);
    const buttons = page.locator(`${planeOf(VIEW.id)} .react-flow__controls-button`);
    const count = await buttons.count();
    assert.equal(count, 3, `The plane has ${count} buttons in its controls, not 3 (zoom in, zoom out, fit).`);
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const name = (await button.getAttribute('aria-label')) ?? `button ${i}`;
      // Tab until the button has the focus, so that :focus-visible matches.
      await page.locator(planeOf(VIEW.id)).click({ position: { x: 4, y: 4 } }).catch(() => {});
      let focused = false;
      for (let t = 0; t < 60 && !focused; t++) {
        await page.keyboard.press('Tab');
        focused = await button.evaluate((el) => document.activeElement === el);
      }
      assert.ok(focused, `${name} never took the focus from the Tab key.`);
      const style = await button.evaluate((el) => { const s = getComputedStyle(el); return { match: el.matches(':focus-visible'), style: s.outlineStyle, color: s.outlineColor, width: s.outlineWidth, offset: s.outlineOffset }; });
      assert.ok(style.match, `${name} has the focus but does not match :focus-visible.`);
      assert.equal(style.style, 'solid', `The focused ${name} has an outline-style of ${style.style}, not solid.`);
      assert.equal(style.color, teal, `The focused ${name} has an outline-color of ${style.color}, not the theme's teal (${teal}).`);
      assert.equal(style.width, width, `The focused ${name} has an outline-width of ${style.width}, not --grasp-focus-width (${width}).`);
      assert.equal(parseFloat(style.offset), -parseFloat(width), `The focused ${name} has an outline-offset of ${style.offset}, not -${width}: the ring must lie inside the button.`);
    }
    await finish(opened);
  });
});
