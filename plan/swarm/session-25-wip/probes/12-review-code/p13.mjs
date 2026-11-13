import { launch, openIn, stateFileAt, TEN, showSide, readV, frame } from './h.mjs';
const b = await launch();
for (const file of TEN) {
  const o = await openIn(b, stateFileAt(file));
  await showSide(o.page, 'Validation');
  await o.page.waitForSelector('[data-testid="validation"] section[data-list]');
  await frame(o.page);
  const r = await readV(o.page);
  console.log(file.split('/').pop(), JSON.stringify(r.lists.map(l => l.entries.map(e => e[0] + (e[1] ? '' : '(no button)')))), o.problems.length ? o.problems : '');
  await o.context.close();
}
await b.close();
