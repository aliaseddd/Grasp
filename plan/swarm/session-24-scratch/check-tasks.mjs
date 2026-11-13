// Checks plan/swarm/tasks.json (or the tasks-N.json fragments given) against the scaffold's own rules.
// node check-tasks.mjs <repo root> [fragment.json ...]
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2]);
const files = process.argv.slice(3);
const tasks = files.length
  ? files.flatMap((f) => JSON.parse(fs.readFileSync(f, 'utf8')))
  : JSON.parse(fs.readFileSync(path.join(root, 'plan/swarm/tasks.json'), 'utf8')).tasks;
const problems = [];
const byId = new Map();
for (const t of tasks) {
  if (byId.has(t.id)) problems.push(`two tasks are named ${t.id}`);
  byId.set(t.id, t);
}
const KINDS = ['tests', 'implement', 'review', 'checks'];
for (const t of tasks) {
  for (const key of ['id', 'step', 'kind', 'brief', 'owns', 'needs', 'model', 'effort', 'status']) if (!(key in t)) problems.push(`${t.id} has no ${key}`);
  if (!KINDS.includes(t.kind)) problems.push(`${t.id}: kind ${t.kind}`);
  if (t.status !== 'open') problems.push(`${t.id}: status ${t.status}`);
  if (String(t.id).split('-')[0] !== String(t.step)) problems.push(`${t.id}: step ${t.step}`);
  if (t.brief !== `plan/swarm/briefs/${t.id}.md`) problems.push(`${t.id}: brief ${t.brief}`);
  if (!fs.existsSync(path.join(root, t.brief))) problems.push(`${t.id}: no file ${t.brief}`);
  for (const n of t.needs) if (!byId.has(n)) problems.push(`${t.id} needs ${n}, which is no task`);
  if (!['sonnet', 'fable', 'lead'].includes(t.model)) problems.push(`${t.id}: model ${t.model}`);
}
// Everything a task needs, directly or through others.
const all = new Map();
const closure = (id, seen = new Set()) => {
  if (all.has(id)) return all.get(id);
  const out = new Set();
  if (seen.has(id)) { problems.push(`a ring of needs through ${id}`); return out; }
  seen.add(id);
  for (const n of byId.get(id)?.needs ?? []) { out.add(n); for (const m of closure(n, seen)) out.add(m); }
  all.set(id, out);
  return out;
};
for (const t of tasks) closure(t.id);
// No two tasks that can run at the same time own one file.
const owners = new Map();
for (const t of tasks) for (const f of t.owns) (owners.get(f) ?? owners.set(f, []).get(f)).push(t.id);
for (const [f, ids] of owners) {
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const a = ids[i]; const b = ids[j];
    if (!all.get(a).has(b) && !all.get(b).has(a)) problems.push(`${a} and ${b} both own ${f}, and neither needs the other`);
  }
}
// A directory owned by one task and a file under it by another.
for (const [f, ids] of owners) if (f.endsWith('/')) for (const [g, others] of owners) {
  if (g !== f && g.startsWith(f)) for (const a of ids) for (const b of others) if (a !== b && !all.get(a).has(b) && !all.get(b).has(a)) problems.push(`${a} owns ${f} and ${b} owns ${g}, and neither needs the other`);
}
// Each step's closing needs every other task of the step and the closing before it.
for (const t of tasks) if (/-checks-close$/.test(t.id)) {
  for (const o of tasks) if (o.step === t.step && o.id !== t.id && !all.get(t.id).has(o.id)) problems.push(`${t.id} does not need ${o.id}`);
  const before = `${t.step - 1}-checks-close`;
  if (t.step > 8 && !all.get(t.id).has(before)) problems.push(`${t.id} does not need ${before}`);
}
// Briefs with no task.
const briefs = fs.existsSync(path.join(root, 'plan/swarm/briefs')) ? fs.readdirSync(path.join(root, 'plan/swarm/briefs')).filter((f) => f.endsWith('.md')) : [];
const steps = new Set(tasks.map((t) => String(t.step)));
for (const b of briefs) if (steps.has(b.split('-')[0]) && !byId.has(b.replace(/\.md$/, ''))) problems.push(`the brief ${b} has no task`);
// Each brief carries the five rules.
for (const t of tasks) {
  const file = path.join(root, t.brief);
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (t.kind !== 'review' || !/review-shot/.test(t.id)) {
    for (const mark of ['Change only the files you own', 'unchanged.json', 'No new package', 'loosened, skipped or marked todo', 'window.Grasp', 'Tests check the code and do not define it']) {
      if (!text.includes(mark)) problems.push(`${t.brief} lacks the rule: ${mark}`);
    }
  }
}
console.log(`${tasks.length} tasks, ${[...owners.keys()].length} owned paths, ${briefs.length} briefs.`);
for (const step of [...steps].sort((a, b) => a - b)) {
  const mine = tasks.filter((t) => String(t.step) === step);
  console.log(`  step ${step}: ${mine.length} tasks (${KINDS.map((k) => `${mine.filter((t) => t.kind === k).length} ${k}`).join(', ')})`);
}
if (problems.length) { console.log(problems.join('\n')); process.exitCode = 1; } else console.log('No problem found.');
