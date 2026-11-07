// The page's state: what the file was saved with, what the page shows and does now (S), and the small helpers
// every script uses to read and say things.
(function (C) {
  'use strict';
  const S = C.state;
  const { M, status, palette, str } = C;

  // ---- State.

  const saved = readSaved();     // what this file holds: the model and the notes as last saved
  // What the page shows and does now, which the scripts share as S.name. The scripts it belongs to set the rest:
  // the camera (camera.js), the pause before a save (changes.js), the palette's view kind (tools.js), and the
  // archived notes (annotations).
  S.model = saved.model;
  S.notes = saved.notes.slice();
  S.changes = [];                // what was done since the last save, for Claude to read
  S.history = [];                // the model before each change made here, newest last, for Undo
  S.selection = null;            // { type: 'el' | 'rel' | 'view', id }
  S.active = S.model.views[0].id; // the view tools add into
  S.tool = null;                 // a kind to add, a relationship to draw, or null to select and move
  S.pending = null;              // the first end of a relationship being drawn
  S.mode = 'loading';            // 'shared': the page's store · 'local': this browser · 'read': look only
  S.layout = null;               // where everything is, in every view, computed by each render
  S.problems = [];               // what validate found last, shown on the drawing and in the panel
  S.problemCursor = -1;          // which problem the HUD's button showed last
  S.drag = null;                 // the element or view being moved
  S.db = null;
  S.heardNotes = false;          // whether the shared store has answered about the notes

  function now() { return new Date().toISOString(); }
  function say(message) { status.textContent = message; }
  function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }
  function editable() { return S.mode === 'shared' || S.mode === 'local'; }
  function f(n) { return (Math.round(n * 100) / 100).toString(); }
  function newId(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }
  function paletteButtons() { return Array.from(palette.querySelectorAll('button[data-tool]')); }

  function readJSON(id) {
    const block = document.getElementById(id);
    try { return block ? JSON.parse(block.textContent) : null; } catch (error) { return null; }
  }
  // A note from the store or a file: an id, a text, and a target (the id of an element or a line), or no target (null)
  // and a place on the plane, x and y, for a note that floats free (the annotations slice draws and moves those).
  function isNote(n) {
    return !!n && typeof n === 'object' && typeof n.id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(n.id) && typeof n.text === 'string' &&
      (typeof n.target === 'string' || (n.target === null && Number.isFinite(n.x) && Number.isFinite(n.y)));
  }
  function tidyNote(n) {
    const created = str(n.created) || now();
    const t = {
      id: n.id, no: n.no >= 1 ? Math.floor(n.no) : 0, target: n.target, targetLabel: str(n.targetLabel), text: n.text,
      by: n.by === 'claude' ? 'claude' : 'user', created: created, updated: str(n.updated) || created,
      response: str(n.response), resolved: n.resolved === true
    };
    if (n.target === null) { t.x = n.x; t.y = n.y; }
    return t;
  }
  // An archived note from the store or a file: a note plus when it was archived and the resolution it was archived with.
  function tidyArchived(n) {
    return Object.assign(tidyNote(n), { archived: str(n.archived) || str(n.updated) || now(), resolution: str(n.resolution) });
  }
  function readSaved() {
    const data = readJSON('saved-notes');
    return {
      model: M.normalize(readJSON('model')),
      notes: data && Array.isArray(data.notes) ? data.notes.filter(isNote).map(tidyNote) : [],
      archive: data && Array.isArray(data.archive) ? data.archive.filter(isNote).map(tidyArchived) : [],
      saved: data && typeof data.saved === 'string' ? data.saved : null
    };
  }
  function byNumber(a, b) { return (a.no - b.no) || (a.created < b.created ? -1 : a.created > b.created ? 1 : 0); }
  function nextNumber() { return S.notes.concat(S.archive).reduce((top, n) => Math.max(top, n.no || 0), 0) + 1; }
  function noteById(id) { return S.notes.find((n) => n.id === id) || null; }
  function relById(id) { return S.model.relationships.find((r) => r.id === id) || null; }
  function viewById(id) { return S.model.views.find((v) => v.id === id) || null; }
  function activeView() { return viewById(S.active) || S.model.views[0]; }
  function viewLayout(id) { return S.layout ? S.layout.views.get(id) || null : null; }
  // The view an element or line is drawn in that the page would rather point at: the active one, else the first.
  function viewShowing(id) {
    const list = S.layout ? S.layout.where.get(id) || [] : [];
    return list.indexOf(S.active) >= 0 ? S.active : (list[0] || null);
  }
  function rendererFor(view) { return C.RENDERERS[M.VIEW_KINDS[view.kind].renderer] || C.RENDERERS.pending; }

  Object.assign(C, {
    saved, now, say, clamp, editable, f, newId, plural, paletteButtons, isNote, tidyNote, byNumber, nextNumber,
    noteById, relById, viewById, activeView, viewLayout, viewShowing, rendererFor, tidyArchived
  });
})(window.SysMLCanvas);
