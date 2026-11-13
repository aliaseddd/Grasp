const W = '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-8';
const h = await import(W + '/canvas/app/test/helpers.mjs');
const { scaleState, VIEWS, middleService } = await import(W + '/canvas/test/scale-model.mjs');
const STATE = scaleState(5000);
const view = STATE.model.views.find((v) => v.id === VIEWS.definitions);
const SERVICE = middleService(5000);
const browser = await h.launch();
try {
  const opened = await h.openIn(browser, h.stateFileOf('scale-5000.json', STATE));
  const { page } = opened;
  await h.showView(page, view);
  const watch = (selector) => page.evaluate((sel) => {
    const t = window.__probe = { moves: [], changes: [] };
    addEventListener('pointermove', () => { const m = { at: performance.now(), frame: null }; t.moves.push(m); requestAnimationFrame(() => { m.frame = performance.now(); }); }, true);
    t.observer = new MutationObserver((records) => { for (const r of records) t.changes.push(performance.now()); });
    t.observer.observe(document.querySelector(sel), { attributes: true, attributeFilter: ['style'] });
  }, selector);
  const read = () => page.evaluate(() => { const t = window.__probe; t.observer.disconnect(); return { moves: t.moves, changes: t.changes }; });
  const judge = ({ moves, changes }) => {
    let outside = 0; const lates = [];
    for (const c of changes) {
      const m = [...moves].reverse().find((x) => x.at <= c);
      if (!m || m.frame === null || c > m.frame) { outside++; lates.push(m ? (m.frame === null ? 'noframe' : (c - m.frame).toFixed(2)) : 'nomove'); }
    }
    return { moves: moves.length, changes: changes.length, outside, lates };
  };
  // pans
  await watch(`${h.planeOf(view.id)} .react-flow__viewport`);
  const ground = await h.groundPoint(page, view);
  for (const way of [1, -1]) {
    await page.mouse.move(ground.x, ground.y); await h.frame(page);
    await page.mouse.down();
    let at = { ...ground };
    for (let m = 0; m < 4; m++) { at = { x: at.x + way * 12, y: at.y + way * 6 }; await page.mouse.move(at.x, at.y); await h.frame(page); }
    await page.mouse.up(); await h.frame(page);
  }
  console.log('pan', judge(await read()));
  await h.zoomTo(page, view, SERVICE, 1);
  await watch(h.nodeOf(view.id, SERVICE));
  for (const way of [1, -1]) {
    const box = await h.boxOf(page, view.id, SERVICE);
    let at = h.headerOf(box);
    await page.mouse.move(at.x, at.y); await h.frame(page);
    await page.mouse.down();
    for (let m = 0; m < 4; m++) { at = { x: at.x + way * 12, y: at.y + way * 6 }; await page.mouse.move(at.x, at.y); await h.frame(page); }
    await page.mouse.up(); await h.frame(page);
  }
  console.log('drag', judge(await read()));
  console.log('problems', opened.problems);
  // where is the bar blank? what is under (700,20)
  console.log('at 700,20:', await page.evaluate(() => { const e = document.elementFromPoint(700, 20); return e.tagName + ' ' + (e.getAttribute('data-testid') || '') + ' ' + (e.closest('button') ? 'button' : 'no button'); }));
  await opened.context.close();
} finally { await browser.close(); }
