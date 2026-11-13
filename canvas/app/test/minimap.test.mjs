// A plane's minimap, in the browser (plan/swarm/step-8.md, change 3 and the list of canvas/app/test/minimap.test.mjs):
// written before the minimap of our own, from the contract in the comment of PlaneMiniMap (canvas/app/src/plane/MiniMap.tsx).
// From file:// in Chromium. Every test reads only what the page shows: the minimap's svg, its two paths, and the boxes.

import assert from 'node:assert/strict';
import { after, afterEach, before, describe, test } from 'node:test';
import {
  BLANK, boxOf, closePages, cssColor, EXAMPLE, finish, frame, groundPoint, headerOf, launch, modelOf, near, openIn, planeOf,
  rectsOf, selectBox, showView, soon, stateFileAt, undo, zoomTo,
} from './helpers.mjs';

const VIEW = modelOf(EXAMPLE).views[0];
const BLANK_VIEW = modelOf(BLANK).views[0];
const MINIMAP = { width: 200, height: 150 };
const PANEL = '.react-flow__panel.react-flow__minimap.grasp-minimap';

const NUMBER = '-?\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?';
const RECT = new RegExp(`M(${NUMBER}),(${NUMBER})h(${NUMBER})v(${NUMBER})h(${NUMBER})z`, 'g');

/** A path's `d` as rectangles { x, y, w, h }, by the contract's pattern; fails when anything else is in it. */
function rectsIn(d, what) {
  const rects = [];
  for (const m of d.matchAll(RECT)) {
    const [x, y, w, h, back] = m.slice(1).map(Number);
    assert.ok(near(back, -w, 0.01), `A rectangle of ${what} goes back by ${back}, which is not -${w}.`);
    rects.push({ x, y, w, h });
  }
  assert.equal(d.replace(RECT, ''), '', `The d of ${what} holds more than rectangles written as M<x>,<y>h<w>v<h>h<-w>z, with nothing between them: "${d.slice(0, 120)}".`);
  return rects;
}

/**
 * Reads the minimap of a view's plane as it is now: its panel's rectangle, its svg's attributes, the viewBox as four
 * numbers, and each path's d as rectangles. Fails when the minimap holds no path.grasp-minimap-nodes.
 */
