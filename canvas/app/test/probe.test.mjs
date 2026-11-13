// The probe: canvas/app/src/core/probe.ts, the contract in its comments and in plan/swarm/step-12.md, sections 3 and 4.
// It finds out what this browser lets the page do, one line for each question, for the About panel. Every question
// is asked through a ProbeEnv, and these tests hand in stand-ins for it, so they need no browser. browserEnv() needs
// a window and is seen in about.test.mjs.

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { loadWith } from './core.mjs';

const core = await loadWith('core/probe');

const CHROME = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.8010.12 Safari/537.36';
const RATE = { resources: { core: { limit: 60, used: 3, remaining: 57, reset: 1794571200 } }, rate: { limit: 60, used: 3, remaining: 57, reset: 1794571200 } };
const AT = '2026-11-13T12:00:00.000Z';
const REMEMBERED_NOW = 'Remembered now: grasp-folder. Reload the page, or restart the browser, and open About again.';

/** A stand-in ProbeEnv: every question answered well, the loop's times 39 and 277 ms; `over` replaces members. */
function envOf(over = {}) {
  const store = new Map();
  const waits = [];
  const times = [0, 39, 316];
  return {
    userAgent: CHROME, secure: true, openPicker: true, savePicker: true,
    pickFolder: async () => ({ name: 'grasp-folder', queryPermission: async () => 'granted' }),
    fileInput: true, download: true,
    tryStorage() {},
    kept: { get: async (key) => store.get(key), put: async (key, value) => { store.set(key, value); }, remove: async (key) => { store.delete(key); } },
    tryWorker: async () => {},
    wasm: { instantiate: (bytes) => WebAssembly.instantiate(bytes) },
    fetch: async () => ({ ok: true, status: 200, json: async () => RATE }),
    now: () => times.shift(), date: () => AT, load: 'load-1',
    later: (run, ms) => { const wait = { run, ms, off: false }; waits.push(wait); return () => { wait.off = true; }; },
    store, waits, ...over,
  };
}

/** Lets every promise that is ready run. */
async function settle() {
  for (let i = 0; i < 20; i += 1) await new Promise((resolve) => setImmediate(resolve));
}
const line = (probe, id) => probe.lines.find((l) => l.id === id);
const said = (probe, id) => { const l = line(probe, id); return [l.state, l.value]; };
const waitOf = (env, ms) => env.waits.find((w) => w.ms === ms);
/** A promise the test settles itself. */
function held() {
  const h = {};
  h.promise = new Promise((resolve, reject) => { h.resolve = resolve; h.reject = reject; });
  return h;
}
/** A round from a fresh probe, settled. */
async function round(over) {
  const env = envOf(over);
  const probe = core.createProbe(env);
  probe.ask();
  await settle();
  return { env, probe };
}

const LINES = [
  ['browser', 'Browser'], ['secure', 'Secure context'], ['open-picker', 'Open picker'], ['save-picker', 'Save picker'],
  ['folder-picker', 'Folder picker'], ['file-input', 'File input'], ['download', 'Download'], ['local-storage', 'localStorage'],
  ['indexed-db', 'IndexedDB'], ['worker', 'Worker from a Blob URL'], ['wasm', 'WebAssembly'], ['github', 'GitHub'], ['folder', 'Remembered folder'],
];

