// A throwaway port of the old page's place / createRel, to try the test list's uses. Not for the repository.
import { loadCore, lib as M, EXAMPLE, FIXTURES, readText, clock, plain } from '../wt-11/canvas/app/test/core.mjs';
import path from 'node:path';
export const core = await loadCore();
export const BASE_NAME = { PartDefinition: 'PartDef', PortDefinition: 'PortDef', PartUsage: 'part', PortUsage: 'port', ItemDefinition: 'ItemDef', ItemUsage: 'item', InterfaceDefinition: 'InterfaceDef',
  ActionDefinition: 'ActionDef', ActionUsage: 'action', ParameterUsage: 'param', ForkNode: 'fork', JoinNode: 'join', DecisionNode: 'decision', MergeNode: 'merge', StartNode: 'start', DoneNode: 'done', StateDefinition: 'StateDef', StateUsage: 'state', InitialNode: 'initial' };
const HOME = { ForkNode: 'action', JoinNode: 'action', DecisionNode: 'action', MergeNode: 'action', StartNode: 'action', DoneNode: 'either', InitialNode: 'state' };
export function open(file) { return core.openText(M, readText(file), { name: path.basename(file) }, { now: clock() }); }
export const fx = (n) => path.join(FIXTURES, n);
const newId = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
function blankField(item, fld) { const spec = M.FIELDS[fld]; if (!spec || spec.stored === false) return; if (spec.fresh) item[fld] = spec.fresh(); else if (spec.type === 'bool') item[fld] = false; else if (spec.type === 'enum') item[fld] = spec.values[0]; else item[fld] = ''; }
function fresh(kind, name) { const el = { id: newId('e'), kind, name, doc: '' }; M.KINDS[kind].fields.forEach((f) => { if (el[f] === undefined) blankField(el, f); }); return el; }
function freeName(model, kind, owner) { const base = BASE_NAME[kind] || kind; const taken = new Set(M.childrenOf(model, owner).map(M.textName)); let i = 1; while (taken.has(base + i)) i++; return base + i; }
const contains = (r, p) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
function containerAt(model, P, p, kind) { let best = null; const ids = M.idsOf(model); for (const n of P.nodes) { const el = ids.get(n.id); if (!M.KINDS[el.kind].contains || !M.canContain(el.kind, kind)) continue; const r = P.rects.get(n.id); if (!r || !contains(r, p)) continue; if (!best || r.w * r.h < best.area) best = { id: n.id, area: r.w * r.h }; } return best ? best.id : null; }
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
function nearestBorder(r, p) { const d = [ { side: 'top', dist: Math.abs(p.y - r.y), at: (p.x - r.x) / r.w }, { side: 'bottom', dist: Math.abs(p.y - (r.y + r.h)), at: (p.x - r.x) / r.w }, { side: 'left', dist: Math.abs(p.x - r.x), at: (p.y - r.y) / r.h }, { side: 'right', dist: Math.abs(p.x - (r.x + r.w)), at: (p.y - r.y) / r.h } ].sort((m, n) => m.dist - n.dist)[0]; return { side: d.side, at: Math.round(clamp(d.at, 0.05, 0.95) * 100) / 100 }; }
export function place(session, kind, hit) {
  const model = session.model; const k = M.KINDS[kind]; const view = model.views.find((v) => v.id === hit.view);
  const P = core.project(M, model, view); const p = hit.at; const ids = M.idsOf(model);
  let refused = null; let made = null;
  session.history.edit(() => {
    let el;
    if (k.onBorder) {
      const under = hit.type === 'el' ? ids.get(hit.id) : null;
      let host = under && M.canContain(under.kind, kind) ? under.id : containerAt(model, P, p, kind);
      if (under && M.KINDS[under.kind].onBorder) host = under.owner !== undefined && M.canContain(ids.get(under.owner).kind, kind) ? under.owner : null;
      if (!host || !view.layout[host]) { refused = kind === 'ParameterUsage' ? 'Click an action def or an action in this view to put a parameter on its border.' : 'Click a part def or a part in this view to put a ' + k.label + ' on its border.'; return null; }
      const b = nearestBorder(P.rects.get(host), p);
      el = fresh(kind, freeName(model, kind, host)); el.owner = host;
      if (kind === 'ParameterUsage') el.direction = 'in';
      view.layout[el.id] = { side: b.side, at: b.at };
    } else {
      const [w, h] = k.size; const host = containerAt(model, P, p, kind);
      const home = HOME[kind];
      if (home) { const o = host ? ids.get(host) : null; const fits = !!o && (home === 'action' ? M.isActionOwner(o.kind) : home === 'state' ? M.isStateOwner(o.kind) : M.isActionOwner(o.kind) || M.isStateOwner(o.kind));
        if (!fits) { refused = 'Click inside ' + (home === 'action' ? 'an action def or an action' : home === 'state' ? 'a state def or a state' : 'an action def, an action, a state def or a state') + ' to put the ' + k.label + ' there.'; return null; } }
      el = fresh(kind, freeName(model, kind, host));
      const lay = { x: Math.round(p.x - w / 2), y: Math.round(p.y - 20), w, h };
      if (host) { const r = P.rects.get(host); el.owner = host; lay.x = Math.max(12, Math.round(p.x - r.x - w / 2)); lay.y = Math.max(48, Math.round(p.y - r.y - (home ? h / 2 : 20))); if (el.direction === '' && ids.get(host).kind === 'PortDefinition') el.direction = 'out'; }
      view.layout[el.id] = lay;
    }
    model.elements.push(el); made = model.elements[model.elements.length - 1];
    return 'Added ' + M.describe(model, made);
  });
  return made ? { made } : { refused };
}
export function pairProblem(session, kind, a, b) { const model = session.model; if (a.id === b.id) return 'Pick two different elements.'; if (model.relationships.some((r) => r.kind === kind && r.from === a.id && r.to === b.id)) return 'That is already drawn.'; return M.RELATIONSHIPS[kind].ends(model, a, b, M.idsOf(model)); }
export function draw(session, kind, aId, bId) {
  const model = session.model; const ids = M.idsOf(model); const a = ids.get(aId); const b = ids.get(bId);
  const f = M.RELATIONSHIPS[kind].first(model, a, ids); if (f) return { refused: f + ' Escape puts the tool down.' };
  const pr = pairProblem(session, kind, a, b); if (pr) return { refused: pr + ' Escape puts the tool down.' };
  let rel = null;
  session.history.edit(() => { rel = { id: newId('r'), kind, from: a.id, to: b.id }; M.RELATIONSHIPS[kind].fields.forEach((f2) => blankField(rel, f2)); const old = kind === 'FeatureTyping' ? M.typingOf(model, a) : null; if (old) model.relationships.splice(model.relationships.indexOf(old), 1); model.relationships.push(rel); return 'Drew ' + M.describeRel(model, rel); });
  return { made: rel };
}
export { M, plain };
