import { loadWith } from '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-all/canvas/app/test/core.mjs';
const core = await loadWith('core/probe');
let pending = 0; const N = 40; let max = 0;
for (let trial = 0; trial < N; trial += 1) {
  let done = false;
  const p = WebAssembly.instantiate(core.WASM_LOOP).then(() => { done = true; });
  for (let i = 0; i < 20; i += 1) await new Promise((resolve) => setImmediate(resolve));
  if (!done) pending += 1;
  let ticks = 20; while (!done) { await new Promise((resolve) => setImmediate(resolve)); ticks += 1; } max = Math.max(max, ticks);
  await p;
}
console.log('still unresolved after settle():', pending, 'of', N, 'most ticks needed', max);
