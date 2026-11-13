import path from 'node:path';
const H = await import('./wt/canvas/app/test/helpers.mjs');
const { launch, openPage, openStateFile, stateFileAt, FIXTURES, frame, EXAMPLE } = H;
const browser = await launch();
const w = (page) => page.evaluate(() => { const e = document.querySelector('[data-testid="explorer"]'); const b = e.getBoundingClientRect(); return [Math.round(b.left), b.right, document.querySelectorAll('[data-testid="explorer"] [data-row]').length, localStorage.getItem('grasp-app:layout:1')]; });
try {
  for (const f of [EXAMPLE, path.join(FIXTURES, 'browser.json'), path.join(FIXTURES, 'interconnection.json')]) {
    const o = await openPage(browser, { picker: false });
    console.log(path.basename(f), 'before', await w(o.page));
    await openStateFile(o.page, stateFileAt(f));
    console.log(' just after', await w(o.page));
    for (let i = 0; i < 5; i++) await frame(o.page);
    console.log(' after frames', await w(o.page));
    await o.context.close();
  }
} finally { await browser.close(); }
