import { EXAMPLE, frame, isGraph, launch, modelOf, openIn, planeOf, showView, stateFileAt, linesOf, finish } from '../canvas/app/test/helpers.mjs';
const browser = await launch();
const model = modelOf(EXAMPLE); const view = model.views.find(isGraph);
const opened = await openIn(browser, stateFileAt(EXAMPLE)); const { page } = opened;
await showView(page, view, linesOf(model, view).length);
const line = await page.evaluate(([plane]) => {
  for (const g of document.querySelectorAll(`${plane} .react-flow__edge`)) {
    const hit = g.querySelector('.grasp-line-hit'); const len = hit.getTotalLength(); const p = hit.getPointAtLength(len / 2); const m = hit.getScreenCTM();
    const s = { x: p.x * m.a + p.y * m.c + m.e, y: p.x * m.b + p.y * m.d + m.f };
    if (document.elementFromPoint(s.x, s.y)?.closest('.react-flow__edge') === g) return { id: g.getAttribute('data-id'), ...s };
  }
}, [planeOf(view.id)]);
const styleOf = () => page.evaluate(([plane, id]) => { const s = getComputedStyle(document.querySelector(`${plane} .react-flow__edge[data-id="${id}"] .grasp-line-hit`)); return `${s.stroke} / ${s.strokeOpacity}`; }, [planeOf(view.id), line.id]);
const away = await styleOf();
await page.mouse.move(line.x, line.y); await frame(page);
const over = await styleOf();
await page.mouse.click(line.x, line.y); await frame(page); await frame(page);
const selected = await styleOf();
console.log(JSON.stringify({ line: line.id, away, over, selectedAndOver: selected }));
await finish(opened); await browser.close();
