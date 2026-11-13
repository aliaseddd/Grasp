const H = await import('./wt/canvas/app/test/helpers.mjs');
const { launch, openIn, stateFileOf, frame } = H;
const { scaleState } = await import('./wt/canvas/test/scale-model.mjs');
const browser = await launch();
const setTimes = (page) => page.evaluate(async () => { const s = window.Grasp.selection; const out = []; for (const id of ['Service', 'Service1', 'Service2', 'Service3', 'Service4', 'Service5', 'Service6', 'Service7', 'Service8']) { const t0 = performance.now(); s.set([{ type: 'el', id }]); for (let i = 0; i < 5; i++) await Promise.resolve(); out.push(performance.now() - t0); } out.sort((a, b) => a - b); return out[4]; });
const renameTimes = (page) => page.evaluate(async () => { const s = window.Grasp.session; const el = s.model.elements[0]; const out = []; for (let i = 0; i < 9; i++) { const t0 = performance.now(); s.history.edit(() => { el.name += 'x'; return 'Renamed'; }, 'name:' + el.id); for (let j = 0; j < 5; j++) await Promise.resolve(); out.push(performance.now() - t0); } out.sort((a, b) => a - b); return out[4]; });
try {
  const o = await openIn(browser, stateFileOf(`scale-5000.json`, scaleState(5000)));
  const { page } = o;
  await frame(page); await frame(page);
  const rows = () => page.evaluate(() => document.querySelectorAll('[data-testid="explorer"] [data-row]').length);
  console.log('rows', await rows(), 'selection.set median ms', (await setTimes(page)).toFixed(1), 'rename median ms', (await renameTimes(page)).toFixed(1));
  await page.evaluate(async () => { document.querySelector('[data-row="package:"] .grasp-row-icon').click(); for (let i = 0; i < 5; i++) await Promise.resolve(); });
  console.log('rows', await rows(), 'selection.set median ms', (await setTimes(page)).toFixed(1), 'rename median ms', (await renameTimes(page)).toFixed(1));
  await page.evaluate(async () => { document.querySelector('[data-row="package:"] .grasp-row-icon').click(); for (let i = 0; i < 5; i++) await Promise.resolve(); });
  for (let k = 0; k < 4; k++) await page.evaluate(async () => { document.querySelector('[data-row="more:package:"]').click(); for (let i = 0; i < 5; i++) await Promise.resolve(); });
  console.log('rows', await rows(), 'selection.set median ms', (await setTimes(page)).toFixed(1), 'rename median ms', (await renameTimes(page)).toFixed(1));
  // with the explorer hidden behind Tools
  await page.getByRole('tab', { name: 'Tools', exact: true }).click(); await frame(page);
  console.log('explorer hidden: rows', await rows(), 'selection.set median ms', (await setTimes(page)).toFixed(1), 'rename median ms', (await renameTimes(page)).toFixed(1));
  console.log('problems', o.problems);
  await o.context.close();
} finally { await browser.close(); }
