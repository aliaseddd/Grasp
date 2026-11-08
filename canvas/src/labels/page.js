// Label editing on the page: typing into a label, as SysON's direct edit does. With a box, a border item or a labelled
// line selected, F2, the panel's Edit label button, or any printable key opens a box over its label in the active view,
// holding the label's text (M.labelText), all selected, or the key typed, the caret after it. Enter, or leaving the box,
// makes what the text says (M.applyLabel) as one undo step; Escape puts the box away. In a browser view a row is renamed
// instead, as SysON's explorer does: typing or Rename opens it, F2 doesn't, and the text becomes the name as it is. A
// grid's cells are not labels.
(function (C) {
  'use strict';
  const S = C.state;
  const {
    M, $, canvas, svg, say, str, editable, newId, viewById, viewLayout, endpoints, freshElement, blankField,
    showPoint, toDrawing, stageSize, edit, resolve, renderInspector, syncNoteLabels, FIELD_HOOKS
  } = C;

  const stage = canvas.parentNode;      // .stage: the box floats on the plane beside the drawing, outside #canvas
  const editButton = $('edit-label');
  const MIN_WIDTH = 130;                // SysON's box is never narrower than 130 px
  S.labelEditor = null;                 // the open box: { t, anchor, box }

  // What F2, a key or the button would edit now: the selection, while the page can be changed and the active view
  // draws it, as { sel, type, item, view, mode }: mode 'label' in a drawing, for what has a label to edit
  // (M.labelEditable), 'rename' in a browser view, for what has a name (M.renamable). null otherwise: nothing selected,
  // a view, a grid, or something the active view doesn't draw.
  function editTarget() {
    if (!editable() || !S.selection || S.selection.type === 'view') return null;
    const s = resolve(S.selection);
    const view = viewById(S.active);
    if (!s || !view) return null;
    const renderer = M.VIEW_KINDS[view.kind].renderer;
    if (renderer === 'grid') return null;
    const mode = renderer === 'browser' ? 'rename' : 'label';
    if (mode === 'label' ? !M.labelEditable(s.type, s.item) : !M.renamable(s.type, s.item)) return null;
    if ((S.layout.where.get(s.item.id) || []).indexOf(view.id) < 0) return null;
    return { sel: { type: s.type, id: s.item.id }, type: s.type, item: s.item, view: view, mode: mode };
  }

  // Where the label is on the plane, and how it is written: { x, y, w, h, align, font } in plane units, from the box
  // of its drawn text (data-label) in the view, or, when none is drawn (far out, an unnamed line or control node), from
  // the layout. null when the view lays out no place for it.
  function anchorOf(t) {
    const g = svg.querySelector('.frame[data-view="' + t.view.id + '"] [data-' + t.type + '="' + t.item.id + '"]');
    const label = g ? Array.from(g.querySelectorAll('[data-label]')).find((l) => l.closest('[data-el], [data-rel]') === g) : null;
    if (label) {
      const b = label.getBoundingClientRect();
      if (b.width > 0 && b.height > 0) {
        const p = toDrawing(b.left, b.top);
        const q = toDrawing(b.right, b.bottom);
        const holder = label.tagName === 'tspan' ? label.parentNode : label;
        const anchor = holder.getAttribute('text-anchor');
        const css = getComputedStyle(label);
        return {
          x: p.x, y: p.y, w: q.x - p.x, h: q.y - p.y, align: anchor === 'middle' ? 'center' : anchor === 'end' ? 'right' : 'left',
          font: { family: css.fontFamily, weight: css.fontWeight, style: css.fontStyle, size: parseFloat(css.fontSize) || 12.5 }
        };
      }
    }
    const L = viewLayout(t.view.id);
    if (!L) return null;
    const sans = { family: getComputedStyle(svg).fontFamily, weight: '500', style: 'normal', size: 12.5 };
    if (t.type === 'el') {
      const r = L.rects.get(t.item.id);
      if (!r) return null;
      if (r.port) return { x: r.cx + 12, y: r.cy - 18, w: 0, h: 16, align: 'left', font: sans };
      return { x: r.x, y: Math.min(r.y + 20, r.y + r.h / 2 - 8), w: r.w, h: 16, align: 'center', font: sans };
    }
    const e = endpoints(t.item, L);
    if (!e) return null;
    const how = M.RELATIONSHIPS[t.item.kind].line || {};
    const below = typeof how.labelOffset === 'number' ? how.labelOffset : 30;
    return { x: e.mid.x, y: e.mid.y + below - 13, w: 0, h: 16, align: 'center', font: sans };
  }
  // Whether a place on the plane is in the window.
  function inWindow(a) {
    const s = stageSize();
    const k = S.camera.k;
    const x = (a.x - S.camera.x) * k;
    const y = (a.y - S.camera.y) * k;
    return x + a.w * k >= 0 && y + a.h * k >= 0 && x <= s.width && y <= s.height;
  }

  // Puts the box over its label, at the camera's zoom, as wide as the label or 130 px of the plane, whichever is more;
  // the camera calls it when it moves (camera.js).
  function placeLabelEditor() {
    const ed = S.labelEditor;
    if (!ed || !S.camera) return;
    const a = ed.anchor;
    const k = S.camera.k;
    const w = Math.max(a.w + 12, MIN_WIDTH);
    const x = a.align === 'center' ? a.x + a.w / 2 - w / 2 : a.align === 'right' ? a.x + a.w - w : a.x - 6;
    const box = ed.box;
    box.style.left = ((x - S.camera.x) * k).toFixed(1) + 'px';
    box.style.top = ((a.y - 3 - S.camera.y) * k).toFixed(1) + 'px';
    box.style.width = (w * k).toFixed(1) + 'px';
    box.style.fontSize = (a.font.size * k).toFixed(2) + 'px';
    box.style.textAlign = a.align;
    box.style.height = 'auto';
    box.style.height = box.scrollHeight + 'px';
  }

  // Opens the box on what editTarget gives, by F2 or the button (the label's text, all selected) or by a key typed
  // (that key, the caret after it). Returns whether it opened.
  function openLabelEditor(typed) {
    if (S.labelEditor) return false;
    const t = editTarget();
    if (!t) return false;
    let anchor = anchorOf(t);
    if (!anchor) return false;
    // A label out of the window is brought into it first, so the box is where the label is drawn.
    if (!inWindow(anchor)) { showPoint(anchor.x + anchor.w / 2, anchor.y + anchor.h / 2); anchor = anchorOf(t) || anchor; }
    const box = document.createElement('textarea');
    box.className = 'label-editor';
    box.rows = 1;
    box.spellcheck = false;
    box.setAttribute('autocomplete', 'off');
    box.placeholder = 'Enter the new value';
    box.setAttribute('aria-label', t.mode === 'rename' ? 'New name' : 'Label');
    box.style.fontFamily = anchor.font.family;
    box.style.fontWeight = anchor.font.weight;
    box.style.fontStyle = anchor.font.style;
    box.value = typed !== undefined ? typed
      : t.mode === 'rename' ? str(t.item.name).trim()
        : M.labelText(S.model, { type: t.type, item: t.item });
    S.labelEditor = { t: t, anchor: anchor, box: box };
    stage.appendChild(box);
    placeLabelEditor();
    box.focus({ preventScroll: true });
    if (typed !== undefined) box.setSelectionRange(box.value.length, box.value.length);
    else box.select();
    box.addEventListener('keydown', onKey);
    box.addEventListener('input', placeLabelEditor);
    box.addEventListener('blur', () => finish(true, false));
    return true;
  }
  // The box's keys stay in the box: Enter (without Shift) makes the change, Escape puts the box away, and nothing
  // reaches the drawing's keys (Delete, the arrows, Ctrl+Z).
  function onKey(event) {
    event.stopPropagation();
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); finish(true, true); }
    else if (event.key === 'Escape') { event.preventDefault(); finish(false, true); }
  }

  // Makes new elements and lines the page's way, for M.applyLabel.
  const MAKE = {
    element: function (kind, name) { return freshElement(kind, name); },
    line: function (kind, from, to) {
      const rel = { id: newId('r'), kind: kind, from: from, to: to };
      M.RELATIONSHIPS[kind].fields.forEach((fld) => blankField(rel, fld));
      return rel;
    }
  };
  // Closes the box: keep, to make what its text says, as one step through edit(); back, to give the keys back to the
  // drawing (Enter, Escape; leaving the box by a click leaves the focus where the click put it). The canvas's labels
  // are one line, so a line break typed with Shift+Enter is read as a space.
  function finish(keep, back) {
    const ed = S.labelEditor;
    if (!ed) return;
    S.labelEditor = null;
    const text = ed.box.value.replace(/\r?\n/g, ' ');
    ed.box.remove();
    if (back) canvas.focus({ preventScroll: true });
    if (!keep) return;
    const s = resolve(ed.t.sel);
    if (!s) { say('What you were editing is gone, so nothing changed.'); return; }
    const target = { type: s.type, item: s.item };
    if (ed.t.mode === 'rename') {
      // The explorer's rename: the name as typed, no other part read.
      if (text === str(s.item.name)) return;
      edit(() => {
        s.item.name = text;
        return FIELD_HOOKS.name.said(target);
      });
      renderInspector();
      syncNoteLabels();
      C.renderNotes();
      say(FIELD_HOOKS.name.said(target) + '.');
      return;
    }
    let res = null;
    let words = null;
    edit(() => {
      res = M.applyLabel(S.model, target, text, MAKE);
      words = M.labelWords(S.model, target, res);
      return words;
    });
    if (!res) { say('This page can\'t be changed here, so the label wasn\'t.'); return; }
    renderInspector();
    syncNoteLabels();
    C.renderNotes();
    // What changed, what is new and where it is, and what the text said that wasn't made.
    const said = [];
    if (words) said.push(words.what + '.');
    res.created.forEach((e) => {
      const d = M.describe(S.model, e);
      said.push(d.charAt(0).toUpperCase() + d.slice(1) + ' is new, in no view yet; a view\'s Show list brings it in.');
    });
    const left = M.labelLeftOut(res);
    if (left) said.push(left);
    if (said.length) say(said.join(' '));
  }

  // A printable key on the drawing starts editing the selection's label, or renaming its row in a browser view, with
  // that key; so do the zoom keys (+, -, 0) while such a selection is there, as typing does in SysON. Ctrl or ⌘ with
  // a key, white space, and the keys that name no character (Escape, Delete, the arrows) do what they did. pointing.js
  // asks this first and leaves the key alone when it returns true.
  function labelKey(event) {
    if (S.labelEditor || event.ctrlKey || event.metaKey || event.isComposing) return false;
    const key = event.key;
    if (typeof key !== 'string' || Array.from(key).length !== 1 || /\s/.test(key)) return false;
    if (!openLabelEditor(key)) return false;
    event.preventDefault();   // the key is in the box already; the browser mustn't type it again
    return true;
  }
  // F2 edits the selection's label from anywhere on the page, even from another text field, as in SysON; not a row of a
  // browser view, which SysON's explorer renames by typing or its Rename entry only.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'F2' || S.labelEditor || event.ctrlKey || event.metaKey || event.altKey) return;
    const t = editTarget();
    if (!t || t.mode !== 'label') return;
    event.preventDefault();
    openLabelEditor();
  });
  // The panel's button: Edit label in a drawing, Rename in a browser view, there while the selection has one.
  editButton.addEventListener('click', () => openLabelEditor());
  function renderLabelButton() {
    const t = editTarget();
    editButton.hidden = !t;
    if (!t) return;
    editButton.textContent = t.mode === 'rename' ? 'Rename' : 'Edit label';
    editButton.title = t.mode === 'rename' ? 'Rename it here; typing on the row does too' : 'Type into its label; F2 or typing on the drawing does too';
  }

  Object.assign(C, { placeLabelEditor, openLabelEditor, labelKey, renderLabelButton });
})(window.SysMLCanvas);
