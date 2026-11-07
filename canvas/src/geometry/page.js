// The geometry view on the page.
(function (C) {
  'use strict';
  const S = C.state;
  const {
    M, PAD, VIEW_PANELS, $, say, clamp, editable, f, viewById, viewLayout, frameAround, containerAt, viewAt, node,
    text, MARKERS, nameLine, RENDERERS, freshElement, render, logChange, changed, snapshot, commit, endEdit, freeName,
    renderInspector, selectedView
  } = C;

  // The geometry view: a plan of the parts it shows, each drawn as its shape's footprint to scale, x to the right and y
  // up from a coordinate frame at the view's origin. A Box or Rectangle stands on its origin corner, length along x and
  // width along y, as the pilot's own vehicle example has it; a round shape (a cylinder, a sphere, a cone) is centred on
  // its origin. A part's position is in its owner's frame when the owner is drawn here too, else in the view's. The
  // positions and sizes are the model's: dragging a footprint changes posX and posY; dimensions are set in the panel.
  const GEO_AXIS = 96;  // the axes' length, in px
  function geoScale(view) { const s = +view.options.scale; return Number.isFinite(s) && s > 0 ? s : 40; }
  function geoViewUnit(view) { return M.GEO_UNITS.indexOf(view.options.unit) >= 0 ? view.options.unit : 'm'; }
  // Pixels per one of unit in a view.
  function geoPxPer(view, unit) { return geoScale(view) * M.geoConvert(1, unit, geoViewUnit(view)); }
  // The view's frame origin on the plane: the axes rise from it, so an empty frame keeps its usual place and size.
  function geoOrigin(view) { return { x: view.x, y: view.y + GEO_AXIS }; }
  function geoNum(v) { return typeof v === 'number' && Number.isFinite(v) ? v : 0; }
  // Rounds a position to what a pixel is worth in the part's unit, and one digit more (three decimals for metres at
  // 40 px per metre, whole millimetres at 0.04).
  function geoRound(v, pxPer) {
    const p = Math.pow(10, clamp(Math.ceil(Math.log10(pxPer)) + 1, 0, 6));
    return Math.round(v * p) / p;
  }
  // The footprint of an element whose position is measured from the plane point o: its shape (rect or circle) and rect in
  // plane coordinates, its origin (where its own children are measured from), whether it is to scale (its shape and the
  // dimensions the plan needs are set; else the kind's default size, dashed), and the words of its second line.
  function geoFootprint(view, el, o) {
    const unit = M.geoUnitOf(el);
    const px = geoPxPer(view, unit);
    const size = M.KINDS[el.kind].size;
    const x = o.x + geoNum(el.posX) * px;
    const y = o.y - geoNum(el.posY) * px;
    const dims = M.geoDims(el.shape);
    const set = (d) => typeof el[d] === 'number' && Number.isFinite(el[d]) && el[d] > 0;
    const out = (shape, r, toScale, text) => ({ shape: shape, x: r.x, y: r.y, w: r.w, h: r.h, toScale: toScale, origin: { x: x, y: y }, text: text });
    if (!dims) return out('rect', { x: x, y: y - size[1], w: size[0], h: size[1] }, false, 'no shape yet');
    const words = el.shape + ' ' + dims.map((d) => (d === 'radius' ? 'r ' : dims[0] === 'radius' ? 'h ' : '') + (typeof el[d] === 'number' ? M.geoNumber(el[d]) : '?')).join(' × ') + ' ' + unit;
    if (dims[0] === 'radius') {
      if (!set('radius')) return out('circle', { x: x - size[1] / 2, y: y - size[1] / 2, w: size[1], h: size[1] }, false, el.shape + ' · set its radius');
      const r = el.radius * px;
      return out('circle', { x: x - r, y: y - r, w: 2 * r, h: 2 * r }, true, words);
    }
    if (!set('length') || !set('width')) return out('rect', { x: x, y: y - size[1], w: size[0], h: size[1] }, false, el.shape + ' · set its length and width');
    return out('rect', { x: x, y: y - el.width * px, w: el.length * px, h: el.width * px }, true, words);
  }
  // The layout of a geometry view: the spatial elements it shows as footprints, each in the frame of its nearest owner
  // shown here (kids and parentOf as in a graph view), feet the footprints, origin the view's frame origin.
  function geometryLayout(view, ids) {
    const order = new Map(S.model.elements.map((e, i) => [e.id, i]));
    const shown = new Set(Object.keys(view.layout).filter((id) => ids.has(id) && M.hasTrait(ids.get(id).kind, 'spatial')));
    const kids = new Map();
    const parentOf = new Map();
    shown.forEach((id) => {
      const el = ids.get(id);
      let p = el.owner;
      while (p !== undefined && !shown.has(p)) { const owner = ids.get(p); p = owner ? owner.owner : undefined; }
      const key = p === undefined ? '' : p;
      parentOf.set(id, key);
      if (!kids.has(key)) kids.set(key, []);
      kids.get(key).push(el);
    });
    kids.forEach((group) => group.sort((a, b) => order.get(a.id) - order.get(b.id)));
    const o = geoOrigin(view);
    const rects = new Map();
    const feet = new Map();
    // The axes and the scale bar take their room whatever is drawn, so an empty view frames them.
    let box = { x: o.x - 8, y: o.y - GEO_AXIS - 16, x2: o.x + GEO_AXIS + 24, y2: o.y + 32 };
    const placeFoot = (el, from) => {
      const fp = geoFootprint(view, el, from);
      feet.set(el.id, fp);
      rects.set(el.id, { x: fp.x, y: fp.y, w: fp.w, h: fp.h });
      // A small footprint carries its two lines below itself, centred on it (as drawFootprint has it): the frame
      // leaves room for them below, and to either side by about what the longer line needs, 6.6 px a character.
      const small = !(fp.shape === 'rect' && fp.w >= 120 && fp.h >= 44);
      const half = small ? Math.max(('«' + M.KINDS[el.kind].keyword + '» ' + nameLine(el, ids)).length, fp.text.length) * 3.3 : 0;
      const bottom = fp.y + fp.h + (small ? 34 : 0);
      box = { x: Math.min(box.x, fp.x, fp.x + fp.w / 2 - half), y: Math.min(box.y, fp.y), x2: Math.max(box.x2, fp.x + fp.w, fp.x + fp.w / 2 + half), y2: Math.max(box.y2, bottom) };
      (kids.get(el.id) || []).forEach((k) => placeFoot(k, fp.origin));
    };
    (kids.get('') || []).forEach((el) => placeFoot(el, o));
    // No line is drawn in a plan, so none counts as drawn here (an empty lines map says so to computeLayout).
    return { view: view, shown: shown, kids: kids, parentOf: parentOf, rects: rects, comps: new Map(), frameRect: frameAround(view, box), lines: new Map(), origin: o, feet: feet };
  }
  MARKERS['m-geo-axis'] = '<marker id="m-geo-axis" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto">' +
    '<path class="geo-arrow" d="M1,1 L9,5 L1,9 Z"/></marker>';
  // The coordinate frame at the view's origin: the x and y axes with their names, and under the x axis a scale bar of
  // the shortest of 1, 2, 5 × 10ⁿ units of the view's unit that is at least 40 px long, reading "1 m".
  function drawGeometryAxes(view, g, L) {
    const o = L.origin;
    const scale = geoScale(view);
    const axes = node('g', {}, 'geo-axes');
    axes.appendChild(node('path', { d: 'M' + f(o.x) + ',' + f(o.y) + ' H' + f(o.x + GEO_AXIS), 'marker-end': 'url(#m-geo-axis)' }, 'geo-axis'));
    axes.appendChild(node('path', { d: 'M' + f(o.x) + ',' + f(o.y) + ' V' + f(o.y - GEO_AXIS), 'marker-end': 'url(#m-geo-axis)' }, 'geo-axis'));
    axes.appendChild(node('circle', { cx: f(o.x), cy: f(o.y), r: 2.5 }, 'geo-origin'));
    axes.appendChild(text(o.x + GEO_AXIS + 8, o.y + 4, 'x', 'geo-label'));
    axes.appendChild(text(o.x - 7, o.y - GEO_AXIS - 2, 'y', 'geo-label', 'end'));
    const base = Math.pow(10, Math.floor(Math.log10(40 / scale)));
    const n = +([1, 2, 5, 10].map((m) => m * base).find((v) => v * scale >= 40)).toPrecision(3);
    const len = n * scale;
    const by = o.y + 20;
    axes.appendChild(node('path', { d: 'M' + f(o.x) + ',' + f(by - 4) + ' V' + f(by + 4) + ' M' + f(o.x) + ',' + f(by) + ' H' + f(o.x + len) + ' M' + f(o.x + len) + ',' + f(by - 4) + ' V' + f(by + 4) }, 'geo-axis'));
    axes.appendChild(text(o.x + len + 6, by + 4, M.geoNumber(n) + ' ' + geoViewUnit(view), 'geo-scale'));
    g.appendChild(axes);
  }
  // A footprint: the outline (a rectangle or a circle), then «part» name : Type and the shape with its dimensions,
  // inside the footprint when it has room for them, else below it (pins and badges sit on its top edge); then what
  // sits inside it, on top of it.
  function drawFootprint(el, parent, L) {
    const kind = M.KINDS[el.kind];
    const fp = L.feet.get(el.id);
    const g = node('g', { 'data-el': el.id, 'data-kind': el.kind, 'data-view': L.view.id }, 'el usage footprint' + (fp.toScale ? '' : ' no-shape'));
    if (fp.shape === 'circle') g.appendChild(node('circle', { cx: f(fp.x + fp.w / 2), cy: f(fp.y + fp.h / 2), r: f(fp.w / 2) }, 'outline'));
    else g.appendChild(node('rect', { x: f(fp.x), y: f(fp.y), width: f(fp.w), height: f(fp.h) }, 'outline'));
    const inside = fp.shape === 'rect' && fp.w >= 120 && fp.h >= 44;
    const x = inside ? fp.x + PAD : fp.x + fp.w / 2;
    const y = inside ? fp.y + 16 : fp.y + fp.h + 15;
    const anchor = inside ? 'start' : 'middle';
    const head = node('text', { x: f(x), y: f(y), 'text-anchor': anchor });
    const kw = node('tspan', {}, 'kw');
    kw.textContent = '«' + kind.keyword + '» ';
    const name = node('tspan', {}, 'uname');
    name.textContent = nameLine(el);
    head.appendChild(kw);
    head.appendChild(name);
    g.appendChild(head);
    g.appendChild(text(x, y + 15, fp.text, 'geo-dims', anchor));
    parent.appendChild(g);
    (L.kids.get(el.id) || []).forEach((k) => drawFootprint(k, parent, L));
  }
  RENDERERS.geometry = {
    layout: geometryLayout,
    draw: function (view, g, L) {
      const plan = node('g', {}, 'geometry');
      g.appendChild(plan);
      (L.kids.get('') || []).forEach((el) => drawFootprint(el, plan, L));
      drawGeometryAxes(view, plan, L); // on top, since a part at the origin would cover them
    },
    // A new part: a box of one by one by one of the view's unit, centred on the click; inside another footprint that can
    // hold it, it belongs to that part and its position is in that part's frame.
    place: function (view, kind, p, hit) {
      const k = M.KINDS[kind];
      if (!M.hasTrait(kind, 'spatial')) { say(M.an(k.label, true) + ' has no footprint to draw to scale, so it can\'t go in ' + M.an(M.VIEW_KINDS[view.kind].label) + '.'); return null; }
      const L = viewLayout(view.id);
      const unit = geoViewUnit(view);
      const px = geoPxPer(view, unit);
      const host = containerAt(L, p, null, kind);
      const o = host ? L.feet.get(host).origin : L.origin;
      const el = freshElement(kind, freeName(kind, host));
      if (host) el.owner = host;
      el.shape = 'Box';
      el.length = 1;
      el.width = 1;
      el.height = 1;
      el.unit = unit;
      el.posX = geoRound((p.x - o.x) / px - 0.5, px);
      el.posY = geoRound((o.y - p.y) / px - 0.5, px);
      el.posZ = 0;
      view.layout[el.id] = M.placement(el, { x: 0, y: 0 });
      S.model.elements.push(el);
      return el;
    },
    dragStart: function (view, el, p) {
      if (!view.layout[el.id]) return null;
      return { kind: 'el', id: el.id, view: view.id, start: p, from: { posX: el.posX, posY: el.posY }, moved: false };
    },
    // Moving a footprint moves the part: its position follows the pointer, in its own unit, rounded to a pixel's worth.
    drag: function (view, el, d, p) {
      const px = geoPxPer(view, M.geoUnitOf(el));
      el.posX = geoRound(geoNum(d.from.posX) + (p.x - d.start.x) / px, px);
      el.posY = geoRound(geoNum(d.from.posY) - (p.y - d.start.y) / px, px);
    },
    // The owner stays whatever footprint the part lands in: changing owners is a general view's business. Dropped in
    // another view's frame, it goes back where it was, as a box does in a graph view.
    drop: function (view, el, d, p, event) {
      const what = M.describe(S.model, el);
      const other = event.type === 'pointerup' ? viewAt(p, view.id) : null;
      if (other) {
        el.posX = d.from.posX;
        el.posY = d.from.posY;
        return { say: 'A footprint doesn\'t move into another view by dragging, so it went back. To show ' + what + ' in ' + M.describeView(S.model, viewById(other)) + ', select that view and use its Show list.' };
      }
      const moved = 'Moved ' + what + ' to ' + M.geoNumber(geoNum(el.posX)) + ', ' + M.geoNumber(geoNum(el.posY)) + ' ' + M.geoUnitOf(el);
      return { undo: moved, text: moved, key: 'move:' + el.id };
    }
  };
  // The view's options in the panel: the scale (pixels per unit) and the unit. Changing the unit keeps the drawing its
  // size, so the scale follows (40 px per m is 0.04 px per mm); the unit is what new parts are measured in.
  const gScale = $('g-scale');
  const gUnit = $('g-unit');
  VIEW_PANELS.GeometryView = function (view, write) {
    gScale.value = M.geoNumber(geoScale(view));
    gUnit.value = geoViewUnit(view);
    gScale.readOnly = !write;
    gUnit.disabled = !write;
  };
  function geoSelectedView() {
    const view = selectedView();
    return view && view.kind === 'GeometryView' && editable() ? view : null;
  }
  function geoScaleText(view) { return 'Set the scale of ' + M.describeView(S.model, view) + ' to ' + M.geoNumber(geoScale(view)) + ' px per ' + geoViewUnit(view); }
  gScale.addEventListener('input', () => {
    const view = geoSelectedView();
    const v = gScale.value.trim() === '' ? NaN : +gScale.value;
    if (!view || !Number.isFinite(v) || v <= 0) return;
    const before = snapshot();
    view.options.scale = v;
    commit(geoScaleText(view), 'scale:' + view.id, before);
    render();
    changed();
  });
  gScale.addEventListener('change', () => {
    const view = geoSelectedView();
    if (!view) return;
    gScale.value = M.geoNumber(geoScale(view));
    logChange(geoScaleText(view), 'scale:' + view.id);
    endEdit();
    changed();
    say(geoScaleText(view) + '.');
  });
  gUnit.addEventListener('change', () => {
    const view = geoSelectedView();
    if (!view || M.GEO_UNITS.indexOf(gUnit.value) < 0) return;
    const before = snapshot();
    view.options.scale = +(geoScale(view) * M.geoConvert(1, gUnit.value, geoViewUnit(view))).toPrecision(6);
    view.options.unit = gUnit.value;
    const what = 'Set the unit of ' + M.describeView(S.model, view) + ' to ' + gUnit.value;
    commit(what, null, before);
    logChange(what);
    render();
    renderInspector();
    changed();
    say(what + '. The scale is now ' + M.geoNumber(geoScale(view)) + ' px per ' + gUnit.value + ', so the drawing keeps its size; new parts are measured in ' + gUnit.value + '.');
  });
})(window.SysMLCanvas);
