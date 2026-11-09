import { connectWasm, SourceDocument } from '@openmbee/opensysml';
const t0 = Date.now();
const connection = await connectWasm({ thread: 'inline' });
console.log('connected in ms:', Date.now() - t0);
try { const info = await connection.serverInfo?.(); console.log('serverInfo:', JSON.stringify(info).slice(0, 600)); } catch (e) { console.log('serverInfo failed:', e.message); }
console.log('connection methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(connection)).filter(n => n !== 'constructor').join(', '));
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
const t1 = Date.now();
const model = await connection.parseSources([SourceDocument.inline('Package1.sysml', text)]);
console.log('parsed in ms:', Date.now() - t1);
console.log('model methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(model)).filter(n => n !== 'constructor').join(', '));
console.log('model keys:', Object.keys(model).join(', '));
try { const d = await model.diagnostics?.(); console.log('diagnostics:', JSON.stringify(d).slice(0, 800)); } catch (e) { console.log('diagnostics failed:', e.message); }
try { const s = await model.find('Package1::Host'); console.log('find Host:', JSON.stringify(s, null, 0).slice(0, 1500)); if (s) console.log('symbol methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(s)).join(', ')); } catch (e) { console.log('find failed:', e.message); }
try { const s = await model.find('Package1::hosts'); console.log('find hosts:', JSON.stringify(s, null, 0).slice(0, 1500)); } catch (e) { console.log('find hosts failed:', e.message); }
try { const c = await model.convert('api-json'); console.log('convert api-json:', JSON.stringify(c).slice(0, 2500)); } catch (e) { console.log('convert api-json failed:', e.constructor.name, e.message); }
try { const c = await model.convert('sysml'); console.log('convert sysml:', JSON.stringify(c).slice(0, 1200)); } catch (e) { console.log('convert sysml failed:', e.constructor.name, e.message); }
try { const v = await model.renderView('Package1::view1'); console.log('renderView:', JSON.stringify(v).slice(0, 1500)); } catch (e) { console.log('renderView failed:', e.constructor.name, e.message); }
try { const v = await model.renderDocument?.('Package1.sysml'); console.log('renderDocument:', JSON.stringify(v).slice(0, 1500)); } catch (e) { console.log('renderDocument failed:', e.constructor.name, e.message); }
for (const name of ['symbols', 'members', 'explore', 'graph', 'query', 'elements', 'documents', 'tree']) {
  if (typeof model[name] === 'function') { try { const r = await model[name](); console.log(name + ':', JSON.stringify(r).slice(0, 1200)); } catch (e) { console.log(name + ' failed:', e.message); } }
}
await connection.close?.();
