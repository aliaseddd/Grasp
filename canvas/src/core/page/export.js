// The export panel: the model as textual SysML v2, with what keeps it from being correct.
(function (C) {
  'use strict';
  const S = C.state;
  const { M, $, exportPanel, exportText, exportProblems, say, plural } = C;

  // ---- The export: the model as textual SysML v2.

  function openExport() {
    C.checkNow(); // the export says what keeps it from being correct now, when checks wait for the pause
    while (exportProblems.firstChild) exportProblems.removeChild(exportProblems.firstChild);
    S.problems.forEach((p) => {
      const li = document.createElement('li');
      li.textContent = p.message;
      exportProblems.appendChild(li);
    });
    exportText.value = M.toSysML(S.model, S.notes, S.archive);
    exportPanel.hidden = false;
    say(S.problems.length ? plural(S.problems.length, 'problem') + ' to fix before this is correct SysML.' : '');
  }
  function closeExport() { exportPanel.hidden = true; document.querySelector('.stage').classList.remove('has-export'); }
  $('export').addEventListener('click', () => {
    if (!exportPanel.hidden) { closeExport(); return; }
    openExport();
    document.querySelector('.stage').classList.add('has-export');
  });
  $('close-export').addEventListener('click', closeExport);
  $('copy-export').addEventListener('click', () => {
    const text = exportText.value;
    const byHand = () => { exportText.focus(); exportText.select(); say('This browser wouldn\'t copy for the page. The text is selected: copy it from there.'); };
    try { navigator.clipboard.writeText(text).then(() => say('Copied the model as textual SysML v2.'), byHand); } catch (error) { byHand(); }
  });
})(window.SysMLCanvas);
