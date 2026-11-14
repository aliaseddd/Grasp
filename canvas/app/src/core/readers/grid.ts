// The reader of a grid view. THE SCAFFOLD'S SKELETON: package 2-12 owns this file and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-12; section 4, seam 1):
// - `gridReader`, in place of null: read (the model only: for the columns `notes` and `problems` it gives a column
//   with `added: true` and empty cells, which the body fills), sizeOf and listed, by the measures below.
// - `orderRows`: the sort's one rule, which the body also uses for the two added columns.
// The measures, the types and the widths are fixed here by the plan, so that the body (views/GridBody.tsx) and the
// reader agree from the start.
//
// While `gridReader` is null a grid view is not drawn by a body: its tab shows the card.

import type { Reader } from './index';

/** A row's height, the header's height, and the room for marks at a row's right end, in px. */
export const GRID_ROW = 28;
export const GRID_HEAD = 32;
export const GRID_MARKS = 72;

/** Each column's width, by its key. */
export const GRID_WIDTHS: Readonly<Record<string, number>> = Object.freeze({
  kind: 120, name: 180, type: 160, multiplicity: 96, owner: 200, doc: 320, specializes: 160, notes: 80, code: 240, problems: 320,
});

/** A matrix's side column, and a cell's width, in px. */
export const MATRIX_SIDE = 200;
export const MATRIX_CELL = 96;

/** One shown element as a table's row: `className` is 'def' or 'usage', and 'abstract'; `cells` are in the columns' order. */
export interface GridRow { id: string; className: string; cells: readonly string[] }

/** One pair of a matrix that has a line between its two elements: the lines from the row's element to the column's, each with its sign and its words. */
export interface GridCell { from: string; to: string; lines: readonly { id: string; sign: string; words: string }[] }

/** What a grid view's body draws. */
export interface GridData {
  view: string;
  mode: 'table' | 'matrix';
  /** A table's columns; a matrix has none. `sorted`: whether the rows are sorted by it, and which way. `added`: the body fills the cell (notes, problems). */
  columns: readonly { key: string; title: string; width: number; sorted: 'up' | 'down' | null; added: boolean }[];
  sort: { key: string; down: boolean } | null;
  /** A table's rows, in the model's order or the sort's; empty in a matrix. */
  rows: readonly GridRow[];
  /** A matrix's elements, in the same order: down the side and along the top. */
  heads: readonly { id: string; className: string; words: string }[];
  /** A matrix's pairs that have a line between them. */
  cells: readonly GridCell[];
}

/** The reader of the renderer `grid`. Null until package 2-12 builds it. */
export const gridReader: Reader<GridData> | null = null;

/** The sort's one rule: the rows by their words, those with none last either way. Package 2-12 builds it. */
export function orderRows<T extends { id: string }>(_rows: readonly T[], _wordOf: (row: T) => string, _down: boolean): T[] {
  throw new Error('orderRows: package 2-12 builds it');
}
