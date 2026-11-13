// The probe: what this browser lets the page do, found out for the About panel (plan/slice-1.md, section 2, "What
// About reports", and step 12; plan/swarm/step-12.md). plan/direction.md, "Damon's machine", tells of the probe page
// that was opened once on Damon's work machine; About asks the same questions on whatever machine the page is opened
// on, each as one line: the browser's version, whether the page is a secure context, the three pickers, the file
// input and download, localStorage, IndexedDB, a worker made from a Blob URL, WebAssembly with a timing loop, a
// request to api.github.com/rate_limit, and whether a folder's handle that was remembered is still there.
//
// It also holds the libraries' names and versions, which the build writes into the application's script.
//
// What needs no browser is apart from what does, as in files.ts: the lines, their words and the order of the asking
// are worked out from a ProbeEnv, which the core's tests stand in for in Node; browserEnv() makes the real one from
// the window, and only a browser test sees that. Nothing here is React's.

// ---- The libraries.

/** A library the page is built on: a package that package.json lists as a dependency, as it is installed. */
export interface Library {
  /** Its name on npm: '@xyflow/react'. */
  readonly name: string;
  /** The version installed: '12.10.2'. */
  readonly version: string;
  /** Its licence, as its package.json names it: 'MIT'. */
  readonly licence: string;
}

// canvas/app/build.mjs defines this when it bundles the application (esbuild's `define`): the JSON text of the
// dependencies of package.json, in the order of their names, each `{ name, version, licence }` with the version and
// the licence its own package.json gives. It is a text, not a list, because esbuild puts a text where the name
// stands and nothing more, while a list would become a module of its own that every file of the bundle starts. A
// bundle made without the build (the core's tests, canvas/app/test/core.mjs) has no such name.
declare const __GRASP_LIBRARIES__: string | undefined;

/** The libraries, in the order of their names. Empty in a bundle the build did not make. */
export const LIBRARIES: readonly Library[] =
  typeof __GRASP_LIBRARIES__ === 'undefined' ? [] : /* @__PURE__ */ JSON.parse(__GRASP_LIBRARIES__);

// ---- The lines.

/** The lines of About, by id, in the order the panel shows them, each with the label the panel shows. */
export const PROBE_LINES = [
  { id: 'browser', label: 'Browser' },
  { id: 'secure', label: 'Secure context' },
  { id: 'open-picker', label: 'Open picker' },
  { id: 'save-picker', label: 'Save picker' },
  { id: 'folder-picker', label: 'Folder picker' },
  { id: 'file-input', label: 'File input' },
  { id: 'download', label: 'Download' },
  { id: 'local-storage', label: 'localStorage' },
  { id: 'indexed-db', label: 'IndexedDB' },
  { id: 'worker', label: 'Worker from a Blob URL' },
  { id: 'wasm', label: 'WebAssembly' },
  { id: 'github', label: 'GitHub' },
  { id: 'folder', label: 'Remembered folder' },
] as const;
export type ProbeLineId = (typeof PROBE_LINES)[number]['id'];

/**
 * What a line says of its question: not answered yet ('pending'); answered, and the thing is there or works
 * ('yes'); answered, and it is missing, blocked or failed ('no'); or answered with a fact that is neither ('told':
 * the browser's version, and a folder that is not remembered or was remembered only now).
 */
export type ProbeState = 'pending' | 'yes' | 'no' | 'told';

/** One line as the panel shows it. */
export interface ProbeLine {
  readonly id: ProbeLineId;
  readonly label: string;
  readonly state: ProbeState;
  /** The answer, in a sentence; SAID.asking while the state is 'pending'. */
  readonly value: string;
}

// ---- What the lines say. These are final: the panel, the tests and plan/swarm/step-12.md use these very words.

/** An error as a reason: its message, trimmed; for what is no error, itself as text; 'no reason given' when that is empty. */
export function reasonOf(error: unknown): string {
  const message = error !== null && typeof error === 'object' && typeof (error as { message?: unknown }).message === 'string'
    ? (error as { message: string }).message
    : String(error ?? '');
  return message.trim() || 'no reason given';
}

