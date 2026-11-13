import { lib, stateFiles, readJSON, loadWith, clock, plain, EXAMPLE, FIXTURES } from '../rd-all/canvas/app/test/core.mjs';
import { make } from './ref.mjs';
import path from 'node:path';
const app = await loadWith('panels/fieldHooks');
const R = make(app);
const open = (file) => { const mistakes = []; const s = app.openSession(lib, readJSON(file), { name: path.basename(file) }, { now: clock(), mistake: (e) => mistakes.push(e) }); s.mistakes = mistakes; return s; };
const fx = (n) => path.join(FIXTURES, n + '.json');
const row = (form, field) => { if (!form) return null; for (const g of form.core) for (const r of g.rows) if (r.field === field) return { ...r, group: g.name }; for (const r of form.advanced) if (r.field === field) return { ...r, group: 'advanced' }; return null; };
const el = (id) => ({ type: 'el', id }), rel = (id) => ({ type: 'rel', id }), view = (id) => ({ type: 'view', id });
const last = (s) => [s.history.steps.at(-1)?.what, s.history.steps.at(-1)?.key, s.history.changes.at(-1)?.text, s.history.steps.length, s.history.changes.length];
console.log('--- test 3');
{ const s = open(fx('geometry'));
  for (const v of ['v-plan', 'v-structure', null]) { const f = R.formOf(s, el('room'), v); const g = f.core.find((g) => g.name === 'geometry'); console.log(v, g ? g.rows.map((r) => r.field + '=' + JSON.stringify(r.value)).join(' ') : 'no geometry'); }
  const m = s.model;
  console.log(R.viewKindFor(m, 'room', 'v-plan'), R.viewKindFor(m, 'room', 'v-structure'), R.viewKindFor(m, 'room', null), R.viewKindFor(m, 'room', 'no-such-view'), '| Room', R.viewKindFor(m, 'Room', 'v-plan'), '| nothing', R.viewKindFor(m, 'zzz', 'v-plan'), R.viewKindFor(m, 'zzz', null));
  console.log('layouts', m.views.map((v) => v.id + ':' + Object.keys(v.layout).join(',')));
}
console.log('--- test 4');
{ const s = open(EXAMPLE); const p = el('Page.hosts'); const before = JSON.stringify(s.model);
  console.log(JSON.stringify(row(R.formOf(s, p, 'v-proof'), 'type')), JSON.stringify(row(R.formOf(s, p, 'v-proof'), 'typeLine')));
  const typings = () => JSON.stringify(s.model.relationships.filter((r) => r.kind === 'FeatureTyping' && r.from === 'Page.hosts').map((r) => [r.id, r.to]));
  console.log(R.changeField(s, p, 'type', 'ServerHost'), typings(), last(s));
  console.log(R.changeField(s, p, 'typeLine', false), JSON.stringify(s.model.relationships.find((r) => r.id === 't-hosts')), last(s));
  console.log(R.changeField(s, p, 'typeLine', true), JSON.stringify(s.model.relationships.find((r) => r.id === 't-hosts')), last(s));
  console.log(R.changeField(s, p, 'type', ''), typings(), last(s), row(R.formOf(s, p, 'v-proof'), 'typeLine'), JSON.stringify(row(R.formOf(s, p, 'v-proof'), 'type')));
  console.log(R.changeField(s, p, 'type', 'Host'), typings(), last(s), JSON.stringify(s.model.relationships.at(-1)), Object.keys(s.model.relationships.at(-1)), JSON.stringify(row(R.formOf(s, p, 'v-proof'), 'typeLine')));
  for (let i = 0; i < 5; i++) s.history.undo();
  console.log('undone equal', JSON.stringify(s.model) === before, s.history.steps.length);
  console.log(R.changeField(s, p, 'type', 'Host'), s.history.steps.length, s.mistakes);
}
console.log('--- test 5');
{ const s = open(EXAMPLE);
  console.log(row(R.formOf(s, el('Host'), 'v-proof'), 'specializes'), JSON.stringify(row(R.formOf(s, el('ServerHost'), 'v-proof'), 'specializes')));
  console.log(R.changeField(s, el('ServerHost'), 'specializes', 'App'), s.model.relationships.find((r) => r.id === 's-ServerHost')?.to, last(s));
  console.log(R.changeField(s, el('ServerHost'), 'specializes', ''), s.model.relationships.find((r) => r.id === 's-ServerHost'), last(s), row(R.formOf(s, el('ServerHost'), 'v-proof'), 'specializes'));
  s.history.edit(() => { s.model.relationships.push({ id: 'sub', kind: 'Specialization', from: 'Page.hosts', to: 'Page.app' }); return 'pushed'; });
  console.log(JSON.stringify(row(R.formOf(s, el('Page.hosts'), 'v-proof'), 'subsets')));
  console.log(R.changeField(s, el('Page.hosts'), 'subsets', ''), last(s));
  s.history.undo();
  console.log('same', R.changeField(s, el('Page.hosts'), 'subsets', 'Page.app'));
  s.history.edit(() => { s.model.relationships.push({ id: 'sub2', kind: 'Specialization', from: 'Page.hosts', to: 'Page.app' }); return 'pushed2'; });
  console.log(R.changeField(s, el('Page.hosts'), 'subsets', ''), s.model.relationships.filter((r) => r.from === 'Page.hosts' && r.kind === 'Specialization').map((r) => r.id), s.mistakes);
  console.log('opts hosts subsets', JSON.stringify(R.optionsOf(s, el('Page.hosts'), 'subsets')));
}
console.log('--- test 6');
{ const s = open(fx('behavior-states'));
  console.log(JSON.stringify(row(R.formOf(s, el('HostLifecycle'), null), 'parallel')), JSON.stringify(row(R.formOf(s, el('HostLifecycle.running'), null), 'parallel')));
  console.log(R.changeField(s, el('HostLifecycle'), 'parallel', true), s.history.steps.length);
  console.log(R.changeField(s, el('HostLifecycle.running'), 'parallel', false), last(s));
  const q = open(fx('sequence'));
  console.log(JSON.stringify(row(R.formOf(q, rel('m-login'), null), 'order')), R.changeField(q, rel('m-login'), 'order', 5, 'order:m-login'));
  console.log(q.model.relationships.filter((r) => r.kind === 'Message').map((r) => r.id + ':' + r.order));
}
