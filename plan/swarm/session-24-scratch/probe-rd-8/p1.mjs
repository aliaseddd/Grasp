const W = '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-8';
const { EXAMPLE, lib, loadPlanes, plain, readText, stateFiles, clock } = await import(W + '/canvas/app/test/core.mjs');
const { scaleState, VIEWS, middleService } = await import(W + '/canvas/test/scale-model.mjs');
const core = await loadPlanes();
const { openText, project, projectStep, placesFor, isDrawn, viewStoreOf, linesDrawn, LARGE_VIEW, BOX_SHAPES } = core;
console.log('exports', typeof projectStep, typeof linesDrawn, LARGE_VIEW, BOX_SHAPES);
// GRAPH count
let n = 0; let nodesTotal = 0;
for (const f of stateFiles()) {
  let s; try { s = openText(lib, readText(f.file), { name: f.name }, { now: clock() }); } catch (e) { console.log('open failed', f.name, e.message); continue; }
  for (const v of s.model.views) if (isDrawn(lib, v.kind)) { n++; const p = project(lib, s.model, v); nodesTotal += p.nodes.length; console.log(f.name, v.id, v.kind, p.nodes.length, p.edges.length); }
}
console.log('GRAPH views', n, 'nodes', nodesTotal);
const s = openText(lib, readText(EXAMPLE), { name: 'example.json' }, { now: clock() });
const view = s.model.views.find((v) => v.id === 'v-proof');
console.log('view stable?', view === s.model.views.find((v) => v.id === 'v-proof'));
const start = project(lib, s.model, view);
console.log(start.nodes.map((n) => `${n.id}:${n.type}:${n.parentId ?? '-'}:${n.position.x},${n.position.y}:${n.width}x${n.height}`).join('\n'));
console.log(start.edges.map((e) => `${e.id}:${e.source}->${e.target}`).join(' | '));
// test 5
const host = start.nodes.find((n) => n.id === 'Host');
let prev = start;
for (let i = 1; i <= 5; i++) {
  const { places } = placesFor(lib, s.model, view, start, [{ id: 'Host', move: { x: host.position.x + 10 * i, y: host.position.y } }]);
  const r = projectStep(lib, s.model, view, start, places, { previous: prev });
  const others = r.nodes.filter((n, k) => n.id !== 'Host' && n !== start.nodes[k]).map((n) => n.id);
  console.log('t5 step', i, 'others renewed:', others, 'host data same', r.nodes.find((n) => n.id === 'Host').data === host.data);
  prev = r;
}
// test 6
console.log('t6', projectStep(lib, s.model, view, start, new Map(), { previous: start }) === start, placesFor(lib, s.model, view, start, [{ id: 'Host', move: { ...host.position } }]).places.size);
// test 7
{
  const previous = { ...start, nodes: start.nodes.map((n) => (n.id === 'Host' ? { ...n, selected: true, dragging: true } : n)) };
  const a = placesFor(lib, s.model, view, start, [{ id: 'Host', move: { x: host.position.x + 30, y: host.position.y } }]).places;
  const r = projectStep(lib, s.model, view, start, a, { previous });
  const h = r.nodes.find((n) => n.id === 'Host');
  console.log('t7 host', h.selected, h.dragging);
  const app = start.nodes.find((n) => n.id === 'App');
  const b = placesFor(lib, s.model, view, start, [{ id: 'App', move: { x: app.position.x + 30, y: app.position.y } }]).places;
  const r2 = projectStep(lib, s.model, view, start, b, { previous });
  console.log('t7 app move: host same object as previous', r2.nodes.find((n) => n.id === 'Host') === previous.nodes.find((n) => n.id === 'Host'), 'renewed:', r2.nodes.filter((n, k) => n !== previous.nodes[k]).map((n) => n.id));
}
// test 3
{
  const page = start.nodes.find((n) => n.id === 'Page');
  for (const resize of [{ x: -28, y: 32, width: 820, height: 290 }, { x: 232, y: 172, width: 560, height: 150 }]) {
    const pl = placesFor(lib, s.model, view, start, [{ id: 'Page', resize }]);
    console.log('t3 page', JSON.stringify(page.position), page.width, page.height, '->', JSON.stringify([...pl.places]));
  }
}
// test 16
{
  const store = viewStoreOf(s, 'v-proof'); let calls = 0; store.subscribe(() => calls++);
  const cam = store.camera(736, 828); console.log('t16 cam', cam, store.getSnapshot().far);
  store.moved({ x: 0, y: 0, zoom: 0.1 }); console.log('t16 far', store.getSnapshot().far, store.getSnapshot().edges.length, calls);
}
// test 15
{
  const big = openText(lib, JSON.stringify(scaleState(5000)), { name: 'scale-5000.json' }, { now: clock() });
  for (const [name, id] of Object.entries(VIEWS)) {
    const st = viewStoreOf(big, id); let calls = 0; st.subscribe(() => calls++);
    const cam = st.camera(736, 828);
    const far0 = st.getSnapshot();
    const c0 = calls;
    st.moved({ x: 0, y: 0, zoom: 1 }); const near1 = st.getSnapshot(); const c1 = calls;
    st.moved({ x: 0, y: 0, zoom: 0.05 }); const far2 = st.getSnapshot(); const c2 = calls;
    st.moved({ x: 0, y: 0, zoom: 1 }); const near3 = st.getSnapshot(); const c3 = calls;
    console.log('t15', name, cam.zoom.toFixed(4), far0.far, far0.nodes.length, far0.edges.length, near1.edges.length, far2.edges.length, near3.edges.length, 'calls', c0, c1, c2, c3,
      'same edge objects near1/near3:', near1.edges.every((e, i) => e === near3.edges[i]), 'same ids', near1.edges.every((e, i) => e.id === near3.edges[i].id));
  }
  // test 10/11
  const view = big.model.views.find((v) => v.id === VIEWS.definitions);
  let count = 0;
  const counting = Object.create(lib);
  Object.defineProperty(counting, 'reading', { value: (model, read) => { count++; return lib.reading(model, read); } });
  const start = project(counting, big.model, view);
  console.log('reading calls for project', count);
  let layoutReads = 0;
  const wrapped = new Proxy(view, { get(t, k, r) { if (k === 'layout') layoutReads++; return Reflect.get(t, k, t); } });
  const mid = middleService(5000); const node = start.nodes.find((n) => n.id === mid);
  count = 0;
  let prev = start; const times = []; const ptimes = [];
  for (let i = 1; i <= 60; i++) {
    const t0 = performance.now();
    const { places } = placesFor(lib, big.model, view, start, [{ id: mid, move: { x: node.position.x + i, y: node.position.y } }]);
    const t1 = performance.now();
    const r = projectStep(counting, big.model, wrapped, start, places, { previous: prev });
    const t2 = performance.now();
    if (i > 10) { times.push(t2 - t1); ptimes.push(t1 - t0); }
    prev = r;
  }
  const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
  console.log('t10 reading', count, 'layout reads', layoutReads, 't11 median step', med(times).toFixed(2), 'placesFor', med(ptimes).toFixed(2), mid);
  // test 8 on workflows
  const wf = big.model.views.find((v) => v.id === VIEWS.workflows);
  const ws = project(lib, big.model, wf);
  const rec = ws.nodes.find((n) => n.id === 'Handle96.receive');
  const pl = placesFor(lib, big.model, wf, ws, [{ id: rec.id, move: { x: rec.position.x + 20, y: rec.position.y + 5 } }]).places;
  const r = projectStep(lib, big.model, wf, ws, pl, { previous: ws });
  console.log('t8 edges same array', r.edges === ws.edges, 'every edge same', r.edges.every((e, i) => e === ws.edges[i]));
}