/** `Blocked: <reason>` and its like, ending in a full stop unless the reason ends a sentence itself. */
const sentence = (start: string, reason: string): string => `${start}: ${reason}${/[.!?]$/.test(reason) ? '' : '.'}`;

/** The sentences with nothing to fill in. */
export const SAID = {
  /** A line not yet asked, and a line whose answer has not come. */
  asking: 'Asking…',
  /** The page is a secure context. */
  secure: 'Yes.',
  notSecure: 'No: the file pickers need one.',
  /** A picker, the file input or download is there. */
  present: 'Present.',
  /** The save picker, the file input, download or WebAssembly is not there. */
  missing: 'Missing.',
  noOpenPicker: 'Missing: Open asks through a file input, and Save downloads the file.',
  noFolderPicker: 'Missing: no folder can be remembered.',
  /** localStorage, IndexedDB or a worker did what was asked. */
  works: 'Works.',
  /** The loop ran in WebAssembly and gave another number than in JavaScript. */
  wrongLoop: 'Runs, with a wrong result.',
  /** GitHub answered, and its answer does not say how many requests are left. */
  reached: 'Reached.',
  noAnswer: 'Not reached: no answer within 10 s.',
  noFolder: 'None is remembered.',
  /** The browser's user agent is empty. */
  notTold: 'Not told.',
} as const;

/** The sentences that are filled in. */
export const blocked = (reason: string): string => sentence('Blocked', reason);
export const runs = (wasmMs: number, jsMs: number): string =>
  `Runs: 50 million steps in ${Math.round(wasmMs)} ms; the same loop in JavaScript took ${Math.round(jsMs)} ms.`;
export const reachedWith = (remaining: number, limit: number): string => `Reached: ${remaining} of ${limit} requests left this hour.`;
export const answered = (status: number): string => `Answered with HTTP ${status}.`;
export const notReached = (reason: string): string => sentence('Not reached', reason);
export const rememberedNow = (name: string): string =>
  `Remembered now: ${name}. Reload the page, or restart the browser, and open About again.`;
/** `permission` is 'granted', 'prompt', 'denied', or 'not told'. */
export const survived = (name: string, at: string, permission: string): string => `Survived: ${name}, remembered ${at}. Permission: ${permission}.`;
export const notRemembered = (reason: string): string => sentence('Not remembered', reason);
export const notRead = (reason: string): string => sentence('Cannot be read', reason);

// ---- The timing loop.

/** How many steps the loop takes: the probe page's 50 million (plan/notes.md, session 13). */
export const LOOP_STEPS = 50_000_000;
/** What the loop gives after LOOP_STEPS steps, in WebAssembly and in JavaScript alike. */
export const LOOP_RESULT = 1249568185;
/** How long the loop waits after it is first asked for, in ms: until the panel is up and its fade is over (225 ms). */
export const LOOP_DELAY = 400;

/**
 * The loop in JavaScript: from x = 0, for i from 0 to n - 1, x becomes (x * 31 + i) xor (x >>> 7), in 32-bit whole
 * numbers. The probe page of session 13 is not in the repository, so this loop is Grasp's own; on the machine it was
 * first run on, 50 million steps took about 90 ms in WebAssembly and about 360 ms in JavaScript, in Chromium 153.
 */
export function jsLoop(n: number): number {
  let x = 0;
  for (let i = 0; i < n; i += 1) x = (Math.imul(x, 31) + i) ^ (x >>> 7);
  return x;
}

/**
 * The same loop as a WebAssembly module, 77 bytes: it exports `run`, a function from i32 to i32, and imports
 * nothing. In the text format:
 *
 *   (module (func (export "run") (param $n i32) (result i32) (local $i i32) (local $x i32)
 *     (block $done (loop $next
 *       (br_if $done (i32.ge_u (local.get $i) (local.get $n)))
 *       (local.set $x (i32.xor (i32.add (i32.mul (local.get $x) (i32.const 31)) (local.get $i))
 *                              (i32.shr_u (local.get $x) (i32.const 7))))
 *       (local.set $i (i32.add (local.get $i) (i32.const 1)))
 *       (br $next)))
 *     (local.get $x)))
 *
 * The array is marked pure, so that the build leaves it out of a script that does not use it.
 */
