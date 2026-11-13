// The Tools panel, a side panel of the dock (plan/slice-1.md, step 11; plan/swarm/step-11.md). Until step 11
// builds it, it is the empty state the shell has shown since step 5. The dock renders ToolsPanel as the body of the
// panel 'tools' (shell/Dock.tsx, COMPONENTS); it reads the open file, and what else the dock hands on, through useDock()
// (shell/dockContext.ts), and is put into the dock inside SidePanel (panels/SidePanel.tsx).

import { SidePanel, SideText } from './SidePanel';

/** The panel's body. It takes no props: the dock makes it once and keeps it mounted while its tab is hidden. */
export function ToolsPanel(): JSX.Element {
  return (
    <SidePanel testId="tools" title="Tools">
      <SideText>The view's tools come in step 11.</SideText>
    </SidePanel>
  );
}
