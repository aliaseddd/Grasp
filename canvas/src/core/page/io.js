// Taking the state out (Download state) and bringing it in (Import state).
(function (C) {
  'use strict';
  const S = C.state;
  const {
    M, downloadButton, importButton, fileInput, saved, now, say, editable, plural, isNote, tidyNote, edit,
    modelReplaced, removeNote, stageNote, writeShared
  } = C;

  // ---- Taking the state out and bringing it in.

  function stateFile() {
    return { format: M.FORMAT, revision: saved.model.revision, saved: now(), model: S.model, notes: S.notes, archive: S.archive, changes: S.changes };
  }
  downloadButton.addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(stateFile(), null, 2) + '\n'], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'canvas-state.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    say('Downloading the model and ' + plural(S.notes.length, 'note') + ' as canvas-state.json.');
  });
  // On the published page an import replaces the shared model and every note, so it asks for a second click.
  let importArmed = -Infinity;
  importButton.addEventListener('click', () => {
    if (S.mode === 'shared' && performance.now() - importArmed > 5000) {
      importArmed = performance.now();
      say('Importing replaces the shared model and deletes every note, Claude\'s answers included. Click Import state again to go on.');
      return;
    }
    importArmed = -Infinity;
    fileInput.click();
  });
  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    fileInput.value = '';
    if (!file || !editable()) return;
    file.text().then((raw) => {
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || !data.model) throw new Error('no model');
      const done = edit(() => {
        S.model = M.normalize(data.model);
        const incoming = (Array.isArray(data.notes) ? data.notes : []).filter(isNote).map(tidyNote);
        S.notes.slice().forEach((n) => removeNote(n.id, true));
        S.notes = incoming;
        C.replaceArchive(data.archive);
        S.changes = Array.isArray(data.changes) ? data.changes.slice(-200) : [];
        return 'Imported the state from ' + file.name;
      });
      if (!done) return;
      S.selection = null;
      modelReplaced();
      if (S.mode === 'shared') S.notes.forEach((n) => { stageNote(n.id); writeShared(n, null); });
      say('Imported ' + plural(S.model.elements.length, 'element') + ', ' + plural(S.model.views.length, 'view') + ', and ' + plural(S.notes.length, 'note') + ' from ' + file.name + '.');
    }).catch(() => say(file.name + ' isn\'t a state file from this page.'));
  });
})(window.SysMLCanvas);
