import { loadWith, lib, clock } from '../wt-10/canvas/app/test/core.mjs';
import { TEN, EXAMPLE } from '../wt-10/canvas/app/test/helpers.mjs';
import fs from 'node:fs'; import path from 'node:path';
import { make } from './ref.mjs';
const app = await loadWith('panels/fieldHooks');
const R = make(app, lib);
const open = (name) => { const file = name === 'example' ? EXAMPLE : TEN.find((f) => f.endsWith(name)); const s = app.openSession(lib, JSON.parse(fs.readFileSync(file, 'utf8')), { name }, { now: clock() }); return s; };
const ic = open('interconnection.json');
const sup = ic.model.elements.find((e) => e.id === 'FuelPort.supply');
console.log(JSON.stringify(sup), lib.typingOf(ic.model, sup));
console.log(JSON.stringify(ic.model.elements.find((e) => e.id === 'Fuel')));
const f = R.formOf(ic, { type: 'el', id: 'FuelPort.supply' }, 'v-ic');
console.log(f.core.map((g) => g.name + ':' + g.rows.map((r) => r.field || r.name).join(',')), f.advanced.filter((r) => r.row === 'field').map((r) => r.field));
console.log(R.optionsOf(ic, { type: 'el', id: 'FuelPort.supply' }, 'type'), R.optionsOf(ic, { type: 'rel', id: 'command' }, 'item'), R.optionsOf(ic, { type: 'rel', id: 'fuelLine' }, 'interfaceDef'));
console.log(R.formOf(ic, { type: 'el', id: 'Fuel' }, 'v-ic').advanced.filter((r) => r.row === 'field').map((r) => r.field + '=' + r.value));
// example scenarios
const s = open('example');
const P = (id) => ({ type: 'el', id });
console.log('Host specializes row?', R.formOf(s, P('Host'), 'v-proof').core.map((g) => g.name), R.optionsOf(s, P('Host'), 'specializes'), R.optionsOf(s, P('Host'), 'name'));
s.history.edit(() => { s.model.relationships.push({ id: 'sub', kind: 'Specialization', from: 'Page.hosts', to: 'Page.app' }); return 'test'; });
console.log(R.formOf(s, P('Page.hosts'), 'v-proof').core.find((g) => g.name === 'general'));
R.changeField(s, P('Page.hosts'), 'subsets', ''); console.log(s.history.steps.at(-1).what);
s.history.undo(); console.log('same value', R.changeField(s, P('Page.hosts'), 'subsets', 'Page.app'));
s.history.edit(() => { s.model.relationships.push({ id: 'sub2', kind: 'Specialization', from: 'Page.hosts', to: 'Page.app' }); return 'test2'; });
R.changeField(s, P('Page.hosts'), 'subsets', ''); console.log(s.model.relationships.filter((r) => r.from === 'Page.hosts' && r.kind === 'Specialization').map((r) => r.id));
// StrongholdApp typing
const t = open('example');
t.history.edit(() => { lib.typingOf(t.model, t.model.elements.find((e) => e.id === 'Page.hosts')).to = 'StrongholdApp'; return 'moved'; });
console.log(R.optionsOf(t, P('Page.hosts'), 'type').map((o) => o.id), R.formOf(t, P('Page.hosts'), 'v-proof').core.find((g) => g.name === 'typing').rows[0]);
// gone
console.log(R.formOf(t, P('nope'), null), R.optionsOf(t, P('nope'), 'type'), R.changeField(t, P('nope'), 'name', 'x'), R.changeField(t, P('Host'), 'multiplicity', '1'), R.changeField(t, P('Host'), 'code', []), R.changeField(ic, P('FuelPort.supply'), 'direction', 'sideways'));
// run test 9
const u = open('example');
for (const v of ['HostX', 'HostXy', 'HostXyz']) R.changeField(u, P('Host'), 'name', v, 'name:Host');
console.log(u.history.steps.length, u.history.steps.at(-1).key, u.history.steps.at(-1).what, u.changes.length);
R.endTyping(u, 'doc:Host'); console.log(u.history.steps.at(-1).key);
R.endTyping(u, 'name:Host'); console.log(u.history.steps.at(-1).key, u.changes.at(-1).text);
R.changeField(u, P('Host'), 'name', 'HostXyz!', 'name:Host'); R.changeField(u, P('Host'), 'name', 'HostXyz', 'name:Host'); R.endTyping(u, 'name:Host'); console.log(u.history.steps.length);
R.changeField(u, P('Host'), 'name', 'A', 'name:Host'); R.changeField(u, P('Host'), 'doc', 'B', 'doc:Host'); console.log(u.history.steps.length, u.history.steps.map((x) => x.key));
// kinds label for the walk's failure words
console.log(lib.KINDS.StateDefinition.label, lib.RELATIONSHIPS.Message.label, lib.VIEW_KINDS.GridView.label);
// exposedElement in geometry etc: skip. scale: Service1 specializes?
