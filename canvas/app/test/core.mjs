// Shared by the core's tests, which run in Node and need no browser: the core (canvas/app/src/core/), bundled by
// esbuild in memory and run here, beside the model library as canvas/export.mjs loads it; the state files the tests
// open; and what they read and compare them with.
//
// The model library runs in a vm context of its own (loadLib), so the models it makes belong to another realm than
// the tests': compare them as JSON (JSON.stringify, or plain), never with deepEqual directly. What the core itself
// makes (what a change touched, what the listeners are told, a state file's object) belongs to this realm.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import * as esbuild from 'esbuild';
import { loadLib } from '../../export.mjs';

/** The repository's root. */
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
/** The core's entry, which the bundle starts from. */
export const CORE = path.join(ROOT, 'canvas', 'app', 'src', 'core', 'index.ts');
/** The example, a state file in version 2 of the format. */
export const EXAMPLE = path.join(ROOT, 'canvas', 'examples', 'stronghold-proof.json');
/** The old page's fixtures: a state file per view kind and one saved in version 1, each with its export pinned. */
export const FIXTURES = path.join(ROOT, 'canvas', 'test', 'fixtures');
/** The script that prints a state file's text. */
export const EXPORT = path.join(ROOT, 'canvas', 'export.mjs');

/** The model library, as canvas/export.mjs runs it: what the page has as window.SysMLModel. */
export const lib = loadLib();

let core = null;
/**
 * The core's exports: canvas/app/src/core/index.ts and what it imports, bundled in memory and run in this realm, once
 * for a test file. The core reads no global for the model library: give `lib` to whatever opens a file.
 */
export function loadCore() {
  core ??= bundle();
  return core;
}
async function bundle() {
  const result = await esbuild.build({
    absWorkingDir: ROOT,
    entryPoints: [CORE],
    bundle: true,
    format: 'cjs',
    platform: 'neutral',
    target: 'es2022',
    write: false,
    logLevel: 'silent',
  });
  const module = { exports: {} };
  const run = vm.runInThisContext(`(function (module, exports) {${result.outputFiles[0].text}\n})`, { filename: 'canvas/app/src/core/index.ts (bundled)' });
  run(module, module.exports);
  return module.exports;
}

/**
 * The state files the core's tests open: the example, then every fixture, each `{ name, file, pinned }`, where pinned
 * is the file that holds the text the state file exports. A fixture's is the .sysml file beside it. The example's is
 * format1.sysml: the example exports that text byte for byte (plan/slice-1.md, "The baseline run").
 */
export function stateFiles() {
  const fixtures = fs.readdirSync(FIXTURES).filter((name) => name.endsWith('.json')).sort().map((name) => (
    { name, file: path.join(FIXTURES, name), pinned: path.join(FIXTURES, name.replace(/\.json$/, '.sysml')) }
  ));
  return [{ name: path.basename(EXAMPLE), file: EXAMPLE, pinned: path.join(FIXTURES, 'format1.sysml') }, ...fixtures];
}

/** A file's text. */
export const readText = (file) => fs.readFileSync(file, 'utf8');
/** A file's JSON. */
export const readJSON = (file) => JSON.parse(readText(file));
/** A value as plain JSON data of this realm, which deepEqual compares whatever realm the value came from. */
export const plain = (value) => JSON.parse(JSON.stringify(value));

/** A clock for the core's `now`: each call gives the next second from `start`, so a test's times never vary. */
export function clock(start = '2026-11-12T12:00:00.000Z') {
  let next = Date.parse(start);
  return () => {
    const stamp = new Date(next).toISOString();
    next += 1000;
    return stamp;
  };
}
