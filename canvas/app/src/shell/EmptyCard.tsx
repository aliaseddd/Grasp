// The card the editor shows when it holds no tab (Dockview's watermark): "Open a model", a button that opens a file,
// and one line saying where the example and the blank model are. With a file open, it also says how many of its views
// are closed and offers to show them again.

import { Button, Paper, Stack, Typography } from '@mui/material';

export interface EmptyCardProps {
  /**
   * The open file, or null when none is: its name, how many views it has, and how many of them are closed, that is,
   * have no tab anywhere. A view that is not closed floats over the editor, or the card would not be showing.
   */
  file: { name: string; views: number; closed: number } | null;
  /** Opens a file, as the bar's Open does. */
  onOpen: () => void;
  /** Gives the closed views their tabs again, in the editor. */
  onShowViews: () => void;
}

/**
 * The card. Its contract:
 *
 * - Centred in the editor's area, white on the ground, Roboto.
 * - The title "Open a model". Its button is named "Open a file…", never "Open", and carries no data-testid "open":
 *   the bar's is the page's only one (helpers.mjs, openStateFile, counts them).
 * - The line: "The example is canvas/examples/stronghold-proof.json, and the blank model canvas/state.json."
 * - With a file, what is true of its views: "All of <name>’s views are closed."; or, when some float over the editor,
 *   "2 of <name>’s 3 views are closed; the others float over the editor."; or, when none is closed, "<name>’s views
 *   float over the editor." The button "Show the views again" is there while a view is closed.
 */
export function EmptyCard({ file, onOpen, onShowViews }: EmptyCardProps): JSX.Element {
  return (
    <div className="grasp-card-ground">
      <Paper variant="outlined" className="grasp-card" sx={{ p: 3, maxWidth: 440 }}>
        <Typography component="h2" sx={{ fontSize: 16, fontWeight: 500 }}>Open a model</Typography>
        <Stack spacing={1.5} sx={{ mt: 1.5, alignItems: 'flex-start' }}>
          <Typography sx={{ color: 'text.secondary' }}>
            The example is canvas/examples/stronghold-proof.json, and the blank model canvas/state.json.
          </Typography>
          <Button variant="contained" size="small" disableElevation onClick={onOpen}>Open a file…</Button>
          {file !== null && (
            <>
              <Typography sx={{ color: 'text.secondary' }}>{viewsLine(file)}</Typography>
              {file.closed > 0 && <Button variant="outlined" size="small" onClick={onShowViews}>Show the views again</Button>}
            </>
          )}
        </Stack>
      </Paper>
    </div>
  );
}

function viewsLine({ name, views, closed }: { name: string; views: number; closed: number }): string {
  if (closed === 0) return `${name}’s views float over the editor.`;
  if (closed >= views) return `All of ${name}’s views are closed.`;
  return `${closed} of ${name}’s ${views} views ${closed === 1 ? 'is' : 'are'} closed; the others float over the editor.`;
}
