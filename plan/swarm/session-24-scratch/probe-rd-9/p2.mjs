import { EXAMPLE, FIXTURES, clock, lib, loadPlanes, plain, readText } from '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-9/canvas/app/test/core.mjs';
import path from 'node:path';
const core = await loadPlanes();
const s = core.openText(lib, readText(EXAMPLE), { name: 'example.json' }, { now: clock() });
const view = s.model.views[0];
const p = core.project(lib, s.model, view, { far: false });
const rects = Object.fromEntries(p.rects);
const cover = (R) => { const inside = p.nodes.filter(n => { const r = rects[n.id]; return r.x >= R.x && r.y >= R.y && r.x + r.w <= R.x + R.width && r.y + r.h <= R.y + R.height; }).map(n => n.id); const set = new Set(inside); return [inside, p.edges.filter(e => set.has(e.source) && set.has(e.target)).map(e => e.id)]; };
const ids = ['Page.hosts', 'Page.hosts.api', 'Host', 'Host.api'];
const x0 = Math.min(...ids.map(i => rects[i].x)) - 1, y0 = Math.min(...ids.map(i => rects[i].y)) - 1;
const x1 = Math.max(...ids.map(i => rects[i].x + rects[i].w)) + 1, y1 = Math.max(...ids.map(i => rects[i].y + rects[i].h)) + 1;
console.log('R', x0, y0, x1 - x0, y1 - y0, cover({ x: x0, y: y0, width: x1 - x0, height: y1 - y0 }));
const h = rects.Host;
console.log('Host exact', cover({ x: h.x, y: h.y, width: h.w, height: h.h }));
console.log('Host less 1', cover({ x: h.x, y: h.y, width: h.w - 1, height: h.h }));
// K5: corner of plane to past Host: in view units everything with x+w <= Host.x+w+6/zoom and y+h <= Host.y+h+6/zoom
const z = 0.544;
console.log('K5', cover({ x: -10000, y: -10000, width: 10000 + h.x + h.w + 6 / z, height: 10000 + h.y + h.h + 6 / z }));
// far projection of example?
const pf = core.project(lib, s.model, view, { far: true });
console.log('far nodes', pf.nodes.length, 'edges', pf.edges.length);
// interconnection
const s2 = core.openText(lib, readText(path.join(FIXTURES, 'interconnection.json')), { name: 'interconnection.json' }, { now: clock() });
for (const v of s2.model.views) { const q = core.project(lib, s2.model, v, { far: false }); console.log(v.id, q.nodes.map(n => n.id).join(' '), '| edges', q.edges.map(e => e.id).join(' ')); }
