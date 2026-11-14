// Stage 0's probe: the grips tried in the built page with real pointer events. Never committed.
//   node .probe/probe.mjs [q1 q2 q3 q4 q4b q5 hover]
import fs from 'node:fs';
import path from 'node:path';
import {
  boxOf, byTestId, collapseSides, drawn, EXAMPLE, FIXTURES, finish, frame, groundPoint, isGraph, launch, modelOf, NODE, EDGE, openIn, planeOf,
  rectsOf, selectBox, showSide, showView, soon, stateFileAt, TEN, TESTIDS, zoomTo, linesOf, lib,
} from '../canvas/app/test/helpers.mjs';

const want = new Set(process.argv.slice(2));
const run = (name) => want.size === 0 || want.has(name);
const out = {};
const say = (key, value) => { out[key] = value; console.log(`\n## ${key}\n${typeof value === 'string' ? value : JSON.stringify(value, null, 1)}`); };

/** What a plane shows now, read from the DOM. */
const look = (page, viewId) => page.evaluate(([plane]) => {
  const root = document.querySelector(plane);
  const rect = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x * 100) / 100, Math.round(r.y * 100) / 100, Math.round(r.width * 100) / 100, Math.round(r.height * 100) / 100]; };
  return {
    viewport: root.querySelector('.react-flow__viewport')?.style.transform ?? null,
    nodes: Object.fromEntries([...root.querySelectorAll('.react-flow__node')].map((el) => [el.getAttribute('data-id'), rect(el).join(',')])),
    count: root.querySelectorAll('.react-flow__node').length,
    edges: root.querySelectorAll('.react-flow__edge').length,
    selected: [...root.querySelectorAll('.react-flow__node.selected, .react-flow__edge.selected')].map((el) => el.getAttribute('data-id')),
    marquee: !!root.querySelector('.react-flow__selection'),
    grips: root.hasAttribute('data-grips'),
    connecting: root.hasAttribute('data-connecting'),
    probe: root.getAttribute('data-probe') ? JSON.parse(root.getAttribute('data-probe')) : null,
    tool: root.getAttribute('data-tool'),
  };
}, [planeOf(viewId)]);

