// The bar across the top of the window (data-testid "top-bar"), in place of the old page's header: one row of 40 px
// at any width, ink with white text. It holds the name Grasp, the open file's name with a dot while it has unsaved
// changes, the icon buttons Open, Save, Undo and Redo, and About at the right end. No tools, no text buttons, no
// second row (shell.test.mjs, "no header palette or button row exists").

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
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
/** Input types that take no typing: their own undo is not meant, so the bar's keys act from them. */
const NON_TEXT_INPUT = ['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'file', 'color', 'image'];

export interface TopBarProps {
  /** The open file, or null: its name shows in data-testid "file-name", then a dot while `session.unsaved`. */
  session: Session | null;
  /** Called by Open. */
  onOpen: () => void;
  /** Called by Save and by Ctrl or ⌘ + S (step 7). */
  onSave: () => void;
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
 * - **Save, Undo, Redo** (step 7). Save is enabled while a file is open and `session.unsaved`, and calls `onSave`.
 *   Undo is enabled while the history has a step (`history.steps`), Redo while it has one undone
 *   (`history.undone`); each calls the history's undo() or redo(). Undo's tooltip names the step it takes back,
 *   "Undo Moved part def Host", and Redo's the step it makes again, "Redo Moved part def Host"; with none, "Undo" and
 *   "Redo". All three re-read through `session.listen`.
 * - **The keys** (step 7), on the window, for the open file: Ctrl or ⌘ + Z undoes; Ctrl or ⌘ + Y, and Ctrl or ⌘ +
 *   Shift + Z, redo; Ctrl or ⌘ + S saves (onSave) whether or not anything is unsaved, and the browser's own Save is
 *   always prevented, with a file open or not. Undo and Redo by key act unless the event comes from a text field
 *   (an input, a textarea, or anything contenteditable), where the field's own undo is meant; Save acts from
 *   anywhere. **Step 10** (plan/swarm/step-10.md) makes "a text field" exact, since Details brings the page's first
 *   checkboxes and radio buttons, which are inputs that take no typing: the keys do not act when the event's target
 *   is a textarea, a select, anything contenteditable, or an input whose `type` is none of checkbox, radio, button,
 *   submit, reset, range, file, color and image; from any other target they act. So with the focus left on a
 *   checkbox that was just ticked, Ctrl or ⌘ + Z takes the tick back. **Step 10's review** adds one exception to "a text
 *   field": a field inside an element that carries the attribute `data-history-keys` (the form of Details) is not
 *   one for these keys, which act from it, since the browser's own undo, one stack for the page's text fields, made an
 *   earlier typing a new change and took no pick back. A key that acts prevents the browser's default. Holding Undo's or Redo's key down does one thing per
 *   repeat; holding Save's saves once, at the press, since each save without a picked file is a download of its own.
 *   While the page shows a modal dialog (an element with role "dialog" and aria-modal "true": the question before
 *   Open) the keys change nothing behind it: no undo, no redo, no save. Save's default is prevented then too.
 */
export function TopBar({ session, onOpen, onSave, onAbout }: TopBarProps): JSX.Element {
  const subscribe = useCallback((tell: () => void) => (session ? session.listen(tell) : () => {}), [session]);
  // One snapshot, a string so equal states compare equal: unsaved, the newest step's words, the newest undone's.
  const key = useSyncExternalStore(subscribe, () => {
    if (!session) return '';
    const { steps, undone } = session.history;
    return JSON.stringify([session.unsaved, steps.length ? steps[steps.length - 1].what : null, undone.length ? undone[undone.length - 1].what : null]);
  });
  const [unsaved, undoWhat, redoWhat] = (key ? JSON.parse(key) : [false, null, null]) as [boolean, string | null, string | null];
  const fileName = session ? `${session.name}${unsaved ? ' •' : ''}` : '';
  const undo = () => session?.history.undo();
  const redo = () => session?.history.redo();

  // The keys, registered here once per session; the handler reads the latest onSave through a ref.
  const saving = useRef(onSave);
  saving.current = onSave;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
      const k = event.key.toLowerCase();
      // A question in front of the page is answered first: the keys are not the file's while it is up.
      const modal = document.querySelector('[role="dialog"][aria-modal="true"]') !== null;
      if (k === 's') {
        event.preventDefault();
        if (session && !event.repeat && !modal) saving.current();
        return;
      }
      if (!session || modal || !(k === 'z' || k === 'y')) return;
      const target = event.target as HTMLElement | null;
      // A field of Details (inside an element with data-history-keys) holds what the history holds, so its own undo
      // would be a second one: from there the keys are the history's.
      const ours = target !== null && target.closest('[data-history-keys]') !== null;
      if (!ours && target && (target.isContentEditable || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return;
      if (!ours && target && target.tagName === 'INPUT' && !NON_TEXT_INPUT.includes((target as HTMLInputElement).type)) return;
      event.preventDefault();
      if (k === 'y' || event.shiftKey) session.history.redo();
      else session.history.undo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [session]);

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
      {action('save', 'Save', <SaveOutlined fontSize="small" />, unsaved, onSave)}
      {action('undo', undoWhat ? `Undo ${undoWhat}` : 'Undo', <Undo fontSize="small" />, undoWhat !== null, undo)}
      {action('redo', redoWhat ? `Redo ${redoWhat}` : 'Redo', <Redo fontSize="small" />, redoWhat !== null, redo)}
      <Box sx={{ flex: '1 0 0', minWidth: 0 }} />
      {action('about', 'About Grasp', <InfoOutlined fontSize="small" />, true, onAbout)}
    </Box>
  );
}
