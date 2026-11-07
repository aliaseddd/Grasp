// Prints the model as textual SysML v2, the same text the page's Export button shows, with the same code: the model
// library's scripts from src/, stitched as build.mjs stitches them into index.html, run here in Node.
//
//   node canvas/export.mjs                     # the model and the notes saved in state.json
//   node canvas/export.mjs canvas-state.json   # a state file: what Download state saves, or what Claude read
//                                              # from the published page's store, shaped { model, notes, archive }
//
// Problems that keep the text from being correct SysML go to stderr, and the exit code is 1 when there are any.
// Check the text with the pilot implementation's validator: canvas/check.sh does both.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { STATE, libraryCode } from './build.mjs';

// The model library, run in a context of its own: the sources' (what build.mjs puts in the page's <script data-lib>),
// or the code given. Returns its SysMLModel.
export function loadLib(code = libraryCode()) {
  const context = vm.createContext({});
  vm.runInContext(code, context, { filename: 'model-lib.js' });
  if (!context.SysMLModel) throw new Error('The model library did not define SysMLModel.');
  return context.SysMLModel;
}

const listOf = (value) => (Array.isArray(value) ? value : []);

// A state file, or the saved state (state.json): its model, notes, and archived notes.
export function readState(file = STATE) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!data || typeof data !== 'object' || !data.model) throw new Error(`${file} has no model.`);
  return { model: data.model, notes: listOf(data.notes), archive: listOf(data.archive) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const lib = loadLib();
  const state = readState(process.argv[2] || STATE);
  const model = lib.normalize(state.model);
  const problems = lib.validate(model);
  process.stdout.write(lib.toSysML(model, state.notes, state.archive));
  for (const p of problems) process.stderr.write(`problem: ${p.message}\n`);
  if (problems.length) process.exitCode = 1;
}
