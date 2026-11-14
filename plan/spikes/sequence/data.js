// The spike's two models. `fixture` is canvas/test/fixtures/sequence.json with what it lacks added: a message that
// comes back to its own lifeline (from the lifeline to an event on it: the library's normalize() drops a relationship
// whose two ends are one element), two events no message ends on on one lifeline and one on another, and two successions between events. `synthetic`
// is a view of 20 lifelines and 300 messages. Both are bundled into the page: a page opened from disk can fetch no
// file beside it.

import saved from '../../../canvas/test/fixtures/sequence.json';

export function fixture(M) {
  const model = JSON.parse(JSON.stringify(saved.model));
  const event = (id, name, owner) => ({ id, kind: 'EventOccurrenceUsage', name, owner, doc: '' });
  model.elements.push(
    event('Login.auth.checked', 'checked', 'Login.auth'),
    event('Login.auth.issued', 'issued', 'Login.auth'),
    event('Login.server.opened', 'opened', 'Login.server'),
    event('Login.server.audited', 'audited', 'Login.server'),
  );
  model.relationships.push(
    { id: 'm-session', kind: 'Message', name: 'openSession', item: '', order: 3.5, from: 'Login.server', to: 'Login.server.opened', doc: '' },
    { id: 's-issued', kind: 'SuccessionAsUsage', name: '', guard: '', from: 'Login.auth.checked', to: 'Login.auth.issued', doc: '' },
    { id: 's-audited', kind: 'SuccessionAsUsage', name: '', guard: '', from: 'Login.auth.issued', to: 'Login.server.audited', doc: '' },
  );
  const view = model.views[0];
  view.layout['Login.auth.checked'] = { x: 0, y: 250, w: 16, h: 16 };
  view.layout['Login.auth.issued'] = { x: 0, y: 310, w: 16, h: 16 };
  view.layout['Login.server.audited'] = { x: 0, y: 420, w: 16, h: 16 };
  view.layout['Login.server.opened'] = { x: 0, y: 300, w: 16, h: 16 };
  return {
    model: M.normalize(model),
    viewId: view.id,
    // What contract 7 gives a body: by id, how many problems and which notes' numbers; and the view's free notes.
    marks: {
      by: {
        'Login.server': { problems: 2, pins: [] },
        'Login.auth': { problems: 0, pins: [2] },
        'Login.client.loginSent': { problems: 1, pins: [] },
        'Login.auth.issued': { problems: 0, pins: [4] },
        'm-login': { problems: 0, pins: [1] },
        'm-check': { problems: 3, pins: [] },
      },
      free: [{ no: 3, x: 130, y: 220 }],
    },
  };
}

export function synthetic(M, lifelines = 20, messages = 300) {
  const elements = [{ id: 'Ctx', kind: 'PartDefinition', name: 'Ctx', abstract: false, doc: '' }];
  const relationships = [];
  const layout = {};
  for (let i = 0; i < lifelines; i++) {
    elements.push({ id: 'L' + i, kind: 'PartUsage', name: 'part' + i, owner: 'Ctx', multiplicity: '', doc: '' });
    layout['L' + i] = { x: i * 220, y: 0, w: 180, h: 60 };
  }
  let events = 0;
  const event = (owner) => {
    const id = owner + '.e' + events++;
    elements.push({ id, kind: 'EventOccurrenceUsage', name: 'e' + events, owner, doc: '' });
    layout[id] = { x: 0, y: 100, w: 16, h: 16 };
    return id;
  };
  for (let i = 0; i < messages; i++) {
    const a = (i * 7) % lifelines;
    const b = i % 10 === 9 ? a : (a + 1 + ((i * 3) % (lifelines - 1))) % lifelines;
    const from = i % 2 === 0 ? event('L' + a) : 'L' + a;
    const to = i % 3 === 0 || a === b ? event('L' + b) : 'L' + b;   // a message back to its own lifeline ends on an event
    relationships.push({ id: 'm' + i, kind: 'Message', name: 'msg' + i, item: '', order: i + 1, from, to, doc: '' });
  }
  const model = {
    format: saved.model.format, revision: saved.model.revision, package: { name: 'Synthetic', doc: '' },
    elements, relationships,
    views: [{ id: 'v', kind: 'SequenceView', name: 'big', doc: '', x: 0, y: 0, layout, options: { spacing: 56 } }],
  };
  return { model: M.normalize(model), viewId: 'v', marks: { by: {}, free: [] } };
}
