// Saves a state into index.html: the model between the model markers and the notes between the notes markers, with
// a new revision, so the file in git carries them and the page starts from them.
//
//   node canvas/save-state.mjs canvas-state.json
//
// canvas-state.json is { "model": {...}, "notes": [...] }: what the page's Download state saves, or what Claude
// read from the published page's store (the document model/working and the collection notes). Everything the
// page can't draw is dropped, the same way the page drops it. The revision is the time of saving, so a working
// copy in the store made against an older revision is left alone by the page.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGE, loadLib } from './export.mjs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node canvas/save-state.mjs canvas-state.json');
  process.exit(1);
}

const html = fs.readFileSync(PAGE, 'utf8');
const lib = loadLib(html);
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

// `<` is written as < so no text can end the script element early.
const json = (value) => JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
const replaceBetween = (text, start, end, block) => {
  const a = text.indexOf(start);
  const b = text.indexOf(end);
  if (a < 0 || b < a) throw new Error(`No ${start} … ${end} in ${PAGE}.`);
  return text.slice(0, a + start.length) + block + text.slice(b);
};

let out = replaceBetween(html, '<!-- model:start -->', '<!-- model:end -->',
  `\n<script type="application/json" id="model">\n${json(model)}\n</script>\n`);
out = replaceBetween(out, '<!-- notes:start -->', '<!-- notes:end -->',
  `\n<script type="application/json" id="saved-notes">\n${json({ saved: model.revision, notes, archive })}\n</script>\n`);
fs.writeFileSync(PAGE, out);

const problems = lib.validate(model);
console.log(`Saved ${model.elements.length} elements, ${model.relationships.length} relationships, ${model.views.length} views, ` +
  `${notes.length} notes${orphans ? ` (${orphans} on things no longer in the model)` : ''}, and ${archive.length} archived notes ` +
  `into ${path.relative(process.cwd(), PAGE)}, revision ${model.revision}.`);
for (const p of problems) console.log(`problem: ${p.message}`);