/** The middle of a node's grip on the screen, and its rectangle. */
const gripOf = (page, viewId, id, side) => page.evaluate(([plane, id_, side_]) => {
  const el = document.querySelector(`${plane} .react-flow__node[data-id=${JSON.stringify(id_)}] > [data-grip="${side_}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2, width: r.width, height: r.height, opacity: getComputedStyle(el).opacity, display: getComputedStyle(el).display };
}, [planeOf(viewId), id, side]);

/** Counts what reaches the window, in the bubble phase, after everything else has heard it. */
const listen = (page) => page.evaluate(() => {
  const c = { down: 0, move: 0, up: 0, click: 0, mousedown: 0, mousemove: 0, mouseup: 0, clickTargets: [] };
  window.__c = c;
  addEventListener('pointerdown', () => { c.down++; });
  addEventListener('pointermove', () => { c.move++; });
  addEventListener('pointerup', () => { c.up++; });
  addEventListener('mousedown', () => { c.mousedown++; });
  addEventListener('mousemove', () => { c.mousemove++; });
  addEventListener('mouseup', () => { c.mouseup++; });
  addEventListener('click', (e) => { c.click++; c.clickTargets.push(`${e.target.tagName}.${e.target.getAttribute('class')}`); }, true);
});
const counts = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.__c)));
const reset = (page) => page.evaluate(() => { Object.assign(window.__c, { down: 0, move: 0, up: 0, click: 0, mousedown: 0, mousemove: 0, mouseup: 0, clickTargets: [] }); });

/** Presses a grip and drags `dx`, `dy` in `steps` moves; `during` is called before the release. Returns what was seen. */
async function dragGrip(page, viewId, id, side, { dx = 100, dy = 0, steps = 10, during = null, hover = true } = {}) {
  const box = await boxOf(page, viewId, id);
  if (hover) { await page.mouse.move(box.x + box.width / 2, box.y + Math.min(box.height / 2, 14 * box.zoom)); await frame(page); }
  const grip = await gripOf(page, viewId, id, side);
  if (!grip) throw new Error(`no ${side} grip on ${id}`);
  const shownOnHover = grip.opacity;
  await page.mouse.move(grip.x, grip.y);
  await frame(page);
  const before = await look(page, viewId);
  await reset(page);
  await page.mouse.down();
  await frame(page);
  const atPress = await look(page, viewId);
  const marquees = [];
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(grip.x + (dx * i) / steps, grip.y + (dy * i) / steps);
    await frame(page);
    marquees.push((await look(page, viewId)).marquee);
  }
  const mid = await look(page, viewId);
  if (during) await during();
  await page.mouse.up();
  await frame(page);
  await frame(page);
  const after = await look(page, viewId);
  return { grip, shownOnHover, before, atPress, mid, after, marquee: marquees.some(Boolean), window: await counts(page) };
}

const summary = (r) => ({
  gripShownOnHover: r.shownOnHover,
  pressReachedPlane: r.atPress.probe ? { grip: r.atPress.probe.grip, element: r.atPress.probe.element, captured: r.atPress.probe.captured } : null,
  nodeMoved: r.before.nodes && Object.keys(r.before.nodes).some((id) => r.before.nodes[id] !== r.after.nodes[id]),
  nodesMovedMidGesture: Object.keys(r.before.nodes).some((id) => r.before.nodes[id] !== r.mid.nodes[id]),
  viewportBefore: r.before.viewport, viewportAfter: r.after.viewport, panned: r.before.viewport !== r.after.viewport || r.before.viewport !== r.mid.viewport,
  connectingMid: r.mid.connecting, connectingAfter: r.after.connecting,
  gestureSaw: r.after.probe && { moves: r.after.probe.moves, ups: r.after.probe.ups, cancels: r.after.probe.cancels, lost: r.after.probe.lost, passed: r.after.probe.passed, capturedAtUp: r.after.probe.capturedAtUp, ended: r.after.probe.ended, over: r.after.probe.over, overType: r.after.probe.overType },
  windowBubble: r.window,
  marqueeSeen: r.marquee,
  selectedBefore: r.before.selected, selectedAfter: r.after.selected,
  nodesBefore: r.before.count, nodesAfter: r.after.count, edgesBefore: r.before.edges, edgesAfter: r.after.edges,
});

const browser = await launch();
try {
  const exampleModel = modelOf(EXAMPLE);
  const GENERAL = exampleModel.views.find((v) => v.id === 'v-proof');
  const INTER_FILE = path.join(FIXTURES, 'interconnection.json');
  const interModel = modelOf(INTER_FILE);
  const INTER = interModel.views.find(isGraph);

  const SMALLER = ['port', 'param', 'bar', 'diamond', 'dot', 'bullseye', 'entry', 'event'];
  const boxesOf = (model, view) => Object.keys(view.layout).filter((id) => {
    const el = model.elements.find((e) => e.id === id);
    return el && !SMALLER.includes(lib.KINDS[el.kind]?.shape);
  });

  for (const [label, file, model, view] of [['example', EXAMPLE, exampleModel, GENERAL], ['interconnection', INTER_FILE, interModel, INTER]]) {
    if (!(run('q1') || run('q2') || run('q3'))) break;
    const opened = await openIn(browser, stateFileAt(file));
    const { page } = opened;
    await showView(page, view, linesOf(model, view).length);
    await listen(page);
    const boxes = boxesOf(model, view);
    // A box whose right grip has free ground 100 px to its right would be best; take the first box and say what was under.
    const id = boxes[0];
    const other = boxes[boxes.length - 1];
    say(`${label}: the view`, { view: view.id, kind: view.kind, boxes: boxes.length, dragFrom: id, other, root: await look(page, view.id).then((l) => ({ grips: l.grips, connecting: l.connecting })) });

    if (run('q1')) {
      const r = await dragGrip(page, view.id, id, 'right');
      say(`${label} Q1: press on ${id}'s right grip, drag 100 px right`, summary(r));
      const up = await dragGrip(page, view.id, id, 'top', { dx: 0, dy: -100 });
      say(`${label} Q1: the same from the top grip, 100 px up`, summary(up));
    }
    if (run('q2')) {
      await page.keyboard.down('Shift');
      const shift = await dragGrip(page, view.id, id, 'right');
      await page.keyboard.up('Shift');
      say(`${label} Q2: with Shift held`, summary(shift));
      // Ctrl: with another box picked first, so that "let go" can be seen.
      await selectBox(page, view, other);
      await page.keyboard.down('Control');
      const ctrl = await dragGrip(page, view.id, id, 'right');
      await page.keyboard.up('Control');
      say(`${label} Q2: with Ctrl held, ${other} picked before`, summary(ctrl));
      await page.keyboard.down('Control');
      const own = await dragGrip(page, view.id, other, 'bottom', { dx: 0, dy: 100 });
      await page.keyboard.up('Control');
      say(`${label} Q2: with Ctrl held, from the picked box's own grip`, summary(own));
      const ground = await groundPoint(page, view);
      await page.mouse.click(ground.x, ground.y);
      await frame(page);
    }
    if (run('q3')) {
      const plain = await dragGrip(page, view.id, id, 'right');
      say(`${label} Q3: the click after a release (nothing picked before)`, { ...summary(plain), note: 'selectedAfter must be empty' });
      // A release before 4 px.
      const short = await dragGrip(page, view.id, id, 'right', { dx: 2, dy: 0, steps: 2 });
      say(`${label} Q3: a release before 4 px`, summary(short));
      const ground = await groundPoint(page, view);
      await page.mouse.click(ground.x, ground.y);
      await frame(page);
      // With a tool in hand: the release on whatever is 100 px right.
      await showSide(page, 'Tools');
      const kind = 'PartDefinition';
      await page.locator(`${byTestId(TESTIDS.tools)} button[data-testid="tool"][data-tool="${kind}"]`).click();
      await frame(page);
      const toasts = () => page.evaluate((sel) => [...document.querySelectorAll(sel)].map((el) => el.textContent), byTestId(TESTIDS.toast));
      const withTool = await dragGrip(page, view.id, id, 'right');
      say(`${label} Q3: with the part def tool in hand, a drag from a grip`, { ...summary(withTool), toolAfter: withTool.after.tool, toasts: await toasts() });
      const shortTool = await dragGrip(page, view.id, id, 'right', { dx: 2, dy: 0, steps: 2 });
      say(`${label} Q3: with the tool in hand, a release before 4 px (a click on the grip)`, { ...summary(shortTool), toolAfter: shortTool.after.tool, toasts: await toasts() });
      await page.keyboard.press('Escape');
    }
    await finish(opened).catch((e) => say(`${label}: the page logged`, String(e.message)));
  }

  if (run('q4')) {
    // Over the graph views of the ten files: where each grip is, and what it overlaps.
    const rows = [];
    let boxesAll = 0; let withPortAtMiddle = 0; let gripsOnPorts = 0; let gripsAll = 0; let offBy = 0; let portGrips = 0; let smallGrips = 0; let portGripWrong = 0;
    const worst = [];
    for (const file of TEN) {
      const model = modelOf(file);
      const views = model.views.filter(isGraph);
      if (views.length === 0) continue;
      const opened = await openIn(browser, stateFileAt(file));
      const { page } = opened;
      for (const view of views) {
        await showView(page, view, linesOf(model, view).length);
        const found = await page.evaluate(([plane]) => {
          const root = document.querySelector(plane);
          const BOX = ['rect', 'rounded', 'item', 'action', 'state'];
          const BORDER = ['port', 'param'];
          const typeOf = (el) => [...el.classList].find((c) => c.startsWith('react-flow__node-'))?.slice('react-flow__node-'.length);
          const nodes = [...root.querySelectorAll('.react-flow__node')].map((el) => ({ el, id: el.getAttribute('data-id'), type: typeOf(el), r: el.getBoundingClientRect() }));
          const zoom = nodes[0] ? nodes[0].r.width / nodes[0].el.offsetWidth : 1;
          const borders = nodes.filter((n) => BORDER.includes(n.type));
          const inside = (p, r) => p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
          const overlap = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
          const res = { zoom, boxes: 0, withPortAtMiddle: 0, grips: 0, gripsOnPorts: 0, offs: [], sizes: [], portGrips: [], smallGrips: [], gripsOverOtherNodes: 0 };
          for (const n of nodes) {
            const grips = [...n.el.querySelectorAll(':scope > [data-grip]')];
            const mids = { top: { x: n.r.left + n.r.width / 2, y: n.r.top }, bottom: { x: n.r.left + n.r.width / 2, y: n.r.bottom }, left: { x: n.r.left, y: n.r.top + n.r.height / 2 }, right: { x: n.r.right, y: n.r.top + n.r.height / 2 } };
            if (BOX.includes(n.type)) {
              res.boxes++;
              if (Object.values(mids).some((m) => borders.some((b) => inside(m, b.r)))) res.withPortAtMiddle++;
            }
            for (const g of grips) {
              const side = g.getAttribute('data-grip');
              const gr = g.getBoundingClientRect();
              const c = { x: gr.left + gr.width / 2, y: gr.top + gr.height / 2 };
              const m = mids[side];
              const out = side === 'top' ? m.y - c.y : side === 'bottom' ? c.y - m.y : side === 'left' ? m.x - c.x : c.x - m.x;
              const along = side === 'top' || side === 'bottom' ? c.x - m.x : c.y - m.y;
              const row = { id: n.id, type: n.type, side, out: out / zoom, along: along / zoom, size: gr.width / zoom };
              if (BOX.includes(n.type)) { res.grips++; res.offs.push(row); if (borders.some((b) => overlap(gr, b.r))) res.gripsOnPorts++; }
              else if (BORDER.includes(n.type)) res.portGrips.push({ ...row, count: grips.length });
              else res.smallGrips.push({ ...row, count: grips.length });
              if (nodes.some((o) => o !== n && inside(c, o.r))) res.gripsOverOtherNodes++;
            }
          }
          return res;
        }, [planeOf(view.id)]);
        boxesAll += found.boxes; withPortAtMiddle += found.withPortAtMiddle; gripsOnPorts += found.gripsOnPorts; gripsAll += found.grips;
        const bad = found.offs.filter((o) => Math.abs(o.out - 14) > 0.05 || Math.abs(o.along) > 0.05 || Math.abs(o.size - 8) > 0.05);
        offBy += bad.length; worst.push(...bad.slice(0, 3));
        portGrips += found.portGrips.length; smallGrips += found.smallGrips.length;
        portGripWrong += found.portGrips.filter((o) => o.count !== 1 || Math.abs(o.out - 14) > 0.05 || Math.abs(o.along) > 0.05).length
          + found.smallGrips.filter((o) => o.count !== 1 || Math.abs(o.out - 14) > 0.05 || Math.abs(o.along) > 0.05).length;
        rows.push({ file: path.basename(file), view: view.id, kind: view.kind, zoom: Math.round(found.zoom * 1000) / 1000, boxes: found.boxes, withPortAtMiddle: found.withPortAtMiddle, boxGrips: found.grips, gripsOnPorts: found.gripsOnPorts, portGrips: found.portGrips.length, smallGrips: found.smallGrips.length, gripsOverOtherNodes: found.gripsOverOtherNodes, portSides: [...new Set(found.portGrips.map((p) => p.side))].join('/'), smallSides: [...new Set(found.smallGrips.map((p) => p.side))].join('/') });
      }
      await finish(opened).catch((e) => say(`${path.basename(file)}: the page logged`, String(e.message)));
    }
    say('Q4: the ten files, each graph view', rows);
    say('Q4: totals', { boxes: boxesAll, boxesWithABorderItemAtAMiddle: withPortAtMiddle, boxGrips: gripsAll, boxGripsThatOverlapABorderItem: gripsOnPorts, gripsNot14OutOrNotCentredOrNot8: offBy, examples: worst, portGrips, smallGrips, portOrSmallGripsWrong: portGripWrong });
  }

  if (run('q4b')) {
    // A grip's size on the screen at 50%, 100%, 200%; a port's and a small node's grip; a selected line's two grips.
    const opened = await openIn(browser, stateFileAt(INTER_FILE));
    const { page } = opened;
    await collapseSides(page);
    await showView(page, INTER, linesOf(interModel, INTER).length);
    const boxes = boxesOf(interModel, INTER);
    const sizes = {};
    for (const zoom of [0.5, 1, 2, 0.3, 0.24]) {
      await zoomTo(page, INTER, boxes[0], zoom).catch(() => null);
      await frame(page);
      const box = await boxOf(page, INTER.id, boxes[0]);
      const grip = await gripOf(page, INTER.id, boxes[0], 'top');
      sizes[`${Math.round(box.zoom * 100)}%`] = grip ? { width: Math.round(grip.width * 100) / 100, height: Math.round(grip.height * 100) / 100, middleOutsideSide: Math.round((box.y - grip.y) * 100) / 100 } : 'no grip mounted';
    }
    say('Q4: a box grip on the screen, by zoom', sizes);
    await zoomTo(page, INTER, boxes[0], 1);
    // A line: select it by a click on its hit path's middle, then read its grips.
    const line = await page.evaluate(([plane]) => {
      const root = document.querySelector(plane);
      for (const g of root.querySelectorAll('.react-flow__edge')) {
        const hit = g.querySelector('.grasp-line-hit');
        const len = hit.getTotalLength();
        if (len < 60) continue;
        const p = hit.getPointAtLength(len / 2);
        const m = hit.getScreenCTM();
        const s = { x: p.x * m.a + p.y * m.c + m.e, y: p.x * m.b + p.y * m.d + m.f };
        const top = document.elementFromPoint(s.x, s.y);
        if (top && top.closest('.react-flow__edge') === g) return { id: g.getAttribute('data-id'), ...s, d: hit.getAttribute('d') };
      }
      return null;
    }, [planeOf(INTER.id)]);
    await page.mouse.click(line.x, line.y);
    await frame(page); await frame(page);
    const ends = await page.evaluate(([plane, id]) => {
      const g = document.querySelector(`${plane} .react-flow__edge[data-id=${JSON.stringify(id)}]`);
      const out = { selected: g.classList.contains('selected'), svgZ: g.closest('svg').style.zIndex, grips: [] };
      for (const c of g.querySelectorAll('[data-grip]')) {
        const r = c.getBoundingClientRect();
        const mid = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        const at = (dx, dy) => { const el = document.elementFromPoint(mid.x + dx, mid.y + dy); return el ? `${el.tagName}${el.getAttribute('data-grip') ? `[grip ${el.getAttribute('data-grip')}]` : ''}.${(el.closest('.react-flow__node')?.getAttribute('data-id') ?? el.closest('.react-flow__edge')?.getAttribute('data-id') ?? el.getAttribute('class') ?? '')}` : null; };
        out.grips.push({ grip: c.getAttribute('data-grip'), cx: c.getAttribute('cx'), cy: c.getAttribute('cy'), width: r.width, height: r.height, display: getComputedStyle(c).display, fill: getComputedStyle(c).fill,
          topmostAtMiddle: at(0, 0), left3: at(-3, 0), right3: at(3, 0), up3: at(0, -3), down3: at(0, 3), mid });
      }
      return out;
    }, [planeOf(INTER.id), line.id]);
    say(`Q4: the selected line ${line.id} (d="${line.d}")`, ends);
    await page.screenshot({ path: path.join(path.dirname(new URL(import.meta.url).pathname), 'line-grips.png'), clip: { x: Math.max(0, Math.min(...ends.grips.map((g) => g.mid.x)) - 80), y: Math.max(0, Math.min(...ends.grips.map((g) => g.mid.y)) - 80), width: Math.abs(ends.grips[0].mid.x - ends.grips[1].mid.x) + 160, height: Math.abs(ends.grips[0].mid.y - ends.grips[1].mid.y) + 160 } });
    // Press a line's grip and drag: the GripPress carries the relationship and the ends.
    await listen(page);
    for (const g of ends.grips) {
      const before = await look(page, INTER.id);
      // Press on the half of the grip that is away from the line's other end, and on its middle.
      await page.mouse.move(g.mid.x, g.mid.y);
      await page.mouse.down();
      await frame(page);
      for (let i = 1; i <= 6; i++) { await page.mouse.move(g.mid.x + 10 * i, g.mid.y + 10 * i); await frame(page); }
      const mid = await look(page, INTER.id);
      await page.mouse.up();
      await frame(page); await frame(page);
      const after = await look(page, INTER.id);
      say(`Q4: a press on the line's ${g.grip} grip (its middle), dragged 60, 60`, { probe: after.probe && { grip: after.probe.grip, relationship: after.probe.relationship, ends: after.probe.ends, moves: after.probe.moves, ups: after.probe.ups, passed: after.probe.passed, state: after.probe.state && { kind: after.probe.state.kind, end: after.probe.state.end, start: after.probe.state.start } }, connectingMid: mid.connecting, moved: Object.keys(before.nodes).some((id) => before.nodes[id] !== after.nodes[id]), panned: before.viewport !== after.viewport, selectedAfter: after.selected });
    }
    await finish(opened).catch((e) => say('q4b: the page logged', String(e.message)));
  }

  if (run('q5')) {
    // hitAt: the pointer on a grip that lies over another node finds that node.
    for (const [label, file, model, view] of [['example', EXAMPLE, exampleModel, GENERAL], ['interconnection', INTER_FILE, interModel, INTER]]) {
      const opened = await openIn(browser, stateFileAt(file));
      const { page } = opened;
      await showView(page, view, linesOf(model, view).length);
      const cases = await page.evaluate(([plane]) => {
        const root = document.querySelector(plane);
        const found = [];
        for (const g of root.querySelectorAll('.react-flow__node > [data-grip]')) {
          const r = g.getBoundingClientRect();
          const c = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          const stack = document.elementsFromPoint(c.x, c.y);
          const own = g.closest('.react-flow__node').getAttribute('data-id');
          const topIsGrip = stack[0] === g;
          const under = stack.find((el) => !el.closest('[data-pass]') && el.closest('.react-flow__node'));
          const underId = under ? under.closest('.react-flow__node').getAttribute('data-id') : null;
          if (underId && underId !== own) found.push({ own, side: g.getAttribute('data-grip'), ...c, underId, topIsGrip, top: `${stack[0].tagName}.${stack[0].getAttribute('class')}` });
        }
        return found;
      }, [planeOf(view.id)]);
      const boxes = boxesOf(model, view);
      const results = [];
      for (const c of cases.slice(0, 6)) {
        // Drag from a grip of another box to the middle of that grip, and read what hitAt gave.
        const from = boxes.find((b) => b !== c.own && b !== c.underId) ?? boxes[0];
        const box = await boxOf(page, view.id, from);
        await page.mouse.move(box.x + 24 * box.zoom, box.y + 14 * box.zoom);
        await frame(page);
        const grip = await gripOf(page, view.id, from, 'top');
        await page.mouse.move(grip.x, grip.y);
        await page.mouse.down();
        await page.mouse.move(grip.x + 6, grip.y - 6);
        await frame(page);
        await page.mouse.move(c.x, c.y, { steps: 4 });
        await frame(page);
        const mid = await look(page, view.id);
        const topmost = await page.evaluate(([x, y]) => { const el = document.elementFromPoint(x, y); return `${el.tagName}[grip ${el.getAttribute('data-grip')}] of ${el.closest('.react-flow__node')?.getAttribute('data-id')}`; }, [c.x, c.y]);
        await page.mouse.up();
        await frame(page);
        results.push({ pointerOn: `${c.own}'s ${c.side} grip`, topmostElementThere: topmost, liesOver: c.underId, hitAtSaid: `${mid.probe.overType}:${mid.probe.over}`, right: mid.probe.over === c.underId });
      }
      say(`Q5 ${label}: ${cases.length} grips lie over another node; hitAt with the pointer on such a grip`, results);
      await finish(opened).catch((e) => say(`${label}: the page logged`, String(e.message)));
    }
  }

  if (run('hover')) {
    // The hover rule: what is outlined while the pointer is over a node, while it is captured, and the way to a grip.
    const opened = await openIn(browser, stateFileAt(INTER_FILE));
    const { page } = opened;
    await showView(page, INTER, linesOf(interModel, INTER).length);
    const boxes = boxesOf(interModel, INTER);
    const id = boxes[0];
    const box = await boxOf(page, INTER.id, id);
    const styleOf = (nodeId) => page.evaluate(([plane, n]) => {
      const el = document.querySelector(`${plane} .react-flow__node[data-id=${JSON.stringify(n)}]`);
      const s = getComputedStyle(el);
      return { outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, hover: el.matches(':hover'), grips: [...el.querySelectorAll(':scope > [data-grip]')].map((g) => getComputedStyle(g).opacity).join(',') };
    }, [planeOf(INTER.id), nodeId]);
    const ground = await groundPoint(page, INTER);
    await page.mouse.move(ground.x, ground.y); await frame(page);
    const away = await styleOf(id);
    await page.mouse.move(box.x + 24 * box.zoom, box.y + 14 * box.zoom); await frame(page);
    const over = await styleOf(id);
    const grip = await gripOf(page, INTER.id, id, 'top');
    // The way from the box to its grip, pixel by pixel: is the box still hovered in the gap?
    const way = [];
    for (let y = box.y + 3; y >= grip.y - 6; y -= 2) { await page.mouse.move(grip.x, y); await frame(page); const s = await styleOf(id); way.push(`${Math.round(box.y - y)}:${s.hover ? 'H' : '-'}${s.grips.split(',')[0]}`); }
    // From outside, straight to where the grip is: it is not shown, and takes no pointer.
    await page.mouse.move(grip.x, grip.y); await frame(page);
    const fromOutside = { ...(await styleOf(id)), topmost: await page.evaluate(([x, y]) => { const el = document.elementFromPoint(x, y); return `${el.tagName}.${el.getAttribute('class')}`; }, [grip.x, grip.y]) };
    // From the box, out by the way to the grip.
    await page.mouse.move(grip.x, box.y + 3); await frame(page);
    await page.mouse.move(grip.x, grip.y, { steps: 6 }); await frame(page);
    const onGrip = await styleOf(id);
    // Captured, and the pointer over another box.
    const other = boxes.find((b) => b !== id);
    const ob = await boxOf(page, INTER.id, other);
    await page.mouse.down();
    await page.mouse.move(grip.x + 8, grip.y - 8); await frame(page);
    await page.mouse.move(ob.x + 24 * ob.zoom, ob.y + 14 * ob.zoom, { steps: 5 }); await frame(page);
    const captured = { source: await styleOf(id), other: await styleOf(other), root: await look(page, INTER.id).then((l) => ({ connecting: l.connecting, over: l.probe.over })) };
    const markRule = await page.evaluate(([plane]) => document.querySelector(`${plane} > style`)?.textContent, [planeOf(INTER.id)]);
    await page.mouse.up(); await frame(page);
    say('hover: a box', { pointerAway: away, pointerOverBox: over, pointerFromOutsideOnTheGripsPlace: fromOutside, wayFromBoxTopToGrip_pxAboveTop_hover_gripOpacity: way.join(' '), pointerOnGrip: onGrip, whileCapturedOverAnotherBox: captured, markRule });
    await finish(opened).catch((e) => say('hover: the page logged', String(e.message)));
  }
} finally {
  await browser.close();
}
fs.writeFileSync(new URL('./last.json', import.meta.url), JSON.stringify(out, null, 1));
