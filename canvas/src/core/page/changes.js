// Changes: what was done, for Claude to read; when to save; and what Undo takes back.
(function (C) {
  'use strict';
  const S = C.state;
  const { M, PAUSE, HISTORY, undoButton, now, say, editable, viewById, render, applyMarks } = C;

  // ---- Changes: what was done, for Claude to read; when to save; and what Undo takes back.

  S.saveTimer = null;
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
  function changed() {
    clearTimeout(S.saveTimer);
    S.saveTimer = setTimeout(C.persist, PAUSE);
  }

  function snapshot() { return JSON.stringify(S.model); }
  // Remembers the model as it was before a change, so Undo can bring it back. before is that model's JSON, taken
  // with snapshot() before the mutation; without it, the model as it is now, so then call it before mutating. A key
  // joins a run of small changes (the keystrokes of one name) into one step: while the top entry has the same key it
  // is kept and only its text changes. A change without the key, or endEdit(), ends the run.
  function commit(what, key, before) {
    const top = S.history[S.history.length - 1];
    if (key && top && top.key === key) { top.what = what; updateUndo(); return; }
    S.history.push({ json: before === undefined ? snapshot() : before, what: what, key: key || null });
    if (S.history.length > HISTORY) S.history.shift();
    updateUndo();
  }
  function endEdit() {
    const top = S.history[S.history.length - 1];
    if (top) top.key = null;
  }
  function updateUndo() {
    const top = S.history[S.history.length - 1];
    undoButton.disabled = !top || !editable();
    undoButton.title = top ? 'Undo: ' + top.what : 'Nothing to undo';
  }
  function undo() {
    if (!editable() || !S.history.length) return;
    const entry = S.history.pop();
    S.model = M.normalize(JSON.parse(entry.json));
    modelReplaced();
    logChange('Undid: ' + entry.what);
    changed();
    say('Undid: ' + entry.what + '.');
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

  Object.assign(C, { logChange, changed, snapshot, commit, endEdit, updateUndo, undo, modelReplaced });
})(window.SysMLCanvas);
