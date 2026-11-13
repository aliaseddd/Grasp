#!/usr/bin/env node
// The lead's helper for running plan/swarm/ by hand (plan/swarm/README.md, "How the lead runs the swarm").
//
//   node swarm.mjs base <task>            make /home/user/wt/<task>: the last closed step + the owned files of every
//                                         task <task> needs (transitively, not yet closed), committed as its base;
//                                         node_modules hard-linked from the main tree
//   node swarm.mjs take <task>            record the agent's final commit as refs/swarm/<task>; list what it changed,
//                                         and flag every change outside the files the task owns
//   node swarm.mjs overlay <dir> <task>…  check the owned files of those tasks (in order of needs) out into <dir>
//   node swarm.mjs close <commit>         the commit that closes a step: later bases start from it
//   node swarm.mjs state                  print the state
//   node swarm.mjs drop <task>            remove a task's worktree (its ref stays)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const MAIN = '/home/user/Grasp';
const WT = '/home/user/wt';
const STATE = path.join(path.dirname(new URL(import.meta.url).pathname), 'swarm-state.json');

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const tasks = () => JSON.parse(fs.readFileSync(path.join(MAIN, 'plan/swarm/tasks.json'), 'utf8')).tasks;
const load = () => fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : { close: git(MAIN, 'rev-parse', 'HEAD'), closedSteps: 7, taken: {} };
const save = (s) => fs.writeFileSync(STATE, JSON.stringify(s, null, 2) + '\n');

function byId() { return Object.fromEntries(tasks().map((t) => [t.id, t])); }

/** Every task `id` needs, directly or not, in an order where each comes after what it needs. */
function needsOf(id) {
  const all = byId();
  const seen = new Set();
  const order = [];
  const visit = (x) => {
    for (const n of all[x].needs) if (!seen.has(n)) { seen.add(n); visit(n); order.push(n); }
  };
  visit(id);
  return order;
}

function overlay(dir, ids, state) {
  const all = byId();
  for (const id of ids) {
    const t = all[id];
    const ref = state.taken[id]?.head;
    if (!ref) throw new Error(`${id} is not taken yet`);
    for (const file of t.owns) {
      if (file.endsWith('/')) continue; // canvas/dist/: the lead builds it
      let inRef = true;
      try { git(dir, 'cat-file', '-e', `${ref}:${file}`); } catch { inRef = false; }
      if (inRef) git(dir, 'checkout', ref, '--', file);
      else if (fs.existsSync(path.join(dir, file))) git(dir, 'rm', '-q', '--', file);
    }
  }
}

const [cmd, ...args] = process.argv.slice(2);
const state = load();

if (cmd === 'base') {
  const [id] = args;
  const all = byId();
  if (!all[id]) throw new Error(`no task ${id}`);
  const dir = path.join(WT, id);
  if (fs.existsSync(dir)) throw new Error(`${dir} exists`);
  const needed = needsOf(id).filter((n) => all[n].step > state.closedSteps);
  const missing = needed.filter((n) => !state.taken[n]);
  if (missing.length) throw new Error(`${id} needs ${missing.join(', ')}, not taken yet`);
  fs.mkdirSync(WT, { recursive: true });
  git(MAIN, 'worktree', 'add', '--detach', dir, state.close);
  overlay(dir, needed, state);
  git(dir, 'add', '-A');
  let base = git(dir, 'rev-parse', 'HEAD');
  if (git(dir, 'status', '--porcelain')) {
    git(dir, '-c', 'user.name=lead', '-c', 'user.email=lead@local', 'commit', '-q', '-m', `base for ${id}: ${needed.join(', ') || 'the last closed step'}`);
    base = git(dir, 'rev-parse', 'HEAD');
  }
  execFileSync('cp', ['-al', path.join(MAIN, 'node_modules'), path.join(dir, 'node_modules')]);
  state.taken[id] = { ...(state.taken[id] ?? {}), base, dir, started: new Date().toISOString() };
  delete state.taken[id].head;
  save(state);
  console.log(`${dir} at ${base.slice(0, 9)} (${needed.length ? 'with ' + needed.join(', ') : 'the last closed step'})`);
} else if (cmd === 'take') {
  const [id] = args;
  const t = byId()[id];
  const rec = state.taken[id];
  const dir = rec.dir;
  const dirty = git(dir, 'status', '--porcelain', '--untracked-files=all').split('\n').filter(Boolean)
    .filter((l) => !/ canvas\/dist\//.test(l));
  const head = git(dir, 'rev-parse', 'HEAD');
  const changed = git(dir, 'diff', '--name-status', rec.base, head).split('\n').filter(Boolean);
  const owned = (f) => t.owns.some((o) => o.endsWith('/') ? f.startsWith(o) : f === o);
  const outside = changed.filter((l) => !owned(l.split('\t').pop()));
  console.log(`${id}: ${head.slice(0, 9)} on ${rec.base.slice(0, 9)}`);
  console.log(changed.map((l) => '  ' + l + (owned(l.split('\t').pop()) ? '' : '   <-- NOT OWNED')).join('\n') || '  (no change committed)');
  if (dirty.length) console.log('uncommitted:\n' + dirty.map((l) => '  ' + l).join('\n'));
  if (outside.length) console.log(`WARNING: ${outside.length} change(s) outside what ${id} owns; they are not taken.`);
  git(MAIN, 'update-ref', `refs/swarm/${id}`, head);
  state.taken[id] = { ...rec, head, took: new Date().toISOString() };
  save(state);
} else if (cmd === 'overlay') {
  const [dir, ...ids] = args;
  overlay(dir, ids, state);
  console.log(git(dir, 'status', '--short'));
} else if (cmd === 'close') {
  state.close = git(MAIN, 'rev-parse', args[0]);
  state.closedSteps = Number(args[1]);
  save(state);
  console.log(`bases start from ${state.close.slice(0, 9)}, steps up to ${state.closedSteps} closed`);
} else if (cmd === 'drop') {
  const [id] = args;
  const dir = state.taken[id].dir;
  git(MAIN, 'worktree', 'remove', '--force', dir);
  console.log(`removed ${dir}`);
} else {
  console.log(JSON.stringify(state, null, 2));
}
