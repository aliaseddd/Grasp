import { core, M, open, fx, place, draw, plain } from './port.mjs';
import { EXAMPLE } from '../wt-11/canvas/app/test/core.mjs';
let s = open(EXAMPLE);
let r = place(s, 'PartUsage', { view: 'v-proof', type: 'el', id: 'Host', at: { x: 40, y: 410 }, add: false }); console.log(JSON.stringify(plain(s.model.views[0].layout[r.made.id])), r.made.owner);
s = open(fx('interconnection.json'));
s.history.edit(() => { delete s.model.views.find(v => v.id === 'v-ic').layout.Controller; return 'Removed Controller from the view'; });
const d = draw(s, 'FeatureTyping', 'System.tank', 'Controller'); console.log(d.refused ?? s.history.steps.at(-1).what, s.model.views.filter(v => v.layout['System.tank'] && v.layout['Controller']).length);
s = open(fx('geometry.json')); console.log(M.childrenOf(s.model, null).map(M.textName).join(','));
s = open(fx('behavior-states.json')); console.log(M.an(M.VIEW_KINDS.StateTransitionView.label, true), M.KINDS.PartDefinition.label);
