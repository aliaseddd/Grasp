// The kind lists generated from the pilot implementation's SysML.ecore (canvas/metamodel/generate.mjs), outside a
// browser: src/core/lib/metamodel.js is what the ecore generates, and rerunning the generator writes the same bytes;
// the generator refuses an ecore that isn't the file its SOURCE names; and the lists say what the ecore says, read
// here a second way, with patterns rather than the generator's XML reader. The changes are made to copies, in
// folders of their own. Values made inside the library's context belong to its own realm, so the checks compare
// them as JSON, never with deepEqual.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { modelLibSource, pageSource } from './helpers.mjs';

const CANVAS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ECORE = path.join(CANVAS, 'metamodel', 'SysML.ecore');
const LISTS = path.join(CANVAS, 'src', 'core', 'lib', 'metamodel.js');
const copies = [];

/** A copy of what the generator reads and writes: canvas/metamodel/ and src/core/lib/metamodel.js. */
function copyGenerator() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'canvas-metamodel-'));
  copies.push(dir);
  fs.cpSync(path.join(CANVAS, 'metamodel'), path.join(dir, 'metamodel'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'src', 'core', 'lib'), { recursive: true });
  fs.copyFileSync(LISTS, path.join(dir, 'src', 'core', 'lib', 'metamodel.js'));
  return dir;
}
const run = (dir, ...args) => spawnSync(process.execPath, [path.join(dir, 'metamodel', 'generate.mjs'), ...args], { encoding: 'utf8' });

/** The page's model library, run in a context of its own. */
function loadLib() {
  const sandbox = {};
  sandbox.window = sandbox;
  vm.runInContext(modelLibSource(pageSource()), vm.createContext(sandbox), { filename: 'canvas/index.html#model-lib' });
  return sandbox.SysMLModel;
}

