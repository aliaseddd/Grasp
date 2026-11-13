import { loadWith, lib, clock } from '../wt-10/canvas/app/test/core.mjs';
import { merged } from './merged.mjs';
import { make } from './ref.mjs';
const app = await loadWith('panels/fieldHooks');
const R = make(app, lib);
const s = app.openSession(lib, { model: merged(), notes: [], archive: [] }, { name: 'fields.json' }, { now: clock() });
const model = s.model;
const table = (type) => (type === 'el' ? lib.KINDS : type === 'rel' ? lib.RELATIONSHIPS : lib.VIEW_KINDS);
const list = (type) => (type === 'el' ? model.elements : type === 'rel' ? model.relationships : model.views);
const front0 = model.views[0].id;
let grand = 0;
for (const type of ['el', 'rel', 'view']) {
  for (const kind of Object.keys(table(type))) {
    const left = new Set(table(type)[kind].fields.filter((f) => f !== 'code' && f !== 'order'));
    const n0 = left.size; const used = [];
    for (const item of list(type).filter((x) => x.kind === kind)) {
      if (!left.size) break;
      const fronts = [front0].concat(model.views.filter((v) => [...left].some((f) => (lib.FIELDS[f].views || []).includes(v.kind)) && v.layout[item.id]).map((v) => v.id));
      for (const front of fronts) {
        if (!left.size) break;
        const form = R.formOf(s, { type, id: item.id }, type === 'view' ? item.id : front);
        const rows = form.core.flatMap((g) => g.rows).concat(form.advanced).filter((r) => r.row === 'field');
        for (const f of [...left]) {
          const row = rows.find((r) => r.field === f);
          if (!row || row.locked) continue;
          if (row.type === 'ref') { const o = R.optionsOf(s, { type, id: item.id }, f).filter((x) => x.id !== row.value && x.id !== ''); if (!o.length && row.value === '') continue; }
          left.delete(f); used.push(`${f}@${item.id}${front !== front0 ? '/' + front : ''}`);
        }
      }
    }
    grand += n0 - left.size;
    console.log(type, kind, n0, left.size ? 'LEFT ' + [...left] : 'ok', '|', [...new Set(used.map((u) => u.split('@')[1]))].join(' '));
  }
}
console.log('fields', grand);
