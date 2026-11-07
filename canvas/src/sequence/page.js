// The sequence view on the page.
(function (C) {
  'use strict';
  const S = C.state;
  const {
    M, TOOL_TITLE, TOOL_HINT, BASE_NAME, ACTIONS, VIEW_PANELS, FIELD_HOOKS, $, say, editable, f, relById, viewById,
    viewLayout, frameAround, ROUTES, endpoints, viewAt, node, text, MARKERS, nameLine, SHAPES, drawBox, drawRel,
    RENDERERS, freshElement, edit, endEdit, freeName, renderInspector, selectedView
  } = C;

  // ---- Sequence: the sequence view's words, the event's shape, the message's arrowhead, the renderer, the row
  // controls under a message, and the view's option.
  Object.assign(TOOL_TITLE, {
    EventOccurrenceUsage: 'An event occurrence: a dot on a lifeline, where a message starts or ends',
    Message: 'A message between two lifelines or events, a row in time order'
  });
  Object.assign(TOOL_HINT, {
    EventOccurrenceUsage: 'Click a lifeline, the dashed line under a part\'s head, to put an event on it.',
    Message: ['Click the event or lifeline the message comes from…', 'Now click the event or lifeline it goes to.']
  });
  Object.assign(BASE_NAME, { EventOccurrenceUsage: 'event' });
  const EVENT_R = 6;      // an event's dot
  const EVENT_GAP = 20;   // the least distance between two events on a lifeline, and from the head to the first
  const LOOP = 48;        // how far a message that comes back to its own lifeline goes out
  const HEAD_GAP = 24;    // the least distance between two lifelines' heads
  const SPACING = [24, 400];  // what a view's row spacing may be
  // An event: a filled dot, a larger clear circle around it to click, and its name above and to the right.
  SHAPES.event = {
    draw: function (el, r, g) {
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      g.appendChild(node('circle', { cx: f(cx), cy: f(cy), r: 10 }, 'event-hit'));
      g.appendChild(node('circle', { cx: f(cx), cy: f(cy), r: EVENT_R }, 'outline'));
      g.appendChild(text(cx + 10, cy - 5, nameLine(el), 'mono', 'start'));
    },
    compartments: false, cls: 'event'
  };
  // The message's arrowhead at its target: closed and unfilled.
  MARKERS['m-message'] = '<marker id="m-message" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto" overflow="visible">' +
    '<path class="message-head" d="M1,1.5 L11,6 L1,10.5 L3.5,6 Z"/></marker>';
  function rowSpacing(view) {
    const s = view.options ? +view.options.spacing : NaN;
    return Number.isFinite(s) && s >= SPACING[0] && s <= SPACING[1] ? s : M.VIEW_KINDS.SequenceView.options.spacing;
  }
  // The sequence view: the lifelines are the shown parts, left to right by their x, each a head at the top of the
  // view with a dashed line down; the messages whose two ends both reach a shown lifeline take one row each, in time
  // order; an event sits on its lifeline at the row of the first drawn message that starts or ends on it, else where
  // it was put, kept between its neighbours in time order (M.eventOrder, which the export's then chain follows too).
  RENDERERS.sequence = {
    layout: function (view, ids) {
      const spacing = rowSpacing(view);
      const order = new Map(S.model.elements.map((e, i) => [e.id, i]));
      const shown = new Set();
      const kids = new Map();
      const parentOf = new Map();
      const rects = new Map();
      const lifelines = Object.keys(view.layout).map((id) => ids.get(id))
        .filter((e) => e && M.hasTrait(e.kind, 'lifeline') && !M.KINDS[e.kind].onBorder)
        .sort((a, b) => (view.layout[a.id].x - view.layout[b.id].x) || (order.get(a.id) - order.get(b.id)));
      kids.set('', lifelines);
      const cxOf = new Map();
      let headBottom = view.y;
      let clear = -Infinity;  // where the next head may start without overlapping the one before it
      lifelines.forEach((l) => {
        const lay = view.layout[l.id];
        // Heads that would overlap are moved apart, so a lifeline shown from the Show list lands beside the others.
        const r = { x: Math.max(view.x + lay.x, clear), y: view.y, w: lay.w, h: lay.h };
        clear = r.x + r.w + HEAD_GAP;
        rects.set(l.id, r);
        shown.add(l.id);
        parentOf.set(l.id, '');
        kids.set(l.id, []);
        cxOf.set(l.id, r.x + r.w / 2);
        headBottom = Math.max(headBottom, r.y + r.h);
      });
      // The lifeline an end is drawn on: itself when it is one, else the nearest owner that is.
      const lifelineOf = (id) => {
        let cur = ids.get(id);
        while (cur) {
          if (cxOf.has(cur.id)) return cur.id;
          cur = cur.owner !== undefined ? ids.get(cur.owner) : null;
        }
        return null;
      };
      const rows = M.messagesInOrder(S.model).filter((m) => lifelineOf(m.from) && lifelineOf(m.to));
      const rowY = new Map();
      rows.forEach((m, i) => rowY.set(m.id, headBottom + spacing * (i + 1)));
      // Where a message's end sits: its row; a message that comes back to its own lifeline ends at the bottom of its loop.
      const endY = (m, id) => rowY.get(m.id) + (id === m.to && lifelineOf(m.from) === lifelineOf(m.to) ? EVENT_GAP : 0);
      let bottom = headBottom + spacing;
      lifelines.forEach((l) => {
        const cx = cxOf.get(l.id);
        const events = M.eventOrder(S.model, l.id).filter((e) => view.layout[e.id]);
        const ys = events.map((e) => { const m = rows.find((r) => r.from === e.id || r.to === e.id); return m ? endY(m, e.id) : null; });
        for (let i = 0; i < events.length; i++) {
          if (ys[i] !== null) continue;
          let j = i + 1;
          while (j < events.length && ys[j] === null) j++;
          const lower = (i ? ys[i - 1] : headBottom) + EVENT_GAP;
          const upper = j < events.length ? ys[j] - EVENT_GAP * (j - i) : Infinity;
          const own = view.y + view.layout[events[i].id].y;
          // The event being dragged follows the pointer; the drop puts it back among its siblings.
          ys[i] = S.drag && S.drag.id === events[i].id && S.drag.view === view.id && S.drag.moved ? own : Math.max(lower, Math.min(own, upper));
        }
        events.forEach((e, i) => {
          rects.set(e.id, { x: cx - 8, y: ys[i] - 8, w: 16, h: 16 });
          shown.add(e.id);
          parentOf.set(e.id, l.id);
          kids.get(l.id).push(e);
          bottom = Math.max(bottom, ys[i] + spacing);
        });
      });
      const lines = new Map();
      let right = -Infinity;
      rows.forEach((m) => {
        const y = rowY.get(m.id);
        const la = lifelineOf(m.from);
        const lb = lifelineOf(m.to);
        const ax = cxOf.get(la);
        const bx = cxOf.get(lb);
        // A line stops at the edge of an event's dot, and reaches the lifeline itself when that is the end.
        const dotA = rects.has(m.from) && m.from !== la ? EVENT_R + 1 : 0;
        const dotB = rects.has(m.to) && m.to !== lb ? EVENT_R + 1 : 0;
        if (la === lb) {
          lines.set(m.id, [{ x: ax + dotA, y: y }, { x: ax + LOOP, y: y }, { x: ax + LOOP, y: y + EVENT_GAP }, { x: ax + dotB, y: y + EVENT_GAP }]);
          right = Math.max(right, ax + LOOP);
        } else {
          const dir = bx > ax ? 1 : -1;
          lines.set(m.id, [{ x: ax + dir * dotA, y: y }, { x: bx - dir * dotB, y: y }]);
        }
        bottom = Math.max(bottom, y + spacing);
      });
      // A succession between two drawn events (the behavior kind, which the palette offers here too) is a straight
      // line from dot to dot, routed here so that it is drawn, and counted as drawn, in this view.
      const links = S.model.relationships.filter((r) => r.kind === 'SuccessionAsUsage' && !r.hidden && rects.has(r.from) && rects.has(r.to));
      links.forEach((r) => lines.set(r.id, ROUTES.straight(rects.get(r.from), rects.get(r.to))));
      let box = null;
      if (lifelines.length) {
        const heads = lifelines.map((l) => rects.get(l.id));
        box = { x: Math.min.apply(null, heads.map((r) => r.x)), y: view.y, x2: Math.max(right, Math.max.apply(null, heads.map((r) => r.x + r.w))), y2: bottom };
      }
      return { view: view, shown: shown, kids: kids, parentOf: parentOf, rects: rects, comps: new Map(), frameRect: frameAround(view, box), lines: lines, rows: rows, links: links, bottom: bottom };
    },
    draw: function (view, g, L) {
      const els = node('g', {}, 'els');
      const rels = node('g', {}, 'rels');
      g.appendChild(els);
      g.appendChild(rels);
      (L.kids.get('') || []).forEach((l) => {
        const r = L.rects.get(l.id);
        els.appendChild(node('path', { d: 'M' + f(r.x + r.w / 2) + ',' + f(r.y + r.h) + ' V' + f(L.bottom) }, 'lifeline'));
        drawBox(l, els, L);
      });
      L.rows.forEach((m) => {
        drawRel(m, rels, L);
        const e = endpoints(m, L);
        const rg = rels.lastChild;
        if (!e || !rg || rg.getAttribute('data-rel') !== m.id || !editable()) return;
        // Two small arrows under the middle of the line move the message a row up or down.
        [['message-up', '▲', -7, 'Move the message up a row.'], ['message-down', '▼', 7, 'Move the message down a row.']].forEach((a) => {
          const t = text(e.mid.x + a[2], e.mid.y + 14, a[1], 'message-order', 'middle');
          t.setAttribute('data-action', a[0]);
          t.setAttribute('data-for', m.id);
          t.setAttribute('data-hint', a[3]);
          rg.appendChild(t);
        });
      });
      L.links.forEach((r) => drawRel(r, rels, L));
    },
    place: function (view, kind, p, hit) {
      const k = M.KINDS[kind];
      const L = viewLayout(view.id);
      const lifelines = L.kids.get('') || [];
      if (M.hasTrait(kind, 'lifeline') && !k.onBorder) {
        // A new lifeline at the click's x, in the same context as the view's first lifeline (none: the package).
        const first = lifelines[0];
        const owner = first && first.owner !== undefined ? first.owner : null;
        const el = freshElement(kind, freeName(kind, owner));
        if (owner !== null) el.owner = owner;
        view.layout[el.id] = { x: Math.round(p.x - view.x - k.size[0] / 2), y: 0, w: k.size[0], h: k.size[1] };
        S.model.elements.push(el);
        return el;
      }
      if (kind === 'EventOccurrenceUsage') {
        // The lifeline under the click: its head, one of its events, or its dashed line.
        let host = null;
        if (hit.type === 'el' && L.parentOf.has(hit.id)) {
          const under = S.layout.ids.get(hit.id);
          host = L.parentOf.get(hit.id) === '' ? under : S.layout.ids.get(L.parentOf.get(hit.id));
        }
        if (!host) host = lifelines.find((l) => { const r = L.rects.get(l.id); return Math.abs(p.x - (r.x + r.w / 2)) <= 24 && p.y > r.y + r.h; }) || null;
        if (!host || !M.canContain(host.kind, kind)) { say('Click a lifeline, the dashed line under a part\'s head, to put an event on it.'); return null; }
        const hr = L.rects.get(host.id);
        const y = Math.max(hr.y + hr.h + EVENT_GAP, p.y);
        const el = freshElement(kind, freeName(kind, host.id));
        el.owner = host.id;
        view.layout[el.id] = { x: 0, y: Math.round(y - view.y), w: k.size[0], h: k.size[1] };
        insertEvent(el, host, y, L);
        return el;
      }
      say(M.an(k.label, true) + ' can\'t be drawn in ' + M.an(M.VIEW_KINDS[view.kind].label) + '.');
      return null;
    },
    dragStart: function (view, el, p) {
      const lay = view.layout[el.id];
      if (!lay) return null;
      // A drag starts from where the thing is drawn: a head moved apart from its neighbour, an event on a message's row.
      const r = viewLayout(view.id).rects.get(el.id);
      const from = el.kind === 'EventOccurrenceUsage'
        ? { x: lay.x, y: r ? r.y + r.h / 2 - view.y : lay.y }
        : { x: r ? r.x - view.x : lay.x, y: lay.y };
      // orig is the layout's own entry, which a refused drop puts back: from, where the thing was drawn, may differ.
      return { kind: 'el', id: el.id, view: view.id, start: p, from: from, orig: { x: lay.x, y: lay.y }, moved: false };
    },
    drag: function (view, el, d, p) {
      const lay = view.layout[el.id];
      if (el.kind === 'EventOccurrenceUsage') lay.y = Math.round(d.from.y + (p.y - d.start.y));
      else lay.x = Math.round(d.from.x + (p.x - d.start.x));
    },
    drop: function (view, el, d, p, event) {
      const lay = view.layout[el.id];
      const L = viewLayout(view.id);
      const what = M.describe(S.model, el);
      const other = event.type === 'pointerup' ? viewAt(p, view.id) : null;
      if (el.kind !== 'EventOccurrenceUsage') {
        // Dropped inside another view's frame: the head goes back where it was. Showing it there is the Show list's job.
        if (other) {
          lay.x = d.orig.x;
          return { say: 'A lifeline doesn\'t move into another view by dragging, so it went back. To show it in ' + M.describeView(S.model, viewById(other)) + ', select that view and use its Show list.' };
        }
        return { undo: 'Moved ' + what, text: 'Moved ' + what, key: 'move:' + el.id };
      }
      const host = el.owner !== undefined ? S.layout.ids.get(el.owner) : null;
      if (other || !host) { lay.y = d.orig.y; return { say: 'An event moves up and down its own lifeline, so it went back.' }; }
      // Its new place among its lifeline's events, by height; one a drawn message ends on stays on the message's row.
      const was = M.eventOrder(S.model, host.id).map((e) => e.id).join(' ');
      insertEvent(el, host, view.y + lay.y, L);
      const after = M.eventOrder(S.model, host.id).map((e) => e.id).join(' ');
      if (after !== was) return { undo: 'Reordered the events of ' + M.describe(S.model, host), text: 'Moved ' + what + ' among the events of ' + M.describe(S.model, host), key: null };
      const pinned = L.rows.find((m) => m.from === el.id || m.to === el.id);
      if (pinned) { lay.y = d.orig.y; return { say: 'The ' + what + ' sits on the row of the ' + M.describeRel(S.model, pinned) + '; set the message\'s order to move it.' }; }
      return { undo: 'Moved ' + what, text: 'Moved ' + what, key: 'move:' + el.id };
    }
  };
  // Puts an event into model.elements among its lifeline's events by height: in front of the first drawn below y,
  // else after the last of them, else at the end. The slot is taken in model order while the drawn order is the time
  // order (M.eventOrder), so the event lands where the user put it among its neighbours.
  function insertEvent(el, host, y, L) {
    const at = S.model.elements.indexOf(el);
    if (at >= 0) S.model.elements.splice(at, 1);
    const timed = M.eventOrder(S.model, host.id);
    const below = timed.find((e) => e.id !== el.id && L.rects.has(e.id) && L.rects.get(e.id).y + 8 > y);
    const slots = S.model.elements.filter((e) => e.kind === 'EventOccurrenceUsage' && e.owner === host.id);
    if (below) { S.model.elements.splice(S.model.elements.indexOf(slots[timed.indexOf(below)]), 0, el); return; }
    if (slots.length) { S.model.elements.splice(S.model.elements.indexOf(slots[slots.length - 1]) + 1, 0, el); return; }
    S.model.elements.push(el);
  }
  // Keeps model.relationships in the messages' time order, so the text lists them as the view draws them.
  function sortMessages() {
    const slots = [];
    S.model.relationships.forEach((r, i) => { if (r.kind === 'Message') slots.push(i); });
    const ordered = M.messagesInOrder(S.model);
    slots.forEach((s, j) => { S.model.relationships[s] = ordered[j]; });
  }
  // The arrows under a message swap its row with the one above or below in this view: every message first gets its
  // place in time as its order, so the two can trade numbers and every other message keeps its place.
  function moveMessageRow(id, dir, viewId) {
    const view = viewById(viewId);
    const L = view ? viewLayout(view.id) : null;
    const rel = relById(id);
    if (!editable() || !L || !L.rows || !rel) return;
    const i = L.rows.indexOf(rel);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= L.rows.length) { say('The ' + M.describeRel(S.model, rel) + ' is already the ' + (dir < 0 ? 'first' : 'last') + ' row.'); return; }
    const what = 'Moved the ' + M.describeRel(S.model, rel) + (dir < 0 ? ' up' : ' down') + ' a row';
    edit(() => {
      M.messagesInOrder(S.model).forEach((m, k) => { m.order = k + 1; });
      const swap = L.rows[j];
      const mine = rel.order;
      rel.order = swap.order;
      swap.order = mine;
      sortMessages();
      return what;
    });
    renderInspector();
    say(what + '.');
  }
  ACTIONS['message-up'] = function (hit) { moveMessageRow(hit.id, -1, hit.view); };
  ACTIONS['message-down'] = function (hit) { moveMessageRow(hit.id, 1, hit.view); };
  // The order field: with the message's order, the text's order follows the drawing's, in the same change.
  FIELD_HOOKS.order = {
    write: function (x, value) {
      x.item.order = value;
      sortMessages();
    }
  };
  // The sequence view's option: the distance between its rows.
  VIEW_PANELS.SequenceView = function (view, write) {
    $('sv-spacing').value = String(rowSpacing(view));
    $('sv-spacing').readOnly = !write;
  };
  $('sv-spacing').addEventListener('input', () => {
    const view = selectedView();
    const v = +$('sv-spacing').value;
    if (!view || view.kind !== 'SequenceView' || !Number.isFinite(v) || v < SPACING[0] || v > SPACING[1]) return;
    edit(() => {
      view.options.spacing = Math.round(v);
      return 'Set the row spacing of ' + M.describeView(S.model, view) + ' to ' + view.options.spacing;
    }, 'spacing:' + view.id);
  });
  $('sv-spacing').addEventListener('change', () => {
    const view = selectedView();
    if (!view || view.kind !== 'SequenceView') return;
    const v = +$('sv-spacing').value;
    if (!Number.isFinite(v) || v < SPACING[0] || v > SPACING[1]) {
      $('sv-spacing').value = String(rowSpacing(view));
      say('The row spacing is a number from ' + SPACING[0] + ' to ' + SPACING[1] + '.');
    }
    endEdit();
  });
})(window.SysMLCanvas);
