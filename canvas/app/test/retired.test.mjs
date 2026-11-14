// The old page is retired: check 8 of plan/status.json, "`canvas/index.html` and the SVG renderer are gone", the last
// "Done when" of slice 2 (plan/slice-2.md, section 8, "Package 2-15. Retiring the old page", and section 9).
//
// The scaffold (package 2-1) wrote this test first and marked it todo: until package 2-15, the last of the slice, the
// old page stays in canvas/ byte for byte (unchanged.test.mjs holds that), so this test fails and node's runner
// reports the failure as todo. Package 2-15 owns the file, moves the old page in one step, and takes the mark off.
//
// What the test holds, from the brief's "Moves into archive/old-page/" and "Changes":
// 1. OUT OF canvas/. Every file of the old page that moves whole is gone from canvas/: the built page, its shell, the
//    SVG renderer (canvas/src/core/page/ and every feature's page.js), the stylesheets, save-state.mjs, the picture,
//    the 33 Playwright test files with fake-claude.mjs, build.test.mjs, and the script that wrote old-layout.json.
//    canvas/test/ keeps the five Node test files of the model library and no other test file.
// 2. IN archive/old-page/. Each of those files is there, at its path from canvas/, and the built page is the one
//    slice 1 found, by the SHA-256 unchanged.json pinned it with. A README.md there names the commit it was taken at.
// 3. NO SCRIPT, TEST OR PIN NAMES IT. The scripts that stay (package.json's, canvas/build.mjs, canvas/export.mjs,
//    canvas/check.sh, docs/sysml/check.sh, canvas/app/build.mjs), the tests that stay (canvas/test/ and
//    canvas/app/test/) and the pins (unchanged.json) name no file of the old page and nothing under archive/.
//
// What "names" means here: in code. A script or a test names the old page when its code, with its comments taken
// out, holds one of the old page's paths; so a comment that says which file of the old page a rule was ported from is
// no naming, and nothing here asks for those comments to change. The test does not hold what the brief changes
// besides: the sentence of plane/NotDrawnYet.tsx, the READMEs that "describe one page", `npm run test:old` passing
// (unchanged.test.mjs runs the library's Node tests), and the two parts of files that move (the tests of
// canvas/test/store-dump.test.mjs that run save-state.mjs, and the one test of model-lib.test.mjs that reads the
// model saved inside the old page): those two files stay, and are held here only to name the old page no longer.

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { ROOT } from './core.mjs';

const CANVAS = path.join(ROOT, 'canvas');
const ARCHIVE = path.join(ROOT, 'archive', 'old-page');

/** The ten feature folders of canvas/src/ that hold a page.js; with core/, the eleven that hold a style.css. */
const FEATURES = ['annotations', 'behavior', 'browser', 'details', 'geometry', 'grid', 'interconnection', 'labels', 'sequence', 'validation'];
/** The SVG renderer's sixteen scripts, canvas/src/core/page/. */
const CORE_PAGE = ['base', 'boot', 'camera', 'changes', 'drawing', 'export', 'io', 'layout', 'notes', 'panel', 'pointing', 'render', 'state', 'store', 'tools', 'views'];
/** The 33 Playwright test files of canvas/test/, by their names before `.test.mjs`. */
const PLAYWRIGHT = [
  'annotations-archive', 'annotations-code', 'annotations-notes-free', 'behavior-actions', 'behavior-states', 'browser', 'camera', 'checks', 'details',
  'drawing', 'edit', 'export', 'fake-store', 'fields', 'format', 'geometry', 'grid', 'interconnection', 'labels', 'loop', 'naming', 'scale-checks',
  'scale-drag', 'scale-save', 'scale-typing', 'sequence', 'shared', 'start', 'store-layout', 'undo', 'validation', 'views', 'visible',
];
/** The Node test files that stay in canvas/test/: the model library's. */
const STAY = ['lookups', 'metamodel', 'model-lib', 'store-dump', 'stored'];

/** Every file that moves whole, as its path from canvas/, which is its path from archive/old-page/ too. */
const MOVED = [
  'index.html',
  'save-state.mjs',
  'canvas.png',
  'src/core/page.html',
  ...CORE_PAGE.map((name) => `src/core/page/${name}.js`),
  ...FEATURES.map((folder) => `src/${folder}/page.js`),
  ...['core', ...FEATURES].map((folder) => `src/${folder}/style.css`),
  'src/core/style-end.css',
  ...PLAYWRIGHT.map((name) => `test/${name}.test.mjs`),
  'test/fake-claude.mjs',
  'test/build.test.mjs',
];
/** The built page as slice 1 found it: the SHA-256 that unchanged.json pinned canvas/index.html with. */
const OLD_PAGE_SHA256 = '016ba5bc8865b4976ed5a1883a4ea0f2044a0b396213a2ac5b3d1ec3b5520f6f';

