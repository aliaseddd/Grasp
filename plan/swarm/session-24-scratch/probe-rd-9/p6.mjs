import { EXAMPLE, clock, lib, loadCore, loadPlanes, loadWith, readText } from '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-9/canvas/app/test/core.mjs';
const core = await loadCore(); const planes = await loadPlanes(); const m = await loadWith('panels/explorerRows');
console.log('core.selectionOf', typeof core.selectionOf, 'planes', typeof planes.selectionOf, typeof planes.viewStoreOf, typeof planes.project);
console.log(['explorerRowsOf', 'rowId', 'rowOf', 'pickedOf', 'PACKAGE_ROW', 'ROWS_SHOWN', 'UNFOLDED_UP_TO', 'openText'].map(k => k + ':' + typeof m[k]).join(' '));
const s = m.openText(lib, readText(EXAMPLE), { name: 'example.json' }, { now: clock() });
try { core.selectionOf(s); } catch (e) { console.log('throws:', e.message); }
try { m.explorerRowsOf(s); } catch (e) { console.log('throws:', e.message); }
console.log(m.rowOf('el:a:b'), m.rowOf('nonsense'), m.rowOf('thing:1'), m.pickedOf('more:package:'), m.rowId('more', 'el:Release'), m.rowId('package'));
const store = planes.viewStoreOf(planes.openText(lib, readText(EXAMPLE), { name: 'example.json' }, { now: clock() }), 'v-proof');
try { store.marquee({ x: 0, y: 0, width: 1, height: 1 }); } catch (e) { console.log('throws:', e.message); }
// Proxy lib works with openText?
let n = 0; const px = new Proxy(lib, { get(t, k) { if (k === 'browserRows' || k === 'reading') n++; return Reflect.get(t, k); } });
const s2 = m.openText(px, readText(EXAMPLE), { name: 'example.json' }, { now: clock() });
console.log('session.lib is proxy', s2.lib === px, 'reads so far', n);
s2.history.edit(() => { s2.model.elements.find(e => e.id === 'Host').name = 'X'; return 'Renamed'; });
console.log('reads after an edit', n);
// what told says for a few edits
const told = []; s2.history.listen(t => told.push(t));
s2.history.edit(() => { s2.model.package.name = 'Proof'; return 'x'; });
s2.history.edit(() => { s2.model.views[0].layout.Host.w = 300; return 'x'; });
s2.history.edit(() => { s2.model.elements.find(e => e.id === 'Host').doc = 'd'; return 'x'; });
s2.history.edit(() => { s2.model.elements.push({ id: 'NewDef', kind: 'PartDefinition', name: 'NewDef', doc: '' }); return 'x'; });
s2.history.edit(() => { s2.model.views[0].layout.NewDef = { x: 0, y: 0, w: 200, h: 100 }; return 'x'; });
s2.history.edit(() => { s2.model.views[0].name = 'vv'; return 'x'; });
for (const t of told) console.log(JSON.stringify(t));