export const WASM_LOOP: Uint8Array = /* @__PURE__ */ new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, // the header
  0x01, 0x06, 0x01, 0x60, 0x01, 0x7f, 0x01, 0x7f, // one type: (i32) -> i32
  0x03, 0x02, 0x01, 0x00, // one function, of that type
  0x07, 0x07, 0x01, 0x03, 0x72, 0x75, 0x6e, 0x00, 0x00, // it is exported as "run"
  0x0a, 0x2e, 0x01, 0x2c, 0x01, 0x02, 0x7f, // its code: two locals, i and x
  0x02, 0x40, 0x03, 0x40, // block, loop
  0x20, 0x01, 0x20, 0x00, 0x4f, 0x0d, 0x01, // leave once i >= n
  0x20, 0x02, 0x41, 0x1f, 0x6c, 0x20, 0x01, 0x6a, // x * 31 + i
  0x20, 0x02, 0x41, 0x07, 0x76, 0x73, 0x21, 0x02, // xor (x >>> 7), into x
  0x20, 0x01, 0x41, 0x01, 0x6a, 0x21, 0x01, // i + 1, into i
  0x0c, 0x00, 0x0b, 0x0b, // again; the loop's end, the block's end
  0x20, 0x02, 0x0b, // give x
]);

// ---- What the probe asks of the browser.

/** The address the GitHub line asks: an unauthenticated request, which GitHub answers to any page and does not count. */
export const GITHUB_URL = 'https://api.github.com/rate_limit';
/** How long GitHub's answer is waited for, in ms. */
export const GITHUB_WAIT = 10_000;
/** The key the remembered folder is kept under, and the key the IndexedDB line writes and removes. */
export const FOLDER_KEY = 'folder';
export const PROBE_KEY = 'probe';

