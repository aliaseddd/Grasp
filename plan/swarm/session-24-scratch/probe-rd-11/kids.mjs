import { lib, open, fx, EXAMPLE, plain } from './port.mjs';
const T = [[EXAMPLE, ['Host', 'App']], [fx('interconnection.json'), ['Tank', 'CtrlPort']], [fx('behavior-actions.json'), ['Release', 'Release.test', 'Release.lint', 'Release.publish']], [fx('behavior-states.json'), ['HostLifecycle', 'HostLifecycle.loading']]];
for (const [f, ids] of T) { const s = open(f); for (const id of ids) console.log(id, plain(lib.childrenOf(s.model, id)).map((e) => e.id.split('.').pop() + ':' + e.kind).join(', ') || 'NO CHILDREN'); }
const g = open(fx('grid.json')); console.log(g.model.views.map((v) => v.id + ':' + v.name + ':' + v.kind).join(', '));
const q = open(fx('sequence.json')); console.log(q.model.views.map((v) => v.id + ':' + v.name + ':' + v.kind).join(', '));
console.log(lib.an('grid view', true), lib.an('sequence view', true), lib.an('interconnection view', true), lib.an('action flow view', true));
