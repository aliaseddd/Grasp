// The rows of the camera's keys. THE SCAFFOLD'S SKELETON: package 2-14 owns this file and builds its rows.
//
// Its rows (plan/slice-2.md, section 5):
// | id                                          | title                        | key                                         |
// | zoom-in, zoom-out, fit-view                 | Zoom in, Zoom out, Fit the view | '+', '-', '0'                            |
// | pan-left, pan-right, pan-up, pan-down       | Move left, right, up, down   | 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown' |
// Each applies when the view in front has a camera (a graph body), and says where it does not: "No view is in
// front." or "<A grid view> has no zoom: it scrolls." Each calls the shell's hand,
// handsOf(session).hands.camera(viewId, 'in' | 'out' | 'fit' | 'left' | 'right' | 'up' | 'down'): '+' and '-' zoom by a
// step of 1.2 about the middle of the plane, an arrow moves the plane by 80 px, and '0' fits, as the fit button does
// (section 8, package 2-14). '=' reads as '+' and '_' as '-' (ALIASES of core/keys.ts).
//
// While the array is empty the keys do nothing, as before the scaffold.

import type { Action } from '../commands';

export const CAMERA_ACTIONS: readonly Action[] = [];
