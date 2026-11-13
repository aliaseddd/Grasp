// Builds the new page: canvas/app/ → canvas/dist/, which is committed, and which Damon opens from disk.
//
//   node canvas/app/build.mjs                 # replaces canvas/dist/ whole, and prints its files with their sizes
//   node canvas/app/build.mjs --check         # writes nothing; names the first file that differs, is missing or is
//                                             # extra, and exits 1 then
//   node canvas/app/build.mjs [--check] --out DIR   # the same, into or against DIR instead of canvas/dist/
//
// What it writes:
//   index.html               copied from canvas/app/index.html
//   model-lib.js             the model library, exactly the text canvas/build.mjs stitches and canvas/export.mjs runs
//   vendor.js, vendor.css    the libraries, from src/vendor.ts, put on window.GraspVendor, with their stylesheets
//   fonts/*.woff2            Roboto, named by src/fonts.css
//   app.js, app.css          Grasp's own code, from src/main.tsx; every library it imports is read from GraspVendor
//   vendor/elkjs/            elkjs's elk.bundled.js and its LICENSE.md, copied byte for byte, bundled nowhere
//   THIRD-PARTY-NOTICES.txt  every package in the bundles, from esbuild's record of their inputs, with its licence text;
//                            then elkjs and SysML.ecore
//
// The build refuses a package whose licence is not on LICENCES, or that ships no licence file, naming it, so that a
// person looks before it reaches the page.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { libraryCode } from '../build.mjs';

const APP = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(APP, '..', '..');
const DIST = path.join(ROOT, 'canvas', 'dist');
const rel = (file) => path.relative(ROOT, file).split(path.sep).join('/');

/** The licences the build accepts, as SPDX identifiers. */
export const LICENCES = ['MIT', 'ISC', '0BSD', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', 'EPL-2.0', 'OFL-1.1'];

/** Whether an SPDX expression is acceptable: `A OR B` when either is, `A AND B` when both are. */
export function isAllowedLicence(expression) {
  if (typeof expression !== 'string' || !expression.trim()) return false;
  const bare = expression.trim().replace(/^\((.*)\)$/, '$1').trim();
  if (/\s+OR\s+/i.test(bare)) return bare.split(/\s+OR\s+/i).some(isAllowedLicence);
  if (/\s+AND\s+/i.test(bare)) return bare.split(/\s+AND\s+/i).every(isAllowedLicence);
  return LICENCES.includes(bare);
}

const LICENCE_FILE = /^(licen[cs]e|copying)(\.(md|txt))?$/i;

/**
 * The package an input of esbuild's metafile belongs to, from the last node_modules/<name> or
 * node_modules/@scope/<name> in its path: { name, dir }, dir relative to the repository's root. Null for Grasp's own.
 */
export function packageOf(input) {
  const match = /^(?:.*\/)?node_modules\/((?:@[^/]+\/)?[^/]+)\//.exec(input);
  if (!match) return null;
  const dir = input.slice(0, match.index + match[0].length - 1);
  return { name: match[1], dir };
}

function licenceOf(json) {
  if (typeof json.license === 'string') return json.license;
  if (json.license && typeof json.license.type === 'string') return json.license.type;
  if (Array.isArray(json.licenses)) return json.licenses.map((l) => l.type || l).join(' OR ');
  return undefined;
}

function repositoryOf(json) {
  const repo = typeof json.repository === 'string' ? json.repository : json.repository && json.repository.url;
  if (!repo) return json.homepage || 'not given';
  return repo
    .replace(/^git\+/, '')
    .replace(/^git:\/\//, 'https://')
    .replace(/^github:/, 'https://github.com/')
    .replace(/^(?![a-z]+:)([\w.-]+\/[\w.-]+)$/, 'https://github.com/$1')
    .replace(/\.git$/, '');
}

/** A package's name, version, licence, repository and licence text, or an error naming what is wrong. */
function describePackage(name, dir) {
  const abs = path.join(ROOT, dir);
  const json = JSON.parse(fs.readFileSync(path.join(abs, 'package.json'), 'utf8'));
  const licence = licenceOf(json);
  if (!isAllowedLicence(licence)) throw new Error(`${name} ${json.version} (${dir}) is under ${licence || 'no licence it names'}, which is not on the build's list (${LICENCES.join(', ')}).`);
  const file = fs.readdirSync(abs).sort().find((f) => LICENCE_FILE.test(f));
  if (!file) throw new Error(`${name} ${json.version} (${dir}) ships no licence file.`);
  return { name, version: json.version, licence, repository: repositoryOf(json), file, text: fs.readFileSync(path.join(abs, file), 'utf8').trim() };
}

const RULE = '='.repeat(80);
const THIN = '-'.repeat(80);

function noticeEntry(heading, lines, text) {
  return [RULE, heading, ...lines, THIN, text, ''].join('\n');
}

// The metamodel's source, as canvas/metamodel/README.md gives it.
const ECORE_SOURCE = [
  'Source: org.omg.sysml/model/SysML.ecore of https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation,',
  '        release 2026-09.1, commit d81b2ad5016f2e2d3d4364b3d06d01d8bb12a896',
];

/** The notices file: the bundles' packages, sorted, then elkjs and SysML.ecore. */
function notices(metafiles) {
  const found = new Map(); // name@dir → { name, dir, outputs }
  const at = (input) => {
    const pkg = packageOf(input);
    if (!pkg) return null;
    const key = `${pkg.name}@${pkg.dir}`;
    if (!found.has(key)) found.set(key, { ...pkg, outputs: new Set() });
    return found.get(key);
  };
  for (const metafile of metafiles) {
    // Every package the build read is listed, even one whose code was all left out of the scripts.
    for (const input of Object.keys(metafile.inputs)) at(input);
    for (const [output, { inputs }] of Object.entries(metafile.outputs)) {
      for (const input of Object.keys(inputs)) at(input)?.outputs.add(path.posix.relative(rel(DIST), output));
    }
  }
  const packages = [...found.values()]
    .map((pkg) => ({ ...describePackage(pkg.name, pkg.dir), outputs: [...pkg.outputs].sort() }))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : a.version < b.version ? -1 : 1));
  const elk = describePackage('elkjs', 'node_modules/elkjs');
  const parts = [
    'THIRD-PARTY NOTICES',
    '',
    "Grasp's page, canvas/dist/, holds code and fonts written by others. Each entry names a package, its version, its",
    'licence, where it comes from and which of the page\'s files hold it, followed by the full text of its licence file.',
    'The packages come first, in the order of their names; then elkjs, shipped as a file of its own; then SysML.ecore,',
    'from which the model library\'s kind lists are generated. React Flow (@xyflow/react) draws the planes.',
    '',
    ...packages.map((p) => noticeEntry(`${p.name} ${p.version}`, [`Licence: ${p.licence}`, `Repository: ${p.repository}`, `In: ${p.outputs.length ? p.outputs.join(', ') : 'none of the page\'s files (the build read it, and the bundler left all of it out)'}`, `Licence file: ${p.file}`], p.text)),
    noticeEntry(`${elk.name} ${elk.version}`, [`Licence: ${elk.licence}`, `Repository: ${elk.repository}`, 'In: vendor/elkjs/elk.bundled.js, unmodified, with its LICENSE.md beside it', `Licence file: ${elk.file}`], elk.text),
    noticeEntry('SysML.ecore', ['Licence: EPL-2.0', ...ECORE_SOURCE, 'In: model-lib.js, as the kind lists generated from it (canvas/metamodel/README.md)', 'Licence file: canvas/metamodel/LICENSE'], fs.readFileSync(path.join(ROOT, 'canvas', 'metamodel', 'LICENSE'), 'utf8').trim()),
  ];
  return parts.join('\n');
}

