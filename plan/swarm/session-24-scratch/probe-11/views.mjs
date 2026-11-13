import { loadCore, lib, stateFiles, readJSON } from '../wt-11/canvas/app/test/core.mjs';
const core = await loadCore();
for (const f of stateFiles()) {
  const model = JSON.parse(JSON.stringify(lib.normalize(readJSON(f.file).model)));
  console.log('\n==', f.name, 'elements', model.elements.length, 'rels', model.relationships.length);
  for (const v of model.views) {
    const drawn = core.isDrawn(lib, v.kind);
    console.log(' view', v.id, v.name, v.kind, drawn ? 'DRAWN' : '', 'places', Object.keys(v.layout).length);
    if (!drawn) continue;
    const p = core.project(lib, model, v);
    console.log('   bounds', JSON.stringify(p.bounds));
    for (const n of p.nodes) { const el = model.elements.find(e => e.id === n.id); const r = p.rects.get(n.id); console.log('   ', n.id, '|', el.kind, '|', el.name, '| owner', el.owner, '|', Math.round(r.x), Math.round(r.y), Math.round(r.w), Math.round(r.h)); }
    for (const e of p.edges) { const r = model.relationships.find(x => x.id === e.id); console.log('   rel', r.id, r.kind, r.from, '->', r.to); }
  }
  console.log('  validate', JSON.stringify(lib.validate(model)).slice(0, 300));
}
