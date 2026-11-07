// Annotations on the page.
(function (C) {
  'use strict';
  const S = C.state;
  const {
    M, NOTES, TOOL_TITLE, TOOL_HINT, TOOLS, $, canvas, svg, saved, now, say, editable, f, newId, plural, isNote,
    byNumber, nextNumber, noteById, node, COMPARTMENTS, tidyArchived, pinTransform, renderPins, toDrawing, edit,
    endEdit, setTool, select, renderInspector, selectedElement, noteTimers,
    renderNotes, dateOf, focusNote, addNote, noteChanged, setMode, saveLocal, dirty, noteBody, stageNote, enqueue,
    attempt, refused, hitOf
  } = C;

  // ---- Annotations: the Note tool, notes that float free on the plane, pins that can be dragged, the archive of
  // resolved notes, and the code links an element carries.

  const ARCHIVE = 'archive';                   // the shared store's collection of archived notes
  const CODE_LANGUAGES = ['typescript', 'javascript', 'json', 'css', 'html', 'sysml', 'kerml', 'markdown', 'shell', 'other'];
  S.archive = saved.archive.slice();           // the archived notes, kept beside notes
  let archiveOpen = false;                     // whether the panel shows the archive's list
  let heardArchive = false;                    // whether the shared store has answered about the archive
  const dirtyArchive = new Map();              // archived note id -> a counter while a change made here hasn't been written
  const leavingNotes = new Set();              // ids of notes on their way into the archive, until their notes document is gone
  const leavingArchive = new Set();            // ids of notes on their way back out of it, until their archive document is gone
  const archiveToggle = $('archive-toggle');
  const archiveList = $('archive-list');
  const codeSection = $('code');
  const codeList = $('code-list');
  const codeCount = $('code-count');
  const codeEmpty = $('code-empty');
  const addCodeButton = $('add-code');

  Object.assign(TOOL_TITLE, { Note: 'A note: on an element or a line, or anywhere on the plane' });
  Object.assign(TOOL_HINT, { Note: 'Click an element or a line to note it, or the plane to leave a note there.' });
  // The Note tool: a click on an element or a line notes it, as Add note does for the selection; a click anywhere else
  // leaves a free note at that point. One note, then the tool is put down.
  TOOLS.Note = function (hit, p) {
    if (hit.type === 'el' || hit.type === 'rel') { select({ type: hit.type, id: hit.id }, hit.view); addNote(); }
    else addFreeNote(p);
    setTool(null);
  };

  // -- Free notes: on nothing, at a point on the plane, where the pin sits.
  function addFreeNote(p) {
    if (!editable()) return;
    const stamp = now();
    const n = {
      id: newId('n'), no: nextNumber(), target: null, x: Math.round(p.x), y: Math.round(p.y), targetLabel: 'the plane', text: '', by: 'user',
      created: stamp, updated: stamp, response: '', resolved: false
    };
    S.notes.push(n);
    renderNotes();
    noteChanged(n, null);
    focusNote(n.id);
    say('Added note ' + n.no + ' on the plane. Drag its pin onto a box, a port or a line to put it on that.');
  }
  // A free note's pin, drawn once at the note's own point (drawPins draws the other pins in every view that shows
  // their target): hollow, since it sits on nothing.
  function freePin(n) {
    const g = node('g', { 'data-note': n.id, 'data-x': f(n.x), 'data-y': f(n.y), transform: pinTransform(n.x, n.y) }, 'pin is-free' + (n.resolved ? ' is-resolved' : ''));
    const title = node('title');
    title.textContent = 'Note ' + n.no + ' on the plane. Click to read it; drag to move it, or onto something to put it on that.';
    const number = node('text');
    number.textContent = String(n.no);
    g.appendChild(title);
    g.appendChild(node('circle', { r: 11 }));
    g.appendChild(number);
    return g;
  }

  // -- Dragging a pin, free or not: the pin follows the pointer and what is under the pointer is marked; on the drop
  // the note goes onto the element or line there, or free onto the plane where the pin was let go. Pins are not undone.
  function pinDragStart(hit, p) {
    const n = noteById(hit.id);
    const g = n ? svg.querySelector('.pin[data-note="' + n.id + '"]' + (hit.view ? '[data-view="' + hit.view + '"]' : '')) : null;
    if (!g) return null;
    return { kind: 'pin', id: n.id, g: g, start: p, at: { x: +g.getAttribute('data-x'), y: +g.getAttribute('data-y') }, moved: false, over: null };
  }
  // What a dragged pin is over: the hit of the element or line under the pointer (the pins and badges let it through),
  // null for the plane, a frame or a control, undefined when the pointer is off the drawing.
  function underPin(event) {
    const target = document.elementFromPoint(event.clientX, event.clientY);
    if (!target || !canvas.contains(target)) return undefined;
    const hit = hitOf(target, { x: event.clientX, y: event.clientY });
    return hit.type === 'el' || hit.type === 'rel' ? hit : null;
  }
  function movePin(d, event) {
    const p = toDrawing(event.clientX, event.clientY);
    d.g.classList.add('is-dragging');
    svg.classList.add('is-pinning');
    canvas.classList.add('is-pinning');
    d.g.setAttribute('transform', pinTransform(d.at.x + p.x - d.start.x, d.at.y + p.y - d.start.y));
    const hit = underPin(event);
    const g = hit ? hit.g : null;
    if (d.over && d.over !== g) d.over.classList.remove('is-drop');
    if (g) g.classList.add('is-drop');
    d.over = g;
  }
  function dropPin(d, event) {
    const hit = underPin(event); // while the pins still let the pointer through to what is under it
    svg.classList.remove('is-pinning');
    canvas.classList.remove('is-pinning');
    if (d.over) d.over.classList.remove('is-drop');
    const n = noteById(d.id);
    // The note is gone, or the pin was let go off the drawing: it goes back where it was.
    if (!n || hit === undefined) { renderPins(); return; }
    const p = toDrawing(event.clientX, event.clientY);
    let what = null;
    if (hit) {
      const el = hit.type === 'el' ? S.layout.ids.get(hit.id) : null;
      if (el && !M.hasName(el.kind)) {
        say(M.an(M.KINDS[el.kind].label, true) + ' can\'t carry a note. Drop the pin on the element it belongs to instead.');
      } else if (hit.id !== n.target) {
        n.target = hit.id;
        n.targetLabel = M.labelFor(S.model, hit.id);
        delete n.x;
        delete n.y;
        what = 'Moved note ' + n.no + ' onto ' + n.targetLabel + '.';
      }
    } else {
      const at = { x: Math.round(d.at.x + p.x - d.start.x), y: Math.round(d.at.y + p.y - d.start.y) };
      if (n.target !== null || n.x !== at.x || n.y !== at.y) {
        what = n.target === null ? 'Moved note ' + n.no + ' on the plane.'
          : 'Moved note ' + n.no + ' off ' + (M.labelFor(S.model, n.target) || n.targetLabel) + ' onto the plane. Drop its pin on something to put it on that.';
        n.target = null;
        n.x = at.x;
        n.y = at.y;
        n.targetLabel = 'the plane';
      }
    }
    // A drop that changes nothing says nothing; the pin goes back to where the note is.
    if (!what) { renderPins(); return; }
    n.updated = now();
    noteChanged(n, null);
    renderNotes();
    say(what);
  }

  // -- The archive: resolved notes put away. An archived note keeps its number and its answer (the resolution), draws no
  // pin, and is listed under the notes, read-only, until it is restored.
  function archivedById(id) { return S.archive.find((n) => n.id === id) || null; }
  function archiveNote(id) {
    const n = noteById(id);
    if (!n || !editable()) return;
    if (!n.resolved) { say('Note ' + n.no + ' is still open. It can be archived once it is resolved.'); return; }
    const a = Object.assign({}, n, { archived: now(), resolution: n.response });
    S.notes.splice(S.notes.indexOf(n), 1);
    S.archive.push(a);
    clearTimeout(noteTimers[id]);
    delete noteTimers[id];
    if (S.mode === 'local') saveLocal();
    else if (S.mode === 'shared') moveToArchive(a);
    renderNotes();
    say('Archived note ' + n.no + '. It keeps its number and its answer; Restore brings it back.');
  }
  function restoreNote(id) {
    const a = archivedById(id);
    if (!a || !editable()) return;
    const n = Object.assign({}, a);
    delete n.archived;
    delete n.resolution;
    S.archive.splice(S.archive.indexOf(a), 1);
    S.notes.push(n);
    if (S.mode === 'local') saveLocal();
    else if (S.mode === 'shared') moveToNotes(n);
    renderNotes();
    say('Restored note ' + n.no + ' to the notes, on ' + (n.target === null ? 'the plane' : (M.labelFor(S.model, n.target) || n.targetLabel)) + '.');
  }
  // The Archive button a resolved note gets in the notes list.
  function archiveButton(n) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'archive';
    b.textContent = 'Archive';
    b.title = 'Put this resolved note away. It keeps its number and its answer, and Restore brings it back.';
    b.setAttribute('aria-label', 'Archive note ' + n.no);
    b.addEventListener('click', () => archiveNote(n.id));
    return b;
  }
  function renderArchive() {
    const sorted = S.archive.slice().sort(byNumber);
    archiveToggle.hidden = !sorted.length;
    archiveToggle.textContent = 'Archive · ' + sorted.length;
    archiveToggle.setAttribute('aria-expanded', archiveOpen && sorted.length ? 'true' : 'false');
    archiveList.hidden = !archiveOpen || !sorted.length;
    while (archiveList.firstChild) archiveList.removeChild(archiveList.firstChild);
    sorted.forEach((a) => archiveList.appendChild(archivedItem(a)));
  }
  function archivedItem(a) {
    const li = document.createElement('li');
    li.className = 'archived';
    li.setAttribute('data-note', a.id);
    const head = document.createElement('div');
    head.className = 'note-head';
    const number = document.createElement('span');
    number.className = 'number';
    number.textContent = String(a.no);
    number.setAttribute('aria-label', 'Archived note ' + a.no);
    const on = document.createElement('span');
    on.className = 'on';
    on.appendChild(document.createTextNode('on '));
    const b = document.createElement('b');
    b.textContent = a.target === null ? 'the plane' : (M.labelFor(S.model, a.target) || a.targetLabel || 'something no longer in the model');
    on.appendChild(b);
    head.appendChild(number);
    head.appendChild(on);
    if (editable()) {
      const restore = document.createElement('button');
      restore.type = 'button';
      restore.className = 'restore';
      restore.textContent = 'Restore';
      restore.setAttribute('aria-label', 'Restore note ' + a.no + ' to the notes');
      restore.addEventListener('click', () => restoreNote(a.id));
      head.appendChild(restore);
    }
    li.appendChild(head);
    const text = document.createElement('p');
    text.className = 'archived-text';
    text.textContent = a.text;
    li.appendChild(text);
    if (a.resolution) {
      const resolution = document.createElement('p');
      resolution.className = 'response';
      const who = document.createElement('b');
      who.textContent = 'Resolved: ';
      resolution.appendChild(who);
      resolution.appendChild(document.createTextNode(a.resolution));
      li.appendChild(resolution);
    }
    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = 'Archived ' + dateOf(a.archived) + ' · added ' + dateOf(a.created);
    li.appendChild(meta);
    return li;
  }
  archiveToggle.addEventListener('click', () => {
    archiveOpen = !archiveOpen;
    renderArchive();
    say(archiveOpen ? 'Showing ' + plural(S.archive.length, 'archived note') + '.' : 'Hid the archive.');
  });

  // -- The archive in the shared store: the collection archive, one document per note, listened to like the notes.
  function archivedBody(a) { return Object.assign(noteBody(a), { archived: a.archived, resolution: a.resolution }); }
  function stageArchived(id) { dirtyArchive.set(id, (dirtyArchive.get(id) || 0) + 1); }
  function writeArchived(a) {
    if (!S.db) return;
    const seq = dirtyArchive.get(a.id);
    enqueue(a.id, () => attempt(() => S.db.collection(ARCHIVE).doc(a.id).set(archivedBody(a)))
      .then(() => { if (dirtyArchive.get(a.id) === seq) dirtyArchive.delete(a.id); },
        (error) => { dirtyArchive.delete(a.id); refused(error, 'A change to the archive wasn\'t saved.'); }));
  }
  function deleteArchived(id) {
    if (!S.db) return;
    dirtyArchive.delete(id);
    enqueue(id, () => attempt(() => S.db.collection(ARCHIVE).doc(id).delete()).catch((error) => refused(error, 'The archived note wasn\'t deleted in the shared store.')));
  }
  // Archiving writes the archive document first, then deletes the note's document, so a failure between the two loses
  // nothing; until the note's document is gone, the notes listener leaves the id out (leavingNotes).
  function moveToArchive(a) {
    if (!S.db) return;
    dirty.delete(a.id);
    stageArchived(a.id);
    leavingNotes.add(a.id);
    const seq = dirtyArchive.get(a.id);
    const done = () => { leavingNotes.delete(a.id); if (dirtyArchive.get(a.id) === seq) dirtyArchive.delete(a.id); };
    enqueue(a.id, () => attempt(() => S.db.collection(ARCHIVE).doc(a.id).set(archivedBody(a)))
      .then(() => attempt(() => S.db.collection(NOTES).doc(a.id).delete()))
      .then(done, (error) => { done(); refused(error, 'The note wasn\'t archived in the shared store.'); }));
  }
  // Restoring is the reverse: the note's document first, then the archive document deleted.
  function moveToNotes(n) {
    if (!S.db) return;
    dirtyArchive.delete(n.id);
    stageNote(n.id);
    leavingArchive.add(n.id);
    const seq = dirty.get(n.id);
    const done = () => { leavingArchive.delete(n.id); if (dirty.get(n.id) === seq) dirty.delete(n.id); };
    enqueue(n.id, () => attempt(() => S.db.collection(NOTES).doc(n.id).set(noteBody(n)))
      .then(() => attempt(() => S.db.collection(ARCHIVE).doc(n.id).delete()))
      .then(done, (error) => { done(); refused(error, 'The note wasn\'t restored in the shared store.'); }));
  }
  // What is dirty here is kept, the rest follows the store, and a note on its way back to the notes is left out until
  // its archive document is gone. A page published somewhere new has an empty store: the archived notes saved in the
  // file go into it, once, as the notes do.
  function listenArchive(writable) {
    S.db.collection(ARCHIVE).onSnapshot((snap) => {
      const first = !heardArchive;
      if (!snap.metadata.fromCache && !heardArchive) heardArchive = true;
      const remote = new Map();
      snap.docs.forEach((doc) => {
        const body = doc.data();
        if (!body) return;
        const n = Object.assign({}, body, { id: doc.id });
        if (isNote(n)) remote.set(doc.id, tidyArchived(n));
      });
      if (first && heardArchive && remote.size === 0 && writable && saved.archive.length) {
        saved.archive.forEach((n) => { const copy = tidyArchived(n); stageArchived(copy.id); writeArchived(copy); remote.set(copy.id, copy); });
      }
      const next = [];
      S.archive.forEach((n) => { if (dirtyArchive.has(n.id)) { next.push(n); remote.delete(n.id); } });
      remote.forEach((n) => { if (!leavingArchive.has(n.id)) next.push(n); });
      S.archive = next;
      renderArchive();
    }, () => setMode('read', 'The archive stopped updating. Reload the page to see the latest.'));
  }
  // An import replaces the archive too: the old archived notes go, the file's come in.
  function replaceArchive(raw) {
    const incoming = (Array.isArray(raw) ? raw : []).filter(isNote).map(tidyArchived);
    if (S.mode === 'shared') S.archive.forEach((a) => deleteArchived(a.id));
    S.archive = incoming;
    if (S.mode === 'shared') S.archive.forEach((a) => { stageArchived(a.id); writeArchived(a); });
  }

  // -- Code links: the files of the code behind an element, each a path, a language and a text. They are edited in the
  // panel's code section, listed in the box's code compartment, and exported as textual representations in the body.
  COMPARTMENTS.push({
    applies: function (el) { return Array.isArray(el.code) && el.code.length > 0; }, head: 'code', cls: 'mono',
    lines: function (el, width) { return el.code.map((c) => fitPath(c.path.trim() || '(no path)', Math.max(8, Math.floor((width - 24) / 6.6)))); }
  });
  // A path that fits a compartment line: its end, where the file is named, with an ellipsis in front.
  function fitPath(path, chars) { return path.length <= chars ? path : '…' + path.slice(path.length - chars + 1); }
  // The code section, for an element selection: one row per link, with inputs while the page is editable, else the text.
  function renderCodeSection(s, write) {
    const el = s && s.type === 'el' ? s.item : null;
    // A kind without the code field (a start, done or initial node) has no line in the text a rep could go in.
    codeSection.hidden = !el || M.KINDS[el.kind].fields.indexOf('code') < 0;
    if (codeSection.hidden) return;
    const links = Array.isArray(el.code) ? el.code : [];
    while (codeList.firstChild) codeList.removeChild(codeList.firstChild);
    links.forEach((link, i) => codeList.appendChild(codeItem(link, i, write)));
    codeCount.textContent = links.length ? String(links.length) : '';
    codeEmpty.hidden = links.length > 0;
    codeEmpty.textContent = write ? 'No code linked yet. Add code links a file of the code to ' + M.describe(S.model, el) + '.' : 'No code linked.';
    addCodeButton.hidden = !write;
  }
  function codeItem(link, i, write) {
    const li = document.createElement('li');
    li.className = 'code-link';
    li.setAttribute('data-index', String(i));
    if (!write) {
      const head = document.createElement('p');
      head.className = 'code-static';
      head.textContent = (link.path.trim() || '(no path)') + ' · ' + (link.language || 'no language');
      li.appendChild(head);
      if (link.text.trim()) {
        const text = document.createElement('pre');
        text.className = 'code-static';
        text.textContent = link.text;
        li.appendChild(text);
      }
      return li;
    }
    const row = document.createElement('div');
    row.className = 'code-row';
    const path = document.createElement('input');
    path.type = 'text';
    path.className = 'code-path';
    path.value = link.path;
    path.placeholder = 'path, e.g. app/src/x.ts';
    path.autocomplete = 'off';
    path.spellcheck = false;
    path.setAttribute('aria-label', 'The path of code link ' + (i + 1));
    const language = document.createElement('select');
    language.className = 'code-language';
    language.setAttribute('aria-label', 'The language of code link ' + (i + 1));
    // The languages offered, and the link's own when a file brought one that isn't among them.
    CODE_LANGUAGES.concat(CODE_LANGUAGES.indexOf(link.language) < 0 ? [link.language] : []).forEach((l) => {
      const o = document.createElement('option');
      o.value = l;
      o.textContent = l || '(no language)';
      language.appendChild(o);
    });
    language.value = link.language;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'code-remove';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', 'Remove code link ' + (i + 1));
    row.appendChild(path);
    row.appendChild(language);
    row.appendChild(remove);
    const text = document.createElement('textarea');
    text.className = 'code-text';
    text.rows = 2;
    text.value = link.text;
    text.placeholder = 'the code, or nothing: then the link is just the path';
    text.spellcheck = false;
    text.setAttribute('aria-label', 'The text of code link ' + (i + 1));
    li.appendChild(row);
    li.appendChild(text);
    requestAnimationFrame(() => growCodeText(text));
    return li;
  }
  function growCodeText(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(360, textarea.scrollHeight + 2) + 'px';
  }
  // The link an event in the code list is about: the selected element and the row's index.
  function codeLinkOf(event) {
    const el = selectedElement();
    const li = event.target.closest ? event.target.closest('li.code-link') : null;
    if (!el || !li || !Array.isArray(el.code)) return null;
    const i = +li.getAttribute('data-index');
    return el.code[i] ? { el: el, i: i, link: el.code[i] } : null;
  }
  function codeLinkName(x) { return 'code link ' + (x.i + 1) + ' of ' + M.describe(S.model, x.el); }
  // Typing a path or a text is one undo step per field of the link, a run the field's change event ends, which logs
  // it once the field is left; the language changes at once; Add and Remove are one step each.
  codeList.addEventListener('input', (event) => {
    const x = codeLinkOf(event);
    const input = event.target;
    const fld = input.classList.contains('code-path') ? 'path' : input.classList.contains('code-text') ? 'text' : null;
    if (!x || !fld) return;
    const done = edit(() => {
      x.link[fld] = input.value;
      const what = 'Set the ' + fld + ' of ' + codeLinkName(x);
      return { what: what, log: what + (fld === 'path' ? ' to ' + (x.link.path.trim() || 'nothing') : '') };
    }, 'code:' + x.el.id + ':' + x.i + ':' + fld);
    if (done && fld === 'text') growCodeText(input);
  });
  codeList.addEventListener('change', (event) => {
    const x = codeLinkOf(event);
    const input = event.target;
    if (!x) return;
    if (input.classList.contains('code-language')) {
      edit(() => {
        x.link.language = input.value;
        return 'Set the language of ' + codeLinkName(x) + ' to ' + (input.value || 'nothing');
      });
      return;
    }
    if (input.classList.contains('code-path') || input.classList.contains('code-text')) endEdit();
  });
  codeList.addEventListener('click', (event) => {
    const button = event.target.closest ? event.target.closest('button.code-remove') : null;
    const x = button ? codeLinkOf(event) : null;
    if (!x) return;
    const what = 'Removed the code link ' + (x.link.path.trim() || '(no path)') + ' from ' + M.describe(S.model, x.el);
    if (!edit(() => { x.el.code.splice(x.i, 1); return what; })) return;
    renderInspector();
    say(what + '. Undo brings it back.');
  });
  addCodeButton.addEventListener('click', () => {
    const el = selectedElement();
    if (!el) return;
    const what = 'Added a code link to ' + M.describe(S.model, el);
    const done = edit(() => {
      if (!Array.isArray(el.code)) el.code = [];
      el.code.push({ path: '', language: CODE_LANGUAGES[0], text: '' });
      return what;
    });
    if (!done) return;
    renderInspector();
    say(what + '. Give it the file\'s path; the text may stay empty.');
    const path = codeList.querySelector('li.code-link:last-child input.code-path');
    if (path) path.focus({ preventScroll: true });
  });

  Object.assign(C, {
    leavingNotes, freePin, pinDragStart, movePin, dropPin, archiveButton, renderArchive, listenArchive, replaceArchive,
    renderCodeSection
  });
})(window.SysMLCanvas);
