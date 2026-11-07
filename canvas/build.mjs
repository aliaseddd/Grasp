// Builds index.html, the canvas's one self-contained page, from its sources: the page's shell (src/core/page.html),
// the styles, the model library and the page's scripts from src/ in the fixed order below, and the saved model,
// notes and archive from state.json.
//
//   node canvas/build.mjs           # writes index.html
//   node canvas/build.mjs --check   # writes nothing; fails when index.html isn't what the sources build
//
// There is no bundler. Every script in src/ is a plain script, run in the order of the lists below, that takes what
// the scripts before it registered on one shared object and registers what it defines there for the scripts after
// it: SysMLModelLib for the model library's scripts, whose last script turns it into window.SysMLModel, and
// window.SysMLCanvas for the page's. src/README.md says how a script is laid out. The build checks that layout as it
// stitches: a name a script takes must be registered by a script before it, no name is registered twice, a name a
// script reaches as C.name must be registered by some script, and every file in src/ is in a list.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const SRC = path.join(here, 'src');
export const PAGE = path.join(here, 'index.html');
export const STATE = path.join(here, 'state.json');

// The shell, with one line per slot the build fills: <!-- build: style -->, state, library, page.
export const SHELL = 'core/page.html';

// The styles, in cascade order: the core's, each feature's, then the core's rules that must come after everything
// (the phone layout, reduced motion).
export const STYLES = [
  'core/style.css',
  'interconnection/style.css',
  'behavior/style.css',
  'sequence/style.css',
  'geometry/style.css',
  'grid/style.css',
  'browser/style.css',
  'annotations/style.css',
  'labels/style.css',
  'core/style-end.css',
];

// The model library, <script id="model-lib" data-lib>: pure logic, which export.mjs and save-state.mjs run in Node.
// The metamodel's classifiers, which canvas/metamodel/generate.mjs writes from SysML.ecore; the core's tables and
// helpers, whose kinds stand on them; each feature's rows and functions; then the checks, the export, how the page's
// store keeps the model, and SysMLModel.
export const LIBRARY = [
  'core/lib/metamodel.js',
  'core/lib/model.js',
  'interconnection/lib.js',
  'behavior/lib.js',
  'sequence/lib.js',
  'geometry/lib.js',
  'grid/lib.js',
  'browser/lib.js',
  'annotations/lib.js',
  'labels/lib.js',
  'core/lib/validate.js',
  'core/lib/sysml.js',
  'core/lib/stored.js',
  'core/lib/api.js',
];

// The page's script, after the library: the core's scripts, then each feature's, then boot.js, which starts the page.
export const SCRIPTS = [
  'core/page/base.js',
  'core/page/state.js',
  'core/page/layout.js',
  'core/page/drawing.js',
  'core/page/render.js',
  'core/page/camera.js',
  'core/page/changes.js',
  'core/page/tools.js',
  'core/page/views.js',
  'core/page/panel.js',
  'core/page/notes.js',
  'core/page/store.js',
  'core/page/io.js',
  'core/page/export.js',
  'core/page/pointing.js',
  'interconnection/page.js',
  'behavior/page.js',
  'sequence/page.js',
  'geometry/page.js',
  'grid/page.js',
  'browser/page.js',
  'annotations/page.js',
  'labels/page.js',
  'core/page/boot.js',
];

// The shared object each list's scripts register on, as the scripts name it.
const SHARED = { library: 'lib', page: 'C' };

const read = (file) => fs.readFileSync(path.join(SRC, file), 'utf8');

// A JSON value inside a script element: `<` is written as \u003c, so no text can end the element early.
const json = (value) => JSON.stringify(value, null, 2).replace(/</g, '\\u003c');

/** The saved state: { model, notes, archive }, as save-state.mjs writes it. */
export function readStateFile(file = STATE) {
  const state = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!state || typeof state !== 'object' || !state.model || typeof state.model !== 'object') throw new Error(`${file} has no model.`);
  for (const key of ['notes', 'archive']) {
    if (state[key] !== undefined && !Array.isArray(state[key])) throw new Error(`${file}: ${key} is not a list.`);
  }
  return { model: state.model, notes: state.notes || [], archive: state.archive || [] };
}

// Each file of a list, after a line naming it, so a line of index.html can be traced back to its source.
function stitch(files, marker) {
  return files.map((file) => {
    const text = read(file);
    if (!text.endsWith('\n')) throw new Error(`src/${file} must end with a line break.`);
    return marker(`src/${file}`) + '\n' + text;
  }).join('');
}

