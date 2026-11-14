// What the page says in passing: canvas/app/src/core/says.ts (plan/slice-2.md, section 4, seam 8). An action that
// does not apply, a gesture that is refused and an action's run say a sentence through saysOf(session); the toasts
// show whichever was said last, by a tool or through here. It runs in Node: the core is bundled by loadCore().

import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, test } from 'node:test';
import { EXAMPLE, clock, lib, loadCore, readText } from './core.mjs';

async function open(file = EXAMPLE) {
  const core = await loadCore();
  const s = core.openText(lib, readText(file), { name: path.basename(file) }, { now: clock() });
  return { core, s };
}

describe('what the page says in passing', () => {
  test('a session has one saysOf, which has said nothing', async () => {
    const { core, s } = await open();
    const says = core.saysOf(s);
    assert.equal(core.saysOf(s), says, 'saysOf must give the same object at each call for one session.');
    assert.notEqual(core.saysOf((await open()).s), says, 'Another session must have sayings of its own.');
    assert.equal(says.said, null, 'A new session has said nothing.');
  });

  test('say() holds the last sentence, with a number that grows, and tells the listeners once', async () => {
    const { core, s } = await open();
    const says = core.saysOf(s);
    let calls = 0;
    const stop = says.listen(() => { calls += 1; });
    says.say('There is nothing to undo.');
    const first = says.said;
    assert.equal(first.text, 'There is nothing to undo.');
    assert.equal(typeof first.n, 'number', 'A saying carries its number.');
    assert.equal(calls, 1, 'One saying must tell the listener once.');
    says.say('There is nothing to undo.');
    const second = says.said;
    assert.notEqual(second, first, 'The same sentence said again must be a new saying.');
    assert.ok(second.n > first.n, 'The same sentence said again must carry a larger number, so a toast shows it anew.');
    assert.equal(calls, 2);
    says.say('There is nothing to redo.');
    assert.equal(says.said.text, 'There is nothing to redo.', 'What was said last is what is held.');
    assert.ok(says.said.n > second.n);
    stop();
    says.say('Nobody hears this.');
    assert.equal(calls, 3, 'A listener that stopped must not be told.');
  });

  test('clear() takes the saying away, and tells only when there was one', async () => {
    const { core, s } = await open();
    const says = core.saysOf(s);
    let calls = 0;
    says.listen(() => { calls += 1; });
    says.clear();
    assert.equal(calls, 0, 'Clearing nothing must tell nobody.');
    says.say('Drop the line on the element it goes to.');
    says.clear();
    assert.equal(says.said, null);
    assert.equal(calls, 2, 'A saying and its clearing must each tell once.');
    says.say('Drop the line on the element it goes to.');
    assert.ok(says.said.n > 1, 'The numbers go on growing after a clear.');
  });

  test('every listener is told even when another throws, and the first error is thrown on', async () => {
    const { core, s } = await open();
    const says = core.saysOf(s);
    let told = 0;
    says.listen(() => { throw new Error('first'); });
    says.listen(() => { told += 1; });
    assert.throws(() => says.say('A sentence.'), /first/);
    assert.equal(told, 1, 'The second listener must be told though the first threw.');
    assert.equal(says.said.text, 'A sentence.', 'The saying must be held though a listener threw.');
  });

  test('a tool\'s saying and a saying through saysOf are numbered in one row, so the later of the two can be told', async () => {
    const { core, s } = await open();
    const says = core.saysOf(s);
    const tools = core.toolsOf(s);
    says.say('There is nothing to undo.');
    const a = says.said.n;
    // A port clicked onto the empty ground is refused, and the tool says why.
    tools.arm('PortUsage');
    tools.click({ view: 'v-proof', type: 'ground', id: null, at: { x: 500, y: 800 }, add: false });
    assert.ok(tools.said, 'The refused click must be said by the tool.');
    assert.ok(tools.said.n > a, 'What the tool said after must carry the larger number.');
    says.say('There is nothing to redo.');
    assert.ok(says.said.n > tools.said.n, 'What was said through saysOf after that must carry a larger number still.');
    assert.equal(says.said.text, 'There is nothing to redo.', 'The tool\'s saying must not take the place of saysOf\'s.');
  });

  test('its methods can be handed over as they are', async () => {
    const { core, s } = await open();
    const { say, clear, listen } = core.saysOf(s);
    let calls = 0;
    listen(() => { calls += 1; });
    say('A sentence.');
    clear();
    assert.equal(calls, 2);
  });
});
