// The reader of a geometry view. THE SCAFFOLD'S SKELETON: package 2-11 owns this file and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-11; section 2, "The sequence view and the geometry view: a
// graph body each"; section 4, seams 1 and 3):
// - `geometryReader`, in place of null: read, sizeOf, listed, at, and step for a footprint's drag. Its data is a
//   Projection, since the geometry view has a graph body. The layout is the old page's, ported: each spatial element
//   the view shows is its shape's footprint to scale, in the view's units with y down, each node's top left corner
//   from its parent node's; the axes are one node whose `data.element` is null.
// - `at(data, point)` answers GeometryAt: the innermost footprint at the point that can hold a part, and the point in
//   that footprint's frame, or in the view's, in the view's unit. Only core/actions/geometry.ts reads it.
// - `geometryResult`: the position a dragged footprint has at a step, rounded.
// - **What step() reads.** step(data, asks) gets no model, and the store hands it a spread copy of what read() gave
//   (plane/viewStore.ts sets `selected` and the marks in a copy, `{ ...projection, nodes, edges }`). So the reader
//   keeps what it needs of lib, model and view in a field of its own on the projection it gives, which a spread copy
//   keeps, and reads it back from there in step(); a WeakMap keyed by the projection object misses the copy.
//   PlaneNode holds no footprint and no axes: the reader gives its nodes their own data, with Who's `element`, `view`
//   and `marks` (core/adapter.ts), and casts them to PlaneNode.
//
// While `geometryReader` is null a geometry view is not drawn by a body: its tab shows the card and it lists no tools.

import type { Projection } from '../adapter';
import type { Reader } from './index';

/** What the reader's at() answers: the footprint that would own what is placed there (null: the view itself), and the point in that frame, in the view's unit. */
export type GeometryAt = { owner: string | null; x: number; y: number; unit: string };

/** The reader of the renderer `geometry`. Null until package 2-11 builds it. */
export const geometryReader: Reader<Projection> | null = null;

/** The position the dragged footprint `id` has in this step's projection, rounded to what a pixel is worth in the part's own unit; null when the projection holds no such footprint. Package 2-11 builds it. */
export function geometryResult(_projection: Projection, _id: string): { posX: number; posY: number; unit: string } | null {
  throw new Error('geometryResult: package 2-11 builds it');
}
