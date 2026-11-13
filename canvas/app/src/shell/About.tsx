// The About panel: what this browser lets the page do, and the libraries the page is built on (plan/slice-1.md,
// section 2, "What About reports", and step 12; plan/swarm/step-12.md). Until step 12 builds it, it shows nothing, and
// the bar's About button stays disabled. App renders it once and holds whether it is open.

export interface AboutProps {
  /** Whether the panel is shown. */
  open: boolean;
  /** Called when the person closes it. */
  onClose: () => void;
}

/** The About panel. Step 12 builds it; until then it renders nothing. */
export function About(_props: AboutProps): JSX.Element | null {
  return null;
}
