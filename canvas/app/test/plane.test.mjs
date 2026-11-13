// The planes, in the browser (plan/notes.md, "Step 6: the outline, part 2, the planes"): what a view's tab draws, from
// file:// in Chromium. Written before the planes, to the DOM contract in that section; each test fails until its part
// is built. Each is named as the notes' table names it.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { after, afterEach, before, describe, test } from 'node:test';
import { loadCore } from './core.mjs';
import {
  BLANK, boxOf, cardOf, collapseSides, closePages, cssColor, EDGE, EXAMPLE, finish, frame, groundPoint, headerOf, INK, isGraph,
  launch, lib, linesOf, modelOf, near, NODE, nodeOf, openPage, openStateFile, placedOf, planeOf, rectsOf, selectBox, showView, soon,
  stateFileAt, stateFileOf, TEAL, TEN, TESTIDS, viewTab, zoomTo,
  ROOT,
} from './helpers.mjs';
import { ROBOTO_TS, measureRoboto, robotoSource } from './roboto-widths.mjs';

const { textWidth } = await loadCore();
const EX = modelOf(EXAMPLE);
const VIEW = EX.views[0];
const LINES = linesOf(EX, VIEW).length;
const IC_FILE = TEN.find((file) => file.endsWith('interconnection.json'));
const FIXTURE = (name) => TEN.find((file) => file.endsWith(`${name}.json`));
const EDGE_OF = (view, id) => `${planeOf(view.id)} ${EDGE}[data-id=${JSON.stringify(id)}]`;

