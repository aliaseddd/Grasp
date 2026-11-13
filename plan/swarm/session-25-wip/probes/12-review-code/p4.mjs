import { launch, openPage, frame, byTestId, stubGitHub, aboutLines, DIST_URL } from './h.mjs';
const b = await launch();
const o = await openPage(b);
const { page, context } = o;
await stubGitHub(context);
await page.evaluate(() => document.fonts.ready); await frame(page);
await page.waitForTimeout(1500);
console.log('before: requests outside', o.requests.filter(u => !u.startsWith(DIST_URL)));
console.log('before: dbs', await page.evaluate(async () => (await indexedDB.databases()).map(d => d.name)), 'ls', await page.evaluate(() => Object.keys(localStorage)));
console.log('before: workers/long tasks?', await page.evaluate(() => performance.getEntriesByType('resource').map(e => e.name.split('/').pop())));
// long task observer
await page.evaluate(() => { window.__lt = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ entryTypes: ['longtask'] }); });
await page.locator(byTestId('about')).click();
const t0 = await page.evaluate(() => performance.now());
await page.waitForSelector('[data-testid="about-panel"]');
await page.waitForFunction(() => [...document.querySelectorAll('[data-line]')].every(e => e.dataset.state !== 'pending'), null, { timeout: 15000 });
console.log(JSON.stringify(await aboutLines(page), null, 0));
await page.waitForTimeout(300);
console.log('opened at', Math.round(t0), 'long tasks', JSON.stringify(await page.evaluate(() => window.__lt)));
console.log('after: dbs', await page.evaluate(async () => (await indexedDB.databases()).map(d => d.name)), 'ls', await page.evaluate(() => Object.keys(localStorage)));
await page.screenshot({ path: 'about1400.png' });
const sizes = await page.evaluate(() => { const p = document.querySelector('[data-testid="about-panel"]'); const c = p.querySelector('.MuiDialogContent-root'); return { paper: p.getBoundingClientRect().toJSON(), content: [c.clientHeight, c.scrollHeight, c.clientWidth, c.scrollWidth] }; });
console.log('1400', JSON.stringify(sizes));
await page.setViewportSize({ width: 800, height: 600 });
await frame(page); await frame(page);
await page.screenshot({ path: 'about800.png' });
const sizes2 = await page.evaluate(() => { const p = document.querySelector('[data-testid="about-panel"]'); const c = p.querySelector('.MuiDialogContent-root'); const over = [...p.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible').map(e => e.className.toString().slice(0, 50)); return { paper: p.getBoundingClientRect().toJSON(), content: [c.clientHeight, c.scrollHeight, c.clientWidth, c.scrollWidth], over }; });
console.log('800', JSON.stringify(sizes2));
// Tab through
const order = [];
for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); order.push(await page.evaluate(() => { const a = document.activeElement; return (a.textContent || a.getAttribute('aria-label') || a.tagName).slice(0, 30) + (a.closest('[data-testid="about-panel"]') ? '' : ' [OUTSIDE]'); })); }
console.log('tab order', order);
console.log('problems', o.problems);
await b.close();
