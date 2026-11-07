// The sequence view in the model library: event occurrences on lifelines, messages between them in time order,
// and a lifeline's events written as one then chain.
(function (root) {
  'use strict';
  const lib = root.SysMLModelLib;
  const {
    KINDS, VIEW_KINDS, FIELDS, addKinds, addRelationships, hasTrait, textName, commonOwner, acrossDefinitions,
    nameTakenBeside, quote, shown, featurePath, describe, describeRel, EXTRA, BODY, declare
  } = lib;

  addKinds({
    // Sequence: an event occurrence on a lifeline, the dot a message starts or ends on. A lifeline writes its events
    // itself, as one then chain in time order (the BODY writer below), so an event owned by a
    // lifeline has no head of its own; one owned by nothing (a general view may put it in the package) is written
    // plainly, since then is only legal inside a body.
    EventOccurrenceUsage: { keyword: 'event occurrence', label: 'event', contains: false, onBorder: false,
      size: [16, 16], shape: 'event', fields: ['name', 'doc'], traits: ['occurrence', 'successionEnd'],
      head: function (model, el, h) {
        const owner = el.owner !== undefined ? h.ids.get(el.owner) : null;
        return owner && hasTrait(owner.kind, 'lifeline') ? null : h.headOf(el);
      },
      // The core says so once something refers to it; an event nothing refers to yet still needs its name, since a
      // message can only start or end on it by name.
      check: function (model, el, ids, add) {
        if (textName(el) === '' && !model.relationships.some((r) => r.from === el.id || r.to === el.id)) {
          const owner = el.owner !== undefined ? ids.get(el.owner) : null;
          add(el.id, 'An event' + (owner ? ' in ' + shown(textName(owner)) : '') + ' has no name. Name it, so a message can start or end on it.');
        }
      } },
  });
  addRelationships({
    // Sequence: a message between two occurrences (an event, or a lifeline itself), declared in the innermost
    // element that holds both ends, its context: a part def, a part, or the package. It may carry a payload (item, an
    // item def) and has a place in time (order), the row the sequence renderer draws it at. The text declares it as a
    // FlowUsage, as it does a flow (message m from a to b;).
    Message: {
      metaclass: 'FlowUsage', label: 'message', fields: ['name', 'item', 'order', 'doc'], hideable: false,
      first: function (model, a, ids) {
        return hasTrait(a.kind, 'occurrence') ? null : 'A message starts at an event or a lifeline; ' + describe(model, a, ids) + ' is neither.';
      },
      ends: function (model, a, b, ids) {
        if (!hasTrait(a.kind, 'occurrence') || !hasTrait(b.kind, 'occurrence')) {
          return 'A message joins events and lifelines; ' + describe(model, hasTrait(a.kind, 'occurrence') ? b : a, ids) + ' is neither.';
        }
        return acrossDefinitions(model, 'A message', a, b, ids, 'Put both lifelines under one part def or part, or both in the package.');
      },
      // A named message is a feature of its context, so its name can't be that of a feature declared there or of
      // another named line declared there. The payload, when there is one, is an item def.
      check: function (model, rel, ids, add) {
        const mname = rel.name.trim();
        if (mname && nameTakenBeside(model, rel, ids, model.relationships)) add(rel.id, 'The message ' + mname + ' is named like something else beside it. Rename one.');
        if (rel.item && ids.has(rel.item) && ids.get(rel.item).kind !== 'ItemDefinition') {
          add(rel.id, 'The ' + describeRel(model, rel, ids) + ' carries ' + describe(model, ids.get(rel.item), ids) + ', which is not an item def.');
        }
      },
      owner: function (model, rel, ids) { return commonOwner(model, ids.get(rel.from), ids.get(rel.to), ids); },
      line: { route: 'straight', marker: 'm-message', cls: 'message', labelOffset: -8,
        label: function (rel, model, ids) {
          const item = rel.item ? ids.get(rel.item) : null;
          return [rel.name.trim(), item ? 'of ' + shown(textName(item)) : ''].filter(Boolean).join(' ');
        } },
      toSysML: function (model, rel, ownerId, depth, out, h) {
        const a = h.ids.get(rel.from);
        const b = h.ids.get(rel.to);
        const item = rel.item ? h.ids.get(rel.item) : null;
        const head = 'message ' + (rel.name.trim() ? quote(rel.name) + ' ' : '') + (item ? 'of ' + quote(textName(item)) + ' ' : '') +
          'from ' + featurePath(model, ownerId, a, h.ids) + ' to ' + featurePath(model, ownerId, b, h.ids);
        // A note on an unnamed message can't be about it by name, so it goes inside the message's body.
        const inside = rel.name.trim() ? [] : h.notesOn(rel.id);
        if (!rel.doc.trim() && !inside.length) { h.line(depth, head + ';'); return; }
        h.line(depth, head + ' {');
        if (rel.doc.trim()) h.comment(depth + 1, 'doc', rel.doc);
        inside.forEach((n) => h.note(depth + 1, n, null));
        h.line(depth, '}');
      },
    },
  });
  Object.assign(VIEW_KINDS, {
    SequenceView: { name: 'SequenceView', label: 'sequence view', qualified: 'StandardViewDefinitions::SequenceView', renderer: 'sequence',
      admits: ['PartUsage', 'EventOccurrenceUsage'], tools: ['PartUsage', 'EventOccurrenceUsage', '|', 'Message', 'SuccessionAsUsage'], fields: ['name', 'doc'], options: { spacing: 56 } },
  });
  Object.assign(FIELDS, {
    // Sequence: a message's place in time, a number; the messages with one come first, the lowest at the top.
    order: { type: 'number', label: 'order' },
  });

  // Sequence: a part is a lifeline, an occurrence a message may start or end on, and it may own event occurrences.
  KINDS.PartUsage.contains.push('EventOccurrenceUsage');
  KINDS.PartUsage.traits.push('lifeline', 'occurrence');
  // Sequence: the time order. The messages in order: those with a numeric order first, by it, then the rest as the
  // model has them, so a new message, with no order yet, lands last.
  function messagesInOrder(model) {
    const numbered = (r) => (typeof r.order === 'number' ? 0 : 1);
    return model.relationships.map((r, i) => ({ r: r, i: i })).filter((x) => x.r.kind === 'Message')
      .sort((a, b) => (numbered(a.r) - numbered(b.r)) || (numbered(a.r) === 0 ? a.r.order - b.r.order : 0) || (a.i - b.i))
      .map((x) => x.r);
  }
  // A lifeline's events in time order: an event a message starts or ends on takes its place from the first such
  // message's place in time, so the chain always agrees with the rows a sequence view draws; the others keep their
  // places among their siblings in model.elements, which the sequence view's place and drop set by height.
  function eventOrder(model, ownerId) {
    const events = model.elements.filter((e) => e.kind === 'EventOccurrenceUsage' && e.owner === ownerId);
    const messages = messagesInOrder(model);
    const keyOf = (e) => { const i = messages.findIndex((m) => m.from === e.id || m.to === e.id); return i < 0 ? null : i; };
    const keyed = events.map((e, i) => ({ e: e, i: i, key: keyOf(e) })).filter((x) => x.key !== null);
    const slots = keyed.map((x) => x.i);
    keyed.sort((a, b) => (a.key - b.key) || (a.i - b.i));
    const out = events.slice();
    slots.forEach((slot, j) => { out[slot] = keyed[j].e; });
    return out;
  }
  EXTRA.messagesInOrder = messagesInOrder;
  EXTRA.eventOrder = eventOrder;
  // A lifeline's events, right after its doc and before its ports and nested parts, as one then chain in time order:
  // the first has no then, so nothing written before the chain can become its source (critique b05). Each is declared
  // with its doc and what the body writers add (its code links).
  BODY.push(function (model, el, depth, h) {
    if (!hasTrait(el.kind, 'lifeline')) return;
    eventOrder(model, el.id).forEach((ev, i) => declare(model, ev, (i ? 'then ' : '') + h.headOf(ev), depth, h));
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
