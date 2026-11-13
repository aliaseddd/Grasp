const core = await import('./wt/canvas/app/test/core.mjs');
const { scaleState } = await import('./wt/canvas/test/scale-model.mjs');
const m = await core.loadCore();
const s = m.openText(core.lib, JSON.stringify(scaleState(5000)), { name: 'big.json' });
const sel = m.selectionOf(s);
const ids = s.model.elements.slice(-500).map((e) => e.id);
for (let run = 0; run < 3; run++) {
  const t = performance.now();
  for (let k = 0; k < 4; k++) for (const id of ids) { sel.set([{ type: 'el', id }]); sel.has('el', id); }
  console.log('2,000 picks with an index kept: ms', (performance.now() - t).toFixed(1));
}
