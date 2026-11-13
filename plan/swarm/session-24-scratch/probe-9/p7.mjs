import path from 'node:path';
const H = await import('./wt/canvas/app/test/helpers.mjs');
const { launch, openIn, stateFileAt, EXAMPLE, modelOf, showView, boxOf, headerOf, planeOf, FIXTURES, frame, viewTab, rowIn, rowItemIn, rowOf } = H;
const browser = await launch();
const out = (label, v) => console.log(label, JSON.stringify(v));
const sel = (page) => page.evaluate(() => ({ items: window.Grasp.selection.items.map((i) => i.type + ':' + i.id), view: window.Grasp.selection.view }));
const focus = (page) => page.evaluate(() => { const a = document.activeElement; return a ? a.tagName + ':' + (a.getAttribute('role') ?? '') + ':' + (a.querySelector(':scope > [data-row]')?.getAttribute('data-row') ?? a.className?.toString().slice(0, 30)) : null; });
const rowsNow = (page) => page.evaluate(() => [...document.querySelectorAll('[data-testid="explorer"] [data-row]')].map((el) => {
  const li = el.closest('[role="treeitem"]');
  return [el.getAttribute('data-row'), el.textContent, li.getAttribute('aria-checked'), li.getAttribute('aria-expanded'), el.hasAttribute('data-selected'), Math.round(el.getBoundingClientRect().height), Math.round(el.getBoundingClientRect().x), li.getAttribute('tabindex')];
}));
try {
  const IC = path.join(FIXTURES, 'interconnection.json');
  const opened = await openIn(browser, stateFileAt(IC));
  const { page } = opened;
  const model = modelOf(IC);
  const [one, two] = model.views;
  await showView(page, one);
  out('rows', (await rowsNow(page)).slice(0, 8));
  await page.screenshot({ path: 'explorer-ic.png' });
  // view row click while tab exists but not in front
  await rowIn(page, 'view', two.id).click(); await frame(page); await frame(page);
  out('click view row two (tab exists)', [await sel(page), await page.getByRole('tab').evaluateAll((t) => t.map((e) => e.textContent + ':' + e.getAttribute('aria-selected'))), await focus(page)]);
  await page.keyboard.press('ArrowUp'); await frame(page);
  out('arrow up', await focus(page));
  await page.keyboard.press('Enter'); await frame(page); await frame(page);
  out('enter on view row one', [await sel(page), await page.getByRole('tab').evaluateAll((t) => t.map((e) => e.textContent + ':' + e.getAttribute('aria-selected'))), await focus(page)]);
  await page.keyboard.press('Space'); await frame(page);
  out('space on view row one', [await sel(page), await focus(page)]);
  // ctrl click on a view row
  await page.keyboard.down('Control'); await rowIn(page, 'view', two.id).click(); await page.keyboard.up('Control'); await frame(page); await frame(page);
  out('ctrl click view row two', [await sel(page), await page.getByRole('tab').evaluateAll((t) => t.map((e) => e.textContent + ':' + e.getAttribute('aria-selected')))]);
  // keyboard walk
  await rowIn(page, 'el', 'Fuel').click(); await frame(page);
  out('click Fuel', [await sel(page), await focus(page)]);
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await frame(page);
  out('down down', [await sel(page), await focus(page)]);
  await page.keyboard.press('Space'); await frame(page);
  out('space', [await sel(page)]);
  await page.keyboard.press('ArrowLeft'); await frame(page);
  out('left on FuelPort (unfolded)', [await rowItemIn(page, 'el', 'FuelPort').getAttribute('aria-expanded'), await focus(page)]);
  await page.keyboard.press('ArrowRight'); await frame(page);
  out('right', [await rowItemIn(page, 'el', 'FuelPort').getAttribute('aria-expanded')]);
  await page.keyboard.press('Shift+ArrowDown'); await frame(page);
  out('shift down', [await sel(page)]);
  await page.keyboard.press('Control+a'); await frame(page);
  out('ctrl a', [(await sel(page)).items.length]);
  await page.keyboard.press('Control+z'); await frame(page);
  // scroll into view in a short window
  await page.setViewportSize({ width: 1400, height: 500 }); await frame(page); await frame(page);
  await showView(page, one);
  const vis = (type, id) => page.evaluate((s) => { const el = document.querySelector(s); if (!el) return 'no row'; const b = document.querySelector('[data-testid="explorer"]').getBoundingClientRect(); const r = el.getBoundingClientRect(); return r.top >= b.top && r.bottom <= b.bottom; }, rowOf(type, id));
  await rowIn(page, 'el', 'Fuel').click(); await frame(page);
  out('before', [await vis('el', 'System.pump'), await page.evaluate(() => document.querySelector('[data-testid="explorer"]').scrollTop)]);
  const b = await boxOf(page, one.id, 'System.pump'); await page.mouse.click(b.x + 24 * b.zoom, b.y + 14 * b.zoom); await frame(page); await frame(page);
  out('picked System.pump on plane', [await sel(page), await vis('el', 'System.pump'), await page.evaluate(() => document.querySelector('[data-testid="explorer"]').scrollTop)]);
  console.log('problems', opened.problems);
  await opened.context.close();
} finally { await browser.close(); }
