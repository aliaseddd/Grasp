// The session: the file open in the page. It has the file's model, which its history holds and records; the file's
// notes and archive; the log of what was done; the file's name, and its handle when it came through the picker; and
// whether it has unsaved changes.
//
// Opening a file is not a change. It makes a new session, whose history has no steps: what was done to the file
// before can't be taken back, as on the old page when a model came from storage (loadModel in changes.js).
//
// The model is read through the model library's normalize, as the old page reads it (canvas/src/README.md, "The
// saved format"), so a file saved in an older version of the format is upgraded as it is read, and everything after
// this reads the current version only.
//
// The notes and the archive are not the session's to change (slice 2: plan/slice-2.md, section 4, seam 11). The
// session keeps the lists the file had (fileNotesOf) and hands them to notesOf(session) of core/notes.ts, which owns
// the notes from there: `notes` and `archive` are what its file() gives, and `unsaved` follows its mark beside the
// history's. It also lists the model's views for the dock and the Tools view (viewsOf; plan/architecture.md,
// contract 22).

import { createHistory, throwLater } from './history';
import type { History, HistoryOptions, LogEntry, Model } from './history';
import { notesOf } from './notes';

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
  /** The notes, as a state file keeps them: what notesOf(session).file() gives now. */
  readonly notes: unknown[];
  /** The archived notes, as a state file keeps them: what notesOf(session).file() gives now. */
  readonly archive: unknown[];
  /** The log of what was done, which the file carries for Claude: the history's. */
  readonly changes: readonly LogEntry[];
  /**
   * Whether the model or the notes are in another state than the one the file holds: history.mark() or
   * notesOf(session).mark() differs from the mark of the last save.
   */
  readonly unsaved: boolean;
  /** The time, as a saved file and the log carry it. */
  now(): string;
  /**
   * Says that the file now holds the model and the notes: in the states the two marks name (history.mark() and
   * notesOf(session).mark(), each read when the file's text was made), or, for a mark that is not given, in the state
   * it is in now. What was changed since stays unsaved.
   */
  saved(mark?: number, notesMark?: number): void;
  /**
   * Tells listener whenever the model, the undo steps or `unsaved` may have changed: after every change the history
   * tells of, after every change the notes tell of, and after saved(). Returns what stops it.
   */
  listen(listener: () => void): () => void;
}

const FILE_NOTES = new WeakMap<Session, { notes: unknown[]; archive: unknown[] }>();

/**
 * The notes and the archive a session's file had when it was opened, as the file has them: each a list, empty when
 * the file had none or held something else there. The same two lists each time. It is for core/notes.ts, which reads
 * them once to make the session's notes; everything else asks notesOf(session).
 */
export function fileNotesOf(session: Session): { notes: unknown[]; archive: unknown[] } {
  const kept = FILE_NOTES.get(session);
  if (!kept) throw new Error('fileNotesOf: this session was not opened by openSession.');
  return kept;
}

/** A view of the model as the dock and the Tools view list it: its id, its name and its kind, and nothing else of it. */
export interface ViewRow {
  readonly id: string;
  readonly name: string;
  readonly kind: string;
}

const VIEWS = new WeakMap<Session, readonly ViewRow[]>();

/**
 * The model's views, in the model's order, each as `{ id, name, kind }`: the same array until a view comes, goes, is
 * renamed or changes its kind, or the views change their order, and a new array then. So a component reads it through
 * useSyncExternalStore(session.listen, () => viewsOf(session)) and renders again only when the list differs, and no
 * component reads a view's record itself (contract 22). The array and its rows are frozen.
 *
 * It is worked out when asked, by comparing the model's views with the array given last: a model holds few views.
 */
export function viewsOf(session: Session): readonly ViewRow[] {
  const views = session.model.views;
  const was = VIEWS.get(session);
  if (was && was.length === views.length && was.every((row, i) => row.id === views[i].id && row.name === views[i].name && row.kind === views[i].kind)) return was;
  const now = Object.freeze(Array.from(views, (view) => Object.freeze({ id: view.id, name: view.name, kind: view.kind })));
  VIEWS.set(session, now);
  return now;
}

/**
 * The name of the model's package, trimmed: '' for a package with no name. The dock titles the text tab with it,
 * `<package name>.sysml` (plan/slice-2.md, seam 10), and reads it here, since a component reads no field of a model's
 * record itself (contract 22). It is read when asked: nothing in slice 2 changes a package's name in the page.
 */
export function packageNameOf(session: Session): string {
  const name: unknown = session.model.package?.name;
  return typeof name === 'string' ? name.trim() : '';
}

const listOf = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);

/**
 * Opens a session from a state file's JSON: `{ model, notes, archive, changes }`, the notes, the archive and the log
 * being lists or absent, and anything else the file holds being left behind. The session's notes (notesOf) are made
 * here, from the file's lists. Throws an error whose message says, in a
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
  let savedNotes = 0;           // and the state of the notes that it holds, set below once the notes are made
  const listeners = new Set<() => void>();
  const tell = (): void => {
    for (const listener of Array.from(listeners)) {
      try { listener(); } catch (error) { report(error instanceof Error ? error : new Error(String(error))); }
    }
  };
  history.listen(tell);

  const session: Session = {
    lib,
    name: file.name,
    handle: file.handle ?? null,
    history,
    get model() { return history.model; },
    revision,
    get notes() { return notesOf(session).file().notes; },
    get archive() { return notesOf(session).file().archive; },
    get changes() { return history.changes; },
    get unsaved() { return history.mark() !== saved || notesOf(session).mark() !== savedNotes; },
    now,
    saved(mark = history.mark(), notesMark = notesOf(session).mark()) {
      saved = mark;
      savedNotes = notesMark;
      tell();
    },
    listen(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
  };
  // The notes are made from the lists the file had, and the session follows them from here on: their mark as the file
  // holds it, and their telling, for `unsaved`.
  FILE_NOTES.set(session, { notes: listOf(data.notes), archive: listOf(data.archive) });
  const notes = notesOf(session);
  savedNotes = notes.mark();
  notes.listen(tell);
  return session;
}
