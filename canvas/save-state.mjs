// Saves a state as the canvas's saved state, with a new revision: the model, the notes and the archive into
// state.json, and index.html built again from it (build.mjs), so the files in git carry them and the page starts
// from them.
//
//   node canvas/save-state.mjs canvas-state.json   # a state file
//   node canvas/save-state.mjs store.json          # a dump of the published page's store
//
// canvas-state.json is { "model": {...}, "notes": [...], "archive": [...] }: what the page's Download state saves. A
// dump of the store is its documents' bodies by path, as Claude reads them from the published page: the model's head
// model/current and the parts it names (model/current/parts/<id>), or a whole model in model/working, and the
// collections notes and archive, one document per note (export.mjs says more). From a dump the model is put together
// as the page does (SysMLModel.readStore), and it must be based on state.json's revision: one based on another the
// page doesn't show, so it isn't saved. A model saved in an older version of the format is upgraded and saved in the
// current one, and everything the page can't draw is dropped, the same way the page drops it. The revision is the
// time of saving, so a model in the store based on an older revision is left alone by the page.

import fs from 'node:fs';
import path from 'node:path';
import { PAGE, STATE, build } from './build.mjs';
import { isStoreDump, loadLib, savedRevision } from './export.mjs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node canvas/save-state.mjs canvas-state.json (or a dump of the store)');
  process.exit(1);
}

const lib = loadLib();
let input = JSON.parse(fs.readFileSync(file, 'utf8'));
if (isStoreDump(input)) {
  const revision = savedRevision();
  let store;
  try {
    store = lib.readStore(input, revision);
  } catch (error) {
    console.error(`${file}: ${error.message} Nothing was written.`);
    process.exit(1);
  }
  if (!store.model) {
    console.error(`${file} is a dump of the store that holds no model, so nothing was written.`);
    process.exit(1);
  }
  if (store.baseRevision !== revision) {
    console.error(`${file}: the store's model, from ${store.from}, is based on revision ${store.baseRevision}, not state.json's ${revision}, ` +
      'so the page published from state.json doesn\'t show it. Nothing was written.');
    process.exit(1);
  }
  input = { model: store.model, notes: store.notes, archive: store.archive };
}
if (!input || typeof input !== 'object' || !input.model) {
  console.error(`${file} has no model, so nothing was written.`);
  process.exit(1);
}

const model = lib.normalize(input.model);
model.revision = process.env.CANVAS_REVISION || new Date().toISOString();
// A note has an id, a text, and a target (an element's or a relationship's id), or no target (null) and a place on the
// plane, x and y, when it floats free.
const isNote = (n) => !!n && typeof n === 'object' && typeof n.id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(n.id) && typeof n.text === 'string' &&
  (typeof n.target === 'string' || (n.target === null && Number.isFinite(n.x) && Number.isFinite(n.y)));
const known = new Set(model.elements.map((e) => e.id).concat(model.relationships.map((r) => r.id)));
const NOTE = ['id', 'no', 'target', 'targetLabel', 'x', 'y', 'text', 'by', 'created', 'updated', 'response', 'resolved'];
const ARCHIVED = NOTE.concat(['archived', 'resolution']);
const tidy = (list, fields) => (Array.isArray(list) ? list : [])
  .filter(isNote)
  .map((n) => Object.fromEntries(fields.filter((k) => n[k] !== undefined).map((k) => [k, n[k]])))
  .sort((a, b) => (a.no || 0) - (b.no || 0));
const notes = tidy(input.notes, NOTE);
const archive = tidy(input.archive, ARCHIVED);
const orphans = notes.filter((n) => n.target !== null && !known.has(n.target)).length;

// The page is built first, so a source the build refuses leaves both files as they were.
const state = { model, notes, archive };
const page = build(state);
fs.writeFileSync(STATE, JSON.stringify(state, null, 2) + '\n');
fs.writeFileSync(PAGE, page);

const problems = lib.validate(model);
const rel = (f) => path.relative(process.cwd(), f) || f;
console.log(`Saved ${model.elements.length} elements, ${model.relationships.length} relationships, ${model.views.length} views, ` +
  `${notes.length} notes${orphans ? ` (${orphans} on things no longer in the model)` : ''}, and ${archive.length} archived notes ` +
  `into ${rel(STATE)}, revision ${model.revision}, and built ${rel(PAGE)} from it.`);
for (const p of problems) console.log(`problem: ${p.message}`);
