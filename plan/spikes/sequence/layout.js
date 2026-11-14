// The sequence view's layout rule, shared by both candidates. Ported from canvas/src/sequence/page.js
// (RENDERERS.sequence.layout, insertEvent, moveMessageRow). Pure: no DOM, no React, no store. It reads the model
// library (M) only for the time order (M.messagesInOrder, M.eventOrder) and the kinds' rows.
//
// Places are counted from the view's origin (one view is on a tab, so the view's own x, y are not added).

export const EVENT_R = 6;      // an event's dot
export const EVENT_GAP = 20;   // the least distance between two events on a lifeline, and from the head to the first
export const LOOP = 48;        // how far a message that comes back to its own lifeline goes out
export const HEAD_GAP = 24;    // the least distance between two lifelines' heads
export const NEAR = 24;        // how near a lifeline's dashed line a point must be to be on it
export const SPACING = [24, 400];
export const CLICK_DISTANCE = 4;   // screen px a press may move and still be a click (the page's, plane/viewStore.ts)

export function rowSpacing(M, view) {
  const s = view.options ? +view.options.spacing : NaN;
  return Number.isFinite(s) && s >= SPACING[0] && s <= SPACING[1] ? s : M.VIEW_KINDS.SequenceView.options.spacing;
}

/** A message's line through its row: straight, or a loop when it comes back to its own lifeline. */
export function messagePoints(ax, bx, y, self, dotA, dotB) {
  const da = dotA ? EVENT_R + 1 : 0;
  const db = dotB ? EVENT_R + 1 : 0;
  if (self) return [{ x: ax + da, y }, { x: ax + LOOP, y }, { x: ax + LOOP, y: y + EVENT_GAP }, { x: ax + db, y: y + EVENT_GAP }];
  const dir = bx > ax ? 1 : -1;
  return [{ x: ax + dir * da, y }, { x: bx - dir * db, y }];
}

/** Where a message's label and its marks sit: the middle of its first piece. */
export function messageMid(points) {
  return { x: (points[0].x + points[1].x) / 2, y: points[0].y };
}

