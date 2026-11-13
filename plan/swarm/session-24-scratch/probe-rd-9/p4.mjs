import { EXAMPLE, FIXTURES, clock, lib, loadCore, readText, ROOT } from '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-9/canvas/app/test/core.mjs';
import { scaleState } from '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-9/canvas/test/scale-model.mjs';
import path from 'node:path'; import fs from 'node:fs';
const core = await loadCore();
const files = [['example', readText(EXAMPLE)], ...fs.readdirSync(FIXTURES).filter(f => f.endsWith('.json')).map(f => [f, readText(path.join(FIXTURES, f))]), ['scale500', JSON.stringify(scaleState(500))], ['scale5000', JSON.stringify(scaleState(5000))]];
for (const [name, text] of files) {
  const s = core.openText(lib, text, { name }, { now: clock() });
  const rows = lib.browserRows(s.model, { options: { roots: null, collapsed: [] } });
  const odd = []; let maxKids = 0;
  rows.forEach((r, i) => { if (r.type === 'el' && !r.kids && rows[i + 1] && rows[i + 1].depth > r.depth) odd.push(r.id + ' <- ' + rows[i + 1].type + ':' + rows[i + 1].id); });
  const relsMissing = s.model.relationships.filter(r => !rows.some(x => x.type === 'rel' && x.id === r.id)).map(r => r.id);
  const dupIds = s.model.elements.filter(e => s.model.relationships.some(r => r.id === e.id) || s.model.views.some(v => v.id === e.id)).map(e => e.id);
  console.log(name, 'rows', rows.length, 'el with only rels inside:', odd.slice(0, 5), odd.length, 'rels without row:', relsMissing.length, 'ids shared across types:', dupIds.slice(0,5), 'views', s.model.views.map(v => v.id + ':' + v.kind).join(' '));
}
