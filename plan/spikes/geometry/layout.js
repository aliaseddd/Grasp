// The geometry view's layout, shared by both candidates: pure, no DOM, no React. Ported from the old page's
// canvas/src/geometry/page.js (geoFootprint, geometryLayout, the scale bar of drawGeometryAxes, geoRound, drag).
// M is the model library (window.SysMLModel).
//
// The view's own units are px at 100% zoom, x to the right and y down, counted from the view's origin. The
// coordinate frame of the plan stands at ORIGIN, so a model point (x, y) of a unit lies at ORIGIN + (x, -y) * pxPer.

/** The axes' length, in the view's units. */
export const AXIS = 96;
/** A row's distance from a footprint's left side. */
export const PAD = 12;
/** How far, in screen px, the pointer may go between press and release and still click (the page's CLICK_DISTANCE). */
export const CLICK_DISTANCE = 4;
/** Where the plan's coordinate frame stands, in the view's units. */
export const ORIGIN = { x: 0, y: 0 };

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function scaleOf(view) { const s = +view.options.scale; return Number.isFinite(s) && s > 0 ? s : 40; }
export function unitOf(M, view) { return M.GEO_UNITS.indexOf(view.options.unit) >= 0 ? view.options.unit : 'm'; }

/** Rounds a position to what a pixel is worth in the part's unit, and one digit more (the old page's geoRound). */
export function geoRound(v, pxPer) {
  const p = Math.pow(10, clamp(Math.ceil(Math.log10(pxPer)) + 1, 0, 6));
  return Math.round(v * p) / p;
}

/** The scale bar for `scale` px per unit: the shortest of 1, 2, 5 x 10^n units that is at least 40 px long. */
export function barFor(M, scale, unit) {
  const base = Math.pow(10, Math.floor(Math.log10(40 / scale)));
  const n = +([1, 2, 5, 10].map((m) => m * base).find((v) => v * scale >= 40)).toPrecision(3);
  return { n, len: n * scale, words: M.geoNumber(n) + ' ' + unit };
}

function nameLine(M, model, el, ids) {
  let s = M.textName(el) || '(unnamed)';
  if (M.KINDS[el.kind].usage) {
    const typing = M.typingOf(model, el);
    if (typing) {
      const def = ids.get(typing.to);
      s += ' : ' + (el.conjugated ? '~' : '') + (def ? M.textName(def) || '(unnamed)' : '?');
    }
    if (el.multiplicity) s += ' [' + el.multiplicity + ']';
  }
  return s;
}

/**
 * What a view says that no position can alter, read from the model once: the spatial elements the view shows, in the
 * order they are drawn (an owner, then what it holds, each level in the model's order), each with its nearest owner
 * shown here, its words, its unit, and its footprint's form and size in the view's units.
 *   corner: a Box or Rectangle stands on its origin corner (its rectangle is x, y - h, w, h);
 *   centre: a round shape is centred on its origin.
 */
