// The adapter: the one function that turns a view of the saved model, grasp/2, into the nodes and edges a plane hands
// React Flow (plan/slice-1.md, step 6, "The adapter's rules"; plan/notes.md, session 17, "The architecture", and
// session 20, "Step 6: the outline"). It owns which view kinds a plane draws, every rule of place and size, and the
// routes of lines as plain geometry. It knows no React, no DOM, no store, no selection and no event, and nothing of
// React Flow runs in it: it imports React Flow's types only, so that tsc checks its nodes and edges against the
// library's own where a plane hands them over, and the core's Node tests still load it (canvas/app/test/core.mjs).
//
// The rules of place and size are the old page's, ported from its page scripts, which stay as they are:
// graphLayout, portRect, straight, elbow and endpoints in canvas/src/core/page/layout.js; nameLine, the keyword lines,
// compartmentsOf, portName and the far form in canvas/src/core/page/drawing.js; the item's line in
// canvas/src/interconnection/page.js; the action's and the state's lines, the send or accept compartment and the
// control nodes in canvas/src/behavior/page.js; the code compartment in canvas/src/annotations/page.js; the event in
// canvas/src/sequence/page.js. Two measures differ from the old page's, both in Look: a compartment's title row and
// the distance between its rows. Given OLD_LOOK, project() gives the old page's rectangles exactly.

import type { Edge, Node, Position } from '@xyflow/react';
import type { Model, ModelElement, ModelRelationship, ModelView, Place } from './history';

// ---- The model library, as far as the adapter reads it.

/** A row of the library's KINDS: how an element kind is drawn and placed. */
export interface KindRow {
  /** The shape that draws it: one of SHAPES. A kind whose row names another is drawn as `rect`, or `port` on a border. */
  shape: string;
  /** The size a new one gets, and with 80 by 40 the least a box may be resized to (the library's placement()). */
  size: [number, number];
  /** Whether it sits on its owner's border (a port, a parameter): its place is then a side and how far along it. */
  onBorder?: boolean;
  /** The word between the guillemets: «part def». */
  keyword: string;
  definition?: boolean;
  usage?: boolean;
  /** The fields it holds; a compartment or a line of the name applies only to a kind that lists its field. */
  fields: string[];
  /** Which way a border item's arrow points: 'in', 'out', 'inout', or null for none. Without the hook: 'inout'. */
  glyph?: (model: Model, el: ModelElement) => string | null;
}

/** How a relationship kind is drawn: the `line` of its row in the library's RELATIONSHIPS. */
export interface LineRow {
  /** 'elbow' or 'straight'; anything else is drawn straight. */
  route: string;
  /** The marker at the line's far end, by the library's name ('m-general'), or null for none. */
  marker: string | null;
  /** The line's class: 'specialization', 'connection', 'succession'. */
  cls: string;
  /** What the line says at its middle, or null when its kind says nothing. `ids` is every element by its id. */
  label: null | ((rel: ModelRelationship, model: Model, ids: Map<string, ModelElement>) => string);
  /** How far below the line's middle the label's baseline sits; 30 when the row gives none. Negative is above. */
  labelOffset?: number;
}

/** A row of the library's VIEW_KINDS. */
export interface ViewKindRow {
  /** What draws it on the old page: 'graph' for the four kinds a plane draws. */
  renderer: string;
  /** Its name in a sentence: 'general view'. */
  label: string;
}

