// Picking on a plane, as a person does it: a click, Ctrl or ⌘ with a click, a click on the ground, Shift with a drag
// (the marquee), a drag of picked and of unpicked boxes, and a tab that comes back. Written in step 9, before what it
// checks, from section 3 ("The planes") and section 4 of plan/swarm/step-9.md.
//
// These read the planes only: which nodes and lines have React Flow's class `selected`, and the marquee's element.
// None reads the Explorer, so that they pass with the selection and the plane built and nothing else. Every test
// opens a state file through the file input and ends with finish().

import assert from 'node:assert/strict';
import path from 'node:path';
import { after, afterEach, before, describe, test } from 'node:test';
import {
  boxOf, byTestId, closePages, cssColor, EDGE, EXAMPLE, finish, FIXTURES, frame, groundPoint, headerOf, launch, linesOf, modelOf, near, openIn,
  planeOf, rectsOf, selectBox, showView, soon, stateFileAt, TEAL, TESTIDS,
} from './helpers.mjs';

const EX = modelOf(EXAMPLE);
const EX_VIEW = EX.views[0];
const IC_FILE = path.join(FIXTURES, 'interconnection.json');
const IC = modelOf(IC_FILE);
const ONE = IC.views.find((view) => view.id === 'v-ic');
const TWO = IC.views.find((view) => view.id === 'v-defs');

const edgeOf = (view, id) => `${planeOf(view.id)} ${EDGE}[data-id=${JSON.stringify(id)}]`;

/** The ids of the plane's selected nodes and selected lines, in the document's order. */
const selectedIn = (page, view) => page.evaluate((plane) => ({
  nodes: [...document.querySelectorAll(`${plane} .react-flow__node.selected`)].map((el) => el.getAttribute('data-id')),
  edges: [...document.querySelectorAll(`${plane} .react-flow__edge.selected`)].map((el) => el.getAttribute('data-id')),
}), planeOf(view.id));

/** How many marquees (.react-flow__selection) the plane draws, and how many of the rectangles that would lie over the boxes. */
const rectanglesIn = (page, view) => page.evaluate((plane) => ({
  marquees: document.querySelectorAll(`${plane} .react-flow__selection`).length,
  over: document.querySelectorAll(`${plane} .react-flow__nodesselection, ${plane} .react-flow__nodesselection-rect`).length,
}), planeOf(view.id));

const words = (ids, alone) => {
  if (ids.length === 0) return 'nothing';
  if (ids.length === 1) return alone;
  return ids.length === 2 ? `${ids[0]} and ${ids[1]}` : ids.join(', ');
};
/** What a plane leaves selected, as a sentence: `App selected alone`, `Host and App selected`, `nothing selected`. */
const leaves = ({ nodes, edges }) => { const ids = [...nodes, ...edges]; return ids.length === 0 ? 'nothing selected' : `${words(ids, `${ids[0]} selected alone`)}${ids.length === 1 ? '' : ' selected'}`; };
/** What a plane is expected to leave selected, as a sentence: `App alone`, `Host and App`, `nothing`. */
const wanted = ({ nodes = [], edges = [] }) => { const ids = [...nodes, ...edges]; return words(ids, `${ids[0]} alone`); };
const sorted = (ids) => [...ids].sort();
const same = (now, { nodes = [], edges = [] }) => JSON.stringify(sorted(now.nodes)) === JSON.stringify(sorted(nodes)) && JSON.stringify(sorted(now.edges)) === JSON.stringify(sorted(edges));

/**
 * Waits until the plane's selected nodes and lines are exactly `expected` ({ nodes, edges }, as sets), and that they
 * still are two frames later (a change that comes after the first one is not missed). `what` is what was done: the
 * failure says what the plane leaves selected instead.
 */
async function expectPicked(page, view, expected, what, extra = '', whole = null) {
  const missing = async () => whole ?? `${what} leaves ${leaves(await selectedIn(page, view))}, not ${wanted(expected)}${extra}.`;
  await soon(page, async () => same(await selectedIn(page, view), expected), missing);
  for (let i = 0; i < 2; i++) await frame(page);
  assert.ok(same(await selectedIn(page, view), expected), await missing());
}

/** A click on a box's header, with the keys given held down. */
async function clickBox(page, view, id, keys = []) {
  const box = await boxOf(page, view.id, id);
  assert.ok(box, `The plane of ${view.name} draws no node for ${id}.`);
  const at = headerOf(box);
  for (const key of keys) await page.keyboard.down(key);
  try {
    await page.mouse.click(at.x, at.y);
  } finally {
    for (const key of keys.reverse()) await page.keyboard.up(key);
  }
}

