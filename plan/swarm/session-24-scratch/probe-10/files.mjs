import { TEN, modelOf, lib } from '../wt-10/canvas/app/test/helpers.mjs';
import path from 'node:path';
for (const f of TEN) {
  const m = modelOf(f);
  const kinds = (list) => { const c = {}; list.forEach((x) => { c[x.kind] = (c[x.kind] || 0) + 1; }); return Object.entries(c).map(([k, n]) => `${k}:${n}`).join(' '); };
  console.log(path.basename(f), 'els', m.elements.length, 'rels', m.relationships.length, 'views', m.views.map((v) => `${v.id}/${v.kind}/${Object.keys(v.layout).length}`).join(' '));
  console.log('   ', kinds(m.elements));
  console.log('   ', kinds(m.relationships), 'hidden', m.relationships.filter((r) => r.hidden).length);
}
