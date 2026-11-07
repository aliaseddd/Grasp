// The model: what the drawing holds, what is wrong with it, and how it reads as textual SysML v2. Pure functions,
// shared with export.mjs and save-state.mjs, which run this script in Node. The four tables at the top say what the
// canvas knows: the element kinds, the relationship kinds, the view kinds, and the fields. Each slice adds its rows
// in its own region of each table, reaches into other rows in the extensions region after the tables, and adds the
// functions it needs in the helpers region before validate.
(function (root) {
  'use strict';

  const FORMAT = 'stronghold-canvas/2';
  const VIEW_DEF = 'StandardViewDefinitions::GeneralView';

  // Element kinds. contains is the kinds an element may own (false: none); onBorder draws it on its owner's
  // border; definedBy is the definition kind a usage is typed by; size the default box; shape names the entry of
  // the page's SHAPES that draws it (rect, rounded, port; an unknown shape is drawn as a rect, or as a port on a
  // border); fields the panel's fields that apply, each a row of FIELDS below, which normalize keeps by their types;
  // traits the words the relationship rules may ask about with hasTrait (connectable, flowEnd, bindable, lifeline…).
  // A kind may also carry hooks for the export and the checks: head(model, el, h) returns the head of its
  // declaration, everything before the ' {' or ';' (h.headOf(el) is the generated one, to build on), or null for an
  // element the text doesn't declare (a start node), which is then left out with everything inside it; body(model,
  // el, depth, h) writes statements inside its body through h.line and h.comment, after the doc and before the
  // children; after(model, el, depth, h) writes statements right after the element, at its depth; writeOrder (a
  // number, 0 unless said) puts a kind's children before (lower) or after the others in a body; check(model, el,
  // ids, add) adds the problems validate doesn't know about; glyph(model, el) says which way a border item's glyph
  // points (in, out, inout, or null for none).
  const KINDS = {
    // Structure.
    PartDefinition: { keyword: 'part def', label: 'part def', definition: true, usage: false, contains: ['PartUsage', 'PortUsage'], onBorder: false, size: [220, 72], shape: 'rect', fields: ['name', 'abstract', 'doc'], traits: [] },
    PortDefinition: { keyword: 'port def', label: 'port def', definition: true, usage: false, contains: false, onBorder: false, size: [220, 72], shape: 'rect', fields: ['name', 'abstract', 'doc'], traits: [] },
    PartUsage: { keyword: 'part', label: 'part', definition: false, usage: true, contains: ['PartUsage', 'PortUsage'], onBorder: false, definedBy: 'PartDefinition', size: [180, 60], shape: 'rounded', fields: ['name', 'type', 'multiplicity', 'doc'], traits: ['connectable'] },
    PortUsage: { keyword: 'port', label: 'port', definition: false, usage: true, contains: false, onBorder: true, definedBy: 'PortDefinition', size: [16, 16], shape: 'port', fields: ['name', 'type', 'multiplicity', 'conjugated', 'doc'], traits: ['connectable'] },
    // Interconnection: items (what flows, and what a part holds) and interface definitions, whose ports are their ends.
    ItemDefinition: { keyword: 'item def', label: 'item def', definition: true, usage: false, contains: false, onBorder: false, size: [220, 72], shape: 'rect', fields: ['name', 'abstract', 'doc'], traits: [] },
    // An item's head carries its direction (in item x : T). On a port def it must have one: a port def may own only
    // ports and referential usages, as the validator says. Its shape, item, is the page's rounded box with the
    // direction inside the guillemets, «out item».
    ItemUsage: { keyword: 'item', label: 'item', definition: false, usage: true, contains: false, onBorder: false, definedBy: 'ItemDefinition', size: [160, 52], shape: 'item', fields: ['name', 'type', 'direction', 'multiplicity', 'doc'], traits: ['flowEnd', 'bindable', 'connectable'],
      head: function (model, el, h) { return (el.direction ? el.direction + ' ' : '') + h.headOf(el); },
      check: function (model, el, ids, add) {
        const owner = el.owner !== undefined ? ids.get(el.owner) : null;
        if (owner && owner.kind === 'PortDefinition' && !el.direction) add(el.id, describe(model, el, ids) + ' needs a direction: in, out, or inout. An item on a port def says which way it goes.');
      } },
    // An interface def's ports are its ends (end port a : P;), and it needs two of them.
    InterfaceDefinition: { keyword: 'interface def', label: 'interface def', definition: true, usage: false, contains: ['PortUsage'], onBorder: false, size: [220, 72], shape: 'rect', fields: ['name', 'abstract', 'doc'], traits: [],
      check: function (model, el, ids, add) {
        const ends = childrenOf(model, el.id).filter((c) => KINDS[c.kind].onBorder);
        if (ends.length < 2) add(el.id, describe(model, el, ids) + ' needs two ports on its border, its ends; it has ' + (ends.length ? 'one' : 'none') + '.');
      } },
    // Behavior: the action flow view's kinds (an action def, actions with their parameters on the border, the four
    // control nodes, and start and done) and the state view's (a state def, states, the initial node). Start, done
    // and the initial node have no name field: they stand for the start and done every action and state inherits,
    // and for a state's entry, so their heads are null and the text never declares them; a succession or transition
    // ending on one writes start or done, and a state's body writes the entry idiom for its initial node. The hooks
    // are the functions of the behavior helpers region, which hoist.
    ActionDefinition: { keyword: 'action def', label: 'action def', definition: true, usage: false, contains: ['ActionUsage', 'ParameterUsage', 'ForkNode', 'JoinNode', 'DecisionNode', 'MergeNode', 'StartNode', 'DoneNode'], onBorder: false, size: [220, 72], shape: 'rect', fields: ['name', 'abstract', 'doc'], traits: [] },
    ActionUsage: { keyword: 'action', label: 'action', definition: false, usage: true, contains: ['ActionUsage', 'ParameterUsage', 'ForkNode', 'JoinNode', 'DecisionNode', 'MergeNode', 'StartNode', 'DoneNode'], onBorder: false,
      definedBy: 'ActionDefinition', size: [180, 60], shape: 'action', fields: ['name', 'type', 'multiplicity', 'actionKind', 'payload', 'target', 'role', 'doc'], traits: ['successionEnd', 'transitionEnd'],
      head: actionHead, body: actionBody, check: checkAction },
    ParameterUsage: { keyword: 'item', label: 'parameter', definition: false, usage: true, contains: false, onBorder: true, definedBy: 'ItemDefinition', size: [16, 16], shape: 'param',
      fields: ['name', 'direction', 'type', 'multiplicity', 'doc'], traits: ['flowEnd', 'bindable'],
      head: parameterHead, check: checkParameter, glyph: function (model, el) { return el.direction || null; } },
    ForkNode: { keyword: 'fork', label: 'fork', definition: false, usage: true, contains: false, onBorder: false, size: [60, 8], shape: 'bar', fields: ['name', 'doc'], traits: ['successionEnd'], check: checkControlNode },
    JoinNode: { keyword: 'join', label: 'join', definition: false, usage: true, contains: false, onBorder: false, size: [60, 8], shape: 'bar', fields: ['name', 'doc'], traits: ['successionEnd'], check: checkControlNode },
    DecisionNode: { keyword: 'decide', label: 'decision', definition: false, usage: true, contains: false, onBorder: false, size: [40, 40], shape: 'diamond', fields: ['name', 'doc'], traits: ['successionEnd'], check: checkControlNode, after: decisionBranches },
    MergeNode: { keyword: 'merge', label: 'merge', definition: false, usage: true, contains: false, onBorder: false, size: [40, 40], shape: 'diamond', fields: ['name', 'doc'], traits: ['successionEnd'], check: checkControlNode },
    StartNode: { keyword: 'start', label: 'start', definition: false, usage: true, contains: false, onBorder: false, size: [16, 16], shape: 'dot', fields: [], traits: ['successionEnd', 'transitionEnd'], head: noHead, check: checkPseudoNode },
    DoneNode: { keyword: 'done', label: 'done', definition: false, usage: true, contains: false, onBorder: false, size: [22, 22], shape: 'bullseye', fields: [], traits: ['successionEnd', 'transitionEnd'], head: noHead, check: checkPseudoNode },
    StateDefinition: { keyword: 'state def', label: 'state def', definition: true, usage: false, contains: ['StateUsage', 'ActionUsage', 'InitialNode', 'DoneNode'], onBorder: false, size: [220, 72], shape: 'state', fields: ['name', 'abstract', 'parallel', 'doc'], traits: [],
      head: stateHead, body: stateBody, check: checkState },
    StateUsage: { keyword: 'state', label: 'state', definition: false, usage: true, contains: ['StateUsage', 'ActionUsage', 'InitialNode', 'DoneNode'], onBorder: false, definedBy: 'StateDefinition', size: [180, 60], shape: 'state',
      fields: ['name', 'type', 'multiplicity', 'parallel', 'doc'], traits: ['transitionEnd'], head: stateHead, body: stateBody, check: checkState },
    InitialNode: { keyword: 'entry', label: 'initial node', definition: false, usage: true, contains: false, onBorder: false, size: [28, 16], shape: 'entry', fields: [], traits: ['transitionEnd'], head: noHead, check: checkPseudoNode },
    // Sequence: an event occurrence on a lifeline, the dot a message starts or ends on. A lifeline writes its events
    // itself, as one then chain in time order (the BODY writer in the helpers region), so an event owned by a
    // lifeline has no head of its own; one owned by nothing (a general view may put it in the package) is written
    // plainly, since then is only legal inside a body.
    EventOccurrenceUsage: { keyword: 'event occurrence', label: 'event', definition: false, usage: true, contains: false, onBorder: false,
      size: [16, 16], shape: 'event', fields: ['name', 'doc'], traits: ['occurrence', 'successionEnd'],
      head: function (model, el, h) {
        const owner = el.owner !== undefined ? h.ids.get(el.owner) : null;
        return owner && hasTrait(owner.kind, 'lifeline') ? null : h.headOf(el);
      },
      // The core says so once something refers to it; an event nothing refers to yet still needs its name, since a
      // message can only start or end on it by name.
      check: function (model, el, ids, add) {
        if (!el.name.trim() && !model.relationships.some((r) => r.from === el.id || r.to === el.id)) {
          const owner = el.owner !== undefined ? ids.get(el.owner) : null;
          add(el.id, 'An event' + (owner ? ' in ' + shown(owner.name) : '') + ' has no name. Name it, so a message can start or end on it.');
        }
      } },
  };

  // Relationship kinds. fields are the panel's fields that apply (rows of FIELDS), which normalize keeps by their
  // types; hideable lets the line be left undrawn. first(model, a, ids) says what rules out a as the first end and
  // ends(model, a, b, ids) what rules out the pair: a sentence, or null. The palette and validate both ask them, so
  // each rule is stated once; check(model, rel, ids, add), when present, adds the problems that need more than the
  // pair. owner(model, rel, ids) is the element whose body declares the relationship (null: the package). line says
  // how the graph renderer draws it: the route (a key of the page's ROUTES: straight or elbow), the marker at the end
  // and markerStart at the start (keys of the page's MARKERS), a class, a label (label(rel, model, ids), a string or
  // null), and labelOffset, how far below the line's middle the label sits (30 unless said; negative is above).
  // toSysML(model, rel, ownerId,
  // depth, out, h) writes it as a statement in that body; it is null when the relationship is written in the head
  // of its from element instead (:> for a specialization, : for a typing).
  const RELATIONSHIPS = {
    // Structure.
    Specialization: {
      label: 'specializes', fields: [], hideable: false,
      first: function () { return null; },
      ends: function (model, a, b, ids) {
        if (a.kind !== b.kind) return describe(model, a, ids) + ' can only specialize another ' + KINDS[a.kind].label + '.';
        if (KINDS[a.kind].usage && a.owner !== b.owner) return describe(model, a, ids) + ' and ' + describe(model, b, ids) + ' must sit in the same box for one to specialize the other.';
        if (specializes(model, b, a)) return 'Specializing ' + describe(model, b, ids) + ' would go round in a circle: it already specializes ' + describe(model, a, ids) + '.';
        return null;
      },
      owner: function () { return null; },
      line: { route: 'elbow', marker: 'm-general', cls: 'specialization', label: null },
      toSysML: null,
    },
    FeatureTyping: {
      label: 'defined by', fields: [], hideable: true,
      // The first end is a usage of a kind that has a definition kind (definedBy): a definition is defined by nothing,
      // and so is a usage of a kind without one (a fork, a start node, an event).
      first: function (model, a, ids) {
        const kind = KINDS[a.kind];
        if (!kind.usage) return 'Only a usage is defined by something; ' + describe(model, a, ids) + ' is a definition.';
        if (!kind.definedBy) return an(kind.label, true) + ' isn\'t defined by anything; a ' + definable() + ' is.';
        return null;
      },
      ends: function (model, a, b, ids) {
        const problem = RELATIONSHIPS.FeatureTyping.first(model, a, ids);
        if (problem) return problem;
        if (KINDS[a.kind].definedBy !== b.kind) {
          // The definition kind may be one another slice brings; when it isn't in KINDS, its name has to do.
          const def = KINDS[a.kind].definedBy;
          return describe(model, a, ids) + ' can only be defined by ' + an(KINDS[def] ? KINDS[def].label : def) + '.';
        }
        return null;
      },
      // One definition per usage: the first typing of a usage stands, and every later one is the problem.
      check: function (model, rel, ids, add) {
        const first = model.relationships.find((r) => r.kind === 'FeatureTyping' && r.from === rel.from && ids.has(r.to));
        if (first !== rel) add(rel.id, describe(model, ids.get(rel.from), ids) + ' is defined by more than one definition.');
      },
      owner: function () { return null; },
      line: { route: 'elbow', marker: 'm-defined', cls: 'typing', label: null },
      toSysML: null,
    },
    ConnectionUsage: {
      label: 'connection', fields: ['name', 'doc'], hideable: false,
      // An end is a usage with the connectable trait (a part, a port, an item): an action or a state in the same body
      // is no connector end, and the pilot refuses connect a1 to a2 there.
      first: function (model, a, ids) {
        return hasTrait(a.kind, 'connectable') ? null : 'A connection joins two parts, two ports or two items; ' + describe(model, a, ids) + ' is none of those.';
      },
      ends: function (model, a, b, ids) {
        const problem = RELATIONSHIPS.ConnectionUsage.first(model, a, ids) || RELATIONSHIPS.ConnectionUsage.first(model, b, ids);
        if (problem) return problem;
        if (a.kind !== b.kind) return 'A connection joins two parts, two ports or two items.';
        return acrossDefinitions(model, 'A connection', a, b, ids);
      },
      // A named connection is a feature of the element it is declared in, so its name can't be that of a feature
      // declared there, or of a connection declared there before it.
      check: function (model, rel, ids, add) {
        const cname = rel.name.trim();
        if (!cname) return;
        const before = model.relationships.slice(0, model.relationships.indexOf(rel));
        if (nameTakenBeside(model, rel, ids, before.filter((r) => r.kind === 'ConnectionUsage'))) add(rel.id, 'The connection ' + cname + ' is named like something else beside it. Rename one.');
      },
      owner: function (model, rel, ids) { return commonOwner(model, ids.get(rel.from), ids.get(rel.to), ids); },
      line: { route: 'straight', marker: null, cls: 'connection', label: function (rel) { return rel.name.trim(); } },
      toSysML: function (model, rel, ownerId, depth, out, h) {
        const a = h.ids.get(rel.from);
        const b = h.ids.get(rel.to);
        const head = (rel.name.trim() ? 'connection ' + quote(rel.name) + ' ' : '') +
          'connect ' + featurePath(model, ownerId, a, h.ids) + ' to ' + featurePath(model, ownerId, b, h.ids);
        // A note on an unnamed connection can't be about it by name, so it goes inside the connection's body.
        const inside = rel.name.trim() ? [] : h.notesOn(rel.id);
        if (!rel.doc.trim() && !inside.length) { h.line(depth, head + ';'); return; }
        h.line(depth, head + ' {');
        if (rel.doc.trim()) h.comment(depth + 1, 'doc', rel.doc);
        inside.forEach((n) => h.note(depth + 1, n, null));
        h.line(depth, '}');
      },
    },
    // Interconnection: an interface between two ports, typed by an interface def whose ends they match; a flow of an
    // item from one port or item to another; a binding of two ports or items that are one thing. Each is declared in
    // the innermost element that holds both ends, as a connection is, and may carry a doc. The rules on the ends and
    // the written ends are the helpers in the interconnection region below (definitionOf, flowEnd, portItems…).
    InterfaceUsage: {
      label: 'interface', fields: ['name', 'interfaceDef', 'doc'], hideable: false,
      first: function (model, a, ids) {
        return hasTrait(a.kind, 'interfaceEnd') ? null : 'An interface joins two ports; ' + describe(model, a, ids) + ' is ' + an(KINDS[a.kind].label) + '.';
      },
      ends: function (model, a, b, ids) {
        if (!hasTrait(a.kind, 'interfaceEnd') || !hasTrait(b.kind, 'interfaceEnd')) return 'An interface joins two ports.';
        const o = commonOwner(model, a, b, ids);
        if (o !== null && ids.get(o).kind === 'InterfaceDefinition') return 'An interface joins the ports of parts; ' + describe(model, a, ids) + ' and ' + describe(model, b, ids) + ' are the ends of an interface def.';
        return acrossDefinitions(model, 'An interface', a, b, ids);
      },
      // The def an interface is typed by must be an interface def (the panel offers only those; a model written by
      // hand may say otherwise, and the validator refuses it), and its ends must be the ports'.
      check: function (model, rel, ids, add) {
        connectorNameClash(model, rel, ids, add);
        const def = rel.interfaceDef ? ids.get(rel.interfaceDef) : null;
        if (def && def.kind !== 'InterfaceDefinition') add(rel.id, 'The ' + describeRel(model, rel, ids) + ' is typed by ' + describe(model, def, ids) + ', which isn\'t an interface def.');
        const problem = interfaceEndsProblem(model, rel, ids);
        if (problem) add(rel.id, problem);
      },
      owner: function (model, rel, ids) { return commonOwner(model, ids.get(rel.from), ids.get(rel.to), ids); },
      line: { route: 'straight', marker: null, cls: 'interface',
        label: function (rel, model, ids) {
          const def = model && ids && rel.interfaceDef ? ids.get(rel.interfaceDef) : null;
          return '«interface»' + (rel.name.trim() ? ' ' + rel.name.trim() : '') + (def ? ' : ' + shown(def.name) : '');
        } },
      toSysML: function (model, rel, ownerId, depth, out, h) {
        const def = rel.interfaceDef ? h.ids.get(rel.interfaceDef) : null;
        const head = 'interface ' + (rel.name.trim() ? quote(rel.name) + ' ' : '') + (def ? ': ' + quote(def.name) + ' ' : '') +
          'connect ' + featurePath(model, ownerId, h.ids.get(rel.from), h.ids) + ' to ' + featurePath(model, ownerId, h.ids.get(rel.to), h.ids);
        connectorStatement(rel, head, depth, h);
      },
    },
    FlowConnectionUsage: {
      label: 'flow', fields: ['name', 'item', 'doc'], hideable: false,
      first: function (model, a, ids) {
        return hasTrait(a.kind, 'flowEnd') ? null : 'A flow runs from a port or an item; ' + describe(model, a, ids) + ' is ' + an(KINDS[a.kind].label) + '.';
      },
      ends: function (model, a, b, ids) {
        if (!hasTrait(a.kind, 'flowEnd') || !hasTrait(b.kind, 'flowEnd')) return 'A flow joins two ports or items.';
        const o = commonOwner(model, a, b, ids);
        if (o !== null && ids.get(o).kind === 'PortDefinition') return 'A flow can\'t run inside ' + describe(model, ids.get(o), ids) + '; it runs between the ports of parts.';
        return bareFlowEnd(model, a, b, ids) || acrossDefinitions(model, 'A flow', a, b, ids);
      },
      // What flows is an item def (the panel offers only those; a model written by hand may say otherwise); with one,
      // the ends are checked against it.
      check: function (model, rel, ids, add) {
        connectorNameClash(model, rel, ids, add);
        const item = rel.item ? ids.get(rel.item) : null;
        if (item && item.kind !== 'ItemDefinition') { add(rel.id, 'The ' + describeRel(model, rel, ids) + ' carries ' + describe(model, item, ids) + ', which isn\'t an item def. Pick an item def in the panel.'); return; }
        flowProblems(model, rel, ids).forEach((p) => add(rel.id, p));
      },
      owner: function (model, rel, ids) { return commonOwner(model, ids.get(rel.from), ids.get(rel.to), ids); },
      line: { route: 'straight', marker: 'm-flow', cls: 'flow',
        label: function (rel, model, ids) {
          const item = model && ids && rel.item ? ids.get(rel.item) : null;
          return (rel.name.trim() + (item ? ' of ' + shown(item.name) : '')).trim();
        } },
      toSysML: function (model, rel, ownerId, depth, out, h) {
        const item = rel.item ? h.ids.get(rel.item) : null;
        const head = 'flow ' + (rel.name.trim() ? quote(rel.name) + ' ' : '') + (item ? 'of ' + quote(item.name) + ' ' : '') +
          'from ' + flowEndPath(model, rel, 'from', ownerId, h.ids) + ' to ' + flowEndPath(model, rel, 'to', ownerId, h.ids);
        connectorStatement(rel, head, depth, h);
      },
    },
    BindingConnectorAsUsage: {
      label: 'binding', fields: ['name', 'doc'], hideable: false,
      first: function (model, a, ids) {
        return hasTrait(a.kind, 'bindable') ? null : 'A binding joins two ports or two items; ' + describe(model, a, ids) + ' is ' + an(KINDS[a.kind].label) + '.';
      },
      ends: function (model, a, b, ids) {
        if (!hasTrait(a.kind, 'bindable') || !hasTrait(b.kind, 'bindable')) return 'A binding joins two ports or two items.';
        // Bound things are one thing, so they are of one definition (a port def and its conjugate count as one).
        const ta = definitionOf(model, a, ids);
        const tb = definitionOf(model, b, ids);
        if (ta && tb && ta.def.id !== tb.def.id) return 'A binding joins two things of one definition; ' + describe(model, a, ids) + ' is defined by ' + shown(ta.def.name) + ' and ' + describe(model, b, ids) + ' by ' + shown(tb.def.name) + '.';
        if (!!ta !== !!tb) return 'A binding joins two things of one definition; ' + describe(model, ta ? b : a, ids) + ' is defined by nothing yet.';
        if (!ta && a.kind !== b.kind) return 'A binding joins two ports or two items, not ' + an(KINDS[a.kind].label) + ' and ' + an(KINDS[b.kind].label) + '.';
        return acrossDefinitions(model, 'A binding', a, b, ids);
      },
      check: function (model, rel, ids, add) { connectorNameClash(model, rel, ids, add); },
      owner: function (model, rel, ids) { return commonOwner(model, ids.get(rel.from), ids.get(rel.to), ids); },
      line: { route: 'straight', marker: null, cls: 'binding', labelOffset: -5, label: function () { return '='; } },
      toSysML: function (model, rel, ownerId, depth, out, h) {
        const head = (rel.name.trim() ? 'binding ' + quote(rel.name) + ' ' : '') +
          'bind ' + featurePath(model, ownerId, h.ids.get(rel.from), h.ids) + ' = ' + featurePath(model, ownerId, h.ids.get(rel.to), h.ids);
        connectorStatement(rel, head, depth, h);
      },
    },
    // Behavior: a succession between actions and control nodes (dashed, an open arrowhead, [guard] or else as the
    // label) and a transition between states (solid, the same head, trigger [guard] / effect as the label). Both are
    // written in the innermost body that holds their two ends; the rules and the writers are in the behavior helpers.
    SuccessionAsUsage: {
      label: 'succession', fields: ['name', 'guard', 'doc'], hideable: false,
      first: successionFirst, ends: successionEnds, check: checkSuccession,
      owner: function (model, rel, ids) { return commonOwner(model, ids.get(rel.from), ids.get(rel.to), ids); },
      line: { route: 'elbow', marker: 'm-open', cls: 'succession', label: successionLabel, labelOffset: -8 },
      toSysML: writeSuccession,
    },
    TransitionUsage: {
      label: 'transition', fields: ['name', 'trigger', 'guard', 'effect', 'doc'], hideable: false,
      first: transitionFirst, ends: transitionEnds, check: checkTransition,
      owner: function (model, rel, ids) { return commonOwner(model, ids.get(rel.from), ids.get(rel.to), ids); },
      line: { route: 'straight', marker: 'm-open', cls: 'transition', label: transitionLabel, labelOffset: -8 },
      toSysML: writeTransition,
    },
    // Sequence: a message between two occurrences (an event, or a lifeline itself), declared in the innermost
    // element that holds both ends, its context: a part def, a part, or the package. It may carry a payload (item, an
    // item def) and has a place in time (order), the row the sequence renderer draws it at.
    Message: {
      label: 'message', fields: ['name', 'item', 'order', 'doc'], hideable: false,
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
          return [rel.name.trim(), item ? 'of ' + shown(item.name) : ''].filter(Boolean).join(' ');
        } },
      toSysML: function (model, rel, ownerId, depth, out, h) {
        const a = h.ids.get(rel.from);
        const b = h.ids.get(rel.to);
        const item = rel.item ? h.ids.get(rel.item) : null;
        const head = 'message ' + (rel.name.trim() ? quote(rel.name) + ' ' : '') + (item ? 'of ' + quote(item.name) + ' ' : '') +
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
  };

  // View kinds. renderer names the page's renderer for the kind; admits the element kinds a view of the kind may
  // show (null: every kind); tools the palette, element and relationship kinds with '|' between groups; options
  // the defaults of the view's own options, which normalize keeps the keys of; check(model, view, ids, add), when
  // present, adds the view's own problems; exposes(model, view, h), when present, returns the statements of the
  // view's body in the export (expose …;, render …;) in place of those the core makes from the view's layout
  // (h.exposesOf(view) gives those, to build on). In this slice only the general view admits and draws anything; the other
  // rows are here so a view of each kind can sit on the plane, each in the region of the slice that fills it in.
  const VIEW_KINDS = {
    GeneralView: { name: 'GeneralView', label: 'general view', qualified: 'StandardViewDefinitions::GeneralView', renderer: 'graph',
      admits: null, tools: ['PartDefinition', 'PortDefinition', 'PartUsage', 'PortUsage', '|', 'Specialization', 'FeatureTyping', 'ConnectionUsage'], options: {} },
    // The interconnection view: parts and part defs as nodes, their ports and items, the item, port and interface
    // defs beside them, and the connectors between the ports and items. A port def is admitted too, since the items
    // that flow are drawn in it.
    InterconnectionView: { name: 'InterconnectionView', label: 'interconnection view', qualified: 'StandardViewDefinitions::InterconnectionView', renderer: 'graph',
      admits: ['PartDefinition', 'PortDefinition', 'PartUsage', 'PortUsage', 'ItemDefinition', 'ItemUsage', 'InterfaceDefinition'],
      tools: ['PartDefinition', 'PortDefinition', 'PartUsage', 'PortUsage', 'ItemDefinition', 'ItemUsage', 'InterfaceDefinition', '|', 'ConnectionUsage', 'InterfaceUsage', 'FlowConnectionUsage', 'BindingConnectorAsUsage', 'FeatureTyping'],
      options: {} },
    ActionFlowView: { name: 'ActionFlowView', label: 'action flow view', qualified: 'StandardViewDefinitions::ActionFlowView', renderer: 'graph',
      admits: ['ActionDefinition', 'ActionUsage', 'ParameterUsage', 'ForkNode', 'JoinNode', 'DecisionNode', 'MergeNode', 'StartNode', 'DoneNode'],
      tools: ['ActionDefinition', 'ActionUsage', 'ParameterUsage', '|', 'ForkNode', 'JoinNode', 'DecisionNode', 'MergeNode', 'StartNode', 'DoneNode', '|', 'SuccessionAsUsage', 'FlowConnectionUsage', 'BindingConnectorAsUsage', 'FeatureTyping'], options: {} },
    StateTransitionView: { name: 'StateTransitionView', label: 'state transition view', qualified: 'StandardViewDefinitions::StateTransitionView', renderer: 'graph',
      admits: ['StateDefinition', 'StateUsage', 'InitialNode', 'ActionUsage', 'DoneNode'],
      tools: ['StateDefinition', 'StateUsage', 'InitialNode', 'ActionUsage', 'DoneNode', '|', 'TransitionUsage', 'FeatureTyping'], options: {} },
    SequenceView: { name: 'SequenceView', label: 'sequence view', qualified: 'StandardViewDefinitions::SequenceView', renderer: 'sequence',
      admits: ['PartUsage', 'EventOccurrenceUsage'], tools: ['PartUsage', 'EventOccurrenceUsage', '|', 'Message', 'SuccessionAsUsage'], options: { spacing: 56 } },
    // A plan of parts (and items, once that kind is in) drawn to scale: scale is the pixels per unit of the view's unit.
    GeometryView: { name: 'GeometryView', label: 'geometry view', qualified: 'StandardViewDefinitions::GeometryView', renderer: 'geometry',
      admits: ['PartUsage', 'ItemUsage'], tools: ['PartUsage', 'ItemUsage'], options: { scale: 40, unit: 'm' } },
    // Any element may be a row, and nothing is drawn by hand: the rows come from the view's Show list and the panel's
    // Show all buttons. The options: mode (table, a row per element; matrix, the elements against each other), the
    // table's columns (keys of GRID_COLUMNS, in its order), and sort (a column, with a leading - for descending; null
    // for the model's order). The layout's keys are the rows, so there is no rows option.
    GridView: { name: 'GridView', label: 'grid view', qualified: 'StandardViewDefinitions::GridView', renderer: 'grid',
      admits: null, tools: [], options: { mode: 'table', columns: ['kind', 'name', 'type', 'multiplicity', 'owner', 'doc'], sort: null },
      // The view's body in the text: the core's expose lines, then, for a table, the library's tabular rendering (one
      // row per exposed element). A matrix has no library rendering, so it exposes and says nothing more. Validated
      // in every form a grid can take (a view with exposes and the render clause, with the render clause alone, with a
      // doc, as a matrix with exposes alone, and empty) in scratchpad/slices/grid/grid-01-forms.sysml.
      exposes: function (model, view, h) {
        const lines = h.exposesOf(view);
        if (gridOptions(view).mode === 'table') lines.push('render Views::asElementTable;');
        return lines;
      } },
    // A browser view shows the whole model as a tree, so it admits every kind and places nothing by hand: roots is null
    // for the whole package (every element at the top) or the ids of the elements whose subtrees the tree shows, and
    // collapsed the ids whose insides are folded away.
    BrowserView: { name: 'BrowserView', label: 'browser view', qualified: 'StandardViewDefinitions::BrowserView', renderer: 'browser',
      admits: null, tools: [], options: { roots: null, collapsed: [] },
      // A root is exposed by its qualified name, so one without a full name can't be, and the text leaves it out.
      check: function (model, view, ids, add) {
        (browserRoots(model, view, ids) || []).forEach((root) => {
          if (!nameable(model, root, ids)) {
            add(view.id, 'The ' + describeView(model, view) + ' can\'t expose its root ' + describe(model, root, ids) + ' by name: ' + (hasName(root.kind) ? 'it, or what it is in, has no name. Name it.' : 'the text has no name for it.'));
          }
        });
      },
      // The view's body in the text: the whole package, recursively, or each root with everything inside it, then the
      // tree rendering. Validated in understand/views/02-expose-forms.sysml and 04-render-clauses.sysml, and in
      // slices/browser/b01-forms.sysml (quoted, nested and leaf roots; no root at all).
      exposes: function (model, view, h) {
        const roots = browserRoots(model, view, h.ids);
        const lines = roots === null
          ? ['expose ' + quote(model.package.name) + '::*::**;']
          : roots.filter((e) => nameable(model, e, h.ids)).map((e) => 'expose ' + qualified(model, e, h.ids) + '::**;');
        lines.push('render Views::asTreeDiagram;');
        return lines;
      } },
  };

  // The fields the panel can show and normalize keeps, by name, for elements (KINDS[kind].fields) and relationships
  // (RELATIONSHIPS[kind].fields). type says what the value is: string or text (a string; trim takes the ends off),
  // bool (true or false), enum (one of values, else the first), number (a finite number, else ''), ref (the id of an
  // element, else ''; options(model, item) returns the elements the field may name). label is the field's name in
  // sentences. views, when present, lists the view kinds the field shows in (absent: every kind). core marks the
  // fields the page handles itself; it reads and writes the others through their rows, each with a <label id="l-
  // <field>"> holding an <input id="f-<field>"> in the panel. read(raw), when present, replaces the reading by type
  // (for a value that is none of these, a list say), and fresh(), when present, gives a new element's or
  // relationship's starting value. The type field is not a value but the page's FeatureTyping relationship, so
  // stored: false keeps it out of the model.
  const FIELDS = {
    name: { type: 'string', label: 'name', core: true },
    abstract: { type: 'bool', label: 'abstract', core: true },
    type: { type: 'ref', label: 'definition', core: true, stored: false, options: function (model, item) { return model.elements.filter((e) => e.kind === KINDS[item.kind].definedBy); } },
    multiplicity: { type: 'string', label: 'multiplicity', core: true, trim: true },
    conjugated: { type: 'bool', label: 'conjugated', core: true },
    doc: { type: 'text', label: 'doc', core: true },
    // Two rows several slices share, stated once: which way a feature goes (none, in, out, inout), and the item a flow
    // or a message carries, an ItemDefinition (a kind no core row has yet, so the select offers nothing until a slice
    // brings it). No core kind lists them, so the panel shows neither until a slice's kind does.
    direction: { type: 'enum', label: 'direction', values: ['', 'in', 'out', 'inout'] },
    item: { type: 'ref', label: 'item', options: function (model) { return model.elements.filter((e) => e.kind === 'ItemDefinition'); } },
    // The interface def an interface is typed by.
    interfaceDef: { type: 'ref', label: 'interface def', options: function (model) { return model.elements.filter((e) => e.kind === 'InterfaceDefinition'); } },
    // Behavior: what an action does (plain, send, accept) with its payload and its target, its role under a state
    // (entry, do, exit), a succession's guard (the text of a Boolean expression, or else), a transition's trigger,
    // guard and effect (the texts after accept, if and do), and whether a state runs its regions in parallel.
    actionKind: { type: 'enum', label: 'kind', values: ['plain', 'send', 'accept'] },
    payload: { type: 'string', label: 'payload', trim: true },
    target: { type: 'string', label: 'target', trim: true },
    role: { type: 'enum', label: 'role', values: ['', 'entry', 'do', 'exit'] },
    guard: { type: 'string', label: 'guard', trim: true },
    trigger: { type: 'string', label: 'trigger', trim: true },
    effect: { type: 'string', label: 'effect', trim: true },
    parallel: { type: 'bool', label: 'parallel' },
    // Sequence: a message's place in time, a number; the messages with one come first, the lowest at the top.
    order: { type: 'number', label: 'order' },
    // The spatial fields of a part or item drawn to scale in a geometry view: its shape (a ShapeItems kind whose
    // dimensions are plain attributes; Box is RectangularCuboid), the dimensions that shape has, the position of the
    // shape's origin in its owner's frame, all numbers in the element's own unit. The panel shows them only while the
    // selection is drawn in a geometry view.
    shape: { type: 'enum', label: 'shape', values: ['', 'Box', 'Rectangle', 'CircularCylinder', 'Sphere', 'CircularCone'], views: ['GeometryView'] },
    length: { type: 'number', label: 'length', views: ['GeometryView'] },
    width: { type: 'number', label: 'width', views: ['GeometryView'] },
    height: { type: 'number', label: 'height', views: ['GeometryView'] },
    radius: { type: 'number', label: 'radius', views: ['GeometryView'] },
    posX: { type: 'number', label: 'x position', views: ['GeometryView'] },
    posY: { type: 'number', label: 'y position', views: ['GeometryView'] },
    posZ: { type: 'number', label: 'z position', views: ['GeometryView'] },
    unit: { type: 'enum', label: 'unit', values: ['m', 'mm', 'cm', 'km', 'ft', 'in'], views: ['GeometryView'] },
    // The code links an element carries: a list of { path, language, text }, read by tidyCode. The annotations slice's
    // own section of the panel edits them (there is no #f-code input, so renderExtraFields leaves the field alone).
    code: { type: 'list', label: 'code links', read: tidyCode, fresh: function () { return []; } },
  };

  // Extensions: what a slice adds to another slice's rows, now that every table is built (KINDS.PartUsage.contains
  // .push('ItemUsage'), KINDS.PartUsage.fields.push('shape'), KINDS.ParameterUsage.traits.push('flowEnd')…).
  // Interconnection: items live in part defs, parts and port defs; a port is an interface's, a flow's and a binding's
  // end; a port on an interface def is written as its end; a port's glyph follows the directed items of its port def;
  // and a connection can't be declared inside a port def, whose owned usages must be referential. Each hook on a core
  // row wraps what is there.
  KINDS.PartDefinition.contains.push('ItemUsage');
  KINDS.PartUsage.contains.push('ItemUsage');
  (KINDS.PortDefinition.contains || (KINDS.PortDefinition.contains = [])).push('ItemUsage');
  KINDS.PortUsage.traits.push('interfaceEnd', 'flowEnd', 'bindable');
  (function () {
    const prevHead = KINDS.PortUsage.head;
    KINDS.PortUsage.head = function (model, el, h) {
      const base = prevHead ? prevHead(model, el, h) : h.headOf(el);
      if (base === null) return null;
      const owner = el.owner !== undefined ? h.ids.get(el.owner) : null;
      return owner && owner.kind === 'InterfaceDefinition' ? 'end ' + base : base;
    };
    const prevGlyph = KINDS.PortUsage.glyph;
    KINDS.PortUsage.glyph = function (model, el) {
      const way = portWay(model, el);
      return way !== null || !prevGlyph ? way : prevGlyph(model, el);
    };
    const prevEnds = RELATIONSHIPS.ConnectionUsage.ends;
    RELATIONSHIPS.ConnectionUsage.ends = function (model, a, b, ids) {
      const problem = prevEnds(model, a, b, ids);
      if (problem) return problem;
      const o = commonOwner(model, a, b, ids);
      return o !== null && ids.get(o).kind === 'PortDefinition' ? 'A connection can\'t be declared inside ' + describe(model, ids.get(o), ids) + '; connect the ports of parts instead.' : null;
    };
  })();
  // Behavior: a part def and a part hold actions and states too (actions in parts: afv10, b06; states: stv-12).
  KINDS.PartDefinition.contains.push('ActionUsage', 'StateUsage');
  KINDS.PartUsage.contains.push('ActionUsage', 'StateUsage');
  // Sequence: a part is a lifeline, an occurrence a message may start or end on, and it may own event occurrences.
  KINDS.PartUsage.contains.push('EventOccurrenceUsage');
  KINDS.PartUsage.traits.push('lifeline', 'occurrence');
  // A part, and an item once that kind is in, can be drawn to scale: the spatial trait and the spatial fields.
  ['PartUsage', 'ItemUsage'].forEach((k) => {
    if (!KINDS[k]) return;
    KINDS[k].traits.push('spatial');
    KINDS[k].fields.push('shape', 'length', 'width', 'height', 'radius', 'posX', 'posY', 'posZ', 'unit');
  });
  // Every kind the text declares may carry code links, so the panel's code section and the export's textual
  // representations apply to every such element. A start, done or initial node has no name and no line of its own in
  // the text, so a rep inside it would have nowhere to go: those kinds don't carry the field.
  Object.keys(KINDS).filter(hasName).forEach((k) => KINDS[k].fields.push('code'));

  const SIDES = ['top', 'right', 'bottom', 'left'];
  const ID = /^[A-Za-z0-9_.:-]{1,64}$/;
  const NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
  const MULTIPLICITY = /^(\d+|\*)(\.\.(\d+|\*))?$/;
  // Words the textual notation reserves. A name that is one of these, or that isn't a plain identifier, is quoted.
  const KEYWORDS = new Set(('about abstract accept action actor after alias all allocate allocation analysis and as ' +
    'assert assign assume at attribute bind binding by calc case comment concern connect connection constant ' +
    'constraint crosses decide def default defined dependency derived do doc else end entry enum event exhibit exit ' +
    'expose false filter first flow for fork frame from hastype if implies import in include individual inout ' +
    'interface istype item join language library locale loop merge message meta metadata new nonunique not null ' +
    'objective occurrence of or ordered out package parallel part perform port private protected public redefines ' +
    'ref references render rendering rep require requirement return satisfy send snapshot specializes stakeholder ' +
    'standard state subject subsets succession terminate then timeslice to transition true until use variant ' +
    'variation verification verify via view viewpoint when while xor').split(' '));

  const str = (v, d) => (typeof v === 'string' ? v : (d === undefined ? '' : d));
  const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v
    : (typeof v === 'string' && v.trim() !== '' && Number.isFinite(+v) ? +v : d));
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const isObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  const copy = (v) => JSON.parse(JSON.stringify(v));

  function canContain(ownerKind, childKind) {
    const k = KINDS[ownerKind];
    return !!(k && k.contains) && k.contains.indexOf(childKind) >= 0;
  }
  function admits(viewKind, elKind) {
    const v = VIEW_KINDS[viewKind];
    return !!v && !!KINDS[elKind] && (v.admits === null || v.admits.indexOf(elKind) >= 0);
  }
  // Whether a kind carries a trait, one of the words in its traits; a kind without traits carries none.
  function hasTrait(kind, trait) {
    const k = KINDS[kind];
    return !!(k && k.traits) && k.traits.indexOf(trait) >= 0;
  }
  // Whether a kind's elements carry a name (name is one of its fields). A start node has none: it is never "unnamed",
  // and nothing can be about it by name.
  function hasName(kind) {
    const k = KINDS[kind];
    return !!k && k.fields.indexOf('name') >= 0;
  }

  function blank() {
    return { format: FORMAT, revision: null, package: { name: 'Model', doc: '' }, elements: [], relationships: [], views: [] };
  }

  // A layout entry for an element in a view: a border item's side and place along it, or a box's place and size.
  function placement(el, p) {
    const kind = KINDS[el.kind];
    p = isObject(p) ? p : {};
    if (kind.onBorder) return { side: SIDES.includes(p.side) ? p.side : 'right', at: clamp(num(p.at, 0.5), 0.05, 0.95) };
    // A box is never smaller than 80 x 40, unless its kind's own size is (a 16 x 16 node keeps its size).
    return {
      x: Math.round(num(p.x, 0)), y: Math.round(num(p.y, 0)),
      w: Math.round(clamp(num(p.w, kind.size[0]), Math.min(80, kind.size[0]), 4000)), h: Math.round(clamp(num(p.h, kind.size[1]), Math.min(40, kind.size[1]), 4000))
    };
  }

  // Places for the elements a view doesn't place yet: top-level boxes in rows of three, nested boxes in a row inside
  // their owner, border items spread along their owner's right side.
  function gridPlace(model, view) {
    const roots = childrenOf(model, null).filter((e) => !KINDS[e.kind].onBorder);
    roots.filter((e) => !view.layout[e.id]).forEach((el, i) => {
      view.layout[el.id] = placement(el, { x: 32 + (i % 3) * 320, y: 72 + Math.floor(i / 3) * 220 });
    });
    const walk = (parent) => {
      const kids = childrenOf(model, parent.id);
      const boxes = kids.filter((k) => !KINDS[k.kind].onBorder);
      const ports = kids.filter((k) => KINDS[k.kind].onBorder);
      boxes.filter((k) => !view.layout[k.id]).forEach((k, i) => { view.layout[k.id] = placement(k, { x: 12 + i * 200, y: 48 }); });
      ports.filter((k) => !view.layout[k.id]).forEach((k, i) => { view.layout[k.id] = placement(k, { side: 'right', at: (i + 1) / (ports.length + 1) }); });
      boxes.forEach(walk);
    };
    roots.forEach(walk);
  }

  // The value of a field from what a file carries, by its row in FIELDS. A ref is kept as the string it names and
  // checked by checkRefs once the elements are known.
  function readField(spec, v) {
    if (spec.read) return spec.read(v);
    if (spec.type === 'bool') return v === true;
    if (spec.type === 'enum') return spec.values.indexOf(v) >= 0 ? v : spec.values[0];
    if (spec.type === 'number') return num(v, '');
    const s = str(v);
    return spec.trim ? s.trim() : s;
  }
  // Keeps the fields of an element or a relationship from raw on item, each by its row in FIELDS. A field item has
  // already (name and doc, which every element gets first) and one that is not stored as a value (type) are left alone.
  function keepFields(fields, raw, item) {
    for (const f of fields) {
      const spec = FIELDS[f];
      if (!spec || spec.stored === false || item[f] !== undefined) continue;
      item[f] = readField(spec, raw[f]);
    }
  }
  // A ref names an element that exists, or nothing.
  function checkRefs(fields, item, ids) {
    for (const f of fields) {
      const spec = FIELDS[f];
      if (spec && spec.type === 'ref' && spec.stored !== false && item[f] !== '' && !ids.has(item[f])) item[f] = '';
    }
  }

  // Takes any JSON and returns a model this page can draw: known kinds, unique ids, owners that exist and can hold
  // what they own, no cycles, relationships whose two ends exist, and views whose layouts place elements the view's
  // kind admits. A format-1 model, whose elements carry their own places, becomes a model with one general view.
  function normalize(raw) {
    const r = raw && typeof raw === 'object' ? raw : {};
    const m = blank();
    m.revision = typeof r.revision === 'string' ? r.revision : null;
    const pkg = isObject(r.package) ? r.package : {};
    m.package.name = str(pkg.name).trim() || 'Model';
    m.package.doc = str(pkg.doc);

    // Elements. A place an element carries itself (format 1, or a convenience for edits made outside the page) is
    // kept aside and goes into a view's layout below.
    const carried = new Map();
    const seen = new Set();
    for (const e of Array.isArray(r.elements) ? r.elements : []) {
      if (!e || typeof e !== 'object' || !KINDS[e.kind] || typeof e.id !== 'string' || !ID.test(e.id) || seen.has(e.id)) continue;
      const kind = KINDS[e.kind];
      const el = { id: e.id, kind: e.kind, name: str(e.name), doc: str(e.doc) };
      if (typeof e.owner === 'string' && e.owner !== e.id) el.owner = e.owner;
      keepFields(kind.fields, e, el);
      if (kind.onBorder ? (e.side !== undefined || e.at !== undefined) : (e.x !== undefined || e.y !== undefined)) {
        carried.set(el.id, { view: str(e.view), place: e });
      }
      seen.add(el.id);
      m.elements.push(el);
    }

    let ids = new Map(m.elements.map((e) => [e.id, e]));
    for (const el of m.elements) {
      if (KINDS[el.kind].definition) { delete el.owner; continue; }
      if (el.owner !== undefined) {
        const o = ids.get(el.owner);
        if (!o || !canContain(o.kind, el.kind)) delete el.owner;
      }
    }
    for (const el of m.elements) {
      const walked = new Set([el.id]);
      let cur = el;
      while (cur && cur.owner !== undefined) {
        if (walked.has(cur.owner)) { delete el.owner; break; }
        walked.add(cur.owner);
        cur = ids.get(cur.owner);
      }
    }
    m.elements = m.elements.filter((el) => !(KINDS[el.kind].onBorder && el.owner === undefined));
    ids = new Map(m.elements.map((e) => [e.id, e]));
    for (const el of m.elements) checkRefs(KINDS[el.kind].fields, el, ids);

    const rseen = new Set();
    for (const x of Array.isArray(r.relationships) ? r.relationships : []) {
      if (!x || typeof x !== 'object' || !RELATIONSHIPS[x.kind] || typeof x.id !== 'string' || !ID.test(x.id)) continue;
      if (rseen.has(x.id) || seen.has(x.id) || !ids.has(x.from) || !ids.has(x.to) || x.from === x.to) continue;
      const kind = RELATIONSHIPS[x.kind];
      const rel = { id: x.id, kind: x.kind, from: x.from, to: x.to };
      keepFields(kind.fields, x, rel);
      checkRefs(kind.fields, rel, ids);
      if (kind.hideable && x.hidden === true) rel.hidden = true;
      rseen.add(x.id);
      m.relationships.push(rel);
    }

    // Views. Ids are unique across elements, relationships, and views; a view with no id, or one already taken, gets
    // the first free v1, v2…, so a model written by hand without ids still reads the same way every time.
    const taken = new Set();
    seen.forEach((id) => taken.add(id));
    rseen.forEach((id) => taken.add(id));
    const vseen = new Set();
    let serial = 0;
    const freeViewId = () => { do { serial += 1; } while (taken.has('v' + serial) || vseen.has('v' + serial)); return 'v' + serial; };
    for (const v of Array.isArray(r.views) ? r.views : []) {
      if (!isObject(v)) continue;
      const kindName = v.kind === undefined || v.kind === null || v.kind === '' ? 'GeneralView' : v.kind;
      const kind = VIEW_KINDS[kindName];
      if (!kind) continue;
      const id = typeof v.id === 'string' && ID.test(v.id) && !taken.has(v.id) && !vseen.has(v.id) ? v.id : freeViewId();
      const view = { id: id, kind: kindName, name: str(v.name).trim(), doc: str(v.doc), x: Math.round(num(v.x, 0)), y: Math.round(num(v.y, 0)), layout: {}, options: copy(kind.options) };
      if (isObject(v.options)) for (const key in view.options) if (v.options[key] !== undefined) view.options[key] = copy(v.options[key]);
      const lay = isObject(v.layout) ? v.layout : {};
      for (const eid in lay) {
        const el = ids.get(eid);
        if (!el || !admits(kindName, el.kind) || !isObject(lay[eid])) continue;
        view.layout[eid] = placement(el, lay[eid]);
      }
      vseen.add(id);
      m.views.push(view);
    }
    // Places carried by elements go into the view their view field names, else the first view.
    carried.forEach((c, eid) => {
      const el = ids.get(eid);
      if (!el) return;
      const view = m.views.find((v) => v.id === c.view) || m.views[0];
      if (!view || view.layout[eid] || !admits(view.kind, el.kind)) return;
      view.layout[eid] = placement(el, c.place);
    });
    // A model with no views (format 1, or one written without them) gets one general view showing every element, at
    // the places the elements carried, else in a grid, so nothing is invisible after a load.
    if (!m.views.length) {
      const old = isObject(r.view) ? r.view : {};
      const view = { id: freeViewId(), kind: 'GeneralView', name: str(old.name).trim(), doc: '', x: 0, y: 0, layout: {}, options: {} };
      carried.forEach((c, eid) => { const el = ids.get(eid); if (el) view.layout[eid] = placement(el, c.place); });
      gridPlace(m, view);
      m.views.push(view);
    }
    // A border item is shown only where its owner is.
    for (const view of m.views) {
      for (const eid in view.layout) {
        const el = ids.get(eid);
        if (KINDS[el.kind].onBorder && !(el.owner !== undefined && view.layout[el.owner])) delete view.layout[eid];
      }
    }
    return m;
  }

  function index(model) { return new Map(model.elements.map((e) => [e.id, e])); }
  function relIndex(model) { return new Map(model.relationships.map((r) => [r.id, r])); }
  function viewIndex(model) { return new Map(model.views.map((v) => [v.id, v])); }
  // The ids of the views that show an element.
  function shownIn(model, id) { return model.views.filter((v) => !!v.layout[id]).map((v) => v.id); }

  // The element and its owners, outermost first.
  function chain(model, el, ids) {
    ids = ids || index(model);
    const out = [];
    const guard = new Set();
    let cur = el;
    while (cur && !guard.has(cur.id)) {
      guard.add(cur.id);
      out.unshift(cur);
      cur = cur.owner !== undefined ? ids.get(cur.owner) : null;
    }
    return out;
  }
  function childrenOf(model, id) {
    return model.elements.filter((e) => (id === null || id === undefined ? e.owner === undefined : e.owner === id));
  }
  function descendants(model, id) {
    const out = [];
    const walk = (parent) => childrenOf(model, parent).forEach((c) => { out.push(c); walk(c.id); });
    walk(id);
    return out;
  }
  function typingOf(model, el) {
    return model.relationships.find((r) => r.kind === 'FeatureTyping' && r.from === el.id) || null;
  }
  function inUsage(model, el, ids) { return chain(model, el, ids).some((e) => e.kind === 'PartUsage'); }
  // Whether sub specializes general, directly or through others.
  function specializes(model, sub, general) {
    const seen = new Set();
    const stack = [sub.id];
    while (stack.length) {
      const id = stack.pop();
      if (id === general.id) return true;
      if (seen.has(id)) continue;
      seen.add(id);
      model.relationships.filter((r) => r.kind === 'Specialization' && r.from === id).forEach((r) => stack.push(r.to));
    }
    return false;
  }

  // The owner a connection is declared in: the innermost element that holds both ends, or null for the package.
  function commonOwner(model, a, b, ids) {
    ids = ids || index(model);
    const ca = chain(model, a, ids).slice(0, -1).map((e) => e.id);
    const cb = new Set(chain(model, b, ids).slice(0, -1).map((e) => e.id));
    let found = null;
    for (const id of ca) if (cb.has(id)) found = id;
    return found;
  }
  // What rules out a and b as the two ends of a connector (what is its kind in a sentence, "A flow"): with no common
  // owner and an end inside a definition, the connector would reach across definitions, which the notation can't
  // write. advice, when given, replaces the closing sentence that says where to draw it instead.
  function acrossDefinitions(model, what, a, b, ids, advice) {
    if (commonOwner(model, a, b, ids) === null && (KINDS[chain(model, a, ids)[0].kind].definition || KINDS[chain(model, b, ids)[0].kind].definition)) {
      return what + ' between ' + describe(model, a, ids) + ' and ' + describe(model, b, ids) + ' reaches across definitions. ' + (advice || 'Connect things inside the same part def or part.');
    }
    return null;
  }
  // Whether a named relationship's name is taken beside it: by an element declared right in the body the relationship
  // is written in (the package when its owner is null), or by another named relationship written there, among those
  // given. Each kind's check says which it looks at (the ones before it, or every other one), so which line is marked
  // when two clash still depends on the kinds and their order.
  function nameTakenBeside(model, rel, ids, among) {
    const name = str(rel.name).trim();
    const o = RELATIONSHIPS[rel.kind].owner(model, rel, ids) || '';
    return model.elements.some((e) => hasName(e.kind) && e.name.trim() === name && (e.owner === undefined ? '' : e.owner) === o) ||
      among.some((r) => r !== rel && str(r.name).trim() === name && ids.has(r.from) && ids.has(r.to) && (RELATIONSHIPS[r.kind].owner(model, r, ids) || '') === o);
  }

  function isName(s) { return NAME.test(s) && !KEYWORDS.has(s); }
  function quote(name) {
    const n = String(name == null ? '' : name).trim() || 'unnamed';
    return isName(n) ? n : "'" + n.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
  }
  function shown(name) { return String(name == null ? '' : name).trim() || '(unnamed)'; }
  function qualified(model, el, ids) {
    return [model.package.name].concat(chain(model, el, ids).map((e) => e.name)).map(quote).join('::');
  }
  // The path to a feature from the element it is declared in: hosts.api from Page.
  function featurePath(model, ownerId, el, ids) {
    const c = chain(model, el, ids);
    const start = ownerId === null ? 0 : c.findIndex((e) => e.id === ownerId) + 1;
    return c.slice(start).map((e) => quote(e.name)).join('.');
  }
  // Whether the text can name an element by its qualified name: it and every owner have a name field and a name. A
  // start node (no name field), or anything inside an unnamed part, can't be exposed or annotated by name.
  function nameable(model, el, ids) {
    return chain(model, el, ids).every((c) => hasName(c.kind) && c.name.trim());
  }
  // A label with its indefinite article: "a part", "an item", "an action flow view". Some labels start with a vowel,
  // so 'a ' + label reads wrong for them; capital gives the "A"/"An" that opens a sentence.
  function an(label, capital) {
    const article = /^[aeiou]/i.test(label) ? 'an' : 'a';
    return (capital ? article.charAt(0).toUpperCase() + article.slice(1) : article) + ' ' + label;
  }
  // The kinds that are defined by something, as the defined-by rule and the page's hint list them: "part, port, item,
  // action, parameter or state".
  function definable() {
    const labels = Object.keys(KINDS).filter((k) => KINDS[k].definedBy).map((k) => KINDS[k].label);
    return labels.length > 1 ? labels.slice(0, -1).join(', ') + ' or ' + labels[labels.length - 1] : labels.join('');
  }

  // An element in a sentence: its kind's label, its name (or "(unnamed)"), and the owner it is in. An element of a kind
  // with no name field is just its label: "start in a1".
  function describe(model, el, ids) {
    ids = ids || index(model);
    const owner = el.owner !== undefined ? ids.get(el.owner) : null;
    return KINDS[el.kind].label + (hasName(el.kind) ? ' ' + shown(el.name) : '') + (owner ? ' in ' + shown(owner.name) : '');
  }
  function describeRel(model, rel, ids) {
    ids = ids || index(model);
    const a = ids.get(rel.from);
    const b = ids.get(rel.to);
    // An end of a kind with no name field is said by its kind (describe), not as "(unnamed)".
    const end = (e) => (!e ? '?' : hasName(e.kind) ? shown(e.name) : describe(model, e, ids));
    const from = end(a);
    const to = end(b);
    if (rel.kind === 'Specialization') return from + ' specializes ' + to;
    if (rel.kind === 'FeatureTyping') return from + ' defined by ' + to;
    return RELATIONSHIPS[rel.kind].label + ' ' + (rel.name && rel.name.trim() ? rel.name.trim() + ', ' : '') + from + ' to ' + to;
  }
  function describeView(model, view) { return 'view ' + shown(view.name); }
  function labelFor(model, targetId) {
    const el = index(model).get(targetId);
    if (el) return describe(model, el);
    const rel = relIndex(model).get(targetId);
    if (rel) return describeRel(model, rel);
    const view = viewIndex(model).get(targetId);
    return view ? describeView(model, view) : '';
  }

  // The features a type gets from elsewhere, by name: those of what it is defined by and of what it specializes,
  // all the way up, and, for a usage that redefines a feature of its owner's type, those of that feature. A kind with no
  // name field (a start node, named start1 by the page for itself) has no name the text could inherit.
  function inheritedFeatures(model, type, ids, seen) {
    ids = ids || index(model);
    seen = seen || new Set();
    const out = new Map();
    const take = (t) => {
      if (!t || seen.has(t.id)) return;
      seen.add(t.id);
      childrenOf(model, t.id).forEach((c) => { if (hasName(c.kind) && c.name.trim() && !out.has(c.name.trim())) out.set(c.name.trim(), c); });
      inheritedFeatures(model, t, ids, seen).forEach((c, name) => { if (!out.has(name)) out.set(name, c); });
    };
    const typing = typingOf(model, type);
    if (typing) take(ids.get(typing.to));
    model.relationships.filter((r) => r.kind === 'Specialization' && r.from === type.id).forEach((r) => take(ids.get(r.to)));
    if (!typing && type.owner !== undefined && type.name.trim()) {
      const owner = ids.get(type.owner);
      const redefined = owner ? inheritedFeatures(model, owner, ids, seen).get(type.name.trim()) : null;
      if (redefined && redefined.kind === type.kind) take(redefined);
    }
    return out;
  }
  const MAX_BOUND = 2147483647;
  function boundsOk(mult) {
    return mult.split('..').every((b) => b === '*' || +b <= MAX_BOUND);
  }
  const RESERVED_NAMES = new Set(['StandardViewDefinitions', 'SysML', 'KerML', 'Views', 'Parts', 'Ports', 'Items']);

  // What the slices add to the library: EXTRA the functions they export on SysMLModel (EXTRA.successionsOf =
  // successionsOf), BODY the writers run for every element's body in the export (function (model, el, depth, h),
  // after the doc and before the kind's own body hook: the code links' textual representations, say). The functions
  // themselves live in the regions below.
  const EXTRA = {};
  const BODY = [];
  // ---- Interconnection: what a port or item is defined by, the directed items a port carries, the ends of flows
  // and interfaces, and the statement a connector is written as.

  // The definition a usage is typed by, found through what it redefines when it isn't typed itself (port :>> api;
  // on a part takes the api : ~StrongholdApp of the part's def): { def, conjugated }, or null for nothing.
  function definitionOf(model, el, ids) {
    const seen = new Set();
    let cur = el;
    while (cur && !seen.has(cur.id)) {
      seen.add(cur.id);
      const typing = typingOf(model, cur);
      if (typing && ids.has(typing.to)) return { def: ids.get(typing.to), conjugated: cur.conjugated === true };
      const owner = cur.owner !== undefined ? ids.get(cur.owner) : null;
      const inherited = owner && cur.name.trim() ? inheritedFeatures(model, owner, ids).get(cur.name.trim()) : null;
      cur = inherited && inherited.kind === el.kind ? inherited : null;
    }
    return null;
  }
  // Which way a directed feature goes as seen through a port: a conjugated port turns in into out and out into in.
  function flip(direction, conjugated) {
    if (!conjugated) return direction;
    return direction === 'in' ? 'out' : direction === 'out' ? 'in' : direction;
  }
  // The directed items of a port as the port sees them: those of its port def that have a direction, flipped when the
  // port is conjugated, as [{ item, direction }]. None when the port has no port def.
  function portItems(model, port, ids) {
    const typed = definitionOf(model, port, ids);
    if (!typed) return [];
    return childrenOf(model, typed.def.id).filter((c) => c.direction).map((c) => ({ item: c, direction: flip(c.direction, typed.conjugated) }));
  }
  // The glyph a port shows: in when every directed item of its def comes in, out when every one goes out, inout when
  // they mix or any goes both ways, null when there are none.
  function portWay(model, port) {
    const ways = new Set(portItems(model, port, index(model)).map((x) => x.direction));
    if (!ways.size) return null;
    return ways.size === 1 && !ways.has('inout') ? ways.values().next().value : 'inout';
  }
  // A flow end that is written through its definition: a port, defined by a port def whose directed items are what
  // flows through it. Anything else (an item on a part; a parameter, once the behavior slice is in) is a directed
  // feature written as itself, whether or not it sits on a border.
  function portEnd(el) { return KINDS[el.kind].definedBy === 'PortDefinition'; }
  // A flow end that isn't a port is reached through its owner, so an item right in the element the flow is declared
  // in (or right in the package) would be a bare name, which the notation doesn't take as a flow end.
  function bareFlowEnd(model, a, b, ids) {
    const o = commonOwner(model, a, b, ids);
    const bare = [a, b].find((e) => !portEnd(e) && (e.owner === undefined ? null : e.owner) === o);
    if (!bare) return null;
    return 'A flow from ' + describe(model, a, ids) + ' to ' + describe(model, b, ids) + ' would be declared ' + (o === null ? 'in the package' : 'in ' + describe(model, ids.get(o), ids)) +
      ', where ' + describe(model, bare, ids) + ' is a bare name, which the notation doesn\'t take as a flow end. Flows run between the items of different parts, or through ports.';
  }
  // A named connector is a feature of the element it is declared in, so its name can't be that of an element declared
  // there, or of another named connector declared there. The core checks a connection against connections; this
  // checks an interface, a flow or a binding against everything beside it.
  function connectorNameClash(model, rel, ids, add) {
    const cname = rel.name.trim();
    if (cname && nameTakenBeside(model, rel, ids, model.relationships)) add(rel.id, 'The ' + RELATIONSHIPS[rel.kind].label + ' ' + cname + ' is named like something else beside it. Rename one.');
  }
  // The end of a flow as the text names it (which is 'from' or 'to'): for a port, the directed item of its port def
  // that is of the flow's item and goes out of the source or into the target, through the port's conjugation; for
  // anything else (an item on a part, a parameter), the end itself. Returns { el, item, problem }: item is the port's
  // item when the end is a port and one was found; problem a sentence when the end can't be written as it should.
  function flowEnd(model, rel, which, ids) {
    const end = ids.get(which === 'from' ? rel.from : rel.to);
    const out = which === 'from';
    const itemDef = rel.item ? ids.get(rel.item) : null;
    const goes = (d) => d === 'inout' || d === (out ? 'out' : 'in');
    const verb = out ? 'start' : 'end';
    if (!end) return { el: null, item: null, problem: null };
    if (portEnd(end)) {
      const typed = definitionOf(model, end, ids);
      if (!typed) return { el: end, item: null, problem: describe(model, end, ids) + ' has no port def, so nothing can flow through it. Define it by a port def that carries an item.' };
      if (!itemDef) return { el: end, item: null, problem: null }; // flowProblems says so once, for the flow
      const found = portItems(model, end, ids).filter((x) => goes(x.direction) && typingOf(model, x.item) && typingOf(model, x.item).to === itemDef.id).map((x) => x.item);
      const seen = (typed.conjugated ? 'a conjugated ' : 'a ') + shown(typed.def.name);
      const way = out ? 'out' : 'in';
      if (!found.length) return { el: end, item: null, problem: describe(model, end, ids) + ', ' + seen + ', carries no item of ' + shown(itemDef.name) + ' going ' + way + ', so the flow can\'t ' + verb + ' there.' };
      if (found.length > 1) return { el: end, item: found[0], problem: describe(model, end, ids) + ', ' + seen + ', carries more than one item of ' + shown(itemDef.name) + ' going ' + way + ' (' + found.map((i) => shown(i.name)).join(', ') + '), so the flow can\'t tell which to ' + verb + ' at. Keep one.' };
      return { el: end, item: found[0], problem: null };
    }
    if (end.direction !== undefined) {
      if (!end.direction) return { el: end, item: null, problem: describe(model, end, ids) + ' has no direction, so nothing flows ' + (out ? 'from' : 'into') + ' it. Set it to ' + (out ? 'out' : 'in') + ' or inout.' };
      if (!goes(end.direction)) return { el: end, item: null, problem: describe(model, end, ids) + ' goes ' + end.direction + ', so a flow can\'t ' + verb + ' there.' };
    }
    if (itemDef) {
      const typed = definitionOf(model, end, ids);
      if (typed && typed.def.id !== itemDef.id && !specializes(model, typed.def, itemDef)) return { el: end, item: null, problem: describe(model, end, ids) + ' is of ' + shown(typed.def.name) + ', not ' + shown(itemDef.name) + ', so the flow\'s item doesn\'t match it.' };
    }
    return { el: end, item: null, problem: null };
  }
  // The path of a flow's end from the element the flow is declared in: a port's path and its item's name, or the
  // end's own path. When the port's item can't be told, the port's path alone, which the flow's problems explain.
  function flowEndPath(model, rel, which, ownerId, ids) {
    const r = flowEnd(model, rel, which, ids);
    const path = featurePath(model, ownerId, r.el, ids);
    return r.item ? path + '.' + quote(r.item.name) : path;
  }
  // What keeps a flow from being written as it should: a flow through a port with no item, and the ends flowEnd can't
  // write.
  function flowProblems(model, rel, ids) {
    const problems = [];
    const a = ids.get(rel.from);
    const b = ids.get(rel.to);
    if (!a || !b) return problems;
    if (!rel.item && (portEnd(a) || portEnd(b))) problems.push('The ' + describeRel(model, rel, ids) + ' needs an item: pick in the panel what flows through the ports.');
    ['from', 'to'].forEach((which) => {
      const r = flowEnd(model, rel, which, ids);
      if (r.problem) problems.push(r.problem);
    });
    return problems;
  }
  // A port's definition as a key ("~FuelPort" and "FuelPort" differ), or null; and as words.
  function portSignature(model, port, ids) {
    const typed = definitionOf(model, port, ids);
    return typed ? (typed.conjugated ? '~' : '') + typed.def.id : null;
  }
  function portTypeName(model, port, ids) {
    const typed = definitionOf(model, port, ids);
    return typed ? (typed.conjugated ? '~' : '') + shown(typed.def.name) : 'nothing';
  }
  // Whether a typed interface's two ports match the two ends of its interface def, one each, conjugation counted: a
  // sentence saying which doesn't, or null. The def's own check says when it hasn't two ends; a def with more can't
  // type an interface drawn between two ports, since the validator takes a binary interface only ("Cannot have more
  // than two ends"), so that is said here, on the interface.
  function interfaceEndsProblem(model, rel, ids) {
    const def = rel.interfaceDef ? ids.get(rel.interfaceDef) : null;
    if (!def || def.kind !== 'InterfaceDefinition') return null; // the interface's check says so
    const ends = childrenOf(model, def.id).filter((c) => KINDS[c.kind].onBorder);
    if (ends.length < 2) return null;
    const a = ids.get(rel.from);
    const b = ids.get(rel.to);
    if (!hasTrait(a.kind, 'interfaceEnd') || !hasTrait(b.kind, 'interfaceEnd')) return null; // the ends rule says so
    if (ends.length > 2) {
      return describe(model, def, ids) + ' has ' + ends.length + ' ends (' + ends.map((e) => shown(e.name)).join(', ') + '), so an interface between two ports can\'t be typed by it. Keep two ends on it, or type the ' + describeRel(model, rel, ids) + ' by another def.';
    }
    const sa = portSignature(model, a, ids);
    const sb = portSignature(model, b, ids);
    const s0 = portSignature(model, ends[0], ids);
    const s1 = portSignature(model, ends[1], ids);
    if ((sa === s0 && sb === s1) || (sa === s1 && sb === s0)) return null;
    const endsText = ends.map((e) => shown(e.name) + ' : ' + portTypeName(model, e, ids)).join(' and ');
    const wrong = [a, b].find((p) => { const s = portSignature(model, p, ids); return s !== s0 && s !== s1; });
    if (wrong) return describe(model, wrong, ids) + ', defined by ' + portTypeName(model, wrong, ids) + ', matches no end of ' + describe(model, def, ids) + ' (its ends are ' + endsText + ').';
    return 'Both ends of the ' + describeRel(model, rel, ids) + ' match the same end of ' + describe(model, def, ids) + ' (its ends are ' + endsText + '); one of them should be the other.';
  }
  // A connector's statement: head; or, with a doc or a note on an unnamed connector (which can't be about it by
  // name), head { doc, notes }: the connection's own form.
  function connectorStatement(rel, head, depth, h) {
    const inside = rel.name.trim() ? [] : h.notesOn(rel.id);
    if (!rel.doc.trim() && !inside.length) { h.line(depth, head + ';'); return; }
    h.line(depth, head + ' {');
    if (rel.doc.trim()) h.comment(depth + 1, 'doc', rel.doc);
    inside.forEach((n) => h.note(depth + 1, n, null));
    h.line(depth, '}');
  }
  EXTRA.definitionOf = definitionOf;
  EXTRA.portItems = portItems;
  EXTRA.portWay = portWay;
  EXTRA.flowEnd = flowEnd;
  // Behavior: the action flow and the state transition views. The head of a start, done or initial node is null: the
  // text has them already, as the start and done every action and state inherits and as a state's entry.
  function noHead() { return null; }
  function isActionOwner(kind) { return kind === 'ActionDefinition' || kind === 'ActionUsage'; }
  function isStateOwner(kind) { return kind === 'StateDefinition' || kind === 'StateUsage'; }
  // The names every action and state gets from the library (Actions::Action, States::StateAction, Occurrences), which
  // nothing inside one may take: the pilot only warns, the canvas refuses.
  const INHERITED_BEHAVIOR_NAMES = new Set(('start done self middle subactions entryAction doAction exitAction substates exclusiveStates ' +
    'stateTransitions stateSequencing portions portionOf timeSlices snapshots startShot endShot transitions thisPerformance performers ' +
    'subperformances timeEnclosedOccurrences suboccurrences portionOfLife localClock predecessors successors').split(' '));
  // The relationships of one kind that lead into and out of an element.
  function behaviorLinksOf(model, id, kind) {
    return {
      into: model.relationships.filter((r) => r.kind === kind && r.to === id),
      outOf: model.relationships.filter((r) => r.kind === kind && r.from === id)
    };
  }
  function parametersOf(model, id) { return childrenOf(model, id).filter((e) => e.kind === 'ParameterUsage'); }
  function entryActionOf(model, stateId) { return childrenOf(model, stateId).find((e) => e.kind === 'ActionUsage' && e.role === 'entry') || null; }
  // The definition an element is defined by, when its typing names one of the kind it should.
  function typingDefinitionOf(model, el, ids) {
    const typing = typingOf(model, el);
    const def = typing ? ids.get(typing.to) : null;
    return def && def.kind === KINDS[el.kind].definedBy ? def : null;
  }
  // An end of a succession or transition in the text: start or done for the pseudo nodes, else the quoted name; and
  // the path to it from the body it is written in, like featurePath.
  function behaviorEndName(el) { return el.kind === 'StartNode' ? 'start' : el.kind === 'DoneNode' ? 'done' : quote(el.name); }
  function behaviorEndPath(model, ownerId, el, ids) {
    const c = chain(model, el, ids);
    const start = ownerId === null ? 0 : c.findIndex((e) => e.id === ownerId) + 1;
    return c.slice(start).map(behaviorEndName).join('.');
  }
  // Whether a target names a port of the model, by its last segment: a send goes via a port and to anything else.
  function namesAPort(model, target) {
    const last = String(target).split('.').pop().trim();
    return model.elements.some((e) => e.kind === 'PortUsage' && (e.name.trim() === last || quote(e.name) === last));
  }
  // The type a trigger or an accept payload names, as the text reads it: the whole text, or what follows the colon of
  // x : Type, up to a via; null for a timing or a condition (after …, when …, at …), for a qualified name (SI::s, which
  // may be the library's) and for anything that isn't a plain name. A plain name has to be a definition of the model,
  // else the pilot can't resolve the type (accept go; is refused with "Couldn't resolve reference to Type 'go'").
  function namedType(text) {
    let s = str(text).trim().replace(/\s+via\s[\s\S]*$/, '');
    if (/^(after|when|at)\b/.test(s)) return null;
    const colon = s.indexOf(':');
    if (colon >= 0) s = s.slice(colon + 1).trim();
    return NAME.test(s) ? s : null;
  }
  function checkNamedType(model, id, text, what, add) {
    const type = namedType(text);
    if (type && !model.elements.some((e) => KINDS[e.kind].definition && e.name.trim() === type)) {
      add(id, what + ' names ' + type + ', which is no definition in the model, so the text can\'t resolve it. Name a part def or item def, as x : Type, or write after …, when … or at ….');
    }
  }
  // An element inside an action or a state can't take a name the library gives every action and state.
  function checkInheritedName(model, el, ids, add) {
    const owner = el.owner !== undefined ? ids.get(el.owner) : null;
    const name = str(el.name).trim();
    if (owner && (isActionOwner(owner.kind) || isStateOwner(owner.kind)) && INHERITED_BEHAVIOR_NAMES.has(name)) {
      add(el.id, 'The name ' + name + ' is one every ' + (isActionOwner(owner.kind) ? 'action' : 'state') + ' already has inside it. Rename ' + describe(model, el, ids) + '.');
    }
  }

  // -- Actions and their parameters.

  // The head of an action: the generated one (action name : Def [m]), then send or accept with the payload and the
  // target (a send goes via a port, to anything else; an accept always via), and the role in front when the action
  // belongs to a state (entry action init). An accept without a payload is written as a plain action, since the text
  // has no form for it; the check says so.
  function actionHead(model, el, h) {
    const owner = el.owner !== undefined ? h.ids.get(el.owner) : null;
    const payload = str(el.payload).trim();
    const target = str(el.target).trim();
    let head = h.headOf(el);
    if (el.actionKind === 'send' && (payload || target)) {
      head += ' send' + (payload ? ' ' + payload : '');
      if (target) head += (namesAPort(model, target) ? ' via ' : ' to ') + target;
    } else if (el.actionKind === 'accept' && payload) {
      head += ' accept ' + payload + (target ? ' via ' + target : '');
    }
    if (el.role && owner && isStateOwner(owner.kind)) head = el.role + ' ' + head;
    return head;
  }
  // A parameter's declaration: in item name : Type [m] :> general; a direction it doesn't have yet is left out (the
  // check asks for one), and so is a name it doesn't have. With an empty index (a bare redefinition of a definition's
  // parameter) neither the type nor the generals are written.
  function parameterText(model, p, ids) {
    const typing = typingOf(model, p);
    let text = (p.direction ? p.direction + ' ' : '') + 'item' + (p.name.trim() ? ' ' + quote(p.name) : '');
    if (typing && ids.get(typing.to)) text += ' : ' + quote(ids.get(typing.to).name);
    if (p.multiplicity && MULTIPLICITY.test(p.multiplicity)) text += ' [' + p.multiplicity + ']';
    const generals = model.relationships.filter((r) => r.kind === 'Specialization' && r.from === p.id && ids.get(r.to)).map((r) => quote(ids.get(r.to).name));
    if (generals.length) text += ' :> ' + generals.join(', ');
    return text;
  }
  // A declaration a hook writes in place of element() (a typed action's parameter, an event under a lifeline): the head
  // alone, or with a body holding the element's doc and what the body writers and its kind's body hook add (its code
  // links, a note on it when the text can't name it), so nothing the panel offers is lost in the text.
  function declare(model, el, head, depth, h) {
    const lines = [];
    const into = Object.assign({}, h, { line: (d, t) => lines.push('    '.repeat(d) + t), comment: (d, c, t) => commentLines(d, c, t).forEach((l) => lines.push(l)) });
    BODY.forEach((write) => write(model, el, depth + 1, into));
    if (KINDS[el.kind].body) KINDS[el.kind].body(model, el, depth + 1, into);
    if (!el.doc.trim() && !lines.length) { h.line(depth, head + ';'); return; }
    h.line(depth, head + ' {');
    if (el.doc.trim()) h.comment(depth + 1, 'doc', el.doc);
    lines.forEach((l) => h.line(0, l));
    h.line(depth, '}');
  }
  // The parameters of an action typed by a definition redefine the definition's by position (the pilot aligns them
  // in order, whatever their names), so the action's body writes them in the definition's order: each one the
  // action shows with what the action says of it, each one it doesn't show as a bare redefinition (in item x;), and
  // the action's own parameters after them. An action that shows none inherits them all and writes nothing.
  function actionBody(model, el, depth, h) {
    const def = typingDefinitionOf(model, el, h.ids);
    const own = parametersOf(model, el.id);
    if (!def || !own.length) return;
    const inherited = parametersOf(model, def.id);
    const named = (list, name) => (name ? list.find((p) => p.name.trim() === name) : undefined);
    inherited.forEach((p) => {
      const mine = named(own, p.name.trim());
      if (mine) declare(model, mine, parameterText(model, mine, h.ids), depth, h);
      else h.line(depth, parameterText(model, p, new Map()) + ';');
    });
    own.filter((p) => !named(inherited, p.name.trim())).forEach((p) => declare(model, p, parameterText(model, p, h.ids), depth, h));
  }
  // A parameter of an action def, or of an action with no definition, declares itself; one of a typed action is
  // written by the action's body, in its definition's order.
  function parameterHead(model, el, h) {
    const owner = el.owner !== undefined ? h.ids.get(el.owner) : null;
    if (owner && owner.kind === 'ActionUsage' && typingDefinitionOf(model, owner, h.ids)) return null;
    return parameterText(model, el, h.ids);
  }
  function checkAction(model, el, ids, add) {
    const what = describe(model, el, ids);
    const owner = el.owner !== undefined ? ids.get(el.owner) : null;
    if (el.role && !(owner && isStateOwner(owner.kind))) {
      add(el.id, 'The role ' + el.role + ' is for an action inside a state; ' + what + ' is ' + (owner ? 'in ' + an(KINDS[owner.kind].label) : 'on its own') + '. Clear the role, or move it into a state.');
    }
    if (el.actionKind === 'accept' && !str(el.payload).trim()) add(el.id, what + ' accepts nothing yet. Give it a payload: a type, x : Type, or a trigger like after 10 [SI::s] or when ready.');
    if (el.actionKind === 'send' && !str(el.payload).trim()) add(el.id, what + ' sends nothing yet. Give it a payload, like new Alert().');
    // The text has send and accept only inside an action's body, or as a state's entry, do or exit action: in a part
    // def, a part, a state without a role or the package the pilot can't parse them.
    if ((el.actionKind === 'send' || el.actionKind === 'accept') && !(owner && isActionOwner(owner.kind)) && !(el.role && owner && isStateOwner(owner.kind))) {
      add(el.id, 'An action that ' + (el.actionKind === 'send' ? 'sends' : 'accepts') + ' is written inside an action def or an action, or as a state\'s entry, do or exit action; ' + what + ' is ' +
        (owner ? 'in ' + an(KINDS[owner.kind].label) : 'on its own') + '. Move it' + (owner && isStateOwner(owner.kind) ? ', or give it a role' : '') + '.');
    }
    if (el.actionKind === 'accept' && str(el.payload).trim()) checkNamedType(model, el.id, el.payload, 'The payload ' + str(el.payload).trim() + ' of ' + what, add);
    checkInheritedName(model, el, ids, add);
  }
  function checkParameter(model, el, ids, add) {
    const what = describe(model, el, ids);
    const owner = el.owner !== undefined ? ids.get(el.owner) : null;
    if (!el.direction) add(el.id, what + ' needs a direction: in, out or inout.');
    if (!el.name.trim() && !model.relationships.some((r) => r.from === el.id || r.to === el.id)) add(el.id, what + ' has no name. Name it, so flows and bindings can reach it.');
    if (owner && owner.kind === 'ActionUsage' && el.name.trim()) {
      const def = typingDefinitionOf(model, owner, ids);
      const inherited = def ? parametersOf(model, def.id).find((p) => p.name.trim() === el.name.trim()) : null;
      if (inherited && inherited.direction !== el.direction) {
        add(el.id, what + ' goes ' + (el.direction || 'no way yet') + ', but the parameter ' + inherited.name.trim() + ' of ' + shown(def.name) + ' goes ' + (inherited.direction || 'no way') + '. Match the direction, or rename it.');
      }
    }
    checkInheritedName(model, el, ids, add);
  }

  // -- Control nodes, start, done and the initial node.

  // A fork, join, decision or merge lives inside an action; the pilot leaves the number of successions on each
  // unchecked, so the canvas does it: one into a fork or a decision, one out of a join or a merge, and every
  // succession out of a decision guarded, or one of them the else.
  function checkControlNode(model, el, ids, add) {
    const what = describe(model, el, ids);
    const label = KINDS[el.kind].label;
    const owner = el.owner !== undefined ? ids.get(el.owner) : null;
    if (!owner || !isActionOwner(owner.kind)) add(el.id, an(label, true) + ' belongs inside an action def or an action; ' + what + ' is ' + (owner ? 'in ' + an(KINDS[owner.kind].label) : 'on its own') + '.');
    const links = behaviorLinksOf(model, el.id, 'SuccessionAsUsage');
    if ((el.kind === 'ForkNode' || el.kind === 'DecisionNode') && links.into.length > 1) add(el.id, 'One succession leads into ' + an(label) + '; ' + what + ' has ' + links.into.length + '.');
    if ((el.kind === 'JoinNode' || el.kind === 'MergeNode') && links.outOf.length > 1) add(el.id, 'One succession leaves ' + an(label) + '; ' + what + ' has ' + links.outOf.length + '.');
    if (el.kind === 'DecisionNode') {
      const guards = links.outOf.map((r) => str(r.guard).trim());
      const elses = guards.filter((g) => g === 'else').length;
      const bare = guards.filter((g) => !g).length;
      if (bare) add(el.id, 'Every succession out of ' + what + ' needs a guard: a Boolean expression, or else for the branch taken when none holds. ' + bare + ' of them ' + (bare === 1 ? 'has' : 'have') + ' none.');
      if (elses > 1) add(el.id, what + ' has ' + elses + ' else branches; one is enough.');
      if (elses === 1 && guards.length === 1) add(el.id, 'An else branch needs guarded branches beside it; ' + what + ' has only the else.');
    }
    checkInheritedName(model, el, ids, add);
  }
  // Start and done live inside an action (done inside a state too), the initial node inside a state that isn't
  // parallel; one of each per owner; the initial node has one transition out, untriggered, and only an entry action
  // lets that transition carry a name, a doc or an effect (the entry idiom, entry; then first;, has no room for them).
  function checkPseudoNode(model, el, ids, add) {
    const what = describe(model, el, ids);
    const label = KINDS[el.kind].label;
    const owner = el.owner !== undefined ? ids.get(el.owner) : null;
    const home = el.kind === 'StartNode' ? 'an action def or an action' : el.kind === 'DoneNode' ? 'an action def, an action, a state def or a state' : 'a state def or a state';
    const fits = !!owner && (el.kind === 'StartNode' ? isActionOwner(owner.kind) : el.kind === 'DoneNode' ? isActionOwner(owner.kind) || isStateOwner(owner.kind) : isStateOwner(owner.kind));
    if (!fits) { add(el.id, an(label, true) + ' belongs inside ' + home + '; ' + what + ' is ' + (owner ? 'in ' + an(KINDS[owner.kind].label) : 'on its own') + '.'); return; }
    const twins = childrenOf(model, owner.id).filter((e) => e.kind === el.kind);
    if (twins.length > 1) add(el.id, describe(model, owner, ids) + ' has ' + twins.length + ' ' + label + 's; one is enough.');
    if (el.kind !== 'InitialNode') return;
    if (owner.parallel === true) add(el.id, describe(model, owner, ids) + ' runs its regions in parallel, so it has no initial node; put one inside each region instead.');
    const out = behaviorLinksOf(model, el.id, 'TransitionUsage').outOf;
    if (!out.length) add(el.id, 'The ' + what + ' needs a transition to the first state.');
    if (out.length > 1) add(el.id, 'One transition leaves an initial node; the ' + what + ' has ' + out.length + '.');
    const entry = entryActionOf(model, owner.id);
    out.forEach((t) => {
      if (str(t.trigger).trim()) add(t.id, 'The transition out of the initial node is taken as ' + shown(owner.name) + ' is entered, so it has no trigger. Clear the trigger of the ' + describeRel(model, t, ids) + '.');
      if (!entry && (str(t.name).trim() || str(t.doc).trim() || str(t.effect).trim())) add(t.id, 'The transition out of the initial node carries a name, a doc or an effect only when it leaves an entry action. Add an action with the role entry to ' + shown(owner.name) + ', or clear it.');
    });
  }

  // -- States.

  function stateHead(model, el, h) { return h.headOf(el) + (el.parallel === true ? ' parallel' : ''); }
  // Whether an element gets a line of its own in the text (its kind's head isn't null for it).
  function writesItself(model, el, h) { const kind = KINDS[el.kind]; return !kind.head || kind.head(model, el, h) !== null; }
  // A state's body opens with the entry idiom for its initial node, entry; then first; (if g then first; when the
  // transition is guarded), unless an entry action takes its place: then writeTransition writes the initial node's
  // transition from that action (the Annex A idiom). The idiom has no body a note on that transition could go in, so
  // such a note annotates the state and says what it is on. A parallel state with nothing inside still gets braces,
  // since parallel can't end in a semicolon: an empty line opens them.
  function stateBody(model, el, depth, h) {
    const initial = childrenOf(model, el.id).find((e) => e.kind === 'InitialNode');
    const t = initial ? behaviorLinksOf(model, initial.id, 'TransitionUsage').outOf.find((r) => h.ids.has(r.to)) : null;
    if (initial && t && el.parallel !== true && !entryActionOf(model, el.id)) {
      const guard = str(t.guard).trim();
      h.line(depth, 'entry;');
      h.line(depth, (guard ? 'if ' + guard + ' then ' : 'then ') + behaviorEndPath(model, el.id, h.ids.get(t.to), h.ids) + ';');
      // A named transition's notes are the notes block's (about the name the check asks the user to clear).
      if (!str(t.name).trim()) h.notesOn(t.id).forEach((n) => h.note(depth, n, null, 'On ' + describeRel(model, t, h.ids) + ': ' + n.text));
      return;
    }
    if (el.parallel === true && !el.doc.trim() && !h.declaredIn(el.id).length && !childrenOf(model, el.id).some((k) => writesItself(model, k, h))) h.line(0, '');
  }
  function checkState(model, el, ids, add) {
    const what = describe(model, el, ids);
    ['entry', 'do', 'exit'].forEach((role) => {
      const acts = childrenOf(model, el.id).filter((e) => e.kind === 'ActionUsage' && e.role === role);
      if (acts.length > 1) acts.forEach((a) => add(a.id, what + ' has ' + acts.length + ' ' + role + ' actions; a state has one at most.'));
    });
    // The initial node's transition leaves the entry action by name (transition first init then s1;), so an unnamed
    // entry action leaves it nowhere to be written.
    const entry = entryActionOf(model, el.id);
    if (entry && !entry.name.trim() && childrenOf(model, el.id).some((e) => e.kind === 'InitialNode')) {
      add(entry.id, 'The entry action of ' + what + ' has no name, so the transition out of the initial node can\'t leave it. Name it.');
    }
    checkInheritedName(model, el, ids, add);
  }

  // -- Successions and transitions.

  // A succession or transition statement: the head alone, or with a body holding its doc and, when it has no name a
  // note could be about, its notes.
  function writeBehaviorRel(h, rel, head, depth) {
    const inside = str(rel.name).trim() ? [] : h.notesOn(rel.id);
    if (!str(rel.doc).trim() && !inside.length) { h.line(depth, head + ';'); return; }
    h.line(depth, head + ' {');
    if (str(rel.doc).trim()) h.comment(depth + 1, 'doc', rel.doc);
    inside.forEach((n) => h.note(depth + 1, n, null));
    h.line(depth, '}');
  }
  // A named succession or transition is a feature of the body it is written in, so its name can't be that of an
  // element or of an earlier named line declared there, nor one every action and state inherits.
  function checkBehaviorRelName(model, rel, ids, add) {
    const name = str(rel.name).trim();
    if (!name) return;
    const o = RELATIONSHIPS[rel.kind].owner(model, rel, ids);
    const before = model.relationships.slice(0, model.relationships.indexOf(rel));
    if (nameTakenBeside(model, rel, ids, before)) add(rel.id, 'The ' + describeRel(model, rel, ids) + ' is named like something else beside it. Rename one.');
    if (o !== null && INHERITED_BEHAVIOR_NAMES.has(name)) add(rel.id, 'The name ' + name + ' is one every action and state already has inside it. Rename the ' + describeRel(model, rel, ids) + '.');
  }
  // Both ends of a succession or transition are written in one body: the innermost element holding both, or the
  // package when both are at the top. Across two definitions there is no such body, and a parallel state holds
  // neither successions nor transitions.
  function behaviorBodyProblem(model, a, b, ids, what) {
    const owner = commonOwner(model, a, b, ids);
    if (owner === null) return acrossDefinitions(model, 'A ' + what, a, b, ids, 'Draw it inside one ' + (what === 'succession' ? 'action def, action or part' : 'state def or state') + '.');
    const o = ids.get(owner);
    if (o.parallel === true) return describe(model, o, ids) + ' runs its regions in parallel, so it can\'t hold a ' + what + ' between ' + describe(model, a, ids) + ' and ' + describe(model, b, ids) + '. Draw it inside one region.';
    return null;
  }
  function successionFirst(model, a, ids) {
    if (!hasTrait(a.kind, 'successionEnd')) return 'A succession leaves an action or a control node; ' + describe(model, a, ids) + ' is neither.';
    if (a.kind === 'DoneNode') return 'Nothing leaves ' + describe(model, a, ids) + ': done is where the flow ends.';
    return null;
  }
  function successionEnds(model, a, b, ids) {
    const problem = successionFirst(model, a, ids);
    if (problem) return problem;
    if (!hasTrait(b.kind, 'successionEnd')) return 'A succession leads to an action or a control node; ' + describe(model, b, ids) + ' is neither.';
    if (b.kind === 'StartNode') return 'Nothing leads into ' + describe(model, b, ids) + ': start is where the flow begins.';
    return behaviorBodyProblem(model, a, b, ids, 'succession');
  }
  function successionLabel(rel) {
    const guard = str(rel.guard).trim();
    return guard === 'else' ? 'else' : guard ? '[' + guard + ']' : str(rel.name).trim();
  }
  // The branches a decision writes in its block right after its own line (if g then a; … else z;), which is the only
  // place else can go: its unnamed outgoing successions that stay in its body, when one of them is the else; null
  // when there is no else to write. A named branch, or one that leaves the body, is a succession of its own.
  function blockBranches(model, el, ids) {
    const out = behaviorLinksOf(model, el.id, 'SuccessionAsUsage').outOf.filter((r) => ids.has(r.to));
    if (!out.some((r) => str(r.guard).trim() === 'else')) return null;
    const ownerId = el.owner === undefined ? null : el.owner;
    return out.filter((r) => !str(r.name).trim() && commonOwner(model, el, ids.get(r.to), ids) === ownerId);
  }
  function coveredByBlock(model, rel, ids) {
    const a = ids.get(rel.from);
    if (!a || a.kind !== 'DecisionNode') return false;
    const branches = blockBranches(model, a, ids);
    return !!branches && branches.indexOf(rel) >= 0;
  }
  // A decision's block: the unguarded branches first (then a;), the guarded ones (if g then b;), the else last.
  function decisionBranches(model, el, depth, h) {
    const branches = blockBranches(model, el, h.ids);
    if (!branches) return;
    const rank = (r) => { const g = str(r.guard).trim(); return g === 'else' ? 2 : g ? 1 : 0; };
    const ownerId = el.owner === undefined ? null : el.owner;
    branches.slice().sort((a, b) => rank(a) - rank(b)).forEach((r) => {
      const g = str(r.guard).trim();
      writeBehaviorRel(h, r, (g === 'else' ? 'else ' : g ? 'if ' + g + ' then ' : 'then ') + behaviorEndPath(model, ownerId, h.ids.get(r.to), h.ids), depth);
    });
  }
  function checkSuccession(model, rel, ids, add) {
    const a = ids.get(rel.from);
    const b = ids.get(rel.to);
    if (str(rel.guard).trim() === 'else' && a && b) {
      if (a.kind !== 'DecisionNode') add(rel.id, 'An else branch leaves a decision; the ' + describeRel(model, rel, ids) + ' leaves ' + describe(model, a, ids) + '. Give it a guard instead.');
      else if (str(rel.name).trim()) add(rel.id, 'An else branch has no name in the text. Clear the name of the ' + describeRel(model, rel, ids) + ', or give it a guard.');
      else if (commonOwner(model, a, b, ids) !== (a.owner === undefined ? null : a.owner)) add(rel.id, 'The else branch out of ' + describe(model, a, ids) + ' must lead to something beside it, inside ' + (a.owner !== undefined ? shown(ids.get(a.owner).name) : 'the package') + '.');
    }
    checkBehaviorRelName(model, rel, ids, add);
  }
  // first a then b; named succession n first a then b; guarded first a if g then b; with a body for a doc or the notes
  // of an unnamed one (afv02, afv04, afv11, afv16). An else branch is written by its decision's block; one the block
  // can't hold is written plain, and the check says why.
  function writeSuccession(model, rel, ownerId, depth, out, h) {
    if (coveredByBlock(model, rel, h.ids)) return;
    const a = h.ids.get(rel.from);
    const b = h.ids.get(rel.to);
    const guard = str(rel.guard).trim();
    const head = (str(rel.name).trim() ? 'succession ' + quote(rel.name) + ' ' : '') + 'first ' + behaviorEndPath(model, ownerId, a, h.ids) +
      (guard && guard !== 'else' ? ' if ' + guard : '') + ' then ' + behaviorEndPath(model, ownerId, b, h.ids);
    writeBehaviorRel(h, rel, head, depth);
  }
  function transitionFirst(model, a, ids) {
    if (!hasTrait(a.kind, 'transitionEnd')) return 'A transition leaves a state, an initial node or an action; ' + describe(model, a, ids) + ' is none of those.';
    if (a.kind === 'DoneNode') return 'Nothing leaves ' + describe(model, a, ids) + ': done is where the state machine ends.';
    return null;
  }
  // A transition's two ends share a state def or a state, the innermost one holding both, which is where it is
  // written; the initial node's transition stays inside the node's own state.
  function transitionEnds(model, a, b, ids) {
    const problem = transitionFirst(model, a, ids);
    if (problem) return problem;
    if (!hasTrait(b.kind, 'transitionEnd')) return 'A transition leads to a state, an action or done; ' + describe(model, b, ids) + ' is none of those.';
    if (b.kind === 'InitialNode') return 'Nothing leads into ' + describe(model, b, ids) + ': it is where its state begins.';
    if (b.kind === 'StartNode') return 'Nothing leads into ' + describe(model, b, ids) + ': start is where the flow begins.';
    const owner = commonOwner(model, a, b, ids);
    const o = owner === null ? null : ids.get(owner);
    if (!o || !isStateOwner(o.kind)) return 'A transition needs a state def or a state around both its ends; ' + describe(model, a, ids) + ' and ' + describe(model, b, ids) + ' have none. Draw it inside one state def or state.';
    if (a.kind === 'InitialNode' && a.owner !== owner) return 'The transition out of ' + describe(model, a, ids) + ' stays inside ' + shown(ids.get(a.owner).name) + '; ' + describe(model, b, ids) + ' is outside it.';
    return behaviorBodyProblem(model, a, b, ids, 'transition');
  }
  // The notation's label: trigger [guard] / effect, each when present; the name isn't part of it.
  function transitionLabel(rel) {
    const parts = [];
    if (str(rel.trigger).trim()) parts.push(str(rel.trigger).trim());
    if (str(rel.guard).trim()) parts.push('[' + str(rel.guard).trim() + ']');
    if (str(rel.effect).trim()) parts.push('/ ' + str(rel.effect).trim());
    return parts.join(' ');
  }
  function checkTransition(model, rel, ids, add) {
    const a = ids.get(rel.from);
    if (a && str(rel.trigger).trim() && a.kind !== 'StateUsage') {
      add(rel.id, 'A transition with a trigger starts at a state; the ' + describeRel(model, rel, ids) + ' starts at ' + describe(model, a, ids) + '. Clear the trigger, or start it at a state.');
    }
    // The initial node's transition drops its trigger anyway (checkPseudoNode says so); any other is written after accept.
    if (a && a.kind !== 'InitialNode' && str(rel.trigger).trim()) checkNamedType(model, rel.id, rel.trigger, 'The trigger ' + str(rel.trigger).trim() + ' of the ' + describeRel(model, rel, ids), add);
    checkBehaviorRelName(model, rel, ids, add);
  }
  // transition [name] first src [accept trigger] [if guard] [do effect] then tgt; with a body for a doc or the notes of
  // an unnamed one (stv-04, stv-13, b01). The initial node's transition leaves the state's entry action when it has
  // one (stv-10, b02); without one the state's body wrote it as entry; then first; and nothing is written here.
  function writeTransition(model, rel, ownerId, depth, out, h) {
    const a = h.ids.get(rel.from);
    const b = h.ids.get(rel.to);
    let source = behaviorEndPath(model, ownerId, a, h.ids);
    let trigger = str(rel.trigger).trim();
    if (a.kind === 'InitialNode') {
      const entry = a.owner !== undefined ? entryActionOf(model, a.owner) : null;
      if (!entry || !entry.name.trim()) return;
      source = behaviorEndPath(model, ownerId, entry, h.ids);
      trigger = '';
    }
    const guard = str(rel.guard).trim();
    const effect = str(rel.effect).trim();
    const head = 'transition ' + (str(rel.name).trim() ? quote(rel.name) + ' ' : '') + 'first ' + source +
      (trigger ? ' accept ' + trigger : '') + (guard ? ' if ' + guard : '') + (effect ? ' do ' + effect : '') + ' then ' + behaviorEndPath(model, ownerId, b, h.ids);
    writeBehaviorRel(h, rel, head, depth);
  }

  EXTRA.sendWord = function (model, target) { return namesAPort(model, target) ? 'via' : 'to'; };
  EXTRA.isActionOwner = isActionOwner;
  EXTRA.isStateOwner = isStateOwner;
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
  // Geometry. A part or item with the spatial trait may carry a shape with its dimensions and a position, numbers in
  // its own unit; a number that isn't set is '' and is neither drawn to scale nor written. The dimensions a shape has
  // are exactly those its ShapeItems kind owns (Box is RectangularCuboid), so a dimension always names a feature of the
  // shape: with SI::* imported a wrong name would resolve to the ISQ quantity and pass the validator silently.
  const GEO_DIMS = { Box: ['length', 'width', 'height'], Rectangle: ['length', 'width'], CircularCylinder: ['radius', 'height'], Sphere: ['radius'], CircularCone: ['radius', 'height'] };
  const GEO_UNITS = ['m', 'mm', 'cm', 'km', 'ft', 'in'];
  const GEO_METRES = { m: 1, mm: 0.001, cm: 0.01, km: 1000, ft: 0.3048, in: 0.0254 };
  // The names the text brings in from the library when anything is drawn to scale, and the packages it imports them
  // from (an element named SI beside private import SI::*; takes the import's place, and no unit resolves); an element
  // named like one would shadow it in the text.
  const GEO_LIBRARY_NAMES = new Set(['ShapeItems', 'SpatialItems', 'MeasurementReferences', 'SI', 'USCustomaryUnits', 'SpatialItem', 'Translation', 'TranslationRotationSequence'].concat(Object.keys(GEO_DIMS), GEO_UNITS));
  function geoDims(shape) { return GEO_DIMS[shape] || null; }
  function geoUnitOf(el) { return GEO_UNITS.indexOf(el.unit) >= 0 ? el.unit : 'm'; }
  // A length in one unit, in another.
  function geoConvert(value, from, to) { return value * GEO_METRES[GEO_UNITS.indexOf(from) >= 0 ? from : 'm'] / GEO_METRES[GEO_UNITS.indexOf(to) >= 0 ? to : 'm']; }
  function geoSet(v) { return typeof v === 'number' && Number.isFinite(v); }
  // Whether an element has a position: any of its three coordinates set (the others count as 0).
  function geoPlaced(el) { return hasTrait(el.kind, 'spatial') && (geoSet(el.posX) || geoSet(el.posY) || geoSet(el.posZ)); }
  // The dimensions of its shape an element sets.
  function geoDimsSet(el) { const dims = hasTrait(el.kind, 'spatial') ? geoDims(el.shape) : null; return dims ? dims.filter((d) => geoSet(el[d])) : []; }
  // Whether the text says anything spatial about an element: a shape, or a position.
  function geoExported(el) { return hasTrait(el.kind, 'spatial') && (!!geoDims(el.shape) || geoPlaced(el)); }
  // A number as the text writes it: as JavaScript prints it, but never in exponent form.
  function geoNumber(v) {
    const s = String(v);
    if (!/e/i.test(s)) return s;
    return Math.abs(v) >= 1e21 ? BigInt(Math.round(v)).toString() : v.toFixed(12).replace(/0+$/, '').replace(/\.$/, '');
  }
  // A quantity with its unit: 2 [m], 24 ['in'] (in is a keyword, so quote() quotes it).
  function geoQuantity(v, unit) { return geoNumber(v) + ' [' + quote(unit) + ']'; }
  // The usages an element takes bound values from in the text: the inherited feature it redefines (the same name as one
  // its owner inherits, which headOf writes as :>>), the usages it specializes (:>), and theirs in turn. A dimension or
  // the position one of them binds can't be bound again on the element: the validator refuses to override it.
  function geoGenerals(model, el, ids) {
    const out = [];
    const seen = new Set([el.id]);
    const walk = (e) => {
      const owner = e.owner !== undefined ? ids.get(e.owner) : null;
      const inherited = owner && e.name.trim() ? inheritedFeatures(model, owner, ids).get(e.name.trim()) : null;
      const next = model.relationships.filter((r) => r.kind === 'Specialization' && r.from === e.id).map((r) => ids.get(r.to));
      if (inherited && inherited.kind === e.kind) next.push(inherited);
      next.forEach((g) => { if (g && !seen.has(g.id)) { seen.add(g.id); out.push(g); walk(g); } });
    };
    walk(el);
    return out;
  }
  // What keeps a spatial element's text from being right, beyond what the validator says: a dimension that isn't a
  // length, a position on a usage that stands for several parts (the text would place them all at one point), and a
  // dimension or position bound twice along the :>> and :> chain ("Cannot override a binding feature value").
  function geoCheck(model, el, ids, add) {
    if (!hasTrait(el.kind, 'spatial')) return;
    const what = describe(model, el, ids);
    const dims = geoDimsSet(el);
    dims.forEach((d) => { if (el[d] <= 0) add(el.id, 'The ' + d + ' of ' + what + ' is ' + geoNumber(el[d]) + '; a dimension must be more than 0.'); });
    const placed = geoPlaced(el);
    if (placed && el.multiplicity && el.multiplicity !== '1') add(el.id, what + ' has a position, which places one ' + KINDS[el.kind].label + ', but its multiplicity is ' + el.multiplicity + '. Make it 1 or clear it.');
    if (!placed && !dims.length) return;
    geoGenerals(model, el, ids).forEach((g) => {
      const from = describe(model, g, ids);
      if (placed && geoPlaced(g)) add(el.id, what + ' takes its position from ' + from + ' and sets one of its own. The text can\'t bind it twice: clear one of them.');
      geoDimsSet(g).filter((d) => dims.indexOf(d) >= 0).forEach((d) => add(el.id, what + ' takes its ' + d + ' from ' + from + ' and sets one of its own. The text can\'t bind it twice: clear one of them.'));
    });
  }
  // An element named like a library name the geometry text imports shadows it where that text can see it, and the
  // text breaks. The text sits in the body of the element drawn to scale, where a name resolves through the members
  // of that body, of each owner's body on the way up (inherited ones included) and of the package; a port named in
  // on a part beside the spatial one is out of its sight (the pilot resolves ['in'] to the unit there), and so is
  // the hidden name of a kind the text never declares (a start node).
  function geoNameCheck(model, el, ids, add) {
    const name = el.name.trim();
    if (!hasName(el.kind) || !GEO_LIBRARY_NAMES.has(name) || !model.elements.some((x) => geoExported(x) && geoSees(model, x, el, ids))) return;
    add(el.id, 'The name ' + name + ' is one the geometry text brings in from the library, so the text would mix them up. Rename ' + describe(model, el, ids) + '.');
  }
  // Whether the geometry text of x sees el by name: el is at the top of the package, or right inside x or one of its
  // owners, or a feature x or one of its owners inherits.
  function geoSees(model, x, el, ids) {
    return el.owner === undefined || chain(model, x, ids).some((a) => a.id === el.owner || inheritedFeatures(model, a, ids).get(el.name.trim()) === el);
  }
  // The spatial statements of a usage's body: its shape with the dimensions it sets, then its position as a translation
  // of its coordinate frame, with the imports they need (validated: critique/g01, g02, g08b, g10, g11; the units, a
  // shape without dimensions and the heads headOf makes, slices/geometry/v01, v03, v04).
  function writeGeometry(model, el, depth, h) {
    if (!geoExported(el)) return;
    const unit = geoUnitOf(el);
    const dims = geoDims(el.shape);
    h.needImport('SI::*');
    if (unit === 'ft' || unit === 'in') h.needImport('USCustomaryUnits::*');
    if (dims) {
      h.needImport('ShapeItems::*');
      const set = dims.filter((d) => geoSet(el[d]));
      if (!set.length) h.line(depth, 'item :>> shape : ' + el.shape + ';');
      else {
        h.line(depth, 'item :>> shape : ' + el.shape + ' {');
        set.forEach((d) => h.line(depth + 1, ':>> ' + d + ' = ' + geoQuantity(el[d], unit) + ';'));
        h.line(depth, '}');
      }
    }
    if (geoPlaced(el)) {
      h.needImport('SpatialItems::*');
      h.needImport('MeasurementReferences::*');
      const at = ['posX', 'posY', 'posZ'].map((k) => geoQuantity(geoSet(el[k]) ? el[k] : 0, unit)).join(', ');
      h.line(depth, 'attribute :>> coordinateFrame {');
      h.line(depth + 1, ':>> transformation : TranslationRotationSequence {');
      h.line(depth + 2, ':>> elements = (new Translation((' + at + ')));');
      h.line(depth + 1, '}');
      h.line(depth, '}');
    }
  }
  BODY.push(writeGeometry);
  // A positioned usage is typed as a spatial item, after whatever head it has, and sits among its owner's spatial parts
  // (or items) when the owner has a position too; under a plain owner or the package it is only typed, since
  // subSpatialParts resolves only in a spatial item (validated heads: g08b, g10, g11, v01, v02, v04).
  function wrapGeometryHead(kind, subset) {
    const prev = kind.head;
    kind.head = function (model, el, h) {
      const base = prev ? prev(model, el, h) : h.headOf(el);
      if (base === null || !geoPlaced(el)) return base;
      const owner = el.owner !== undefined ? h.ids.get(el.owner) : null;
      return base + ' : SpatialItem' + (owner && geoPlaced(owner) ? ' :> ' + subset : '');
    };
  }
  function wrapCheck(kind, check) {
    const prev = kind.check;
    kind.check = function (model, el, ids, add) { if (prev) prev(model, el, ids, add); check(model, el, ids, add); };
  }
  if (KINDS.PartUsage) { wrapGeometryHead(KINDS.PartUsage, 'subSpatialParts'); wrapCheck(KINDS.PartUsage, geoCheck); }
  if (KINDS.ItemUsage) { wrapGeometryHead(KINDS.ItemUsage, 'subSpatialItems'); wrapCheck(KINDS.ItemUsage, geoCheck); }
  Object.keys(KINDS).forEach((k) => wrapCheck(KINDS[k], geoNameCheck));
  EXTRA.GEO_UNITS = GEO_UNITS;
  EXTRA.geoDims = geoDims;
  EXTRA.geoUnitOf = geoUnitOf;
  EXTRA.geoConvert = geoConvert;
  EXTRA.geoPlaced = geoPlaced;
  EXTRA.geoNumber = geoNumber;
  // The grid view's columns, in the order a table shows them, and a view's grid options read safely, whatever a file
  // carries: mode is table unless it says matrix, columns are the known ones in this order (the defaults when none is
  // known), and sort is a column name, with a leading - for descending, or null for the model's order. The page draws
  // from this reading and the export's render clause reads the mode from it, so both see one thing.
  const GRID_COLUMNS = ['kind', 'name', 'type', 'multiplicity', 'owner', 'doc', 'specializes', 'notes', 'code', 'problems'];
  function gridOptions(view) {
    const o = view && isObject(view.options) ? view.options : {};
    const wanted = Array.isArray(o.columns) ? o.columns : [];
    let columns = GRID_COLUMNS.filter((c) => wanted.indexOf(c) >= 0);
    if (!columns.length) columns = VIEW_KINDS.GridView.options.columns.slice();
    const sort = typeof o.sort === 'string' && GRID_COLUMNS.indexOf(o.sort.replace(/^-/, '')) >= 0 ? o.sort : null;
    return { mode: o.mode === 'matrix' ? 'matrix' : 'table', columns: columns, sort: sort };
  }
  EXTRA.GRID_COLUMNS = GRID_COLUMNS;
  EXTRA.gridOptions = gridOptions;
  // ---- The browser view: the model as a tree.
  // The elements a browser view's tree starts from: null for the whole package (every element at the top), else the
  // elements its roots option names that are in the model, in model order, leaving out one that sits inside another
  // root, since that root's subtree shows it already. A roots option that isn't a list counts as the whole package.
  function browserRoots(model, view, ids) {
    ids = ids || index(model);
    const want = view.options && Array.isArray(view.options.roots) ? view.options.roots : null;
    if (want === null) return null;
    const set = new Set(want.filter((id) => typeof id === 'string' && ids.has(id)));
    return model.elements.filter((e) => set.has(e.id) && !chain(model, e, ids).slice(0, -1).some((o) => set.has(o.id)));
  }
  // The rows of a browser view, in order: a depth-first walk from its roots in model order, each element a row with
  // what it owns under it, unless the view folds it (its id in options.collapsed), then the relationships declared in
  // it. The package's relationships, and those declared above a root, come last. A relationship is a row only when
  // both of its ends are rows, so what is drawn in the view is what pins and badges can find. Each row is
  // { type: 'el' | 'rel', id, item, depth, kids (whether anything is inside it), folded }.
  function browserRows(model, view, ids) {
    ids = ids || index(model);
    const roots = browserRoots(model, view, ids);
    const folded = new Set(view.options && Array.isArray(view.options.collapsed) ? view.options.collapsed : []);
    const nodes = new Map(); // element id → its node, for the elements that are rows
    const branch = (el, depth) => {
      const kids = childrenOf(model, el.id).filter((k) => !nodes.has(k.id));
      const n = { row: { type: 'el', id: el.id, item: el, depth: depth, kids: kids.length > 0, folded: folded.has(el.id) }, under: [], rels: [] };
      nodes.set(el.id, n);
      if (!n.row.folded) kids.forEach((k) => n.under.push(branch(k, depth + 1)));
      return n;
    };
    const tops = [];
    (roots === null ? childrenOf(model, null) : roots).forEach((e) => { if (!nodes.has(e.id)) tops.push(branch(e, 0)); });
    const tail = [];
    model.relationships.forEach((rel) => {
      if (!nodes.has(rel.from) || !nodes.has(rel.to)) return;
      const owner = RELATIONSHIPS[rel.kind].owner(model, rel, ids);
      const at = owner === null ? null : nodes.get(owner) || null;
      const row = { type: 'rel', id: rel.id, item: rel, depth: at ? at.row.depth + 1 : 0 };
      if (at) at.rels.push(row); else tail.push(row);
    });
    const out = [];
    const flatten = (n) => { out.push(n.row); n.under.forEach(flatten); n.rels.forEach((r) => out.push(r)); };
    tops.forEach(flatten);
    return out.concat(tail);
  }
  EXTRA.browserRoots = browserRoots;
  EXTRA.browserRows = browserRows;
  // The names the notes' forms take from the standard library (private import ModelingMetadata::*): a model element
  // named like one of them would shadow the import, and the validator then can't type the metadata.
  ['Issue', 'Rationale', 'StatusInfo', 'StatusKind', 'ModelingMetadata'].forEach((n) => RESERVED_NAMES.add(n));

  // The code links of an element from what a file carries: a list of { path, language, text } strings, the language in
  // lower case; anything that isn't a list is no links. A link with neither a path nor a text is kept: the page adds a
  // link empty and fills it in, and undoing the path must bring the empty link back, not drop it.
  function tidyCode(raw) {
    if (!Array.isArray(raw)) return [];
    const out = [];
    for (const c of raw) {
      if (!c || typeof c !== 'object') continue;
      out.push({ path: str(c.path), language: str(c.language).toLowerCase(), text: str(c.text) });
    }
    return out;
  }
  // A SysML string literal: double quotes, with the backslash, the quote, the line breaks and the tabs escaped.
  function metaString(s) {
    return '"' + String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r\n?/g, '\n').replace(/\n/g, '\\n').replace(/\t/g, '\\t') + '"';
  }
  // A code link as a textual representation inside its element's body: rep '<path>' language "<language>", then the
  // text as the comment body, on the same line when it is one line, else as a block with each line after a star (the
  // form the pilot reads indentation back from). A link with no path takes the bare form, language "…" /* … */. The
  // one change made to the text is that */ is written * /, since it would end the comment.
  function codeLines(depth, link) {
    const ind = '    '.repeat(depth);
    const head = (link.path.trim() ? 'rep ' + quote(link.path) + ' ' : '') + 'language ' + metaString(link.language);
    const text = link.text.replace(/\r\n?/g, '\n').replace(/\*\//g, '* /').replace(/^\n+|\n+$/g, '');
    if (!text) return [ind + head + ' /* */'];
    if (text.indexOf('\n') < 0) return [ind + head + ' /* ' + text + ' */'];
    return [ind + head, ind + '/*'].concat(text.split('\n').map((l) => ind + ' * ' + l)).concat([ind + ' */']);
  }
  // The body writer: every element's code links, after its doc.
  function writeCodeReps(model, el, depth, h) {
    if (!Array.isArray(el.code)) return;
    el.code.forEach((link) => codeLines(depth, link).forEach((l) => h.line(0, l)));
  }
  BODY.push(writeCodeReps);
  // A note on an element the text can't name (it, or what it is in, has no name) can't be about it by name, so it is
  // written inside the element's body, where it annotates the element itself: the unnamed connection's form.
  function writeBodyNotes(model, el, depth, h) {
    if (nameable(model, el, h.ids)) return;
    h.notesOn(el.id).forEach((n) => h.note(depth, n, null));
  }
  BODY.push(writeBodyNotes);

  // The notes the text writes, open and archived together: each with its number (in number order, each number used
  // once, so a note's short name <nN> is its own), its target (an id, or null for a note that floats free on the
  // plane), its text, Claude's response, whether it is resolved, and, for an archived note, that it is and the
  // resolution it was archived with.
  function noteRecords(notes, archive) {
    const take = (list, archived) => (Array.isArray(list) ? list : [])
      .filter((n) => n && typeof n === 'object' && (typeof n.target === 'string' || n.target === null) && typeof n.text === 'string')
      .map((n) => ({
        no: n.no >= 1 ? Math.floor(n.no) : 0, target: n.target, text: n.text, response: str(n.response),
        resolved: n.resolved === true || archived, archived: archived, resolution: archived ? str(n.resolution) : ''
      }));
    const list = take(notes, false).concat(take(archive, true)).map((n, i) => Object.assign(n, { i: i })).sort((a, b) => (a.no - b.no) || (a.i - b.i));
    const used = new Set();
    let top = list.reduce((m, n) => Math.max(m, n.no), 0);
    for (const n of list) {
      if (!n.no || used.has(n.no)) n.no = ++top;
      used.add(n.no);
    }
    return list;
  }
  // A note in the standard library's forms (ModelingMetadata): an Issue named <nN> with the note's text, about what
  // about names (nothing: the statement's owner, which is the package for a free note and the relationship for a note
  // inside its body); a Rationale about the issue with Claude's response, or with the resolution of an archived note,
  // when there is one; and a StatusInfo about it: open, done once the note is resolved, closed once it is archived.
  // text, when given, replaces the note's own (a note on a line that has to be named in it).
  function noteStatements(n, about, text) {
    const name = 'n' + n.no;
    const why = (n.archived ? n.resolution : n.response).trim();
    const out = ['metadata <' + name + '> : Issue' + (about ? ' about ' + about : '') + ' { text = ' + metaString(text === undefined ? n.text : text) + '; }'];
    if (why) out.push('metadata Rationale about ' + name + ' { text = ' + metaString(why) + '; }');
    out.push('metadata StatusInfo about ' + name + ' { status = StatusKind::' + (n.archived ? 'closed' : n.resolved ? 'done' : 'open') + '; }');
    return out;
  }
  EXTRA.tidyCode = tidyCode;
  EXTRA.noteRecords = noteRecords;
  EXTRA.noteStatements = noteStatements;

  // What keeps the model from being correct SysML. Each problem names the element, relationship, or view it is about
  // (null: the package).
  function validate(model) {
    const problems = [];
    const ids = index(model);
    const add = (id, message) => problems.push({ id, message });
    const siblings = new Map();
    const definitionNames = new Set(model.elements.filter((e) => KINDS[e.kind].definition).map((e) => e.name.trim()).filter(Boolean));
    const inRelationship = new Set();
    model.relationships.forEach((r) => { inRelationship.add(r.from); inRelationship.add(r.to); });
    const pkgName = model.package.name.trim();
    for (const el of model.elements) {
      const kind = KINDS[el.kind];
      const name = el.name.trim();
      const owner = el.owner !== undefined ? ids.get(el.owner) : null;
      const where = owner ? ' in ' + shown(owner.name) : '';
      // A kind with no name field is never unnamed.
      if (!name && hasName(el.kind)) {
        if (kind.definition) add(el.id, an(kind.label, true) + ' has no name.');
        else if (inRelationship.has(el.id) || childrenOf(model, el.id).length) add(el.id, an(kind.label, true) + where + ' has no name, so nothing can refer to it. Name it.');
      }
      if (el.multiplicity && (!MULTIPLICITY.test(el.multiplicity) || !boundsOk(el.multiplicity))) {
        add(el.id, 'The multiplicity "' + el.multiplicity + '" of ' + describe(model, el, ids) + ' is not like 1, 0..1, or 1..*.');
      }
      // The name rules are for names the text writes: a kind with no name field (a start node, which the page names
      // start1 for itself) takes no part in them.
      if (name && hasName(el.kind)) {
        // Two with one name beside each other: both are marked, since either could be the one to rename.
        const key = (el.owner === undefined ? '' : el.owner) + '/' + name;
        const twin = siblings.get(key);
        if (twin) {
          const message = 'Two elements are named ' + name + (owner ? where : ' in the package') + '.';
          if (!twin.marked) { twin.marked = true; add(twin.el.id, message); }
          add(el.id, message);
        } else siblings.set(key, { el: el, marked: false });
        if (kind.usage && definitionNames.has(name)) add(el.id, describe(model, el, ids) + ' is named like a definition, so the text would mix them up. Rename one.');
        if (name === pkgName) add(el.id, describe(model, el, ids) + ' is named like the package, so the text would mix them up. Rename one.');
        if (RESERVED_NAMES.has(name)) add(el.id, 'The name ' + name + ' belongs to the standard library. Rename ' + describe(model, el, ids) + '.');
        const inherited = owner ? inheritedFeatures(model, owner, ids).get(name) : null;
        if (inherited && inherited.kind !== el.kind) {
          add(el.id, describe(model, el, ids) + ' is named like the ' + KINDS[inherited.kind].label + ' ' + name + ' that ' + shown(owner.name) + ' inherits. Rename it.');
        }
      }
      if (kind.check) kind.check(model, el, ids, add);
    }
    // Views: named like something at the top of the package, or two with one name; then the kind's own checks.
    const viewNames = new Map();
    for (const v of model.views) {
      const vname = v.name.trim();
      if (vname) {
        if (siblings.has('/' + vname) || vname === pkgName) add(v.id, 'The view ' + vname + ' is named like something else in the package. Rename one.');
        if (viewNames.has(vname)) add(v.id, 'Two views are named ' + vname + '. Rename one.');
        viewNames.set(vname, v);
      }
      const vkind = VIEW_KINDS[v.kind];
      if (vkind && vkind.check) vkind.check(model, v, ids, add);
    }
    // Relationships: the kind's rule on the pair of ends, then its own checks.
    for (const rel of model.relationships) {
      const a = ids.get(rel.from);
      const b = ids.get(rel.to);
      if (!a || !b) continue;
      const kind = RELATIONSHIPS[rel.kind];
      const problem = kind.ends(model, a, b, ids);
      if (problem) add(rel.id, problem);
      if (kind.check) kind.check(model, rel, ids, add);
    }
    return problems;
  }

  // ---- Textual SysML v2.

  // Breaks a paragraph into lines of at most width characters, at spaces.
  function wrapText(text, width) {
    const out = [];
    for (const para of text.split('\n')) {
      let line = '';
      for (const word of para.split(/\s+/).filter(Boolean)) {
        if (line && (line + ' ' + word).length > width) { out.push(line); line = word; }
        else line = line ? line + ' ' + word : word;
      }
      out.push(line);
    }
    return out;
  }
  function commentLines(depth, head, text) {
    const body = String(text == null ? '' : text).replace(/\r\n?/g, '\n').replace(/\*\//g, '* /').trim();
    const ind = '    '.repeat(depth);
    if (!body.includes('\n') && (ind + head + body).length <= 96) return [ind + head + ' /* ' + body + ' */'];
    return [ind + head, ind + '/*'].concat(wrapText(body, 92 - ind.length).map((l) => ind + ' * ' + l)).concat([ind + ' */']);
  }

  // The notes and the archived notes are written together, at the end of the package (noteRecords, noteStatements).
  function toSysML(model, notes, archive) {
    model = normalize(model);
    const ids = index(model);
    const rels = relIndex(model);
    const noteList = noteRecords(notes, archive);
    const out = [];
    const imports = new Set();
    const line = (depth, text) => out.push('    '.repeat(depth) + text);
    const comment = (depth, head, text) => commentLines(depth, head, text).forEach((l) => out.push(l));
    const noteText = (n) => n.text + (n.response.trim() ? '\nClaude: ' + n.response.trim() : '');
    // The relationships written as statements in an element's body (null: the package's), by each kind's own rule.
    const declaredIn = (ownerId) => model.relationships.filter((r) => RELATIONSHIPS[r.kind].toSysML && RELATIONSHIPS[r.kind].owner(model, r, ids) === ownerId);
    // What the hooks may use (a kind's head and body, a relationship kind's toSysML): line(depth, text) and
    // comment(depth, head, text) write out; needImport(qualifiedName) asks for a private import at the top of the
    // package; headOf(el) is the generated head of an element; the rest are the library's functions with the model
    // and its index filled in.
    const helpers = {
      ids: ids, line: line, comment: comment, noteText: noteText, quote: quote, featurePath: featurePath, shown: shown,
      notesOn: (id) => noteList.filter((n) => n.target === id),
      // A note in its standard forms (noteStatements), written at depth through this object's own line, so a hook's
      // lines land where its other lines do; about null writes it inside the body it is in. Asks for the import.
      note: function (depth, n, about, text) { noteStatements(n, about, text).forEach((s) => this.line(depth, s)); imports.add('ModelingMetadata::*'); },
      needImport: (qualifiedName) => imports.add(qualifiedName),
      headOf: headOf, declaredIn: declaredIn, exposesOf: exposesOf,
      typingOf: (el) => typingOf(model, el),
      childrenOf: (id) => childrenOf(model, id),
      describe: (el) => describe(model, el, ids),
      commonOwner: (a, b) => commonOwner(model, a, b, ids),
      qualified: (el) => qualified(model, el, ids)
    };

    // The head of an element's declaration, everything before the ' {' or ';'. A feature declared again under the
    // name of one its owner inherits, of the same kind, redefines it: :>>.
    function headOf(el) {
      const kind = KINDS[el.kind];
      const owner = el.owner !== undefined ? ids.get(el.owner) : null;
      const inherited = owner && el.name.trim() ? inheritedFeatures(model, owner, ids).get(el.name.trim()) : null;
      const redefines = !!inherited && inherited.kind === el.kind;
      // A usage may go unnamed ("part : Host;"); a definition can't, so an unnamed one is written as unnamed.
      const name = el.name.trim() ? quote(el.name) : (kind.definition ? quote('unnamed') : '');
      let head = (el.abstract ? 'abstract ' : '') + kind.keyword + (redefines ? ' :>> ' + quote(el.name) : (name ? ' ' + name : ''));
      if (kind.usage) {
        const typing = typingOf(model, el);
        if (typing) head += ' : ' + (el.conjugated ? '~' : '') + quote(ids.get(typing.to).name);
        if (el.multiplicity && MULTIPLICITY.test(el.multiplicity)) head += ' [' + el.multiplicity + ']';
      }
      const general = model.relationships.filter((r) => r.kind === 'Specialization' && r.from === el.id)
        .map((r) => quote(ids.get(r.to).name));
      if (general.length) head += ' :> ' + general.join(', ');
      return head;
    }
    // The head an element is written with: the kind's head hook's when it has one (null: the element is not written),
    // else the generated one. Asked once per element, since the parent asks before the child is written.
    const heads = new Map();
    function headFor(el) {
      const kind = KINDS[el.kind];
      if (!heads.has(el.id)) heads.set(el.id, kind.head ? kind.head(model, el, helpers) : headOf(el));
      return heads.get(el.id);
    }
    // An element: its head, then, when there is anything to put in it, a body with the doc, what the body writers and
    // the kind's body hook add, the children, and the relationships declared here; then what the kind's after hook
    // writes at the element's own depth. An element whose head is null is left out, with everything inside it (the
    // start and done nodes a view draws, which the notation has already). Returns whether anything was written.
    function element(el, depth) {
      const kind = KINDS[el.kind];
      const head = headFor(el);
      if (head === null) return false;
      // The children that are written, in the order they are written: by their kinds' writeOrder (lower first; every
      // core kind is at 0), then the border items before the boxes, then as the model has them (the sort is stable).
      const rank = (k) => (KINDS[k.kind].onBorder ? 0 : 1);
      const kids = childrenOf(model, el.id).filter((k) => headFor(k) !== null)
        .sort((a, b) => ((KINDS[a.kind].writeOrder || 0) - (KINDS[b.kind].writeOrder || 0)) || (rank(a) - rank(b)));
      const declared = declaredIn(el.id);
      // The hooks write into lines of their own first, so an element with nothing else gets a body when they add to it.
      const extra = [];
      const into = Object.assign({}, helpers, { line: (d, t) => extra.push('    '.repeat(d) + t), comment: (d, h, t) => commentLines(d, h, t).forEach((l) => extra.push(l)) });
      BODY.forEach((write) => write(model, el, depth + 1, into));
      if (kind.body) kind.body(model, el, depth + 1, into);
      if (!el.doc.trim() && !extra.length && !kids.length && !declared.length) line(depth, head + ';');
      else {
        line(depth, head + ' {');
        if (el.doc.trim()) comment(depth + 1, 'doc', el.doc);
        extra.forEach((l) => out.push(l));
        kids.forEach((k) => element(k, depth + 1));
        declared.forEach((r) => RELATIONSHIPS[r.kind].toSysML(model, r, el.id, depth + 1, out, helpers));
        line(depth, '}');
      }
      // What follows the element at its own depth, right after its line or its closing brace (a decision's "if g then
      // a;" lines after its "decide d;").
      if (kind.after) kind.after(model, el, depth, helpers);
      return true;
    }
    // The expose lines a view's layout gives: everything when every element is shown, else each shown element by its
    // qualified name (a start, done or initial node has no name in the text, nor has anything inside an unnamed
    // element, so those are left out). A kind's exposes hook may build on them through h.exposesOf(view).
    function exposesOf(v) {
      const shownCount = Object.keys(v.layout).length;
      return shownCount && shownCount === model.elements.length
        ? ['expose ' + quote(model.package.name) + '::*::**;']
        : model.elements.filter((e) => v.layout[e.id] && nameable(model, e, ids)).map((e) => 'expose ' + qualified(model, e, ids) + ';');
    }

    line(0, 'package ' + quote(model.package.name) + ' {');
    if (model.package.doc.trim()) comment(1, 'doc', model.package.doc);
    const importAt = out.length; // where the imports the bodies ask for go, once they are known
    const top = childrenOf(model, null);
    const ordered = top.filter((e) => KINDS[e.kind].definition).concat(top.filter((e) => !KINDS[e.kind].definition));
    ordered.forEach((el) => { out.push(''); if (!element(el, 1)) out.pop(); });
    const topRels = declaredIn(null);
    if (topRels.length) out.push('');
    topRels.forEach((r) => RELATIONSHIPS[r.kind].toSysML(model, r, null, 1, out, helpers));

    // Notes, in the standard library's forms at the end of the package (noteStatements): each an Issue named <nN>
    // about what it is on, with its status and Claude's answer about it, a blank line between notes. A note on a
    // specializes or defined-by line, which has no name in the textual notation, is about both of the line's ends,
    // with the line named in the text; a free note is about nothing, so it annotates the package; a note inside an
    // unnamed relationship's body is written there by the relationship's own toSysML (h.note), and a note on an element
    // the text can't name inside the element's body (writeBodyNotes).
    for (const n of noteList) {
      const el = n.target === null ? null : ids.get(n.target);
      const rel = n.target === null ? null : rels.get(n.target);
      let about = null;
      let text = n.text;
      if (el) {
        if (!nameable(model, el, ids)) continue; // written inside the element's body
        about = qualified(model, el, ids);
      } else if (rel && RELATIONSHIPS[rel.kind].toSysML) {
        if (!rel.name || !rel.name.trim()) continue; // written inside the relationship's body
        const o = RELATIONSHIPS[rel.kind].owner(model, rel, ids);
        about = (o ? qualified(model, ids.get(o), ids) : quote(model.package.name)) + '::' + quote(rel.name);
      } else if (rel) {
        about = qualified(model, ids.get(rel.from), ids) + ', ' + qualified(model, ids.get(rel.to), ids);
        text = 'On ' + describeRel(model, rel, ids) + ': ' + text;
      } else if (n.target !== null) {
        continue; // on something that is gone
      }
      out.push('');
      helpers.note(1, n, about, text);
    }

    // The views, each exposing what it shows (exposesOf), unless its kind says itself what the view's body holds (a
    // browser's layout is empty, so its kind's exposes hook does).
    for (const v of model.views) {
      if (!v.name.trim()) continue;
      const vkind = VIEW_KINDS[v.kind];
      const head = 'view ' + quote(v.name) + ' : ' + vkind.qualified;
      const exposes = vkind.exposes ? vkind.exposes(model, v, helpers) : exposesOf(v);
      out.push('');
      if (!v.doc.trim() && !exposes.length) { line(1, head + ';'); continue; }
      line(1, head + ' {');
      if (v.doc.trim()) comment(2, 'doc', v.doc);
      exposes.forEach((x) => line(2, x));
      line(1, '}');
    }
    line(0, '}');
    // The imports the bodies asked for: private, sorted, right after the package's doc, then a blank line unless the
    // next line is one already. Nothing asks for one yet, so the text is as it was.
    if (imports.size) {
      const lines = Array.from(imports).sort().map((q) => '    private import ' + q + ';');
      if (out[importAt] !== '') lines.push('');
      out.splice.apply(out, [importAt, 0].concat(lines));
    }
    return out.join('\n') + '\n';
  }

  // The library, with what the slices put in EXTRA beside it.
  root.SysMLModel = Object.freeze(Object.assign({
    FORMAT, KINDS, RELATIONSHIPS, VIEW_KINDS, FIELDS, SIDES, MULTIPLICITY, VIEW_DEF,
    blank, normalize, validate, toSysML, placement, canContain, admits, hasTrait, hasName, index, relIndex, viewIndex, shownIn, chain, childrenOf,
    descendants, typingOf, inUsage, specializes, commonOwner, featurePath, quote, qualified, describe, describeRel, describeView,
    labelFor, isName, inheritedFeatures, an, definable,
  }, EXTRA));
})(typeof globalThis !== 'undefined' ? globalThis : window);
