import { EXAMPLE, TEN, modelOf, lib } from '../wt-10/canvas/app/test/helpers.mjs';
const m = modelOf(EXAMPLE);
const show = (type, id) => {
  const item = (type === 'el' ? m.elements : type === 'rel' ? m.relationships : m.views).find((x) => x.id === id);
  const d = lib.reading(m, () => lib.detailsOf(m, type, item));
  const r = (x) => (x.field ? `[${x.field}]` : x.held === false ? `${x.label}:nh` : `${x.label}=${JSON.stringify(x.value)}`);
  console.log(type, id, '|', d.title, '\n  core:', d.core.map(r).join(' ; '), '\n  adv:', d.advanced.map(r).join(' ; '));
};
show('el', 'Host'); show('el', 'ServerHost'); show('el', 'Page.hosts'); show('el', 'Page.hosts.api'); show('rel', 'mount'); show('rel', 't-hosts'); show('rel', 's-ServerHost'); show('view', 'v-proof');
console.log(JSON.stringify(m.elements.find((e) => e.id === 'Page.hosts')), JSON.stringify(m.elements.find((e) => e.id === 'Page.hosts.api')));
console.log(JSON.stringify(m.relationships));
console.log(JSON.stringify(m.elements.find((e) => e.id === 'Host')));
console.log(lib.describe(m, m.elements.find((e) => e.id === 'Page.hosts.api')), '|', lib.describeRel(m, m.relationships.find((r) => r.id === 'mount')), '|', lib.describeView(m, m.views[0]));
// other fixtures
const b = modelOf(TEN.find((f) => f.endsWith('behavior-states.json')));
console.log(b.elements.map((e) => `${e.id}:${e.kind}:${e.parallel ?? ''}`).join(' '));
console.log(b.relationships.map((r) => `${r.id}:${r.from}>${r.to}:owner=${lib.RELATIONSHIPS[r.kind].owner(b, r, lib.idsOf(b))}`).join(' '));
const s = modelOf(TEN.find((f) => f.endsWith('sequence.json')));
console.log(s.relationships.filter((r) => r.kind === 'Message').map((r) => JSON.stringify(r)).join('\n'));
const g = modelOf(TEN.find((f) => f.endsWith('geometry.json')));
console.log(g.elements.filter((e) => e.kind === 'PartUsage').map((e) => JSON.stringify(e)).join('\n'));
console.log(g.views.map((v) => v.id + ' ' + Object.keys(v.layout)).join('\n'));
const ic = modelOf(TEN.find((f) => f.endsWith('interconnection.json')));
console.log(ic.relationships.filter((r) => !r.hidden).map((r) => JSON.stringify(r)).join('\n'));
console.log(ic.elements.filter((e) => e.kind === 'InterfaceDefinition' || e.kind === 'ItemDefinition').map((e) => e.id));
