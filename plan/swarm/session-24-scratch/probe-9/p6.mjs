const H = await import('./wt/canvas/app/test/helpers.mjs');
const { launch, openPage, openStateFile, stateFileOf, stateFileAt, EXAMPLE, frame, sinceGiven, soon } = H;
const { scaleState } = await import('./wt/canvas/test/scale-model.mjs');
const browser = await launch();
try {
  for (const [name, file, want] of [['example', stateFileAt(EXAMPLE), 25], ['500', stateFileOf('s500.json', scaleState(500)), 791], ['520', stateFileOf('s520.json', scaleState(520)), 202], ['5000', stateFileOf('s5000.json', scaleState(5000)), 202]]) {
    const times = [];
    for (let i = 0; i < 3; i++) {
      const o = await openPage(browser, { picker: false });
      await o.page.evaluate((want) => {
        const seen = () => document.querySelectorAll('[data-testid="explorer"] [data-row]').length >= want && document.querySelectorAll('.react-flow__node').length > 0;
        const obs = new MutationObserver(() => { if (seen()) { obs.disconnect(); requestAnimationFrame(() => { const c = new MessageChannel(); c.port1.onmessage = () => { window.__drawn = performance.now(); }; c.port2.postMessage(null); }); } });
        obs.observe(document.body, { childList: true, subtree: true });
      }, want);
      await openStateFile(o.page, file);
      await soon(o.page, () => o.page.evaluate(() => window.__drawn), 'not drawn');
      times.push(await o.page.evaluate(() => window.__drawn - performance.getEntriesByName('grasp-test:given').pop().startTime));
      await o.context.close();
    }
    console.log(name, 'given → painted with rows and nodes, ms:', times.map((t) => t.toFixed(0)).join(', '));
  }
} finally { await browser.close(); }
