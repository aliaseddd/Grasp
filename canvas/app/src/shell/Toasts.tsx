// The toasts: what the page says in passing, at the bottom of the window (plan/slice-1.md, step 11;
// plan/swarm/step-11.md; plan/slice-2.md, section 4, seam 8). App renders it once, over the dock.

import { useRef, useState, useSyncExternalStore } from 'react';
import { Snackbar } from '@mui/material';
import { saysOf, toolsOf, type Saying, type Session } from '../core';
import { FONT_SIZE, INK, WHITE } from './theme';

export interface ToastsProps {
  /** The open file, or null. */
  session: Session | null;
}

/** How long a toast stays when nothing takes it away, in ms. */
export const TOAST_MS = 8000;

/**
 * The toasts of the open file: what was said last, by its tool in hand or through saysOf.
 *
 * **What it shows.** Two things speak for a session: its tool in hand, when a rule refuses a click
 * (`toolsOf(session).said`, core/commands.ts), and everything else, through `saysOf(session)` (core/says.ts): an
 * action that does not apply where it was asked, a gesture's refusal, what an action has to say of what it did. Each
 * is read through useSyncExternalStore. Their sayings are numbered in one row for the session (`Saying.n`,
 * nextSaying), so of the two the one with the larger number was said later, and that one is shown. With no file open,
 * and while neither has anything said, it renders nothing. A file that cannot be opened or saved is said in App's
 * alert at the top, not here.
 *
 * **One toast at a time.** A toast is one Material UI Snackbar holding the saying's text, keyed by its number. A new
 * saying (a new number, even with the same sentence) takes the place of the toast that is up, at once, and its time
 * starts anew; the page never holds two.
 *
 * **When it leaves**, whichever comes first:
 * - The tool takes back what it said (`tools.said` becomes null: the tool was armed or put down, it made something,
 *   it took a first end), when the toast is the tool's. What was said before that does not come up again: a saying
 *   is shown only while none with a larger number has been shown. (saysOf never takes a saying back by itself.)
 * - TOAST_MS (8 s) have passed since it came up (`autoHideDuration`). The time runs whether or not the window has
 *   the focus (`disableWindowBlurListener`); while the pointer rests on the toast it waits, which is Material UI's
 *   own.
 * - Escape is pressed (Material UI's own; the same key is the action `put-down`, core/actions/file.ts).
 * - Another file is opened.
 * A click elsewhere does not take it away (the Snackbar's `clickaway` is ignored): the next click on the plane is
 * the tool's, and what the tool says of it replaces the toast or lets it go. A toast that left by its time or by
 * Escape stays away until something new is said; the component keeps which number it has let go.
 *
 * **Where and how it looks.** Fixed to the window, centred, its bottom edge 24 px above the window's bottom
 * (`anchorOrigin` bottom, center), over the planes and the panels. Ink with white words (INK and WHITE of
 * shell/theme.ts, set on the content: Material UI's own grey is not Grasp's), 13 px, the sentence in one piece and
 * wrapped when the window is narrow. It comes and goes without a transition (`transitionDuration` 0), so a toast
 * that has left is not in the document. It has no button.
 *
 * **For the tests and for a screen reader.** The element that holds the sentence, the Snackbar's content, carries
 * data-testid "toast", role "status" (given through `slotProps.content`; Material UI's default there is "alert",
 * which the page keeps for a file that cannot be opened), and `data-said`, the saying's number: it grows with each
 * saying of the session, so a test tells a new toast from the one before it with the same words. Its text is the
 * sentence and nothing else.
 */
export function Toasts({ session }: ToastsProps): JSX.Element | null {
  return session === null ? null : <SessionToasts session={session} />;
}

function SessionToasts({ session }: { session: Session }): JSX.Element | null {
  const tools = toolsOf(session);
  const says = saysOf(session);
  const byTool = useSyncExternalStore(tools.listen, () => tools.said);
  const bySays = useSyncExternalStore(says.listen, () => says.said);
  // Whichever was said later: the numbers are one row for the session.
  const said: Saying | null = byTool && bySays ? (byTool.n > bySays.n ? byTool : bySays) : byTool ?? bySays;
  // The largest number shown so far, and in which session: a saying older than one that was shown is not shown again
  // when the later one is taken back. A new session's numbers start over, so the number alone would not tell.
  const shown = useRef<{ session: Session; n: number } | null>(null);
  // Which saying has been let go, and in which session.
  const [gone, setGone] = useState<{ session: Session; n: number } | null>(null);
  if (said === null) return null;
  const last = shown.current !== null && shown.current.session === session ? shown.current.n : 0;
  if (said.n < last || (gone !== null && gone.session === session && gone.n === said.n)) return null;
  shown.current = { session, n: said.n };
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
          'data-said': said.n,
          role: 'status',
          sx: { bgcolor: INK, color: WHITE, fontSize: `${FONT_SIZE}px` },
        } as object,
      }}
    />
  );
}
