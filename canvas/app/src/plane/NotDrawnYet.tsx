// The card of a view whose kind no plane draws yet: a sequence, geometry, grid or browser view (plan/slice-1.md,
// section 2, "Which views a tab draws"). The old page treats a kind with no renderer the same way.

export interface NotDrawnYetProps {
  /** The first sentence, from the adapter's notDrawnText: "A sequence view is not drawn yet." */
  text: string;
}

/**
 * A card in the middle of the tab's body, in the look of the empty editor's card (shell/EmptyCard.tsx): `text` as its
 * title, then one sentence: "The old page draws it until slice 2." It has no button.
 */
export function NotDrawnYet(props: NotDrawnYetProps): JSX.Element {
  void props;
  throw new Error('plane/NotDrawnYet.tsx: NotDrawnYet is not built yet (step 6).');
}
