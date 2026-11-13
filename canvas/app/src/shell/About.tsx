// The About panel: what this browser lets the page do, and the libraries the page is built on (plan/slice-1.md,
// section 2, "What About reports", and step 12; plan/swarm/step-12.md). Until step 12 builds it, it shows nothing, and
// the bar's About button stays disabled. App renders it once and holds whether it is open.
//
// The questions, their words and the order of the asking are the probe's (core/probe.ts); this file draws the
// probe's lines and the libraries in a dialog. It is also where React Flow is credited, whose mark the planes hide
// (plan/slice-1.md, section 7, Damon's choice 1), and where the notices file is named.

export interface AboutProps {
  /** Whether the panel is shown. */
  open: boolean;
  /** Called when the person closes it. */
  onClose: () => void;
}

/** The panel's title, which is also the name of the dialog and of the bar's button (TopBar.tsx, ACTIONS). */
export const ABOUT_TITLE = 'About Grasp';
/** The sentence under the title, and the two parts' titles. */
export const ABOUT_INTRO = 'What this browser lets the page do, and what the page is built on.';
export const BROWSER_TITLE = 'This browser';
export const LIBRARIES_TITLE = 'Libraries';
/** The button that remembers a folder's handle, and the one that closes the panel. */
export const REMEMBER_LABEL = 'Remember a folder…';
export const CLOSE_LABEL = 'Close';
/** Where React Flow is credited, and the notices file, which the build writes beside the page. */
export const REACT_FLOW_URL = 'https://reactflow.dev';
export const NOTICES_FILE = 'THIRD-PARTY-NOTICES.txt';

/**
 * The About panel. Step 12 builds it; until then it renders nothing.
 *
 * Step 12 replaces the body below with this contract (plan/swarm/step-12.md has the same as a table for the tests).
 *
 * - **The dialog.** A Material UI Dialog, `open` as given, `maxWidth="md"` and `fullWidth`, so 900 px wide in a
 *   window of 1400. Its paper, the element with role "dialog" and aria-modal "true", carries
 *   `data-testid="about-panel"` (`slotProps={{ paper: { 'data-testid': 'about-panel' } as object }}`: the cast is
 *   needed, since the slot's type names no data attribute). Its DialogTitle is ABOUT_TITLE, which names the dialog.
 *   While `open` is false nothing of it is in the document, and nothing is asked.
 * - **Closing.** The button CLOSE_LABEL in the DialogActions, Escape, and a click outside the paper each call
 *   `onClose` (the Dialog's own onClose for the last two). The bar's keys do nothing while it is up: TopBar.tsx
 *   heeds any element with role "dialog" and aria-modal "true".
 * - **The probe.** One probe for the page, made at the first opening and kept by this module:
 *   `createProbe(browserEnv())`. Nothing is made or asked when the page loads. Each time `open` turns true,
 *   `probe.ask()` is called, in a layout effect of this component, so the first frame of the dialog already shows
 *   the round's lines. `lines = useSyncExternalStore(probe.listen, () => probe.lines)`, in a component that is
 *   rendered only inside the Dialog, so that the hook needs no probe before the first opening.
 * - **The content**, in a DialogContent with dividers: ABOUT_INTRO, 12 px, in the secondary colour; then two parts
 *   side by side, the first three fifths wide and the second two fifths (a grid, `gridTemplateColumns: { xs: '1fr',
 *   md: '3fr 2fr' }`, with a gap of 24 px), one under the other in a window narrower than 900 px.
 * - **The first part**, under BROWSER_TITLE (13 px medium): the thirteen lines, in order. Each line is one element
 *   that carries `data-line` (the line's id) and `data-state` (its state), and holds the line's label in an element
 *   with the class `grasp-about-label`, in the secondary colour, in a column 170 px wide, and its value in an
 *   element with the class `grasp-about-value`, which wraps. Before the label, a mark 8 px across with the class
 *   `grasp-about-mark`: a filled teal dot for 'yes' (`primary.main`), an ink ring for 'no' (a 2 px border in
 *   `text.primary`, no fill), a filled dot in the secondary colour for 'told', and a Material UI CircularProgress
 *   of 10 px for 'pending'. The value of a 'no' line is 13 px medium. Under the lines, the button REMEMBER_LABEL
 *   (`data-testid="about-remember"`, a small outlined Button), which calls `probe.remember()` straight from its
 *   click and is disabled unless the `folder-picker` line's state is 'yes'.
 * - **The second part**, under LIBRARIES_TITLE: one row for each of the probe's LIBRARIES, in their order, carrying
 *   `data-library` (the package's name) and holding the name, the version and the licence, each in an element of
 *   its own with the class `grasp-about-library-name`, `-version`, `-licence`. Then two sentences, 12 px:
 *   `data-testid="about-react-flow"`: "The planes are drawn with React Flow (@xyflow/react).", in which the words
 *   "React Flow" are a link to REACT_FLOW_URL; and `data-testid="about-notices"`: "Every library's licence is in
 *   THIRD-PARTY-NOTICES.txt, beside the page.", in which the file's name is a link whose `href` is NOTICES_FILE.
 *   Both links have `target="_blank"` and `rel="noopener noreferrer"`. A link asks for nothing until it is clicked.
 * - **Colours and sizes** come from the theme, given in `sx`; the panel has no stylesheet of its own and names no
 *   colour.
 */
export function About(_props: AboutProps): JSX.Element | null {
  return null;
}
