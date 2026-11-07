// Saves a state as the canvas's saved state, with a new revision: the model, the notes and the archive into
// state.json, and index.html built again from it (build.mjs), so the files in git carry them and the page starts
// from them.
//
//   node canvas/save-state.mjs canvas-state.json
//
// canvas-state.json is { "model": {...}, "notes": [...], "archive": [...] }: what the page's Download state saves, or
// what Claude read from the published page's store (the document model/working and the collections notes and
// archive). Everything the page can't draw is dropped, the same way the page drops it. The revision is the time of
// saving, so a working copy in the store made against an older revision is left alone by the page.

import fs from 'node:fs';
import path from 'node:path';
import { PAGE, STATE, build } from './build.mjs';
import { loadLib } from './export.mjs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node canvas/save-state.mjs canvas-state.json');
  process.exit(1);
}

const lib = loadLib();
const input = JSON.parse(fs.readFileSync(file, 'utf8'));
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
