// The action table, the keys, the gestures that Escape calls off, and the hands the shell lends: core/commands.ts
// (Action, actions, actionOf, ask, editable, drawProblem, freshElement, freshRelationship, gesturesOf, PALETTE),
// core/keys.ts, core/hands.ts and core/actions/file.ts (plan/slice-2.md, section 4, seam 8, and section 5). They run
// in Node: the core has no DOM in it, so a key is a plain record of the press and of where it came from.
//
// The scaffold builds four rows (undo, redo, save, put-down). The rules of the keys reach further than those four: the
// arrows, F2, Delete and a key that types a character each have a rule of where they are the page's. So most tests
// here load the core with a stand-in for core/actions/camera.ts, "the file as a package could build it", whose rows
// carry those keys and write down what they were asked. The stand-in's rows come second in the table, straight after
// the file's four, so they are the rows of their keys whatever the later packages add.

import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, test } from 'node:test';
import { EXAMPLE, FIXTURES, clock, lib, loadCore, loadCoreWith, plain, readText } from './core.mjs';

const STAND_IN_ROWS = `
  import type { Action } from '../commands';
  import type { Session } from '../session';
  import type { Hit } from '../selection';
  /** What the stand-in rows were asked, in order. */
  export const STAND_IN: { asked: { id: string; at: Hit | null; choice: string | undefined }[] } = { asked: [] };
  const row = (id: string, key?: string): Action => ({
    id, title: 'Stand-in ' + id, ...(key === undefined ? {} : { key }),
    applies: () => true,
    run: (_session: Session, at: Hit | null, choice?: string) => { STAND_IN.asked.push({ id, at, choice }); },
  });
  export const CAMERA_ACTIONS: readonly Action[] = [
    row('stand-in:plus', '+'), row('stand-in:minus', '-'), row('stand-in:zero', '0'), row('stand-in:left', 'ArrowLeft'),
    row('stand-in:delete', 'Delete'), row('stand-in:f2', 'F2'), row('stand-in:alt-up', 'Alt+ArrowUp'), row('stand-in:type', 'printable'),
    {
      id: 'stand-in:make', title: 'Make',
      choices: () => [{ id: 'Host', title: 'Host' }, { id: 'App', title: 'App' }],
      applies: (_session, at) => (at ? true : 'Click where it goes.'),
      run: (_session, at, choice) => { STAND_IN.asked.push({ id: 'stand-in:make', at, choice }); return { made: { type: 'el', id: choice ?? 'Host' }, words: 'Made it' }; },
    },
    { id: 'stand-in:refuse', title: 'Refuse', applies: () => true, run: () => ({ refused: 'That is no longer there.' }) },
  ];
`;
const withRows = () => loadCoreWith({ 'core/actions/camera': STAND_IN_ROWS });

/** A session of the example, in the core given. */
function sessionOf(core, file = EXAMPLE) {
  return core.openText(lib, readText(file), { name: path.basename(file) }, { now: clock() });
}
const steps = (s) => s.history.steps.length;
const json = (s) => JSON.stringify(plain(s.model));
/** One real change, so that there is something to undo. */
const rename = (s, name) => s.history.edit(() => { s.model.elements.find((e) => e.id === 'Host').name = name; return `Renamed to part def ${name}`; });

/** A press of a key, as App.tsx describes a keydown. */
const press = (key, mods = {}) => ({ key, ctrl: false, meta: false, shift: false, alt: false, repeat: false, ...mods });
/** Where a press came from: nowhere special unless said. */
const from = (place = {}) => ({ typing: false, historyKeys: false, modal: false, widget: false, ...place });
const PAGE = from();
const FIELD = from({ typing: true });
const DETAILS_FIELD = from({ typing: true, historyKeys: true });
const WIDGET = from({ widget: true });
const MODAL = from({ modal: true });
const GROUND = { view: 'v-proof', type: 'ground', id: null, at: { x: 500, y: 800 }, add: false };

