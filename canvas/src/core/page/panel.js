// The panel: selecting and moving, the selection's fields and problems, and what the panel's buttons do.
(function (C) {
  'use strict';
  const S = C.state;
  const {
    M, VIEW_PANELS, FIELD_HOOKS, $, panel, showPanel, inspectorEmpty, fields, fKind, fPath, fViews, addNoteButton,
    removeFromViewButton, deleteButton, viewFields, vKind, vName, vDoc, vShow, vMeta, vShowAdd, deleteViewButton,
    problemsList, problemsButton, undoButton, say, editable, newId, plural, relById, viewById, viewLayout, viewShowing,
    rendererFor, center, endpoints, marksFor, applyMarks, showPoint, blankField, edit, endEdit, undo, setActive,
    deleteView, showable
  } = C;

  // ---- Selecting, moving, and the panel.

  function resolve(sel) {
    if (!sel) return null;
    if (sel.type === 'el') { const el = S.layout.ids.get(sel.id); return el ? { type: 'el', item: el } : null; }
    if (sel.type === 'view') { const view = viewById(sel.id); return view ? { type: 'view', item: view } : null; }
    const rel = relById(sel.id);
    return rel ? { type: 'rel', item: rel } : null;
  }
  // Selects something; viewId, the frame it was picked in, becomes the active view. A note on a defined-by line
  // that isn't drawn is reached through the part or port the line starts from.
  function select(sel, viewId) {
    if (sel && sel.type === 'rel') { const rel = relById(sel.id); if (rel && rel.hidden) sel = { type: 'el', id: rel.from }; }
    S.selection = sel && resolve(sel) ? sel : null;
    if (S.selection && S.selection.type === 'view') setActive(S.selection.id);
    else if (S.selection && viewId && viewById(viewId)) setActive(viewId);
    say('');
    applyMarks();
    renderInspector();
    if (S.selection) setPanel(true);
  }
  // What to select for a problem's id: an element, a line, or a view.
  function selectionFor(id) {
    if (S.layout.ids.has(id)) return { type: 'el', id: id };
    if (relById(id)) return { type: 'rel', id: id };
    if (viewById(id)) return { type: 'view', id: id };
    return null;
  }
  // Moves the camera to the selection, in the view that shows it.
  function showSelection() {
    const s = resolve(S.selection);
    if (!s) return;
    if (s.type === 'view') { const fr = viewLayout(s.item.id).frameRect; showPoint(fr.x + fr.w / 2, fr.y + fr.h / 2); return; }
    const vid = viewShowing(s.item.id) || (s.type === 'rel' ? viewShowing(s.item.from) : null);
    const L = vid ? viewLayout(vid) : null;
    if (!L) return;
    const r = L.rects.get(s.item.id);
    const at = r ? center(r) : (s.type === 'rel' ? (endpoints(s.item, L) || {}).mid : null) || (s.type === 'rel' && L.rects.get(s.item.from) ? center(L.rects.get(s.item.from)) : null);
    if (at) showPoint(at.x, at.y);
  }
  // The HUD's button: the first thing that has a problem, then the next, round and round.
  function nextProblem() {
    const named = S.problems.filter((p) => p.id !== null);
    if (!named.length) { if (S.problems.length) say(S.problems[0].message); return; }
    S.problemCursor = (S.problemCursor + 1) % named.length;
    const p = named[S.problemCursor];
    const sel = selectionFor(p.id);
    if (sel) { select(sel); showSelection(); }
    say(p.message);
  }
  problemsButton.addEventListener('click', nextProblem);
  function problemsFor(s) {
    return S.problems.filter((p) => marksFor(p).indexOf(s.item.id) >= 0);
  }
  function renderInspector() {
    const s = resolve(S.selection);
    const write = editable();
    fields.hidden = true;
    viewFields.hidden = true;
    inspectorEmpty.hidden = !!s;
    C.renderCodeSection(s, write);
    if (!s) { renderProblemsList(); return; }
    if (s.type === 'view') renderViewFields(s.item, write);
    else renderElementFields(s, write);
    renderProblemsList();
  }
  // The selection's problems, under its fields. Drawn with every render too, so the list follows what is typed.
  function renderProblemsList() {
    const s = resolve(S.selection);
    while (problemsList.firstChild) problemsList.removeChild(problemsList.firstChild);
    problemsList.hidden = !s;
    if (!s) return;
    problemsFor(s).forEach((p) => {
      const li = document.createElement('li');
      li.textContent = p.message;
      problemsList.appendChild(li);
    });
  }
  // The panel for an element or a line: the lines that say what it is, and its fields (renderFields).
  function renderElementFields(s, write) {
    fields.hidden = false;
    renderHead(s, write);
    renderFields(s, write);
    deleteButton.hidden = !write;
    addNoteButton.hidden = !write || (s.type === 'el' && M.textName(s.item) === null);
  }
  // The lines around an element's or a line's fields: what it is (its kind and name, or the line in words), its path,
  // and the views it is drawn in, with Remove from view for an element shown in one.
  function renderHead(s, write) {
    const views = (S.layout.where.get(s.item.id) || []).map((id) => viewById(id)).filter(Boolean);
    const names = views.map((v) => v.name.trim() || '(unnamed view)').join(', ');
    if (s.type === 'el') {
      fKind.textContent = M.describe(S.model, s.item);
      fPath.textContent = M.qualified(S.model, s.item);
      fViews.textContent = views.length ? 'Shown in ' + names : 'Shown in no view. A view\'s Show list brings it in.';
      removeFromViewButton.hidden = !write || !views.length;
    } else {
      fKind.textContent = M.describeRel(S.model, s.item);
      fPath.textContent = '';
      fViews.textContent = views.length ? 'Drawn in ' + names : 'Drawn in no view: none shows both ends.';
      removeFromViewButton.hidden = true;
    }
  }

  // ---- The fields, every one of them the same way.
  //
  // A field of the selection is a row of M.FIELDS that the selection's kind lists, drawn by a label holding its input:
  // <label id="l-<field>"> holding <… id="f-<field>"> in #fields, for an element or a line. The panel shows each field
  // by its row's type, and every change to a field goes through the same two listeners and edit(), so it is an undo
  // step, logged for Claude, and saved. FIELD_HOOKS (base.js) adds what a field's row can't say.

  // Where the labels and inputs of the selection's fields are, by its type.
  const PLACES = { el: { label: 'l-', input: 'f-' }, rel: { label: 'l-', input: 'f-' } };
  function fieldsOf(s) { return s.type === 'el' ? M.KINDS[s.item.kind].fields : M.RELATIONSHIPS[s.item.kind].fields; }
  // A field of the selection s with its input, as the hooks are given it; null when its kind doesn't list the field,
  // or the field has no input in the panel (a field its feature edits in a section of its own: the code links).
  function fieldAt(s, fld, input) {
    const spec = M.FIELDS[fld];
    if (!spec || !input || fieldsOf(s).indexOf(fld) < 0) return null;
    return { item: s.item, type: s.type, fld: fld, spec: spec, input: input, hooks: FIELD_HOOKS[fld] || {} };
  }
  function valueOf(x) { return x.hooks.value ? x.hooks.value(x) : x.item[x.fld]; }
  // A string, text or number field takes typing: each keystroke is a change, and a run of them one undo step.
  function typed(spec) { return ['string', 'text', 'number'].indexOf(spec.type) >= 0; }
  // The kind of the view a field's views are checked against: the view that shows the selection, else the active one.
  function viewKindShowing(id) {
    const view = viewById(viewShowing(id) || S.active);
    return view ? view.kind : null;
  }
  // Fills the selection's fields from the model and shows them: every field's label is hidden, then each field the
  // selection's kind lists is filled and shown, a bool as a checkbox, an enum as a select of its values, a ref as a
  // select of the elements its options allow with nothing first, the rest as text. A field with views shows only while
  // the selection is drawn in a view of one of those kinds, and one with a shown hook only when the hook says so.
  function renderFields(s, write) {
    const place = PLACES[s.type];
    const kind = viewKindShowing(s.item.id);
    Object.keys(M.FIELDS).forEach((fld) => { const label = $(place.label + fld); if (label) label.hidden = true; });
    fieldsOf(s).forEach((fld) => {
      const x = fieldAt(s, fld, $(place.input + fld));
      const label = $(place.label + fld);
      if (!x || !label || (x.spec.views && x.spec.views.indexOf(kind) < 0) || (x.hooks.shown && !x.hooks.shown(x))) return;
      const input = x.input;
      const v = valueOf(x);
      if (x.spec.type === 'bool') input.checked = v === true;
      else if (x.spec.type === 'ref') {
        while (input.firstChild) input.removeChild(input.firstChild);
        const none = document.createElement('option');
        none.value = '';
        none.textContent = x.hooks.none || 'nothing';
        input.appendChild(none);
        x.spec.options(S.model, s.item).forEach((e) => {
          const o = document.createElement('option');
          o.value = e.id;
          o.textContent = M.textName(e) || '(unnamed)';
          input.appendChild(o);
        });
        input.value = typeof v === 'string' ? v : '';
      } else if (x.spec.type === 'enum') input.value = x.spec.values.indexOf(v) >= 0 ? v : x.spec.values[0];
      else input.value = v === undefined || v === null ? '' : String(v);
      if (input.tagName === 'SELECT' || input.type === 'checkbox') input.disabled = !write; else input.readOnly = !write;
      label.hidden = false;
    });
  }
  // The field of the selection an input or change event in the panel is about, or null.
  function fieldOf(event) {
    const s = resolve(S.selection);
    const input = event.target;
    if (!s || !input || !input.id) return null;
    const prefix = PLACES[s.type].input;
    return input.id.indexOf(prefix) === 0 ? fieldAt(s, input.id.slice(prefix.length), input) : null;
  }
  // Whether an input is that of a field that takes typing, whatever is selected now.
  function typedInput(input) {
    const m = input && input.id ? /^[fv]-(.+)$/.exec(input.id) : null;
    return !!m && !!M.FIELDS[m[1]] && typed(M.FIELDS[m[1]]);
  }
  // The value an input holds, as its field's row reads it: a string with its ends off when the row trims.
  function readInput(spec, input) {
    if (spec.type === 'bool') return input.checked;
    if (spec.type === 'number') return input.value.trim() !== '' && Number.isFinite(+input.value) ? +input.value : '';
    return spec.trim ? input.value.trim() : input.value;
  }
  // The selection in a sentence: an element as describe says it, a line as "the" and its words.
  function whatOf(x) { return x.type === 'el' ? M.describe(S.model, x.item) : 'the ' + M.describeRel(S.model, x.item); }
  // The words for a change to a field that has none of its own: Set the <label> of <what> to <value>.
  function fieldChangeText(x) {
    const v = valueOf(x);
    let value = v === '' || v === undefined || v === null ? 'nothing' : String(v);
    if (x.spec.type === 'ref' && v) { const e = S.layout.ids.get(v); value = e ? (M.textName(e) || '(unnamed)') : 'nothing'; }
    return 'Set the ' + x.spec.label + ' of ' + whatOf(x) + ' to ' + value;
  }
  // Makes the change a field's input asks for, through edit(): with the field's write, else as the item's property,
  // in the field's words, else the generic ones. A value the field has already changes nothing. Returns what edit()
  // returns: what the change touched, or null.
  function changeField(x, key) {
    const value = readInput(x.spec, x.input);
    if (value === valueOf(x)) return null;
    return edit(() => {
      if (x.hooks.write) x.hooks.write(x, value); else x.item[x.fld] = value;
      return x.hooks.said ? x.hooks.said(x) : fieldChangeText(x);
    }, key);
  }
  // The one pair of listeners for every field. Typing in a string, text or number field is one undo step per field, a
  // run the field's change event ends, which logs it once the field is left; a bool, an enum or a ref changes at once.
  [fields].forEach((box) => {
    box.addEventListener('input', (event) => {
      const x = fieldOf(event);
      if (x && typed(x.spec)) changeField(x, x.fld + ':' + x.item.id);
    });
    box.addEventListener('change', (event) => {
      const x = fieldOf(event);
      if (x && !typed(x.spec)) {
        if (changeField(x) && x.hooks.done) x.hooks.done(x);
        return;
      }
      if (!x && !typedInput(event.target)) return;
      endEdit();
      if (x && x.hooks.done) x.hooks.done(x);
    });
  });

  function renderViewFields(view, write) {
    viewFields.hidden = false;
    vKind.textContent = view.kind;
    vName.value = view.name;
    vDoc.value = view.doc;
    while (vShow.firstChild) vShow.removeChild(vShow.firstChild);
    const candidates = showable(view);
    if (!candidates.length) {
      const o = document.createElement('option');
      o.value = '';
      o.textContent = rendererFor(view).showsAll ? 'This view shows every element'
        : M.VIEW_KINDS[view.kind].admits !== null && !M.VIEW_KINDS[view.kind].admits.length
          ? 'Nothing can be shown in ' + M.an(M.VIEW_KINDS[view.kind].label) + ' yet'
          : 'Everything it can show is shown';
      vShow.appendChild(o);
    }
    candidates.forEach((e) => {
      const o = document.createElement('option');
      o.value = e.id;
      o.textContent = M.describe(S.model, e);
      vShow.appendChild(o);
    });
    const L = viewLayout(view.id);
    vMeta.textContent = plural(L ? L.shown.size : Object.keys(view.layout).length, 'element') + ' shown · ' + M.VIEW_KINDS[view.kind].label +
      (view.id === S.active ? ' · active' : '');
    [vName, vDoc].forEach((i) => { i.readOnly = !write; });
    vShow.disabled = !write || !candidates.length;
    vShowAdd.disabled = !write || !candidates.length;
    deleteViewButton.hidden = !write;
    // The kind's own options: its div.view-options is shown, the other kinds' hidden, and its function fills it.
    viewFields.querySelectorAll('.view-options').forEach((d) => { d.hidden = d.getAttribute('data-view-kind') !== view.kind; });
    if (VIEW_PANELS[view.kind]) VIEW_PANELS[view.kind](view, write);
  }
  function selectedElement() { const s = resolve(S.selection); return s && s.type === 'el' ? s.item : null; }
  function selectedRel() { const s = resolve(S.selection); return s && s.type === 'rel' ? s.item : null; }
  function selectedView() { const s = resolve(S.selection); return s && s.type === 'view' ? s.item : null; }
  // The notes' stored labels follow the model's names, for Claude, who reads them without the model's names at hand.
  function syncNoteLabels() {
    S.notes.forEach((n) => {
      const label = M.labelFor(S.model, n.target);
      if (label && label !== n.targetLabel) { n.targetLabel = label; C.noteChanged(n, ['targetLabel']); }
    });
  }

  // ---- The core's fields, beyond their rows: the words of a rename, of a doc and of the two checkboxes, and the
  // definition, which is no value of the usage but its FeatureTyping relationship, with the box that draws its line.
  function definitionOf(typing) { return typing ? S.model.elements.find((e) => e.id === typing.to) || null : null; }
  Object.assign(FIELD_HOOKS, {
    name: {
      said: function (x) {
        return x.type === 'el' ? 'Renamed to ' + M.describe(S.model, x.item) : 'Named the ' + M.describeRel(S.model, x.item);
      },
      // Once the name is left, the lines that say what the selection is follow it, and so do the notes' labels.
      done: function () {
        const s = resolve(S.selection);
        if (s) renderHead(s, editable());
        syncNoteLabels();
        C.renderNotes();
      }
    },
    abstract: {
      said: function (x) { return (x.item.abstract ? 'Made abstract: ' : 'Made concrete: ') + M.describe(S.model, x.item); }
    },
    conjugated: {
      said: function (x) { return (x.item.conjugated ? 'Conjugated ' : 'Unconjugated ') + M.describe(S.model, x.item); }
    },
    doc: {
      said: function (x) { return 'Wrote the doc of ' + whatOf(x); }
    },
    // A usage's definition. Picking one types the usage by it: its typing, when it has one, takes the new end, so the
    // notes on the line stay on it; else a new typing shows as text, its line not drawn. Picking nothing takes the
    // typing away.
    type: {
      none: 'nothing yet',
      value: function (x) { const typing = M.typingOf(S.model, x.item); return typing ? typing.to : ''; },
      write: function (x, value) {
        const typing = M.typingOf(S.model, x.item);
        if (!value) { if (typing) S.model.relationships.splice(S.model.relationships.indexOf(typing), 1); return; }
        if (typing) { typing.to = value; return; }
        const rel = { id: newId('r'), kind: 'FeatureTyping', from: x.item.id, to: value };
        M.RELATIONSHIPS.FeatureTyping.fields.forEach((fld) => blankField(rel, fld));
        rel.hidden = true;
        S.model.relationships.push(rel);
      },
      said: function (x) {
        const def = definitionOf(M.typingOf(S.model, x.item));
        return def ? 'Defined ' + M.describe(S.model, x.item) + ' by ' + (M.textName(def) || '(unnamed)') : 'Undefined ' + M.describe(S.model, x.item);
      },
      // The box that draws the line comes and goes with the typing, the notes' labels follow the line's end, and the
      // status line says how a new definition shows.
      done: function (x) {
        renderInspector();
        syncNoteLabels();
        C.renderNotes();
        const typing = M.typingOf(S.model, x.item);
        if (typing) say(FIELD_HOOKS.type.said(x) + '.' + (typing.hidden ? ' It shows as text; tick the box to draw the line too.' : ''));
      }
    },
    // Whether a usage's typing is drawn as a line, or shown as text only: there while the usage has a typing.
    typeLine: {
      shown: function (x) { return !!M.typingOf(S.model, x.item); },
      value: function (x) { const typing = M.typingOf(S.model, x.item); return !!typing && !typing.hidden; },
      write: function (x, value) {
        const typing = M.typingOf(S.model, x.item);
        if (!typing) return;
        if (value) delete typing.hidden; else typing.hidden = true;
      },
      said: function (x) {
        const typing = M.typingOf(S.model, x.item);
        return typing ? (typing.hidden ? 'Hid the line ' : 'Drew the line ') + M.describeRel(S.model, typing) : null;
      }
    }
  });

  vName.addEventListener('input', () => {
    const view = selectedView();
    if (!view) return;
    const done = edit(() => {
      view.name = vName.value;
      return 'Renamed the view to ' + (view.name.trim() || '(unnamed)');
    }, 'name:' + view.id);
    if (done) setActive(S.active); // the eyebrow names the active view
  });
  vName.addEventListener('change', () => endEdit());
  vDoc.addEventListener('input', () => {
    const view = selectedView();
    if (view) edit(() => {
      view.doc = vDoc.value;
      return 'Wrote the doc of ' + M.describeView(S.model, view);
    }, 'doc:' + view.id);
  });
  vDoc.addEventListener('change', () => endEdit());

  // Delete takes an element out of the model and every view, with everything inside it and every line on it; a line
  // out of the model; a view off the plane, its elements staying.
  function deleteSelection() {
    const s = resolve(S.selection);
    if (!s || !editable()) return;
    if (s.type === 'view') { deleteView(s.item); return; }
    let gone = [];
    let what;
    let dropped;
    edit(() => {
      if (s.type === 'el') {
        what = M.describe(S.model, s.item);
        gone = [s.item].concat(M.descendants(S.model, s.item.id));
        const ids = new Set(gone.map((e) => e.id));
        const rels = S.model.relationships.filter((r) => ids.has(r.from) || ids.has(r.to));
        rels.forEach((r) => ids.add(r.id));
        S.model.elements = S.model.elements.filter((e) => !ids.has(e.id));
        S.model.relationships = S.model.relationships.filter((r) => !ids.has(r.id));
        S.model.views.forEach((v) => ids.forEach((id) => { delete v.layout[id]; }));
        if (S.pending && ids.has(S.pending)) S.pending = null;
        dropped = dropNotesOn(ids);
      } else {
        what = 'the ' + M.describeRel(S.model, s.item);
        S.model.relationships = S.model.relationships.filter((r) => r.id !== s.item.id);
        dropped = dropNotesOn(new Set([s.item.id]));
      }
      return 'Deleted ' + what;
    });
    select(null);
    C.renderNotes();
    say('Deleted ' + what + (gone.length > 1 ? ', with ' + plural(gone.length - 1, 'element') + ' inside it' : '') +
      (dropped ? ', and ' + plural(dropped, 'note') + ' on it' : '') + '.');
  }
  deleteButton.addEventListener('click', deleteSelection);
  undoButton.addEventListener('click', undo);
  function dropNotesOn(ids) {
    const on = S.notes.filter((n) => ids.has(n.target));
    on.forEach((n) => C.removeNote(n.id, true));
    return on.length;
  }

  function setPanel(open) {
    panel.hidden = !open;
    showPanel.hidden = open;
  }
  $('hide-panel').addEventListener('click', () => setPanel(false));
  showPanel.addEventListener('click', () => setPanel(true));

  Object.assign(C, {
    resolve, select, selectionFor, renderInspector, renderProblemsList, selectedElement, selectedRel, selectedView,
    syncNoteLabels, deleteSelection, setPanel
  });
})(window.SysMLCanvas);
