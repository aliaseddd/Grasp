// The card the editor shows when it holds no tab (Dockview's watermark): "Open a model", a button that opens a file,
// and one line saying where the example and the blank model are. With a file open whose tabs were all closed, it also
// offers to show the views again.
//
// Skeleton: the props are final; the component is the implementer's.

import { Button, Paper, Stack, Typography } from '@mui/material';

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
export function EmptyCard({ fileName, onOpen, onShowViews }: EmptyCardProps): JSX.Element {
  return (
    <div className="grasp-card-ground">
      <Paper variant="outlined" className="grasp-card" sx={{ p: 3, maxWidth: 440 }}>
        <Typography component="h2" sx={{ fontSize: 16, fontWeight: 500 }}>Open a model</Typography>
        <Stack spacing={1.5} sx={{ mt: 1.5, alignItems: 'flex-start' }}>
          <Typography sx={{ color: 'text.secondary' }}>
            The example is canvas/examples/stronghold-proof.json, and the blank model canvas/state.json.
          </Typography>
          <Button variant="contained" size="small" disableElevation onClick={onOpen}>Open a file…</Button>
          {fileName !== null && onShowViews && (
            <>
              <Typography sx={{ color: 'text.secondary' }}>All of {fileName}&rsquo;s views are closed.</Typography>
              <Button variant="outlined" size="small" onClick={onShowViews}>Show the views again</Button>
            </>
          )}
        </Stack>
      </Paper>
    </div>
  );
}
