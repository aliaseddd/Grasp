// Generated models for the scale tests: a model of any number of elements, shaped the way a model of a distributed
// system grows. Each service adds 26 elements and 25 lines in three views of their own:
//
//   - definitions, a general view: the service's part def, its store's part def, and its API's port def, each
//     specializing or using the few shared definitions (Service, Store, Storage, Request, Reply);
//   - deployment, an interconnection view: the site the service runs on, a part def holding the service and its
//     store as parts, their ports typed and redefined, a connection between them and a binding to the site's gateway;
//   - workflows, an action flow view: how the service answers a request, an action def with its parameters, a start,
//     a fork into two actions, a join, an answer, and done, with the successions between them.
//
// The model is saved in version 2 of the format, which the page upgrades as it does any saved model if the format
// moves on. It has no problems, and its export is text the pilot's validator accepts. The same count always gives the
// same model, ids, names and places included. The services are laid out in a grid in each view, and the three frames
// stand side by side.

const FORMAT = 'stronghold-canvas/2';

/** The ids of the three views. */
export const VIEWS = { definitions: 'v-definitions', deployment: 'v-deployment', workflows: 'v-workflows' };

// What every service builds on, shown in the definitions view.
const SHARED = [
  { id: 'Service', kind: 'PartDefinition', name: 'Service', abstract: true, doc: 'Anything that answers requests.' },
  { id: 'Store', kind: 'PartDefinition', name: 'Store', abstract: true, doc: 'Anything that keeps data for a service.' },
  { id: 'Storage', kind: 'PortDefinition', name: 'Storage', abstract: false, doc: 'Where a service reads and writes its data.' },
  { id: 'Request', kind: 'ItemDefinition', name: 'Request', abstract: false, doc: 'What a caller sends.' },
  { id: 'Reply', kind: 'ItemDefinition', name: 'Reply', abstract: false, doc: 'What a service sends back.' },
];
export const PER_SERVICE = 26;

// The size of one service's cell in each view's grid, in drawing units, and the grid's origin inside the frame.
const CELL = { definitions: [800, 280], deployment: [720, 300], workflows: [1080, 300] };
const ORIGIN = { x: 32, y: 72 };

/**
 * A model of exactly `count` elements (at least the 5 shared ones) in three views: as many whole services as fit,
 * then plain part defs in the definitions view for the rest. Returns the model, as a state file holds it.
 */
