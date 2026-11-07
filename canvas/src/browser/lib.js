// The browser view in the model library: its row, and the tree's roots and rows.
(function (root) {
  'use strict';
  const lib = root.SysMLModelLib;
  const {
    RELATIONSHIPS, VIEW_KINDS, textName, index, chain, childrenOf, quote, qualified, nameable, describe, describeView,
    EXTRA
  } = lib;

  Object.assign(VIEW_KINDS, {
    // A browser view shows the whole model as a tree, so it admits every kind and places nothing by hand: roots is null
    // for the whole package (every element at the top) or the ids of the elements whose subtrees the tree shows, and
    // collapsed the ids whose insides are folded away.
    BrowserView: { name: 'BrowserView', label: 'browser view', qualified: 'StandardViewDefinitions::BrowserView', renderer: 'browser',
      admits: null, tools: [], options: { roots: null, collapsed: [] },
      // A root is exposed by its qualified name, so one without a full name can't be, and the text leaves it out.
      check: function (model, view, ids, add) {
        (browserRoots(model, view, ids) || []).forEach((root) => {
          if (!nameable(model, root, ids)) {
            add(view.id, 'The ' + describeView(model, view) + ' can\'t expose its root ' + describe(model, root, ids) + ' by name: ' + (textName(root) === null ? 'the text has no name for it.' : 'it, or what it is in, has no name. Name it.'));
          }
        });
      },
      // The view's body in the text: the whole package, recursively, or each root with everything inside it, then the
      // tree rendering. Validated in understand/views/02-expose-forms.sysml and 04-render-clauses.sysml, and in
      // slices/browser/b01-forms.sysml (quoted, nested and leaf roots; no root at all).
      exposes: function (model, view, h) {
        const roots = browserRoots(model, view, h.ids);
        const lines = roots === null
          ? ['expose ' + quote(model.package.name) + '::*::**;']
          : roots.filter((e) => nameable(model, e, h.ids)).map((e) => 'expose ' + qualified(model, e, h.ids) + '::**;');
        lines.push('render Views::asTreeDiagram;');
        return lines;
      } },
  });

  // ---- The browser view: the model as a tree.
  // The elements a browser view's tree starts from: null for the whole package (every element at the top), else the
  // elements its roots option names that are in the model, in model order, leaving out one that sits inside another
  // root, since that root's subtree shows it already. A roots option that isn't a list counts as the whole package.
  function browserRoots(model, view, ids) {
    ids = ids || index(model);
    const want = view.options && Array.isArray(view.options.roots) ? view.options.roots : null;
    if (want === null) return null;
    const set = new Set(want.filter((id) => typeof id === 'string' && ids.has(id)));
    return model.elements.filter((e) => set.has(e.id) && !chain(model, e, ids).slice(0, -1).some((o) => set.has(o.id)));
  }
  // The rows of a browser view, in order: a depth-first walk from its roots in model order, each element a row with
  // what it owns under it, unless the view folds it (its id in options.collapsed), then the relationships declared in
  // it. The package's relationships, and those declared above a root, come last. A relationship is a row only when
  // both of its ends are rows, so what is drawn in the view is what pins and badges can find. Each row is
  // { type: 'el' | 'rel', id, item, depth, kids (whether anything is inside it), folded }.
  function browserRows(model, view, ids) {
    ids = ids || index(model);
    const roots = browserRoots(model, view, ids);
    const folded = new Set(view.options && Array.isArray(view.options.collapsed) ? view.options.collapsed : []);
    const nodes = new Map(); // element id → its node, for the elements that are rows
    const branch = (el, depth) => {
      const kids = childrenOf(model, el.id).filter((k) => !nodes.has(k.id));
      const n = { row: { type: 'el', id: el.id, item: el, depth: depth, kids: kids.length > 0, folded: folded.has(el.id) }, under: [], rels: [] };
      nodes.set(el.id, n);
      if (!n.row.folded) kids.forEach((k) => n.under.push(branch(k, depth + 1)));
      return n;
    };
    const tops = [];
    (roots === null ? childrenOf(model, null) : roots).forEach((e) => { if (!nodes.has(e.id)) tops.push(branch(e, 0)); });
    const tail = [];
    model.relationships.forEach((rel) => {
      if (!nodes.has(rel.from) || !nodes.has(rel.to)) return;
      const owner = RELATIONSHIPS[rel.kind].owner(model, rel, ids);
      const at = owner === null ? null : nodes.get(owner) || null;
      const row = { type: 'rel', id: rel.id, item: rel, depth: at ? at.row.depth + 1 : 0 };
      if (at) at.rels.push(row); else tail.push(row);
    });
    const out = [];
    const flatten = (n) => { out.push(n.row); n.under.forEach(flatten); n.rels.forEach((r) => out.push(r)); };
    tops.forEach(flatten);
    return out.concat(tail);
  }
  EXTRA.browserRoots = browserRoots;
  EXTRA.browserRows = browserRows;
})(typeof globalThis !== 'undefined' ? globalThis : window);
