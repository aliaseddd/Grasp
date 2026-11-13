import { loadLib } from '../wt-10/canvas/export.mjs';
const M = loadLib();
console.log('FIELDS', Object.keys(M.FIELDS).length);
for (const [k, v] of Object.entries(M.FIELDS)) {
  const o = { ...v };
  for (const key of Object.keys(o)) if (typeof o[key] === 'function') o[key] = 'fn';
  console.log(k, JSON.stringify(o));
}
console.log('KINDS');
for (const [k, v] of Object.entries(M.KINDS)) console.log(k, v.metaclass, '|', v.label, '|', v.fields.join(','), '| def', v.definition, 'usage', v.usage, 'definedBy', v.definedBy, 'onBorder', v.onBorder);
console.log('RELS');
for (const [k, v] of Object.entries(M.RELATIONSHIPS)) console.log(k, v.metaclass, '|', v.label, '|', v.fields.join(','), 'hideable', v.hideable);
console.log('VIEWS');
for (const [k, v] of Object.entries(M.VIEW_KINDS)) console.log(k, v.renderer, '|', v.label, '|', v.fields.join(','), JSON.stringify(v.options));
