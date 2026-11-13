import path from 'node:path';
const H = '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-all/canvas/app/test/helpers.mjs';
const h = await import(H);
const browser = await h.launch();
const T = [
  [h.EXAMPLE, 'v-proof', ['Host', 'App', 'Page', 'Page.hosts', 'Page.app', 'StrongholdApp'], ['Page.hosts.api']],
  [path.join(h.FIXTURES, 'interconnection.json'), 'v-ic', ['Tank', 'CtrlPort', 'System.tank', 'System.pump', 'FuelPort.back', 'Signal', 'FuelLine', 'Fuel'], ['System.controller.ctrl', 'System.pump.ctrl', 'System.tank.fuelOut', 'System.pump.fuelIn']],
  [path.join(h.FIXTURES, 'behavior-actions.json'), 'v-release', ['Release', 'Release.test', 'Release.lint', 'Release.compile', 'Release.publish'], ['Release.test.passed', 'Release.source', 'Release.bundle', 'Release.start']],
  [path.join(h.FIXTURES, 'behavior-states.json'), 'v-host', ['HostLifecycle', 'HostLifecycle.loading', 'HostLifecycle.idle', 'HostLifecycle.running'], ['HostLifecycle.done']],
];
for (const [file, vid, boxes, mids] of T) {
  const opened = await h.openIn(browser, h.stateFileAt(file)); const { page } = opened;
  const model = h.modelOf(file); const view = model.views.find((v) => v.id === vid);
  console.log(path.basename(file), 'views:', model.views.map((v) => v.id + ':' + v.name + ':' + v.kind).join(', '));
  const sel = await page.evaluate(() => [...document.querySelectorAll('[role="tab"][aria-selected="true"]')].map((t) => t.textContent.trim()));
  console.log(' selected tabs at open:', JSON.stringify(sel));
  await h.showView(page, view);
  const plane = await page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return [r.x, r.y, r.right, r.bottom]; }, h.planeOf(vid));
  const at = async (id, x, y) => page.evaluate(([x, y]) => { const el = document.elementFromPoint(x, y); const n = el?.closest('.react-flow__node'); return (n ? 'node ' + n.getAttribute('data-id') : el?.closest('.react-flow__edge') ? 'edge ' + el.closest('.react-flow__edge').getAttribute('data-id') : el?.closest('.react-flow__panel') ? 'panel' : (el?.className?.baseVal ?? el?.className)) ; }, [x, y]);
  for (const id of boxes) { const b = await h.boxOf(page, vid, id); if (!b) { console.log('  NO NODE', id); continue; } const p = h.headerOf(b); const got = await at(id, p.x, p.y); console.log(got === 'node ' + id ? '  ok ' : '  !! ', 'in', id, `zoom ${b.zoom.toFixed(3)}`, 'w', b.w, 'h', b.h, '->', got, p.x < plane[0] || p.x > plane[2] || p.y < plane[1] || p.y > plane[3] ? 'OFF PLANE' : ''); }
  for (const id of mids) { const b = await h.boxOf(page, vid, id); if (!b) { console.log('  NO NODE', id); continue; } const p = { x: b.x + b.width / 2, y: b.y + b.height / 2 }; const got = await at(id, p.x, p.y); console.log(got === 'node ' + id ? '  ok ' : '  !! ', 'on', id, 'w', b.w, 'h', b.h, `${b.width.toFixed(1)}px`, '->', got); }
  const g = await h.groundPoint(page, view); console.log('  ground', JSON.stringify(g), 'plane', JSON.stringify(plane));
  // the minimap and controls
  console.log('  minimap', await page.evaluate((s) => { const m = document.querySelector(s + ' .react-flow__minimap'); if (!m) return null; const r = m.getBoundingClientRect(); return [r.x, r.y, r.right, r.bottom]; }, h.planeOf(vid)), 'at 40px in from bottom right:', await at('', plane[2] - 40, plane[3] - 40));
  console.log('  problems', opened.problems.length);
  await opened.context.close();
}
await browser.close();
