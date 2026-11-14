// The marks: for an element or a relationship, how many problems it has and the notes pinned to it; for a view, the
// free notes that float on it (plan/slice-2.md, section 4, seam 4; plan/architecture.md, contract 7). They are worked
// out from the entries of the checks (core/checks.ts, entriesOf) and from the open notes (core/notes.ts), and nobody
// writes them. Whether a thing is selected stays the selection's.
//
// How a mark reaches what draws it: a node and an edge carry `data.marks` (core/adapter.ts, Who and EdgeData). The
// adapter never reads or sets it; a view's store sets it after each projection and after each change of the marks, as
// it sets `selected`, with a new object only for a node or an edge whose marks differ. A component body asks of() for
// each of its rows and draws again when listen() tells.
//
// Nothing here is React's and nothing asks for a browser: the core's tests run it in Node (test/marks.test.mjs). It
// reads no field of a model's record (contract 22): an entry says what it is about, and a note names its target.

import { checksOf, entriesOf } from './checks';
import { notesOf } from './notes';
import type { Session } from './session';

/** One note as a pin: its id (a number is no key: a file can hold two notes of one number), its number, whether it is resolved, and whether the Notes panel points at it. */
export interface Pinned { readonly id: string; readonly no: number; readonly resolved: boolean; readonly hot: boolean }

/** The marks on one element or relationship: how many problems it has, and the notes pinned to it, by number. */
export interface Marks { readonly problems: number; readonly pins: readonly Pinned[] }

/** A free note, at its place in its view, in the view's own units. */
export interface FreePin extends Pinned { readonly x: number; readonly y: number }

/** The one object every unmarked thing carries: no problem and no pin. It is frozen, and compared by identity. */
export const NO_MARKS: Marks = Object.freeze({ problems: 0, pins: Object.freeze([]) as readonly Pinned[] });

const NO_FREE: readonly FreePin[] = Object.freeze([]);

/**
 * The marks of a session. Its methods are bound: each can be handed over as it is.
 *
 * **What a mark is.**
 * - **A problem** is an entry of the checks that is about the thing: `entry.about` is `{ type, id }` with the type
 *   'el' or 'rel'. Every such entry counts one, whatever list it is in, so a new list adds to the marks with no change
 *   here. An entry about a view, about the package or about nothing marks nothing.
 * - **A pin** is an open note whose `target` is the thing's id. A note names its target by id alone, so a pin answers
 *   for an element and for a relationship of that id alike, and for an id the model does not hold (the note is kept
 *   for when Undo brings its target back; what draws marks draws only what the model holds). An archived note is no
 *   pin. A thing's pins are in the order of their numbers; of two with one number, the one written first (`created`),
 *   then the one that stands first among the notes.
 * - **A free pin** is an open note whose `target` is null and that names a `view` and a place, `x` and `y`, both
 *   finite numbers. A free note with no view (a state file's, which the scaffold's notesOf does not convert) floats
 *   on none.
 * - `resolved` is the note's own. `hot` is whether the note is the one the Notes panel points at
 *   (notesOf(session).pointed).
 * - What is no note is passed over: a record that is no object, or has no string for an id.
 *
 * **What it gives.**
 * - **`of(type, id)`** is the marks on one element ('el') or relationship ('rel'): the same object until that thing's
 *   marks change, and NO_MARKS itself for a thing with no problem and no pin. Every Marks and its `pins` are frozen:
 *   one object is handed to every node that draws the thing.
 * - **`free(viewId)`** is the free pins of a view, by number: the same array until they change, and one shared empty
 *   array for every view with none.
 * - **`listen(listener)`** calls listener, with nothing, once after each working-out that changed any thing's marks
 *   or any view's free pins, and returns what stops it. It does not say which: a store asks of() again for each node
 *   and edge it holds, which costs one lookup each. Every listener is called even when another throws; the first
 *   error is thrown on once all have been told.
 *
 * **Live or idle.** The marks are live while they have a listener, and idle with none.
 * - Idle, they listen to nothing: not to the checks, which therefore stay idle too and run no check, and not to the
 *   notes. of() and free() then answer with what was last worked out, which is nothing in a session whose marks were
 *   never listened to. So a hidden tab costs nothing.
 * - The first listener makes them live: they add one listener to the session's checks (checksOf(session).listen,
 *   which runs a check at once when the result is stale) and one to its notes, and work the marks out before listen()
 *   returns. Nobody is called for that: the one who listens reads next. So the checks run while a body is shown
 *   (contract 8).
 * - Live, they work the marks out again whenever the checks or the notes tell, and tell their own listeners when
 *   something changed.
 * - When the last listener goes they take their two listeners away, and the marks stay as they were.
 */
export interface MarksOf {
  of(type: 'el' | 'rel', id: string): Marks;
  free(viewId: string): readonly FreePin[];
  listen(listener: () => void): () => void;
}

const KEPT = new WeakMap<Session, MarksOf>();

/** The marks of a session: the same object each time it is asked for, kept by the session object itself, weakly. Asking for it listens to nothing. */
export function marksOf(session: Session): MarksOf {
  let kept = KEPT.get(session);
  if (!kept) {
    kept = make(session);
    KEPT.set(session, kept);
  }
  return kept;
}

