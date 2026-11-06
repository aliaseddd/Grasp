// Prints the model as textual SysML v2, the same text the page's Export button shows, with the same code: the
// model-lib script inside index.html, run here in Node.
//
//   node canvas/export.mjs                     # the model and the notes saved in index.html
//   node canvas/export.mjs canvas-state.json   # a state file: what Download state saves, or what Claude read
//                                              # from the published page's store, shaped { model, notes }
//
// Problems that keep the text from being correct SysML go to stderr, and the exit code is 1 when there are any.
// Check the text with the pilot implementation's validator: canvas/check.sh does both.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const PAGE = path.join(here, 'index.html');

// The <script id="model-lib"> block of the page, run in its own context. Returns window.SysMLModel.
export function loadLib(html = fs.readFileSync(PAGE, 'utf8')) {
  const match = html.match(/<script id="model-lib">([\s\S]*?)<\/script>/);
  if (!match) throw new Error(`No <script id="model-lib"> in ${PAGE}.`);
  const context = vm.createContext({});
  vm.runInContext(match[1], context, { filename: 'model-lib.js' });
  if (!context.SysMLModel) throw new Error('model-lib did not define SysMLModel.');
  return context.SysMLModel;
}

export function readBlock(html, id) {
  const match = html.match(new RegExp(`<script type="application/json" id="${id}">([\\s\\S]*?)</script>`));
  if (!match) throw new Error(`No <script id="${id}"> in ${PAGE}.`);
  return JSON.parse(match[1]);
}

// The model and the notes saved in the page.
export function readPage(html = fs.readFileSync(PAGE, 'utf8')) {
  const model = readBlock(html, 'model');
  const saved = readBlock(html, 'saved-notes');
  return { model, notes: Array.isArray(saved.notes) ? saved.notes : [] };
}

export function readState(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!data || typeof data !== 'object' || !data.model) throw new Error(`${file} has no model.`);
  return { model: data.model, notes: Array.isArray(data.notes) ? data.notes : [] };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  const html = fs.readFileSync(PAGE, 'utf8');
  const lib = loadLib(html);
  const state = file ? readState(file) : readPage(html);
  const model = lib.normalize(state.model);
  const problems = lib.validate(model);
  process.stdout.write(lib.toSysML(model, state.notes));
  for (const p of problems) process.stderr.write(`problem: ${p.message}\n`);
  if (problems.length) process.exitCode = 1;
}
