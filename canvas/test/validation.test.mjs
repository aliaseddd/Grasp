// The SysML v2 specification's validation rules, as SysON runs them: in Node, each rule the canvas checks breaks on a
// model that breaks it and on nothing else, every fixture keeps them all, and the diagnostics read and sort as SysON's;
// then the Validation view: the button opens it on the left, "No diagnostic available" with none, a Warning section
// folded with its count, opened and kept open as the list changes, worked out again as the checks run, and closed.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { EXAMPLE, checked, finish, launch, modelLibSource, openCanvas, until } from './helpers.mjs';

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

function loadLib() {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.runInContext(modelLibSource(), vm.createContext(sandbox), { filename: 'canvas/index.html#model-lib' });
  return sandbox.SysMLModel;
}
const M = loadLib();
const json = (v) => JSON.parse(JSON.stringify(v));
const el = (id, kind, name, extra) => {
  const dot = id.lastIndexOf('.');
  return Object.assign({ id, kind, name, doc: '' }, dot >= 0 ? { owner: id.slice(0, dot) } : {}, extra || {});
};
const model = (elements, relationships, views) => M.normalize({ format: 'grasp/2', package: { name: 'T', doc: '' }, elements, relationships: relationships || [], views: views || [] });
// The diagnostics of a model, as [rule, path, message].
const found = (m) => json(M.validateSpec(m)).map((d) => [d.rule, d.path, d.message]);

