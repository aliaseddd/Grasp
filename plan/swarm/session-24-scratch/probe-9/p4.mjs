const H = await import('./wt/canvas/app/test/helpers.mjs');
const { launch, openIn, stateFileOf, frame } = H;
const { scaleState } = await import('./wt/canvas/test/scale-model.mjs');
const browser = await launch();
try {
  for (const n of [5000, 500, 200]) {
    const o = await openIn(browser, stateFileOf(`scale-${n}.json`, scaleState(n)));
    const { page } = o;
    await frame(page); await frame(page);
    const rows = () => page.evaluate(() => document.querySelectorAll('[data-testid="explorer"] [data-row]').length);
    console.log(n, 'rows', await rows());
    if (n === 5000) {
      for (let i = 0; i < 3; i++) {
        const t = await page.evaluate(async () => { const el = document.querySelector('[data-row="more:package:"]'); const t0 = performance.now(); el.click(); for (let i = 0; i < 5; i++) await Promise.resolve(); const t1 = performance.now(); return t1 - t0; });
        console.log('show more: sync script ms', t.toFixed(1), 'rows', await rows());
      }
      // fold package and unfold: remount all rows
      for (let i = 0; i < 2; i++) {
        const t = await page.evaluate(async () => { const el = document.querySelector('[data-row="package:"] .grasp-row-icon'); const t0 = performance.now(); el.click(); for (let i = 0; i < 5; i++) await Promise.resolve(); const t1 = performance.now(); el.click(); for (let i = 0; i < 5; i++) await Promise.resolve(); const t2 = performance.now(); return [t1 - t0, t2 - t1]; });
        console.log('fold, unfold package (', await rows(), 'rows ): ms', t.map((x) => x.toFixed(1)).join(', '));
      }
      // selection change cost with the tree mounted
      const t = await page.evaluate(async () => { const s = window.Grasp.selection; const out = []; for (const id of ['Service', 'Service1', 'Service2', 'Service3', 'Service4', 'Service5']) { const t0 = performance.now(); s.set([{ type: 'el', id }]); for (let i = 0; i < 5; i++) await Promise.resolve(); out.push(performance.now() - t0); } return out; });
      console.log('selection.set sync ms (stores + panels told; React not yet flushed)', t.map((x) => x.toFixed(2)).join(', '));
      const t2 = await page.evaluate(async () => { const s = window.Grasp.selection; const out = []; for (const id of ['Service', 'Service1', 'Service2', 'Service3']) { const t0 = performance.now(); s.set([{ type: 'el', id }]); await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0))); out.push(performance.now() - t0); } return out; });
      console.log('selection.set to after the frame ms', t2.map((x) => x.toFixed(1)).join(', '));
    } else {
      const t = await page.evaluate(async () => { const el = document.querySelector('[data-row="package:"] .grasp-row-icon'); const t0 = performance.now(); el.click(); for (let i = 0; i < 5; i++) await Promise.resolve(); const t1 = performance.now(); el.click(); for (let i = 0; i < 5; i++) await Promise.resolve(); const t2 = performance.now(); return [t1 - t0, t2 - t1]; });
      console.log('fold, unfold package (', await rows(), 'rows ): ms', t.map((x) => x.toFixed(1)).join(', '));
    }
    console.log('problems', o.problems);
    await o.context.close();
  }
} finally { await browser.close(); }
