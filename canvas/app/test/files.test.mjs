// Opening and saving a state file: canvas/app/src/core/session.ts and files.ts. A file opens into a session, its model
// read through the library's normalize, so a file of an older version is upgraded as the old page upgrades it; the
// session is saved in the shape of the old page's stateFile(), so the old page, export.mjs, check.sh and save-state.mjs
// read what the new page writes. The example and every fixture, opened and saved with no change, hold the same model,
// notes, archive and code links, and canvas/export.mjs prints each one's pinned text from the saved file.
//
// The files are asked for and written through the browser: the picker where there is one, a file input and a download
// otherwise. Here the browser's part is played by stand-ins; the page's own tests open and save in Chromium.

import assert from 'node:assert/strict';
import { resolveObjectURL } from 'node:buffer';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';
import { EXAMPLE, EXPORT, FIXTURES, clock, lib, loadCore, plain, readJSON, readText, stateFiles } from './core.mjs';

const listOf = (value) => (Array.isArray(value) ? value : []);
const KEYS = ['format', 'revision', 'saved', 'model', 'notes', 'archive', 'changes'];   // the old page's stateFile()

/** Opens a state file as the page does once it has the file's text. */
async function open(file, options = {}) {
  const { openText } = await loadCore();
  return openText(lib, readText(file), { name: path.basename(file) }, { now: clock(), mistake: (error) => { throw error; }, ...options });
}

