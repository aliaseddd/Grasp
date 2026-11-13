import fs from 'node:fs';
import { launch, openPage, openStateFile, stateFileOf, showSide, fieldIn, byTestId, V, frame } from './h.mjs';
const file = process.argv[2];
const b = await launch();
const o = await openPage(b, { picker: false });
const { page } = o;
await openStateFile(page, stateFileOf('scale.json', JSON.parse(fs.readFileSync(file, 'utf8'))));
await page.waitForTimeout(1500);
await page.evaluate(() => { window.__ev = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__ev.push([e.name, Math.round(e.duration), Math.round(e.processingEnd - e.processingStart)]); }).observe({ type: 'event', durationThreshold: 16 }); });
const take = async (what) => { await frame(page); await frame(page); await page.waitForTimeout(200); const ev = await page.evaluate(() => { const x = window.__ev; window.__ev = []; return x; }); console.log(what, JSON.stringify(ev)); };
let t = Date.now();
await showSide(page, 'Validation');
await page.waitForSelector(`${V} section[data-list]`, { timeout: 60000 });
await take('show Validation (' + (Date.now() - t) + ' ms wall)');
const n = await page.locator(`${V} [data-entry]`).count();
console.log('entries', n);
const entries = page.locator(`${V} [role="button"][data-entry]`);
for (const i of [3, 40, 90]) { await entries.nth(i).click(); await take('click entry ' + i); }
const f = fieldIn(page, 'name');
await f.click(); await page.keyboard.press('End');
await take('focus name');
for (const ch of 'xyz') { await page.keyboard.type(ch); await take('key ' + ch); }
await page.waitForTimeout(1200); await take('after pause (check)');
await page.locator(byTestId('undo')).click(); await take('Undo click');
// hidden: Explorer in front
await showSide(page, 'Explorer');
await take('show Explorer');
await showSide(page, 'Validation'); await take('show Validation again');
console.log('problems', o.problems.slice(0, 3));
await b.close();
