// What a saved file says. Every fixture in fixtures/ is a state file the canvas saved, and the text it exports is
// pinned beside it, in the .sysml file of the same name: the text it exported when it was saved. However the canvas
// comes to read files differently, each fixture must go on saying the same thing.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { modelLibSource, pageSource } from './helpers.mjs';

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

// As in model-lib.test.mjs: the library the page holds, run in a vm context with a bare window. Its values belong to
// the context's realm, so the checks compare strings and JSON, never deepEqual.
function loadLib(source) {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.runInContext(modelLibSource(source), vm.createContext(sandbox), { filename: 'canvas/index.html#model-lib' });
  assert.ok(sandbox.SysMLModel, 'the model-lib script sets window.SysMLModel');
  return sandbox.SysMLModel;
}

const fixtures = () => fs.readdirSync(FIXTURES).filter((name) => name.endsWith('.json')).sort();
const readState = (name) => JSON.parse(fs.readFileSync(path.join(FIXTURES, name), 'utf8'));
const pinnedName = (name) => name.replace(/\.json$/, '.sysml');
const pinnedText = (name) => fs.readFileSync(path.join(FIXTURES, pinnedName(name)), 'utf8');
const listOf = (value) => (Array.isArray(value) ? value : []);
// How a fixture's text is pinned again, when a change to the export itself, not to how files are read, is meant to
// change it: the same code, the library in src/, through export.mjs.
const repin = (name) => `node canvas/export.mjs canvas/test/fixtures/${name} > canvas/test/fixtures/${pinnedName(name)}`;

describe('saved files', () => {
  test('every fixture has its export pinned beside it, and every pinned export has its fixture', () => {
    const names = fixtures();
    assert.ok(names.length >= 1, 'there are fixtures');
    for (const name of names) {
      assert.ok(fs.existsSync(path.join(FIXTURES, pinnedName(name))), `${name} has its export pinned in ${pinnedName(name)}; pin it with: ${repin(name)}`);
    }
    for (const sysml of fs.readdirSync(FIXTURES).filter((name) => name.endsWith('.sysml'))) {
      assert.ok(names.includes(sysml.replace(/\.sysml$/, '.json')), `${sysml} is the pinned export of a fixture`);
    }
  });

  test('every fixture exports the text pinned beside it', () => {
    const lib = loadLib(pageSource());
    for (const name of fixtures()) {
      const state = readState(name);
      const text = lib.toSysML(lib.normalize(state.model), listOf(state.notes), listOf(state.archive));
      assert.equal(text, pinnedText(name), `${name} says what it said when it was saved, the text in ${pinnedName(name)}. ` +
        `Reading files differently must never change it; only a change to the export itself may, and then pin it again: ${repin(name)}`);
    }
  });
});
