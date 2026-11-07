// export.mjs and save-state.mjs take a dump of the published page's store (its documents' bodies by path, as Claude
// reads them and as the tests' __store.dump() gives them) as well as a state file, and put the model together with the
// library, as the page does. The same state as a state file and as a dump exports the same text and saves the same
// state.json and index.html. save-state.mjs runs on copies of the canvas, each in a folder of its own.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadLib } from '../export.mjs';

const CANVAS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURES = path.join(CANVAS, 'test', 'fixtures');
const EXAMPLE = path.join(CANVAS, 'examples', 'stronghold-proof.json');
const lib = loadLib();
const folders = [];
const folder = (prefix) => { const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix)); folders.push(dir); return dir; };
const plain = (value) => JSON.parse(JSON.stringify(value));
const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJSON = (file, value) => { fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n'); return file; };
const run = (dir, script, ...args) => spawnSync(process.execPath, [path.join(dir, script), ...args], {
  encoding: 'utf8', env: Object.assign({}, process.env, { CANVAS_REVISION: '2026-11-07T12:00:00.000Z' }),
});

/** A copy of what save-state.mjs reads and writes: the scripts, src/, state.json and index.html. */
function copyCanvas() {
  const dir = folder('canvas-dump-');
  for (const name of ['build.mjs', 'export.mjs', 'save-state.mjs', 'state.json', 'index.html']) fs.copyFileSync(path.join(CANVAS, name), path.join(dir, name));
  fs.cpSync(path.join(CANVAS, 'src'), path.join(dir, 'src'), { recursive: true });
  return dir;
}
/**
 * The store's documents for a state, as the page would hold them: the model, normalized as the page holds it, in
 * layout 2 (based on `baseRevision`), or whole in model/working when `working`; each note and archived note a document
 * named by its id.
 */
function dumpOf(state, baseRevision, { working = false } = {}) {
  const model = plain(lib.normalize(state.model));
  const dump = {};
  if (working) {
    dump['model/working'] = { baseRevision, model, changes: [], updated: '2026-11-07T10:00:00.000Z' };
  } else {
    const split = lib.splitModel(model);
    dump['model/current'] = plain(lib.storeHead(split, { baseRevision, changes: [{ at: '2026-11-07T10:00:00.000Z', text: 'Drew it' }], updated: '2026-11-07T10:00:00.000Z' }));
    for (const part of split.parts) dump[`model/current/parts/${part.id}`] = JSON.parse(part.text);
  }
  for (const [collection, list] of [['notes', state.notes], ['archive', state.archive]]) {
    for (const n of list || []) {
      const body = Object.assign({}, n);
      delete body.id;
      dump[`${collection}/${n.id}`] = body;
    }
  }
  return dump;
}

describe('a dump of the store, read by export.mjs and save-state.mjs', () => {
  after(() => folders.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })));

  test('export.mjs prints the text each fixture pins, from a dump of the store holding it', () => {
    const dir = folder('canvas-dumps-');
    const revision = readJSON(path.join(CANVAS, 'state.json')).model.revision;
    for (const name of fs.readdirSync(FIXTURES).filter((n) => n.endsWith('.json')).sort()) {
      const state = readJSON(path.join(FIXTURES, name));
      const pinned = fs.readFileSync(path.join(FIXTURES, name.replace(/\.json$/, '.sysml')), 'utf8');
      for (const working of [false, true]) {
        const file = writeJSON(path.join(dir, `${working ? 'working' : 'current'}-${name}`), dumpOf(state, revision, { working }));
        const result = run(CANVAS, 'export.mjs', file);
        assert.equal(result.status, 0, `${name} from ${working ? 'model/working' : 'model/current'}: ${result.stderr}`);
        assert.equal(result.stdout, pinned, `${name}, from a dump holding it in ${working ? 'model/working' : 'model/current'}, exports its pinned text`);
        assert.doesNotMatch(result.stderr, /based on revision/, 'a model based on state.json\'s revision gets no note');
      }
    }
    const other = writeJSON(path.join(dir, 'other.json'), dumpOf(readJSON(path.join(FIXTURES, 'grid.json')), 'another-revision'));
    const result = run(CANVAS, 'export.mjs', other);
    assert.equal(result.status, 0);
    assert.match(result.stderr, /based on revision another-revision, not state\.json's/, 'a model of another revision is exported with a note saying the page doesn\'t show it');
  });

  test('save-state.mjs saves the same state.json and index.html from a dump of the store as from a state file', () => {
    // The dump is based on the saved model's revision; what it holds is the Stronghold example, with elements to pin
    // notes on, changed as if on the published page.
    const saved = readJSON(path.join(CANVAS, 'state.json'));
    const state = plain(readJSON(EXAMPLE));
    state.model.package.doc = 'Changed on the published page.';
    state.notes = [
      { id: 'n1', no: 1, target: state.model.elements[0].id, targetLabel: '', text: 'Is this right?', by: 'user', created: '2026-11-07T09:00:00.000Z', updated: '2026-11-07T09:00:00.000Z', response: 'Yes.', resolved: true },
      { id: 'n2', no: 2, target: null, x: 40, y: 60, targetLabel: '', text: 'A free note', by: 'user', created: '2026-11-07T09:01:00.000Z', updated: '2026-11-07T09:01:00.000Z', response: '', resolved: false },
    ];
    state.archive = [{ id: 'n0', no: 3, target: null, x: 0, y: 0, targetLabel: '', text: 'Old', by: 'claude', created: '2026-11-06T09:00:00.000Z', updated: '2026-11-06T09:00:00.000Z', response: 'Done', resolved: true, archived: '2026-11-06T10:00:00.000Z', resolution: 'Done' }];

    const fromFile = copyCanvas();
    let result = run(fromFile, 'save-state.mjs', writeJSON(path.join(fromFile, 'canvas-state.json'), state));
    assert.equal(result.status, 0, result.stderr);
    for (const working of [false, true]) {
      const fromDump = copyCanvas();
      result = run(fromDump, 'save-state.mjs', writeJSON(path.join(fromDump, 'store.json'), dumpOf(state, saved.model.revision, { working })));
      assert.equal(result.status, 0, result.stderr);
      assert.match(result.stdout, /Saved \d+ elements.*2 notes.*and 1 archived notes/, result.stdout);
      for (const name of ['state.json', 'index.html']) {
        assert.equal(fs.readFileSync(path.join(fromDump, name), 'utf8'), fs.readFileSync(path.join(fromFile, name), 'utf8'),
          `${name} is the same saved from the dump (${working ? 'model/working' : 'model/current'}) as from the state file`);
      }
    }
    assert.equal(readJSON(path.join(fromFile, 'state.json')).model.package.doc, 'Changed on the published page.', 'the change was saved');
  });

  test('save-state.mjs refuses a dump whose model the page doesn\'t show, or that holds none, and writes nothing', () => {
    const dir = copyCanvas();
    const before = fs.readFileSync(path.join(dir, 'state.json'), 'utf8');
    const state = readJSON(path.join(dir, 'state.json'));
    let result = run(dir, 'save-state.mjs', writeJSON(path.join(dir, 'other.json'), dumpOf(state, 'another-revision')));
    assert.equal(result.status, 1);
    assert.match(result.stderr, /based on revision another-revision, not state\.json's .*Nothing was written\./);
    const head = dumpOf(state, state.model.revision);
    delete head[Object.keys(head).find((key) => key.startsWith('model/current/parts/'))];
    result = run(dir, 'save-state.mjs', writeJSON(path.join(dir, 'lost.json'), head));
    assert.equal(result.status, 1);
    assert.match(result.stderr, /names a part the dump doesn't hold.*Nothing was written\./);
    result = run(dir, 'save-state.mjs', writeJSON(path.join(dir, 'notes.json'), { 'notes/n1': { no: 1, target: null, x: 0, y: 0, text: 't' } }));
    assert.equal(result.status, 1);
    assert.match(result.stderr, /holds no model, so nothing was written/);
    assert.equal(fs.readFileSync(path.join(dir, 'state.json'), 'utf8'), before, 'state.json is as it was');
  });
});
