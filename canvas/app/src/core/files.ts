// Opening and saving a state file.
//
// A file is asked for through the browser's picker (showOpenFilePicker) where there is one, which also gives the
// file's handle, and through a file input otherwise. It is saved in the shape of the old page's stateFile()
// (canvas/src/core/page/io.js), `{ format, revision, saved, model, notes, archive, changes }`, written as that page's
// Download state writes it, so the old page, export.mjs, check.sh and save-state.mjs read what is saved here: back
// through the file's handle when it has one, and as a download under the file's name otherwise.
//
// What needs no browser (a file's text into a session, a session into a file's text) is apart from what does, so the
// core's tests run the first in Node and stand in for the browser in the second.

import { openSession } from './session';
import type { FileRef, Session, SessionOptions } from './session';
import type { LogEntry, Model } from './history';

/** A state file, as the old page's stateFile() makes it. */
export interface StateFile {
  /** The version of the format the model is saved in: the library's, grasp/2. */
  format: string;
  /** The revision of the model in the file this one started from: the file that was opened. */
  revision: string | null;
  /** When it was saved. */
  saved: string;
  model: Model;
  notes: unknown[];
  archive: unknown[];
  /** The log of what was done, for Claude to read. */
  changes: readonly LogEntry[];
}

// ---- What needs no browser.

/**
 * Opens a session from a state file's text. Throws an error whose message says, in a sentence that names the file,
 * why it can't be opened: it isn't JSON, or what openSession says.
 */
export function openText(lib: SysMLModelLibrary, text: string, file: FileRef, options?: SessionOptions): Session {
  let data: unknown;
  try {
    // A byte order mark that an editor put at the file's start is no part of its JSON.
    data = JSON.parse(text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text);
  } catch {
    throw new Error(`${file.name} isn't a state file: it isn't JSON.`);
  }
  return openSession(lib, data, file, options);
}

/** The session as a state file. Its model, notes, archive and log are the session's own, not copies. */
export function stateFile(session: Session): StateFile {
  return {
    format: session.lib.FORMAT, revision: session.revision, saved: session.now(), model: session.model, notes: session.notes,
    archive: session.archive, changes: session.changes,
  };
}

/** The session as a state file's text, as the old page's Download state writes it. */
export function stateText(session: Session): string {
  return JSON.stringify(stateFile(session), null, 2) + '\n';
}

// ---- What asks the browser.

/**
 * The data-testid of the file input that openFile puts in the page where the browser has no picker. The input is
 * there only while its dialog is open. A test takes the picker away before the page loads (delete
 * window.showOpenFilePicker), listens for Playwright's filechooser event, clicks what opens a file, and gives the
 * chooser its file. It must be listening before the click: with nobody listening, a headless Chromium closes the
 * dialog at once, which opens nothing and takes the input out again.
 */
export const FILE_INPUT = 'file-input';

// Chromium's picker, which TypeScript's DOM library doesn't declare.
type OpenFilePicker = (options?: {
  multiple?: boolean;
  types?: { description?: string; accept: Record<string, string[]> }[];
}) => Promise<FileSystemFileHandle[]>;

function picker(): OpenFilePicker | null {
  if (typeof window === 'undefined') return null;
  const pick = (window as Window & { showOpenFilePicker?: OpenFilePicker }).showOpenFilePicker;
  return typeof pick === 'function' ? pick.bind(window) : null;
}

/** Whether the browser has the picker, so an opened file comes with its handle and Save writes back into it. */
export function hasPicker(): boolean {
  return picker() !== null;
}

/** A file the person chose, with its handle when it came through the picker. */
export interface ChosenFile {
  file: File;
  handle: FileSystemFileHandle | null;
}

let waiting: (() => void) | null = null;   // gives up the file input that is still waiting for a choice, if one is

// Asks through a file input, made for the one choice: it is put in the page, hidden, and clicked, which opens the
// browser's own dialog, and it goes once a file is chosen or the dialog is closed. Call it from a click or a key, as
// the browser opens the dialog only then.
function chooseThroughInput(): Promise<ChosenFile | null> {
  // A browser that says nothing when its dialog is closed leaves the input waiting: the next one takes its place.
  if (waiting) waiting();
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.hidden = true;
    input.setAttribute('data-testid', FILE_INPUT);
    const done = (file: File | null): void => {
      if (waiting === giveUp) waiting = null;
      input.remove();
      resolve(file ? { file, handle: null } : null);
    };
    const giveUp = (): void => done(null);
    input.addEventListener('change', () => done(input.files && input.files[0] ? input.files[0] : null));
    input.addEventListener('cancel', giveUp);
    waiting = giveUp;
    document.body.appendChild(input);
    input.click();
  });
}

/**
 * Asks the person for a state file: through the picker where the browser has one, through a file input otherwise.
 * Resolves with the file, or with null when the person closed the dialog.
 */
export async function chooseFile(): Promise<ChosenFile | null> {
  const pick = picker();
  if (!pick) return chooseThroughInput();
  let handles: FileSystemFileHandle[];
  try {
    handles = await pick({ multiple: false, types: [{ description: 'Grasp state files', accept: { 'application/json': ['.json'] } }] });
  } catch (error) {
    // The person closed the picker.
    if (!!error && typeof error === 'object' && (error as { name?: unknown }).name === 'AbortError') return null;
    throw error;
  }
  const handle = handles[0];
  return handle ? { file: await handle.getFile(), handle } : null;
}

/**
 * Asks the person for a state file and opens it. Resolves with the session, or with null when the person closed the
 * dialog; rejects with the error openText throws when the file can't be opened. Call it from a click or a key: the
 * browser opens its picker, or the input's dialog, only then.
 */
export async function openFile(lib: SysMLModelLibrary, options?: SessionOptions): Promise<Session | null> {
  const chosen = await chooseFile();
  if (!chosen) return null;
  return openText(lib, await chosen.file.text(), { name: chosen.file.name, handle: chosen.handle }, options);
}

// Hands a text to the browser as a download, as the old page's Download state does.
function download(name: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Saves the session's file: back through its handle when it came through the picker, as a download under its name
 * otherwise. A run of changes still open is ended first, so the log says what the file holds. Resolves with where the
 * file went, once it is written, and the session then has no unsaved changes but those made while it was written.
 * Rejects when the browser refuses the write (the person did not allow it), and the session stays as it was.
 */
export async function saveFile(session: Session): Promise<'handle' | 'download'> {
  session.history.endEdit();
  const mark = session.history.mark();
  const text = stateText(session);
  if (session.handle) {
    const writable = await session.handle.createWritable();
    await writable.write(text);
    await writable.close();
  } else download(session.name, text);
  session.saved(mark);
  return session.handle ? 'handle' : 'download';
}

// ---- Before changes are lost (step 7).

/** What Open asks before another file takes the place of one with unsaved changes. */
export function LOSE_QUESTION(name: string): string {
  return `${name} has changes that aren't saved. Open another file and lose them?`;
}

/**
 * Makes the page ask before it is left or reloaded while `unsaved()` is true: a `beforeunload` listener on the window
 * that then calls preventDefault() and sets returnValue, so the browser asks its own question; while `unsaved()` is
 * false it does nothing, and the page goes without a question. Returns what takes the listener away.
 */
export function askBeforeLeaving(unsaved: () => boolean): () => void {
  void unsaved;
  throw new Error('askBeforeLeaving: step 7 builds it');
}
