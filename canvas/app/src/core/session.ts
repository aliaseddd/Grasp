// The session: the file open in the page. It has the file's model, which its history holds and records; the file's
// notes and archive; the log of what was done; the file's name, and its handle when it came through the picker; and
// whether it has unsaved changes.
//
// Opening a file is not a change. It makes a new session, whose history has no steps: what was done to the file
// before can't be taken back, as on the old page when a model came from storage (loadModel in changes.js).
//
// The model is read through the model library's normalize, as the old page reads it (canvas/src/README.md, "The
// saved format"), so a file saved in an older version of the format is upgraded as it is read, and everything after
// this reads the current version only. The notes and the archive pass through as the file has them: this slice shows
// and changes none, and the old page, which tidies each note as it reads it, reads them from the saved file as it
// would have read them from the file that was opened.

import { createHistory, throwLater } from './history';
import type { History, HistoryOptions, LogEntry, Model } from './history';

declare global {
  // The part of the model library that opening and saving use, beside what src/types.d.ts declares of it.
  interface SysMLModelLibrary {
    /** The version of the saved format that the library reads and writes: 2 for grasp/2. */
    readonly VERSION: number;
    /** The version a saved model names; the library's own when it names none. */
    versionOf(raw: unknown): number;
    /** A saved model, of this version or an older one, read into the current version: the model the page holds. */
    normalize(raw: unknown): Model;
  }
}

/** The file a session was opened from: its name, and its handle when it came through the browser's picker. */
export interface FileRef {
  name: string;
  handle?: FileSystemFileHandle | null;
}

/** What a session may be opened with: its clock and what it does with a mistake (HistoryOptions). The log is the file's. */
export type SessionOptions = Omit<HistoryOptions, 'changes'>;

export interface Session {
  /** The model library the file was read with, which also names the format it is saved in. */
  readonly lib: SysMLModelLibrary;
  /** The file's name, which the top bar shows and a download is saved under. */
  readonly name: string;
  /** The file's handle, when it came through the picker: Save writes back through it. Null otherwise. */
  readonly handle: FileSystemFileHandle | null;
  /** The history: every change to the model goes through its edit(). */
  readonly history: History;
  /** The model, which is the history's: the Proxy of itself. */
  readonly model: Model;
  /** The revision of the model the file held when it was opened: a saved file names it as the one it started from. */
  readonly revision: string | null;
  /** The file's notes, as the file has them. */
  readonly notes: unknown[];
  /** The file's archived notes, as the file has them. */
  readonly archive: unknown[];
  /** The log of what was done, which the file carries for Claude: the history's. */
  readonly changes: readonly LogEntry[];
  /** Whether the model is in another state than the one the file holds. */
  readonly unsaved: boolean;
  /** The time, as a saved file and the log carry it. */
  now(): string;
  /**
   * Says that the file now holds the model: in the state the mark names (history.mark(), read when the file's text
   * was made), or in the state it is in now. What was changed since stays unsaved.
   */
  saved(mark?: number): void;
  /**
   * Tells listener whenever the model, the undo steps or `unsaved` may have changed: after every change the history
   * tells of, and after saved(). Returns what stops it.
   */
  listen(listener: () => void): () => void;
}

const listOf = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);

/**
 * Opens a session from a state file's JSON: `{ model, notes, archive, changes }`, the notes, the archive and the log
 * being lists or absent, and anything else the file holds being left behind. Throws an error whose message says, in a
 * sentence that names the file, why it can't be opened: it holds no model, or it was saved in a version of the format
 * newer than the library reads, which saving would write over in an older one.
 */
export function openSession(lib: SysMLModelLibrary, data: unknown, file: FileRef, options: SessionOptions = {}): Session {
  if (!isObject(data) || !isObject(data.model)) throw new Error(`${file.name} isn't a state file: it holds no model.`);
  const version = lib.versionOf(data.model);
  if (version > lib.VERSION) {
    throw new Error(`${file.name} was saved in version ${version} of the format, and this page reads up to version ${lib.VERSION}. ` +
      'Open it with a newer Grasp.');
  }
  const read = lib.normalize(data.model);
  const revision = read.revision;
  const now = options.now ?? (() => new Date().toISOString());
  const report = options.mistake ?? throwLater;
  const history = createHistory(read, { ...options, now, changes: listOf(data.changes) as LogEntry[] });

  let saved = history.mark();   // the state of the model that the file holds
  const listeners = new Set<() => void>();
  const tell = (): void => {
    for (const listener of Array.from(listeners)) {
      try { listener(); } catch (error) { report(error instanceof Error ? error : new Error(String(error))); }
    }
  };
  history.listen(tell);

  return {
    lib,
    name: file.name,
    handle: file.handle ?? null,
    history,
    get model() { return history.model; },
    revision,
    notes: listOf(data.notes),
    archive: listOf(data.archive),
    get changes() { return history.changes; },
    get unsaved() { return history.mark() !== saved; },
    now,
    saved(mark = history.mark()) {
      saved = mark;
      tell();
    },
    listen(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
  };
}
