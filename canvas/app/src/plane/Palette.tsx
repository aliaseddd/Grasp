// The right-click palette of a body: a menu, at the pointer, of what can be made where the right-click fell
// (plan/slice-1.md, step 11; plan/swarm/step-11.md), and, from slice 2, of what can be done with the thing that was
// clicked (plan/slice-2.md, section 4, seam 8). It holds no rule of its own: what it offers to make is
// toolsOf(session).offers(hit), and a choice is toolsOf(session).choose(kind, hit) (core/commands.ts), so the menu is
// one more hand on the session's tools, beside the Tools view; what it offers to do is the rows of PALETTE that are in
// the action table and apply at the hit, each an ActionItem (shell/ActionControl.tsx). Plane.tsx renders one for its
// plane (step 11), and views/BodyFrame.tsx one for a component body.

import { useEffect, useMemo } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { Divider, Menu, MenuItem } from '@mui/material';
import { actionOf, PALETTE, toolsOf } from '../core';
import type { Hit, Session } from '../core';
import { ActionItem } from '../shell/ActionControl';
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

/** What the menu's one entry says when nothing can be made where the right-click fell, and no action applies there. */
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
 *   The Menu's children are one flat array, since a Menu takes no Fragment. So a right-click on a plane always opens
 *   the menu.
 * - **Under the creation tools, the actions** (slice 2, seam 8): for each id of PALETTE (core/commands.ts), in its
 *   order, whose row is in the table (actionOf) and applies at the hit (`applies(session, at.hit)` is true), worked
 *   out once when the menu opens, one `<ActionItem session action at={at.hit} />` (shell/ActionControl.tsx): a
 *   MenuItem that carries `data-action`, says the action's title, and asks the action at the hit when it is clicked.
 *   When there is a tool above them, a Divider stands between the tools and the actions. An action that does not
 *   apply at the hit is left out, and a row no package has built yet is not in the table: so the menu holds what is
 *   about the thing that was clicked. An action with `choices` opens them as a second level, to the right of its
 *   entry (ActionItem's contract). When there is neither a tool nor an action ([] of both: a line or a done node,
 *   until an action applies there), the menu holds one disabled MenuItem with the words NOTHING_HERE, with neither
 *   data-tool nor data-action.
 * - **The list element** (Material UI's MenuList, role "menu") carries data-testid "palette" and aria-label "Make
 *   here", given through `slotProps.list`, with `dense`, so an entry is 32 px high in 13 px. A test finds the menu by
 *   it; its rectangle is the menu's.
 * - **A choice** (a click on an entry, or Enter on the entry the keyboard is on; the arrow keys move between
 *   entries, and the first is focused as the menu opens, all Material UI's own): `onClose()`, then
 *   `toolsOf(session).choose(kind, at.hit)`. So an element kind is placed at the right-click's point, inside the box
 *   that was clicked, and is picked; and a relationship kind has the clicked element as its first end and is in hand
 *   for the second click.
 * - **A click on an action's entry** asks the action (the ActionItem does), and the click that asked then reaches the
 *   menu's list, which calls `onClose()`: so does a click on a choice of an action's second level. A click that only
 *   opened a second level does not reach the list, and the menu stays open under it.
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
export function Palette({ session, at, onClose }: PaletteProps): JSX.Element | null {
  const open = at !== null;
  // Worked out once as it opens: the offer follows the hit, not the model changing under the open menu.
  const groups = useMemo(() => (at ? toolsOf(session).offers(at.hit) : []), [session, at]);
  // And the actions that are about what was clicked: the rows of PALETTE that are built and apply at the hit.
  const actions = useMemo(() => (at ? PALETTE.filter((id) => actionOf(id)?.applies(session, at.hit) === true) : []), [session, at]);
  useEffect(() => {
    if (!open) return undefined;
    return session.history.listen((told) => {
      if (told.by === 'edit' || told.by === 'undo' || told.by === 'redo') onClose();
    });
  }, [session, open, onClose]);
  if (!at) return null;
  const items: JSX.Element[] = [];
  groups.forEach((group, g) => {
    if (g > 0) items.push(<Divider key={`d${g}`} component="li" />);
    group.forEach((tool) => {
      items.push(
        <MenuItem
          key={tool.kind}
          data-tool={tool.kind}
          onClick={() => { onClose(); toolsOf(session).choose(tool.kind, at.hit); }}
        >
          {tool.label}
        </MenuItem>,
      );
    });
  });
  if (actions.length > 0 && items.length > 0) items.push(<Divider key="actions" component="li" />);
  for (const id of actions) items.push(<ActionItem key={`action:${id}`} session={session} action={id} at={at.hit} />);
  if (items.length === 0) items.push(<MenuItem key="nothing" disabled>{NOTHING_HERE}</MenuItem>);
  // A click that asked an action comes up to the list from its entry, or from a choice of its second level.
  const asked = (event: ReactMouseEvent): void => {
    if (event.target instanceof Element && event.target.closest('[data-action], [data-choice]')) onClose();
  };
  const rightClicked = (event: ReactMouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    onClose();
  };
  return (
    <Menu
      open
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={{ left: at.left, top: at.top }}
      transitionDuration={0}
      slotProps={{
        root: { onContextMenu: rightClicked },
        list: { dense: true, 'data-testid': 'palette', 'aria-label': 'Make here', onClick: asked } as object,
      }}
    >
      {items}
    </Menu>
  );
}
