// A session's checks: canvas/app/src/core/checks.ts, the contract in its comment and in plan/swarm/step-12.md, section 4.
// They keep what the model library finds wrong with the open file's model, and decide when it is looked for: only while
// somebody listens, 0.8 s after the last change, and at once after an undo or a redo. Nothing here needs a browser: the
// timer is a stand-in, and the model library is counted.
//
// The model library runs in another realm: compare ITS objects as JSON (plain). What the checks make belongs to this realm.

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { EXAMPLE, clock, lib, loadWith, plain, readText } from './core.mjs';

const TWINS = 'Two elements are named Host in the package.';
const RULE = "#validateNamespaceDistinguishibility·····[StrongholdProof/StrongholdProof]·····Constraint on type 'sysml:Namespace' is not respected: Its members part def Host and part def Host have the same name, and one is a kind of the other, so they can't be told apart.";
const TWIN_PROBLEMS = [{ id: 'Host', message: TWINS }, { id: 'App', message: TWINS }];
const TWIN_DIAGNOSTIC = {
  rule: 'validateNamespaceDistinguishibility',
  metaclass: 'Namespace',
  type: null,
  id: null,
  path: 'StrongholdProof',
  severity: 'warning',
  text: RULE,
  message: RULE.slice(RULE.indexOf('is not respected: ') + 'is not respected: '.length),
};
const PAUSE = 800;

/** The stand-in timer: each wait is kept, `run` calls it, and what `later` returns calls it off. */
function timer() {
  const waits = [];
  const later = (run, ms) => {
    const wait = { run, ms, off: false };
    waits.push(wait);
    return () => { wait.off = true; };
  };
  return { waits, later };
}

/** A session of the example, whose model library counts the calls of validate and validateSpec. */
async function open(options = {}) {
  const core = await loadWith('core/checks');
  const calls = { validate: 0, validateSpec: 0 };
  const counted = Object.freeze({
    ...lib,
    validate: (model) => { calls.validate += 1; return lib.validate(model); },
    validateSpec: (model) => { calls.validateSpec += 1; return lib.validateSpec(model); },
  });
  const session = core.openText(counted, readText(EXAMPLE), { name: 'stronghold-proof.json' }, { now: clock(), ...options });
  const el = (id) => session.model.elements.find((e) => e.id === id);
  const rename = (name, key = 'name:App') => session.history.edit(() => { el('App').name = name; return 'Renamed part def App to ' + name; }, key);
  return { core, session, calls, el, rename, ...timer() };
}
/** A listener that counts its calls. */
function counter() {
  const l = () => { l.calls += 1; };
  l.calls = 0;
  return l;
}