export function readView(M, model, view) {
  return M.reading(model, () => {
    const ids = new Map(model.elements.map((e) => [e.id, e]));
    const order = new Map(model.elements.map((e, i) => [e.id, i]));
    const scale = scaleOf(view);
    const unit = unitOf(M, view);
    const shown = new Set(Object.keys(view.layout).filter((id) => ids.has(id) && M.hasTrait(ids.get(id).kind, 'spatial')));
    const kids = new Map();
    shown.forEach((id) => {
      const el = ids.get(id);
      let p = el.owner;
      while (p !== undefined && !shown.has(p)) { const owner = ids.get(p); p = owner ? owner.owner : undefined; }
      const key = p === undefined ? '' : p;
      if (!kids.has(key)) kids.set(key, []);
      kids.get(key).push(el);
    });
    kids.forEach((group) => group.sort((a, b) => order.get(a.id) - order.get(b.id)));
    const parts = [];
    const read = (el, parent) => {
      const kind = M.KINDS[el.kind];
      const partUnit = M.geoUnitOf(el);
      const px = scale * M.geoConvert(1, partUnit, unit);
      const size = kind.size;
      const dims = M.geoDims(el.shape);
      const set = (d) => typeof el[d] === 'number' && Number.isFinite(el[d]) && el[d] > 0;
      const part = { id: el.id, kind: el.kind, parent, keyword: '«' + kind.keyword + '» ', name: nameLine(M, model, el, ids), unit: partUnit, px, posX: el.posX, posY: el.posY };
      const form = (shape, stands, w, h, toScale, text) => Object.assign(part, { shape, stands, w, h, toScale, text });
      if (!dims) form('rect', 'corner', size[0], size[1], false, 'no shape yet');
      else {
        const words = el.shape + ' ' + dims.map((d) => (d === 'radius' ? 'r ' : dims[0] === 'radius' ? 'h ' : '') + (typeof el[d] === 'number' ? M.geoNumber(el[d]) : '?')).join(' × ') + ' ' + partUnit;
        if (dims[0] === 'radius') {
          if (!set('radius')) form('circle', 'centre', size[1], size[1], false, el.shape + ' · set its radius');
          else form('circle', 'centre', 2 * el.radius * px, 2 * el.radius * px, true, words);
        } else if (!set('length') || !set('width')) form('rect', 'corner', size[0], size[1], false, el.shape + ' · set its length and width');
        else form('rect', 'corner', el.length * px, el.width * px, true, words);
      }
      // The two lines of words go inside a footprint that has room for them, else below it.
      part.inside = part.shape === 'rect' && part.w >= 120 && part.h >= 44;
      parts.push(part);
      (kids.get(el.id) || []).forEach((k) => read(k, el.id));
    };
    (kids.get('') || []).forEach((el) => read(el, null));
    return { view: view.id, scale, unit, parts, bar: barFor(M, scale, unit) };
  });
}

const FOOT_KEYS = ['parent', 'keyword', 'name', 'text', 'shape', 'x', 'y', 'w', 'h', 'toScale', 'inside', 'unit', 'px', 'posX', 'posY', 'ox', 'oy', 'at'];

/**
 * The layout: each part's footprint in the view's units, each in the frame of its nearest owner shown here.
 * `moves` gives positions that stand in for the model's, by element id ({ posX, posY }, what a drag's step asks).
 * A footprint that reads the same as in `previous` is the same object.
 *
 * A foot: id, kind, parent, keyword, name, text (its second line), shape ('rect' or 'circle'), its rectangle x, y, w,
 * h (a circle's is its bounding square), toScale (false: drawn dashed at its kind's default size), inside, its origin
 * ox, oy (where what it holds is measured from), unit, px (pixels per one of its unit), posX, posY, at (its place in
 * the drawing order: a later one lies on top).
 */
export function layOut(read, moves, previous) {
  const byId = new Map();
  const feet = [];
  const o = ORIGIN;
  // The axes and the scale bar take their room whatever is drawn, so an empty view frames them.
  let x1 = o.x - 8; let y1 = o.y - AXIS - 16; let x2 = o.x + AXIS + 24; let y2 = o.y + 32;
  let same = !!previous && previous.read === read && previous.feet.length === read.parts.length;
  read.parts.forEach((part, at) => {
    const from = part.parent === null ? null : byId.get(part.parent);
    const move = moves ? moves.get(part.id) : undefined;
    const posX = move ? move.posX : part.posX;
    const posY = move ? move.posY : part.posY;
    const ox = (from ? from.ox : o.x) + num(posX) * part.px;
    const oy = (from ? from.oy : o.y) - num(posY) * part.px;
    const x = part.stands === 'centre' ? ox - part.w / 2 : ox;
    const y = part.stands === 'centre' ? oy - part.h / 2 : oy - part.h;
    let foot = { id: part.id, kind: part.kind, parent: part.parent, keyword: part.keyword, name: part.name, text: part.text, shape: part.shape, x, y, w: part.w, h: part.h, toScale: part.toScale, inside: part.inside, unit: part.unit, px: part.px, posX, posY, ox, oy, at };
    const before = previous ? previous.byId.get(part.id) : undefined;
    if (before && FOOT_KEYS.every((k) => before[k] === foot[k])) foot = before;
    else same = false;
    byId.set(part.id, foot);
    feet.push(foot);
    const all = drawnBox(foot);
    x1 = Math.min(x1, all.x);
    y1 = Math.min(y1, foot.y);
    x2 = Math.max(x2, all.x + all.w);
    y2 = Math.max(y2, all.y + all.h);
  });
  if (same) return previous;
  return { read, view: read.view, scale: read.scale, unit: read.unit, origin: o, axis: AXIS, bar: read.bar, feet, byId, bounds: { x: x1, y: y1, w: x2 - x1, h: y2 - y1 } };
}

