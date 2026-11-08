import { connectWasm, SourceDocument } from '@openmbee/opensysml/browser';
const text = `package Package1 {
  part def Host { port api : ~App; attribute mass : ScalarValues::Real; }
  part def App { port api : App; }
  port def App;
  abstract part def Page;
  part def ServerHost :> Host;
  part hosts : Host[1..*];
  part app : App[1];
  connection mount connect hosts.api to app.api;
  view view1 : StandardViewDefinitions::GeneralView { expose Package1::*::**; }
}`;
async function main() {
  const R = {};
  const t0 = performance.now();
  const bin = atob(window.SYSML_WASM_GZ_B64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const t1 = performance.now();
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const buf = await new Response(stream).arrayBuffer();
  const t2 = performance.now();
  const mod = await WebAssembly.compile(buf);
  const t3 = performance.now();
  const connection = await connectWasm({ wasm: mod });
  const t4 = performance.now();
  const model = await connection.parseSources([SourceDocument.inline('Package1.sysml', text)]);
  const t5 = performance.now();
  const sym = await model.find('Package1::hosts');
  const n = []; for await (const s of model.walk()) { n.push(s.kind + ' ' + s.id); if (n.length > 400) break; }
  const t6 = performance.now();
  R.ms = { base64decode: t1 - t0, gunzip: t2 - t1, compile: t3 - t2, connect: t4 - t3, parse: t5 - t4, findAndWalk: t6 - t5, total: t6 - t0 };
  R.wasmBytes = buf.byteLength;
  R.symbol = sym && { id: sym.id, kind: sym.kind, type: sym.type && sym.type.resolvedId, multiplicity: sym.multiplicity };
  R.diagnostics = model.diagnostics.map(d => d.message || JSON.stringify(d)).slice(0, 5);
  R.walked = n.length; R.walkSample = n.slice(0, 12);
  R.memoryMB = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null;
  window.__result = R;
}
main().catch(e => { window.__result = { error: String((e && e.stack) || e) }; });
