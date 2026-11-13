const H = await import('./wt/canvas/app/test/helpers.mjs');
const { launch, openIn, stateFileAt, EXAMPLE, modelOf, showView, frame, planeOf, cssColor, TEAL } = H;
const browser = await launch();
try {
  const o = await openIn(browser, stateFileAt(EXAMPLE));
  const { page } = o;
  const view = modelOf(EXAMPLE).views[0];
  await showView(page, view, 6);
  const plane = await page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, planeOf(view.id));
  console.log('corner is ground:', await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.className, [plane.x + 6, plane.y + 6]));
  await page.keyboard.down('Shift');
  await page.mouse.move(plane.x + 6, plane.y + 6); await page.mouse.down();
  await page.mouse.move(plane.x + 300, plane.y + 300, { steps: 3 }); await frame(page);
  console.log(await page.evaluate((s) => { const el = document.querySelector(`${s} .react-flow__selection`); const c = getComputedStyle(el); const r = el.getBoundingClientRect(); return [c.backgroundColor, c.borderTopColor, c.borderTopStyle, c.borderTopWidth, r.x, r.y, r.width, r.height]; }, planeOf(view.id)), await cssColor(page, TEAL), plane);
  await page.screenshot({ path: 'marquee.png' });
  await page.mouse.up(); await page.keyboard.up('Shift');
  console.log('problems', o.problems);
  await o.context.close();
} finally { await browser.close(); }
