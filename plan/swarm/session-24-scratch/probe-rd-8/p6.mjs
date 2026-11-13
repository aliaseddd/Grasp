import { createRequire } from 'node:module';
import path from 'node:path';
const W = '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-8';
const OUT = '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/probe-rd-8';
const h = await import(W + '/canvas/app/test/helpers.mjs');
const { scaleState } = await import(W + '/canvas/test/scale-model.mjs');
const { chromium } = createRequire(W + '/canvas/app/test/helpers.mjs')('playwright');
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.addInitScript(() => { delete window.showOpenFilePicker; });
  await page.goto(h.PAGE_URL);
  await page.waitForSelector(h.byTestId(h.TESTIDS.app));
  const state = scaleState(5000);
  await h.collapseSides(page);
  await h.openStateFile(page, h.stateFileOf('scale-5000.json', state));
  await h.untilDrawn(page, state.model.views[0]);
  await page.evaluate(async () => { await document.fonts.ready; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); });
  console.log('tooltips before move', await page.evaluate(() => [...document.querySelectorAll('[role=tooltip]')].map((e) => e.textContent)));
  await page.mouse.move(700, 20);
  await page.screenshot({ path: path.join(OUT, 'scale-probe.png') });
  console.log('tooltips at shot', await page.evaluate(() => [...document.querySelectorAll('[role=tooltip]')].map((e) => e.textContent + ' opacity ' + getComputedStyle(e.firstElementChild || e).opacity)));
  console.log('edges', await page.evaluate(() => document.querySelectorAll('.react-flow__edge').length), 'bg', await page.evaluate(() => document.querySelectorAll('.react-flow__background').length));
} finally { await browser.close(); }
