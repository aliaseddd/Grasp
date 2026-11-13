import { lib, stateFiles, readJSON, loadWith, clock, plain, EXAMPLE, FIXTURES } from '../rd-all/canvas/app/test/core.mjs';
import { make } from './ref.mjs';
import path from 'node:path';
const app = await loadWith('panels/fieldHooks');
const R = make(app);
const open = (file) => { const mistakes = []; const s = app.openSession(lib, readJSON(file), { name: path.basename(file) }, { now: clock(), mistake: (e) => mistakes.push(e) }); s.mistakes = mistakes; return s; };
const fx = (n) => path.join(FIXTURES, n + '.json');
const row = (form, field) => { if (!form) return null; for (const g of form.core) for (const r of g.rows) if (r.field === field) return { ...r, group: g.name }; for (const r of form.advanced) if (r.field === field) return { ...r, group: 'advanced' }; return null; };
const el = (id) => ({ type: 'el', id }), rel = (id) => ({ type: 'rel', id }), view = (id) => ({ type: 'view', id });
const typed = (s, p, f, v) => { const k = app.fieldKey(f, p.id); const t = R.changeField(s, p, f, v, k); R.endTyping(s, k); return [t ? 'ok' : null, s.history.steps.at(-1)?.what, s.history.changes.at(-1)?.text]; };
const at = (s, p, f, v) => { const t = R.changeField(s, p, f, v); return [t ? 'ok' : null, s.history.steps.at(-1)?.what, s.history.changes.at(-1)?.text]; };
console.log('--- test 7 example');
{ const s = open(EXAMPLE);
  console.log(typed(s, el('Page.hosts'), 'name', 'hostsx'));
  console.log(typed(s, rel('mount'), 'name', 'mountx'));
  console.log(typed(s, rel('mount'), 'name', ''));
  console.log(typed(s, view('v-proof'), 'name', 'proofStructureXy'));
  console.log(at(s, el('Page'), 'abstract', true), 'Page.abstract was', readJSON(EXAMPLE).model.elements.find((e) => e.id === 'Page').abstract);
  console.log(at(s, el('Page.hosts.api'), 'conjugated', false));
  console.log(typed(s, el('Page'), 'doc', 'x'));
  console.log(typed(s, rel('mount'), 'doc', 'x'));
  console.log(typed(s, view('v-proof'), 'doc', 'x'));
  console.log(at(s, el('Page.hosts'), 'type', 'ServerHost'));
  console.log(at(s, el('Page.hosts'), 'type', ''));
  console.log(at(s, el('ServerHost'), 'specializes', 'App'));
  console.log(typed(s, el('Page.app'), 'multiplicity', '1..2'));
  console.log(typed(s, el('Page.app'), 'multiplicity', ''));
  console.log(typed(s, view('v-proof'), 'name', '  '));
  console.log(typed(s, el('Host'), 'name', ''));
  console.log(s.mistakes);
}
{ const s = open(EXAMPLE); // fresh: are the example strings consistent on a fresh file?
  console.log('fresh', at(s, el('Page.hosts.api'), 'conjugated', false), at(s, el('Page.hosts'), 'typeLine', false), at(s, el('Page'), 'abstract', true), at(s, el('Page'), 'abstract', false));
}
console.log('--- other fixtures');
{ let s = open(fx('geometry')); console.log(typed(s, el('room'), 'length', 9), at(s, el('room'), 'shape', 'Sphere'), typed(s, el('room'), 'length', ''), JSON.stringify(s.model.elements.find((e) => e.id === 'room').length));
  s = open(fx('interconnection'));
  console.log(at(s, rel('command'), 'item', 'Fuel'), at(s, rel('command'), 'item', ''), at(s, rel('fuelLine'), 'interfaceDef', 'CtrlLink'), at(s, el('FuelPort.supply'), 'direction', 'in'), at(s, el('FuelPort.supply'), 'direction', 'sideways'));
  console.log('command.item was', readJSON(fx('interconnection')).model.relationships.find((r) => r.id === 'command').item, 'fuelLine.interfaceDef', readJSON(fx('interconnection')).model.relationships.find((r) => r.id === 'fuelLine').interfaceDef, 'supply.direction', readJSON(fx('interconnection')).model.elements.find((r) => r.id === 'FuelPort.supply').direction, 'Fuel.abstract', readJSON(fx('interconnection')).model.elements.find((r) => r.id === 'Fuel').abstract);
  console.log(JSON.stringify(R.optionsOf(s, rel('command'), 'item')), JSON.stringify(R.optionsOf(s, rel('fuelLine'), 'interfaceDef')), JSON.stringify(R.optionsOf(s, el('FuelPort.supply'), 'type')));
  console.log(JSON.stringify(row(R.formOf(s, el('FuelPort.supply'), null), 'type')), JSON.stringify(row(R.formOf(s, el('FuelPort.supply'), null), 'direction')));
  s = open(fx('behavior-states'));
  console.log(typed(s, rel('mount'), 'guard', 'ready'), JSON.stringify(s.model.relationships.find((r) => r.id === 'mount')));
  s = open(fx('behavior-actions'));
  console.log(at(s, el('Release.compile'), 'actionKind', 'send'), s.model.elements.filter((e) => /compile/.test(e.id)).map((e) => e.id + ':' + e.actionKind));
}
console.log('--- test 9');
{ const s = open(EXAMPLE); const p = el('Host'); const k = 'name:Host'; const H = s.history;
  for (const v of ['HostX', 'HostXy', 'HostXyz']) R.changeField(s, p, 'name', v, k);
  console.log(H.steps.length, H.steps.at(-1).key, H.steps.at(-1).what, 'log', H.changes.length, JSON.stringify(H.changes));
  R.endTyping(s, 'doc:Host'); console.log(H.steps.at(-1).key);
  R.endTyping(s, 'name:Host'); console.log(H.steps.at(-1).key, JSON.stringify(H.changes.at(-1)));
  R.endTyping(s, 'name:Host'); console.log(H.steps.length, H.changes.length);
  const before = JSON.stringify(s.model);
  R.changeField(s, p, 'name', 'HostXyz!', k); R.changeField(s, p, 'name', 'HostXyz', k); console.log('mid', H.steps.length, H.steps.at(-1).key); R.endTyping(s, k);
  console.log(H.steps.length, JSON.stringify(s.model) === before, H.changes.length);
  R.changeField(s, p, 'name', 'HostQ', k); R.changeField(s, p, 'doc', 'd', 'doc:Host');
  console.log(H.steps.length, H.steps.map((x) => x.key + '|' + x.what));
}
console.log('--- test 10');
{ const F = lib.FIELDS; const t = (f, x) => JSON.stringify(R.readText(F[f], x));
  console.log(t('name', '  a b '), t('multiplicity', '  0..1  '), t('doc', ' x\n'), ['42', ' 4.5 ', '-3', '1e3', '', '   ', 'abc', '1,5', 'Infinity', '0x10', '1.', '.5', '+3'].map((x) => t('length', x)).join(' '));
  const s = open(EXAMPLE); console.log(R.changeField(s, el('Page.hosts'), 'multiplicity', '1..*'), s.history.steps.length);
}
console.log('--- test 11');
{ const s = open(EXAMPLE);
  console.log(JSON.stringify(R.optionsOf(s, el('Page.hosts'), 'type')));
  console.log(JSON.stringify(R.optionsOf(s, el('ServerHost'), 'specializes')));
  s.history.edit(() => { s.model.elements.find((e) => e.id === 'App').name = ''; return 'x'; });
  console.log(JSON.stringify(R.optionsOf(s, el('Page.hosts'), 'type')));
  s.history.edit(() => { s.model.relationships.find((e) => e.id === 't-hosts').to = 'StrongholdApp'; return 'y'; });
  console.log(JSON.stringify(R.optionsOf(s, el('Page.hosts'), 'type')));
  console.log(JSON.stringify(R.optionsOf(s, el('Host'), 'name')), JSON.stringify(R.optionsOf(s, el('Host'), 'specializes')));
  console.log(s.model.elements.map((e) => e.id + ':' + e.kind).join(' '));
}
console.log('--- test 12');
{ const s = open(EXAMPLE);
  for (const t of ['el', 'rel', 'view']) console.log(R.formOf(s, { type: t, id: 'nope' }, null), R.optionsOf(s, { type: t, id: 'nope' }, 'type'), R.changeField(s, { type: t, id: 'nope' }, 'name', 'x'));
  s.history.edit(() => { const i = s.model.relationships.findIndex((r) => r.id === 'mount'); s.model.relationships.splice(i, 1); return 'gone'; });
  console.log(R.formOf(s, rel('mount'), null)); s.history.undo(); console.log(!!R.formOf(s, rel('mount'), null));
  console.log(R.changeField(s, el('Host'), 'multiplicity', '1'), R.changeField(s, el('Host'), 'code', []));
}
