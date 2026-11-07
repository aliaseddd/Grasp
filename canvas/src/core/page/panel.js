// The panel: selecting and moving, the selection's fields and problems, and what the panel's buttons do.
(function (C) {
  'use strict';
  const S = C.state;
  const {
    M, VIEW_PANELS, $, panel, showPanel, inspectorEmpty, fields, fKind, fName, fAbstract, fType, fTypeLine, fMult,
    fConj, fDoc, fPath, fViews, addNoteButton, removeFromViewButton, deleteButton, viewFields, vKind, vName, vDoc,
    vShow, vMeta, vShowAdd, deleteViewButton, problemsList, problemsButton, undoButton, say, editable, plural, relById,
    viewById, viewLayout, viewShowing, rendererFor, center, endpoints, marksFor, applyMarks, showPoint, edit, endEdit,
    undo, setActive, createRel, deleteView, showable
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
  // The panel for an element or a line: the core fields (name, abstract, defined by, multiplicity, conjugated, doc)
  // the page fills itself; every other field of the kind goes through its row in FIELDS (renderExtraFields).
  function renderElementFields(s, write) {
    fields.hidden = false;
    fields.querySelectorAll('label[id^="l-"]').forEach((l) => { l.hidden = true; });
    if (s.type === 'el') {
      const el = s.item;
      const k = M.KINDS[el.kind];
      fKind.textContent = M.describe(S.model, el);
      k.fields.forEach((fld) => { const l = $('l-' + fld); if (l && M.FIELDS[fld] && M.FIELDS[fld].core) l.hidden = false; });
      fName.value = el.name;
      if (k.fields.indexOf('abstract') >= 0) fAbstract.checked = !!el.abstract;
      if (k.fields.indexOf('type') >= 0) {
        while (fType.firstChild) fType.removeChild(fType.firstChild);
        const none = document.createElement('option');
        none.value = '';
        none.textContent = 'nothing yet';
        fType.appendChild(none);
        const typing = M.typingOf(S.model, el);
        S.model.elements.filter((e) => e.kind === k.definedBy).forEach((d) => {
          const o = document.createElement('option');
          o.value = d.id;
          o.textContent = d.name.trim() || '(unnamed)';
          fType.appendChild(o);
        });
        fType.value = typing ? typing.to : '';
        if (typing) { $('l-type-line').hidden = false; fTypeLine.checked = !typing.hidden; }
      }
      if (k.fields.indexOf('multiplicity') >= 0) fMult.value = el.multiplicity || '';
      if (k.fields.indexOf('conjugated') >= 0) fConj.checked = !!el.conjugated;
      fDoc.value = el.doc;
      fPath.textContent = M.qualified(S.model, el);
      const views = (S.layout.where.get(el.id) || []).map((id) => viewById(id)).filter(Boolean);
      fViews.textContent = views.length
        ? 'Shown in ' + views.map((v) => v.name.trim() || '(unnamed view)').join(', ')
        : 'Shown in no view. A view\'s Show list brings it in.';
      removeFromViewButton.hidden = !write || !views.length;
    } else {
      const rel = s.item;
      const named = M.RELATIONSHIPS[rel.kind].fields;
      fKind.textContent = M.describeRel(S.model, rel);
      if (named.indexOf('name') >= 0) { $('l-name').hidden = false; fName.value = rel.name; }
      if (named.indexOf('doc') >= 0) { $('l-doc').hidden = false; fDoc.value = rel.doc; }
      fPath.textContent = '';
      const views = (S.layout.where.get(rel.id) || []).map((id) => viewById(id)).filter(Boolean);
      fViews.textContent = views.length ? 'Drawn in ' + views.map((v) => v.name.trim() || '(unnamed view)').join(', ') : 'Drawn in no view: none shows both ends.';
      removeFromViewButton.hidden = true;
    }
    renderExtraFields(s.item, s.type === 'el' ? M.KINDS[s.item.kind].fields : M.RELATIONSHIPS[s.item.kind].fields, write);
    [fName, fMult, fDoc].forEach((i) => { i.readOnly = !write; });
    [fAbstract, fType, fTypeLine, fConj].forEach((i) => { i.disabled = !write; });
    deleteButton.hidden = !write;
    addNoteButton.hidden = !write || (s.type === 'el' && !M.hasName(s.item.kind));
  }
  // The kind of the view a field's views are checked against: the view that shows the selection, else the active one.
  function viewKindShowing(id) {
    const view = viewById(viewShowing(id) || S.active);
    return view ? view.kind : null;
  }
  // The fields of the selection the page doesn't handle itself, each through its row in FIELDS and its slice's
  // <label id="l-<field>"> holding <input id="f-<field>"> in #fields: a bool is a checkbox, a ref a select of the
  // elements its options allow with nothing first, the rest take the value as text. A field with views shows only
  // while the selection is drawn in a view of one of those kinds. A field with no input in the panel is its slice's.
  function renderExtraFields(item, named, write) {
    const kind = viewKindShowing(item.id);
    named.forEach((fld) => {
      const spec = M.FIELDS[fld];
      const input = $('f-' + fld);
      const label = $('l-' + fld);
      if (!spec || spec.core || !input || !label) return;
      if (spec.views && spec.views.indexOf(kind) < 0) return;
      const v = item[fld];
      if (spec.type === 'bool') input.checked = v === true;
      else if (spec.type === 'ref') {
        while (input.firstChild) input.removeChild(input.firstChild);
        const none = document.createElement('option');
        none.value = '';
        none.textContent = 'nothing';
        input.appendChild(none);
        spec.options(S.model, item).forEach((e) => {
          const o = document.createElement('option');
          o.value = e.id;
          o.textContent = e.name.trim() || '(unnamed)';
          input.appendChild(o);
        });
        input.value = typeof v === 'string' ? v : '';
      } else if (spec.type === 'enum') input.value = spec.values.indexOf(v) >= 0 ? v : spec.values[0];
      else input.value = v === undefined || v === null ? '' : String(v);
      if (input.tagName === 'SELECT' || input.type === 'checkbox') input.disabled = !write; else input.readOnly = !write;
      label.hidden = false;
    });
  }
  // The field an input or change event in #fields is about, when it is one of those: null for a core field, which has
  // listeners of its own, and for anything that isn't a field of the selection.
  function extraFieldOf(event) {
    const input = event.target;
    const id = input && input.id ? input.id : '';
    if (id.indexOf('f-') !== 0) return null;
    const fld = id.slice(2);
    const spec = M.FIELDS[fld];
    const el = selectedElement();
    const rel = selectedRel();
    const item = el || rel;
    if (!spec || spec.core || !item) return null;
    const named = el ? M.KINDS[el.kind].fields : M.RELATIONSHIPS[rel.kind].fields;
    if (named.indexOf(fld) < 0) return null;
    return { item: item, fld: fld, spec: spec, input: input, what: el ? M.describe(S.model, el) : 'the ' + M.describeRel(S.model, rel) };
  }
  function readInput(spec, input) {
    if (spec.type === 'bool') return input.checked;
    if (spec.type === 'number') return input.value.trim() !== '' && Number.isFinite(+input.value) ? +input.value : '';
    return input.value;
  }
  function fieldChangeText(x) {
    const v = x.item[x.fld];
    let value = v === '' || v === undefined || v === null ? 'nothing' : String(v);
    if (x.spec.type === 'ref' && v) { const e = S.layout.ids.get(v); value = e ? (e.name.trim() || '(unnamed)') : 'nothing'; }
    return 'Set the ' + x.spec.label + ' of ' + x.what + ' to ' + value;
  }
  // One pair of listeners for all of those fields: typing in a string, text or number field is one undo step per field,
  // a run the field's change event ends, which logs it once the field is left; a bool, enum or ref changes at once.
  fields.addEventListener('input', (event) => {
    const x = extraFieldOf(event);
    if (!x || ['string', 'text', 'number'].indexOf(x.spec.type) < 0) return;
    edit(() => {
      x.item[x.fld] = readInput(x.spec, x.input);
      return fieldChangeText(x);
    }, x.fld + ':' + x.item.id);
  });
  fields.addEventListener('change', (event) => {
    const x = extraFieldOf(event);
    if (!x) return;
    if (['string', 'text', 'number'].indexOf(x.spec.type) >= 0) { endEdit(); return; }
    edit(() => {
      x.item[x.fld] = readInput(x.spec, x.input);
      return fieldChangeText(x);
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

  // Typing in a field is a run of changes, one undo step, which the field's change event ends once the field is left:
  // that logs it.
  fName.addEventListener('input', () => {
    const el = selectedElement();
    const item = el || selectedRel();
    if (!item) return;
    edit(() => {
      item.name = fName.value;
      return el ? 'Renamed to ' + M.describe(S.model, el) : 'Named the ' + M.describeRel(S.model, item);
    }, 'name:' + item.id);
  });
  fName.addEventListener('change', () => {
    const el = selectedElement();
    const rel = selectedRel();
    if (el) { fKind.textContent = M.describe(S.model, el); fPath.textContent = M.qualified(S.model, el); }
    else if (rel) fKind.textContent = M.describeRel(S.model, rel);
    endEdit();
    syncNoteLabels();
    C.renderNotes();
  });
  fAbstract.addEventListener('change', () => {
    const el = selectedElement();
    if (el) edit(() => {
      el.abstract = fAbstract.checked;
      return (el.abstract ? 'Made abstract: ' : 'Made concrete: ') + M.describe(S.model, el);
    });
  });
  fType.addEventListener('change', () => {
    const el = selectedElement();
    if (!el || !editable()) return;
    const old = M.typingOf(S.model, el);
    if (!fType.value) {
      edit(() => {
        if (!old) return null;
        S.model.relationships.splice(S.model.relationships.indexOf(old), 1);
        return 'Undefined ' + M.describe(S.model, el);
      });
      renderInspector();
      return;
    }
    const def = S.layout.ids.get(fType.value);
    if (!def) return;
    const rel = createRel('FeatureTyping', el, def, old ? !!old.hidden : true, 'Defined ' + M.describe(S.model, el) + ' by ' + (def.name.trim() || '(unnamed)'));
    if (!rel) return;
    select({ type: 'el', id: el.id });
    say('Defined ' + M.describe(S.model, el) + ' by ' + def.name + '.' + (rel.hidden ? ' It shows as text; tick the box to draw the line too.' : ''));
  });
  fTypeLine.addEventListener('change', () => {
    const el = selectedElement();
    const typing = el ? M.typingOf(S.model, el) : null;
    if (typing) edit(() => {
      if (fTypeLine.checked) delete typing.hidden; else typing.hidden = true;
      return (fTypeLine.checked ? 'Drew the line ' : 'Hid the line ') + M.describeRel(S.model, typing);
    });
  });
  fMult.addEventListener('input', () => {
    const el = selectedElement();
    if (el) edit(() => {
      el.multiplicity = fMult.value.trim();
      return 'Set the multiplicity of ' + M.describe(S.model, el) + ' to ' + (el.multiplicity || 'nothing');
    }, 'mult:' + el.id);
  });
  fMult.addEventListener('change', () => endEdit());
  fConj.addEventListener('change', () => {
    const el = selectedElement();
    if (el) edit(() => {
      el.conjugated = fConj.checked;
      return (el.conjugated ? 'Conjugated ' : 'Unconjugated ') + M.describe(S.model, el);
    });
  });
  fDoc.addEventListener('input', () => {
    const el = selectedElement();
    const item = el || selectedRel();
    if (!item) return;
    edit(() => {
      item.doc = fDoc.value;
      return 'Wrote the doc of ' + (el ? M.describe(S.model, el) : 'the ' + M.describeRel(S.model, item));
    }, 'doc:' + item.id);
  });
  fDoc.addEventListener('change', () => endEdit());
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
