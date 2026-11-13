import { loadWith, lib, clock } from '../wt-10/canvas/app/test/core.mjs';
import { TEN, EXAMPLE } from '../wt-10/canvas/app/test/helpers.mjs';
import fs from 'node:fs'; import path from 'node:path';
import { make } from './ref.mjs';
import { scaleState, middleService } from '../wt-10/canvas/test/scale-model.mjs';
const app = await loadWith('panels/fieldHooks');
const R = make(app, lib);
const open = (file) => { const mistakes = []; const s = app.openSession(lib, JSON.parse(fs.readFileSync(file, 'utf8')), { name: path.basename(file) }, { now: clock(), mistake: (e) => mistakes.push(e.message) }); s.mistakes = mistakes; return s; };
let total = 0, items = 0, skipped = [];
for (const file of TEN) {
  const s = open(file); const model = s.model; const viewId = model.views[0].id;
  const all = [].concat(model.elements.map((e) => ({ type: 'el', id: e.id })), model.relationships.map((r) => ({ type: 'rel', id: r.id })), model.views.map((v) => ({ type: 'view', id: v.id })));
  let n = 0;
  for (const p of all) {
    items += 1;
    const form = R.formOf(s, p, viewId);
    const rows = form.core.flatMap((g) => g.rows).concat(form.advanced).filter((r) => r.row === 'field');
    const names = rows.map((r) => r.field);
    if (new Set(names).size !== names.length) throw new Error('twice ' + names);
    for (const row of rows) {
      if (row.locked) { skipped.push(`${path.basename(file)} ${p.id} ${row.field}`); continue; }
      const before = JSON.stringify(model); const steps = s.history.steps.length;
      let value;
      if (row.type === 'bool') value = !row.value;
      else if (row.type === 'enum') value = row.choices.map((c) => c.value).find((v) => v !== row.value);
      else if (row.type === 'ref') { const o = R.optionsOf(s, p, row.field).find((x) => x.id !== row.value); if (!o) { skipped.push(`${path.basename(file)} ${p.id} ${row.field} (no other choice)`); continue; } value = o.id; }
      else if (row.type === 'number') value = row.value === 42 ? 43 : 42;
      else value = R.readText(lib.FIELDS[row.field], row.value + (lib.FIELDS[row.field].trim ? '  xy  ' : 'xy'));
      const typed = ['string', 'text', 'number'].includes(row.type);
      const key = typed ? app.fieldKey(row.field, p.id) : undefined;
      const touched = R.changeField(s, p, row.field, value, key);
      if (!touched) throw new Error('no change ' + p.id + ' ' + row.field);
      if (typed) R.endTyping(s, key);
      if (s.history.steps.length !== steps + 1) throw new Error('steps');
      const after = JSON.stringify(model);
      s.history.undo(); if (JSON.stringify(model) !== before) throw new Error('undo ' + p.id + ' ' + row.field);
      s.history.redo(); if (JSON.stringify(model) !== after) throw new Error('redo');
      s.history.undo();
      n += 1;
    }
  }
  total += n;
  console.log(path.basename(file), 'items', all.length, 'fields changed', n, 'mistakes', s.mistakes.length);
}
console.log('items', items, 'total', total, 'skipped', skipped.length, skipped.slice(0, 12));
// pinned forms of the example
const s = open(EXAMPLE);
const brief = (f) => ({ what: f.what, title: f.title, core: f.core.map((g) => g.name + ': ' + g.rows.map((r) => (r.row === 'field' ? `[${r.field}=${JSON.stringify(r.value)}${r.choice ? '/' + r.choice.label : ''}${r.locked ? ' LOCKED' : ''}]` : r.row === 'known' ? `${r.label}=${JSON.stringify(r.value)}` : `${r.label}:nh`)).join(' ; ')), adv: f.advanced.map((r) => (r.row === 'field' ? `[${r.field}]` : r.row === 'known' ? `${r.label}=${JSON.stringify(r.value)}` : `${r.label}:nh`)).join(' ; ') });
for (const p of [{ type: 'el', id: 'Host' }, { type: 'el', id: 'ServerHost' }, { type: 'el', id: 'Page.hosts' }, { type: 'el', id: 'Page.hosts.api' }, { type: 'rel', id: 'mount' }, { type: 'rel', id: 't-hosts' }, { type: 'view', id: 'v-proof' }]) console.log(JSON.stringify(brief(R.formOf(s, p, 'v-proof')), null, 1));
console.log(R.optionsOf(s, { type: 'el', id: 'Page.hosts' }, 'type'));
console.log(R.optionsOf(s, { type: 'el', id: 'ServerHost' }, 'specializes'));
// words
const say = (p, f, v, key) => { R.changeField(s, p, f, v, key); if (key) R.endTyping(s, key); const st = s.history.steps; return st[st.length - 1].what + ' | ' + s.changes[s.changes.length - 1].text; };
console.log(say({ type: 'el', id: 'Page.hosts' }, 'name', 'hostsx', 'name:Page.hosts'));
console.log(say({ type: 'el', id: 'Page' }, 'abstract', true));
console.log(say({ type: 'el', id: 'Page' }, 'abstract', false));
console.log(say({ type: 'el', id: 'Page.hosts.api' }, 'conjugated', false));
console.log(say({ type: 'el', id: 'Page.hosts.api' }, 'conjugated', true));
console.log(say({ type: 'el', id: 'Page' }, 'doc', s.model.elements.find((e) => e.id === 'Page').doc + ' More.', 'doc:Page'));
console.log(say({ type: 'el', id: 'Page.app' }, 'multiplicity', '1..2', 'multiplicity:Page.app'));
console.log(say({ type: 'el', id: 'Page.app' }, 'multiplicity', '', 'multiplicity:Page.app'));
console.log(say({ type: 'rel', id: 'mount' }, 'name', 'mountx', 'name:mount'));
console.log(say({ type: 'rel', id: 'mount' }, 'name', '', 'name:mount'));
console.log(say({ type: 'rel', id: 'mount' }, 'doc', 'A doc.', 'doc:mount'));
console.log(say({ type: 'view', id: 'v-proof' }, 'name', 'proofStructureXy', 'name:v-proof'));
console.log(say({ type: 'view', id: 'v-proof' }, 'name', '  ', 'name:v-proof'));
console.log(say({ type: 'view', id: 'v-proof' }, 'doc', 'Why.', 'doc:v-proof'));
console.log(say({ type: 'el', id: 'Page.hosts' }, 'type', 'ServerHost'));
console.log(say({ type: 'el', id: 'Page.hosts' }, 'typeLine', false));
console.log(say({ type: 'el', id: 'Page.hosts' }, 'typeLine', true));
console.log(say({ type: 'el', id: 'Page.hosts' }, 'type', ''));
console.log(say({ type: 'el', id: 'Page.hosts' }, 'type', 'Host'));
console.log(JSON.stringify(s.model.relationships.at(-1)));
console.log(say({ type: 'el', id: 'ServerHost' }, 'specializes', 'App'));
console.log(say({ type: 'el', id: 'ServerHost' }, 'specializes', ''));
console.log(say({ type: 'el', id: 'Host' }, 'name', '', 'name:Host'));
console.log('mistakes', s.mistakes);
// other files' words
const w = (file, p, f, v, key) => { const t = open(TEN.find((x) => x.endsWith(file))); R.changeField(t, p, f, v, key); const st = t.history.steps; console.log(file, st.length ? st[st.length - 1].what : null, t.mistakes); return t; };
w('geometry.json', { type: 'el', id: 'room' }, 'length', 9, 'length:room');
w('geometry.json', { type: 'el', id: 'room' }, 'length', '', 'length:room');
w('geometry.json', { type: 'el', id: 'room' }, 'shape', 'Sphere');
w('geometry.json', { type: 'el', id: 'room' }, 'shape', '');
w('interconnection.json', { type: 'rel', id: 'command' }, 'item', 'Fuel');
w('interconnection.json', { type: 'rel', id: 'command' }, 'item', '');
w('interconnection.json', { type: 'rel', id: 'fuelLine' }, 'interfaceDef', 'CtrlLink');
w('interconnection.json', { type: 'el', id: 'FuelPort.supply' }, 'direction', 'in');
w('behavior-states.json', { type: 'el', id: 'HostLifecycle.running' }, 'parallel', false);
w('behavior-states.json', { type: 'el', id: 'HostLifecycle' }, 'parallel', true);
w('behavior-states.json', { type: 'rel', id: 't-mount' }, 'guard', 'ready', 'guard:t-mount');
w('behavior-actions.json', { type: 'el', id: 'Release.compile' }, 'actionKind', 'send');
w('sequence.json', { type: 'rel', id: 'm-login' }, 'order', 5, 'order:m-login');
{ const t = open(TEN.find((x) => x.endsWith('behavior-states.json'))); console.log(JSON.stringify(brief(R.formOf(t, { type: 'el', id: 'HostLifecycle' }, 'v-host'))), R.formOf(t, { type: 'el', id: 'HostLifecycle' }, 'v-host').core[0].rows.find((r) => r.field === 'parallel').locked); console.log(JSON.stringify(brief(R.formOf(t, { type: 'el', id: 'HostLifecycle.initial' }, 'v-host')))); }
{ const t = open(TEN.find((x) => x.endsWith('geometry.json'))); for (const v of ['v-plan', 'v-structure', null]) console.log(v, R.formOf(t, { type: 'el', id: 'room' }, v).core.map((g) => g.name + ':' + g.rows.filter((r) => r.row === 'field').map((r) => r.field + '=' + JSON.stringify(r.value)).join(','))); console.log('Room def', R.formOf(t, { type: 'el', id: 'Room' }, 'v-plan').core.map((g) => g.name)); }
{ const t = open(TEN.find((x) => x.endsWith('sequence.json'))); console.log(JSON.stringify(brief(R.formOf(t, { type: 'rel', id: 'm-login' }, 'v-seq')))); }
// scale
const big = app.openSession(lib, JSON.parse(JSON.stringify(scaleState(5000))), { name: 'scale.json' });
const id = middleService(5000);
const time = (name, fn, n = 100) => { fn(); const t0 = performance.now(); for (let i = 0; i < n; i++) fn(); console.log(name, ((performance.now() - t0) / n).toFixed(2), 'ms'); };
time('formOf Service', () => R.formOf(big, { type: 'el', id }, 'v-definitions'));
const usage = big.model.elements.find((e) => e.kind === 'PartUsage');
time('formOf usage', () => R.formOf(big, { type: 'el', id: usage.id }, 'v-definitions'));
time('formOf view', () => R.formOf(big, { type: 'view', id: 'v-definitions' }, 'v-definitions'));
time('optionsOf type', () => R.optionsOf(big, { type: 'el', id: usage.id }, 'type'), 20);
let k = 0; time('changeField name keyed', () => R.changeField(big, { type: 'el', id }, 'name', 'S' + (k++), 'name:' + id), 50);
const sp = big.model.elements.find((e) => lib.firstGeneral(big.model, e));
console.log('specializer', sp && sp.id);
if (sp) time('optionsOf specializes', () => R.optionsOf(big, { type: 'el', id: sp.id }, 'specializes'), 20);