describe('the checks of a session', () => {
  test('a session has one set of checks, and a new one has no result', async () => {
    const { core, session, calls, waits, later } = await open();
    const checks = core.checksOf(session, { later });
    assert.equal(core.checksOf(session, { later }), checks, 'checksOf must give the same checks at each call for one session.');
    assert.equal(core.checksOf(session), checks, 'checksOf asked again with no options must still give the session\'s first checks.');
    const other = await open();
    assert.notEqual(core.checksOf(other.session, { later: other.later }), checks, 'Another session must have checks of its own.');
    assert.deepEqual(plain(checks.state), { found: null, stale: true }, 'A new session\'s checks must hold no result, and be stale.');
    assert.equal(checks.state, checks.state, 'state read twice with nothing changed must be one object.');
    assert.equal(waits.length, 0, 'No wait must be started by making the checks.');
    assert.equal(calls.validate, 0, 'The library\'s validate must not be called by making the checks.');
    assert.equal(calls.validateSpec, 0, 'The library\'s validateSpec must not be called by making the checks.');
  });

  test('the first listener has the checks run at once, and the example has no entry', async () => {
    const { core, session, calls, waits, later } = await open();
    const checks = core.checksOf(session, { later });
    const l = counter();
    checks.listen(l);
    assert.equal(calls.validate, 1, 'listen() must run the checks once before it returns, as it is the first listener and the state is stale.');
    assert.equal(calls.validateSpec, 1, 'The check listen() runs must call validateSpec once as well.');
    assert.deepEqual(plain(checks.state), { found: { problems: [], diagnostics: [] }, stale: false }, 'The example must have no problem and no broken rule, and the state must be fresh.');
    assert.equal(l.calls, 0, 'The listener must not be called for the check its own listen() ran.');
    assert.equal(waits.length, 0, 'No wait must be started: the first check is not left to a pause.');
  });

  test('a change waits 800 ms for a pause, and a second change starts the wait again', async () => {
    const { core, session, calls, waits, later, rename, el } = await open();
    const checks = core.checksOf(session, { later });
    const l = counter();
    checks.listen(l);
    const before = checks.state.found;
    session.history.edit(() => { el('App').name = 'Hos'; return 'Renamed part def App to Hos'; }, 'name:App');
    assert.equal(l.calls, 1, 'The listener must be called once for the edit, which made the state stale.');
    assert.equal(checks.state.stale, true, 'After an edit the state must be stale.');
    assert.equal(checks.state.found, before, 'After an edit the result must be the object it was, until the pause is over.');
    assert.equal(waits.length, 1, 'An edit must start one wait.');
    assert.equal(waits[0].ms, PAUSE, 'The wait must be 800 ms.');
    assert.equal(waits[0].off, false, 'The wait must not be called off yet.');
    assert.equal(calls.validate, 1, 'validate must not be called again inside the edit.');
    rename('Host');
    assert.equal(waits[0].off, true, 'The first wait must be called off when the next change comes.');
    assert.equal(waits.length, 2, 'The next change must start a second wait.');
    assert.equal(waits[1].ms, PAUSE, 'The second wait must be 800 ms too.');
    assert.equal(waits[1].off, false, 'The second wait must not be called off.');
    assert.equal(l.calls, 1, 'The listener must not be called again by a change that finds the state stale already.');
    assert.equal(calls.validate, 1, 'validate must still not be called before the pause is over.');
    waits[1].run();
    assert.equal(calls.validate, 2, 'The wait must run the check once.');
    assert.equal(checks.state.stale, false, 'After the check the state must be fresh.');
    assert.equal(l.calls, 2, 'The listener must be called once more, for the result.');
  });

  test('two part defs given one name are found under Grasp\'s problems and under the specification\'s rules, in SysON\'s words', async () => {
    const { core, session, waits, later, rename } = await open();
    const checks = core.checksOf(session, { later });
    checks.listen(counter());
    rename('Host');
    waits[0].run();
    assert.deepEqual(plain(checks.state.found.problems), TWIN_PROBLEMS, 'Grasp\'s problems must be the two elements named Host, Host first and App second.');
    assert.equal(checks.state.found.diagnostics.length, 1, 'The specification\'s rules must hold one diagnostic.');
    const [diagnostic] = checks.state.found.diagnostics;
    assert.equal(diagnostic.text, RULE, 'The diagnostic must read in SysON\'s label, whole.');
    assert.equal(diagnostic.type, null, 'The diagnostic is about the package, so its type must be null.');
    assert.equal(diagnostic.id, null, 'The diagnostic is about the package, so its id must be null.');
    assert.deepEqual(plain(diagnostic), TWIN_DIAGNOSTIC, 'The diagnostic must hold the rule, the metaclass, the path, the severity, the text and the message.');
  });

  test('an undo and a redo check at once', async () => {
    const { core, session, waits, later, rename } = await open();
    const checks = core.checksOf(session, { later });
    const l = counter();
    checks.listen(l);
    rename('Host');
    waits[0].run();
    const asked = waits.length;
    const told = l.calls;
    session.history.undo();
    assert.deepEqual(plain(checks.state), { found: { problems: [], diagnostics: [] }, stale: false }, 'After an undo, with no wait run, both lists must be empty and the state fresh.');
    assert.equal(l.calls, told + 1, 'The listener must be called once for the undo.');
    assert.equal(waits.length, asked, 'An undo must start no wait.');
    session.history.redo();
    assert.equal(checks.state.stale, false, 'After a redo, with no wait run, the state must be fresh.');
    assert.deepEqual(plain(checks.state.found.problems), TWIN_PROBLEMS, 'After a redo the twins must be found again at once.');
    assert.deepEqual(plain(checks.state.found.diagnostics.map((d) => d.text)), [RULE], 'After a redo the rule must be found again at once.');
    assert.equal(l.calls, told + 2, 'The listener must be called once for the redo.');
    assert.equal(waits.length, asked, 'A redo must start no wait.');

    // With a change waiting.
    session.history.undo();
    rename('Host', 'name:App:again');
    const waiting = waits[waits.length - 1];
    assert.equal(waiting.off, false, 'A change made after the undo must have a wait running.');
    assert.equal(checks.state.stale, true, 'A change made after the undo must leave the state stale.');
    session.history.undo();
    assert.equal(waiting.off, true, 'An undo must call off the wait that is running.');
    assert.deepEqual(plain(checks.state), { found: { problems: [], diagnostics: [] }, stale: false }, 'An undo with a change waiting must give empty lists at once.');
  });

  test('with no listener nothing is checked, and the next listener checks at once', async () => {
    const { core, session, calls, waits, later, rename } = await open();
    const checks = core.checksOf(session, { later });
    const stop = checks.listen(counter());
    stop();
    const found = checks.state.found;
    assert.equal(calls.validate, 1, 'The first listener must have had the checks run once.');
    rename('Host');
    assert.equal(waits.length, 0, 'With no listener a change must start no wait.');
    assert.equal(calls.validate, 1, 'With no listener a change must not call validate.');
    assert.equal(calls.validateSpec, 1, 'With no listener a change must not call validateSpec.');
    assert.equal(checks.state.stale, true, 'With no listener a change must make the state stale.');
    assert.equal(checks.state.found, found, 'With no listener a change must leave the result the object it was.');
    const l = counter();
    checks.listen(l);
    assert.equal(calls.validate, 2, 'A new first listener must have the checks run once more before listen() returns.');
    assert.deepEqual(plain(checks.state.found.problems), TWIN_PROBLEMS, 'The check run by the new listener must find the twins.');
    assert.equal(checks.state.stale, false, 'After the new listener\'s check the state must be fresh.');
    assert.equal(l.calls, 0, 'The new listener must not be called for the check its own listen() ran.');
  });

  test('a listener that leaves during the wait calls the wait off', async () => {
    const { core, session, waits, later, rename } = await open();
    const checks = core.checksOf(session, { later });
    const stop = checks.listen(counter());
    rename('Host');
    assert.equal(waits.length, 1, 'The change must have started a wait.');
    assert.equal(waits[0].off, false, 'The wait must be running before the listener leaves.');
    stop();
    assert.equal(waits[0].off, true, 'The last listener leaving must call the wait off.');
    assert.equal(checks.state.stale, true, 'The state must stay stale after the wait is called off.');
  });

  test('the end of a run of changes checks nothing', async () => {
    const { core, session, calls, waits, later, rename } = await open();
    const checks = core.checksOf(session, { later });
    const l = counter();
    checks.listen(l);
    rename('Host');
    const asked = waits.length;
    const state = checks.state;
    const told = l.calls;
    const checked = calls.validate;
    session.history.endEdit();
    assert.equal(waits.length, asked, 'endEdit() must start no wait.');
    assert.equal(waits.some((w) => w.off), false, 'endEdit() must call no wait off.');
    assert.equal(l.calls, told, 'endEdit() must not call the listener.');
    assert.equal(checks.state, state, 'endEdit() must leave the state the object it was.');
    assert.equal(calls.validate, checked, 'endEdit() must not run a check.');
  });

  test('a result that reads the same is the same object', async () => {
    const { core, session, waits, later, el } = await open();
    const checks = core.checksOf(session, { later });
    const l = counter();
    checks.listen(l);
    const found = checks.state.found;
    session.history.edit(() => { el('DevHost').doc = 'x'; return 'Changed a doc'; });
    waits[0].run();
    assert.equal(checks.state.found, found, 'A check that finds what the last result said must leave found the very object it was.');
    assert.equal(checks.state.stale, false, 'The check must leave the state fresh.');
    assert.equal(l.calls, 2, 'The listener must be called twice in all: for stale, then for fresh.');
    const state = checks.state;
    session.history.undo();
    assert.equal(checks.state, state, 'An undo that finds what the fresh result already says must leave state the very object it was.');
    assert.equal(l.calls, 2, 'An undo that changes nothing in the state must call nobody.');
  });

  test('the checks of two sessions do not hear each other', async () => {
    const a = await open();
    const b = await open();
    const checksA = a.core.checksOf(a.session, { later: a.later });
    const checksB = a.core.checksOf(b.session, { later: b.later });
    const la = counter();
    const lb = counter();
    checksA.listen(la);
    checksB.listen(lb);
    const stateB = checksB.state;
    a.rename('Host');
    assert.equal(checksA.state.stale, true, 'The first session\'s checks must be stale after its change.');
    assert.equal(a.waits.length, 1, 'The first session\'s change must start a wait.');
    assert.equal(la.calls, 1, 'The first session\'s listener must be called.');
    assert.equal(checksB.state, stateB, 'The second session\'s state must be the object it was.');
    assert.equal(b.waits.length, 0, 'The second session must have no wait started.');
    assert.equal(lb.calls, 0, 'The second session\'s listener must not be called.');
  });

  test('what an entry is about, and what a click on it picks', async () => {
    const { core, session } = await open();
    const model = session.model;
    const problem = (id) => plain(core.aboutProblem(model, { id, message: 'm' }));
    const diagnostic = (type, id) => plain(core.aboutDiagnostic(model, { type, id }));
    assert.deepEqual(problem('Host'), { type: 'el', id: 'Host', pick: [{ type: 'el', id: 'Host' }] }, 'A problem about an element must pick the element.');
    assert.deepEqual(problem('s-DevHost'), { type: 'rel', id: 's-DevHost', pick: [{ type: 'rel', id: 's-DevHost' }] }, 'A problem about a relationship that is drawn must pick the relationship.');
    assert.deepEqual(problem('t-hosts-api'), { type: 'rel', id: 't-hosts-api', pick: [{ type: 'rel', id: 't-hosts-api' }, { type: 'el', id: 'Page.hosts.api' }] }, 'A problem about a hidden relationship must pick the relationship, then the element it starts from.');
    assert.deepEqual(problem('v-proof'), { type: 'view', id: 'v-proof', pick: [{ type: 'view', id: 'v-proof' }] }, 'A problem about a view must pick the view.');
    assert.deepEqual(problem(null), { type: 'package', id: '', pick: [] }, 'A problem with a null id is about the package and must pick nothing.');
    assert.deepEqual(problem('gone'), { type: 'none', id: 'gone', pick: [] }, 'A problem about what the model no longer holds must be none and pick nothing.');
    assert.deepEqual(diagnostic(null, null), { type: 'package', id: '', pick: [] }, 'A diagnostic of type null is about the package and must pick nothing.');
    assert.deepEqual(diagnostic('el', 'Page'), { type: 'el', id: 'Page', pick: [{ type: 'el', id: 'Page' }] }, 'A diagnostic about an element must pick the element.');
    assert.deepEqual(diagnostic('rel', 's-DevHost'), { type: 'rel', id: 's-DevHost', pick: [{ type: 'rel', id: 's-DevHost' }] }, 'A diagnostic about a relationship that is drawn must pick the relationship.');
    assert.deepEqual(diagnostic('el', 'gone'), { type: 'none', id: 'gone', pick: [] }, 'A diagnostic about an element the model no longer holds must be none and pick nothing.');
  });

  test('every listener is told even when one throws', async () => {
    const mistakes = [];
    const { core, session, later, rename } = await open({ mistake: (error) => mistakes.push(error) });
    const checks = core.checksOf(session, { later });
    const first = () => { throw new Error('first'); };
    const second = counter();
    checks.listen(first);
    checks.listen(second);
    rename('Host');
    assert.equal(second.calls, 1, 'The second listener must be called although the first threw.');
    assert.equal(checks.state.stale, true, 'The state must be stale after the change.');
    assert.equal(mistakes.length, 1, 'The error of the first listener must reach the history\'s report once.');
    assert.equal(mistakes[0].message, 'first', 'The error thrown on must be the first listener\'s.');
  });

  test('the checks\' methods can be handed over as they are', async () => {
    const { core, session, calls, waits, later } = await open();
    const { listen } = core.checksOf(session, { later });
    const l = counter();
    listen(l);
    assert.equal(calls.validate, 1, 'A listen handed over alone must run the checks once before it returns.');
    assert.deepEqual(plain(core.checksOf(session).state), { found: { problems: [], diagnostics: [] }, stale: false }, 'A listen handed over alone must leave the example\'s state fresh and empty.');
    assert.equal(l.calls, 0, 'The listener must not be called for the check its own listen() ran.');
    assert.equal(waits.length, 0, 'No wait must be started.');
  });
});