const DEFINE = { 'process.env.NODE_ENV': '"production"' };

/** The vendor bundle, recording the package paths vendor.ts itself imports (stylesheets excepted). */
async function buildVendor() {
  const entry = path.join(APP, 'src', 'vendor.ts');
  const vendorModules = new Set();
  const record = {
    name: 'record-vendor-modules',
    setup(build) {
      build.onResolve({ filter: /^[^./]/ }, (args) => {
        if (args.importer === entry && !/\.css$/.test(args.path)) vendorModules.add(args.path);
        return undefined;
      });
    },
  };
  const result = await esbuild.build({
    absWorkingDir: ROOT,
    entryPoints: { vendor: entry },
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'chrome120',
    minify: true,
    legalComments: 'eof',
    define: DEFINE,
    loader: { '.woff2': 'file' },
    assetNames: 'fonts/[name]',
    outdir: DIST,
    write: false,
    metafile: true,
    logLevel: 'silent',
    plugins: [record],
  });
  return { result, vendorModules: [...vendorModules].sort() };
}

/**
 * The application's bundle. Every package it imports is answered from window.GraspVendor by a CommonJS shim marked
 * __esModule, so that default and named imports resolve as they would in one bundle; an import of any other package
 * fails the build, naming the file and the path.
 */
async function buildApp(vendorModules) {
  const vendor = {
    name: 'grasp-vendor',
    setup(build) {
      build.onResolve({ filter: /^[^./]/ }, (args) => {
        if (vendorModules.includes(args.path)) return { path: args.path, namespace: 'grasp-vendor' };
        return { errors: [{ text: `${rel(args.importer)} imports ${args.path}, which src/vendor.ts does not put on window.GraspVendor.` }] };
      });
      build.onLoad({ filter: /.*/, namespace: 'grasp-vendor' }, (args) => ({
        contents: `var ns = window.GraspVendor[${JSON.stringify(args.path)}];\n` +
          `var shim = Object.defineProperty({}, '__esModule', { value: true });\n` +
          `Object.keys(ns).forEach(function (key) { if (key !== '__esModule') Object.defineProperty(shim, key, { enumerable: true, get: function () { return ns[key]; } }); });\n` +
          `module.exports = shim;\n`,
        loader: 'js',
      }));
    },
  };
  return esbuild.build({
    absWorkingDir: ROOT,
    entryPoints: { app: path.join(APP, 'src', 'main.tsx') },
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'chrome120',
    jsx: 'automatic',
    minifyWhitespace: true,
    minifySyntax: true,
    define: DEFINE,
    outdir: DIST,
    write: false,
    metafile: true,
    logLevel: 'silent',
    plugins: [vendor],
  });
}

