#!/usr/bin/env node
// Reads the output of `node --test canvas/app/test/scale.test.mjs` (or of `npm test`) and prints its figures: the
// opening time, a drag step's two medians, a pan step's two medians per view, the keystroke's, with the sample counts.
//   node scale-figures.mjs <output file>…        one line per file; with several, the median of each figure too
import fs from 'node:fs';

const med = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

function figures(text) {
  const f = {};
  const open = text.match(/The model of 5000 elements (?:opened in|took) ([\d.]+) ms/);
  if (open) f.open = Number(open[1]);
  const drag = text.match(/A drag step takes ([\d.]+) ms when it starts a drag and ([\d.]+) ms when it follows one/);
  if (drag) [f.dragStart, f.dragFollow] = [Number(drag[1]), Number(drag[2])];
  const samples = (label) => {
    const re = new RegExp(`${label}, in ms: ([^\\n]*)`);
    const m = text.match(re);
    return m ? m[1].split(/\),? |, (?=\d)/).filter((x) => /\d/.test(x)).length : null;
  };
  if (drag) [f.dragStartN, f.dragFollowN] = [samples('Starting'), samples('Following')];
  for (const m of text.matchAll(/A pan step of (\w+), fitted at ([\d.]+)%, takes ([\d.]+) ms when it starts a pan and ([\d.]+) ms when it follows one/g)) {
    f[`pan.${m[1]}`] = [Number(m[3]), Number(m[4])];
  }
  const key = text.match(/A keystroke takes ([\d.]+) ms when it opens a name's undo step and ([\d.]+) ms when it joins one/);
  if (key) [f.keyOpen, f.keyJoin] = [Number(key[1]), Number(key[2])];
  const sum = (name) => { const m = text.match(new RegExp(`^# ${name} (\\d+)`, 'm')); return m ? Number(m[1]) : null; };
  f.summary = { tests: sum('tests'), pass: sum('pass'), fail: sum('fail'), todo: sum('todo'), ms: sum('duration_ms') };
  return f;
}

const files = process.argv.slice(2);
const all = files.map((file) => ({ file, f: figures(fs.readFileSync(file, 'utf8')) }));
const fmt = (v) => (v === undefined ? '-' : Array.isArray(v) ? v.map((x) => x.toFixed(1)).join(' / ') : typeof v === 'number' ? v.toFixed(1) : JSON.stringify(v));
const keys = ['open', 'dragStart', 'dragFollow', 'pan.definitions', 'pan.deployment', 'pan.workflows', 'keyOpen', 'keyJoin'];
for (const { file, f } of all) {
  console.log(file.split('/').pop(), keys.map((k) => `${k}=${fmt(f[k])}`).join('  '), ` n(drag)=${f.dragStartN ?? '-'}/${f.dragFollowN ?? '-'}`, ` ${fmt(f.summary)}`);
}
if (all.length > 1) {
  const m = {};
  for (const k of keys) {
    const vals = all.map(({ f }) => f[k]).filter((v) => v !== undefined);
    if (!vals.length) continue;
    m[k] = Array.isArray(vals[0]) ? [med(vals.map((v) => v[0])), med(vals.map((v) => v[1]))] : med(vals);
  }
  console.log('median of runs:', keys.map((k) => `${k}=${fmt(m[k])}`).join('  '));
}
