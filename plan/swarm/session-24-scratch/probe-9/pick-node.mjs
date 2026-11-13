const core = await import('./wt/canvas/app/test/core.mjs');
const { scaleState } = await import('./wt/canvas/test/scale-model.mjs');
const m = await core.loadCore();
const lib = core.lib;
const s = m.openText(lib, JSON.stringify(scaleState(5000)), { name: 'big.json' });
const sel = m.selectionOf(s);
const ids = s.model.elements.slice(-500).map((e) => e.id);
const rels = s.model.relationships.slice(-500).map((e) => e.id);
let t = performance.now();
for (const id of ids) sel.set([{ type: 'el', id }]);
console.log('500 set() of late elements, Sets of all ids made at each: ms', (performance.now() - t).toFixed(0));
t = performance.now();
for (const id of ids) sel.toggle({ type: 'el', id });
console.log('500 toggle() of late elements, searched with some(): ms', (performance.now() - t).toFixed(0));
// an index kept
const index = new Set(s.model.elements.map((e) => e.id));
t = performance.now();
let n = 0; for (const id of ids) { if (index.has(id)) n++; }
console.log('500 lookups in a kept index: ms', (performance.now() - t).toFixed(2));
t = performance.now(); const idx2 = new Map(s.model.elements.map((e) => [e.id, e])); const idx3 = new Set(s.model.relationships.map((e) => e.id)); console.log('making the index once: ms', (performance.now() - t).toFixed(2));
