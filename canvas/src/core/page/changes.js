// Changes: the one way the model changes (edit), with what each change touched; the log Claude reads; when to save;
// and what Undo takes back.
(function (C) {
  'use strict';
  const S = C.state;
  const { M, PAUSE, HISTORY, undoButton, now, say, editable, viewById, render, applyMarks, check } = C;

  const LISTS = ['elements', 'relationships', 'views'];
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

  // ---- The model keeps a note of every write made to it.
  //
  // Every object and array in the model is a Proxy of itself: its target is the plain object, which holds the same
  // Proxies as its children, so whatever is read from the model is a Proxy, and reads go straight to the target. Only
  // writes are trapped: before a key of an object changes, or is deleted, the object, the key and what the key held
  // are noted (the first time in a change); before an array changes, a copy of its items is. So edit() learns what a
  // change touched from the notes alone, without looking through the model, Undo puts back what the notes say, and
  // a write made while no change is open is noted as a mistake (stray), reported when the next change comes.

  const targets = new WeakMap();   // a Proxy -> its target
  const proxies = new WeakMap();   // a target -> its Proxy
  const homes = new WeakMap();     // a target -> where it sits in the model, for what a write to it touches
  // Where things sit: the model itself, one of its three lists, an item of a list (whose id is its own), something
  // inside an item, a view's layout, a place in a layout (the id it places), and the rest (the package).
  const ROOT = { at: 'root' };
  const REST = { at: 'rest' };
  const LIST = {};
  const ITEM = {};
  LISTS.forEach((list) => { LIST[list] = { at: 'list', list: list }; ITEM[list] = { at: 'item', list: list }; });
  function homeIn(t, k) {
    const h = homes.get(t) || REST;
    if (h.at === 'root') return LIST[k] || REST;
    if (h.at === 'list') return ITEM[h.list];
    if (h.at === 'item') return h.list === 'views' && k === 'layout' ? { at: 'layout', view: t } : { at: 'in', item: t, list: h.list };
    if (h.at === 'layout') return { at: 'place', view: h.view, id: String(k) };
    return h; // inside an item, or inside a place: the same item or place
  }
  // Makes a value part of the model, where home says: an object or array becomes the Proxy of itself, its children
  // first. A Proxy already in the model stays itself, and moves home.
  function track(value, home) {
    if (value === null || typeof value !== 'object') return value;
    const target = targets.get(value) || value;
    if (proxies.has(target)) { homes.set(target, home); return proxies.get(target); }
    homes.set(target, home);
    const keys = Array.isArray(target) ? target.keys() : Object.keys(target);
    for (const k of keys) {
      const child = target[k];
      if (child !== null && typeof child === 'object') target[k] = track(child, homeIn(target, k));
    }
    const proxy = new Proxy(target, TRAPS);
    targets.set(proxy, target);
    proxies.set(target, proxy);
    return proxy;
  }
  const TRAPS = {
    set: function (t, k, v) { noteWrite(t, k); t[k] = track(v, homeIn(t, k)); return true; },
    deleteProperty: function (t, k) { noteWrite(t, k); return delete t[k]; },
    defineProperty: function (t, k, d) {
      noteWrite(t, k);
      return Reflect.defineProperty(t, k, 'value' in d ? Object.assign({}, d, { value: track(d.value, homeIn(t, k)) }) : d);
    }
  };

  // The notes of one change, or of a run of them: for each object, each key written and what it held first
  // ({ had, old }); for each array, a copy of its items as they were first; and the model the change replaced, when it
  // put a whole new one in its place.
  function newNotes() { return { objects: new Map(), lists: new Map(), replaced: null }; }
  let writing = null;              // the notes of the change that is open, or null
  let stray = newNotes();          // writes made while no change was open
  function noteWrite(t, k) {
    const notes = writing || stray;
    if (Array.isArray(t)) { if (!notes.lists.has(t)) notes.lists.set(t, t.slice()); return; }
    let keys = notes.objects.get(t);
    if (!keys) { keys = new Map(); notes.objects.set(t, keys); }
    if (!keys.has(k)) keys.set(k, { had: own(t, k), old: t[k] });
  }
  // Joins a later change's notes to its run's: what the run noted first stays.
  function absorb(run, later) {
    later.objects.forEach((keys, t) => {
      const mine = run.objects.get(t);
      if (!mine) { run.objects.set(t, keys); return; }
      keys.forEach((note, k) => { if (!mine.has(k)) mine.set(k, note); });
    });
    later.lists.forEach((copy, t) => { if (!run.lists.has(t)) run.lists.set(t, copy); });
    if (!run.replaced) run.replaced = later.replaced;
  }
  // Puts back what the notes say was there, past the traps, so nothing is noted. A change that replaced the model
  // gives the old one back.
  function restore(notes) {
    notes.objects.forEach((keys, t) => keys.forEach((note, k) => { if (note.had) t[k] = note.old; else delete t[k]; }));
    notes.lists.forEach((copy, t) => { t.length = 0; copy.forEach((item) => t.push(item)); });
    if (notes.replaced) S.model = notes.replaced;
  }
  function sameItems(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  // ---- What a change touched.

  // What the notes say changed, as the ids of what it touched, a list each: { elements, relationships, views }, each
  // in the model's order; null when nothing changed (every key written holds what it held, every array its items).
  // One is touched when it was added, removed or changed, or moved in its list, whose order is the text's (a sequence
  // view keeps its events in model order). A change to a view's layout touches the view, and each element or line
  // whose place in it changed.
  function touchedBy(notes) {
    const found = { elements: new Set(), relationships: new Set(), views: new Set() };
    const before = {};           // a list's items before the change, where it changed
    let rest = false;
    // Whether a place is a line's: not when the drawing knows it as an element; else the lines' ids, before the
    // change (as the notes have the list) and after it, say.
    let lines = null;
    const isLine = (id) => {
      if (S.layout && S.layout.ids.has(id)) return false;
      if (!lines) {
        lines = new Set(S.model.relationships.map((r) => r.id));
        const root = notes.objects.get(targets.get(S.model));
        const was = root ? root.get('relationships') : null;
        if (was && Array.isArray(was.old)) was.old.forEach((r) => lines.add(r.id));
        notes.lists.forEach((copy, t) => { if (homes.get(t) === LIST.relationships) copy.forEach((r) => lines.add(r.id)); });
      }
      return lines.has(id);
    };
    const placed = (view, id) => { found.views.add(view.id); found[isLine(id) ? 'relationships' : 'elements'].add(id); };
    const changedList = (list, was, is) => {
      before[list] = was;
      const old = new Map(was.map((x) => [x.id, x]));
      const ids = new Set(is.map((x) => x.id));
      was.forEach((x) => { if (!ids.has(x.id)) found[list].add(x.id); });
      is.forEach((x) => {
        const o = old.get(x.id);
        if (!o || (o !== x && JSON.stringify(o) !== JSON.stringify(x))) found[list].add(x.id);
      });
      moved(was.map((x) => x.id), is.map((x) => x.id)).forEach((id) => found[list].add(id));
    };
    notes.lists.forEach((copy, t) => {
      if (sameItems(copy, t)) return;
      const h = homes.get(t) || REST;
      if (h.at === 'list') changedList(h.list, copy, t);
      else if (h.at === 'in') found[h.list].add(h.item.id);
      else if (h.at === 'place') placed(h.view, h.id);
      else rest = true;
    });
    notes.objects.forEach((keys, t) => {
      const h = homes.get(t) || REST;
      keys.forEach((note, k) => {
        const has = own(t, k);
        if (has === note.had && (!has || t[k] === note.old)) return;
        if (h.at === 'root') {
          if (LIST[k]) changedList(k, Array.isArray(note.old) ? note.old.slice() : [], Array.isArray(t[k]) ? t[k].slice() : []);
          else rest = true;
        } else if (h.at === 'item') {
          found[h.list].add(t.id);
          // A layout put in place of another: each place that differs between the two.
          if (h.list === 'views' && k === 'layout') {
            const a = note.had && note.old ? note.old : {};
            const b = has && t[k] ? t[k] : {};
            new Set(Object.keys(a).concat(Object.keys(b))).forEach((id) => { if (JSON.stringify(a[id]) !== JSON.stringify(b[id])) placed(t, id); });
          }
        } else if (h.at === 'in') found[h.list].add(h.item.id);
        else if (h.at === 'layout') placed(h.view, String(k));
        else if (h.at === 'place') placed(h.view, h.id);
        else rest = true;
      });
    });
    if (LISTS.every((list) => !found[list].size) && !rest) return null;
    const out = {};
    LISTS.forEach((list) => {
      const ids = Array.from(found[list]);
      // In the order the list had before the change, those it added last, in its order now.
      if (ids.length > 1) {
        const was = before[list] || S.model[list];
        const at = new Map(was.map((x, i) => [x.id, i]));
        S.model[list].forEach((x, i) => { if (!at.has(x.id)) at.set(x.id, was.length + i); });
        ids.sort((a, b) => at.get(a) - at.get(b));
      }
      out[list] = ids;
    });
    return out;
  }

  // For a change that put a whole new model in place of the old one: the model in parts, each as its JSON, so the
  // model before the change can be told from the model after it: the elements and the relationships by id, each view
  // by id without its layout, each view's layout by the id of what it places, the order of the three lists, and the
  // rest (the package).
  function capture(model) {
    const byId = (list) => new Map(list.map((x) => [x.id, JSON.stringify(x)]));
    const views = new Map();
    const places = new Map();
    model.views.forEach((view) => {
      const fields = Object.assign({}, view);
      delete fields.layout;
      views.set(view.id, JSON.stringify(fields));
      const layout = view.layout || {};
      places.set(view.id, new Map(Object.keys(layout).map((id) => [id, JSON.stringify(layout[id])])));
    });
    const rest = Object.assign({}, model);
    LISTS.forEach((list) => { delete rest[list]; });
    const order = {};
    LISTS.forEach((list) => { order[list] = model[list].map((x) => x.id); });
    return { elements: byId(model.elements), relationships: byId(model.relationships), views: views, places: places, order: order, rest: JSON.stringify(rest) };
  }
  // What changed from capture a to capture b, as touchedBy says it; null when nothing changed.
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
    // Most changes add or take away and keep the rest in order: then nothing moved.
    let last = -1;
    if (both.every((id) => { const p = place.get(id); const ok = p > last; last = p; return ok; })) return [];
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
  S.model = track(S.model, ROOT);

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
  // Returns what the change touched (see touchedBy), or null when nothing was done: the page can't be changed here,
  // or change() did nothing.
  function edit(change, key) {
    if (!editable()) return null;
    const open = S.history[S.history.length - 1];
    if (open && open.key !== null && open.key !== key) endEdit();
    const top = S.history[S.history.length - 1];
    const joins = !!key && !!top && top.key === key;
    reportStray();
    const model = S.model;
    const notes = newNotes();
    writing = notes;
    let result;
    try { result = change(); } finally { writing = null; }
    let said = words(result, key);
    let touched;
    if (S.model !== model) {
      // A whole new model in place of the old one (an import): the new one becomes part of the record, and what it
      // touched is found by comparing the two.
      S.model = track(S.model, ROOT);
      notes.replaced = model;
      touched = difference(capture(model), capture(S.model));
    } else touched = touchedBy(notes);
    if (!said) {
      if (!touched) return null;
      mistake('A change given to edit() said it did nothing, yet it changed', touched);
      said = words('Changed the model', key);
    }
    touched = touched || nothingTouched();
    if (joins) {
      Object.assign(top, { what: said.what, log: said.log, logKey: said.key });
      merge(top.touched, touched);
      absorb(top.notes, notes);
    } else {
      S.history.push({ notes: notes, what: said.what, key: key || null, touched: touched, log: said.log, logKey: said.key });
      if (S.history.length > HISTORY) S.history.shift();
      if (!key) logChange(said.log, said.key);
    }
    updateUndo();
    render(touched, howToDraw(notes, touched));
    changed();
    return touched;
  }
  // What the drawing must do about a change, from its notes (see render): a change that only moved things (each
  // write was to a place in a view's layout, or to a view's x or y) lays out again just the views it touched, and
  // may draw again just what moved; one that showed or hid things in views (a place put in a layout or taken out of
  // it, and nothing else) lays out just those views again; any other can have moved anything, in any view.
  function howToDraw(notes, touched) {
    if (notes.replaced) return null;
    let patch = true;
    for (const t of notes.lists.keys()) { if ((homes.get(t) || REST).at !== 'place') return null; }
    for (const [t, keys] of notes.objects) {
      const h = homes.get(t) || REST;
      if (h.at === 'place') continue;
      if (h.at === 'layout') { patch = false; continue; }
      if (h.at === 'item' && h.list === 'views' && Array.from(keys.keys()).every((k) => k === 'x' || k === 'y')) continue;
      return null;
    }
    return { views: new Set(touched.views), patch: patch };
  }
  // What a change says it did, as { what, log, key }, or null when it says it did nothing.
  function words(said, key) {
    if (!said) return null;
    if (typeof said === 'string') return { what: said, log: said, key: key || null };
    return { what: said.what, log: said.log || said.what, key: said.key === undefined ? key || null : said.key };
  }
  // Reports the writes made to the model outside edit since the last change: a mistake in the page's code, which no
  // undo step holds.
  function reportStray() {
    const notes = stray;
    stray = newNotes();
    const touched = notes.objects.size || notes.lists.size ? touchedBy(notes) : null;
    if (touched) mistake('The model was changed outside edit()', touched);
  }
  // A mistake in the page's code is thrown as an error of its own, once what the page is doing now is done, so the
  // page goes on while the console, and the tests, see it.
  function mistake(message, touched) {
    const ids = LISTS.map((list) => touched[list].join(', ')).filter(Boolean).join('; ') || 'the package';
    setTimeout(() => { throw new Error(message + ': ' + ids); }, 0);
  }
  // Ends the run of changes the newest undo step is, so the next change with its key is a step of its own, and logs
  // the run in its last words. A run that ended with the model as it was before it (a box dragged out and back) is no
  // step at all, and logs nothing.
  function endEdit() {
    const top = S.history[S.history.length - 1];
    if (!top || top.key === null) return;
    top.key = null;
    if (!top.notes.replaced && !touchedBy(top.notes)) S.history.pop();
    else logChange(top.log, top.logKey);
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
  // The save waits for a pause in the changes, and so do the checks (render.js).
  function changed() {
    clearTimeout(S.saveTimer);
    S.saveTimer = setTimeout(C.persist, PAUSE);
    clearTimeout(S.checkTimer);
    S.checkTimer = setTimeout(check, PAUSE);
  }

  function updateUndo() {
    const top = S.history[S.history.length - 1];
    undoButton.disabled = !top || !editable();
    undoButton.title = top ? 'Undo: ' + top.what : 'Nothing to undo';
  }
  // Takes the newest change back: what it wrote goes back to what it was before it.
  function undo() {
    if (!editable()) return;
    endEdit();
    if (!S.history.length) return;
    reportStray();
    const entry = S.history.pop();
    restore(entry.notes);
    modelReplaced();
    logChange('Undid: ' + entry.what);
    changed();
    say('Undid: ' + entry.what + '.');
  }
  // A model from storage takes the place of the one here: this browser's as the page starts, or the shared store's
  // when it was changed elsewhere. It isn't a change made here, so it is neither logged nor saved, and what was done
  // here before it can't be taken back.
  function loadModel(raw) {
    S.model = track(M.normalize(raw), ROOT);
    S.history = [];
    stray = newNotes();
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
