// The bar across the top of the window (data-testid "top-bar"), in place of the old page's header: one row of 40 px
// at any width, ink with white text. It holds the name Grasp, the open file's name with a dot while it has unsaved
// changes, the icon buttons Open, Save, Undo and Redo, and About at the right end. No tools, no text buttons, no
// second row (shell.test.mjs, "no header palette or button row exists").

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
import type { Session } from '../core';
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
 * - Save, Undo and Redo are disabled until step 7; About until step 12. Open calls `onOpen` (from a click, so the
 *   browser opens its picker or the file input's dialog).
 */
export function TopBar({ session, onOpen }: TopBarProps): JSX.Element {
  const subscribe = useCallback((tell: () => void) => (session ? session.listen(tell) : () => {}), [session]);
  const unsaved = useSyncExternalStore(subscribe, () => (session ? session.unsaved : false));
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
          sx={{
            color: WHITE,
            '&.Mui-disabled': { color: BAR_DISABLED },
            '&.Mui-focusVisible': { outline: `${FOCUS_WIDTH}px solid ${WHITE}`, outlineOffset: -FOCUS_WIDTH },
          }}
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
      sx={{ height: BAR_HEIGHT, flex: 'none', display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, boxSizing: 'border-box', overflow: 'hidden', whiteSpace: 'nowrap', bgcolor: INK, color: WHITE }}
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
      {action('save', 'Save', <SaveOutlined fontSize="small" />, false)}
      {action('undo', 'Undo', <Undo fontSize="small" />, false)}
      {action('redo', 'Redo', <Redo fontSize="small" />, false)}
      <Box sx={{ flex: '1 0 0', minWidth: 0 }} />
      {action('about', 'About Grasp', <InfoOutlined fontSize="small" />, false)}
    </Box>
  );
}
