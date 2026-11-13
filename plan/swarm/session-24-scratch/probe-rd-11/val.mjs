import { lib, open, fx, EXAMPLE, plain } from './port.mjs';
for (const f of [EXAMPLE, fx('interconnection.json'), fx('behavior-actions.json'), fx('behavior-states.json')]) { const s = open(f); const v = plain(lib.validate(s.model)); console.log(f.split('/').pop(), Array.isArray(v), v.length, JSON.stringify(v).slice(0, 300)); console.log(' notes', s.notes.length); }
console.log(lib.FIELDS.code.fresh?.toString());
