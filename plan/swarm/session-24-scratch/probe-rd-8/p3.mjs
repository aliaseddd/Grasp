const W = '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-8';
const { EXAMPLE, lib, loadPlanes, plain, readText, stateFiles, clock } = await import(W + '/canvas/app/test/core.mjs');
const { scaleState, VIEWS } = await import(W + '/canvas/test/scale-model.mjs');
const core = await loadPlanes();
const { openText, project, projectStep, placesFor, isDrawn, BOX_SHAPES } = core;
// (a) test 2: does any resize ask change a box's compartments?
let rewraps = 0; let asks = 0; const hits = [];
let flips = 0;
for (const f of stateFiles()) {
  const s = openText(lib, readText(f.file), { name: f.name }, { now: clock() });
  for (const v of s.model.views) {
    if (!isDrawn(lib, v.kind)) continue;
    const start = project(lib, s.model, v);
    for (const n of start.nodes) {
      if (BOX_SHAPES.includes(n.type)) {
        for (const width of [n.width + 60, Math.max(80, n.width - 40)]) {
          asks++;
          const { places } = placesFor(lib, s.model, v, start, [{ id: n.id, resize: { x: n.position.x, y: n.position.y, width, height: n.height } }]);
          const r = project(lib, s.model, v, { previous: start, places });
          const m = r.nodes.find((k) => k.id === n.id);
          if (JSON.stringify(m.data.compartments) !== JSON.stringify(n.data.compartments)) { rewraps++; if (hits.length < 5) hits.push(`${f.name}/${v.id}/${n.id}@${width}`); }
        }
      }
      // (b) test 1 asks: any border node not owned by the moved node (or inside it) whose nameAt changes?
      if (n.data.form !== 'border') {
        const { places } = placesFor(lib, s.model, v, start, [{ id: n.id, move: { x: n.position.x + 37, y: n.position.y + 23 } }]);
        const r = project(lib, s.model, v, { previous: start, places });
        r.nodes.forEach((k, i) => {
          if (k.data.form === 'border' && JSON.stringify(k.data.nameAt) !== JSON.stringify(start.nodes[i].data.nameAt)) { flips++; console.log('nameAt changed under test 1 ask:', f.name, v.id, 'moved', n.id, 'port', k.id, 'parent', k.parentId); }
        });
      }
    }
  }
}
console.log('test 2: asks', asks, 'that rewrap', rewraps, hits);
console.log('test 1: nameAt flips', flips);
// (b2) a concrete flip in the example
const s = openText(lib, readText(EXAMPLE), { name: 'example.json' }, { now: clock() });
const view = s.model.views[0];
const start = project(lib, s.model, view);
for (const [id, dx, dy] of [['Page.app', 0, -56], ['Page.app', 0, 60], ['Page.hosts', 0, 80], ['Page.hosts', 0, -56]]) {
  const n = start.nodes.find((k) => k.id === id);
  const { places } = placesFor(lib, s.model, view, start, [{ id, move: { x: n.position.x + dx, y: n.position.y + dy } }]);
  const r = project(lib, s.model, view, { previous: start, places });
  const changed = r.nodes.filter((k, i) => k !== start.nodes[i]).map((k) => k.id + (k.data.nameAt ? JSON.stringify(k.data.nameAt) : ''));
  console.log('move', id, dx, dy, JSON.stringify([...places]), 'renewed:', changed.join(' '));
}
console.log('start nameAt', start.nodes.filter((k) => k.data.form === 'border').map((k) => k.id + JSON.stringify(k.data.nameAt)).join(' '));
// (c) far and back mid-gesture: what project gives for edges with a far previous
const host = start.nodes.find((k) => k.id === 'Host');
const { places } = placesFor(lib, s.model, view, start, [{ id: 'Host', move: { x: host.position.x + 30, y: host.position.y } }]);
const farStep = projectStep(lib, s.model, view, start, places, { far: true, previous: start });
const back = projectStep(lib, s.model, view, start, places, { far: false, previous: farStep });
console.log('(c) back.edges[i] === farStep.edges[i] for any i:', back.edges.some((e, i) => e === farStep.edges[i]), 'farStep edge far', farStep.edges[0].data.far, farStep.edges[0].data.label, 'back edge far', back.edges[0].data.far, JSON.stringify(back.edges.map((e) => e.data.label)));
