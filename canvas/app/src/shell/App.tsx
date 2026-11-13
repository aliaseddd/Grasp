// The application: the top bar over the dock, filling the window. It holds the session (the open file) and says what
// went wrong when a file cannot be opened. main.tsx renders it inside the theme.

import { useCallback, useEffect, useState } from 'react';
import { Alert, Box } from '@mui/material';
import { openFile } from '../core';
import type { Session } from '../core';
import { Dock } from './Dock';
import { TopBar } from './TopBar';

/** What the page puts on window.Grasp for the tests and for Claude's own looking, as the old page has window.SysMLCanvas. */
export interface GraspGlobal {
  /** The open file, or null. */
  readonly session: Session | null;
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
 * - Step 7 adds the question before another file replaces one with unsaved changes; step 5 has nothing to lose.
 */
export function App(): JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    window.Grasp = { session };
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
      <TopBar session={session} onOpen={onOpen} />
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
