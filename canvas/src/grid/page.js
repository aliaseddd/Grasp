// The grid view on the page.
(function (C) {
  'use strict';
  const S = C.state;
  const {
    M, ACTIONS, VIEW_PANELS, $, say, editable, f, plural, byNumber, viewById, frameAround, node, text, RENDERERS,
    onScreen, marksFor, edit, renderInspector, selectedView
  } = C;

  // ---- The grid view: a table with a row per shown element, or a matrix of the shown elements against each other
  // with the relationship kinds between them in the cells. Nothing is placed or moved by hand: the rows come from the
  // view's Show list and from the panel's Show all and Show kind buttons. A row is an element group (el grid-row with
  // data-el), so clicking it selects, hovering marks it, and its pins and badges sit at the row's right end.
  const GRID_ROW_H = 24;          // a row
  const GRID_HEAD_H = 28;         // the table's header row
  const GRID_PAD = 8;             // inside a cell
  const GRID_CHAR = 6.6;          // about a character of the cell fonts, in px, to cut what won't fit a cell
  const GRID_MATRIX_COL = 56;     // a matrix column
  const GRID_MATRIX_HEAD = 170;   // the matrix's first column, the row headers
  const GRID_WIDTHS = { kind: 92, name: 160, type: 140, multiplicity: 96, owner: 150, doc: 320, specializes: 160, notes: 72, code: 200, problems: 280 };
  const gridMode = $('grid-mode');
  const gridColumns = $('grid-columns');
  const gridShowAll = $('grid-show-all');
  const gridKind = $('grid-kind');
  const gridShowKind = $('grid-show-kind');

  // Cuts a text to n characters, or to what fits a cell width px wide, with an ellipsis.
  function gridClipChars(s, n) { return s.length > n ? s.slice(0, Math.max(1, n - 1)) + '…' : s; }
  function gridClip(s, width) { return gridClipChars(s, Math.max(2, Math.floor((width - 2 * GRID_PAD) / GRID_CHAR))); }
  // An element's dotted path from the package, Page.hosts.api, so two ports named api can be told apart; an element with
  // no name in the text (a start node) goes by its kind's label, as in a browser: Release.start.
  function gridPath(el, ids) { return M.chain(S.model, el, ids).map(gridName).join('.'); }
  // What stands for an element's name: its name, (unnamed) when it has none, or its kind's label when it has no name in
  // the text.
  function gridName(el) { const name = M.textName(el); return name === null ? M.KINDS[el.kind].label : name || '(unnamed)'; }
  // The text of a table cell: what the column says of the element. The notes and problems columns read the page's
  // lists; found, when given, stands in for the problems (what validate finds now, while sorting).
  function gridCell(el, col, ids, found) {
    const kind = M.KINDS[el.kind];
    // An element with no name in the text is said by its kind's label in both columns (start, initial node), as the
    // browser says it.
    if (col === 'kind') return M.textName(el) === null ? kind.label : kind.keyword;
    if (col === 'name') return gridName(el);
    if (col === 'type') {
      const typing = kind.usage ? M.typingOf(S.model, el) : null;
      const def = typing ? ids.get(typing.to) : null;
      return def ? (el.conjugated ? '~' : '') + gridName(def) : '';
    }
    if (col === 'multiplicity') return el.multiplicity || '';
    if (col === 'owner') { const o = el.owner !== undefined ? ids.get(el.owner) : null; return o ? gridPath(o, ids) : ''; }
    if (col === 'doc') return el.doc.replace(/\s+/g, ' ').trim();
    if (col === 'specializes') {
      return M.linesFrom(S.model, el.id, 'Specialization').filter((r) => ids.has(r.to))
        .map((r) => gridName(ids.get(r.to))).join(', ');
    }
    if (col === 'notes') return S.notes.filter((n) => n.target === el.id).sort(byNumber).map((n) => String(n.no)).join(', ');
    if (col === 'code') return (Array.isArray(el.code) ? el.code : []).map((c) => c.path.trim() || '(no path)').join(', ');
    if (col === 'problems') return (found || S.problems).filter((p) => marksFor(p).indexOf(el.id) >= 0).map((p) => p.message).join(' ');
    return '';
  }
  // A matrix cell's word for a relationship kind: the notation's sign where it has one, else the kind's label.
  function gridRelLabel(kind) {
    if (kind === 'Specialization') return ':>';
    if (kind === 'FeatureTyping') return ':';
    if (kind === 'ConnectionUsage') return '—';
    return M.RELATIONSHIPS[kind] ? M.RELATIONSHIPS[kind].label : kind;
  }
  // The shown elements as rows: in the model's order, or by the sort option (a column; descending with a leading -),
  // the rows with nothing in that column last either way.
  function gridRows(view, ids, o) {
    const rows = S.model.elements.filter((e) => view.layout[e.id]);
    if (!o.sort) return rows;
    const desc = o.sort.charAt(0) === '-';
    const col = desc ? o.sort.slice(1) : o.sort;
    // Sorting by the problems reads what validate finds now, not the last render's list.
    const found = col === 'problems' ? M.validate(S.model) : null;
    const key = new Map(rows.map((e) => [e.id, gridCell(e, col, ids, found)]));
    const order = new Map(rows.map((e, i) => [e.id, i]));
    return rows.slice().sort((a, b) => {
      const ka = key.get(a.id);
      const kb = key.get(b.id);
      if (ka === '' || kb === '') return ka === kb ? order.get(a.id) - order.get(b.id) : (ka === '' ? 1 : -1);
      const c = ka.localeCompare(kb, undefined, { numeric: true, sensitivity: 'base' });
      return (desc ? -c : c) || (order.get(a.id) - order.get(b.id));
    });
  }
  // The layout of a grid view: a rect per row across the sheet's width (so pins and badges sit at the row's right
  // end), the table's or matrix's geometry in L.grid for the drawing, and a place in L.lines for each relationship
  // between two rows, where its pins and badges go: beside the table at the right, between its two rows, or the
  // matrix cell of the pair.
  function gridLayout(view, ids) {
    const o = M.gridOptions(view);
    const x0 = view.x;
    const y0 = view.y;
    const rows = gridRows(view, ids, o).map((e) => ({ el: e, path: gridPath(e, ids) }));
    let grid;
    if (o.mode === 'matrix') {
      // The column headers lean at 60°, so the header is as tall as the longest name needs, up to 22 characters; a
      // longer name is cut to that.
      const chars = Math.max(3, Math.min(22, rows.reduce((m, r) => Math.max(m, r.path.length), 0)));
      const headH = Math.max(48, Math.ceil(chars * GRID_CHAR * 0.87 + 18));
      rows.forEach((r, i) => { r.y = y0 + headH + i * GRID_ROW_H; r.x = x0 + GRID_MATRIX_HEAD + i * GRID_MATRIX_COL; r.label = gridClipChars(r.path, chars); });
      const w = GRID_MATRIX_HEAD + Math.max(1, rows.length) * GRID_MATRIX_COL;
      grid = { mode: 'matrix', x: x0, y: y0, w: w, h: headH + rows.length * GRID_ROW_H, headH: headH, rows: rows, sort: o.sort, lean: Math.ceil(headH * 0.5) };
    } else {
      let x = x0;
      const cols = o.columns.map((key) => { const c = { key: key, x: x, w: GRID_WIDTHS[key] || 120 }; x += c.w; return c; });
      rows.forEach((r, i) => { r.y = y0 + GRID_HEAD_H + i * GRID_ROW_H; });
      grid = { mode: 'table', x: x0, y: y0, w: x - x0, h: GRID_HEAD_H + rows.length * GRID_ROW_H, headH: GRID_HEAD_H, cols: cols, rows: rows, sort: o.sort, lean: 0 };
    }
    // A row's rect is its text band, not the whole row, so a pin or a badge, which sit on a rect's top edge, land
    // inside the row rather than on its boundary with the row above (as the browser's rows have it).
    const rects = new Map();
    rows.forEach((r) => rects.set(r.el.id, { x: x0, y: r.y + 6, w: grid.w, h: GRID_ROW_H - 12 }));
    const lines = new Map();
    const at = new Map(rows.map((r) => [r.el.id, r]));
    S.model.relationships.forEach((rel) => {
      const a = at.get(rel.from);
      const b = at.get(rel.to);
      if (!a || !b) return;
      lines.set(rel.id, grid.mode === 'matrix'
        ? [{ x: b.x + GRID_MATRIX_COL / 2, y: a.y + GRID_ROW_H / 2 }, { x: b.x + GRID_MATRIX_COL / 2, y: a.y + GRID_ROW_H / 2 }]
        : [{ x: x0 + grid.w + 14, y: a.y + GRID_ROW_H / 2 }, { x: x0 + grid.w + 14, y: b.y + GRID_ROW_H / 2 }]);
    });
    const box = { x: x0, y: y0, x2: x0 + grid.w + grid.lean, y2: y0 + grid.h };
    return { view: view, shown: new Set(rows.map((r) => r.el.id)), kids: new Map(), parentOf: new Map(), rects: rects, comps: new Map(), frameRect: frameAround(view, box), lines: lines, grid: grid };
  }
  // A row's group, with the core's classes (el, def or usage, is-abstract) and the grid's own, and a rect across the
  // sheet as the outline the marks color.
  function gridRowGroup(view, r, i, G) {
    const el = r.el;
    const kind = M.KINDS[el.kind];
    const g = node('g', { 'data-el': el.id, 'data-kind': el.kind, 'data-view': view.id },
      'el grid-row ' + (kind.definition ? 'def' : 'usage') + (el.abstract ? ' is-abstract' : '') + (i % 2 ? ' is-even' : ''));
    g.appendChild(node('rect', { x: f(G.x), y: f(r.y), width: f(G.w), height: f(GRID_ROW_H) }, 'outline'));
    return g;
  }
  // A header cell that sorts by a column when clicked (ACTIONS.sort), marked with the sort it is in.
  function gridHeadCell(G, x, w, key, title, hint) {
    const cell = node('g', { 'data-action': 'sort', 'data-for': key, 'data-hint': hint });
    const t = node('title');
    t.textContent = 'Sort by ' + key;
    cell.appendChild(t);
    cell.appendChild(node('rect', { x: f(x), y: f(G.y), width: f(w), height: f(G.headH) }, 'grid-head-cell'));
    const mark = G.sort === key ? ' ▲' : G.sort === '-' + key ? ' ▼' : '';
    cell.appendChild(text(x + GRID_PAD, G.y + G.headH - 10, gridClip(title + mark, w), 'grid-head grid-col-title'));
    return cell;
  }
  // Draws the sheet, and of its rows (and a matrix's columns) those on screen.
  function gridDraw(view, g, L, region) {
    const G = L.grid;
    const rowOn = (r) => onScreen({ x: G.x, y: r.y, w: G.w, h: GRID_ROW_H }, region);
    const colOn = (c) => onScreen({ x: c.x, y: G.y, w: GRID_MATRIX_COL, h: G.h }, region);
    const ids = S.layout.ids;
    const sheet = node('g', {}, 'grid');
    g.appendChild(sheet);
    sheet.appendChild(node('rect', { x: f(G.x), y: f(G.y), width: f(G.w), height: f(G.h), rx: 2 }, 'grid-sheet'));
    if (G.mode === 'matrix') {
      // The rows are the from ends, the columns the to ends; the corner cell sorts both by name.
      const left = G.x + GRID_MATRIX_HEAD;
      const top = G.y + G.headH;
      sheet.appendChild(gridHeadCell(G, G.x, GRID_MATRIX_HEAD, 'name', 'from \\ to', 'Click to sort the rows and the columns by name; again for descending; again for the model\'s order.'));
      sheet.appendChild(node('rect', { x: f(left), y: f(G.y), width: f(G.w - GRID_MATRIX_HEAD), height: f(G.headH) }, 'grid-head-cell'));
      G.rows.forEach((c) => {
        if (!colOn(c)) return;
        const cx = c.x + GRID_MATRIX_COL / 2 + 4;
        const cy = top - 8;
        const t = text(cx, cy, c.label, 'grid-head', 'start');
        t.setAttribute('transform', 'rotate(-60 ' + f(cx) + ' ' + f(cy) + ')');
        sheet.appendChild(t);
      });
      G.rows.forEach((r, i) => {
        if (!rowOn(r)) return;
        const row = gridRowGroup(view, r, i, G);
        row.appendChild(text(G.x + GRID_PAD, r.y + 16, gridClip(r.path, GRID_MATRIX_HEAD), 'grid-cell grid-name'));
        G.rows.forEach((c) => {
          if (!colOn(c)) return;
          if (c.el.id === r.el.id) { row.appendChild(node('rect', { x: f(c.x), y: f(r.y), width: f(GRID_MATRIX_COL), height: f(GRID_ROW_H) }, 'grid-self')); return; }
          const rels = M.linesFrom(S.model, r.el.id).filter((x) => x.to === c.el.id);
          if (!rels.length) return;
          // The cell: a group named for the column's element, its tooltip saying the relationships in words.
          const cell = node('g', { 'data-col': c.el.id }, 'grid-matrix-cell');
          const tip = node('title');
          tip.textContent = rels.map((x) => M.describeRel(S.model, x, ids)).join('; ');
          cell.appendChild(tip);
          cell.appendChild(text(c.x + GRID_MATRIX_COL / 2, r.y + 16, gridClip(rels.map((x) => gridRelLabel(x.kind)).join(' '), GRID_MATRIX_COL), 'grid-cell grid-matrix-text', 'middle'));
          row.appendChild(cell);
        });
        sheet.appendChild(row);
      });
      G.rows.forEach((c) => { if (colOn(c)) sheet.appendChild(node('line', { x1: f(c.x), y1: f(G.y), x2: f(c.x), y2: f(G.y + G.h) }, 'grid-rule')); });
    } else {
      G.cols.forEach((c) => sheet.appendChild(gridHeadCell(G, c.x, c.w, c.key, c.key, 'Click to sort the rows by ' + c.key + '; again for descending; again for the model\'s order.')));
      G.rows.forEach((r, i) => {
        if (!rowOn(r)) return;
        const row = gridRowGroup(view, r, i, G);
        G.cols.forEach((c) => {
          const value = gridCell(r.el, c.key, ids);
          if (value) row.appendChild(text(c.x + GRID_PAD, r.y + 16, gridClip(value, c.w), 'grid-cell' + (c.key === 'name' ? ' grid-name' : '')));
        });
        sheet.appendChild(row);
      });
      G.cols.slice(1).forEach((c) => sheet.appendChild(node('line', { x1: f(c.x), y1: f(G.y), x2: f(c.x), y2: f(G.y + G.h) }, 'grid-rule')));
    }
    if (!G.rows.length) sheet.appendChild(text(G.x + 12, G.y + G.headH + 26, 'No rows yet: use Show all in the panel, or its Show list.', 'grid-hint'));
  }
  RENDERERS.grid = {
    layout: gridLayout,
    draw: gridDraw,
    problems: true, // its problems column shows what the checks found, so the view is drawn again when that changes
    place: function (view, kind) {
      say('A grid draws nothing by hand: its rows come from its Show list and from Show all in the panel. Select ' + M.describeView(S.model, view) + ' to add rows.');
      return null;
    },
    dragStart: function () { return null; },
    drag: function () {},
    drop: function () { return null; }
  };
  // The panel's options for a grid view: the mode, the table's columns (ticked; idle in a matrix, whose columns are
  // its elements), and the kinds the model has, to show every element of one.
  VIEW_PANELS.GridView = function (view, write) {
    const o = M.gridOptions(view);
    gridMode.value = o.mode;
    gridMode.disabled = !write;
    gridColumns.querySelectorAll('.grid-column').forEach((box) => {
      box.checked = o.columns.indexOf(box.value) >= 0;
      box.disabled = !write || o.mode !== 'table';
    });
    const counts = new Map();
    S.model.elements.forEach((e) => counts.set(e.kind, (counts.get(e.kind) || 0) + 1));
    const picked = gridKind.value;
    while (gridKind.firstChild) gridKind.removeChild(gridKind.firstChild);
    Object.keys(M.KINDS).filter((k) => counts.has(k)).forEach((k) => {
      const opt = document.createElement('option');
      opt.value = k;
      opt.textContent = M.KINDS[k].label + ' (' + counts.get(k) + ')';
      gridKind.appendChild(opt);
    });
    if (!counts.size) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'The model has no elements yet';
      gridKind.appendChild(opt);
    }
    if (picked && counts.has(picked)) gridKind.value = picked;
    gridShowAll.disabled = !write || S.model.elements.every((e) => view.layout[e.id]);
    gridKind.disabled = !write || !counts.size;
    gridShowKind.disabled = !write || !counts.size;
  };
  gridMode.addEventListener('change', () => {
    const view = selectedView();
    if (!view || view.kind !== 'GridView' || !editable()) return;
    const next = gridMode.value === 'matrix' ? 'matrix' : 'table';
    if (M.gridOptions(view).mode === next) return;
    const what = 'Showed ' + M.describeView(S.model, view) + ' as a ' + (next === 'matrix' ? 'matrix of its elements against each other' : 'table with a row per element');
    edit(() => {
      view.options.mode = next;
      return what;
    });
    renderInspector();
    say(what + '.');
  });
  // A column ticked or unticked. A table keeps at least one column, and a sort goes with the column it was on.
  gridColumns.addEventListener('change', (event) => {
    const box = event.target.closest ? event.target.closest('.grid-column') : null;
    const view = selectedView();
    if (!box || !view || view.kind !== 'GridView' || !editable()) return;
    const o = M.gridOptions(view);
    const col = box.value;
    let next;
    if (box.checked) next = M.GRID_COLUMNS.filter((c) => c === col || o.columns.indexOf(c) >= 0);
    else {
      next = o.columns.filter((c) => c !== col);
      if (!next.length) { box.checked = true; say('A table needs a column, so ' + col + ' stays. Tick another column before taking this one away.'); return; }
    }
    const what = (box.checked ? 'Added the ' + col + ' column to ' : 'Removed the ' + col + ' column from ') + M.describeView(S.model, view);
    edit(() => {
      view.options.columns = next;
      if (!box.checked && o.sort && o.sort.replace(/^-/, '') === col) view.options.sort = null;
      return what;
    });
    renderInspector();
    say(what + '.');
  });
  // Makes rows of the elements given that aren't rows yet: the boxes, then the border items whose owner is a row,
  // since a border item is shown only where its owner is (the core's rule in every view). Says what was left out.
  function gridShow(view, els) {
    const added = [];
    const skipped = [];
    els.filter((e) => !M.KINDS[e.kind].onBorder && !view.layout[e.id]).forEach((e) => { view.layout[e.id] = M.placement(e, {}); added.push(e); });
    els.filter((e) => M.KINDS[e.kind].onBorder && !view.layout[e.id]).forEach((e) => {
      if (e.owner !== undefined && view.layout[e.owner]) { view.layout[e.id] = M.placement(e, {}); added.push(e); } else skipped.push(e);
    });
    return { added: added, skipped: skipped };
  }
  // Show all, or Show kind: the selected grid view gets the elements as rows, as one undo step.
  function gridShowRows(els, what, label) {
    const view = selectedView();
    if (!view || view.kind !== 'GridView' || !editable()) return;
    const text = what + ' in ' + M.describeView(S.model, view);
    let r = null;
    edit(() => {
      r = gridShow(view, els);
      return r.added.length ? text : null;
    });
    if (!r) return;
    const left = r.skipped.length ? ' ' + plural(r.skipped.length, label) + ' sit' + (r.skipped.length === 1 ? 's' : '') + ' on an element that isn\'t a row; show that first.' : '';
    if (!r.added.length) { say('Every ' + label + ' the model has is a row in ' + M.describeView(S.model, view) + ' already.' + left); return; }
    renderInspector();
    say(text + ': ' + plural(r.added.length, 'new row') + ', ' + plural(Object.keys(view.layout).length, 'row') + ' in all.' + left);
  }
  gridShowAll.addEventListener('click', () => gridShowRows(S.model.elements, 'Showed every element', 'element'));
  gridShowKind.addEventListener('click', () => {
    const kind = M.KINDS[gridKind.value] ? gridKind.value : null;
    if (kind) gridShowRows(S.model.elements.filter((e) => e.kind === kind), 'Showed every ' + M.KINDS[kind].label, M.KINDS[kind].label);
  });
  // A click on a header cell: the rows go by that column, then the other way round, then back to the model's order.
  ACTIONS.sort = function (hit) {
    const view = viewById(hit.view);
    if (!view || view.kind !== 'GridView' || M.GRID_COLUMNS.indexOf(hit.id) < 0) return;
    if (!editable()) { say('The order of the rows is part of the view, which can\'t be changed here.'); return; }
    const o = M.gridOptions(view);
    const next = o.sort === hit.id ? '-' + hit.id : o.sort === '-' + hit.id ? null : hit.id;
    const what = next === null ? 'Put the rows of ' + M.describeView(S.model, view) + ' back in the model\'s order'
      : 'Sorted the rows of ' + M.describeView(S.model, view) + ' by ' + hit.id + (next.charAt(0) === '-' ? ', descending' : '');
    edit(() => {
      view.options.sort = next;
      return what;
    });
    say(what + '.');
  };
})(window.SysMLCanvas);
