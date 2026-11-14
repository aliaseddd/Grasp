// The notes in a session and in a state file, and the views a session lists: core/session.ts, core/files.ts and
// core/notes.ts (plan/slice-2.md, section 4, seams 10 and 11; plan/architecture.md, contracts 2, 9 and 15). The
// scaffold's notesOf carries a file's notes through unchanged, so the ten files save as they did; the session's
// `unsaved` follows the notes' mark beside the history's, which is tested here with a stand-in for the notes that
// package 2-7 builds (core.mjs, STAND_IN_NOTES). They run in Node.

import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, test } from 'node:test';
import { EXAMPLE, FIXTURES, STAND_IN_NOTES, clock, lib, loadCore, loadCoreWith, plain, readJSON, readText, stateFiles } from './core.mjs';

const ANNOTATIONS = path.join(FIXTURES, 'annotations.json');
const withNotes = () => loadCoreWith({ 'core/notes': STAND_IN_NOTES });
const sessionOf = (core, file, options = {}) => core.openText(lib, readText(file), { name: path.basename(file) }, { now: clock(), mistake: (error) => { throw error; }, ...options });
const listOf = (value) => (Array.isArray(value) ? value : []);
const rename = (s, id, name) => s.history.edit(() => { s.model.elements.find((e) => e.id === id).name = name; return `Renamed to ${name}`; });

