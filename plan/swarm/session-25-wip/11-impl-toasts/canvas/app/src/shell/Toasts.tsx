// The toasts: what the page says in passing, at the bottom of the window (plan/slice-1.md, step 11;
// plan/swarm/step-11.md). Until step 11 builds it, it shows nothing. App renders it once, over the dock.

import { useState, useSyncExternalStore } from 'react';
import { Snackbar } from '@mui/material';
import { toolsOf, type Session } from '../core';
import { FONT_SIZE, INK, WHITE } from './theme';

export interface ToastsProps {
  /** The open file, or null. */
  session: Session | null;
}

/** How long a toast stays when nothing takes it away, in ms. */
export const TOAST_MS = 8000;

/**
 * The toasts of the open file's tools: what a tool has to say when a rule refuses a click, in the rule's own
 * sentence. Step 11 builds this contract; until then it renders nothing.
 *
 * **What it shows** is `toolsOf(session).said` (core/commands.ts), read through
 * useSyncExternalStore(tools.listen, () => tools.said). With no file open, and while `said` is null, it renders
 * nothing. Nothing else is said in a toast in slice 1: what a tool makes is seen on the plane, in the Explorer and in
 * Undo's tooltip, and a file that cannot be opened or saved is said in App's alert at the top.
 *
 * **One toast at a time.** A toast is one Material UI Snackbar holding `said.text`, keyed by `said.n`. A new saying
 * (a new `said` object, even with the same sentence) takes the place of the toast that is up, at once, and its time
 * starts anew; the page never holds two.
 *
 * **When it leaves**, whichever comes first:
 * - `said` becomes null: the tool did something else (it was armed or put down, it made something, it took a first
 *   end).
 * - TOAST_MS (8 s) have passed since it came up (`autoHideDuration`). The time runs whether or not the window has
 *   the focus (`disableWindowBlurListener`); while the pointer rests on the toast it waits, which is Material UI's
 *   own.
 * - Escape is pressed (Material UI's own; with a tool in hand the same key puts the tool down, panels/Tools.tsx).
 * - Another file is opened.
 * A click elsewhere does not take it away (the Snackbar's `clickaway` is ignored): the next click on the plane is
 * the tool's, and what the tool says of it replaces the toast or lets it go. A toast that left by its time or by
 * Escape stays away until something new is said; the component keeps which `n` it has let go.
 *
 * **Where and how it looks.** Fixed to the window, centred, its bottom edge 24 px above the window's bottom
 * (`anchorOrigin` bottom, center), over the planes and the panels. Ink with white words (INK and WHITE of
 * shell/theme.ts, set on the content: Material UI's own grey is not Grasp's), 13 px, the sentence in one piece and
 * wrapped when the window is narrow. It comes and goes without a transition (`transitionDuration` 0), so a toast
 * that has left is not in the document. It has no button.
 *
 * **For the tests and for a screen reader.** The element that holds the sentence, the Snackbar's content, carries
 * data-testid "toast" and role "status" (given through `slotProps.content`; Material UI's default there is "alert",
 * which the page keeps for a file that cannot be opened). Its text is the sentence and nothing else.
 */
export function Toasts({ session }: ToastsProps): JSX.Element | null {
  return session === null ? null : <SessionToasts session={session} />;
}

function SessionToasts({ session }: { session: Session }): JSX.Element | null {
  const tools = toolsOf(session);
  const said = useSyncExternalStore(tools.listen, () => tools.said);
  // Which saying has been let go, and in which session: a new session's counts start over, so `n` alone would not tell.
  const [gone, setGone] = useState<{ session: Session; n: number } | null>(null);
  if (said === null || (gone !== null && gone.session === session && gone.n === said.n)) return null;
  return (
    <Snackbar
      key={said.n}
      open
      message={said.text}
      autoHideDuration={TOAST_MS}
      disableWindowBlurListener
      transitionDuration={0}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      onClose={(_event, reason) => { if (reason !== 'clickaway') setGone({ session, n: said.n }); }}
      sx={{ bottom: '24px !important' }}
      slotProps={{
        content: {
          'data-testid': 'toast',
          role: 'status',
          sx: { bgcolor: INK, color: WHITE, fontSize: `${FONT_SIZE}px` },
        } as object,
      }}
    />
  );
}
