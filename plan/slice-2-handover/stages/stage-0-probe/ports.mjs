import path from 'node:path';
import { FIXTURES, finish, isGraph, launch, modelOf, openIn, planeOf, showView, stateFileAt, linesOf } from '../canvas/app/test/helpers.mjs';
const browser = await launch();
for (const name of ['interconnection', 'behavior-actions']) {
  const file = path.join(FIXTURES, `${name}.json`);
  const model = modelOf(file); const view = model.views.find(isGraph);
  const opened = await openIn(browser, stateFileAt(file));
  await showView(opened.page, view, linesOf(model, view).length);
  console.log(JSON.stringify(await opened.page.evaluate(([plane]) => [...document.querySelectorAll(`${plane} .react-flow__node`)].filter((n) => /node-(port|param|bar|diamond|dot|bullseye|entry|event)/.test(n.className)).map((n) => {
    const r = n.getBoundingClientRect(); const z = r.width / n.offsetWidth;
    return [n.getAttribute('data-id'), n.className.match(/node-(\w+)/)[1], [...n.querySelectorAll(':scope > [data-grip]')].map((g) => { const q = g.getBoundingClientRect(); return `${g.getAttribute('data-grip')} dx=${(((q.left + q.right) / 2 - (r.left + r.right) / 2) / z).toFixed(2)} dy=${(((q.top + q.bottom) / 2 - (r.top + r.bottom) / 2) / z).toFixed(2)} w=${(q.width / z).toFixed(2)} node=${(r.width / z).toFixed(1)}x${(r.height / z).toFixed(1)}`; }).join(' | ')];
  }), [planeOf(view.id)]), null, 0).replace(/\],\[/g, '],\n['));
  await finish(opened);
}
await browser.close();
