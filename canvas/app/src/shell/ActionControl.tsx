// Every control that asks an action (plan/slice-2.md, section 4, seam 8; plan/architecture.md, contract 4): a button
// or a menu entry is one of the two components here, and no package writes a button of its own for an action. Each
// greys itself and carries the sentence when its action does not apply where it stands, so criterion 6 ("no silent
// refusal") is met once for the whole page, and one test can check every control: `[data-action]`.

import { useCallback, useRef, useState, useSyncExternalStore } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, ReactElement } from 'react';
import { Button, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { actionOf, ask, selectionOf } from '../core';
import type { Action, Hit, Session } from '../core';

/** What a control of an action is given. */
export interface ActionControlProps {
  /** The open file. */
  session: Session;
  /** The action's id: a row of the table (core/commands.ts, actionOf). */
  action: string;
  /** Where the action is asked: the Hit of a right-click, or nothing (null) for a control that works on the selection. */
  at?: Hit | null;
  /** What run() is given as its choice: a note's id, a link's place. With it, an action that has choices opens no menu. */
  choice?: string;
  /** An icon button; its accessible name is the action's title. Without it the control shows words. */
  icon?: ReactElement;
  /** The words shown, when they are not the action's title: a note's number. On an icon button, the tooltip's words. */
  label?: string;
  /** A class for the control's own element, the one that carries data-action. */
  className?: string;
  /** The data-testid of that element. */
  testId?: string;
}

/**
 * What every control of an action does, whichever of the two it is. The contract:
 *
 * - **A row that is not built shows no control.** While actionOf(action) is null the component renders nothing, so a
 *   button for a later package's action can stand in the page from the scaffold on and shows once the row is in the
 *   table.
 * - **`data-action="<id>"`** is on the control's own element: the `<button>`, or the menu entry (role "menuitem").
 *   `className` and `testId` go on that same element.
 * - **It asks `applies(session, at)`** when it renders, and again whenever the session tells (a change of the model,
 *   an undo or a redo, a save, a change of the notes: session.listen tells after each) or the selection tells (what
 *   is picked, the view in front). It asks nothing else and listens to nothing else: an action whose answer depends
 *   on something that tells neither is asked again at its next render.
 * - **Where the action does not apply it is greyed**: a button is disabled, a menu entry carries
 *   `aria-disabled="true"`. The sentence applies() gave is its tooltip and its `aria-description`. A control whose
 *   action applies carries no `aria-description`.
 * - **A click calls `ask(session, action, at, choice)`** (core/commands.ts), which says a refusal that run() comes to
 *   and picks what the action made. A greyed button takes no click. A greyed menu entry takes it, and asks: the
 *   sentence is then said as a toast as well, and the click goes no further, so its menu stays open.
 * - **An action with `choices` and no `choice` given opens them as a menu** in place of asking: one entry for each
 *   of `choices(session, at)`, worked out at the click, by its title; the list carries `data-choices="<action id>"`
 *   and the action's title as its name, and each entry `data-choice="<choice id>"`. A click on an entry closes the
 *   menu and asks the action with that choice. Escape, or a click outside, closes it and asks nothing. When the
 *   action gives no choice there ([]), the click asks it with none, and run() says what is missing.
 * - `applies` takes no choice (contract 4): a control for one thing among several (Archive on one note) is shown
 *   only on the things it applies to, and run() still checks the one it was given.
 *
 * It keeps no state but whether its menu of choices is open. Its colours are the theme's.
 */
function useAction(session: Session, id: string, at: Hit | null): { action: Action | null; sentence: string | null } {
  const action = actionOf(id);
  const subscribe = useCallback((tell: () => void) => {
    const stopSession = session.listen(tell);
    const stopSelection = selectionOf(session).listen(tell);
    return () => { stopSession(); stopSelection(); };
  }, [session]);
  // applies() answers true or a sentence: a value that compares, so nothing renders while the answer stays the same.
  const applies = useSyncExternalStore(subscribe, () => (action ? action.applies(session, at) : true));
  return { action, sentence: applies === true ? null : applies };
}

/** The entries of a menu of choices, and what a click on one does. */
function choiceItems(choices: readonly { id: string; title: string }[], choose: (choice: string) => void): JSX.Element[] {
  return choices.map((choice) => (
    <MenuItem key={choice.id} data-choice={choice.id} onClick={() => choose(choice.id)}>{choice.title}</MenuItem>
  ));
}

/**
 * What keeps a menu of choices to itself. React hands an event inside a portal on to the parents of the component
 * that made the portal: a key pressed in the second level would move the focus in the first as well, and a click in a
 * button's menu would be a click on whatever the button stands in.
 */
const APART = {
  onClick: (event: ReactMouseEvent): void => event.stopPropagation(),
  onKeyDown: (event: ReactKeyboardEvent): void => event.stopPropagation(),
  onContextMenu: (event: ReactMouseEvent): void => { event.preventDefault(); event.stopPropagation(); },
};

/**
 * A button that asks an action (see useAction above for what every control does).
 *
 * - **With `icon`** it is a Material UI IconButton holding the icon and no words. Its accessible name is the action's
 *   title (`aria-label`). Its tooltip says the action's title, or `label` when one is given (the top bar's "Undo Moved
 *   part def Host"), or, while greyed, the sentence.
 * - **Without `icon`** it is a small Material UI Button whose words are `label`, or the action's title. Its tooltip
 *   is the sentence while greyed; the action's title when its words are a `label`; else it has none.
 * - The button sits in a `<span class="grasp-action">` under its tooltip, since a disabled button takes no pointer
 *   and could show none; the span is there with or without a tooltip, so the button is the same element whichever
 *   way its action answers. While it has a tooltip the span carries `aria-label`: the tooltip's words while the
 *   action applies, and the action's title while it is greyed, when the sentence is the button's `aria-description`
 *   instead. (So the words of the step that the bar's Undo would take back are read where slice 1's tests read them,
 *   and are the bare title when there is no step.)
 * - A button whose click opens choices carries `aria-haspopup="menu"`, and `aria-expanded` while they are open. The
 *   menu opens under the button, without a transition.
 */
export function ActionButton({ session, action: id, at = null, choice, icon, label, className, testId }: ActionControlProps): JSX.Element | null {
  const { action, sentence } = useAction(session, id, at);
  const button = useRef<HTMLButtonElement>(null);
  const [choices, setChoices] = useState<readonly { id: string; title: string }[] | null>(null);
  if (!action) return null;
  const opens = choice === undefined && typeof action.choices === 'function';
  const click = (): void => {
    const offered = opens ? action.choices?.(session, at) ?? [] : [];
    if (offered.length > 0) setChoices(offered);
    else ask(session, id, at, choice);
  };
  const close = (): void => setChoices(null);
  const choose = (chosen: string): void => {
    close();
    ask(session, id, at, chosen);
  };
  const tip = sentence ?? (icon ? label ?? action.title : label !== undefined ? action.title : '');
  const own = {
    ref: button,
    className,
    'data-testid': testId,
    'data-action': id,
    'aria-description': sentence ?? undefined,
    'aria-haspopup': opens ? ('menu' as const) : undefined,
    'aria-expanded': opens ? choices !== null : undefined,
    disabled: sentence !== null,
    onClick: click,
  };
  const control = icon
    ? <IconButton {...own} aria-label={action.title}>{icon}</IconButton>
    : <Button {...own} size="small">{label ?? action.title}</Button>;
  const wrapped = (
    <span className="grasp-action" style={{ display: 'inline-flex' }} aria-label={tip === '' ? undefined : sentence === null ? tip : action.title}>
      {control}
    </span>
  );
  return (
    <>
      <Tooltip title={tip}>{wrapped}</Tooltip>
      {choices !== null && (
        <Menu
          open
          anchorEl={button.current}
          onClose={close}
          transitionDuration={0}
          slotProps={{ root: APART, list: { dense: true, 'aria-label': action.title, 'data-choices': id } as object }}
        >
          {choiceItems(choices, choose)}
        </Menu>
      )}
    </>
  );
}

/** What a Material UI MenuList hands the entry it puts the keyboard's focus on as its menu opens: an ActionItem passes both on. */
export interface MenuEntryProps {
  autoFocus?: boolean;
  tabIndex?: number;
}

/**
 * A menu entry that asks an action (see useAction above for what every control does). It is a Material UI MenuItem,
 * to be put straight into a Menu or a MenuList, beside other entries: it takes the `autoFocus` and `tabIndex` that a
 * MenuList gives its first entry, and hands them to its MenuItem.
 *
 * - Its words are `label`, or the action's title. `icon`, when given, stands before them.
 * - **Greyed**, it carries `aria-disabled="true"` and Material UI's disabled look, and still takes the pointer, so
 *   that its tooltip, the sentence, shows at its right.
 * - **A click that asked the action goes on as a click** (it bubbles), and a click that only opened the choices, or
 *   fell on a greyed entry, is stopped. So a menu that holds ActionItems closes itself with one `onClick` on its
 *   list for the clicks that come from inside a `[data-action]` or a `[data-choice]`, and stays open otherwise
 *   (plane/Palette.tsx does so).
 * - **An action with choices opens them as a second level**: the entry carries `aria-haspopup="menu"` and
 *   `aria-expanded`, and shows "›" at its right end. A click on it, Enter, or ArrowRight opens a second Material UI
 *   Menu at the entry's top right corner, without a transition, its first entry focused. In it, ArrowLeft or Escape
 *   closes the second level and leaves the first open, with the focus back on the entry; a click outside both closes
 *   the second level. A click on a choice closes the second level, asks the action with the choice, and goes on as a
 *   click through the entry to the first menu's list (React hands an event in a portal to the portal's parents).
 */
export function ActionItem({ session, action: id, at = null, choice, icon, label, className, testId, autoFocus, tabIndex }: ActionControlProps & MenuEntryProps): JSX.Element | null {
  const { action, sentence } = useAction(session, id, at);
  const entry = useRef<HTMLLIElement>(null);
  const [choices, setChoices] = useState<readonly { id: string; title: string }[] | null>(null);
  if (!action) return null;
  const opens = choice === undefined && typeof action.choices === 'function';
  /** Opens the second level, and answers whether it did. */
  const open = (): boolean => {
    const offered = opens && sentence === null ? action.choices?.(session, at) ?? [] : [];
    if (offered.length > 0) setChoices(offered);
    return offered.length > 0;
  };
  const click = (event: ReactMouseEvent): void => {
    // A click that comes up from the second level (React hands it on from the portal) is not on this entry: a
    // choice has asked already, and a click beside the choices closed them.
    if (!(event.target instanceof Node) || !event.currentTarget.contains(event.target)) return;
    if (sentence !== null) {
      event.stopPropagation();
      ask(session, id, at, choice);
      return;
    }
    if (open()) event.stopPropagation();
    else ask(session, id, at, choice);
  };
  const key = (event: ReactKeyboardEvent): void => {
    if (event.key === 'ArrowRight' && event.target === event.currentTarget && open()) event.stopPropagation();
  };
  const close = (): void => {
    setChoices(null);
    entry.current?.focus();
  };
  const choose = (chosen: string): void => {
    setChoices(null);
    ask(session, id, at, chosen);
  };
  const item = (
    <MenuItem
      ref={entry}
      className={className}
      data-testid={testId}
      data-action={id}
      aria-description={sentence ?? undefined}
      aria-haspopup={opens ? 'menu' : undefined}
      aria-expanded={opens ? choices !== null : undefined}
      disabled={sentence !== null}
      autoFocus={autoFocus}
      tabIndex={tabIndex}
      onClick={click}
      onKeyDown={key}
      sx={{ '&.Mui-disabled': { pointerEvents: 'auto' } }}
    >
      {icon ? <span style={{ display: 'inline-flex', marginRight: 8 }}>{icon}</span> : null}
      <span style={{ flex: '1 1 auto' }}>{label ?? action.title}</span>
      {opens ? <span aria-hidden="true" style={{ marginLeft: 16 }}>›</span> : null}
      {choices !== null && (
        <Menu
          open
          anchorEl={entry.current}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          onClose={close}
          transitionDuration={0}
          slotProps={{
            root: { onKeyDown: APART.onKeyDown },
            list: {
              dense: true,
              'aria-label': action.title,
              'data-choices': id,
              onKeyDown: (event: ReactKeyboardEvent) => {
                if (event.key === 'ArrowLeft') { event.stopPropagation(); close(); }
              },
            } as object,
          }}
        >
          {choiceItems(choices, choose)}
        </Menu>
      )}
    </MenuItem>
  );
  return sentence === null ? item : <Tooltip title={sentence} placement="right" describeChild>{item}</Tooltip>;
}
