// Redrawing: the drawing from the model, a view at a time and only as far as the window shows it, with the notes'
// pins and the problems' badges on top and the marks that show the selection; and the checks, which run once the
// changes pause, as the save does.
(function (C) {
  'use strict';
  const S = C.state;
  const {
    M, svg, problemsButton, f, plural, byNumber, relById, viewById, rendererFor, computeLayout, endpoints, node, defs,
    portName, drawFrame
  } = C;

  // ---- The library's lookups, for everything the drawing and the checks ask of the model.

  // The lookups the library builds for the model as it is, kept from one drawing to the next until the model changes
  // (render forgets them), so a drawing or the checks answer from them rather than looking through the model.
  let look = null;
  let looked = null;
  function reading(fn) {
    if (typeof M.reading !== 'function') return fn();
    if (!look || looked !== S.model) { look = M.lookups(S.model); looked = S.model; }
    return M.reading(S.model, fn, look);
  }
  function forget() { look = null; looked = null; }

  // ---- What is drawn: the part of the plane the window shows, and a margin round it.

  const FAR = 0.25;              // below this zoom the graph views draw less: their text would be under 3 px tall
  S.region = null;               // the part of the plane last drawn, { x, y, x2, y2, far }, or null before the first
  function windowNow() {
    const s = C.stageSize();
    return { x: S.camera.x, y: S.camera.y, x2: S.camera.x + s.width / S.camera.k, y2: S.camera.y + s.height / S.camera.k };
  }
  // The region to draw for the window now: the window, half its size again on each side (at least 240 units), so a
  // pan or a drag goes some way before anything new needs drawing.
  function regionNow() {
    const w = windowNow();
    const mx = Math.max((w.x2 - w.x) / 2, 240);
    const my = Math.max((w.y2 - w.y) / 2, 240);
    return { x: w.x - mx, y: w.y - my, x2: w.x2 + mx, y2: w.y2 + my, far: S.camera.k < FAR };
  }
  // Whether what was last drawn still covers the window, at the detail the zoom asks for.
  function covered() {
    const R = S.region;
    if (!R || !S.camera) return false;
    const w = windowNow();
    return R.far === (S.camera.k < FAR) && w.x >= R.x && w.y >= R.y && w.x2 <= R.x2 && w.y2 <= R.y2;
  }

  // Draws every view's frame again, and of its content what the window shows now, then the pins, badges and marks.
  function drawAll() {
    S.region = regionNow();
    reading(() => {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.appendChild(defs());
      svg.appendChild(node('rect', { x: -100000, y: -100000, width: 200000, height: 200000, fill: 'url(#plane-dots)' }, 'plane'));
      S.model.views.forEach((view) => svg.appendChild(drawFrame(view, S.layout.views.get(view.id), S.region)));
      svg.appendChild(node('g', {}, 'pins'));
      svg.appendChild(node('g', {}, 'problems'));
      decorate();
    });
  }
  // Draws one view's frame and content again, in its place among the frames.
  function redrawView(view) {
    const old = svg.querySelector(':scope > .frame[data-view="' + view.id + '"]');
    const fresh = drawFrame(view, S.layout.views.get(view.id), S.region);
    if (old) svg.replaceChild(fresh, old);
    else svg.insertBefore(fresh, svg.querySelector(':scope > .pins'));
  }

  // ---- Pins and badges, drawn at screen size on top of everything.

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
    if (!L.drawn.has(rel.id)) return null;
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
  // Whether a point is in the part of the plane drawn.
  function inRegion(at) { const R = S.region; return !R || (at.x >= R.x && at.x <= R.x2 && at.y >= R.y && at.y <= R.y2); }
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
    if (!L.drawn.has(rel.id)) return null;
    const e = endpoints(rel, L);
    if (!e) return null;
    const top = labelTop(rel);
    return { x: e.mid.x, y: top ? e.mid.y + top - 9 / (S.camera ? S.camera.k : 1) : e.mid.y - 14 };
  }
  // The problems' badges, on what has a problem where it is drawn on screen.
  function drawBadges(layer) {
    while (layer.firstChild) layer.removeChild(layer.firstChild);
    const byTarget = new Map();
    S.problems.forEach((p) => marksFor(p).forEach((id) => { if (!byTarget.has(id)) byTarget.set(id, []); byTarget.get(id).push(p.message); }));
    byTarget.forEach((messages, id) => {
      S.layout.views.forEach((L) => {
        const at = badgeAnchor(id, L);
        if (!at || !inRegion(at)) return;
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
  // Marks what is drawn of everything that has a problem, and unmarks the rest.
  function markProblems() {
    const ids = new Set();
    S.problems.forEach((p) => marksFor(p).forEach((id) => ids.add(id)));
    svg.querySelectorAll('[data-el], [data-rel], .frame[data-view]').forEach((g) => {
      const id = g.getAttribute('data-el') || g.getAttribute('data-rel') || (g.classList.contains('frame') ? g.getAttribute('data-view') : null);
      g.classList.toggle('is-problem', ids.has(id));
    });
  }
  // Pins and badges are drawn at screen size, so they are drawn again whenever the camera moves.
  function renderPins() {
    const pins = svg.querySelector('.pins');
    const badges = svg.querySelector('.problems');
    reading(() => {
      if (pins) drawPins(pins);
      if (badges) drawBadges(badges);
    });
  }
  // What sits on the drawing: the pins, the badges and the marks, and the HUD's count of the problems.
  function decorate() {
    renderPins();
    markProblems();
    applyMarks();
    problemsButton.hidden = !S.problems.length;
    problemsButton.textContent = plural(S.problems.length, 'problem');
    C.renderProblemsList();
  }

  // ---- Redrawing after a change.

  // Brings the drawing up to date with the model. After a change, edit() says what it touched (touched, the ids of
  // the elements, lines and views) and what the drawing must do about it (how, see howToDraw in changes.js): how.views,
  // the views to lay out again, when the change can't have moved anything outside them, and how.patch, when it only
  // moved things; else every view is laid out again, or keeps its layout when its renderer says the change can't have
  // altered it (keeps). The lookups are made again only after a change to the model's structure (how.structure).
  // Either way each view's renderer may then patch
  // what it drew, drawing again just what changed, else the view is drawn again; a change that showed or hid things
  // draws its views again. With no touched, the model is a new one (the page starting, a model from elsewhere, an
  // Undo, an import): everything is drawn anew, and the checks run at once.
  function render(touched, how) {
    if (!how || how.structure) forget();
    const before = S.layout;
    const plan = touched && before ? {
      views: how && how.views ? how.views : null, moving: !!(how && how.patch), structure: !how || how.structure, shown: !!(how && how.shown),
      touched: new Set(touched.elements), lines: new Set(touched.relationships)
    } : null;
    reading(() => { S.layout = computeLayout(plan ? before : null, plan); });
    const frames = Array.from(svg.querySelectorAll(':scope > .frame')).map((g) => g.getAttribute('data-view')).join(' ');
    if (!S.camera) C.fit();
    else if (!plan || !covered() || frames !== S.model.views.map((v) => v.id).join(' ')) drawAll();
    else {
      reading(() => (plan.views ? Array.from(plan.views) : S.model.views.map((v) => v.id)).forEach((id) => {
        const view = viewById(id);
        if (!view) return;
        const r = rendererFor(view);
        const g = svg.querySelector(':scope > .frame[data-view="' + id + '"]');
        const showing = !!plan.views && !plan.moving;
        if (showing || !r.patch || !g || !r.patch(view, g, before.views.get(id), S.layout.views.get(id), S.region, plan.moving)) redrawView(view);
      }));
      decorate();
    }
    if (!touched) check();
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

  // ---- The checks.

  // Checks the model: what validate finds is the page's list of problems, which the badges, the marks, the HUD's
  // button and the panel show. They run once the changes pause, as the save does (changes.js schedules them), at once
  // when the model is a new one, and at once when something needs them up to date (the export).
  S.checkTimer = null;
  function check() {
    clearTimeout(S.checkTimer);
    S.checkTimer = null;
    const found = reading(() => M.validate(S.model));
    if (JSON.stringify(found) === JSON.stringify(S.problems)) return;
    S.problemCursor = -1;
    S.problems = found;
    // A view that draws the problems itself (a grid's problems column) is drawn again.
    reading(() => S.model.views.forEach((view) => { if (rendererFor(view).problems) redrawView(view); }));
    decorate();
  }
  // Runs the checks now when some are waiting for the pause.
  function checkNow() { if (S.checkTimer) check(); }

  Object.assign(C, {
    reading, covered, drawAll, pinTransform, marksFor, renderPins, render, applyMarks, check, checkNow
  });
})(window.SysMLCanvas);
