import { loadWith } from '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-all/canvas/app/test/core.mjs';
const core = await loadWith('core/probe');
console.log('len', core.WASM_LOOP.length, core.LOOP_STEPS, core.LOOP_RESULT, core.LOOP_DELAY, core.GITHUB_WAIT, core.GITHUB_URL, core.LIBRARIES);
const { instance } = await WebAssembly.instantiate(core.WASM_LOOP);
for (const n of [0, 1, 2, 10, 1000, core.LOOP_STEPS]) console.log(n, instance.exports.run(n), core.jsLoop(n));
// how many setImmediate ticks does instantiate need?
for (let trial = 0; trial < 8; trial += 1) {
  let done = false; let ticks = 0;
  WebAssembly.instantiate(core.WASM_LOOP).then(() => { done = true; });
  while (!done && ticks < 100000) { await new Promise((resolve) => setImmediate(resolve)); ticks += 1; }
  console.log('instantiate resolved after', ticks, 'setImmediate ticks');
}
// with a .then chain in between like an implementation: later -> instantiate -> then -> run
for (let trial = 0; trial < 5; trial += 1) {
  let state = 'pending';
  (async () => { try { const m = await WebAssembly.instantiate(core.WASM_LOOP); const a = m.instance.exports.run(core.LOOP_STEPS); const b = core.jsLoop(core.LOOP_STEPS); state = a === b ? 'yes' : 'no'; } catch { state = 'blocked'; } })();
  for (let i = 0; i < 20; i += 1) await new Promise((resolve) => setImmediate(resolve));
  console.log('after settle():', state);
  await new Promise((r) => setTimeout(r, 1500));
}
console.log(core.browserOf === undefined, Object.keys(core).filter((k) => /^[a-z]/.test(k) && /reason|runs|blocked|reached|answered|remember|survived|notRe|browser|createProbe|jsLoop/.test(k)));
