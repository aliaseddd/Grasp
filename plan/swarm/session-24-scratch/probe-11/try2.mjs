import { core, M, open, fx, place, draw, plain } from './port.mjs';
function run(file, viewId, uses) {
  console.log('\n=====', file.split('/').pop(), viewId);
  for (const u of uses) {
    const s = open(file); const before = JSON.stringify(s.model);
    let res;
    if (u.rel) res = draw(s, u.rel, u.from, u.to);
    else { const P = core.project(M, s.model, s.model.views.find(v => v.id === viewId)); let at = u.at; if (u.in) { const r = P.rects.get(u.in); at = { x: r.x + (u.dx ?? r.w / 2), y: r.y + (u.dy ?? r.h / 2) }; } res = place(s, u.el, { view: viewId, type: u.in ? 'el' : 'ground', id: u.in ?? null, at, add: false }); }
    const what = s.history.steps.length ? s.history.steps[s.history.steps.length - 1].what : null;
    const problems1 = M.validate(s.model);
    const view = s.model.views.find(v => v.id === viewId);
    const P2 = core.project(M, s.model, view);
    const drawnNow = res.made ? (u.rel ? P2.edges.some(e => e.id === res.made.id) : P2.nodes.some(n => n.id === res.made.id)) : false;
    console.log(u.rel ?? u.el, u.in ?? u.from ?? 'ground', u.to ?? '', '|', res.refused ?? what, '| drawn', drawnNow, '| problems', JSON.stringify(problems1.map(p => p.message)), res.made && !u.rel ? '| owner ' + res.made.owner + ' dir ' + res.made.direction + ' ' + JSON.stringify(plain(view.layout[res.made.id])) : '');
    if (res.made) { s.history.undo(); if (JSON.stringify(s.model) !== before) console.log('   UNDO DIFFERS'); }
  }
}
run(fx('behavior-actions.json'), 'v-release', [
  { el: 'ActionDefinition', at: { x: 1200, y: 200 } },
  { el: 'ActionUsage', in: 'Release', dx: 600, dy: 330 },
  { el: 'ActionUsage', at: { x: 1200, y: 200 } },
  { el: 'ParameterUsage', in: 'Release.publish', dx: 148, dy: 28 },
  { el: 'ParameterUsage', at: { x: 1200, y: 200 } },
  { el: 'ForkNode', in: 'Release', dx: 600, dy: 330 },
  { el: 'ForkNode', at: { x: 1200, y: 200 } },
  { el: 'JoinNode', in: 'Release', dx: 600, dy: 330 },
  { el: 'DecisionNode', in: 'Release', dx: 600, dy: 330 },
  { el: 'MergeNode', in: 'Release', dx: 600, dy: 330 },
  { el: 'StartNode', in: 'Release', dx: 600, dy: 330 },
  { el: 'StartNode', in: 'Release.publish', dx: 75, dy: 28 },
  { el: 'DoneNode', in: 'Release', dx: 600, dy: 330 },
  { el: 'DoneNode', in: 'Release.publish', dx: 75, dy: 28 },
  { rel: 'SuccessionAsUsage', from: 'Release.compile', to: 'Release.test' },
  { rel: 'SuccessionAsUsage', from: 'Release.approve', to: 'Release.publish' },
  { rel: 'FlowConnectionUsage', from: 'Release.test.passed', to: 'Release.lint.warnings' },
  { rel: 'FlowConnectionUsage', from: 'Release.source', to: 'Release.bundle' },
  { rel: 'BindingConnectorAsUsage', from: 'Release.source', to: 'Release.bundle' },
  { rel: 'BindingConnectorAsUsage', from: 'Release.test.passed', to: 'Release.lint.warnings' },
  { rel: 'FeatureTyping', from: 'Release.compile', to: 'Release' },
  { rel: 'FeatureTyping', from: 'Release.split', to: 'Release' },
  { rel: 'FeatureTyping', from: 'Release.start', to: 'Release' },
]);
run(fx('behavior-states.json'), 'v-host', [
  { el: 'StateDefinition', at: { x: 1000, y: 200 } },
  { el: 'StateUsage', in: 'HostLifecycle', dx: 150, dy: 150 },
  { el: 'StateUsage', at: { x: 1000, y: 200 } },
  { el: 'InitialNode', in: 'HostLifecycle', dx: 150, dy: 150 },
  { el: 'InitialNode', in: 'HostLifecycle.idle', dx: 80, dy: 70 },
  { el: 'InitialNode', at: { x: 1000, y: 200 } },
  { el: 'ActionUsage', in: 'HostLifecycle.idle', dx: 80, dy: 70 },
  { el: 'ActionUsage', in: 'HostLifecycle', dx: 150, dy: 150 },
  { el: 'ActionUsage', at: { x: 1000, y: 200 } },
  { el: 'DoneNode', in: 'HostLifecycle', dx: 150, dy: 150 },
  { el: 'DoneNode', in: 'HostLifecycle.idle', dx: 80, dy: 70 },
  { rel: 'TransitionUsage', from: 'HostLifecycle.idle', to: 'HostLifecycle.running' },
  { rel: 'TransitionUsage', from: 'HostLifecycle.loading', to: 'HostLifecycle.idle' },
  { rel: 'TransitionUsage', from: 'HostLifecycle.running.serving', to: 'HostLifecycle.running.watching' },
  { rel: 'FeatureTyping', from: 'HostLifecycle.idle', to: 'HostLifecycle' },
  { rel: 'FeatureTyping', from: 'HostLifecycle.loading.fetchEntry', to: 'HostLifecycle' },
]);
const s = open(fx('behavior-states.json')); console.log(JSON.stringify(plain(s.model.elements.map(e => [e.id, e.kind, e.owner]))));
console.log(JSON.stringify(plain(s.model.relationships)));
