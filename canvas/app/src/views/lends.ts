// What a mounted body lends the shell (plan/slice-2.md, section 4, seams 2 and 8; section 8, package 2-1): the camera
// of a plane, and `reveal` of a plane and of a component body's frame. The shell gives the actions one ShellHands
// (core/hands.ts), whose `camera` and `reveal` take a view's id; a body knows how to move its own window, and is
// mounted only while its tab is shown. So each body leaves here what it lends, by session and view id, while it is
// mounted, and the shell's two hands are the two functions below:
//
//   camera: (viewId, how) => lentCamera(session, viewId, how),
//   reveal: (viewId, rect) => lentReveal(session, viewId, rect),
//
// It knows no React and no DOM.

import type { Session, ShellHands } from '../core';

/** How a camera is moved: ShellHands.camera's second argument. */
export type CameraMove = Parameters<ShellHands['camera']>[1];
/** A place of a view, in the view's own units from the view's origin. */
export type ViewRect = { x: number; y: number; w: number; h: number };

/** What one mounted body lends: a plane both, a component body's frame `reveal` when its body gave it one. */
export interface Lent {
  camera?(how: CameraMove): void;
  reveal?(rect: ViewRect): void;
}

interface Kept {
  readonly lent: Map<string, Lent>;
  /** A place asked for while no body of that view could reveal it: the view's tab was hidden, or is being shown. */
  readonly waiting: Map<string, ViewRect>;
}
const KEPT = new WeakMap<Session, Kept>();
function keptOf(session: Session): Kept {
  let kept = KEPT.get(session);
  if (!kept) KEPT.set(session, (kept = { lent: new Map(), waiting: new Map() }));
  return kept;
}

/**
 * A body leaves what it lends, for its session's view, and gets back what takes it away again: a body calls this when
 * it mounts (a plane: when React Flow is mounted, so only while its tab has a size) and calls what it got back when it
 * unmounts. One view has one body at a time; a second lending for the same view takes the first one's place, and the
 * first one's taking-back then does nothing. When a place of this view was asked for while nobody could reveal it
 * (lentReveal), it is revealed now, once.
 */
export function lend(session: Session, viewId: string, lent: Lent): () => void {
  const kept = keptOf(session);
  kept.lent.set(viewId, lent);
  const rect = kept.waiting.get(viewId);
  if (rect && lent.reveal) {
    kept.waiting.delete(viewId);
    lent.reveal(rect);
  }
  return () => { if (kept.lent.get(viewId) === lent) kept.lent.delete(viewId); };
}

/**
 * ShellHands.camera for a session: moves the camera of the view's plane, when one is mounted: 'in' and 'out' zoom by
 * a step of 1.2 about the plane's middle, 'fit' fits the view as the fit button does, and 'left', 'right', 'up' and
 * 'down' move the window that way over the view by 80 px of the screen. It does nothing for a view whose body is not
 * mounted or has no camera (a component body): the camera's actions ask first whether the view in front has one
 * (graphBodied() of core/readers). Returns whether a camera was moved.
 */
export function lentCamera(session: Session, viewId: string, how: CameraMove): boolean {
  const camera = keptOf(session).lent.get(viewId)?.camera;
  if (!camera) return false;
  camera(how);
  return true;
}

/**
 * ShellHands.reveal for a session: brings a place of a view into its body's window. A plane moves its camera only as
 * far as the place needs, and not at all when the place is in the window already; a component body scrolls. When the
 * view's body is not mounted (its tab is hidden, or was brought to the front in this very event and is not drawn
 * yet), the place is kept and revealed when the body mounts, the last one asked for only. So an action may call
 * showView and then reveal, in that order, without waiting.
 */
export function lentReveal(session: Session, viewId: string, rect: ViewRect): void {
  const kept = keptOf(session);
  const reveal = kept.lent.get(viewId)?.reveal;
  if (reveal) reveal(rect);
  else kept.waiting.set(viewId, { x: rect.x, y: rect.y, w: rect.w, h: rect.h });
}
