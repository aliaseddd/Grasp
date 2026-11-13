import { EXAMPLE, FIXTURES, clock, lib, loadCore, plain, readText, ROOT } from '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-9/canvas/app/test/core.mjs';
import { scaleState } from '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-9/canvas/test/scale-model.mjs';
import path from 'node:path';
import fs from 'node:fs';
const core = await loadCore();
function words(model, row, ids) {
  if (row.type === 'rel') {
    const label = lib.RELATIONSHIPS[row.item.kind].label;
    let said = lib.describeRel(model, row.item, ids);
    if (said.indexOf(label + ' ') === 0) said = said.slice(label.length + 1);
    return { kw: '«' + label + '» ', name: said, type: '' };
  }
  const el = row.item; const kind = lib.KINDS[el.kind];
  const name = lib.textName(el);
  const parts = { kw: name !== null && kind.keyword ? '«' + kind.keyword + '» ' : '', name: name === null ? kind.label : name || '(unnamed)', type: '' };
  if (kind.usage) {
    const typing = lib.typingOf(model, el);
    if (typing) { const def = ids.get(typing.to); parts.type += ' : ' + (el.conjugated ? '~' : '') + (def ? lib.textName(def) || '(unnamed)' : '?'); }
    if (el.multiplicity) parts.type += ' [' + el.multiplicity + ']';
  }
  return parts;
}
function rowsOf(text, name) {
  const s = core.openText(lib, text, { name }, { now: clock() });
  const model = s.model;
  const rows = lib.browserRows(model, { options: { roots: null, collapsed: [] } });
  const ids = lib.idsOf(model);
  const out = [[0, 'package:', '«package» ' + (model.package.name.trim() || '(unnamed)')]];
  for (const v of model.views) out.push([1, 'view:' + v.id, '«' + (lib.VIEW_KINDS[v.kind]?.label ?? v.kind) + '» ' + (v.name.trim() || '(unnamed)')]);
  for (const r of rows) { const w = words(model, r, ids); out.push([r.depth + 1, r.type + ':' + r.id, w.kw + w.name + w.type, r.kids]); }
  return { out, s, rows };
}
const ex = rowsOf(readText(EXAMPLE), 'example.json');
for (const r of ex.out) console.log(r[0], r[1].padEnd(20), r[2]);
console.log('example rows', ex.out.length);
const want = { 'behavior-actions.json': ['el:Release.start', 'el:Release.split', 'rel:s-start', 'el:maintainer'], 'behavior-states.json': ['el:HostLifecycle.initial', 'rel:t-mount'], 'sequence.json': ['el:Login.client.loginSent', 'rel:m-login'], 'interconnection.json': ['el:Tank.stored', 'el:FuelLine.b', 'rel:fuelLine'] };
for (const [f, ids] of Object.entries(want)) { const r = rowsOf(readText(path.join(FIXTURES, f)), f); console.log(f, r.out.length, 'rows'); for (const id of ids) console.log('   ', id, '=>', JSON.stringify(r.out.find(x => x[1] === id)?.[2])); }
const blank = rowsOf(readText(path.join(ROOT, 'canvas', 'state.json')), 'state.json'); console.log('blank', blank.out);
for (const n of [500, 501, 5000]) {
  const r = rowsOf(JSON.stringify(scaleState(n)), 'scale.json');
  const top = r.rows.filter(x => x.depth === 0).length;
  console.log(n, 'elements', r.s.model.elements.length, 'views', r.s.model.views.length, 'lib rows', r.rows.length, 'top-level lib rows', top, 'inside package', top + r.s.model.views.length, 'rows with kids', r.rows.filter(x => x.kids).length, 'total rows incl pkg+views', r.out.length);
  if (n === 5000) {
    // items to Tree View: package + views + first 197 lib top rows w/ their descendants (each limited to 200) + show more
    let count = 1 + 3 + 1; let seen = 0; let i = 0;
    const rows = r.rows; 
    // count descendants of first 197 top-level rows
    let tops = 0; for (const row of rows) { if (row.depth === 0) { tops++; if (tops > 197) break; } count++; }
    console.log('items to tree view (approx)', count, 'not shown', top + 3 - 200);
    console.log('first 6 top rows', rows.filter(x => x.depth === 0).slice(0, 6).map(x => x.type + ':' + x.id + (x.kids ? '+' : '')));
    console.log('max children of any row', Math.max(...(() => { const c = new Map(); const stack = []; for (const row of rows) { stack.length = row.depth; const p = row.depth ? stack[row.depth - 1] : 'pkg'; c.set(p, (c.get(p) || 0) + 1); if (row.type === 'el') stack.push(row.id); } return [...c.values()]; })()));
  }
}
const ic = rowsOf(readText(path.join(FIXTURES, 'interconnection.json')), 'ic'); console.log('ic rows', ic.out.length); for (const r of ic.out.slice(0, 12)) console.log(r[0], r[1].padEnd(20), r[2], r[3] ? '+' : '');
console.log(ic.out.findIndex(x => x[1] === 'el:System.pump'), ic.out.findIndex(x => x[1] === 'el:Fuel'));
