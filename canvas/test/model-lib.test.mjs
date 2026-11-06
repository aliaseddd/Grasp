// The page's model library on its own, outside a browser: the <script id="model-lib"> run in a vm context with a bare
// `window`, then SysMLModel.toSysML on the model the page embeds. Values made inside the context belong to its own
// realm, so the checks below use typeof, Array.isArray and length, never deepEqual (its prototypes would differ).

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import vm from 'node:vm';
import { embeddedModel, modelLibSource, pageSource } from './helpers.mjs';

describe('model-lib', () => {
  test('toSysML turns the embedded saved model into a package, and validate finds nothing wrong with it', () => {
    const source = pageSource();
    const sandbox = { console };
    sandbox.window = sandbox;
    vm.runInContext(modelLibSource(source), vm.createContext(sandbox), { filename: 'canvas/index.html#model-lib' });
    const lib = sandbox.SysMLModel;
    assert.ok(lib, 'the model-lib script sets window.SysMLModel');
    assert.equal(typeof lib.toSysML, 'function', 'SysMLModel.toSysML');
    assert.equal(typeof lib.validate, 'function', 'SysMLModel.validate');

    const model = embeddedModel(source);
    const text = lib.toSysML(model, []);
    assert.equal(typeof text, 'string');
    assert.match(text, /\bpackage\b/);
    const problems = lib.validate(model);
    assert.ok(Array.isArray(problems), 'validate returns an array');
    assert.equal(problems.length, 0, `the embedded model validates clean: ${JSON.stringify(problems)}`);
  });
});