const at = (root, rel) => path.join(root, ...rel.split('/'));
const there = (root, rel) => fs.existsSync(at(root, rel));
const read = (file) => fs.readFileSync(file, 'utf8');

/**
 * A script's or a test's code with its comments taken out, near enough for looking a path up in it: block comments,
 * lines that are a comment, and what follows ` //` on a line whose quotes are closed before it. `hash` is true for a
 * shell script, whose comments begin with #.
 */
function code(text, hash = false) {
  if (hash) return text.split('\n').filter((line) => !/^\s*#/.test(line)).join('\n');
  const closed = (before) => ['\'', '"', '`'].every((quote) => (before.split(quote).length - 1) % 2 === 0);
  return text.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map((line) => {
    if (/^\s*\/\//.test(line)) return '';
    for (let i = line.indexOf('//'); i >= 0; i = line.indexOf('//', i + 2)) if ((i === 0 || /\s/.test(line[i - 1])) && closed(line.slice(0, i))) return line.slice(0, i);
    return line;
  }).join('\n');
}

/** What of the old page a text can name: each with the words a finding uses. */
const NAMES = {
  page: [/canvas\/index\.html|'canvas',\s*'index\.html'/, 'canvas/index.html'],
  anyPage: [/index\.html/, 'index.html'],
  shell: [/\bpage\.html\b/, 'page.html'],
  renderer: [/\bpage\.js\b|core\/page\/|'core',\s*'page'/, 'the SVG renderer (page.js, core/page/)'],
  styles: [/\bstyle(-end)?\.css\b/, 'the old page\'s stylesheets'],
  saveState: [/save-state/, 'save-state.mjs'],
  oldLayout: [/old-layout\.mjs/, 'old-layout.mjs'],
  fakeClaude: [/fake-claude/, 'fake-claude.mjs'],
  archive: [/old-page/, 'archive/old-page/'],
};
/** The names of `which` that a text holds, in words. */
const namedIn = (text, which) => which.filter((name) => NAMES[name][0].test(text)).map((name) => NAMES[name][1]);

test('the old page is out of canvas/ and in archive/old-page/, and no script, test or pin names it', { todo: 'Package 2-15 retires the old page, last of the slice, and takes this mark off.' }, () => {
  // 1. Out of canvas/.
  const still = MOVED.filter((rel) => there(CANVAS, rel)).map((rel) => `canvas/${rel}`);
  if (there(CANVAS, 'src/core/page')) still.push('canvas/src/core/page/ (the folder)');
  if (there(ROOT, 'canvas/app/test/old-layout.mjs')) still.push('canvas/app/test/old-layout.mjs');
  const out = [];
  const testFiles = fs.existsSync(at(CANVAS, 'test')) ? fs.readdirSync(at(CANVAS, 'test')).filter((name) => name.endsWith('.test.mjs')).map((name) => name.slice(0, -'.test.mjs'.length)).sort() : [];
  const strangers = testFiles.filter((name) => !STAY.includes(name) && !PLAYWRIGHT.includes(name) && name !== 'build');
  if (strangers.length) out.push(`canvas/test/ holds test files that are neither the library's five nor the old page's: ${strangers.join(', ')}.`);
  for (const name of STAY) if (!testFiles.includes(name)) out.push(`canvas/test/${name}.test.mjs, a Node test of the model library, is gone: it stays.`);
  if (!there(CANVAS, 'test/index.js')) out.push('canvas/test/index.js is gone: it stays, for `node --test canvas/test/`.');
  if (!there(ROOT, 'canvas/app/test/old-layout.json')) out.push('canvas/app/test/old-layout.json is gone: it stays, as the record the adapter\'s tests compare with.');
  // helpers.mjs moves once the Node tests that stay read nothing of it; while one imports it, it stays.
  const helpers = there(CANVAS, 'test/helpers.mjs');
  const readers = STAY.filter((name) => there(CANVAS, `test/${name}.test.mjs`) && /helpers\.mjs/.test(code(read(at(CANVAS, `test/${name}.test.mjs`)))));
  if (helpers && !readers.length) still.push('canvas/test/helpers.mjs (no test that stays reads it)');
  if (!helpers && readers.length) out.push(`canvas/test/helpers.mjs is gone, and ${readers.map((name) => `${name}.test.mjs`).join(', ')} still import it.`);

  // 2. In archive/old-page/.
  const absent = MOVED.filter((rel) => !there(ARCHIVE, rel)).map((rel) => `archive/old-page/${rel}`);
  if (!helpers && !there(ARCHIVE, 'test/helpers.mjs')) absent.push('archive/old-page/test/helpers.mjs');
  const kept = [];
  if (there(ARCHIVE, 'index.html')) {
    const sha = createHash('sha256').update(fs.readFileSync(at(ARCHIVE, 'index.html'))).digest('hex');
    if (sha !== OLD_PAGE_SHA256) kept.push('archive/old-page/index.html is not the page slice 1 found: its SHA-256 is not the one unchanged.json pinned canvas/index.html with.');
  }
  if (!there(ARCHIVE, 'README.md')) kept.push('archive/old-page/README.md is not there: it says what the folder is, the commit it was taken at, and that nothing builds, tests or pins it.');
  else if (!/\b[0-9a-f]{7,40}\b/.test(read(at(ARCHIVE, 'README.md')))) kept.push('archive/old-page/README.md names no commit the old page was taken at.');

  // 3. No script, test or pin names it.
  const naming = [];
  const names = (rel, which, hash = false) => {
    if (!there(ROOT, rel)) return;
    const found = namedIn(code(read(at(ROOT, rel)), hash), which);
    if (found.length) naming.push(`${rel} names ${found.join(', ')}.`);
  };
  // The scripts. In canvas/ itself any index.html is the old page's; canvas/app/build.mjs builds canvas/dist/index.html.
  const everything = ['shell', 'renderer', 'styles', 'saveState', 'fakeClaude', 'archive'];
  const scripts = Object.values(JSON.parse(read(at(ROOT, 'package.json'))).scripts ?? {}).join('\n');
  const inScripts = namedIn(scripts, ['anyPage', ...everything]);
  if (inScripts.length) naming.push(`package.json's scripts name ${inScripts.join(', ')}.`);
  for (const rel of ['canvas/build.mjs', 'canvas/export.mjs']) names(rel, ['anyPage', ...everything]);
  for (const rel of ['canvas/check.sh', 'docs/sysml/check.sh']) names(rel, ['anyPage', ...everything], true);
  names('canvas/app/build.mjs', ['page', 'shell', 'renderer', 'saveState', 'fakeClaude', 'archive']);
  // The tests that stay: every script of canvas/test/, where any index.html is the old page's, and of canvas/app/test/
  // and its shots/, where index.html is the new page's unless it is canvas/index.html.
  const scriptsOf = (rel) => (there(ROOT, rel) ? fs.readdirSync(at(ROOT, rel)).filter((name) => /\.(mjs|js)$/.test(name)).sort().map((name) => `${rel}/${name}`) : []);
  // A file that should have moved and has not is said once, above, and not again for what it names; and this file
  // names it all.
  const leaving = new Set([...MOVED.map((rel) => `canvas/${rel}`), 'canvas/app/test/old-layout.mjs', 'canvas/app/test/retired.test.mjs']);
  for (const rel of scriptsOf('canvas/test')) if (!leaving.has(rel)) names(rel, ['anyPage', 'shell', 'renderer', 'styles', 'saveState', 'fakeClaude', 'archive']);
  for (const rel of [...scriptsOf('canvas/app/test'), ...scriptsOf('canvas/app/test/shots')]) {
    if (!leaving.has(rel)) names(rel, ['page', 'shell', 'renderer', 'saveState', 'oldLayout', 'fakeClaude', 'archive']);
  }
  // The pins: unchanged.json holds no file that moved, and nothing of the archive.
  const pins = Object.keys(JSON.parse(read(at(ROOT, 'canvas/app/test/unchanged.json'))).files ?? {});
  const pinned = pins.filter((name) => MOVED.some((rel) => name === `canvas/${rel}`) || name.startsWith('canvas/src/core/page/') || name === 'canvas/test/helpers.mjs' && !helpers || name.startsWith('archive/'));
  if (pinned.length) naming.push(`unchanged.json pins ${pinned.length} file${pinned.length === 1 ? '' : 's'} of the old page: ${pinned.slice(0, 5).join(', ')}${pinned.length > 5 ? ', …' : ''}.`);

  if (!still.length && !out.length && !absent.length && !kept.length && !naming.length) return;
  const list = (title, lines) => (lines.length ? [`  ${title}`, ...lines.map((line) => `    ${line}`)] : []);
  const count = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
  assert.fail([
    `The old page is not retired: ${[
      still.length && `${count(still.length, 'file')} of it ${still.length === 1 ? 'is' : 'are'} still in canvas/`,
      absent.length && `${count(absent.length, 'file')} of it ${absent.length === 1 ? 'is' : 'are'} not in archive/old-page/`,
      naming.length && `${count(naming.length, 'script, test or pin', 'scripts, tests and pins')} name${naming.length === 1 ? 's' : ''} it`,
      out.length + kept.length && `${count(out.length + kept.length, 'thing')} beside ${out.length + kept.length === 1 ? 'is' : 'are'} not as package 2-15 leaves ${out.length + kept.length === 1 ? 'it' : 'them'}`,
    ].filter(Boolean).join(', ')}.`,
    ...list('Still in canvas/:', still),
    ...list('In canvas/, otherwise than package 2-15 leaves it:', out),
    ...list('Not in archive/old-page/:', absent),
    ...list('In archive/old-page/, otherwise than it was taken:', kept),
    ...list('Naming the old page:', naming),
  ].join('\n'));
});