declare global {
  // The part of the model library that the adapter reads, beside what src/types.d.ts and session.ts declare of it.
  interface SysMLModelLibrary {
    readonly KINDS: Readonly<Record<string, KindRow>>;
    readonly RELATIONSHIPS: Readonly<Record<string, { line: LineRow; hideable?: boolean }>>;
    readonly VIEW_KINDS: Readonly<Record<string, ViewKindRow>>;
    /** An element's name in the text, trimmed; '' while it has none; null when its kind has none (a start node). */
    textName(el: { kind: string; name?: unknown }): string | null;
    /** The typing of a usage (its "defined by" line), hidden or not, or null. */
    typingOf(model: Model, el: ModelElement): ModelRelationship | null;
    /** 'a part def' or 'an action flow view'; `capital` makes the article's first letter a capital. */
    an(label: string, capital?: boolean): string;
    /** A place as the library keeps it: whole numbers, a box no smaller than its kind's least, `at` from 0.05 to 0.95. */
    placement(el: ModelElement, place: Partial<{ x: number; y: number; w: number; h: number; side: string; at: number }>): Place;
    /** Runs `read` with the model's lookups made once, so that typingOf and its like do not search the lists again. */
    reading<T>(model: Model, read: () => T): T;
    /** 'via' when a send's target names a port, else 'to'. */
    sendWord(model: Model, target: string): string;
  }
}

// ---- The measures.

/** The measures of place and size. LOOK is the new page's; OLD_LOOK the old page's, for comparing with it. */
export type Look = {
  /** The height of a box's header: its keyword line and its name line. */
  header: number;
  /** The height of a compartment's title row, under its rule. */
  head: number;
  /** The distance between a compartment's rows. */
  lead: number;
  /** What a compartment takes below its last row. */
  tail: number;
  /** The room an owner keeps to the right of and below what it holds, and a row's distance from the box's left. */
  pad: number;
  /** The least distance of a nested box from its owner's top (steps 7 and 11 hold it; sizing does not). */
  childTop: number;
  /** The side of a border item's square. */
  port: number;
  /** A doc's rows hold floor((the box's saved width - 2 * pad) / docChar) characters, at least 12. */
  docChar: number;
  /** A send or accept's rows hold as many by codeChar, at least 10; a code link is cut to as many, at least 8. */
  codeChar: number;
};

export const LOOK: Look = { header: 40, head: 16, lead: 16, tail: 6, pad: 12, childTop: 48, port: 16, docChar: 6.1, codeChar: 6.6 };
export const OLD_LOOK: Look = { ...LOOK, head: 18, lead: 15 };

/** Below this zoom a plane is far: a box is its outline, and names and labels are left out. */
export const FAR = 0.25;
/** A plane's zoom limits, which the fit and React Flow share. */
export const MIN_ZOOM = 0.02;
export const MAX_ZOOM = 4;
/** What a fitted view keeps free at the window's left, right and top: the old page's frame margin. */
export const FIT_PAD = 48;
/** What a fitted view keeps free at the bottom, where the zoom buttons and the minimap stand: 15 + 150 + 15. */
export const FIT_BAND = 180;

// ---- What crosses to the store and to React Flow.

/** The 13 shapes, which are a plane's node types. */
export const SHAPES = ['rect', 'rounded', 'item', 'action', 'state', 'port', 'param', 'bar', 'diamond', 'dot', 'bullseye', 'entry', 'event'] as const;
export type Shape = (typeof SHAPES)[number];
/** The shapes with a header and compartments, which BoxNode draws. Their height is at least Look.header. */
export const BOX_SHAPES: readonly Shape[] = ['rect', 'rounded', 'item', 'action', 'state'];
/** The shapes of border items, which PortNode draws. */
export const BORDER_SHAPES: readonly Shape[] = ['port', 'param'];

export type Side = 'top' | 'right' | 'bottom' | 'left';
export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };
/** A line's end: a box's rectangle, or a border item's square, in one view's coordinates. */
export type End = Rect & { border: boolean };

/** A compartment: its title and its rows, each row one line of text, already wrapped. */
export type Compartment = { head: string; lines: string[] };

/** What BoxNode draws. Far: keyword and name are '', compartments is empty and glyph is null. */
export type BoxData = {
  form: 'box';
  far: boolean;
  /** The first line: «abstract part def», «in item», «perform send action», «state» «parallel». */
  keyword: string;
  /** The second line: Host, or hosts : Host [1..*], or (unnamed). */
  name: string;
  /** In this order: doc, send or accept, code. */
  compartments: Compartment[];
  /** A send or accept action's mark at the box's top left. */
  glyph: 'send' | 'accept' | null;
  /** The least size a resize may give the box (step 7): the library's placement() limits for its kind. */
  least: { width: number; height: number };
};

