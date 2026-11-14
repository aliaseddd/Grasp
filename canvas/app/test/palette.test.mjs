// The right-click palette of a plane, as a person works it: a right-click on a box, a port, a line or the ground opens
// a menu at the pointer, and a choice in it makes an element or takes a tool in hand. Written in step 11, before what
// it checks (plan/swarm/step-11.md, "The test lists", `palette.test.mjs`).
//
// Every test opens a file through the file input and reads only what the page shows. The four ids of the Tools view
// (`tool`, `tool-list`, `tools-view`, `tool-hint`) are not in TESTIDS: they are written as step-11.md gives them.

import assert from 'node:assert/strict';
import { after, afterEach, before, describe, test } from 'node:test';
import path from 'node:path';
import {
  boxOf, byTestId, closePages, drawn, EXAMPLE, finish, FIXTURES, frame, groundPoint, headerOf, launch, modelOf, near, openIn, planeOf,
  rowItemIn, showSide, showView, soon, stateFileAt, TESTIDS, viewTab, wordsOf,
} from './helpers.mjs';

const VIEW = modelOf(EXAMPLE).views[0];
const FUEL = path.join(FIXTURES, 'interconnection.json');
const RELEASE = path.join(FIXTURES, 'behavior-actions.json');
const HOST = path.join(FIXTURES, 'behavior-states.json');
const SEQUENCE = path.join(FIXTURES, 'sequence.json');
const viewOf = (file, id) => modelOf(file).views.find((v) => v.id === id);

const PALETTE = byTestId(TESTIDS.palette);
const TOAST = byTestId(TESTIDS.toast);
const TOOL = '[data-testid="tool"]';

/** The screen point at a given offset, in the view's units, from the top left corner of a box. */
const inBox = (box, dx, dy) => ({ x: box.x + dx * box.zoom, y: box.y + dy * box.zoom });
/** The middle of a rectangle. */
const middleOf = (r) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });

/** A right-click at a point of a box, by default where its header is blank (headerOf); returns the point. */
async function rightClickIn(page, view, id, at) {
  const box = await boxOf(page, view.id, id);
  assert.ok(box, `The plane of ${view.name} draws no node for ${id}.`);
  const point = at ?? headerOf(box);
  await page.mouse.click(point.x, point.y, { button: 'right' });
  return point;
}

/**
 * Waits until the palette is in the document, and reads it: the menu's rectangle and its entries in order, each as
 * `data-tool`, '|' for a separator, or its text when it has no data-tool; `items` has each entry's tool, text, height
 * and whether it is disabled. `what` says where the right-click was, for the failure.
 */
async function menu(page, what) {
  await soon(page, async () => (await page.locator(PALETTE).count()) > 0, `A right-click on ${what} opened no menu (data-testid "${TESTIDS.palette}").`);
  const read = await page.evaluate((selector) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const items = [...el.children].map((child) => {
      const box = child.getBoundingClientRect();
      return {
        role: child.getAttribute('role'), tool: child.getAttribute('data-tool'), text: child.textContent.trim(), height: box.height,
        disabled: child.getAttribute('aria-disabled') === 'true',
      };
    });
    return { role: el.getAttribute('role'), rect: { x: r.x, y: r.y, width: r.width, height: r.height }, items };
  }, PALETTE);
  assert.ok(read, `The menu (data-testid "${TESTIDS.palette}") left the page as it was read.`);
  assert.equal(read.role, 'menu', `The element with data-testid "${TESTIDS.palette}" has role "${read.role}", not "menu".`);
  return { ...read, entries: read.items.map((i) => (i.role === 'separator' ? '|' : i.tool ?? i.text)) };
}

/** Waits until the palette is gone from the document. */
const untilNoMenu = (page, why) => soon(page, async () => (await page.locator(PALETTE).count()) === 0, `${why}: the menu is still in the document.`);

/** The screen point at half the length of a line's path.grasp-line. */
async function lineMiddle(page, view, relId) {
  const point = await page.evaluate(([plane, id]) => {
    const path = document.querySelector(`${plane} .react-flow__edge[data-id=${JSON.stringify(id)}] path.grasp-line`);
    if (!path) return null;
    const at = path.getPointAtLength(path.getTotalLength() / 2);
    const m = path.getScreenCTM();
    return { x: m.a * at.x + m.c * at.y + m.e, y: m.b * at.x + m.d * at.y + m.f };
  }, [planeOf(view.id), relId]);
  assert.ok(point, `The plane of ${view.name} draws no line ${relId} (path.grasp-line).`);
  return point;
}

