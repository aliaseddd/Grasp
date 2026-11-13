import path from 'node:path';
const REPO = '/home/user/Grasp';
const { loadCore, lib } = await import(path.join(REPO, 'canvas/app/test/core.mjs'));
const { scaleState, VIEWS, middleService } = await import(path.join(REPO, 'canvas/test/scale-model.mjs'));
const core = await loadCore();
const state = scaleState(5000);
const session = core.openText(lib, JSON.stringify(state), { name: 'scale.json' });
const view = session.model.views.find((v) => v.id === VIEWS.definitions);
const id = middleService(5000);
let p = core.project(lib, session.model, view, {});
const start = p;
const node = p.nodes.find((n) => n.id === id);
const N = Number(process.argv[2] || 200);
let tPlaces = 0, tProject = 0;
for (let i = 0; i < N; i++) {
  const asks = [{ id, move: { x: node.position.x + 5 + (i % 50), y: node.position.y + 3 + (i % 30) } }];
  let t = performance.now();
  const { places } = core.placesFor(lib, session.model, view, start, asks);
  tPlaces += performance.now() - t; t = performance.now();
  p = core.project(lib, session.model, view, { previous: p, places });
  tProject += performance.now() - t;
}
console.log(`placesFor ${(tPlaces / N).toFixed(2)} ms, project ${(tProject / N).toFixed(2)} ms a step, over ${N} steps; nodes ${p.nodes.length}`);
