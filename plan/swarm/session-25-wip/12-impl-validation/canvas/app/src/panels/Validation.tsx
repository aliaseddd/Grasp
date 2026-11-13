// The Validation panel, a side panel of the dock (plan/slice-1.md, section 2, "What Validation lists", and step 12;
// plan/swarm/step-12.md). Until step 12 builds it, it is the empty state the shell has shown since step 5. The dock
// renders ValidationPanel as the body of the panel 'validation' (shell/Dock.tsx, COMPONENTS); it reads the open
// file, and what else the dock hands on, through useDock() (shell/dockContext.ts), and is put into the dock inside
// SidePanel (panels/SidePanel.tsx).
//
// It lists what the session's checks found (core/checks.ts, which says when they run): Grasp's own problems, and
// the diagnostics of the SysML v2 specification's rules, each in SysON's words. A click on an entry picks what the
// entry is about, through the session's selection (core/selection.ts). It is the old page's Validation view and its
// list of problems (canvas/src/validation/page.js; core/page/panel.js, nextProblem), ported. It draws no badge on
// a plane: badges are slice 2's.

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Box, ListItemButton } from '@mui/material';
import { aboutDiagnostic, aboutProblem, checksOf, selectionOf } from '../core';
import type { EntryAbout, PickedType, Session } from '../core';
import { useDock } from '../shell/dockContext';
import { SidePanel, SideText } from './SidePanel';

/** What the panel says while no file is open. */
export const NO_FILE = 'No file is open.';
/** The two lists' titles, and what each says while it has no entry. */
export const PROBLEMS_TITLE = "Grasp's problems";
export const RULES_TITLE = "The specification's rules";
export const NO_PROBLEMS = 'No problems found.';
export const NO_RULES = 'No rule is broken.';
/** How many validation rules the SysML v2 specification has (canvas/src/validation/lib.js counts them). */
export const SPEC_RULE_COUNT = 388;
/** The note under the rules' title, the old page's, with Grasp for "the canvas": `checked` is the library's SPEC_RULES.length, 15. */
export const rulesNote = (checked: number): string =>
  `The SysML v2 specification's validation rules that Grasp can check, as SysON runs them: ${checked} of its ${SPEC_RULE_COUNT}. ` +
  "The others are met by any text Grasp writes, or are about what it doesn't make.";

/**
 * The panel's body. It takes no props: the dock makes it once and keeps it mounted while its tab is hidden.
 *
 * Step 12 replaces the body below with this contract (plan/swarm/step-12.md has the same as a table for the tests).
 *
 * - **The frame.** `<SidePanel testId="validation" title="Validation">`, and inside it one element of the panel's
 *   own, a `div` with the class `grasp-validation`, which is always there and holds everything else.
 * - **With no file** (`useDock().session` is null): SideText with NO_FILE in that div, and nothing else.
 * - **The gate.** A side panel stays mounted while its tab is hidden and while its side is collapsed: its element is
 *   then out of the document, or laid out at 0 by 0. The panel listens to the checks only while it is shown, so that
 *   a hidden panel costs nothing (core/checks.ts says why). A ResizeObserver on the div, as Plane.tsx has one on its
 *   root: while the div's content box is wider than 0 the panel is shown, and the lists (an inner component) are
 *   mounted; at 0 they are not, and the div is empty. The width is also read at once, in a layout effect, so a
 *   panel that is in front shows its lists without waiting for the observer.
 * - **The lists**, mounted while a file is open and the panel is shown, and for that session (another session
 *   listens to its own checks): `state = useSyncExternalStore(checks.listen, () => checks.state)` with `checks =
 *   checksOf(session)`. So the checks run at once when the panel is first shown, when a file is opened while it is
 *   shown, and when it is shown again after changes; 0.8 s after the last change made while it is shown; and at
 *   once after an undo or a redo. The inner component renders one `div` with the class `grasp-validation-lists`,
 *   which carries `data-stale` ("true" or "false", from `state.stale`) and `aria-busy` the same, is drawn at 60%
 *   opacity while stale, and holds the two lists: they stay as the last result has them until the next comes. With
 *   no result yet (`state.found` null, for the one render before the listening begins) it holds nothing.
 * - **A list** is a `section` with `data-list` ("problems", then "rules") and `data-count` (the number of its
 *   entries). It begins with a title row: the title (PROBLEMS_TITLE, RULES_TITLE) in an element with the class
 *   `grasp-validation-title`, 13 px medium, and the count in one with the class `grasp-validation-count`, in the
 *   secondary colour. The rules' list has, under its title row, rulesNote(session.lib.SPEC_RULES.length) in an
 *   element with the class `grasp-validation-note`, 12 px, secondary. Then the entries, in the order the result
 *   has them; or, with none, the list's sentence (NO_PROBLEMS, NO_RULES) in an element with the class
 *   `grasp-validation-none`, secondary.
 * - **An entry** carries `data-entry`, "<type>:<id>" from the entry's EntryAbout (aboutProblem, aboutDiagnostic of
 *   core/checks.ts, with the session's model): "el:App", "rel:s-DevHost", "view:v-proof", "package:" for the
 *   package, "none:<id>" for what the model no longer holds. Its text is the problem's `message`, 13 px, or the
 *   diagnostic's `text`, SysON's label, 12 px; the text may break anywhere (`overflow-wrap: anywhere`), since
 *   SysON's label has no spaces where it is long. The entry holds nothing but that text.
 * - **A click on an entry** whose `pick` is not empty calls `selectionOf(session).set(pick)`, and nothing else: no
 *   tab is opened or brought forward and no camera moves. Such an entry is a button (MUI's ListItemButton: role
 *   "button", in the tab order, Enter and Space click it). An entry whose `pick` is empty (the package, 'none') is
 *   no button and takes no click.
 * - **The entry of what is picked.** An entry whose `type` and `id` the selection holds
 *   (`selectionOf(session).has(type, id)`, re-read through the selection's `listen`) carries `aria-current="true"`
 *   and MUI's selected look; the others carry no `aria-current`.
 * - **Colours and sizes** come from the theme (`text.secondary`, `divider`, `primary`), given in `sx`; the panel has
 *   no stylesheet of its own and names no colour.
 */
