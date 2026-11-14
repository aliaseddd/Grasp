import path from 'node:path';
import { boxOf, collapseSides, EXAMPLE, FIXTURES, frame, isGraph, launch, modelOf, openStateFile, planeOf, selectBox, showView, stateFileAt, linesOf, zoomTo, byTestId, TESTIDS } from '../canvas/app/test/helpers.mjs';
const browser = await launch();
const dir = path.dirname(new URL(import.meta.url).pathname);
const open = async (file) => {
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.addInitScript(() => { delete window.showOpenFilePicker; });
  await page.goto('file://' + path.resolve(dir, '../canvas/dist/index.html'));
  await page.waitForSelector(byTestId(TESTIDS.app));
  await openStateFile(page, stateFileAt(file));
  return page;
};
const lineMid = (page, viewId, pick) => page.evaluate(([plane, pick_]) => {
  const root = document.querySelector(plane);
  const out = [];
  for (const g of root.querySelectorAll('.react-flow__edge')) {
    const hit = g.querySelector('.grasp-line-hit');
    const len = hit.getTotalLength();
    const p = hit.getPointAtLength(len / 2);
    const m = hit.getScreenCTM();
    const s = { x: p.x * m.a + p.y * m.c + m.e, y: p.x * m.b + p.y * m.d + m.f };
    const top = document.elementFromPoint(s.x, s.y);
    if (top && top.closest('.react-flow__edge') === g) out.push({ id: g.getAttribute('data-id'), ...s });
  }
  return pick_ ? out.find((o) => o.id === pick_) : out;
}, [planeOf(viewId), pick]);
{
  const file = path.join(FIXTURES, 'interconnection.json');
  const model = modelOf(file); const view = model.views.find(isGraph);
  const page = await open(file);
  await collapseSides(page);
  await showView(page, view, linesOf(model, view).length);
  await zoomTo(page, view, 'System.pump', 1);
  const box = await boxOf(page, view.id, 'System.pump');
  await page.mouse.move(box.x + 24, box.y + 14); await frame(page);
  await page.screenshot({ path: path.join(dir, 'hover-box.png'), clip: { x: box.x - 80, y: box.y - 60, width: box.width + 160, height: box.height + 120 } });
  await selectBox(page, view, 'System.pump');
  await page.mouse.move(box.x - 200, box.y - 100); await frame(page);
  await page.screenshot({ path: path.join(dir, 'selected-box.png'), clip: { x: box.x - 80, y: box.y - 60, width: box.width + 160, height: box.height + 120 } });
  const lines = await lineMid(page, view.id);
  console.log(lines.map((l) => l.id));
  const l = lines.find((x) => x.id === 'fuelLine') ?? lines[0];
  await page.mouse.click(l.x, l.y); await frame(page); await frame(page);
  await page.mouse.move(l.x, l.y - 120); await frame(page);
  const ends = await page.evaluate(([plane]) => [...document.querySelectorAll(`${plane} [data-grip="from"], ${plane} [data-grip="to"]`)].map((c) => { const r = c.getBoundingClientRect(); return { x: r.x + 4, y: r.y + 4 }; }), [planeOf(view.id)]);
  console.log(ends);
  const x0 = Math.min(...ends.map((e) => e.x)); const y0 = Math.min(...ends.map((e) => e.y)); const x1 = Math.max(...ends.map((e) => e.x)); const y1 = Math.max(...ends.map((e) => e.y));
  await page.screenshot({ path: path.join(dir, 'line-ports.png'), clip: { x: Math.max(0, x0 - 60), y: Math.max(0, y0 - 50), width: Math.min(900, x1 - x0 + 120), height: Math.min(600, y1 - y0 + 100) } });
  await page.context().close();
}
{
  const model = modelOf(EXAMPLE); const view = model.views.find(isGraph);
  const page = await open(EXAMPLE);
  await collapseSides(page);
  await showView(page, view, linesOf(model, view).length);
  await zoomTo(page, view, 'Page', 1);
  const lines = await lineMid(page, view.id);
  console.log(lines.map((l) => l.id));
  for (const l of lines.slice(0, 3)) {
    await page.mouse.click(l.x, l.y); await frame(page); await frame(page);
    await page.mouse.move(l.x + 150, l.y + 150); await frame(page);
    const ends = await page.evaluate(([plane]) => [...document.querySelectorAll(`${plane} [data-grip="from"], ${plane} [data-grip="to"]`)].map((c) => { const r = c.getBoundingClientRect(); return { x: r.x + 4, y: r.y + 4 }; }), [planeOf(view.id)]);
    const x0 = Math.min(...ends.map((e) => e.x)); const y0 = Math.min(...ends.map((e) => e.y)); const x1 = Math.max(...ends.map((e) => e.x)); const y1 = Math.max(...ends.map((e) => e.y));
    console.log(l.id, ends);
    await page.screenshot({ path: path.join(dir, `line-${l.id}.png`), clip: { x: Math.max(0, x0 - 60), y: Math.max(0, y0 - 50), width: Math.min(700, x1 - x0 + 120), height: Math.min(500, y1 - y0 + 100) } });
  }
  await page.context().close();
}
await browser.close();
