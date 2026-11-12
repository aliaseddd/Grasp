// Baseline: runs the probe's automatic checks and the OpenSysML page under Playwright's Chromium from file://.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const logs = [];
  page.on('console', m => { if (m.type() === 'error') logs.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => logs.push('pageerror: ' + e.message.slice(0, 200)));
  await page.goto('file://' + path.resolve(__dirname, 'index.html'));
  await page.click('#run');
  await page.waitForFunction(() => window.REPORT.checks['automatic checks'], null, { timeout: 180000 });
  await page.click('#copy');
  console.log(await page.inputValue('#report'));
  const p2 = await browser.newPage();
  p2.on('pageerror', e => logs.push('pageerror2: ' + e.message.slice(0, 200)));
  await p2.goto('file://' + path.resolve(__dirname, 'opensysml', 'index.html'));
  await p2.waitForFunction(() => window.__report, null, { timeout: 180000 });
  console.log('\n' + await p2.inputValue('#report'));
  console.log('\n--- console errors ---\n' + (logs.join('\n') || '(none)'));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
