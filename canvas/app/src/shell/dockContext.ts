// What the dock hands to what it holds: the side panels, the card of the empty editor and the views' tabs read it
// through useDock(). It is apart from Dock.tsx so that a panel's file imports this and not the dock, which imports
// the panels (plan/swarm/shared.md, "How a side panel is put into the dock").

import { createContext, useContext } from 'react';
import type { Session } from '../core';

export interface DockState {
  /** The open file, or null before one is opened. */
  session: Session | null;
  /** Opens a file, as the bar's Open does. */
  onOpen: () => void;
  /** Gives every view of the open file that has no tab its tab again, in the editor. */
  showViews: () => void;
  /** How many of the session's views have no tab anywhere, in the editor or floating over it. */
  closed: number;
  /**
   * Opens the tab of one view of the open file, or brings it to the front (step 9: the Explorer calls it for a
   * view's row). A view with a tab, in the editor or floating over it, is made the one in front of its group; a view
   * with none gets its tab back as showViews() would give it, and is in front. An id that names no view of the open
   * file does nothing. Until step 9 builds it in Dock.tsx it throws.
   */
  showView: (viewId: string) => void;
}

export const DockContext = createContext<DockState>({
  session: null, onOpen: () => {}, showViews: () => {}, closed: 0, showView: () => {},
});

/** What the dock holds now. A side panel's component calls it; it renders again when the dock's state changes. */
export const useDock = (): DockState => useContext(DockContext);
