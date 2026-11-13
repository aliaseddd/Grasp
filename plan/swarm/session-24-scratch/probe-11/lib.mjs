import { loadLib } from '../wt-11/canvas/export.mjs';
const M = loadLib();
for (const [k, v] of Object.entries(M.VIEW_KINDS)) console.log('VIEW', k, v.label, v.renderer, 'admits', JSON.stringify(v.admits), '\n   tools', JSON.stringify(v.tools));
for (const [k, v] of Object.entries(M.KINDS)) console.log('KIND', k, '|', v.label, '|', v.keyword, '| contains', JSON.stringify(v.contains), '| border', v.onBorder, '| defBy', v.definedBy, '| size', v.size, '| shape', v.shape, '| fields', v.fields.join(','), '| traits', (v.traits||[]).join(','), v.definition ? 'DEF' : v.usage ? 'USE' : '');
for (const [k, v] of Object.entries(M.RELATIONSHIPS)) console.log('REL', k, '|', v.label, '| fields', v.fields.join(','), '| hideable', v.hideable, '| line', JSON.stringify(v.line));
for (const [k, v] of Object.entries(M.FIELDS)) console.log('FIELD', k, v.type, v.stored, v.values ? JSON.stringify(v.values) : '', v.fresh ? 'fresh=' + JSON.stringify(v.fresh()) : '');
console.log(Object.keys(M).join(' '));
