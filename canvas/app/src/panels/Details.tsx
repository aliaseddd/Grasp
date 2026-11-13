// The Details panel, a side panel of the dock (plan/slice-1.md, step 10; plan/swarm/step-10.md). Until step 10
// builds it, it is the empty state the shell has shown since step 5. The dock renders DetailsPanel as the body of the
// panel 'details' (shell/Dock.tsx, COMPONENTS); it reads the open file, and what else the dock hands on, through useDock()
// (shell/dockContext.ts), and is put into the dock inside SidePanel (panels/SidePanel.tsx).

import { SidePanel, SideText } from './SidePanel';

/** The panel's body. It takes no props: the dock makes it once and keeps it mounted while its tab is hidden. */
export function DetailsPanel(): JSX.Element {
  return (
    <SidePanel testId="details" title="Details">
      <SideText>The selection's fields come in step 10.</SideText>
    </SidePanel>
  );
}
