// The build, outside a browser: index.html is what the sources build; build.mjs --check says so, and fails once the
// page, a source, or state.json changes without a build; and the build refuses a script laid out against the rules
// in src/README.md (a name taken before any script registers it, a name registered twice, a name reached as C.name
// that nobody registers, a file no list names). The changes are made to a copy, in a folder of its own.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const CANVAS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const copies = [];

/** A copy of what the build reads and writes: build.mjs, src/, state.json and index.html. */
function copyCanvas() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'canvas-build-'));
  copies.push(dir);
  for (const name of ['build.mjs', 'state.json', 'index.html']) fs.copyFileSync(path.join(CANVAS, name), path.join(dir, name));
  fs.cpSync(path.join(CANVAS, 'src'), path.join(dir, 'src'), { recursive: true });
  return dir;
}
const run = (dir, ...args) => spawnSync(process.execPath, [path.join(dir, 'build.mjs'), ...args], { encoding: 'utf8' });
const append = (file, text) => fs.appendFileSync(file, text);
/** The last of the page's scripts, as build.mjs lists them. */
async function lastScript(dir) {
  const { SCRIPTS } = await import(pathToFileURL(path.join(dir, 'build.mjs')).href);
  return path.join(dir, 'src', SCRIPTS[SCRIPTS.length - 1]);
}

describe('build', () => {
  after(() => copies.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })));

  test('index.html is what the sources and state.json build', () => {
    const result = run(CANVAS, '--check');
    assert.equal(result.status, 0, `node canvas/build.mjs --check passes:\n${result.stdout}${result.stderr}`);
  });

  test('--check fails once index.html, a source, or state.json changes without a build, and passes after one', () => {
    const dir = copyCanvas();
    assert.equal(run(dir, '--check').status, 0, 'the copy starts in step');

    append(path.join(dir, 'index.html'), '<!-- edited by hand -->\n');
    let result = run(dir, '--check');
    assert.equal(result.status, 1, 'an edited index.html fails the check');
    assert.match(result.stderr, /isn't what the sources build/);
    assert.equal(run(dir).status, 0, 'the build runs');
    assert.equal(run(dir, '--check').status, 0, 'the built page passes the check');

    append(path.join(dir, 'src', 'core', 'style.css'), '/* a change to a source */\n');
    assert.equal(run(dir, '--check').status, 1, 'a changed source fails the check until the page is built');
    assert.equal(run(dir).status, 0);
    assert.equal(run(dir, '--check').status, 0);

    const state = JSON.parse(fs.readFileSync(path.join(dir, 'state.json'), 'utf8'));
    state.model.package.name = 'Renamed';
    fs.writeFileSync(path.join(dir, 'state.json'), JSON.stringify(state, null, 2) + '\n');
    assert.equal(run(dir, '--check').status, 1, 'a changed state.json fails the check until the page is built');
    assert.equal(run(dir).status, 0);
    assert.ok(fs.readFileSync(path.join(dir, 'index.html'), 'utf8').includes('"name": "Renamed"'), 'the page carries the saved state');
  });

  test('the build refuses a file in src/ that no list names', () => {
    const dir = copyCanvas();
    fs.writeFileSync(path.join(dir, 'src', 'core', 'stray.js'), '// not in a list\n');
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Not in a list in build\.mjs.*src\/core\/stray\.js/);
  });

  test('the build refuses a script that takes a name no script before it registers', async () => {
    const dir = copyCanvas();
    append(await lastScript(dir), '(function (C) {\n  \'use strict\';\n  const { nowhere } = C;\n})(window.SysMLCanvas);\n');
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /takes nowhere from C, but no script before it registers nowhere/);
  });

  test('the build refuses a name registered twice, and a name reached as C.name that no script registers', async () => {
    const dir = copyCanvas();
    const script = await lastScript(dir);
    const registers = '(function (C) {\n  \'use strict\';\n  const twice = 1;\n  Object.assign(C, { twice });\n})(window.SysMLCanvas);\n';
    append(script, registers + registers);
    let result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /registers twice on C, but .* registers it already/);

    const other = copyCanvas();
    append(await lastScript(other), '(function (C) {\n  \'use strict\';\n  function later() { return C.nowhere(); }\n})(window.SysMLCanvas);\n');
    result = run(other);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /reaches C\.nowhere, but no script registers nowhere/);
  });
});
