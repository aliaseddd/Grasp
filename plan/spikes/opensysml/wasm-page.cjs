const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const logs = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text().slice(0, 300)); });
  page.on('pageerror', e => logs.push('pageerror: ' + e.message.slice(0, 300)));
  const t0 = Date.now();
  await page.goto('file://' + path.resolve(__dirname, 'dist', 'index.html'));
  const tLoad = Date.now() - t0;
  await page.waitForFunction(() => window.__result, null, { timeout: 180000 });
  const r = await page.evaluate(() => window.__result);
  console.log('page load (scripts parsed) ms:', tLoad, '; wall to result ms:', Date.now() - t0);
  console.log(JSON.stringify(r, null, 1));
  console.log('--- console ---'); for (const l of logs) console.log(l);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
