// What the page says in passing, for a session (plan/slice-2.md, section 4, seam 8, and section 3, "core/says.ts").
// A tool in hand says why a click was refused (toolsOf(session).said, core/commands.ts). An action and a gesture must
// say why they were refused too, and they have no tool: ask() says an action's sentence here, a gesture's end and an
// action's run call say() themselves. The toasts (shell/Toasts.tsx) show whichever was said last, by a tool or here.
//
// Nothing here is React's and nothing asks for a browser: the core's tests run it in Node (test/says.test.mjs).

import type { Saying } from './commands';
import type { Session } from './session';

/**
 * What was said last for a session, outside the tool in hand. Its methods are bound: each can be handed over as it is.
 *
 * - **`said`** is the last sentence said through say(), as a Saying `{ text, n }`, or null: in a new session, and
 *   after clear(). It is a new object at each saying.
 * - **`say(text)`** holds the sentence, with the session's next number (nextSaying), and tells the listeners once. The
 *   same sentence said twice is two sayings with two numbers, so a toast shows it anew.
 * - **`clear()`** takes the saying away and tells the listeners once; with nothing said it changes nothing and tells
 *   nobody. Nothing in the core calls it: a saying stays until the next, and the toast decides how long it shows.
 * - **`listen(listener)`** calls listener after every change of `said`, and returns what stops it. Every listener is
 *   called even when another throws; the first error is thrown on once all have been told.
 *
 * Saying is not a change of the model: nothing is written, the history gets no step, and the file is not marked
 * unsaved.
 */
export interface Says {
  readonly said: Saying | null;
  say(text: string): void;
  clear(): void;
  listen(listener: () => void): () => void;
}

const NUMBERS = new WeakMap<Session, { n: number }>();

/**
 * The number of the session's next saying: 1, 2, 3 and so on, one row of numbers for everything the session says,
 * whether through saysOf(session) or by its tool in hand (core/commands.ts numbers `tools.said` from here). So of a
 * tool's saying and saysOf's, the one with the larger `n` was said later: that is the one the toast shows, and `n` is
 * the number the toast's element carries as `data-said`.
 */
export function nextSaying(session: Session): number {
  let kept = NUMBERS.get(session);
  if (!kept) NUMBERS.set(session, (kept = { n: 0 }));
  kept.n += 1;
  return kept.n;
}

const KEPT = new WeakMap<Session, Says>();

/** What a session says in passing: the same object each time it is asked for, kept by the session object itself, weakly. */
export function saysOf(session: Session): Says {
  let kept = KEPT.get(session);
  if (!kept) {
    kept = make(session);
    KEPT.set(session, kept);
  }
  return kept;
}

function make(session: Session): Says {
  const listeners = new Set<() => void>();
  let said: Saying | null = null;
  const tell = (): void => {
    let failed: { error: unknown } | null = null;
    for (const listener of Array.from(listeners)) {
      try { listener(); } catch (error) { failed ??= { error }; }
    }
    if (failed) throw failed.error;
  };
  return {
    get said() { return said; },
    say(text) {
      said = { text, n: nextSaying(session) };
      tell();
    },
    clear() {
      if (said === null) return;
      said = null;
      tell();
    },
    listen(listener) {
      const mine = (): void => listener();
      listeners.add(mine);
      return () => { listeners.delete(mine); };
    },
  };
}