export function ValidationPanel(): JSX.Element {
  const { session } = useDock();
  const root = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !session) { setShown(false); return undefined; }
    setShown(el.clientWidth > 0);
    const observer = new ResizeObserver((entries) => {
      const next = entries[entries.length - 1].contentRect.width > 0;
      setShown((was) => (was === next ? was : next));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [session]);

  return (
    <SidePanel testId="validation" title="Validation">
      <div ref={root} className="grasp-validation">
        {session ? (shown ? <Lists session={session} /> : null) : <SideText>{NO_FILE}</SideText>}
      </div>
    </SidePanel>
  );
}

const TITLE_ROW = { display: 'flex', alignItems: 'baseline', gap: 1, px: 1.5, pt: 1.5, pb: 0.5 } as const;
const SECONDARY = { color: 'text.secondary' } as const;

function Lists({ session }: { session: Session }): JSX.Element {
  const checks = checksOf(session);
  const state = useSyncExternalStore(checks.listen, () => checks.state);
  const found = state.found;
  return (
    <div
      className="grasp-validation-lists"
      data-stale={state.stale ? 'true' : 'false'}
      aria-busy={state.stale ? 'true' : 'false'}
      style={{ opacity: state.stale ? 0.6 : 1 }}
    >
      {found ? (
        <>
          <List
            session={session} name="problems" title={PROBLEMS_TITLE} none={NO_PROBLEMS}
            entries={found.problems.map((p) => ({ text: p.message, about: aboutProblem(session.model, p), size: 13 }))}
          />
          <List
            session={session} name="rules" title={RULES_TITLE} none={NO_RULES}
            note={rulesNote(session.lib.SPEC_RULES.length)}
            entries={found.diagnostics.map((d) => ({ text: d.text, about: aboutDiagnostic(session.model, d), size: 12 }))}
          />
        </>
      ) : null}
    </div>
  );
}

interface Entry { text: string; about: EntryAbout; size: number }

function List({ session, name, title, none, note, entries }: {
  session: Session; name: string; title: string; none: string; note?: string; entries: Entry[];
}): JSX.Element {
  const selection = selectionOf(session);
  // Re-read at each change of the selection: items is a new array then.
  useSyncExternalStore(selection.listen, () => selection.items);
  return (
    <section data-list={name} data-count={entries.length}>
      <Box sx={TITLE_ROW}>
        <Box className="grasp-validation-title" sx={{ fontSize: 13, fontWeight: 500 }}>{title}</Box>
        <Box className="grasp-validation-count" sx={{ fontSize: 12, ...SECONDARY }}>{entries.length}</Box>
      </Box>
      {note ? <Box className="grasp-validation-note" sx={{ fontSize: 12, px: 1.5, pb: 0.5, ...SECONDARY }}>{note}</Box> : null}
      {entries.length === 0 ? (
        <Box className="grasp-validation-none" sx={{ fontSize: 13, px: 1.5, py: 0.5, ...SECONDARY }}>{none}</Box>
      ) : entries.map((entry, i) => {
        const { about } = entry;
        const sx = { fontSize: entry.size, overflowWrap: 'anywhere', px: 1.5, py: 0.5 } as const;
        const key = `${i}:${about.type}:${about.id}`;
        const data = `${about.type}:${about.id}`;
        if (about.pick.length === 0) {
          return <Box key={key} data-entry={data} sx={sx}>{entry.text}</Box>;
        }
        const current = selection.has(about.type as PickedType, about.id);
        return (
          <ListItemButton
            key={key} data-entry={data} selected={current} aria-current={current ? 'true' : undefined}
            onClick={() => selection.set(about.pick)} sx={sx}
          >
            {entry.text}
          </ListItemButton>
        );
      })}
    </section>
  );
}
