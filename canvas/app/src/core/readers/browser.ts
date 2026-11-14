// The reader of a browser view. THE SCAFFOLD'S SKELETON: package 2-13 owns this file and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-13; section 4, seam 1): `browserReader`, in place of null:
// read (the model library's browserRows under the view's roots, worded as the Explorer words a row, a folded
// element's rows left out), sizeOf (rows 28 px high, stepped in 16 px a level) and listed.
//
// While `browserReader` is null a browser view is not drawn by a body: its tab shows the card.

import type { Reader } from './index';

/** One row of the tree: an element or a line, how deep it stands, how many rows it has under it, whether it is folded, and its words: «keyword», the name, and the rest (`: Type [multiplicity]`). */
export interface BrowserRow { type: 'el' | 'rel'; id: string; depth: number; kids: number; folded: boolean; kw: string; name: string; rest: string }

/** What a browser view's body draws: its rows, or the sentence an empty tree says. */
export interface BrowserData { view: string; rows: readonly BrowserRow[]; empty: string | null }

/** The reader of the renderer `browser`. Null until package 2-13 builds it. */
export const browserReader: Reader<BrowserData> | null = null;
