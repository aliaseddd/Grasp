// The card the editor shows when it holds no tab (Dockview's watermark): "Open a model", a button that opens a file,
// and one line saying where the example and the blank model are. With a file open whose tabs were all closed, it also
// offers to show the views again.
//
// Skeleton: the props are final; the component is the implementer's.

export interface EmptyCardProps {
  /** The open file's name, or null when no file is open. */
  fileName: string | null;
  /** Opens a file, as the bar's Open does. */
  onOpen: () => void;
  /** With a file open: shows its views' tabs again. Absent when no file is open. */
  onShowViews?: () => void;
}

/**
 * The card. Its contract:
 *
 * - Centred in the editor's area, white on the ground, Roboto.
 * - The title "Open a model". Its button is named "Open a file…", never "Open", and carries no data-testid "open":
 *   the bar's is the page's only one (helpers.mjs, openStateFile, counts them).
 * - The line: "The example is canvas/examples/stronghold-proof.json, and the blank model canvas/state.json."
 * - With `fileName` and `onShowViews`: "All of <fileName>'s views are closed." and a button "Show the views again".
 */
export function EmptyCard(_props: EmptyCardProps): JSX.Element {
  throw new Error('EmptyCard: not built yet (step 5).');
}
