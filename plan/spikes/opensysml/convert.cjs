// Runs OpenSysML's command-line wasm build under Node with a minimal environment (argv+env must stay under ~8 KiB).
globalThis.require = require; globalThis.fs = require('fs'); globalThis.path = require('path');
globalThis.TextEncoder = require('util').TextEncoder; globalThis.TextDecoder = require('util').TextDecoder;
globalThis.performance ??= require('perf_hooks').performance; globalThis.crypto ??= require('crypto');
require('./wasm_exec');
const go = new Go(); go.argv = ['sysml', ...process.argv.slice(2)]; go.env = { TMPDIR: '/tmp', HOME: '/tmp' }; go.exit = process.exit;
const t0 = Date.now();
WebAssembly.instantiate(fs.readFileSync(__dirname + '/sysml-prod.wasm'), go.importObject).then(r => { process.on('exit', () => { process.stderr.write(`[wall ${Date.now() - t0} ms]\n`); }); return go.run(r.instance); }).catch(e => { console.error(e); process.exit(1); });