/** The middle of a line, at half the length of its path, as the plane's own test finds it. */
async function middleOf(page, view, id) {
  const mid = await page.evaluate((selector) => {
    const path_ = document.querySelector(`${selector} path.grasp-line`);
    if (!path_) return null;
    const p = path_.getPointAtLength(path_.getTotalLength() / 2);
    const q = new DOMPoint(p.x, p.y).matrixTransform(path_.getScreenCTM());
    return { x: q.x, y: q.y };
  }, edgeOf(view, id));
  assert.ok(mid, `The line ${id} has no path.grasp-line.`);
  return mid;
}

/** A click on a point of the plane, with the keys given held down. */
async function clickAt(page, at, keys = []) {
  for (const key of keys) await page.keyboard.down(key);
  try {
    await page.mouse.click(at.x, at.y);
  } finally {
    for (const key of keys.reverse()) await page.keyboard.up(key);
  }
}

/** The plane's top left corner, 6 px in each way, which must be bare ground. */
async function corner(page, view) {
  const plane = await page.evaluate((selector) => { const r = document.querySelector(selector).getBoundingClientRect(); return { x: r.x, y: r.y }; }, planeOf(view.id));
  const at = { x: plane.x + 6, y: plane.y + 6 };
  const hit = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.className ?? '', [at.x, at.y]);
  assert.ok(String(hit).includes('react-flow__pane'), `The plane's top left corner, 6 px in each way, is not bare ground: the page has ${JSON.stringify(String(hit))} there.`);
  return at;
}

/** 6 px right of and below the bottom right corner of a node's rectangle. */
const past = (rects, id) => { const r = rects[id]; assert.ok(r, `The plane draws no node for ${id}.`); return { x: r.x + r.width + 6, y: r.y + r.height + 6 }; };

/** The nodes whose whole rectangle on the screen lies inside the rectangle from `from` to `to`, edges included. */
function covered(rects, from, to) {
  const left = Math.min(from.x, to.x); const right = Math.max(from.x, to.x);
  const top = Math.min(from.y, to.y); const bottom = Math.max(from.y, to.y);
  return Object.entries(rects).filter(([, r]) => r.x >= left && r.x + r.width <= right && r.y >= top && r.y + r.height <= bottom).map(([id]) => id);
}
/** What a rectangle covers, as { nodes, edges }: the nodes it covers whole, and the lines of the view both of whose ends are among them. */
function coveredBy(rects, view, from, to) {
  const nodes = covered(rects, from, to);
  const edges = linesOf(EX, view).filter((id) => { const rel = EX.relationships.find((r) => r.id === id); return nodes.includes(rel.from) && nodes.includes(rel.to); });
  return { nodes, edges };
}

/** The pointer goes from one point to another in `steps` equal moves, the page getting a frame after each. */
async function leg(page, from, to, steps = 6) {
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
    await frame(page);
  }
}

/** Holds Shift while `body` runs, and lets it go after, whatever happens. */
async function shifted(page, body) {
  await page.keyboard.down('Shift');
  try {
    await body();
  } finally {
    await page.keyboard.up('Shift');
  }
}

/** A sentence for a plane that draws no marquee where one is wanted. */
async function marqueeDrawn(page, view, where) {
  await soon(page, async () => (await rectanglesIn(page, view)).marquees > 0,
    `With Shift held and the pointer dragged ${where}, the plane draws no marquee (.react-flow__selection).`);
  const now = await rectanglesIn(page, view);
  assert.equal(now.marquees, 1, `With Shift held and the pointer dragged ${where}, the plane draws ${now.marquees} marquees (.react-flow__selection), not one.`);
}

/** Whether one of the bar's buttons is disabled. */
const disabled = (page, name) => page.evaluate((selector) => {
  const el = document.querySelector(selector);
  return el ? el.disabled || el.getAttribute('aria-disabled') === 'true' : null;
}, byTestId(TESTIDS[name]));

