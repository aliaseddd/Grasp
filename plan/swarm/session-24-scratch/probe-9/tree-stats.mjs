import { scaleState } from '../wt-9/canvas/test/scale-model.mjs';
import { loadLib } from '../wt-9/canvas/export.mjs';
import fs from 'node:fs';
const lib = loadLib();
function stats(name, model) {
  const t0 = performance.now();
  const rows = lib.browserRows(model, { options: { roots: null, collapsed: [] } });
  const t1 = performance.now();
  const kids = new Map();
  const open = [];
  let top = 0;
  for (const row of rows) {
    open.length = row.depth;
    const parent = row.depth ? open[row.depth - 1] : '';
    kids.set(parent, (kids.get(parent) || 0) + 1);
    if (row.type === 'el') open.push('el:' + row.id); else open.push('rel:' + row.id);
  }
  const counts = [...kids.entries()].sort((a, b) => b[1] - a[1]);
  console.log(name, 'elements', model.elements.length, 'rels', model.relationships.length, 'views', model.views.length, 'rows', rows.length, 'ms', (t1 - t0).toFixed(1),
    'top', kids.get(''), 'maxKids', counts.slice(0, 4), 'maxDepth', Math.max(...rows.map(r => r.depth)), 'el rows', rows.filter(r => r.type === 'el').length, 'rel rows', rows.filter(r=>r.type==='rel').length,
    'tail rels', rows.filter(r => r.type === 'rel' && r.depth === 0).length);
}
const s = scaleState(5000);
stats('scale', lib.normalize(s.model));
for (const f of ['../wt-9/canvas/examples/stronghold-proof.json', ...fs.readdirSync('../wt-9/canvas/test/fixtures').filter(n => n.endsWith('.json')).map(n => '../wt-9/canvas/test/fixtures/' + n), '../wt-9/canvas/state.json']) {
  stats(f.split('/').pop(), lib.normalize(JSON.parse(fs.readFileSync(f, 'utf8')).model));
}
