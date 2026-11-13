import { lib, stateFiles, readJSON } from '../rd-all/canvas/app/test/core.mjs';
import { mergedFixtures } from './merged.mjs';
console.log(typeof lib.browserRows, lib.browserRows.length, String(lib.browserRows).slice(0, 300));
const check = (name, m) => {
  let rows; try { rows = lib.browserRows(m); } catch (e) { try { rows = lib.browserRows(m, {}); } catch (e2) { console.log(name, 'ERR', e2.message); return; } }
  const flat = []; const walk = (r) => { for (const x of r) { flat.push(x); if (x.rows) walk(x.rows); if (x.children) walk(x.children); } }; walk(Array.isArray(rows) ? rows : [rows]);
  const have = new Set(flat.map((r) => (r.type || r.kind) + ':' + (r.id ?? (r.item && r.item.id))));
  const missing = [...m.elements.map((e) => 'el:' + e.id), ...m.relationships.map((e) => 'rel:' + e.id), ...m.views.map((e) => 'view:' + e.id)].filter((k) => !have.has(k));
  console.log(name, 'rows', flat.length, 'missing', missing.length, missing.slice(0, 8), 'sample', JSON.stringify(flat.slice(0, 3)).slice(0, 400));
};
for (const f of stateFiles()) check(f.name, lib.normalize(readJSON(f.file).model));
check('merged', lib.normalize(mergedFixtures(lib)));
