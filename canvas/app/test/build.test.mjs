// The build: canvas/dist/ is what the sources build, the page runs the model library's own text, every third-party
// package in the scripts is in the notices file with its licence, elkjs is a file of its own, and the page asks for
// nothing outside its own folder.

import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { libraryCode } from '../../build.mjs';
import { loadLib } from '../../export.mjs';
import { buildFiles, isAllowedLicence, packageOf } from '../build.mjs';
import { DIST, DIST_URL, finish, launch, openPage, ROOT } from './helpers.mjs';

const BUILD = path.join(ROOT, 'canvas', 'app', 'build.mjs');
const run = (...args) => spawnSync(process.execPath, [BUILD, ...args], { cwd: ROOT, encoding: 'utf8' });

describe('the build', () => {
  let built;
  before(async () => { built = await buildFiles(); });

  test('canvas/dist/ is what the sources build', () => {
    const result = run('--check');
    assert.equal(result.status, 0, result.stderr + result.stdout);
  });

  test('--check names a changed file, an extra file and a missing one', () => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'grasp-dist-'));
    try {
      const dir = path.join(out, 'dist');
      execFileSync(process.execPath, [BUILD, '--out', dir], { cwd: ROOT, stdio: 'pipe' });
      assert.equal(run('--check', '--out', dir).status, 0);

      const app = path.join(dir, 'app.js');
      const text = fs.readFileSync(app);
      fs.appendFileSync(app, '\n// changed\n');
      let result = run('--check', '--out', dir);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /app\.js/);
      fs.writeFileSync(app, text);

      fs.writeFileSync(path.join(dir, 'extra.txt'), 'extra');
      result = run('--check', '--out', dir);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /extra\.txt/);
      fs.rmSync(path.join(dir, 'extra.txt'));

      fs.rmSync(path.join(dir, 'fonts', 'roboto-latin-700-normal.woff2'));
      result = run('--check', '--out', dir);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /fonts\/roboto-latin-700-normal\.woff2/);
    } finally {
      fs.rmSync(out, { recursive: true, force: true });
    }
  });

  test('the page runs the model library that export.mjs runs, before the libraries and the application', () => {
    const lib = fs.readFileSync(path.join(DIST, 'model-lib.js'), 'utf8');
    assert.equal(lib, libraryCode());
    assert.equal(loadLib(lib).FORMAT, 'grasp/2');
    const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
    const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(scripts, ['model-lib.js', 'vendor.js', 'app.js']);
  });

  test('every package in the scripts is in the notices file, with its version, its licence and its licence text', () => {
    const notices = built.files.get('THIRD-PARTY-NOTICES.txt').toString('utf8');
    const packages = new Map();
    for (const metafile of built.metafiles) {
      for (const input of Object.keys(metafile.inputs)) {
        const found = packageOf(input);
        if (found) packages.set(found.name, found.dir);
      }
    }
    assert.ok(packages.size > 10, `only ${packages.size} packages found in the bundles`);
    for (const [name, dir] of packages) {
      const json = JSON.parse(fs.readFileSync(path.join(ROOT, dir, 'package.json'), 'utf8'));
      const heading = `${name} ${json.version}`;
      const at = notices.indexOf(`\n${heading}\n`);
      assert.ok(at >= 0, `${heading} is not in the notices file`);
      const end = notices.indexOf(`\n${'='.repeat(80)}\n`, at + 1); // the rule between entries
      const entry = notices.slice(at, end < 0 ? undefined : end);
      assert.match(entry, /^Licence: .+$/m, `${heading} has no licence line`);
      const file = fs.readdirSync(path.join(ROOT, dir)).find((f) => /^(licen[cs]e|copying)(\.(md|txt))?$/i.test(f));
      assert.ok(file, `${name} has no licence file`);
      const text = fs.readFileSync(path.join(ROOT, dir, file), 'utf8').trim();
      assert.ok(entry.includes(text), `the notices entry of ${heading} lacks the text of its ${file}`);
    }
    assert.match(notices, /\nelkjs 0\.11\.0\n/);
    assert.ok(notices.includes(fs.readFileSync(path.join(ROOT, 'node_modules', 'elkjs', 'LICENSE.md'), 'utf8').trim()));
    assert.match(notices, /\nSysML\.ecore\n/);
    assert.match(notices, /EPL-2\.0/);
    assert.ok(notices.includes(fs.readFileSync(path.join(ROOT, 'canvas', 'metamodel', 'LICENSE'), 'utf8').trim()));
  });

  test('the build accepts only the licences on its list', () => {
    assert.equal(isAllowedLicence('GPL-3.0-only'), false);
    assert.equal(isAllowedLicence('MIT'), true);
    assert.equal(isAllowedLicence('(MIT OR GPL-3.0)'), true);
    assert.equal(isAllowedLicence('MIT AND GPL-3.0'), false);
    assert.equal(isAllowedLicence(undefined), false);
  });

  test('elkjs is a file of its own, byte for byte the package\'s, in no bundle, and not loaded by the page', () => {
    for (const [built, original] of [['vendor/elkjs/elk.bundled.js', 'lib/elk.bundled.js'], ['vendor/elkjs/LICENSE.md', 'LICENSE.md']]) {
      assert.ok(fs.readFileSync(path.join(DIST, built)).equals(fs.readFileSync(path.join(ROOT, 'node_modules', 'elkjs', original))), built);
    }
    for (const metafile of built.metafiles) {
      const elk = Object.keys(metafile.inputs).filter((input) => /(^|\/)node_modules\/elkjs\//.test(input));
      assert.deepEqual(elk, []);
    }
    assert.doesNotMatch(fs.readFileSync(path.join(DIST, 'index.html'), 'utf8'), /elk/i);
  });
});

describe('the built page in Chromium', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(async () => { await browser?.close(); });

  test('the page asks for nothing outside its own folder', async () => {
    const opened = await openPage(browser);
    await opened.page.evaluate(() => document.fonts.ready);
    const { requests } = opened;
    const outside = requests.filter((url) => !url.startsWith(DIST_URL));
    assert.deepEqual(outside, [], 'requests outside canvas/dist/');
    const asked = requests.map((url) => url.slice(DIST_URL.length));
    for (const file of ['model-lib.js', 'vendor.js', 'app.js', 'vendor.css', 'app.css']) assert.ok(asked.includes(file), `${file} was not loaded`);
    assert.ok(asked.some((file) => /^fonts\/roboto-latin-\d+-normal\.woff2$/.test(file)), `no Roboto font was loaded: ${asked.join(', ')}`);
    await finish(opened);
  });
});
