// The checks: what the model library finds wrong with the open file's model, kept for a session outside React
// (plan/slice-1.md, section 2, "What Validation lists", and step 12; plan/swarm/step-12.md). There are two lists, as
// on the old page: Grasp's own problems (the library's validate) and the diagnostics of the SysML v2 specification's
// rules (its validateSpec). The Validation panel (panels/Validation.tsx) shows both. It is the old page's check(),
// checkRules() and the timer of changed() (canvas/src/core/page/render.js, validation/page.js, changes.js), ported.
//
// What differs from the old page: the checks run only while somebody listens for them. The old page drew badges on
// the drawing, so it checked after every pause. Slice 1 draws none (badges are slice 2's), so nothing but the panel
// needs a result, and a check of a 5,000-element model takes about 40 ms (plan/swarm/step-12.md has the times): more
// than two frames, and most of the 50 ms a keystroke may take there. A panel that is hidden therefore costs nothing.
//
// Nothing here is React's and nothing asks for a browser: the core's tests run it in Node, with a stand-in for the
// timer.

import type { Model } from './history';
import type { Picked } from './selection';
import type { Session } from './session';

/** How long a change waits for a pause before the checks run, in ms: the old page's PAUSE (core/page/base.js). */
export const PAUSE = 800;

/** One of Grasp's own problems, as the library's validate gives it. */
export interface Problem {
  /** The id of the element, the relationship or the view it is about; null when it is about the package. */
  readonly id: string | null;
  /** The sentence: "Two elements are named Host in the package." */
  readonly message: string;
}

/** A diagnostic of one of the specification's rules, as the library's validateSpec gives it. */
export interface Diagnostic {
  /** The rule's name in the specification: 'validateNamespaceDistinguishibility'. */
  readonly rule: string;
  /** The metaclass the rule is on: 'Namespace'. */
  readonly metaclass: string;
  /** What breaks the rule: an element, a relationship, or (null) the package. */
  readonly type: 'el' | 'rel' | null;
  /** The element's or the relationship's id; null for the package. */
  readonly id: string | null;
  /** The qualified name of what breaks it. */
  readonly path: string;
  /** How it breaks the rule, in a sentence. */
  readonly message: string;
  /** 'warning' for every rule, as in SysON. */
  readonly severity: string;
  /** SysON's label for the diagnostic, which the panel shows: "#<rule>·····[<package>/<path>]·····Constraint on type 'sysml:<Metaclass>' is not respected: <message>". */
  readonly text: string;
}

declare global {
  // The part of the model library that the checks call, beside what src/types.d.ts, session.ts and adapter.ts declare.
  interface SysMLModelLibrary {
    /** Grasp's own problems, in the model's order: its elements', then its views', then its relationships'. */
    validate(model: Model): Problem[];
    /** The diagnostics of the specification's rules, sorted by rule and then by qualified name. */
    validateSpec(model: Model): Diagnostic[];
    /** The names of the specification's rules the library checks: 15 of the specification's 388. */
    readonly SPEC_RULES: readonly string[];
  }
}

/** One result of the checks: the two lists, each in the order the library gave it. */
export interface Found {
  readonly problems: readonly Problem[];
  readonly diagnostics: readonly Diagnostic[];
}

/** What a session's checks hold now. */
export interface ChecksState {
  /** The last result, or null before the first. */
  readonly found: Found | null;
  /** Whether the model may have changed since `found` was worked out, or nothing has been worked out yet. */
  readonly stale: boolean;
}

/** What a session's checks may be made with: the tests' stand-in for the timer. */
export interface ChecksOptions {
  /**
   * Calls `run` once, `ms` from now, and returns what calls it off. Unless given: setTimeout and clearTimeout. It is
   * read only by the call of checksOf() that makes the session's checks.
   */
  later?: (run: () => void, ms: number) => () => void;
}

/**
 * A session's checks. Its methods are bound: each can be handed over as it is.
 *
 * - **`state`** is `{ found, stale }`: the same object until one of the two changes, and a new object then, so React
 *   reads it through useSyncExternalStore(checks.listen, () => checks.state). A new session's is `{ found: null,
 *   stale: true }`.
 * - **A check** works out both lists in one reading of the model: `lib.reading(model, () => ({ problems:
 *   lib.validate(model), diagnostics: lib.validateSpec(model) }))`, with the session's `lib` and `model`. When both
 *   lists read as the last result's do (compared as JSON), `found` stays the very object it was; else it is the new
 *   result. A check leaves `stale` false. A check that throws leaves the state as it was, and the error goes on to
 *   whoever asked for the check (from the timer it reaches the console).
 * - **Live or idle.** The checks are live while they have a listener, and idle with none. Idle, they never check: a
 *   change of the model only makes them stale.
 * - **`listen(listener)`** adds a listener and returns what takes it away. When it is the first listener and the
 *   state is stale (always so the first time), a check runs before listen() returns, and nobody is called for it:
 *   the one who listens reads `state` next. So a panel that is shown is up to date at once: when a file is opened,
 *   and when the panel is shown again after changes it did not see. When the last listener goes, a wait that is
 *   running is called off; the state stays stale.
 * - **After a change of the model**, which the session's history tells of (`told.by` 'edit', 'undo' or 'redo'; the
 *   end of a run, 'end', changes nothing in the model and is not heard). Whatever the change touched, a move
 *   included, the result may be out of date.
 *   - Idle: the state becomes stale, and that is all.
 *   - Live, after an edit: the state becomes stale, and the check waits for a pause: `later(check, PAUSE)`, a wait
 *     that is running being called off first. So the checks run once, PAUSE after the last of a run of changes (the
 *     keystrokes of a name), and never inside the event that made the change.
 *   - Live, after an undo or a redo: the check runs at once, as on the old page, and a wait that is running is
 *     called off.
 * - **A listener** is called with nothing, once after each change of `state` (stale after an edit; the result of a
 *   check), except the check that listen() itself runs. A check that leaves `state` the object it was (an undo that
 *   finds what the fresh result already says) calls nobody. Every listener is called even when another throws; the
 *   first error is thrown on once all have been told.
 * - Nothing is written to the model, the history gets no step, and the file is not marked unsaved.
 */
