import { lib, stateFiles, readJSON, loadWith, clock, plain } from '../rd-all/canvas/app/test/core.mjs';
import { make } from './ref.mjs';
const app = await loadWith('panels/fieldHooks');
const R = make(app);
let forms = 0, changes = 0, locked = [], skipped = [], problems = [];
for (const f of stateFiles()) {
  const mistakes = [];
  const s = app.openSession(lib, readJSON(f.file), { name: f.name }, { now: clock(), mistake: (e) => mistakes.push(e) });
  const front = s.model.views[0].id;
  const items = [...s.model.elements.map((e) => ({ type: 'el', id: e.id })), ...s.model.relationships.map((e) => ({ type: 'rel', id: e.id })), ...s.model.views.map((e) => ({ type: 'view', id: e.id }))];
  for (const p of items) {
    const form = R.formOf(s, p, front); forms++;
    const rows = [...form.core.flatMap((g) => g.rows), ...form.advanced].filter((r) => r.row === 'field');
    for (const r of rows) {
      if (r.locked) { locked.push(f.name + ' ' + p.id + ' ' + r.field); continue; }
      const spec = lib.FIELDS[r.field];
      let v; let typed = false;
      if (r.type === 'string' || r.type === 'text') { v = R.readText(spec, r.value + (spec.trim ? '  xy  ' : 'xy')); typed = true; }
      else if (r.type === 'number') { v = r.value === 42 ? 43 : 42; typed = true; }
      else if (r.type === 'bool') v = !r.value;
      else if (r.type === 'enum') v = spec.values.find((x) => x !== r.value);
      else { const o = R.optionsOf(s, p, r.field).find((o) => o.id !== r.value); if (!o) { skipped.push(f.name + ' ' + p.id + ' ' + r.field); continue; } v = o.id; }
      const before = JSON.stringify(s.model); const steps = s.history.steps.length;
      const key = typed ? app.fieldKey(r.field, p.id) : undefined;
      const t = R.changeField(s, p, r.field, v, key); if (typed) R.endTyping(s, key);
      const where = f.name + ' ' + p.id + ' ' + r.field;
      if (!t) { problems.push('null ' + where); continue; }
      if (s.history.steps.length !== steps + 1 || s.history.steps.at(-1).key !== null) problems.push('steps ' + where);
      if (s.history.changes.at(-1).text !== s.history.steps.at(-1).what) problems.push('log ' + where);
      const now = R.formOf(s, p, front); const nr = [...now.core.flatMap((g) => g.rows), ...now.advanced].find((x) => x.field === r.field);
      if (!nr) { if (!(['specializes', 'subsets'].includes(r.field) && v === '')) problems.push('row gone ' + where); }
      else if (nr.value !== v) problems.push('value ' + where + ' ' + JSON.stringify(nr.value) + ' vs ' + JSON.stringify(v));
      const after = JSON.stringify(s.model);
      s.history.undo(); if (JSON.stringify(s.model) !== before) problems.push('undo ' + where);
      s.history.redo(); if (JSON.stringify(s.model) !== after) problems.push('redo ' + where);
      s.history.undo(); changes++;
    }
  }
  if (mistakes.length) problems.push('mistakes ' + f.name + ' ' + mistakes.map(String));
}
console.log({ forms, changes, locked, skipped, problems });
