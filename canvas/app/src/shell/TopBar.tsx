// The bar across the top of the window (data-testid "top-bar"), in place of the old page's header: one row of 40 px
// at any width, ink with white text. It holds the name Grasp, the open file's name with a dot while it has unsaved
// changes, the icon buttons Open, Save, Undo and Redo, then Text once its action is built, and About at the right end.
// No tools, no text buttons, no second row (shell.test.mjs, "no header palette or button row exists").

import { useCallback, useSyncExternalStore } from 'react';
import type { ReactElement } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
// The icons come from @mui/icons-material one by one, by path: vendor.ts puts each on window.GraspVendor under that
// path, never the whole set.
import FolderOpenOutlined from '@mui/icons-material/FolderOpenOutlined';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import Undo from '@mui/icons-material/Undo';
import Redo from '@mui/icons-material/Redo';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import type { Session } from '../core';
import { ActionButton } from './ActionControl';
import { BAR_DISABLED, BAR_HEIGHT, FOCUS_WIDTH, INK, WHITE } from './theme';

/** The bar's actions: each is one <button> with this data-testid (helpers.mjs, TESTIDS) and this fixed aria-label. */
export const ACTIONS = [
  { id: 'open', label: 'Open' },
  { id: 'save', label: 'Save' },
  { id: 'undo', label: 'Undo' },
  { id: 'redo', label: 'Redo' },
  { id: 'about', label: 'About Grasp' },
] as const;
export type ActionId = (typeof ACTIONS)[number]['id'];
const LABELS = Object.fromEntries(ACTIONS.map((action) => [action.id, action.label])) as Record<ActionId, string>;

export interface TopBarProps {
  /** The open file, or null: its name shows in data-testid "file-name", then a dot while `session.unsaved`. */
  session: Session | null;
  /** Called by Open. */
  onOpen: () => void;
  /** Called by About: App opens the About panel. */
  onAbout: () => void;
}

/**
 * The bar. Its contract:
 *
 * - Its root carries data-testid "top-bar", lies across the top at 0, 0, the window's width, BAR_HEIGHT high, and
 *   never wraps: what does not fit is the file name, which is cut with an ellipsis.
 * - "Grasp" in 13 px medium; then data-testid "file-name" holding the file's name and, while unsaved, " •". With no
 *   file it is empty. It re-reads `session.unsaved` through `session.listen`. Its `title` is the whole name, for when
 *   the bar cuts it.
 * - Each action is an MUI IconButton with data-testid and aria-label from ACTIONS and no text. Its tooltip is
 *   separate from its name (the child's own aria-label wins), and a disabled button sits in a <span> under its
 *   tooltip, as MUI asks. Open, Save, Undo, Redo sit together after the file name; About at the right end. The
 *   keyboard's focus is a white ring inside the button, since the theme's teal one would not show on the ink.
 * - Open calls `onOpen` (from a click, so the browser opens its picker or the file input's dialog). About is
 *   enabled, with or without a file open, and calls `onAbout` (plan/swarm/step-12.md).
 * - **Save, Undo, Redo** (step 7; slice 2, plan/slice-2.md, section 4, seam 8). With a file open, Undo and Redo are
 *   each an ActionButton (shell/ActionControl.tsx) for the action of that id (core/actions/file.ts), with the
 *   data-testid and the name they had: the button asks the action when it is clicked, and is greyed, with the
 *   action's sentence as its tooltip and its `aria-description` ("There is nothing to undo.", "There is nothing to
 *   redo."), while the history has no step to take back, or none undone. While it applies, Undo's tooltip names the
 *   step it takes back, "Undo Moved part def Host", and Redo's the step it makes again, "Redo Moved part def Host".
 *   Save is an ActionButton for `save` while the file has unsaved changes (`session.unsaved`); while it has none,
 *   and for all three while no file is open (there is no session then, and an action is asked with one), the bar
 *   shows its own greyed button in that place, with the same data-testid, name and tooltip ("Save", "Undo", "Redo")
 *   and no `data-action`. So Save is greyed until there is something to save, as in slice 1, though its action
 *   always applies: Ctrl or ⌘ + S saves whether or not anything is unsaved. All of it re-reads through
 *   `session.listen`. The bar is no longer handed a way to save: the action `save` calls the shell's hand
 *   (core/hands.ts), which is App's onSave, given to the session by the dock (shell/Dock.tsx).
 * - **Text** (slice 2): after Redo, an ActionButton for `open-text` with the icon of a page of text. It shows once
 *   package 2-9 has built that row (an ActionButton of a row that is not in the table renders nothing), and only
 *   while a file is open.
 * - **The keys** are no longer the bar's. Ctrl or ⌘ + Z, Y, Shift + Z and S are keys of the action table, read by
 *   core/keys.ts from the page's one keydown listener (shell/App.tsx): `pressed()` holds the rules that this bar's
 *   listener held in slice 1, unchanged (where Undo and Redo act, Save's default always prevented, nothing behind a
 *   modal dialog, Save not repeating).
 */