async function minimapOf(page, view) {
  const plane = planeOf(view.id);
  await soon(page, () => page.evaluate((s) => !!document.querySelector(`${s} .react-flow__minimap`), plane), `The plane of ${view.name} has no minimap (.react-flow__minimap).`);
  const read = await page.evaluate(([selector, panel]) => {
    const root = document.querySelector(selector);
    const el = root.querySelector('.react-flow__minimap');
    const rect = (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
    const nodes = el.querySelector('path.grasp-minimap-nodes');
    const mask = el.querySelector('path.grasp-minimap-mask');
    const svg = el.querySelector('svg[role="img"]');
    return {
      oldNodes: root.querySelectorAll('.react-flow__minimap-node').length,
      panels: root.querySelectorAll(panel).length,
      panel: rect(el),
      plane: rect(root),
      title: svg?.querySelector('title')?.textContent ?? null,
      svgWidth: svg?.getAttribute('width') ?? null,
      svgHeight: svg?.getAttribute('height') ?? null,
      viewBox: svg?.getAttribute('viewBox') ?? null,
      nodesD: nodes ? nodes.getAttribute('d') : null,
      maskD: mask ? mask.getAttribute('d') : null,
      fillRule: mask?.getAttribute('fill-rule') ?? null,
      hasNodes: !!nodes,
      masks: el.querySelectorAll('path.grasp-minimap-mask').length,
      nodePaths: el.querySelectorAll('path.grasp-minimap-nodes').length,
    };
  }, [plane, PANEL]);
  assert.ok(read.hasNodes, `The minimap of ${view.name} holds no path.grasp-minimap-nodes: it is React Flow's own, with ${read.oldNodes} elements of .react-flow__minimap-node.`);
  const viewBox = (read.viewBox ?? '').trim().split(/[\s,]+/).map(Number);
  assert.ok(viewBox.length === 4 && viewBox.every(Number.isFinite), `The minimap's viewBox is "${read.viewBox}", which is not four numbers.`);
  assert.ok(read.maskD !== null, `The minimap of ${view.name} holds no path.grasp-minimap-mask.`);
  return {
    ...read,
    viewBox,
    nodes: rectsIn(read.nodesD, 'path.grasp-minimap-nodes'),
    mask: rectsIn(read.maskD, 'path.grasp-minimap-mask'),
  };
}

/** The viewBox's number and the paths' strings, for a test that says what did not change. */
const sameOf = (m) => ({ viewBox: m.viewBox.join(' '), nodesD: m.nodesD });

/** The bounds of rectangles. */
function boundsOf(rects) {
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  return { x, y, w: Math.max(...rects.map((r) => r.x + r.w)) - x, h: Math.max(...rects.map((r) => r.y + r.h)) - y };
}

/** Whether `rects` holds one of size w by h at (x, y), within eps. */
const holds = (rects, x, y, w, h, eps = 0.5) => rects.some((r) => near(r.x, x, eps) && near(r.y, y, eps) && near(r.w, w, eps) && near(r.h, h, eps));

/** The rectangle of the picture that is `id`'s size (the first one in the picture's order), as the origin: Page's. */
function originOf(m, page, what = 'Page') {
  const origin = m.nodes.find((r) => near(r.w, page.w, 0.5) && near(r.h, page.h, 0.5));
  assert.ok(origin, `The picture holds no rectangle of ${what}'s size, ${page.w} by ${page.h}.`);
  return origin;
}

describe('a plane\'s minimap', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  /** Opens the example, with both sides open (the plane is 736 by 828), its view shown, and the minimap read. */
  async function openExample() {
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    await showView(opened.page, VIEW);
    await frame(opened.page);
    return opened;
  }
  /** Every node's rectangle on the screen, by id. */
  const screenOf = (page) => rectsOf(page, VIEW.id);
  /** The nodes of the view, each as its size in units and its offset from Page in units, from the screen and the zoom. */
  async function nodesOnScreen(page) {
    const page0 = await boxOf(page, VIEW.id, 'Page');
    const rects = await screenOf(page);
    const list = Object.entries(rects).map(([id, r]) => ({ id, w: r.width / page0.zoom, h: r.height / page0.zoom, x: (r.x - page0.x) / page0.zoom, y: (r.y - page0.y) / page0.zoom }));
    return { zoom: page0.zoom, page: { w: page0.w, h: page0.h }, list };
  }

  test('the minimap is one picture of our own, with nothing per node', async () => {
    const opened = await openExample();
    const { page } = opened;
    const m = await minimapOf(page, VIEW);
    assert.equal(m.panels, 1, `The plane has ${m.panels} elements with the classes ${PANEL}.`);
    assert.equal(m.title, 'Minimap', `The minimap's svg[role="img"] has the title "${m.title}", not "Minimap".`);
    assert.equal(m.svgWidth, '200', `The minimap's svg has width="${m.svgWidth}", not 200.`);
    assert.equal(m.svgHeight, '150', `The minimap's svg has height="${m.svgHeight}", not 150.`);
    assert.equal(m.nodePaths, 1, `The minimap has ${m.nodePaths} paths of class grasp-minimap-nodes.`);
    assert.equal(m.nodes.length, 13, `The picture holds ${m.nodes.length} rectangles for the 13 nodes of ${VIEW.name}.`);
    assert.equal(m.masks, 1, `The minimap has ${m.masks} paths of class grasp-minimap-mask.`);
    assert.equal(m.fillRule, 'evenodd', `The mask's fill-rule is "${m.fillRule}", not "evenodd".`);
    assert.equal(m.mask.length, 2, `The mask holds ${m.mask.length} rectangles, not 2.`);
    assert.equal(m.oldNodes, 0, `The plane has ${m.oldNodes} elements of .react-flow__minimap-node.`);
    await finish(opened);
  });

  test('the minimap stands 15 px from the plane\'s right and bottom edges, 200 by 150', async () => {
    const opened = await openExample();
    const { page } = opened;
    const read = await page.evaluate((selector) => {
      const r = (e) => { const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; };
      const plane = document.querySelector(selector);
      return { plane: r(plane), minimap: r(plane.querySelector('.react-flow__minimap')) };
    }, planeOf(VIEW.id));
    const { plane, minimap } = read;
    assert.ok(near(minimap.width, MINIMAP.width, 1) && near(minimap.height, MINIMAP.height, 1), `The minimap is ${minimap.width} by ${minimap.height} px, not 200 by 150.`);
    const right = plane.x + plane.width - (minimap.x + minimap.width);
    const bottom = plane.y + plane.height - (minimap.y + minimap.height);
    assert.ok(near(right, 15, 1) && near(bottom, 15, 1), `The minimap stands ${right.toFixed(1)} px from the plane's right edge and ${bottom.toFixed(1)} px from its bottom edge, not 15 and 15.`);
    await finish(opened);
  });

  test('the picture holds every node where the view has it', async () => {
    const opened = await openExample();
    const { page } = opened;
    const m = await minimapOf(page, VIEW);
    const { page: size, list } = await nodesOnScreen(page);
    assert.equal(list.length, 13, `The plane draws ${list.length} nodes, not 13.`);
    const origin = originOf(m, size);
    for (const n of list) {
      assert.ok(holds(m.nodes, origin.x + n.x, origin.y + n.y, n.w, n.h),
        `The picture holds no rectangle for ${n.id}: it should be ${n.w.toFixed(1)} by ${n.h.toFixed(1)} at ${n.x.toFixed(1)}, ${n.y.toFixed(1)} from Page.`);
    }
    await finish(opened);
  });

  test('the picture is centred in its viewBox, 5 px of the minimap clear around it', async () => {
    const opened = await openExample();
    const { page } = opened;
    const m = await minimapOf(page, VIEW);
    assert.equal(m.nodes.length, 13, `The picture holds ${m.nodes.length} rectangles for the 13 nodes.`);
    const b = boundsOf(m.nodes);
    const scale = Math.max(b.w / MINIMAP.width, b.h / MINIMAP.height) || 1;
    const vw = scale * MINIMAP.width;
    const vh = scale * MINIMAP.height;
    const off = 5 * scale;
    const want = [b.x - (vw - b.w) / 2 - off, b.y - (vh - b.h) / 2 - off, vw + 2 * off, vh + 2 * off];
    assert.ok(want.every((v, i) => near(m.viewBox[i], v, 0.01)),
      `The viewBox is ${m.viewBox.map((v) => v.toFixed(2)).join(' ')}; the picture's bounds give ${want.map((v) => v.toFixed(2)).join(' ')}.`);
    const [x, y, w, h] = m.viewBox;
    const outer = m.mask[0];
    assert.ok(near(outer.x, x - w, 0.01) && near(outer.y, y - h, 0.01) && near(outer.w, 3 * w, 0.01) && near(outer.h, 3 * h, 0.01),
      `The mask's first rectangle is ${outer.w.toFixed(2)} by ${outer.h.toFixed(2)} at ${outer.x.toFixed(2)}, ${outer.y.toFixed(2)}; it should be the viewBox grown by its own size on every side: ${(3 * w).toFixed(2)} by ${(3 * h).toFixed(2)} at ${(x - w).toFixed(2)}, ${(y - h).toFixed(2)}.`);
    await finish(opened);
  });

  test('the window on the minimap is what the plane shows', async () => {
    const opened = await openExample();
    const { page } = opened;
    const m = await minimapOf(page, VIEW);
    const { zoom, page: size, list } = await nodesOnScreen(page);
    const win = m.mask[1];
    assert.ok(near(win.w, m.plane.width / zoom, 1) && near(win.h, m.plane.height / zoom, 1),
      `The window is ${win.w.toFixed(1)} by ${win.h.toFixed(1)}; the plane is ${m.plane.width} by ${m.plane.height} px at ${(zoom * 100).toFixed(1)}%, which is ${(m.plane.width / zoom).toFixed(1)} by ${(m.plane.height / zoom).toFixed(1)} units.`);
    const origin = originOf(m, size);
    const screen = await screenOf(page);
    let whole = 0;
    for (const n of list) {
      const r = screen[n.id];
      if (r.x < m.plane.x || r.y < m.plane.y || r.x + r.width > m.plane.x + m.plane.width || r.y + r.height > m.plane.y + m.plane.height) continue;
      whole++;
      const x = origin.x + n.x;
      const y = origin.y + n.y;
      assert.ok(x >= win.x - 0.5 && y >= win.y - 0.5 && x + n.w <= win.x + win.w + 0.5 && y + n.h <= win.y + win.h + 0.5,
        `${n.id} is wholly on the plane, but its rectangle (${x.toFixed(1)}, ${y.toFixed(1)}, ${n.w.toFixed(1)} by ${n.h.toFixed(1)}) is not inside the window (${win.x.toFixed(1)}, ${win.y.toFixed(1)}, ${win.w.toFixed(1)} by ${win.h.toFixed(1)}).`);
    }
    assert.ok(whole > 0, 'No node is wholly on the plane, so the test checked nothing.');
    await finish(opened);
  });

  test('a pan moves the window on the minimap, and makes nothing else again', async () => {
    const opened = await openExample();
    const { page } = opened;
    const m0 = await minimapOf(page, VIEW);
    await page.evaluate((selector) => { document.querySelector(`${selector} path.grasp-minimap-nodes`).__mark = 'kept'; }, planeOf(VIEW.id));
    const was = await boxOf(page, VIEW.id, 'Page');
    const ground = await groundPoint(page, VIEW);
    await page.mouse.move(ground.x, ground.y);
    await page.mouse.down();
    for (let i = 1; i <= 6; i++) await page.mouse.move(ground.x + (60 * i) / 6, ground.y + (30 * i) / 6);
    await page.mouse.up();
    await soon(page, async () => { const now = await boxOf(page, VIEW.id, 'Page'); return near(now.x - was.x, 60, 1) && near(now.y - was.y, 30, 1); },
      'A drag of the ground by 60 right and 30 down did not pan the plane by that.');
    await frame(page);
    const m1 = await soon(page, async () => { const m = await minimapOf(page, VIEW); return near(m.mask[1].x - m0.mask[1].x, -60 / was.zoom, 0.5) ? m : null; },
      `The window did not move by ${(-60 / was.zoom).toFixed(1)} units when the plane panned 60 px right.`);
    assert.ok(near(m1.mask[1].y - m0.mask[1].y, -30 / was.zoom, 0.5), `The window moved by ${(m1.mask[1].y - m0.mask[1].y).toFixed(1)} units down; the pan of 30 px down should move it ${(-30 / was.zoom).toFixed(1)}.`);
    assert.ok(near(m1.mask[1].w, m0.mask[1].w, 0.01) && near(m1.mask[1].h, m0.mask[1].h, 0.01), 'The pan changed the size of the window.');
    const marked = await page.evaluate((selector) => document.querySelector(`${selector} path.grasp-minimap-nodes`)?.__mark ?? null, planeOf(VIEW.id));
    assert.equal(marked, 'kept', 'The pan made the nodes\' path again: its element is another one.');
    assert.deepEqual(sameOf(m1), sameOf(m0), 'The pan changed the nodes\' d or the viewBox.');
    await finish(opened);
  });

  test('a zoom resizes the window on the minimap', async () => {
    const opened = await openExample();
    const { page } = opened;
    const m0 = await minimapOf(page, VIEW);
    await zoomTo(page, VIEW, 'Host', 1);
    const zoom = (await boxOf(page, VIEW.id, 'Host')).zoom;
    const m1 = await soon(page, async () => {
      const m = await minimapOf(page, VIEW);
      return near(m.mask[1].w, m.plane.width / zoom, 1) && near(m.mask[1].h, m.plane.height / zoom, 1) ? m : null;
    }, async () => {
      const m = await minimapOf(page, VIEW);
      return `At ${(zoom * 100).toFixed(1)}% the window is ${m.mask[1].w.toFixed(1)} by ${m.mask[1].h.toFixed(1)}; the plane is ${m.plane.width} by ${m.plane.height} px, which is ${(m.plane.width / zoom).toFixed(1)} by ${(m.plane.height / zoom).toFixed(1)} units.`;
    });
    assert.ok(m1.mask[1].w < m0.mask[1].w, 'Zooming in did not make the window smaller.');
    assert.deepEqual(sameOf(m1), sameOf(m0), 'The zoom changed the nodes\' d or the viewBox.');
    await finish(opened);
  });

  test('a dragged box moves on the minimap', async () => {
    const opened = await openExample();
    const { page } = opened;
    /** Where the picture holds the rectangle of size (w, h) at an offset from Page's, as `box` and `page0` are on the screen now. */
    const offsetOf = (box, pageBox) => ({ x: (box.x - pageBox.x) / pageBox.zoom, y: (box.y - pageBox.y) / pageBox.zoom, w: box.width / pageBox.zoom, h: box.height / pageBox.zoom });
    const places = async () => {
      const [host, app, pageBox] = await Promise.all(['Host', 'App', 'Page'].map((id) => boxOf(page, VIEW.id, id)));
      return { host: offsetOf(host, pageBox), app: offsetOf(app, pageBox), zoom: pageBox.zoom, size: { w: pageBox.w, h: pageBox.h } };
    };
    const first = await places();
    const m0 = await minimapOf(page, VIEW);
    const origin0 = originOf(m0, first.size);
    assert.ok(holds(m0.nodes, origin0.x + first.host.x, origin0.y + first.host.y, first.host.w, first.host.h), 'Before the drag the picture holds no rectangle for Host.');
    const host = await boxOf(page, VIEW.id, 'Host');
    const start = headerOf(host);
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    for (let i = 1; i <= 8; i++) await page.mouse.move(start.x + (80 * i) / 8, start.y + (40 * i) / 8);
    await page.mouse.up();
    await frame(page);
    const picture = async (p) => { const m = await minimapOf(page, VIEW); return { m, origin: originOf(m, p.size) }; };
    const moved = await places();
    assert.ok(near(moved.host.x - moved.app.x - (first.host.x - first.app.x), 80 / first.zoom, 1), 'Host did not move 80 px right against App on the screen.');
    await soon(page, async () => { const { m, origin } = await picture(moved); return holds(m.nodes, origin.x + moved.host.x, origin.y + moved.host.y, moved.host.w, moved.host.h); },
      `After the drag the picture holds no rectangle for Host at its new place, ${(80 / first.zoom).toFixed(1)} by ${(40 / first.zoom).toFixed(1)} units from where it was.`);
    const { m: m1, origin: origin1 } = await picture(moved);
    assert.ok(holds(m1.nodes, origin1.x + moved.app.x, origin1.y + moved.app.y, moved.app.w, moved.app.h), 'After the drag of Host the picture holds no rectangle where App is.');

    await undo(page);
    const back = await places();
    await soon(page, async () => { const { m, origin } = await picture(back); return holds(m.nodes, origin.x + first.host.x, origin.y + first.host.y, first.host.w, first.host.h) && !holds(m.nodes, origin.x + moved.host.x, origin.y + moved.host.y, moved.host.w, moved.host.h, 0.5); },
      'After Undo the picture does not hold Host at its first place again.');
    await finish(opened);
  });

  test('the minimap takes its colours from the theme', async () => {
    const opened = await openExample();
    const { page } = opened;
    await minimapOf(page, VIEW);
    const read = await page.evaluate((selector) => {
      const el = document.querySelector(`${selector} .react-flow__minimap`);
      const nodes = getComputedStyle(el.querySelector('path.grasp-minimap-nodes'));
      return { nodeFill: nodes.fill, nodeStroke: nodes.stroke, maskFill: getComputedStyle(el.querySelector('path.grasp-minimap-mask')).fill, background: getComputedStyle(el).backgroundColor };
    }, planeOf(VIEW.id));
    const strong = await cssColor(page, 'var(--grasp-line-strong)');
    const veil = await cssColor(page, 'var(--grasp-minimap-mask)');
    const white = await cssColor(page, 'var(--grasp-white)');
    assert.equal(read.nodeFill, strong, `The nodes' fill is ${read.nodeFill}, not --grasp-line-strong (${strong}).`);
    assert.equal(read.maskFill, veil, `The mask's fill is ${read.maskFill}, not --grasp-minimap-mask (${veil}).`);
    assert.equal(read.background, white, `The minimap's background is ${read.background}, not --grasp-white (${white}).`);
    assert.equal(read.nodeStroke, 'none', `The nodes' path has the stroke ${read.nodeStroke}, not none.`);
    await finish(opened);
  });

  test('a view that places nothing has an empty picture', async () => {
    const opened = await openIn(browser, stateFileAt(BLANK));
    const { page } = opened;
    await showView(page, BLANK_VIEW);
    await frame(page);
    const m = await minimapOf(page, BLANK_VIEW);
    assert.equal(m.nodesD, '', `The nodes' path has d="${m.nodesD}", not empty.`);
    assert.deepEqual(m.viewBox, [0, 0, 200, 150], `The viewBox of an empty picture is ${m.viewBox.join(' ')}, not 0 0 200 150.`);
    assert.equal(m.mask.length, 2, `The mask holds ${m.mask.length} rectangles, not 2.`);
    await finish(opened);
  });

  test('a click on the minimap does nothing and does not reach the ground', async () => {
    const opened = await openExample();
    const { page } = opened;
    await selectBox(page, VIEW, 'Host');
    const host = await boxOf(page, VIEW.id, 'Host');
    const panel = await page.evaluate((selector) => { const b = document.querySelector(`${selector} .react-flow__minimap`).getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; }, planeOf(VIEW.id));
    await page.mouse.click(panel.x + panel.width / 2, panel.y + panel.height / 2);
    for (let i = 0; i < 3; i++) await frame(page);
    const now = await boxOf(page, VIEW.id, 'Host');
    assert.ok(now.selected, 'A click on the minimap let Host go: it reached the ground.');
    assert.ok(near(now.zoom, host.zoom, 1e-6), `A click on the minimap changed the zoom from ${(host.zoom * 100).toFixed(1)}% to ${(now.zoom * 100).toFixed(1)}%.`);
    assert.ok(near(now.x, host.x, 0.5) && near(now.y, host.y, 0.5), `A click on the minimap moved Host by ${(now.x - host.x).toFixed(1)} x ${(now.y - host.y).toFixed(1)} px.`);
    await finish(opened);
  });
});
