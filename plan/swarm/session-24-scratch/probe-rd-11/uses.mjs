import { lib, core, open, fx, EXAMPLE, toolsOf, selectionOf, inBox, onMid, ground, rectOf, plain } from './port.mjs';
const G = { 'v-proof': [EXAMPLE, 500, 800], 'v-ic': [fx('interconnection.json'), 1100, 600], 'v-release': [fx('behavior-actions.json'), 1200, 200], 'v-host': [fx('behavior-states.json'), 1000, 200] };
const U = {
 'v-proof': [['PartDefinition','ground','Added part def PartDef1'],['PortDefinition','ground','Added port def PortDef1'],['PartUsage','in:Host','Added part part1 in Host'],['PortUsage','in:App','Added port port1 in App'],['Specialization','App>Page','Drew App specializes Page'],['FeatureTyping','Page.hosts>App','Drew hosts defined by App'],['ConnectionUsage','Page.hosts>Page.app','Drew connection hosts to app']],
 'v-ic': [['PartDefinition','ground','Added part def PartDef1'],['PortDefinition','ground','Added port def PortDef1'],['PartUsage','in:Tank','Added part part1 in Tank'],['PortUsage','in:Tank','Added port port1 in Tank'],['ItemDefinition','ground','Added item def ItemDef1'],['ItemUsage','in:CtrlPort','Added item item1 in CtrlPort'],['InterfaceDefinition','ground','Added interface def InterfaceDef1','interface def InterfaceDef1 needs two ports on its border, its ends; it has none.'],['ConnectionUsage','System.tank>System.pump','Drew connection tank to pump'],['InterfaceUsage','System.controller.ctrl>System.pump.ctrl','Drew interface ctrl to ctrl'],['FlowConnectionUsage','System.tank.fuelOut>System.pump.fuelIn','Drew flow fuelOut to fuelIn','The flow fuelOut to fuelIn needs an item: pick in the panel what flows through the ports.'],['BindingConnectorAsUsage','System.pump.ctrl>System.controller.ctrl','Drew binding ctrl to ctrl'],['FeatureTyping','FuelPort.back>Signal','Drew back defined by Signal']],
 'v-release': [['ActionDefinition','ground','Added action def ActionDef1'],['ActionUsage','in:Release','Added action action1 in Release'],['ParameterUsage','in:Release.test','Added parameter param1 in test'],['ForkNode','in:Release','Added fork fork1 in Release'],['JoinNode','in:Release','Added join join1 in Release'],['DecisionNode','in:Release','Added decision decision1 in Release'],['MergeNode','in:Release','Added merge merge1 in Release'],['StartNode','in:Release.test','Added start in test'],['DoneNode','in:Release.lint','Added done in lint'],['SuccessionAsUsage','Release.compile>Release.test','Drew succession compile to test'],['FlowConnectionUsage','FLOW','Drew flow passed to param1'],['BindingConnectorAsUsage','Release.source>Release.bundle','Drew binding source to bundle'],['FeatureTyping','Release.compile>Release','Drew compile defined by Release']],
 'v-host': [['StateDefinition','ground','Added state def StateDef1'],['StateUsage','in:HostLifecycle','Added state state1 in HostLifecycle'],['InitialNode','in:HostLifecycle.loading','Added initial node in loading','The initial node in loading needs a transition to the first state.'],['ActionUsage','in:HostLifecycle.loading','Added action action1 in loading'],['DoneNode','in:HostLifecycle.loading','Added done in loading'],['TransitionUsage','HostLifecycle.idle>HostLifecycle.running','Drew transition idle to running'],['FeatureTyping','HostLifecycle.idle>HostLifecycle','Drew idle defined by HostLifecycle']],
};
const small = (s, v, id) => { const el = lib.idsOf(s.model).get(id); const k = lib.KINDS[el.kind]; return k.onBorder || core.NODE_HOME[el.kind] || !k.contains && k.size[0] < 100; };
const end = (s, v, id) => { const el = lib.idsOf(s.model).get(id); if (!el) throw new Error('no element ' + id); const k = lib.KINDS[el.kind]; return (k.onBorder || k.size[0] < 100) ? onMid(s, v, id) : inBox(s, v, id); };
const msgs = (m) => plain(lib.validate(m)).map((x) => typeof x === 'string' ? x : x.message ?? JSON.stringify(x));
for (const [v, uses] of Object.entries(U)) {
  const [file, gx, gy] = G[v];
  const kindRow = lib.VIEW_KINDS[open(file).model.views.find((x) => x.id === v).kind].tools.filter((t) => t !== '|');
  console.log(v, 'row matches uses:', JSON.stringify(kindRow) === JSON.stringify(uses.map((u) => u[0])));
  for (const [kind, where, words, adds] of uses) {
    const s = open(file); const t = toolsOf(s); const before = JSON.stringify(s.model); const vb = msgs(s.model);
    selectionOf(s).front(v);
    let undos = 1;
    try {
      if (where === 'FLOW') {
        t.arm('ParameterUsage'); t.click(inBox(s, v, 'Release.publish'));
        const pid = selectionOf(s).items[0].id; console.log('   param:', s.history.steps.at(-1).what, JSON.stringify(plain(s.model.elements.at(-1))));
        t.arm(kind); t.click(onMid(s, v, 'Release.test.passed')); if (t.said) console.log('   said1', t.said.text); t.click(onMid(s, v, pid)); undos = 2;
      } else {
        t.arm(kind);
        if (where === 'ground') t.click(ground(v, gx, gy));
        else if (where.startsWith('in:')) t.click(inBox(s, v, where.slice(3)));
        else { const [a, b] = where.split('>'); t.click(end(s, v, a)); if (t.said) console.log('   said after first:', t.said.text); t.click(end(s, v, b)); }
      }
      const step = s.history.steps.at(-1)?.what;
      const va = msgs(s.model); const gained = va.filter((m) => !vb.includes(m)); const lost = vb.filter((m) => !va.includes(m));
      const sel = selectionOf(s).items[0];
      const view = s.model.views.find((x) => x.id === v); const P = core.project(lib, s.model, view);
      const inProj = sel && (sel.type === 'el' ? P.nodes.some((n) => n.id === sel.id) : P.edges.some((e) => e.id === sel.id));
      const okWords = step === words; const okAdds = JSON.stringify(gained) === JSON.stringify(adds ? [adds] : []);
      for (let i = 0; i < undos; i++) s.history.undo();
      const back = JSON.stringify(s.model) === before;
      console.log(okWords && okAdds && inProj && back && !t.armed && !t.said && lost.length === 0 ? ' ok ' : ' !! ', kind, where, '| step:', step, '| gained:', JSON.stringify(gained), 'lost:', JSON.stringify(lost), '| inProj', inProj, '| back', back, '| armed', t.armed?.kind, '| said', t.said?.text, '| nsteps');
    } catch (e) { console.log(' EX ', kind, where, e.message); }
  }
}
