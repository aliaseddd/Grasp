// The saved format's versions, and what a saved file says. A model names the version of the format it was saved in
// (SysMLModel.versionOf), and one saved in an older version is upgraded as it is read, one version at a time
// (SysMLModel.upgrade, which normalize runs first). Every fixture in fixtures/ is a state file the canvas saved, in
// the version its model names, and the text it exports is pinned beside it, in the .sysml file of the same name: the
// text it exported when it was saved. There is a fixture of every version, from 1 to the current one, and each,
// upgraded to the current version, still exports its pinned text. Version 1's upgrade is checked piece by piece, and
// the page opens a version-1 file brought in through Import state.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { elementIds, exportText, finish, launch, modelLibSource, openCanvas, pageSource, until } from './helpers.mjs';

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

// As in model-lib.test.mjs: the library the page holds, run in a vm context with a bare window. Its values belong to
// the context's realm, so the checks compare strings and JSON, never deepEqual.
function loadLib(source) {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.runInContext(modelLibSource(source), vm.createContext(sandbox), { filename: 'canvas/index.html#model-lib' });
  assert.ok(sandbox.SysMLModel, 'the model-lib script sets window.SysMLModel');
  return sandbox.SysMLModel;
}

const fixtures = () => fs.readdirSync(FIXTURES).filter((name) => name.endsWith('.json')).sort();
const readState = (name) => JSON.parse(fs.readFileSync(path.join(FIXTURES, name), 'utf8'));
const pinnedName = (name) => name.replace(/\.json$/, '.sysml');
const pinnedText = (name) => fs.readFileSync(path.join(FIXTURES, pinnedName(name)), 'utf8');
const listOf = (value) => (Array.isArray(value) ? value : []);
// How a fixture's text is pinned again, when a change to the export itself, not to how files are read, is meant to
// change it: the same code, the library in src/, through export.mjs.
const repin = (name) => `node canvas/export.mjs canvas/test/fixtures/${name} > canvas/test/fixtures/${pinnedName(name)}`;
// A value frozen all the way down: the library runs in strict mode, so a write to it throws.
const frozen = (value) => {
  if (value && typeof value === 'object') { Object.values(value).forEach(frozen); Object.freeze(value); }
  return value;
};
const PLACE = ['x', 'y', 'w', 'h', 'side', 'at'];  // the keys version 1 kept an element's place in