describe('the notes in a session and in a state file', () => {
  test('the ten files save with the notes as they were', async () => {
    const core = await loadCore();
    let notes = 0;
    let archived = 0;
    for (const { name, file } of stateFiles()) {
      const raw = readJSON(file);
      const s = sessionOf(core, file);
      const kept = core.notesOf(s).file();
      assert.deepEqual(plain(kept.notes), listOf(raw.notes), `${name}: the notes must be the file's.`);
      assert.deepEqual(plain(kept.archive), listOf(raw.archive), `${name}: the archive must be the file's.`);
      // By value: seam 11 promises the lists as a state file keeps them, not the same arrays at each call, nor the
      // file's order of a record's keys.
      assert.deepEqual(plain(s.notes), plain(core.notesOf(s).file().notes), `${name}: session.notes is what notesOf(session).file() gives.`);
      assert.deepEqual(plain(s.archive), plain(core.notesOf(s).file().archive), `${name}: session.archive is what notesOf(session).file() gives.`);
      const state = core.stateFile(s);
      assert.deepEqual(plain(state.notes), plain(core.notesOf(s).file().notes), `${name}: a state file's notes come from notesOf(session).file().`);
      assert.deepEqual(plain(state.archive), plain(core.notesOf(s).file().archive), `${name}: a state file's archive comes from notesOf(session).file().`);
      const saved = JSON.parse(core.stateText(s));
      assert.deepEqual(saved.notes, listOf(raw.notes), `${name}: the saved notes must be the file's, key for key.`);
      assert.deepEqual(saved.archive, listOf(raw.archive), `${name}: the saved archive must be the file's, key for key.`);
      assert.equal(s.unsaved, false, `${name}: a file just opened has nothing unsaved.`);
      notes += listOf(raw.notes).length;
      archived += listOf(raw.archive).length;
    }
    assert.ok(notes >= 7 && archived >= 1, 'The ten files hold notes and an archived note.');
  });

  test('the scaffold\'s notesOf carries a file\'s notes through, and tells nobody', async () => {
    const core = await loadCore();
    const s = sessionOf(core, ANNOTATIONS);
    const notes = core.notesOf(s);
    assert.equal(core.notesOf(s), notes, 'notesOf must give the same object at each call for one session.');
    const file = core.fileNotesOf(s);
    assert.deepEqual(plain(file.notes), readJSON(ANNOTATIONS).notes, 'The session keeps the lists the file had.');
    assert.deepEqual(plain(file.archive), readJSON(ANNOTATIONS).archive);
    assert.equal(core.fileNotesOf(s).notes, file.notes, 'fileNotesOf gives the same lists each time.');
    assert.deepEqual(notes.open.map((n) => n.no), [1, 2, 3], 'The open notes are the file\'s.');
    assert.deepEqual(notes.archive.map((n) => n.id), ['n-page-name']);
    assert.equal(notes.open, notes.open, 'The open notes are the same array until a note changes.');
    assert.equal(typeof notes.mark(), 'number', 'The notes have a mark, as the history has.');
    assert.equal(notes.mark(), notes.mark());
    assert.equal(notes.attended, null);
    assert.equal(notes.pointed, null);
    const stop = notes.listen(() => { throw new Error('Nothing changes a note yet, so nobody is told.'); });
    assert.equal(typeof stop, 'function');
    stop();
    // A file with no lists holds no notes.
    const bare = core.openText(lib, JSON.stringify({ model: readJSON(EXAMPLE).model, notes: 'none' }), { name: 'bare.json' });
    assert.deepEqual([core.notesOf(bare).open, core.notesOf(bare).archive, bare.notes, bare.archive].map((list) => [...list]), [[], [], [], []]);
  });

  test('unsaved follows the notes\' mark, and saved() takes both marks', async () => {
    const core = await withNotes();
    const s = sessionOf(core, ANNOTATIONS);
    const notes = core.notesOf(s);
    assert.equal(s.unsaved, false);

    // A change to a note is no undo step, and the file is unsaved.
    const note = notes.add({ type: 'el', id: 'App' });
    assert.equal(s.history.steps.length, 0, 'A note is outside the history.');
    assert.equal(s.unsaved, true, 'A note added makes the file unsaved.');
    s.saved();
    assert.equal(s.unsaved, false, 'saved() with no marks says the file holds the model and the notes as they are now.');

    // The marks read when the file's text was made: what changed since stays unsaved.
    notes.setText(note.id, 'first');
    const mark = s.history.mark();
    const notesMark = notes.mark();
    notes.setText(note.id, 'second');
    s.saved(mark, notesMark);
    assert.equal(s.unsaved, true, 'A note written while the file was being saved is still unsaved.');
    s.saved(mark, notes.mark());
    assert.equal(s.unsaved, false);

    // The model and the notes each count: either mark differing makes the file unsaved.
    rename(s, 'App', 'Application');
    assert.equal(s.unsaved, true);
    s.saved(s.history.mark());
    assert.equal(s.unsaved, false, 'saved(mark) alone takes the notes as they are now.');
    notes.remove(note.id);
    assert.equal(s.unsaved, true);
    s.history.undo();
    s.history.redo();
    assert.equal(s.history.mark(), s.history.mark());
    assert.equal(s.unsaved, true, 'The model is as the file has it again; the notes are not, and neither Undo nor Redo takes a note back.');
    s.saved();
    assert.equal(s.unsaved, false);

    // What is saved is what the notes hold now.
    notes.add({ view: 'v-proof', x: 10, y: 20 });
    const saved = JSON.parse(core.stateText(s));
    assert.equal(saved.notes.length, 4, 'A state file\'s notes are notesOf(session).file()\'s.');
    assert.deepEqual(saved.notes, plain(notes.file().notes));
    assert.deepEqual(plain(s.notes), saved.notes, 'session.notes is what file() gives now.');
  });

  test('a session\'s listeners are told after a change of the notes, as after a change of the model', async () => {
    const core = await withNotes();
    const s = sessionOf(core, ANNOTATIONS);
    const notes = core.notesOf(s);
    const seen = [];
    const stop = s.listen(() => { seen.push(s.unsaved); });
    const note = notes.add({ type: 'el', id: 'Host' });
    assert.deepEqual(seen, [true], 'A note added must tell the session\'s listeners once, with unsaved already true.');
    notes.setText(note.id, 'Why abstract?');
    assert.equal(seen.length, 2);
    rename(s, 'Host', 'Hostess');
    assert.equal(seen.length, 3, 'A change of the model tells them as before.');
    s.saved();
    assert.deepEqual(seen.slice(3), [false], 'saved() tells them, with unsaved false.');
    stop();
    notes.remove(note.id);
    assert.equal(seen.length, 4, 'A listener that stopped is not told.');
  });

  test('saveFile reads both marks before it writes, so a note written during the write stays unsaved', async () => {
    const core = await withNotes();
    const written = [];
    let during = () => {};
    const handle = {
      createWritable: async () => ({
        write: async (text) => { written.push(text); during(); },
        close: async () => {},
        abort: async () => {},
      }),
    };
    const s = core.openText(lib, readText(ANNOTATIONS), { name: 'annotations.json', handle }, { now: clock() });
    const notes = core.notesOf(s);
    const note = notes.add({ type: 'el', id: 'App' });
    assert.equal(await core.saveFile(s), 'handle');
    assert.equal(s.unsaved, false, 'A saved file has nothing unsaved.');
    assert.equal(JSON.parse(written[0]).notes.length, 4, 'The file holds the note.');
    during = () => notes.setText(note.id, 'written while the file was');
    notes.setText(note.id, 'written before');
    await core.saveFile(s);
    assert.equal(JSON.parse(written[1]).notes.at(-1).text, 'written before');
    assert.equal(s.unsaved, true, 'What was written to a note while the file was being written is unsaved.');
  });
});

