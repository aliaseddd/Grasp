// The keys: the one reader of the keyboard (plan/slice-2.md, section 4, seam 8; section 2, "The keys' aliases, and
// the page with no file"; section 5, "Four things about the table"; plan/architecture.md, contract 4). A keyboard
// shortcut exists only as the `key` of an action. The shell's one keydown listener (shell/App.tsx) describes the
// event and where it came from, and asks pressed(); no component listens for a key of its own, except a text field
// for what is typed into it.
//
// There is no DOM here, as the core has none: a press is a plain record, and where it came from is four answers that
// the listener reads off the event's target. So the rules of the keys are tested in Node (test/actions.test.mjs).

import { actions, ask } from './commands';
import type { Action } from './commands';
import type { Session } from './session';

/** A press of a key, as a keydown event says it: its `key`, the modifiers held, and whether the key is being held down. */
export interface KeyPress {
  /** KeyboardEvent.key: 'z', 'Z', 'Delete', 'F2', 'ArrowUp', '+'. */
  key: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  alt: boolean;
  /** KeyboardEvent.repeat: the key is held down, and this is not its first event. */
  repeat: boolean;
}

/**
 * Where a press came from, as the listener reads it off the event's target and the document.
 *
 * - **`typing`**: the target takes typing, so a key is its own. It is slice 1's test of "a text field"
 *   (shell/TopBar.tsx, step 10): a textarea, a select, anything contenteditable, or an input whose `type` is none of
 *   checkbox, radio, button, submit, reset, range, file, color and image.
 * - **`historyKeys`**: the target is inside an element that carries `data-history-keys` (the form of Details), whose
 *   fields hold what the history holds: from there Undo and Redo are the history's, not the field's.
 * - **`modal`**: the page shows a modal dialog (an element with role "dialog" and aria-modal "true").
 * - **`widget`**: the target is inside a widget that uses the arrows and typing itself: an element with the role
 *   `tree`, `menu`, `listbox`, `tablist`, `radiogroup` or `grid` (section 5). Seam 8's record has the three fields
 *   above and none for this rule, which section 5 gives to the keys; so the field is added here, and one who leaves
 *   it out is read as outside any such widget.
 */
export interface KeyPlace {
  typing: boolean;
  historyKeys: boolean;
  modal: boolean;
  widget?: boolean;
}

/**
 * Other spellings of an action's `key`: 'Mod+Shift+Z' reads as 'Mod+Y', '=' as '+' and '_' as '-' (the old page's
 * keys, section 2). An alias is not a second shortcut of its own: it is how a press is read, as `Mod` is. `Backspace`
 * is not among them: Delete deletes, and Backspace does not (section 2), though seam 8's comment names it.
 */
export const ALIASES: Readonly<Record<string, string>> = Object.freeze({ 'Mod+Shift+Z': 'Mod+Y', '=': '+', '_': '-' });

/**
 * Whether a press types one character: its key is one code point that is no space, pressed with neither Ctrl nor ⌘
 * nor Alt. With Ctrl and Alt both, which is how Windows reports AltGr, it types one too, unless the key is a plain
 * letter or digit: AltGr makes '@' or '{' on many keyboards, and Ctrl + Alt + Z is a chord, not a z.
 */
function typed(press: KeyPress): boolean {
  if (press.meta || press.ctrl !== press.alt) return false;
  if (Array.from(press.key).length !== 1 || press.key.trim() === '') return false;
  return !press.ctrl || !/^[A-Za-z0-9]$/.test(press.key);
}

/**
 * A press as a key of the table is written, before the table is asked: `Mod+` for Ctrl or ⌘, then `Alt+`, then
 * `Shift+`, then the key, a letter in capitals ('Mod+Z', 'Mod+Shift+Z', 'Alt+ArrowUp', 'Delete'). A press that types
 * a character is that character alone, whatever Shift did to make it ('+', '_', 'a', 'A'). An alias is read as the
 * key it stands for.
 */
