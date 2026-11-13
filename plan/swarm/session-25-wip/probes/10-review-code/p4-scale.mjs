import fs from 'node:fs';
import { VIEWS, middleService, scaleState } from '/home/user/wt/10-review-code/canvas/test/scale-model.mjs';
import {
  launch, openPage, openStateFile, stateFileOf, untilDrawn, viewTab, selectBox, fieldIn, steps, active, tick, log, showSide, pickRow, showTab, timing, DETAILS,
} from './lib.mjs';

const N = 5000;
const STATE = scaleState(N);
const FILE = stateFileOf(`scale-${N}.json`, STATE);
const SERVICE = middleService(N);
const view = STATE.model.views.find((v) => v.id === VIEWS.definitions);
const browser = await launch();
const o = await openPage(browser, { picker: false });
const { page } = o;
await openStateFile(page, FILE);
const tab = await viewTab(page, view);
if ((await tab.getAttribute('aria-selected')) !== 'true') await tab.click();
await untilDrawn(page, view);
await showSide(page, 'Details');
const kinds = {};
for (const e of STATE.model.elements) kinds[e.kind] = (kinds[e.kind] || 0) + 1;
log('kinds', kinds);
// pick the service by its row
await page.evaluate((id) => window.Grasp.selection.set([{ type: 'el', id }]), SERVICE); await tick(page, 3);
log('shown', await page.evaluate((r) => document.querySelector(`${r} .grasp-details`)?.getAttribute('data-picked'), DETAILS));
const fields = await page.evaluate((root) => [...document.querySelectorAll(`${root} .grasp-field`)].map((e) => e.getAttribute('data-field')), DETAILS);
log('fields', fields);
// find a usage with a type picker
const usage = STATE.model.elements.find((e) => e.kind === 'PartUsage');
await page.evaluate((id) => window.Grasp.selection.set([{ type: 'el', id }]), usage.id); await tick(page, 3);
await showTab(page, 'Core');
const t0 = Date.now();
const opened = await page.evaluate(async (root) => {
  const input = document.querySelector(`${root} [data-testid="field-type"]`);
  if (!input) return 'no type field';
  const start = performance.now();
  input.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
  input.focus();
  await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
  return { ms: performance.now() - start, options: document.querySelectorAll('[role="listbox"] [role="option"]').length };
}, DETAILS);
log('open type list', opened, 'wall', Date.now() - t0);
// type a letter to narrow
const t1 = Date.now();
await page.keyboard.type('S');
await tick(page, 2);
log('narrow', Date.now() - t1, await page.evaluate(() => document.querySelectorAll('[role="listbox"] [role="option"]').length));
await page.keyboard.press('Escape');
await page.keyboard.press('Escape');
// keystrokes with a CPU profile
await page.evaluate((id) => window.Grasp.selection.set([{ type: 'el', id }]), SERVICE); await tick(page, 3);
const name = fieldIn(page, 'name');
await name.click();
await page.keyboard.press('End');
const time = await timing(page, 'keydown', 'input');
const cdp = await page.context().newCDPSession(page);
await cdp.send('Profiler.enable');
await cdp.send('Profiler.setSamplingInterval', { interval: 100 });
await cdp.send('Profiler.start');
const samples = [];
for (const c of 'abcdef') samples.push(await time(() => page.keyboard.press(c)));
const { profile } = await cdp.send('Profiler.stop');
log('samples', samples.map((s) => s.total.toFixed(1)).join(', '));
// self time by function
const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const self = new Map();
const dt = profile.timeDeltas;
profile.samples.forEach((id, i) => { const n = byId.get(id); const k = `${n.callFrame.functionName || '(anon)'} ${n.callFrame.url.split('/').pop()}:${n.callFrame.lineNumber}`; self.set(k, (self.get(k) || 0) + (dt[i] || 0) / 1000); });
log([...self.entries()].filter(([k]) => !k.startsWith('(idle)') && !k.startsWith('(program)')).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => `${v.toFixed(1)}ms ${k}`).join('\n'));
fs.writeFileSync('/home/user/probes/10-review-code/keys.cpuprofile', JSON.stringify(profile));
log('problems', o.problems.slice(0, 5));
await browser.close();
