import { lib, stateFiles, readJSON, loadWith, clock, plain, EXAMPLE, FIXTURES } from '../rd-all/canvas/app/test/core.mjs';
import { make } from './ref.mjs';
import path from 'node:path';
const app = await loadWith('panels/fieldHooks');
const R = make(app);
const open = (file) => { const mistakes = []; const s = app.openSession(lib, readJSON(file), { name: path.basename(file) }, { now: clock(), mistake: (e) => mistakes.push(e) }); s.mistakes = mistakes; return s; };
// test 2: the appendix
const s = open(EXAMPLE);
for (const [type, id] of [['el','Host'],['el','ServerHost'],['el','Page.hosts'],['el','Page.hosts.api'],['rel','mount'],['rel','t-hosts'],['view','v-proof']]) {
  const f = R.formOf(s, { type, id }, 'v-proof');
  console.log('=====', id, '|', f.what, '|', f.title);
  for (const g of f.core) { console.log('  [' + g.name + ']'); for (const r of g.rows) console.log('    ', JSON.stringify(r)); }
  console.log('  [advanced]'); for (const r of f.advanced) console.log('    ', JSON.stringify(r));
}