// A script's text with its comments, and the insides of its strings, templates and regular expressions, turned into
// spaces, so what is read from it below is code (a template's ${…} stays code). A slash starts a regular expression
// unless it follows something a division would: a name that isn't a keyword, a number, a closing bracket or a string.
const BEFORE_REGEX = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'instanceof', 'yield', 'await']);
function codeOnly(text) {
  const out = text.split('');
  const blank = (from, to) => { for (let k = from; k < to; k++) if (out[k] !== '\n') out[k] = ' '; };
  const braces = [];        // for each open { or ${: whether it is a template's ${
  let i = 0;
  let last = '';            // the last character of code that isn't a space, or 'w' after a name or number
  let word = '';            // that name
  const quoted = (q, start) => {
    let j = start + 1;
    while (j < text.length && text[j] !== q && text[j] !== '\n') j += text[j] === '\\' ? 2 : 1;
    return j;
  };
  const template = (start) => {   // from just after ` or }, to the closing ` or the next ${
    let j = start;
    while (j < text.length && text[j] !== '`' && !(text[j] === '$' && text[j + 1] === '{')) j += text[j] === '\\' ? 2 : 1;
    blank(start, j);
    if (text[j] === '`') return j + 1;
    braces.push(true);
    return j + 2;
  };
  while (i < text.length) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '/' && next === '/') { const j = text.indexOf('\n', i); const end = j < 0 ? text.length : j; blank(i, end); i = end; continue; }
    if (c === '/' && next === '*') { const j = text.indexOf('*/', i + 2); const end = j < 0 ? text.length : j + 2; blank(i, end); i = end; continue; }
    if (c === "'" || c === '"') { const j = quoted(c, i); blank(i + 1, j); i = j + 1; last = c; continue; }
    if (c === '`') { i = template(i + 1); last = '`'; continue; }
    if (/[\w$]/.test(c)) {
      let j = i;
      while (j < text.length && /[\w$]/.test(text[j])) j++;
      word = text.slice(i, j);
      last = BEFORE_REGEX.has(word) ? '(' : 'w';
      i = j;
      continue;
    }
    if (c === '/' && !/[w)\]}'"`]/.test(last)) {
      let j = i + 1;
      let inClass = false;
      while (j < text.length && text[j] !== '\n' && (inClass || text[j] !== '/')) {
        if (text[j] === '\\') j++;
        else if (text[j] === '[') inClass = true;
        else if (text[j] === ']') inClass = false;
        j++;
      }
      blank(i + 1, j);
      i = j + 1;
      last = '/';
      continue;
    }
    if (c === '{') braces.push(false);
    if (c === '}' && braces.length && braces.pop()) { i = template(i + 1); last = '`'; continue; }
    if (!/\s/.test(c)) last = c;
    i++;
  }
  return out.join('');
}

// What a script takes from the shared object (its `const { … } = obj;`), what it registers (`Object.assign(obj,
// { … })`), and the names it reaches late as obj.name, read from its code. The layout src/README.md gives is what
// makes this reading safe: one destructuring of the shared object at the top, registrations by shorthand only.
function namesIn(list) { return list.split(',').map((s) => s.trim()).filter(Boolean); }
function linkage(text, obj) {
  const takes = [];
  const gives = [];
  const late = new Set();
  const code = codeOnly(text);
  for (const m of code.matchAll(new RegExp(`const \\{([^}]*)\\} = ${obj};`, 'g'))) takes.push(...namesIn(m[1]));
  for (const m of code.matchAll(new RegExp(`Object\\.assign\\(${obj}, \\{([^}]*)\\}\\);`, 'g'))) {
    for (const name of namesIn(m[1])) {
      if (!/^[A-Za-z_$][\w$]*$/.test(name)) throw new Error(`registers "${name}" on ${obj}; register names only, as { name }.`);
      gives.push(name);
    }
  }
  for (const m of code.matchAll(new RegExp(`(?<![\\w$.])${obj}\\.([A-Za-z_$][\\w$]*)`, 'g'))) late.add(m[1]);
  return { takes, gives, late };
}
function checkLinkage(files, obj, predefined) {
  const given = new Map(predefined.map((name) => [name, '(the first script)']));
  const all = files.map((file) => {
    let link;
    try { link = linkage(read(file), obj); } catch (error) { throw new Error(`src/${file} ${error.message}`); }
    for (const name of link.takes) {
      if (!given.has(name)) throw new Error(`src/${file} takes ${name} from ${obj}, but no script before it registers ${name}. Move it to a script that runs earlier, or reach it as ${obj}.${name} where it is called.`);
    }
    for (const name of link.gives) {
      if (given.has(name)) throw new Error(`src/${file} registers ${name} on ${obj}, but ${given.get(name)} registers it already.`);
      given.set(name, `src/${file}`);
    }
    return { file, link };
  });
  for (const { file, link } of all) {
    for (const name of link.late) {
      if (!given.has(name)) throw new Error(`src/${file} reaches ${obj}.${name}, but no script registers ${name}.`);
    }
  }
}