describe('the action table', () => {
  test('the table is put together from the rows', async () => {
    const core = await loadCore();
    const table = core.actions();
    assert.equal(core.actions(), table, 'actions() must give the same table at each call.');
    assert.deepEqual(table.slice(0, 4).map((a) => [a.id, a.title, a.key]), [
      ['undo', 'Undo', 'Mod+Z'], ['redo', 'Redo', 'Mod+Y'], ['save', 'Save', 'Mod+S'], ['put-down', 'Put down', 'Escape'],
    ], 'The file\'s four rows come first, with the ids, titles and keys of plan/slice-2.md, section 5.');
    for (const action of table) {
      assert.equal(core.actionOf(action.id), action, `actionOf('${action.id}') must give the row.`);
      assert.equal(typeof action.applies, 'function', `The row ${action.id} must say where it applies.`);
      assert.equal(typeof action.run, 'function', `The row ${action.id} must have what it does.`);
    }
    assert.equal(new Set(table.map((a) => a.id)).size, table.length, 'No two rows share an id.');
    assert.equal(core.actionOf('no-such-action'), null, 'A row that is not built is not in the table.');

    // A package's rows are in the table once its array holds them, wherever the array is among the modules.
    const standIn = await withRows();
    const ids = standIn.actions().map((a) => a.id);
    assert.deepEqual(ids.slice(0, 5), ['undo', 'redo', 'save', 'put-down', 'stand-in:plus'], 'A package\'s rows follow the file\'s, in its array\'s order.');
    assert.equal(standIn.actionOf('stand-in:make').title, 'Make');
    for (const action of standIn.actions()) assert.equal(standIn.actionOf(action.id), action);
  });

  test('two rows of one id are a mistake, which the table names', async () => {
    const twice = await loadCoreWith({ 'core/actions/camera': `
      import type { Action } from '../commands';
      export const CAMERA_ACTIONS: readonly Action[] = [{ id: 'undo', title: 'Undo again', applies: () => true, run: () => {} }];
    ` });
    assert.throws(() => twice.actions(), /undo/, 'A second row called undo must be refused by name.');
  });

  test('the palette\'s actions are a list of ids, in the menu\'s order', async () => {
    const core = await loadCore();
    assert.deepEqual([...core.PALETTE], ['edit-label', 'add-note', 'show-in-view', 'remove-from-view', 'message-up', 'message-down', 'delete']);
  });

  test('ask says a refusal and picks what was made', async () => {
    const core = await withRows();
    const s = sessionOf(core);
    const says = core.saysOf(s);
    const sel = core.selectionOf(s);
    const { asked } = core.STAND_IN;
    asked.length = 0;

    // Where the action does not apply: its sentence is said and returned, and it does not run.
    assert.deepEqual(core.ask(s, 'undo'), { refused: 'There is nothing to undo.' });
    assert.equal(says.said?.text, 'There is nothing to undo.', 'The refusal must be said.');
    const n = says.said.n;
    assert.deepEqual(core.ask(s, 'stand-in:make'), { refused: 'Click where it goes.' }, 'With no hit, at is null.');
    assert.equal(says.said.text, 'Click where it goes.');
    assert.ok(says.said.n > n, 'Each refusal is a new saying.');
    assert.equal(asked.length, 0, 'An action that does not apply must not run.');

    // Where it applies: it runs with the hit and the choice, and what it made is picked.
    const before = says.said;
    assert.deepEqual(core.ask(s, 'stand-in:make', GROUND, 'App'), { made: { type: 'el', id: 'App' }, words: 'Made it' });
    assert.deepEqual(asked, [{ id: 'stand-in:make', at: GROUND, choice: 'App' }], 'run must get the hit and the choice as they were asked.');
    assert.deepEqual(plain(sel.items), [{ type: 'el', id: 'App' }], 'What the action made must be picked, alone.');
    assert.equal(says.said, before, 'An action that worked says nothing by itself.');

    // A refusal that run returns is said the same way, and picks nothing.
    assert.deepEqual(core.ask(s, 'stand-in:refuse'), { refused: 'That is no longer there.' });
    assert.equal(says.said.text, 'That is no longer there.');
    assert.deepEqual(plain(sel.items), [{ type: 'el', id: 'App' }], 'A refusal must leave the selection as it was.');

    // An action that made nothing to pick answers nothing, and the selection stays.
    assert.equal(core.ask(s, 'stand-in:delete'), undefined);
    assert.deepEqual(asked.at(-1), { id: 'stand-in:delete', at: null, choice: undefined }, 'With no hit and no choice, run gets null and undefined.');
    assert.deepEqual(plain(sel.items), [{ type: 'el', id: 'App' }]);

    assert.throws(() => core.ask(s, 'no-such-action'), /no-such-action/, 'Asking a row the table does not hold is the caller\'s mistake.');
  });

  test('Undo, Redo and Save are rows: each does what its button did, and says why when it has nothing to do', async () => {
    const core = await loadCore();
    const s = sessionOf(core);
    const undo = core.actionOf('undo');
    const redo = core.actionOf('redo');
    const save = core.actionOf('save');
    assert.equal(undo.applies(s, null), 'There is nothing to undo.');
    assert.equal(redo.applies(s, null), 'There is nothing to redo.');
    assert.equal(save.applies(s, null), true, 'Save always applies.');
    const before = json(s);
    rename(s, 'Hostess');
    assert.equal(undo.applies(s, null), true);
    assert.equal(core.ask(s, 'undo'), undefined, 'Undo makes nothing to pick.');
    assert.equal(json(s), before, 'Undo must take the step back.');
    assert.equal(undo.applies(s, null), 'There is nothing to undo.');
    assert.equal(redo.applies(s, null), true);
    core.ask(s, 'redo');
    assert.equal(s.model.elements.find((e) => e.id === 'Host').name, 'Hostess', 'Redo must make the step again.');
    assert.deepEqual(core.ask(s, 'redo'), { refused: 'There is nothing to redo.' });
    assert.equal(core.saysOf(s).said.text, 'There is nothing to redo.');

    // Save is the shell's: the row calls the hand the shell gave, and with none given it does nothing.
    assert.equal(core.ask(s, 'save'), undefined, 'With no hands given Save must do nothing, and must not throw.');
    let saves = 0;
    core.handsOf(s).give({ save: () => { saves += 1; } });
    core.ask(s, 'save');
    assert.equal(saves, 1, 'Save must call the shell\'s save once.');
  });

  test('Escape calls off a gesture, or puts the tool down, or lets go of what is picked', async () => {
    const core = await loadCore();
    const s = sessionOf(core);
    const tools = core.toolsOf(s);
    const sel = core.selectionOf(s);
    const gestures = core.gesturesOf(s);
    const escape = () => core.pressed(s, press('Escape'), PAGE);
    assert.equal(core.actionOf('put-down').applies(s, null), true, 'Put down always applies.');
    const before = json(s);

    // All three at once: a gesture in progress, a tool in hand and something picked.
    sel.set([{ type: 'el', id: 'Host' }]);
    tools.arm('PartDefinition');
    let calledOff = 0;
    gestures.add(() => { calledOff += 1; });
    assert.equal(gestures.open, 1, 'A gesture that added itself is open.');

    assert.equal(escape(), true, 'Escape is a key of the table: the press is taken.');
    assert.equal(calledOff, 1, 'The first Escape must call the gesture off.');
    assert.equal(gestures.open, 0, 'A gesture called off is no longer open.');
    assert.equal(tools.armed?.kind, 'PartDefinition', 'The first Escape must leave the tool in hand.');
    assert.deepEqual(plain(sel.items), [{ type: 'el', id: 'Host' }], 'The first Escape must leave what is picked.');

    escape();
    assert.equal(calledOff, 1, 'A gesture is called off once.');
    assert.equal(tools.armed, null, 'The second Escape must put the tool down.');
    assert.deepEqual(plain(sel.items), [{ type: 'el', id: 'Host' }], 'The second Escape must leave what is picked.');

    escape();
    assert.deepEqual(plain(sel.items), [], 'The third Escape must let go of what is picked.');

    assert.equal(escape(), true, 'With nothing to put down Escape is still the page\'s key.');
    assert.equal(core.saysOf(s).said, null, 'Escape never says anything.');
    assert.equal(json(s), before, 'Escape writes nothing.');
    assert.equal(steps(s), 0, 'Escape makes no undo step.');

    // Asked as the action, it is the same row: a view picked by a click on the ground is let go too.
    sel.click(GROUND);
    assert.deepEqual(plain(sel.items), [{ type: 'view', id: 'v-proof' }]);
    assert.equal(core.ask(s, 'put-down'), undefined);
    assert.deepEqual(plain(sel.items), []);
    sel.front('v-proof');
    core.ask(s, 'put-down');
    assert.equal(sel.view, 'v-proof', 'Letting go of what is picked leaves the view in front where it is.');
  });

  test('a gesture adds itself while it lasts, and all that are open are called off together', async () => {
    const core = await loadCore();
    const s = sessionOf(core);
    const gestures = core.gesturesOf(s);
    assert.equal(core.gesturesOf(s), gestures, 'gesturesOf must give the same object at each call for one session.');
    assert.equal(gestures.open, 0);
    const called = [];
    const endA = gestures.add(() => called.push('a'));
    gestures.add(() => called.push('b'));
    assert.equal(gestures.open, 2);
    endA();
    assert.equal(gestures.open, 1, 'A gesture that ended takes itself out.');
    endA();
    assert.equal(gestures.open, 1, 'Taking itself out twice changes nothing.');
    gestures.cancelAll();
    assert.deepEqual(called, ['b'], 'Only a gesture still open is called off.');
    assert.equal(gestures.open, 0);
    gestures.cancelAll();
    assert.deepEqual(called, ['b'], 'With none open nothing is called.');

    // A gesture that takes itself out while it is called off, as a real one does, and one that throws.
    let stop = () => {};
    stop = gestures.add(() => { stop(); called.push('c'); });
    gestures.add(() => { throw new Error('gesture failed'); });
    gestures.add(() => called.push('d'));
    assert.throws(() => gestures.cancelAll(), /gesture failed/);
    assert.deepEqual(called, ['b', 'c', 'd'], 'Every gesture is called off even when one throws.');
    assert.equal(gestures.open, 0);
  });

  test('everything a session holds may be changed, until a library\'s element can be picked', async () => {
    const core = await loadCore();
    const s = sessionOf(core);
    for (const picked of [{ type: 'el', id: 'Host' }, { type: 'rel', id: 'mount' }, { type: 'view', id: 'v-proof' }]) {
      assert.equal(core.editable(s, picked), true);
    }
  });

  test('the shell gives its hands once, and the actions find them', async () => {
    const core = await loadCore();
    const s = sessionOf(core);
    const kept = core.handsOf(s);
    assert.equal(core.handsOf(s), kept, 'handsOf must give the same object at each call for one session.');
    assert.equal(kept.hands, null, 'A new session has no hands: the shell has not given them yet.');
    const hands = { save() {}, showText() {}, showView() {}, showPanel() {}, camera() {}, reveal() {}, copy: async () => {} };
    kept.give(hands);
    assert.equal(core.handsOf(s).hands, hands);
    kept.give(null);
    assert.equal(kept.hands, null, 'The shell takes its hands back when it goes.');
    assert.equal(core.handsOf(sessionOf(core)).hands, null, 'Another session has hands of its own.');
  });
});

