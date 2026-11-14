// The reader of a sequence view. THE SCAFFOLD'S SKELETON: package 2-10 owns this file and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-10; section 2, "The sequence view and the geometry view: a
// graph body each"; section 4, seams 1 and 3):
// - `sequenceReader`, in place of null: read, sizeOf, listed, at, and step for a node's drag (a head, an event). Its
//   data is a Projection, since the sequence view has a graph body. The layout is the old page's, ported: a lifeline
//   is two nodes, its head (whose id is the element's) and its line (`<id>:line`); an event is a child node of its
//   lifeline's line node; a message and a succession are edges with zIndex 1.
// - `at(data, point)` answers SequenceAt: the lifeline whose head, dashed line (within 24 of it) or event lies at the
//   point, and the event the point is above, or null below the last. Only core/actions/sequence.ts reads it.
// - `sequenceStep`: the view as a step leaves it; a message's drag calls it, for each step.
// - `sequenceResult`: what the last step would write.
// - **What step() reads.** step(data, asks) gets no model, and the store hands it a spread copy of what read() gave
//   (plane/viewStore.ts sets `selected` and the marks in a copy, `{ ...projection, nodes, edges }`). So the reader
//   keeps lib, model and view in a field of its own on the projection it gives, which a spread copy keeps, and reads
//   them back from there in step(); a WeakMap keyed by the projection object misses the copy. Projection, PlaneNode
//   and PlaneEdge hold no lifeline and no message: the reader gives its nodes and edges its own data, with Who's
//   `element`, `view` and `marks` (core/adapter.ts), and casts them to PlaneNode and PlaneEdge.
// - **The order of the nodes.** In the projection's nodes each lifeline's head comes before its `<id>:line` node,
//   then the events, the line node's children: the test helpers thingIn, pointOn, gripOf and pinOf take an
//   element's first node.
//
// While `sequenceReader` is null a sequence view is not drawn by a body: its tab shows the card and it lists no tools.

import type { Projection } from '../adapter';
import type { Model, ModelView } from '../history';
import type { Reader } from './index';

/** One step of a drag in a sequence view: a lifeline's head to an x, an event to a y, or a message to a y. */
export type SequenceStep = { kind: 'lifeline'; id: string; x: number } | { kind: 'event'; id: string; y: number } | { kind: 'message'; id: string; y: number };

/** What the reader's at() answers: the lifeline at the point, how far down, and the event the point is above (null below the last); or null where no lifeline is. */
export type SequenceAt = { lifeline: string; y: number; before: string | null } | null;

/**
 * What the last step of a drag would write: a head's x; an event's place among its lifeline's events; a message's
 * row. The plan names this type and leaves its form to package 2-10, which is the one that reads it
 * (core/actions/sequence.ts).
 */
export type SequenceEnd = unknown;

/** The reader of the renderer `sequence`. Null until package 2-10 builds it. */
export const sequenceReader: Reader<Projection> | null = null;

/** The view as one step of a drag leaves it, from the projection the drag began from. Package 2-10 builds it. */
export function sequenceStep(_lib: SysMLModelLibrary, _model: Model, _view: ModelView, _start: Projection, _step: SequenceStep): Projection {
  throw new Error('sequenceStep: package 2-10 builds it');
}

/** What the last step would write, read off the projection that step gave; null when it would write nothing. Package 2-10 builds it. */
export function sequenceResult(_projection: Projection): SequenceEnd | null {
  throw new Error('sequenceResult: package 2-10 builds it');
}
