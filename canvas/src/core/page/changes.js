// Changes: the one way the model changes (edit), with what each change touched; the log Claude reads; when to save;
// and what Undo takes back.
(function (C) {
  'use strict';
  const S = C.state;
  const { M, PAUSE, HISTORY, undoButton, now, say, editable, viewById, render, applyMarks } = C;

  // ---- What a change touched.

  const LISTS = ['elements', 'relationships', 'views'];

  // The model in parts, each as its JSON, so the model before a change can be told from the model after it: the
  // elements and the relationships by id, each view by id without its layout, each view's layout by the id of what it
  // places, the order of the three lists, and the rest (the package).
  function capture(model) {
    const byId = (list) => new Map(list.map((x) => [x.id, JSON.stringify(x)]));
    const views = new Map();
    const places = new Map();
    model.views.forEach((view) => {
      const own = Object.assign({}, view);
      delete own.layout;
      views.set(view.id, JSON.stringify(own));
      const layout = view.layout || {};
      places.set(view.id, new Map(Object.keys(layout).map((id) => [id, JSON.stringify(layout[id])])));
    });
    const rest = Object.assign({}, model);
    LISTS.forEach((list) => { delete rest[list]; });
    const order = {};
    LISTS.forEach((list) => { order[list] = model[list].map((x) => x.id); });
    return { elements: byId(model.elements), relationships: byId(model.relationships), views: views, places: places, order: order, rest: JSON.stringify(rest) };
  }
  // What changed from capture a to capture b, as the ids of what it touched, a list each: { elements, relationships,
  // views }; null when nothing changed. One is touched when it was added, removed or changed, or moved in its list,
  // whose order is the text's (a sequence view keeps its events in model order). A change to a view's layout touches
  // the view, and each element or line whose place in it changed.
  function difference(a, b) {
    const touched = { elements: new Set(), relationships: new Set(), views: new Set() };
    const compare = (x, y, into) => {
      x.forEach((json, id) => { if (y.get(id) !== json) into.add(id); });
      y.forEach((json, id) => { if (!x.has(id)) into.add(id); });
    };
    LISTS.forEach((list) => compare(a[list], b[list], touched[list]));
    const none = new Map();
    new Set(Array.from(a.places.keys()).concat(Array.from(b.places.keys()))).forEach((viewId) => {
      const placed = new Set();
      compare(a.places.get(viewId) || none, b.places.get(viewId) || none, placed);
      if (!placed.size) return;
      touched.views.add(viewId);
      placed.forEach((id) => touched[a.relationships.has(id) || b.relationships.has(id) ? 'relationships' : 'elements'].add(id));
    });
    LISTS.forEach((list) => moved(a.order[list], b.order[list]).forEach((id) => touched[list].add(id)));
    if (LISTS.every((list) => !touched[list].size) && a.rest === b.rest) return null;
    return { elements: Array.from(touched.elements), relationships: Array.from(touched.relationships), views: Array.from(touched.views) };
  }
  // The ids in both lists that the second puts in another order: those off the longest run the two lists keep in the
  // same order, which is the longest increasing run of the places the first list gives them (patience sorting).
  function moved(x, y) {
    if (x.length === y.length && x.every((id, i) => id === y[i])) return [];
    const place = new Map(x.map((id, i) => [id, i]));
    const both = y.filter((id) => place.has(id));
    const tails = [];            // tails[k]: where in both the best run of k + 1 found so far ends
    const back = [];             // back[i]: where in both the one before i on its run is, or -1
    both.forEach((id, i) => {
      const p = place.get(id);
      let lo = 0;
      let hi = tails.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (place.get(both[tails[mid]]) < p) lo = mid + 1; else hi = mid;
      }
      back[i] = lo ? tails[lo - 1] : -1;
      tails[lo] = i;
    });
    const kept = new Set();
    for (let i = tails.length ? tails[tails.length - 1] : -1; i >= 0; i = back[i]) kept.add(both[i]);
    return both.filter((id) => !kept.has(id));
  }
  function nothingTouched() { return { elements: [], relationships: [], views: [] }; }
  function merge(into, more) {
    LISTS.forEach((list) => more[list].forEach((id) => { if (into[list].indexOf(id) < 0) into[list].push(id); }));
  }

  // ---- The one way the model changes.

  S.saveTimer = null;

  // Every change to the model goes through edit(change, key). change() changes the model and returns what it did: a
  // string, the words for the Undo button and the log; { what, log, key } when the log needs other words (log) or
  // its entry another key than the edit's (key: null joins it to no other entry); or nothing, when it did nothing,
  // and then the model must be as it was. edit records the change for Undo, with what it touched; logs it for
  // Claude; redraws the drawing; and schedules the save. The panel, the selection and the status line are the
  // caller's to bring up to date after it.
  //
  // A key joins a run of changes into one undo step: the keystrokes of one name, the moves of one drag, each made
  // with the same key, one after another. A run is logged once, in its last words, when it ends: at endEdit(), which
  // the field's change event or the drag's drop calls, or when a change with another key comes first.
  //
  // Returns what the change touched (see difference), or null when nothing was done: the page can't be changed here,
  // or change() did nothing.
  function edit(change, key) {
    if (!editable()) return null;
    const open = S.history[S.history.length - 1];
    if (open && open.key !== null && open.key !== key) endEdit();
    const top = S.history[S.history.length - 1];
    const joins = !!key && !!top && top.key === key;
    const was = capture(S.model);
    const before = joins ? null : snapshot();
    let said = words(change(), key);
    const diff = difference(was, capture(S.model));
    if (!said) {
      if (!diff) return null;
      said = words('Changed the model', key);
    }
    const touched = diff || nothingTouched();
    if (joins) {
      Object.assign(top, { what: said.what, log: said.log, logKey: said.key });
      merge(top.touched, touched);
    } else {
      S.history.push({ json: before, what: said.what, key: key || null, touched: touched, log: said.log, logKey: said.key });
      if (S.history.length > HISTORY) S.history.shift();
      if (!key) logChange(said.log, said.key);
    }
    updateUndo();
    render();
    changed();
    return touched;
  }
  // What a change says it did, as { what, log, key }, or null when it says it did nothing.
  function words(said, key) {
    if (!said) return null;
    if (typeof said === 'string') return { what: said, log: said, key: key || null };
    return { what: said.what, log: said.log === undefined ? said.what : said.log, key: said.key === undefined ? key || null : said.key };
  }
  // Ends the run of changes the newest undo step is, so the next change with its key is a step of its own, and logs
  // the run in its last words. A run that ended with the model as it was before it (a box dragged out and back) is no
  // step at all, and logs nothing.
  function endEdit() {
    const top = S.history[S.history.length - 1];
    if (!top || top.key === null) return;
    top.key = null;
    if (top.json === snapshot()) S.history.pop();
    else if (top.log !== null) logChange(top.log, top.logKey);
    updateUndo();
    changed();
  }

  // ---- The log, the save, and Undo.

  // The log of what was done, which Claude reads. A key joins an entry to the one before it when that one has the same
  // key: the latest words stand for both.
  function logChange(what, coalesceKey) {
    const entry = { at: now(), text: what };
    if (coalesceKey) {
      entry.key = coalesceKey;
      const last = S.changes[S.changes.length - 1];
      if (last && last.key === coalesceKey) { S.changes[S.changes.length - 1] = entry; return; }
    }
    S.changes.push(entry);
    if (S.changes.length > 200) S.changes = S.changes.slice(-200);
  }
  // The save waits for a pause in the changes.
  function changed() {
    clearTimeout(S.saveTimer);
    S.saveTimer = setTimeout(C.persist, PAUSE);
  }
  function snapshot() { return JSON.stringify(S.model); }

  function updateUndo() {
    const top = S.history[S.history.length - 1];
    undoButton.disabled = !top || !editable();
    undoButton.title = top ? 'Undo: ' + top.what : 'Nothing to undo';
  }
  // Takes the newest change back: the model goes back to what it was before it.
  function undo() {
    if (!editable()) return;
    endEdit();
    if (!S.history.length) return;
    const entry = S.history.pop();
    S.model = M.normalize(JSON.parse(entry.json));
    modelReplaced();
    logChange('Undid: ' + entry.what);
    changed();
    say('Undid: ' + entry.what + '.');
  }
  // A model from storage takes the place of the one here: this browser's as the page starts, or the shared store's
  // when it was changed elsewhere. It isn't a change made here, so it is neither logged nor saved, and what was done
  // here before it can't be taken back.
  function loadModel(raw) {
    S.model = M.normalize(raw);
    S.history = [];
  }
  // After the model was swapped for another (undo, the store, an import): the active view and the selection are kept
  // when they still exist, everything is drawn again, and the notes' labels follow.
  function modelReplaced() {
    if (!viewById(S.active)) S.active = S.model.views[0].id;
    if (S.pending && !S.model.elements.some((e) => e.id === S.pending)) S.pending = null;
    render();
    if (S.selection && !C.resolve(S.selection)) S.selection = null;
    C.setActive(S.active);
    applyMarks();
    C.renderInspector();
    C.renderNotes();
    C.syncNoteLabels(); // the names may have changed under the notes, as a rename changes them
    updateUndo();
  }

  Object.assign(C, { edit, endEdit, logChange, updateUndo, undo, loadModel, modelReplaced });
})(window.SysMLCanvas);