describe('the planes', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  /** Opens the page and a state file in it, and brings the file's first graph view to the front, drawn. */
  async function openFile(file, { collapsed = false } = {}) {
    const opened = await openPage(browser, { picker: false });
    if (collapsed) await collapseSides(opened.page);
    await openStateFile(opened.page, stateFileAt(file));
    return opened;
  }
  /** The example, drawn, with both sides open (the plane is 736 by 828) or collapsed. */
  async function openExample(options) {
    const opened = await openFile(EXAMPLE, options);
    await showView(opened.page, VIEW, LINES);
    return opened;
  }
  /** The wheel, turned with the pointer at (x, y). */
  const wheel = async (page, at, dx, dy) => { await page.mouse.move(at.x, at.y); await page.mouse.wheel(dx, dy); };

  test('a part sits inside its part def', async () => {
    const opened = await openExample();
    const { page } = opened;
    const outer = await boxOf(page, VIEW.id, 'Page');
    const hosts = await boxOf(page, VIEW.id, 'Page.hosts');
    const app = await boxOf(page, VIEW.id, 'Page.app');
    assert.ok(outer && hosts && app, 'The plane draws no node for Page, Page.hosts or Page.app.');
    for (const [id, part] of [['Page.hosts', hosts], ['Page.app', app]]) {
      assert.ok(part.x >= outer.x - 0.5 && part.y >= outer.y - 0.5 && part.x + part.width <= outer.x + outer.width + 0.5 && part.y + part.height <= outer.y + outer.height + 0.5,
        `${id} does not lie inside Page on the screen: it is at ${part.x}, ${part.y}, ${part.width} by ${part.height}, and Page at ${outer.x}, ${outer.y}, ${outer.width} by ${outer.height}.`);
    }
    const place = VIEW.layout['Page.hosts'];
    const offset = [(hosts.x - outer.x) / outer.zoom, (hosts.y - outer.y) / outer.zoom];
    assert.ok(near(offset[0], place.x, 1) && near(offset[1], place.y, 1),
      `Page.hosts is ${offset[0].toFixed(1)} by ${offset[1].toFixed(1)} from Page's corner, over the zoom, and its saved place is ${place.x} by ${place.y}.`);
    await finish(opened);
  });

  test('each line kind has its marker', async () => {
    let kinds = 0;
    for (const file of TEN) {
      const model = modelOf(file);
      const opened = await openFile(file);
      const { page } = opened;
      for (const view of model.views.filter(isGraph)) {
        const lines = linesOf(model, view);
        await showView(page, view, lines.length);
        const found = await page.evaluate(([plane, ids]) => ids.map((id) => {
          const edge = document.querySelector(`${plane} .react-flow__edge[data-id="${id}"]`);
          const path = edge && edge.querySelector('path.grasp-line');
          const marker = path ? path.getAttribute('marker-end') : null;
          const target = marker && /^url\(#(.+)\)$/.exec(marker);
          const matches = target ? [...document.querySelectorAll('[id]')].filter((el) => el.id === target[1]) : [];
          return { id, edge: !!edge, path: !!path, marker, matches: matches.length, inside: matches.length === 1 && !!matches[0].closest('svg.grasp-markers') };
        }), [planeOf(view.id), lines]);
        for (const line of found) {
          const rel = model.relationships.find((r) => r.id === line.id);
          const wanted = lib.RELATIONSHIPS[rel.kind].line.marker;
          const where = `${rel.kind} ${line.id} in ${view.name} (${file.split('/').pop()})`;
          assert.ok(line.path, `The plane draws no path.grasp-line for ${where}.`);
          assert.equal(line.marker, wanted ? `url(#grasp-${wanted})` : null, `The marker-end of ${where} is ${line.marker}; its row says ${wanted}.`);
          if (wanted) {
            kinds++;
            assert.ok(line.matches === 1 && line.inside, `The marker grasp-${wanted} of ${where} exists ${line.matches} times in the document, ${line.inside ? 'inside' : 'not inside'} svg.grasp-markers: it must be there once.`);
          }
        }
      }
      const markers = await page.evaluate(() => [...document.querySelectorAll('svg.grasp-markers marker')].map((el) => el.id).sort());
      assert.deepEqual(markers, ['grasp-m-defined', 'grasp-m-flow', 'grasp-m-general', 'grasp-m-message', 'grasp-m-open'],
        'The page has not the five markers, each once, in svg.grasp-markers.');
      const everywhere = await page.evaluate(() => [...document.querySelectorAll('[id^="grasp-m-"]')].length);
      assert.equal(everywhere, 5, `The page has ${everywhere} elements with an id grasp-m-..., not five: a marker is defined more than once.`);
      await finish(opened);
    }
    assert.ok(kinds > 0, 'No line of the ten files has a marker, so nothing was checked.');
  });

  test('a definition\'s corners are square and a usage\'s round', async () => {
    const radius = async (page, view, id) => page.evaluate((selector) => {
      const el = document.querySelector(selector);
      return el && getComputedStyle(el).borderTopLeftRadius;
    }, nodeOf(view.id, id));
    // The example: a part def and a part usage, and the outline of a box.
    const opened = await openExample();
    const { page } = opened;
    assert.equal(await radius(page, VIEW, 'Host'), '0px', 'Host, a part def, has round corners.');
    assert.equal(await radius(page, VIEW, 'Page.hosts'), '10px', 'Page.hosts, a part usage, has not corners of 10 px.');
    const ink = await cssColor(page, INK);
    const white = await cssColor(page, '#fff');
    const outline = await page.evaluate((selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      return {
        widths: ['Top', 'Right', 'Bottom', 'Left'].map((side) => style[`border${side}Width`]),
        styles: ['Top', 'Right', 'Bottom', 'Left'].map((side) => style[`border${side}Style`]),
        colours: ['Top', 'Right', 'Bottom', 'Left'].map((side) => style[`border${side}Color`]),
        ground: style.backgroundColor,
      };
    }, nodeOf(VIEW.id, 'Host'));
    assert.deepEqual(outline.widths, ['1px', '1px', '1px', '1px'], 'The box of Host has not a 1 px border on each side.');
    assert.deepEqual(outline.styles, ['solid', 'solid', 'solid', 'solid'], 'The border of the box of Host is not solid.');
    assert.deepEqual(outline.colours, [ink, ink, ink, ink], `The border of the box of Host is not the ink colour (${ink}).`);
    assert.equal(outline.ground, white, `The ground of the box of Host is ${outline.ground}, not white.`);
    await finish(opened);

    // An item, an action, and a state that is a definition and one that is a usage, from the fixtures.
    const cases = [
      ['interconnection', 'v-ic', 'Tank.stored', '10px', 'an item'],
      ['behavior-actions', 'v-release', 'Release.compile', '10px', 'an action'],
      ['behavior-states', 'v-host', 'HostLifecycle', '0px', 'a state that is a definition'],
      ['behavior-states', 'v-host', 'HostLifecycle.idle', '16px', 'a state that is a usage'],
    ];
    for (const [name, viewId, id, wanted, what] of cases) {
      const model = modelOf(FIXTURE(name));
      const view = model.views.find((v) => v.id === viewId);
      const again = await openFile(FIXTURE(name));
      await showView(again.page, view, linesOf(model, view).length);
      assert.equal(await radius(again.page, view, id), wanted, `${id}, ${what}, has not corners of ${wanted}.`);
      await finish(again);
    }
  });

  test('a sequence view\'s tab says it is not drawn yet', async () => {
    const file = FIXTURE('sequence');
    const model = modelOf(file);
    const seq = model.views.find((view) => view.kind === 'SequenceView');
    const all = model.views.find((view) => isGraph(view));
    const opened = await openFile(file);
    const { page } = opened;
    const tab = await viewTab(page, seq);
    assert.equal(await tab.getAttribute('aria-selected'), 'true', `The tab of ${seq.name} is not the one in front.`);
    const [first, second] = cardOf(seq);
    const card = await soon(page, () => page.evaluate((selector) => {
      const plane = document.querySelector(selector);
      return plane ? { text: plane.textContent, flow: plane.querySelectorAll('.react-flow').length } : null;
    }, planeOf(seq.id)), `No plane holds the card of ${seq.name} (data-testid "${TESTIDS.plane}", data-view "${seq.id}").`);
    assert.ok(card.text.includes(first), `The tab of the sequence view does not say "${first}". It reads "${card.text}".`);
    assert.ok(card.text.includes(second), `The tab of the sequence view does not say "${second}". It reads "${card.text}".`);
    assert.equal(card.flow, 0, 'The tab of the sequence view holds a React Flow, for a kind no plane draws.');
    await showView(page, all, linesOf(model, all).length);
    assert.ok(await boxOf(page, all.id, placedOf(all)[0]), "The general view of sequence.json draws no node for its first element.");
    await finish(opened);
  });

  test('the view is fitted once it has a size, clear of the window\'s sides and of the minimap', async () => {
    const opened = await openExample();
    const { page } = opened;
    const plane = await page.evaluate((selector) => { const r = document.querySelector(selector).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }, planeOf(VIEW.id));
    assert.ok(near(plane.width, 736, 1) && near(plane.height, 828, 1), `This test is written for a plane of 736 by 828 px, with both sides open; it is ${plane.width} by ${plane.height}.`);
    const rects = await rectsOf(page, VIEW.id);
    const all = Object.entries(rects);
    assert.equal(all.length, 13, `The plane draws ${all.length} nodes, not 13.`);
    for (const [id, r] of all) {
      assert.ok(r.x >= plane.x + 48 - 1 && r.x + r.width <= plane.x + plane.width - 48 + 1 && r.y >= plane.y + 48 - 1 && r.y + r.height <= plane.y + plane.height - 180 + 1,
        `${id} is drawn at ${r.x.toFixed(1)}, ${r.y.toFixed(1)}, ${r.width.toFixed(1)} by ${r.height.toFixed(1)}, not inside the plane (${plane.x}, ${plane.y}, ${plane.width} by ${plane.height}) less 48 px at the left, right and top and 180 px at the bottom.`);
    }
    const zoom = (await boxOf(page, VIEW.id, 'Page')).zoom;
    assert.ok(near(zoom, 640 / 1176, 0.01), `The view is fitted at ${(zoom * 100).toFixed(2)}%, not at ${(640 / 1176 * 100).toFixed(2)}% (640 px for 1,176).`);
    const left = Math.min(...all.map(([, r]) => r.x));
    const right = Math.max(...all.map(([, r]) => r.x + r.width));
    assert.ok(near((left + right) / 2, plane.x + plane.width / 2, 1.5),
      `The view is not centred between the left and the right: its nodes run from ${left.toFixed(1)} to ${right.toFixed(1)}, in a plane from ${plane.x} to ${plane.x + plane.width}.`);
    const panels = await page.evaluate((selector) => ['.react-flow__minimap', '.react-flow__controls'].map((name) => {
      const el = document.querySelector(`${selector} ${name}`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { name, x: r.x, y: r.y, right: r.right, bottom: r.bottom };
    }), planeOf(VIEW.id));
    for (const panel of panels) {
      assert.ok(panel, 'The plane has no minimap or no zoom buttons (.react-flow__minimap, .react-flow__controls).');
      for (const [id, r] of all) {
        const meets = r.x < panel.right && r.x + r.width > panel.x && r.y < panel.bottom && r.y + r.height > panel.y;
        assert.ok(!meets, `${id} meets the ${panel.name} (${panel.x}, ${panel.y} to ${panel.right}, ${panel.bottom}).`);
      }
    }
    await finish(opened);
  });

  test('the wheel pans by its own delta, and Ctrl with the wheel zooms about the pointer', async () => {
    const opened = await openExample();
    const { page } = opened;
    const ground = await groundPoint(page, VIEW);
    const host = () => boxOf(page, VIEW.id, 'Host');
    const settle = async () => { await frame(page); await frame(page); };
    const first = await host();
    await wheel(page, ground, 0, 120);
    await soon(page, async () => Math.abs((await host()).y - first.y) > 1, 'A turn of the wheel by 120 px, the pointer on bare ground, moved no node.');
    await settle();
    const down = await host();
    assert.ok(near(down.y, first.y - 120, 1) && near(down.x, first.x, 1), `A wheel of 0, 120 moved a node by ${(down.x - first.x).toFixed(1)}, ${(down.y - first.y).toFixed(1)}; it must be 0, -120.`);
    assert.ok(near(down.zoom, first.zoom, 1e-6), 'A wheel without Ctrl changed the zoom.');
    await wheel(page, ground, 80, 0);
    await soon(page, async () => Math.abs((await host()).x - down.x) > 1, 'A turn of the wheel sideways by 80 px moved no node.');
    await settle();
    const side = await host();
    assert.ok(near(side.x, down.x - 80, 1) && near(side.y, down.y, 1), `A wheel of 80, 0 moved a node by ${(side.x - down.x).toFixed(1)}, ${(side.y - down.y).toFixed(1)}; it must be -80, 0.`);
    assert.ok(near(side.zoom, first.zoom, 1e-6), 'A sideways wheel changed the zoom.');

    // With Control, the same wheel zooms, and the point of the plane under the pointer stays under it.
    const page0 = await boxOf(page, VIEW.id, 'Page');
    const under = { x: (ground.x - page0.x) / page0.zoom, y: (ground.y - page0.y) / page0.zoom };
    await page.keyboard.down('Control');
    try {
      await wheel(page, ground, 0, -40);
      await soon(page, async () => Math.abs((await boxOf(page, VIEW.id, 'Page')).zoom / page0.zoom - 1) > 0.005, 'A turn of the wheel with Ctrl held did not change the zoom.');
      await settle();
    } finally {
      await page.keyboard.up('Control');
    }
    const page1 = await boxOf(page, VIEW.id, 'Page');
    const at = { x: page1.x + under.x * page1.zoom, y: page1.y + under.y * page1.zoom };
    assert.ok(near(at.x, ground.x, 2) && near(at.y, ground.y, 2),
      `After zooming from ${(page0.zoom * 100).toFixed(1)}% to ${(page1.zoom * 100).toFixed(1)}%, the point of the plane that was under the pointer is ${at.x.toFixed(1)}, ${at.y.toFixed(1)}, and the pointer is at ${ground.x}, ${ground.y}.`);
    await finish(opened);
  });

  test('a double click does not zoom', async () => {
    const opened = await openExample();
    const { page } = opened;
    const before = (await boxOf(page, VIEW.id, 'Host')).zoom;
    const ground = await groundPoint(page, VIEW);
    await page.mouse.dblclick(ground.x, ground.y);
    await page.waitForTimeout(400);
    const afterGround = (await boxOf(page, VIEW.id, 'Host')).zoom;
    assert.ok(near(afterGround, before, 1e-6), `A double click on bare ground zoomed the plane from ${(before * 100).toFixed(1)}% to ${(afterGround * 100).toFixed(1)}%.`);
    const point = headerOf(await boxOf(page, VIEW.id, 'Host'));
    await page.mouse.dblclick(point.x, point.y);
    await page.waitForTimeout(400);
    const afterNode = (await boxOf(page, VIEW.id, 'Host')).zoom;
    assert.ok(near(afterNode, before, 1e-6), `A double click on a node zoomed the plane from ${(before * 100).toFixed(1)}% to ${(afterNode * 100).toFixed(1)}%.`);
    await finish(opened);
  });

  test('below 25% a box is its outline and a line has no label, and both come back above it', async () => {
    const opened = await openExample();
    const { page } = opened;
    const count = () => page.evaluate(([plane, node, edge]) => [document.querySelectorAll(`${plane} ${node}`).length, document.querySelectorAll(`${plane} ${edge}`).length], [planeOf(VIEW.id), NODE, EDGE]);
    const label = EDGE_OF(VIEW, 'mount') + ' text.grasp-line-label';
    const near25 = await count();
    assert.deepEqual(near25, [13, LINES], `The plane draws ${near25[0]} nodes and ${near25[1]} edges, not 13 and ${LINES}.`);
    await soon(page, () => page.evaluate((s) => !!document.querySelector(s), label), 'The line mount has no label (text.grasp-line-label) while the plane is fitted.');

    await zoomTo(page, VIEW, 'Page', 0.15);
    const far = () => page.evaluate(([plane, node, labels]) => {
      const nodes = [...document.querySelectorAll(`${plane} ${node}`)];
      return {
        notFar: nodes.filter((el) => !el.classList.contains('far')).map((el) => el.getAttribute('data-id')),
        withText: nodes.filter((el) => el.textContent.trim() !== '').map((el) => el.getAttribute('data-id')),
        labels: document.querySelectorAll(`${plane} ${labels}`).length,
      };
    }, [planeOf(VIEW.id), NODE, 'text.grasp-line-label']);
    await soon(page, async () => { const now = await far(); return now.notFar.length === 0 ? now : null; },
      async () => `Zoomed to ${((await boxOf(page, VIEW.id, 'Page')).zoom * 100).toFixed(1)}%, these nodes do not have the word "far": ${(await far()).notFar.join(', ')}.`);
    await frame(page);
    const now = await far();
    assert.deepEqual(now.withText, [], `Under 25%, these nodes still hold text: ${now.withText.join(', ')}.`);
    assert.equal(now.labels, 0, `Under 25%, ${now.labels} line labels (text.grasp-line-label) are still drawn.`);
    assert.deepEqual(await count(), near25, 'Under 25%, the plane draws other nodes or edges than above it.');
    const border = await page.evaluate((s) => getComputedStyle(document.querySelector(s)).borderTopWidth, nodeOf(VIEW.id, 'Host'));
    assert.equal(border, '1px', `Under 25% a box has a border of ${border}, not its 1 px outline.`);

    await zoomTo(page, VIEW, 'Page', 0.5);
    await soon(page, () => page.evaluate(([s, name]) => document.querySelector(s)?.textContent.includes(name), [nodeOf(VIEW.id, 'Host'), 'Host']), 'Back above 25%, Host does not read its name again.');
    await soon(page, () => page.evaluate((s) => document.querySelector(s)?.textContent.trim() === 'mount', label), 'Back above 25%, the line mount does not have its label "mount" again.');
    await finish(opened);
  });

  test('the blank model\'s empty view opens at 100%', async () => {
    const model = modelOf(BLANK);
    const view = model.views[0];
    const opened = await openFile(BLANK);
    const { page } = opened;
    const tab = await viewTab(page, view);
    assert.equal(await tab.getAttribute('aria-selected'), 'true', `The tab ${view.name} : ${view.kind} is not in front.`);
    await soon(page, () => page.evaluate((s) => !!document.querySelector(`${s} .react-flow`), planeOf(view.id)), `The plane of ${view.name} holds no .react-flow.`);
    const state = await soon(page, () => page.evaluate((s) => {
      const el = document.querySelector(`${s} .react-flow__viewport`);
      if (!el) return null;
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return { a: m.a, d: m.d, e: m.e, f: m.f, nodes: document.querySelectorAll(`${s} .react-flow__node`).length };
    }, planeOf(view.id)), `The plane of ${view.name} has no .react-flow__viewport.`);
    assert.equal(state.nodes, 0, `The empty view draws ${state.nodes} nodes.`);
    assert.ok(near(state.a, 1, 1e-6) && near(state.d, 1, 1e-6) && near(state.e, 0, 1e-6) && near(state.f, 0, 1e-6),
      `The empty view's viewport is scaled ${state.a} by ${state.d} and moved ${state.e}, ${state.f}; it must be 1 and no move.`);
    await finish(opened);
  });

  test('no row of a compartment and no name runs past its box, in the example and the fixtures', async () => {
    let rows = 0;
    let cut = 0;
    for (const file of TEN) {
      const model = modelOf(file);
      const opened = await openFile(file);
      const { page } = opened;
      for (const view of model.views.filter(isGraph)) {
        await showView(opened.page, view, linesOf(model, view).length);
        const found = await page.evaluate((plane) => {
          const out = { rows: 0, cut: 0, outside: [], wrong: [] };
          for (const node of document.querySelectorAll(`${plane} .react-flow__node`)) {
            const n = node.getBoundingClientRect();
            for (const el of node.querySelectorAll('.grasp-compartment-row, .grasp-node-name, .grasp-node-keyword')) {
              const r = el.getBoundingClientRect();
              const what = `${el.className} "${el.textContent.trim().slice(0, 30)}" of ${node.getAttribute('data-id')}`;
              if (r.left < n.left - 0.5 || r.right > n.right + 0.5 || r.top < n.top - 0.5 || r.bottom > n.bottom + 0.5) {
                out.outside.push(`${what} is at ${r.left.toFixed(1)} to ${r.right.toFixed(1)}, ${r.top.toFixed(1)} to ${r.bottom.toFixed(1)}; its box is ${n.left.toFixed(1)} to ${n.right.toFixed(1)}, ${n.top.toFixed(1)} to ${n.bottom.toFixed(1)}`);
              }
              if (el.classList.contains('grasp-compartment-row')) {
                out.rows++;
                const style = getComputedStyle(el);
                if (style.whiteSpace !== 'nowrap' || style.textOverflow !== 'ellipsis') out.wrong.push(`${what} has white-space ${style.whiteSpace} and text-overflow ${style.textOverflow}`);
                if (el.scrollWidth > el.clientWidth) out.cut++;
              }
            }
          }
          return out;
        }, planeOf(view.id));
        rows += found.rows;
        cut += found.cut;
        assert.deepEqual(found.outside, [], `In ${view.name} (${file.split('/').pop()}), text runs past its box:\n${found.outside.join('\n')}`);
        assert.deepEqual(found.wrong, [], `In ${view.name} (${file.split('/').pop()}), a row is not cut by an ellipsis on one line:\n${found.wrong.join('\n')}`);
      }
      await finish(opened);
    }
    assert.ok(rows > 0, 'No compartment row (.grasp-compartment-row) is drawn in any view, so nothing was checked.');
    assert.equal(cut, 0, `${cut} rows of the ten files are cut by an ellipsis. Wrapped by Roboto's widths every one of their rows fits its room (plan/notes.md, session 21).`);

    // No row of the ten files is too long for its box, so the rule is exercised on a part def made for it: wrapping
    // keeps a word whole, however wide, and this doc's first word is far wider than its room (a box 120 wide has a
    // room of 96 px; the word is some 300 px), so its row stands by itself and the page cuts it with an ellipsis.
    const long = 'Pneumonoultramicroscopicsilicovolcanoconiosis';
    const state = JSON.parse(fs.readFileSync(BLANK, 'utf8'));
    const view = state.model.views[0];
    state.model.elements.push({ id: 'Narrow', kind: 'PartDefinition', name: 'Narrow', doc: `${long} is one word.` });
    view.layout.Narrow = { x: 0, y: 0, w: 120, h: 72 };
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    await openStateFile(page, stateFileOf('narrow.json', state));
    const row = await soon(page, () => page.evaluate(([plane, word]) => {
      const el = [...document.querySelectorAll(`${plane} .grasp-compartment-row`)].find((r) => r.textContent.startsWith(word));
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const n = el.closest('.react-flow__node').getBoundingClientRect();
      return { cut: el.scrollWidth > el.clientWidth, inside: r.left >= n.left - 0.5 && r.right <= n.right + 0.5, row: [r.left, r.right], box: [n.left, n.right] };
    }, [planeOf(view.id), long]), `The plane of ${view.name} draws no row that begins "${long}".`);
    assert.ok(row.cut, `The row "${long}" is not cut (scrollWidth > clientWidth), though the word is far wider than its 120 px box.`);
    assert.ok(row.inside, `The row "${long}" runs from ${row.row[0].toFixed(1)} to ${row.row[1].toFixed(1)}, past its box, ${row.box[0].toFixed(1)} to ${row.box[1].toFixed(1)}.`);
    await finish(opened);
  });

  test('a row is as wide in the page as the adapter measured it, and ends a pad short of its box\'s side or sooner', async () => {
    let rows = 0;
    let views = 0;
    for (const file of TEN) {
      const model = modelOf(file);
      const opened = await openFile(file);
      const { page } = opened;
      for (const view of model.views.filter(isGraph)) {
        await showView(page, view, linesOf(model, view).length);
        views += 1;
        // Near, the plane is above 25%: where the fit leaves it under, zoom in on a node of the view.
        const first = Object.keys(view.layout)[0];
        const start = await boxOf(page, view.id, first);
        if (start && start.zoom < 0.3) await zoomTo(page, view, first, 0.5);
        const found = await soon(page, async () => {
          const now = await page.evaluate((plane) => [...document.querySelectorAll(`${plane} .react-flow__node`)].map((node) => {
            const n = node.getBoundingClientRect();
            const zoom = node.offsetWidth ? n.width / node.offsetWidth : 1;
            return {
              id: node.getAttribute('data-id'),
              zoom,
              right: n.right,
              rows: [...node.querySelectorAll('.grasp-compartment-row')].map((row) => {
                const range = document.createRange();
                range.selectNodeContents(row);
                const r = range.getBoundingClientRect();
                return { text: row.textContent, width: r.width, right: r.right };
              }),
            };
          }), planeOf(view.id));
          return now.length > 0 && now.every((node) => node.zoom > 0.25) ? now : null;
        }, `The plane of ${view.name} (${file.split('/').pop()}) is not drawn above 25%.`);
        for (const node of found) {
          for (const row of node.rows) {
            rows += 1;
            const where = `the row "${row.text}" of ${node.id} in ${view.name} (${file.split('/').pop()}), at ${(node.zoom * 100).toFixed(0)}%`;
            const wanted = textWidth(row.text, 12);
            assert.ok(near(row.width / node.zoom, wanted, 0.5),
              `${where} is ${(row.width / node.zoom).toFixed(2)} px wide, over the zoom; the adapter measures it at ${wanted.toFixed(2)} px (with kerning on, the page draws it narrower).`);
            const limit = node.right - 12 * node.zoom + 0.5;
            assert.ok(row.right <= limit,
              `${where} ends at ${row.right.toFixed(2)}, past ${limit.toFixed(2)}: its box's right side, ${node.right.toFixed(2)}, less 12 px at this zoom, plus 0.5.`);
          }
        }
      }
      await finish(opened);
    }
    assert.ok(views >= 11, `Only ${views} of the eleven graph views were checked.`);
    assert.ok(rows >= 20, `Only ${rows} rows were measured; the ten files hold many more.`);
  });

  test('the table of widths is what the page\'s font gives', async () => {
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    const version = JSON.parse(fs.readFileSync(`${ROOT}/node_modules/@fontsource/roboto/package.json`, 'utf8')).version;
    const { widths } = await measureRoboto(page);
    assert.ok(widths.length > 200, `Chromium gave the widths of only ${widths.length} characters.`);
    const made = robotoSource(widths, version);
    const kept = fs.readFileSync(ROBOTO_TS, 'utf8');
    if (made !== kept) {
      const a = made.split('\n');
      const b = kept.split('\n');
      const at = a.findIndex((line, i) => line !== b[i]);
      assert.fail(`canvas/app/src/core/roboto.ts is not what the page's Roboto gives. First difference at line ${at + 1}: the font gives ${JSON.stringify(a[at])}, the file has ${JSON.stringify(b[at])}.`);
    }
    await finish(opened);
  });

  test('a click selects a box and a line, and a click on the ground lets go', async () => {
    const opened = await openExample();
    const { page } = opened;
    const teal = await cssColor(page, TEAL);
    const selected = () => page.evaluate((plane) => ({
      nodes: [...document.querySelectorAll(`${plane} .react-flow__node.selected`)].map((el) => el.getAttribute('data-id')),
      edges: [...document.querySelectorAll(`${plane} .react-flow__edge.selected`)].map((el) => el.getAttribute('data-id')),
    }), planeOf(VIEW.id));
    await selectBox(page, VIEW, 'Host');
    const outline = await page.evaluate((s) => { const style = getComputedStyle(document.querySelector(s)); return [style.outlineWidth, style.outlineStyle, style.outlineColor]; }, nodeOf(VIEW.id, 'Host'));
    assert.deepEqual(outline, ['2px', 'solid', teal], `The selected Host has an outline of ${outline.join(' ')}, not 2px solid ${teal}.`);
    await selectBox(page, VIEW, 'App');
    await soon(page, async () => (await selected()).nodes.join() === 'App', async () => `A click on App leaves ${(await selected()).nodes.join(', ') || 'nothing'} selected, not App alone.`);

    const mid = await page.evaluate((s) => {
      const path = document.querySelector(`${s} path.grasp-line`);
      if (!path) return null;
      const p = path.getPointAtLength(path.getTotalLength() / 2);
      const q = new DOMPoint(p.x, p.y).matrixTransform(path.getScreenCTM());
      return { x: q.x, y: q.y };
    }, EDGE_OF(VIEW, 'mount'));
    assert.ok(mid, 'The line mount has no path.grasp-line.');
    await page.mouse.click(mid.x, mid.y);
    await soon(page, async () => (await selected()).edges.join() === 'mount', async () => `A click on the middle of mount leaves ${JSON.stringify(await selected())} selected.`);
    assert.deepEqual((await selected()).nodes, [], 'With the line mount selected, a box is still selected.');
    const stroke = await page.evaluate((s) => getComputedStyle(document.querySelector(`${s} path.grasp-line`)).stroke, EDGE_OF(VIEW, 'mount'));
    assert.equal(stroke, teal, `The selected line mount is stroked ${stroke}, not teal (${teal}).`);

    const ground = await groundPoint(page, VIEW);
    await page.mouse.click(ground.x, ground.y);
    await soon(page, async () => { const now = await selected(); return !now.nodes.length && !now.edges.length; }, async () => `A click on bare ground leaves ${JSON.stringify(await selected())} selected.`);
    await finish(opened);
  });

  test('a line\'s label is over the box it lies in', async () => {
    const opened = await openExample();
    const { page } = opened;
    const hit = await soon(page, () => page.evaluate(([edge, outer]) => {
      const label = document.querySelector(`${edge} text.grasp-line-label`);
      if (!label) return null;
      const r = label.getBoundingClientRect();
      const o = document.querySelector(outer).getBoundingClientRect();
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return {
        label: top === label, inEdge: !!top && document.querySelector(edge).contains(top), node: top?.closest('.react-flow__node')?.getAttribute('data-id') ?? null,
        inside: r.left >= o.left - 0.5 && r.right <= o.right + 0.5 && r.top >= o.top - 0.5 && r.bottom <= o.bottom + 0.5,
      };
    }, [EDGE_OF(VIEW, 'mount'), nodeOf(VIEW.id, 'Page')]), 'The line mount has no label (text.grasp-line-label).');
    assert.ok(hit.inside, 'The label of mount does not lie inside the rectangle of Page.');
    assert.ok(hit.label || hit.inEdge, `At the centre of the label of mount the page has ${hit.node ? `the node ${hit.node}` : 'something else'}, not the label or its line: the label lies under the box.`);
    assert.equal(hit.node, null, 'At the centre of the label of mount the page has a node, not the label or its line.');
    await finish(opened);
  });

  test('the fit button fits the view again', async () => {
    const opened = await openExample();
    const { page } = opened;
    const first = await rectsOf(page, VIEW.id);
    const counts = await page.evaluate((s) => ({
      controls: document.querySelectorAll(`${s} .react-flow__controls`).length,
      fit: document.querySelectorAll(`${s} .react-flow__controls-fitview`).length,
      lock: document.querySelectorAll(`${s} .react-flow__controls-interactive`).length,
    }), planeOf(VIEW.id));
    assert.equal(counts.controls, 1, 'The plane has no zoom buttons (.react-flow__controls).');
    assert.equal(counts.fit, 0, 'The plane has React Flow\'s own fit button (.react-flow__controls-fitview): it fits by its own rule.');
    assert.equal(counts.lock, 0, 'The plane has the lock button (.react-flow__controls-interactive).');
    const ground = await groundPoint(page, VIEW);
    await wheel(page, ground, 90, 140);
    await zoomTo(page, VIEW, 'Page', 1.2);
    await soon(page, async () => { const now = await rectsOf(page, VIEW.id); return Math.abs(now.Host.x - first.Host.x) > 5; }, 'Panning and zooming moved no node.');
    const button = page.locator(planeOf(VIEW.id)).getByRole('button', { name: 'Fit the view', exact: true });
    assert.equal(await button.count(), 1, 'The plane has no button named "Fit the view".');
    await button.click();
    const worst = (now) => Math.max(...Object.entries(first).map(([id, r]) => (now[id] ? Math.max(Math.abs(now[id].x - r.x), Math.abs(now[id].y - r.y), Math.abs(now[id].width - r.width), Math.abs(now[id].height - r.height)) : Infinity)));
    await soon(page, async () => worst(await rectsOf(page, VIEW.id)) <= 1,
      async () => `After a click on "Fit the view" the nodes are up to ${worst(await rectsOf(page, VIEW.id)).toFixed(1)} px from where the first fit had them.`);
    await finish(opened);
  });

  test('a tab that is hidden holds no React Flow, and shown again finds its zoom and its selection', async () => {
    const model = modelOf(IC_FILE);
    const [one, two] = model.views;
    assert.ok(isGraph(one) && isGraph(two), 'interconnection.json has two graph views.');
    const opened = await openFile(IC_FILE);
    const { page } = opened;
    await showView(page, one, linesOf(model, one).length);
    await selectBox(page, one, 'Pump');
    const ground = await groundPoint(page, one);
    await zoomTo(page, one, 'Pump', (await boxOf(page, one.id, 'Pump')).zoom * 1.5);
    await wheel(page, ground, 30, 20);
    await frame(page);
    await frame(page);
    const before = await boxOf(page, one.id, 'Pump');
    assert.ok(before?.selected, 'Pump is not selected before the switch.');

    await showView(page, two, linesOf(model, two).length);
    const left = await page.evaluate((s) => document.querySelectorAll(`${s} .react-flow__node`).length, planeOf(one.id));
    assert.equal(left, 0, `The tab of ${one.name}, hidden, holds ${left} React Flow nodes.`);

    const tab = await viewTab(page, one);
    await tab.click();
    const back = await soon(page, async () => boxOf(page, one.id, 'Pump'), `With ${one.name} shown again, its plane draws no node for Pump.`);
    await frame(page);
    const now = await boxOf(page, one.id, 'Pump');
    assert.ok(near(now.x, before.x, 1) && near(now.y, before.y, 1) && near(now.width, before.width, 1), `Shown again, Pump is drawn at ${now.x.toFixed(1)}, ${now.y.toFixed(1)} and was at ${before.x.toFixed(1)}, ${before.y.toFixed(1)}: the camera is not remembered.`);
    assert.ok(near(now.zoom, before.zoom, 1e-3), `Shown again, the plane is at ${(now.zoom * 100).toFixed(1)}%, and was at ${(before.zoom * 100).toFixed(1)}%.`);
    assert.ok(now.selected && back, 'Shown again, Pump is not selected.');
    await finish(opened);
  });

  test('far or near, every line stays drawn', async () => {
    const file = FIXTURE('behavior-actions');
    const model = modelOf(file);
    const view = model.views[0];
    const lines = linesOf(model, view);
    const opened = await openFile(file);
    const { page } = opened;
    await showView(page, view, lines.length);
    const check = async (when) => {
      for (let i = 0; i < 3; i++) await frame(page);
      const found = await page.evaluate(([plane, ids]) => ids.map((id) => {
        const path = document.querySelector(`${plane} .react-flow__edge[data-id="${id}"] path.grasp-line`);
        return { id, d: path ? path.getAttribute('d') : null };
      }), [planeOf(view.id), lines]);
      const missing = found.filter((line) => !line.d || !line.d.trim()).map((line) => line.id);
      assert.deepEqual(missing, [], `${when}, these lines have no path.grasp-line with a d: ${missing.join(', ')}.`);
      // React Flow reads a mounted node's handles from the DOM: every node holds the one inert element, far or near.
      const bare = await page.evaluate((plane) => [...document.querySelectorAll(`${plane} .react-flow__node`)]
        .filter((node) => node.querySelectorAll('.grasp-node-handle.source.target').length !== 1).map((node) => node.getAttribute('data-id')), planeOf(view.id));
      assert.deepEqual(bare, [], `${when}, these nodes do not hold exactly one inert handle (.grasp-node-handle.source.target): ${bare.join(', ')}.`);
    };
    const start = (await boxOf(page, view.id, 'Release')).zoom;
    assert.ok(start >= 0.25, `The view is fitted at ${(start * 100).toFixed(1)}%, which is far; this test starts near.`);
    await check('Near');
    await zoomTo(page, view, 'Release', 0.15);
    await soon(page, () => page.evaluate((plane) => [...document.querySelectorAll(`${plane} .react-flow__node`)].every((el) => el.classList.contains('far')), planeOf(view.id)), 'Zoomed under 25%, the nodes do not turn far.');
    await check('Far');
    await zoomTo(page, view, 'Release', start);
    await soon(page, () => page.evaluate((plane) => [...document.querySelectorAll(`${plane} .react-flow__node`)].every((el) => !el.classList.contains('far')), planeOf(view.id)), 'Zoomed back over 25%, the nodes do not turn near.');
    await check('Near again');
    await finish(opened);

    // A node that mounts while its view is far is measured then, without its words. A tab shown again mounts its nodes
    // afresh: the view left far and come back to must draw every one of its lines.
    const two = FIXTURE('interconnection');
    const modelTwo = modelOf(two);
    const [ic, defs] = modelTwo.views;
    const icLines = linesOf(modelTwo, ic);
    assert.ok(icLines.length > 0, 'The first view of interconnection.json draws lines.');
    const again = await openFile(two);
    const pageTwo = again.page;
    await showView(pageTwo, ic, icLines.length);
    await zoomTo(pageTwo, ic, 'Pump', 0.15);
    const allFar = (plane) => { const nodes = [...document.querySelectorAll(`${plane} .react-flow__node`)]; return nodes.length > 0 && nodes.every((el) => el.classList.contains('far')); };
    await soon(pageTwo, () => pageTwo.evaluate(allFar, planeOf(ic.id)), 'Zoomed under 25%, the nodes of the interconnection view do not turn far.');
    await showView(pageTwo, defs, linesOf(modelTwo, defs).length);
    await (await viewTab(pageTwo, ic)).click();
    await soon(pageTwo, () => pageTwo.evaluate(allFar, planeOf(ic.id)), 'Shown again, the interconnection view left far is not drawn far.');
    for (let i = 0; i < 4; i++) await frame(pageTwo);
    const kept = await pageTwo.evaluate(([plane, ids]) => ids.filter((id) => {
      const path = document.querySelector(`${plane} .react-flow__edge[data-id="${id}"] path.grasp-line`);
      return !path || !(path.getAttribute('d') || '').trim();
    }), [planeOf(ic.id), icLines]);
    assert.deepEqual(kept, [], `A view left far and shown again has lost these lines: ${kept.join(', ')}.`);
    await finish(again);
  });

  test('the planes\' words are Roboto: 13 px medium for a name, 11 px for a keyword, 12 px in a row', async () => {
    const opened = await openExample();
    const { page } = opened;
    await page.evaluate(() => document.fonts.ready);
    const wanted = [
      ['.grasp-node-name', '13px', '500'],
      ['.grasp-node-keyword', '11px', null],
      ['.grasp-compartment-row', '12px', null],
      ['.grasp-port-name', '12px', null],
      ['text.grasp-line-label', '12px', null],
    ];
    const found = await page.evaluate(([plane, parts]) => parts.map(([selector]) => ({
      selector,
      all: [...document.querySelectorAll(`${plane} ${selector}`)].map((el) => { const s = getComputedStyle(el); return { size: s.fontSize, weight: s.fontWeight, family: s.fontFamily }; }),
    })), [planeOf(VIEW.id), wanted]);
    for (const [selector, size, weight] of wanted) {
      const { all } = found.find((f) => f.selector === selector);
      assert.ok(all.length > 0, `The example's plane draws no ${selector}.`);
      for (const font of all) {
        assert.equal(font.size, size, `A ${selector} is ${font.size}, not ${size}.`);
        if (weight) assert.equal(font.weight, weight, `A ${selector} has weight ${font.weight}, not ${weight}.`);
        assert.match(font.family, /Roboto/, `A ${selector} is set in ${font.family}, not Roboto.`);
      }
    }
    assert.ok(await page.evaluate(() => document.fonts.check('500 13px Roboto')), 'Roboto medium at 13 px is not loaded.');
    await finish(opened);
  });

  test('a port\'s square lies across its owner\'s border, with its name outside the owner', async () => {
    const opened = await openExample();
    const { page } = opened;
    const ports = ['Page.hosts.api', 'Page.app.api', 'Host.api', 'App.api'];
    for (const id of ports) {
      const el = EX.elements.find((e) => e.id === id);
      const side = VIEW.layout[id].side;
      assert.ok(side === 'left' || side === 'right', `${id} is on the ${side}: this test is written for ports on a left or right side.`);
      const found = await page.evaluate(([port, owner]) => {
        const n = document.querySelector(port);
        const o = document.querySelector(owner);
        if (!n || !o) return null;
        const name = n.querySelector('.grasp-port-name');
        const r = (el) => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, right: b.right, bottom: b.bottom, width: b.width, height: b.height }; };
        return { port: r(n), owner: r(o), name: name ? r(name) : null };
      }, [nodeOf(VIEW.id, id), nodeOf(VIEW.id, el.owner)]);
      assert.ok(found, `The plane draws no node for ${id} or for its owner ${el.owner}.`);
      const centre = found.port.x + found.port.width / 2;
      const edge = side === 'right' ? found.owner.right : found.owner.x;
      assert.ok(near(centre, edge, 1), `The square of ${id} is centred at x ${centre.toFixed(1)}; the ${side} edge of ${el.owner} is at ${edge.toFixed(1)}.`);
      assert.ok(found.port.y >= found.owner.y && found.port.bottom <= found.owner.bottom, `The square of ${id} is not beside its owner.`);
      assert.ok(found.name, `The node of ${id} has no .grasp-port-name.`);
      const meets = found.name.x < found.owner.right && found.name.right > found.owner.x && found.name.y < found.owner.bottom && found.name.bottom > found.owner.y;
      assert.ok(!meets, `The name of ${id} (${found.name.x.toFixed(1)} to ${found.name.right.toFixed(1)}) meets its owner ${el.owner} (${found.owner.x.toFixed(1)} to ${found.owner.right.toFixed(1)}).`);
    }
    await finish(opened);
  });
});
