// The right-click palette of a plane: a menu, at the pointer, of what can be made where the right-click fell
// (plan/slice-1.md, step 11; plan/swarm/step-11.md). It holds no rule of its own: what it offers is
// toolsOf(session).offers(hit), and a choice is toolsOf(session).choose(kind, hit) (core/commands.ts), so the menu is
// one more hand on the session's tools, beside the Tools view. Plane.tsx renders one for its plane (step 11).

import type { Hit, Session } from '../core';
import './palette.css';

/** Where a palette is open: the right-click's Hit, and the pointer in the window, in px (the event's clientX, clientY). */
export interface PaletteAt {
  readonly hit: Hit;
  readonly left: number;
  readonly top: number;
}

export interface PaletteProps {
  /** The session of the plane the palette belongs to. */
  session: Session;
  /** Where it is open, or null while it is closed. */
  at: PaletteAt | null;
  /** Closes it: the plane sets `at` to null. Called once for each closing, before a choice is carried out. */
  onClose: () => void;
}

/** What the menu's one entry says when nothing can be made where the right-click fell. */
export const NOTHING_HERE = 'Nothing can be made here.';

/**
 * The palette. Its contract:
 *
 * - **It is a Material UI Menu**, open while `at` is not null, with `anchorReference="anchorPosition"` and
 *   `anchorPosition={{ left: at.left, top: at.top }}`: the menu's top left corner is at the pointer, and Material UI
 *   moves it only as far as keeps it 16 px inside the window. It opens and closes without a transition
 *   (`transitionDuration` 0). While it is closed it renders nothing into the document.
 * - **What it lists** is `toolsOf(session).offers(at.hit)`, worked out once when it opens: for each group in order,
 *   one Material UI MenuItem a tool (role "menuitem"), carrying data-tool, the tool's kind, and holding the tool's
 *   label as its words ('part', 'specializes'); between two groups a Divider (`component="li"`, role "separator").
 *   The Menu's children are one flat array, since a Menu takes no Fragment. When nothing is offered ([]: a line, a
 *   done node), the menu holds one disabled MenuItem with the words NOTHING_HERE and no data-tool. So a right-click
 *   on a plane always opens the menu.
 * - **The list element** (Material UI's MenuList, role "menu") carries data-testid "palette" and aria-label "Make
 *   here", given through `slotProps.list`, with `dense`, so an entry is 32 px high in 13 px. A test finds the menu by
 *   it; its rectangle is the menu's.
 * - **A choice** (a click on an entry, or Enter on the entry the keyboard is on; the arrow keys move between
 *   entries, and the first is focused as the menu opens, all Material UI's own): `onClose()`, then
 *   `toolsOf(session).choose(kind, at.hit)`. So an element kind is placed at the right-click's point, inside the box
 *   that was clicked, and is picked; and a relationship kind has the clicked element as its first end and is in hand
 *   for the second click.
 * - **It closes and makes nothing** on Escape, on Tab, on a click outside it (Material UI's own: its backdrop, which
 *   is not seen, takes that click, so the click picks nothing and is not the tool's), and on a right-click on it or
 *   outside it: the Menu's root is given an `onContextMenu` that prevents the browser's menu, stops the event (React
 *   hands an event in a portal on to the plane, which would open the palette again) and calls `onClose()`. A second
 *   right-click then opens it elsewhere.
 * - **It closes when the model changes under it**: while open it listens to the session's history, and a change told
 *   with `by` 'edit', 'undo' or 'redo' (Ctrl or ⌘ + Z with the menu open) calls `onClose()`. The menu is no modal
 *   dialog (its root has no aria-modal), so the bar's keys act while it is open.
 * - It keeps no state but what it lists; the plane holds where it is open.
 */
export function Palette(_props: PaletteProps): JSX.Element | null {
  throw new Error('Palette: step 11 builds it');
}
