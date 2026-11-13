import { lib, core, open, fx, EXAMPLE, toolsOf, selectionOf, inBox, onMid, ground, rectOf, plain } from './port.mjs';
const V = 'v-proof';
{ const s = open(EXAMPLE); const t = toolsOf(s); t.arm('Specialization'); t.click(inBox(s, V, 'Host')); t.click(inBox(s, V, 'StrongholdApp')); t.click(inBox(s, V, 'Page')); console.log('Host>Page', s.history.steps.at(-1)?.what, t.said, JSON.stringify(plain(lib.validate(s.model)))); }
{ const s = open(fx('interconnection.json')); const t = toolsOf(s); t.arm('InterfaceDefinition'); t.click(ground('v-ic', 1100, 600)); const v = lib.validate(s.model); console.log('validate type', typeof v[0], JSON.stringify(plain(v))); }
// palette test 5: right-click in Host at 184 by 100 -> place; and at the corner
{ const s = open(EXAMPLE); const t = toolsOf(s); const r = rectOf(s, V, 'Host'); t.choose('PartUsage', { view: V, type: 'el', id: 'Host', at: { x: r.x + 184, y: r.y + 100 }, add: false }); const id = selectionOf(s).items[0].id; console.log('p5', JSON.stringify(plain(s.model.views[0].layout[id])), 'Host now', JSON.stringify(rectOf(s, V, 'Host')), 'new', JSON.stringify(rectOf(s, V, id)), 'click at', r.x + 184, r.y + 100); }
// palette 10: port on Host from header
{ const s = open(EXAMPLE); const t = toolsOf(s); t.choose('PortUsage', inBox(s, V, 'Host')); console.log('p10', s.history.steps.at(-1).what, JSON.stringify(plain(s.model.views[0].layout[selectionOf(s).items[0].id]))); }
// commands 8: second click in Host at the same point lands in Host, not in part1?
{ const s = open(EXAMPLE); const t = toolsOf(s); const h = inBox(s, V, 'Host'); t.arm('PartUsage'); t.click(h); t.arm('PartUsage'); t.click(inBox(s, V, 'Host')); console.log('c8', plain(s.model.elements.slice(-2)).map((e) => e.name + '@' + e.owner).join(', ')); }
// test 21 first: place part in Host, then click the new part "the new part": where
{ const s = open(EXAMPLE); const t = toolsOf(s); t.arm('PartUsage'); t.click(inBox(s, V, 'Host')); const pid = selectionOf(s).items[0].id; console.log('new part rect', JSON.stringify(rectOf(s, V, pid))); t.arm('ConnectionUsage'); t.click(inBox(s, V, pid)); console.log('first rule on new part:', t.first === pid, t.said?.text); }
// arm with unknown kind
{ const s = open(EXAMPLE); const t = toolsOf(s); try { t.arm('NoSuchKind'); } catch (e) { console.log('throws', e.message); } }
// offers on ground point that is inside a box (hit ground but point inside Host)
{ const s = open(EXAMPLE); const t = toolsOf(s); console.log('ground hit inside Host:', JSON.stringify(t.offers(ground(V, 216, 500)).map((g) => g.map((x) => x.kind)))); }
// a Message / EventOccurrence: are they in any drawn row? no. Kinds in drawn rows with no TOOL_TITLE / BASE_NAME
for (const vk of ['GeneralView', 'InterconnectionView', 'ActionFlowView', 'StateTransitionView']) for (const k of lib.VIEW_KINDS[vk].tools) if (k !== '|') { if (!core.TOOL_TITLE[k]) console.log('no title', k); if (!core.TOOL_HINT[k]) console.log('no hint', k); if (lib.KINDS[k] && !core.BASE_NAME[k]) console.log('no base', k); }
// titles distinct?
{ const ts = Object.values(core.TOOL_TITLE); console.log('titles', ts.length, new Set(ts).size); }
// old page's words