export function scaleModel(count) {
  if (!Number.isInteger(count) || count < SHARED.length) throw new RangeError(`a scale model has at least ${SHARED.length} elements, not ${count}`);
  const services = Math.floor((count - SHARED.length) / PER_SERVICE);
  const spares = count - SHARED.length - services * PER_SERVICE;
  const elements = [];
  const relationships = [];
  const layouts = { definitions: {}, deployment: {}, workflows: {} };
  const columns = Math.max(1, Math.ceil(Math.sqrt(services + spares / 3)));
  const cell = (view, i) => ({ x: ORIGIN.x + (i % columns) * CELL[view][0], y: ORIGIN.y + Math.floor(i / columns) * CELL[view][1] });

  const element = (view, el, place) => { elements.push(el); layouts[view][el.id] = place; return el; };
  const usage = (fields) => Object.assign({ multiplicity: '', doc: '' }, fields);
  const port = (fields) => usage(Object.assign({ kind: 'PortUsage', conjugated: false }, fields));
  const typed = (from, to) => relationships.push({ id: 't-' + from, kind: 'FeatureTyping', from, to, hidden: true });
  const action = (fields) => usage(Object.assign({ kind: 'ActionUsage', actionKind: 'plain', payload: '', target: '', role: '' }, fields));

  SHARED.forEach((el, i) => element('definitions', Object.assign({}, el), { x: ORIGIN.x + i * 240, y: 8, w: 220, h: 56 }));
  // The shared definitions sit above the grid, so the grid starts lower in the definitions view.
  const top = 80;

  for (let s = 1; s <= services; s++) {
    const at = cell('definitions', s - 1);
    const y = at.y + top;
    // definitions: the API with what goes in and out, the service and its store, specializing the shared ones.
    const api = 'Api' + s;
    element('definitions', { id: api, kind: 'PortDefinition', name: api, abstract: false, doc: 'What service ' + s + ' answers.' }, { x: at.x, y, w: 240, h: 196 });
    element('definitions', usage({ id: api + '.request', kind: 'ItemUsage', name: 'request', owner: api, direction: 'in' }), { x: 12, y: 60, w: 216, h: 52 });
    element('definitions', usage({ id: api + '.reply', kind: 'ItemUsage', name: 'reply', owner: api, direction: 'out' }), { x: 12, y: 124, w: 216, h: 52 });
    typed(api + '.request', 'Request');
    typed(api + '.reply', 'Reply');
    const service = 'Service' + s;
    element('definitions', { id: service, kind: 'PartDefinition', name: service, abstract: false, doc: 'Service ' + s + ': answers on its API and keeps its data in its store.' }, { x: at.x + 288, y, w: 200, h: 96 });
    element('definitions', port({ id: service + '.api', name: 'api', owner: service }), { side: 'left', at: 0.5 });
    element('definitions', port({ id: service + '.data', name: 'data', owner: service, conjugated: true }), { side: 'right', at: 0.5 });
    relationships.push({ id: 'g-' + service, kind: 'Specialization', from: service, to: 'Service' });
    typed(service + '.api', api);
    typed(service + '.data', 'Storage');
    const store = 'Store' + s;
    element('definitions', { id: store, kind: 'PartDefinition', name: store, abstract: false, doc: 'The data of service ' + s + '.' }, { x: at.x + 552, y, w: 200, h: 96 });
    element('definitions', port({ id: store + '.data', name: 'data', owner: store }), { side: 'left', at: 0.5 });
    relationships.push({ id: 'g-' + store, kind: 'Specialization', from: store, to: 'Store' });
    typed(store + '.data', 'Storage');

    // deployment: the site the service runs on, holding the service and its store, wired together.
    const d = cell('deployment', s - 1);
    const site = 'Site' + s;
    element('deployment', { id: site, kind: 'PartDefinition', name: site, abstract: false, doc: 'Where service ' + s + ' runs.' }, { x: d.x, y: d.y, w: 660, h: 240 });
    element('deployment', port({ id: site + '.gateway', name: 'gateway', owner: site }), { side: 'left', at: 0.5 });
    element('deployment', usage({ id: site + '.service', kind: 'PartUsage', name: 'service', owner: site, multiplicity: '1' }), { x: 72, y: 72, w: 200, h: 110 });
    element('deployment', port({ id: site + '.service.api', name: 'api', owner: site + '.service' }), { side: 'left', at: 0.5 });
    element('deployment', port({ id: site + '.service.data', name: 'data', owner: site + '.service', conjugated: true }), { side: 'right', at: 0.5 });
    element('deployment', usage({ id: site + '.store', kind: 'PartUsage', name: 'store', owner: site, multiplicity: '1..*' }), { x: 400, y: 72, w: 200, h: 110 });
    element('deployment', port({ id: site + '.store.data', name: 'data', owner: site + '.store' }), { side: 'left', at: 0.5 });
    typed(site + '.service', service);
    typed(site + '.service.api', api);
    typed(site + '.service.data', 'Storage');
    typed(site + '.store', store);
    typed(site + '.store.data', 'Storage');
    typed(site + '.gateway', api);
    relationships.push({ id: 'c-' + site, kind: 'ConnectionUsage', name: 'storage', from: site + '.service.data', to: site + '.store.data', doc: '' });
    relationships.push({ id: 'b-' + site, kind: 'BindingConnectorAsUsage', name: '', from: site + '.gateway', to: site + '.service.api', doc: '' });

    // workflows: how the service answers a request.
    const w = cell('workflows', s - 1);
    const handle = 'Handle' + s;
    element('workflows', { id: handle, kind: 'ActionDefinition', name: handle, abstract: false, doc: 'How service ' + s + ' answers a request.' }, { x: w.x, y: w.y, w: 1000, h: 220 });
    element('workflows', usage({ id: handle + '.request', kind: 'ParameterUsage', name: 'request', owner: handle, direction: 'in' }), { side: 'left', at: 0.5 });
    element('workflows', usage({ id: handle + '.reply', kind: 'ParameterUsage', name: 'reply', owner: handle, direction: 'out' }), { side: 'right', at: 0.5 });
    typed(handle + '.request', 'Request');
    typed(handle + '.reply', 'Reply');
    const node = (id, kind, name, place) => element('workflows', { id: handle + '.' + id, kind, name, owner: handle, doc: '' }, place);
    node('start', 'StartNode', '', { x: 36, y: 112, w: 16, h: 16 });
    element('workflows', action({ id: handle + '.receive', name: 'receive', owner: handle }), { x: 90, y: 88, w: 150, h: 64 });
    node('split', 'ForkNode', 'split', { x: 290, y: 116, w: 60, h: 8 });
    element('workflows', action({ id: handle + '.lookup', name: 'lookup', owner: handle }), { x: 400, y: 56, w: 150, h: 56 });
    element('workflows', action({ id: handle + '.audit', name: 'audit', owner: handle }), { x: 400, y: 136, w: 150, h: 56 });
    node('rejoin', 'JoinNode', 'rejoin', { x: 600, y: 116, w: 60, h: 8 });
    element('workflows', action({ id: handle + '.answer', name: 'answer', owner: handle }), { x: 710, y: 88, w: 150, h: 64 });
    node('done', 'DoneNode', '', { x: 920, y: 109, w: 22, h: 22 });
    [['start', 'receive'], ['receive', 'split'], ['split', 'lookup'], ['split', 'audit'], ['lookup', 'rejoin'], ['audit', 'rejoin'],
      ['rejoin', 'answer'], ['answer', 'done']].forEach(([from, to]) => {
      relationships.push({ id: 's-' + handle + '-' + from + '-' + to, kind: 'SuccessionAsUsage', from: handle + '.' + from, to: handle + '.' + to, name: '', guard: '', doc: '' });
    });
  }
  // The rest: plain part defs in the definitions view's grid, three to a cell, after the services.
  for (let k = 0; k < spares; k++) {
    const at = cell('definitions', services + Math.floor(k / 3));
    element('definitions', { id: 'Spare' + (k + 1), kind: 'PartDefinition', name: 'Spare' + (k + 1), abstract: false, doc: '' }, { x: at.x + (k % 3) * 264, y: at.y + top, w: 220, h: 72 });
  }

  // The three frames side by side, each as wide as its grid.
  const rows = Math.max(1, Math.ceil((services + Math.ceil(spares / 3)) / columns));
  const width = (view) => ORIGIN.x * 2 + columns * CELL[view][0];
  const views = [];
  let x = 0;
  [['GeneralView', 'definitions'], ['InterconnectionView', 'deployment'], ['ActionFlowView', 'workflows']].forEach(([kind, name]) => {
    views.push({ id: VIEWS[name], kind, name, doc: '', x, y: 0, options: {}, layout: layouts[name] });
    x += width(name) + 160;
  });
  return {
    format: FORMAT,
    revision: 'scale-' + count,
    package: { name: 'Enterprise', doc: 'A generated model of ' + services + ' services, for the scale tests (' + rows + ' rows of ' + columns + ').' },
    elements,
    relationships,
    views,
  };
}

/** A state file holding scaleModel(count), as Download state saves one and Import state reads it. */
export function scaleState(count) {
  return { model: scaleModel(count), notes: [], archive: [], changes: [] };
}

/** The id of the part def of the service in the middle of a model of `count` elements, drawn in the definitions view. */
export function middleService(count) {
  const services = Math.floor((count - SHARED.length) / PER_SERVICE);
  if (services < 1) throw new RangeError(`a model of ${count} elements has no service`);
  return 'Service' + Math.ceil(services / 2);
}
