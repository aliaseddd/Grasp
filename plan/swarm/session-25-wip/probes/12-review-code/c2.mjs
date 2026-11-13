import fs from 'node:fs';
import { lib } from './h.mjs';
const base = () => JSON.parse(fs.readFileSync('/home/user/wt/12-review-code/canvas/examples/stronghold-proof.json', 'utf8')).model;
const tries = {
  bogusKind: (m) => { m.elements.push({ id: 'X', kind: 'Bogus', name: 'X' }); },
  ownerMissing: (m) => { m.elements.push({ id: 'Y', kind: 'PartUsage', name: 'y', owner: 'Nope', multiplicity: '', doc: '' }); },
  relBogusKind: (m) => { m.relationships.push({ id: 'r1', kind: 'Bogus', from: 'Host', to: 'App' }); },
  relDangling: (m) => { m.relationships.push({ id: 'r2', kind: 'Specialization', from: 'Host', to: 'Nope' }); },
  ownerCycle: (m) => { m.elements.find(e => e.id === 'Page').owner = 'Page.hosts'; },
  viewBogusKind: (m) => { m.views[0].kind = 'BogusView'; },
  nameNull: (m) => { m.elements.find(e => e.id === 'Host').name = null; },
};
for (const [k, f] of Object.entries(tries)) {
  const m = base(); f(m);
  let n; try { n = lib.normalize(m); } catch (e) { console.log(k, 'normalize throws', e.message); continue; }
  const kept = JSON.stringify(n).includes('Bogus') || k;
  try { const p = lib.validate(n); console.log(k, 'validate ok', p.length, JSON.stringify(p).slice(0, 150)); } catch (e) { console.log(k, 'VALIDATE THROWS', e.message); }
  try { const d = lib.validateSpec(n); console.log(k, 'spec ok', d.length); } catch (e) { console.log(k, 'SPEC THROWS', e.message); }
}