export function TopBar({ session, onOpen, onAbout }: TopBarProps): JSX.Element {
  const subscribe = useCallback((tell: () => void) => (session ? session.listen(tell) : () => {}), [session]);
  // One snapshot, a string so equal states compare equal: unsaved, the newest step's words, the newest undone's.
  const key = useSyncExternalStore(subscribe, () => {
    if (!session) return '';
    const { steps, undone } = session.history;
    return JSON.stringify([session.unsaved, steps.length ? steps[steps.length - 1].what : null, undone.length ? undone[undone.length - 1].what : null]);
  });
  const [unsaved, undoWhat, redoWhat] = (key ? JSON.parse(key) : [false, null, null]) as [boolean, string | null, string | null];
  const fileName = session ? `${session.name}${unsaved ? ' •' : ''}` : '';

  const action = (id: ActionId, tip: string, icon: ReactElement, enabled: boolean, onClick?: () => void) => (
    <Tooltip key={id} title={tip}>
      {/* A disabled button gets no pointer events, so its tooltip hangs on a span around it. */}
      <span style={{ display: 'inline-flex' }}>
        <IconButton
          data-testid={id}
          aria-label={LABELS[id]}
          disabled={!enabled}
          onClick={onClick}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );

  return (
    <Box
      component="header"
      data-testid="top-bar"
      sx={{
        height: BAR_HEIGHT, flex: 'none', display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, boxSizing: 'border-box', overflow: 'hidden', whiteSpace: 'nowrap', bgcolor: INK, color: WHITE,
        // Every icon button of the bar, its own and an ActionButton's alike: white on the ink, and the keyboard's
        // focus as a white ring inside the button.
        '& .MuiIconButton-root': {
          color: WHITE,
          '&.Mui-disabled': { color: BAR_DISABLED },
          '&.Mui-focusVisible': { outline: `${FOCUS_WIDTH}px solid ${WHITE}`, outlineOffset: -FOCUS_WIDTH },
        },
      }}
    >
      <Typography component="span" sx={{ fontWeight: 500, flex: 'none', mr: 1.5 }}>Grasp</Typography>
      <Typography
        component="span"
        data-testid="file-name"
        title={session ? session.name : undefined}
        sx={{ minWidth: 0, flex: '0 1 auto', overflow: 'hidden', textOverflow: 'ellipsis', mr: 1.5 }}
      >
        {fileName}
      </Typography>
      {action('open', 'Open a file', <FolderOpenOutlined fontSize="small" />, true, onOpen)}
      {session && unsaved
        ? <ActionButton session={session} action="save" icon={<SaveOutlined fontSize="small" />} testId="save" />
        : action('save', 'Save', <SaveOutlined fontSize="small" />, false)}
      {session
        ? <ActionButton session={session} action="undo" icon={<Undo fontSize="small" />} label={undoWhat ? `Undo ${undoWhat}` : undefined} testId="undo" />
        : action('undo', 'Undo', <Undo fontSize="small" />, false)}
      {session
        ? <ActionButton session={session} action="redo" icon={<Redo fontSize="small" />} label={redoWhat ? `Redo ${redoWhat}` : undefined} testId="redo" />
        : action('redo', 'Redo', <Redo fontSize="small" />, false)}
      {session ? <ActionButton session={session} action="open-text" icon={<ArticleOutlined fontSize="small" />} /> : null}
      <Box sx={{ flex: '1 0 0', minWidth: 0 }} />
      {action('about', 'About Grasp', <InfoOutlined fontSize="small" />, true, onAbout)}
    </Box>
  );
}