describe('the probe', () => {
  test('before it is asked, every line is pending and says Asking…, in the panel\'s order', () => {
    let fetched = 0;
    let read = 0;
    let worked = 0;
    const env = envOf({
      fetch: async () => { fetched += 1; return { ok: true, status: 200, json: async () => RATE }; },
      tryWorker: async () => { worked += 1; },
    });
    const get = env.kept.get;
    env.kept.get = async (key) => { read += 1; return get(key); };
    const probe = core.createProbe(env);
    assert.equal(probe.lines.length, 13, 'The probe must have thirteen lines before it is asked.');
    assert.deepEqual(probe.lines.map((l) => [l.id, l.label]), LINES, "The lines must be in the panel's order, each with its label.");
    for (const l of probe.lines) {
      assert.equal(l.state, 'pending', `The ${l.label} line must be pending before anything is asked.`);
      assert.equal(l.value, 'Asking…', `The ${l.label} line must say Asking… before anything is asked.`);
    }
    assert.equal(fetched, 0, 'Making the probe must not make a request to GitHub.');
    assert.equal(read, 0, 'Making the probe must not read what is kept.');
    assert.equal(worked, 0, 'Making the probe must not make a worker.');
    assert.equal(env.waits.length, 0, 'Making the probe must not start a wait, the loop\'s included.');
  });

  test('a round answers the lines that need no waiting at once, and the others as their answers come', async () => {
    const calls = [];
    const env = envOf({
      fetch: async (url, init) => { calls.push({ url, init }); return { ok: true, status: 200, json: async () => RATE }; },
    });
    const probe = core.createProbe(env);
    let told = 0;
    probe.listen(() => { told += 1; });
    probe.ask();
    assert.deepEqual(said(probe, 'browser'), ['told', 'Chrome 153.0.8010.12'], 'The browser line must name the browser and its version at once.');
    assert.deepEqual(said(probe, 'secure'), ['yes', 'Yes.'], 'The secure context line must be answered at once.');
    for (const id of ['open-picker', 'save-picker', 'folder-picker', 'file-input', 'download']) {
      assert.deepEqual(said(probe, id), ['yes', 'Present.'], `The ${id} line must say Present. at once.`);
    }
    assert.deepEqual(said(probe, 'local-storage'), ['yes', 'Works.'], 'The localStorage line must be answered at once.');
    for (const id of ['indexed-db', 'worker', 'wasm', 'github', 'folder']) {
      assert.deepEqual(said(probe, id), ['pending', 'Asking…'], `The ${id} line must be pending straight after ask().`);
    }
    assert.equal(told, 1, 'ask() must tell the listeners once, with the quick lines answered and the others pending.');
    await settle();
    assert.deepEqual(said(probe, 'indexed-db'), ['yes', 'Works.'], 'The IndexedDB line must say Works. once its answers have come.');
    assert.deepEqual(said(probe, 'worker'), ['yes', 'Works.'], 'The worker line must say Works. once the worker has answered.');
    assert.deepEqual(said(probe, 'github'), ['yes', 'Reached: 57 of 60 requests left this hour.'], 'The GitHub line must say how many requests are left.');
    assert.deepEqual(said(probe, 'folder'), ['told', 'None is remembered.'], 'The folder line must say none is remembered when nothing is kept.');
    assert.deepEqual(said(probe, 'wasm'), ['pending', 'Asking…'], 'The WebAssembly line must stay pending until its wait of 400 ms has run.');
    assert.equal(env.store.has('probe'), false, 'The IndexedDB line must remove the key it wrote.');
    assert.equal(calls.length, 1, 'A round must make one request to GitHub, no more.');
    assert.equal(calls[0].url, 'https://api.github.com/rate_limit', 'The request must go to api.github.com/rate_limit.');
    assert.equal(calls[0].init.cache, 'no-store', 'The request must ask for no cache.');
    assert.ok(calls[0].init.signal instanceof AbortSignal, 'The request must carry an AbortSignal, to be given up on.');
  });

  test('what is missing or blocked is said on its line', async () => {
    const refuse = async () => { throw new Error('Internal error opening backing store'); };
    const first = await round({
      secure: false, openPicker: false, savePicker: false, pickFolder: null, fileInput: false, download: false,
      tryStorage() { throw new Error('The operation is insecure.'); },
      kept: { get: refuse, put: refuse, remove: refuse },
      tryWorker: async () => { throw new Error('no answer within 3 s'); },
    });
    const p = first.probe;
    assert.deepEqual(said(p, 'secure'), ['no', 'No: the file pickers need one.'], 'A page that is no secure context must say that the file pickers need one.');
    assert.deepEqual(said(p, 'open-picker'), ['no', 'Missing: Open asks through a file input, and Save downloads the file.'], 'A missing open picker must say what Open does instead.');
    assert.deepEqual(said(p, 'save-picker'), ['no', 'Missing.'], 'A missing save picker must say Missing.');
    assert.deepEqual(said(p, 'folder-picker'), ['no', 'Missing: no folder can be remembered.'], 'A missing folder picker must say that no folder can be remembered.');
    assert.deepEqual(said(p, 'file-input'), ['no', 'Missing.'], 'A missing file input must say Missing.');
    assert.deepEqual(said(p, 'download'), ['no', 'Missing.'], 'A missing download must say Missing.');
    assert.deepEqual(said(p, 'local-storage'), ['no', 'Blocked: The operation is insecure.'], 'A localStorage that throws must be Blocked with its own reason.');
    assert.deepEqual(said(p, 'indexed-db'), ['no', 'Blocked: Internal error opening backing store.'], 'An IndexedDB that refuses must be Blocked with its own reason.');
    assert.deepEqual(said(p, 'worker'), ['no', 'Blocked: no answer within 3 s.'], 'A worker that fails must be Blocked with its reason.');
    assert.deepEqual(said(p, 'folder'), ['no', 'Cannot be read: Internal error opening backing store.'], 'A store that cannot be read must make the folder line say Cannot be read with its reason.');

    const other = envOf();
    const store = other.store;
    other.kept.get = async (key) => (key === 'probe' ? 2 : store.get(key));
    const second = core.createProbe(other);
    second.ask();
    await settle();
    assert.deepEqual(said(second, 'indexed-db'), ['no', 'Blocked: what was written did not come back.'], 'An IndexedDB that gives back another value than was written must be Blocked, and say so.');

    const third = await round({ openPicker: true, savePicker: false });
    assert.equal(line(third.probe, 'open-picker').state, 'yes', 'The open picker line must follow the open picker alone.');
    assert.equal(line(third.probe, 'save-picker').state, 'no', 'The save picker line must follow the save picker alone.');
  });

  test('the browser\'s name and version come from its user agent', () => {
    const chrome = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36';
    const cases = [
      [CHROME, 'Chrome 153.0.8010.12'],
      [chrome, 'Chrome 157.0.0.0'],
      [chrome + ' Edg/157.0.0.0', 'Edge 157.0.0.0'],
      ['Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0', 'Firefox 140.0'],
      ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.1 Safari/605.1.15', 'Safari 19.1'],
      ['curl/8', 'curl/8'],
      ['   ', 'Not told.'],
    ];
    for (const [agent, name] of cases) {
      assert.equal(core.browserOf(agent), name, `The user agent ${JSON.stringify(agent)} must be named ${JSON.stringify(name)}.`);
    }
  });

  test('GitHub\'s answer: reached with what is left, reached, answered with a status, not reached', async () => {
    const answer = (json) => async () => ({ ok: true, status: 200, json });
    const cases = [
      ['an answer with the rate limit', answer(async () => RATE), 'yes', 'Reached: 57 of 60 requests left this hour.'],
      ['an answer with an empty body', answer(async () => ({})), 'yes', 'Reached.'],
      ['an answer whose body cannot be read', answer(async () => { throw new SyntaxError('Unexpected end of JSON input'); }), 'yes', 'Reached.'],
      ['an answer with numbers outside resources.core', answer(async () => ({ rate: { limit: 60, remaining: 57 } })), 'yes', 'Reached.'],
      ['an answer that is not ok', async () => ({ ok: false, status: 403, json: async () => ({}) }), 'no', 'Answered with HTTP 403.'],
      ['a request that fails', async () => { throw new TypeError('Failed to fetch'); }, 'no', 'Not reached: Failed to fetch.'],
      ['a browser with no fetch', null, 'no', 'Not reached: this browser has no fetch.'],
    ];
    for (const [what, fetch, state, value] of cases) {
      const { env, probe } = await round({ fetch });
      assert.deepEqual(said(probe, 'github'), [state, value], `For ${what}, the GitHub line must be ${state}: ${value}`);
      if (what === 'an answer with the rate limit') {
        const wait = waitOf(env, 10000);
        assert.ok(wait, 'The probe must wait up to 10 s for GitHub, through env.later.');
        assert.equal(wait.off, true, 'The wait of 10 s must be called off once GitHub has answered.');
      }
    }
  });

  test('GitHub that does not answer within 10 s is given up, and its late answer changes nothing', async () => {
    const pending = held();
    let signal = null;
    const env = envOf({ fetch: (url, init) => { signal = init.signal; return pending.promise; } });
    const probe = core.createProbe(env);
    probe.ask();
    await settle();
    assert.deepEqual(said(probe, 'github'), ['pending', 'Asking…'], 'The GitHub line must be pending while GitHub has not answered.');
    const wait = waitOf(env, 10000);
    assert.ok(wait, 'The probe must wait up to 10 s for GitHub, through env.later.');
    wait.run();
    await settle();
    assert.deepEqual(said(probe, 'github'), ['no', 'Not reached: no answer within 10 s.'], 'After 10 s without an answer the GitHub line must say it is not reached.');
    assert.equal(signal.aborted, true, 'The request must be aborted when GitHub is given up on.');
    const given = line(probe, 'github');
    pending.resolve({ ok: true, status: 200, json: async () => RATE });
    await settle();
    assert.equal(line(probe, 'github'), given, 'An answer that comes after the 10 s must not change the GitHub line.');
  });

  test('the loop runs once for the page, after the panel is up, and gives both times', async () => {
    let instantiated = 0;
    // The real compile runs on another thread and may take longer than settle()'s turns on a busy machine, so the
    // test waits for it before it looks at the line.
    let compiling = null;
    const env = envOf({ wasm: { instantiate: (bytes) => { instantiated += 1; compiling = WebAssembly.instantiate(bytes); return compiling; } } });
    const probe = core.createProbe(env);
    probe.ask();
    await settle();
    probe.ask();
    await settle();
    assert.deepEqual(said(probe, 'wasm'), ['pending', 'Asking…'], 'The WebAssembly line must stay pending until the wait of 400 ms has run.');
    const waits = env.waits.filter((w) => w.ms === 400);
    assert.equal(waits.length, 1, 'Two rounds must start one wait of 400 ms for the loop, not one each.');
    assert.equal(waits[0].off, false, 'The wait of 400 ms must not be called off.');
    assert.equal(instantiated, 0, 'The loop must not be set up before its wait of 400 ms has run.');
    waits[0].run();
    await settle();
    if (compiling) await compiling.then(() => {}, () => {});
    await settle();
    assert.deepEqual(said(probe, 'wasm'), ['yes', 'Runs: 50 million steps in 39 ms; the same loop in JavaScript took 277 ms.'], 'The WebAssembly line must give the two times, rounded.');
    const answered = line(probe, 'wasm');
    probe.ask();
    assert.equal(line(probe, 'wasm'), answered, 'A round must leave the answered WebAssembly line as it was, straight after ask().');
    await settle();
    assert.equal(line(probe, 'wasm'), answered, 'The WebAssembly line must keep its answer through a later round.');
    assert.equal(env.waits.filter((w) => w.ms === 400).length, 1, 'A later round must start no second wait for the loop.');
    assert.equal(instantiated, 1, 'The loop must be run once in the page\'s life.');
  });

  // The panel closed before the loop's wait has run (step 12's review, defect 3: About opened and closed within 0.4 s
  // still ran the loop, which froze the page for about half a second after it was closed).
  test('a close before the loop has run calls its wait off, and the next round starts it again', async () => {
    let instantiated = 0;
    const env = envOf({ wasm: { instantiate: async () => { instantiated += 1; return { instance: { exports: { run: () => core.LOOP_RESULT } } }; } } });
    const probe = core.createProbe(env);
    probe.ask();
    await settle();
    probe.close();
    const first = env.waits.filter((w) => w.ms === 400);
    assert.equal(first.length, 1, 'One round must start one wait of 400 ms for the loop.');
    assert.equal(first[0].off, true, 'A close before the loop has run must call its wait off.');
    assert.deepEqual(said(probe, 'wasm'), ['pending', 'Asking…'], 'The WebAssembly line must stay pending after a close before the loop.');
    probe.ask();
    await settle();
    const waits = env.waits.filter((w) => w.ms === 400);
    assert.equal(waits.length, 2, 'The round after a close must start the loop\'s wait again.');
    waits[1].run();
    await settle();
    assert.equal(instantiated, 1, 'The loop must run once, from the wait that was not called off.');
    assert.equal(said(probe, 'wasm')[0], 'yes', 'The WebAssembly line must be answered after the second wait.');
    probe.close();
    probe.ask();
    await settle();
    assert.equal(env.waits.filter((w) => w.ms === 400).length, 2, 'Once the loop has run, a close and a round must start no wait for it.');
  });

  test('WebAssembly that is missing, blocked or wrong says so', async () => {
    const cases = [
      ['a browser with no WebAssembly', null, 'Missing.'],
      ['a WebAssembly that refuses to compile', { instantiate: async () => { throw new Error('Wasm code generation disallowed by embedder'); } }, 'Blocked: Wasm code generation disallowed by embedder.'],
      ['a loop that gives another number', { instantiate: async () => ({ instance: { exports: { run: () => 7 } } }) }, 'Runs, with a wrong result.'],
    ];
    for (const [what, wasm, value] of cases) {
      const env = envOf({ wasm });
      const probe = core.createProbe(env);
      probe.ask();
      const wait = waitOf(env, 400);
      assert.ok(wait, `For ${what}, the first round must start a wait of 400 ms.`);
      wait.run();
      await settle();
      assert.deepEqual(said(probe, 'wasm'), ['no', value], `For ${what}, the WebAssembly line must be no: ${value}`);
    }
  });

  test('the loop in WebAssembly and the loop in JavaScript give the same number', async () => {
    assert.equal(core.WASM_LOOP.length, 77, 'The WebAssembly module of the loop must be 77 bytes.');
    const { instance } = await WebAssembly.instantiate(core.WASM_LOOP);
    const expected = [[0, 0], [1, 0], [2, 1], [10, 88467921], [1000, -472873864], [core.LOOP_STEPS, 1249568185]];
    for (const [steps, result] of expected) {
      assert.equal(instance.exports.run(steps), result, `The loop in WebAssembly must give ${result} after ${steps} steps.`);
      assert.equal(core.jsLoop(steps), result, `The loop in JavaScript must give ${result} after ${steps} steps.`);
    }
    assert.equal(core.LOOP_RESULT, 1249568185, 'LOOP_RESULT must be 1249568185.');
  });

  test('the words of the lines', () => {
    const said = (actual, expected) => assert.equal(actual, expected, `The words must be ${JSON.stringify(expected)}.`);
    said(core.runs(39.4, 276.6), 'Runs: 50 million steps in 39 ms; the same loop in JavaScript took 277 ms.');
    said(core.blocked('x'), 'Blocked: x.');
    said(core.blocked('x.'), 'Blocked: x.');
    said(core.reasonOf(new Error(' a ')), 'a');
    said(core.reasonOf(''), 'no reason given');
    said(core.reasonOf(undefined), 'no reason given');
    said(core.reasonOf({ message: 'm' }), 'm');
    said(core.reachedWith(57, 60), 'Reached: 57 of 60 requests left this hour.');
    said(core.answered(403), 'Answered with HTTP 403.');
    said(core.notReached('x'), 'Not reached: x.');
    said(core.rememberedNow('grasp-folder'), REMEMBERED_NOW);
    said(core.survived('grasp-folder', AT, 'granted'), 'Survived: grasp-folder, remembered 2026-11-13T12:00:00.000Z. Permission: granted.');
    said(core.notRemembered('x'), 'Not remembered: x.');
    said(core.notRead('x'), 'Cannot be read: x.');
    said(core.SAID.asking, 'Asking…');
    said(core.SAID.noFolder, 'None is remembered.');
    said(core.SAID.noAnswer, 'Not reached: no answer within 10 s.');
  });

  test('a folder is remembered at a click, and the next page load says it survived', async () => {
    const handle = { name: 'grasp-folder', queryPermission: async () => 'granted' };
    let picked = 0;
    const a = envOf({ pickFolder: async () => { picked += 1; return handle; } });
    const probe = core.createProbe(a);
    probe.ask();
    await settle();
    await probe.remember();
    assert.equal(picked, 1, 'A click must ask the folder picker once.');
    const record = a.store.get('folder');
    assert.ok(record, 'A click must keep a record under the key folder.');
    assert.equal(record.handle, handle, 'The kept record must hold the handle the picker gave.');
    assert.deepEqual({ name: record.name, at: record.at, load: record.load }, { name: 'grasp-folder', at: AT, load: 'load-1' }, 'The kept record must hold the folder\'s name, the time and the page load.');
    assert.deepEqual(said(probe, 'folder'), ['told', REMEMBERED_NOW], 'After a click the folder line must say the folder is remembered now.');
    probe.ask();
    await settle();
    assert.deepEqual(said(probe, 'folder'), ['told', REMEMBERED_NOW], 'In the page load that remembered it, the folder must still only be said to be remembered now at the next round.');

    const opened = async (kept) => {
      const b = core.createProbe(envOf({ load: 'load-2', kept }));
      b.ask();
      await settle();
      return said(b, 'folder');
    };
    assert.deepEqual(await opened(a.kept), ['yes', 'Survived: grasp-folder, remembered 2026-11-13T12:00:00.000Z. Permission: granted.'], 'In another page load the record must be said to have survived, with the permission the handle gives.');
    const keep = (changed) => { a.store.set('folder', { ...record, handle: changed }); return a.kept; };
    assert.deepEqual(await opened(keep({ name: 'grasp-folder' })), ['yes', 'Survived: grasp-folder, remembered 2026-11-13T12:00:00.000Z. Permission: not told.'], 'A handle with no queryPermission must give Permission: not told.');
    assert.deepEqual(await opened(keep({ name: 'grasp-folder', queryPermission: async () => { throw new Error('gone'); } })), ['yes', 'Survived: grasp-folder, remembered 2026-11-13T12:00:00.000Z. Permission: not told.'], 'A queryPermission that rejects must give Permission: not told.');
    assert.deepEqual(await opened(keep({ name: 'grasp-folder', queryPermission: async () => 'prompt' })), ['yes', 'Survived: grasp-folder, remembered 2026-11-13T12:00:00.000Z. Permission: prompt.'], 'A queryPermission that gives prompt must be said as it is.');
  });

  test('a picker that is closed changes nothing, and one that fails says why', async () => {
    const settled = async (over) => {
      const calls = { pick: 0, put: 0 };
      const env = envOf(over);
      const put = env.kept.put;
      env.kept.put = async (key, value) => { calls.put += 1; return put(key, value); };
      const probe = core.createProbe(env);
      probe.ask();
      await settle();
      return { env, probe, calls };
    };

    const closed = await settled({ pickFolder: async () => { throw Object.assign(new Error('The user aborted a request.'), { name: 'AbortError' }); } });
    const before = line(closed.probe, 'folder');
    await closed.probe.remember();
    assert.equal(line(closed.probe, 'folder'), before, 'A picker the person closed must leave the folder line as it was.');

    const failed = await settled({ pickFolder: async () => { throw new Error('nope'); } });
    await failed.probe.remember();
    assert.deepEqual(said(failed.probe, 'folder'), ['no', 'Not remembered: nope.'], 'A picker that fails must make the folder line say Not remembered with its reason.');

    const full = await settled({});
    const refuse = async () => { throw new Error('full'); };
    full.env.kept.put = refuse;
    await full.probe.remember();
    assert.deepEqual(said(full.probe, 'folder'), ['no', 'Not remembered: full.'], 'A folder that cannot be kept must make the folder line say Not remembered with its reason.');

    const none = await settled({ pickFolder: null });
    const kept = line(none.probe, 'folder');
    const putsBefore = none.calls.put;
    await none.probe.remember();
    assert.equal(line(none.probe, 'folder'), kept, 'With no folder picker a click must leave the folder line as it was.');
    assert.equal(none.calls.put, putsBefore, 'With no folder picker a click must keep nothing.');

    let asked = 0;
    const counted = await settled({});
    const original = counted.env.pickFolder;
    counted.env.pickFolder = () => { asked += 1; return original(); };
    const probe = core.createProbe(counted.env);
    const promise = probe.remember();
    assert.equal(asked, 1, 'The folder picker must be asked in the click itself, before anything that waits, so the browser counts the click as the person\'s.');
    await promise;
  });

  test('an answer of an older round is dropped', async () => {
    const workers = [];
    const env = envOf({ tryWorker: () => { const h = held(); workers.push(h); return h.promise; } });
    const probe = core.createProbe(env);
    probe.ask();
    probe.ask();
    assert.equal(workers.length, 2, 'Each round must ask for a worker.');
    workers[1].reject(new Error('late'));
    await settle();
    workers[0].resolve();
    await settle();
    assert.deepEqual(said(probe, 'worker'), ['no', 'Blocked: late.'], 'The worker line must keep the answer of the newest round, whatever order the answers come in.');
  });

  test('a click\'s answer for the folder is newer than a round\'s that began before it', async () => {
    const reading = held();
    const env = envOf();
    const get = env.kept.get;
    env.kept.get = (key) => (key === 'folder' ? reading.promise : get(key));
    const probe = core.createProbe(env);
    probe.ask();
    await probe.remember();
    assert.deepEqual(said(probe, 'folder'), ['told', REMEMBERED_NOW], 'After a click the folder line must say the folder is remembered now.');
    reading.resolve(undefined);
    await settle();
    assert.deepEqual(said(probe, 'folder'), ['told', REMEMBERED_NOW], 'A round that began before the click must not write None is remembered over the click\'s answer.');
  });

  test('a line that did not change is the object it was', async () => {
    const { probe } = await round();
    const before = probe.lines;
    const browser = line(probe, 'browser');
    const secure = line(probe, 'secure');
    let told = 0;
    probe.listen(() => { told += 1; });
    probe.ask();
    assert.notEqual(probe.lines, before, 'A round that changes lines must give a new array.');
    assert.equal(line(probe, 'browser'), browser, 'The browser line, unchanged, must be the object it was.');
    assert.equal(line(probe, 'secure'), secure, 'The secure context line, unchanged, must be the object it was.');
    assert.equal(told, 1, 'ask() itself must tell the listeners once.');
    await settle();
  });

  test('every listener is told even when one throws', () => {
    const probe = core.createProbe(envOf());
    let second = 0;
    probe.listen(() => { throw new Error('first'); });
    probe.listen(() => { second += 1; });
    let thrown = null;
    try { probe.ask(); } catch (error) { thrown = error; }
    assert.ok(second >= 1, 'A listener after one that throws must still be told.');
    assert.ok(thrown, 'ask() must throw a listener\'s error on, once all have been told.');
    assert.equal(thrown.message, 'first', 'ask() must throw on the first error a listener threw.');
  });
});
