// Where everything is: each view lays out the elements it shows from its own origin, by its kind's renderer.
(function (C) {
  'use strict';
  const S = C.state;
  const { M, HEADER, HEAD_H, LEAD, PAD, PORT, MARGIN, MIN_FRAME, clamp, viewLayout, rendererFor } = C;

  // ---- Where everything is. Each view lays out the elements it shows from its own origin, by its kind's renderer.
  // In a graph view boxes nest the way the model's elements do, as far as the view shows them: a shown box sits in
  // its nearest owner that is shown too, else at the view's ground; a box grows to hold what it holds; a port sits on
  // its owner's border.

  function wrap(text, maxChars) {
    const out = [];
    for (const para of String(text || '').replace(/\r\n?/g, '\n').split('\n')) {
      let line = '';
      for (const word of para.split(/\s+/).filter(Boolean)) {
        if (line && (line + ' ' + word).length > maxChars) { out.push(line); line = word; }
        else line = line ? line + ' ' + word : word;
      }
      if (line || !para.trim()) out.push(line);
    }
    while (out.length && !out[out.length - 1]) out.pop();
    return out;
  }

  function portRect(p, r) {
    let cx;
    let cy;
    if (p.side === 'top') { cx = r.x + p.at * r.w; cy = r.y; }
    else if (p.side === 'bottom') { cx = r.x + p.at * r.w; cy = r.y + r.h; }
    else if (p.side === 'left') { cx = r.x; cy = r.y + p.at * r.h; }
    else { cx = r.x + r.w; cy = r.y + p.at * r.h; }
    return { x: cx - PORT / 2, y: cy - PORT / 2, w: PORT, h: PORT, cx: cx, cy: cy, side: p.side, port: true };
  }

  // The layout of one graph view: rects in plane coordinates for the elements it shows, kids by their parent in
  // the view ('' for the view's own ground), parentOf the other way round, comps the compartments of each box. order,
  // when given, is each element's place in the model's list, which computeLayout makes once for every view; before,
  // when given, is the view's layout before a change, whose compartments still hold for a box of the same width: for
  // every box after a change that only moved things (touched not given), and else for a box the change didn't touch
  // whose compartments read nothing but itself (touched, the ids of the elements it touched).
  function graphLayout(view, ids, order, before, touched) {
    order = order || new Map(S.model.elements.map((e, i) => [e.id, i]));
    const shown = new Set(Object.keys(view.layout).filter((id) => ids.has(id)));
    const kids = new Map();
    const parentOf = new Map();
    for (const id of shown) {
      const el = ids.get(id);
      let p = el.owner;
      while (p !== undefined && !shown.has(p)) { const o = ids.get(p); p = o ? o.owner : undefined; }
      const key = p === undefined ? '' : p;
      parentOf.set(id, key);
      if (!kids.has(key)) kids.set(key, []);
      kids.get(key).push(el);
    }
    kids.forEach((group) => group.sort((a, b) => order.get(a.id) - order.get(b.id)));
    const boxesOf = (key) => (kids.get(key) || []).filter((e) => !M.KINDS[e.kind].onBorder);
    const portsOf = (key) => (kids.get(key) || []).filter((e) => M.KINDS[e.kind].onBorder);
    const sizes = new Map();
    const rects = new Map();
    const comps = new Map();
    const widths = new Map();     // the width each box's compartments were wrapped to
    let foreign = false;          // whether a box shows a compartment that reads more than the box's element
    function size(el) {
      const lay = view.layout[el.id];
      const shape = C.SHAPES[M.KINDS[el.kind].shape] || C.SHAPES.rect;
      if (shape.compartments && !C.ownCompartments(el)) foreign = true;
      const same = before && before.widths && before.widths.get(el.id) === lay.w && (!touched || (!touched.has(el.id) && C.ownCompartments(el)));
      const kept = same ? before.comps.get(el.id) : null;
      const blocks = kept || (shape.compartments ? C.compartmentsOf(el, lay.w) : []);
      comps.set(el.id, blocks);
      widths.set(el.id, lay.w);
      // A shape with compartments is at least its header high; one without (a small node) may be any height.
      let bottom = (shape.compartments ? HEADER : 0) + blocks.reduce((h, c) => h + HEAD_H + LEAD * c.lines.length + 6, 0);
      let right = 0;
      for (const kid of boxesOf(el.id)) {
        const s = size(kid);
        const kl = view.layout[kid.id];
        // A box grows to hold what it holds, except the box being dragged out of it (the pointer has left the box
        // as it was before the drag: drag.out), which it no longer makes room for.
        if (S.drag && S.drag.id === kid.id && S.drag.view === view.id && S.drag.out) continue;
        bottom = Math.max(bottom, kl.y + s.h + PAD);
        right = Math.max(right, kl.x + s.w + PAD);
      }
      const s = { w: Math.max(lay.w, right), h: Math.max(lay.h, bottom) };
      sizes.set(el.id, s);
      return s;
    }
    function place(el, ox, oy) {
      const lay = view.layout[el.id];
      const s = sizes.get(el.id);
      const r = { x: ox + lay.x, y: oy + lay.y, w: s.w, h: s.h };
      rects.set(el.id, r);
      for (const p of portsOf(el.id)) rects.set(p.id, portRect(view.layout[p.id], r));
      for (const kid of boxesOf(el.id)) place(kid, r.x, r.y);
    }
    let box = null;
    for (const el of boxesOf('')) {
      size(el);
      place(el, view.x, view.y);
      const r = rects.get(el.id);
      box = box ? {
        x: Math.min(box.x, r.x), y: Math.min(box.y, r.y),
        x2: Math.max(box.x2, r.x + r.w), y2: Math.max(box.y2, r.y + r.h)
      } : { x: r.x, y: r.y, x2: r.x + r.w, y2: r.y + r.h };
    }
    return { view: view, shown: shown, kids: kids, parentOf: parentOf, rects: rects, comps: comps, widths: widths, foreign: foreign, frameRect: frameAround(view, box) };
  }
  // Whether a graph view's layout L still holds after a change to what things are, not to which there are or where
  // (render, keeps): the rest of a graph layout is made from the view's places and the model's structure, so it does
  // when no box the change touched has other compartments now, and no box shows a compartment that reads beyond its
  // own element.
  function graphKeeps(view, L, plan, ids) {
    if (L.foreign) return false;
    for (const id of plan.touched) {
      if (!L.shown.has(id)) continue;
      const el = ids.get(id);
      const lay = view.layout[id];
      const shape = C.SHAPES[M.KINDS[el.kind].shape] || C.SHAPES.rect;
      const now = shape.compartments ? C.compartmentsOf(el, lay.w) : [];
      if (JSON.stringify(now) !== JSON.stringify(L.comps.get(id) || [])) return false;
    }
    return true;
  }
  // The frame around a view's content: its bounding box plus the margin, never smaller than the minimum. An empty
  // view's frame starts at the view's origin.
  function frameAround(view, box) {
    const fr = box
      ? { x: box.x - MARGIN, y: box.y - MARGIN - 12, w: box.x2 - box.x + 2 * MARGIN, h: box.y2 - box.y + 2 * MARGIN + 12 }
      : { x: view.x - MARGIN, y: view.y - MARGIN - 12, w: MIN_FRAME[0], h: MIN_FRAME[1] };
    fr.w = Math.max(fr.w, MIN_FRAME[0]);
    fr.h = Math.max(fr.h, MIN_FRAME[1]);
    return fr;
  }
  // Every view's layout, plus where: for each element and drawn line, the views it is drawn in (where.get(id), a
  // list of view ids, or undefined for none); and bounds, the box around every frame. Given the layout from before a
  // change (previous) and what the change can have altered (plan, from render), it lays out again only what it must:
  // plan.views, when given, are the views a change that showed, hid or moved things touched, and the others keep
  // their layouts; plan.moving says it only moved things, so a view laid out again draws the same lines, and its
  // renderer may keep what moves can't change. With no plan.views, every view is laid out again, unless its renderer
  // says the change can't have altered its layout (keeps(view, L, plan)); a renderer laying a view out again is told
  // what the change touched (plan.touched, the ids of the elements), to keep what that can't have changed. A change
  // that left the model's structure as it was (plan.structure false: no element added, removed or moved in the list)
  // keeps the element index, and one that touched no line and showed or hid nothing keeps each view's lines. With no
  // previous layout, everything is laid out anew.
  function computeLayout(previous, plan) {
    const kept = !!previous && !!plan && (!!plan.views || !plan.structure);
    // The element index the library's lookups hold, in a reading (render lays out in one), which the helpers then
    // answer from at their quickest; a new one outside a reading.
    const ids = kept ? previous.ids : M.idsOf(S.model);
    const order = kept ? previous.order : new Map(S.model.elements.map((e, i) => [e.id, i]));
    const views = new Map();
    let b = null;
    for (const view of S.model.views) {
      const was = previous ? previous.views.get(view.id) : null;
      const same = !!was && was.view === view;
      const r = rendererFor(view);
      let L;
      if (kept && same && plan.views && !plan.views.has(view.id)) L = was;
      else if (kept && same && plan.views && plan.moving) L = sameLines(r.layout(view, ids, order, was), was);
      else if (plan && same && !plan.views) {
        const still = !plan.structure && !plan.shown;
        // A layout that still holds after a change to lines still draws other lines (a line hidden, say).
        if (still && r.keeps && r.keeps(view, was, plan, ids)) L = plan.lines.size ? drawnLines(Object.assign({}, was, { byEnd: undefined })) : was;
        else {
          L = r.layout(view, ids, order, was, plan.touched);
          if (still && !plan.lines.size && L.shown.size === was.shown.size) sameLines(L, was);
          else drawnLines(L);
        }
      } else L = drawnLines(r.layout(view, ids, order));
      views.set(view.id, L);
      const fr = L.frameRect;
      b = b ? { x: Math.min(b.x, fr.x), y: Math.min(b.y, fr.y), x2: Math.max(b.x2, fr.x + fr.w), y2: Math.max(b.y2, fr.y + fr.h) }
        : { x: fr.x, y: fr.y, x2: fr.x + fr.w, y2: fr.y + fr.h };
    }
    const bounds = b ? { x: b.x, y: b.y, w: b.x2 - b.x, h: b.y2 - b.y } : { x: -220, y: -140, w: 440, h: 280 };
    return { ids: ids, order: order, views: views, where: whereIn(views), bounds: bounds };
  }
  // A view laid out again draws the lines it drew before: a change that touched no line, and showed or hid nothing.
  function sameLines(L, was) {
    L.rels = was.rels;
    L.drawn = was.drawn;
    L.byEnd = was.byEnd;
    return L;
  }
  // The lines a view layout draws, as L.rels (the relationships, in the model's order) and L.drawn (their ids): those
  // the renderer routed itself, when it routes (L.lines holds every line such a renderer draws), else, for a renderer
  // that draws every line between the rects it has, those with both ends drawn there; never a line that is hidden.
  function drawnLines(L) {
    L.rels = S.model.relationships.filter((rel) => !rel.hidden && (L.lines ? L.lines.has(rel.id) : (L.rects.has(rel.from) && L.rects.has(rel.to))));
    L.drawn = new Set(L.rels.map((rel) => rel.id));
    return L;
  }
  // Which views draw an element or a line, asked of the views' layouts one id at a time.
  function whereIn(views) {
    return {
      get: function (id) {
        const out = [];
        views.forEach((L, viewId) => { if (L.shown.has(id) || L.drawn.has(id)) out.push(viewId); });
        return out.length ? out : undefined;
      }
    };
  }

  function center(r) { return r.port ? { x: r.cx, y: r.cy } : { x: r.x + r.w / 2, y: r.y + r.h / 2 }; }
  // Where a line from the middle of box r toward toward leaves the box.
  function edgePoint(r, toward) {
    const c = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
    const dx = toward.x - c.x;
    const dy = toward.y - c.y;
    if (!dx && !dy) return { x: c.x, y: r.y };
    const t = Math.min(dx ? (r.w / 2) / Math.abs(dx) : Infinity, dy ? (r.h / 2) / Math.abs(dy) : Infinity);
    return { x: c.x + dx * t, y: c.y + dy * t };
  }
  // A straight line between the borders of two boxes, or from the edge of a port's square.
  function straight(ra, rb) {
    const ca = center(ra);
    const cb = center(rb);
    let a = ra.port ? ca : edgePoint(ra, cb);
    let b = rb.port ? cb : edgePoint(rb, ca);
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const u = { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
    if (ra.port) a = { x: a.x + u.x * (PORT / 2 + 1), y: a.y + u.y * (PORT / 2 + 1) };
    if (rb.port) b = { x: b.x - u.x * (PORT / 2 + 1), y: b.y - u.y * (PORT / 2 + 1) };
    return [a, b];
  }
  // A line of three straight pieces, out of one box's side and into the facing side of the other, so lines to the
  // same definition from a row of boxes meet in one bus. Null when the boxes overlap in both directions.
  function elbow(ra, rb) {
    const ax = ra.x + ra.w / 2;
    const ay = ra.y + ra.h / 2;
    const bx = rb.x + rb.w / 2;
    const by = rb.y + rb.h / 2;
    if (rb.y + rb.h <= ra.y) { const m = (ra.y + rb.y + rb.h) / 2; return [{ x: ax, y: ra.y }, { x: ax, y: m }, { x: bx, y: m }, { x: bx, y: rb.y + rb.h }]; }
    if (rb.y >= ra.y + ra.h) { const m = (ra.y + ra.h + rb.y) / 2; return [{ x: ax, y: ra.y + ra.h }, { x: ax, y: m }, { x: bx, y: m }, { x: bx, y: rb.y }]; }
    if (rb.x >= ra.x + ra.w) { const m = (ra.x + ra.w + rb.x) / 2; return [{ x: ra.x + ra.w, y: ay }, { x: m, y: ay }, { x: m, y: by }, { x: rb.x, y: by }]; }
    if (rb.x + rb.w <= ra.x) { const m = (ra.x + rb.x + rb.w) / 2; return [{ x: ra.x, y: ay }, { x: m, y: ay }, { x: m, y: by }, { x: rb.x + rb.w, y: by }]; }
    return null;
  }
  // How a line is routed between the rects of its two ends, by the name in RELATIONSHIPS[kind].line.route: a function
  // of the two rects returning the points. An unknown route is drawn straight. The slices add their own.
  const ROUTES = {
    straight: straight,
    elbow: function (ra, rb) { return elbow(ra, rb) || straight(ra, rb); }
  };
  // Where a relationship's line goes in view layout L: its points, and the middle of it, where a label or a pin sits.
  // A renderer that routes its lines itself puts their points in L.lines (relationship id → points), which come
  // first; else the line is routed between the rects of its ends, and there is none when either isn't drawn.
  function endpoints(rel, L) {
    let pts = L.lines ? L.lines.get(rel.id) : null;
    if (!pts) {
      const ra = L.rects.get(rel.from);
      const rb = L.rects.get(rel.to);
      if (!ra || !rb) return null;
      pts = (ROUTES[M.RELATIONSHIPS[rel.kind].line.route] || ROUTES.straight)(ra, rb);
    }
    const i = Math.floor(pts.length / 2) - 1;
    const mid = { x: (pts[i].x + pts[i + 1].x) / 2, y: (pts[i].y + pts[i + 1].y) / 2 };
    return { pts: pts, a: pts[0], b: pts[pts.length - 1], mid: mid };
  }
  function nearestBorder(r, p) {
    const d = [
      { side: 'top', dist: Math.abs(p.y - r.y), at: (p.x - r.x) / r.w },
      { side: 'bottom', dist: Math.abs(p.y - (r.y + r.h)), at: (p.x - r.x) / r.w },
      { side: 'left', dist: Math.abs(p.x - r.x), at: (p.y - r.y) / r.h },
      { side: 'right', dist: Math.abs(p.x - (r.x + r.w)), at: (p.y - r.y) / r.h }
    ].sort((m, n) => m.dist - n.dist)[0];
    return { side: d.side, at: Math.round(clamp(d.at, 0.05, 0.95) * 100) / 100 };
  }
  function contains(r, p) { return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h; }
  // The innermost box under point p in view layout L that can hold an element of kind (any box that holds things
  // when kind is null), leaving out except and everything inside it. Null: the view's own ground.
  function containerAt(L, p, except, kind) {
    // What is inside except, as far as the view shows it: what it holds in the view, which is everything inside it in
    // the model that the view shows, since a shown box sits in its nearest shown owner.
    const skip = new Set();
    const inside = (id) => { skip.add(id); (L.kids.get(id) || []).forEach((k) => inside(k.id)); };
    if (except) inside(except.id);
    let best = null;
    L.shown.forEach((id) => {
      const el = S.layout.ids.get(id);
      if (!M.KINDS[el.kind].contains || skip.has(id) || (kind && !M.canContain(el.kind, kind))) return;
      const r = L.rects.get(id);
      if (!r || !contains(r, p)) return;
      if (!best || r.w * r.h < best.area) best = { id: id, area: r.w * r.h };
    });
    return best ? best.id : null;
  }
  // The view whose frame is under point p: the active one when it is, else the last drawn, which is on top.
  function viewAt(p, except) {
    const a = viewLayout(S.active);
    if (a && S.active !== except && contains(a.frameRect, p)) return S.active;
    let found = null;
    S.layout.views.forEach((L, id) => { if (id !== except && contains(L.frameRect, p)) found = id; });
    return found;
  }

  Object.assign(C, {
    wrap, graphLayout, graphKeeps, frameAround, computeLayout, center, ROUTES, endpoints, nearestBorder, contains, containerAt,
    viewAt
  });
})(window.SysMLCanvas);