describe('the specification\'s rules', () => {
  test('the rules the canvas checks, each named as the specification names it', () => {
    assert.deepEqual(json(M.SPEC_RULES), [
      'validateNamespaceDistinguishibility', 'validateFeatureEndMultiplicity', 'validateMultiplicityRangeBoundResultTypes',
      'validateTransitionUsageTriggerActions', 'validateStateUsageParallelSubactions', 'validateStateDefinitionParallelSubactions',
      'validateStateUsageStateSubactionKind', 'validateStateDefinitionStateSubactionKind', 'validateControlNodeOwningType',
      'validateForkNodeIncomingSuccessions', 'validateDecisionNodeIncomingSuccessions', 'validateJoinNodeOutgoingSuccessions',
      'validateMergeNodeOutgoingSuccessions', 'validateSendActionUsagePayloadArgument', 'validateRedefinitionDirectionConformance'
    ]);
  });

  test('the example and every fixture keep every rule', () => {
    const files = [EXAMPLE].concat(fs.readdirSync(FIXTURES).filter((f) => f.endsWith('.json')).map((f) => path.join(FIXTURES, f)));
    files.forEach((file) => assert.deepEqual(found(M.normalize(JSON.parse(fs.readFileSync(file, 'utf8')).model)), [], path.basename(file)));
  });

  test('names: two members of one namespace alike only when one\'s metaclass is a kind of the other\'s', () => {
    const m = model([el('Car', 'PartDefinition', 'Car'), el('Car.w', 'PartUsage', 'w'), el('Car.w2', 'ItemUsage', 'w'), el('Car.w3', 'PortUsage', 'w'),
      el('Car.v', 'PartUsage', 'v'), el('Car.v2', 'PartUsage', 'v'), el('Page', 'PartDefinition', 'Page')], [],
    [{ id: 'v1', kind: 'GeneralView', name: 'Page', layout: {}, options: {} }]);
    assert.deepEqual(found(m), [['validateNamespaceDistinguishibility', 'T::Car',
      'Its members part w in Car and item w in Car have the same name, and one is a kind of the other, so they can\'t be told apart.']],
    'a part is a kind of item; a port isn\'t, and a view isn\'t a part def; one diagnostic per namespace');
    const top = model([el('A', 'PartDefinition', 'A'), el('A2', 'PartDefinition', 'A')]);
    assert.deepEqual(found(top).map((d) => d.slice(0, 2)), [['validateNamespaceDistinguishibility', 'T']], 'the package is a namespace too');
  });

  test('multiplicities: an interface\'s end is 1..1; bounds are whole numbers, 0 or more, or *', () => {
    const m = model([el('P', 'PortDefinition', 'P'), el('IF', 'InterfaceDefinition', 'IF'), el('IF.a', 'PortUsage', 'a', { multiplicity: '2' }),
      el('IF.b', 'PortUsage', 'b', { multiplicity: '1..1' }), el('Car', 'PartDefinition', 'Car'), el('Car.p', 'PortUsage', 'p', { multiplicity: '2' }),
      el('Car.x', 'PartUsage', 'x', { multiplicity: '-1' }), el('Car.y', 'PartUsage', 'y', { multiplicity: '0..*' })]);
    assert.deepEqual(found(m), [
      ['validateFeatureEndMultiplicity', 'T::IF::a', 'An end of an interface def has the multiplicity 1..1; port a in IF has [2].'],
      ['validateMultiplicityRangeBoundResultTypes', 'T::Car::x', 'A multiplicity\'s bounds are whole numbers, 0 or more, or *; part x in Car has [-1].'],
    ], 'a port on a part def is no end');
  });

  test('control nodes: in an action, one succession into a fork or a decision, one out of a join or a merge', () => {
    const m = model([el('A', 'ActionDefinition', 'A'), el('A.x', 'ActionUsage', 'x'), el('A.y', 'ActionUsage', 'y'), el('A.f', 'ForkNode', 'f'),
      el('A.d', 'DecisionNode', 'd'), el('A.j', 'JoinNode', 'j'), el('A.m', 'MergeNode', 'm'), el('A.ok', 'ForkNode', 'ok')], [
      { id: 's1', kind: 'SuccessionAsUsage', from: 'A.x', to: 'A.f' }, { id: 's2', kind: 'SuccessionAsUsage', from: 'A.y', to: 'A.f' },
      { id: 's3', kind: 'SuccessionAsUsage', from: 'A.x', to: 'A.d' }, { id: 's4', kind: 'SuccessionAsUsage', from: 'A.y', to: 'A.d' },
      { id: 's5', kind: 'SuccessionAsUsage', from: 'A.j', to: 'A.x' }, { id: 's6', kind: 'SuccessionAsUsage', from: 'A.j', to: 'A.y' },
      { id: 's7', kind: 'SuccessionAsUsage', from: 'A.m', to: 'A.x' }, { id: 's8', kind: 'SuccessionAsUsage', from: 'A.m', to: 'A.y' },
      { id: 's9', kind: 'SuccessionAsUsage', from: 'A.x', to: 'A.ok' }]);
    assert.deepEqual(found(m).map((d) => d.slice(0, 2)), [
      ['validateDecisionNodeIncomingSuccessions', 'T::A::d'], ['validateForkNodeIncomingSuccessions', 'T::A::f'],
      ['validateJoinNodeOutgoingSuccessions', 'T::A::j'], ['validateMergeNodeOutgoingSuccessions', 'T::A::m']], 'sorted by rule, then by path');
    const loose = model([el('Merge', 'MergeNode', 'loose')]);
    assert.deepEqual(found(loose), [['validateControlNodeOwningType', 'T::loose', 'A control node belongs to an action def or an action; merge loose is on its own.']]);
  });

  test('states: a parallel state\'s regions have no transitions; one entry, do and exit action each; a trigger only out of a state; a state\'s send action has a payload', () => {
    const m = model([el('S', 'StateDefinition', 'S', { parallel: true }), el('S.r1', 'StateUsage', 'r1'), el('S.r2', 'StateUsage', 'r2'),
      el('S.r1.in', 'StateUsage', 'inner'), el('S.r1.in2', 'StateUsage', 'inner2'),
      el('Q', 'StateDefinition', 'Q'), el('Q.e', 'ActionUsage', 'e', { role: 'entry' }), el('Q.e2', 'ActionUsage', 'e2', { role: 'entry' }),
      el('Q.s', 'StateUsage', 's'), el('Q.s2', 'StateUsage', 's2'), el('Q.snd', 'ActionUsage', 'snd', { role: 'do', actionKind: 'send', target: 's' })], [
      { id: 't1', kind: 'TransitionUsage', from: 'S.r1', to: 'S.r2' },
      { id: 't-ok', kind: 'TransitionUsage', from: 'S.r1.in', to: 'S.r1.in2', trigger: 'Sig' },
      { id: 't2', kind: 'TransitionUsage', from: 'Q.e', to: 'Q.s', trigger: 'Sig', name: 'go' },
      { id: 't3', kind: 'TransitionUsage', from: 'Q.s', to: 'Q.s2', trigger: 'Sig' }]);
    assert.deepEqual(found(m), [
      ['validateSendActionUsagePayloadArgument', 'T::Q::snd', 'A send action that is a state\'s do action says what it sends; action snd in Q has no payload.'],
      ['validateStateDefinitionParallelSubactions', 'T::S', 'state def S is parallel, so its regions have no transitions into or out of them; state r1 in S has the transition r1 to r2.'],
      ['validateStateDefinitionStateSubactionKind', 'T::Q', 'A state has one entry action at most; state def Q has 2.'],
      ['validateTransitionUsageTriggerActions', 'T::Q::go', 'Only a transition out of a state has a trigger; the transition go, e to s leaves action e in Q and has the trigger Sig.'],
    ], 'a transition inside a region is the region\'s own, and a trigger out of a state is fine');
    const usage = model([el('Car', 'PartDefinition', 'Car'), el('Car.st', 'StateUsage', 'st', { parallel: true }), el('Car.st.a', 'StateUsage', 'a'),
      el('Car.st.b', 'StateUsage', 'b')], [{ id: 't', kind: 'TransitionUsage', from: 'Car.st.a', to: 'Car.st.b' }]);
    assert.deepEqual(found(usage).map((d) => d[0]), ['validateStateUsageParallelSubactions'], 'a state usage keeps the same rule, under its own name');
  });

  test('a parameter that redefines one going in or out goes the same way; one that redefines an inout one has a direction', () => {
    const m = model([el('A', 'ActionDefinition', 'A'), el('A.src', 'ParameterUsage', 'src', { direction: 'in' }), el('A.io', 'ParameterUsage', 'io', { direction: 'inout' }),
      el('A.same', 'ParameterUsage', 'same', { direction: 'out' }), el('B', 'ActionDefinition', 'B'), el('B.a', 'ActionUsage', 'a'),
      el('B.a.src', 'ParameterUsage', 'src', { direction: 'out' }), el('B.a.io', 'ParameterUsage', 'io', { direction: '' }),
      el('B.a.same', 'ParameterUsage', 'same', { direction: 'out' })], [{ id: 'ty', kind: 'FeatureTyping', from: 'B.a', to: 'A' }]);
    assert.deepEqual(found(m), [
      ['validateRedefinitionDirectionConformance', 'T::B::a::io', 'parameter io in a redefines the parameter io of action def A, which goes inout, so it needs a direction; it has none.'],
      ['validateRedefinitionDirectionConformance', 'T::B::a::src', 'parameter src in a redefines the parameter src of action def A, which goes in, so it goes in too; it goes out.'],
    ]);
  });

  test('a diagnostic reads as SysON\'s: the rule, the document and the qualified name, the metaclass, the message; a warning', () => {
    const [d] = json(M.validateSpec(model([el('M', 'MergeNode', 'loose')])));
    assert.equal(d.text, '#validateControlNodeOwningType·····[T/T::loose]·····Constraint on type \'sysml:ControlNode\' is not respected: A control node belongs to an action def or an action; merge loose is on its own.');
    assert.equal(d.severity, 'warning');
    assert.deepEqual([d.type, d.id, d.metaclass], ['el', 'M', 'ControlNode']);
    const [line] = json(M.validateSpec(model([el('S', 'StateDefinition', 'S'), el('S.a', 'ActionUsage', 'a'), el('S.b', 'StateUsage', 'b')],
      [{ id: 't9', kind: 'TransitionUsage', from: 'S.a', to: 'S.b', trigger: 'go' }])));
    assert.equal(line.path, '<ID: t9>', 'an unnamed line has no qualified name: its id stands for it, as in SysON');
  });
});

