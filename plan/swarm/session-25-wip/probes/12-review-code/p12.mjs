import fs from 'node:fs';
import { launch, openPage, openStateFile, stateFileOf, showSide, fieldIn, byTestId, V, frame } from './h.mjs';
const file = process.argv[2]; const shown = process.argv[3] === 'shown';
const b = await launch();
const o = await openPage(b, { picker: false });
const { page } = o;
await openStateFile(page, stateFileOf('scale.json', JSON.parse(fs.readFileSync(file, 'utf8'))));
await page.waitForTimeout(1500);
await showSide(page, 'Validation');
await page.waitForSelector(`${V} section[data-list]`, { timeout: 60000 });
const entries = page.locator(`${V} [role="button"][data-entry]`);
await page.evaluate(() => { window.__ev = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (['input','click','keydown'].includes(e.name)) window.__ev.push([e.name, Math.round(e.duration), Math.round(e.processingEnd - e.processingStart)]); }).observe({ type: 'event', durationThreshold: 16 }); });
const take = async (what) => { await frame(page); await frame(page); await page.waitForTimeout(200); const ev = await page.evaluate(() => { const x = window.__ev; window.__ev = []; return x; }); console.log(what, JSON.stringify(ev)); };
for (let round = 0; round < 3; round++) {
  await showSide(page, 'Validation');
  await entries.nth(10 + round * 30).click(); await take('click entry');
  if (!shown) await showSide(page, 'Explorer');
  const f = fieldIn(page, 'name');
  await f.click(); await page.keyboard.press('End'); await take('focus');
  for (const ch of 'ab') { await page.keyboard.type(ch); await take('key ' + ch); }
  await page.locator(byTestId('top-bar')).click({ position: { x: 600, y: 20 } });
  await page.waitForTimeout(1000);
}
await b.close();
