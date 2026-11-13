// The frame of a side panel: what every panel of the two strips is put into the dock with (plan/swarm/shared.md, "How
// a side panel is put into the dock"). A header row as high as the editor's tab bar, with the panel's title and a rule
// under it, then the panel's own. The panel's root fills its side and is what scrolls; the page itself never does.

import type { ReactNode } from 'react';

export interface SidePanelProps {
  /** The data-testid of the panel's root (helpers.mjs, TESTIDS): 'explorer', 'tools', 'validation', 'details'. */
  testId: string;
  /** The panel's title, in its header row: the name its strip shows. */
  title: string;
  /** The panel's own, under the header row. */
  children?: ReactNode;
}

/** A side panel's root (class grasp-side-body, with its data-testid), its header row (grasp-side-title), then its children. */
export function SidePanel({ testId, title, children }: SidePanelProps): JSX.Element {
  return (
    <div className="grasp-side-body" data-testid={testId}>
      <div className="grasp-side-title">{title}</div>
      {children}
    </div>
  );
}

/** One paragraph of secondary text under the header row: what a panel says while it has nothing to show (grasp-side-text). */
export function SideText({ children }: { children: ReactNode }): JSX.Element {
  return <div className="grasp-side-text">{children}</div>;
}
