// Redrawing: the whole drawing from the model, with its checks, the notes' pins and the problems' badges on top,
// and the marks that show the selection.
(function (C) {
  'use strict';
  const S = C.state;
  const {
    M, svg, problemsButton, f, plural, byNumber, relById, computeLayout, endpoints, node, defs, portName, drawFrame
  } = C;

  // Where a note's pin sits in view layout L: on the top edge of a box, beside a port's square away from its name, on
  // the middle of a line. Pins on the same thing step aside by a screen distance, so they stay apart when zoomed out.
  // A note on a defined-by line that isn't drawn sits on the part or port the line starts from. Null when the note's
  // target isn't drawn in the view.
  function pinAnchor(n, k, L) {
    const step = 26 / (S.camera ? S.camera.k : 1) * k;
    const r = L.rects.get(n.target);
    if (r) {
      if (!r.port) return { x: r.x + r.w - 10 - step, y: r.y };
      // Beside a border item's square, on the side its name isn't (portName): below a right port's, above a left
      // port's, right of a top or bottom port's, unless the name went there.
      const on = portName(S.layout.ids.get(n.target), r, L).on;
      if (r.side === 'right') return { x: r.cx + 16 + step, y: on === 'below' ? r.cy - 14 : r.cy + 14 };
      if (r.side === 'left') return { x: r.cx - 16 - step, y: on === 'above' ? r.cy + 14 : r.cy - 14 };
      return { x: on === 'right' ? r.cx - 18 - step : r.cx + 18 + step, y: r.cy };
    }
    const rel = relById(n.target);
    if (!rel) return null;
    if (rel.hidden) { const from = L.rects.get(rel.from); return from ? { x: (from.port ? from.cx : from.x) + 12 + step, y: (from.port ? from.cy : from.y) - 16 } : null; }
    // Only where the view draws the line: a plan, say, has the ends but no line for a pin to sit on.
    if ((S.layout.where.get(rel.id) || []).indexOf(L.view.id) < 0) return null;
    const e = endpoints(rel, L);
    if (!e) return null;
    // On the line's middle, or above its label when the kind puts the label above the line, where a screen-sized pin
    // on the middle would cover it.
    const top = labelTop(rel);
    return { x: e.mid.x + step, y: top ? e.mid.y + top - 11 / (S.camera ? S.camera.k : 1) : e.mid.y };
  }
  // Where a line's label begins above the line's middle, relative to the middle, when its kind puts it there (a
  // negative labelOffset is the baseline's height above the middle; the text's box reaches about 14 px above that)
  // and it has a text; 0 when the label is below the line or empty. Pins and badges, drawn at screen size, keep above it.
  function labelTop(rel) {
    const how = M.RELATIONSHIPS[rel.kind].line;
    const off = how.labelOffset;
    if (typeof off !== 'number' || off >= 0 || !how.label || !how.label(rel, S.model, S.layout.ids)) return 0;
    return off - 14;
  }
  function pinTransform(x, y) { return 'translate(' + f(x) + ' ' + f(y) + ') scale(' + (1 / (S.camera ? S.camera.k : 1)).toFixed(4) + ')'; }
  function drawPins(layer) {
    while (layer.firstChild) layer.removeChild(layer.firstChild);
    const seen = {};
    for (const n of S.notes.slice().sort(byNumber)) {
      if (n.target === null) { layer.appendChild(C.freePin(n)); continue; } // a free note's pin, once, at its own point
      S.layout.views.forEach((L) => {
        const key = L.view.id + '/' + n.target;
        const k = seen[key] || 0;
        const at = pinAnchor(n, k, L);
        if (!at) return;
        seen[key] = k + 1;
        const g = node('g', { 'data-note': n.id, 'data-view': L.view.id, 'data-x': f(at.x), 'data-y': f(at.y), transform: pinTransform(at.x, at.y) }, 'pin' + (n.resolved ? ' is-resolved' : ''));
        const title = node('title');
        title.textContent = 'Note ' + n.no + ' on ' + (M.labelFor(S.model, n.target) || n.targetLabel) + '. Click to read it.';
        const circle = node('circle', { r: 11 });
        const number = node('text');
        number.textContent = String(n.no);
        g.appendChild(title);
        g.appendChild(circle);
        g.appendChild(number);
        layer.appendChild(g);
      });
    }
  }
  // The ids a problem is shown on: what it names, and, for a defined-by line that isn't drawn, the part or port the
  // line starts from, since the line itself can't be pointed at.
  function marksFor(p) {
    if (p.id === null) return [];
    const rel = relById(p.id);
    return rel && rel.hidden ? [p.id, rel.from] : [p.id];
  }
  // Where a problem's badge sits in view layout L: at a box's top-right corner, inside a port's corner, above the
  // middle of a line, on a view's tab. Null when the offender isn't drawn in the view.
  function badgeAnchor(id, L) {
    if (id === L.view.id) { const fr = L.frameRect; return { x: fr.x + 2, y: fr.y + 2 }; }
    const r = L.rects.get(id);
    if (r) {
      if (!r.port) return { x: r.x + r.w + 2, y: r.y - 2 };
      if (r.side === 'right') return { x: r.cx - 16, y: r.cy - 14 };
      if (r.side === 'left') return { x: r.cx + 16, y: r.cy + 14 };
      return { x: r.cx - 18, y: r.cy };
    }
    const rel = relById(id);
    if (!rel || rel.hidden) return null;
    if ((S.layout.where.get(rel.id) || []).indexOf(L.view.id) < 0) return null;
    const e = endpoints(rel, L);
    if (!e) return null;
    const top = labelTop(rel);
    return { x: e.mid.x, y: top ? e.mid.y + top - 9 / (S.camera ? S.camera.k : 1) : e.mid.y - 14 };
  }
  function drawBadges(layer) {
    while (layer.firstChild) layer.removeChild(layer.firstChild);
    const byTarget = new Map();
    S.problems.forEach((p) => marksFor(p).forEach((id) => { if (!byTarget.has(id)) byTarget.set(id, []); byTarget.get(id).push(p.message); }));
    byTarget.forEach((messages, id) => {
      S.layout.views.forEach((L) => {
        const at = badgeAnchor(id, L);
        if (!at) return;
        const g = node('g', { 'data-for': id, 'data-view': L.view.id, transform: pinTransform(at.x, at.y) }, 'problem');
        const title = node('title');
        title.textContent = messages.join(' ');
        const mark = node('text');
        mark.textContent = '!';
        g.appendChild(title);
        g.appendChild(node('circle', { r: 9 }));
        g.appendChild(mark);
        layer.appendChild(g);
      });
    });
  }
  function markProblems() {
    const ids = new Set();
    S.problems.forEach((p) => marksFor(p).forEach((id) => ids.add(id)));
    ids.forEach((id) => svg.querySelectorAll('[data-el="' + id + '"], [data-rel="' + id + '"], .frame[data-view="' + id + '"]').forEach((g) => g.classList.add('is-problem')));
  }
  // Pins and badges are drawn at screen size, so they are drawn again whenever the camera moves.
  function renderPins() {
    const pins = svg.querySelector('.pins');
    const badges = svg.querySelector('.problems');
    if (pins) drawPins(pins);
    if (badges) drawBadges(badges);
  }

  // Redraws the whole drawing from the model, and checks it. The panel is drawn separately, so typing in it isn't
  // interrupted.
  function render() {
    S.layout = computeLayout();
    const found = M.validate(S.model);
    if (JSON.stringify(found) !== JSON.stringify(S.problems)) S.problemCursor = -1;
    S.problems = found;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.appendChild(defs());
    svg.appendChild(node('rect', { x: -100000, y: -100000, width: 200000, height: 200000, fill: 'url(#plane-dots)' }, 'plane'));
    // Each view in its frame, then the pins and the badges on top of everything.
    S.model.views.forEach((view) => svg.appendChild(drawFrame(view, S.layout.views.get(view.id))));
    const pins = node('g', {}, 'pins');
    const badges = node('g', {}, 'problems');
    svg.appendChild(pins);
    svg.appendChild(badges);
    drawPins(pins);
    drawBadges(badges);
    markProblems();
    applyMarks();
    problemsButton.hidden = !S.problems.length;
    problemsButton.textContent = plural(S.problems.length, 'problem');
    C.renderProblemsList();
    if (S.camera) C.applyCamera(); else C.fit();
  }
  // Every group that draws the selection: an element or line may be drawn in several frames.
  function groupsFor(sel) {
    if (!sel) return [];
    const q = sel.type === 'view' ? '.frame[data-view="' + sel.id + '"]' : sel.type === 'el' ? '[data-el="' + sel.id + '"]' : '[data-rel="' + sel.id + '"]';
    return Array.from(svg.querySelectorAll(q));
  }
  function applyMarks() {
    svg.querySelectorAll('.is-selected, .is-source').forEach((g) => { g.classList.remove('is-selected'); g.classList.remove('is-source'); });
    groupsFor(S.selection).forEach((g) => g.classList.add('is-selected'));
    if (S.pending) svg.querySelectorAll('[data-el="' + S.pending + '"]').forEach((g) => g.classList.add('is-source'));
  }

  Object.assign(C, { pinTransform, marksFor, renderPins, render, applyMarks });
})(window.SysMLCanvas);
