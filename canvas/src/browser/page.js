// The browser view on the page.
(function (C) {
  'use strict';
  const S = C.state;
  const {
    M, ACTIONS, VIEW_PANELS, $, say, editable, f, plural, viewById, frameAround, node, text, RENDERERS, render,
    logChange, changed, snapshot, commit, renderInspector, selectedView
  } = C;

  // ---- The browser view: the model as a tree of rows, one per element with what it owns under it and the
  // relationships declared in it, each a row the core's marks, pins and badges land on (its rect is the row's text
  // band, so a pin on its top edge and a badge at its corner sit inside the row). Rows are BROWSER_ROW high and step
  // in BROWSER_INDENT a level; the library's browserRows says which rows there are, and in what order.
  const BROWSER_ROW = 24;
  const BROWSER_INDENT = 20;
  const browserRootsSelect = $('browser-roots');
  const browserExpandAll = $('browser-expand-all');
  // What a row says, in parts: the keyword in guillemets and the name (the kind's label alone for a kind without a
  // name), ": Type [mult]" for a usage, and how many notes are on it; for a relationship row the kind's label and
  // describeRel's sentence, without the label when it starts with it.
  function browserRowParts(row, ids) {
    if (row.type === 'rel') {
      const label = M.RELATIONSHIPS[row.item.kind].label;
      let said = M.describeRel(S.model, row.item, ids);
      if (said.indexOf(label + ' ') === 0) said = said.slice(label.length + 1);
      return { kw: '«' + label + '» ', name: said, type: '', notes: '' };
    }
    const el = row.item;
    const kind = M.KINDS[el.kind];
    const named = M.hasName(el.kind);
    const parts = { kw: named && kind.keyword ? '«' + kind.keyword + '» ' : '', name: named ? el.name.trim() || '(unnamed)' : kind.label, type: '', notes: '' };
    if (kind.usage) {
      const typing = M.typingOf(S.model, el);
      if (typing) { const def = ids.get(typing.to); parts.type += ' : ' + (el.conjugated ? '~' : '') + (def ? def.name.trim() || '(unnamed)' : '?'); }
      if (el.multiplicity) parts.type += ' [' + el.multiplicity + ']';
    }
    const count = S.notes.filter((n) => n.target === el.id).length;
    if (count) parts.notes = ' · ' + plural(count, 'note');
    return parts;
  }
  // Near enough the width of a row's text, from the fonts' average widths per character, to size the rows and the frame.
  function browserTextWidth(p) { return p.kw.length * 5.6 + p.name.length * 7.1 + p.type.length * 6.4 + p.notes.length * 5.8; }
  // The disclosure triangle on a row with something inside it: a control (data-action) the core runs ACTIONS.toggle
  // for, pointing right while the element is folded and down while it is open.
  function browserToggle(row, x0, top) {
    const what = M.describe(S.model, row.item);
    const tg = node('g', { 'data-action': 'toggle', 'data-for': row.id, 'data-hint': 'Show or hide what is inside ' + what + '.' }, 'browser-toggle');
    const title = node('title');
    title.textContent = (row.folded ? 'Show' : 'Hide') + ' what is inside ' + what;
    tg.appendChild(title);
    tg.appendChild(node('rect', { x: f(x0), y: f(top + 5), width: 14, height: 14 }, 'browser-hit'));
    const cx = x0 + 7;
    const cy = top + 12;
    const d = row.folded
      ? 'M' + f(cx - 2.5) + ',' + f(cy - 4.5) + ' L' + f(cx + 3.5) + ',' + f(cy) + ' L' + f(cx - 2.5) + ',' + f(cy + 4.5) + ' Z'
      : 'M' + f(cx - 4.5) + ',' + f(cy - 2.5) + ' L' + f(cx + 4.5) + ',' + f(cy - 2.5) + ' L' + f(cx) + ',' + f(cy + 3.5) + ' Z';
    tg.appendChild(node('path', { d: d }, 'browser-arrow'));
    return tg;
  }
  RENDERERS.browser = {
    showsAll: true,
    layout: function (view, ids) {
      const rows = M.browserRows(S.model, view, ids);
      let width = 360;
      rows.forEach((row) => {
        row.parts = browserRowParts(row, ids);
        width = Math.max(width, row.depth * BROWSER_INDENT + 18 + browserTextWidth(row.parts) + 32);
      });
      const shown = new Set();
      const kids = new Map();
      const parentOf = new Map();
      const rects = new Map();
      const open = []; // the element row at each depth above the current row
      rows.forEach((row, i) => {
        const top = view.y + i * BROWSER_ROW;
        rects.set(row.id, { x: view.x, y: top + 7, w: width, h: BROWSER_ROW - 10 });
        if (row.type !== 'el') return;
        shown.add(row.id);
        open.length = row.depth;
        const parent = row.depth ? open[row.depth - 1] : '';
        parentOf.set(row.id, parent);
        if (!kids.has(parent)) kids.set(parent, []);
        kids.get(parent).push(row.item);
        open.push(row.id);
      });
      const box = rows.length ? { x: view.x, y: view.y, x2: view.x + width, y2: view.y + rows.length * BROWSER_ROW } : null;
      return { view: view, shown: shown, kids: kids, parentOf: parentOf, rects: rects, comps: new Map(), frameRect: frameAround(view, box), rows: rows, treeWidth: width };
    },
    draw: function (view, g, L) {
      const rows = node('g', {}, 'browser-rows');
      g.appendChild(rows);
      if (!L.rows.length) {
        const fr = L.frameRect;
        const why = M.browserRoots(S.model, view, S.layout.ids) === null ? 'The model has no elements yet.' : 'None of its roots is in the model. Pick the roots in the panel, or the whole package.';
        rows.appendChild(text(fr.x + fr.w / 2, fr.y + fr.h / 2, 'Nothing to show. ' + why, 'browser-empty', 'middle'));
        return;
      }
      L.rows.forEach((row, i) => {
        const top = view.y + i * BROWSER_ROW;
        const x0 = view.x + row.depth * BROWSER_INDENT;
        const isEl = row.type === 'el';
        const attrs = { 'data-kind': row.item.kind, 'data-view': view.id };
        attrs[isEl ? 'data-el' : 'data-rel'] = row.id;
        const cls = (isEl ? 'el ' + (M.KINDS[row.item.kind].definition ? 'def' : 'usage') + (row.item.abstract ? ' is-abstract' : '') : 'rel') + ' browser-row' + (i % 2 ? ' browser-alt' : '');
        const rg = node('g', attrs, cls);
        rg.appendChild(node('rect', { x: f(view.x), y: f(top), width: f(L.treeWidth), height: BROWSER_ROW }, 'browser-fill'));
        rg.appendChild(node('rect', { x: f(view.x + 1), y: f(top + 1), width: f(L.treeWidth - 2), height: BROWSER_ROW - 2, rx: 3 }, 'outline'));
        if (isEl && row.kids) rg.appendChild(browserToggle(row, x0, top));
        const t = node('text', { x: f(x0 + 18), y: f(top + 16) });
        const span = (c, s) => { if (!s) return; const ts = node('tspan', {}, c); ts.textContent = s; t.appendChild(ts); };
        span('kw', row.parts.kw);
        span(isEl ? 'browser-name' : 'browser-rel', row.parts.name);
        span('browser-type', row.parts.type);
        span('browser-notes', row.parts.notes);
        rg.appendChild(t);
        rows.appendChild(rg);
      });
    },
    place: function (view, kind) {
      say(M.an(M.KINDS[kind].label, true) + ' can\'t be placed in ' + M.an(M.VIEW_KINDS[view.kind].label) + ', which shows every element the model has. Add it in another view and it appears here too.');
      return null;
    },
    dragStart: function () { return null; },
    drag: function () {},
    drop: function () { return null; }
  };
  // Folds or unfolds an element's row: its id goes into or out of the view's collapsed option, one undo step.
  ACTIONS.toggle = function (hit) {
    const view = viewById(hit.view);
    const el = S.layout.ids.get(hit.id);
    if (!view || !el) return;
    if (!editable()) { say('Folding changes the view, and this model can\'t be changed here.'); return; }
    const before = snapshot();
    if (!Array.isArray(view.options.collapsed)) view.options.collapsed = [];
    const folded = view.options.collapsed;
    const i = folded.indexOf(el.id);
    if (i < 0) folded.push(el.id); else folded.splice(i, 1);
    const what = (i < 0 ? 'Folded ' : 'Unfolded ') + M.describe(S.model, el) + ' in ' + M.describeView(S.model, view);
    commit(what, null, before);
    logChange(what);
    render();
    renderInspector();
    changed();
    say(what + '.');
  };
  // The panel's options for a browser view: its roots (a multiple select: the whole package, or the elements at the top
  // of the package, plus any root below the top a file named, so it can be seen and taken out), and Expand all for
  // its folded elements.
  VIEW_PANELS.BrowserView = function (view, write) {
    const roots = M.browserRoots(S.model, view, S.layout.ids);
    const chosen = new Set((roots || []).map((e) => e.id));
    while (browserRootsSelect.firstChild) browserRootsSelect.removeChild(browserRootsSelect.firstChild);
    const option = (value, label, selected) => {
      const o = document.createElement('option');
      o.value = value;
      o.textContent = label;
      o.selected = selected;
      browserRootsSelect.appendChild(o);
    };
    option('', 'the whole package', roots === null);
    M.childrenOf(S.model, null).forEach((e) => option(e.id, M.describe(S.model, e), chosen.has(e.id)));
    (roots || []).filter((e) => e.owner !== undefined).forEach((e) => option(e.id, M.describe(S.model, e), true));
    browserRootsSelect.disabled = !write;
    const folded = Array.isArray(view.options.collapsed) ? view.options.collapsed.filter((id) => S.layout.ids.has(id)) : [];
    browserExpandAll.disabled = !write || !folded.length;
    browserExpandAll.title = folded.length ? 'Unfold ' + plural(folded.length, 'folded element') + ' in this view' : 'Nothing is folded in this view';
  };
  browserRootsSelect.addEventListener('change', () => {
    const view = selectedView();
    if (!view || view.kind !== 'BrowserView' || !editable()) return;
    // The elements picked are the roots; none, or the whole package alone, means the whole package.
    const picked = Array.from(browserRootsSelect.selectedOptions).map((o) => o.value).filter((v) => v && S.layout.ids.has(v));
    const before = snapshot();
    view.options.roots = picked.length ? picked : null;
    const what = 'Set the roots of ' + M.describeView(S.model, view) + ' to ' +
      (picked.length ? picked.map((id) => M.describe(S.model, S.layout.ids.get(id))).join(', ') : 'the whole package');
    commit(what, null, before);
    logChange(what);
    render();
    renderInspector();
    changed();
    say(what + '.');
  });
  browserExpandAll.addEventListener('click', () => {
    const view = selectedView();
    if (!view || view.kind !== 'BrowserView' || !editable()) return;
    const before = snapshot();
    view.options.collapsed = [];
    const what = 'Unfolded everything in ' + M.describeView(S.model, view);
    commit(what, null, before);
    logChange(what);
    render();
    renderInspector();
    changed();
    say(what + '.');
  });
})(window.SysMLCanvas);
