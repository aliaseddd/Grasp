// What a body gives to what is drawn inside it (plan/slice-2.md, section 4, seam 2): a pin, the line in hand and the
// label editor ask the body for a point of the view and for what lies under the pointer, so they work the same in a
// plane and in a table. A plane provides it from React Flow (plane/Plane.tsx); views/BodyFrame.tsx provides it for a
// component body.

import { createContext, useContext } from 'react';
import type { Hit, Session } from '../core';

/**
 * A body's hands. Every function is the same for the body's life, and can be handed over as it is.
 *
 * - `toView(client)`: a point of the window (clientX, clientY), in the view's own units from the view's origin. In a
 *   plane this is React Flow's screenToFlowPosition.
 * - `hitAt(client)`: what lies at a point of the window: the ground, an element or a relationship, as a Hit with
 *   `add` false. It looks only at what is inside this body's root, so a node of a view beside it is never the answer,
 *   and it passes over whatever carries `data-pass` or is inside something that does: the pins, the badges, a line's
 *   grips and the line in hand. So a pin that is dragged does not hide what is under it. In a plane a node's grip, and
 *   the way from the node's side to it, is that node's (while a line is in hand every near node shows its grips, and
 *   a person lets go on the one they aim at); otherwise the answer is the first element there that is a node or an
 *   edge (a node that stands for no element is passed over); a point over one of the plane's panels (the zoom
 *   buttons, the minimap) is the ground. In a component body it is the first element
 *   there that is inside something with `data-thing`.
 * - `zoom()`: the body's zoom; 1 for a body with no camera.
 * - `menu(hit, client)`: opens the right-click palette there.
 * - `inside(client)`: whether a point of the window lies over this body's root.
 * - `mark(hit, fits)`: outlines the thing a gesture is over, teal when it fits and grey when not; null, or a hit on
 *   the ground, takes the outline away. A plane sets `data-over` ('fits' or 'no') on the React Flow element of each
 *   node of that element, or of that relationship's edge, and plane/nodes/grips.css draws the outline; a component
 *   body's frame sets it on the element that carries the thing's `data-thing`. Calling it again with the same thing
 *   costs one comparison, so a gesture may call it at every move.
 * - `swallow()`: the next click on this body is no click: a gesture's release. The next press on the body takes the
 *   flag away.
 *
 * A node component never reads the context: a context read in 5,000 nodes is a cost, and a node needs none of it. A
 * badge and a pin exist only on a marked thing, so they may.
 */
export interface BodyHands {
  session: Session;
  viewId: string;
  toView(client: { x: number; y: number }): { x: number; y: number };
  hitAt(client: { x: number; y: number }): Hit;
  zoom(): number;
  menu(hit: Hit, client: { x: number; y: number }): void;
  inside(client: { x: number; y: number }): boolean;
  mark(hit: Hit | null, fits: boolean): void;
  swallow(): void;
}

/** The hands of the body something is drawn in; null outside any body. */
export const BodyContext = createContext<BodyHands | null>(null);

/** The hands of the body this component is drawn in. It throws outside a body: a pin and a badge are drawn only inside one. */
export function useBody(): BodyHands {
  const body = useContext(BodyContext);
  if (!body) throw new Error('useBody: this component is drawn outside a body (a plane or a BodyFrame).');
  return body;
}
