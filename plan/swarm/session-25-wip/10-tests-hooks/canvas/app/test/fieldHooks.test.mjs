// The fields of Details, in Node: canvas/app/src/panels/fieldHooks.ts, the part of the panel that needs no browser. What
// the panel shows for an element, a line or a view (formOf), what a change to a field writes and says (changeField,
// endTyping), what a typed text is read as (readText), a picker's list (optionsOf), and the tables the panel is made
// from (FIELD_LOOKS, GROUP_ORDER, FIELD_HOOKS). The tests of plan/swarm/step-10.md, section 4, "fieldHooks.test.mjs".
//
// The contract is the comments of fieldHooks.ts and the step's file. Each expected value is worked out here from the
// model library (and from the words of the step's file), not from fieldHooks.ts: the layout's rules are restated in
// expectedForm(), and the constants the tests take from the file are only those the table names (ORDER_LOCKED,
// FIELD_LOOKS, GROUP_ORDER, fieldKey, and the words it gives as constants in test 15).
//
// The model library runs in another realm: what it makes is compared as JSON, through plain().

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { middleService, scaleState } from '../../test/scale-model.mjs';
import { lib, loadWith, plain, readJSON, stateFiles, clock } from './core.mjs';

const app = await loadWith('panels/fieldHooks');
const { formOf, optionsOf, changeField, endTyping, readText, viewKindFor, fieldKey, FIELD_LOOKS, GROUP_ORDER, GROUP_NAMES, ORDER_LOCKED } = app;

const stateFile = (name) => stateFiles().find((f) => f.name === name);

/** A session from a state file, and the mistakes the history reports (a write outside edit(), a change that lied). */
function open(file, data = readJSON(file.file ?? file)) {
  const mistakes = [];
  const session = app.openSession(lib, data, { name: file.name ?? 'file.json' }, { now: clock(), mistake: (error) => mistakes.push(error) });
  return { session, mistakes, model: session.model, history: session.history };
}
const example = () => open(stateFile('stronghold-proof.json'));
const noMistakes = (mistakes) => assert.deepEqual(mistakes.map(String), [], 'No mistake in the page\'s code may be reported: every write must be inside edit().');

const TABLES = { el: 'elements', rel: 'relationships', view: 'views' };
const itemsOf = (model, type) => model[TABLES[type]];
const itemOf = (model, type, id) => itemsOf(model, type).find((x) => x.id === id);
const pick = (type, id) => ({ type, id });
const json = (model) => JSON.stringify(model);
/** The words of the newest undo step and of the newest entry of the log. */
const said = (history) => [history.steps.at(-1)?.what, history.changes.at(-1)?.text];
/** Every row of a form, whatever the tab, in order. */
const rowsOf = (form) => [...form.core.flatMap((g) => g.rows), ...form.advanced];
const fieldRow = (form, field) => rowsOf(form).find((r) => r.row === 'field' && r.field === field);
const groupOf = (form, name) => form.core.find((g) => g.name === name);
/** A row as a sequence of its kind and its name, for comparing layouts. */
const skeleton = (row) => (row.row === 'field' ? ['field', row.field] : [row.row, row.name]);

// ---- The layout's rules, restated from the model library alone (formOf's comment, rules 1 to 6).

/** The kind of view a field with `views` is checked against: the view in front when it places the id, else the first
 *  view that places it, else the view in front. */
function viewKindOf(model, id, viewId) {
  const front = viewId === null ? null : model.views.find((v) => v.id === viewId) ?? null;
  const places = (v) => Object.prototype.hasOwnProperty.call(v.layout, id);
  const view = front && places(front) ? front : model.views.find(places) ?? front;
  return view ? view.kind : null;
}

/** What the form of an item must hold, as { title, what, groups: [{ name, rows: [skeleton] }], advanced: [skeleton], fields }. */
function expectedForm(model, type, item, viewId) {
  const details = lib.detailsOf(model, type, item);
  const kinds = type === 'el' ? lib.KINDS : type === 'rel' ? lib.RELATIONSHIPS : lib.VIEW_KINDS;
  const listed = kinds[item.kind].fields;
  const kind = viewKindOf(model, item.id, viewId);
  // The hooks' `shown`, as the step's words give them: a usage's defined-by line while it has a typing; Specializes and
  // Subsets while the element starts a specialization line.
  const shown = (field) => {
    if (field === 'typeLine') return lib.typingOf(model, item) !== null;
    if (field === 'specializes' || field === 'subsets') return lib.firstGeneral(model, item) !== null;
    return true;
  };
  const hasRow = (field) => {
    const spec = lib.FIELDS[field];
    return listed.includes(field) && !!spec && spec.type !== 'list' && !!FIELD_LOOKS[field] && shown(field)
      && (!spec.views || spec.views.includes(kind));
  };
  const detailsRow = (row) => (row.field !== undefined ? (hasRow(row.field) ? ['field', row.field] : null)
    : row.value !== undefined ? ['known', row.name] : ['notHeld', row.name]);
  const onTabs = new Set([...details.core, ...details.advanced].map((r) => r.field).filter((f) => f !== undefined));
  const extra = (field) => hasRow(field) && !onTabs.has(field);
  const main = [
    ...details.core.map(detailsRow).filter(Boolean),
    ...GROUP_ORDER.main.filter((f) => f !== 'doc' && extra(f)).map((f) => ['field', f]),
    ...(extra('doc') ? [['field', 'doc']] : []),
  ];
  const groups = [{ name: 'main', rows: main }];
  for (const name of ['typing', 'general', 'geometry']) groups.push({ name, rows: GROUP_ORDER[name].filter(extra).map((f) => ['field', f]) });
  const what = type === 'el' ? lib.describe(model, item) : type === 'rel' ? lib.describeRel(model, item) : lib.describeView(model, item);
  const advanced = details.advanced.map(detailsRow).filter(Boolean);
  return {
    title: details.title,
    what,
    groups: groups.filter((g) => g.rows.length),
    advanced,
    fields: listed.filter(hasRow),
  };
}

