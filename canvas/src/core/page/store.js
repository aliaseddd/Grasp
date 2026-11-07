// Where the model and the notes are kept: the page's store on claude.ai, or this browser when the page is opened
// as a file. start(), which boot.js calls, is here.
(function (C) {
  'use strict';
  const S = C.state;
  const {
    M, STATE_KEY, WORKING, NOTES, WHERE, hint, status, newViewButton, newViewKind, where, warning, downloadButton,
    importButton, str, saved, now, say, editable, plural, isNote, tidyNote, tidyArchived, render, logChange,
    updateUndo, loadModel, modelReplaced, baseHint, setActive, renderInspector, renderNotes
  } = C;

  // ---- Where the model and the notes are kept. Published on claude.ai: the page's store, which Claude reads too.
  // Opened as a file: this browser, starting from what is saved in the file.

  let reason = '';               // said under the notes in place of the mode's words, when there is a reason (setMode)

  function start() {
    Object.keys(M.VIEW_KINDS).forEach((k) => {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = M.VIEW_KINDS[k].name;
      newViewKind.appendChild(o);
    });
    const claude = window.claude;
    if (!claude || typeof claude.use !== 'function') { startLocal(); return; }
    chrome();
    render();
    renderNotes();
    claude.use('db').then((found) => {
      if (!found) {
        setMode('read', 'This view can\'t reach the shared store, so this is the model as it was saved in the page.');
        return null;
      }
      S.db = found;
      return claude.use('user').then((user) => (user ? user.can('data.write') : null)).then((allowed) => startShared(allowed !== false));
    }).catch(() => {
      if (S.mode === 'loading') setMode('read', 'The shared store couldn\'t be reached. Reload the page to try again.');
    });
  }
  function setMode(next, why) {
    S.mode = next;
    reason = why || '';
    chrome();
    renderInspector();
    renderNotes();
  }
  function chrome() {
    const write = editable();
    where.textContent = reason || WHERE[S.mode];
    downloadButton.hidden = S.mode !== 'local';
    importButton.hidden = !write;
    newViewButton.hidden = !write;
    newViewKind.hidden = !write;
    S.paletteKind = null;
    setActive(S.active);
    updateUndo();
    hint.textContent = baseHint();
  }

  // -- This browser.
  function storageKey() { return STATE_KEY + (saved.model.revision || 'unsaved'); }
  function saveLocal() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify({ model: S.model, notes: S.notes, archive: S.archive, changes: S.changes }));
      warning.hidden = true;
    } catch (error) {
      warning.hidden = false;
    }
  }
  function startLocal() {
    S.mode = 'local';
    try {
      const data = JSON.parse(localStorage.getItem(storageKey()) || 'null');
      if (data && data.model) {
        loadModel(data.model);
        S.active = S.model.views[0].id;
        S.notes = (Array.isArray(data.notes) ? data.notes : []).filter(isNote).map(tidyNote);
        S.archive = (Array.isArray(data.archive) ? data.archive : []).filter(isNote).map(tidyArchived);
        S.changes = Array.isArray(data.changes) ? data.changes.slice(-200) : [];
      }
    } catch (error) { /* start from the file */ }
    chrome();
    render();
    renderNotes();
  }

  // -- The page's store: one document with the working model, and a collection with one document per note.
  let lastWritten = null;        // the model as last written or read, to tell our own writes coming back
  let overwritten = null;        // when a model from elsewhere came while a change here waited to be saved: its time
  let modelQueue = Promise.resolve();
  const noteQueue = {};
  const dirty = new Map();       // note id -> a counter while a change made here hasn't been written
  let heardModel = false;

  function startShared(writable) {
    S.mode = writable ? 'shared' : 'read';
    reason = '';
    const slow = setTimeout(() => { if (!heardModel || !S.heardNotes) say('The shared store can\'t be reached yet, so this may be out of date.'); }, 10000);
    const heard = () => { if (heardModel && S.heardNotes) { clearTimeout(slow); if (status.textContent.indexOf('shared store') >= 0) say(''); } };
    S.db.doc(WORKING).onSnapshot((snap) => {
      const first = !heardModel;
      if (!snap.metadata.fromCache && !heardModel) { heardModel = true; heard(); }
      const data = snap.exists ? snap.data() : null;
      if (!data || data.baseRevision !== saved.model.revision || !data.model) return;
      const json = JSON.stringify(data.model);
      if (json === lastWritten) return;
      // While a change made here waits for its save (or a drag is under way) a model from elsewhere isn't taken: this
      // page's write follows and wins, and persist says so, here and in the change log, which Claude reads.
      if (S.drag || S.saveTimer) { overwritten = str(data.updated) || now(); return; }
      lastWritten = json;
      // A model from elsewhere is a new starting point: what was done here before it can't be taken back.
      loadModel(data.model);
      if (Array.isArray(data.changes)) S.changes = data.changes.slice(-200);
      modelReplaced();
      if (!first && !snap.metadata.hasPendingWrites) say('The model was updated elsewhere, so the undo history starts afresh.');
    }, () => setMode('read', 'The shared store stopped answering. Reload the page to see the latest.'));
    S.db.collection(NOTES).onSnapshot((snap) => {
      const first = !S.heardNotes;
      if (!snap.metadata.fromCache && !S.heardNotes) { S.heardNotes = true; heard(); }
      const remote = new Map();
      snap.docs.forEach((doc) => {
        const body = doc.data();
        if (!body) return;
        const n = Object.assign({}, body, { id: doc.id });
        if (isNote(n)) remote.set(doc.id, tidyNote(n));
      });
      // A page published somewhere new has an empty store: the notes saved in the file go into it, once.
      if (first && S.heardNotes && remote.size === 0 && writable && saved.notes.length) {
        saved.notes.forEach((n) => { const copy = tidyNote(n); stageNote(copy.id); writeShared(copy, null); remote.set(copy.id, copy); });
        say('Loaded ' + plural(saved.notes.length, 'note') + ' saved with the page into the shared store.');
      }
      const next = [];
      S.notes.forEach((n) => { if (dirty.has(n.id)) { next.push(n); remote.delete(n.id); } });
      remote.forEach((n) => { if (!C.leavingNotes.has(n.id)) next.push(n); }); // not one on its way into the archive
      S.notes = next;
      renderNotes();
    }, () => setMode('read', 'The notes stopped updating. Reload the page to see the latest.'));
    C.listenArchive(writable);
    chrome();
    render();
    renderInspector();
    renderNotes();
  }
  function persist() {
    S.saveTimer = null;
    if (S.mode === 'local') { saveLocal(); return; }
    if (S.mode !== 'shared') return;
    if (overwritten) {
      logChange('Wrote this page\'s model over a change made elsewhere at ' + overwritten + ', which came while a change here waited to be saved');
      say('The model was changed elsewhere while you were editing; this page\'s version was written over it.');
      overwritten = null;
    }
    const body = { baseRevision: saved.model.revision, model: JSON.parse(JSON.stringify(S.model)), changes: S.changes.slice(-200), updated: now() };
    lastWritten = JSON.stringify(body.model);
    modelQueue = modelQueue.then(() => attempt(() => S.db.doc(WORKING).set(body))).catch((error) => refused(error, 'The change to the model wasn\'t saved.'));
  }
  // What the store keeps of a note; a free note (target null) carries its place, x and y, too.
  function noteBody(n) {
    const body = { no: n.no, target: n.target, targetLabel: n.targetLabel, text: n.text, by: n.by, created: n.created, updated: n.updated, response: n.response, resolved: n.resolved };
    if (n.target === null) { body.x = n.x; body.y = n.y; }
    return body;
  }
  function stageNote(id) { dirty.set(id, (dirty.get(id) || 0) + 1); }
  function enqueue(id, job) {
    const next = (noteQueue[id] || Promise.resolve()).then(job, job);
    noteQueue[id] = next;
    const done = () => { if (noteQueue[id] === next) delete noteQueue[id]; };
    next.then(done, done);
  }
  function writeShared(n, fieldsChanged) {
    if (!S.db) return;
    const seq = dirty.get(n.id);
    const body = noteBody(n);
    const ref = S.db.collection(NOTES).doc(n.id);
    const picked = {};
    (fieldsChanged || []).forEach((k) => { picked[k] = body[k]; });
    enqueue(n.id, () => attempt(() => (fieldsChanged ? ref.update(picked) : ref.set(body)))
      .catch((error) => {
        if (fieldsChanged && error && error.code === 'invalid_argument') return attempt(() => ref.set(body));
        throw error;
      })
      .then(() => { if (dirty.get(n.id) === seq) dirty.delete(n.id); },
        (error) => { dirty.delete(n.id); refused(error, 'A change to the notes wasn\'t saved.'); }));
  }
  function deleteShared(id) {
    if (!S.db) return;
    dirty.delete(id);
    enqueue(id, () => attempt(() => S.db.collection(NOTES).doc(id).delete()).catch((error) => refused(error, 'The note wasn\'t deleted in the shared store.')));
  }
  function attempt(fn) {
    return Promise.resolve().then(fn).catch((error) => {
      if (!error || error.code !== 'unavailable') throw error;
      return new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 800)).then(fn);
    });
  }
  function refused(error, fallback) {
    const code = error && error.code;
    if (code === 'invalid_argument' || code === 'revoked' || code === 'not_granted') setMode('read', 'You can look at this model here but not change it.');
    else if (code === 'quota_exceeded') say('The shared store is full. Delete some notes, then try again.');
    else say(fallback + ' Check your connection, then try again.');
  }

  Object.assign(C, {
    start, setMode, saveLocal, dirty, persist, noteBody, stageNote, enqueue, writeShared, deleteShared, attempt,
    refused
  });
})(window.SysMLCanvas);
