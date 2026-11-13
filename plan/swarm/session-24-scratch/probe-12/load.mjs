import { loadWith, loadCore, lib } from '../wt-12/canvas/app/test/core.mjs';
const m = await loadWith('core/checks', 'core/probe');
console.log(['checksOf', 'aboutProblem', 'PAUSE', 'createProbe', 'WASM_LOOP', 'LIBRARIES', 'SAID', 'runs', 'jsLoop', 'openText', 'selectionOf'].map((k) => `${k}:${typeof m[k]}`).join(' '));
console.log(m.runs(39.4, 276.6), '|', m.blocked(m.reasonOf(new Error('The operation is insecure'))), '|', m.blocked('nope.'), '|', m.reasonOf(undefined), '|', m.LIBRARIES.length, m.WASM_LOOP.length);
const { instance } = await WebAssembly.instantiate(m.WASM_LOOP);
console.log(instance.exports.run(m.LOOP_STEPS) === m.LOOP_RESULT, m.jsLoop(m.LOOP_STEPS) === m.LOOP_RESULT);
try { m.checksOf({}); } catch (e) { console.log(e.message); }
const core = await loadCore();
console.log('core has', typeof core.checksOf, typeof core.createProbe);