describe('the Validation view', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  async function importModel(page, m) {
    await page.setInputFiles('#import-file', { name: 'rules.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ model: m, notes: [], archive: [] })) });
    await until(page, () => /^Imported /.test(document.querySelector('#status')?.textContent || ''), null, 'the page says it imported the state');
  }

  test('the button opens it on the left; none, then a folded Warning section with its count, kept open as the list changes', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    assert.ok(await page.locator('#validation-panel').isHidden());
    await page.click('#validation');
    assert.ok(await page.locator('#validation-panel').isVisible());
    assert.equal(await page.getAttribute('#validation', 'aria-expanded'), 'true');
    assert.ok(await page.locator('#validation-empty').isVisible(), 'No diagnostic available');
    assert.equal(await page.textContent('#validation-empty'), 'No diagnostic available');
    assert.match(await page.textContent('#validation-about'), /^The SysML v2 specification's validation rules that the canvas can check, as SysON runs them: 15 of its 388\./);
    const panel = await page.locator('#validation-panel').boundingBox();
    const stage = await page.locator('.stage').boundingBox();
    assert.ok(panel.x - stage.x < 20 && panel.y - stage.y < 20, 'on the left, at the top, as SysON\'s');
    // A fork with two successions into it, added by an import: the checks run at once for a new model.
    const m = JSON.parse(fs.readFileSync(path.join(FIXTURES, 'behavior-actions.json'), 'utf8')).model;
    m.relationships.push({ id: 's-extra', kind: 'SuccessionAsUsage', from: 'Release.compile', to: 'Release.split' });
    await importModel(page, m);
    await until(page, () => !!document.querySelector('#validation-kinds details'), null, 'a section appears');
    assert.ok(await page.locator('#validation-empty').isHidden());
    assert.equal(await page.textContent('#validation-kinds summary'), 'Warning1 diagnostic');
    assert.equal(await page.evaluate(() => document.querySelector('#validation-kinds details').open), false, 'folded at first');
    await page.click('#validation-kinds summary');
    assert.match(await page.textContent('#validation-kinds li'), /^#validateForkNodeIncomingSuccessions·····\[StrongholdRelease\/StrongholdRelease::Release::split\]·····Constraint on type 'sysml:ForkNode' is not respected: /);
    // A change the checks see after the pause: a second one, a join with two successions out of it.
    await page.evaluate(() => window.SysMLCanvas.edit(() => {
      window.SysMLCanvas.state.model.relationships.push({ id: 's-extra2', kind: 'SuccessionAsUsage', from: 'Release.rejoin', to: 'Release.fix' });
      return 'Drew a succession';
    }));
    await checked(page);
    await until(page, () => /2 diagnostics/.test(document.querySelector('#validation-kinds summary')?.textContent || ''), null, 'the count follows');
    assert.equal(await page.evaluate(() => document.querySelector('#validation-kinds details').open), true, 'the section stays open');
    assert.equal(await page.locator('#validation-kinds li').count(), 2);
    await page.click('#undo');
    await checked(page);
    await until(page, () => /1 diagnostic$/.test(document.querySelector('#validation-kinds summary')?.textContent || ''), null, 'Undo takes it back');
    await page.click('#close-validation');
    assert.ok(await page.locator('#validation-panel').isHidden());
    assert.equal(await page.getAttribute('#validation', 'aria-expanded'), 'false');
    await finish(ctx);
  });
});
