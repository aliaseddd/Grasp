import { core, M, open, fx, place, draw, plain } from './port.mjs';
import { EXAMPLE } from '../wt-11/canvas/app/test/core.mjs';
function run(file, viewId, uses) {
  console.log('\n=====', file.split('/').pop(), viewId);
  for (const u of uses) {
    const s = open(file); const before = JSON.stringify(s.model);
    const P = core.project(M, s.model, s.model.views.find(v => v.id === viewId)); const r = P.rects.get(u.in);
    const at = { x: r.x + (u.dx ?? 24), y: r.y + (u.dy ?? 14) };
    const res = place(s, u.el, { view: viewId, type: 'el', id: u.in, at, add: false });
    const what = s.history.steps.length ? s.history.steps.at(-1).what : null;
    const view = s.model.views.find(v => v.id === viewId);
    console.log(u.el, u.in, JSON.stringify(at), '|', res.refused ?? what, '| problems', JSON.stringify(M.validate(s.model).map(p => p.message)), res.made ? JSON.stringify(plain(view.layout[res.made.id])) + ' name ' + res.made.name : '');
    if (res.made) { s.history.undo(); if (JSON.stringify(s.model) !== before) console.log('   UNDO DIFFERS'); }
  }
}
run(EXAMPLE, 'v-proof', [{ el: 'PortUsage', in: 'App' }, { el: 'PartUsage', in: 'Host', dx: 184, dy: 100 }, { el: 'PortUsage', in: 'Host', dx: 184, dy: 100 }, { el: 'PortUsage', in: 'Page.hosts.api', dx: 8, dy: 8 }, { el: 'PartUsage', in: 'StrongholdApp' }]);
run(fx('interconnection.json'), 'v-ic', [{ el: 'PartUsage', in: 'Tank' }, { el: 'PortUsage', in: 'Tank' }, { el: 'ItemUsage', in: 'CtrlPort' }, { el: 'PortUsage', in: 'FuelLine' }]);
run(fx('behavior-actions.json'), 'v-release', [{ el: 'ActionUsage', in: 'Release', dx: 600, dy: 330 }, { el: 'ParameterUsage', in: 'Release.test' }, { el: 'StartNode', in: 'Release.test' }, { el: 'DoneNode', in: 'Release.lint' }, { el: 'ForkNode', in: 'Release', dx: 600, dy: 330 }]);
run(fx('behavior-states.json'), 'v-host', [{ el: 'StateUsage', in: 'HostLifecycle' , dx: 150, dy: 150}, { el: 'InitialNode', in: 'HostLifecycle.loading' }, { el: 'ActionUsage', in: 'HostLifecycle.loading' }, { el: 'DoneNode', in: 'HostLifecycle.loading' }]);
// a typing replaced: steps and undo; and the rel object keys; and what 'ids' form first() takes
const e = open(EXAMPLE); const d = draw(e, 'FeatureTyping', 'Page.hosts', 'App'); console.log(JSON.stringify(plain(e.model.relationships.map(r => r.id))), e.history.steps.at(-1).what, JSON.stringify(e.history.steps.at(-1).touched));
console.log(M.describeView(e.model, e.model.views[0]), '|', M.an('general view', true), '|', M.definable());
