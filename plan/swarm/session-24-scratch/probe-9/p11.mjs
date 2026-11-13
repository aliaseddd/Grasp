import path from 'node:path';
const H = await import('./wt/canvas/app/test/helpers.mjs');
const { launch, openPage, openStateFile, stateFileAt, FIXTURES, frame, EXAMPLE } = H;
const browser = await launch();
const w = (page) => page.evaluate(() => { const g = window.__dock.getGroup('left'); const e = document.querySelector('[data-testid="explorer"]'); return { width: g.api.width, min: g.minimumWidth, max: g.maximumWidth, el: g.element.getBoundingClientRect().width, style: g.element.parentElement?.style.cssText, root: e.getBoundingClientRect().width, scrollW: e.scrollWidth, treeMin: (() => { const t = e.querySelector('.grasp-explorer'); return t ? [t.scrollWidth, t.offsetWidth] : null; })() }; });
try {
  const o = await openPage(browser, { picker: false });
  await o.page.evaluate(() => { window.__sizes = []; const g = window.__dock.getGroup('left'); g.api.onDidDimensionsChange((e) => window.__sizes.push([e.width, new Error().stack.split('\n').slice(2, 9).map((l) => l.trim().slice(0, 70))])); });
  console.log('before', await w(o.page));
  await openStateFile(o.page, stateFileAt(EXAMPLE));
  for (let i = 0; i < 5; i++) await frame(o.page);
  console.log('after', await w(o.page));
  console.log(JSON.stringify(await o.page.evaluate(() => window.__sizes), null, 1).slice(0, 3000));
  await o.context.close();
} finally { await browser.close(); }