type Kind = 'el' | 'rel';

/** A note as far as the marks read it, from a record that may hold anything. */
type Read = { id: string; no: number; created: string; at: number; target: unknown; view: unknown; x: unknown; y: unknown; resolved: boolean };

function samePins(a: readonly Pinned[], b: readonly Pinned[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const p = a[i];
    const q = b[i] as Pinned & Partial<FreePin>;
    if (p.id !== q.id || p.no !== q.no || p.resolved !== q.resolved || p.hot !== q.hot) return false;
    if ((p as Partial<FreePin>).x !== q.x || (p as Partial<FreePin>).y !== q.y) return false;
  }
  return true;
}

function make(session: Session): MarksOf {
  const listeners = new Set<() => void>();
  let marks: Record<Kind, Map<string, Marks>> = { el: new Map(), rel: new Map() };
  let free = new Map<string, readonly FreePin[]>();
  let stops: (() => void)[] | null = null;   // what takes the two listeners away, while live

  /** Works the marks out from the entries and the notes as they are now; returns whether anything changed. */
  const work = (): boolean => {
    const problems: Record<Kind, Map<string, number>> = { el: new Map(), rel: new Map() };
    for (const entry of entriesOf(session)) {
      const about = entry.about;
      if (!about || (about.type !== 'el' && about.type !== 'rel')) continue;
      const count = problems[about.type];
      count.set(about.id, (count.get(about.id) ?? 0) + 1);
    }

    const notes = notesOf(session);
    const pointed = notes.pointed;
    const read: Read[] = [];
    (notes.open as readonly unknown[]).forEach((record, at) => {
      if (record === null || typeof record !== 'object') return;
      const n = record as Record<string, unknown>;
      if (typeof n.id !== 'string') return;
      read.push({
        id: n.id, no: typeof n.no === 'number' && Number.isFinite(n.no) ? n.no : 0, created: typeof n.created === 'string' ? n.created : '', at,
        target: n.target, view: n.view, x: n.x, y: n.y, resolved: n.resolved === true,
      });
    });
    read.sort((a, b) => (a.no - b.no) || (a.created < b.created ? -1 : a.created > b.created ? 1 : 0) || (a.at - b.at));
    const pins = new Map<string, Pinned[]>();
    const floating = new Map<string, FreePin[]>();
    for (const n of read) {
      const pin = { id: n.id, no: n.no, resolved: n.resolved, hot: n.id === pointed };
      if (typeof n.target === 'string') {
        const list = pins.get(n.target);
        if (list) list.push(Object.freeze(pin));
        else pins.set(n.target, [Object.freeze(pin)]);
      } else if (n.target === null && typeof n.view === 'string' && typeof n.x === 'number' && typeof n.y === 'number' && Number.isFinite(n.x) && Number.isFinite(n.y)) {
        const list = floating.get(n.view);
        const freePin = Object.freeze({ ...pin, x: n.x, y: n.y });
        if (list) list.push(freePin);
        else floating.set(n.view, [freePin]);
      }
    }

    // Each marked thing's Marks: the object it had when it reads the same.
    let changed = false;
    const next: Record<Kind, Map<string, Marks>> = { el: new Map(), rel: new Map() };
    for (const kind of ['el', 'rel'] as const) {
      const ids = new Set<string>([...problems[kind].keys(), ...pins.keys()]);
      for (const id of ids) {
        const count = problems[kind].get(id) ?? 0;
        const list = pins.get(id) ?? NO_MARKS.pins;
        const old = marks[kind].get(id);
        if (old && old.problems === count && samePins(old.pins, list)) next[kind].set(id, old);
        else {
          next[kind].set(id, Object.freeze({ problems: count, pins: old && samePins(old.pins, list) ? old.pins : Object.freeze(list) }));
          changed = true;
        }
      }
      if (next[kind].size !== marks[kind].size) changed = true;
    }
    const nextFree = new Map<string, readonly FreePin[]>();
    for (const [view, list] of floating) {
      const old = free.get(view);
      if (old && samePins(old, list)) nextFree.set(view, old);
      else {
        nextFree.set(view, Object.freeze(list));
        changed = true;
      }
    }
    if (nextFree.size !== free.size) changed = true;
    marks = next;
    free = nextFree;
    return changed;
  };

  const tell = (): void => {
    let failed: { error: unknown } | null = null;
    for (const listener of Array.from(listeners)) {
      try { listener(); } catch (error) { failed ??= { error }; }
    }
    if (failed) throw failed.error;
  };
  const heard = (): void => { if (work()) tell(); };

  return {
    of: (type, id) => marks[type]?.get(id) ?? NO_MARKS,
    free: (viewId) => free.get(viewId) ?? NO_FREE,
    listen(listener) {
      const mine = (): void => listener();
      listeners.add(mine);
      if (!stops) {
        // Live from here: the checks run now when they are stale, and the marks are worked out before this returns.
        stops = [checksOf(session).listen(heard), notesOf(session).listen(heard)];
        work();
      }
      return () => {
        if (!listeners.delete(mine) || listeners.size > 0 || !stops) return;
        const going = stops;
        stops = null;
        for (const stop of going) stop();
      };
    },
  };
}
