import { lib, loadWith, clock } from '../rd-all/canvas/app/test/core.mjs';
import { mergedFixtures } from './merged.mjs';
import { make } from './ref.mjs';
const app = await loadWith('panels/fieldHooks');
const R = make(app);
const M = JSON.parse(JSON.stringify(lib.normalize(mergedFixtures(lib))));
console.log('M', M.elements.length, M.relationships.length, M.views.length, M.views.map((v) => v.id + ':' + v.kind));
const session = app.openSession(lib, { model: mergedFixtures(lib), notes: [], archive: [] }, { name: 'fields.json' }, { now: clock() });
let inFront = M.views[0].id;
const tableOf = (type) => type === 'el' ? lib.KINDS : type === 'rel' ? lib.RELATIONSHIPS : lib.VIEW_KINDS;
const listOf = (type) => type === 'el' ? M.elements : type === 'rel' ? M.relationships : M.views;
function walk(type, kinds) {
  let n = 0; const log = [];
  for (const kind of kinds) {
    const left = tableOf(type)[kind].fields.filter((f) => f !== 'code' && f !== 'order');
    for (const item of listOf(type).filter((x) => x.kind === kind)) {
      if (!left.length) break;
      const fronts = [null, ...M.views.filter((v) => left.some((f) => (lib.FIELDS[f].views || []).includes(v.kind)) && v.layout[item.id])];
      for (const front of fronts) {
        if (!left.length) break;
        if (front) inFront = front.id;
        if (type === 'view') inFront = item.id;
        for (const field of [...left]) {
          const form = R.formOf(session, { type, id: item.id }, inFront);
          const d = lib.detailsOf(M, type, item);
          const tab = d.advanced.some((r) => r.field === field) ? 'Advanced' : 'Core';
          const rows = tab === 'Advanced' ? form.advanced : form.core.flatMap((g) => g.rows);
          const row = rows.find((r) => r.field === field);
          if (!row || row.locked) continue;
          // ref with no other choice?
          if (row.type === 'ref') { const o = R.optionsOf(session, { type, id: item.id }, field).filter((o) => o.id !== row.value); if (!o.length) log.push('NO OTHER CHOICE ' + item.id + ' ' + field); const other = o.find((x) => x.id !== ''); log.push(`${item.id}.${field}: ${row.value} -> ${other ? other.id : '""'}`); }
          left.splice(left.indexOf(field), 1); n++; log.push(`${kind} ${field} on ${item.id}${front ? ' front ' + front.id : ''} [${tab}]`);
        }
      }
    }
    if (left.length) log.push(`LEFT ${kind}: ${left}`);
  }
  return { n, log };
}
const sets = [
  ['el', ['PartDefinition', 'PortDefinition', 'ItemDefinition', 'InterfaceDefinition', 'ActionDefinition', 'StateDefinition']],
  ['el', ['PartUsage', 'PortUsage', 'ItemUsage', 'ParameterUsage']],
  ['el', ['ActionUsage', 'ForkNode', 'JoinNode', 'DecisionNode', 'MergeNode', 'StateUsage', 'EventOccurrenceUsage']],
  ['rel', ['ConnectionUsage', 'InterfaceUsage', 'FlowConnectionUsage', 'BindingConnectorAsUsage', 'SuccessionAsUsage', 'TransitionUsage', 'Message']],
  ['view', Object.keys(lib.VIEW_KINDS)],
];
let total = 0;
for (const [type, kinds] of sets) { inFront = M.views[0].id; const w = walk(type, kinds); total += w.n; console.log('=====', type, kinds.join(','), w.n); console.log(w.log.filter((l) => process.argv[2] || /LEFT|NO OTHER|->|front|parallel/.test(l)).join('\n')); }
console.log('total', total);
for (const id of ['b-Release.start', 'b-Release.done', 'c-HostLifecycle.initial', 'i-m-login', 'a-s-ServerHost', 'a-t-hosts']) {
  const type = M.elements.some((e) => e.id === id) ? 'el' : 'rel'; const f = R.formOf(session, { type, id }, M.views[0].id);
  console.log(id, f ? f.title + ' | fields: ' + [...f.core.flatMap((g) => g.rows), ...f.advanced].filter((r) => r.row === 'field').map((r) => r.field + '=' + JSON.stringify(r.value) + (r.locked ? ' LOCKED' : '')) : 'NO SUCH ITEM');
}
console.log(M.elements.filter((e) => /start|done|initial/i.test(e.kind)).map((e) => e.id + ':' + e.kind));
