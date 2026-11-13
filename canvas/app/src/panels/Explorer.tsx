// The Explorer panel, a side panel of the dock (plan/slice-1.md, step 9; plan/swarm/step-9.md). Until step 9
// builds it, it is the empty state the shell has shown since step 5. The dock renders ExplorerPanel as the body of the
// panel 'explorer' (shell/Dock.tsx, COMPONENTS); it reads the open file, and what else the dock hands on, through useDock()
// (shell/dockContext.ts), and is put into the dock inside SidePanel (panels/SidePanel.tsx).

import { SidePanel, SideText } from './SidePanel';

/** The panel's body. It takes no props: the dock makes it once and keeps it mounted while its tab is hidden. */
export function ExplorerPanel(): JSX.Element {
  return (
    <SidePanel testId="explorer" title="Explorer">
      <SideText>The model's tree comes in step 9.</SideText>
    </SidePanel>
  );
}
