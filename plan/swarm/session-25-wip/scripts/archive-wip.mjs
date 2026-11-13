#!/usr/bin/env node
// Copies the files of every task of steps 10 to 12 that session 25's swarm finished into
// plan/swarm/session-25-wip/<task>/<path>, from each task's final commit, and writes a manifest. Run from the main tree.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const MAIN = '/home/user/Grasp';
const OUT = path.join(MAIN, 'plan/swarm/session-25-wip');
const STATE = '/tmp/claude-0/-home-user-Grasp/e9b8ddbf-df6f-5a0b-8c71-a9c82bd8bd62/scratchpad/swarm-state.json';
const state = JSON.parse(fs.readFileSync(STATE, 'utf8'));
const tasks = JSON.parse(fs.readFileSync(path.join(MAIN, 'plan/swarm/tasks.json'), 'utf8')).tasks;
const git = (...args) => execFileSync('git', args, { cwd: MAIN, encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });

const manifest = [];
for (const t of tasks) {
  if (t.step < 10) continue;
  const rec = state.taken[t.id];
  if (!rec?.head) continue;
  const files = [];
  for (const file of t.owns) {
    if (file.endsWith('/')) continue;
    let blob;
    try { blob = git('show', `${rec.head}:${file}`); } catch { continue; }
    const to = path.join(OUT, t.id, file);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.writeFileSync(to, blob);
    files.push(file);
  }
  manifest.push({ task: t.id, step: t.step, kind: t.kind, commit: rec.head, base: rec.base, files });
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(manifest.map((m) => `${m.task}: ${m.files.length} file(s)`).join('\n'));
