import fs from 'node:fs';
import path from 'node:path';
const core = await import('./wt/canvas/app/test/core.mjs');
const { scaleState } = await import('./wt/canvas/test/scale-model.mjs');
const m = await core.loadWith('panels/explorerRows');
const lib = core.lib ?? (await import('./wt/canvas/export.mjs')).loadLib();
const open = (name, data) => m.openSession(lib, data, { name });
const ex = open('ex', JSON.parse(fs.readFileSync('./wt/canvas/examples/stronghold-proof.json', 'utf8')));
const rows = m.explorerRowsOf(ex);
const flat = [];
const walk = (item, depth) => { const w = rows.wordsOf(item.id); flat.push('  '.repeat(depth) + item.id + '  |' + (w ? w.kw + w.name + w.type : '-') + '|  label=' + item.label); item.children.forEach((c) => walk(c, depth + 1)); };
rows.items.forEach((i) => walk(i, 0));
console.log(flat.join('\n'));
console.log('unfolded', rows.unfolded);
for (const f of ['behavior-actions', 'behavior-states', 'interconnection', 'sequence']) {
  const s = open(f, JSON.parse(fs.readFileSync(`./wt/canvas/test/fixtures/${f}.json`, 'utf8')));
  const r = m.explorerRowsOf(s);
  const out = [];
  const w2 = (item, depth) => { const w = r.wordsOf(item.id); out.push('  '.repeat(depth) + (w ? w.kw + w.name + w.type : '-')); item.children.forEach((c) => w2(c, depth + 1)); };
  r.items.forEach((i) => w2(i, 0));
  console.log('---', f, '\n' + out.slice(0, 30).join('\n'));
}
// scale
const st = scaleState(5000);
let t = performance.now();
const big = open('big', st);
console.log('open session ms', (performance.now() - t).toFixed(1));
t = performance.now();
const br = m.explorerRowsOf(big);
console.log('first build ms', (performance.now() - t).toFixed(1), 'items under package', br.items[0].children.length, 'unfolded', br.unfolded);
let count = 0; const cnt = (i) => { count++; i.children.forEach(cnt); }; br.items.forEach(cnt); console.log('items in all', count);
// rename: relabel cost
const el = big.model.elements[0];
const times = [];
for (let i = 0; i < 20; i++) { t = performance.now(); big.history.edit(() => { el.name = el.name + 'x'; return 'Renamed'; }, 'name:' + el.id); times.push(performance.now() - t); }
console.log('rename edit incl. listeners ms', times.map((x) => x.toFixed(2)).join(' '), 'words', br.wordsOf('el:' + el.id));
// structural
t = performance.now(); big.history.edit(() => { big.model.elements.push({ id: 'NewOne', kind: 'PartDefinition', name: 'NewOne', doc: '' }); return 'Added'; }, null); console.log('structural edit ms', (performance.now() - t).toFixed(1), 'built', br.built);
t = performance.now(); br.showMore('package:'); console.log('show more ms', (performance.now() - t).toFixed(1), br.items[0].children.length, br.wordsOf('more:package:'));
// move: no cost
const v = big.model.views[0]; const id0 = Object.keys(v.layout)[0];
t = performance.now(); big.history.edit(() => { v.layout[id0].x += 5; return 'Moved'; }, null); console.log('move edit ms', (performance.now() - t).toFixed(2), 'built', br.built);
