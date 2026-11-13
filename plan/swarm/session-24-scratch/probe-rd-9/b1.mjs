import path from 'node:path';
const H = await import('/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-9/canvas/app/test/helpers.mjs');
const { launch, openPage, openStateFile, stateFileAt, EXAMPLE, FIXTURES, modelOf, showView, planeOf, boxOf, headerOf, linesOf, rectsOf, byTestId, TESTIDS, frame, groundPoint } = H;
const browser = await launch();
async function corner(page, view) {
  return page.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); const el = document.elementFromPoint(r.x + 6, r.y + 6); return { x: r.x + 6, y: r.y + 6, cls: el && el.className && String(el.className.baseVal ?? el.className), w: r.width, h: r.height }; }, planeOf(view.id));
}
for (const f of [EXAMPLE, path.join(FIXTURES, 'interconnection.json'), path.join(FIXTURES, 'browser.json')]) {
  const opened = await openPage(browser, { picker: false });
  const { page } = opened;
  await openStateFile(page, stateFileAt(f));
  const model = modelOf(f);
  for (const view of model.views.filter(H.isGraph)) {
    await showView(page, view, linesOf(model, view).length);
    console.log(path.basename(f), view.id, JSON.stringify(await corner(page, view)));
    if (f === EXAMPLE) {
      const rects = await rectsOf(page, view.id);
      const h = rects.Host, a = rects['Host.api'], z = (await boxOf(page, view.id, 'Host')).zoom;
      console.log('zoom', z, 'Host right+6', h.x + h.width + 6, 'Host.api right', a.x + a.width, 'bottoms', h.y + h.height + 6, a.y + a.height);
      const pane = await page.evaluate(() => { const e = document.querySelector('[data-testid="explorer"]'); const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height, e.textContent]; });
      console.log('explorer', pane);
    }
  }
  console.log('problems', opened.problems);
  await opened.context.close();
}
// S9: 1400 x 500
{
  const f = path.join(FIXTURES, 'interconnection.json');
  const opened = await openPage(browser, { picker: false });
  const { page } = opened;
  await page.setViewportSize({ width: 1400, height: 500 });
  await openStateFile(page, stateFileAt(f));
  const model = modelOf(f); const view = model.views[0];
  await showView(page, view, linesOf(model, view).length);
  const box = await boxOf(page, view.id, 'System.pump');
  const at = headerOf(box);
  const hit = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.closest('.react-flow__node')?.getAttribute('data-id') + ' / ' + e.className) : null; }, [at.x, at.y]);
  const ex = await page.evaluate(() => { const r = document.querySelector('[data-testid="explorer"]').getBoundingClientRect(); return [r.y, r.height]; });
  console.log('S9 zoom', box.zoom, 'header point hits', hit, 'box', JSON.stringify(box), 'explorer y,h', ex, 'far?', await page.evaluate((s) => document.querySelector(s + ' .react-flow__node').className, planeOf(view.id)));
  await opened.context.close();
}
await browser.close();
