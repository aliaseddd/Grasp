import { VIEWS, middleService, scaleState } from '/home/user/wt/10-review-code/canvas/test/scale-model.mjs';
import { launch, openPage, openStateFile, stateFileOf, untilDrawn, viewTab, fieldIn, tick, log, showSide, timing, EXAMPLE, stateFileAt, modelOf } from './lib.mjs';
const big = process.argv[2] !== 'small';
const browser = await launch();
const o = await openPage(browser, { picker: false });
const { page } = o;
let view, id;
if (big) {
  const STATE = scaleState(5000);
  await openStateFile(page, stateFileOf('scale-5000.json', STATE));
  view = STATE.model.views.find((v) => v.id === VIEWS.definitions); id = middleService(5000);
} else {
  await openStateFile(page, stateFileAt(EXAMPLE)); view = modelOf(EXAMPLE).views[0]; id = 'Host';
}
const tab = await viewTab(page, view);
if ((await tab.getAttribute('aria-selected')) !== 'true') await tab.click();
await untilDrawn(page, view);
await showSide(page, 'Details');
await page.evaluate((i) => window.Grasp.selection.set([{ type: 'el', id: i }]), id); await tick(page, 5);
await fieldIn(page, 'name').click(); await page.keyboard.press('End');
const time = await timing(page, 'keydown', 'input');
for (const c of 'abcdefgh') {
  await page.evaluate(() => {
    const w = (window.__w = { frames: [], tasks: [] });
    addEventListener('keydown', () => { w.t0 = performance.now(); }, { capture: true, once: true });
    const obs = new PerformanceObserver((l) => { for (const e of l.getEntries()) w.tasks.push([e.startTime, e.duration]); });
    obs.observe({ type: 'long-animation-frame', buffered: false });
    w.obs = obs;
  });
  const s = await time(() => page.keyboard.press(c));
  await tick(page, 10);
  const loaf = await page.evaluate(() => { const w = window.__w; w.obs.disconnect(); return w.tasks.filter(([st]) => st >= w.t0 - 1).map(([st, d]) => `${(st - w.t0).toFixed(0)}+${d.toFixed(0)}`); });
  log(c, 'sample', s.total.toFixed(1), `(${s.script.toFixed(1)}+${s.frame.toFixed(1)})`, 'LoAFs after keydown (start+dur ms):', loaf.join(' '));
}
await browser.close();