/** What canvas/export.mjs prints of a state file's text, written to a file of that name: { status, stdout, stderr }. */
function exported(name, text) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'grasp-core-'));
  try {
    const file = path.join(dir, name);
    fs.writeFileSync(file, text);
    const { status, stdout, stderr } = spawnSync(process.execPath, [EXPORT, file], { encoding: 'utf8' });
    return { status, stdout, stderr };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/** Runs fn with the globals given in place of the browser's, and puts back what was there. */
async function withGlobals(globals, fn) {
  const before = Object.fromEntries(Object.keys(globals).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.entries(globals).forEach(([key, value]) => Object.defineProperty(globalThis, key, { value, configurable: true, writable: true }));
  try {
    return await fn();
  } finally {
    Object.entries(before).forEach(([key, descriptor]) => {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    });
  }
}
/** A stand-in for the page's document: the elements made, those in the body, and what each was asked to do. */
function fakeDocument() {
  const body = { children: [] };
  const made = [];
  const document = {
    body,
    made,
    createElement(tag) {
      const listeners = new Map();
      const node = {
        tag,
        attributes: {},
        clicks: 0,
        setAttribute(name, value) { node.attributes[name] = String(value); },
        addEventListener(type, listener) { listeners.set(type, [...(listeners.get(type) ?? []), listener]); },
        /** Tells the node's listeners of an event, as the browser does. */
        fire(type) { (listeners.get(type) ?? []).forEach((listener) => listener({ type, target: node })); },
        click() { node.clicks += 1; if (node.onclick) node.onclick(); },
        remove() { body.children = body.children.filter((child) => child !== node); },
      };
      made.push(node);
      return node;
    },
  };
  body.appendChild = (node) => { body.children.push(node); return node; };
  return document;
}
/** A stand-in for a file's handle from the picker: it reads `text`, and keeps what is written through it (written). */
function fakeHandle(name, text) {
  const handle = {
    kind: 'file',
    name,
    written: [],
    closed: 0,
    async getFile() { return new File([text], name, { type: 'application/json' }); },
    async createWritable() {
      return {
        async write(data) { handle.written.push(data); },
        async close() { handle.closed += 1; },
      };
    },
  };
  return handle;
}

describe('opening and saving a state file', () => {
  const files = stateFiles();

  test('the tests open the example and nine fixtures: a file of every version of the format, and files with notes, an archive and code links', () => {
    assert.equal(files[0].file, EXAMPLE);
    assert.ok(files.length >= 10, `the example and at least nine fixtures: ${files.map((f) => f.name).join(', ')}`);
    const states = files.map(({ file }) => readJSON(file));
    const versions = new Set(states.map((state) => lib.versionOf(state.model)));
    for (let version = 1; version <= lib.VERSION; version += 1) assert.ok(versions.has(version), `a file saved in version ${version}`);
    // So that none of what the files must keep is kept only because no file has any.
    assert.ok(states.some((state) => listOf(state.notes).length), 'a file with notes');
    assert.ok(states.some((state) => listOf(state.archive).length), 'a file with archived notes');
    assert.ok(states.some((state) => state.model.elements.some((e) => listOf(e.code).length)), 'a file with code links');
    assert.ok(states.some((state) => Array.isArray(state.changes)), 'a file with a log');
    assert.ok(states.some((state) => state.changes === undefined && state.archive === undefined), 'and one with neither a log nor an archive');
    // Each file, before the core has touched it, says what its pinned text says: so a saved file that doesn't is the
    // core's doing.
    for (const { name, file, pinned } of files) {
      const state = readJSON(file);
      const text = lib.toSysML(lib.normalize(state.model), listOf(state.notes), listOf(state.archive));
      assert.equal(text, readText(pinned), `${name} exports the text pinned in ${path.basename(pinned)}`);
    }
  });

  for (const { name, file, pinned } of files) {
    test(`${name}: opened and saved with no change, it holds the same model, notes, archive and code links, and exports its pinned text`, async () => {
      const { stateFile, stateText } = await loadCore();
      const original = readJSON(file);
      const read = lib.normalize(original.model);   // the model as the old page reads it from the file
      const session = await open(file);
      assert.equal(session.unsaved, false, 'a file just opened has no unsaved changes');
      const text = stateText(session);
      const saved = JSON.parse(text);

      // The shape of the old page's stateFile(), written as its Download state writes it.
      assert.deepEqual(Object.keys(saved), KEYS);
      assert.equal(text, JSON.stringify(saved, null, 2) + '\n', 'indented by two spaces, with a line break at the end');
      assert.equal(saved.format, lib.FORMAT);
      assert.equal(saved.revision, read.revision, 'the revision of the model the file held');
      assert.equal(saved.saved, '2026-11-12T12:00:00.000Z', 'the time of saving');
      assert.equal(JSON.stringify(stateFile(session).model), JSON.stringify(saved.model));

      // The same model: the one the library reads from the file, which reads the same when it is read again.
      assert.equal(JSON.stringify(saved.model), JSON.stringify(read), 'the saved model is the model the library reads from the file');
      assert.equal(JSON.stringify(lib.normalize(saved.model)), JSON.stringify(read), 'and the library reads the same model from the saved file');
      assert.equal(saved.model.format, lib.FORMAT, 'in the current version of the format');
      if (lib.versionOf(original.model) === lib.VERSION) {
        // A file saved in the current version says nothing that the saved file doesn't say in the same words: every
        // element, relationship and view is there, in order, with every field the file gave it.
        for (const list of ['elements', 'relationships', 'views']) {
          assert.deepEqual(saved.model[list].map((x) => x.id), original.model[list].map((x) => x.id), `${list}: the same ones in the same order`);
          original.model[list].forEach((was, i) => {
            for (const key of Object.keys(was)) assert.deepEqual(saved.model[list][i][key], was[key], `${list} ${was.id}: ${key}`);
          });
        }
        assert.deepEqual(saved.model.package, original.model.package);
      }

      // The notes, the archive and the log, as the file has them; a list the file doesn't have is an empty one.
      assert.deepEqual(saved.notes, listOf(original.notes));
      assert.deepEqual(saved.archive, listOf(original.archive));
      assert.deepEqual(saved.changes, listOf(original.changes));

      // The code links are in the model, on their elements.
      const links = original.model.elements.filter((e) => listOf(e.code).length);
      for (const was of links) assert.deepEqual(saved.model.elements.find((e) => e.id === was.id).code, was.code, `the code links of ${was.id}`);

      assert.deepEqual(exported(name, text), { status: 0, stdout: readText(pinned), stderr: '' },
        'canvas/export.mjs prints the pinned text from the saved file');

      // The saved file, opened and saved at the same time of day, is the same file, byte for byte.
      const { openText } = await loadCore();
      const again = openText(lib, text, { name }, { now: clock() });
      assert.equal(stateText(again), text);
    });
  }

  test('a file opens into a session with an empty history, in the current version of the format', async () => {
    const session = await open(path.join(FIXTURES, 'format1.json'));
    assert.equal(session.name, 'format1.json');
    assert.equal(session.handle, null, 'a file that did not come through the picker has no handle');
    assert.equal(session.model, session.history.model, 'the session\'s model is the history\'s');
    assert.equal(session.model.format, 'grasp/2', 'a file saved in version 1 is upgraded as it is read');
    assert.equal(session.model.views.length, 1, 'into its one view');
    assert.equal(session.revision, '2026-11-06T06:40:00.000Z');
    assert.equal(session.history.steps.length, 0, 'opening a file is not a change: there is nothing to undo');
    assert.equal(session.history.undo(), null);
    assert.equal(session.history.redo(), null);
    assert.deepEqual(session.changes, [], 'and nothing is logged');
    assert.equal(session.unsaved, false);

    // The log the file carries goes on: the last 200 entries of it.
    const { openText } = await loadCore();
    const state = readJSON(EXAMPLE);
    state.changes = Array.from({ length: 205 }, (_, i) => ({ at: '2026-11-06T09:00:00.000Z', text: 'Change ' + (i + 1) }));
    const logged = openText(lib, JSON.stringify(state), { name: 'logged.json' });
    assert.equal(logged.changes.length, 200);
    assert.equal(logged.changes[0].text, 'Change 6');
    assert.equal(logged.changes.at(-1).text, 'Change 205');
  });

  test('a session says whether the file has unsaved changes, and tells its listeners', async () => {
    const session = await open(EXAMPLE);
    let told = 0;
    const stop = session.listen(() => { told += 1; });
    const host = session.model.elements.find((e) => e.id === 'Host');
    session.history.edit(() => { host.name = 'Hosting'; return 'Renamed to part def Hosting'; });
    assert.equal(session.unsaved, true, 'a change is an unsaved change');
    assert.equal(told, 1, 'the listeners hear of every change');
    session.history.undo();
    assert.equal(session.unsaved, false, 'taken back, the model is as the file has it');
    session.history.redo();
    assert.equal(session.unsaved, true);
    assert.equal(told, 3);

    session.saved();
    assert.equal(session.unsaved, false, 'once the file is written, nothing is unsaved');
    assert.equal(told, 4, 'and the listeners hear that too');
    session.history.undo();
    assert.equal(session.unsaved, true, 'Undo after a save leaves the saved file behind');
    session.history.redo();
    assert.equal(session.unsaved, false, 'and Redo comes back to it');

    // A run that was no step leaves the file as it was saved.
    const place = session.model.views[0].layout.Host;
    session.history.edit(() => { place.x += 40; return 'Moved part def Hosting'; }, 'move:Host');
    assert.equal(session.unsaved, true);
    session.history.edit(() => { place.x -= 40; return 'Moved part def Hosting'; }, 'move:Host');
    session.history.endEdit();
    assert.equal(session.unsaved, false);

    stop();
    const heard = told;
    session.history.edit(() => { host.doc = 'changed'; return 'Set the doc'; });
    assert.equal(told, heard, 'a listener that stopped listening hears no more');
    assert.equal(session.unsaved, true);
  });

  test('what was changed is what is saved, with the log of what was done', async () => {
    const { stateText, openText } = await loadCore();
    const session = await open(EXAMPLE);
    const unchanged = JSON.parse(stateText(session));
    const history = session.history;
    history.edit(() => { session.model.elements.find((e) => e.id === 'Host').name = 'Hosting'; return 'Renamed to part def Hosting'; });
    history.edit(() => { Object.assign(session.model.views[0].layout.Host, { w: 400, h: 160 }); return 'Resized part def Hosting'; });
    history.edit(() => { session.model.package.doc = 'One app.'; return 'Set the package\'s doc'; });
    history.undo();
    const saved = JSON.parse(stateText(session));
    assert.equal(saved.model.elements.find((e) => e.id === 'Host').name, 'Hosting');
    assert.deepEqual(saved.model.views[0].layout.Host, { x: 32, y: 400, w: 400, h: 160 }, 'the new size is in the view\'s layout');
    assert.equal(saved.model.package.doc, unchanged.model.package.doc, 'what Undo took back is not');
    assert.deepEqual(saved.changes.map((entry) => entry.text),
      ['Renamed to part def Hosting', 'Resized part def Hosting', 'Set the package\'s doc', 'Undid: Set the package\'s doc']);
    assert.deepEqual(saved.notes, unchanged.notes);
    assert.deepEqual(saved.archive, unchanged.archive);
    assert.equal(saved.revision, unchanged.revision, 'the revision stays the one of the file that was opened');
    assert.equal(JSON.stringify(lib.normalize(saved.model)), JSON.stringify(saved.model), 'the library reads the saved model as it is');
    const out = exported('changed.json', stateText(session));
    assert.equal(out.status, 0, out.stderr);
    assert.match(out.stdout, /abstract part def Hosting /, 'and export.mjs prints the change');

    // Opened again, the saved file is the model as it was saved, with nothing to undo.
    const again = openText(lib, stateText(session), { name: 'changed.json' });
    assert.equal(JSON.stringify(again.model), JSON.stringify(session.model));
    assert.equal(again.history.steps.length, 0);
    assert.equal(again.changes.length, 4);
  });

  test('the notes and the archive are written as the file has them', async () => {
    const { openText, stateText } = await loadCore();
    const state = readJSON(path.join(FIXTURES, 'annotations.json'));
    // A note with a field the old page doesn't know, and one it would drop: the new page edits no note in this slice,
    // so it changes none.
    state.notes.push({ id: 'n-extra', no: 9, target: 'Host', text: 'Kept as it is.', colour: 'teal' }, { text: 'no id' });
    const session = openText(lib, JSON.stringify(state), { name: 'annotations.json' });
    assert.deepEqual(plain(session.notes), state.notes);
    assert.deepEqual(plain(session.archive), state.archive);
    const saved = JSON.parse(stateText(session));
    assert.deepEqual(saved.notes, state.notes);
    assert.deepEqual(saved.archive, state.archive);
    // What isn't a list is no notes, as on the old page.
    const odd = openText(lib, JSON.stringify({ model: state.model, notes: 'none', archive: null, changes: {} }), { name: 'odd.json' });
    assert.deepEqual([odd.notes, odd.archive, odd.changes], [[], [], []]);
  });

  test('a file that is not a state file is refused, in a sentence that names it', async () => {
    const { openText } = await loadCore();
    const refuse = (text, message) => assert.throws(() => openText(lib, text, { name: 'notes.json' }), { name: 'Error', message });
    refuse('not JSON at all', 'notes.json isn\'t a state file: it isn\'t JSON.');
    refuse('', 'notes.json isn\'t a state file: it isn\'t JSON.');
    const none = ['null', '[]', '"model"', '{}', '{ "notes": [] }', '{ "model": null }', '{ "model": 5 }', '{ "model": "Model" }', '{ "model": [] }'];
    for (const text of [...none, '{ "model/current": { "layout": 2 } }']) refuse(text, 'notes.json isn\'t a state file: it holds no model.');
    const newer = JSON.stringify({ model: { format: 'grasp/' + (lib.VERSION + 1), elements: [] } });
    refuse(newer, `notes.json was saved in version ${lib.VERSION + 1} of the format, and this page reads up to version ${lib.VERSION}. ` +
      'Open it with a newer Grasp.');
    // A model that names no version is one written by hand, in the version of the day, as the library reads it.
    assert.equal(openText(lib, '{ "model": {} }', { name: 'bare.json' }).model.format, lib.FORMAT);
    // A byte order mark at the file's start, which some editors write, is no part of its JSON.
    assert.equal(openText(lib, '﻿' + readText(EXAMPLE), { name: 'marked.json' }).model.elements.length, 13);
  });
});

describe('asking the browser for the file, and writing it', () => {
  test('where the browser has the picker, openFile asks it, and the session keeps the file\'s handle', async () => {
    const { openFile, hasPicker } = await loadCore();
    const handle = fakeHandle('stronghold-proof.json', readText(EXAMPLE));
    const asked = [];
    const document = fakeDocument();
    const window = { showOpenFilePicker: async (options) => { asked.push(options); return [handle]; } };
    const session = await withGlobals({ window, document }, async () => {
      assert.equal(hasPicker(), true);
      return openFile(lib);
    });
    assert.equal(asked.length, 1);
    assert.equal(asked[0].multiple, false, 'one file');
    assert.deepEqual(asked[0].types.map((type) => type.accept), [{ 'application/json': ['.json'] }], 'a JSON file');
    assert.deepEqual(document.made, [], 'no file input is made');
    assert.equal(session.name, 'stronghold-proof.json');
    assert.equal(session.handle, handle);
    assert.equal(session.model.elements.length, 13);
    assert.equal(session.history.steps.length, 0);
  });

  test('where it has none, openFile asks through a file input, which the tests find by its data-testid', async () => {
    const { openFile, hasPicker } = await loadCore();
    const document = fakeDocument();
    const session = await withGlobals({ window: {}, document }, async () => {
      assert.equal(hasPicker(), false);
      const opening = openFile(lib);
      assert.equal(document.made.length, 1);
      const [input] = document.made;
      assert.equal(input.tag, 'input');
      assert.equal(input.type, 'file');
      assert.equal(input.accept, '.json,application/json');
      assert.equal(input.hidden, true);
      assert.equal(input.attributes['data-testid'], 'file-input');
      assert.deepEqual(document.body.children, [input], 'the input is in the page while the person chooses');
      assert.equal(input.clicks, 1, 'and is clicked, which opens the browser\'s own dialog');
      input.files = [new File([readText(path.join(FIXTURES, 'grid.json'))], 'grid.json', { type: 'application/json' })];
      input.fire('change');
      return opening;
    });
    assert.deepEqual(document.body.children, [], 'the input is gone once the file is chosen');
    assert.equal(session.name, 'grid.json');
    assert.equal(session.handle, null, 'a file from an input has no handle');
    assert.equal(session.model.views.length, 3);
  });

  test('a person who closes the dialog opens nothing, and a file that is no state file is refused', async () => {
    const { openFile } = await loadCore();
    const abort = Object.assign(new Error('The user aborted a request.'), { name: 'AbortError' });
    assert.equal(await withGlobals({ window: { showOpenFilePicker: async () => { throw abort; } }, document: fakeDocument() }, () => openFile(lib)), null);
    const denied = Object.assign(new Error('Not allowed'), { name: 'SecurityError' });
    await assert.rejects(withGlobals({ window: { showOpenFilePicker: async () => { throw denied; } }, document: fakeDocument() }, () => openFile(lib)), denied,
      'any other failure of the picker goes on to the caller');

    const document = fakeDocument();
    const closed = await withGlobals({ window: {}, document }, async () => {
      const opening = openFile(lib);
      document.made[0].fire('cancel');
      return opening;
    });
    assert.equal(closed, null);
    assert.deepEqual(document.body.children, []);

    const handle = fakeHandle('readme.json', '{ "name": "not a model" }');
    await assert.rejects(withGlobals({ window: { showOpenFilePicker: async () => [handle] }, document: fakeDocument() }, () => openFile(lib)),
      { message: 'readme.json isn\'t a state file: it holds no model.' });
  });

  test('saveFile writes the file back through its handle, when it came through the picker', async () => {
    const { openFile, saveFile, stateText } = await loadCore();
    const handle = fakeHandle('stronghold-proof.json', readText(EXAMPLE));
    const document = fakeDocument();
    const window = { showOpenFilePicker: async () => [handle] };
    await withGlobals({ window, document }, async () => {
      const session = await openFile(lib, { now: clock() });
      session.history.edit(() => { session.model.elements.find((e) => e.id === 'Host').name = 'Hosting'; return 'Renamed to part def Hosting'; }, 'name:Host');
      assert.equal(session.unsaved, true);
      assert.equal(await saveFile(session), 'handle', 'saveFile says where the file went');
      assert.equal(handle.written.length, 1);
      assert.equal(handle.closed, 1, 'the file is written and closed');
      const saved = JSON.parse(handle.written[0]);
      assert.deepEqual(Object.keys(saved), KEYS);
      assert.equal(saved.model.elements.find((e) => e.id === 'Host').name, 'Hosting');
      assert.deepEqual(saved.changes.map((entry) => entry.text), ['Renamed to part def Hosting'],
        'a run still open is ended first, so the log says what the file holds');
      assert.equal(session.history.steps.at(-1).key, null);
      assert.equal(session.unsaved, false, 'and then nothing is unsaved');
      assert.deepEqual(document.made, [], 'nothing is downloaded');
      assert.equal(handle.written[0], stateText(session).replace(/"saved": "[^"]+"/, `"saved": "${saved.saved}"`), 'the text is stateText()\'s');
    });
  });

  test('saveFile downloads the file under its name, when it came through a file input', async () => {
    const { openText, saveFile } = await loadCore();
    const document = fakeDocument();
    const later = [];
    const session = openText(lib, readText(EXAMPLE), { name: 'stronghold-proof.json' }, { now: clock() });
    session.history.edit(() => { Object.assign(session.model.views[0].layout.Host, { w: 400, h: 160 }); return 'Resized part def Host'; });
    let link = null;
    let text = null;
    await withGlobals({ window: {}, document, setTimeout: (fn, ms) => { later.push({ fn, ms }); return 0; } }, async () => {
      assert.equal(await saveFile(session), 'download');
      [link] = document.made;
      text = await resolveObjectURL(link.href).text();
    });
    assert.equal(link.tag, 'a');
    assert.equal(link.download, 'stronghold-proof.json', 'under the name of the file that was opened');
    assert.equal(link.clicks, 1);
    assert.deepEqual(document.body.children, [], 'the link is gone again');
    const saved = JSON.parse(text);
    assert.deepEqual(Object.keys(saved), KEYS);
    assert.deepEqual(saved.model.views[0].layout.Host, { x: 32, y: 400, w: 400, h: 160 });
    assert.equal(session.unsaved, false);
    assert.deepEqual(exported('stronghold-proof.json', text), { status: 0, stdout: readText(path.join(FIXTURES, 'format1.sysml')), stderr: '' },
      'a box\'s size is not in the text, so export.mjs prints the example\'s pinned text from it');
    assert.equal(later.length, 1, 'the download\'s URL is let go a little later');
    later[0].fn();
    assert.equal(resolveObjectURL(link.href), undefined);
  });

  test('a file that could not be written stays unsaved, and so does a change made while it was being written', async () => {
    const { openFile, saveFile } = await loadCore();
    const handle = fakeHandle('stronghold-proof.json', readText(EXAMPLE));
    const refused = Object.assign(new Error('The request is not allowed.'), { name: 'NotAllowedError' });
    const createWritable = handle.createWritable;
    handle.createWritable = async () => { throw refused; };
    await withGlobals({ window: { showOpenFilePicker: async () => [handle] }, document: fakeDocument() }, async () => {
      const session = await openFile(lib);
      const change = (doc) => session.history.edit(() => { session.model.package.doc = doc; return 'Set the package\'s doc'; });
      change('One app.');
      await assert.rejects(saveFile(session), refused, 'the browser\'s refusal goes on to the caller');
      assert.equal(session.unsaved, true);

      // The browser may ask the person before it writes: a change made meanwhile is not in the file.
      handle.createWritable = async () => { change('One app, changed while the browser asked.'); return createWritable(); };
      assert.equal(await saveFile(session), 'handle');
      assert.equal(JSON.parse(handle.written[0]).model.package.doc, 'One app.', 'the file holds the model as it was when Save was asked for');
      assert.equal(session.unsaved, true, 'so the later change is still unsaved');
      handle.createWritable = createWritable;
      await saveFile(session);
      assert.equal(session.unsaved, false);
    });
  });

  test('a file input still waiting for a choice gives way to the next one', async () => {
    const { chooseFile } = await loadCore();
    const document = fakeDocument();
    await withGlobals({ window: {}, document }, async () => {
      const first = chooseFile();    // the person closes this dialog, and the browser says nothing
      const second = chooseFile();
      assert.equal(await first, null);
      assert.equal(document.made.length, 2);
      assert.deepEqual(document.body.children, [document.made[1]], 'one input is in the page at a time');
      const file = new File(['{}'], 'chosen.json');
      document.made[1].files = [file];
      document.made[1].fire('change');
      assert.deepEqual(await second, { file, handle: null });
      assert.deepEqual(document.body.children, []);
    });
  });
});