describe('the keys', () => {
  test('keyOf spells a press as the key of its row, and the aliases are other spellings of a key', async () => {
    const core = await withRows();
    assert.deepEqual({ ...core.ALIASES }, { 'Mod+Shift+Z': 'Mod+Y', '=': '+', '_': '-' }, 'The aliases are section 2\'s three.');
    const spelled = [
      [press('z', { ctrl: true }), 'Mod+Z'], [press('z', { meta: true }), 'Mod+Z'], [press('Z', { ctrl: true }), 'Mod+Z'],
      [press('y', { ctrl: true }), 'Mod+Y'], [press('Z', { ctrl: true, shift: true }), 'Mod+Y'], [press('z', { meta: true, shift: true }), 'Mod+Y'],
      [press('s', { ctrl: true }), 'Mod+S'], [press('S', { meta: true }), 'Mod+S'],
      [press('Escape'), 'Escape'], [press('Delete'), 'Delete'], [press('F2'), 'F2'],
      [press('ArrowLeft'), 'ArrowLeft'], [press('ArrowUp', { alt: true }), 'Alt+ArrowUp'],
      [press('+', { shift: true }), '+'], [press('+'), '+'], [press('='), '+'],
      [press('-'), '-'], [press('_', { shift: true }), '-'], [press('0'), '0'],
      [press('a'), 'printable'], [press('A', { shift: true }), 'printable'], [press('1'), 'printable'], [press('é'), 'printable'],
      [press('@', { ctrl: true, alt: true }), 'printable'],
    ];
    for (const [p, key] of spelled) assert.equal(core.keyOf(p), key, `${JSON.stringify(p)} must read as ${key}.`);
    const none = [
      press('Backspace'), press('Enter'), press('Tab'), press(' '), press('Shift', { shift: true }), press('Dead'), press('F3'),
      press('ArrowRight'), press('ArrowDown', { alt: true }), press('ArrowLeft', { shift: true }), press('Escape', { shift: true }),
      press('a', { ctrl: true }), press('a', { meta: true }), press('a', { alt: true }), press('z', { ctrl: true, alt: true }),
      press('Delete', { ctrl: true }), press('y', { ctrl: true, shift: true }),
    ];
    for (const p of none) assert.equal(core.keyOf(p), null, `${JSON.stringify(p)} is no shortcut.`);

    // A key is a shortcut only as the key of a row: with the scaffold's four rows nothing types and nothing deletes.
    const bare = await loadCore();
    if (!bare.actions().some((a) => a.key === 'printable')) assert.equal(bare.keyOf(press('a')), null, 'With no row for a typed character, a character is no shortcut.');
    assert.equal(bare.keyOf(press('z', { ctrl: true })), 'Mod+Z');
  });

  test('a chord with Ctrl or ⌘ acts as slice 1\'s keys do: not from a text field, unless the field is one of Details', async () => {
    const core = await withRows();
    const s = sessionOf(core);
    const before = json(s);
    const undo = press('z', { ctrl: true });
    const redo = press('Z', { meta: true, shift: true });
    rename(s, 'Hostess');
    assert.equal(core.pressed(s, undo, FIELD), false, 'From a text field Undo is the field\'s own: the press is not taken.');
    assert.equal(steps(s), 1, 'From a text field Undo must change nothing.');
    assert.equal(core.pressed(s, undo, MODAL), false, 'Behind a modal dialog nothing acts.');
    assert.equal(steps(s), 1);
    assert.equal(core.pressed(s, undo, DETAILS_FIELD), true, 'From a field inside [data-history-keys] Undo is the history\'s.');
    assert.equal(json(s), before, 'Undo must have taken the step back.');
    assert.equal(core.pressed(s, redo, PAGE), true);
    assert.equal(steps(s), 1, '⌘ + Shift + Z must redo.');
    assert.equal(core.pressed(s, press('y', { ctrl: true }), WIDGET), true, 'A chord acts from a tree or a menu too.');
    assert.deepEqual(core.saysOf(s).said?.text, 'There is nothing to redo.', 'A key of the table pressed where its action does not apply says why.');
    assert.equal(core.pressed(s, undo, { ...PAGE, }), true);
    assert.equal(core.pressed(s, press('z', { ctrl: true, repeat: true }), PAGE), true, 'Undo held down does one thing per repeat.');
    assert.equal(core.saysOf(s).said.text, 'There is nothing to undo.');
  });

  test('Save acts from anywhere, once for a press, and its default is always prevented', async () => {
    const core = await withRows();
    const s = sessionOf(core);
    let saves = 0;
    core.handsOf(s).give({ save: () => { saves += 1; } });
    const save = press('s', { ctrl: true });
    assert.equal(core.pressed(s, save, PAGE), true);
    assert.equal(core.pressed(s, save, FIELD), true);
    assert.equal(core.pressed(s, save, WIDGET), true);
    assert.equal(saves, 3, 'Save acts from the page, from a text field and from a tree.');
    assert.equal(core.pressed(s, press('s', { meta: true, repeat: true }), PAGE), true, 'A held Save is still taken, so the browser\'s own Save never opens.');
    assert.equal(saves, 3, 'Save does not repeat.');
    assert.equal(core.pressed(s, save, MODAL), true, 'Behind a modal dialog Save\'s default is prevented too.');
    assert.equal(saves, 3, 'Behind a modal dialog Save saves nothing.');
    assert.equal(core.pressed(null, save, PAGE), true, 'With no file open Save\'s default is still prevented.');
    assert.equal(saves, 3);
  });

  test('with no file open a key of the table does nothing', async () => {
    const core = await withRows();
    core.STAND_IN.asked.length = 0;
    for (const p of [press('z', { ctrl: true }), press('Escape'), press('Delete'), press('F2'), press('a'), press('+')]) {
      assert.equal(core.pressed(null, p, PAGE), false, `${JSON.stringify(p)} must not be taken with no file open.`);
    }
    assert.equal(core.STAND_IN.asked.length, 0, 'With no session no action is asked.');
  });

  test('any other key is the page\'s unless it comes from a text field, and some keep out of a widget that uses them itself', async () => {
    const core = await withRows();
    const s = sessionOf(core);
    const { asked } = core.STAND_IN;
    const acts = (p, place) => {
      asked.length = 0;
      const taken = core.pressed(s, p, place);
      assert.equal(taken, asked.length === 1, `${JSON.stringify(p)}: the press is taken exactly when its action was asked.`);
      return taken ? asked[0] : null;
    };
    // [the press, the row it asks, the choice it carries, whether it acts from inside a tree, a menu or a list]
    const KEYS = [
      [press('Delete'), 'stand-in:delete', undefined, true],
      [press('F2'), 'stand-in:f2', undefined, false],
      [press('ArrowLeft'), 'stand-in:left', undefined, false],
      [press('ArrowUp', { alt: true }), 'stand-in:alt-up', undefined, false],
      [press('a'), 'stand-in:type', 'a', false],
      [press('Q', { shift: true }), 'stand-in:type', 'Q', false],
      [press('+', { shift: true }), 'stand-in:plus', undefined, true],
      [press('='), 'stand-in:plus', undefined, true],
      [press('-'), 'stand-in:minus', undefined, true],
      [press('_', { shift: true }), 'stand-in:minus', undefined, true],
      [press('0'), 'stand-in:zero', undefined, true],
    ];
    for (const [p, id, choice, inWidget] of KEYS) {
      assert.deepEqual(acts(p, PAGE), { id, at: null, choice }, `${JSON.stringify(p)} must ask ${id} from the page, with no hit.`);
      assert.equal(acts(p, FIELD), null, `${JSON.stringify(p)} from a text field is the field's own.`);
      assert.equal(acts(p, DETAILS_FIELD), null, `${JSON.stringify(p)} from a field of Details is the field's own: only a chord acts from there.`);
      assert.equal(acts(p, MODAL), null, `${JSON.stringify(p)} must do nothing behind a modal dialog.`);
      assert.equal(acts(p, WIDGET) !== null, inWidget, `${JSON.stringify(p)} from inside a tree, a menu or a list must ${inWidget ? 'act' : 'be the widget\'s own'}.`);
    }
    assert.equal(acts(press('Backspace'), PAGE), null, 'Backspace deletes nothing.');
    assert.equal(acts(press('Enter'), PAGE), null, 'A key that is no shortcut is not taken.');
    assert.equal(acts(press(' '), PAGE), null, 'The space bar belongs to the button that has the focus.');
  });

  test('Escape acts from a tree or a menu, and not from a text field or behind a dialog', async () => {
    const core = await loadCore();
    const s = sessionOf(core);
    const sel = core.selectionOf(s);
    const pick = () => sel.set([{ type: 'el', id: 'Host' }]);
    pick();
    assert.equal(core.pressed(s, press('Escape'), FIELD), false, 'Escape in a text field is the field\'s own.');
    assert.equal(core.pressed(s, press('Escape'), DETAILS_FIELD), false);
    assert.equal(core.pressed(s, press('Escape'), MODAL), false, 'Escape behind a modal dialog closes the dialog and nothing else.');
    assert.equal(sel.items.length, 1, 'None of the three may let go of what is picked.');
    assert.equal(core.pressed(s, press('Escape'), WIDGET), true);
    assert.equal(sel.items.length, 0, 'Escape from a row of the Explorer lets go of what is picked.');
  });
});

