// Prints the model as textual SysML v2, the same text the page's Export button shows, with the same code: the model
// library's scripts from src/, stitched as build.mjs stitches them into index.html, run here in Node.
//
//   node canvas/export.mjs                     # the model and the notes saved in state.json
//   node canvas/export.mjs canvas-state.json   # a state file, { model, notes, archive }: what Download state saves
//   node canvas/export.mjs store.json          # a dump of the published page's store: its documents' bodies by path,
//                                              # as Claude reads them ({ "model/current": {...},
//                                              # "model/current/parts/<id>": {...}, "notes/<id>": {...}, ... })
//
// From a dump, the model is put together as the page puts it together (SysMLModel.readStore): a whole model in
// model/working, else the head model/current and the parts it names; one based on state.json's revision first. When
// the model isn't based on that revision, the page published from state.json doesn't show it, and stderr says so. A
// model saved in an older version of the format is upgraded first, as the page upgrades it.
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

/** Whether parsed JSON is a dump of the store: an object of documents by path, each path holding a slash. */
export function isStoreDump(data) {
  return !!data && typeof data === 'object' && !Array.isArray(data) && data.model === undefined && Object.keys(data).some((key) => key.includes('/'));
}

/** The revision of the model saved in state.json, which the published page was built from. */
export function savedRevision(file = STATE) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  return data && data.model && typeof data.model.revision === 'string' ? data.model.revision : null;
}

// A state file, the saved state (state.json), or a dump of the store: its model, notes, and archived notes. From a
// dump also: from, the document the model came from, and baseRevision, the revision of the file it was based on.
export function readState(file = STATE, lib = loadLib()) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (isStoreDump(data)) {
    const store = lib.readStore(data, savedRevision());
    if (!store.model) throw new Error(`${file} is a dump of the store that holds no model.`);
    return { model: store.model, notes: store.notes, archive: store.archive, from: store.from, baseRevision: store.baseRevision };
  }
  if (!data || typeof data !== 'object' || !data.model) throw new Error(`${file} has no model.`);
  return { model: data.model, notes: listOf(data.notes), archive: listOf(data.archive) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const lib = loadLib();
  const state = readState(process.argv[2] || STATE, lib);
  const revision = savedRevision();
  if (state.from && state.baseRevision !== revision) {
    process.stderr.write(`note: the store's model, from ${state.from}, is based on revision ${state.baseRevision}, not state.json's ${revision}, so the page published from state.json doesn't show it.\n`);
  }
  const model = lib.normalize(state.model);
  const problems = lib.validate(model);
  process.stdout.write(lib.toSysML(model, state.notes, state.archive));
  for (const p of problems) process.stderr.write(`problem: ${p.message}\n`);
  if (problems.length) process.exitCode = 1;
}
