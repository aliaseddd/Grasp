import path from 'node:path';
const H = await import('./wt/canvas/app/test/helpers.mjs');
const { launch, openIn, stateFileAt, stateFileOf, EXAMPLE, modelOf, showView, boxOf, headerOf, groundPoint, planeOf, FIXTURES, soon, frame, viewTab, openStateFile, rowIn, rowItemIn, rowOf } = H;
const { scaleState } = await import('./wt/canvas/test/scale-model.mjs');
const browser = await launch();
const out = (label, v) => console.log(label, JSON.stringify(v));
const sel = (page) => page.evaluate(() => ({ items: window.Grasp.selection.items.map((i) => i.type + ':' + i.id), view: window.Grasp.selection.view }));
const rowsNow = (page) => page.evaluate(() => [...document.querySelectorAll('[data-testid="explorer"] [data-row]')].map((el) => {
  const li = el.closest('[role="treeitem"]');
  return [el.getAttribute('data-row'), el.textContent, li.getAttribute('aria-checked'), li.getAttribute('aria-selected'), li.getAttribute('aria-expanded'), el.hasAttribute('data-selected'), Math.round(el.getBoundingClientRect().height)];
}));
try {
  const opened = await openIn(browser, stateFileAt(EXAMPLE));
  const { page } = opened;
  await page.evaluate(() => { window.__hits = []; window.__fronts = []; });
  const model = modelOf(EXAMPLE);
  const view = model.views[0];
  await showView(page, view, 6);
  out('rows', await rowsNow(page));
  out('tree', await page.evaluate(() => { const t = document.querySelector('[data-testid="explorer"] [role="tree"]'); return t ? [t.tagName, t.getAttribute('aria-multiselectable'), t.getAttribute('aria-label')] : null; }));
  // click row Host
  await rowIn(page, 'el', 'Host').click(); await frame(page);
  out('click row Host', [await sel(page), (await rowsNow(page)).filter((r) => r[2] !== 'false'), (await boxOf(page, view.id, 'Host')).selected]);
  await page.keyboard.down('Control'); await rowIn(page, 'el', 'App').click(); await page.keyboard.up('Control'); await frame(page);
  out('ctrl click row App', [await sel(page), (await rowsNow(page)).filter((r) => r[2] !== 'false').map((r) => [r[0], r[2], r[5]])]);
  await page.keyboard.down('Control'); await rowIn(page, 'el', 'Host').click(); await page.keyboard.up('Control'); await frame(page);
  out('ctrl click row Host again', [await sel(page)]);
  await page.keyboard.down('Shift'); await rowIn(page, 'el', 'DevHost').click(); await page.keyboard.up('Shift'); await frame(page);
  out('shift click row DevHost', [await sel(page)]);
  await rowIn(page, 'package').click(); await frame(page);
  out('click package row', [await sel(page), await page.evaluate(() => document.activeElement?.getAttribute('role') + ':' + document.activeElement?.id)]);
  await rowIn(page, 'rel', 'mount').click(); await frame(page);
  out('click row mount', [await sel(page), await page.evaluate((plane) => [...document.querySelectorAll(`${plane} .react-flow__edge.selected`)].map((e) => e.getAttribute('data-id')), planeOf(view.id))]);
  // pick on plane → row
  const p = headerOf(await boxOf(page, view.id, 'Host')); await page.mouse.click(p.x, p.y); await frame(page);
  out('click box Host', [(await rowsNow(page)).filter((r) => r[2] !== 'false').map((r) => [r[0], r[2], r[5]])]);
  // fold via icon
  const icon = rowIn(page, 'el', 'Page').locator('.MuiTreeItem-iconContainer');
  await icon.click(); await frame(page);
  out('fold Page', [(await rowsNow(page)).length, await sel(page), await rowItemIn(page, 'el', 'Page').getAttribute('aria-expanded')]);
  // pick Page.hosts on the plane: its row is folded away
  const q = headerOf(await boxOf(page, view.id, 'Page.hosts')); await page.mouse.click(q.x, q.y); await frame(page);
  out('click box Page.hosts while folded', [await sel(page), (await rowsNow(page)).filter((r) => r[2] !== 'false').map((r) => [r[0], r[2], r[5]])]);
  await icon.click(); await frame(page);
  out('unfold Page', [(await rowsNow(page)).filter((r) => r[2] !== 'false').map((r) => [r[0], r[2], r[5]])]);
  // click on the words of a row with rows inside: does it fold?
  await rowIn(page, 'el', 'Page').click(); await frame(page);
  out('click row Page', [await sel(page), await rowItemIn(page, 'el', 'Page').getAttribute('aria-expanded')]);
  // view row: close tab then click
  const tab = await viewTab(page, view); await tab.hover(); await tab.locator('.dv-default-tab-action').click(); await frame(page); await frame(page);
  out('tab closed', [await sel(page), await page.getByRole('tab').evaluateAll((t) => t.map((e) => e.textContent))]);
  await rowIn(page, 'view', view.id).click(); await frame(page); await frame(page);
  out('click view row', [await sel(page), await page.getByRole('tab').evaluateAll((t) => t.map((e) => e.textContent + ':' + e.getAttribute('aria-selected'))), await page.evaluate(() => { const a = document.activeElement; return a ? a.tagName + ':' + (a.getAttribute('role') ?? '') + ':' + (a.className || '').toString().slice(0, 40) : null; })]);
  await page.keyboard.press('ArrowDown'); await frame(page);
  out('arrow down after view click', await page.evaluate(() => { const a = document.activeElement; return a ? a.tagName + ':' + (a.getAttribute('role') ?? '') + ':' + (a.querySelector('[data-row]')?.getAttribute('data-row') ?? '') : null; }));
  await page.keyboard.press('Space'); await frame(page);
  out('space', await sel(page));
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await frame(page);
  out('down, enter (on Host, has rows inside)', [await sel(page), await rowItemIn(page, 'el', 'Host').getAttribute('aria-expanded')]);
  // rename through the session → row words
  await page.evaluate(() => { const s = window.Grasp.session; s.history.edit(() => { s.model.elements.find((e) => e.id === 'Host').name = 'Hostess'; return 'Renamed'; }, null); }); await frame(page);
  out('renamed Host', (await rowsNow(page)).filter((r) => /Host/.test(r[1])).map((r) => r[1]));
  await page.evaluate(() => { const s = window.Grasp.session; s.history.edit(() => { s.model.package.name = 'Proof2'; return 'Renamed'; }, null); }); await frame(page);
  out('renamed package', (await rowsNow(page))[0]);
  await page.evaluate(() => { const s = window.Grasp.session; s.history.edit(() => { s.model.views[0].name = 'structure'; return 'Renamed'; }, null); }); await frame(page);
  out('renamed view', (await rowsNow(page))[1]);
  // structural: remove DevHost while picked
  await rowIn(page, 'el', 'DevHost').click(); await frame(page);
  await page.evaluate(() => { const s = window.Grasp.session; s.history.edit(() => { const m = s.model; m.relationships.splice(m.relationships.findIndex((r) => r.id === 's-DevHost'), 1); m.elements.splice(m.elements.findIndex((e) => e.id === 'DevHost'), 1); delete m.views[0].layout.DevHost; return 'Removed'; }, null); }); await frame(page);
  out('removed DevHost', [await sel(page), (await rowsNow(page)).length, await rowItemIn(page, 'el', 'Page').getAttribute('aria-expanded')]);
  await H.undo(page);
  out('undone', [await sel(page), (await rowsNow(page)).length]);
  console.log('problems', opened.problems);
  await opened.context.close();

  // interconnection: scroll into view
  const IC = path.join(FIXTURES, 'interconnection.json');
  const o2 = await openIn(browser, stateFileAt(IC));
  const m2 = modelOf(IC); const v2 = m2.views[0];
  await showView(o2.page, v2);
  const body = await o2.page.evaluate(() => { const b = document.querySelector('[data-testid="explorer"]'); return [b.scrollHeight, b.clientHeight, b.scrollTop]; });
  out('ic explorer scroll', body);
  const lastRow = (await rowsNow(o2.page)).at(-1);
  out('last row', lastRow);
  const vis = (id) => o2.page.evaluate((sel) => { const el = document.querySelector(sel); const b = document.querySelector('[data-testid="explorer"]').getBoundingClientRect(); const r = el.getBoundingClientRect(); return r.top >= b.top && r.bottom <= b.bottom; }, rowOf('el', id));
  out('System.pump.ctrl row visible before', await vis('System.pump.ctrl'));
  const b2 = await boxOf(o2.page, v2.id, 'System.pump'); await o2.page.mouse.click(b2.x + 24 * b2.zoom, b2.y + 14 * b2.zoom); await frame(o2.page);
  out('picked System.pump', [await sel(o2.page), await vis('System.pump'), await o2.page.evaluate(() => document.querySelector('[data-testid="explorer"]').scrollTop)]);
  console.log('problems', o2.problems);
  await o2.context.close();

  // scale
  const t0 = Date.now();
  const o3 = await openIn(browser, stateFileOf('scale-5000.json', scaleState(5000)));
  out('scale opened', [await H.sinceGiven(o3.page), (await rowsNow(o3.page)).length, (await rowsNow(o3.page)).slice(0, 5).map((r) => [r[0], r[1], r[4]]), (await rowsNow(o3.page)).at(-1)]);
  let t = await o3.page.evaluate(async () => { const el = document.querySelector('[data-row="more:package:"]'); const t0 = performance.now(); el.click(); await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0))); return performance.now() - t0; });
  out('show more ms', [t, (await rowsNow(o3.page)).length, (await rowsNow(o3.page)).at(-1)]);
  t = await o3.page.evaluate(async () => { const s = window.Grasp.session; const el = s.model.elements[0]; const times = []; for (let i = 0; i < 5; i++) { const t0 = performance.now(); s.history.edit(() => { el.name += 'x'; return 'Renamed'; }, 'name:' + el.id); await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0))); times.push(performance.now() - t0); } return times; });
  out('rename ms (edit to after frame, all listeners)', t);
  t = await o3.page.evaluate(async () => { const el = document.querySelector('[data-row^="el:Handle"] .MuiTreeItem-iconContainer') ?? document.querySelector('[role=treeitem][aria-expanded=false] .MuiTreeItem-iconContainer'); const t0 = performance.now(); el.click(); await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0))); return performance.now() - t0; });
  out('unfold one ms', [t, (await rowsNow(o3.page)).length]);
  console.log('problems', o3.problems);
  await o3.context.close();

  // 500 elements: everything unfolded
  const o4 = await openIn(browser, stateFileOf('scale-500.json', scaleState(500)));
  out('500 opened', [await H.sinceGiven(o4.page), (await rowsNow(o4.page)).length]);
  await o4.context.close();
  const o5 = await openIn(browser, stateFileOf('scale-520.json', scaleState(520)));
  out('520 opened', [await H.sinceGiven(o5.page), (await rowsNow(o5.page)).length]);
  await o5.context.close();
} finally { await browser.close(); }
