// What the grips cost where they are mounted: a near view with every node mounted (under LARGE_VIEW nodes), panned and
// dragged in, on a build with the stand-in and on one without.   node .probe/near.mjs <dist dir> [elements] [zoom]
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { VIEWS, scaleState } from '../canvas/test/scale-model.mjs';
import { boxOf, frame, groundPoint, launch, measure, moveTiming, NODE, openPage, openStateFile, planeOf, stateFileOf, untilDrawn, viewTab, zoomTo } from '../canvas/app/test/helpers.mjs';

const dist = path.resolve(process.argv[2]);
const elements = Number(process.argv[3] ?? 700);
const zoom = Number(process.argv[4] ?? 0.3);
const state = scaleState(elements);
const view = state.model.views.find((v) => v.id === VIEWS.workflows);
const browser = await launch();
const { page, context, problems } = await openPage(browser, { url: pathToFileURL(path.join(dist, 'index.html')).href, picker: false });
await openStateFile(page, stateFileOf(`scale-${elements}.json`, state));
const tab = await viewTab(page, view);
if ((await tab.getAttribute('aria-selected')) !== 'true') await tab.click();
await untilDrawn(page, view);
const ids = Object.keys(view.layout);
const box0 = ids.find((id) => /\.receive$/.test(id)) ?? ids[0];
await zoomTo(page, view, box0, zoom);
await frame(page);
const counts = await page.evaluate(([plane, node]) => ({ nodes: document.querySelectorAll(`${plane} ${node}`).length, grips: document.querySelectorAll(`${plane} [data-grip]`).length, edges: document.querySelectorAll(`${plane} .react-flow__edge`).length, gripsAttr: document.querySelector(plane).hasAttribute('data-grips') }), [planeOf(view.id), NODE]);
const time = await moveTiming(page);
const MOVES = 4; const START = [3, 2]; const DRAG_START = [6, 3]; const STEP = [12, 6];
async function gesture(from, way, starting, following, start) {
  await page.mouse.move(from.x, from.y);
  await frame(page);
  await page.mouse.down();
  const at = { x: from.x, y: from.y };
  for (let m = 0; m < MOVES; m++) {
    const [dx, dy] = m ? STEP : start;
    at.x += way * dx; at.y += way * dy;
    (m ? following : starting).add(await time(() => page.mouse.move(at.x, at.y)));
  }
  await page.mouse.up();
  await frame(page);
}
const pan = { starting: measure(99, 1e9), following: measure(99, 1e9) };
const ground = await groundPoint(page, view);
for (let i = 0; i < 8; i++) await gesture(ground, i % 2 ? -1 : 1, pan.starting, pan.following, START);
const drag = { starting: measure(99, 1e9), following: measure(99, 1e9) };
const box = await boxOf(page, view.id, box0);
const from = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
for (let i = 0; i < 8; i++) await gesture({ x: from.x, y: from.y }, i % 2 ? -1 : 1, drag.starting, drag.following, DRAG_START);
// The pointer moved over the nodes, nothing pressed: the hover rule at work.
const hover = measure(99, 1e9);
const rects = await page.evaluate(([plane, node]) => [...document.querySelectorAll(`${plane} ${node}`)].slice(0, 40).map((el) => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }).filter((p) => p.x > 80 && p.x < 1300 && p.y > 120 && p.y < 820), [planeOf(view.id), NODE]);
for (const p of rects.slice(0, 24)) hover.add(await time(() => page.mouse.move(p.x, p.y)));
// A line in hand: from a box's right grip, each move timed (the stand-in asks hitAt, marks, and writes an attribute).
const line = { starting: measure(99, 1e9), following: measure(99, 1e9) };
if (counts.grips > 0) {
  for (let i = 0; i < 6; i++) {
    const b = await boxOf(page, view.id, box0);
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await frame(page);
    const g = await page.evaluate(([plane, id]) => { const r = document.querySelector(`${plane} ${'.react-flow__node'}[data-id=${JSON.stringify(id)}] > [data-grip="right"]`).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, [planeOf(view.id), box0]);
    await page.mouse.move(b.x + b.width - 1, g.y); await page.mouse.move(g.x, g.y, { steps: 3 }); await frame(page);
    await page.mouse.down();
    const at = { ...g };
    for (let m = 0; m < 6; m++) { at.x += m ? 14 : 6; at.y += m ? 9 : 3; (m ? line.following : line.starting).add(await time(() => page.mouse.move(at.x, at.y))); }
    await page.mouse.up(); await frame(page);
  }
}
const pressed = await page.evaluate(([plane]) => JSON.parse(document.querySelector(plane).getAttribute('data-probe') ?? 'null')?.moves ?? null, [planeOf(view.id)]);
const med = (m) => (m.samples.length ? m.median.toFixed(1) : '-');
console.log(JSON.stringify({ dist: path.basename(dist), elements, zoom, ...counts, panStarting: med(pan.starting), panFollowing: med(pan.following), dragStarting: med(drag.starting), dragFollowing: med(drag.following), lineStarting: med(line.starting), lineFollowing: med(line.following), lineMovesHeard: pressed, hoverMove: med(hover), hoverScript: (hover.samples.map((x) => x.script).sort((a, b) => a - b)[hover.samples.length >> 1]).toFixed(1), hoverFrame: (hover.samples.map((x) => x.frame).sort((a, b) => a - b)[hover.samples.length >> 1]).toFixed(1), samples: { pan: pan.following.samples.length, drag: drag.following.samples.length, hover: hover.samples.length }, problems }));
await context.close();
await browser.close();
