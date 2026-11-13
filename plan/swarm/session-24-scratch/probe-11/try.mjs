import { core, M, open, fx, place, draw, plain } from './port.mjs';
import { EXAMPLE } from '../wt-11/canvas/app/test/core.mjs';
function run(file, viewId, uses) {
  console.log('\n=====', file.split('/').pop(), viewId);
  for (const u of uses) {
    const s = open(file); const before = JSON.stringify(s.model); const problems0 = JSON.stringify(M.validate(s.model));
    let res;
    if (u.rel) res = draw(s, u.rel, u.from, u.to);
    else { const P = core.project(M, s.model, s.model.views.find(v => v.id === viewId)); let at = u.at; if (u.in) { const r = P.rects.get(u.in); at = { x: r.x + (u.dx ?? r.w / 2), y: r.y + (u.dy ?? r.h / 2) }; } res = place(s, u.el, { view: viewId, type: u.on ? 'el' : (u.in ? 'el' : 'ground'), id: u.on ?? u.in ?? null, at, add: false }); }
    const what = s.history.steps.length ? s.history.steps[s.history.steps.length - 1].what : null;
    const problems1 = M.validate(s.model);
    const view = s.model.views.find(v => v.id === viewId);
    const P2 = core.project(M, s.model, view);
    const drawnNow = res.made ? (u.rel ? P2.edges.some(e => e.id === res.made.id) : P2.nodes.some(n => n.id === res.made.id)) : false;
    console.log(u.rel ?? u.el, '|', res.refused ?? what, '| drawn', drawnNow, '| new problems', JSON.stringify(problems1.map(p => p.message)), res.made && !u.rel ? '| ' + JSON.stringify(plain(res.made)) + ' ' + JSON.stringify(plain(view.layout[res.made.id])) : res.made ? '| ' + JSON.stringify(plain(res.made)) : '');
    if (res.made) { s.history.undo(); if (JSON.stringify(s.model) !== before) console.log('   UNDO DIFFERS'); }
  }
}
run(EXAMPLE, 'v-proof', [
  { el: 'PartDefinition', at: { x: 500, y: 800 } },
  { el: 'PortDefinition', at: { x: 900, y: 800 } },
  { el: 'PartUsage', in: 'Host', dx: 200, dy: 100 },
  { el: 'PartUsage', at: { x: 500, y: 800 } },
  { el: 'PortUsage', in: 'ServerHost', dx: 360, dy: 50 },
  { el: 'PortUsage', at: { x: 500, y: 800 } },
  { el: 'PortUsage', on: 'Host.api', at: { x: 400, y: 465 } },
  { el: 'PortUsage', on: 'StrongholdApp', at: { x: 900, y: 100 } },
  { rel: 'Specialization', from: 'App', to: 'Page' },
  { rel: 'Specialization', from: 'Host', to: 'StrongholdApp' },
  { rel: 'Specialization', from: 'ServerHost', to: 'Host' },
  { rel: 'Specialization', from: 'Host', to: 'ServerHost' },
  { rel: 'Specialization', from: 'Host', to: 'Host' },
  { rel: 'FeatureTyping', from: 'Page.hosts', to: 'App' },
  { rel: 'FeatureTyping', from: 'Host.api', to: 'StrongholdApp' },
  { rel: 'FeatureTyping', from: 'Host', to: 'App' },
  { rel: 'ConnectionUsage', from: 'Page.hosts', to: 'Page.app' },
  { rel: 'ConnectionUsage', from: 'Host.api', to: 'App.api' },
  { rel: 'ConnectionUsage', from: 'Host', to: 'App' },
]);
run(fx('interconnection.json'), 'v-ic', [
  { el: 'PartDefinition', at: { x: 1100, y: 600 } },
  { el: 'PortDefinition', at: { x: 1100, y: 600 } },
  { el: 'PartUsage', in: 'Pump', dx: 100, dy: 60 },
  { el: 'PortUsage', in: 'Pump', dx: 195, dy: 40 },
  { el: 'ItemDefinition', at: { x: 1100, y: 600 } },
  { el: 'ItemUsage', in: 'CtrlPort', dx: 110, dy: 130 },
  { el: 'ItemUsage', in: 'Pump', dx: 100, dy: 60 },
  { el: 'ItemUsage', at: { x: 1100, y: 600 } },
  { el: 'InterfaceDefinition', at: { x: 1100, y: 600 } },
  { rel: 'ConnectionUsage', from: 'System.tank', to: 'System.pump' },
  { rel: 'ConnectionUsage', from: 'System.controller', to: 'System.pump' },
  { rel: 'InterfaceUsage', from: 'System.pump.fuelOut', to: 'System.outlet' },
  { rel: 'InterfaceUsage', from: 'System.tank.fuelOut', to: 'System.pump.fuelOut' },
  { rel: 'FlowConnectionUsage', from: 'System.tank.fuelOut', to: 'System.pump.fuelIn' },
  { rel: 'FlowConnectionUsage', from: 'System.pump.fuelOut', to: 'System.outlet' },
  { rel: 'BindingConnectorAsUsage', from: 'System.tank.fuelOut', to: 'System.pump.fuelIn' },
  { rel: 'BindingConnectorAsUsage', from: 'System.pump.ctrl', to: 'System.controller.ctrl' },
  { rel: 'FeatureTyping', from: 'System.tank', to: 'Pump' },
  { rel: 'FeatureTyping', from: 'Tank.stored', to: 'Signal' },
  { rel: 'FeatureTyping', from: 'System.outlet', to: 'CtrlPort' },
]);
