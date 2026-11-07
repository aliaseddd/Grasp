// Where the model and the notes are kept: the page's store on claude.ai, or this browser when the page is opened
// as a file. start(), which boot.js calls, is here.
(function (C) {
  'use strict';
  const S = C.state;
  const {
    M, STATE_KEY, CURRENT, PARTS, WORKING, NOTES, WHERE, hint, status, newViewButton, newViewKind, where, warning,
    downloadButton, importButton, str, saved, now, say, editable, plural, isNote, tidyNote, tidyArchived, render,
    logChange, updateUndo, loadModel, modelReplaced, baseHint, setActive, renderInspector, renderNotes
  } = C;

  // ---- Where the model and the notes are kept. Published on claude.ai: the page's store, which Claude reads too.
  // Opened as a file: this browser, starting from what is saved in the file.

  let reason = '';               // said under the notes in place of the mode's words, when there is a reason (setMode)
  let mayWrite = null;           // whether the platform says this viewer may write to the store: true, false, or null for nothing said

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
      return claude.use('user').then((user) => (user ? user.can('data.write') : null)).then((allowed) => {
        mayWrite = allowed === true || allowed === false ? allowed : null;
        startShared(allowed !== false);
      });
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

  // -- The page's store. The model is kept in the store's layout 2 (the library's stored.js): the head, model/current,
  // says what the model is and names its parts in order, and each part, model/current/parts/<id>, holds a run of the
  // model's records and is named by a hash of what it holds, so a part that didn't change is never written again. A
  // save writes the parts the store hasn't got, then the head, then deletes the parts no head names any more: a reader
  // of the old head still finds its parts, since they go only after the new head is in. model/working holds a whole
  // model handed over from elsewhere (layout 1, as older pages kept the model, or written by Claude): the page takes
  // it, saves it in layout 2, and deletes it. The notes are a collection with one document per note.
  const WRITERS = 3;             // how many parts a save writes at once, each a document of its own
  let head = null;               // the store's head, as last heard
  let headKey = null;            // the model it holds (storedKey)
  let working = null;            // a whole model in model/working based on the file's revision, as last heard, or null
  let workingJSON = null;        // its model, as JSON
  const held = new Set();        // the ids of the parts the store holds, as last heard, with those written here since
  const bodies = new Map();      // part id -> body, for those parts and for the parts of the head shown here
  let shownKey = null;           // the model shown here, as the store names one (storedKey), once it was saved or taken
  let shownParts = new Set();    // the ids of the parts that head names
  // What the page has dealt with, so each is dealt with once, however often the listeners ask again: the head (its
  // key) and the whole model in model/working (its JSON) last taken, known as this page's own, or written over.
  let settledHead = null;
  let settledWorking = null;
  let saving = null;             // the save under way: 'writing' its parts and head, then 'tidying' what it left behind
  let pending = false;           // a change made here isn't in the store yet: from its save until its head is in
  let again = false;             // a save was asked for while one was under way, so another follows it
  let retry = null;              // the timer of a save the store was too busy to take, tried again later
  let busy = 0;                  // how many saves in a row the store was too busy to take
  let unsavedSaid = '';          // what the status said of a model that couldn't be saved, until one is
  let overwritten = null;        // when a model from elsewhere came while a change here waited to be saved: its time
  let heardHead = false;
  let heardParts = false;
  let heardWorking = false;
  let seenParts = false;         // whether the collection of parts has answered at all, as a save waits for it
  const noteQueue = {};
  const dirty = new Map();       // note id -> a counter while a change made here hasn't been written
  const heardModel = () => heardHead && heardParts && heardWorking;

  function startShared(writable) {
    S.mode = writable ? 'shared' : 'read';
    reason = '';
    const slow = setTimeout(() => { if (!heardModel() || !S.heardNotes) say('The shared store can\'t be reached yet, so this may be out of date.'); }, 10000);
    const answered = () => { if (heardModel() && S.heardNotes) { clearTimeout(slow); if (status.textContent.indexOf('shared store') >= 0) say(''); } };
    const stopped = () => setMode('read', 'The shared store stopped answering. Reload the page to see the latest.');
    // Each listener notes what the store holds, then asks whether a model from elsewhere is there to take. One that
    // comes before the store has answered about the head, the parts and model/working is the model as the page found
    // it, and taken without a word.
    S.db.doc(CURRENT).onSnapshot((snap) => {
      const before = heardModel();
      if (!snap.metadata.fromCache) heardHead = true;
      head = snap.exists ? snap.data() || null : null;
      headKey = head ? M.storedKey(head) : null;
      if (head && typeof head.layout === 'number' && head.layout > M.STORE.layout) {
        // A newer version of the canvas keeps the model in a layout this one can't read, and mustn't write over.
        setMode('read', 'The model in the shared store was saved by a newer version of the canvas, so this page can\'t show or change it. Reload the page to get the newer version.');
        answered();
        return;
      }
      consider(before);
      repair();
      answered();
    }, stopped);
    S.db.collection(PARTS).onSnapshot((snap) => {
      const before = heardModel();
      if (!snap.metadata.fromCache) heardParts = true;
      snap.docChanges().forEach((change) => {
        const id = change.doc.id;
        if (change.type !== 'removed') {
          held.add(id);
          bodies.set(id, change.doc.data());
        } else if (!snap.metadata.fromCache) {
          // A cached view may lack what the store holds; only the store's own answer says a part is gone.
          held.delete(id);
          if (!shownParts.has(id)) bodies.delete(id);
        }
      });
      const first = !seenParts;
      seenParts = true;
      consider(before);
      repair();
      if (first && pending && !saving) persist();
      answered();
    }, stopped);
    S.db.doc(WORKING).onSnapshot((snap) => {
      const before = heardModel();
      if (!snap.metadata.fromCache) heardWorking = true;
      const data = snap.exists ? snap.data() : null;
      // A model of another revision of the file is left alone, as it was before layout 2.
      working = data && data.baseRevision === saved.model.revision && data.model && typeof data.model === 'object' ? data : null;
      workingJSON = working ? JSON.stringify(working.model) : null;
      consider(before);
      answered();
    }, stopped);
    S.db.collection(NOTES).onSnapshot((snap) => {
      const first = !S.heardNotes;
      if (!snap.metadata.fromCache && !S.heardNotes) { S.heardNotes = true; answered(); }
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

  // While a change made here waits for its save (or a drag is under way, or the save is writing), a model from
  // elsewhere isn't taken: this page's write follows and wins, and persist says so, here and in the change log, which
  // Claude reads.
  const waiting = () => !!(S.drag || S.saveTimer || pending || retry);

  // Takes what the store holds when it is a model from elsewhere: a whole model handed over in model/working first, as
  // new input, else the head's, once every part it names is there. before: whether the store had answered about the
  // model before what was heard now; until it has, a model taken is the one the page found, and taken without a word.
  function consider(before) {
    if (working) { takeWorking(before); return; }
    if (!head || head.layout !== M.STORE.layout || head.baseRevision !== saved.model.revision || !Array.isArray(head.parts)) return;
    const key = headKey;
    if (key === shownKey) { settledHead = key; return; }     // the model shown here: its own write, heard back
    if (key === settledHead || !head.parts.every((id) => bodies.has(id))) return;   // dealt with already, or not all there yet
    settledHead = key;
    if (waiting()) { overwritten = str(head.updated) || now(); return; }
    let model;
    try {
      model = M.assembleModel(head, (id) => bodies.get(id));
    } catch (error) {
      say('The model in the shared store couldn\'t be read, so this is the model as it was: ' + error.message);
      return;
    }
    show(key, head.parts);
    // A model from elsewhere is a new starting point: what was done here before it can't be taken back.
    loadModel(model);
    if (Array.isArray(head.changes)) S.changes = head.changes.slice(-200);
    modelReplaced();
    if (before) say('The model was updated elsewhere, so the undo history starts afresh.');
  }
  function takeWorking(before) {
    if (workingJSON === settledWorking) return;  // taken already, or written over: a save in layout 2 deletes it
    settledWorking = workingJSON;
    if (waiting()) { overwritten = str(working.updated) || now(); return; }
    loadModel(working.model);
    if (Array.isArray(working.changes)) S.changes = working.changes.slice(-200);
    modelReplaced();
    if (before) say('The model was updated elsewhere, so the undo history starts afresh.');
    persist();                                   // in layout 2; once its head is in, model/working is deleted
  }
  // The head shown here now: its key, and the parts it names, whose bodies the page keeps while it shows them.
  function show(key, ids) {
    shownKey = key;
    shownParts = new Set(ids);
    Array.from(bodies.keys()).forEach((id) => { if (!held.has(id) && !shownParts.has(id)) bodies.delete(id); });
  }

  // A save stops once the page can no longer write (it turned read-only while the save was under way): stillShared()
  // goes on while it can, and rejects with STOPPED once it can't.
  const STOPPED = {};
  const stillShared = () => (S.mode === 'shared' ? Promise.resolve() : Promise.reject(STOPPED));

  // Saves the model: the parts the store hasn't got, a few at a time and each once, then the head, then what no head
  // names any more. One save at a time; one asked for meanwhile follows it. Nothing is sent that the store would
  // refuse for its size: a record too large for a part, or a head too large for a document, is said instead, and the
  // model saves once it is shortened.
  function persist() {
    S.saveTimer = null;
    if (S.mode === 'local') { saveLocal(); return; }
    if (S.mode !== 'shared') return;
    if (saving) { again = true; return; }
    clearTimeout(retry);
    retry = null;
    again = false;
    pending = true;
    if (!seenParts) return;                      // the collection of parts answers first, so what it holds isn't written again
    if (overwritten) {
      logChange('Wrote this page\'s model over a change made elsewhere at ' + overwritten + ', which came while a change here waited to be saved');
      say('The model was changed elsewhere while you were editing; this page\'s version was written over it.');
      overwritten = null;
    }
    let split;
    let next;
    try {
      split = M.splitModel(S.model);
      next = M.storeHead(split, { baseRevision: saved.model.revision, changes: S.changes, updated: now() });
    } catch (error) {
      if (!error || !error.record) throw error;
      cantSave(error.record);
      return;
    }
    const absorbed = workingJSON;                // the whole model in model/working this save takes in, or writes over
    saving = 'writing';
    show(M.storedKey(next), next.parts);         // so its head, heard back, is known as this page's own
    writeModel(split, next).then(() => {
      saving = 'tidying';
      pending = false;
      busy = 0;
      if (unsavedSaid && status.textContent === unsavedSaid) say('The model is saved again.');
      unsavedSaid = '';
      return tidy(next, absorbed);
    }).catch((error) => {
      if (error === STOPPED) return;
      if (error && error.code === 'resource_exhausted' && saving === 'writing') {
        busy += 1;
        const delay = Math.round(Math.min(30000, 2000 * Math.pow(2, busy - 1)) * (0.75 + Math.random() / 2));
        retry = setTimeout(() => { retry = null; persist(); }, delay);
        refused(error, 'The change to the model isn\'t saved yet.', delay);
      } else if (saving === 'writing') {
        refused(error, 'The change to the model wasn\'t saved.');
      } else {
        refused(error, 'An old part of the model wasn\'t deleted from the shared store.');
      }
    }).then(() => {
      saving = null;
      if (S.mode !== 'shared') return;
      if (again || (overwritten && !retry)) persist();
      else { consider(true); repair(); }
    });
  }
  // Writes the parts the store hasn't got, then the head, unless the store holds that head already.
  function writeModel(split, next) {
    const missing = [];
    const seen = new Set();
    split.parts.forEach((part) => { if (!held.has(part.id) && !seen.has(part.id)) { seen.add(part.id); missing.push(part); } });
    return inTurn(missing, WRITERS, (part) => stillShared().then(() => {
      const body = JSON.parse(part.text);
      return attempt(() => S.db.doc(PARTS + '/' + part.id).set(body)).then(() => { held.add(part.id); bodies.set(part.id, body); });
    })).then(stillShared).then(() => {
      if (sameHead(head, next)) return null;
      return attempt(() => S.db.doc(CURRENT).set(next));
    });
  }
  // Whether two heads are the same but for when they were written.
  function sameHead(a, b) {
    const bare = (h) => JSON.stringify(Object.assign({}, h, { updated: null }));
    return !!a && !!b && bare(a) === bare(b);
  }
  // Once a new head is in, what no head names any more: the parts neither it nor the head heard last names (another
  // page may have written one since), one delete at a time; and the whole model in model/working this save took in or
  // wrote over, unless another came since.
  function tidy(next, absorbed) {
    const keep = new Set(next.parts);
    const doomed = Array.from(held).filter((id) => !keep.has(id));
    return inTurn(doomed, 1, (id) => {
      if (S.mode !== 'shared' || (head && Array.isArray(head.parts) && head.parts.indexOf(id) >= 0)) return Promise.resolve();
      return attempt(() => S.db.doc(PARTS + '/' + id).delete()).then(() => { held.delete(id); if (!shownParts.has(id)) bodies.delete(id); });
    }).then(() => {
      if (S.mode !== 'shared' || !absorbed || workingJSON !== absorbed) return null;
      return attempt(() => S.db.doc(WORKING).delete());
    });
  }
  // A part the store's head names that has gone from the store, deleted by another page saving at the same time, is
  // written again by a page that shows that head, so the head doesn't name a part the store hasn't got for long.
  function repair() {
    if (saving || S.mode !== 'shared' || !head || !Array.isArray(head.parts) || headKey !== shownKey) return;
    const lost = head.parts.filter((id, i) => !held.has(id) && bodies.has(id) && head.parts.indexOf(id) === i);
    if (!lost.length) return;
    saving = 'writing';
    inTurn(lost, WRITERS, (id) => stillShared().then(() => attempt(() => S.db.doc(PARTS + '/' + id).set(bodies.get(id)))).then(() => { held.add(id); }))
      .catch((error) => { if (error !== STOPPED) refused(error, 'A part of the model the shared store lost wasn\'t written again.'); })
      .then(() => { saving = null; if (again && S.mode === 'shared') persist(); });
  }
  // Runs job(item) for each item, at most width at a time, and resolves once every job started has settled: rejects
  // with the first refusal, after which no more are started.
  function inTurn(items, width, job) {
    let next = 0;
    let failed = null;
    const lane = () => {
      if (failed || next >= items.length) return Promise.resolve();
      return job(items[next++]).then(lane, (error) => { if (!failed) failed = { error: error }; });
    };
    const lanes = [];
    for (let i = 0; i < width; i++) lanes.push(lane());
    return Promise.all(lanes).then(() => { if (failed) throw failed.error; });
  }
  // Says why the model can't be saved, naming what is too large and what to shorten. Nothing is sent: the change stays
  // here, waiting to be saved, and saves once it fits.
  function cantSave(record) {
    const kib = (bytes) => (bytes / 1024).toFixed(1).replace(/\.0$/, '');
    const field = record.field && M.FIELDS[record.field] ? M.FIELDS[record.field].label : record.field;
    let what;
    if (record.list === 'head') what = 'the model\'s ' + (record.field || 'head');
    else if (record.list === 'layout') what = 'the place of ' + (M.labelFor(S.model, record.id) || record.id) + ' in ' + (M.labelFor(S.model, record.view) || 'view ' + record.view);
    else what = M.labelFor(S.model, record.id) || record.list + ' ' + record.id;
    const fix = record.list === 'head' ? 'Shorten it' : field ? (record.why === 'depth' ? 'Simplify its ' : 'Shorten its ') + field : 'Shorten it';
    const message = 'Changes aren\'t saved: ' + what + (record.why === 'depth'
      ? ' nests ' + record.depth + ' levels deep, more than the shared store keeps (' + record.limit + ').'
      : ' is ' + kib(record.bytes) + ' KiB, more than the shared store keeps in one ' + (record.list === 'head' ? 'document' : 'piece') + ' (' + kib(record.limit) + ' KiB).') +
      ' ' + fix + ', and the model saves again.';
    unsavedSaid = message;
    say(message);
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
  // One call to the store, tried again when the store says to: once after a short random pause when it is
  // unavailable, and twice, after longer pauses, when it is busy (resource_exhausted), as it is when calls come too
  // fast. Anything else, or the same again, is the caller's to say.
  function attempt(fn) {
    let unavailable = 0;
    let crowded = 0;
    const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const run = () => Promise.resolve().then(fn).catch((error) => {
      const code = error && error.code;
      if (code === 'unavailable' && unavailable < 1) { unavailable += 1; return pause(400 + Math.random() * 800).then(run); }
      if (code === 'resource_exhausted' && crowded < 2) { crowded += 1; return pause(1000 * crowded * (1 + Math.random())).then(run); }
      throw error;
    });
    return run();
  }
  // What the page says when the store didn't take a write: what happened and what to do, by the store's code, with the
  // store's own words where they help. The page turns read-only only when the store says this viewer may not write:
  // revoked or not_granted, or a well-formed write refused with invalid_argument (or transform_error, which is the
  // same) while the platform hasn't said whether this viewer may write (can('data.write') null), as db.d.ts advises.
  // Anything else leaves the page as it is. retryIn, when the page tries the write again by itself: how soon, in ms.
  function refused(error, fallback, retryIn) {
    const code = error && error.code;
    const told = error && typeof error.message === 'string' && error.message.trim() ? ' (' + error.message.trim().replace(/[.\s]+$/, '') + ')' : '';
    const invalid = code === 'invalid_argument' || code === 'transform_error';
    if (code === 'revoked' || code === 'not_granted' || (invalid && mayWrite === null)) {
      setMode('read', 'The shared store didn\'t take this viewer\'s change, so you can look at this model here but not change it.');
    } else if (code === 'quota_exceeded') {
      say(fallback + ' The shared store is full' + told + '. Delete some notes or archived notes, then try again.');
    } else if (code === 'resource_exhausted') {
      say(fallback + ' The shared store is busy' + told + (retryIn ? '; the page tries again in ' + Math.max(1, Math.round(retryIn / 1000)) + ' s.' : '. Wait a minute, then try again.'));
    } else if (invalid) {
      say(fallback + ' The shared store refused it' + told + '.');
    } else if (code === 'capability_disabled' || code === 'capability_removed') {
      say(fallback + ' The shared store can\'t be used in this view. Reload the page to try again.');
    } else {
      say(fallback + ' Check your connection, then try again.');
    }
  }

  Object.assign(C, {
    start, setMode, saveLocal, dirty, persist, noteBody, stageNote, enqueue, writeShared, deleteShared, attempt,
    refused
  });
})(window.SysMLCanvas);
