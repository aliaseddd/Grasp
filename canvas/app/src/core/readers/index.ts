// The readers: the adapter layer's one form for every view kind (plan/slice-2.md, section 4, seams 1 and 3;
// plan/architecture.md, contract 5). A reader takes a model and one of its views and gives what the view's body
// draws: a Projection for a graph body, data of the reader's own form for a component body. A view kind names its
// reader by the `renderer` of its row in the model library: `graph`, `sequence`, `geometry`, `grid`, `browser`.
//
// The scaffold builds the reader of the four graph kinds (readers/graph.ts, which is the adapter). Each of the other
// four files exports its reader as a constant that is null until its package builds it: readerOf() then gives null,
// the kind is not drawn by a body (hasReader), its tab shows the card, and it lists no tools.
//
// Here too, for a graph body of another renderer than `graph` (the sequence view, the geometry view): the kind's
// placer, which place() of core/commands.ts hands a tool's click to, and its ender, which a view's store hands a
// gesture's end to. Both are functions of the kind's file in core/actions/.
//
// A reader is pure and does not wait: the same model, view and options give the same result. It knows no React, no
// DOM, no store and no selection, and it never reads the checks, the notes or the selection (contract 7): what those
// say is added by the view's store or by the body.

import type { Ask, Projection } from '../adapter';
import type { Outcome } from '../commands';
import type { Model, ModelView, Place, Touched } from '../history';
import type { Hit } from '../selection';
import type { Session } from '../session';
import { end as geometryEnd, place as geometryPlace } from '../actions/geometry';
import { end as sequenceEnd, place as sequencePlace } from '../actions/sequence';
import { browserReader } from './browser';
import { geometryReader } from './geometry';
import { graphReader } from './graph';
import { gridReader } from './grid';
import { sequenceReader } from './sequence';

/**
 * One thing a view shows, in one form for every kind: an element ('el') or a relationship ('rel') by its id, what it
 * says in words, and its rectangle in the view's own units, from the view's origin; `rect` is null for a thing with
 * no place of its own (a line of a graph view). It is what a script prints when Claude asks what a view shows, what
 * says which views show an element, and what a click on a problem or a note brings into the window.
 */
export interface Listed { type: 'el' | 'rel'; id: string; words: string; rect: { x: number; y: number; w: number; h: number } | null }

/** What a reader may be asked with. A reader takes what it knows and leaves the rest. */
export interface ReadOptions {
  /** A graph body below 25% zoom: words are left out. */
  far?: boolean;
  /** The data before this one, of the same view: what reads the same stays the same object. */
  previous?: unknown;
  /** A gesture's places, which stand in for the view's own, for the graph kinds. */
  places?: ReadonlyMap<string, Place> | null;
}

/**
 * The reader of a renderer (contract 5).
 *
 * - **`read(lib, model, view, options)`** is what the body draws. For the graph kinds this is the adapter's project(),
 *   and Data is a Projection. A node, an edge or a row that reads the same as in `options.previous` is the same
 *   object.
 * - **`sizeOf(data)`** is how large the body wants to be, in the view's own units.
 * - **`listed(data)`** is what the view shows, in one form for every kind.
 * - **`at(data, point)`**, where a kind needs it: what lies at a point of the view, in a form of the reader's own,
 *   which only its kind's actions read (between which two events of a lifeline; in which footprint).
 * - **`step(data, asks)`**, for a graph body of another renderer than `graph`: the view as a step of a drag leaves
 *   it, from the projection the gesture began from and what React Flow asks of the pressed node. The reader holds a
 *   node to what its kind allows (a lifeline's head to its row, an event to its lifeline, a footprint to its
 *   rounding). It writes nothing.
 */
export interface Reader<Data> {
  read(lib: SysMLModelLibrary, model: Model, view: ModelView, options?: ReadOptions): Data;
  sizeOf(data: Data): { width: number; height: number };
  listed(data: Data): Listed[];
  at?(data: Data, point: { x: number; y: number }): unknown;
  step?(data: Data, asks: readonly Ask[]): Data;
}

/** The renderer of a view kind: `VIEW_KINDS[kind].renderer` of the model library, or null for a kind it does not hold. */
export function rendererOf(lib: SysMLModelLibrary, viewKind: string): string | null {
  return lib.VIEW_KINDS[viewKind]?.renderer ?? null;
}

