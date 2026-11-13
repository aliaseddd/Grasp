import fs from 'node:fs';
import path from 'node:path';
import { loadLib } from '../wt-12/canvas/export.mjs';
import { scaleState } from '../wt-12/canvas/test/scale-model.mjs';
const ROOT = path.resolve('.');
const lib = loadLib();
const files = ['canvas/examples/stronghold-proof.json', 'canvas/state.json', ...fs.readdirSync('canvas/test/fixtures').filter(f=>f.endsWith('.json')).map(f=>'canvas/test/fixtures/'+f)];
for (const f of files) {
  const m = lib.normalize(JSON.parse(fs.readFileSync(f,'utf8')).model);
  const p = lib.validate(m), s = lib.validateSpec(m);
  console.log(f, 'problems', p.length, 'spec', s.length);
  for (const x of p) console.log('   P', JSON.stringify(x));
  for (const x of s) console.log('   S', JSON.stringify(x));
}
const ex = lib.normalize(JSON.parse(fs.readFileSync(files[0],'utf8')).model);
console.log(ex.package, ex.elements.map(e=>[e.id,e.kind,e.name,e.owner].join('|')).join('\n'));
console.log(ex.relationships.map(e=>[e.id,e.kind,e.name,e.from,e.to,e.hidden].join('|')).join('\n'));
console.log(ex.views.map(v=>[v.id,v.kind,v.name].join('|')));
// rename App to Host
const el = ex.elements.find(e=>e.name==='App');
console.log('rename', el && el.id);
