// The commands: the one table that feeds the Tools view and the right-click palettes, what each command makes, and
// the tool in hand (plan/slice-1.md, step 11; plan/swarm/shared.md, "The tool in hand", and plan/swarm/step-11.md).
// It ports the old page's place, freeName and createRel (canvas/src/core/page/tools.js and drawing.js, with the
// additions of interconnection/page.js and behavior/page.js) and asks the model library's rules.
//
// Nothing here is React's and nothing asks for a browser: the core's tests run it in Node.

import type { Session } from './session';
import type { Hit } from './selection';

/** A tool of a view kind: an element kind to place, or a relationship kind to draw between two elements. */
export interface Tool {
  /** The kind's name in the model library: 'PartDefinition', 'Specialization'. */
  readonly kind: string;
  /** Whether it places an element or draws a relationship. */
  readonly type: 'el' | 'rel';
  /** What the Tools view and a palette call it: the kind's label in the library, 'part def'. */
  readonly label: string;
}

/**
 * The tool in hand, for a session. What every step shares of it is here; step 11's outline adds the rest of this
 * interface (arming, the first end, what is said) and the table of commands.
 *
 * - **`armed`** is the tool in hand, or null. A new session has none.
 * - **`click(hit)`** offers a click on a plane to the tool in hand, before the click picks anything
 *   (plane/Plane.tsx, `clicked`). With no tool in hand it does nothing and returns false, and the click then picks
 *   (the selection's click()). With a tool in hand it returns true whatever came of the click, made or refused: while
 *   a tool is in hand a click on a plane picks nothing by itself, and what the tool makes is picked by the tool.
 * - **`listen(listener)`** calls listener after every change of what this interface holds; it returns what stops it.
 */
export interface Tools {
  readonly armed: Tool | null;
  click(hit: Hit): boolean;
  listen(listener: () => void): () => void;
}

/**
 * The tools of a session: the same object each time it is asked for, kept by the session object itself, weakly, as
 * its selection is (core/selection.ts).
 */
export function toolsOf(session: Session): Tools {
  void session;
  throw new Error('toolsOf: step 11 builds it');
}
