// Interconnection on the page.
(function (C) {
  'use strict';
  const S = C.state;
  const { M, TOOL_TITLE, TOOL_HINT, BASE_NAME, f, node, text, MARKERS, nameLine, SHAPES, RENDERERS } = C;

  // ---- Interconnection: the words for its tools, the item's shape, the flow's head, and a direction for an item
  // placed on a port def.
  Object.assign(TOOL_TITLE, {
    ItemDefinition: 'An item definition: what flows, or what a part holds',
    ItemUsage: 'An item: inside a part def, a part, or a port def, where it has a direction',
    InterfaceDefinition: 'An interface definition: the two ports on its border are its ends',
    InterfaceUsage: 'An interface between two ports, typed by an interface def whose ends they match',
    FlowConnectionUsage: 'A flow of an item from one port, item or parameter to another',
    BindingConnectorAsUsage: 'A binding: two ports, items or parameters that are one and the same'
  });
  Object.assign(TOOL_HINT, {
    ItemDefinition: 'Click where the item def goes.',
    ItemUsage: 'Click where the item goes: inside a part def, a part, or a port def.',
    InterfaceDefinition: 'Click where the interface def goes, then put two ports on its border.',
    InterfaceUsage: ['Click one port…', 'Now click the port at the other end.'],
    FlowConnectionUsage: ['Click the port, item or parameter the flow starts from…', 'Now click the one it arrives at.'],
    BindingConnectorAsUsage: ['Click one port, item or parameter…', 'Now click the one it is bound to.']
  });
  Object.assign(BASE_NAME, { ItemDefinition: 'ItemDef', ItemUsage: 'item', InterfaceDefinition: 'InterfaceDef' });
  // A flow's head: a filled triangle at the target.
  MARKERS['m-flow'] = '<marker id="m-flow" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto" overflow="visible">' +
    '<path class="flow-head" d="M1,1 L11,6 L1,11 Z"/></marker>';
  // An item: a rounded box whose keyword carries the direction, «out item» supply : Fuel, as the notation has it.
  SHAPES.item = {
    draw: function (el, r, g) {
      const cx = r.x + r.w / 2;
      g.appendChild(node('rect', { x: f(r.x), y: f(r.y), width: f(r.w), height: f(r.h), rx: 10 }, 'outline'));
      g.appendChild(text(cx, r.y + 16, '«' + (el.direction ? el.direction + ' ' : '') + M.KINDS[el.kind].keyword + '»', 'kw', 'middle'));
      g.appendChild(text(cx, r.y + 32, nameLine(el), 'uname', 'middle'));
    },
    compartments: true,
    radius: 10,
    cls: 'item'
  };
  // A directed feature placed on a port def starts out going out, since there it has to go some way.
  (function () {
    const graphPlace = RENDERERS.graph.place;
    RENDERERS.graph.place = function (view, kind, p, hit) {
      const el = graphPlace(view, kind, p, hit);
      if (el && el.direction === '' && el.owner !== undefined) {
        const owner = S.layout.ids.get(el.owner);
        if (owner && owner.kind === 'PortDefinition') el.direction = 'out';
      }
      return el;
    };
  })();
})(window.SysMLCanvas);
