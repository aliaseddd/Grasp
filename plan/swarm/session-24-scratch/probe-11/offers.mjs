import { core, M, open, fx, place, plain } from './port.mjs';
import { EXAMPLE } from '../wt-11/canvas/app/test/core.mjs';
function offers(file, viewId, hit) {
  const s0 = open(file); const view = s0.model.views.find(v => v.id === viewId); const row = M.VIEW_KINDS[view.kind].tools;
  const groups = [[]]; for (const t of row) { if (t === '|') groups.push([]); else groups[groups.length - 1].push(t); }
  const P = core.project(M, s0.model, view); const ids = M.idsOf(s0.model);
  const at = hit.at ?? (() => { const r = P.rects.get(hit.id); return { x: r.x + (hit.dx ?? 24), y: r.y + (hit.dy ?? 14) }; })();
  const full = { view: viewId, type: hit.type, id: hit.id ?? null, at, add: false };
  const out = groups.map((g) => g.filter((k) => {
    if (M.KINDS[k]) { if (hit.type === 'rel') return false; const s = open(file); const r = place(s, k, full); if (!r.made) return false; return hit.type === 'ground' ? true : r.made.owner === hit.id; }
    if (hit.type !== 'el') return false; return M.RELATIONSHIPS[k].first(s0.model, ids.get(hit.id), ids) === null;
  })).filter((g) => g.length);
  console.log(file.split('/').pop(), viewId, hit.type, hit.id ?? '', JSON.stringify(at), '→', JSON.stringify(out));
}
offers(EXAMPLE, 'v-proof', { type: 'ground', at: { x: 500, y: 800 } });
for (const id of ['Host', 'Page', 'Page.hosts', 'Page.hosts.api', 'StrongholdApp']) offers(EXAMPLE, 'v-proof', { type: 'el', id, ...(id.endsWith('.api') ? { dx: 8, dy: 8 } : {}) });
offers(EXAMPLE, 'v-proof', { type: 'el', id: 'Host', dx: 184, dy: 100 });
offers(EXAMPLE, 'v-proof', { type: 'rel', id: 'mount', at: { x: 450, y: 231 } });
offers(fx('interconnection.json'), 'v-ic', { type: 'ground', at: { x: 1100, y: 600 } });
for (const id of ['Tank', 'FuelPort', 'FuelLine', 'System.pump', 'System.pump.fuelIn', 'Tank.stored', 'Fuel']) offers(fx('interconnection.json'), 'v-ic', { type: 'el', id, ...(id.endsWith('fuelIn') ? { dx: 8, dy: 8 } : {}) });
offers(fx('behavior-actions.json'), 'v-release', { type: 'ground', at: { x: 1200, y: 200 } });
for (const [id, dx, dy] of [['Release', 600, 330], ['Release.test', 24, 14], ['Release.split', 30, 4], ['Release.start', 8, 8], ['Release.test.passed', 8, 8], ['Release.verdict', 20, 20]]) offers(fx('behavior-actions.json'), 'v-release', { type: 'el', id, dx, dy });
offers(fx('behavior-states.json'), 'v-host', { type: 'ground', at: { x: 1000, y: 200 } });
for (const [id, dx, dy] of [['HostLifecycle', 150, 150], ['HostLifecycle.idle', 24, 14], ['HostLifecycle.initial', 14, 8], ['HostLifecycle.loading.fetchEntry', 24, 14], ['HostLifecycle.done', 11, 11]]) offers(fx('behavior-states.json'), 'v-host', { type: 'el', id, dx, dy });
