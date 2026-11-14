// The rows of Undo, Redo, Save and Escape (plan/slice-2.md, section 5, the table's first four rows; section 8, package
// 2-1). Their keys were listened for by shell/TopBar.tsx and panels/Tools.tsx until slice 2; they are now keys of the
// table, read by core/keys.ts, and their buttons ask the rows (shell/ActionControl.tsx).
//
// | id         | title    | key      | applies                  | says, where it does not      |
// | undo       | Undo     | Mod+Z    | the history has a step   | "There is nothing to undo."  |
// | redo       | Redo     | Mod+Y    | a step was undone        | "There is nothing to redo."  |
// | save       | Save     | Mod+S    | always                   |                              |
// | put-down   | Put down | Escape   | always                   |                              |
//
// Nothing here is React's and nothing asks for a browser.

import { gesturesOf, toolsOf } from '../commands';
import type { Action } from '../commands';
import { handsOf } from '../hands';
import { selectionOf } from '../selection';

export const FILE_ACTIONS: readonly Action[] = [
  {
    /** Takes the newest undo step back: history.undo(). It makes nothing to pick. */
    id: 'undo',
    title: 'Undo',
    key: 'Mod+Z',
    applies: (session) => (session.history.steps.length > 0 ? true : 'There is nothing to undo.'),
    run: (session) => { session.history.undo(); },
  },
  {
    /** Makes again the step Undo took back last: history.redo(). */
    id: 'redo',
    title: 'Redo',
    key: 'Mod+Y',
    applies: (session) => (session.history.undone.length > 0 ? true : 'There is nothing to redo.'),
    run: (session) => { session.history.redo(); },
  },
  {
    /**
     * Saves the file, whether or not anything is unsaved: the shell's hand, handsOf(session).hands.save(), which is
     * App's onSave. With no hands given (no shell: a test in Node) it does nothing. Where its key acts, and that it
     * does not repeat, is core/keys.ts's.
     */
    id: 'save',
    title: 'Save',
    key: 'Mod+S',
    applies: () => true,
    run: (session) => { handsOf(session).hands?.save(); },
  },
  {
    /**
     * Escape. It does the first of three that there is something for, and that one only:
     * 1. it calls off the gestures in progress, gesturesOf(session).cancelAll(), when one is open (a line in hand, a
     *    pin being dragged, a message being moved);
     * 2. it puts the tool in hand down, toolsOf(session).putDown(), when a tool is in hand;
     * 3. it lets go of what is picked, selectionOf(session).set([]), when something is. The view in front stays.
     * With nothing of the three it does nothing. It says nothing, writes nothing and makes no undo step.
     */
    id: 'put-down',
    title: 'Put down',
    key: 'Escape',
    applies: () => true,
    run: (session) => {
      const gestures = gesturesOf(session);
      if (gestures.open > 0) { gestures.cancelAll(); return; }
      const tools = toolsOf(session);
      if (tools.armed) { tools.putDown(); return; }
      const selection = selectionOf(session);
      if (selection.items.length > 0) selection.set([]);
    },
  },
];
