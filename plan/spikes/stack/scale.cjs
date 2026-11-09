const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  for (const n of [1000, 5000]) {
    const page = await browser.newPage({ viewport: { width: 1400, height: 820 } });
    const errs = []; page.on('pageerror', e => errs.push(e.message.slice(0, 200)));
    const t0 = Date.now();
    await page.goto('file://' + path.resolve(__dirname, 'dist', 'scale.html') + '?n=' + n);
    await page.waitForFunction(() => window.__inited, null, { timeout: 120000 });
    await page.waitForTimeout(500);
    const first = await page.evaluate(() => window.__inited - window.__start);
    const drawn = await page.locator('.react-flow__node').count();
    // zoom in to a corner so a normal working zoom is measured, then drag a node and pan
    await page.mouse.move(700, 400); await page.keyboard.down('Control'); for (let i = 0; i < 12; i++) await page.mouse.wheel(0, -200); await page.keyboard.up('Control');
    await page.waitForTimeout(300);
    const drawnZoomed = await page.locator('.react-flow__node').count();
    const node = page.locator('.react-flow__node').first(); const b = await node.boundingBox();
    const frames = await page.evaluate(() => new Promise(res => { let c = 0; const t = performance.now(); const f = () => { c++; if (performance.now() - t < 1000) requestAnimationFrame(f); else res(c); }; requestAnimationFrame(f); }));
    const td = Date.now();
    if (b) { await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); for (let i = 1; i <= 20; i++) await page.mouse.move(b.x + b.width / 2 + i * 10, b.y + b.height / 2 + i * 5); await page.mouse.up(); }
    const dragMs = Date.now() - td;
    const tp = Date.now();
    await page.mouse.move(900, 600); await page.mouse.down(); for (let i = 1; i <= 20; i++) await page.mouse.move(900 - i * 15, 600 - i * 10); await page.mouse.up();
    const panMs = Date.now() - tp;
    console.log(JSON.stringify({ n, firstRenderMs: Math.round(first), nodesDrawnAtFit: drawn, nodesDrawnZoomed: drawnZoomed, idleFps: frames, dragOf20MovesMs: dragMs, panOf20MovesMs: panMs, wallMs: Date.now() - t0, errors: errs }));
    await page.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
