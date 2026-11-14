// The code links of an element (plan/slice-2.md, section 4, seam 5, and section 8, package 2-8; plan/architecture.md,
// contract 10). Nothing but this file knows where the model keeps a link: in slices 2 and 3 a link is
// `{ path, language, text }` in the element's `code` field, a list.
//
// THE SCAFFOLD builds codeRowsOf, which the adapter asks for a box's code compartment (the page shows those already),
// and leaves the rest as package 2-8's skeleton: codeLinksOf throws until that package builds it.
//
// Nothing here is React's and nothing asks for a browser.

import type { Model, ModelElement, Touched } from './history';
import type { Session } from './session';

/** A code link: the file it names, the language of the text, and the text. */
export interface CodeLink { path: string; language: string; text: string }

/**
 * The languages a link's language is picked from, the old page's list (canvas/src/annotations/page.js): the first is
 * a new link's. A language a file brought that is not in the list stays, as one more choice.
 */
export const CODE_LANGUAGES: readonly string[] = Object.freeze(['typescript', 'javascript', 'json', 'css', 'html', 'sysml', 'kerml', 'markdown', 'shell', 'other']);

/**
 * The words of an element's code links, one for each link, in the list's order, uncut: a link's path, trimmed, or
 * '(no path)' for a link with none. [] for an element with no link. It is pure and reads the element alone (`lib`
 * and `model` are there for slice 4, where a link is an element the element owns): the adapter calls it for every
 * box it reads and cuts each row to the box's width, and the grid's reader joins the rows for its code column.
 *
 * What is in the list and is no link (not an object, or with no string for its path) still gives a row, '(no path)',
 * as the old page draws one for it. A `code` field that is no list holds no link.
 */
export function codeRowsOf(_lib: SysMLModelLibrary, _model: Model, element: ModelElement): string[] {
  const code: unknown = element.code;
  if (!Array.isArray(code)) return [];
  return Array.from(code, (link: unknown) => {
    const path = link !== null && typeof link === 'object' ? (link as { path?: unknown }).path : undefined;
    return (typeof path === 'string' ? path.trim() : '') || '(no path)';
  });
}

/**
 * The code links of one element, and the changes to them, each one history.edit() (package 2-8).
 *
 * - **`links`** is the element's links, as they are now.
 * - **`add()`** adds a link with no path, the first language (typescript) and no text: 'Added a code link to
 *   <describe>'.
 * - **`remove(index)`** takes the link at that place out: 'Removed the code link <path> from <describe>'.
 * - **`change(index, field, value, key)`** writes one field of a link: 'Set the language of code link 2 of
 *   <describe> to json', 'Wrote the path of code link 2 of <describe>'. Typing a path or a text is one run, with the
 *   key `code:<element>:<index>:<field>`, ended when the field is left.
 * Each returns what the edit touched, or null when it changed nothing.
 */
export interface CodeLinks {
  readonly links: readonly CodeLink[];
  add(): Touched | null;
  remove(index: number): Touched | null;
  change(index: number, field: keyof CodeLink, value: string, key?: string | null): Touched | null;
}

/**
 * The code links of an element of a session. For an id that names no element of the model, or an element whose kind
 * holds no code links (its kind's `fields` do not list `code`), `links` is empty and add, remove and change do nothing
 * and return null. Package 2-8 builds it, and may add an export of its own here that says whether an element can hold
 * code links, which the section's `applies` asks (rather than a field of the record).
 */
export function codeLinksOf(_session: Session, _elementId: string): CodeLinks {
  throw new Error('codeLinksOf: package 2-8 builds it');
}
