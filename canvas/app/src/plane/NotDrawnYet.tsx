// The card of a view whose kind no plane draws yet: a sequence, geometry, grid or browser view (plan/slice-1.md,
// section 2, "Which views a tab draws"). The old page treats a kind with no renderer the same way.

import { Paper, Typography } from '@mui/material';

export interface NotDrawnYetProps {
  /** The first sentence, from the adapter's notDrawnText: "A sequence view is not drawn yet." */
  text: string;
}

/**
 * A card in the middle of the tab's body, in the look of the empty editor's card (shell/EmptyCard.tsx): `text` as its
 * title, then one sentence: "The old page draws it until slice 2." It has no button.
 */
export function NotDrawnYet({ text }: NotDrawnYetProps): JSX.Element {
  return (
    <div className="grasp-card-ground">
      <Paper variant="outlined" className="grasp-card" sx={{ p: 3, maxWidth: 440 }}>
        <Typography component="h2" sx={{ fontSize: 16, fontWeight: 500 }}>{text}</Typography>
        <Typography sx={{ mt: 1.5, color: 'text.secondary' }}>The old page draws it until slice 2.</Typography>
      </Paper>
    </div>
  );
}
