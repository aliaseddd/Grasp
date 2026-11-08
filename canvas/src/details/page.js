// The details view on the page, as SysON's Details view (details/lib.js says what it holds): the panel's two tabs,
// Core and Advanced, the tab kept by its name as the selection changes; the groups' title, "<Metaclass> Properties";
// on Core, SysON's core features in its order (the fields that hold them, the values the canvas knows, the ones it
// doesn't hold yet), then the canvas's own fields, the documentation last, and the untitled groups, each shown only
// when something in it is; on Advanced, every other attribute of the metaclass. And the hooks of the fields it adds or
// rules: Specializes and Subsets, which retarget or take away an element's first specialization line, and Is Parallel,
// locked while a state holds transitions, as SysON locks it.
(function (C) {
  'use strict';
  const S = C.state;
  const { M, FIELD_HOOKS, $, fields, viewFields, say, renderInspector, syncNoteLabels } = C;

  S.detailsTab = 'Core';   // the tab shown: Core or Advanced
  // The two panels, an element's or a line's and a view's: where their fields' labels are (by id prefix), their
  // groups' title and body on each tab, and the qualified name's row. own is what the Core group holds in the markup's
  // order, the canvas's own fields among SysON's.
  const PANELS = {
    el: { box: fields, prefix: 'l-', coreTitle: $('g-main-title'), core: $('g-main-body'), advancedTitle: $('g-advanced-title'), advanced: $('g-advanced-body'), path: $('d-qualifiedName') },
    view: { box: viewFields, prefix: 'l-v-', coreTitle: $('v-g-main-title'), core: $('v-g-main-body'), advancedTitle: $('v-g-advanced-title'), advanced: $('v-g-advanced-body'), path: $('v-d-qualifiedName') }
  };
  Object.keys(PANELS).forEach((k) => { PANELS[k].own = Array.from(PANELS[k].core.children); });

  // A row for what the canvas knows but doesn't keep as a field (a value), or doesn't hold yet: its label and its
  // value, a Boolean as a checkbox that can't be changed, as SysON shows a derived one.
  function row(r) {
    const p = document.createElement('p');
    p.className = 'detail' + (r.held === false ? ' not-held' : '');
    p.setAttribute('data-detail', r.name);
    const label = document.createElement('span');
    label.className = 'detail-label';
    label.textContent = r.label;
    const value = document.createElement('span');
    value.className = 'detail-value';
    if (r.held === false) {
      value.textContent = 'not held yet';
      p.title = 'The canvas doesn\'t hold ' + r.label + ' yet: the text leaves it as SysML has it.';
    } else if (typeof r.value === 'boolean') {
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = r.value;
      box.disabled = true;
      box.setAttribute('aria-label', r.label);
      value.appendChild(box);
    } else value.textContent = r.value === '' ? '(none)' : String(r.value);
    p.appendChild(label);
    p.appendChild(value);
    return p;
  }
  // The node a row of the library's is shown by: the field's own label (the panel fills it and shows or hides it),
  // the qualified name's row, or a new row.
  function nodeFor(panel, r) {
    if (r.field) return $(panel.prefix + r.field);
    if (r.name === 'qualifiedName') {
      panel.path.querySelector('.detail-value').textContent = r.value === undefined || r.value === '' ? '(none)' : r.value;
      return panel.path;
    }
    return row(r);
  }
  // Shows the tab S.detailsTab names in both panels.
  function showTab() {
    [fields, viewFields].forEach((box) => {
      box.querySelectorAll('.tab-button').forEach((b) => b.setAttribute('aria-selected', String(b.getAttribute('data-tab') === S.detailsTab)));
      box.querySelectorAll('.details-page').forEach((page) => { page.hidden = page.getAttribute('data-tab') !== S.detailsTab; });
    });
  }
  // A group is shown while something in it is: a field's label, or a row.
  function hideEmptyGroups(box) {
    box.querySelectorAll('.group').forEach((g) => {
      g.hidden = !Array.from(g.querySelectorAll('[id^="l-"], .detail')).some((n) => !n.hidden);
    });
  }
  // Puts the selection's details in its panel, after the panel filled its fields: the title; on Core, SysON's core
  // features in its order, then the canvas's own fields as the markup has them, the documentation last; on Advanced,
  // the metaclass's other attributes. A field's label moves to the tab its attribute is on.
  function renderDetails(s) {
    const panel = s.type === 'view' ? PANELS.view : PANELS.el;
    const d = M.detailsOf(S.model, s.type, s.item);
    panel.coreTitle.textContent = d.title;
    panel.advancedTitle.textContent = d.title;
    panel.box.querySelectorAll('[data-detail]').forEach((n) => n.remove());
    const core = d.core.map((r) => nodeFor(panel, r)).filter(Boolean);
    const doc = $(panel.prefix + 'doc');
    panel.own.forEach((n) => { if (core.indexOf(n) < 0 && n !== doc && !d.advanced.some((r) => r.field && $(panel.prefix + r.field) === n)) core.push(n); });
    if (doc) core.push(doc);
    core.forEach((n) => panel.core.appendChild(n));
    d.advanced.map((r) => nodeFor(panel, r)).filter(Boolean).forEach((n) => panel.advanced.appendChild(n));
    showTab();
    hideEmptyGroups(panel.box);
  }
  // The tabs: a click, or the arrow keys between them, shows the other one.
  [fields, viewFields].forEach((box) => {
    const buttons = Array.from(box.querySelectorAll('.tab-button'));
    buttons.forEach((b, i) => {
      b.addEventListener('click', () => { S.detailsTab = b.getAttribute('data-tab'); showTab(); });
      b.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        const next = buttons[(i + (event.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length];
        S.detailsTab = next.getAttribute('data-tab');
        showTab();
        next.focus();
        event.preventDefault();
      });
    });
  });

  // ---- The fields' hooks.

  // Specializes (a definition's) and Subsets (a usage's): the element's first specialization line, there while it
  // has one. Picking another element moves the line's end, so the notes on it stay; picking nothing takes the line
  // away, as SysON's clear button does. The choices are what the line's rule allows (M.generals).
  function generalHooks(verb, noun) {
    return {
      none: 'nothing: take the line away',
      shown: function (x) { return !!M.firstGeneral(S.model, x.item); },
      value: function (x) { const r = M.firstGeneral(S.model, x.item); return r ? r.to : ''; },
      write: function (x, value) {
        const r = M.firstGeneral(S.model, x.item);
        if (!r) return;
        if (!value) { S.model.relationships.splice(S.model.relationships.indexOf(r), 1); return; }
        r.to = value;
      },
      said: function (x) {
        const r = M.firstGeneral(S.model, x.item);
        const general = r ? S.model.elements.find((e) => e.id === r.to) : null;
        return general ? 'Made ' + M.describe(S.model, x.item) + ' ' + verb + ' ' + (M.textName(general) || '(unnamed)')
          : 'Took away the ' + noun + ' of ' + M.describe(S.model, x.item);
      },
      // The panel follows: the field goes with the line; the notes' labels follow the line's end.
      done: function (x) {
        renderInspector();
        syncNoteLabels();
        C.renderNotes();
        say(FIELD_HOOKS[x.fld].said(x) + '.');
      }
    };
  }
  FIELD_HOOKS.specializes = generalHooks('specialize', 'specialization');
  FIELD_HOOKS.subsets = generalHooks('subset', 'subsetting');
  // Is Parallel can't be changed while the state holds transitions, as in SysON: its regions would then be joined by
  // them.
  FIELD_HOOKS.parallel = Object.assign(FIELD_HOOKS.parallel || {}, {
    locked: function (x) {
      const ids = M.idsOf(S.model);
      const holds = M.linesOfKind(S.model, 'TransitionUsage').some((r) => M.RELATIONSHIPS.TransitionUsage.owner(S.model, r, ids) === x.item.id);
      return holds ? 'Is Parallel can\'t change while ' + M.describe(S.model, x.item) + ' holds transitions, as in SysON.' : null;
    }
  });

  Object.assign(C, { renderDetails });
})(window.SysMLCanvas);
