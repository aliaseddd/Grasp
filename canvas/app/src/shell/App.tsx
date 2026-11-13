// The application: the top bar over the dock, filling the window. It holds the session (the open file) and says what
// went wrong when a file cannot be opened. main.tsx renders it inside the theme.

import { useCallback, useEffect, useState } from 'react';
import { Alert, Box } from '@mui/material';
import { openFile } from '../core';
import type { Session } from '../core';
import { Markers } from '../plane/edges/markers';
import { viewStoresOf } from '../plane/viewStore';
import type { ViewStore } from '../plane/viewStore';
import { Dock } from './Dock';
import { TopBar } from './TopBar';

/** What the page puts on window.Grasp for the tests and for Claude's own looking, as the old page has window.SysMLCanvas. */
export interface GraspGlobal {
  /** The open file, or null. */
  readonly session: Session | null;
  /** The open file's view stores by view id (those made so far), or null with no file. */
  readonly views: ReadonlyMap<string, ViewStore> | null;
}

declare global {
  interface Window {
    Grasp?: GraspGlobal;
  }
}

/**
 * The application. Its contract:
 *
 * - Its root carries data-testid "app" (main.tsx's today) and is two rows: TopBar, then Dock filling the rest.
 * - Open (the bar's, or the card's) calls `openFile(window.SysMLModel)` from the click. A session replaces the one
 *   open; null (the dialog closed) changes nothing. A rejection is shown in an MUI Alert, in the error's own
 *   sentence (files.ts / session.ts word it and name the file), and the file that was open stays open.
 * - The session is in React state, and Dock hands it on to its panels; `window.Grasp.session` follows it.
 * - **Save** (step 7): saveFile(session). Where it went is not said; a rejection (the browser refused the write) is
 *   shown in the same Alert, "<name> wasn't saved: <the browser's reason>", and the session stays unsaved.
 * - **Before changes are lost** (step 7). Open, while the session has unsaved changes, first asks with the browser's
 *   own confirm(): LOSE_QUESTION(name). Cancel opens nothing; OK goes on to the picker or the file input, from the
 *   same click. And while a session has unsaved changes the page asks before it is left or reloaded
 *   (askBeforeLeaving in files.ts), so the browser's own question comes up; once saved, or with no file, nothing is
 *   asked.
 */
export function App(): JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    window.Grasp = { session, views: session ? viewStoresOf(session) : null };
  }, [session]);

  // Called from the click itself, so the browser opens its picker or the input's dialog.
  const onOpen = useCallback(() => {
    openFile(window.SysMLModel).then(
      (opened) => {
        if (!opened) return;
        setProblem(null);
        setSession(opened);
      },
      (error: unknown) => setProblem(error instanceof Error ? error.message : String(error)),
    );
  }, []);

  return (
    <Box data-testid="app" sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar session={session} onOpen={onOpen} onSave={NOT_YET} />
      <Markers />
      <Box sx={{ flex: '1 1 0', minHeight: 0, position: 'relative' }}>
        <Dock session={session} onOpen={onOpen} />
        {problem !== null && (
          <Alert severity="error" onClose={() => setProblem(null)} sx={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 10000, maxWidth: 'calc(100% - 16px)', boxShadow: 3 }}>
            {problem}
          </Alert>
        )}
      </Box>
    </Box>
  );
}

// Save, until step 7 builds it: the bar's button is disabled meanwhile.
function NOT_YET(): void {}
