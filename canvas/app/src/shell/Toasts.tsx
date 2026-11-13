// The toasts: what the page says in passing, at the bottom of the window (plan/slice-1.md, step 11;
// plan/swarm/step-11.md). Until step 11 builds it, it shows nothing. App renders it once, over the dock.

import type { Session } from '../core';

export interface ToastsProps {
  /** The open file, or null. */
  session: Session | null;
}

/** The toasts of the open file's tools. Step 11 builds it; until then it renders nothing. */
export function Toasts(_props: ToastsProps): JSX.Element | null {
  return null;
}