export interface Checks {
  readonly state: ChecksState;
  listen(listener: () => void): () => void;
}

const KEPT = new WeakMap<Session, Checks>();

/**
 * The checks of a session: the same object each time it is asked for, kept by the session object itself, weakly, as
 * its selection is (core/selection.ts), so a session that is replaced takes its checks with it. The first call makes
 * them, with `options`, and adds their one listener to the session's history; later calls ignore `options`.
 */
export function checksOf(session: Session, options?: ChecksOptions): Checks {
  const kept = KEPT.get(session);
  if (kept) return kept;
  const later = options?.later ?? ((run: () => void, ms: number) => {
    const id = setTimeout(run, ms);
    return () => clearTimeout(id);
  });
  const listeners = new Set<() => void>();
  let state: ChecksState = { found: null, stale: true };
  let off: (() => void) | null = null;   // calls off the wait that is running

  const calloff = (): void => {
    const stop = off;
    off = null;
    if (stop) stop();
  };
  // Works out both lists; returns whether the state changed. A throw leaves the state as it was.
  const check = (): boolean => {
    const { lib, model } = session;
    const next = lib.reading(model, () => ({ problems: lib.validate(model), diagnostics: lib.validateSpec(model) }));
    const same = state.found !== null && JSON.stringify(state.found) === JSON.stringify(next);
    const before = state;
    state = { found: same ? state.found : next, stale: false };
    if (same && !before.stale) { state = before; return false; }
    return true;
  };
  const tellAll = (): void => {
    let failed: { error: unknown } | null = null;
    for (const listener of Array.from(listeners)) {
      try { listener(); } catch (error) { if (!failed) failed = { error }; }
    }
    if (failed) throw failed.error;
  };
  const wait = (): void => {
    calloff();
    off = later(() => {
      off = null;
      if (check()) tellAll();
    }, PAUSE);
  };

  session.history.listen((told) => {
    if (told.by === 'end') return;
    const live = listeners.size > 0;
    if (live && told.by !== 'edit') {
      calloff();
      if (check()) tellAll();
      return;
    }
    const changed = !state.stale;
    if (changed) state = { found: state.found, stale: true };
    if (live) wait();
    if (changed) tellAll();
  });

  const listen = (listener: () => void): (() => void) => {
    if (listeners.size === 0 && state.stale) check();
    // A listener is kept per call, so the same function added twice is two listeners, and each stop takes only its own.
    const mine = () => listener();
    listeners.add(mine);
    return () => {
      if (!listeners.delete(mine)) return;
      if (listeners.size === 0) calloff();
    };
  };

  const checks: Checks = { get state() { return state; }, listen };
  KEPT.set(session, checks);
  return checks;
}

/**
 * What an entry of a list is about, and what a click on it picks.
 *
 * `type` and `id` name it: an element ('el'), a relationship ('rel'), a view ('view'), the package ('package', with
 * the id ''), or nothing the model holds any more ('none', with the id the entry carries: an entry of a result that
 * is out of date, whose element has left the model since). `pick` is what a click hands to the selection's set(), the
 * first of them the last picked: the element, the relationship or the view alone; for a relationship that is hidden
 * (`hidden: true`: a port's "defined by" line, which no plane draws), the relationship and then the element it
 * starts from (`from`), when the model holds that element, since the line itself cannot be pointed at (the old
 * page's marksFor, core/page/render.js); and nothing for the package and for 'none', which the selection cannot hold.
 */
export interface EntryAbout {
  readonly type: 'el' | 'rel' | 'view' | 'package' | 'none';
  readonly id: string;
  readonly pick: readonly Picked[];
}

/**
 * What one of Grasp's problems is about. A null id is the package. Else the id is looked for among the model's
 * elements first, then its relationships, then its views, as the old page's selectionFor does (core/page/panel.js);
 * an id found in none of the three is 'none'.
 */
export function aboutProblem(model: Model, problem: Problem): EntryAbout {
  const id = problem.id;
  if (id === null) return PACKAGE;
  if (model.elements.some((e) => e.id === id)) return about('el', id);
  if (model.relationships.some((r) => r.id === id)) return about('rel', id, model);
  if (model.views.some((v) => v.id === id)) return about('view', id);
  return { type: 'none', id, pick: [] };
}

/**
 * What a diagnostic is about: its `type` and `id` say (null and null: the package). An element or a relationship the
 * model no longer holds is 'none'.
 */
export function aboutDiagnostic(model: Model, diagnostic: Diagnostic): EntryAbout {
  const { type, id } = diagnostic;
  if (type === null || id === null) return PACKAGE;
  if (type === 'el' && model.elements.some((e) => e.id === id)) return about('el', id);
  if (type === 'rel' && model.relationships.some((r) => r.id === id)) return about('rel', id, model);
  return { type: 'none', id, pick: [] };
}

const PACKAGE: EntryAbout = { type: 'package', id: '', pick: [] };

function about(type: 'el' | 'rel' | 'view', id: string, model?: Model): EntryAbout {
  const pick: Picked[] = [{ type, id }];
  if (type === 'rel' && model) {
    const rel = model.relationships.find((r) => r.id === id);
    if (rel && rel.hidden && model.elements.some((e) => e.id === rel.from)) pick.push({ type: 'el', id: rel.from });
  }
  return { type, id, pick };
}
