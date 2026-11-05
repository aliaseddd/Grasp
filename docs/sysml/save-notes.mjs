// Saves the notes and the archive into stronghold-proof.html, between its notes markers, so the file in git carries
// them. The page shows them when it is opened as a file, and Claude loads them into a newly published page.
//
//   node docs/sysml/save-notes.mjs notes.json
//
// notes.json is { "notes": [...], "archive": [...] }: what the page's Download notes saves, or what Claude reads
// from the published page's database. A note has id, no, el, label, x, y, text, created and updated; an archived
// note also has resolution and archived.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const PAGE_FILE = path.join(here, 'stronghold-proof.html');
const START = '<!-- notes:start -->';
const END = '<!-- notes:end -->';
const NOTE = ['id', 'no', 'el', 'label', 'x', 'y', 'text', 'created', 'updated'];
const ARCHIVED = [...NOTE, 'resolution', 'archived'];

const file = process.argv[2];
if (!file) {
  console.error('Usage: node docs/sysml/save-notes.mjs notes.json');
  process.exit(1);
}

const input = JSON.parse(fs.readFileSync(file, 'utf8'));
const listOf = (v) => (Array.isArray(v) ? v : []);
// The same test the page uses: an id it can name a document by, an element, a place, and text.
const isNote = (n) =>
  !!n && typeof n === 'object' && typeof n.id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(n.id) &&
  typeof n.el === 'string' && typeof n.text === 'string' && Number.isFinite(+n.x) && Number.isFinite(+n.y);
const pick = (n, keys) => Object.fromEntries(keys.filter((k) => n[k] !== undefined).map((k) => [k, n[k]]));
const text = (v) => String(v ?? '');

const bad = [...listOf(input.notes), ...listOf(input.archive)].filter((n) => !isNote(n));
if (bad.length) {
  console.error(`${bad.length} of the entries in ${file} aren't notes, so nothing was written.`);
  process.exit(1);
}

const notes = listOf(input.notes)
  .map((n) => pick(n, NOTE))
  .sort((a, b) => (a.no || 0) - (b.no || 0) || text(a.created).localeCompare(text(b.created)));
const archive = listOf(input.archive)
  .map((n) => pick(n, ARCHIVED))
  .sort((a, b) => text(a.archived).localeCompare(text(b.archived)) || (a.no || 0) - (b.no || 0));

// `<` is written as < so no text in a note can end the script element early.
const json = JSON.stringify({ saved: new Date().toISOString(), notes, archive }, null, 2).replace(/</g, '\\u003c');

const html = fs.readFileSync(PAGE_FILE, 'utf8');
const a = html.indexOf(START);
const b = html.indexOf(END);
if (a < 0 || b < a) {
  console.error(`No ${START} … ${END} in ${PAGE_FILE}.`);
  process.exit(1);
}
const block = `\n<script type="application/json" id="saved-notes">\n${json}\n</script>\n`;
fs.writeFileSync(PAGE_FILE, html.slice(0, a + START.length) + block + html.slice(b));
console.log(`Saved ${notes.length} notes and ${archive.length} archived notes in ${path.basename(PAGE_FILE)}.`);
