// The Tools panel, a side panel of the dock (plan/slice-1.md, step 11; plan/swarm/step-11.md). Until step 11
// builds it, it is the empty state the shell has shown since step 5. The dock renders ToolsPanel as the body of the
// panel 'tools' (shell/Dock.tsx, COMPONENTS); it reads the open file, and what else the dock hands on, through useDock()
// (shell/dockContext.ts), and is put into the dock inside SidePanel (panels/SidePanel.tsx).

import { Box, Divider, ToggleButton, Tooltip } from '@mui/material';
import { useSyncExternalStore } from 'react';
import { hasReader, selectionOf, toolGroups, toolsOf, TOOL_TITLE, viewsOf } from '../core';
import type { Session } from '../core';
import { useDock } from '../shell/dockContext';
import { FONT_SIZE, SMALL_FONT_SIZE, TEAL, TEAL_SOFT } from '../shell/theme';
import { SidePanel, SideText } from './SidePanel';

/** What the panel says while it has no tools to list. `an` is the view kind's label with its article: 'A sequence view'. */
export const TOOLS_TEXT = {
  noFile: "Open a model to see its views' tools.",
  noView: "No view is in front. Click a view's tab to see its tools.",
  notDrawn: (an: string): string => `${an} has no tools here yet. The old page draws it until slice 2.`,
  none: (an: string): string => `${an} has no tools.`,
} as const;

/** How high a tool's row is, in px: the dense row of plan/slice-1.md, section 4. */
export const TOOL_ROW = 28;

/**
 * The panel's body. It takes no props: the dock makes it once and keeps it mounted while its tab is hidden, so it
 * renders with no file open and follows the file when another is opened. Step 11 builds this contract; until then
 * the body below is what the page shows.
 *
 * **What it reads**, each through useSyncExternalStore, so that it renders again when any of them changes: the open
 * file (useDock().session); the view in front, selectionOf(session).view (core/selection.ts, which the dock tells);
 * that view's name and kind, through viewsOf(session) (core/session.ts, with session.listen); and the tool in hand, toolsOf(session) (core/commands.ts:
 * `armed`, `hint`). It keeps no tool of its own: the tool in hand is the session's, so it is still in hand when the
 * panel was hidden and is shown again, and gone when another file is opened.
 *
 * **What it shows**, always inside `<SidePanel testId="tools" title="Tools">`:
 * 1. With no file open: SideText, TOOLS_TEXT.noFile.
 * 2. With a file and no view in front (`selection.view` is null: every tab is closed, or the view left the model):
 *    SideText, TOOLS_TEXT.noView.
 * 3. With a view in front of a kind no body draws yet (hasReader() of the core is false: a sequence, geometry, grid or
 *    browser view): SideText, TOOLS_TEXT.notDrawn(lib.an(the kind's label, true)), as 'A sequence view has no tools
 *    here yet. The old page draws it until slice 2.' No tool is listed, whatever the library's row holds.
 * 4. With a view in front that a plane draws and whose toolGroups() is empty (no kind is so today): SideText,
 *    TOOLS_TEXT.none(...).
 * 5. Otherwise, from the top:
 *    - **The view's title** (data-testid "tools-view"), in 12 px secondary text: `<name> : <kind>`, as the view's tab
 *      is titled (shell/Dock.tsx, viewTitle; written out here, since a panel does not import the dock). It follows the
 *      name as it is typed into Details.
 *    - **The list** (data-testid "tool-list", role "group", aria-label "Tools"): the tools of
 *      toolGroups(session.lib, the view's kind), top to bottom, in the row's order, one button a tool, and between
 *      two groups a rule: a Material UI Divider (role "separator"). Nothing else is a child of the list, so its
 *      buttons and separators, read in order, are the kind's `tools` row with its '|'.
 *    - **The hint** (data-testid "tool-hint"), only while a tool is in hand: `tools.hint`, in 12 px secondary text,
 *      under the list. With no tool in hand the element is not in the document.
 *
 * **A tool's button** is a Material UI ToggleButton, which is a `<button>` and carries `aria-pressed` itself:
 * - data-testid "tool" and data-tool, the tool's kind ('PartDefinition').
 * - Its words are the tool's label ('part def'), which is also its accessible name; it has no aria-label and no icon
 *   (icons come in slice 7).
 * - `aria-pressed` is "true" while its tool is in hand (`tools.armed?.kind` is its kind) and "false" otherwise. The
 *   pressed button is teal on the soft teal (TEAL on TEAL_SOFT of shell/theme.ts), as the strip marks the view that
 *   is shown.
 * - It is as wide as the panel, TOOL_ROW (28 px) high, its words at the left in 13 px, not in capitals, with no
 *   border.
 * - Its tooltip is TOOL_TITLE of its kind (core/commands.ts), in a Material UI Tooltip at its right with
 *   `describeChild`, so that the tooltip describes the button and does not take the place of its name. A kind with no
 *   title has no tooltip.
 * - A click calls `toolsOf(session).arm(kind)`: it takes the tool in hand, a click on the pressed button puts it
 *   down, and a click on another takes that one in hand instead. The focus stays on the button.
 * - **The keyboard.** The buttons are in the page's tab order, top to bottom, and Enter or Space on one is a click
 *   on it, as for any button. There is no moving by the arrow keys.
 *
 * **Escape puts the tool down**, and it is no longer the panel's key. From slice 2 Escape is the key of the action
 * `put-down` (core/actions/file.ts), read by core/keys.ts from the page's one keydown listener (shell/App.tsx): it
 * calls off a gesture in progress, or puts the tool in hand down, or lets go of what is picked, the first of the
 * three there is something for. It does nothing from a text field and nothing behind a modal dialog, and it neither
 * stops the key nor keeps an open palette from closing, as the panel's own listener did in slice 1.
 */
