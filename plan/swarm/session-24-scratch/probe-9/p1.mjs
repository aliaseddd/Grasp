import path from 'node:path';
const H = await import('./wt/canvas/app/test/helpers.mjs');
const { launch, openIn, stateFileAt, EXAMPLE, modelOf, showView, boxOf, headerOf, groundPoint, planeOf, FIXTURES, soon, frame, viewTab } = H;
const browser = await launch();
const out = (label, v) => console.log(label, JSON.stringify(v));
const sel = (page) => page.evaluate(() => ({ items: window.Grasp.selection.items.map((i) => i.type + ':' + i.id), view: window.Grasp.selection.view }));
const hits = (page) => page.evaluate(() => { const h = window.__hits.map((x) => x.type + ':' + x.id + (x.add ? '+' : '')); window.__hits.length = 0; return h; });
const dom = (page, viewId) => page.evaluate((plane) => ({
  nodes: [...document.querySelectorAll(`${plane} .react-flow__node.selected`)].map((el) => el.getAttribute('data-id')),
  edges: [...document.querySelectorAll(`${plane} .react-flow__edge.selected`)].map((el) => el.getAttribute('data-id')),
  rect: document.querySelectorAll(`${plane} .react-flow__selection`).length,
  nsel: document.querySelectorAll(`${plane} .react-flow__nodesselection, ${plane} .react-flow__nodesselection-rect`).length,
}), planeOf(viewId));
try {
  const opened = await openIn(browser, stateFileAt(EXAMPLE));
  const { page } = opened;
  await page.evaluate(() => { window.__hits = []; window.__fronts = []; });
  const model = modelOf(EXAMPLE);
  const view = model.views[0];
  await showView(page, view, 6);
  out('start', await sel(page));
  const at = async (id) => headerOf(await boxOf(page, view.id, id));
  // P1
  let p = await at('Host'); await page.mouse.click(p.x, p.y); await frame(page);
  out('click Host', [await sel(page), await hits(page), await dom(page, view.id)]);
  p = await at('App'); await page.mouse.click(p.x, p.y); await frame(page);
  out('click App', [await sel(page), await hits(page), await dom(page, view.id)]);
  // P2 ctrl
  await page.keyboard.down('Control'); p = await at('Host'); await page.mouse.click(p.x, p.y); await frame(page);
  out('ctrl click Host', [await sel(page), await hits(page), await dom(page, view.id)]);
  p = await at('App'); await page.mouse.click(p.x, p.y); await frame(page);
  out('ctrl click App (was selected)', [await sel(page), await hits(page), await dom(page, view.id)]);
  await page.keyboard.up('Control');
  await page.keyboard.down('Meta'); p = await at('App'); await page.mouse.click(p.x, p.y); await frame(page);
  out('meta click App', [await sel(page), await hits(page), await dom(page, view.id)]);
  await page.keyboard.up('Meta');
  // P7 ground
  let g = await groundPoint(page, view); await page.mouse.click(g.x, g.y); await frame(page);
  out('click ground', [await sel(page), await hits(page), await dom(page, view.id)]);
  p = await at('Host'); await page.mouse.click(p.x, p.y); await frame(page);
  await hits(page);
  await page.keyboard.down('Control'); await page.mouse.click(g.x, g.y); await frame(page); await page.keyboard.up('Control');
  out('ctrl click ground', [await sel(page), await hits(page), await dom(page, view.id)]);
  // P14 shift click node
  await page.keyboard.down('Shift'); p = await at('Host'); await page.mouse.click(p.x, p.y); await frame(page); await page.keyboard.up('Shift');
  out('shift click Host', [await sel(page), await hits(page), await dom(page, view.id)]);
  await page.keyboard.down('Shift'); await page.mouse.click(g.x, g.y); await frame(page); await page.keyboard.up('Shift');
  out('shift click ground', [await sel(page), await hits(page), await dom(page, view.id)]);
  // P3 marquee over everything
  const plane = await page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, planeOf(view.id));
  const rects = await H.rectsOf(page, view.id);
  out('rects', Object.fromEntries(Object.entries(rects).map(([k, r]) => [k, [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]])));
  await page.keyboard.down('Shift');
  await page.mouse.move(plane.x + 5, plane.y + 5); await page.mouse.down();
  await page.mouse.move(plane.x + 40, plane.y + 40, { steps: 2 }); await frame(page);
  out('marquee small', [await sel(page), await dom(page, view.id)]);
  const host = rects.Host;
  await page.mouse.move(host.x + host.width + 6, host.y + host.height + 6, { steps: 4 }); await frame(page);
  out('marquee to past Host', [await sel(page), await dom(page, view.id)]);
  await page.mouse.move(plane.x + plane.w - 5, plane.y + plane.h - 5, { steps: 4 }); await frame(page);
  out('marquee all', [await sel(page), await dom(page, view.id)]);
  await page.mouse.move(plane.x + 40, plane.y + 40, { steps: 4 }); await frame(page);
  out('marquee shrunk back', [await sel(page), await dom(page, view.id)]);
  await page.mouse.move(plane.x + plane.w - 5, plane.y + plane.h - 5, { steps: 4 }); await frame(page);
  await page.mouse.up(); await frame(page);
  out('marquee released (shift held)', [await sel(page), await hits(page), await dom(page, view.id)]);
  await page.keyboard.up('Shift'); await frame(page);
  out('shift up', [await sel(page), await hits(page), await dom(page, view.id)]);
  // click a covered box picks it alone
  p = await at('App'); await page.mouse.click(p.x, p.y); await frame(page);
  out('click App after marquee', [await sel(page), await hits(page), await dom(page, view.id)]);
  // P5/P6: marquee begun on a node, Shift released before mouse up
  const hostBefore = await boxOf(page, view.id, 'Host');
  await page.keyboard.down('Shift');
  p = await at('Host'); await page.mouse.move(p.x, p.y); await page.mouse.down();
  await page.mouse.move(p.x + 60, p.y + 40, { steps: 3 }); await frame(page);
  out('marquee begun on Host', [await sel(page), await dom(page, view.id)]);
  await page.keyboard.up('Shift'); await frame(page);
  await page.mouse.move(p.x + 80, p.y + 50, { steps: 2 }); await frame(page);
  out('after shift up, moving', [await sel(page), await dom(page, view.id)]);
  await page.mouse.up(); await frame(page);
  const hostAfter = await boxOf(page, view.id, 'Host');
  out('released after shift up', [await sel(page), await hits(page), await dom(page, view.id), { moved: [hostAfter.x - hostBefore.x, hostAfter.y - hostBefore.y] }]);
  // marquee begun on a node, Shift held to the end
  await page.keyboard.down('Shift');
  p = await at('Host'); await page.mouse.move(p.x, p.y); await page.mouse.down();
  await page.mouse.move(p.x + 60, p.y + 40, { steps: 3 }); await page.mouse.up(); await frame(page);
  await page.keyboard.up('Shift'); await frame(page);
  out('marquee on Host, shift held', [await sel(page), await hits(page), await dom(page, view.id)]);
  // P8: drag an unselected box while two others are selected
  p = await at('Host'); await page.mouse.click(p.x, p.y);
  await page.keyboard.down('Control'); p = await at('App'); await page.mouse.click(p.x, p.y); await page.keyboard.up('Control'); await frame(page);
  await hits(page);
  const before = { Host: await boxOf(page, view.id, 'Host'), App: await boxOf(page, view.id, 'App'), DevHost: await boxOf(page, view.id, 'DevHost') };
  p = await at('DevHost'); await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.x + 30, p.y + 20, { steps: 4 }); await page.mouse.up(); await frame(page);
  const after = { Host: await boxOf(page, view.id, 'Host'), App: await boxOf(page, view.id, 'App'), DevHost: await boxOf(page, view.id, 'DevHost') };
  out('drag unselected DevHost', [await sel(page), await hits(page), await dom(page, view.id), Object.fromEntries(Object.keys(before).map((k) => [k, [Math.round(after[k].x - before[k].x), Math.round(after[k].y - before[k].y)]]))]);
  // then drag selected Host: both Host and App move?
  const b2 = { Host: await boxOf(page, view.id, 'Host'), App: await boxOf(page, view.id, 'App'), DevHost: await boxOf(page, view.id, 'DevHost') };
  p = await at('Host'); await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.x + 30, p.y + 20, { steps: 4 }); await page.mouse.up(); await frame(page);
  const a2 = { Host: await boxOf(page, view.id, 'Host'), App: await boxOf(page, view.id, 'App'), DevHost: await boxOf(page, view.id, 'DevHost') };
  out('drag selected Host', [await sel(page), await hits(page), await dom(page, view.id), Object.fromEntries(Object.keys(b2).map((k) => [k, [Math.round(a2[k].x - b2[k].x), Math.round(a2[k].y - b2[k].y)]]))]);
  // ctrl + drag on an unselected box
  const b3 = { Host: await boxOf(page, view.id, 'Host'), App: await boxOf(page, view.id, 'App'), DevHost: await boxOf(page, view.id, 'DevHost') };
  await page.keyboard.down('Control');
  p = await at('DevHost'); await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.x + 30, p.y + 20, { steps: 4 }); await page.mouse.up(); await frame(page);
  await page.keyboard.up('Control');
  const a3 = { Host: await boxOf(page, view.id, 'Host'), App: await boxOf(page, view.id, 'App'), DevHost: await boxOf(page, view.id, 'DevHost') };
  out('ctrl drag unselected DevHost', [await sel(page), await hits(page), await dom(page, view.id), Object.fromEntries(Object.keys(b3).map((k) => [k, [Math.round(a3[k].x - b3[k].x), Math.round(a3[k].y - b3[k].y)]]))]);
  // slip 3px click
  p = await at('DevHost'); await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.x + 3, p.y, { steps: 2 }); await page.mouse.up(); await frame(page);
  out('3px slip on DevHost', [await sel(page), await hits(page)]);
  p = await at('DevHost'); await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.x + 4, p.y, { steps: 2 }); await page.mouse.up(); await frame(page);
  out('4px slip on DevHost', [await sel(page), await hits(page), await page.evaluate(() => window.Grasp.session.history.undoWords?.() ?? null)]);
  // line click
  const mid = await page.evaluate((plane) => { const path = document.querySelector(`${plane} .react-flow__edge[data-id="mount"] path.grasp-line`); const l = path.getTotalLength(); const pt = path.getPointAtLength(l / 2); const m = path.getScreenCTM(); return { x: pt.x * m.a + m.e, y: pt.y * m.d + m.f }; }, planeOf(view.id));
  await page.mouse.click(mid.x, mid.y); await frame(page);
  out('click mount', [await sel(page), await hits(page), await dom(page, view.id)]);
  await page.keyboard.down('Control'); p = await at('Host'); await page.mouse.click(p.x, p.y); await page.keyboard.up('Control'); await frame(page);
  out('ctrl click Host after line', [await sel(page), await hits(page), await dom(page, view.id)]);
  console.log('problems', opened.problems);
  await opened.context.close();
} finally { await browser.close(); }