// Every .js and .css file in src/ is in one of the lists, so none is left out of the page by mistake.
function checkListed() {
  const listed = new Set([...STYLES, ...LIBRARY, ...SCRIPTS]);
  const walk = (dir) => fs.readdirSync(path.join(SRC, dir), { withFileTypes: true }).flatMap((entry) => {
    const rel = dir ? `${dir}/${entry.name}` : entry.name;
    return entry.isDirectory() ? walk(rel) : [rel];
  });
  const missing = walk('').filter((file) => /\.(js|css)$/.test(file) && !listed.has(file));
  if (missing.length) throw new Error(`Not in a list in build.mjs, so not in the page: ${missing.map((f) => 'src/' + f).join(', ')}.`);
}

/** The model library's code, as the page's <script id="model-lib" data-lib> holds it. */
export function libraryCode() {
  checkLinkage(LIBRARY, SHARED.library, []);
  return stitch(LIBRARY, (name) => `// ==== ${name}`);
}

/** The page, built from the sources and the state (state.json unless given). */
export function build(state = readStateFile()) {
  checkListed();
  checkLinkage(SCRIPTS, SHARED.page, ['state']);
  const css = stitch(STYLES, (name) => `/* ==== ${name} */`);
  for (const [file, text, end] of [['a style', css, '</style'], ['the library', libraryCode(), '</script'], ['a script', stitch(SCRIPTS, () => ''), '</script']]) {
    if (text.toLowerCase().includes(end)) throw new Error(`${file} holds the text ${end}, which would end its element early.`);
  }
  const saved = typeof state.model.revision === 'string' ? state.model.revision : null;
  const blocks = {
    style: '<style>\n' + css + '</style>',
    state: '<!-- model:start -->\n<script type="application/json" id="model">\n' + json(state.model) + '\n</script>\n<!-- model:end -->\n\n' +
      '<!-- notes:start -->\n<script type="application/json" id="saved-notes">\n' + json({ saved, notes: state.notes, archive: state.archive }) + '\n</script>\n<!-- notes:end -->',
    library: '<script id="model-lib" data-lib>\n' + libraryCode() + '</script>',
    page: '<script>\n' + stitch(SCRIPTS, (name) => `// ==== ${name}`) + '</script>',
  };
  const shell = read(SHELL);
  const filled = new Set();
  const page = shell.replace(/^<!-- build: (\w+) -->$/gm, (line, slot) => {
    if (!(slot in blocks)) throw new Error(`src/${SHELL} has a slot the build doesn't fill: ${line}`);
    if (filled.has(slot)) throw new Error(`src/${SHELL} has the slot ${slot} twice.`);
    filled.add(slot);
    return blocks[slot];
  });
  const unfilled = Object.keys(blocks).filter((slot) => !filled.has(slot));
  if (unfilled.length) throw new Error(`src/${SHELL} has no line <!-- build: ${unfilled[0]} -->.`);
  return page;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  let page;
  try {
    page = build();
  } catch (error) {
    console.error(`The build failed: ${error.message}`);
    process.exit(1);
  }
  const rel = path.relative(process.cwd(), PAGE) || PAGE;
  if (check) {
    const current = fs.existsSync(PAGE) ? fs.readFileSync(PAGE, 'utf8') : null;
    if (current === page) {
      console.log(`${rel} is what the sources build.`);
    } else {
      const a = (current || '').split('\n');
      const b = page.split('\n');
      let line = 0;
      while (line < a.length && line < b.length && a[line] === b[line]) line++;
      console.error(current === null ? `${rel} doesn't exist.` : `${rel} isn't what the sources build: it differs from line ${line + 1}.`);
      console.error('Run node canvas/build.mjs to build it, and commit it with the sources.');
      process.exit(1);
    }
  } else {
    fs.writeFileSync(PAGE, page);
    console.log(`Built ${rel}: ${page.split('\n').length - 1} lines, ${Buffer.byteLength(page)} bytes.`);
  }
}
