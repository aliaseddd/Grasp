const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 820 }, deviceScaleFactor: 2 });
  const logs = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => logs.push('pageerror: ' + e.message));
  const t0 = Date.now();
  await page.goto('file://' + path.resolve(__dirname, 'dist', 'index.html'));
  await page.waitForFunction(() => window.__dockReady && window.__layoutDone, null, { timeout: 15000 });
  await page.waitForTimeout(500);
  console.log('ready in ms:', Date.now() - t0);
  await page.screenshot({ path: path.resolve(__dirname, 'dist', 'shot1.png') });
  await page.getByText('hosts : Host[1..*]').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.resolve(__dirname, 'dist', 'shot2.png') });
  // drag the separator between explorer and the editor to the right by 120px
  const seps = await page.locator('.dv-sash').all();
  console.log('sashes:', seps.length);
  if (seps.length) { const b = await seps[0].boundingBox(); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.mouse.move(b.x + 120, b.y + b.height / 2, { steps: 8 }); await page.mouse.up(); }
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.resolve(__dirname, 'dist', 'shot3.png') });
  console.log('--- console errors/warnings ---');
  for (const l of logs) console.log(l);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
