// Where a line's gesture starts (plan/slice-2.md, section 4, seam 6; section 5, flows 1 and 2): what a press on a grip
// hands over, what the line in hand is, and the gesture that package 2-2 builds. Lines by dragging are Grasp's own
// gesture, on grips of its own (plane/nodes/Grips.tsx), and not React Flow's connecting (section 2 says why).
//
// It knows no React. plane/Plane.tsx hears a press on a grip and calls `connectOf(store).press(press, body)`;
// plane/gestures/ConnectLayer.tsx and plane/ConnectMenu.tsx draw `state` and `menu`.

import type { Point, Tool } from '../../core';
import type { BodyHands } from '../../views/bodyContext';
import type { ViewStore } from '../viewStore';

/** A press of the main button on a grip, as Plane.tsx hands it to the gesture. */
export interface GripPress {
  grip: 'top' | 'right' | 'bottom' | 'left' | 'from' | 'to';
  /** For a node's grip: the node's element (elementOf). */
  element: string | null;
  /** For a line's grip: the line's relationship. */
  relationship: string | null;
  /** For a line's grip: its two drawn ends, in the view's units. */
  ends: { from: Point; to: Point } | null;
  /** The grip itself: the gesture captures the pointer on it, and reads where it is. */
  target: Element;
  client: Point;
  pointerId: number;
}

/** The line in hand. */
export interface ConnectState {
  /** A new line, or an end of a line that exists. */
  kind: 'draw' | 'move';
  /** The element the line in hand starts at; for a move, the end that stays. */
  from: string;
  /** For a move. */
  relationship: string | null;
  end: 'from' | 'to' | null;
  /** Where the line in hand starts, in the view's units: the grip's middle, or the drawn end that stays. */
  start: Point;
  /** The pointer, in the view's units. */
  at: Point;
  /** The element under the pointer. */
  over: string | null;
  /** Whether something fits there. */
  fits: boolean;
}

/** The kinds that fit where a line was let go, for the menu. `left`, `top`: the window's px. */
export interface ConnectChoice { from: string; to: string; kinds: readonly Tool[]; left: number; top: number }

export interface ConnectGesture {
  /** The line in hand; it stays while the menu is open. */
  readonly state: ConnectState | null;
  readonly menu: ConnectChoice | null;
  /** From here on the gesture follows the pointer itself, on the window, until its release. */
  press(press: GripPress, body: BodyHands): void;
  choose(kind: string): void;
  closeMenu(): void;
  /** Escape, through gesturesOf(session); a change of the model heard in the middle. */
  cancel(): void;
  listen(listener: () => void): () => void;
}

/** How far, in screen px, the pointer must go from a press on a grip before it is a gesture: a release before that does nothing. */
export const GRIP_DISTANCE = 4;

// ==== STAND-IN, for the probe and for the measurement of criterion 9 only; never committed ============================
// In its place the skeleton has:   export const connectOf: ((store: ViewStore) => ConnectGesture) | null = null;
//
// With it, Grips.tsx mounts the grips on every near node, and a press on one is followed: the pointer is captured on
// the grip, pointermove and pointerup are heard on the window, and past GRIP_DISTANCE it sets `state` and calls
// swallow(). It adds itself to nothing and writes nothing to the model. What it saw is left on the plane's root as
// JSON, in `data-probe`, for a script to read.
const STAND_INS = new WeakMap<ViewStore, ConnectGesture>();
export const connectOf: ((store: ViewStore) => ConnectGesture) | null = (store) => {
  const kept = STAND_INS.get(store);
  if (kept) return kept;
  let state: ConnectState | null = null;
  let stop: (() => void) | null = null;
  const listeners = new Set<() => void>();
  const tell = (): void => { for (const listener of [...listeners]) listener(); };
  const gesture: ConnectGesture = {
    get state() { return state; },
    menu: null,
    press(press, body) {
      stop?.();
      const { target, pointerId } = press;
      const root = target.closest('[data-testid="plane"]');
      const box = target.getBoundingClientRect();
      const middle = body.toView({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
      const line = press.grip === 'from' || press.grip === 'to' ? press.grip : null;
      const start = line && press.ends ? press.ends[line === 'from' ? 'to' : 'from'] : middle;
      const saw = {
        grip: press.grip, element: press.element, relationship: press.relationship, ends: press.ends,
        captured: false, moves: 0, ups: 0, cancels: 0, lost: 0, passed: false, capturedAtUp: false,
        over: null as string | null, overType: '' as string, state: null as ConnectState | null, ended: '' as string,
      };
      const write = (): void => { root?.setAttribute('data-probe', JSON.stringify(saw)); };
      try { target.setPointerCapture(pointerId); } catch { /* the pointer is gone already */ }
      saw.captured = target.hasPointerCapture(pointerId);
      const end = (how: string): void => {
        stop?.();
        saw.ended = how;
        const had = state !== null;
        state = null;
        body.mark(null, false);
        write();
        if (had) tell();
      };
      const move = (event: PointerEvent): void => {
        if (event.pointerId !== pointerId) return;
        saw.moves++;
        const client = { x: event.clientX, y: event.clientY };
        if (!state) {
          if (Math.hypot(client.x - press.client.x, client.y - press.client.y) < GRIP_DISTANCE) { write(); return; }
          saw.passed = true;
          body.swallow();
        }
        const hit = body.hitAt(client);
        const over = hit.type === 'el' ? hit.id : null;
        saw.over = hit.id;
        saw.overType = hit.type;
        state = {
          kind: line ? 'move' : 'draw', from: press.element ?? '', relationship: press.relationship, end: line,
          start, at: body.toView(client), over, fits: over !== null && over !== press.element,
        };
        saw.state = state;
        body.mark(over !== null && over !== press.element ? hit : null, true);
        write();
        tell();
      };
      const up = (event: PointerEvent): void => {
        if (event.pointerId !== pointerId) return;
        saw.ups++;
        saw.capturedAtUp = target.hasPointerCapture(pointerId);
        end('up');
      };
      const cancelled = (event: PointerEvent): void => { if (event.pointerId === pointerId) { saw.cancels++; end('cancel'); } };
      const lost = (): void => { saw.lost++; write(); };
      window.addEventListener('pointermove', move, true);
      window.addEventListener('pointerup', up, true);
      window.addEventListener('pointercancel', cancelled, true);
      target.addEventListener('lostpointercapture', lost);
      stop = () => {
        stop = null;
        window.removeEventListener('pointermove', move, true);
        window.removeEventListener('pointerup', up, true);
        window.removeEventListener('pointercancel', cancelled, true);
        target.removeEventListener('lostpointercapture', lost);
        if (target.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId);
      };
      write();
    },
    choose() { /* the stand-in has no menu */ },
    closeMenu() { /* the stand-in has no menu */ },
    cancel() {
      stop?.();
      if (state === null) return;
      state = null;
      tell();
    },
    listen(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
  };
  STAND_INS.set(store, gesture);
  return gesture;
};
// ==== end of the stand-in ==============================================================================================
