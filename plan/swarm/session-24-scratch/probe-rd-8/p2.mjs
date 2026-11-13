const W = '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-8';
const h = await import(W + '/canvas/app/test/helpers.mjs');
const browser = await h.launch();
try {
  const opened = await h.openIn(browser, h.stateFileAt(h.EXAMPLE));
  const { page } = opened;
  const view = h.modelOf(h.EXAMPLE).views[0];
  await h.showView(page, view);
  const info = await page.evaluate((plane) => {
    const p = document.querySelector(plane); const pr = p.getBoundingClientRect();
    const m = p.querySelector('.react-flow__minimap'); const mr = m.getBoundingClientRect();
    return { plane: [pr.x, pr.y, pr.width, pr.height], mm: [mr.x, mr.y, mr.width, mr.height], right: pr.right - mr.right, bottom: pr.bottom - mr.bottom,
      cls: m.className, descendantSel: p.querySelectorAll('.react-flow__panel .react-flow__minimap').length, sameSel: p.querySelectorAll('.react-flow__panel.react-flow__minimap').length,
      nodes: p.querySelectorAll('.react-flow__minimap-node').length, title: m.querySelector('title')?.textContent, vb: m.querySelector('svg').getAttribute('viewBox'),
      mask: m.querySelector('.react-flow__minimap-mask').getAttribute('d'), bg: getComputedStyle(m).backgroundColor };
  }, h.planeOf(view.id));
  console.log(JSON.stringify(info, null, 1));
  const box = await h.selectBox(page, view, 'Host');
  console.log('zoom', box.zoom);
  const mid = { x: info.mm[0] + 100, y: info.mm[1] + 75 };
  await page.mouse.click(mid.x, mid.y);
  await h.frame(page); await h.frame(page);
  const after = await h.boxOf(page, view.id, 'Host');
  console.log('after click on minimap selected', after.selected, after.x === box.x, after.zoom === box.zoom);
  // zoomTo precision
  const z = await h.zoomTo(page, view, 'Host', 1);
  console.log('zoomTo(1) gives', z.zoom);
  console.log('colors', await h.cssColor(page, 'var(--grasp-line-strong)'), await h.cssColor(page, 'var(--grasp-minimap-mask)'), await h.cssColor(page, 'var(--grasp-white)'));
  console.log('problems', opened.problems);
  await opened.context.close();
  // blank
  const o2 = await h.openIn(browser, h.stateFileAt(h.BLANK));
  const v2 = h.modelOf(h.BLANK).views[0];
  await h.showView(o2.page, v2);
  console.log('blank', await o2.page.evaluate((plane) => { const p = document.querySelector(plane); const m = p.querySelector('.react-flow__minimap'); return m ? [m.querySelector('svg').getAttribute('viewBox'), p.getBoundingClientRect().width] : null; }, h.planeOf(v2.id)), o2.problems);
  await o2.context.close();
} finally { await browser.close(); }
