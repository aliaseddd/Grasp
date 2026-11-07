// Behavior in the model library: the action flow view (action defs, actions and their parameters, the control
// nodes, start and done, successions) and the state transition view (state defs, states, the initial node,
// transitions), with their rules and their text.
(function (root) {
  'use strict';
  const lib = root.SysMLModelLib;
  const {
    KINDS, RELATIONSHIPS, VIEW_KINDS, FIELDS, NAME, MULTIPLICITY, str, hasTrait, textName, childrenOf, typingOf,
    commonOwner, acrossDefinitions, nameTakenBeside, quote, shown, featurePath, an, describe, describeRel, EXTRA, BODY,
    commentLines
  } = lib;

  Object.assign(KINDS, {
    // Behavior: the action flow view's kinds (an action def, actions with their parameters on the border, the four
    // control nodes, and start and done) and the state view's (a state def, states, the initial node). Start, done
    // and the initial node have no name field, so no name in the text (textName): they stand for the start and done
    // every action and state inherits, and for a state's entry, so their heads are null and the text never declares
    // them; a succession or transition ending on one writes the keyword of its kind, start or done (featurePath), and a
    // state's body writes the entry idiom for its initial node. The hooks are functions further down this script,
    // which hoist.
    ActionDefinition: { keyword: 'action def', label: 'action def', definition: true, usage: false, contains: ['ActionUsage', 'ParameterUsage', 'ForkNode', 'JoinNode', 'DecisionNode', 'MergeNode', 'StartNode', 'DoneNode'], onBorder: false, size: [220, 72], shape: 'rect', fields: ['name', 'abstract', 'doc'], traits: [] },
    ActionUsage: { keyword: 'action', label: 'action', definition: false, usage: true, contains: ['ActionUsage', 'ParameterUsage', 'ForkNode', 'JoinNode', 'DecisionNode', 'MergeNode', 'StartNode', 'DoneNode'], onBorder: false,
      definedBy: 'ActionDefinition', size: [180, 60], shape: 'action', fields: ['name', 'type', 'typeLine', 'multiplicity', 'actionKind', 'payload', 'target', 'role', 'doc'], traits: ['successionEnd', 'transitionEnd'],
      head: actionHead, body: actionBody, check: checkAction },
    ParameterUsage: { keyword: 'item', label: 'parameter', definition: false, usage: true, contains: false, onBorder: true, definedBy: 'ItemDefinition', size: [16, 16], shape: 'param',
      fields: ['name', 'direction', 'type', 'typeLine', 'multiplicity', 'doc'], traits: ['flowEnd', 'bindable'],
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
      fields: ['name', 'type', 'typeLine', 'multiplicity', 'parallel', 'doc'], traits: ['transitionEnd'], head: stateHead, body: stateBody, check: checkState },
    InitialNode: { keyword: 'entry', label: 'initial node', definition: false, usage: true, contains: false, onBorder: false, size: [28, 16], shape: 'entry', fields: [], traits: ['transitionEnd'], head: noHead, check: checkPseudoNode },
  });
  Object.assign(RELATIONSHIPS, {
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
  });
  Object.assign(VIEW_KINDS, {
    ActionFlowView: { name: 'ActionFlowView', label: 'action flow view', qualified: 'StandardViewDefinitions::ActionFlowView', renderer: 'graph',
      admits: ['ActionDefinition', 'ActionUsage', 'ParameterUsage', 'ForkNode', 'JoinNode', 'DecisionNode', 'MergeNode', 'StartNode', 'DoneNode'],
      tools: ['ActionDefinition', 'ActionUsage', 'ParameterUsage', '|', 'ForkNode', 'JoinNode', 'DecisionNode', 'MergeNode', 'StartNode', 'DoneNode', '|', 'SuccessionAsUsage', 'FlowConnectionUsage', 'BindingConnectorAsUsage', 'FeatureTyping'], fields: ['name', 'doc'], options: {} },
    StateTransitionView: { name: 'StateTransitionView', label: 'state transition view', qualified: 'StandardViewDefinitions::StateTransitionView', renderer: 'graph',
      admits: ['StateDefinition', 'StateUsage', 'InitialNode', 'ActionUsage', 'DoneNode'],
      tools: ['StateDefinition', 'StateUsage', 'InitialNode', 'ActionUsage', 'DoneNode', '|', 'TransitionUsage', 'FeatureTyping'], fields: ['name', 'doc'], options: {} },
  });
  Object.assign(FIELDS, {
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
  });

  // Behavior: a part def and a part hold actions and states too (actions in parts: afv10, b06; states: stv-12).
  KINDS.PartDefinition.contains.push('ActionUsage', 'StateUsage');
  KINDS.PartUsage.contains.push('ActionUsage', 'StateUsage');
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
  // Whether a target names a port of the model, by its last segment: a send goes via a port and to anything else.
  function namesAPort(model, target) {
    const last = String(target).split('.').pop().trim();
    return model.elements.some((e) => e.kind === 'PortUsage' && (textName(e) === last || quote(textName(e)) === last));
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
    if (type && !model.elements.some((e) => KINDS[e.kind].definition && textName(e) === type)) {
      add(id, what + ' names ' + type + ', which is no definition in the model, so the text can\'t resolve it. Name a part def or item def, as x : Type, or write after …, when … or at ….');
    }
  }
  // An element inside an action or a state can't take a name the library gives every action and state.
  function checkInheritedName(model, el, ids, add) {
    const owner = el.owner !== undefined ? ids.get(el.owner) : null;
    const name = textName(el);
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
    let text = (p.direction ? p.direction + ' ' : '') + 'item' + (textName(p) ? ' ' + quote(textName(p)) : '');
    if (typing && ids.get(typing.to)) text += ' : ' + quote(textName(ids.get(typing.to)));
    if (p.multiplicity && MULTIPLICITY.test(p.multiplicity)) text += ' [' + p.multiplicity + ']';
    const generals = model.relationships.filter((r) => r.kind === 'Specialization' && r.from === p.id && ids.get(r.to)).map((r) => quote(textName(ids.get(r.to))));
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
    const named = (list, name) => (name ? list.find((p) => textName(p) === name) : undefined);
    inherited.forEach((p) => {
      const mine = named(own, textName(p));
      if (mine) declare(model, mine, parameterText(model, mine, h.ids), depth, h);
      else h.line(depth, parameterText(model, p, new Map()) + ';');
    });
    own.filter((p) => !named(inherited, textName(p))).forEach((p) => declare(model, p, parameterText(model, p, h.ids), depth, h));
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
    const name = textName(el);
    if (name === '' && !model.relationships.some((r) => r.from === el.id || r.to === el.id)) add(el.id, what + ' has no name. Name it, so flows and bindings can reach it.');
    if (owner && owner.kind === 'ActionUsage' && name) {
      const def = typingDefinitionOf(model, owner, ids);
      const inherited = def ? parametersOf(model, def.id).find((p) => textName(p) === name) : null;
      if (inherited && inherited.direction !== el.direction) {
        add(el.id, what + ' goes ' + (el.direction || 'no way yet') + ', but the parameter ' + name + ' of ' + shown(textName(def)) + ' goes ' + (inherited.direction || 'no way') + '. Match the direction, or rename it.');
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
      if (str(t.trigger).trim()) add(t.id, 'The transition out of the initial node is taken as ' + shown(textName(owner)) + ' is entered, so it has no trigger. Clear the trigger of the ' + describeRel(model, t, ids) + '.');
      if (!entry && (str(t.name).trim() || str(t.doc).trim() || str(t.effect).trim())) add(t.id, 'The transition out of the initial node carries a name, a doc or an effect only when it leaves an entry action. Add an action with the role entry to ' + shown(textName(owner)) + ', or clear it.');
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
      h.line(depth, (guard ? 'if ' + guard + ' then ' : 'then ') + featurePath(model, el.id, h.ids.get(t.to), h.ids) + ';');
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
    if (entry && textName(entry) === '' && childrenOf(model, el.id).some((e) => e.kind === 'InitialNode')) {
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
      writeBehaviorRel(h, r, (g === 'else' ? 'else ' : g ? 'if ' + g + ' then ' : 'then ') + featurePath(model, ownerId, h.ids.get(r.to), h.ids), depth);
    });
  }
  function checkSuccession(model, rel, ids, add) {
    const a = ids.get(rel.from);
    const b = ids.get(rel.to);
    if (str(rel.guard).trim() === 'else' && a && b) {
      if (a.kind !== 'DecisionNode') add(rel.id, 'An else branch leaves a decision; the ' + describeRel(model, rel, ids) + ' leaves ' + describe(model, a, ids) + '. Give it a guard instead.');
      else if (str(rel.name).trim()) add(rel.id, 'An else branch has no name in the text. Clear the name of the ' + describeRel(model, rel, ids) + ', or give it a guard.');
      else if (commonOwner(model, a, b, ids) !== (a.owner === undefined ? null : a.owner)) add(rel.id, 'The else branch out of ' + describe(model, a, ids) + ' must lead to something beside it, inside ' + (a.owner !== undefined ? shown(textName(ids.get(a.owner))) : 'the package') + '.');
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
    const head = (str(rel.name).trim() ? 'succession ' + quote(rel.name) + ' ' : '') + 'first ' + featurePath(model, ownerId, a, h.ids) +
      (guard && guard !== 'else' ? ' if ' + guard : '') + ' then ' + featurePath(model, ownerId, b, h.ids);
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
    if (a.kind === 'InitialNode' && a.owner !== owner) return 'The transition out of ' + describe(model, a, ids) + ' stays inside ' + shown(textName(ids.get(a.owner))) + '; ' + describe(model, b, ids) + ' is outside it.';
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
    let source = featurePath(model, ownerId, a, h.ids);
    let trigger = str(rel.trigger).trim();
    if (a.kind === 'InitialNode') {
      const entry = a.owner !== undefined ? entryActionOf(model, a.owner) : null;
      if (!entry || !textName(entry)) return;
      source = featurePath(model, ownerId, entry, h.ids);
      trigger = '';
    }
    const guard = str(rel.guard).trim();
    const effect = str(rel.effect).trim();
    const head = 'transition ' + (str(rel.name).trim() ? quote(rel.name) + ' ' : '') + 'first ' + source +
      (trigger ? ' accept ' + trigger : '') + (guard ? ' if ' + guard : '') + (effect ? ' do ' + effect : '') + ' then ' + featurePath(model, ownerId, b, h.ids);
    writeBehaviorRel(h, rel, head, depth);
  }

  EXTRA.sendWord = function (model, target) { return namesAPort(model, target) ? 'via' : 'to'; };
  EXTRA.isActionOwner = isActionOwner;
  EXTRA.isStateOwner = isStateOwner;

  Object.assign(lib, { declare });
})(typeof globalThis !== 'undefined' ? globalThis : window);