function spell(press: KeyPress): string {
  let key: string;
  if (typed(press)) key = press.key;
  else {
    const name = Array.from(press.key).length === 1 ? press.key.toUpperCase() : press.key;
    key = (press.ctrl || press.meta ? 'Mod+' : '') + (press.alt ? 'Alt+' : '') + (press.shift ? 'Shift+' : '') + name;
  }
  return ALIASES[key] ?? key;
}

/** The row of a key: the first row of the table that carries it. */
function rowOf(key: string): Action | null {
  for (const action of actions()) if (action.key === key) return action;
  return null;
}

/**
 * The key of the table that a press is: 'Mod+Z', 'Delete', 'F2', 'Alt+ArrowUp', '+', 'printable', or null for a key
 * that is no shortcut.
 *
 * - A press is spelled as spell() says, its aliases read (ALIASES). When a row of the table has that very key, that
 *   is the answer.
 * - Otherwise, when the press types one character (typed(): the space bar types none here, since it belongs to the
 *   button that has the focus) and a row has the key 'printable', the answer is 'printable'. An exact key is looked
 *   up first, so '+', '=', '-', '_' and '0' are the camera's and never start a label (section 2).
 * - Otherwise null. A key is a shortcut only as the `key` of a row: a row that is not built is not in the table, so
 *   its key is null until then.
 */
export function keyOf(press: KeyPress): string | null {
  const key = spell(press);
  if (rowOf(key)) return key;
  return typed(press) && rowOf('printable') ? 'printable' : null;
}

/**
 * A key was pressed: asks the action of that key, when the key is the page's where it came from. It returns whether
 * the key was taken; the caller then prevents the browser's default, and does nothing else with the event.
 *
 * The rules, in this order. The first five are slice 1's, moved here unchanged from shell/TopBar.tsx and
 * panels/Tools.tsx; the rest are section 5's.
 * 1. **A key that is no shortcut** (keyOf() is null) is not taken.
 * 2. **Save** (the key of the row `save`) is always taken, with a file open or not, behind a modal dialog or not, so
 *    the browser's own Save never opens. It saves (`ask(session, 'save')`) when a file is open, no modal dialog is up
 *    and the key is not being held down: a held Save saves once, at the press.
 * 3. **With no file open** (`session` null) no other key is taken: there is no session, so no action to ask, and
 *    nothing is said (section 2).
 * 4. **Behind a modal dialog** no other key is taken: the dialog is answered first.
 * 5. **A chord with `Mod`** acts unless the press comes from a text field (`typing`) that is not inside
 *    `[data-history-keys]`: there the field's own undo is meant.
 * 6. **Any other key** does not act when the press comes from a text field, inside `[data-history-keys]` or not: the
 *    key is the field's.
 * 7. **Inside a widget that uses them itself** (`widget`) an arrow, `Alt` with an arrow, `F2` and a 'printable' key do
 *    not act: they are the tree's, the menu's or the list's. Every other key acts from there, `Delete` and `Escape`
 *    among them, so a row picked in the Explorer is deleted by Delete.
 * 8. **Otherwise the key is taken**, and its row is asked: `ask(session, id, null, choice)`, with no hit (a key works
 *    on the selection), and for the key 'printable' the character typed as the choice. An action that does not apply
 *    says why (ask), and the key is taken all the same. Holding a key down asks at each repeat.
 */
export function pressed(session: Session | null, press: KeyPress, place: KeyPlace): boolean {
  const key = keyOf(press);
  if (key === null) return false;
  const action = rowOf(key) as Action;
  if (action.id === 'save') {
    if (session && !place.modal && !press.repeat) ask(session, action.id);
    return true;
  }
  if (!session || place.modal) return false;
  if (key.startsWith('Mod+')) {
    if (place.typing && !place.historyKeys) return false;
  } else {
    if (place.typing) return false;
    if (place.widget === true && isWidgets(key)) return false;
  }
  ask(session, action.id, null, key === 'printable' ? press.key : undefined);
  return true;
}

/** Whether a key is one that a tree, a menu or a list uses itself: an arrow, with Alt or not, F2, or a key that types a character. */
function isWidgets(key: string): boolean {
  return key === 'F2' || key === 'printable' || /^(Alt\+)?Arrow(Up|Down|Left|Right)$/.test(key);
}
