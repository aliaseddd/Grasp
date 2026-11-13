const W = '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-8';
const { lib, loadPlanes, clock } = await import(W + '/canvas/app/test/core.mjs');
const core = await loadPlanes();
const { openText, project, projectStep } = core;
const state = { model: { format: 'stronghold-canvas/2', revision: 't', package: { name: 'P', doc: '' },
  elements: [{ id: 'Outer', kind: 'PartDefinition', name: 'Outer', abstract: false, doc: '' }, { id: 'inner', kind: 'PartUsage', name: 'inner', owner: 'Outer', multiplicity: '', doc: '' }],
  relationships: [], views: [{ id: 'v', kind: 'GeneralView', name: 'v', doc: '', x: 0, y: 0, options: {}, layout: { Outer: { x: 0, y: 0, w: 200, h: 120 }, inner: { x: 300, y: 60, w: 100, h: 40 } } }] }, notes: [], archive: [], changes: [] };
const s = openText(lib, JSON.stringify(state), { name: 't.json' }, { now: clock() });
const view = () => s.model.views[0];
const p1 = project(lib, s.model, view());
console.log(p1.nodes.map((n) => `${n.id} ${n.width}x${n.height}`));
const touched = s.history.edit(() => { view().layout.Outer.w = 240; return 'Resized part def Outer'; }, null);
console.log('touched', JSON.stringify(touched));
const p2 = project(lib, s.model, view(), { previous: p1 });
console.log('p2 === p1', p2 === p1);
const r = projectStep(lib, s.model, view(), p2, new Map([['inner', { x: 40, y: 60, w: 100, h: 40 }]]), { previous: p2 });
console.log(r.nodes.map((n) => `${n.id} ${n.width}x${n.height}`));