/** A succession's line: straight from one dot's edge to the other's, given the two dots' centres. */
export function linkPoints(a, b) {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const u = { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
  const r = EVENT_R + 1;
  return [{ x: a.x + u.x * r, y: a.y + u.y * r }, { x: b.x - u.x * r, y: b.y - u.y * r }];
}

/** Every message's id in time order, after the row `id` is moved to `target` among the view's drawn rows. */
export function messagesAfterMove(M, model, rows, id, target) {
  const all = M.messagesInOrder(model).map((m) => m.id).filter((x) => x !== id);
  const others = rows.filter((m) => m.id !== id);
  if (!others.length) all.push(id);
  else if (target >= others.length) all.splice(all.indexOf(others[others.length - 1].id) + 1, 0, id);
  else all.splice(all.indexOf(others[Math.max(0, target)].id), 0, id);
  return all;
}

const f = (n) => Math.round(n * 100) / 100;
const pts = (points) => points.map((p) => f(p.x) + ',' + f(p.y)).join(' ');

/**
 * Lays one sequence view out.
 *
 * `step` is a gesture in progress, or null:
 *   { kind: 'lifeline', id, x }  the head's left edge is asked to be at x; the others keep their order rule
 *   { kind: 'event', id, y }     the event's dot is asked to be at height y on its own lifeline
 *   { kind: 'message', id, y }   the message's row is asked to be at height y; the other rows make room
 * `previous` is the layout before: a lifeline, event, message or link that reads the same comes out as the same object.
 *
 * It gives { spacing, headBottom, bottom, size, lifelines, events, messages, links, result }, where `result` is what
 * the step would write at its end: { kind: 'lifeline', id, x }, { kind: 'event', id, lifeline, index, y } (or
 * `pinned`, the message whose row holds the event), { kind: 'message', id, row, order } (`order`: every message's id
 * in the new time order).
 */
export function layout(M, model, view, step = null, previous = null) {
  const spacing = rowSpacing(M, view);
  const ids = new Map(model.elements.map((e) => [e.id, e]));
  const order = new Map(model.elements.map((e, i) => [e.id, i]));
  const xOf = (id) => (step && step.kind === 'lifeline' && step.id === id ? Math.round(step.x) : view.layout[id].x);
  const lifelineEls = Object.keys(view.layout).map((id) => ids.get(id))
    .filter((e) => e && M.hasTrait(e.kind, 'lifeline') && !M.KINDS[e.kind].onBorder)
    .sort((a, b) => (xOf(a.id) - xOf(b.id)) || (order.get(a.id) - order.get(b.id)));
  const heads = new Map();
  let headBottom = 0;
  let clear = -Infinity;   // where the next head may start without overlapping the one before it
  for (const l of lifelineEls) {
    const lay = view.layout[l.id];
    const r = { x: Math.max(xOf(l.id), clear), y: 0, w: lay.w, h: lay.h };
    clear = r.x + r.w + HEAD_GAP;
    heads.set(l.id, r);
    headBottom = Math.max(headBottom, r.y + r.h);
  }
  const cxOf = (id) => { const r = heads.get(id); return r.x + r.w / 2; };
  // The lifeline an end is drawn on: itself when it is one, else the nearest owner that is.
  const lifelineOf = (id) => {
    let cur = ids.get(id);
    while (cur) {
      if (heads.has(cur.id)) return cur.id;
      cur = cur.owner !== undefined ? ids.get(cur.owner) : null;
    }
    return null;
  };
  const drawn = (m) => lifelineOf(m.from) && lifelineOf(m.to);

  // A message's row being dragged: the model is read as its end would leave it, so the other rows make room, and the
  // events follow the time order the drop would give.
  let read = model;
  let result = null;
  let lifted = null;   // the dragged row's id and height
  if (step && step.kind === 'message') {
    const rowsNow = M.messagesInOrder(model).filter(drawn);
    if (rowsNow.some((m) => m.id === step.id)) {
      const top = headBottom + spacing;
      const y = Math.max(top, Math.min(step.y, headBottom + spacing * rowsNow.length));
      const target = Math.max(0, Math.min(rowsNow.length - 1, Math.round((y - top) / spacing)));
      const moved = messagesAfterMove(M, model, rowsNow, step.id, target);
      const place = new Map(moved.map((id, i) => [id, i + 1]));
      read = { ...model, relationships: model.relationships.map((r) => (r.kind === 'Message' ? { ...r, order: place.get(r.id) } : r)) };
      lifted = { id: step.id, y };
      result = { kind: 'message', id: step.id, row: target, order: moved };
    }
  }

  return M.reading(read, () => {
    const rows = M.messagesInOrder(read).filter(drawn);
    const rowY = new Map();
    rows.forEach((m, i) => rowY.set(m.id, lifted && lifted.id === m.id ? lifted.y : headBottom + spacing * (i + 1)));
    const selfOf = (m) => lifelineOf(m.from) === lifelineOf(m.to);
    // The first drawn message that starts or ends on each event, and where that end sits: a message that comes back
    // to its own lifeline ends at the bottom of its loop.
    const firstAt = new Map();
    for (const m of rows) {
      if (!firstAt.has(m.from)) firstAt.set(m.from, { m, y: rowY.get(m.id) });
      if (!firstAt.has(m.to)) firstAt.set(m.to, { m, y: rowY.get(m.id) + (selfOf(m) ? EVENT_GAP : 0) });
    }
    let bottom = headBottom + spacing;
    const was = previous ? previous.byId : null;
    const byId = new Map();
    const keep = (item) => {
      const before = was ? was.get(item.id) : null;
      const out = before && before.key === item.key ? before : item;
      byId.set(out.id, out);
      return out;
    };
    const lifelines = [];
    const events = [];
    const eventAt = new Map();
    for (const l of lifelineEls) {
      const cx = cxOf(l.id);
      const all = M.eventOrder(read, l.id).filter((e) => view.layout[e.id]);
      // The event being dragged: the others are laid out as if it were not there, and it follows the pointer below
      // the head. One a drawn message starts or ends on stays on the message's row, whatever is asked.
      const asked = step && step.kind === 'event' ? all.find((e) => e.id === step.id) : null;
      const free = !!asked && !firstAt.has(asked.id);
      const own = free ? all.filter((e) => e !== asked) : all;
      const ys = own.map((e) => (firstAt.has(e.id) ? firstAt.get(e.id).y : null));
      for (let i = 0; i < own.length; i++) {
        if (ys[i] !== null) continue;
        let j = i + 1;
        while (j < own.length && ys[j] === null) j++;
        const lower = (i ? ys[i - 1] : headBottom) + EVENT_GAP;
        const upper = j < own.length ? ys[j] - EVENT_GAP * (j - i) : Infinity;
        ys[i] = Math.max(lower, Math.min(view.layout[own[i].id].y, upper));
      }
      if (free) {
        // Its new place among its lifeline's events, by height: in front of the first drawn below it, else last.
        const y = Math.max(headBottom + EVENT_GAP, step.y);
        const below = ys.findIndex((other) => other > y);
        const index = below < 0 ? own.length : below;
        own.splice(index, 0, asked);
        ys.splice(index, 0, y);
        result = { kind: 'event', id: asked.id, lifeline: l.id, index, y: Math.round(y) };
      } else if (asked) {
        result = { kind: 'event', id: asked.id, lifeline: l.id, pinned: firstAt.get(asked.id).m.id };
      }
      own.forEach((e, i) => {
        const pinned = firstAt.has(e.id) ? firstAt.get(e.id).m.id : null;
        const name = M.textName(e) || '';
        const ev = keep({ id: e.id, key: ['e', l.id, name, f(cx), f(ys[i]), pinned].join('|'), lifeline: l.id, name, cx, cy: ys[i], pinned });
        events.push(ev);
        eventAt.set(e.id, ev);
        bottom = Math.max(bottom, ys[i] + spacing);
      });
    }
    const messages = [];
    let right = -Infinity;
    rows.forEach((m, i) => {
      const y = rowY.get(m.id);
      const la = lifelineOf(m.from);
      const lb = lifelineOf(m.to);
      const self = la === lb;
      // A line stops at the edge of an event's dot, and reaches the lifeline itself when that is the end.
      const dotA = eventAt.has(m.from);
      const dotB = eventAt.has(m.to);
      const points = messagePoints(cxOf(la), cxOf(lb), y, self, dotA, dotB);
      const label = M.RELATIONSHIPS.Message.line.label(m, read, ids);
      if (self) right = Math.max(right, cxOf(la) + LOOP);
      bottom = Math.max(bottom, y + spacing);
      messages.push(keep({
        id: m.id, key: ['m', i, m.from, m.to, label, pts(points), lifted && lifted.id === m.id ? 1 : 0].join('|'),
        row: i, y, from: m.from, to: m.to, fromLifeline: la, toLifeline: lb, self, dotA, dotB, points, mid: messageMid(points), label,
        lifted: !!lifted && lifted.id === m.id,
      }));
    });
    for (const l of lifelineEls) {
      const r = heads.get(l.id);
      const typing = M.typingOf(read, l);
      const def = typing ? ids.get(typing.to) : null;
      const name = (M.textName(l) || '(unnamed)') + (typing ? ' : ' + (def ? M.textName(def) || '(unnamed)' : '?') : '') + (l.multiplicity ? ' [' + l.multiplicity + ']' : '');
      lifelines.push(keep({
        id: l.id, key: ['l', name, r.x, r.y, r.w, r.h].join('|'), name, keyword: '«' + M.KINDS[l.kind].keyword + '»',
        x: r.x, y: r.y, w: r.w, h: r.h, cx: r.x + r.w / 2,
      }));
    }
    // A succession between two drawn events is a straight line from dot to dot.
    const links = [];
    for (const r of read.relationships) {
      if (r.kind !== 'SuccessionAsUsage' || r.hidden || !eventAt.has(r.from) || !eventAt.has(r.to)) continue;
      const a = eventAt.get(r.from);
      const b = eventAt.get(r.to);
      const points = linkPoints({ x: a.cx, y: a.cy }, { x: b.cx, y: b.cy });
      links.push(keep({ id: r.id, key: ['s', r.from, r.to, pts(points)].join('|'), from: r.from, to: r.to, points }));
    }
    if (step && step.kind === 'lifeline' && heads.has(step.id)) result = { kind: 'lifeline', id: step.id, x: Math.round(step.x) };
    const rects = lifelines.map((l) => l);
    const x1 = rects.length ? Math.min(...rects.map((r) => r.x)) : 0;
    const x2 = rects.length ? Math.max(right, ...rects.map((r) => r.x + r.w)) : 0;
    return {
      view: view.id, spacing, headBottom, bottom, lifelines, events, messages, links, byId, result,
      bounds: { x: x1, y: 0, w: x2 - x1, h: rects.length ? bottom : 0 },
      size: { width: x2 - x1, height: rects.length ? bottom : 0 },
    };
  });
}

/**
 * What lies at a point of the view, as the reader answers it (contract 5's `at`): a head, an event, a message's row,
 * a place on a lifeline's dashed line ("on lifeline L, after `after` of its events": between events `between[0]` and
 * `between[1]`, either null at an end), or the ground.
 */
export function at(data, p) {
  for (const e of data.events) if (Math.hypot(p.x - e.cx, p.y - e.cy) <= 10) return { type: 'event', id: e.id };
  for (const l of data.lifelines) if (p.x >= l.x && p.x <= l.x + l.w && p.y >= l.y && p.y <= l.y + l.h) return { type: 'head', id: l.id };
  for (const m of data.messages) {
    const xs = m.points.map((q) => q.x);
    if (p.x >= Math.min(...xs) && p.x <= Math.max(...xs) && Math.abs(p.y - m.y) <= 6) return { type: 'message', id: m.id };
  }
  for (const l of data.lifelines) {
    if (Math.abs(p.x - l.cx) > NEAR || p.y <= l.y + l.h || p.y > data.bottom) continue;
    const own = data.events.filter((e) => e.lifeline === l.id);
    const after = own.filter((e) => e.cy < p.y).length;
    return { type: 'lifeline', id: l.id, after, between: [after ? own[after - 1].id : null, after < own.length ? own[after].id : null] };
  }
  return { type: 'ground', id: null };
}

/**
 * Writes a gesture's end into the model, as the old page's drop and moveMessageRow do. Returns the words of the change,
 * or null when nothing is written.
 */
export function write(M, model, view, result) {
  if (!result) return null;
  if (result.kind === 'lifeline') {
    if (view.layout[result.id].x === result.x) return null;
    view.layout[result.id].x = result.x;
    return 'Moved ' + result.id;
  }
  if (result.kind === 'event') {
    if (result.pinned) return null;
    // Into model.elements among its lifeline's events: the slot is taken in model order while the drawn order is the
    // time order, so the event lands where it was put among its neighbours (the old page's insertEvent).
    const el = model.elements.find((e) => e.id === result.id);
    model.elements.splice(model.elements.indexOf(el), 1);
    const timed = M.eventOrder(model, result.lifeline).filter((e) => view.layout[e.id]);
    const slots = model.elements.filter((e) => e.kind === 'EventOccurrenceUsage' && e.owner === result.lifeline);
    const below = timed[result.index];
    if (below) model.elements.splice(model.elements.indexOf(slots[M.eventOrder(model, result.lifeline).indexOf(below)]), 0, el);
    else if (slots.length) model.elements.splice(model.elements.indexOf(slots[slots.length - 1]) + 1, 0, el);
    else model.elements.push(el);
    view.layout[result.id].y = result.y;
    return 'Moved ' + result.id + ' among the events of ' + result.lifeline;
  }
  if (result.kind === 'message') {
    const place = new Map(result.order.map((id, i) => [id, i + 1]));
    const before = M.messagesInOrder(model).map((m) => m.id).join(' ');
    for (const r of model.relationships) if (r.kind === 'Message') r.order = place.get(r.id);
    // model.relationships keeps the messages in time order, so the text lists them as the view draws them.
    const slots = [];
    model.relationships.forEach((r, i) => { if (r.kind === 'Message') slots.push(i); });
    const ordered = M.messagesInOrder(model);
    slots.forEach((s, j) => { model.relationships[s] = ordered[j]; });
    return ordered.map((m) => m.id).join(' ') === before ? null : 'Moved the message ' + result.id + ' to row ' + (result.row + 1);
  }
  return null;
}