/** A small store that outlasts the page: in the browser, one object store of an IndexedDB database. Each method rejects with the browser's own error. */
export interface Kept {
  /** What is kept under a key; undefined when nothing is. */
  get(key: string): Promise<unknown>;
  put(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}

/** A folder's handle, as far as the probe reads it: a FileSystemDirectoryHandle in the browser. */
export interface FolderHandle {
  readonly name: string;
  /** The browser's answer without asking the person: 'granted', 'prompt' or 'denied'. */
  queryPermission?: (how: { mode: 'readwrite' }) => Promise<string>;
}

/** What is kept under FOLDER_KEY once a folder is remembered. */
export interface FolderRecord {
  readonly handle: FolderHandle;
  /** The folder's name, as its handle gave it when it was picked. */
  readonly name: string;
  /** When it was remembered: ProbeEnv.date() then. */
  readonly at: string;
  /** The page load it was remembered in: ProbeEnv.load then. */
  readonly load: string;
}

/** What the probe needs of the browser. browserEnv() gives the real one; a test gives stand-ins. */
export interface ProbeEnv {
  /** navigator.userAgent. */
  readonly userAgent: string;
  /** window.isSecureContext. */
  readonly secure: boolean;
  /** Whether window.showOpenFilePicker and window.showSaveFilePicker are functions. */
  readonly openPicker: boolean;
  readonly savePicker: boolean;
  /** window.showDirectoryPicker, bound to the window, which asks the person for a folder; null where it is no function. */
  readonly pickFolder: (() => Promise<FolderHandle>) | null;
  /** Whether an <input type="file"> keeps that type and has `files`: the browser knows file inputs. */
  readonly fileInput: boolean;
  /** Whether an <a> has `download` and URL.createObjectURL is a function: the page can hand a file over as a download. */
  readonly download: boolean;
  /**
   * Writes the key 'grasp-app:probe' to localStorage, reads it back and removes it. Throws the browser's own error
   * when localStorage refuses, and an Error saying so when there is none or the value read is not the value written.
   */
  tryStorage(): void;
  /** The store that outlasts the page: over IndexedDB, database 'grasp-app', object store 'kept'. With no IndexedDB every method rejects. */
  readonly kept: Kept;
  /**
   * Makes a worker from a Blob URL, sends it 21 and resolves when it answers 42; rejects with the browser's error, or
   * with an Error saying that no answer came within 3 s. The worker is ended and its URL given back either way.
   */
  tryWorker(): Promise<void>;
  /** The browser's WebAssembly, or null where there is none (Chrome with just-in-time compilation switched off). */
  readonly wasm: { instantiate(bytes: Uint8Array): Promise<{ instance: { exports: Record<string, unknown> } }> } | null;
  /** The browser's fetch, bound to the window, or null where there is none. */
  readonly fetch: ((url: string, init: { cache: 'no-store'; signal: AbortSignal }) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>) | null;
  /** The time in ms, for the loop's two times: performance.now(). */
  now(): number;
  /** The date and time as a remembered folder carries it: new Date().toISOString(). */
  date(): string;
  /** A name for this load of the page, another after a reload: String(performance.timeOrigin). */
  readonly load: string;
  /** Calls `run` once, `ms` from now, and returns what calls it off: setTimeout and clearTimeout. */
  later(run: () => void, ms: number): () => void;
}

// ---- What needs no browser.

/**
 * The browser's name and version from its user agent, for the first line. The first of these that the text holds
 * decides: `Edg/<version>` gives 'Edge <version>'; `Chrome/<version>` or `HeadlessChrome/<version>` gives 'Chrome
 * <version>'; `Firefox/<version>` gives 'Firefox <version>'; `Version/<version>` followed later by `Safari/` gives
 * 'Safari <version>'. A version is digits and dots. A text that holds none of them is given back whole, trimmed; an
 * empty one gives SAID.notTold.
 */
export function browserOf(userAgent: string): string {
  void userAgent;
  throw new Error('browserOf: step 12 builds it');
}

/**
 * The probe of a page. Its methods are bound: each can be handed over as it is.
 *
 * - **`lines`** is the thirteen lines, in PROBE_LINES' order with its labels. It is the same array until a line
 *   changes, and a new array then, in which every line that did not change is the object it was; so React reads it
 *   through useSyncExternalStore(probe.listen, () => probe.lines). Before the first ask() every line is 'pending'
 *   and says SAID.asking.
 * - **`ask()`** asks every line again: a round. The panel calls it each time it is opened, and nothing asks before.
 *   It returns at once. In the call itself, the lines that need no waiting are answered and the others become
 *   'pending' with SAID.asking, in one new array, and the listeners are called once. Each other line is answered
 *   when its answer comes, in a new array, the listeners called once for each. The answer of a round that is no
 *   longer the newest is dropped. No question can throw or reject to the caller: what fails is said on its line.
 *   Only a listener's own error comes out of ask(), as listen() says.
 * - **The lines that need no waiting**, answered in ask() itself:
 *   - `browser`: 'told', browserOf(env.userAgent).
 *   - `secure`: 'yes' SAID.secure when env.secure, else 'no' SAID.notSecure.
 *   - `open-picker`: 'yes' SAID.present when env.openPicker, else 'no' SAID.noOpenPicker.
 *   - `save-picker`: 'yes' SAID.present when env.savePicker, else 'no' SAID.missing.
 *   - `folder-picker`: 'yes' SAID.present when env.pickFolder is not null, else 'no' SAID.noFolderPicker.
 *   - `file-input`, `download`: 'yes' SAID.present when env.fileInput, env.download; else 'no' SAID.missing.
 *   - `local-storage`: 'yes' SAID.works when env.tryStorage() returns; 'no' blocked(reasonOf(error)) when it throws.
 * - **The lines that wait**, each asked by itself, none waiting for another:
 *   - `indexed-db`: env.kept.put(PROBE_KEY, 1), then get(PROBE_KEY), then remove(PROBE_KEY). 'yes' SAID.works when
 *     all three resolve and the get gave 1; 'no' blocked(reason) when one rejects, the reason being 'what was
 *     written did not come back' when the get gave anything else.
 *   - `worker`: 'yes' SAID.works when env.tryWorker() resolves; 'no' blocked(reasonOf(error)) when it rejects.
 *   - `github`: with env.fetch null, 'no' notReached('this browser has no fetch'). Else one call,
 *     env.fetch(GITHUB_URL, { cache: 'no-store', signal }), and no other request, ever. An answer that is not `ok`:
 *     'no' answered(status). An `ok` answer whose JSON holds whole numbers at `resources.core.remaining` and
 *     `resources.core.limit`: 'yes' reachedWith(remaining, limit). Any other `ok` answer, one whose json() rejects
 *     included: 'yes' SAID.reached. A fetch that rejects: 'no' notReached(reasonOf(error)). No answer within
 *     GITHUB_WAIT (env.later): the request is aborted through `signal`, and the line is 'no' SAID.noAnswer whatever
 *     the fetch does after that. The wait is called off once the answer has come.
 *   - `folder`: env.kept.get(FOLDER_KEY). Rejected: 'no' notRead(reasonOf(error)). Nothing kept (undefined, or what
 *     is kept is no object with a string `name`): 'told' SAID.noFolder. A record whose `load` is env.load: 'told'
 *     rememberedNow(record.name). Any other record survived a reload or a restart: 'yes' survived(record.name,
 *     record.at, permission), where permission is what `record.handle.queryPermission({ mode: 'readwrite' })`
 *     resolves with, and 'not told' when the handle has no such function or it rejects. The person is never asked
 *     for the permission (no requestPermission).
 *   - `wasm`, which is asked once for the page's life, since the loop keeps the page busy for some tenths of a
 *     second. The first ask() starts one wait of LOOP_DELAY (env.later), so that the panel is drawn before the loop
 *     runs; the line is 'pending' until it is answered, and an ask() in the meantime starts no second wait. Then:
 *     with env.wasm null, 'no' SAID.missing. Else env.wasm.instantiate(WASM_LOOP); t0 = env.now(); the export
 *     `run` called with LOOP_STEPS; t1 = env.now(); jsLoop(LOOP_STEPS); t2 = env.now(). When the two results are
 *     the same number: 'yes' runs(t1 - t0, t2 - t1); when they differ: 'no' SAID.wrongLoop; when instantiate
 *     rejects or `run` throws: 'no' blocked(reasonOf(error)). Once answered, the line keeps its answer through
 *     every later round, and the loop is not run again.
 * - **`remember()`** is the button's click. With env.pickFolder null it does nothing. Else it calls env.pickFolder()
 *   before anything that waits, so that the browser still counts the click as the person's. When the person closes
 *   the picker (a rejection whose `name` is 'AbortError') nothing changes. Any other rejection: the `folder` line is
 *   'no' notRemembered(reasonOf(error)). A handle: env.kept.put(FOLDER_KEY, { handle, name: handle.name, at:
 *   env.date(), load: env.load }); then the line is 'told' rememberedNow(handle.name), or, when the put rejects,
 *   'no' notRemembered(reasonOf(error)). The promise resolves once the line is set, and never rejects. While it
 *   waits for the person the line stays as it was. A round's answer for the `folder` line is dropped when
 *   remember() was called after that round began: the click's own answer is the newer one.
 * - **`listen(listener)`** calls listener after every change of `lines`; it returns what stops it. Every listener
 *   is called even when another throws; the first error is thrown on once all have been told, out of ask() when it
 *   was ask() that changed the lines.
 */
export interface Probe {
  readonly lines: readonly ProbeLine[];
  ask(): void;
  remember(): Promise<void>;
  listen(listener: () => void): () => void;
}

/** A probe that asks `env`. Making it asks nothing. */
export function createProbe(env: ProbeEnv): Probe {
  void env;
  throw new Error('createProbe: step 12 builds it');
}

// ---- What asks the browser.

/**
 * The real ProbeEnv, from the window, each member as ProbeEnv says. Making it asks nothing of the network, opens no
 * dialog and writes nothing: tryStorage, kept, tryWorker and pickFolder act only when called. `kept` opens the
 * database 'grasp-app' (version 1, whose upgrade makes the object store 'kept') at each call and closes it after;
 * a value is kept by structured clone, which is how a folder's handle outlasts the page. Only a browser test sees
 * this function (about.test.mjs).
 */
export function browserEnv(): ProbeEnv {
  throw new Error('browserEnv: step 12 builds it');
}
