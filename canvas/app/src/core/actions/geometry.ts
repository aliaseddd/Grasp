// The geometry view's rule of place and its gesture's end. THE SCAFFOLD'S SKELETON: package 2-11 owns this file and
// builds it (plan/slice-2.md, section 5, flow 13; section 8, package 2-11).
//
// Section 5's table gives this file no row. It holds, for the geometry view's graph body (seams 1 and 3): `place`,
// its placer, and `end`, its ender, each null until the package builds it, which readers/index.ts hands out as
// placerOf('geometry') and enderOf('geometry').

import type { Action } from '../commands';
import type { Ender, Placer } from '../readers/index';

export const GEOMETRY_ACTIONS: readonly Action[] = [];

/**
 * The geometry view's rule of place (seam 1): a part or an item placed in the view is a Box of 1 by 1 by 1 of the
 * view's unit, centred on the click, owned by the footprint the reader's at() gives. Null until package 2-11 builds
 * it.
 */
export const place: Placer | null = null;

/**
 * The end of a footprint's drag (seam 3): the drop writes the element's posX and posY, rounded to what a pixel is
 * worth in the part's own unit, "Moved <part p> to 1.5, 2 m". The owner does not change by a drag in a plan. Null
 * until package 2-11 builds it.
 */
export const end: Ender | null = null;