/** How far a footprint's marks stand above its top edge. */
export const MARK_ROOM = 10;

/**
 * The rectangle around everything a footprint draws: its outline, its marks above its top edge, and, for a small
 * footprint, its two lines of words below it, centred on it: 34 px below, and to either side by about what the longer
 * line needs, 6.6 px a character (the old page's measure).
 */
export function drawnBox(foot) {
  const half = foot.inside ? 0 : Math.max((foot.keyword + foot.name).length, foot.text.length) * 3.3;
  const x = Math.min(foot.x, foot.x + foot.w / 2 - half);
  const x2 = Math.max(foot.x + foot.w, foot.x + foot.w / 2 + half);
  return { x, y: foot.y - MARK_ROOM, w: x2 - x, h: foot.h + MARK_ROOM + (foot.inside ? 0 : 34) };
}

/** What lies at a point of the view: the id of the topmost footprint there, or null for the ground. */
export function footAt(L, p) {
  for (let i = L.feet.length - 1; i >= 0; i--) {
    const f = L.feet[i];
    if (f.shape === 'circle') {
      if (Math.hypot(p.x - (f.x + f.w / 2), p.y - (f.y + f.h / 2)) <= f.w / 2) return f.id;
    } else if (p.x >= f.x && p.x <= f.x + f.w && p.y >= f.y && p.y <= f.y + f.h) return f.id;
  }
  return null;
}

/** A point of the view in model coordinates of `unit`: in the view's frame, or in the frame of the footprint `frame`. */
export function toModel(M, L, p, unit, frame) {
  const f = frame ? L.byId.get(frame) : null;
  const px = L.scale * M.geoConvert(1, unit, L.unit);
  return { x: (p.x - (f ? f.ox : L.origin.x)) / px, y: ((f ? f.oy : L.origin.y) - p.y) / px };
}

/** A drag's step: the position of the footprint `id` of the layout the drag began from, moved by dx, dy of the view's units. */
export function movedBy(start, id, dx, dy) {
  const f = start.byId.get(id);
  return { posX: geoRound(num(f.posX) + dx / f.px, f.px), posY: geoRound(num(f.posY) - dy / f.px, f.px) };
}

/** Where a footprint's marks begin, on its top edge: the right end of a rectangle's, the top of a circle. The next mark is 20 to the left. */
export function marksAt(foot) {
  return foot.shape === 'circle' ? { x: foot.x + foot.w / 2, y: foot.y } : { x: foot.x + foot.w - 12, y: foot.y };
}

/** Contract 5's `listed`: what the view shows, each with its words and its rectangle in the view's units. */
export function listed(L) {
  return L.feet.map((f) => ({ type: 'el', id: f.id, words: f.keyword + f.name, rect: { x: f.x, y: f.y, w: f.w, h: f.h } }));
}

/** The camera that fits `bounds` into a window: at most 100%, 48 px around (the adapter's fit, without the minimap's band). */
export function fit(bounds, width, height, pad = 48) {
  const roomW = width - 2 * pad;
  const roomH = height - 2 * pad;
  const zoom = roomW <= 0 || roomH <= 0 ? 0.02 : Math.max(0.02, Math.min(1, roomW / bounds.w, roomH / bounds.h));
  return { x: pad + (roomW - bounds.w * zoom) / 2 - bounds.x * zoom, y: pad + (roomH - bounds.h * zoom) / 2 - bounds.y * zoom, zoom };
}