/**
 * The reader of a renderer, or null: for a renderer whose package has not built its reader yet, and for a word that
 * names no renderer. It reads the files' constants when it is asked, so a reader is there from the moment its file
 * exports one.
 */
export function readerOf(renderer: string): Reader<unknown> | null {
  switch (renderer) {
    case 'graph': return graphReader as Reader<unknown>;
    case 'sequence': return sequenceReader as Reader<unknown> | null;
    case 'geometry': return geometryReader as Reader<unknown> | null;
    case 'grid': return gridReader as Reader<unknown> | null;
    case 'browser': return browserReader as Reader<unknown> | null;
    default: return null;
  }
}

/**
 * Whether views of this kind are drawn by a body: the kind has a renderer, and that renderer's reader is built. The
 * commands (toolGroups, place, the tool's click and offers), the Tools view and a view's store ask this where they
 * asked the adapter's isDrawn() until slice 2; isDrawn() keeps its old meaning, "the adapter's own project() reads
 * it", which only the adapter and readers/graph.ts use.
 */
export function hasReader(lib: SysMLModelLibrary, viewKind: string): boolean {
  const renderer = rendererOf(lib, viewKind);
  return renderer !== null && readerOf(renderer) !== null;
}

/**
 * Whether a renderer's body is a graph body: a plane draws it, and its reader gives a Projection. The four graph
 * kinds' is; the sequence view's and the geometry view's are too (plan/slice-2.md, section 2: both probes answered "a
 * graph body"). A grid view and a browser view have component bodies, and a word that names no renderer has none.
 * views/bodies.ts says the same of each entry (`body: 'graph'`); it is written here as well because a view's store
 * (plane/viewStore.ts) and the camera's actions must know it, and neither may import a React component. The store
 * asks it before it takes a reader's data for a Projection.
 */
export function graphBodied(renderer: string): boolean {
  return renderer === 'graph' || renderer === 'sequence' || renderer === 'geometry';
}

/**
 * The view of that id, read by its kind's reader: `{ renderer, data }`, the data being what the reader's read() gives
 * for the session's library and model, with `options` handed on as they are. Null for an id that names no view of
 * the model, and for a view whose kind has no reader yet. A component body calls this, so that it reads no record of
 * the model itself (contract 22).
 */
export function readView(session: Session, viewId: string, options?: ReadOptions): { renderer: string; data: unknown } | null {
  const view = session.model.views.find((v) => v.id === viewId);
  if (!view) return null;
  const renderer = rendererOf(session.lib, view.kind);
  const reader = renderer === null ? null : readerOf(renderer);
  if (renderer === null || reader === null) return null;
  return { renderer, data: reader.read(session.lib, session.model, view, options) };
}

/**
 * A kind's rule of place: places a new element of `kind` where `hit` says, in the view `hit.view`, as place() of
 * core/commands.ts does for the graph kinds. One history.edit(), or a refusal, and it picks nothing and says nothing.
 */
export type Placer = (session: Session, kind: string, hit: Hit) => Outcome;

/**
 * The placer of a renderer: `place` of core/actions/sequence.ts or geometry.ts, each null until its package builds
 * it. Null also for `graph`, whose rule of place is place() itself, and for `grid` and `browser`: those views have
 * no tools, so nothing is placed in them.
 */
export function placerOf(renderer: string): Placer | null {
  if (renderer === 'sequence') return sequencePlace;
  if (renderer === 'geometry') return geometryPlace;
  return null;
}

/**
 * The end of a gesture in a graph body of another renderer than `graph` (seam 3): `start` is the projection the
 * gesture began from, and `asks` what React Flow asks of the node the press named, at the release. It writes through
 * history.edit() and answers with what the edit touched; or with `{ refused }`, a sentence, which the store says
 * (saysOf) before it shows the model's own projection again; or with null, when the gesture ended where it began and
 * nothing was written.
 */
export type Ender = (session: Session, viewId: string, start: Projection, asks: readonly Ask[]) => Touched | { refused: string } | null;

/**
 * The ender of a renderer: `end` of core/actions/sequence.ts or geometry.ts, each null until its package builds it.
 * Null also for `graph`, where the view's store writes the places itself, and for a renderer whose body is no graph
 * body.
 */
export function enderOf(renderer: string): Ender | null {
  if (renderer === 'sequence') return sequenceEnd;
  if (renderer === 'geometry') return geometryEnd;
  return null;
}
