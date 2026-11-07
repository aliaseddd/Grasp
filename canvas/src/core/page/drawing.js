// Drawing: the SVG's pieces, the shapes, the markers and the compartments, and the renderers by view kind, which
// the features add to.
(function (C) {
  'use strict';
  const S = C.state;
  const {
    M, NS, HEADER, HEAD_H, LEAD, PAD, CHILD_TOP, say, f, newId, viewById, viewLayout, rendererFor, wrap, graphLayout,
    graphKeeps, frameAround, endpoints, nearestBorder, contains, containerAt, viewAt
  } = C;

  // ---- Drawing.

  function node(tag, attrs, cls) {
    const n = document.createElementNS(NS, tag);
    for (const key in attrs) if (attrs[key] !== undefined && attrs[key] !== null) n.setAttribute(key, String(attrs[key]));
    if (cls) n.setAttribute('class', cls);
    return n;
  }
  function text(x, y, content, cls, anchor) {
    const t = node('text', { x: f(x), y: f(y), 'text-anchor': anchor || null }, cls);
    t.textContent = content;
    return t;
  }
  // The markers a line may carry at its end or its start (RELATIONSHIPS[kind].line.marker and markerStart): each id
  // and its <marker> markup, put into the drawing's <defs> on every render. The slices add the flow arrow and the rest.
  const MARKERS = {
    'm-general': '<marker id="m-general" viewBox="0 0 18 16" refX="17" refY="8" markerWidth="18" markerHeight="16" markerUnits="userSpaceOnUse" orient="auto" overflow="visible">' +
      '<path class="head" d="M3,1.5 L17,8 L3,14.5 Z"/></marker>',
    'm-defined': '<marker id="m-defined" viewBox="0 0 24 16" refX="23" refY="8" markerWidth="24" markerHeight="16" markerUnits="userSpaceOnUse" orient="auto" overflow="visible">' +
      '<path class="head" d="M9,1.5 L23,8 L9,14.5 Z"/><circle class="dot" cx="4" cy="4.5" r="1.6"/><circle class="dot" cx="4" cy="11.5" r="1.6"/></marker>'
  };
  function defs() {
    const d = node('defs');
    d.innerHTML =
      '<pattern id="plane-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle class="plane-dot" cx="1" cy="1" r="1.1"/></pattern>' +
      Object.keys(MARKERS).map((id) => MARKERS[id]).join('');
    return d;
  }
  // The name line of a box: the name, its definition's after a colon, the multiplicity in brackets. ids, the element
  // index, is for a caller that runs before the layout is set (a renderer's layout); the current layout's otherwise.
  function nameLine(el, ids) {
    let s = M.textName(el) || '(unnamed)';
    if (M.KINDS[el.kind].usage) {
      const typing = M.typingOf(S.model, el);
      if (typing) {
        const def = (ids || S.layout.ids).get(typing.to);
        s += ' : ' + (el.conjugated ? '~' : '') + (def ? M.textName(def) || '(unnamed)' : '?');
      }
      if (el.multiplicity) s += ' [' + el.multiplicity + ']';
    }
    return s;
  }
  // How the graph renderer draws an element of each shape, by the name in KINDS[kind].shape: draw(el, r, g, L) puts
  // the outline and the header (the keyword line, the name line) into the element's group g, for its rect r in plane
  // coordinates; compartments says whether the generic compartments (COMPARTMENTS) are drawn under the header and
  // counted in the box's height; radius, for a shape with compartments, is the corners' radius of the outline it is
  // drawn as far out (a number, or a function of the element; 0 unless said); cls, when present, is added to the
  // group's classes. A box whose shape is unknown is
  // drawn as a rect, a border item as a port. The slices add diamond, bar, dot, a parameter's square and the rest.
  function boxShape(radius) {
    return function (el, r, g) {
      const kind = M.KINDS[el.kind];
      const cx = r.x + r.w / 2;
      g.appendChild(node('rect', { x: f(r.x), y: f(r.y), width: f(r.w), height: f(r.h), rx: radius }, 'outline'));
      g.appendChild(text(cx, r.y + 16, '«' + (el.abstract ? 'abstract ' : '') + kind.keyword + '»', 'kw', 'middle'));
      g.appendChild(text(cx, r.y + 32, nameLine(el), kind.definition ? 'name' : 'uname', 'middle'));
    };
  }
  // Which way the first line drawn from a border item leaves it, as a vector, or null when no drawn line starts or
  // ends on it in view layout L.
  function lineWay(p, L) {
    for (const rel of linesAt(L, p.id)) {
      if (rel.hidden || (rel.from !== p.id && rel.to !== p.id)) continue;
      const e = endpoints(rel, L);
      if (!e) continue;
      const n = e.pts.length;
      const d = rel.from === p.id ? { x: e.pts[1].x - e.pts[0].x, y: e.pts[1].y - e.pts[0].y } : { x: e.pts[n - 2].x - e.pts[n - 1].x, y: e.pts[n - 2].y - e.pts[n - 1].y };
      if (d.x || d.y) return d;
    }
    return null;
  }
  // The lines view layout L draws that start or end on an element, in the model's order: from L.rels, indexed by
  // end the first time it is asked; every line, for a layout that doesn't list its lines yet.
  function linesAt(L, id) {
    if (!L.rels) return S.model.relationships;
    if (!L.byEnd) {
      L.byEnd = new Map();
      const add = (end, rel) => { if (!L.byEnd.has(end)) L.byEnd.set(end, []); L.byEnd.get(end).push(rel); };
      L.rels.forEach((rel) => { add(rel.from, rel); if (rel.to !== rel.from) add(rel.to, rel); });
    }
    return L.byEnd.get(id) || [];
  }
  // Where a border item's name goes, outside the owner and beside the square: above and to the right of a port on the
  // right border, below and to the left on the left border (so two ports facing each other never share a line),
  // centred above on the top, below on the bottom. When the first line drawn from the port heads where the name
  // would be, the name takes the other side of the square, so the line doesn't run through it: below (or above) for
  // a right (left) port, and beside the square, away from the line, for a top or bottom port. Returns the text's x,
  // y and anchor, and on, which side of the square the name is on (above, below, left, right), which the pin keeps
  // clear of.
  function portName(p, r, L) {
    const way = lineWay(p, L);
    const c = r.cx;
    const cy = r.cy;
    if (r.side === 'right') return way && way.y < 0 && way.x > 0 ? { x: c + 12, y: cy + 15, anchor: 'start', on: 'below' } : { x: c + 12, y: cy - 6, anchor: 'start', on: 'above' };
    if (r.side === 'left') return way && way.y > 0 && way.x < 0 ? { x: c - 12, y: cy - 6, anchor: 'end', on: 'above' } : { x: c - 12, y: cy + 15, anchor: 'end', on: 'below' };
    const y = r.side === 'top' ? cy - 6 : cy + 15;
    if (way && (r.side === 'top' ? way.y < 0 : way.y > 0)) return way.x > 0 ? { x: c - 12, y: y, anchor: 'end', on: 'left' } : { x: c + 12, y: y, anchor: 'start', on: 'right' };
    return r.side === 'top' ? { x: c, y: cy - 13, anchor: 'middle', on: 'above' } : { x: c, y: cy + 22, anchor: 'middle', on: 'below' };
  }
  const SHAPES = {
    rect: { draw: boxShape(0), compartments: true, radius: 0 },
    rounded: { draw: boxShape(10), compartments: true, radius: 10 },
    // A port: a small square on its owner's border, a glyph in it, and its name outside the owner.
    port: {
      draw: function (p, r, g, L) {
        g.appendChild(node('rect', { x: f(r.x), y: f(r.y), width: r.w, height: r.h, rx: 2.5 }, 'outline'));
        // The glyph inside the square, by what the kind says of the port (its glyph hook; inout when it says nothing):
        // inout has a head at both ends of the shaft, in one head pointing into the owner, out one pointing away from
        // it, null no glyph. The owner is to the left of a port on its right border, below one on its top border.
        const h = r.side === 'left' || r.side === 'right';
        const c = r.cx;
        const cy = r.cy;
        const kind = M.KINDS[p.kind];
        const way = kind.glyph ? kind.glyph(S.model, p) : 'inout';
        if (way === 'in' || way === 'out' || way === 'inout') {
          const ix = r.side === 'right' ? -1 : r.side === 'left' ? 1 : 0;
          const iy = r.side === 'bottom' ? -1 : r.side === 'top' ? 1 : 0;
          // A head at the end of the shaft that points along (dx, dy): the tip 4.5 from the middle, the barbs 2 back
          // and 2.5 aside.
          const head = (dx, dy) => {
            const bx = c + 2 * dx;
            const by = cy + 2 * dy;
            const px = Math.abs(dy) * 2.5;
            const py = Math.abs(dx) * 2.5;
            return ' M' + f(bx - px) + ',' + f(by - py) + ' L' + f(c + 4.5 * dx) + ',' + f(cy + 4.5 * dy) + ' L' + f(bx + px) + ',' + f(by + py);
          };
          let glyph = h ? 'M' + f(c - 4.5) + ',' + f(cy) + ' H' + f(c + 4.5) : 'M' + f(c) + ',' + f(cy - 4.5) + ' V' + f(cy + 4.5);
          (h ? [[-1, 0], [1, 0]] : [[0, -1], [0, 1]]).forEach((d) => {
            const into = d[0] === ix && d[1] === iy;
            if (way === 'inout' || (way === 'in') === into) glyph += head(d[0], d[1]);
          });
          g.appendChild(node('path', { d: glyph }, 'glyph'));
        }
        // The name sits outside the owner, beside the square, on the side no drawn line heads for (portName).
        const at = portName(p, r, L);
        g.appendChild(text(at.x, at.y, nameLine(p), 'mono', at.anchor));
      },
      compartments: false
    }
  };
  // The compartments a box may show under its header, in this order: applies(el) says whether the element has one,
  // head is its title (a string, or a function of the element), lines(el, width) its text as lines wrapped for a box
  // width px wide (none: no compartment), and cls, when present, the class of its lines (doc, the 11px sans, unless
  // said otherwise; mono is the code font); own: true says the compartment reads nothing but the element itself, so a
  // change to other elements leaves it as it was. Each takes HEAD_H + LEAD per line + 6 of the box's height. The doc
  // is the first; the slices push the code links, a state's actions and the rest.
  const COMPARTMENTS = [
    { applies: function (el) { return M.KINDS[el.kind].fields.indexOf('doc') >= 0 && el.doc.trim() !== ''; }, head: 'doc', cls: 'doc', own: true,
      lines: function (el, width) { return wrap(el.doc, Math.max(12, Math.floor((width - 24) / 6.1))); } }
  ];
  // The compartments an element shows in a box width px wide: those that apply and have lines, as { head, lines, cls }.
  function compartmentsOf(el, width) {
    const out = [];
    COMPARTMENTS.forEach((c) => {
      if (!c.applies(el)) return;
      const lines = c.lines(el, width);
      if (lines.length) out.push({ head: typeof c.head === 'function' ? c.head(el) : c.head, lines: lines, cls: c.cls || 'doc' });
    });
    return out;
  }
  // Whether every compartment an element shows reads nothing but the element (each row that applies says own).
  function ownCompartments(el) { return COMPARTMENTS.every((c) => c.own || !c.applies(el)); }
  // ---- What is drawn of a view's content: what the window shows, with a margin round it (the region render() drew
  // for, { x, y, x2, y2, far }), and less of each thing when the camera is far out (region.far): a box's outline
  // without its words, a border item's square, a line without its label. A null region draws everything in full.
  function onScreen(r, region) {
    return !region || (r.x <= region.x2 && r.x + r.w >= region.x && r.y <= region.y2 && r.y + r.h >= region.y);
  }
  function pointsOnScreen(pts, region) {
    if (!region) return true;
    let x = Infinity;
    let y = Infinity;
    let x2 = -Infinity;
    let y2 = -Infinity;
    pts.forEach((p) => { x = Math.min(x, p.x); y = Math.min(y, p.y); x2 = Math.max(x2, p.x); y2 = Math.max(y2, p.y); });
    return onScreen({ x: x, y: y, w: x2 - x, h: y2 - y }, region);
  }
  // A box: its own drawing, then the boxes inside it that are on screen, then the border items on it.
  function drawBox(el, parent, L, region) {
    const g = node('g', { 'data-el': el.id, 'data-kind': el.kind, 'data-view': L.view.id }, elClass(el));
    drawOwn(el, g, L, region);
    const kids = L.kids.get(el.id) || [];
    kids.forEach((k) => { if (!M.KINDS[k.kind].onBorder && onScreen(L.rects.get(k.id), region)) drawBox(k, g, L, region); });
    kids.forEach((k) => { if (M.KINDS[k.kind].onBorder) drawPort(k, g, L, region); });
    parent.appendChild(g);
  }
  // What an element's own drawing is made from, as a string kept on its group (g.sign), so a change can tell what it
  // must draw again by comparing (patch): the element's fields, its rect, its compartments, its name line, and, for a
  // border item, its glyph and where its name goes. A graph shape draws from these alone; one that read anything else
  // (another element's field, say) would have to bring it in here.
  function signOwn(el, L, region) {
    const kind = M.KINDS[el.kind];
    const r = L.rects.get(el.id);
    const far = !!region && region.far;
    const parts = [far ? 'far' : '', JSON.stringify(el), r.x, r.y, r.w, r.h, r.side || '', JSON.stringify(L.comps.get(el.id) || null), far ? '' : nameLine(el)];
    if (kind.onBorder && !far) parts.push(kind.glyph ? kind.glyph(S.model, el) : '', JSON.stringify(portName(el, r, L)));
    return parts.join('|');
  }
  // The classes of an element's group: what it is, and the shape's own.
  function elClass(el) {
    const kind = M.KINDS[el.kind];
    if (kind.onBorder) { const shape = SHAPES[kind.shape] || SHAPES.port; return 'el port' + (shape.cls ? ' ' + shape.cls : ''); }
    const shape = SHAPES[kind.shape] || SHAPES.rect;
    return 'el ' + (kind.definition ? 'def' : 'usage') + (el.abstract ? ' is-abstract' : '') + (shape.cls ? ' ' + shape.cls : '');
  }
  // What an element's group draws of the element itself, ahead of the groups of what it holds: its shape, and its
  // compartments when the shape has them. Far out, a box is its outline alone and a border item its square.
  function drawOwn(el, g, L, region) {
    g.sign = signOwn(el, L, region);
    const kind = M.KINDS[el.kind];
    const r = L.rects.get(el.id);
    const far = !!region && region.far;
    if (kind.onBorder) {
      if (far) g.appendChild(node('rect', { x: f(r.x), y: f(r.y), width: r.w, height: r.h, rx: 2.5 }, 'outline'));
      else (SHAPES[kind.shape] || SHAPES.port).draw(el, r, g, L);
      return;
    }
    const shape = SHAPES[kind.shape] || SHAPES.rect;
    if (far && shape.compartments) {
      const rx = typeof shape.radius === 'function' ? shape.radius(el) : shape.radius || 0;
      g.appendChild(node('rect', { x: f(r.x), y: f(r.y), width: f(r.w), height: f(r.h), rx: rx }, 'outline'));
      return;
    }
    shape.draw(el, r, g, L);
    if (shape.compartments) drawCompartments(el, r, g, L);
  }
  // The marks the page puts on a group (the selection, a problem, the pointer), which a drawing again keeps.
  const MARKS = ['is-selected', 'is-source', 'is-problem', 'is-hover', 'is-drop'];
  // Draws an element's own part of its group again, as it is now, leaving the groups of what it holds in place; its
  // classes follow what it is, and its marks stay.
  function redrawOwn(el, g, L, region) {
    const marks = MARKS.filter((m) => g.classList.contains(m));
    g.setAttribute('class', [elClass(el)].concat(marks).join(' '));
    g.setAttribute('data-kind', el.kind);
    Array.from(g.childNodes).forEach((c) => { if (c.nodeType !== 1 || !c.hasAttribute('data-el')) g.removeChild(c); });
    const fresh = node('g');
    drawOwn(el, fresh, L, region);
    g.sign = fresh.sign;
    const first = g.firstChild;
    while (fresh.firstChild) g.insertBefore(fresh.firstChild, first);
  }
  // The compartments under a box's header, one block each, stacked: a rule, the head in italics, then the lines.
  function drawCompartments(el, r, g, L) {
    const cx = r.x + r.w / 2;
    let y = r.y + HEADER;
    (L.comps.get(el.id) || []).forEach((c) => {
      g.appendChild(node('line', { x1: f(r.x), y1: f(y), x2: f(r.x + r.w), y2: f(y) }, 'rule'));
      g.appendChild(text(cx, y + 13, c.head, 'head-c', 'middle'));
      c.lines.forEach((l, i) => g.appendChild(text(r.x + PAD, y + HEAD_H + 11 + i * LEAD, l, c.cls)));
      y += HEAD_H + LEAD * c.lines.length + 6;
    });
  }
  // A border item, by its kind's shape (a port unless the shape is known).
  function drawPort(p, parent, L, region) {
    const g = node('g', { 'data-el': p.id, 'data-kind': p.kind, 'data-view': L.view.id }, elClass(p));
    drawOwn(p, g, L, region);
    parent.appendChild(g);
  }
  // A line, when it has two ends in view layout L and comes on screen.
  function drawRel(rel, parent, L, region) {
    const e = endpoints(rel, L);
    if (!e || !pointsOnScreen(e.pts, region)) return;
    parent.appendChild(relGroup(rel, e, L, region));
  }
  // What a line's drawing is made from, kept on its group as signOwn's is: its fields, its points, and its label.
  function signRel(rel, e, region) {
    const how = M.RELATIONSHIPS[rel.kind].line;
    const label = how.label && !(region && region.far) ? how.label(rel, S.model, S.layout.ids) : '';
    return [region && region.far ? 'far' : '', JSON.stringify(rel), JSON.stringify(e.pts), label].join('|');
  }
  // A line's group: the wide stroke that takes the pointer, the line with its markers, and its label (not far out).
  function relGroup(rel, e, L, region) {
    const how = M.RELATIONSHIPS[rel.kind].line;
    const g = node('g', { 'data-rel': rel.id, 'data-kind': rel.kind, 'data-view': L.view.id }, 'rel ' + how.cls);
    g.sign = signRel(rel, e, region);
    const d = e.pts.map((p, i) => (i ? ' L' : 'M') + f(p.x) + ',' + f(p.y)).join('');
    g.appendChild(node('path', { d: d }, 'hit'));
    const line = node('path', { d: d }, 'line');
    if (how.marker) line.setAttribute('marker-end', 'url(#' + how.marker + ')');
    if (how.markerStart) line.setAttribute('marker-start', 'url(#' + how.markerStart + ')');
    g.appendChild(line);
    // The label, below the line's middle by the kind's labelOffset (30 unless said; negative puts it above).
    const label = how.label && !(region && region.far) ? how.label(rel, S.model, S.layout.ids) : '';
    if (label) g.appendChild(text(e.mid.x, e.mid.y + (typeof how.labelOffset === 'number' ? how.labelOffset : 30), label, 'uname', 'middle'));
    return g;
  }
  // A view's frame: the outline, the header tab (with a clear rectangle over it that takes the pointer, to select or
  // move the view), then, when the frame comes on screen, the view's content by its kind's renderer.
  function drawFrame(view, L, region) {
    const g = node('g', { 'data-view': view.id }, 'frame' + (view.id === S.active ? ' is-active' : ''));
    drawChrome(view, L, g, null);
    if (onScreen(L.frameRect, region)) rendererFor(view).draw(view, g, L, region);
    return g;
  }
  // What a frame's own pieces are made from, kept on its group as signOwn's is.
  function signChrome(view, L) { return [view.name, view.kind, JSON.stringify(L.frameRect), M.describeView(S.model, view)].join('|'); }
  // The frame's own pieces, each marked data-chrome so a patch can draw them again: put at the front of g, before
  // the content.
  function drawChrome(view, L, g) {
    g.sign = signChrome(view, L);
    Array.from(g.children).forEach((c) => { if (c.hasAttribute('data-chrome')) g.removeChild(c); });
    const fr = L.frameRect;
    const first = g.firstChild;
    const add = (n) => { n.setAttribute('data-chrome', ''); g.insertBefore(n, first); };
    add(node('rect', { x: f(fr.x), y: f(fr.y), width: f(fr.w), height: f(fr.h), rx: 12 }, 'outline'));
    const name = view.name.trim() || 'view';
    const label = '«view» ' + name + ' : ' + view.kind;
    const tabW = Math.min(fr.w - 24, 16 + label.length * 6.6);
    add(node('path', { d: 'M' + f(fr.x) + ',' + f(fr.y + 26) + ' H' + f(fr.x + tabW) + ' A8,8 0 0 0 ' + f(fr.x + tabW + 8) + ',' + f(fr.y + 18) + ' V' + f(fr.y) }, 'outline'));
    const t = node('text', { x: f(fr.x + 12), y: f(fr.y + 18) });
    const a = node('tspan', {}, 'kw');
    a.textContent = '«view» ';
    const b = node('tspan', {}, 'frame-name');
    b.textContent = name;
    const c = node('tspan', {}, 'kw');
    c.textContent = ' : ' + view.kind;
    t.appendChild(a);
    t.appendChild(b);
    t.appendChild(c);
    add(t);
    const tab = node('rect', { x: f(fr.x), y: f(fr.y), width: f(tabW + 8), height: 26 }, 'tab');
    const title = node('title');
    title.textContent = M.describeView(S.model, view) + ', ' + M.an(M.VIEW_KINDS[view.kind].label) + '. Click to select it, drag to move it.';
    tab.appendChild(title);
    add(tab);
  }

  // ---- Drawing again just what a change altered, in a graph view's groups (its renderer's patch).

  // The element groups drawn in a graph view's content, by id.
  function drawnElements(els) {
    const drawn = new Map();
    els.querySelectorAll('g[data-el]').forEach((n) => drawn.set(n.getAttribute('data-el'), n));
    return drawn;
  }
  // Whether element id, laid out at r, is drawn in view layout L, given what else is, as drawBox draws: a border item
  // when its owner's box is, a box when it comes on screen and its parent in the view is drawn, or it sits on the
  // view's ground.
  function belongsDrawn(id, r, L, drawn, region) {
    const parent = L.parentOf.get(id);
    if (r.port) return !!parent && drawn.has(parent);
    return (!parent || drawn.has(parent)) && onScreen(r, region);
  }
  // A change that only moved things: each drawn box or border item whose rect changed draws its own part again, each
  // drawn line with an end that moved is drawn again, and so are the border items at the ends of those lines, whose
  // names keep clear of them; the frame's pieces follow the frame. Something coming on screen or going off it is the
  // whole view's to draw again (false).
  function patchMoves(view, g, els, rels, before, L, region) {
    if (before.shown.size !== L.shown.size) return false;
    const drawn = drawnElements(els);
    const changed = new Set();
    for (const [id, r] of L.rects) {
      const o = before.rects.get(id);
      if (!o) return false;
      if (o.x === r.x && o.y === r.y && o.w === r.w && o.h === r.h && o.side === r.side) continue;
      changed.add(id);
      if (belongsDrawn(id, r, L, drawn, region) !== drawn.has(id)) return false;
    }
    const ids = S.layout.ids;
    changed.forEach((id) => { if (drawn.has(id)) redrawOwn(ids.get(id), drawn.get(id), L, region); });
    const lines = new Map();
    rels.querySelectorAll(':scope > g[data-rel]').forEach((n) => lines.set(n.getAttribute('data-rel'), n));
    const ends = new Set();
    for (const rel of L.rels) {
      if (!changed.has(rel.from) && !changed.has(rel.to)) continue;
      const e = endpoints(rel, L);
      const n = lines.get(rel.id);
      if (!n) { if (e && pointsOnScreen(e.pts, region)) return false; continue; }
      rels.replaceChild(relGroup(rel, e, L, region), n);
      ends.add(rel.from);
      ends.add(rel.to);
    }
    ends.forEach((id) => { const n = drawn.get(id); if (n && !changed.has(id) && L.rects.get(id).port) redrawOwn(ids.get(id), n, L, region); });
    if (g.sign !== signChrome(view, L)) drawChrome(view, L, g);
    return true;
  }
  // Any other change (a name, a field, a definition, a line drawn or deleted): each drawn group whose drawing is made
  // from something else now (its sign, see signOwn and signRel) draws its own part again, and so does the frame. When
  // what is drawn would differ (something to draw that isn't drawn, or drawn that isn't there now, or in another
  // order, or in another box), the whole view is drawn again (false).
  function patchContent(view, g, els, rels, L, region) {
    const ids = S.layout.ids;
    const drawn = drawnElements(els);
    for (const [id, n] of drawn) {
      const parent = L.parentOf.get(id);
      const host = n.parentNode && n.parentNode.getAttribute ? n.parentNode.getAttribute('data-el') : null;
      if (!ids.has(id) || !L.rects.has(id) || (parent || null) !== (host || null)) return false;
    }
    for (const [id, r] of L.rects) if (!drawn.has(id) && belongsDrawn(id, r, L, drawn, region)) return false;
    // The order the groups are drawn in, which drawBox follows: the boxes, then the border items, each in the view's
    // order of its parent's kids.
    const order = (key, box) => (L.kids.get(key) || []).filter((k) => drawn.has(k.id) && !M.KINDS[k.kind].onBorder === box).map((k) => k.id);
    const inOrder = (key, container) => {
      const want = order(key, true).concat(order(key, false));
      const have = Array.from(container.children).filter((c) => c.hasAttribute('data-el')).map((c) => c.getAttribute('data-el'));
      return want.length === have.length && want.every((id, i) => id === have[i]);
    };
    if (!inOrder('', els)) return false;
    for (const [id, n] of drawn) if (!inOrder(id, n)) return false;
    drawn.forEach((n, id) => { if (n.sign !== signOwn(ids.get(id), L, region)) redrawOwn(ids.get(id), n, L, region); });
    const lines = Array.from(rels.children).filter((c) => c.hasAttribute('data-rel'));
    const shown = [];
    for (const rel of L.rels) {
      const e = endpoints(rel, L);
      if (e && pointsOnScreen(e.pts, region)) shown.push({ rel: rel, e: e });
    }
    if (shown.length !== lines.length || shown.some((x, i) => x.rel.id !== lines[i].getAttribute('data-rel'))) return false;
    shown.forEach((x, i) => { if (lines[i].sign !== signRel(x.rel, x.e, region)) rels.replaceChild(relGroup(x.rel, x.e, L, region), lines[i]); });
    if (g.sign !== signChrome(view, L)) drawChrome(view, L, g);
    return true;
  }

  // The renderers, by the name a view kind gives in VIEW_KINDS. Each lays a view out: layout(view, ids) returns
  // { view, shown (a Set of the ids of the elements drawn), kids (a parent's id, or '' for the view's ground → the
  // elements in it), parentOf (the other way round), rects (element id → its rect in plane coordinates; a border
  // item's has cx, cy, side and port: true), comps (element id → its compartments, [{ head, lines, cls }]), frameRect
  // (from frameAround), and lines (optional: relationship id → the points of a line the renderer routed itself; a
  // renderer that fills it draws those lines and no other, and only they count as drawn in its view) }.
  // Pins, badges, lines, the Show list and the panel read shown, rects, comps and endpoints(), so a renderer that
  // fills them gets all of that for free. It draws its content into the frame's group (draw(view, g, L, region): the
  // region is the part of the plane being drawn, which a renderer may keep to, see onScreen; null is all of it). A
  // renderer may also patch(view, g, before, L, region, moving) the content it drew after a change: draw again just
  // what the change altered, from the view's layout before it (before) to the one now (L), and return true; or return
  // false, and the view's content is drawn again whole. moving says the change only moved things. A renderer may say
  // a view's layout still holds after a change to what things are (keeps(view, L, plan, ids), plan.touched the ids
  // of the elements touched), so it isn't laid out again. When the view's elements can be placed and moved by hand, it
  // the view's elements can be placed and moved by hand, places one (place(view, kind, p, hit) adds the element to
  // the model and the view's layout, or says why not and returns null), starts a drag of one (dragStart(view, el, p)
  // returns the drag record or null), moves it (drag(view, el, d, p)), and finishes (drop(view, el, d, p, event)
  // returns { undo, text, key, say } for the undo entry, the change log and the status, or null when nothing
  // changed). A renderer that shows every element of the model whatever the view's layout says (the browser) carries
  // showsAll: true: the Show list and Remove from view then say so. One that draws what the checks found (the grid's
  // problems column) carries problems: true, and is drawn again when the checks find something else. The slices add sequence, geometry, grid and
  // browser in their regions below (RENDERERS.sequence = {…}).
  const RENDERERS = {
    graph: {
      layout: graphLayout,
      keeps: graphKeeps,
      draw: function (view, g, L, region) {
        // Boxes first, then lines on top of them, so a line between things inside a box shows over the box's fill.
        const els = node('g', {}, 'els');
        const rels = node('g', {}, 'rels');
        g.appendChild(els);
        g.appendChild(rels);
        (L.kids.get('') || []).forEach((el) => { if (!M.KINDS[el.kind].onBorder && onScreen(L.rects.get(el.id), region)) drawBox(el, els, L, region); });
        L.rels.forEach((rel) => drawRel(rel, rels, L, region));
      },
      // Draws again what a change altered, in the groups already drawn (see patchMoves and patchContent).
      patch: function (view, g, before, L, region, moving) {
        const els = g.querySelector(':scope > g.els');
        const rels = g.querySelector(':scope > g.rels');
        if (!before || !els || !rels || !onScreen(L.frameRect, region)) return false;
        return moving ? patchMoves(view, g, els, rels, before, L, region) : patchContent(view, g, els, rels, L, region);
      },
      place: function (view, kind, p, hit) {
        const k = M.KINDS[kind];
        const L = viewLayout(view.id);
        let el;
        if (k.onBorder) {
          const under = hit.type === 'el' ? S.layout.ids.get(hit.id) : null;
          let host = under && M.canContain(under.kind, kind) ? under.id : containerAt(L, p, null, kind);
          if (under && M.KINDS[under.kind].onBorder) host = under.owner !== undefined && M.canContain(S.layout.ids.get(under.owner).kind, kind) ? under.owner : null;
          if (!host || !view.layout[host]) { say('Click a part def or a part in this view to put a ' + k.label + ' on its border.'); return null; }
          const b = nearestBorder(L.rects.get(host), p);
          el = freshElement(kind, C.freeName(kind, host));
          el.owner = host;
          view.layout[el.id] = { side: b.side, at: b.at };
        } else {
          const w = k.size[0];
          const h = k.size[1];
          const host = containerAt(L, p, null, kind);
          el = freshElement(kind, C.freeName(kind, host));
          const lay = { x: Math.round(p.x - view.x - w / 2), y: Math.round(p.y - view.y - 20), w: w, h: h };
          if (host) {
            const r = L.rects.get(host);
            el.owner = host;
            lay.x = Math.max(PAD, Math.round(p.x - r.x - w / 2));
            lay.y = Math.max(CHILD_TOP, Math.round(p.y - r.y - 20));
          }
          view.layout[el.id] = lay;
        }
        S.model.elements.push(el);
        return S.model.elements[S.model.elements.length - 1]; // the model's own object, which records what is written to it
      },
      dragStart: function (view, el, p) {
        const lay = view.layout[el.id];
        if (!lay) return null;
        const from = M.KINDS[el.kind].onBorder ? { side: lay.side, at: lay.at } : { x: lay.x, y: lay.y };
        // home is the box of the parent the element sits in here, as drawn before the drag: while the pointer stays
        // inside it the parent keeps holding the element, growing for it; once the pointer leaves it the element is
        // on its way out (out), and the parent no longer makes room for it, so the drop is judged against the box
        // the user saw.
        const L = viewLayout(view.id);
        const parent = L ? L.parentOf.get(el.id) : '';
        const home = parent ? L.rects.get(parent) : null;
        return { kind: 'el', id: el.id, view: view.id, start: p, from: from, moved: false, over: undefined, home: home ? { x: home.x, y: home.y, w: home.w, h: home.h } : null, out: false };
      },
      drag: function (view, el, d, p) {
        const lay = view.layout[el.id];
        const L = viewLayout(view.id);
        if (M.KINDS[el.kind].onBorder) {
          const b = nearestBorder(L.rects.get(el.owner), p);
          lay.side = b.side;
          lay.at = b.at;
          return;
        }
        lay.x = Math.round(d.from.x + (p.x - d.start.x));
        lay.y = Math.round(d.from.y + (p.y - d.start.y));
        d.out = !d.home || !contains(d.home, p);
        d.over = containerAt(L, p, el, el.kind);
      },
      drop: function (view, el, d, p, event) {
        const lay = view.layout[el.id];
        const L = viewLayout(view.id);
        const what = M.describe(S.model, el);
        if (M.KINDS[el.kind].onBorder) return { undo: 'Moved ' + what + ' to the ' + lay.side + ' side', text: 'Moved ' + what + ' to the ' + lay.side + ' side', key: 'move:' + el.id };
        // Dropped inside another view's frame: the box goes back where it was. Showing it there is the Show list's job.
        const other = event.type === 'pointerup' ? viewAt(p, view.id) : null;
        if (other) {
          lay.x = d.from.x;
          lay.y = d.from.y;
          return { say: 'A box doesn\'t move into another view by dragging, so it went back. To show it in ' + M.describeView(S.model, viewById(other)) + ', select that view and use its Show list.' };
        }
        if (event.type === 'pointerup') {
          // The box it is dropped in, against the box it sat in here: another one, or none, changes its owner in the
          // model, and its place is read against the new parent's box. A box whose owner this view doesn't show sits
          // on the view's ground, and stays owned when moved about on it.
          const over = containerAt(L, p, el, el.kind);
          const visual = L.parentOf.get(el.id) || null;
          if (over === visual && visual !== null) { lay.x = Math.max(lay.x, PAD); lay.y = Math.max(lay.y, CHILD_TOP); }
          if (over !== visual) {
            const abs = L.rects.get(el.id);
            if (over === null) { delete el.owner; lay.x = Math.round(abs.x - view.x); lay.y = Math.round(abs.y - view.y); }
            else {
              const o = L.rects.get(over);
              el.owner = over;
              lay.x = Math.max(PAD, Math.round(abs.x - o.x));
              lay.y = Math.max(CHILD_TOP, Math.round(abs.y - o.y));
            }
            const text = 'Moved ' + what + (over ? ' into ' + M.describe(S.model, S.layout.ids.get(over)) : ' out onto the plane');
            return { undo: text, text: text, key: null };
          }
        } else if (L.parentOf.get(el.id)) { lay.x = Math.max(lay.x, PAD); lay.y = Math.max(lay.y, CHILD_TOP); }
        return { undo: 'Moved ' + what, text: 'Moved ' + what, key: 'move:' + el.id };
      }
    },
    // A view whose kind has no renderer yet: the frame at its minimum size, saying so.
    pending: {
      layout: function (view) {
        return { view: view, shown: new Set(), kids: new Map(), parentOf: new Map(), rects: new Map(), comps: new Map(), frameRect: frameAround(view, null) };
      },
      draw: function (view, g, L) {
        const fr = L.frameRect;
        g.appendChild(text(fr.x + fr.w / 2, fr.y + fr.h / 2, M.an(M.VIEW_KINDS[view.kind].label, true) + ' is not drawn yet.', 'pending', 'middle'));
      },
      place: function (view, kind) { say(M.an(M.KINDS[kind].label, true) + ' can\'t be drawn in ' + M.an(M.VIEW_KINDS[view.kind].label) + ' yet.'); return null; },
      dragStart: function () { return null; },
      drag: function () {},
      drop: function () { return null; }
    }
  };
  // A new element of a kind, with the fields its kind has, each at its starting value.
  function freshElement(kind, name) {
    const el = { id: newId('e'), kind: kind, name: name, doc: '' };
    M.KINDS[kind].fields.forEach((fld) => { if (el[fld] === undefined) blankField(el, fld); });
    return el;
  }
  // Gives item the starting value of a field, by its row in FIELDS: what fresh() returns when the row has one, else
  // false for a bool, the first value of an enum, '' for the rest; a field that isn't stored as a value (type) gets
  // nothing, and so does a field with no row.
  function blankField(item, fld) {
    const spec = M.FIELDS[fld];
    if (!spec || spec.stored === false) return;
    if (spec.fresh) item[fld] = spec.fresh();
    else if (spec.type === 'bool') item[fld] = false;
    else if (spec.type === 'enum') item[fld] = spec.values[0];
    else item[fld] = '';
  }

  Object.assign(C, {
    node, text, MARKERS, defs, nameLine, portName, SHAPES, COMPARTMENTS, compartmentsOf, ownCompartments, onScreen,
    pointsOnScreen, drawBox, drawRel, drawFrame, RENDERERS, freshElement, blankField
  });
})(window.SysMLCanvas);
