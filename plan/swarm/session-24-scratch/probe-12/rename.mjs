import fs from 'node:fs';
import { loadLib } from '../wt-12/canvas/export.mjs';
import { scaleState } from '../wt-12/canvas/test/scale-model.mjs';
const lib = loadLib();
const load = () => lib.normalize(JSON.parse(fs.readFileSync('canvas/examples/stronghold-proof.json','utf8')).model);
for (const [id, name] of [['DevHost','OnlineHost'],['App','Host'],['OnlineHost','ServerHost'],['Page.app','hosts'],['DevHost','']]) {
  const m = load();
  m.elements.find(e=>e.id===id).name = name;
  console.log('---', id, '->', JSON.stringify(name));
  for (const x of lib.validate(m)) console.log('   P', JSON.stringify(x));
  for (const x of lib.validateSpec(m)) console.log('   S', JSON.stringify(x));
}
// package-level and view and rel problems
{ const m = load(); m.views[0].name = 'Host'; console.log('--- view named Host'); for (const x of lib.validate(m)) console.log('   P', JSON.stringify(x)); for (const x of lib.validateSpec(m)) console.log('   S', JSON.stringify(x)); }
{ const m = load(); m.relationships.find(r=>r.id==='s-DevHost').to='StrongholdApp'; console.log('--- spec part def -> port def'); for (const x of lib.validate(m)) console.log('   P', JSON.stringify(x)); for (const x of lib.validateSpec(m)) console.log('   S', JSON.stringify(x)); }
{ const m = load(); m.relationships.find(r=>r.id==='t-hosts-api').to='Host'; console.log('--- hidden typing wrong'); for (const x of lib.validate(m)) console.log('   P', JSON.stringify(x)); for (const x of lib.validateSpec(m)) console.log('   S', JSON.stringify(x)); }
console.log(lib.SPEC_RULES.length, Object.keys(lib).filter(k=>/valid|describe|qualified|reading/i.test(k)));
// timing at scale
const st = scaleState(5000);
const big = lib.normalize(st.model);
console.log('scale', big.elements.length, big.relationships.length, big.views.length);
const time = (f, n=15) => { const t=[]; let r; for (let i=0;i<n;i++){ const a=performance.now(); r=f(); t.push(performance.now()-a);} t.sort((a,b)=>a-b); return { median: t[n>>1].toFixed(1), min: t[0].toFixed(1), max: t[n-1].toFixed(1), n: r.length }; };
console.log('validate', time(()=>lib.validate(big)));
console.log('validateSpec', time(()=>lib.validateSpec(big)));
console.log('both in one reading', time(()=>lib.reading(big, ()=>[...lib.validate(big), ...lib.validateSpec(big)])));
console.log('stringify', time(()=>[JSON.stringify(lib.validate(big))]));
