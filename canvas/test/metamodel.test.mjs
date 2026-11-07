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
import { LIBRARY, SRC } from '../build.mjs';
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

/**
 * The model library from its sources, with a script of the test's own run right after core/lib/model.js, as a
 * feature's lib.js is: it throws what the library throws as it loads.
 */
function loadLibWith(script) {
  const files = LIBRARY.map((file) => fs.readFileSync(path.join(SRC, file), 'utf8'));
  files.splice(LIBRARY.indexOf('core/lib/model.js') + 1, 0, `(function (root) {\n  'use strict';\n  const lib = root.SysMLModelLib;\n${script}\n})(globalThis);\n`);
  const sandbox = {};
  vm.runInContext(files.join(''), vm.createContext(sandbox), { filename: 'model-lib.js' });
  return sandbox.SysMLModel;
}

// A class and its supertypes, all the way up, nearest first; whether a class conforms to another.
function lineage(lists, metaclass) {
  const out = [metaclass];
  for (let i = 0; i < out.length; i++) for (const g of lists[out[i]].general) if (!out.includes(g)) out.push(g);
  return out;
}
const conformsIn = (lists, metaclass, general) => lineage(lists, metaclass).includes(general);

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

// The canvas's 29 kinds on the lists: each stands on a class, which says whether it is a definition or a usage, and
// what the kinds' hand-written rules allow (what nests, what defines a usage, a field that holds an attribute) is
// what that class allows.
describe('the kinds on the lists', () => {
  // The definitions and the usages, as the kinds' rows said by hand before they stood on the lists.
  const DEFINITIONS = ['PartDefinition', 'PortDefinition', 'ItemDefinition', 'InterfaceDefinition', 'ActionDefinition', 'StateDefinition'];
  const USAGES = ['PartUsage', 'PortUsage', 'ItemUsage', 'ActionUsage', 'ParameterUsage', 'ForkNode', 'JoinNode', 'DecisionNode', 'MergeNode',
    'StartNode', 'DoneNode', 'StateUsage', 'InitialNode', 'EventOccurrenceUsage'];
  // The kinds that aren't named after the class they stand on.
  const STANDS_ON = { ParameterUsage: 'ItemUsage', StartNode: 'ActionUsage', DoneNode: 'ActionUsage', InitialNode: 'ActionUsage', FlowConnectionUsage: 'FlowUsage', Message: 'FlowUsage' };

  test('each of the 29 kinds stands on a class of the lists, not an abstract one: its own name\'s, or the one its row names', () => {
    const M = loadLib();
    const kinds = Object.keys(M.KINDS).concat(Object.keys(M.RELATIONSHIPS));
    assert.equal(kinds.length, 29, 'the 20 element kinds and the 9 relationship kinds');
    for (const kind of kinds) {
      const row = M.KINDS[kind] || M.RELATIONSHIPS[kind];
      assert.equal(row.metaclass, STANDS_ON[kind] || kind, `${kind} stands on ${STANDS_ON[kind] || kind}`);
      const c = M.METAMODEL[row.metaclass];
      assert.ok(c && c.general && !c.abstract, `${kind}'s class ${row.metaclass} is a class of the lists, and not abstract`);
    }
  });

  test('whether a kind is a definition or a usage is its class\'s, as the rows said by hand before', () => {
    const M = loadLib();
    const lists = M.METAMODEL;
    assert.deepEqual(Object.keys(M.KINDS).sort(), DEFINITIONS.concat(USAGES).sort());
    for (const kind of Object.keys(M.KINDS)) {
      const row = M.KINDS[kind];
      assert.equal(row.definition, DEFINITIONS.includes(kind), `${kind} is ${DEFINITIONS.includes(kind) ? '' : 'not '}a definition`);
      assert.equal(row.usage, USAGES.includes(kind), `${kind} is ${USAGES.includes(kind) ? '' : 'not '}a usage`);
      assert.equal(row.definition, conformsIn(lists, row.metaclass, 'Definition'), `${kind}: its class ${row.metaclass} says whether it is a Definition`);
      assert.equal(row.usage, conformsIn(lists, row.metaclass, 'Usage'), `${kind}: and whether it is a Usage`);
    }
  });

  test('what a kind nests, its class may own, each through one feature that holds just such elements', () => {
    const M = loadLib();
    const lists = M.METAMODEL;
    // For each nesting the kinds allow, the owning feature it is: the one of the owner's class whose type is the most
    // specific that the child's class conforms to. These are the features SysON's compartments list.
    const THROUGH = {
      PartDefinition: { PartUsage: 'Definition::ownedPart', PortUsage: 'Definition::ownedPort', ItemUsage: 'Definition::ownedItem', ActionUsage: 'Definition::ownedAction', StateUsage: 'Definition::ownedState' },
      PortDefinition: { ItemUsage: 'Definition::ownedItem' },
      PartUsage: { PartUsage: 'Usage::nestedPart', PortUsage: 'Usage::nestedPort', ItemUsage: 'Usage::nestedItem', ActionUsage: 'Usage::nestedAction', StateUsage: 'Usage::nestedState', EventOccurrenceUsage: 'Usage::nestedOccurrence' },
      InterfaceDefinition: { PortUsage: 'Definition::ownedPort' },
      ActionDefinition: { ActionUsage: 'Definition::ownedAction', ParameterUsage: 'Definition::ownedItem', ForkNode: 'Definition::ownedAction', JoinNode: 'Definition::ownedAction',
        DecisionNode: 'Definition::ownedAction', MergeNode: 'Definition::ownedAction', StartNode: 'Definition::ownedAction', DoneNode: 'Definition::ownedAction' },
      ActionUsage: { ActionUsage: 'Usage::nestedAction', ParameterUsage: 'Usage::nestedItem', ForkNode: 'Usage::nestedAction', JoinNode: 'Usage::nestedAction',
        DecisionNode: 'Usage::nestedAction', MergeNode: 'Usage::nestedAction', StartNode: 'Usage::nestedAction', DoneNode: 'Usage::nestedAction' },
      StateDefinition: { StateUsage: 'Definition::ownedState', ActionUsage: 'Definition::ownedAction', InitialNode: 'Definition::ownedAction', DoneNode: 'Definition::ownedAction' },
      StateUsage: { StateUsage: 'Usage::nestedState', ActionUsage: 'Usage::nestedAction', InitialNode: 'Usage::nestedAction', DoneNode: 'Usage::nestedAction' },
    };
    const nests = {};
    for (const kind of Object.keys(M.KINDS)) {
      const row = M.KINDS[kind];
      for (const child of row.contains || []) {
        const owning = lineage(lists, row.metaclass).flatMap((c) => lists[c].owns.map((f) => ({ key: `${c}::${f.name}`, type: f.type })));
        const able = owning.filter((f) => conformsIn(lists, M.KINDS[child].metaclass, f.type));
        const nearest = able.filter((f) => able.every((g) => conformsIn(lists, f.type, g.type)));
        assert.equal(nearest.length, 1, `${kind} nests ${child} through one most specific feature of ${row.metaclass}: ${nearest.map((f) => f.key).join(', ') || 'none'}`);
        (nests[kind] = nests[kind] || {})[child] = nearest[0].key;
      }
    }
    assert.deepEqual(nests, THROUGH, 'each nesting the kinds allow, through the feature the table above says');
  });

  test('what defines a usage, its class may be typed by', () => {
    const M = loadLib();
    const lists = M.METAMODEL;
    // The feature of the usage's class that types it: the one the nearest class in its lineage declares that is, or
    // subsets or redefines, Usage::definition.
    const TYPED_BY = {
      PartUsage: 'PartUsage::partDefinition', PortUsage: 'PortUsage::portDefinition', ItemUsage: 'ItemUsage::itemDefinition',
      ActionUsage: 'ActionUsage::actionDefinition', ParameterUsage: 'ItemUsage::itemDefinition', StateUsage: 'StateUsage::stateDefinition',
    };
    const all = Object.keys(lists).filter((c) => lists[c].general).flatMap((c) => lists[c].owns.concat(lists[c].fields).map((f) => ({ key: `${c}::${f.name}`, owner: c, f })));
    const family = new Set(['Usage::definition']);
    for (let grew = true; grew;) {
      grew = false;
      for (const x of all) if (!family.has(x.key) && (x.f.subsets || []).concat(x.f.redefines || []).some((k) => family.has(k))) { family.add(x.key); grew = true; }
    }
    const typedBy = {};
    for (const kind of Object.keys(M.KINDS)) {
      const row = M.KINDS[kind];
      if (!row.definedBy) continue;
      assert.ok(M.KINDS[row.definedBy] && M.KINDS[row.definedBy].definition, `${kind} is defined by a definition kind`);
      const nearest = lineage(lists, row.metaclass).find((c) => all.some((x) => x.owner === c && family.has(x.key)));
      const features = all.filter((x) => x.owner === nearest && family.has(x.key));
      for (const x of features) {
        assert.ok(conformsIn(lists, M.KINDS[row.definedBy].metaclass, x.f.type), `${kind}'s ${row.definedBy} is ${x.f.type === row.definedBy ? 'a' : 'a kind of'} ${x.f.type}, what ${x.key} types it by`);
      }
      typedBy[kind] = features.map((x) => x.key).join(', ');
    }
    assert.deepEqual(typedBy, TYPED_BY);
  });

  test('a field that holds an attribute takes its type from it, and every kind that shows the field has the attribute', () => {
    const M = loadLib();
    const lists = M.METAMODEL;
    const held = Object.keys(M.FIELDS).filter((f) => M.FIELDS[f].attribute);
    assert.deepEqual(held.map((f) => `${f}: ${M.FIELDS[f].attribute}`), ['name: declaredName', 'abstract: isAbstract', 'direction: direction', 'parallel: isParallel']);
    assert.equal(JSON.stringify(['name', 'abstract', 'direction', 'parallel'].map((f) => [M.FIELDS[f].type, M.FIELDS[f].values || null])),
      JSON.stringify([['string', null], ['bool', null], ['enum', ['', 'in', 'inout', 'out']], ['bool', null]]), 'a string, a bool, an enum of none and the literals, a bool');
    let shown = 0;
    for (const [table, rows] of [['KINDS', M.KINDS], ['RELATIONSHIPS', M.RELATIONSHIPS]]) {
      for (const kind of Object.keys(rows)) {
        const row = rows[kind];
        for (const f of row.fields.filter((x) => held.includes(x))) {
          const attribute = M.FIELDS[f].attribute;
          const c = lineage(lists, row.metaclass).find((k) => lists[k].fields.some((x) => x.name === attribute));
          assert.ok(c, `${table}.${kind} shows ${f}, and its class ${row.metaclass} has the attribute ${attribute}`);
          const type = lists[c].fields.find((x) => x.name === attribute).type;
          const expected = { String: 'string', Boolean: 'bool', Integer: 'number', Real: 'number' }[type] || (lists[type].literals ? 'enum' : null);
          assert.equal(M.FIELDS[f].type, expected, `${table}.${kind}'s ${f} is a ${expected}, as ${c}::${attribute} is a ${type}`);
          shown += 1;
        }
      }
    }
    assert.equal(shown, 34, 'the 34 places a kind shows a field that holds an attribute: 24 names, 6 abstracts, 2 directions, 2 parallels');
  });

  test('the library refuses a kind on no class or an abstract one, or one that says whether it is a definition, and a field on no attribute', () => {
    const row = "{ keyword: 'gadget', label: 'gadget', contains: false, onBorder: false, size: [180, 60], shape: 'rounded', fields: ['name', 'doc'], traits: [] }";
    // New kinds on classes of the lists, their own names': the classes say an attribute is a usage, an attribute def a
    // definition, and a KerML class, a classifier that is no definition, neither.
    const M = loadLibWith(`  lib.addKinds({ AttributeUsage: ${row}, AttributeDefinition: ${row}, Class: ${row} });`);
    const said = (kind) => JSON.stringify(['metaclass', 'definition', 'usage'].map((k) => M.KINDS[kind][k]));
    assert.equal(said('AttributeUsage'), JSON.stringify(['AttributeUsage', false, true]));
    assert.equal(said('AttributeDefinition'), JSON.stringify(['AttributeDefinition', true, false]));
    assert.equal(said('Class'), JSON.stringify(['Class', false, false]));
    assert.deepEqual(Object.keys(M.KINDS).slice(3, 8), ['PortUsage', 'AttributeUsage', 'AttributeDefinition', 'Class', 'ItemDefinition'], 'they land after the core\'s rows, before the features\' that load after them');
    assert.equal(loadLibWith(`  lib.addRelationships({ Dependency: { label: 'dependency', fields: [] } });`).RELATIONSHIPS.Dependency.metaclass, 'Dependency');
    assert.throws(() => loadLibWith(`  lib.addKinds({ Gadget: ${row} });`), /The kind Gadget stands on Gadget, which is not a class of the metamodel\./);
    assert.throws(() => loadLibWith(`  lib.addKinds({ Gadget: Object.assign(${row}, { metaclass: 'FeatureDirectionKind' }) });`), /stands on FeatureDirectionKind, which is not a class of the metamodel/);
    assert.throws(() => loadLibWith(`  lib.addKinds({ Gadget: Object.assign(${row}, { metaclass: 'ControlNode' }) });`), /The kind Gadget stands on ControlNode, which is abstract/);
    assert.throws(() => loadLibWith(`  lib.addKinds({ AttributeUsage: Object.assign(${row}, { usage: true }) });`), /The kind AttributeUsage says whether it is a definition or a usage; its class says that\./);
    assert.throws(() => loadLibWith(`  lib.addKinds({ PartUsage: ${row} });`), /KINDS has PartUsage already\./);
    assert.throws(() => loadLibWith(`  lib.addRelationships({ Gadget: { label: 'gadget', fields: [] } });`), /The kind Gadget stands on Gadget, which is not a class/);
    assert.throws(() => loadLibWith(`  lib.attributeField('isGadget', { label: 'gadget' });`), /The field for isGadget follows no attribute of the metamodel\./);
    assert.throws(() => loadLibWith(`  lib.attributeField('type', { label: 'type' });`), /The field for type follows a reference, not an attribute\./);
    assert.throws(() => loadLibWith(`  lib.attributeField('isAbstract', { label: 'abstract', type: 'string' });`), /The field for isAbstract says its type; the attribute says that\./);
    assert.equal(JSON.stringify(loadLibWith(`  lib.FIELDS.visibility = lib.attributeField('visibility', { label: 'visibility' });`).FIELDS.visibility),
      JSON.stringify({ attribute: 'visibility', type: 'enum', values: ['private', 'protected', 'public'], label: 'visibility' }), 'an attribute that must be set has no \'\' for none');
  });
});