describe('saved files', () => {
  test('the library reads and writes the current version, and a model names the version it was saved in', () => {
    const lib = loadLib(pageSource());
    assert.ok(Number.isInteger(lib.VERSION) && lib.VERSION >= 2, `VERSION is a whole number, 2 or more: ${lib.VERSION}`);
    assert.equal(lib.FORMAT, 'stronghold-canvas/' + lib.VERSION, 'the format names the version');
    assert.equal(lib.blank().format, lib.FORMAT, 'a new model is in the current version');
    for (const raw of [null, {}, { format: 'stronghold-canvas/1' }, { format: lib.FORMAT }]) {
      assert.equal(lib.normalize(raw).format, lib.FORMAT, `normalize gives ${JSON.stringify(raw)} in the current version`);
    }
    assert.equal(lib.versionOf({ format: 'stronghold-canvas/1' }), 1);
    assert.equal(lib.versionOf({ format: lib.FORMAT }), lib.VERSION);
    assert.equal(lib.versionOf({ format: 'stronghold-canvas/' + (lib.VERSION + 1) }), lib.VERSION + 1, 'a version newer than the library is named as it is');
    // A model that names no version is one written by hand, in the version of the day.
    for (const raw of [undefined, null, 'junk', [], {}, { format: 7 }, { format: 'other/1' }, { format: 'stronghold-canvas/0' },
      { format: 'stronghold-canvas/v1' }, { format: 'stronghold-canvas/1 ' }]) {
      assert.equal(lib.versionOf(raw), lib.VERSION, `${JSON.stringify(raw)} names no version, so it is read as the current one`);
    }
  });

  test('there is an upgrade from every older version to the current one, and it leaves the model it was given as it was', () => {
    const lib = loadLib(pageSource());
    for (let version = 1; version < lib.VERSION; version += 1) {
      // Even the barest model of a version: a file may have been written by hand, so an upgrade takes any JSON.
      for (const raw of [{ format: 'stronghold-canvas/' + version }, { format: 'stronghold-canvas/' + version, elements: [null, 5, 'x', {}], views: 'x', view: 7 }]) {
        const upgraded = lib.upgrade(frozen(raw));
        assert.equal(lib.versionOf(upgraded), lib.VERSION, `${JSON.stringify(raw)} is upgraded to version ${lib.VERSION}`);
        assert.equal(lib.normalize(raw).format, lib.FORMAT);
      }
    }
    const current = { format: lib.FORMAT, elements: [] };
    assert.equal(lib.upgrade(current), current, 'a model in the current version is read as it is');
    const newer = { format: 'stronghold-canvas/' + (lib.VERSION + 1), elements: [] };
    assert.equal(lib.upgrade(newer), newer, 'and so is one in a version the library doesn\'t know yet');
  });

  test('every fixture names its version, and there is a fixture saved in every version from 1 to the current one', () => {
    const lib = loadLib(pageSource());
    const versions = new Map();
    for (const name of fixtures()) {
      const { model } = readState(name);
      assert.match(String(model.format), /^stronghold-canvas\/[1-9][0-9]*$/, `${name} names the version it was saved in`);
      const version = lib.versionOf(model);
      assert.ok(version <= lib.VERSION, `${name} was saved in a version the library knows: ${version}`);
      versions.set(version, (versions.get(version) || []).concat(name));
    }
    for (let version = 1; version <= lib.VERSION; version += 1) {
      assert.ok(versions.has(version), `a fixture saved in version ${version}. When the format changes, keep the fixtures of the ` +
        'older versions as they were saved, and add one saved in the new version with its pinned export');
    }
  });

  test('every fixture has its export pinned beside it, and every pinned export has its fixture', () => {
    const names = fixtures();
    assert.ok(names.length >= 1, 'there are fixtures');
    for (const name of names) {
      assert.ok(fs.existsSync(path.join(FIXTURES, pinnedName(name))), `${name} has its export pinned in ${pinnedName(name)}; pin it with: ${repin(name)}`);
    }
    for (const sysml of fs.readdirSync(FIXTURES).filter((name) => name.endsWith('.sysml'))) {
      assert.ok(names.includes(sysml.replace(/\.sysml$/, '.json')), `${sysml} is the pinned export of a fixture`);
    }
  });

  test('every fixture, upgraded to the current version, exports the text pinned beside it', () => {
    const lib = loadLib(pageSource());
    for (const name of fixtures()) {
      const state = readState(name);
      const saved = JSON.stringify(state.model);
      const upgraded = lib.upgrade(frozen(state.model));
      assert.equal(lib.versionOf(upgraded), lib.VERSION, `${name} is upgraded to the current version`);
      assert.equal(JSON.stringify(state.model), saved, `upgrading ${name} leaves the model it read as it was`);
      const model = lib.normalize(upgraded);
      assert.equal(JSON.stringify(lib.normalize(state.model)), JSON.stringify(model), `normalize upgrades ${name} as it reads it, as the page and the scripts call it`);
      const text = lib.toSysML(model, listOf(state.notes), listOf(state.archive));
      assert.equal(text, pinnedText(name), `${name} says what it said when it was saved, the text in ${pinnedName(name)}. ` +
        `Reading files differently must never change it; only a change to the export itself may, and then pin it again: ${repin(name)}`);
    }
  });

  test('version 1: its one view, named by view.name, takes every element\'s place, and the elements keep the rest', () => {
    const lib = loadLib(pageSource());
    const raw = readState('format1.json').model;
    assert.equal(lib.versionOf(raw), 1, 'format1.json was saved in version 1');
    const upgraded = lib.upgrade(raw);
    assert.equal(upgraded.format, 'stronghold-canvas/2', 'version 1 goes to version 2');
    assert.equal(upgraded.view, undefined, 'version 1\'s view is gone');
    assert.equal(upgraded.views.length, 1, 'into one view');
    const view = upgraded.views[0];
    assert.equal(view.kind, 'GeneralView');
    assert.equal(view.name, raw.view.name, 'named as the old view was');
    assert.equal(JSON.stringify(Object.keys(view.layout)), JSON.stringify(raw.elements.map((e) => e.id)), 'the layout places every element, in order');
    raw.elements.forEach((was, i) => {
      const place = Object.fromEntries(Object.entries(was).filter(([key]) => PLACE.includes(key)));
      const rest = Object.fromEntries(Object.entries(was).filter(([key]) => !PLACE.includes(key)));
      assert.equal(JSON.stringify(view.layout[was.id]), JSON.stringify(place), `${was.id}'s place is in the layout`);
      assert.equal(JSON.stringify(upgraded.elements[i]), JSON.stringify(rest), `${was.id} keeps everything else, and its place only in the layout`);
    });
    for (const key of ['revision', 'package', 'relationships']) {
      assert.equal(JSON.stringify(upgraded[key]), JSON.stringify(raw[key]), `the ${key} stays as it was`);
    }

    // An element that carried no place is placed the way version 1 placed it: at the top left of its owner, at its
    // kind's size or the size it carried, or a port in the middle of its owner's right side.
    const bare = lib.normalize({ format: 'stronghold-canvas/1', package: { name: 'P' }, view: { name: 'v' }, relationships: [], elements: [
      { id: 'A', kind: 'PartDefinition', name: 'A' }, { id: 'A.b', kind: 'PartUsage', name: 'b', owner: 'A', w: 300 },
      { id: 'A.p', kind: 'PortUsage', name: 'p', owner: 'A' }, { id: 'A.q', kind: 'PortUsage', name: 'q', owner: 'A', side: 'top', at: 0.25 },
      { id: 'A', kind: 'PartUsage', name: 'twice', x: 999 },
    ] });
    assert.equal(bare.views.length, 1);
    assert.equal(bare.views[0].name, 'v');
    assert.equal(JSON.stringify(bare.views[0].layout), JSON.stringify({
      A: { x: 0, y: 0, w: 220, h: 72 }, 'A.b': { x: 0, y: 0, w: 300, h: 60 }, 'A.p': { side: 'right', at: 0.5 }, 'A.q': { side: 'top', at: 0.25 },
    }), 'each element is placed as version 1 placed it, and an id given twice keeps its first place');
  });

  describe('on the page', () => {
    let browser;
    before(async () => { browser = await launch(); });
    after(() => browser?.close());

    test('the page opens a version-1 file brought in through Import state, in the current version, saying what it said', async () => {
      const ctx = await openCanvas(browser);
      const { page } = ctx;
      const file = path.join(FIXTURES, 'format1.json');
      await page.setInputFiles('#import-file', file);
      await until(page, () => /^Imported /.test(document.querySelector('#status')?.textContent || ''), null, 'the page says it imported the state');
      const lib = loadLib(pageSource());
      assert.equal(await page.evaluate(() => window.SysMLCanvas.state.model.format), lib.FORMAT, 'the page holds the model in the current version');
      assert.equal(await page.locator('#drawing g.frame[data-view]').count(), 1, 'in one view');
      const ids = readState('format1.json').model.elements.map((e) => e.id);
      assert.deepEqual((await elementIds(page)).sort(), ids.slice().sort(), 'which draws every element');
      assert.equal(await exportText(page), pinnedText('format1.json'), 'and the export is the text the file exported when it was saved');
      await finish(ctx);
    });
  });
});
