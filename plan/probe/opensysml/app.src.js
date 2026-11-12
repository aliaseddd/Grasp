// OpenSysML module check for a page opened from disk. Source of wasm-app.js (bundled by build.sh).
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
const out = document.getElementById('out');
const log = (k, v, cls) => { const tr = document.createElement('tr'); tr.innerHTML = '<td></td><td></td>'; tr.children[0].textContent = k; tr.children[1].textContent = v; tr.children[1].className = cls || ''; out.appendChild(tr); };
const lines = [];
const rec = (k, v, cls) => { lines.push('- ' + k + ': ' + v); log(k, v, cls); };
async function main() {
  rec('browser', navigator.userAgent);
  rec('WebAssembly', typeof WebAssembly, typeof WebAssembly === 'object' ? 'ok' : 'bad');
  rec('cores / memory GB', (navigator.hardwareConcurrency || '?') + ' / ' + (navigator.deviceMemory || '?'));
  const T = {}; let t = performance.now(); const lap = (k) => { const n = performance.now(); T[k] = Math.round(n - t); t = n; };
  const bin = atob(window.SYSML_WASM_GZ_B64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  lap('base64 decode');
  const buf = await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  lap('gunzip');
  const mod = await WebAssembly.compile(buf);
  lap('compile');
  const connection = await connectWasm({ wasm: mod });
  lap('start');
  const model = await connection.parseSources([SourceDocument.inline('Package1.sysml', text)]);
  lap('parse');
  const sym = await model.find('Package1::hosts');
  lap('find');
  const total = Object.values(T).reduce((a, b) => a + b, 0);
  rec('step times (ms)', JSON.stringify(T) + ', total ' + total, total < 3000 ? 'ok' : 'warn');
  rec('module size (decompressed bytes)', String(buf.byteLength));
  rec('find Package1::hosts', sym ? sym.kind + ', type ' + (sym.type && sym.type.resolvedId) + ', multiplicity ' + JSON.stringify(sym.multiplicity) : 'not found', sym ? 'ok' : 'bad');
  const d = model.diagnostics.map(x => x.message || JSON.stringify(x));
  rec('diagnostics (the sample has planted mistakes: expect about 2)', d.length + ': ' + d.slice(0, 4).join(' | '), d.length ? 'ok' : 'warn');
  if (performance.memory) rec('JS heap MB', String(Math.round(performance.memory.usedJSHeapSize / 1048576)));
  window.__report = 'OpenSysML module check ' + new Date().toISOString() + '\n' + lines.join('\n');
  document.getElementById('report').value = window.__report;
  document.getElementById('status').textContent = 'Done. Click Copy report.';
}
main().catch(e => { rec('error', String((e && e.stack) || e), 'bad'); window.__report = 'OpenSysML module check ERROR\n' + lines.join('\n'); document.getElementById('report').value = window.__report; document.getElementById('status').textContent = 'Failed. Copy the report anyway.'; });
document.getElementById('copy').onclick = () => { document.getElementById('report').select(); navigator.clipboard && navigator.clipboard.writeText(window.__report || '').catch(() => {}); };
