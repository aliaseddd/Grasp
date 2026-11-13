import { lib, stateFiles, readJSON } from '../rd-all/canvas/app/test/core.mjs';
const F = lib.FIELDS;
for (const [k, v] of Object.entries(F)) console.log(k, JSON.stringify({ ...v, options: v.options ? 'fn' : undefined, read: v.read ? 'fn' : undefined, fresh: v.fresh ? 'fn': undefined }));
console.log('--- KINDS');
for (const [k, v] of Object.entries(lib.KINDS)) console.log(k, v.label, JSON.stringify(v.fields), v.definedBy);
console.log('--- RELS');
for (const [k, v] of Object.entries(lib.RELATIONSHIPS)) console.log(k, v.label, JSON.stringify(v.fields));
console.log('--- VIEWS');
for (const [k, v] of Object.entries(lib.VIEW_KINDS)) console.log(k, v.label, JSON.stringify(v.fields), v.renderer);
let n = 0;
for (const f of stateFiles()) { const m = lib.normalize(readJSON(f.file).model); const c = m.elements.length + m.relationships.length + m.views.length; n += c; console.log(f.name, m.elements.length, m.relationships.length, m.views.length, m.views.map(v=>v.id+':'+v.kind).join(' ')); }
console.log('items', n);
