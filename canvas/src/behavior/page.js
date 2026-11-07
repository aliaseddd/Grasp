// Behavior on the page: the action flow and the state transition views.
(function (C) {
  'use strict';
  const S = C.state;
  const {
    M, CHILD_TOP, TOOL_TITLE, TOOL_HINT, BASE_NAME, str, say, f, viewLayout, wrap, node, text, MARKERS, nameLine,
    SHAPES, COMPARTMENTS, RENDERERS
  } = C;

  // Behavior: the action flow and state transition views on the page: the words for their tools, the shapes of
  // actions, states, parameters and nodes, the open arrowhead, the send or accept compartment, and what placing one of
  // their kinds needs beyond the graph renderer's own placing.
  Object.assign(TOOL_TITLE, {
    ActionDefinition: 'An action definition: square corners, holding its parameters, actions and control nodes',
    ActionUsage: 'An action: rounded corners, on the plane or inside an action def, an action, a part or a state',
    ParameterUsage: 'A parameter: a small box on the border of an action def or an action, pointing its way',
    ForkNode: 'A fork: a bar where the flow splits into paths that run side by side',
    JoinNode: 'A join: a bar where paths that ran side by side meet',
    DecisionNode: 'A decision: a diamond whose outgoing successions carry guards, and one of them else',
    MergeNode: 'A merge: a diamond where alternative paths meet',
    StartNode: 'The start of the flow: a filled circle',
    DoneNode: 'Where the flow or the state machine ends: a bullseye',
    SuccessionAsUsage: 'A succession: what happens next, dashed, from an action or node to the next',
    StateDefinition: 'A state definition: square corners, holding its states, their actions and the initial node',
    StateUsage: 'A state: rounded corners, inside a state def, a state, a part def or a part, or on the plane',
    InitialNode: 'The initial node: where a state begins, with one transition to its first state',
    TransitionUsage: 'A transition from a state to the next: trigger [guard] / effect'
  });
  Object.assign(TOOL_HINT, {
    ActionDefinition: 'Click where the action def goes.',
    ActionUsage: 'Click where the action goes: on the plane, or inside an action def, an action, a part or a state.',
    ParameterUsage: 'Click an action def or an action to put a parameter on its border.',
    ForkNode: 'Click inside an action def or an action to put the fork there.',
    JoinNode: 'Click inside an action def or an action to put the join there.',
    DecisionNode: 'Click inside an action def or an action to put the decision there.',
    MergeNode: 'Click inside an action def or an action to put the merge there.',
    StartNode: 'Click inside an action def or an action to put its start there.',
    DoneNode: 'Click inside an action def, an action, a state def or a state to put its done there.',
    SuccessionAsUsage: ['Click the action, node or event that comes first…', 'Now click what comes next.'],
    StateDefinition: 'Click where the state def goes.',
    StateUsage: 'Click where the state goes: inside a state def or a state, or on the plane.',
    InitialNode: 'Click inside a state def or a state to put its initial node there.',
    TransitionUsage: ['Click the state the transition leaves…', 'Now click the state it leads to.']
  });
  Object.assign(BASE_NAME, {
    ActionDefinition: 'ActionDef', ActionUsage: 'action', ParameterUsage: 'param', ForkNode: 'fork', JoinNode: 'join', DecisionNode: 'decision', MergeNode: 'merge',
    StartNode: 'start', DoneNode: 'done', StateDefinition: 'StateDef', StateUsage: 'state', InitialNode: 'initial'
  });
  // The header of an action or a state: the keyword line (with the action's role and kind, or the state's parallel,
  // in it) and the name line, as the core's boxes have them.
  function behaviorHeader(el, r, g, keywords) {
    const kind = M.KINDS[el.kind];
    const cx = r.x + r.w / 2;
    g.appendChild(text(cx, r.y + 16, keywords, 'kw', 'middle'));
    g.appendChild(text(cx, r.y + 32, nameLine(el), kind.definition ? 'name' : 'uname', 'middle'));
  }
  // An action: a rounded box whose header says «action», «send action», «accept action» or «entry action», with the
  // notation's glyph beside it for a send (a convex pentagon) or an accept (a notched one).
  SHAPES.action = {
    draw: function (el, r, g) {
      g.appendChild(node('rect', { x: f(r.x), y: f(r.y), width: f(r.w), height: f(r.h), rx: 10 }, 'outline'));
      const what = el.actionKind === 'send' || el.actionKind === 'accept' ? el.actionKind + ' ' : '';
      behaviorHeader(el, r, g, '«' + (el.role ? el.role + ' ' : '') + what + 'action»');
      if (el.actionKind === 'send') g.appendChild(node('path', { d: 'M' + f(r.x + 8) + ',' + f(r.y + 8) + ' h10 l5,5 l-5,5 h-10 Z' }, 'action-glyph'));
      else if (el.actionKind === 'accept') g.appendChild(node('path', { d: 'M' + f(r.x + 8) + ',' + f(r.y + 8) + ' h15 v10 h-15 l5,-5 Z' }, 'action-glyph'));
    },
    compartments: true, cls: 'action', radius: 10
  };
  // A state def (square corners) or a state (rounder than a part), with «parallel» beside the keyword when it is.
  SHAPES.state = {
    draw: function (el, r, g) {
      const kind = M.KINDS[el.kind];
      g.appendChild(node('rect', { x: f(r.x), y: f(r.y), width: f(r.w), height: f(r.h), rx: kind.definition ? 0 : 16 }, 'outline'));
      behaviorHeader(el, r, g, '«' + (el.abstract ? 'abstract ' : '') + kind.keyword + '»' + (el.parallel ? ' «parallel»' : ''));
    },
    compartments: true, cls: 'state', radius: function (el) { return M.KINDS[el.kind].definition ? 0 : 16; }
  };
  // The control nodes: a bar for a fork or a join, a diamond for a decision or a merge, each with its name hanging at
  // its lower right, where no succession comes or goes: the lines leave the middle of a bar's sides and a diamond's
  // four corners.
  function controlNodeName(el, r, g) {
    const name = M.textName(el);
    if (!name) return;
    g.appendChild(text(r.x + r.w + 2, r.y + r.h + 9, name, 'mono', 'start'));
  }
  SHAPES.bar = {
    draw: function (el, r, g) {
      g.appendChild(node('rect', { x: f(r.x), y: f(r.y), width: f(r.w), height: f(r.h), rx: 3 }, 'outline'));
      controlNodeName(el, r, g);
    },
    compartments: false, cls: 'node bar'
  };
  SHAPES.diamond = {
    draw: function (el, r, g) {
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      g.appendChild(node('path', { d: 'M' + f(cx) + ',' + f(r.y) + ' L' + f(r.x + r.w) + ',' + f(cy) + ' L' + f(cx) + ',' + f(r.y + r.h) + ' L' + f(r.x) + ',' + f(cy) + ' Z' }, 'outline'));
      controlNodeName(el, r, g);
    },
    compartments: false, cls: 'node diamond'
  };
  // The pseudo nodes: a filled circle for start, a bullseye for done, a filled rounded bar for a state's initial node.
  SHAPES.dot = {
    draw: function (el, r, g) { g.appendChild(node('circle', { cx: f(r.x + r.w / 2), cy: f(r.y + r.h / 2), r: f(r.w / 2) }, 'outline')); },
    compartments: false, cls: 'node start'
  };
  SHAPES.bullseye = {
    draw: function (el, r, g) {
      g.appendChild(node('circle', { cx: f(r.x + r.w / 2), cy: f(r.y + r.h / 2), r: f(r.w / 2) }, 'outline'));
      g.appendChild(node('circle', { cx: f(r.x + r.w / 2), cy: f(r.y + r.h / 2), r: f(r.w / 2 - 5) }, 'centre'));
    },
    compartments: false, cls: 'node done'
  };
  SHAPES.entry = {
    draw: function (el, r, g) { g.appendChild(node('rect', { x: f(r.x), y: f(r.y), width: f(r.w), height: f(r.h), rx: 4 }, 'outline')); },
    compartments: false, cls: 'node initial'
  };
  // A parameter: the port's square, glyph and name (the glyph follows the parameter's direction through the kind's
  // glyph hook), with rounder corners so it reads as a parameter beside the ports.
  SHAPES.param = {
    draw: function (p, r, g, L) {
      SHAPES.port.draw(p, r, g, L);
      const outline = g.querySelector('.outline');
      if (outline) outline.setAttribute('rx', 5);
    },
    compartments: false, cls: 'parameter'
  };
  // What a send or accept action does, under its header: the payload, and the port or part it goes via or to.
  COMPARTMENTS.push({
    applies: function (el) { return el.kind === 'ActionUsage' && (el.actionKind === 'send' || el.actionKind === 'accept') && !!(str(el.payload).trim() || str(el.target).trim()); },
    head: function (el) { return el.actionKind; }, cls: 'mono',
    lines: function (el, width) {
      const target = str(el.target).trim();
      const word = el.actionKind === 'accept' ? 'via' : M.sendWord(S.model, target);
      return wrap(str(el.payload).trim() + (target ? ' ' + word + ' ' + target : ''), Math.max(10, Math.floor((width - 24) / 6.6)));
    }
  });
  // The open arrowhead of successions and transitions.
  MARKERS['m-open'] = '<marker id="m-open" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto" overflow="visible">' +
    '<path class="open-head" d="M2,1.5 L11,6 L2,10.5"/></marker>';
  // Placing through the graph renderer, with what the behavior kinds need on top: a parameter starts as in; a node
  // goes only where the text allows it (a control node or a start inside an action, an initial node inside a state, a
  // done inside either) and sits centered on the click, having no header to hang from.
  const BEHAVIOR_NODE_HOME = { ForkNode: 'action', JoinNode: 'action', DecisionNode: 'action', MergeNode: 'action', StartNode: 'action', DoneNode: 'either', InitialNode: 'state' };
  const behaviorGraphPlace = RENDERERS.graph.place;
  RENDERERS.graph.place = function (view, kind, p, hit) {
    const el = behaviorGraphPlace(view, kind, p, hit);
    if (!el) {
      if (kind === 'ParameterUsage') say('Click an action def or an action in this view to put a parameter on its border.');
      return null;
    }
    if (kind === 'ParameterUsage') el.direction = 'in';
    const home = BEHAVIOR_NODE_HOME[kind];
    if (!home) return el;
    const owner = el.owner !== undefined ? S.layout.ids.get(el.owner) : null;
    const fits = !!owner && (home === 'action' ? M.isActionOwner(owner.kind) : home === 'state' ? M.isStateOwner(owner.kind) : M.isActionOwner(owner.kind) || M.isStateOwner(owner.kind));
    if (!fits) {
      S.model.elements.splice(S.model.elements.findIndex((e) => e.id === el.id), 1);
      delete view.layout[el.id];
      say('Click inside ' + (home === 'action' ? 'an action def or an action' : home === 'state' ? 'a state def or a state' : 'an action def, an action, a state def or a state') + ' to put the ' + M.KINDS[kind].label + ' there.');
      return null;
    }
    const lay = view.layout[el.id];
    const base = viewLayout(view.id).rects.get(owner.id);
    lay.y = Math.max(CHILD_TOP, Math.round(p.y - base.y - lay.h / 2));
    return el;
  };
})(window.SysMLCanvas);