describe('the views a session lists', () => {
  test('viewsOf gives each view\'s id, name and kind, the same array until a view comes, goes or is renamed', async () => {
    const core = await loadCore();
    const s = sessionOf(core, path.join(FIXTURES, 'grid.json'));
    const views = core.viewsOf(s);
    assert.deepEqual(plain(views), plain(s.model.views).map((v) => ({ id: v.id, name: v.name, kind: v.kind })));
    assert.deepEqual(views.map((v) => [v.id, v.kind]), [['v-proof', 'GeneralView'], ['v-table', 'GridView'], ['v-matrix', 'GridView']]);
    assert.deepEqual(Object.keys(views[0]), ['id', 'name', 'kind'], 'A row holds nothing else of the view.');
    assert.equal(core.viewsOf(s), views, 'The same array while the views are the same.');

    // A change that is no view's coming, going or renaming keeps the array.
    rename(s, 'Host', 'Hostess');
    s.history.edit(() => { s.model.views[0].doc = 'The proof.'; s.model.views[1].layout = {}; return 'Changed two views'; });
    assert.equal(core.viewsOf(s), views);

    // A view renamed, a view added, a view gone: a new array each time, and Undo's too.
    s.history.edit(() => { s.model.views[1].name = 'elements'; return 'Renamed the view'; });
    const renamed = core.viewsOf(s);
    assert.notEqual(renamed, views);
    assert.equal(renamed[1].name, 'elements');
    assert.equal(core.viewsOf(s), renamed);
    s.history.edit(() => { s.model.views.push({ id: 'v-new', kind: 'BrowserView', name: 'view1', doc: '', x: 0, y: 0, layout: {}, options: {} }); return 'Added the view view1'; });
    const added = core.viewsOf(s);
    assert.deepEqual(added.map((v) => v.id), ['v-proof', 'v-table', 'v-matrix', 'v-new']);
    s.history.edit(() => { s.model.views.splice(0, 1); return 'Deleted the view'; });
    assert.deepEqual(core.viewsOf(s).map((v) => v.id), ['v-table', 'v-matrix', 'v-new']);
    s.history.undo();
    assert.deepEqual(plain(core.viewsOf(s)), plain(added), 'Undo brings the view back into the list.');
    s.history.undo();
    s.history.undo();
    assert.deepEqual(plain(core.viewsOf(s)), plain(views));
    assert.notEqual(core.viewsOf((await sessionOf(core, EXAMPLE))), views, 'Another session lists its own views.');
  });
});
