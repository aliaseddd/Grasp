// The page's model library on its own, outside a browser: the <script id="model-lib"> run in a vm context with a bare
// `window`, then SysMLModel.toSysML on the model the page embeds, and normalize on a format-1 state file and on every
// fixture. Values made inside the context belong to its own realm, so the checks below use typeof, Array.isArray and
// length, never deepEqual (its prototypes would differ).

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { embeddedModel, modelLibSource, pageSource } from './helpers.mjs';

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

function loadLib(source) {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.runInContext(modelLibSource(source), vm.createContext(sandbox), { filename: 'canvas/index.html#model-lib' });
  assert.ok(sandbox.SysMLModel, 'the model-lib script sets window.SysMLModel');
  return sandbox.SysMLModel;
}

describe('model-lib', () => {
  test('toSysML turns the embedded saved model into a package, and validate finds nothing wrong with it', () => {
    const source = pageSource();
    const lib = loadLib(source);
    assert.equal(typeof lib.toSysML, 'function', 'SysMLModel.toSysML');
    assert.equal(typeof lib.validate, 'function', 'SysMLModel.validate');

    const model = embeddedModel(source);
    assert.equal(model.format, 'stronghold-canvas/2', 'the page embeds a format-2 model');
    const text = lib.toSysML(model, []);
    assert.equal(typeof text, 'string');
    assert.match(text, /\bpackage\b/);
    assert.match(text, /view proofStructure : StandardViewDefinitions::GeneralView \{\s+expose StrongholdProof::\*::\*\*;\s+\}/, 'the view exposes everything');
    const problems = lib.validate(model);
    assert.ok(Array.isArray(problems), 'validate returns an array');
    assert.equal(problems.length, 0, `the embedded model validates clean: ${JSON.stringify(problems)}`);
  });

  test('a format-1 model becomes one general view whose layout holds every element where it was, and exports clean', () => {
    const lib = loadLib(pageSource());
    const state = JSON.parse(fs.readFileSync(path.join(FIXTURES, 'format1.json'), 'utf8'));
    assert.equal(state.model.format, 'stronghold-canvas/1');
    const model = lib.normalize(state.model);
    assert.equal(model.format, 'stronghold-canvas/2');
    assert.equal(model.views.length, 1, 'one view');
    const view = model.views[0];
    assert.equal(view.kind, 'GeneralView');
    assert.equal(view.id, 'v1');
    assert.equal(view.name, state.model.view.name, 'named after the old view');
    for (const was of state.model.elements) {
      const lay = view.layout[was.id];
      assert.ok(lay, `the layout places ${was.id}`);
      if (was.x !== undefined) { assert.equal(lay.x, was.x); assert.equal(lay.y, was.y); assert.equal(lay.w, was.w); assert.equal(lay.h, was.h); }
      else { assert.equal(lay.side, was.side); assert.equal(lay.at, was.at); }
      const now = model.elements.find((e) => e.id === was.id);
      assert.ok(now, `${was.id} is still an element`);
      for (const field of ['x', 'y', 'w', 'h', 'side', 'at']) assert.equal(now[field], undefined, `${was.id} carries no ${field} any more`);
    }
    assert.equal(lib.validate(model).length, 0, 'the migrated model validates clean');
    assert.match(lib.toSysML(model, []), /view proofStructure : StandardViewDefinitions::GeneralView \{\s+expose StrongholdProof::\*::\*\*;/);
    // Normalizing again changes nothing: the page can round-trip its own model through the store.
    assert.equal(JSON.stringify(lib.normalize(JSON.parse(JSON.stringify(model)))), JSON.stringify(model), 'normalize is idempotent on its own output');
  });

  test('every fixture normalizes and validates clean', () => {
    const lib = loadLib(pageSource());
    const files = fs.readdirSync(FIXTURES).filter((name) => name.endsWith('.json'));
    assert.ok(files.length >= 1, 'there are fixtures');
    for (const file of files) {
      const state = JSON.parse(fs.readFileSync(path.join(FIXTURES, file), 'utf8'));
      const model = lib.normalize(state.model);
      const problems = lib.validate(model);
      assert.equal(problems.length, 0, `${file} validates clean: ${JSON.stringify(problems)}`);
      assert.match(lib.toSysML(model, state.notes || []), /\bpackage\b/, `${file} exports a package`);
    }
  });
});
