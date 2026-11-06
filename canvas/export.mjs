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

// The page's library blocks, every <script … data-lib> in order (the model library first, then any block a view kind
// adds), run in one context of their own. Returns window.SysMLModel.
export function loadLib(html = fs.readFileSync(PAGE, 'utf8')) {
  const blocks = [...html.matchAll(/<script\b[^>]*\bdata-lib\b[^>]*>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
  if (!blocks.length) throw new Error(`No <script data-lib> in ${PAGE}.`);
  const context = vm.createContext({});
  blocks.forEach((code, i) => vm.runInContext(code, context, { filename: `lib-${i}.js` }));
  if (!context.SysMLModel) throw new Error('The library blocks did not define SysMLModel.');
  return context.SysMLModel;
}

export function readBlock(html, id) {
  const match = html.match(new RegExp(`<script type="application/json" id="${id}">([\\s\\S]*?)</script>`));
  if (!match) throw new Error(`No <script id="${id}"> in ${PAGE}.`);
  return JSON.parse(match[1]);
}

const listOf = (value) => (Array.isArray(value) ? value : []);

// The model, the notes, and the archived notes saved in the page.
export function readPage(html = fs.readFileSync(PAGE, 'utf8')) {
  const model = readBlock(html, 'model');
  const saved = readBlock(html, 'saved-notes');
  return { model, notes: listOf(saved.notes), archive: listOf(saved.archive) };
}

export function readState(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!data || typeof data !== 'object' || !data.model) throw new Error(`${file} has no model.`);
  return { model: data.model, notes: listOf(data.notes), archive: listOf(data.archive) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  const html = fs.readFileSync(PAGE, 'utf8');
  const lib = loadLib(html);
  const state = file ? readState(file) : readPage(html);
  const model = lib.normalize(state.model);
  const problems = lib.validate(model);
  process.stdout.write(lib.toSysML(model, state.notes, state.archive));
  for (const p of problems) process.stderr.write(`problem: ${p.message}\n`);
  if (problems.length) process.exitCode = 1;
}
