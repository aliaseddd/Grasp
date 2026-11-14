// The grips: the handles a line is dragged from (plan/slice-2.md, section 4, seam 6, and section 6). A grip is a plain
// element, not a React Flow handle: it holds no subscription, and costs nothing at a step of a pan. It knows no model,
// no session and no store; plane/Plane.tsx hears the press on it and hands it to the gesture (plane/gestures/connect.ts).

import type { Point, Side } from '../../core';
import { connectOf } from '../gestures/connect';
import './grips.css';

/**
 * The contract.
 *
 * - **A grip** is an element with `data-grip` (which one), `data-pass`, `data-testid="grip"` (the name a test finds
 *   it by, plan/slice-2.md, seam 12), and the classes `grasp-grip nodrag nopan nokey`.
 *   With those classes React Flow neither drags the node (`nodrag`), nor pans (`nopan`), nor starts a marquee when Shift
 *   is held (`nokey`); `data-pass` keeps it out of what a body's hitAt takes for a thing of
 *   its own: a plane's hitAt answers a node's grip, and the way to it, with that node (a line let go on the handle a
 *   person aims at is let go on its node), and looks past a line's grips, at what lies under them.
 * - **Mounted** only while `connectOf` is not null (package 2-2 has built the gesture), and only near: far, nothing.
 * - **Shown** by grips.css, under the plane root's `data-grips`: when the pointer is over the node, when the node is
 *   selected, and on every near node while a line is in hand (`data-connecting`). A grip that is not shown takes no
 *   pointer, so a click where it lies is a click on what is there. A shown grip takes the pointer on itself and on the
 *   way from the node's side out to it (16 px wide), so the pointer that leaves the node towards a grip is still over
 *   the node, and the grips stay.
 * - **Where.** A grip is 8 px across (the theme's `--grasp-grip`), and its middle is 14 px (`--grasp-grip-off`) outside
 *   the middle of a side of the node's border, clear of a border item that sits there. Both are in the view's units,
 *   so a grip grows and shrinks with the plane.
 * - **Whose it is.** A grip names no element. The plane finds the node or the edge a pressed grip is in, and reads
 *   that node's element or that edge's relationship (plane/Plane.tsx, the GripPress).
 *
 * What stage 0 of the scaffold found with these grips in the page, which the gesture's package builds on
 * (plan/notes.md keeps the numbers): the three classes are all needed, or do no harm (`nokey` for Shift, `nodrag` for
 * the node, `nopan` for a node that is not draggable); the pointer comes to a grip from its node, since a grip that
 * is not shown is the ground; a side with a border item at its middle gives its grip only while the box is selected;
 * a grip can lie under a line of the node's parts or under a later sibling, and the other grips are then free; a
 * selected line's grips are inside the edge's own svg, so the half of one that lies inside its end's node can be
 * covered by that node.
 */

const CLASSES = 'grasp-grip nodrag nopan nokey';
const grip = (side: Side): JSX.Element => <span key={side} className={CLASSES} data-testid="grip" data-grip={side} data-pass="" />;
// The elements, made once: a node that renders again gets the same ones, and React compares nothing.
const ONE: Readonly<Record<Side, JSX.Element>> = { top: grip('top'), right: grip('right'), bottom: grip('bottom'), left: grip('left') };
const FOUR = <>{ONE.top}{ONE.right}{ONE.bottom}{ONE.left}</>;

export interface NodeGripsProps {
  /** Whether the node is drawn far (below 25% zoom): no grip then. */
  far: boolean;
  /** The one side that has a grip: a border item's outer side, a small node's. Without it, all four: a box. */
  side?: Side;
}

/**
 * A node's grips, for a node component to render among its children: four on a box, one with `side`. It holds no
 * hook, and a node component calls it as a plain function, `{NodeGrips({ far: data.far })}`: a node that gets no grip
 * (every node while `connectOf` is null, and every far node after) then pays nothing for it, not even a component of
 * its own, which at 2,112 nodes was measured when a view is first drawn.
 */
export function NodeGrips({ far, side }: NodeGripsProps): JSX.Element | null {
  if (!connectOf || far) return null;
  return side ? ONE[side] : FOUR;
}

export interface EndGripsProps {
  /** The line as it is drawn, in the view's units: its first point is the `from` end, its last the `to` end. */
  points: readonly Point[];
}

/**
 * The two grips of a selected, near line, one at each drawn end, for a line component to render inside the edge's own
 * svg, called as a plain function too (`{EndGrips({ points })}`): `circle.grasp-grip.grasp-end-grip` with `data-grip`
 * `from` or `to`, and `data-testid="grip"` as a node's. The plane reads the line's relationship from the edge they
 * are in, and its two drawn ends from the two circles' `cx` and `cy`.
 */
export function EndGrips({ points }: EndGripsProps): JSX.Element | null {
  if (!connectOf || points.length < 2) return null;
  const from = points[0];
  const to = points[points.length - 1];
  return (
    <>
      <circle className={`${CLASSES} grasp-end-grip`} data-testid="grip" data-grip="from" data-pass="" cx={from.x} cy={from.y} />
      <circle className={`${CLASSES} grasp-end-grip`} data-testid="grip" data-grip="to" data-pass="" cx={to.x} cy={to.y} />
    </>
  );
}
