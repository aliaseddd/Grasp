// A throwaway port of commands.ts's contract, written from the comment only.
import path from 'node:path';
import { lib, loadCore, readText, clock, plain, EXAMPLE, FIXTURES } from '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-all/canvas/app/test/core.mjs';
export { lib, plain, EXAMPLE, FIXTURES };
export const core = await loadCore();
const BASE_NAME = core.BASE_NAME, NODE_HOME = core.NODE_HOME, TOOL_HINT = core.TOOL_HINT;
export function toolGroups(viewKind) {
  const row = lib.VIEW_KINDS[viewKind];
  if (!row || !core.isDrawn(lib, viewKind)) return [];
  const groups = [[]];
  for (const t of row.tools) {
    if (t === '|') { groups.push([]); continue; }
    if (lib.KINDS[t]) groups.at(-1).push({ kind: t, type: 'el', label: lib.KINDS[t].label });
    else if (lib.RELATIONSHIPS[t]) groups.at(-1).push({ kind: t, type: 'rel', label: lib.RELATIONSHIPS[t].label });
  }
  return groups.filter((g) => g.length);
}
export function toolHint(kind, step) {
  const h = TOOL_HINT[kind];
  let s;
  if (lib.KINDS[kind]) s = h || 'Click where the ' + lib.KINDS[kind].label + ' goes.';
  else if (typeof h === 'string') s = h;
  else s = (h || ['Click the first end…', 'Now click the other end.'])[step];
  return s.replace('{definable}', lib.definable());
}
export function freeName(model, kind, ownerId) {
  const base = BASE_NAME[kind] || kind;
  const taken = new Set(lib.childrenOf(model, ownerId).map(lib.textName));
  let i = 1; while (taken.has(base + i)) i++;
  return base + i;
}
const newId = (model, p) => { let id; do { id = p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); } while (model.elements.some((e) => e.id === id) || model.relationships.some((r) => r.id === id)); return id; };
function blank(item, fld) {
  const spec = lib.FIELDS[fld];
  if (!spec || spec.stored === false) return;
  if (spec.fresh) item[fld] = spec.fresh();
  else if (spec.type === 'bool') item[fld] = false;
  else if (spec.type === 'enum') item[fld] = spec.values[0];
  else item[fld] = '';
}
function plan(session, kind, hit) {
  const model = session.model;
  const view = model.views.find((v) => v.id === hit.view);
  if (!view || !core.isDrawn(lib, view.kind) || !lib.KINDS[kind]) throw new Error('caller');
  const k = lib.KINDS[kind];
  const ids = lib.idsOf(model);
  const P = core.project(lib, model, view);
  const p = hit.at;
  const under = hit.type === 'el' && hit.id && ids.get(hit.id) ? ids.get(hit.id) : null;
  const boxUnder = () => {
    let best = null;
    for (const n of P.nodes) {
      const el = ids.get(n.id);
      if (!el || !lib.KINDS[el.kind].contains || !lib.canContain(el.kind, kind)) continue;
      const r = P.rects.get(n.id);
      if (!r || !(p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h)) continue;
      if (!best || r.w * r.h < best.area) best = { id: n.id, area: r.w * r.h };
    }
    return best ? best.id : null;
  };
  if (k.onBorder) {
    let owner;
    if (under && lib.canContain(under.kind, kind)) owner = under.id;
    else if (under && lib.KINDS[under.kind].onBorder) owner = under.owner !== undefined && lib.canContain(ids.get(under.owner).kind, kind) ? under.owner : null;
    else owner = boxUnder();
    if (!owner || !view.layout[owner]) return { refused: kind === 'ParameterUsage' ? 'Click an action def or an action in this view to put a parameter on its border.' : `Click a part def or a part in this view to put a ${k.label} on its border.` };
    const r = P.rects.get(owner);
    const d = [
      { side: 'top', dist: Math.abs(p.y - r.y), at: (p.x - r.x) / r.w },
      { side: 'bottom', dist: Math.abs(p.y - (r.y + r.h)), at: (p.x - r.x) / r.w },
      { side: 'left', dist: Math.abs(p.x - r.x), at: (p.y - r.y) / r.h },
      { side: 'right', dist: Math.abs(p.x - (r.x + r.w)), at: (p.y - r.y) / r.h }].sort((m, n) => m.dist - n.dist)[0];
    return { owner, place: { side: d.side, at: Math.round(Math.min(0.95, Math.max(0.05, d.at)) * 100) / 100 }, view };
  }
  const owner = boxUnder();
  const home = NODE_HOME[kind];
  if (home) {
    const o = owner ? ids.get(owner) : null;
    const fits = !!o && (home === 'action' ? lib.isActionOwner(o.kind) : home === 'state' ? lib.isStateOwner(o.kind) : lib.isActionOwner(o.kind) || lib.isStateOwner(o.kind));
    if (!fits) return { refused: 'Click inside ' + (home === 'action' ? 'an action def or an action' : home === 'state' ? 'a state def or a state' : 'an action def, an action, a state def or a state') + ' to put the ' + k.label + ' there.' };
  }
  const [w, h] = k.size;
  let place = { x: Math.round(p.x - w / 2), y: Math.round(p.y - 20), w, h };
  if (owner) {
    const r = P.rects.get(owner);
    place = { x: Math.max(core.LOOK.pad, Math.round(p.x - r.x - w / 2)), y: Math.max(core.LOOK.childTop, Math.round(p.y - r.y - (home ? h / 2 : 20))), w, h };
  }
  return { owner, place, view };
}
export function wouldPlace(session, kind, hit) { try { const r = plan(session, kind, hit); return r; } catch { return { refused: 'x' }; } }
export function place(session, kind, hit) {
  const model = session.model;
  const r = plan(session, kind, hit);
  if (r.refused) return r;
  const el = { id: newId(model, 'e'), kind, name: freeName(model, kind, r.owner || null), doc: '' };
  for (const f of lib.KINDS[kind].fields) if (el[f] === undefined) blank(el, f);
  if (kind === 'ParameterUsage') el.direction = 'in';
  if (r.owner) { if (el.direction === '' && lib.idsOf(model).get(r.owner).kind === 'PortDefinition') el.direction = 'out'; el.owner = r.owner; }
  let words;
  session.history.edit(() => {
    model.elements.push(el);
    r.view.layout[el.id] = r.place;
    words = 'Added ' + lib.describe(model, model.elements.at(-1));
    return words;
  });
  return { made: { type: 'el', id: el.id }, words };
}
export function draw(session, kind, fromId, toId) {
  const model = session.model; const ids = lib.idsOf(model);
  const a = ids.get(fromId), b = ids.get(toId);
  if (!a || !b || !lib.RELATIONSHIPS[kind]) throw new Error('caller');
  const R = lib.RELATIONSHIPS[kind];
  let problem = R.first(model, a, ids);
  if (!problem && a.id === b.id) problem = 'Pick two different elements.';
  if (!problem && model.relationships.some((r) => r.kind === kind && r.from === a.id && r.to === b.id)) problem = 'That is already drawn.';
  if (!problem) problem = R.ends(model, a, b, ids);
  if (problem) return { refused: problem };
  const rel = { id: newId(model, 'r'), kind, from: a.id, to: b.id };
  for (const f of R.fields) blank(rel, f);
  let words;
  session.history.edit(() => {
    const old = kind === 'FeatureTyping' ? lib.typingOf(model, a) : null;
    if (old) model.relationships.splice(model.relationships.indexOf(old), 1);
    model.relationships.push(rel);
    words = 'Drew ' + lib.describeRel(model, model.relationships.at(-1));
    return words;
  });
  return { made: { type: 'rel', id: rel.id }, words };
}
const selections = new WeakMap();
export function selectionOf(session) {
  if (!selections.has(session)) {
    const ls = new Set();
    const s = { items: [], view: null, set(items) { s.items = items; ls.forEach((l) => l()); }, front(v) { const nv = session.model.views.some((x) => x.id === v) ? v : null; if (nv === s.view) return; s.view = nv; ls.forEach((l) => l()); }, listen(l) { ls.add(l); return () => ls.delete(l); } };
    selections.set(session, s);
  }
  return selections.get(session);
}
const all = new WeakMap();
export function toolsOf(session) {
  if (all.has(session)) return all.get(session);
  let armed = null, first = null, said = null, n = 0;
  const ls = new Set();
  const tell = () => ls.forEach((l) => l());
  const say = (text) => { said = text === null ? null : { text, n: ++n }; };
  const toolOf = (kind) => { if (lib.KINDS[kind]) return { kind, type: 'el', label: lib.KINDS[kind].label }; if (lib.RELATIONSHIPS[kind]) return { kind, type: 'rel', label: lib.RELATIONSHIPS[kind].label }; throw new Error('no such kind'); };
  const lists = (viewKind, kind) => toolGroups(viewKind).some((g) => g.some((t) => t.kind === kind));
  const doClick = (hit) => {
    const model = session.model;
    const view = model.views.find((v) => v.id === hit.view);
    if (!view || !core.isDrawn(lib, view.kind)) { armed = null; first = null; said = null; return; }
    if (!lists(view.kind, armed.kind)) { const t = armed; armed = null; first = null; say(`${lib.an(lib.VIEW_KINDS[view.kind].label, true)} has no ${t.label} tool, so the tool was put down.`); return; }
    const ids = lib.idsOf(model);
    if (armed.type === 'el') {
      const out = place(session, armed.kind, hit);
      if (out.refused) { say(out.refused); return; }
      armed = null; first = null; said = null; return out.made;
    }
    const el = hit.type === 'el' && hit.id ? ids.get(hit.id) : null;
    if (!el) { const had = first; armed = null; first = null; say(had ? 'Put down: nothing was drawn.' : null); return; }
    if (first === null) {
      const problem = lib.RELATIONSHIPS[armed.kind].first(model, el, ids);
      if (problem) { say(problem + core.ESCAPE_HINT); return; }
      first = el.id; said = null; return;
    }
    const out = draw(session, armed.kind, first, hit.id);
    if (out.refused) { say(out.refused + core.ESCAPE_HINT); return; }
    armed = null; first = null;
    const rel = model.relationships.find((r) => r.id === out.made.id);
    const shown = model.views.some((v) => core.isDrawn(lib, v.kind) && v.layout[rel.from] && v.layout[rel.to]);
    say(shown ? null : out.words + '. No view shows both ends, so the line is not drawn anywhere yet.');
    return out.made;
  };
  const t = {
    get armed() { return armed; }, get first() { return first; }, get said() { return said; },
    get hint() { return armed ? toolHint(armed.kind, first === null ? 0 : 1) : null; },
    arm(kind) { const tool = toolOf(kind); armed = armed && armed.kind === kind ? null : tool; first = null; said = null; tell(); },
    putDown() { if (!armed) return; armed = null; first = null; said = null; tell(); },
    click(hit) { if (!armed) return false; const made = doClick(hit); tell(); if (made) selectionOf(session).set([made]); return true; },
    offers(hit) {
      const model = session.model; const view = model.views.find((v) => v.id === hit.view);
      if (!view || !core.isDrawn(lib, view.kind)) return [];
      const ids = lib.idsOf(model);
      if (hit.type === 'rel') return [];
      const el = hit.type === 'el' ? ids.get(hit.id) : null;
      if (hit.type === 'el' && !el) return [];
      return toolGroups(view.kind).map((g) => g.filter((tool) => {
        if (tool.type === 'el') { const r = wouldPlace(session, tool.kind, hit); if (r.refused) return false; return el ? r.owner === el.id : !r.owner; }
        return el ? lib.RELATIONSHIPS[tool.kind].first(model, el, ids) === null : false;
      })).filter((g) => g.length);
    },
    choose(kind, hit) { armed = toolOf(kind); first = null; said = null; const made = doClick(hit); tell(); if (made) selectionOf(session).set([made]); },
    listen(l) { ls.add(l); return () => ls.delete(l); },
  };
  let view = selectionOf(session).view;
  selectionOf(session).listen(() => { const v = selectionOf(session).view; if (v === view) return; view = v; if (!armed) return; const mv = session.model.views.find((x) => x.id === v); if (!mv || !lists(mv.kind, armed.kind)) { armed = null; first = null; said = null; tell(); } });
  session.history.listen((told) => { if (told.structure && first !== null && !lib.idsOf(session.model).get(first)) { first = null; tell(); } });
  all.set(session, t);
  return t;
}
export const open = (file, name = 'f.json') => core.openText(lib, readText(file), { name }, { now: clock() });
export const fx = (name) => path.join(FIXTURES, name);
export function rectOf(session, viewId, id) { const view = session.model.views.find((v) => v.id === viewId); return core.project(lib, session.model, view).rects.get(id); }
export function inBox(session, view, id) { const r = rectOf(session, view, id); if (!r) throw new Error('no rect for ' + id + ' in ' + view); return { view, type: 'el', id, at: { x: r.x + 24, y: r.y + 14 }, add: false }; }
export function onMid(session, view, id) { const r = rectOf(session, view, id); if (!r) throw new Error('no rect for ' + id + ' in ' + view); return { view, type: 'el', id, at: { x: r.x + r.w / 2, y: r.y + r.h / 2 }, add: false }; }
export const ground = (view, x, y) => ({ view, type: 'ground', id: null, at: { x, y }, add: false });
