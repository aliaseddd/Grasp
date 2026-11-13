import { core, M, open, fx, place, draw, plain } from './port.mjs';
const s = open(fx('behavior-actions.json'));
console.log(JSON.stringify(plain(s.model.elements.filter(e => e.kind === 'ParameterUsage').map(e => [e.id, e.direction, e.owner]))));
console.log(JSON.stringify(plain(s.model.elements.filter(e => !s.model.views[0].layout[e.id]).map(e => [e.id, e.kind]))));
const P = core.project(M, s.model, s.model.views[0]);
const r = P.rects.get('Release.publish');
const res = place(s, 'ParameterUsage', { view: 'v-release', type: 'el', id: 'Release.publish', at: { x: r.x + 2, y: r.y + 28 }, add: false });
console.log(JSON.stringify(plain(res.made)), JSON.stringify(plain(s.model.views[0].layout[res.made.id])));
for (const from of ['Release.test.passed', 'Release.lint.warnings', 'Release.source']) {
  const d = draw(s, 'FlowConnectionUsage', from, res.made.id);
  console.log(from, d.refused ?? s.history.steps.at(-1).what, JSON.stringify(M.validate(s.model).map(p => p.message)));
  if (d.made) s.history.undo();
}
// interconnection: other FeatureTyping candidates and flows
const t = open(fx('interconnection.json'));
console.log(JSON.stringify(plain(t.model.relationships.map(r => [r.id, r.kind, r.from, r.to, r.hidden]))));
for (const [k, a, b] of [['FeatureTyping', 'System.outlet', 'FuelPort'], ['FeatureTyping', 'FuelPort.back', 'Signal'], ['FeatureTyping', 'CtrlPort.cmd', 'Fuel'], ['FeatureTyping','Tank.stored','Fuel'], ['FlowConnectionUsage', 'System.controller.ctrl', 'System.pump.ctrl'], ['InterfaceUsage','System.tank.fuelOut','System.pump.fuelIn'], ['InterfaceUsage','System.controller.ctrl','System.pump.ctrl'], ['ConnectionUsage','System.pump.fuelOut','System.outlet'], ['BindingConnectorAsUsage','System.tank.fuelOut','System.pump.fuelIn']]) {
  const d = draw(t, k, a, b);
  console.log(k, a, b, '|', d.refused ?? t.history.steps.at(-1).what, JSON.stringify(M.validate(t.model).map(p => p.message)));
  if (d.made) t.history.undo();
}
// example: typing candidates that replace vs not
const e = open(fx('../../examples/stronghold-proof.json'));
console.log(JSON.stringify(plain(e.model.relationships.map(r => [r.id, r.kind, r.from, r.to, r.hidden]))));
for (const [k, a, b] of [['FeatureTyping', 'Page.hosts', 'ServerHost'], ['FeatureTyping', 'Page.app', 'Host'], ['Specialization','OnlineHost','ServerHost'], ['Specialization','App','Host'], ['ConnectionUsage','Page.hosts','Page.app'], ['Specialization','Host','StrongholdApp'], ['Specialization','Page.hosts','Page.app']]) {
  const n0 = e.model.relationships.length;
  const d = draw(e, k, a, b);
  console.log(k, a, b, '|', d.refused ?? e.history.steps.at(-1).what, 'rels', n0, '->', e.model.relationships.length, JSON.stringify(M.validate(e.model).map(p => p.message)));
  if (d.made) e.history.undo();
}