/** What PortNode draws. Far: name is '' and glyph is null. */
export type BorderData = {
  form: 'border';
  far: boolean;
  side: Side;
  /** The arrow in the square: into the owner, out of it, both, or none. */
  glyph: 'in' | 'out' | 'inout' | null;
  /** api : ~StrongholdApp */
  name: string;
  /** Where the name's baseline starts, ends or is centred, from the square's top left: clear of the port's line. */
  nameAt: { x: number; y: number; anchor: 'start' | 'middle' | 'end' };
};

/** What SmallNode draws: a control node, a start, a done, an entry or an event. Far: name is ''. */
export type SmallData = { form: 'small'; far: boolean; name: string };

export type NodeData = BoxData | BorderData | SmallData;

/**
 * A node of a plane, in React Flow's shape.
 * - `id` is the element's id, `type` its kind row's shape (a shape no component draws: `rect`, or `port` on a border).
 * - `position` is the box's saved x, y, from its parent node's corner, or from the view's origin at ground level
 *   (a view's own x, y are not added: one view is on a tab). A border item's is its square's corner from its
 *   owner's corner, worked out from its side, its `at` and its owner's size, and is not rounded.
 * - `parentId` is the nearest owner the view shows; none at ground level. Parents come before their children.
 * - `width`, `height` and `measured` are the size by graphLayout's rule: whole numbers.
 * - `handles` is HANDLES, so React Flow draws lines to a node it has not mounted.
 * - `className` is words apart by a space: `def` or `usage`; `abstract`; `far`.
 * - `selected` and `dragging` are React Flow's own, kept when a node gets a new object.
 */
export type PlaneNode = Node<NodeData, Shape> & {
  type: Shape;
  width: number;
  height: number;
  measured: { width: number; height: number };
  className: string;
};

/** What LineEdge draws. Far: label is ''. */
export type EdgeData = {
  route: 'straight' | 'elbow';
  /** The marker's element id at the line's far end, markerId() of the row's name, or null. */
  marker: string | null;
  label: string;
  /** How far below the line's middle the label's baseline sits. */
  labelOffset: number;
  far: boolean;
  /** Whether each end is a border item, which a line leaves from just outside its square. */
  sourceBorder: boolean;
  targetBorder: boolean;
};

/** An edge of a plane: `id` the relationship's, `source` its `from`, `target` its `to`, `className` its row's `cls`. */
export type PlaneEdge = Edge<EdgeData, 'line'> & { type: 'line'; data: EdgeData; className: string };

/** The two handles every node carries: React Flow asks for one of each before it draws a line. */
export const HANDLES: NonNullable<Node['handles']> = [
  { type: 'source', position: 'top' as Position, x: 0, y: 0 },
  { type: 'target', position: 'top' as Position, x: 0, y: 0 },
];

/** One view, projected. */
export interface Projection {
  /** The view's id. */
  readonly view: string;
  readonly far: boolean;
  readonly look: Look;
  /** A box, then the boxes inside it, each with its own, then its border items; at each level in the model's order. */
  readonly nodes: PlaneNode[];
  /** One for each relationship that is not hidden and has both ends among the nodes, in the model's order. */
  readonly edges: PlaneEdge[];
  /** Every node's rectangle from the view's origin, by its id: what the old page's layout calls rects. */
  readonly rects: ReadonlyMap<string, Rect>;
  /** The rectangle around every node's rectangle; null when the view places nothing. */
  readonly bounds: Rect | null;
}

export interface ProjectOptions {
  /** Whether the plane is far (its zoom is under FAR). Default false. */
  far?: boolean;
  /** The projection before this one, of the same view: what reads the same is taken from it. */
  previous?: Projection | null;
  /** The measures. Default LOOK. */
  look?: Look;
}

export type Viewport = { x: number; y: number; zoom: number };

