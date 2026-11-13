import { clock, lib, loadCore } from '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-9/canvas/app/test/core.mjs';
import { mergedFixtures } from './merged.mjs';
const core = await loadCore();
const state = { model: mergedFixtures(lib), notes: [], archive: [] };
const s = core.openText(lib, JSON.stringify(state), { name: 'fields.json' }, { now: clock() });
const m = s.model;
const rows = lib.browserRows(m, { options: { roots: null, collapsed: [] } });
const top = rows.filter(r => r.depth === 0);
console.log('elements', m.elements.length, 'rels', m.relationships.length, 'views', m.views.length, 'lib rows', rows.length, 'top rows', top.length, 'inside package', top.length + m.views.length);
const direct = [...m.views.map(v => 'view:' + v.id), ...top.map(r => r.type + ':' + r.id)];
console.log('beyond the first 200 inside the package:', direct.slice(200).length, direct.slice(200, 215));
console.log('views', m.views.map(v => v.id + ':' + v.kind).join(' '));
// which rows does step 10 pick? rels with rows beyond 200
const beyond = new Set(direct.slice(200));
console.log('rel kinds beyond', [...new Set(direct.slice(200).map(x => { const r = m.relationships.find(y => 'rel:' + y.id === x); return r ? r.kind : x; }))]);
const firstOfKind = {}; for (const r of m.relationships) if (!(r.kind in firstOfKind)) firstOfKind[r.kind] = r.id;
console.log('first rel of each kind and whether beyond 200:', Object.entries(firstOfKind).map(([k, id]) => k + ':' + id + ':' + (beyond.has('rel:' + id) ? 'BEYOND' : (direct.includes('rel:' + id) ? 'top' : 'nested'))).join('\n  '));
