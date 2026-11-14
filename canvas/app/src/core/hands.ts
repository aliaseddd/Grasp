// What the shell lends the actions, for a session (plan/slice-2.md, section 4, seam 8, and section 3,
// "core/hands.ts"). An action is a function of the core, and some actions end in something only the shell can do:
// save a file, open the text tab, zoom a plane, copy to the clipboard. The shell hands these in once, as one object,
// and the actions call them. So no action imports React, and the core's tests give stand-ins.
//
// Nothing here is React's and nothing asks for a browser.

import type { Session } from './session';

/** What the shell can do for an action. Each is given by the part of the shell that owns it (App, the dock, a plane). */
export interface ShellHands {
  /** App's onSave: saves the open file. */
  save(): void;
  /** The dock's: opens the text tab, or brings it to the front. */
  showText(): void;
  /** The dock's showView: brings a view's tab to the front, opening it when it was closed. */
  showView(viewId: string): void;
  /** Opens a side panel: 'notes', 'details'. */
  showPanel(id: string): void;
  /** The plane's: zooms by a step about its middle, fits, or moves by a step. Nothing for a view with no camera. */
  camera(viewId: string, how: 'in' | 'out' | 'fit' | 'left' | 'right' | 'up' | 'down'): void;
  /** Brings a place of a view, in the view's own units, into its window. */
  reveal(viewId: string, rect: { x: number; y: number; w: number; h: number }): void;
  /** The clipboard: resolves once the text is on it, and rejects when the browser refuses. */
  copy(text: string): Promise<void>;
}

/**
 * The hands a session's actions find.
 *
 * - **`hands`** is what the shell gave last, or null: in a new session, in Node with no stand-in given, and after the
 *   shell took its hands back. An action that needs a hand reads it when it runs and does nothing with none
 *   (`handsOf(session).hands?.save()`): with no shell there is nothing to show.
 * - **`give(hands)`** is the shell's: it gives its hands once the session is in the page, and null when the session
 *   leaves it. It tells nobody: nothing draws from the hands.
 */
export interface Hands {
  readonly hands: ShellHands | null;
  give(hands: ShellHands | null): void;
}

const KEPT = new WeakMap<Session, Hands>();

/** The hands of a session: the same object each time it is asked for, kept by the session object itself, weakly. */
export function handsOf(session: Session): Hands {
  let kept = KEPT.get(session);
  if (!kept) {
    let hands: ShellHands | null = null;
    kept = {
      get hands() { return hands; },
      give(next) { hands = next; },
    };
    KEPT.set(session, kept);
  }
  return kept;
}