// The ecore read with patterns, in the file's order: each classifier's tag, then its features' and literals' tags,
// until the next classifier. These tags hold no documentation (that is in the annotations), so none has a > inside
// it, and EMF may wrap one over two lines. Each class: { name, kind, abstract, general, features: [{ name, type }] };
// each enumeration: { name, kind, literals }.
function readWithPatterns(text) {
  const out = [];
  let cur = null;
  for (const tag of text.matchAll(/<(eClassifiers|eStructuralFeatures|eLiterals)\s([^>]*)>/g)) {
    const attrs = Object.fromEntries([...tag[2].matchAll(/([\w:]+)="([^"]*)"/g)].map((a) => [a[1], a[2]]));
    if (tag[1] === 'eClassifiers') {
      cur = attrs['xsi:type'] === 'ecore:EEnum'
        ? { name: attrs.name, kind: 'enum', literals: [] }
        : { name: attrs.name, kind: 'class', abstract: attrs.abstract === 'true', general: (attrs.eSuperTypes || '').split(/\s+/).filter(Boolean).map((g) => g.replace('#//', '')), features: [] };
      out.push(cur);
    } else if (tag[1] === 'eStructuralFeatures') {
      cur.features.push({ name: attrs.name, type: attrs.eType.replace(/^.*#\/\//, '') });
    } else {
      cur.literals.push(attrs.name);
    }
  }
  return out;
}

describe('the kind lists', () => {
  after(() => copies.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })));

  test('src/core/lib/metamodel.js is what SysML.ecore generates, and generating it again writes the same bytes', () => {
    const result = run(CANVAS, '--check');
    assert.equal(result.status, 0, `node canvas/metamodel/generate.mjs --check passes:\n${result.stdout}${result.stderr}`);
    const dir = copyGenerator();
    const out = path.join(dir, 'src', 'core', 'lib', 'metamodel.js');
    fs.rmSync(out);
    assert.equal(run(dir).status, 0, 'the generator runs in the copy');
    const first = fs.readFileSync(out);
    assert.equal(run(dir).status, 0, 'and runs again');
    assert.ok(fs.readFileSync(out).equals(first), 'a second run writes the same bytes');
    assert.ok(first.equals(fs.readFileSync(LISTS)), 'and they are the committed lists');
  });

  test('--check fails once the lists are edited, and the generator refuses an ecore that is not the file its source names', () => {
    const dir = copyGenerator();
    const out = path.join(dir, 'src', 'core', 'lib', 'metamodel.js');
    fs.appendFileSync(out, '// edited by hand\n');
    let result = run(dir, '--check');
    assert.equal(result.status, 1, 'edited lists fail the check');
    assert.match(result.stderr, /isn't what SysML\.ecore generates/);
    assert.equal(run(dir).status, 0, 'the generator writes them again');
    assert.equal(run(dir, '--check').status, 0, 'and the check passes');

    const ecore = path.join(dir, 'metamodel', 'SysML.ecore');
    fs.writeFileSync(ecore, fs.readFileSync(ecore, 'utf8').replace('name="PartUsage"', 'name="PieceUsage"'));
    const before = fs.readFileSync(out);
    result = run(dir);
    assert.equal(result.status, 1, 'a changed ecore is refused');
    assert.match(result.stderr, /SysML\.ecore isn't the file SOURCE names: its SHA-256 is [0-9a-f]{64}/);
    assert.ok(fs.readFileSync(out).equals(before), 'and nothing is written');
  });

  test('the vendored SysML.ecore is release 2026-09.1\'s, and the lists name it, its version and its license', () => {
    const sha = crypto.createHash('sha256').update(fs.readFileSync(ECORE)).digest('hex');
    assert.equal(sha, 'dd3960e0a0031d074adb01162d9b7ec6551b2e7aa1d92b26b6f7a0ea45b464d6');
    const head = fs.readFileSync(LISTS, 'utf8').split('\n').slice(0, 10).join('\n');
    for (const said of ['org.omg.sysml/model/SysML.ecore', 'https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation', 'release 2026-09.1',
      'commit d81b2ad', 'org.omg.sysml 0.63.1', 'https://www.omg.org/spec/SysML/20250201', sha, 'Eclipse Public License 2.0', 'canvas/metamodel/LICENSE']) {
      assert.ok(head.includes(said), `the lists' header says ${said}`);
    }
    assert.match(fs.readFileSync(path.join(CANVAS, 'metamodel', 'LICENSE'), 'utf8'), /^Eclipse Public License - v 2\.0\n/, 'the license\'s text is beside the ecore');
  });

  test('the lists hold the ecore\'s 182 classifiers, each with what the ecore says of it', () => {
    const M = loadLib();
    const lists = JSON.parse(JSON.stringify(M.METAMODEL));
    const ecore = readWithPatterns(fs.readFileSync(ECORE, 'utf8'));
    assert.equal(ecore.length, 182, 'the patterns find the 182 classifiers');
    assert.deepEqual(Object.keys(lists), ecore.map((c) => c.name), 'every classifier, in the ecore\'s order');
    assert.equal(ecore.filter((c) => c.kind === 'class').length, 175);
    assert.equal(Object.values(lists).filter((c) => c.general).length, 175, '175 classes');
    assert.equal(Object.values(lists).filter((c) => c.literals).length, 7, 'and 7 enumerations');
    let features = 0;
    for (const c of ecore) {
      const row = lists[c.name];
      if (c.kind === 'enum') { assert.deepEqual(row, { literals: c.literals }, `${c.name}'s literals`); continue; }
      assert.equal(!!row.abstract, c.abstract, `${c.name} is abstract or not`);
      assert.deepEqual(row.general, c.general, `${c.name}'s supertypes`);
      const listed = row.owns.concat(row.fields);
      assert.deepEqual(listed.map((f) => f.name).sort(), c.features.map((f) => f.name).sort(), `${c.name}'s features are in owns or in fields, each once`);
      for (const f of c.features) {
        const type = { EBoolean: 'Boolean', EString: 'String', EInt: 'Integer', EDouble: 'Real' }[f.type] || f.type;
        assert.equal(listed.find((x) => x.name === f.name).type, type, `${c.name}::${f.name}'s type`);
      }
      features += c.features.length;
    }
    assert.equal(features, 415, 'the 415 features: 64 attributes and 351 references');
    assert.ok(Object.isFrozen(M.METAMODEL) && Object.isFrozen(M.METAMODEL.PartUsage.fields[0]), 'the lists are frozen, all the way down');
  });

  test('what an element may contain is what it owns, and its fields are the rest, with their bounds, defaults and derivations', () => {
    const lists = JSON.parse(JSON.stringify(loadLib().METAMODEL));
    const feature = (key) => {
      const [c, f] = key.split('::');
      const row = lists[c];
      return { owns: row.owns.find((x) => x.name === f), field: row.fields.find((x) => x.name === f) };
    };
    // Owned, by the rule: a containment, ownedElement or ownedMember, or what subsets or redefines one of them.
    for (const key of ['Element::ownedRelationship', 'Relationship::ownedRelatedElement', 'Element::ownedElement', 'Namespace::ownedMember',
      'Element::documentation', 'Type::multiplicity', 'Type::ownedFeature', 'Feature::ownedTyping', 'Type::ownedSpecialization',
      'Definition::ownedUsage', 'Definition::ownedPart', 'Definition::ownedPort', 'Usage::nestedPart', 'Usage::nestedOccurrence',
      'FeatureMembership::ownedMemberFeature', 'TransitionUsage::guardExpression', 'TransitionUsage::triggerAction']) {
      assert.ok(feature(key).owns && !feature(key).field, `${key} is what an element may contain`);
    }
    // Not owned: what an element has as a member without owning it, what it is owned by, what it refers to, and values.
    for (const key of ['Namespace::member', 'Type::feature', 'Type::inheritedFeature', 'Element::owner', 'Feature::owningType',
      'ActionDefinition::action', 'FeatureTyping::type', 'Specialization::general', 'Usage::definition', 'PartUsage::partDefinition',
      'Element::declaredName', 'Type::isAbstract', 'Feature::direction', 'StateUsage::isParallel', 'OwningMembership::ownedMemberName']) {
      assert.ok(feature(key).field && !feature(key).owns, `${key} is a field`);
    }
    assert.equal(JSON.stringify(feature('Definition::ownedPart').owns), JSON.stringify({ name: 'ownedPart', type: 'PartUsage', upper: '*', derived: true, subsets: ['Definition::ownedItem'] }));
    assert.equal(JSON.stringify(feature('Type::isAbstract').field), JSON.stringify({ name: 'isAbstract', type: 'Boolean', lower: 1, default: false }));
    assert.equal(JSON.stringify(feature('Element::declaredName').field), JSON.stringify({ name: 'declaredName', type: 'String' }));
    assert.equal(JSON.stringify(feature('Feature::direction').field), JSON.stringify({ name: 'direction', type: 'FeatureDirectionKind' }));
    assert.equal(JSON.stringify(feature('FeatureTyping::type').field), JSON.stringify({ name: 'type', type: 'Type', lower: 1, redefines: ['Specialization::general'] }));
    assert.equal(JSON.stringify(feature('Membership::visibility').field), JSON.stringify({ name: 'visibility', type: 'VisibilityKind', lower: 1, default: 'public' }));
    assert.equal(JSON.stringify(feature('Flow::flowEnd').field), JSON.stringify({ name: 'flowEnd', type: 'FlowEnd', upper: 2, derived: true, subsets: ['Connector::connectorEnd'] }));
    assert.deepEqual(lists.FeatureDirectionKind.literals, ['in', 'inout', 'out']);
    assert.deepEqual(lists.StateSubactionKind.literals, ['entry', 'do', 'exit']);
    // Every feature a list names, and every type and supertype, is in the lists.
    const all = new Set(Object.entries(lists).flatMap(([c, row]) => (row.general ? row.owns.concat(row.fields).map((f) => c + '::' + f.name) : [])));
    for (const [c, row] of Object.entries(lists)) {
      if (!row.general) continue;
      for (const g of row.general) assert.ok(lists[g] && lists[g].general, `${c}'s supertype ${g} is a class of the lists`);
      for (const f of row.owns.concat(row.fields)) {
        assert.ok(lists[f.type] || ['Boolean', 'String', 'Integer', 'Real'].includes(f.type), `${c}::${f.name}'s type ${f.type}`);
        for (const k of (f.subsets || []).concat(f.redefines || [])) assert.ok(all.has(k), `${c}::${f.name} names ${k}, which is in the lists`);
      }
    }
  });
});