// ---- What the adapter does.

/** Whether a plane draws views of this kind: the four whose row says `graph`. The others show a card. */
export function isDrawn(lib: SysMLModelLibrary, viewKind: string): boolean {
  return lib.VIEW_KINDS[viewKind]?.renderer === 'graph';
}

/** What the card of a kind no plane draws says first, as the old page says it: "A sequence view is not drawn yet." */
export function notDrawnText(lib: SysMLModelLibrary, viewKind: string): string {
  return `${lib.an(lib.VIEW_KINDS[viewKind]?.label ?? viewKind, true)} is not drawn yet.`;
}

/** The id of a marker's element in the page, from the library's name for the marker: grasp-m-general. */
export function markerId(name: string): string {
  return `grasp-${name}`;
}

/**
 * Projects one view of the model: the plan's six rules.
 *
 * 1. One node for each element the view's layout places, whose id names an element; owners before what they hold; a
 *    box's parent is its nearest owner that the view shows.
 * 2. A box's position is its saved x, y. Its size is its saved w, h, or more: with the shape's header (BOX_SHAPES)
 *    and its compartments, `header + sum(head + lead * rows + tail)` high; and to hold each box inside it,
 *    `x + w + pad` wide and `y + h + pad` high, each inner box at its own grown size (graphLayout's size()).
 *    Compartments are wrapped by a count of characters to the box's saved width, not its grown one.
 * 3. A border item is a child node of its owner: its square, `look.port` a side, centred on the owner's border at
 *    `at` along its `side` (portRect).
 * 4. One edge for each relationship that is not hidden and has both ends placed. Its route, marker, class, label and
 *    label offset come from its row's `line`.
 * 5. A node or edge that reads the same as in `previous` is the same object, and its `data` too. A changed one is a
 *    new object that keeps `selected` and `dragging` from the one before. When every node and edge is the same
 *    object, in the same order, and `far` and `look` are the same, the result is `previous` itself.
 * 6. Far: words are left out (BoxData, BorderData, SmallData, EdgeData say which), sizes stay, and every node's
 *    className gains `far`.
 *
 * It reads the model inside `lib.reading(model, ...)`, so a view of thousands of elements is projected in
 * milliseconds, and it writes nothing to the model. A view of a kind no plane draws projects to nothing.
 */
export function project(lib: SysMLModelLibrary, model: Model, view: ModelView, options: ProjectOptions = {}): Projection {
  void [lib, model, view, options];
  throw new Error('core/adapter.ts: project() is not built yet (step 6).');
}

/**
 * The points of a line from `a` to `b`, and its middle, where its label goes: the old page's straight and elbow.
 *
 * - `straight`: from each end's centre toward the other's. A box's end is where that ray leaves its rectangle (its top
 *   centre when the two centres are one point). A border item's end is `port / 2 + 1` out from its square's centre.
 * - `elbow`: four points, when `b` lies wholly above `a`, wholly below, wholly right or wholly left of it, asked in
 *   that order: out of the facing sides at the two centres, with the turn halfway between. Otherwise as `straight`.
 * - `mid` is the middle of the segment from point `floor(n / 2) - 1` to the next: of the middle one for an elbow.
 */
export function route(how: 'straight' | 'elbow', a: End, b: End, look: Look = LOOK): { points: Point[]; mid: Point } {
  void [how, a, b, look];
  throw new Error('core/adapter.ts: route() is not built yet (step 6).');
}

/**
 * The viewport that fits `bounds` into a window `width` by `height`: at no more than 100% and no less than MIN_ZOOM,
 * FIT_PAD clear of the window's left, right and top and FIT_BAND clear of its bottom, centred in the room that
 * leaves. With nothing to fit (`bounds` null), 100% at the origin. A window too small for any room fits at MIN_ZOOM.
 */
export function fit(bounds: Rect | null, width: number, height: number): Viewport {
  void [bounds, width, height];
  throw new Error('core/adapter.ts: fit() is not built yet (step 6).');
}
