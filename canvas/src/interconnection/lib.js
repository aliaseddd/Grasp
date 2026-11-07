// Interconnection in the model library: item defs and items, interface defs, interfaces, flows and bindings, the
// interconnection view, and what a port carries, where a connector is declared and how it is written.
(function (root) {
  'use strict';
  const lib = root.SysMLModelLib;
  const {
    KINDS, RELATIONSHIPS, VIEW_KINDS, FIELDS, addKinds, addRelationships, hasTrait, textName, index, childrenOf, typingOf,
    specializes, commonOwner, acrossDefinitions, nameTakenBeside, quote, shown, featurePath, an, describe, describeRel,
    inheritedFeatures, EXTRA
  } = lib;

  addKinds({
    // Interconnection: items (what flows, and what a part holds) and interface definitions, whose ports are their ends.
    ItemDefinition: { keyword: 'item def', label: 'item def', contains: false, onBorder: false, size: [220, 72], shape: 'rect', fields: ['name', 'abstract', 'doc'], traits: [] },
    // An item's head carries its direction (in item x : T). On a port def it must have one: a port def may own only
    // ports and referential usages, as the validator says. Its shape, item, is the page's rounded box with the
    // direction inside the guillemets, «out item».
    ItemUsage: { keyword: 'item', label: 'item', contains: false, onBorder: false, definedBy: 'ItemDefinition', size: [160, 52], shape: 'item', fields: ['name', 'type', 'typeLine', 'direction', 'multiplicity', 'doc'], traits: ['flowEnd', 'bindable', 'connectable'],
      head: function (model, el, h) { return (el.direction ? el.direction + ' ' : '') + h.headOf(el); },
      check: function (model, el, ids, add) {
        const owner = el.owner !== undefined ? ids.get(el.owner) : null;
        if (owner && owner.kind === 'PortDefinition' && !el.direction) add(el.id, describe(model, el, ids) + ' needs a direction: in, out, or inout. An item on a port def says which way it goes.');
      } },
    // An interface def's ports are its ends (end port a : P;), and it needs two of them.
    InterfaceDefinition: { keyword: 'interface def', label: 'interface def', contains: ['PortUsage'], onBorder: false, size: [220, 72], shape: 'rect', fields: ['name', 'abstract', 'doc'], traits: [],
      check: function (model, el, ids, add) {
        const ends = childrenOf(model, el.id).filter((c) => KINDS[c.kind].onBorder);
        if (ends.length < 2) add(el.id, describe(model, el, ids) + ' needs two ports on its border, its ends; it has ' + (ends.length ? 'one' : 'none') + '.');
      } },
  });
  addRelationships({
    // Interconnection: an interface between two ports, typed by an interface def whose ends they match; a flow of an
    // item from one port or item to another; a binding of two ports or items that are one thing. Each is declared in
    // the innermost element that holds both ends, as a connection is, and may carry a doc. The rules on the ends and
    // the written ends are the helpers below (definitionOf, flowEnd, portItems…).
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
          return '«interface»' + (rel.name.trim() ? ' ' + rel.name.trim() : '') + (def ? ' : ' + shown(textName(def)) : '');
        } },
      toSysML: function (model, rel, ownerId, depth, out, h) {
        const def = rel.interfaceDef ? h.ids.get(rel.interfaceDef) : null;
        const head = 'interface ' + (rel.name.trim() ? quote(rel.name) + ' ' : '') + (def ? ': ' + quote(textName(def)) + ' ' : '') +
          'connect ' + featurePath(model, ownerId, h.ids.get(rel.from), h.ids) + ' to ' + featurePath(model, ownerId, h.ids.get(rel.to), h.ids);
        connectorStatement(rel, head, depth, h);
      },
    },
    // A flow is a FlowUsage (flow of T from a to b;); the kind keeps the name models are saved with.
    FlowConnectionUsage: {
      metaclass: 'FlowUsage', label: 'flow', fields: ['name', 'item', 'doc'], hideable: false,
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
          return (rel.name.trim() + (item ? ' of ' + shown(textName(item)) : '')).trim();
        } },
      toSysML: function (model, rel, ownerId, depth, out, h) {
        const item = rel.item ? h.ids.get(rel.item) : null;
        const head = 'flow ' + (rel.name.trim() ? quote(rel.name) + ' ' : '') + (item ? 'of ' + quote(textName(item)) + ' ' : '') +
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
        if (ta && tb && ta.def.id !== tb.def.id) return 'A binding joins two things of one definition; ' + describe(model, a, ids) + ' is defined by ' + shown(textName(ta.def)) + ' and ' + describe(model, b, ids) + ' by ' + shown(textName(tb.def)) + '.';
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
  });
  Object.assign(VIEW_KINDS, {
    // The interconnection view: parts and part defs as nodes, their ports and items, the item, port and interface
    // defs beside them, and the connectors between the ports and items. A port def is admitted too, since the items
    // that flow are drawn in it.
    InterconnectionView: { name: 'InterconnectionView', label: 'interconnection view', qualified: 'StandardViewDefinitions::InterconnectionView', renderer: 'graph',
      admits: ['PartDefinition', 'PortDefinition', 'PartUsage', 'PortUsage', 'ItemDefinition', 'ItemUsage', 'InterfaceDefinition'],
      tools: ['PartDefinition', 'PortDefinition', 'PartUsage', 'PortUsage', 'ItemDefinition', 'ItemUsage', 'InterfaceDefinition', '|', 'ConnectionUsage', 'InterfaceUsage', 'FlowConnectionUsage', 'BindingConnectorAsUsage', 'FeatureTyping'],
      fields: ['name', 'doc'], options: {} },
  });
  Object.assign(FIELDS, {
    // The interface def an interface is typed by.
    interfaceDef: { type: 'ref', label: 'interface def', options: function (model) { return model.elements.filter((e) => e.kind === 'InterfaceDefinition'); } },
  });

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
      const inherited = owner && textName(cur) ? inheritedFeatures(model, owner, ids).get(textName(cur)) : null;
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
      const seen = (typed.conjugated ? 'a conjugated ' : 'a ') + shown(textName(typed.def));
      const way = out ? 'out' : 'in';
      if (!found.length) return { el: end, item: null, problem: describe(model, end, ids) + ', ' + seen + ', carries no item of ' + shown(textName(itemDef)) + ' going ' + way + ', so the flow can\'t ' + verb + ' there.' };
      if (found.length > 1) return { el: end, item: found[0], problem: describe(model, end, ids) + ', ' + seen + ', carries more than one item of ' + shown(textName(itemDef)) + ' going ' + way + ' (' + found.map((i) => shown(textName(i))).join(', ') + '), so the flow can\'t tell which to ' + verb + ' at. Keep one.' };
      return { el: end, item: found[0], problem: null };
    }
    if (end.direction !== undefined) {
      if (!end.direction) return { el: end, item: null, problem: describe(model, end, ids) + ' has no direction, so nothing flows ' + (out ? 'from' : 'into') + ' it. Set it to ' + (out ? 'out' : 'in') + ' or inout.' };
      if (!goes(end.direction)) return { el: end, item: null, problem: describe(model, end, ids) + ' goes ' + end.direction + ', so a flow can\'t ' + verb + ' there.' };
    }
    if (itemDef) {
      const typed = definitionOf(model, end, ids);
      if (typed && typed.def.id !== itemDef.id && !specializes(model, typed.def, itemDef)) return { el: end, item: null, problem: describe(model, end, ids) + ' is of ' + shown(textName(typed.def)) + ', not ' + shown(textName(itemDef)) + ', so the flow\'s item doesn\'t match it.' };
    }
    return { el: end, item: null, problem: null };
  }
  // The path of a flow's end from the element the flow is declared in: a port's path and its item's name, or the
  // end's own path. When the port's item can't be told, the port's path alone, which the flow's problems explain.
  function flowEndPath(model, rel, which, ownerId, ids) {
    const r = flowEnd(model, rel, which, ids);
    const path = featurePath(model, ownerId, r.el, ids);
    return r.item ? path + '.' + quote(textName(r.item)) : path;
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
    return typed ? (typed.conjugated ? '~' : '') + shown(textName(typed.def)) : 'nothing';
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
      return describe(model, def, ids) + ' has ' + ends.length + ' ends (' + ends.map((e) => shown(textName(e))).join(', ') + '), so an interface between two ports can\'t be typed by it. Keep two ends on it, or type the ' + describeRel(model, rel, ids) + ' by another def.';
    }
    const sa = portSignature(model, a, ids);
    const sb = portSignature(model, b, ids);
    const s0 = portSignature(model, ends[0], ids);
    const s1 = portSignature(model, ends[1], ids);
    if ((sa === s0 && sb === s1) || (sa === s1 && sb === s0)) return null;
    const endsText = ends.map((e) => shown(textName(e)) + ' : ' + portTypeName(model, e, ids)).join(' and ');
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
})(typeof globalThis !== 'undefined' ? globalThis : window);