describe('picking on a plane', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  /** The example, its view drawn with its six lines. */
  async function openExample() {
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    await showView(opened.page, EX_VIEW, 6);
    return opened;
  }

  test('a click on a box picks it alone, and Ctrl or ⌘ with a click adds it or lets it go', async () => {
    const opened = await openExample();
    const { page } = opened;
    await clickBox(page, EX_VIEW, 'Host');
    await expectPicked(page, EX_VIEW, { nodes: ['Host'] }, 'A click on Host');
    await clickBox(page, EX_VIEW, 'App');
    await expectPicked(page, EX_VIEW, { nodes: ['App'] }, 'A click on App');
    await clickBox(page, EX_VIEW, 'Host', ['Control']);
    await expectPicked(page, EX_VIEW, { nodes: ['Host', 'App'] }, 'Ctrl + click on Host');
    await clickBox(page, EX_VIEW, 'App', ['Control']);
    await expectPicked(page, EX_VIEW, { nodes: ['Host'] }, 'Ctrl + click on App, which was picked,');
    await clickBox(page, EX_VIEW, 'App', ['Meta']);
    await expectPicked(page, EX_VIEW, { nodes: ['Host', 'App'] }, '⌘ + click on App', ': ⌘ does not add');
    await clickAt(page, await middleOf(page, EX_VIEW, 'mount'), ['Control']);
    await expectPicked(page, EX_VIEW, { nodes: ['Host', 'App'], edges: ['mount'] }, 'Ctrl + click on the middle of mount');
    await clickAt(page, await middleOf(page, EX_VIEW, 'mount'));
    await expectPicked(page, EX_VIEW, { edges: ['mount'] }, 'A plain click on the middle of mount');
    await finish(opened);
  });

  test('a click on a box that is one of several picked picks it alone', async () => {
    const opened = await openExample();
    const { page } = opened;
    await clickBox(page, EX_VIEW, 'ServerHost');
    await clickBox(page, EX_VIEW, 'OnlineHost', ['Control']);
    await clickBox(page, EX_VIEW, 'DevHost', ['Control']);
    await expectPicked(page, EX_VIEW, { nodes: ['ServerHost', 'OnlineHost', 'DevHost'] }, 'A click on ServerHost and Ctrl + click on OnlineHost and DevHost');
    await clickBox(page, EX_VIEW, 'OnlineHost');
    await expectPicked(page, EX_VIEW, { nodes: ['OnlineHost'] }, 'A plain click on OnlineHost, one of three picked boxes,');
    await finish(opened);
  });

  test('a click on the ground lets go of everything on the plane, with or without Ctrl', async () => {
    const opened = await openExample();
    const { page } = opened;
    await clickBox(page, EX_VIEW, 'Host');
    await clickAt(page, await middleOf(page, EX_VIEW, 'mount'), ['Control']);
    await expectPicked(page, EX_VIEW, { nodes: ['Host'], edges: ['mount'] }, 'A click on Host and Ctrl + click on mount');
    const ground = await groundPoint(page, EX_VIEW);
    await clickAt(page, ground);
    await expectPicked(page, EX_VIEW, {}, 'A click on bare ground');
    await clickBox(page, EX_VIEW, 'Host');
    await expectPicked(page, EX_VIEW, { nodes: ['Host'] }, 'A click on Host');
    await clickAt(page, ground, ['Control']);
    await expectPicked(page, EX_VIEW, {}, 'Ctrl + click on bare ground');
    await finish(opened);
  });

  test('Shift with a click is a click', async () => {
    const opened = await openExample();
    const { page } = opened;
    await clickBox(page, EX_VIEW, 'App');
    await expectPicked(page, EX_VIEW, { nodes: ['App'] }, 'A click on App');
    await clickBox(page, EX_VIEW, 'Host', ['Shift']);
    await expectPicked(page, EX_VIEW, { nodes: ['Host'] }, 'Shift + click on Host');
    assert.equal((await rectanglesIn(page, EX_VIEW)).marquees, 0, 'Shift + click on Host, with no move of the pointer, draws a marquee (.react-flow__selection).');
    await clickAt(page, await groundPoint(page, EX_VIEW), ['Shift']);
    await expectPicked(page, EX_VIEW, {}, 'Shift + click on bare ground');
    assert.equal((await rectanglesIn(page, EX_VIEW)).marquees, 0, 'Shift + click on bare ground, with no move of the pointer, draws a marquee (.react-flow__selection).');
    await finish(opened);
  });

  test('a marquee picks what it covers whole, and lets go of what it no longer covers, as it is drawn', async () => {
    const opened = await openExample();
    const { page } = opened;
    const rects = await rectsOf(page, EX_VIEW.id);
    const from = await corner(page, EX_VIEW);
    const small = { x: from.x + 40, y: from.y + 40 };
    const to = past(rects, 'Host');
    const all = coveredBy(rects, EX_VIEW, from, to);
    assert.ok(all.nodes.includes('Host') && all.nodes.includes('Page.hosts') && !all.nodes.includes('Page'), `The marquee from the corner to past Host covers ${all.nodes.join(', ')}: it should cover Host and Page.hosts and not Page.`);
    assert.ok(all.edges.includes('t-hosts'), `The lines between ${all.nodes.join(', ')} are ${all.edges.join(', ')}: t-hosts is not among them.`);
    const where = "from the plane's corner";
    await shifted(page, async () => {
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      await leg(page, from, small);
      await marqueeDrawn(page, EX_VIEW, where);
      await expectPicked(page, EX_VIEW, {}, 'A marquee drawn 40 px from the plane\'s corner, which covers no box,');
      await leg(page, small, to);
      await expectPicked(page, EX_VIEW, all, `A marquee drawn from the plane's corner to past Host (over ${all.nodes.length} boxes)`);
      await leg(page, to, small);
      await expectPicked(page, EX_VIEW, {}, 'A marquee drawn back to 40 px from the plane\'s corner');
      await leg(page, small, to);
      await expectPicked(page, EX_VIEW, all, 'A marquee drawn again from the plane\'s corner to past Host');
      await page.mouse.up();
    });
    for (let i = 0; i < 3; i++) await frame(page);
    assert.equal((await rectanglesIn(page, EX_VIEW)).marquees, 0, 'After the release the plane still draws the marquee (.react-flow__selection).');
    await expectPicked(page, EX_VIEW, all, 'The release of a marquee from the plane\'s corner to past Host');
    await finish(opened);
  });

  test('a marquee begun on a box does not drag the box, and the click that ends it picks nothing', async () => {
    const opened = await openExample();
    const { page } = opened;
    const offsetOf = async () => {
      const host = await boxOf(page, EX_VIEW.id, 'Host');
      const app = await boxOf(page, EX_VIEW.id, 'App');
      return { x: host.x - app.x, y: host.y - app.y };
    };
    for (const shiftFirst of [true, false]) {
      const was = await offsetOf();
      const at = headerOf(await boxOf(page, EX_VIEW.id, 'Host'));
      const end = { x: at.x + 60, y: at.y + 40 };
      await page.keyboard.down('Shift');
      try {
        await page.mouse.move(at.x, at.y);
        await page.mouse.down();
        await leg(page, at, end, 3);
        const now = await offsetOf();
        const dx = now.x - was.x;
        const dy = now.y - was.y;
        assert.ok(Math.abs(dx) < 1 && Math.abs(dy) < 1, `Shift with a press on Host dragged it ${dx.toFixed(1)} by ${dy.toFixed(1)} px against App: no marquee was drawn.`);
        await marqueeDrawn(page, EX_VIEW, 'from a press on Host');
        if (shiftFirst) { await page.keyboard.up('Shift'); await frame(page); }
        await page.mouse.up();
      } finally {
        if (!shiftFirst) await page.keyboard.up('Shift');
      }
      for (let i = 0; i < 3; i++) await frame(page);
      await expectPicked(page, EX_VIEW, {}, `The click that ends a marquee begun on Host, with Shift let go ${shiftFirst ? 'before' : 'after'} the button,`);
      assert.equal(await disabled(page, 'undo'), true, `A marquee begun on Host, with Shift let go ${shiftFirst ? 'before' : 'after'} the button, made an undo step: Undo is enabled.`);
    }
    await finish(opened);
  });

  test('a drag of a box that is not picked moves it alone and picks nothing, and the picked boxes are still dragged together', async () => {
    const opened = await openExample();
    const { page } = opened;
    await clickBox(page, EX_VIEW, 'ServerHost');
    await clickBox(page, EX_VIEW, 'OnlineHost', ['Control']);
    await expectPicked(page, EX_VIEW, { nodes: ['ServerHost', 'OnlineHost'] }, 'A click on ServerHost and Ctrl + click on OnlineHost');
    const ids = ['ServerHost', 'OnlineHost', 'DevHost'];
    // Each box against StrongholdApp, which no drag here touches: a pan moves every box and changes no such offset.
    const offsets = async () => {
      const still = await boxOf(page, EX_VIEW.id, 'StrongholdApp');
      return Object.fromEntries(await Promise.all(ids.map(async (id) => { const b = await boxOf(page, EX_VIEW.id, id); return [id, { x: b.x - still.x, y: b.y - still.y }]; })));
    };
    const drag = async (id, by) => {
      const at = headerOf(await boxOf(page, EX_VIEW.id, id));
      await page.mouse.move(at.x, at.y);
      await page.mouse.down();
      await leg(page, at, { x: at.x + by.x, y: at.y + by.y });
      await page.mouse.up();
      for (let i = 0; i < 3; i++) await frame(page);
    };
    const moved = (before, after, id) => ({ x: after[id].x - before[id].x, y: after[id].y - before[id].y });
    const steady = (m) => Math.abs(m.x) < 1 && Math.abs(m.y) < 1;
    const before = await offsets();
    await drag('DevHost', { x: 60, y: 30 });
    const after = await offsets();
    const dev = moved(before, after, 'DevHost');
    assert.ok(Math.abs(dev.x - 60) < 1 && Math.abs(dev.y - 30) < 1, `A drag of DevHost by 60 x 30 px moved it by ${dev.x.toFixed(1)} x ${dev.y.toFixed(1)} against StrongholdApp.`);
    for (const id of ['ServerHost', 'OnlineHost']) {
      const m = moved(before, after, id);
      assert.ok(steady(m), `A drag of DevHost, which was not picked, moved ${id} by ${m.x.toFixed(1)} x ${m.y.toFixed(1)} px.`);
    }
    await expectPicked(page, EX_VIEW, { nodes: ['ServerHost', 'OnlineHost'] }, 'A drag of DevHost, which was not picked,', '', 'After a drag of DevHost, which was not picked, ServerHost and OnlineHost are no longer selected.');
    await drag('OnlineHost', { x: 60, y: 30 });
    const last = await offsets();
    const online = moved(after, last, 'OnlineHost');
    const server = moved(after, last, 'ServerHost');
    assert.ok(Math.abs(online.x - 60) < 1 && Math.abs(online.y - 30) < 1, `A drag of OnlineHost by 60 x 30 px moved it by ${online.x.toFixed(1)} x ${online.y.toFixed(1)} against StrongholdApp.`);
    assert.ok(near(server.x, online.x, 1) && near(server.y, online.y, 1), `A drag of OnlineHost moved ServerHost, which was picked with it, by ${server.x.toFixed(1)} x ${server.y.toFixed(1)} px, and OnlineHost by ${online.x.toFixed(1)} x ${online.y.toFixed(1)}.`);
    const dev2 = moved(after, last, 'DevHost');
    assert.ok(steady(dev2), `A drag of OnlineHost moved DevHost, which was not picked, by ${dev2.x.toFixed(1)} x ${dev2.y.toFixed(1)} px.`);
    await expectPicked(page, EX_VIEW, { nodes: ['ServerHost', 'OnlineHost'] }, 'A drag of OnlineHost, which was picked,');
    await finish(opened);
  });

  test('a tab that comes back shows what is picked now, and a pick shows on every plane that shows it', async () => {
    const opened = await openIn(browser, stateFileAt(IC_FILE));
    const { page } = opened;
    await showView(page, ONE, linesOf(IC, ONE).length);
    await selectBox(page, ONE, 'Pump');
    await showView(page, TWO, linesOf(IC, TWO).length);
    await expectPicked(page, TWO, { nodes: ['Pump'] }, '', '', `Pump, picked on ${ONE.name}, is not selected on ${TWO.name}, which shows it too.`);
    await selectBox(page, TWO, 'Tank');
    await expectPicked(page, TWO, { nodes: ['Tank'] }, `A click on Tank on ${TWO.name}`);
    await showView(page, ONE, linesOf(IC, ONE).length);
    await expectPicked(page, ONE, { nodes: ['Tank'] }, '', '', `Tank, picked on ${TWO.name}, is not the one selected on ${ONE.name} (which shows it too) when its tab comes back.`);
    await finish(opened);
  });

  test("the marquee is drawn in the theme's teal", async () => {
    const opened = await openExample();
    const { page } = opened;
    const teal = await cssColor(page, TEAL);
    const from = await corner(page, EX_VIEW);
    await shifted(page, async () => {
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      await leg(page, from, { x: from.x + 200, y: from.y + 200 });
      await marqueeDrawn(page, EX_VIEW, "from the plane's corner");
      const style = await page.evaluate((plane) => {
        const s = getComputedStyle(document.querySelector(`${plane} .react-flow__selection`));
        return { style: s.borderTopStyle, width: s.borderTopWidth, color: s.borderTopColor, background: s.backgroundColor };
      }, planeOf(EX_VIEW.id));
      assert.deepEqual([style.style, style.width, style.color], ['dotted', '1px', teal], `The marquee's top border is ${style.width} ${style.style} ${style.color}, not 1px dotted ${teal}.`);
      assert.notEqual(style.background, 'rgba(0, 89, 220, 0.08)', "The marquee's background is React Flow's blue, rgba(0, 89, 220, 0.08).");
      await page.mouse.up();
    });
    await finish(opened);
  });
});