/** Whether the bar's Undo is disabled. */
const undoDisabled = (page) => page.evaluate((selector) => {
  const el = document.querySelector(selector);
  return el ? el.disabled || el.getAttribute('aria-disabled') === 'true' : null;
}, byTestId(TESTIDS.undo));

/** What the view's plane has picked now: the ids of its selected nodes and edges. */
const pickedOn = (page, viewId) => page.evaluate((plane) => [...document.querySelectorAll(`${plane} .selected`)].map((el) => el.getAttribute('data-id')), planeOf(viewId));

/** The ids a plane draws now, nodes then edges. */
const idsOf = async (page, viewId) => { const d = await drawn(page, viewId); return { nodes: d.nodes, edges: d.edges }; };

/** Waits for exactly one id a plane did not draw before, in `nodes` or in `edges`, and returns it. */
async function untilNew(page, viewId, was, which, missing) {
  return soon(page, async () => {
    const now = (await idsOf(page, viewId))[which].filter((id) => !was[which].includes(id));
    return now.length === 1 ? now[0] : null;
  }, missing);
}

/** The plane's root attribute, or null. */
const attrOf = (page, viewId, name) => page.evaluate(([plane, n]) => document.querySelector(plane)?.getAttribute(n) ?? null, [planeOf(viewId), name]);

/** Which of the Tools view's buttons are pressed, by tool kind. */
const pressed = (page) => page.evaluate((selector) => [...document.querySelectorAll(`${selector}[aria-pressed="true"]`)].map((b) => b.getAttribute('data-tool')), TOOL);

/** Opens a file and brings its view to the front, drawn. Returns the opened page. */
async function openView(browser, file, view) {
  const opened = await openIn(browser, stateFileAt(file));
  await showView(opened.page, view);
  await frame(opened.page);
  return opened;
}

/** Closes an open menu with Escape and waits until it is gone. */
async function closeMenu(page) {
  if ((await page.locator(PALETTE).count()) === 0) return;
  await page.keyboard.press('Escape');
  await untilNoMenu(page, 'Escape did not close the menu');
}