export function ToolsPanel(): JSX.Element {
  const { session } = useDock();
  return (
    <SidePanel testId="tools" title="Tools">
      {session ? <Body session={session} /> : <SideText>{TOOLS_TEXT.noFile}</SideText>}
    </SidePanel>
  );
}

function Body({ session }: { session: Session }): JSX.Element {
  const selection = selectionOf(session);
  const tools = toolsOf(session);
  const viewId = useSyncExternalStore(selection.listen, () => selection.view);
  const armed = useSyncExternalStore(tools.listen, () => tools.armed);
  const hint = useSyncExternalStore(tools.listen, () => tools.hint);
  // The views are read through viewsOf (core/session.ts): the same array until a view comes, goes or is renamed, so
  // a rename renders again and nothing else of the model does.
  const views = useSyncExternalStore(session.listen, () => viewsOf(session));
  const view = viewId === null ? undefined : views.find((one) => one.id === viewId);
  if (!view) return <SideText>{TOOLS_TEXT.noView}</SideText>;
  const lib = session.lib;
  const an = lib.an(lib.VIEW_KINDS[view.kind]?.label ?? view.kind, true);
  if (!hasReader(lib, view.kind)) return <SideText>{TOOLS_TEXT.notDrawn(an)}</SideText>;
  const groups = toolGroups(lib, view.kind);
  if (groups.length === 0) return <SideText>{TOOLS_TEXT.none(an)}</SideText>;

  const children: JSX.Element[] = [];
  groups.forEach((group, g) => {
    if (g > 0) children.push(<Divider key={`rule-${g}`} component="div" sx={{ my: 0.5 }} />);
    for (const tool of group) {
      const title = TOOL_TITLE[tool.kind];
      const button = (
        <ToggleButton
          key={tool.kind}
          value={tool.kind}
          data-testid="tool"
          data-tool={tool.kind}
          selected={armed?.kind === tool.kind}
          aria-pressed={armed?.kind === tool.kind}
          onClick={() => tools.arm(tool.kind)}
          sx={{
            width: '100%', height: TOOL_ROW, minHeight: TOOL_ROW, justifyContent: 'flex-start', px: 1.5, py: 0,
            border: 0, borderRadius: 0, textTransform: 'none', fontSize: FONT_SIZE, flex: 'none',
            '&.Mui-selected, &.Mui-selected:hover': { color: TEAL, bgcolor: TEAL_SOFT },
          }}
        >
          {tool.label}
        </ToggleButton>
      );
      children.push(title
        ? <Tooltip key={tool.kind} title={title} placement="right" describeChild>{button}</Tooltip>
        : button);
    }
  });

  return (
    <>
      <Box data-testid="tools-view" sx={{ fontSize: SMALL_FONT_SIZE, color: 'text.secondary', px: 1.5, py: 0.75 }}>
        {`${view.name} : ${view.kind}`}
      </Box>
      <Box data-testid="tool-list" role="group" aria-label="Tools" sx={{ display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
      {armed && hint ? (
        <Box data-testid="tool-hint" sx={{ fontSize: SMALL_FONT_SIZE, color: 'text.secondary', px: 1.5, py: 0.75 }}>{hint}</Box>
      ) : null}
    </>
  );
}
