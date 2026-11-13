import { core, M, open, fx, place, draw, plain } from './port.mjs';
import { EXAMPLE } from '../wt-11/canvas/app/test/core.mjs';
const WALK = [
  [EXAMPLE, 'v-proof', { x: 500, y: 800 }, [['PartDefinition'], ['PortDefinition'], ['PartUsage', 'Host'], ['PortUsage', 'App'], ['Specialization', 'App', 'Page'], ['FeatureTyping', 'Page.hosts', 'App'], ['ConnectionUsage', 'Page.hosts', 'Page.app']]],
  [fx('interconnection.json'), 'v-ic', { x: 1100, y: 600 }, [['PartDefinition'], ['PortDefinition'], ['PartUsage', 'Tank'], ['PortUsage', 'Tank'], ['ItemDefinition'], ['ItemUsage', 'CtrlPort'], ['InterfaceDefinition'], ['ConnectionUsage', 'System.tank', 'System.pump'], ['InterfaceUsage', 'System.controller.ctrl', 'System.pump.ctrl'], ['FlowConnectionUsage', 'System.tank.fuelOut', 'System.pump.fuelIn'], ['BindingConnectorAsUsage', 'System.pump.ctrl', 'System.controller.ctrl'], ['FeatureTyping', 'FuelPort.back', 'Signal']]],
  [fx('behavior-actions.json'), 'v-release', { x: 1200, y: 200 }, [['ActionDefinition'], ['ActionUsage', 'Release'], ['ParameterUsage', 'Release.test'], ['ForkNode', 'Release'], ['JoinNode', 'Release'], ['DecisionNode', 'Release'], ['MergeNode', 'Release'], ['StartNode', 'Release.test'], ['DoneNode', 'Release.lint'], ['SuccessionAsUsage', 'Release.compile', 'Release.test'], ['FlowConnectionUsage', 'Release.test.passed', '@param:Release.publish'], ['BindingConnectorAsUsage', 'Release.source', 'Release.bundle'], ['FeatureTyping', 'Release.compile', 'Release']]],
  [fx('behavior-states.json'), 'v-host', { x: 1000, y: 200 }, [['StateDefinition'], ['StateUsage', 'HostLifecycle'], ['InitialNode', 'HostLifecycle.loading'], ['ActionUsage', 'HostLifecycle.loading'], ['DoneNode', 'HostLifecycle.loading'], ['TransitionUsage', 'HostLifecycle.idle', 'HostLifecycle.running'], ['FeatureTyping', 'HostLifecycle.idle', 'HostLifecycle']]],
];
for (const [file, viewId, ground, uses] of WALK) {
  const row = M.VIEW_KINDS[open(file).model.views.find(v => v.id === viewId).kind].tools.filter(t => t !== '|');
  console.log('\n==', file.split('/').pop(), viewId, 'row covered:', JSON.stringify(row) === JSON.stringify(uses.map(u => u[0])));
  for (const [kind, a, b] of uses) {
    const s = open(file); const view = s.model.views.find(v => v.id === viewId);
    const hitIn = (id) => { const r = core.project(M, s.model, view).rects.get(id); return { view: viewId, type: 'el', id, at: { x: r.x + 24, y: r.y + 14 }, add: false }; };
    let res; let extra = 0;
    if (M.KINDS[kind]) res = place(s, kind, a ? hitIn(a) : { view: viewId, type: 'ground', id: null, at: ground, add: false });
    else { let to = b; if (b.startsWith('@param:')) { to = place(s, 'ParameterUsage', hitIn(b.slice(7))).made.id; extra = 1; } res = draw(s, kind, a, to); }
    const before0 = JSON.stringify(open(file).model);
    const made = res.made; const P = core.project(M, s.model, view);
    const shown = made && (M.KINDS[kind] ? P.nodes.some(n => n.id === made.id) : P.edges.some(e => e.id === made.id));
    console.log(`| ${kind} | ${a ?? 'ground'}${b ? ' → ' + b : ''} | ${res.refused ?? s.history.steps.at(-1).what} | ${M.KINDS[kind] ? made.name + (made.owner ? ' in ' + made.owner : '') + ' ' + JSON.stringify(plain(view.layout[made.id])) : ''} | ${JSON.stringify(M.validate(s.model).map(p => p.message))} | shown ${shown}`);
    for (let i = 0; i <= extra; i++) s.history.undo();
    if (JSON.stringify(s.model) !== before0) console.log('  UNDO DIFFERS');
  }
}