describe('the right-click palette', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  test('a right-click on a part def opens the menu at the pointer, in its groups', async () => {
    const opened = await openView(browser, EXAMPLE, VIEW);
    const { page } = opened;
    const at = await rightClickIn(page, VIEW, 'Host');
    const found = await menu(page, 'Host');
    assert.ok(near(found.rect.x, at.x, 2) && near(found.rect.y, at.y, 2),
      `The menu's top left corner is at ${found.rect.x.toFixed(0)}, ${found.rect.y.toFixed(0)}, not at the pointer, ${at.x.toFixed(0)}, ${at.y.toFixed(0)}.`);
    assert.deepEqual(found.entries, ['PartUsage', 'PortUsage', '|', 'Specialization'], `The menu on Host lists ${found.entries.join(', ')}.`);
    assert.deepEqual(found.items.filter((i) => i.tool).map((i) => i.text), ['part', 'port', 'specializes'], 'The entries do not read part, port, specializes.');
    for (const item of found.items.filter((i) => i.tool)) assert.ok(near(item.height, 32, 1), `The entry ${item.text} is ${item.height} px high, not 32.`);
    assert.equal((await boxOf(page, VIEW.id, 'Host')).selected, false, 'The right-click selected Host.');
    await finish(opened);
  });

  test('on the ground the menu offers what can stand on the ground', async () => {
    const opened = await openView(browser, EXAMPLE, VIEW);
    const { page } = opened;
    const ground = await groundPoint(page, VIEW);
    await page.mouse.click(ground.x, ground.y, { button: 'right' });
    const found = await menu(page, `the ground of ${VIEW.name}`);
    assert.deepEqual(found.entries, ['PartDefinition', 'PortDefinition', 'PartUsage'], `The menu on the ground lists ${found.entries.join(', ')}.`);
    await finish(opened);
  });

  test('on a port the menu offers the lines that may start there', async () => {
    const opened = await openView(browser, EXAMPLE, VIEW);
    const { page } = opened;
    const box = await boxOf(page, VIEW.id, 'Page.hosts.api');
    assert.ok(box, 'The plane draws no node for Page.hosts.api.');
    await page.mouse.click(...Object.values(middleOf(box)), { button: 'right' });
    const found = await menu(page, 'Page.hosts.api');
    assert.deepEqual(found.entries, ['Specialization', 'FeatureTyping', 'ConnectionUsage'], `The menu on the port lists ${found.entries.join(', ')}.`);
    await finish(opened);
  });

  test('where nothing can be made the menu says so', async () => {
    const opened = await openView(browser, EXAMPLE, VIEW);
    const { page } = opened;
    const was = await idsOf(page, VIEW.id);
    const at = await lineMiddle(page, VIEW, 'mount');
    await page.mouse.click(at.x, at.y, { button: 'right' });
    const found = await menu(page, 'the line mount');
    assert.equal(found.items.length, 1, `The menu on a line holds ${found.items.length} entries, not one.`);
    assert.equal(found.items[0].role, 'menuitem', 'The one entry is not a menuitem.');
    assert.equal(found.items[0].disabled, true, 'The one entry is not aria-disabled="true".');
    assert.equal(found.items[0].tool, null, 'The one entry carries a data-tool.');
    assert.equal(found.items[0].text, 'Nothing can be made here.', `The entry reads "${found.items[0].text}".`);
    const entry = await page.locator(`${PALETTE} [role="menuitem"]`).boundingBox();
    assert.ok(entry, 'The entry has no box.');
    await page.mouse.click(...Object.values(middleOf(entry)));
    await frame(page);
    assert.deepEqual(await idsOf(page, VIEW.id), was, 'A click on the disabled entry changed what the plane draws.');
    assert.equal(await undoDisabled(page), true, 'A click on the disabled entry made an undo step: Undo is enabled.');
    await finish(opened);
  });

  test('choosing an element kind places it at the pointer, inside the box that was clicked', async () => {
    const opened = await openView(browser, EXAMPLE, VIEW);
    const { page } = opened;
    const was = await idsOf(page, VIEW.id);
    const host = await boxOf(page, VIEW.id, 'Host');
    // Further in than the box's clamped corner (12, 48) and a part's width (180) reach, so that only a part placed at the click holds the point.
    const at = inBox(host, 260, 100);
    await rightClickIn(page, VIEW, 'Host', at);
    await menu(page, 'Host');
    await page.locator(`${PALETTE} [role="menuitem"][data-tool="PartUsage"]`).click();
    await untilNoMenu(page, 'A click on the entry part did not close the menu');
    const id = await untilNew(page, VIEW.id, was, 'nodes', 'A choice of part in the menu drew no new node.');
    const made = await soon(page, async () => { const b = await boxOf(page, VIEW.id, id); return b && b.selected ? b : null; }, `The new node ${id} is not selected.`);
    assert.ok(at.x >= made.x - 1 && at.x <= made.x + made.width + 1 && at.y >= made.y - 1 && at.y <= made.y + made.height + 1,
      `The new part is drawn at ${made.x.toFixed(0)}, ${made.y.toFixed(0)}, ${made.width.toFixed(0)} by ${made.height.toFixed(0)}, which does not hold the right-click's point ${at.x.toFixed(0)}, ${at.y.toFixed(0)}.`);
    assert.equal(await wordsOf(page, 'undo'), 'Added part part1 in Host', `Undo's words are "${await wordsOf(page, 'undo')}".`);
    await showSide(page, 'Explorer');
    const row = rowItemIn(page, 'el', 'Host').locator(`[data-row="el:${id}"]`);
    await soon(page, async () => (await row.count()) === 1, `The Explorer shows no row for ${id} inside the tree item of Host.`);
    await showSide(page, 'Tools');
    assert.deepEqual(await pressed(page), [], `A tool is pressed in the Tools view: ${(await pressed(page)).join(', ')}.`);
    await finish(opened);
  });

  test('choosing a relationship kind takes the clicked element as the first end', async () => {
    const opened = await openView(browser, EXAMPLE, VIEW);
    const { page } = opened;
    const was = await idsOf(page, VIEW.id);
    await rightClickIn(page, VIEW, 'Host');
    await menu(page, 'Host');
    await page.locator(`${PALETTE} [role="menuitem"][data-tool="Specialization"]`).click();
    await untilNoMenu(page, 'A click on the entry specializes did not close the menu');
    await soon(page, async () => (await attrOf(page, VIEW.id, 'data-tool')) === 'Specialization',
      `The plane has data-tool "${await attrOf(page, VIEW.id, 'data-tool')}", not "Specialization", after the choice.`);
    assert.equal(await attrOf(page, VIEW.id, 'data-first'), 'Host', `The plane has data-first "${await attrOf(page, VIEW.id, 'data-first')}", not "Host".`);
    await showSide(page, 'Tools');
    assert.deepEqual(await pressed(page), ['Specialization'], 'The Tools view does not show specializes pressed alone.');
    const hint = await soon(page, () => page.evaluate(() => document.querySelector('[data-testid="tool-hint"]')?.textContent ?? null), 'The Tools view shows no hint (data-testid "tool-hint").');
    assert.equal(hint, 'Now click the element it specializes.', `The hint reads "${hint}".`);
    const pageBox = await boxOf(page, VIEW.id, 'Page');
    const at = headerOf(pageBox);
    await page.mouse.click(at.x, at.y);
    const id = await untilNew(page, VIEW.id, was, 'edges', 'A click in Page drew no new line.');
    await soon(page, () => page.evaluate(([plane, i]) => document.querySelector(`${plane} .react-flow__edge[data-id=${JSON.stringify(i)}]`)?.classList.contains('selected'), [planeOf(VIEW.id), id]),
      `The new line ${id} is not selected.`);
    assert.equal(await wordsOf(page, 'undo'), 'Drew Host specializes Page', `Undo's words are "${await wordsOf(page, 'undo')}".`);
    assert.equal(await attrOf(page, VIEW.id, 'data-tool'), null, 'A tool is still in hand after the line was drawn.');
    await finish(opened);
  });

  test('the menu closes on Escape, on a click outside and on a right-click, and makes nothing', async () => {
    const opened = await openView(browser, EXAMPLE, VIEW);
    const { page } = opened;
    const ways = [
      ['Escape', async () => { await page.keyboard.press('Escape'); }],
      // By the pointer's position, as a person clicks: Playwright's locator click waits for the element to be hit, and the menu's backdrop (which closes it) takes the hit.
      ['a click on the top bar\'s name', async () => { const box = await page.locator(byTestId(TESTIDS.fileName)).boundingBox(); await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); }],
      ['a right-click 200 px away', async (at) => { await page.mouse.click(at.x + 200, at.y, { button: 'right' }); }],
    ];
    for (const [how, act] of ways) {
      const at = await rightClickIn(page, VIEW, 'Host');
      await menu(page, 'Host');
      await act(at);
      await untilNoMenu(page, `${how} did not close it`);
      await frame(page);
      assert.equal(await page.locator(PALETTE).count(), 0, `After ${how} a second menu is open.`);
      assert.equal(await undoDisabled(page), true, `After ${how} Undo is enabled: the menu made something.`);
      assert.deepEqual(await pickedOn(page, VIEW.id), [], `After ${how} something is selected.`);
    }
    await finish(opened);
  });

  test('the browser\'s own menu never shows on a plane', async () => {
    const opened = await openView(browser, EXAMPLE, VIEW);
    const { page } = opened;
    await page.evaluate(() => {
      window.__contextmenus = [];
      window.addEventListener('contextmenu', (event) => { window.__contextmenus.push(event); }, true);
    });
    /** A right-click at `point`: every contextmenu event it sent must be prevented. Returns whether a menu is open. */
    const rightClick = async (point, what) => {
      await page.evaluate(() => { window.__contextmenus.length = 0; });
      await page.mouse.click(point.x, point.y, { button: 'right' });
      await frame(page);
      await frame(page);
      const events = await page.evaluate(() => window.__contextmenus.map((e) => e.defaultPrevented));
      assert.ok(events.length > 0, `A right-click on ${what} sent no contextmenu event to the window.`);
      assert.ok(events.every(Boolean), `A right-click on ${what} was not prevented: the browser's own menu would show.`);
      return (await page.locator(PALETTE).count()) > 0;
    };
    await rightClick(await groundPoint(page, VIEW), `the ground of ${VIEW.name}`);
    await closeMenu(page);
    await rightClick(headerOf(await boxOf(page, VIEW.id, 'Host')), 'Host');
    await closeMenu(page);
    await rightClick(await lineMiddle(page, VIEW, 'mount'), 'the line mount');
    await closeMenu(page);
    const controls = await page.locator(`${planeOf(VIEW.id)} .react-flow__controls`).boundingBox();
    assert.ok(controls, 'The plane has no zoom buttons (.react-flow__controls).');
    assert.equal(await rightClick(middleOf(controls), 'the zoom buttons'), false, 'A right-click on the zoom buttons opened a menu.');
    const plane = await page.locator(planeOf(VIEW.id)).boundingBox();
    assert.equal(await rightClick({ x: plane.x + plane.width - 40, y: plane.y + plane.height - 40 }, 'the minimap'), false, 'A right-click at the minimap opened a menu.');
    await rightClickIn(page, VIEW, 'Host');
    const found = await menu(page, 'Host');
    await rightClick({ x: found.rect.x + found.rect.width + 200, y: Math.max(found.rect.y - 100, plane.y + 10) }, 'the backdrop of the open menu');
    await closeMenu(page);
    const seq = viewOf(SEQUENCE, 'v-seq');
    const other = await openIn(browser, stateFileAt(SEQUENCE));
    try {
      const tab = await viewTab(other.page, seq);
      if ((await tab.getAttribute('aria-selected')) !== 'true') await tab.click();
      const card = other.page.locator(`${planeOf(seq.id)} .grasp-card`);
      await soon(other.page, async () => (await card.count()) === 1, 'The tab of v-seq shows no card (.grasp-card).');
      const box = await card.boundingBox();
      await other.page.evaluate(() => {
        window.__contextmenus = [];
        window.addEventListener('contextmenu', (event) => { window.__contextmenus.push(event); }, true);
      });
      await other.page.mouse.click(...Object.values(middleOf(box)), { button: 'right' });
      await frame(other.page);
      await frame(other.page);
      const events = await other.page.evaluate(() => window.__contextmenus.map((e) => e.defaultPrevented));
      assert.ok(events.length > 0 && events.every(Boolean), 'A right-click on the card of v-seq was not prevented: the browser\'s own menu would show.');
      assert.equal(await other.page.locator(PALETTE).count(), 0, 'A right-click on the card of v-seq opened a menu.');
      await finish(other);
    } finally {
      await other.context.close();
    }
    await finish(opened);
  });

  test('a right-click is not the tool\'s click, and Escape closes the menu and puts the tool down', async () => {
    const opened = await openView(browser, EXAMPLE, VIEW);
    const { page } = opened;
    await showSide(page, 'Tools');
    const button = page.locator(`${TOOL}[data-tool="PartDefinition"]`);
    await soon(page, async () => (await button.count()) === 1, 'The Tools view has no part def tool (data-testid "tool", data-tool "PartDefinition") to click.');
    await button.click();
    await soon(page, async () => (await pressed(page)).includes('PartDefinition'), 'A click on the part def tool did not press it.');
    const was = await idsOf(page, VIEW.id);
    const ground = await groundPoint(page, VIEW);
    await page.mouse.click(ground.x, ground.y, { button: 'right' });
    await menu(page, `the ground of ${VIEW.name}`);
    await frame(page);
    assert.deepEqual(await idsOf(page, VIEW.id), was, 'A right-click with the part def tool in hand made a node: it was taken for the tool\'s click.');
    assert.deepEqual(await pressed(page), ['PartDefinition'], 'The part def tool is not still pressed while the menu is open.');
    await page.keyboard.press('Escape');
    await untilNoMenu(page, 'Escape did not close the menu');
    await soon(page, async () => (await pressed(page)).length === 0, async () => `After Escape ${(await pressed(page)).join(', ')} is still pressed: Escape did not put the tool down.`);
    await finish(opened);
  });

  test('the menu is worked by the keyboard', async () => {
    const opened = await openView(browser, EXAMPLE, VIEW);
    const { page } = opened;
    await rightClickIn(page, VIEW, 'Host');
    await menu(page, 'Host');
    const focused = () => page.evaluate((selector) => {
      const el = document.activeElement;
      return el && el.closest(selector) ? el.getAttribute('data-tool') ?? el.textContent.trim() : null;
    }, PALETTE);
    await soon(page, async () => (await focused()) === 'PartUsage', async () => `As the menu opens the focus is on ${(await focused()) ?? 'nothing in it'}, not on its first entry (part).`);
    await page.keyboard.press('ArrowDown');
    await soon(page, async () => (await focused()) === 'PortUsage', async () => `After ArrowDown the focus is on ${(await focused()) ?? 'nothing in the menu'}, not on port.`);
    await page.keyboard.press('Enter');
    await untilNoMenu(page, 'Enter on port did not close the menu');
    await soon(page, async () => (await wordsOf(page, 'undo')) === 'Added port port1 in Host', async () => `Undo's words are "${await wordsOf(page, 'undo')}", not "Added port port1 in Host".`);
    await finish(opened);
  });

  // Opened by the pointer, the menu's focused entry shows no keyboard ring, even when the keyboard was used before:
  // a press on the plane is a press of the pointer, which the browser's focus rule (:focus-visible) must hear as such
  // (session 28: the press's default is prevented, and the plane moves the focus itself).
  test('a menu opened by the pointer after the keyboard was used shows no keyboard ring', async () => {
    const opened = await openView(browser, EXAMPLE, VIEW);
    const { page } = opened;
    await page.keyboard.press('Tab');
    await soon(page, () => page.evaluate(() => document.activeElement?.matches(':focus-visible') === true), 'Tab put no keyboard focus anywhere.');
    const ringed = () => page.evaluate((selector) => {
      const el = document.activeElement;
      return el && el.closest(selector) ? { tool: el.getAttribute('data-tool'), visible: el.matches(':focus-visible'), cls: el.classList.contains('Mui-focusVisible') } : null;
    }, PALETTE);
    for (const way of ['a right-click straight after the keyboard', 'a right-click after a left click on the ground']) {
      if (way.includes('left click')) {
        await closeMenu(page);
        await page.keyboard.press('Tab');
        const ground = await groundPoint(page, VIEW);
        await page.mouse.click(ground.x, ground.y);
      }
      await rightClickIn(page, VIEW, 'Host');
      await menu(page, 'Host');
      await soon(page, async () => (await ringed())?.tool === 'PartUsage', async () => `After ${way}, the focus is not on the menu's first entry: ${JSON.stringify(await ringed())}.`);
      const got = await ringed();
      assert.ok(!got.visible && !got.cls, `After ${way}, the menu's first entry, focused as the menu opened, shows the keyboard's ring (:focus-visible ${got.visible}, Mui-focusVisible ${got.cls}), though the menu was opened by the pointer.`);
    }
    await finish(opened);
  });

  test('an undo by the keyboard closes the menu', async () => {
    const opened = await openView(browser, EXAMPLE, VIEW);
    const { page } = opened;
    const was = await idsOf(page, VIEW.id);
    const ground = await groundPoint(page, VIEW);
    await page.mouse.click(ground.x, ground.y, { button: 'right' });
    await menu(page, `the ground of ${VIEW.name}`);
    await page.locator(`${PALETTE} [role="menuitem"][data-tool="PartDefinition"]`).click();
    await untilNoMenu(page, 'A click on the entry part def did not close the menu');
    const id = await untilNew(page, VIEW.id, was, 'nodes', 'A choice of part def on the ground drew no new node.');
    await rightClickIn(page, VIEW, 'Host');
    await menu(page, 'Host');
    await page.keyboard.press('Control+z');
    await untilNoMenu(page, 'Control + Z did not close the menu');
    await soon(page, async () => !(await idsOf(page, VIEW.id)).nodes.includes(id), `Control + Z did not take the part def ${id} off the plane.`);
    await finish(opened);
  });

  test('in each graph view kind the menu on the ground lists what the core offers', async () => {
    const cases = [
      [FUEL, 'v-ic', ['PartDefinition', 'PortDefinition', 'PartUsage', 'ItemDefinition', 'ItemUsage', 'InterfaceDefinition']],
      [RELEASE, 'v-release', ['ActionDefinition', 'ActionUsage']],
      [HOST, 'v-host', ['StateDefinition', 'StateUsage', 'ActionUsage']],
    ];
    for (const [file, id, wanted] of cases) {
      const view = viewOf(file, id);
      const opened = await openView(browser, file, view);
      const { page } = opened;
      const ground = await groundPoint(page, view);
      await page.mouse.click(ground.x, ground.y, { button: 'right' });
      const found = await menu(page, `the ground of ${view.name}`);
      assert.deepEqual(found.entries, wanted, `The menu on the ground of ${view.name} lists ${found.entries.join(', ')}, not ${wanted.join(', ')}.`);
      await finish(opened);
    }
  });
});
