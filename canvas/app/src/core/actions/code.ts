// The actions on code links. THE SCAFFOLD'S SKELETON: package 2-8 owns this file and builds its rows.
//
// Its rows (plan/slice-2.md, section 5, the table and flow 10; section 8, package 2-8):
// | id               | title            | key | applies |
// | add-code-link    | Add code link    |     | the last picked is an element whose kind holds code links |
// | remove-code-link | Remove code link |     | the same, and the element has a link; the `choice` is the link's place in the list |
// What each says where it does not apply: "Pick an element to link code to it." or "<A start> holds no code links.";
// "<Part def X> has no code link." And from run: "That link is no longer there." Each writes through
// codeLinksOf(session, elementId) of core/codeLinks.ts.

import type { Action } from '../commands';

export const CODE_ACTIONS: readonly Action[] = [];
