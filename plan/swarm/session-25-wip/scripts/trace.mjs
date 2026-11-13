// A probe, outside the repository: where a pan step of the fitted `workflows` view spends its time, from a Chromium
// trace. Run from the measure worktree's root: node <this file>. It opens the built page as the tests do.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const helpers = await import(pathToFileURL(path.join(ROOT, 'canvas/app/test/helpers.mjs')).href);
const { scaleState, VIEWS } = await import(pathToFileURL(path.join(ROOT, 'canvas/test/scale-model.mjs')).href);
const { launch, openPage, openStateFile, stateFileOf, viewTab, untilDrawn, planeOf, frame } = helpers;

const STATE = scaleState(5000);
const browser = await launch();
const opened = await openPage(browser, { picker: false });
const { page } = opened;
await openStateFile(page, stateFileOf('scale-5000.json', STATE));
const view = STATE.model.views.find((v) => v.id === VIEWS.workflows);
const tab = await viewTab(page, view);
await tab.click();
await untilDrawn(page, view);
for (let i = 0; i < 10; i++) await frame(page);

// A point of bare ground, as the scale test finds it.
const ground = await page.evaluate(([plane]) => {
  const el = document.querySelector(plane);
  const r = el.getBoundingClientRect();
  for (let y = r.top + 60; y <= r.bottom - 60; y += 20) for (let x = r.left + 80; x <= r.right - 80; x += 20) {
    const hit = document.elementFromPoint(x, y);
    if (hit && el.contains(hit) && !hit.closest('.react-flow__node, .react-flow__edge, .react-flow__panel, button')) return { x, y };
  }
  return null;
}, [planeOf(view.id)]);

const pan = async (moves) => {
  await page.mouse.move(ground.x, ground.y);
  await page.mouse.down();
  let x = ground.x; let y = ground.y;
  for (let m = 0; m < moves; m++) { x += 12; y += 6; await page.mouse.move(x, y); await frame(page); }
  await page.mouse.up();
};
await pan(8); // warm
const traceFile = path.join(path.dirname(new URL(import.meta.url).pathname), 'trace.json');
await browser.startTracing(page, { path: traceFile, categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'v8.execute', 'blink', 'cc'] });
await pan(20);
await browser.stopTracing();
await browser.close();

const events = JSON.parse(fs.readFileSync(traceFile, 'utf8')).traceEvents ?? JSON.parse(fs.readFileSync(traceFile, 'utf8'));
// Main thread of the renderer: the thread named CrRendererMain.
const main = events.find((e) => e.name === 'thread_name' && e.args?.name === 'CrRendererMain');
const onMain = events.filter((e) => e.pid === main.pid && e.tid === main.tid && e.ph === 'X');
const sum = {};
for (const e of onMain) sum[e.name] = (sum[e.name] ?? 0) + (e.dur ?? 0) / 1000;
const steps = 20;
const pick = ['EventDispatch', 'FunctionCall', 'v8.callFunction', 'RunMicrotasks', 'FireAnimationFrame', 'UpdateLayoutTree', 'Layout', 'PrePaint', 'Paint', 'Layerize', 'UpdateLayer', 'CompositeLayers', 'Commit', 'RasterTask', 'HitTest', 'MajorGC', 'MinorGC', 'V8.GC_SCAVENGER', 'ScheduleStyleRecalculation', 'ParseHTML'];
console.log('main-thread totals over 20 pan steps, ms per step:');
for (const name of Object.keys(sum).sort((a, b) => sum[b] - sum[a]).slice(0, 25)) {
  console.log(`  ${name.padEnd(36)} ${(sum[name] / steps).toFixed(2)}${pick.includes(name) ? '' : ''}`);
}
const nodes = await Promise.resolve(view.layout ? Object.keys(view.layout).length : 0);
console.log(`view ${view.name}: ${nodes} placed elements`);
