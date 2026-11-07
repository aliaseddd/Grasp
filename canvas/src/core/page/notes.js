// Notes: on an element or a line, listed in the panel, pinned on the drawing wherever their target is drawn.
(function (C) {
  'use strict';
  const S = C.state;
  const {
    M, PAUSE, svg, showPanel, addNoteButton, list, notesEmpty, notesCount, now, say, editable, newId, byNumber,
    nextNumber, noteById, relById, viewLayout, viewShowing, center, endpoints, renderPins, showPoint, resolve, select,
    setPanel
  } = C;

  // ---- Notes: on an element or a line, listed in the panel, pinned on the drawing wherever their target is drawn.

  const noteTimers = {};
  function renderNotes() {
    const active = document.activeElement;
    const activeLi = active && active.closest ? active.closest('.note') : null;
    const activeId = activeLi ? activeLi.getAttribute('data-note') : null;
    const selStart = activeId ? active.selectionStart : 0;
    const selEnd = activeId ? active.selectionEnd : 0;
    while (list.firstChild) list.removeChild(list.firstChild);
    S.notes.slice().sort(byNumber).forEach((n) => list.appendChild(itemFor(n)));
    notesEmpty.hidden = S.notes.length > 0;
    const loading = S.mode === 'loading' || (S.mode === 'shared' && !S.heardNotes);
    notesEmpty.textContent = loading ? 'Loading the notes…' : editable() ? 'No notes yet. Select a box, a port, or a line, then Add note.' : 'No notes.';
    notesCount.textContent = S.notes.length ? String(S.notes.length) : '';
    showPanel.textContent = S.notes.length ? 'Panel · ' + S.notes.length : 'Panel';
    renderPins();
    C.renderArchive();
    const again = activeId ? list.querySelector('[data-note="' + activeId + '"] textarea') : null;
    if (again) {
      again.focus({ preventScroll: true });
      try { again.setSelectionRange(selStart, selEnd); } catch (error) { /* not a text field */ }
    }
  }
  function dateOf(iso) {
    return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  function itemFor(n) {
    const write = editable();
    const li = document.createElement('li');
    li.className = 'note' + (n.resolved ? ' is-resolved' : '');
    li.setAttribute('data-note', n.id);
    const head = document.createElement('div');
    head.className = 'note-head';
    const badge = document.createElement('button');
    badge.type = 'button';
    badge.className = 'badge';
    badge.textContent = String(n.no);
    badge.title = 'Show what this note is on';
    badge.setAttribute('aria-label', 'Show note ' + n.no + ' on the drawing');
    const on = document.createElement('span');
    on.className = 'on';
    const label = n.target === null ? 'the plane' : (M.labelFor(S.model, n.target) || n.targetLabel || 'something no longer in the model');
    on.appendChild(document.createTextNode('on '));
    const b = document.createElement('b');
    b.textContent = label;
    on.appendChild(b);
    head.appendChild(badge);
    head.appendChild(on);
    if (write && n.resolved) head.appendChild(C.archiveButton(n)); // a resolved note can be put away
    if (write) {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove';
      remove.textContent = 'Delete';
      remove.setAttribute('aria-label', 'Delete note ' + n.no);
      remove.addEventListener('click', () => { removeNote(n.id, false); renderNotes(); say('Deleted note ' + n.no + '.'); });
      head.appendChild(remove);
    }
    const textarea = document.createElement('textarea');
    textarea.className = 'text';
    textarea.rows = 2;
    textarea.value = n.text;
    textarea.readOnly = !write || n.by === 'claude';
    textarea.placeholder = write ? 'Write the note' : '';
    textarea.setAttribute('aria-label', 'Note ' + n.no + ', on ' + label);
    textarea.addEventListener('input', () => {
      n.text = textarea.value;
      n.updated = now();
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 2 + 'px';
      noteChanged(n, ['text', 'updated']);
    });
    textarea.addEventListener('focus', () => markNote(n, true));
    textarea.addEventListener('blur', () => markNote(n, false));
    li.appendChild(head);
    li.appendChild(textarea);
    if (n.response) {
      const response = document.createElement('p');
      response.className = 'response';
      const who = document.createElement('b');
      who.textContent = 'Claude: ';
      response.appendChild(who);
      response.appendChild(document.createTextNode(n.response));
      li.appendChild(response);
    }
    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = (n.by === 'claude' ? 'From Claude · ' : '') + 'Added ' + dateOf(n.created) + (n.resolved ? ' · resolved' : '');
    li.appendChild(meta);
    badge.addEventListener('click', () => {
      if (n.target === null) { showPoint(n.x, n.y); say('Showing note ' + n.no + ', on the plane.'); return; } // a free note: its own point
      // The target, in the view that draws it (for a line that isn't drawn, the part or port it starts from).
      const rel = relById(n.target);
      const vid = viewShowing(n.target) || (rel ? viewShowing(rel.from) : null);
      const L = vid ? viewLayout(vid) : null;
      const r = L ? L.rects.get(n.target) : null;
      let at = r ? center(r) : null;
      if (!at && rel && L) { const e = rel.hidden ? null : endpoints(rel, L); at = e ? e.mid : (L.rects.get(rel.from) ? center(L.rects.get(rel.from)) : null); }
      if (at) showPoint(at.x, at.y);
      if (S.layout.ids.has(n.target)) select({ type: 'el', id: n.target }, vid);
      else if (rel) select({ type: 'rel', id: n.target }, vid);
      say('Showing note ' + n.no + ', on ' + label + '.');
    });
    li.addEventListener('mouseenter', () => markNote(n, true));
    li.addEventListener('mouseleave', () => markNote(n, li.contains(document.activeElement)));
    requestAnimationFrame(() => { textarea.style.height = 'auto'; textarea.style.height = textarea.scrollHeight + 2 + 'px'; });
    return li;
  }
  function markNote(n, on) {
    const li = list.querySelector('[data-note="' + n.id + '"]');
    if (li) li.classList.toggle('is-active', on);
    svg.querySelectorAll('.pin[data-note="' + n.id + '"]').forEach((pin) => pin.classList.toggle('is-active', on));
    svg.querySelectorAll('[data-el="' + n.target + '"], [data-rel="' + n.target + '"]').forEach((g) => g.classList.toggle('is-hover', on));
  }
  function focusNote(id) {
    setPanel(true);
    const textarea = list.querySelector('[data-note="' + id + '"] textarea');
    if (!textarea) return;
    textarea.focus({ preventScroll: true });
    textarea.closest('li').scrollIntoView({ block: 'nearest' });
  }
  function addNote() {
    const s = resolve(S.selection);
    if (!s || s.type === 'view' || !editable()) return;
    // A note's about needs a name, so an element of a kind without one (a start node) can't carry a note.
    if (s.type === 'el' && !M.hasName(s.item.kind)) {
      say(M.an(M.KINDS[s.item.kind].label, true) + ' can\'t carry a note. Note the ' + (s.item.owner !== undefined ? 'element it belongs to' : 'package') + ' instead.');
      return;
    }
    const stamp = now();
    const n = {
      id: newId('n'), no: nextNumber(), target: s.item.id, targetLabel: M.labelFor(S.model, s.item.id), text: '', by: 'user',
      created: stamp, updated: stamp, response: '', resolved: false
    };
    S.notes.push(n);
    renderNotes();
    noteChanged(n, null);
    focusNote(n.id);
    say('Added note ' + n.no + ' on ' + n.targetLabel + '.');
  }
  addNoteButton.addEventListener('click', addNote);
  function removeNote(id, quiet) {
    const n = noteById(id);
    if (!n) return;
    S.notes.splice(S.notes.indexOf(n), 1);
    clearTimeout(noteTimers[id]);
    if (S.mode === 'local') C.saveLocal();
    else if (S.mode === 'shared') C.deleteShared(id);
    if (!quiet) renderPins();
  }
  // A note changed here: fields says which of its fields, or null for a new note.
  function noteChanged(n, fieldsChanged) {
    if (S.mode === 'local') { C.saveLocal(); return; }
    if (S.mode !== 'shared') return;
    if (!fieldsChanged) { C.stageNote(n.id); C.writeShared(n, null); return; }
    C.stageNote(n.id);
    clearTimeout(noteTimers[n.id]);
    noteTimers[n.id] = setTimeout(() => C.writeShared(n, fieldsChanged), PAUSE);
  }

  Object.assign(C, { noteTimers, renderNotes, dateOf, focusNote, addNote, removeNote, noteChanged });
})(window.SysMLCanvas);
