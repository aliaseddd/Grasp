// The SysML v2 specification's validation rules in the model library, as SysON runs them (docs/sysml/syson/features/
// model.md, "Validation & model checks"; its user manual's validation.adoc): each rule has the name the specification
// gives it (validate<Metaclass>…), a metaclass, and a check; every element of that metaclass or a subclass is checked
// against it, and each one that breaks it gives a diagnostic, a warning, as all of SysON's are. The specification has
// 388 such rules (the pilot implementation's SysML.uml at the release the canvas's metamodel comes from: 180 validate
// rules and 208 check rules); SysON 2026.11.0 runs 383. The check rules ask for what the SysML parser adds to any text
// (the library's specializations, binding connectors, redefinitions), so the canvas's text meets them; most validate
// rules are about what the canvas doesn't make (variations, individuals, expressions, requirements). These are the ones
// what the canvas holds can break, each written from the specification's constraint, in the canvas's words.
(function (root) {
  'use strict';
  const lib = root.SysMLModelLib;
  const {
    KINDS, RELATIONSHIPS, conforms, str, textName, idsOf, reading, childrenOf, linesOfKind, linesFrom, linesTo, typingOf,
    describe, describeRel, qualified, quote, EXTRA
  } = lib;

  // The metaclass an element or a line has in the text: its kind's, or for an action that sends or accepts something,
  // SendActionUsage or AcceptActionUsage, as the text writes it.
  function textMetaclass(type, item) {
    if (type === 'rel') return RELATIONSHIPS[item.kind].metaclass;
    if (item.kind === 'ActionUsage' && item.actionKind === 'send' && (str(item.payload).trim() || str(item.target).trim())) return 'SendActionUsage';
    if (item.kind === 'ActionUsage' && item.actionKind === 'accept' && str(item.payload).trim()) return 'AcceptActionUsage';
    return KINDS[item.kind].metaclass;
  }
  const isState = (el) => !!el && conforms(KINDS[el.kind].metaclass, 'StateUsage');
  const isStateOwner = (el) => !!el && (conforms(KINDS[el.kind].metaclass, 'StateUsage') || conforms(KINDS[el.kind].metaclass, 'StateDefinition'));
  const plural = (n, word) => n + ' ' + word + (n === 1 ? '' : 's');
  // A multiplicity's bounds, as the canvas writes them (4, 1..*), each a string; null for none.
  function bounds(m) {
    const s = str(m).trim();
    return s ? s.split('..').map((b) => b.trim()) : null;
  }
  // The members of each namespace, by its id ('' for the package), grouped by name: its elements, the named lines
  // declared in it, and the package's views, each { item, name, metaclass }; the members with no name are left out,
  // since a name is what could make two of them alike.
  function membersOf(model, ids) {
    const out = new Map();
    const add = (home, item, name, metaclass) => {
      if (!name) return;
      if (!out.has(home)) out.set(home, new Map());
      const byName = out.get(home);
      if (!byName.has(name)) byName.set(name, []);
      byName.get(name).push({ item: item, name: name, metaclass: metaclass });
    };
    model.elements.forEach((e) => add(e.owner === undefined ? '' : e.owner, e, textName(e), textMetaclass('el', e)));
    model.relationships.forEach((r) => {
      const kind = RELATIONSHIPS[r.kind];
      if (kind.fields.indexOf('name') < 0 || !str(r.name).trim()) return;
      const owner = kind.owner ? kind.owner(model, r, ids) : null;
      add(owner || '', r, str(r.name).trim(), textMetaclass('rel', r));
    });
    model.views.forEach((v) => add('', v, str(v.name).trim(), 'ViewUsage'));
    return out;
  }

  // The rules. check(model, item, ctx) returns null when the item keeps the rule, or the sentence saying how it breaks
  // it; ctx holds ids, the model's element index, and members, each namespace's members.
  const RULES = [
    { name: 'validateNamespaceDistinguishibility', metaclass: 'Namespace',
      // Two members can't be told apart when they have the same name and one's metaclass is the other's or a kind of
      // it (the specification's isDistinguishableFrom); a part and a port of one name can be.
      check: function (model, item, ctx) {
        const byName = ctx.members.get(item === null ? '' : item.id);
        if (!byName) return null;
        for (const members of byName.values()) {
          for (let i = 0; i < members.length; i++) {
            for (let j = i + 1; j < members.length; j++) {
              const a = members[i];
              const b = members[j];
              if (!(conforms(a.metaclass, b.metaclass) || conforms(b.metaclass, a.metaclass))) continue;
              return 'Its members ' + say(model, a.item, ctx) + ' and ' + say(model, b.item, ctx) + ' have the same name, and one is a kind of the other, so they can\'t be told apart.';
            }
          }
        }
        return null;
      } },
    { name: 'validateFeatureEndMultiplicity', metaclass: 'Feature',
      // An end feature's multiplicity is 1..1. The canvas's ends are the ports of an interface def.
      check: function (model, el, ctx) {
        const owner = el.owner !== undefined ? ctx.ids.get(el.owner) : null;
        if (el.kind !== 'PortUsage' || !owner || owner.kind !== 'InterfaceDefinition') return null;
        const b = bounds(el.multiplicity);
        if (!b || (b.every((x) => x === '1'))) return null;
        return 'An end of an interface def has the multiplicity 1..1; ' + describe(model, el, ctx.ids) + ' has [' + str(el.multiplicity).trim() + '].';
      } },
    { name: 'validateMultiplicityRangeBoundResultTypes', metaclass: 'MultiplicityRange', of: 'multiplicity',
      // The bounds of a multiplicity are integers, none of them below 0 (* is the unbounded one).
      check: function (model, el, ctx) {
        const b = bounds(el.multiplicity);
        if (!b || b.every((x) => x === '*' || /^\d+$/.test(x))) return null;
        return 'A multiplicity\'s bounds are whole numbers, 0 or more, or *; ' + describe(model, el, ctx.ids) + ' has [' + str(el.multiplicity).trim() + '].';
      } },
    { name: 'validateTransitionUsageTriggerActions', metaclass: 'TransitionUsage',
      // Only a transition out of a state has a trigger.
      check: function (model, rel, ctx) {
        const source = ctx.ids.get(rel.from);
        if (!source || isState(source) || !str(rel.trigger).trim()) return null;
        return 'Only a transition out of a state has a trigger; the ' + describeRel(model, rel, ctx.ids) + ' leaves ' + describe(model, source, ctx.ids) + ' and has the trigger ' + str(rel.trigger).trim() + '.';
      } },
    { name: 'validateStateUsageParallelSubactions', metaclass: 'StateUsage', check: parallelSubactions },
    { name: 'validateStateDefinitionParallelSubactions', metaclass: 'StateDefinition', check: parallelSubactions },
    { name: 'validateStateUsageStateSubactionKind', metaclass: 'StateUsage', check: subactionKinds },
    { name: 'validateStateDefinitionStateSubactionKind', metaclass: 'StateDefinition', check: subactionKinds },
    { name: 'validateControlNodeOwningType', metaclass: 'ControlNode',
      // A control node is owned by an action def or an action.
      check: function (model, el, ctx) {
        const owner = el.owner !== undefined ? ctx.ids.get(el.owner) : null;
        const mc = owner ? KINDS[owner.kind].metaclass : null;
        if (mc && (conforms(mc, 'ActionDefinition') || conforms(mc, 'ActionUsage'))) return null;
        return 'A control node belongs to an action def or an action; ' + describe(model, el, ctx.ids) + (owner ? ' is in ' + describe(model, owner, ctx.ids) : ' is on its own') + '.';
      } },
    { name: 'validateForkNodeIncomingSuccessions', metaclass: 'ForkNode', check: successions('into', 'fork') },
    { name: 'validateDecisionNodeIncomingSuccessions', metaclass: 'DecisionNode', check: successions('into', 'decision') },
    { name: 'validateJoinNodeOutgoingSuccessions', metaclass: 'JoinNode', check: successions('outOf', 'join') },
    { name: 'validateMergeNodeOutgoingSuccessions', metaclass: 'MergeNode', check: successions('outOf', 'merge') },
    { name: 'validateSendActionUsagePayloadArgument', metaclass: 'SendActionUsage',
      // A send action that is a state's entry, do or exit action has a payload.
      check: function (model, el, ctx) {
        const owner = el.owner !== undefined ? ctx.ids.get(el.owner) : null;
        if (!el.role || !isStateOwner(owner) || str(el.payload).trim()) return null;
        return 'A send action that is a state\'s ' + el.role + ' action says what it sends; ' + describe(model, el, ctx.ids) + ' has no payload.';
      } },
    { name: 'validateRedefinitionDirectionConformance', metaclass: 'Redefinition', of: 'redefinition',
      // A parameter of a typed action redefines its definition's parameter of the same name: one that goes in or out
      // goes the same way, and one that redefines an inout parameter has a direction.
      check: function (model, el, ctx) {
        if (el.kind !== 'ParameterUsage') return null;
        const owner = el.owner !== undefined ? ctx.ids.get(el.owner) : null;
        const name = textName(el);
        if (!owner || owner.kind !== 'ActionUsage' || !name) return null;
        const typing = typingOf(model, owner);
        const def = typing ? ctx.ids.get(typing.to) : null;
        const redefined = def ? childrenOf(model, def.id).find((p) => p.kind === 'ParameterUsage' && textName(p) === name) : null;
        if (!redefined || !redefined.direction) return null;
        const keeps = redefined.direction === 'inout' ? !!el.direction : el.direction === redefined.direction;
        if (keeps) return null;
        return describe(model, el, ctx.ids) + ' redefines the parameter ' + name + ' of ' + describe(model, def, ctx.ids) + ', which goes ' + redefined.direction +
          (redefined.direction === 'inout' ? ', so it needs a direction; it has none.' : ', so it goes ' + redefined.direction + ' too; it goes ' + (el.direction || 'no way') + '.');
      } }
  ];
  // A parallel state's regions (its actions and states) have no transitions into or out of them.
  function parallelSubactions(model, el, ctx) {
    if (el.parallel !== true) return null;
    for (const child of childrenOf(model, el.id)) {
      if (!conforms(KINDS[child.kind].metaclass, 'ActionUsage')) continue;
      const t = linesFrom(model, child.id, 'TransitionUsage')[0] || linesTo(model, child.id, 'TransitionUsage')[0];
      if (t) return describe(model, el, ctx.ids) + ' is parallel, so its regions have no transitions into or out of them; ' + describe(model, child, ctx.ids) + ' has the ' + describeRel(model, t, ctx.ids) + '.';
    }
    return null;
  }
  // A state has one entry, one do and one exit action at most.
  function subactionKinds(model, el, ctx) {
    for (const role of ['entry', 'do', 'exit']) {
      const n = childrenOf(model, el.id).filter((c) => c.kind === 'ActionUsage' && c.role === role).length;
      if (n > 1) return 'A state has one ' + role + ' action at most; ' + describe(model, el, ctx.ids) + ' has ' + n + '.';
    }
    return null;
  }
  // A fork or a decision has one succession into it at most, a join or a merge one out of it.
  function successions(way, word) {
    return function (model, el, ctx) {
      const lines = way === 'into' ? linesTo(model, el.id, 'SuccessionAsUsage') : linesFrom(model, el.id, 'SuccessionAsUsage');
      if (lines.length <= 1) return null;
      return 'A ' + word + ' node has one ' + (way === 'into' ? 'incoming' : 'outgoing') + ' succession at most; ' + describe(model, el, ctx.ids) + ' has ' + lines.length + '.';
    };
  }
  // A line's qualified name: the path of the element it is declared in, or the package, and its name; an unnamed
  // one has none, and is named by its id, as SysON names an element without a qualified name.
  function linePath(model, rel, ids) {
    const name = str(rel.name).trim();
    if (!name) return '<ID: ' + rel.id + '>';
    const owner = RELATIONSHIPS[rel.kind].owner ? RELATIONSHIPS[rel.kind].owner(model, rel, ids) : null;
    const home = owner ? ids.get(owner) : null;
    return (home ? qualified(model, home, ids) : quote(str(model.package && model.package.name).trim() || 'Model')) + '::' + quote(name);
  }
  // An element or a line in a sentence.
  function say(model, item, ctx) {
    if (model.views.indexOf(item) >= 0) return 'view ' + str(item.name).trim();
    return RELATIONSHIPS[item.kind] && item.from !== undefined ? 'the ' + describeRel(model, item, ctx.ids) : describe(model, item, ctx.ids);
  }

  // Which rules each metaclass is checked against: those on it or on a class it is a kind of, in RULES' order.
  const applying = new Map();
  function rulesFor(metaclass) {
    if (!applying.has(metaclass)) applying.set(metaclass, RULES.filter((r) => r.of ? appliesOf(r, metaclass) : conforms(metaclass, r.metaclass)));
    return applying.get(metaclass);
  }
  // A rule on a relationship or a multiplicity the canvas keeps on the element (its multiplicity, its redefinition of
  // a parameter) checks the element instead: an element with a multiplicity, a usage.
  function appliesOf(rule, metaclass) {
    return rule.of === 'multiplicity' ? conforms(metaclass, 'Type') : conforms(metaclass, 'Usage');
  }

  // The specification's rules, checked on a model: a diagnostic for each element, line or namespace that breaks one,
  // { rule, metaclass, type ('el', 'rel', or null for the package), id, path, message, severity, text }, sorted as
  // SysON sorts them, by rule, then by the qualified name of what breaks it. text is SysON's label for it:
  // #<rule>·····[<document>/<qualified name>]·····Constraint on type 'sysml:<Metaclass>' is not respected: <message>,
  // the document here the package, which the canvas's model is.
  function validateSpec(model) {
    return reading(model, () => {
      const ids = idsOf(model);
      const ctx = { ids: ids, members: membersOf(model, ids) };
      const out = [];
      const doc = str(model.package && model.package.name).trim() || 'Model';
      const add = (rule, type, item, path, message) => out.push({
        rule: rule.name, metaclass: rule.metaclass, type: type, id: item ? item.id : null, path: path, message: message, severity: 'warning',
        text: '#' + rule.name + '·····[' + doc + '/' + path + ']·····Constraint on type \'sysml:' + rule.metaclass + '\' is not respected: ' + message
      });
      // The package is a namespace too.
      RULES.filter((r) => r.metaclass === 'Namespace').forEach((rule) => {
        const message = rule.check(model, null, ctx);
        if (message) add(rule, null, null, quote(doc), message);
      });
      model.elements.forEach((el) => {
        rulesFor(textMetaclass('el', el)).forEach((rule) => {
          const message = rule.check(model, el, ctx);
          if (message) add(rule, 'el', el, qualified(model, el, ids), message);
        });
      });
      model.relationships.forEach((rel) => {
        rulesFor(textMetaclass('rel', rel)).forEach((rule) => {
          if (rule.metaclass === 'Namespace') return;   // a line declares nothing in it
          const message = rule.check(model, rel, ctx);
          if (message) add(rule, 'rel', rel, linePath(model, rel, ids), message);
        });
      });
      out.sort((a, b) => (a.rule < b.rule ? -1 : a.rule > b.rule ? 1 : a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
      return out;
    });
  }

  EXTRA.SPEC_RULES = RULES.map((r) => r.name);
  EXTRA.validateSpec = validateSpec;
})(typeof globalThis !== 'undefined' ? globalThis : window);
