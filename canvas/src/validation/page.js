// The Validation view on the page, as SysON's (validation/lib.js has the rules): the Validation button in the bar
// opens a panel on the left listing the diagnostics of the SysML v2 specification's rules for the whole model,
// worked out again whenever the checks run (once the changes pause, and at once for a new model). They are grouped by
// kind, Warning for all of them as in SysON, each kind a section that starts folded, with its count; a section opened
// stays open as the list changes. With none, the panel says "No diagnostic available". As in SysON, a diagnostic is
// plain text, in SysON's form, and the panel follows no selection.
(function (C) {
  'use strict';
  const S = C.state;
  const { M, $, reading } = C;

  const panel = $('validation-panel');
  const button = $('validation');
  const kinds = $('validation-kinds');
  const empty = $('validation-empty');
  S.diagnostics = [];
  const open = new Set();   // the kinds whose section is open, kept as the list is drawn again
  $('validation-about').textContent = 'The SysML v2 specification\'s validation rules that the canvas can check, as SysON runs them: ' +
    M.SPEC_RULES.length + ' of its 388. The others are met by any text the canvas writes, or are about what it doesn\'t make.';

  // The rules' diagnostics, worked out again (render.js's check calls this); the panel is drawn again when they changed.
  function checkRules() {
    const found = reading(() => M.validateSpec(S.model));
    if (JSON.stringify(found) === JSON.stringify(S.diagnostics)) return;
    S.diagnostics = found;
    if (!panel.hidden) renderValidation();
  }
  // The panel: a section per kind, in the order its first diagnostic comes, folded unless it was opened.
  function renderValidation() {
    while (kinds.firstChild) kinds.removeChild(kinds.firstChild);
    empty.hidden = S.diagnostics.length > 0;
    const groups = new Map();
    S.diagnostics.forEach((d) => {
      const kind = d.severity === 'error' ? 'Error' : d.severity === 'info' ? 'Info' : 'Warning';
      if (!groups.has(kind)) groups.set(kind, []);
      groups.get(kind).push(d);
    });
    groups.forEach((list, kind) => {
      const section = document.createElement('details');
      section.className = 'validation-kind';
      section.setAttribute('data-kind', kind);
      section.open = open.has(kind);
      section.addEventListener('toggle', () => { if (section.open) open.add(kind); else open.delete(kind); });
      const summary = document.createElement('summary');
      const name = document.createElement('span');
      name.className = 'validation-kind-name';
      name.textContent = kind;
      const count = document.createElement('span');
      count.className = 'validation-count';
      count.textContent = list.length + (list.length === 1 ? ' diagnostic' : ' diagnostics');
      summary.appendChild(name);
      summary.appendChild(count);
      section.appendChild(summary);
      const ul = document.createElement('ul');
      list.forEach((d) => {
        const li = document.createElement('li');
        li.textContent = d.text;
        ul.appendChild(li);
      });
      section.appendChild(ul);
      kinds.appendChild(section);
    });
  }
  function setValidation(show) {
    if (show) { C.checkNow(); renderValidation(); }
    panel.hidden = !show;
    button.setAttribute('aria-expanded', String(show));
    button.classList.toggle('is-active', show);
  }
  button.addEventListener('click', () => setValidation(panel.hidden));
  $('close-validation').addEventListener('click', () => setValidation(false));

  Object.assign(C, { checkRules, renderValidation });
})(window.SysMLCanvas);
