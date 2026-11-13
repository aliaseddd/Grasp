// The Validation panel, a side panel of the dock (plan/slice-1.md, step 12; plan/swarm/step-12.md). Until step 12
// builds it, it is the empty state the shell has shown since step 5. The dock renders ValidationPanel as the body of the
// panel 'validation' (shell/Dock.tsx, COMPONENTS); it reads the open file, and what else the dock hands on, through useDock()
// (shell/dockContext.ts), and is put into the dock inside SidePanel (panels/SidePanel.tsx).

import { SidePanel, SideText } from './SidePanel';

/** The panel's body. It takes no props: the dock makes it once and keeps it mounted while its tab is hidden. */
export function ValidationPanel(): JSX.Element {
  return (
    <SidePanel testId="validation" title="Validation">
      <SideText>The model's problems come in step 12.</SideText>
    </SidePanel>
  );
}
