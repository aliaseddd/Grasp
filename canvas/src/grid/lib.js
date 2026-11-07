// The grid view in the model library: its row, its columns, and its options read safely.
(function (root) {
  'use strict';
  const lib = root.SysMLModelLib;
  const { VIEW_KINDS, isObject, EXTRA } = lib;

  Object.assign(VIEW_KINDS, {
    // Any element may be a row, and nothing is drawn by hand: the rows come from the view's Show list and the panel's
    // Show all buttons. The options: mode (table, a row per element; matrix, the elements against each other), the
    // table's columns (keys of GRID_COLUMNS, in its order), and sort (a column, with a leading - for descending; null
    // for the model's order). The layout's keys are the rows, so there is no rows option.
    GridView: { name: 'GridView', label: 'grid view', qualified: 'StandardViewDefinitions::GridView', renderer: 'grid',
      admits: null, tools: [], fields: ['name', 'doc'], options: { mode: 'table', columns: ['kind', 'name', 'type', 'multiplicity', 'owner', 'doc'], sort: null },
      // The view's body in the text: the core's expose lines, then, for a table, the library's tabular rendering (one
      // row per exposed element). A matrix has no library rendering, so it exposes and says nothing more. Validated
      // in every form a grid can take (a view with exposes and the render clause, with the render clause alone, with a
      // doc, as a matrix with exposes alone, and empty) in scratchpad/slices/grid/grid-01-forms.sysml.
      exposes: function (model, view, h) {
        const lines = h.exposesOf(view);
        if (gridOptions(view).mode === 'table') lines.push('render Views::asElementTable;');
        return lines;
      } },
  });

  // The grid view's columns, in the order a table shows them, and a view's grid options read safely, whatever a file
  // carries: mode is table unless it says matrix, columns are the known ones in this order (the defaults when none is
  // known), and sort is a column name, with a leading - for descending, or null for the model's order. The page draws
  // from this reading and the export's render clause reads the mode from it, so both see one thing.
  const GRID_COLUMNS = ['kind', 'name', 'type', 'multiplicity', 'owner', 'doc', 'specializes', 'notes', 'code', 'problems'];
  function gridOptions(view) {
    const o = view && isObject(view.options) ? view.options : {};
    const wanted = Array.isArray(o.columns) ? o.columns : [];
    let columns = GRID_COLUMNS.filter((c) => wanted.indexOf(c) >= 0);
    if (!columns.length) columns = VIEW_KINDS.GridView.options.columns.slice();
    const sort = typeof o.sort === 'string' && GRID_COLUMNS.indexOf(o.sort.replace(/^-/, '')) >= 0 ? o.sort : null;
    return { mode: o.mode === 'matrix' ? 'matrix' : 'table', columns: columns, sort: sort };
  }
  EXTRA.GRID_COLUMNS = GRID_COLUMNS;
  EXTRA.gridOptions = gridOptions;
})(typeof globalThis !== 'undefined' ? globalThis : window);