/** Every element, line and view of a session's model, as pickable items. */
const everything = (model) => ['el', 'rel', 'view'].flatMap((type) => itemsOf(model, type).map((item) => ({ type, item })));

// ---- Rows as the appendix of the step's file writes them, for test 2.
const F = (field, label, type, value, more = {}) => ({ row: 'field', field, label, type, value, ...more, locked: null });
const K = (name, label, value) => ({ row: 'known', name, label, value });
const N = (name, label) => ({ row: 'notHeld', name, label });
const NAME = (value) => F('name', 'Declared Name', 'string', value);
const DOC = (value) => F('doc', 'Documentation', 'text', value);
const REF = (field, id) => ({ choice: { id, label: id } });
const ELEMENT_ID = (id) => K('elementId', 'Element Id', id);
const TOP = [N('isImpliedIncluded', 'Is Implied Included'), K('isLibraryElement', 'Is Library Element', false)];
const SHORT = N('declaredShortName', 'Declared Short Name');

describe('the fields of Details, without a browser', () => {
  test('the form of every element, line and view of the ten files is the library\'s details, laid out as the old panel', () => {
    let forms = 0;
    for (const file of stateFiles()) {
      const { session, mistakes, model } = open(file);
      const front = model.views[0].id;
      for (const { type, item } of everything(model)) {
        const where = `${file.name}, ${type} ${item.id}`;
        const form = formOf(session, pick(type, item.id), front);
        forms++;
        assert.ok(form, `${where}: the model holds it, so it has a form.`);
        const want = expectedForm(model, type, item, front);
        assert.equal(form.type, type, `${where}: type.`);
        assert.equal(form.id, item.id, `${where}: id.`);
        assert.equal(form.title, want.title, `${where}: the title is detailsOf's.`);
        assert.equal(form.what, want.what, `${where}: what is the item in words.`);
        assert.deepEqual(plain(form.advanced.map(skeleton)), plain(want.advanced), `${where}: the Advanced tab is detailsOf's, row for row.`);
        assert.deepEqual(plain(form.core.map((g) => g.name)), plain(want.groups.map((g) => g.name)), `${where}: the groups, in the order of GROUP_NAMES, none empty.`);
        assert.deepEqual(plain(form.core.map((g) => g.rows.map(skeleton))), plain(want.groups.map((g) => g.rows)), `${where}: the rows of each group.`);
        const names = rowsOf(form).filter((r) => r.row === 'field').map((r) => r.field);
        assert.equal(new Set(names).size, names.length, `${where}: no field is in the form twice.`);
        assert.ok(!names.includes('code'), `${where}: the code links have no row.`);
        assert.deepEqual(plain([...names].sort()), plain([...want.fields].sort()), `${where}: every field the kind lists that applies and is shown in the view is in the form.`);
        for (const row of rowsOf(form).filter((r) => r.row === 'field')) {
          const spec = lib.FIELDS[row.field];
          assert.equal(row.label, FIELD_LOOKS[row.field].label, `${where}: ${row.field}'s label is its look's.`);
          assert.equal(row.type, spec.type, `${where}: ${row.field}'s type is its row's.`);
          if (row.field === 'order') assert.equal(row.locked, ORDER_LOCKED, `${where}: a message's order is always locked.`);
          else if (row.field !== 'parallel') assert.equal(row.locked, null, `${where}: ${row.field} is not locked.`);
        }
      }
      noMistakes(mistakes);
    }
    assert.equal(forms, 262, 'The ten files hold 262 elements, lines and views.');
  });

  test('what the example\'s Host, ServerHost, hosts, api, mount, a defined-by line and the view show, row by row', () => {
    const { session, mistakes, model } = example();
    const form = (type, id) => formOf(session, pick(type, id), 'v-proof');
    const docOf = (type, id) => itemOf(model, type, id).doc;
    /** The form compared whole where the appendix gives all of it; where it gives the beginning of the Advanced tab
     *  only, that beginning whole and the rest by kind and name from the library. */
    const compare = (type, id, literal, advancedBegins) => {
      const got = form(type, id);
      assert.ok(got, `${id} must have a form.`);
      const want = expectedForm(model, type, itemOf(model, type, id), 'v-proof');
      const { advanced, ...rest } = plain(got);
      assert.deepEqual(rest, literal, `${id}: the title, the words, the groups and every row of the Core tab, whole.`);
      assert.deepEqual(plain(advanced.slice(0, advancedBegins.length)), advancedBegins, `${id}: the Advanced tab begins so.`);
      assert.deepEqual(plain(advanced.map(skeleton)), plain(want.advanced), `${id}: the Advanced tab's other rows are the library's, by kind and name.`);
    };

    const host = (id, name, abstract, general) => ({
      type: 'el', id, what: `part def ${name}`, title: 'Part Definition Properties',
      core: [
        { name: 'main', rows: [NAME(name), K('qualifiedName', 'Qualified Name', `StrongholdProof::${name}`), SHORT, N('isIndividual', 'Is Individual'), DOC(docOf('el', id))] },
        ...(general ? [{ name: 'general', rows: [F('specializes', 'Specializes', 'ref', general, REF('specializes', general))] }] : []),
      ],
      advanced: [
        ELEMENT_ID(id), ...TOP, K('name', 'Name', name), N('shortName', 'Short Name'), F('abstract', 'Is Abstract', 'bool', abstract),
        N('isConjugated', 'Is Conjugated'), N('isSufficient', 'Is Sufficient'), N('isVariation', 'Is Variation'),
      ],
    });
    for (const [id, name, abstract, general] of [['Host', 'Host', true, null], ['ServerHost', 'ServerHost', false, 'Host']]) {
      const want = host(id, name, abstract, general);
      const { advanced, ...rest } = want;
      compare('el', id, rest, advanced);
      assert.deepEqual(plain(form('el', id).advanced), advanced, `${id}: the Advanced tab, whole.`);
    }

    // Page.hosts.
    const notHeld = ['Short Name', 'Is Abstract', 'Is Conjugated', 'Is Sufficient', 'Is Composite', 'Is Constant', 'Is Derived', 'Is End', 'Is Ordered', 'Is Portion', 'Is Unique', 'Is Variable', 'Is Reference', 'Is Variation', 'May Time Vary', 'Portion Kind'];
    const camel = (label) => label.replace(/ (.)/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toLowerCase());
    const hostsAdvanced = [ELEMENT_ID('Page.hosts'), ...TOP, K('name', 'Name', 'hosts'), ...notHeld.map((label) => N(camel(label), label))];
    const hosts = {
      type: 'el', id: 'Page.hosts', what: 'part hosts in Page', title: 'Part Properties',
      core: [
        { name: 'main', rows: [NAME('hosts'), K('qualifiedName', 'Qualified Name', 'StrongholdProof::Page::hosts'), SHORT, N('direction', 'Direction'), N('isIndividual', 'Is Individual'),
          F('multiplicity', 'Multiplicity', 'string', '1..*', { placeholder: '1, 0..1, or 1..*' }), DOC('')] },
        { name: 'typing', rows: [F('type', 'Typed by', 'ref', 'Host', REF('type', 'Host')), F('typeLine', 'draw the defined-by line', 'bool', true)] },
      ],
    };
    compare('el', 'Page.hosts', hosts, hostsAdvanced);
    assert.equal(form('el', 'Page.hosts').advanced.length, hostsAdvanced.length, 'Page.hosts: the Advanced tab holds exactly these rows.');

    // Page.hosts.api.
    compare('el', 'Page.hosts.api', {
      type: 'el', id: 'Page.hosts.api', what: 'port api in hosts', title: 'Port Properties',
      core: [
        { name: 'main', rows: [NAME('api'), K('qualifiedName', 'Qualified Name', 'StrongholdProof::Page::hosts::api'), SHORT, N('direction', 'Direction'),
          F('multiplicity', 'Multiplicity', 'string', '', { placeholder: '1, 0..1, or 1..*' }), DOC('')] },
        { name: 'typing', rows: [F('type', 'Typed by', 'ref', 'StrongholdApp', REF('type', 'StrongholdApp')), F('typeLine', 'draw the defined-by line', 'bool', false),
          F('conjugated', 'conjugated (~), the other side of the port', 'bool', true)] },
      ],
    }, [ELEMENT_ID('Page.hosts.api'), ...TOP, K('name', 'Name', 'api')]);

    // mount.
    compare('rel', 'mount', {
      type: 'rel', id: 'mount', what: 'connection mount, api to api', title: 'Connection Properties',
      core: [{ name: 'main', rows: [NAME('mount'), K('qualifiedName', 'Qualified Name', 'StrongholdProof::Page::mount'), SHORT, N('direction', 'Direction'), N('isIndividual', 'Is Individual'), DOC('')] }],
    }, [ELEMENT_ID('mount'), ...TOP, K('name', 'Name', 'mount')]);

    // t-hosts: a line with no field at all.
    compare('rel', 't-hosts', {
      type: 'rel', id: 't-hosts', what: 'hosts defined by Host', title: 'Feature Typing Properties',
      core: [{ name: 'main', rows: [N('declaredName', 'Declared Name'), K('qualifiedName', 'Qualified Name', ''), SHORT, K('general', 'General', 'part def Host'),
        K('specific', 'Specific', 'part hosts in Page'), K('type', 'Type', 'part def Host'), K('typedFeature', 'Typed Feature', 'part hosts in Page')] }],
    }, [ELEMENT_ID('t-hosts'), ...TOP, N('name', 'Name'), N('shortName', 'Short Name'), N('isImplied', 'Is Implied')]);
    assert.equal(form('rel', 't-hosts').advanced.length, 6, 't-hosts: the Advanced tab holds exactly six rows.');
    assert.ok(rowsOf(form('rel', 't-hosts')).every((r) => r.row !== 'field'), 't-hosts: no field on either tab.');

    // v-proof.
    compare('view', 'v-proof', {
      type: 'view', id: 'v-proof', what: 'view proofStructure', title: 'View Properties',
      core: [{ name: 'main', rows: [NAME('proofStructure'), K('qualifiedName', 'Qualified Name', 'StrongholdProof::proofStructure'), SHORT, N('direction', 'Direction'),
        K('exposedElement', 'Exposed Element', 'Page, hosts, api, app, api, Host and 7 more'), DOC('')] }],
    }, [ELEMENT_ID('v-proof'), ...TOP, K('name', 'Name', 'proofStructure')]);
    noMistakes(mistakes);
  });

  test('a field that shows in some kinds of view is checked against the view that shows the item', () => {
    const { session, mistakes, model } = open(stateFile('geometry.json'));
    const geometry = (viewId) => groupOf(formOf(session, pick('el', 'room'), viewId), 'geometry');
    const plan = geometry('v-plan');
    assert.ok(plan, 'room with the plan in front must have the group geometry.');
    assert.deepEqual(plain(plan.rows.map((r) => [r.field, r.value])), [['shape', 'Box'], ['unit', 'm'], ['length', 8], ['width', 6], ['height', 3], ['radius', ''], ['posX', 0], ['posY', 0], ['posZ', 0]],
      'The geometry group holds these fields, in this order, with these values.');
    assert.deepEqual(plain(plan.rows[0].choices), [{ value: '', label: 'none' }, ...lib.FIELDS.shape.values.slice(1).map((v) => ({ value: v, label: v }))], 'The shape is labelled by its values, but "none" for the empty one.');
    assert.equal(geometry('v-structure'), undefined, 'With the general view in front, which places room too, there is no geometry group.');
    assert.ok(geometry(null), 'With no view in front, the first view that places room (the plan) decides: the group is there.');
    assert.ok(model.views.find((v) => v.id === 'v-structure').layout.room, 'The structure places room as well.');

    assert.equal(viewKindFor(model, 'room', 'v-plan'), 'GeometryView');
    assert.equal(viewKindFor(model, 'room', 'v-structure'), 'GeneralView');
    assert.equal(viewKindFor(model, 'room', null), 'GeometryView');
    assert.equal(viewKindFor(model, 'room', 'no-such-view'), 'GeometryView');
    assert.equal(viewKindFor(model, 'Room', 'v-plan'), 'GeneralView', 'Room is placed by the structure only: the plan in front does not place it.');
    assert.equal(viewKindFor(model, 'nothing-places-this', 'v-plan'), 'GeometryView', 'An id no view places is checked against the view in front.');
    assert.equal(viewKindFor(model, 'nothing-places-this', null), null);
    noMistakes(mistakes);
  });

  test('the definition is the usage\'s typing: picking another moves its end, the box draws or hides its line, nothing takes it away', () => {
    const { session, mistakes, model, history } = example();
    const hosts = pick('el', 'Page.hosts');
    const form = () => formOf(session, hosts, 'v-proof');
    const typings = () => model.relationships.filter((r) => r.kind === 'FeatureTyping' && r.from === 'Page.hosts');
    const start = json(model);
    const first = form();
    assert.ok(first, 'Page.hosts must have a form.');
    const type = fieldRow(first, 'type');
    assert.equal(type.value, 'Host');
    assert.deepEqual(plain(type.choice), { id: 'Host', label: 'Host' });
    assert.equal(fieldRow(first, 'typeLine').value, true, 'The line of t-hosts is drawn: it has no hidden key.');

    assert.notEqual(changeField(session, hosts, 'type', 'ServerHost'), null, 'Another definition is a change.');
    assert.deepEqual(plain(typings().map((r) => [r.id, r.to])), [['t-hosts', 'ServerHost']], 'The same relationship, its end moved.');
    assert.deepEqual(said(history), ['Defined part hosts in Page by ServerHost', 'Defined part hosts in Page by ServerHost']);
    assert.equal(history.steps.length, 1);

    changeField(session, hosts, 'typeLine', false);
    assert.equal(itemOf(model, 'rel', 't-hosts').hidden, true, 'Hiding the line sets hidden.');
    assert.deepEqual(said(history), ['Hid the line hosts defined by ServerHost', 'Hid the line hosts defined by ServerHost']);
    changeField(session, hosts, 'typeLine', true);
    assert.ok(!('hidden' in itemOf(model, 'rel', 't-hosts')), 'Drawing the line takes the hidden key away.');
    assert.deepEqual(said(history), ['Drew the line hosts defined by ServerHost', 'Drew the line hosts defined by ServerHost']);

    changeField(session, hosts, 'type', '');
    assert.deepEqual(plain(typings()), [], 'Nothing as the definition takes the typing out of the model.');
    assert.deepEqual(said(history), ['Undefined part hosts in Page', 'Undefined part hosts in Page']);
    const bare = form();
    assert.equal(fieldRow(bare, 'typeLine'), undefined, 'With no typing there is no line to draw: no typeLine row.');
    assert.deepEqual(plain(fieldRow(bare, 'type').choice), { id: '', label: 'nothing yet' });
    assert.equal(fieldRow(bare, 'type').value, '');

    changeField(session, hosts, 'type', 'Host');
    assert.equal(typings().length, 1, 'A usage with no typing gets one.');
    const made = model.relationships.at(-1);
    assert.equal(made, typings()[0], 'It is pushed at the end of the relationships.');
    assert.deepEqual(plain(Object.keys(made)), ['id', 'kind', 'from', 'to', 'hidden'], 'Its keys are these five, in this order.');
    assert.equal(made.kind, 'FeatureTyping');
    assert.equal(made.from, 'Page.hosts');
    assert.equal(made.to, 'Host');
    assert.equal(made.hidden, true, 'It is hidden until typeLine is ticked.');
    assert.match(made.id, /^r[0-9a-z]+$/);
    assert.equal(model.relationships.filter((r) => r.id === made.id).length, 1, 'Its id is no other line\'s.');
    assert.equal(fieldRow(form(), 'typeLine').value, false);
    assert.deepEqual(said(history), ['Defined part hosts in Page by Host', 'Defined part hosts in Page by Host']);

    const steps = history.steps.length;
    assert.equal(changeField(session, hosts, 'type', 'Host'), null, 'The definition the usage has already is no change.');
    assert.equal(history.steps.length, steps, 'and no step.');
    for (let i = 0; i < 5; i++) assert.notEqual(history.undo(), null);
    assert.equal(json(model), start, 'Five Undos bring the model back to what it was.');
    noMistakes(mistakes);
  });

  test('Specializes and Subsets are the element\'s first specialization line', () => {
    const { session, mistakes, model, history } = example();
    const form = (id) => formOf(session, pick('el', id), 'v-proof');
    const wordsOf = () => said(history);
    assert.equal(fieldRow(form('Host'), 'specializes'), undefined, 'Host starts no specialization line: no specializes row.');
    const server = pick('el', 'ServerHost');
    const row = fieldRow(form('ServerHost'), 'specializes');
    assert.ok(groupOf(form('ServerHost'), 'general').rows.includes(row) || groupOf(form('ServerHost'), 'general').rows.some((r) => r.field === 'specializes'), 'specializes is in the group general.');
    assert.deepEqual(plain(row.choice), { id: 'Host', label: 'Host' });

    changeField(session, server, 'specializes', 'App');
    assert.equal(itemOf(model, 'rel', 's-ServerHost').to, 'App', 'The same relationship, its end moved.');
    assert.deepEqual(wordsOf(), ['Made part def ServerHost specialize App', 'Made part def ServerHost specialize App']);
    changeField(session, server, 'specializes', '');
    assert.equal(itemOf(model, 'rel', 's-ServerHost'), undefined, 'Nothing takes the line out of the model.');
    assert.deepEqual(wordsOf(), ['Took away the specialization of part def ServerHost', 'Took away the specialization of part def ServerHost']);
    assert.equal(fieldRow(form('ServerHost'), 'specializes'), undefined, 'With no line the row is gone.');

    const hosts = pick('el', 'Page.hosts');
    const push = (rel) => history.edit(() => { model.relationships.push(rel); return 'Drew a line'; });
    push({ id: 'sub', kind: 'Specialization', from: 'Page.hosts', to: 'Page.app' });
    const subsets = fieldRow(form('Page.hosts'), 'subsets');
    assert.ok(subsets, 'Page.hosts now starts a specialization line: it has a subsets row.');
    assert.deepEqual(plain(subsets.choice), { id: 'Page.app', label: 'app' });
    changeField(session, hosts, 'subsets', 'App');
    assert.equal(itemOf(model, 'rel', 'sub').to, 'App', 'Another general moves the line\'s end.');
    assert.deepEqual(wordsOf(), ['Made part hosts in Page subset App', 'Made part hosts in Page subset App'], 'A usage subsets: it does not specialize.');
    history.undo();
    changeField(session, hosts, 'subsets', '');
    assert.equal(itemOf(model, 'rel', 'sub'), undefined);
    assert.deepEqual(wordsOf(), ['Took away the subsetting of part hosts in Page', 'Took away the subsetting of part hosts in Page']);
    history.undo();
    const steps = history.steps.length;
    assert.equal(changeField(session, hosts, 'subsets', 'Page.app'), null, 'It holds Page.app already: no change.');
    assert.equal(history.steps.length, steps);

    push({ id: 'sub2', kind: 'Specialization', from: 'Page.hosts', to: 'App' });
    changeField(session, hosts, 'subsets', '');
    assert.deepEqual(plain(model.relationships.filter((r) => r.from === 'Page.hosts' && r.kind === 'Specialization').map((r) => r.id)), ['sub2'], 'Only the first of two lines is taken away.');
    assert.deepEqual(plain(fieldRow(form('Page.hosts'), 'subsets').choice), { id: 'App', label: 'App' }, 'The next line is now the first.');
    noMistakes(mistakes);
  });

  test('Is Parallel is locked while a state holds transitions, and a message\'s order always', () => {
    {
      const { session, mistakes, model, history } = open(stateFile('behavior-states.json'));
      const form = (id) => formOf(session, pick('el', id), 'v-host');
      assert.equal(fieldRow(form('HostLifecycle'), 'parallel').locked, 'Is Parallel can\'t change while state def HostLifecycle holds transitions, as in SysON.');
      assert.equal(fieldRow(form('HostLifecycle.running'), 'parallel').locked, null, 'A state that owns no transition is not locked.');
      const before = json(model);
      assert.equal(changeField(session, pick('el', 'HostLifecycle'), 'parallel', true), null, 'A locked field is not changed.');
      assert.equal(history.steps.length, 0, 'and makes no step.');
      assert.equal(json(model), before);
      assert.notEqual(changeField(session, pick('el', 'HostLifecycle.running'), 'parallel', false), null);
      assert.deepEqual(said(history), ['Set the parallel of state running in HostLifecycle to false', 'Set the parallel of state running in HostLifecycle to false']);
      noMistakes(mistakes);
    }
    {
      const { session, mistakes, model, history } = open(stateFile('sequence.json'));
      const login = formOf(session, pick('rel', 'm-login'), 'v-seq');
      const order = fieldRow(login, 'order');
      assert.equal(order.value, 1);
      assert.equal(order.type, 'number');
      assert.equal(order.locked, ORDER_LOCKED);
      const before = json(model);
      assert.equal(changeField(session, pick('rel', 'm-login'), 'order', 5, 'order:m-login'), null, 'A message\'s order is never changed in slice 1.');
      assert.equal(history.steps.length, 0);
      assert.equal(json(model), before);
      noMistakes(mistakes);
    }
  });

  test('the words of every change, for Undo and for the log', () => {
    const check = (session, words, where) => assert.deepEqual(said(session.history), [words, words], where ?? words);
    /** A typed field: each keystroke is a change under the field's key, and leaving the field ends the run. */
    const typed = (session, picked, field, value) => {
      const key = fieldKey(field, picked.id);
      assert.equal(typeof key, 'string');
      return [changeField(session, picked, field, value, key), endTyping(session, key)][0];
    };
    {
      const { session, mistakes, model } = example();
      const hosts = pick('el', 'Page.hosts');
      const page = pick('el', 'Page');
      typed(session, hosts, 'name', 'hostsx');
      check(session, 'Renamed to part hostsx in Page');
      changeField(session, page, 'abstract', true);
      check(session, 'Made abstract: part def Page');
      changeField(session, page, 'abstract', false);
      check(session, 'Made concrete: part def Page');
      const api = pick('el', 'Page.hosts.api');
      changeField(session, api, 'conjugated', false);
      check(session, 'Unconjugated port api in hostsx');
      changeField(session, api, 'conjugated', true);
      check(session, 'Conjugated port api in hostsx');
      typed(session, hosts, 'name', 'hosts');
      check(session, 'Renamed to part hosts in Page', 'The name put back says what it says');
      typed(session, page, 'doc', itemOf(model, 'el', 'Page').doc + ' More.');
      check(session, 'Wrote the doc of part def Page');
      const app1 = pick('el', 'Page.app');
      typed(session, app1, 'multiplicity', '1..2');
      check(session, 'Set the multiplicity of part app in Page to 1..2');
      typed(session, app1, 'multiplicity', '');
      check(session, 'Set the multiplicity of part app in Page to nothing');

      const mount = pick('rel', 'mount');
      typed(session, mount, 'doc', 'A doc.');
      check(session, 'Wrote the doc of the connection mount, api to api');
      typed(session, mount, 'name', 'mountx');
      check(session, 'Named the connection mountx, api to api');
      typed(session, mount, 'name', '');
      check(session, 'Named the connection api to api');

      const view = pick('view', 'v-proof');
      typed(session, view, 'doc', 'Why.');
      check(session, 'Wrote the doc of view proofStructure');
      typed(session, view, 'name', 'proofStructureXy');
      check(session, 'Renamed the view to proofStructureXy');
      typed(session, view, 'name', '  ');
      check(session, 'Renamed the view to (unnamed)');

      typed(session, pick('el', 'Host'), 'name', '');
      check(session, 'Renamed to part def (unnamed)');

      changeField(session, hosts, 'type', 'ServerHost');
      check(session, 'Defined part hosts in Page by ServerHost');
      changeField(session, hosts, 'typeLine', false);
      check(session, 'Hid the line hosts defined by ServerHost');
      changeField(session, hosts, 'typeLine', true);
      check(session, 'Drew the line hosts defined by ServerHost');
      changeField(session, hosts, 'type', '');
      check(session, 'Undefined part hosts in Page');

      changeField(session, pick('el', 'ServerHost'), 'specializes', 'App');
      check(session, 'Made part def ServerHost specialize App');
      changeField(session, pick('el', 'ServerHost'), 'specializes', '');
      check(session, 'Took away the specialization of part def ServerHost');

      session.history.edit(() => { model.relationships.push({ id: 'sub', kind: 'Specialization', from: 'Page.hosts', to: 'Page.hosts.api' }); return 'Drew a line'; });
      changeField(session, hosts, 'subsets', 'Page.app');
      check(session, 'Made part hosts in Page subset app');
      changeField(session, hosts, 'subsets', '');
      check(session, 'Took away the subsetting of part hosts in Page');
      noMistakes(mistakes);
    }
    {
      const { session, mistakes } = open(stateFile('geometry.json'));
      const room = pick('el', 'room');
      typed(session, room, 'length', 9);
      check(session, 'Set the length of part room to 9');
      changeField(session, room, 'shape', 'Sphere');
      check(session, 'Set the shape of part room to Sphere');
      noMistakes(mistakes);
    }
    {
      const { session, mistakes } = open(stateFile('interconnection.json'));
      const command = pick('rel', 'command');
      changeField(session, command, 'item', 'Fuel');
      check(session, 'Set the item of the flow command, ctrl to ctrl to Fuel');
      changeField(session, pick('rel', 'fuelLine'), 'interfaceDef', 'CtrlLink');
      check(session, 'Set the interface def of the interface fuelLine, fuelOut to fuelIn to CtrlLink');
      changeField(session, pick('el', 'FuelPort.supply'), 'direction', 'in');
      check(session, 'Set the direction of item supply in FuelPort to in');
      changeField(session, command, 'item', '');
      check(session, 'Set the item of the flow command, ctrl to ctrl to nothing');
      noMistakes(mistakes);
    }
    {
      const { session, mistakes } = open(stateFile('behavior-states.json'));
      changeField(session, pick('el', 'HostLifecycle.running'), 'parallel', false);
      check(session, 'Set the parallel of state running in HostLifecycle to false');
      typed(session, pick('rel', 't-mount'), 'guard', 'ready');
      check(session, 'Set the guard of the transition mount, idle to loading to ready');
      noMistakes(mistakes);
    }
    {
      const { session, mistakes } = open(stateFile('behavior-actions.json'));
      changeField(session, pick('el', 'Release.compile'), 'actionKind', 'send');
      check(session, 'Set the kind of action compile in Release to send');
      noMistakes(mistakes);
    }
  });

  test('every field of every element, line and view of the ten files, changed, is one undo step, undone and redone', () => {
    let changes = 0;
    let locked = 0;
    for (const file of stateFiles()) {
      const { session, mistakes, model, history } = open(file);
      const front = model.views[0].id;
      for (const { type, item } of everything(model)) {
        const picked = pick(type, item.id);
        const form = formOf(session, picked, front);
        for (const row of rowsOf(form).filter((r) => r.row === 'field')) {
          const where = `${file.name}, ${type} ${item.id}, ${row.field}`;
          if (row.locked !== null) { locked++; continue; }
          const spec = lib.FIELDS[row.field];
          let value;
          let typedField = false;
          if (spec.type === 'string' || spec.type === 'text') {
            value = readText(spec, row.value + (spec.trim ? '  xy  ' : 'xy'));
            typedField = true;
          } else if (spec.type === 'number') {
            value = row.value === 42 ? 43 : 42;
            typedField = true;
          } else if (spec.type === 'bool') value = !row.value;
          else if (spec.type === 'enum') value = spec.values.find((v) => v !== row.value);
          else {
            const other = optionsOf(session, picked, row.field).find((o) => o.id !== row.value);
            if (!other) continue;
            value = other.id;
          }
          const before = json(model);
          const steps = history.steps.length;
          const key = fieldKey(row.field, item.id);
          const touched = changeField(session, picked, row.field, value, typedField ? key : undefined);
          if (typedField) endTyping(session, key);
          assert.notEqual(touched, null, `${where}: the change must return what it touched.`);
          assert.equal(history.steps.length, steps + 1, `${where}: one undo step.`);
          assert.equal(history.steps.at(-1).key, null, `${where}: the step's run is ended.`);
          assert.equal(history.changes.at(-1).text, history.steps.at(-1).what, `${where}: the log says what the step says.`);
          const after = json(model);
          const now = fieldRow(formOf(session, picked, front), row.field);
          if (value === '' && (row.field === 'specializes' || row.field === 'subsets')) assert.equal(now, undefined, `${where}: the row is gone with the line.`);
          else {
            assert.ok(now, `${where}: the row is still in the form.`);
            assert.equal(now.value, value, `${where}: the form shows the new value.`);
          }
          assert.notEqual(history.undo(), null);
          assert.equal(json(model), before, `${where}: Undo brings the model back.`);
          assert.notEqual(history.redo(), null);
          assert.equal(json(model), after, `${where}: Redo makes the change again.`);
          history.undo();
          changes++;
        }
      }
      noMistakes(mistakes);
    }
    assert.ok(changes >= 780, `At least 780 changes are made, not ${changes}.`);
    assert.equal(locked, 5, 'Five fields are skipped as locked: HostLifecycle\'s parallel and the four messages\' order.');
  });

  test('typing is one run: its keystrokes are one step, a run back where it began is none, and only its own key ends it', () => {
    const { session, mistakes, model, history } = example();
    assert.equal(fieldKey('name', 'Host'), 'name:Host');
    const host = pick('el', 'Host');
    const logged = history.changes.length;
    for (const v of ['HostX', 'HostXy', 'HostXyz']) changeField(session, host, 'name', v, 'name:Host');
    assert.equal(history.steps.length, 1, 'Three keystrokes are one step.');
    assert.equal(history.steps[0].key, 'name:Host');
    assert.equal(history.steps[0].what, 'Renamed to part def HostXyz');
    assert.equal(history.changes.length, logged, 'The run is not logged until it ends.');
    endTyping(session, 'doc:Host');
    assert.equal(history.steps[0].key, 'name:Host', 'Another field\'s key does not end the run.');
    endTyping(session, 'name:Host');
    assert.equal(history.steps[0].key, null, 'Its own key does.');
    assert.equal(history.changes.length, logged + 1);
    assert.equal(history.changes.at(-1).text, 'Renamed to part def HostXyz');
    endTyping(session, 'name:Host');
    assert.equal(history.steps.length, 1, 'Ending a run that is ended changes nothing.');
    assert.equal(history.steps[0].key, null);
    assert.equal(history.changes.length, logged + 1);

    const settled = json(model);
    changeField(session, host, 'name', 'HostXyz!', 'name:Host');
    changeField(session, host, 'name', 'HostXyz', 'name:Host');
    endTyping(session, 'name:Host');
    assert.equal(history.steps.length, 1, 'A run that ends where it began is no step.');
    assert.equal(history.changes.length, logged + 1, 'and no entry of the log.');
    assert.equal(json(model), settled);

    changeField(session, host, 'name', 'HostQ', 'name:Host');
    changeField(session, host, 'doc', 'A doc.', 'doc:Host');
    assert.equal(history.steps.length, 3, 'The name\'s run and the doc\'s are two steps more.');
    assert.equal(history.steps.at(-2).key, null, 'Another key ended the name\'s run.');
    assert.equal(history.steps.at(-1).key, 'doc:Host', 'and the doc\'s is open.');
    noMistakes(mistakes);
  });

  test('what a typed text is read as', () => {
    const f = lib.FIELDS;
    assert.equal(readText(f.name, '  a b '), '  a b ', 'A name is read as it is.');
    assert.equal(readText(f.multiplicity, '  0..1  '), '0..1', 'A multiplicity has its ends off.');
    assert.equal(readText(f.doc, ' x\n'), ' x\n', 'A doc is read as it is.');
    for (const [text, number] of [['42', 42], [' 4.5 ', 4.5], ['-3', -3], ['1e3', 1000], ['', ''], ['   ', ''], ['abc', ''], ['1,5', ''], ['Infinity', '']]) {
      assert.equal(readText(f.length, text), number, `A length of ${JSON.stringify(text)} is ${JSON.stringify(number)}.`);
    }
    {
      const { session, mistakes, history } = example();
      const steps = history.steps.length;
      assert.equal(changeField(session, pick('el', 'Page.hosts'), 'multiplicity', '1..*'), null, 'What the field holds already is no change.');
      assert.equal(history.steps.length, steps);
      noMistakes(mistakes);
    }
    {
      const { session, mistakes, model, history } = open(stateFile('geometry.json'));
      changeField(session, pick('el', 'room'), 'length', '');
      assert.deepEqual(said(history), ['Set the length of part room to nothing', 'Set the length of part room to nothing']);
      assert.equal(itemOf(model, 'el', 'room').length, '', 'An unset number is held as an empty string.');
      noMistakes(mistakes);
    }
  });

  test('a picker\'s list: the empty choice first, in its field\'s words, then what the row allows', () => {
    const labels = (list) => plain(list).map((o) => [o.id, o.label]);
    const same = (...ids) => ids.map((id) => [id, id]);
    {
      const { session, mistakes, model, history } = example();
      const hosts = pick('el', 'Page.hosts');
      assert.deepEqual(labels(optionsOf(session, hosts, 'type')), [['', 'nothing yet'], ...same('Page', 'Host', 'App', 'ServerHost', 'OnlineHost', 'DevHost')]);
      assert.deepEqual(labels(optionsOf(session, pick('el', 'ServerHost'), 'specializes')), [['', 'nothing: take the line away'], ...same('Page', 'Host', 'App', 'OnlineHost', 'DevHost')]);
      history.edit(() => { itemOf(model, 'el', 'App').name = ''; return 'Renamed to part def (unnamed)'; });
      assert.deepEqual(labels(optionsOf(session, hosts, 'type')).find(([id]) => id === 'App'), ['App', '(unnamed)'], 'An element with no name is (unnamed).');
      history.undo();
      history.edit(() => { itemOf(model, 'rel', 't-hosts').to = 'StrongholdApp'; return 'Defined part hosts in Page by StrongholdApp'; });
      assert.deepEqual(labels(optionsOf(session, hosts, 'type')), [['', 'nothing yet'], ...same('Page', 'Host', 'App', 'ServerHost', 'OnlineHost', 'DevHost', 'StrongholdApp')],
        'The present choice, which the row does not allow, ends the list.');
      assert.deepEqual(plain(optionsOf(session, pick('el', 'Host'), 'name')), [], 'A field that is no ref has no list.');
      assert.deepEqual(plain(optionsOf(session, pick('el', 'Host'), 'specializes')), [], 'A field that does not apply has no list.');
      noMistakes(mistakes);
    }
    {
      const { session, mistakes } = open(stateFile('interconnection.json'));
      assert.deepEqual(labels(optionsOf(session, pick('rel', 'command'), 'item')), [['', 'nothing'], ...same('Fuel', 'Signal')]);
      assert.deepEqual(labels(optionsOf(session, pick('rel', 'fuelLine'), 'interfaceDef')), [['', 'nothing'], ...same('FuelLine', 'CtrlLink')]);
      noMistakes(mistakes);
    }
  });

  test('an item the model no longer holds has no form, and a change to it is none', () => {
    const { session, mistakes, model, history } = example();
    const front = 'v-proof';
    for (const type of ['el', 'rel', 'view']) {
      const gone = pick(type, 'nope');
      assert.equal(formOf(session, gone, front), null, `A ${type} the model does not hold has no form.`);
      assert.deepEqual(plain(optionsOf(session, gone, 'type')), []);
      assert.equal(changeField(session, gone, 'name', 'x'), null);
    }
    assert.equal(history.steps.length, 0);
    const mount = pick('rel', 'mount');
    assert.ok(formOf(session, mount, front), 'mount has a form.');
    history.edit(() => { model.relationships.splice(model.relationships.findIndex((r) => r.id === 'mount'), 1); return 'Took away mount'; });
    assert.equal(formOf(session, mount, front), null, 'mount taken out of the model has no form.');
    history.undo();
    assert.ok(formOf(session, mount, front), 'and after Undo it has one again.');
    const steps = history.steps.length;
    assert.equal(changeField(session, pick('el', 'Host'), 'multiplicity', '1'), null, 'A field its kind does not list is no change.');
    assert.equal(changeField(session, pick('el', 'Host'), 'code', []), null, 'The code links have no widget.');
    assert.equal(history.steps.length, steps);
    {
      const other = open(stateFile('interconnection.json'));
      assert.equal(changeField(other.session, pick('el', 'FuelPort.supply'), 'direction', 'sideways'), null, 'An enum\'s value that is none of its values is no change.');
      assert.equal(other.history.steps.length, 0);
      noMistakes(other.mistakes);
    }
    noMistakes(mistakes);
  });

  test('the form asks no picker for its options', () => {
    const names = ['type', 'item', 'interfaceDef', 'specializes', 'subsets'];
    const originals = new Map(names.map((n) => [n, lib.FIELDS[n].options]));
    const calls = { n: 0 };
    try {
      for (const name of names) {
        const original = originals.get(name);
        lib.FIELDS[name].options = function (...args) { calls.n++; return original.apply(this, args); };
      }
      for (const file of ['stronghold-proof.json', 'interconnection.json']) {
        const { session, mistakes, model } = open(stateFile(file));
        for (const { type, item } of everything(model)) {
          assert.ok(formOf(session, pick(type, item.id), model.views[0].id), `${file}: ${item.id} has a form.`);
        }
        assert.equal(calls.n, 0, `${file}: the forms of every item must ask no row for its options.`);
        noMistakes(mistakes);
      }
      const { session } = example();
      optionsOf(session, pick('el', 'Page.hosts'), 'type');
      assert.equal(calls.n, 1, 'A picker\'s list asks its row once.');
    } finally {
      for (const name of names) lib.FIELDS[name].options = originals.get(name);
    }
  });

  test('at 5,000 elements a form is read in under 50 ms and a picker\'s list in under 100 ms', (t) => {
    const ELEMENTS = 5000;
    const { session, mistakes } = open({ name: 'scale.json' }, scaleState(ELEMENTS));
    const middle = pick('el', middleService(ELEMENTS));
    const first = pick('el', 'Service1');
    const median = (run) => {
      run();
      const times = [];
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        run();
        times.push(performance.now() - start);
      }
      return times.sort((a, b) => a - b)[2];
    };
    assert.ok(formOf(session, middle, 'v-definitions'), 'The middle service has a form.');
    const form = median(() => formOf(session, middle, 'v-definitions'));
    assert.ok(optionsOf(session, first, 'specializes').length > 1, 'Service1 starts a specialization line, so its picker has a list.');
    const options = median(() => optionsOf(session, first, 'specializes'));
    t.diagnostic(`formOf at ${ELEMENTS} elements: ${form.toFixed(1)} ms by the median of 5; optionsOf of specializes: ${options.toFixed(1)} ms`);
    assert.ok(form < 50, `A form must be read in under 50 ms; it took ${form.toFixed(1)}.`);
    assert.ok(options < 100, `A picker's list must be made in under 100 ms; it took ${options.toFixed(1)}.`);
    noMistakes(mistakes);
  });

  test('every field the library has is given a look, but the code links; and no look or hook is for a field it has not', () => {
    const fields = Object.keys(lib.FIELDS).filter((f) => f !== 'code').sort();
    assert.deepEqual(Object.keys(app.FIELD_LOOKS).sort(), fields, 'FIELD_LOOKS must hold every field of the library but the code links, and no other.');
    const listed = Object.entries(GROUP_ORDER).flatMap(([group, list]) => list.map((field) => [group, field]));
    for (const [group, field] of listed) assert.equal(FIELD_LOOKS[field]?.group, group, `${field} is listed in ${group} and must have a look whose group is ${group}.`);
    assert.deepEqual(listed.map(([, f]) => f).sort(), fields, 'Every look is in exactly one GROUP_ORDER list.');
    assert.deepEqual(Object.keys(GROUP_ORDER), [...GROUP_NAMES]);
    for (const key of Object.keys(app.FIELD_HOOKS)) assert.ok(key in lib.FIELDS, `The hook ${key} must be for a field of the library.`);
    assert.equal(app.NOT_HELD, 'not held yet');
    assert.equal(app.UNNAMED, '(unnamed)');
    assert.equal(app.NOTHING, 'nothing');
    assert.equal(ORDER_LOCKED, 'The order can\'t be changed here yet. The old page changes it until slice 2.');
    assert.equal(app.notHeldWhy('Short Name'), 'The canvas doesn\'t hold Short Name yet: the text leaves it as SysML has it.');
  });
});
