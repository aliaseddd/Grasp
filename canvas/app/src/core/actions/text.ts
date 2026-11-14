// The actions of the text tab. THE SCAFFOLD'S SKELETON: package 2-9 owns this file and builds its rows.
//
// Its rows (plan/slice-2.md, section 5, the table and flow 11; section 8, package 2-9):
// | id        | title                 | key | applies |
// | open-text | Show the model's text |     | always  |
// | copy-text | Copy the text         |     | always  |
// open-text calls the shell's hand, handsOf(session).hands.showText(). copy-text copies exportText(session)'s text
// (core/text.ts) through hands.copy and says "Copied the model as textual SysML v2.", or, when the browser refuses,
// "This browser wouldn't copy for the page. Select the text and copy it from there."

import type { Action } from '../commands';

export const TEXT_ACTIONS: readonly Action[] = [];
