const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const logs = [];
  page.on('console', m => logs.push(m.type() + ': ' + m.text()));
  page.on('pageerror', e => logs.push('pageerror: ' + e.message));
  const file = 'file://' + path.resolve(__dirname, 'index.html');
  await page.goto(file);
  await page.waitForTimeout(3000);
  const results = await page.evaluate(() => {
    const R = window.results;
    R.moduleScript = window.MODULE_LOADED === true;
    R.cssLoaded = getComputedStyle(document.body).color;
    R.userAgent = navigator.userAgent;
    return R;
  });
  console.log(JSON.stringify(results, null, 2));
  console.log('--- console/page errors ---');
  for (const l of logs) console.log(l);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
