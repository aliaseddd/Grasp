// The proof step 8 asks for: where the plane's commit (the DOM change of the dragged node, or of the viewport) falls
// against the pointermove and the animation callbacks of the frame that handles it. On the page as built.
import path from 'node:path';
const REPO = '/home/user/Grasp';
const H = await import(path.join(REPO, 'canvas/app/test/helpers.mjs'));
const { VIEWS, middleService, scaleState } = await import(path.join(REPO, 'canvas/test/scale-model.mjs'));
const { boxOf, launch, nodeOf, openPage, openStateFile, planeOf, soon, stateFileOf, untilDrawn, frame, NODE, EDGE } = H;
const STATE = scaleState(5000); const view = STATE.model.views.find((v) => v.id === VIEWS.definitions); const id = middleService(5000);
const browser = await launch();
const { page, context } = await openPage(browser, { picker: false });
await openStateFile(page, stateFileOf('scale-5000.json', STATE));
await untilDrawn(page, view);
const watch = (sel, label) => page.evaluate(([sel, label]) => {
  const log = (window.__log ??= []);
  if (!window.__ev) { window.__ev = true;
    for (const type of ['pointermove', 'pointerdown', 'pointerup']) addEventListener(type, () => { log.push([type, performance.now()]); if (type === 'pointermove') requestAnimationFrame(() => log.push(['raf', performance.now()])); }, true);
  }
  const el = document.querySelector(sel);
  new MutationObserver((list) => { for (const m of list) log.push([`${label}:${m.attributeName}`, performance.now()]); }).observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
}, [sel, label]);
const classify = async (what) => {
  const log = await page.evaluate(() => { const l = [...window.__log]; window.__log.length = 0; return l; });
  const out = {};
  let last = null; // the last of pointermove / raf / pointerdown / pointerup
  for (const [type] of log) {
    if (['pointermove', 'raf', 'pointerdown', 'pointerup'].includes(type)) { last = type; continue; }
    const key = `${type} after ${last}`; out[key] = (out[key] || 0) + 1;
  }
  console.log(what, JSON.stringify(out));
};
// A pan of the fitted view.
await watch(`${planeOf(view.id)} .react-flow__viewport`, 'viewport');
const ground = await H.groundPoint(page, view);
const drag = async (from, n, way = 1) => { await page.mouse.move(from.x, from.y); await page.mouse.down(); for (let i = 1; i <= n; i++) { await page.mouse.move(from.x + way * 12 * i, from.y + way * 6 * i); await frame(page); await frame(page); } await page.mouse.up(); await frame(page); await frame(page); };
await page.evaluate(() => { window.__log.length = 0; });
for (let r = 0; r < 4; r++) await drag(ground, 5, r % 2 ? -1 : 1);
await classify('pan, 3 pans of 5 moves:');
// A drag at 100%.
let box = await boxOf(page, view.id, id);
await page.keyboard.down('Control');
for (let t = 0; t < 8 && Math.abs(box.zoom - 1) > 0.01; t++) { const was = box; await page.mouse.move(was.x + was.width / 2, was.y + was.height / 2); await page.mouse.wheel(0, Math.max(-1500, Math.min(1500, Math.log2(was.zoom) / 0.002)));
  box = await soon(page, async () => { const now = await boxOf(page, view.id, id); return now && Math.abs(now.zoom - was.zoom) > 1e-9 ? now : null; }, 'zoom'); }
await page.keyboard.up('Control');
await watch(nodeOf(view.id, id), 'node');
await page.evaluate(() => { window.__log.length = 0; });
for (let r = 0; r < 3; r++) { const b = await boxOf(page, view.id, id); await drag({ x: b.x + 24, y: b.y + 14 }, 5, r % 2 ? -1 : 1); }
await classify('drag, 3 drags of 5 moves:');
await context.close(); await browser.close();
