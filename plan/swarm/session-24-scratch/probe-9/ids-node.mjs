import fs from 'node:fs';
const core = await import('./wt/canvas/app/test/core.mjs');
const { scaleState } = await import('./wt/canvas/test/scale-model.mjs');
const m = await core.loadWith('panels/explorerRows');
const lib = core.lib;
for (const f of ['behavior-actions', 'behavior-states', 'sequence', 'interconnection']) {
  const s = m.openText(lib, fs.readFileSync(`./wt/canvas/test/fixtures/${f}.json`, 'utf8'), { name: f });
  const r = m.explorerRowsOf(s);
  const out = [];
  const walk = (item, depth) => { const w = r.wordsOf(item.id); out.push('  '.repeat(depth) + item.id + ' | ' + (w ? w.kw + w.name + w.type : '-')); item.children.forEach((c) => walk(c, depth + 1)); };
  r.items.forEach((i) => walk(i, 0));
  console.log('---', f, s.model.elements.length, '\n' + out.join('\n'));
}
for (const n of [499, 500, 501, 520]) { const st = scaleState(n); console.log(n, 'elements', st.model.elements.length); }
const s5 = m.openText(lib, JSON.stringify(scaleState(500)), { name: 's500' });
const r5 = m.explorerRowsOf(s5);
console.log('500: unfolded', r5.unfolded.length, 'package children', r5.items[0].children.length, r5.items[0].children.at(-1).id);
const big = m.openText(lib, JSON.stringify(scaleState(5000)), { name: 'big' });
const rb = m.explorerRowsOf(big);
console.log(rb.items[0].children.slice(0, 6).map((c) => c.id + '(' + c.children.length + ')'), big.model.package.name);
console.log(big.model.elements.slice(0, 8).map((e) => e.id + ':' + e.kind + ':' + (e.owner ?? '')));
const noKids = big.model.elements.find((e) => !e.owner && !big.model.elements.some((k) => k.owner === e.id));
console.log('top-level with nothing inside', noKids?.id);
