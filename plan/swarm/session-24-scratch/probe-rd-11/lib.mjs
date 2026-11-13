import { lib } from '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-all/canvas/app/test/core.mjs';
for (const [k, v] of Object.entries(lib.VIEW_KINDS)) console.log(k, v.renderer, JSON.stringify(v.label), v.tools.join(' '));
for (const [k, v] of Object.entries(lib.KINDS)) console.log(k, JSON.stringify(v.label), 'contains', JSON.stringify(v.contains), 'onBorder', v.onBorder, 'size', JSON.stringify(v.size), 'fields', JSON.stringify(v.fields));
for (const [k, v] of Object.entries(lib.RELATIONSHIPS)) console.log(k, JSON.stringify(v.label), JSON.stringify(v.fields), 'hideable', v.hideable);
console.log(Object.entries(lib.FIELDS).map(([k,v])=>k+':'+JSON.stringify(v)).join('\n'));
console.log(lib.definable());
console.log(Object.keys(lib).join(' '));