/** Builds everything in memory and writes nothing: { files: Map(path → Buffer), metafiles, vendorModules }. */
export async function buildFiles() {
  const files = new Map();
  const add = (name, contents) => files.set(name, Buffer.isBuffer(contents) ? contents : Buffer.from(contents));
  const outputs = (result) => {
    for (const out of result.outputFiles) add(path.relative(DIST, out.path).split(path.sep).join('/'), Buffer.from(out.contents));
  };

  add('index.html', fs.readFileSync(path.join(APP, 'index.html')));
  add('model-lib.js', libraryCode());
  const { result: vendorResult, vendorModules } = await buildVendor();
  outputs(vendorResult);
  const appResult = await buildApp(vendorModules);
  outputs(appResult);
  const elk = path.join(ROOT, 'node_modules', 'elkjs');
  add('vendor/elkjs/elk.bundled.js', fs.readFileSync(path.join(elk, 'lib', 'elk.bundled.js')));
  add('vendor/elkjs/LICENSE.md', fs.readFileSync(path.join(elk, 'LICENSE.md')));
  const metafiles = [vendorResult.metafile, appResult.metafile];
  add('THIRD-PARTY-NOTICES.txt', notices(metafiles));
  return { files: new Map([...files].sort(([a], [b]) => (a < b ? -1 : 1))), metafiles, vendorModules };
}

/** Every file under a folder, as paths relative to it with forward slashes. */
function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(dir, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'))
    .sort();
}

/** The first difference between the built files and a folder, as a sentence, or null when they match. */
export function difference(files, dir) {
  const there = listFiles(dir);
  const names = [...new Set([...files.keys(), ...there])].sort();
  for (const name of names) {
    if (!files.has(name)) return `${name} is in ${dir} but the sources don't build it.`;
    const file = path.join(dir, name);
    if (!fs.existsSync(file)) return `${name} is missing from ${dir}.`;
    if (!fs.readFileSync(file).equals(files.get(name))) return `${name} isn't what the sources build.`;
  }
  return null;
}

const kb = (bytes) => (bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} kB`);

async function main(argv) {
  const check = argv.includes('--check');
  const at = argv.indexOf('--out');
  const out = at >= 0 ? path.resolve(argv[at + 1] || '') : DIST;
  if (at >= 0 && !argv[at + 1]) throw new Error('--out needs a folder.');
  const { files } = await buildFiles();
  const shown = path.relative(process.cwd(), out) || '.';
  if (check) {
    const diff = difference(files, out);
    if (diff) {
      console.error(`${shown} isn't what the sources build: ${diff} Run npm run build.`);
      process.exit(1);
    }
    console.log(`${shown} is what the sources build.`);
    return;
  }
  // The folder is replaced whole, so refuse one that holds anything but an earlier build.
  if (fs.existsSync(out) && listFiles(out).length && !fs.existsSync(path.join(out, 'model-lib.js'))) {
    throw new Error(`${shown} holds files that aren't a build of the page; not replacing it.`);
  }
  if (ROOT.startsWith(out + path.sep) || ROOT === out) throw new Error(`${shown} holds the repository; not replacing it.`);
  fs.rmSync(out, { recursive: true, force: true });
  for (const [name, contents] of files) {
    const file = path.join(out, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, contents);
  }
  const width = Math.max(...[...files.keys()].map((name) => name.length));
  for (const [name, contents] of files) console.log(`${name.padEnd(width)}  ${kb(contents.length).padStart(10)}`);
  const total = [...files.values()].reduce((sum, c) => sum + c.length, 0);
  console.log(`${files.size} files, ${kb(total)}, in ${shown}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => {
    const detail = error.errors && error.errors.length ? error.errors.map((e) => e.text + (e.location ? ` (${e.location.file}:${e.location.line})` : '')).join('\n') : error.message;
    console.error(`The build failed: ${detail}`);
    process.exit(1);
  });
}