describe('what the commands hand to the actions', () => {
  test('drawProblem says why draw() would refuse, by its four checks in their order', async () => {
    const core = await loadCore();
    const s = sessionOf(core);
    const before = json(s);
    const ruled = lib.RELATIONSHIPS.Specialization.ends(s.model, lib.idsOf(s.model).get('Host'), lib.idsOf(s.model).get('StrongholdApp'), lib.idsOf(s.model));
    assert.equal(typeof ruled, 'string', 'The library must refuse a part def specializing a port def.');
    // 1. the rule on the first end; 2. one element twice; 3. drawn already; 4. the rule on the pair.
    assert.equal(core.drawProblem(s, 'FeatureTyping', 'Host', 'Host'), 'Only a usage is defined by something; part def Host is a definition.', 'The first end\'s rule speaks before the others.');
    assert.equal(core.drawProblem(s, 'Specialization', 'Host', 'Host'), 'Pick two different elements.');
    assert.equal(core.drawProblem(s, 'Specialization', 'ServerHost', 'Host'), 'That is already drawn.');
    assert.equal(core.drawProblem(s, 'FeatureTyping', 'Page.hosts.api', 'StrongholdApp'), 'That is already drawn.', 'A hidden line is drawn already too.');
    assert.equal(core.drawProblem(s, 'Specialization', 'Host', 'StrongholdApp'), ruled);
    assert.equal(core.drawProblem(s, 'Specialization', 'App', 'Page'), null, 'What draw() would draw has no problem.');
    // `but`: the line that is being moved is left out of the "already drawn" check, and of no other.
    assert.equal(core.drawProblem(s, 'Specialization', 'ServerHost', 'Host', 's-ServerHost'), null);
    assert.equal(core.drawProblem(s, 'Specialization', 'ServerHost', 'Host', 's-OnlineHost'), 'That is already drawn.');
    assert.equal(core.drawProblem(s, 'Specialization', 'Host', 'Host', 's-ServerHost'), 'Pick two different elements.');
    assert.throws(() => core.drawProblem(s, 'NoSuchKind', 'Host', 'App'), /NoSuchKind/);
    assert.throws(() => core.drawProblem(s, 'Specialization', 'nobody', 'App'), /nobody/);
    // draw() refuses in the same words, and draws what has no problem.
    assert.deepEqual(core.draw(s, 'Specialization', 'Host', 'StrongholdApp'), { refused: ruled });
    assert.equal(json(s), before, 'Neither drawProblem nor a refused draw() writes anything.');
    assert.ok('made' in core.draw(s, 'Specialization', 'App', 'Page'));
  });

  test('freshElement and freshRelationship make what place() and draw() make, and put nothing into the model', async () => {
    const core = await loadCore();
    const s = sessionOf(core, path.join(FIXTURES, 'interconnection.json'));
    const before = json(s);
    const part = core.freshElement(s, 'PartDefinition', 'Engine', null);
    assert.deepEqual(Object.keys(part).slice(0, 4), ['id', 'kind', 'name', 'doc'], 'An element\'s keys start id, kind, name, doc.');
    assert.match(part.id, /^e[0-9a-z]+$/, 'An element\'s id starts with e.');
    assert.deepEqual([part.kind, part.name, part.doc, part.owner], ['PartDefinition', 'Engine', '', undefined]);
    assert.ok(!('owner' in part), 'An element at the top of the package has no owner key.');
    const port = core.freshElement(s, 'PortUsage', 'feed', 'Tank');
    assert.equal(port.owner, 'Tank');
    assert.equal(Object.keys(port).at(-1), 'owner', 'The owner is an element\'s last key.');
    assert.equal(core.freshElement(s, 'ParameterUsage', 'p', null).direction, 'in', 'A parameter starts as in.');
    const portDef = s.model.elements.find((e) => e.kind === 'PortDefinition');
    assert.equal(core.freshElement(s, 'ItemUsage', 'i', portDef.id).direction, 'out', 'An item on a port def starts as out.');
    assert.equal(core.freshElement(s, 'ItemUsage', 'i', 'Tank').direction, '', 'An item anywhere else has no direction yet.');
    assert.notEqual(core.freshElement(s, 'PartDefinition', 'A', null).id, part.id, 'Each fresh element has an id of its own.');
    assert.throws(() => core.freshElement(s, 'NoSuchKind', 'x', null), /NoSuchKind/);

    const rel = core.freshRelationship(s, 'ConnectionUsage', 'System.tank', 'System.pump');
    assert.deepEqual(Object.keys(rel).slice(0, 4), ['id', 'kind', 'from', 'to']);
    assert.match(rel.id, /^r[0-9a-z]+$/, 'A relationship\'s id starts with r.');
    assert.deepEqual([rel.kind, rel.from, rel.to, rel.hidden], ['ConnectionUsage', 'System.tank', 'System.pump', undefined]);
    assert.throws(() => core.freshRelationship(s, 'NoSuchKind', 'System.tank', 'System.pump'), /NoSuchKind/);
    assert.equal(json(s), before, 'A fresh element or relationship is not yet in the model.');

    // What place() and draw() make is what these make, name and ends aside.
    core.selectionOf(s).front('v-ic');
    const placed = core.place(s, 'PartDefinition', { view: 'v-ic', type: 'ground', id: null, at: { x: 1100, y: 600 }, add: false });
    const made = s.model.elements.find((e) => e.id === placed.made.id);
    assert.deepEqual(Object.keys(plain(made)), Object.keys(part), 'place() makes an element with the keys of a fresh one.');
    const drawn = core.draw(s, 'ConnectionUsage', 'System.tank', 'System.pump');
    assert.deepEqual(Object.keys(plain(s.model.relationships.find((r) => r.id === drawn.made.id))), Object.keys(rel), 'draw() makes a relationship with the keys of a fresh one.');
  });

  test('a "defined by" line drawn from a usage that has a definition moves that line\'s end, and shows it', async () => {
    const core = await loadCore();
    const s = sessionOf(core);
    const before = json(s);
    const count = s.model.relationships.length;
    // t-hosts-api is the hidden typing of Page.hosts.api, which is defined by StrongholdApp.
    const index = s.model.relationships.findIndex((r) => r.id === 't-hosts-api');
    assert.equal(s.model.relationships[index].hidden, true, 'The example must hold the hidden typing t-hosts-api.');
    const other = core.freshElement(s, 'PortDefinition', 'Other', null);
    s.history.edit(() => { s.model.elements.push(other); return 'Added port def Other'; });
    const out = core.draw(s, 'FeatureTyping', 'Page.hosts.api', other.id);
    assert.deepEqual(out, { made: { type: 'rel', id: 't-hosts-api' }, words: 'Drew api defined by Other' }, 'What was made is the usage\'s one typing, under its own id.');
    assert.equal(s.model.relationships.length, count, 'No relationship is added and none is taken out.');
    const typing = s.model.relationships[index];
    assert.deepEqual([typing.id, typing.from, typing.to], ['t-hosts-api', 'Page.hosts.api', other.id], 'The typing keeps its id and its place, and its other end is moved.');
    assert.ok(!('hidden' in plain(typing)), 'A typing that was hidden is shown: it was drawn.');
    assert.equal(steps(s), 2, 'It is one undo step.');
    assert.deepEqual(plain(s.history.steps.at(-1).touched.relationships), ['t-hosts-api']);
    s.history.undo();
    s.history.undo();
    assert.equal(json(s), before, 'Undo must put the end back and hide the line again.');
  });
});

