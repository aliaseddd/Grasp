import path from 'node:path';
const H = await import('./wt/canvas/app/test/helpers.mjs');
const { launch, openIn, stateFileAt, EXAMPLE, modelOf, showView, boxOf, headerOf, groundPoint, planeOf, FIXTURES, soon, frame, viewTab, openStateFile } = H;
const browser = await launch();
const out = (label, v) => console.log(label, JSON.stringify(v));
const sel = (page) => page.evaluate(() => ({ items: window.Grasp.selection.items.map((i) => i.type + ':' + i.id), view: window.Grasp.selection.view }));
const hits = (page) => page.evaluate(() => { const h = window.__hits.map((x) => x.type + ':' + x.id + (x.add ? '+' : '')); window.__hits.length = 0; return h; });
const fronts = (page) => page.evaluate(() => { const h = [...window.__fronts]; window.__fronts.length = 0; return h; });
const dom = (page, viewId) => page.evaluate((plane) => ({
  nodes: [...document.querySelectorAll(`${plane} .react-flow__node.selected`)].map((el) => el.getAttribute('data-id')),
  edges: [...document.querySelectorAll(`${plane} .react-flow__edge.selected`)].map((el) => el.getAttribute('data-id')),
}), planeOf(viewId));
try {
  const IC = path.join(FIXTURES, 'interconnection.json');
  const opened = await openIn(browser, stateFileAt(EXAMPLE));
  const { page } = opened;
  await page.evaluate(() => { window.__hits = []; window.__fronts = []; });
  // marquee begun on node with shift released early: now dropped?
  const ex = modelOf(EXAMPLE).views[0];
  await showView(page, ex, 6);
  let p = headerOf(await boxOf(page, ex.id, 'Host'));
  await page.keyboard.down('Shift'); await page.mouse.move(p.x, p.y); await page.mouse.down();
  await page.mouse.move(p.x + 60, p.y + 40, { steps: 3 }); await page.keyboard.up('Shift'); await frame(page);
  await page.mouse.up(); await frame(page);
  out('marquee on Host, shift released early', [await sel(page), await hits(page)]);
  await page.mouse.click(p.x, p.y); await frame(page);
  out('then a click on Host', [await sel(page), await hits(page)]);
  // another file
  await openStateFile(page, stateFileAt(IC));
  const model = modelOf(IC);
  const [one, two] = model.views;
  out('views', model.views.map((v) => [v.id, v.kind, Object.keys(v.layout).length]));
  await showView(page, one);
  out('opened IC', [await sel(page), await fronts(page)]);
  const both = Object.keys(one.layout).filter((id) => two.layout[id]);
  out('in both views', both);
  p = headerOf(await boxOf(page, one.id, 'Pump')); await page.mouse.click(p.x, p.y); await frame(page);
  out('click Pump', [await sel(page), await dom(page, one.id)]);
  const tab2 = await viewTab(page, two); await tab2.click(); await frame(page); await frame(page);
  out('tab two', [await sel(page), await fronts(page), await dom(page, two.id)]);
  await page.evaluate(() => window.Grasp.selection.set([{ type: 'el', id: 'Tank' }])); await frame(page);
  out('set Tank while one hidden', [await sel(page), await dom(page, two.id), await page.evaluate(() => [...window.Grasp.views].map(([k, s]) => [k, s.projected]))]);
  const tab1 = await viewTab(page, one); await tab1.click(); await frame(page); await frame(page);
  out('back to one', [await sel(page), await fronts(page), await dom(page, one.id)]);
  // side panel made active
  await page.locator('[data-testid="explorer"]').click(); await frame(page);
  out('click in explorer', [await sel(page), await fronts(page)]);
  await page.locator('[data-testid="details"]').click(); await frame(page);
  out('click in details', [await sel(page), await fronts(page)]);
  // split: move view two to the right
  await page.evaluate(([a, b]) => { const d = window.__dock; const group = d.addGroup({ referencePanel: 'view:' + a, direction: 'right' }); d.getPanel('view:' + b).api.moveTo({ group }); }, [one.id, two.id]).catch((e) => console.log('moveTo failed', e.message));
  await frame(page); await frame(page);
  out('after split', [await sel(page), await fronts(page), await page.evaluate(() => window.__dock.groups.map((g) => [g.id, g.panels.map((p) => p.id), g.api.location.type]))]);
  await H.untilDrawn(page, one); await H.untilDrawn(page, two);
  let g = await groundPoint(page, one); await page.mouse.move(g.x, g.y); await page.mouse.down(); await page.mouse.up(); await frame(page);
  out('press+release on ground of one (split)', [await sel(page), await fronts(page), await hits(page)]);
  g = await groundPoint(page, two); await page.mouse.click(g.x, g.y); await frame(page);
  out('click ground of two (split)', [await sel(page), await fronts(page), await hits(page)]);
  p = headerOf(await boxOf(page, one.id, 'Pump')); await page.mouse.click(p.x, p.y); await frame(page);
  out('click Pump in one (split)', [await sel(page), await fronts(page), await hits(page), await dom(page, one.id), await dom(page, two.id)]);
  // wheel pan over the other group without click
  g = await groundPoint(page, two); await page.mouse.move(g.x, g.y); await page.mouse.wheel(0, 30); await frame(page);
  out('wheel over two', [await sel(page), await fronts(page)]);
  // close the tab of two (front is one)
  const close = async (view) => { const tab = await viewTab(page, view); await tab.hover(); await tab.locator('.dv-default-tab-action').click(); await frame(page); await frame(page); };
  await close(two);
  out('closed two (front was one)', [await sel(page), await fronts(page), await page.evaluate(() => window.__dock.groups.map((g) => [g.id, g.panels.map((p) => p.id)]))]);
  await close(one);
  out('closed one', [await sel(page), await fronts(page), await page.evaluate(() => [window.__dock.activePanel?.id ?? null, window.__dock.groups.map((g) => [g.id, g.panels.map((p) => p.id)])])]);
  // showView through context is not reachable here; use card button
  await page.getByRole('button', { name: /Show the views again/ }).click(); await frame(page); await frame(page);
  out('views shown again', [await sel(page), await fronts(page)]);
  // close the tab in front when two tabs in one group
  await close(one);
  out('closed one (in front), two takes its place', [await sel(page), await fronts(page)]);
  // float two
  const tab = await viewTab(page, two); const tb = await tab.boundingBox();
  await page.keyboard.down('Shift'); await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2); await page.mouse.down(); await page.mouse.move(tb.x + 200, tb.y + 200, { steps: 5 }); await page.mouse.up(); await page.keyboard.up('Shift'); await frame(page); await frame(page);
  out('floated two', [await sel(page), await fronts(page), await page.evaluate(() => window.__dock.groups.map((g) => [g.id, g.panels.map((p) => p.id), g.api.location.type]))]);
  // open another file while floated
  await openStateFile(page, stateFileAt(EXAMPLE)); await frame(page); await frame(page);
  out('another file', [await sel(page), await fronts(page), await page.evaluate(() => window.__dock.groups.map((g) => [g.id, g.panels.map((p) => p.id), g.api.location.type]))]);
  console.log('problems', opened.problems);
  await opened.context.close();
} finally { await browser.close(); }
