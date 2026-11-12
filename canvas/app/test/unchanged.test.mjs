// The old page and the model library stay as slice 1 found them. This is the slice's sixth "Done when" check, "the
// library's Node tests pass unchanged", and it stands in for the old suite between the steps that run it in full.
//
// Two things are checked. Every file the old page and the library are made of has the SHA-256 that unchanged.json
// pins, and no file has come or gone. And the six files of canvas/test/ that need no browser pass, run here as the
// README's command runs them, in a process of their own.
//
// unchanged.json was written once, in step 3 of the slice, and this test only reads it: a file that changes can
// only fail the test. Until slice 2 retires the old page kind by kind, nothing under PINNED changes.

import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ROOT } from './helpers.mjs';

/** What the old page and the library are made of: folders, taken whole, and single files. */
const PINNED = [
  'canvas/src', 'canvas/test', 'canvas/index.html', 'canvas/build.mjs', 'canvas/export.mjs', 'canvas/save-state.mjs',
  'canvas/check.sh', 'canvas/state.json', 'canvas/examples', 'canvas/metamodel', 'docs/sysml/check.sh',
];
/** The test files of canvas/test/ that run in Node alone, and how many tests they hold between them. */
const NODE_TESTS = ['build', 'lookups', 'metamodel', 'model-lib', 'store-dump', 'stored'];
const NODE_TEST_COUNT = 50;

const sha256 = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');

/** Every file under a pinned path, as paths from the repository's root with forward slashes, sorted. */
function filesUnder(pinned) {
  const found = [];
  const walk = (rel) => {
    const at = path.join(ROOT, ...rel.split('/'));
    if (!fs.existsSync(at)) return;
    if (fs.statSync(at).isDirectory()) for (const name of fs.readdirSync(at)) walk(`${rel}/${name}`);
    else found.push(rel);
  };
  pinned.forEach(walk);
  return found.sort();
}

/** What differs between the files on disk and unchanged.json, one sentence each. */
function differences() {
  const { files } = JSON.parse(fs.readFileSync(fileURLToPath(new URL('./unchanged.json', import.meta.url)), 'utf8'));
  const there = filesUnder(PINNED);
  const found = [];
  for (const name of Object.keys(files)) {
    if (!there.includes(name)) found.push(`${name} is gone.`);
    else if (sha256(path.join(ROOT, ...name.split('/'))) !== files[name]) found.push(`${name} has changed.`);
  }
  for (const name of there) if (!(name in files)) found.push(`${name} is new.`);
  return found;
}

/** One number of the runner's summary, the one after `# name`; NaN when the summary has no such line. */
const summed = (tap, name) => Number((tap.match(new RegExp(`^# ${name} (\\d+)$`, 'm')) || [])[1]);

/** Runs a command to its end and resolves what it printed and how it ended. `signal`, in the options, stops it. */
function run(command, args, options) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { ...options, stdio: ['ignore', 'pipe', 'pipe'] });
    const ran = { stdout: '', stderr: '', code: null, signal: null, error: null };
    child.stdout.on('data', (chunk) => { ran.stdout += chunk; });
    child.stderr.on('data', (chunk) => { ran.stderr += chunk; });
    child.on('error', (error) => { ran.error = error; });
    child.on('close', (code, signal) => resolve({ ...ran, code, signal }));
  });
}

/**
 * Runs the six test files with node's runner, in a process of its own, and returns what is wrong with the run, one
 * sentence each. A test file is itself a child of the runner that started it, and says so in NODE_TEST_CONTEXT; a
 * runner started with that variable set takes itself for such a child, runs no file and exits 0. So the variable is
 * taken out, and the run counts only when the summary reports every test. `signal` stops the run when this test is
 * given up, at its timeout.
 */
async function nodeTests(signal) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const files = NODE_TESTS.map((name) => path.join('canvas', 'test', `${name}.test.mjs`));
  const ran = await run(process.execPath, ['--test', '--test-reporter=tap', '--test-timeout=120000', ...files], { cwd: ROOT, env, signal });
  const found = [];
  if (ran.error) found.push(`The runner did not run to its end: ${ran.error.message}.`);
  if (ran.code !== 0) found.push(`The runner ended with ${ran.code === null ? `signal ${ran.signal}` : `code ${ran.code}`}.`);
  const counts = Object.fromEntries(['tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo'].map((name) => [name, summed(ran.stdout, name)]));
  const wanted = { tests: NODE_TEST_COUNT, pass: NODE_TEST_COUNT, fail: 0, cancelled: 0, skipped: 0, todo: 0 };
  if (JSON.stringify(counts) !== JSON.stringify(wanted)) {
    const say = (c) => Object.entries(c).map(([name, n]) => `${name} ${Number.isNaN(n) ? 'not reported' : n}`).join(', ');
    found.push(`The runner's summary reads: ${say(counts)}. It should read: ${say(wanted)}.`);
  }
  const failed = ran.stdout.split('\n').filter((line) => /^\s*not ok /.test(line)).map((line) => line.trim());
  if (found.length) found.push(...failed, ...(ran.stderr.trim() ? [`stderr: ${ran.stderr.trim().slice(-2000)}`] : []));
  return found;
}

test("the library's Node tests pass, and the old page, the library and their tests are byte for byte as the slice found them", async (t) => {
  const changed = differences();
  const failed = await nodeTests(t.signal);
  const said = [];
  if (changed.length) said.push('The old page, the library and their tests are not as slice 1 found them:', ...changed);
  if (failed.length) said.push(`The library's Node tests (canvas/test/{${NODE_TESTS.join(',')}}.test.mjs) do not pass as they did:`, ...failed);
  if (said.length) assert.fail(said.join('\n'));
});