describe('what a skeleton is', () => {
  test('a function its package has not built yet says whose it is, and a row that is not built is not in the table', async (t) => {
    const core = await loadCore();
    const s = sessionOf(core);
    const projection = core.project(lib, s.model, s.model.views[0]);
    const ground = { view: 'v-proof', type: 'ground', id: null, at: { x: 0, y: 0 }, add: false };
    // The functions the scaffold leaves to a package, each with its package. While one is a skeleton, calling it must
    // throw "<name>: package 2-N builds it"; once its package has built it, this test has nothing to say of it.
    const SKELETONS = [
      ['fits', '2-2', () => core.fits(s, 'v-proof', 'Host', 'App')],
      ['reconnectProblem', '2-2', () => core.reconnectProblem(s, 'mount', 'to', 'Host')],
      ['reconnect', '2-2', () => core.reconnect(s, 'mount', 'to', 'Host')],
      ['labelEditOf.open', '2-3', () => core.labelEditOf(s).open({ type: 'el', id: 'Host' }, 'v-proof')],
      ['labelEditOf.keep', '2-3', () => core.labelEditOf(s).keep('Hostess')],
      ['rename', '2-3', () => core.rename(s, { type: 'el', id: 'Host' }, 'Hostess')],
      ['setViewOption', '2-4', () => core.setViewOption(s, 'v-proof', 'spacing', 64)],
      ['landingOf', '2-5', () => core.landingOf(s, 'v-proof', 'Host', projection, { x: 0, y: 0 })],
      ['land', '2-5', () => core.land(s.model, 'v-proof', 'Host', { owner: null, place: { x: 0, y: 0, w: 1, h: 1 }, words: '' })],
      ['notesOf.add', '2-7', () => core.notesOf(s).add({ type: 'el', id: 'Host' })],
      ['notesOf.setText', '2-7', () => core.notesOf(s).setText('n1', 'text')],
      ['notesOf.moveTo', '2-7', () => core.notesOf(s).moveTo('n1', { type: 'el', id: 'Host' })],
      ['notesOf.remove', '2-7', () => core.notesOf(s).remove('n1')],
      ['notesOf.archiveNote', '2-7', () => core.notesOf(s).archiveNote('n1')],
      ['notesOf.restore', '2-7', () => core.notesOf(s).restore('n1')],
      ['notesOf.attend', '2-7', () => core.notesOf(s).attend('n1')],
      ['notesOf.point', '2-7', () => core.notesOf(s).point('n1')],
      ['canCarry', '2-7', () => core.canCarry(s, { type: 'el', id: 'Host' })],
      ['dropPin', '2-7', () => core.dropPin(s, 'n1', ground, true)],
      ['codeLinksOf', '2-8', () => core.codeLinksOf(s, 'Host')],
      ['moveMessage', '2-10', () => core.moveMessage(s, 'v-proof', 'mount', 1)],
      ['sequenceStep', '2-10', () => core.sequenceStep(lib, s.model, s.model.views[0], projection, { kind: 'lifeline', id: 'Host', x: 0 })],
      ['sequenceResult', '2-10', () => core.sequenceResult(projection)],
      ['geometryResult', '2-11', () => core.geometryResult(projection, 'Host')],
      ['orderRows', '2-12', () => core.orderRows([], () => '', false)],
    ];
    const MARK = /: package 2-\d+ builds it$/;
    let skeletons = 0;
    for (const [name, pack, call] of SKELETONS) {
      let said = null;
      try { call(); } catch (error) { said = error instanceof Error ? error.message : String(error); }
      if (said === null || !MARK.test(said)) continue;   // built
      skeletons += 1;
      assert.equal(said, `${name}: package ${pack} builds it`, `While ${name} is a skeleton it must say that package ${pack} builds it.`);
    }
    const text = await core.exportText(s).then(() => null, (error) => error.message);
    if (text !== null && MARK.test(text)) { skeletons += 1; assert.equal(text, 'exportText: package 2-9 builds it'); }
    t.diagnostic(`${skeletons} of ${SKELETONS.length + 1} functions are still skeletons`);

    // The rows: each package's array is there, empty or filled, and beside them the table holds the file's four.
    const ROWS = ['CAMERA_ACTIONS', 'CODE_ACTIONS', 'BROWSER_ACTIONS', 'CONNECT_ACTIONS', 'LABEL_ACTIONS', 'REMOVE_ACTIONS', 'VIEW_ACTIONS', 'REPARENT_ACTIONS', 'NOTE_ACTIONS', 'TEXT_ACTIONS', 'SEQUENCE_ACTIONS', 'GEOMETRY_ACTIONS'];
    for (const name of ROWS) assert.ok(Array.isArray(core[name]), `${name} must be an array of rows.`);
    const theirs = new Set(ROWS.flatMap((name) => core[name].map((a) => a.id)));
    assert.deepEqual(core.actions().map((a) => a.id).filter((id) => !theirs.has(id)), ['undo', 'redo', 'save', 'put-down'], 'Beside the packages\' rows the table holds the file\'s four.');
    assert.deepEqual(core.actions().map((a) => a.id).filter((id) => theirs.has(id)).sort(), [...theirs].sort(), 'Every row of a package\'s array is in the table.');
  });
});
