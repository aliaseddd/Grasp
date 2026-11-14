// Which of a grip's three classes is needed: each taken off in the page, and a grip pressed and dragged 100 px.
import { boxOf, EXAMPLE, frame, isGraph, launch, modelOf, openIn, planeOf, showView, stateFileAt, linesOf } from '../canvas/app/test/helpers.mjs';
const browser = await launch();
const model = modelOf(EXAMPLE); const view = model.views.find(isGraph);
const look = (page) => page.evaluate(([plane]) => {
  const root = document.querySelector(plane);
  return {
    viewport: root.querySelector('.react-flow__viewport').style.transform,
    page: (() => { const r = root.querySelector('.react-flow__node[data-id="Page"]').getBoundingClientRect(); return `${r.x.toFixed(1)},${r.y.toFixed(1)}`; })(),
    marquee: !!root.querySelector('.react-flow__selection'),
    probe: root.getAttribute('data-probe') ? JSON.parse(root.getAttribute('data-probe')) : null,
    selected: [...root.querySelectorAll('.react-flow__node.selected')].map((el) => el.getAttribute('data-id')),
  };
}, [planeOf(view.id)]);
for (const [off, shift] of [['', false], ['nokey', true], ['nokey', false], ['nodrag', false], ['nopan', false], ['nodrag nopan', false]]) {
  const opened = await openIn(browser, stateFileAt(EXAMPLE));
  const { page } = opened;
  await showView(page, view, linesOf(model, view).length);
  await page.evaluate(([plane, classes]) => { for (const g of document.querySelectorAll(`${plane} [data-grip]`)) for (const c of classes.split(' ').filter(Boolean)) g.classList.remove(c); document.querySelector(plane).removeAttribute('data-probe'); }, [planeOf(view.id), off]);
  const box = await boxOf(page, view.id, 'Page');
  await page.mouse.move(box.x + 24 * box.zoom, box.y + 14 * box.zoom); await frame(page);
  const grip = await page.evaluate(([plane]) => { const r = document.querySelector(`${plane} .react-flow__node[data-id="Page"] > [data-grip="top"]`).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, [planeOf(view.id)]);
  await page.mouse.move(grip.x, box.y + 2); await page.mouse.move(grip.x, grip.y, { steps: 4 }); await frame(page);
  const before = await look(page);
  if (shift) await page.keyboard.down('Shift');
  await page.mouse.down(); await frame(page);
  let marquee = false;
  for (let i = 1; i <= 10; i++) { await page.mouse.move(grip.x + 10 * i, grip.y - 3 * i); await frame(page); marquee = marquee || (await look(page)).marquee; }
  const mid = await look(page);
  await page.mouse.up(); await frame(page); await frame(page);
  if (shift) await page.keyboard.up('Shift');
  const after = await look(page);
  console.log(JSON.stringify({ without: off || '(none: all three on)', shift, pressReachedThePlane: !!after.probe, gestureMoves: after.probe?.moves ?? 0, gestureUps: after.probe?.ups ?? 0,
    nodeMovedDuring: before.page !== mid.page && before.viewport === mid.viewport, planePanned: before.viewport !== mid.viewport || before.viewport !== after.viewport, marquee, selectedAfter: after.selected }));
  await opened.context.close();
}
await browser.close();
