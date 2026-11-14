// The application: the top bar over the dock, filling the window. It holds the session (the open file) and says what
// went wrong when a file cannot be opened. main.tsx renders it inside the theme.

import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText } from '@mui/material';
import { LOSE_QUESTION, askBeforeLeaving, openFile, pressed, saveFile, selectionOf } from '../core';
import type { KeyPlace, Selection, Session } from '../core';
import { Markers } from '../plane/edges/markers';
import { LabelEditor } from '../plane/LabelEditor';
import { viewStoresOf } from '../plane/viewStore';
import type { ViewStore } from '../plane/viewStore';
import { About } from './About';
import { Dock } from './Dock';
import { Toasts } from './Toasts';
import { TopBar } from './TopBar';

/** What the page puts on window.Grasp for the tests and for Claude's own looking, as the old page has window.SysMLCanvas. */
export interface GraspGlobal {
  /** The open file, or null. */
  readonly session: Session | null;
  /** The open file's view stores by view id (those made so far), or null with no file. */
  readonly views: ReadonlyMap<string, ViewStore> | null;
  /** The open file's selection, or null with no file. */
  readonly selection: Selection | null;
}

declare global {
  interface Window {
    Grasp?: GraspGlobal;
  }
}

/** Input types that take no typing: a key pressed on one is not the field's own (slice 1, step 10). */
const NON_TEXT_INPUT = ['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'file', 'color', 'image'];
/** The roles of the widgets that use the arrows and typing themselves (plan/slice-2.md, section 5). */
const KEY_WIDGETS = '[role="tree"], [role="menu"], [role="listbox"], [role="tablist"], [role="radiogroup"], [role="grid"]';

/**
 * Where a keydown came from, as core/keys.ts asks it (KeyPlace), read off the event's target and the document:
 * - `typing`: the target is a textarea, a select, anything contenteditable, or an input whose `type` is none of
 *   NON_TEXT_INPUT;
 * - `historyKeys`: the target is inside an element that carries `data-history-keys` (the form of Details);
 * - `modal`: the document holds an element with role "dialog" and aria-modal "true";
 * - `widget`: the target is inside an element with one of the roles of KEY_WIDGETS.
 * A target that is no element (the window itself) is none of the three that ask the target.
 */
export function placeOf(target: EventTarget | null): KeyPlace {
  const el = target instanceof HTMLElement ? target : null;
  const typing = el !== null && (el.isContentEditable || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' ||
    (el.tagName === 'INPUT' && !NON_TEXT_INPUT.includes((el as HTMLInputElement).type)));
  return {
    typing,
    historyKeys: el !== null && el.closest('[data-history-keys]') !== null,
    modal: document.querySelector('[role="dialog"][aria-modal="true"]') !== null,
    widget: el !== null && el.closest(KEY_WIDGETS) !== null,
  };
}

/**
 * The application. Its contract:
 *
 * - Its root carries data-testid "app" (main.tsx's today) and is two rows: TopBar, then Dock filling the rest.
 * - Open (the bar's, or the card's) calls `openFile(window.SysMLModel)` from the click. A session replaces the one
 *   open; null (the dialog closed) changes nothing. A rejection is shown in an MUI Alert, in the error's own
 *   sentence (files.ts / session.ts word it and name the file), and the file that was open stays open.
 * - The session is in React state, and Dock hands it on to its panels; `window.Grasp.session` follows it.
 * - **Save** (step 7): saveFile(session), called a moment after the click or key that asked (see onSave). From slice
 *   2 the bar's Save and Ctrl or ⌘ + S ask the action `save`, which calls onSave through the shell's hands. Where it went is not said; a rejection (the browser refused the write) is
 *   shown in the same Alert, "<name> wasn't saved: <the browser's reason>", and the session stays unsaved.
 * - **Before changes are lost** (step 7). Open, while the session has unsaved changes, first asks in an MUI Dialog
 *   (role "dialog") in the page, whose text is LOSE_QUESTION(name), with two buttons, "Cancel" and "Open another".
 *   Cancel, Escape and a click outside close it and open nothing; "Open another" closes it and goes on to the picker
 *   or the file input from that button's own click. The ask is not the browser's confirm(): time spent in a confirm
 *   counts against the Open click's user activation (about 5 s in Chromium), so an answer given later would open no
 *   chooser and say nothing. Without unsaved changes Open goes straight to openFile. And while a session has unsaved changes the page asks before it is left or reloaded
 *   (askBeforeLeaving in files.ts), so the browser's own question comes up; once saved, or with no file, nothing is
 *   asked.
 * - **The toasts and About** are rendered here once, each from its own file: Toasts (step 11) with the session, over
 *   the dock; About (step 12) with whether it is open, which the bar's About button sets through `onAbout` and the
 *   panel's own closing clears.
 * - **Step 9** (plan/swarm/step-9.md): `window.Grasp.selection` is the open file's selection (selectionOf(session)),
 *   or null with no file.
 * - **The keys** (slice 2: plan/slice-2.md, section 4, seam 8; plan/architecture.md, contract 4). The page has one
 *   keydown listener, this one, on the window, in the capture phase, so that it hears a key before a menu that stops
 *   it (Escape closes an open palette and is still the page's). It describes the event (`key`, the modifiers,
 *   `repeat`) and where it came from (placeOf), and calls `pressed(session, press, place)` of core/keys.ts, which
 *   holds every rule of the keys and asks the action of the key; when the key was taken, the browser's default is
 *   prevented, and nothing else is done with the event: it goes on to whatever else hears it. No component listens
 *   for a key of its own, except a text field for what is typed into it, and a widget for its own keys. With no file
 *   open the session is null, and pressed() then takes Save's key only, so the browser's own Save never opens.
 * - **Save's hand.** `onSave` is what the action `save` calls: the dock gives it to the session with its own hands
 *   (shell/Dock.tsx, handsOf).
 * - **The label editor** (slice 2, seam 7): one `<LabelEditor session />` (plane/LabelEditor.tsx) for the page,
 *   while a file is open.
 */
export function App(): JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  /** Whether the question before Open is up. */
  const [asking, setAsking] = useState(false);
  /** Whether the About panel is open. */
  const [about, setAbout] = useState(false);
  const onAbout = useCallback(() => setAbout(true), []);
  const closeAbout = useCallback(() => setAbout(false), []);

  useEffect(() => {
    window.Grasp = { session, views: session ? viewStoresOf(session) : null, selection: session ? selectionOf(session) : null };
  }, [session]);

  // While a file is open the page asks before it is left or reloaded with unsaved changes.
  useEffect(() => (session ? askBeforeLeaving(() => session.unsaved) : undefined), [session]);

  const onSave = useCallback(() => {
    if (!session) return;
    // Not inside the event that asked (Ctrl + S's keydown): a download started inside it is sometimes dropped by
    // Chromium, the save made and no download begun (about 1 in 20 runs of keys.test.mjs under load). The click's or
    // the key's user activation lasts for seconds, so the download still has it.
    setTimeout(() => {
      saveFile(session).then(
        () => setProblem(null),
        (error: unknown) => setProblem(`${session.name} wasn't saved: ${error instanceof Error ? error.message : String(error)}`),
      );
    }, 0);
  }, [session]);

  // Called from a click, so the browser opens its picker or the input's dialog: Open's own click, or, when the session
  // has unsaved changes, the click on the dialog's "Open another".
  const openAnother = useCallback(() => {
    openFile(window.SysMLModel).then(
      (opened) => {
        if (!opened) return;
        setProblem(null);
        setSession(opened);
      },
      (error: unknown) => setProblem(error instanceof Error ? error.message : String(error)),
    );
  }, []);

  const onOpen = useCallback(() => {
    if (session?.unsaved) setAsking(true);
    else openAnother();
  }, [session, openAnother]);

  // The page's one keydown listener (see the contract's "The keys").
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      const press = { key: event.key, ctrl: event.ctrlKey, meta: event.metaKey, shift: event.shiftKey, alt: event.altKey, repeat: event.repeat };
      if (pressed(session, press, placeOf(event.target))) event.preventDefault();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [session]);

  return (
    <Box data-testid="app" sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar session={session} onOpen={onOpen} onAbout={onAbout} />
      <Markers />
      <Box sx={{ flex: '1 1 0', minHeight: 0, position: 'relative' }}>
        <Dock session={session} onOpen={onOpen} onSave={onSave} />
        <Toasts session={session} />
        {session ? <LabelEditor session={session} /> : null}
        {problem !== null && (
          <Alert severity="error" onClose={() => setProblem(null)} sx={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 10000, maxWidth: 'calc(100% - 16px)', boxShadow: 3 }}>
            {problem}
          </Alert>
        )}
      </Box>
      <About open={about} onClose={closeAbout} />
      <Dialog open={asking && session !== null} onClose={() => setAsking(false)} aria-labelledby="lose-question">
        <DialogContent>
          <DialogContentText id="lose-question" sx={{ color: 'text.primary' }}>{session ? LOSE_QUESTION(session.name) : ''}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => setAsking(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setAsking(false);
              openAnother();
            }}
          >
            Open another
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
