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
// canvas/src/sequence/page.js. Three measures differ from the old page's, all in Look: a compartment's title row, 16
// where the old page has 18; `snap`, which draws an elbow between two boxes a few pixels out of line as one straight
// stroke; and `rowType`, by which a compartment's rows are as long as their box is wide, by Roboto's own widths
// (core/roboto.ts), where the old page counts characters. Given OLD_LOOK, project() and route() give the old page's
// rectangles and points exactly.

import type { Edge, Node, Position } from '@xyflow/react';
import type { Model, ModelElement, ModelRelationship, ModelView, Place } from './history';
import { textWidth } from './roboto';

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
  /**
   * The size, in px, of the text of a compartment's rows, which the page draws in Roboto regular with kerning and
   * ligatures off. A row is then as long as its box allows: rowRoom() wide at most, by textWidth() of core/roboto.ts.
   * 0 is the old page's rule instead, a count of characters by docChar and codeChar.
   */
  rowType: number;
  /** With rowType 0: a doc's rows hold floor((the box's saved width - 2 * pad) / docChar) characters, at least 12. */
  docChar: number;
  /** With rowType 0: a send or accept's rows hold as many by codeChar, at least 10; a code link is cut to as many, at least 8. */
  codeChar: number;
  /**
   * How far out of line the two ends of an elbow may be and still be joined by one straight stroke, which then runs
   * at the far end's centre. The old page has no such rule (0): two boxes 2 px out of line get a 2 px step.
   */
  snap: number;
};

// The rows stay the old page's 15 apart, not the 16 of plan/slice-1.md, section 4: the saved files were laid out for
// 15, and in the example `hosts` sits straight under `Page`'s three doc rows (plan/notes.md, session 20).
export const LOOK: Look = { header: 40, head: 16, lead: 15, tail: 6, pad: 12, childTop: 48, port: 16, rowType: 12, docChar: 6.1, codeChar: 6.6, snap: 4 };
export const OLD_LOOK: Look = { ...LOOK, head: 18, snap: 0, rowType: 0 };

/** The least room a row is wrapped to, whatever its box's saved width: the room of the narrowest box, 80 wide. */
export const ROW_LEAST = 56;

/**
 * The room of a compartment's row in a box whose saved width is `width`, when rows are wrapped by the font's widths
 * (look.rowType is not 0): the width less `pad` at each side, and at least ROW_LEAST.
 */
export function rowRoom(look: Look, width: number): number {
  return Math.max(ROW_LEAST, width - 2 * look.pad);
}

/** Below this zoom a plane is far: a box is its outline, and names and labels are left out. */
export const FAR = 0.25;
/** A plane's zoom limits, which the fit and React Flow share. */
export const MIN_ZOOM = 0.02;
export const MAX_ZOOM = 4;
/** The most a fitted view keeps free at the window's left, right and top: the old page's frame margin. */
export const FIT_PAD = 48;
/** What a fitted view keeps free at the bottom while the minimap is shown, where it and the zoom buttons stand: 15 + 150 + 15. */
export const FIT_BAND = 180;
/** The minimap's size on a plane. */
export const MINIMAP = { width: 200, height: 150 } as const;
/** The least plane the minimap is shown in. In a narrower one it would cover the zoom buttons or most of the view. */
export const MINIMAP_LEAST = { width: 480, height: 480 } as const;

/** Whether a plane `width` by `height` shows the minimap: when it is at least MINIMAP_LEAST each way. */
export function hasMinimap(width: number, height: number): boolean {
  return width >= MINIMAP_LEAST.width && height >= MINIMAP_LEAST.height;
}

/**
 * What a fitted view keeps free in a plane `width` by `height`: `pad` at the left, the right and the top, and `band`
 * at the bottom. `pad` is FIT_PAD, or a twelfth of the plane's smaller side (rounded down) where that is less, so
 * that a small plane is not all margin. `band` is FIT_BAND where the plane shows the minimap (hasMinimap), else `pad`.
 */
export function fitMargins(width: number, height: number): { pad: number; band: number } {
  const pad = Math.min(FIT_PAD, Math.max(0, Math.floor(Math.min(width, height) / 12)));
  return { pad, band: hasMinimap(width, height) ? FIT_BAND : pad };
}

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

// ---- The helpers, ported from the old page (the file header says where each one is).

const str = (value: unknown): string => (typeof value === 'string' ? value : '');
const num = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

/** layout.js `wrap`: words kept whole, a blank line kept as a row, the trailing blank rows dropped. */
function wrap(text: unknown, maxChars: number): string[] {
  const out: string[] = [];
  for (const para of String(text || '').replace(/\r\n?/g, '\n').split('\n')) {
    let line = '';
    for (const word of para.split(/\s+/).filter(Boolean)) {
      if (line && (line + ' ' + word).length > maxChars) {
        out.push(line);
        line = word;
      } else line = line ? line + ' ' + word : word;
    }
    if (line || !para.trim()) out.push(line);
  }
  while (out.length && !out[out.length - 1]) out.pop();
  return out;
}

/** annotations/page.js `fitPath`: a path that fits a row, its end kept behind an ellipsis. */
function fitPath(path: string, chars: number): string {
  return path.length <= chars ? path : '…' + path.slice(path.length - chars + 1);
}

/**
 * The rows of a text in a room `room` wide, by the font's own widths at `px`: as many whole words to a row as fit,
 * one space apart; a word wider than the room on a row by itself. Paragraphs, blank rows and the end as `wrap` has them.
 */
function wrapWidth(text: unknown, room: number, px: number): string[] {
  const space = textWidth(' ', px);
  const out: string[] = [];
  for (const para of String(text || '').replace(/\r\n?/g, '\n').split('\n')) {
    let line = '';
    let width = 0;
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const w = textWidth(word, px);
      if (line && width + space + w > room) {
        out.push(line);
        line = word;
        width = w;
      } else {
        width = line ? width + space + w : w;
        line = line ? line + ' ' + word : word;
      }
    }
    if (line || !para.trim()) out.push(line);
  }
  while (out.length && !out[out.length - 1]) out.pop();
  return out;
}

/** A path in a room `room` wide: whole when it fits, else `…` and its longest tail that fits with it, a character at least. */
function fitTail(path: string, room: number, px: number): string {
  if (textWidth(path, px) <= room) return path;
  const chars = [...path];
  let width = textWidth('…', px);
  let from = chars.length;
  while (from > 0) {
    const w = textWidth(chars[from - 1], px);
    if (width + w > room && from < chars.length) break;
    width += w;
    from--;
  }
  return '…' + chars.slice(from).join('');
}

/** Whether two values read the same, by value: plain data only, which is what a node's `data` holds. */
function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    const other = b as unknown[];
    if (a.length !== other.length) return false;
    for (let i = 0; i < a.length; i++) if (!sameValue(a[i], other[i])) return false;
    return true;
  }
  const x = a as Record<string, unknown>;
  const y = b as Record<string, unknown>;
  const keys = Object.keys(x);
  if (keys.length !== Object.keys(y).length) return false;
  for (const key of keys) if (!(key in y) || !sameValue(x[key], y[key])) return false;
  return true;
}

function sameLook(a: Look, b: Look): boolean {
  if (a === b) return true;
  const keys = Object.keys(a) as (keyof Look)[];
  return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key]);
}

type SavedPlace = { x?: unknown; y?: unknown; w?: unknown; h?: unknown; side?: unknown; at?: unknown };

/** layout.js `portRect`: the square of a border item, centred on its owner's border `at` along its side. */
function portRect(place: SavedPlace, r: Rect, port: number): { rect: Rect; side: Side } {
  const at = num(place.at);
  let cx: number;
  let cy: number;
  let side: Side;
  if (place.side === 'top') { side = 'top'; cx = r.x + at * r.w; cy = r.y; }
  else if (place.side === 'bottom') { side = 'bottom'; cx = r.x + at * r.w; cy = r.y + r.h; }
  else if (place.side === 'left') { side = 'left'; cx = r.x; cy = r.y + at * r.h; }
  else { side = 'right'; cx = r.x + r.w; cy = r.y + at * r.h; }
  return { rect: { x: cx - port / 2, y: cy - port / 2, w: port, h: port }, side };
}

const centre = (r: Rect): Point => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

/** layout.js `edgePoint`: where a line from the middle of box `r` toward `toward` leaves the box. */
function edgePoint(r: Rect, toward: Point): Point {
  const c = centre(r);
  const dx = toward.x - c.x;
  const dy = toward.y - c.y;
  if (!dx && !dy) return { x: c.x, y: r.y };
  const t = Math.min(dx ? r.w / 2 / Math.abs(dx) : Infinity, dy ? r.h / 2 / Math.abs(dy) : Infinity);
  return { x: c.x + dx * t, y: c.y + dy * t };
}

/** layout.js `straight`. */
function straight(ra: End, rb: End, look: Look): Point[] {
  const ca = centre(ra);
  const cb = centre(rb);
  let a = ra.border ? ca : edgePoint(ra, cb);
  let b = rb.border ? cb : edgePoint(rb, ca);
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const u = { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
  if (ra.border) a = { x: a.x + u.x * (look.port / 2 + 1), y: a.y + u.y * (look.port / 2 + 1) };
  if (rb.border) b = { x: b.x - u.x * (look.port / 2 + 1), y: b.y - u.y * (look.port / 2 + 1) };
  return [a, b];
}

/**
 * layout.js `elbow`: null when the two rectangles overlap in both directions. With `snap`, two ends no further out of
 * line than that are joined at the far end's centre, so the stroke has no step.
 */
function elbow(ra: Rect, rb: Rect, snap: number): Point[] | null {
  const bx = rb.x + rb.w / 2;
  const by = rb.y + rb.h / 2;
  const upright = rb.y + rb.h <= ra.y || rb.y >= ra.y + ra.h;
  const ax = upright && Math.abs(ra.x + ra.w / 2 - bx) <= snap ? bx : ra.x + ra.w / 2;
  const ay = !upright && Math.abs(ra.y + ra.h / 2 - by) <= snap ? by : ra.y + ra.h / 2;
  if (rb.y + rb.h <= ra.y) { const m = (ra.y + rb.y + rb.h) / 2; return [{ x: ax, y: ra.y }, { x: ax, y: m }, { x: bx, y: m }, { x: bx, y: rb.y + rb.h }]; }
  if (rb.y >= ra.y + ra.h) { const m = (ra.y + ra.h + rb.y) / 2; return [{ x: ax, y: ra.y + ra.h }, { x: ax, y: m }, { x: bx, y: m }, { x: bx, y: rb.y }]; }
  if (rb.x >= ra.x + ra.w) { const m = (ra.x + ra.w + rb.x) / 2; return [{ x: ra.x + ra.w, y: ay }, { x: m, y: ay }, { x: m, y: by }, { x: rb.x, y: by }]; }
  if (rb.x + rb.w <= ra.x) { const m = (ra.x + rb.x + rb.w) / 2; return [{ x: ra.x, y: ay }, { x: m, y: ay }, { x: m, y: by }, { x: rb.x + rb.w, y: by }]; }
  return null;
}

/** An element's shape as a node type: its kind's shape when it is one of SHAPES, else `port` on a border, else `rect`. */
function shapeOf(row: KindRow): Shape {
  return (SHAPES as readonly string[]).includes(row.shape) ? (row.shape as Shape) : row.onBorder ? 'port' : 'rect';
}

/** drawing.js `portName`, from the square's top left: a name goes clear of the first line drawn from its border item. */
function portName(side: Side, way: Point | null, port: number): BorderData['nameAt'] {
  const c = port / 2;
  if (side === 'right') return way && way.y < 0 && way.x > 0 ? { x: c + 12, y: c + 15, anchor: 'start' } : { x: c + 12, y: c - 6, anchor: 'start' };
  if (side === 'left') return way && way.y > 0 && way.x < 0 ? { x: c - 12, y: c - 6, anchor: 'end' } : { x: c - 12, y: c + 15, anchor: 'end' };
  const y = side === 'top' ? c - 6 : c + 15;
  if (way && (side === 'top' ? way.y < 0 : way.y > 0)) return way.x > 0 ? { x: c - 12, y, anchor: 'end' } : { x: c + 12, y, anchor: 'start' };
  return side === 'top' ? { x: c, y: c - 13, anchor: 'middle' } : { x: c, y: c + 22, anchor: 'middle' };
}

/** What an element's compartments hold in a box `width` wide: doc, then send or accept, then code. */
function compartmentsOf(lib: SysMLModelLibrary, model: Model, el: ModelElement, row: KindRow, width: number, look: Look): Compartment[] {
  const out: Compartment[] = [];
  const px = look.rowType;
  const room = rowRoom(look, width);
  const doc = str(el.doc);
  if (row.fields.includes('doc') && doc.trim() !== '') {
    const lines = px ? wrapWidth(doc, room, px) : wrap(doc, Math.max(12, Math.floor((width - 2 * look.pad) / look.docChar)));
    if (lines.length) out.push({ head: 'doc', lines });
  }
  if (el.kind === 'ActionUsage' && (el.actionKind === 'send' || el.actionKind === 'accept')) {
    const payload = str(el.payload).trim();
    const target = str(el.target).trim();
    if (payload || target) {
      const word = el.actionKind === 'accept' ? 'via' : lib.sendWord(model, target);
      const said = payload + (target ? ' ' + word + ' ' + target : '');
      const lines = px ? wrapWidth(said, room, px) : wrap(said, Math.max(10, Math.floor((width - 2 * look.pad) / look.codeChar)));
      if (lines.length) out.push({ head: el.actionKind, lines });
    }
  }
  if (Array.isArray(el.code) && el.code.length > 0) {
    const chars = Math.max(8, Math.floor((width - 2 * look.pad) / look.codeChar));
    const lines = (el.code as unknown[]).map((link) => {
      const path = link && typeof link === 'object' ? str((link as { path?: unknown }).path) : '';
      return px ? fitTail(path.trim() || '(no path)', room, px) : fitPath(path.trim() || '(no path)', chars);
    });
    out.push({ head: 'code', lines });
  }
  return out;
}

/** The keyword line of a box, by its shape. */
function keywordOf(shape: Shape, el: ModelElement, row: KindRow): string {
  if (shape === 'item') return '«' + (str(el.direction) ? str(el.direction) + ' ' : '') + row.keyword + '»';
  if (shape === 'action') {
    const what = el.actionKind === 'send' || el.actionKind === 'accept' ? el.actionKind + ' ' : '';
    return '«' + (str(el.role) ? str(el.role) + ' ' : '') + what + 'action»';
  }
  if (shape === 'state') return '«' + (el.abstract ? 'abstract ' : '') + row.keyword + '»' + (el.parallel ? ' «parallel»' : '');
  return '«' + (el.abstract ? 'abstract ' : '') + row.keyword + '»';
}

/** drawing.js `nameLine`: the name, its definition's after a colon, the multiplicity in brackets. */
function nameLine(lib: SysMLModelLibrary, model: Model, ids: Map<string, ModelElement>, el: ModelElement, row: KindRow): string {
  let s = lib.textName(el) || '(unnamed)';
  if (row.usage) {
    const typing = lib.typingOf(model, el);
    if (typing) {
      const def = ids.get(typing.to);
      s += ' : ' + (el.conjugated ? '~' : '') + (def ? lib.textName(def) || '(unnamed)' : '?');
    }
    if (el.multiplicity) s += ' [' + String(el.multiplicity) + ']';
  }
  return s;
}

const EMPTY_ROW: LineRow = { route: 'straight', marker: null, cls: '', label: null };

/** What one reading of a view makes, before the words of far and the objects of `previous` are settled. */
type Made = { nodes: PlaneNode[]; edges: PlaneEdge[]; rects: Map<string, Rect>; bounds: Rect | null };

function build(lib: SysMLModelLibrary, model: Model, view: ModelView, far: boolean, look: Look): Made {
  const none: Made = { nodes: [], edges: [], rects: new Map(), bounds: null };
  const ids = new Map<string, ModelElement>();
  for (const el of model.elements) ids.set(el.id, el);
  const layout = view.layout as Record<string, SavedPlace>;
  const shown = new Set<string>();
  for (const id of Object.keys(layout)) {
    const el = ids.get(id);
    const lay: unknown = layout[id];
    if (el && lib.KINDS[el.kind] && lay !== null && typeof lay === 'object') shown.add(id);
  }
  if (shown.size === 0) return none;

  // A box's parent is its nearest owner that the view shows; what a box holds, boxes and border items apart, in the
  // model's order (graphLayout 44-58).
  type Group = { boxes: ModelElement[]; ports: ModelElement[] };
  const groups = new Map<string | undefined, Group>();
  const limit = model.elements.length;
  for (const el of model.elements) {
    if (!shown.has(el.id)) continue;
    let p = el.owner;
    let steps = 0;
    while (p !== undefined && !shown.has(p)) {
      const o = ids.get(p);
      p = o && ++steps <= limit ? o.owner : undefined;
    }
    let group = groups.get(p);
    if (!group) groups.set(p, (group = { boxes: [], ports: [] }));
    (lib.KINDS[el.kind].onBorder ? group.ports : group.boxes).push(el);
  }

  // graphLayout size(): a box is its saved size, or what its header and compartments need, or what holds each box in it.
  type Size = { w: number; h: number; comps: Compartment[] };
  const sizes = new Map<string, Size>();
  const sizeOf = (el: ModelElement): Size => {
    const kept = sizes.get(el.id);
    if (kept) return kept;
    const lay = layout[el.id];
    const row = lib.KINDS[el.kind];
    const isBox = BOX_SHAPES.includes(shapeOf(row));
    const comps = isBox ? compartmentsOf(lib, model, el, row, num(lay.w), look) : [];
    let bottom = (isBox ? look.header : 0) + comps.reduce((h, c) => h + look.head + look.lead * c.lines.length + look.tail, 0);
    let right = 0;
    for (const kid of groups.get(el.id)?.boxes ?? []) {
      const s = sizeOf(kid);
      const kl = layout[kid.id];
      bottom = Math.max(bottom, num(kl.y) + s.h + look.pad);
      right = Math.max(right, num(kl.x) + s.w + look.pad);
    }
    const size = { w: Math.max(num(lay.w), right), h: Math.max(num(lay.h), bottom), comps };
    sizes.set(el.id, size);
    return size;
  };

  // graphLayout place(): rectangles from the view's origin; the nodes in order: a box, the boxes in it, its border items.
  type Entry = { el: ModelElement; row: KindRow; shape: Shape; parent: string | undefined; rect: Rect; comps: Compartment[]; side?: Side };
  const entries: Entry[] = [];
  const rects = new Map<string, Rect>();
  const borders = new Set<string>();
  const place = (el: ModelElement, ox: number, oy: number, parent: string | undefined): void => {
    const lay = layout[el.id];
    const s = sizeOf(el);
    const r: Rect = { x: ox + num(lay.x), y: oy + num(lay.y), w: s.w, h: s.h };
    const row = lib.KINDS[el.kind];
    rects.set(el.id, r);
    entries.push({ el, row, shape: shapeOf(row), parent, rect: r, comps: s.comps });
    const group = groups.get(el.id);
    if (!group) return;
    for (const kid of group.boxes) place(kid, r.x, r.y, el.id);
    for (const port of group.ports) {
      const square = portRect(layout[port.id], r, look.port);
      const prow = lib.KINDS[port.kind];
      rects.set(port.id, square.rect);
      borders.add(port.id);
      entries.push({ el: port, row: prow, shape: shapeOf(prow), parent: el.id, rect: square.rect, comps: [], side: square.side });
    }
  };
  for (const el of groups.get(undefined)?.boxes ?? []) place(el, 0, 0, undefined);
  if (entries.length === 0) return none;

  let x = Infinity;
  let y = Infinity;
  let x2 = -Infinity;
  let y2 = -Infinity;
  for (const r of rects.values()) {
    x = Math.min(x, r.x);
    y = Math.min(y, r.y);
    x2 = Math.max(x2, r.x + r.w);
    y2 = Math.max(y2, r.y + r.h);
  }
  const bounds: Rect = { x, y, w: x2 - x, h: y2 - y };

  // The lines: not hidden, both ends placed, in the model's order. Their points are made when a border item asks.
  type Line = { rel: ModelRelationship; row: LineRow; a: End; b: End; how: 'straight' | 'elbow'; points?: Point[] };
  const lines: Line[] = [];
  const byEnd = new Map<string, Line[]>();
  const addEnd = (id: string, line: Line): void => {
    const list = byEnd.get(id);
    if (list) list.push(line);
    else byEnd.set(id, [line]);
  };
  for (const rel of model.relationships) {
    if (rel.hidden) continue;
    const ra = rects.get(rel.from);
    const rb = rects.get(rel.to);
    if (!ra || !rb) continue;
    const row = lib.RELATIONSHIPS[rel.kind]?.line ?? EMPTY_ROW;
    const line: Line = { rel, row, a: { ...ra, border: borders.has(rel.from) }, b: { ...rb, border: borders.has(rel.to) }, how: row.route === 'elbow' ? 'elbow' : 'straight' };
    lines.push(line);
    addEnd(rel.from, line);
    if (rel.to !== rel.from) addEnd(rel.to, line);
  }
  const pointsOf = (line: Line): Point[] => (line.points ??= route(line.how, line.a, line.b, look).points);
  // drawing.js lineWay: which way the first line drawn from a border item leaves it.
  const lineWay = (id: string): Point | null => {
    for (const line of byEnd.get(id) ?? []) {
      const pts = pointsOf(line);
      const n = pts.length;
      const d = line.rel.from === id
        ? { x: pts[1].x - pts[0].x, y: pts[1].y - pts[0].y }
        : { x: pts[n - 2].x - pts[n - 1].x, y: pts[n - 2].y - pts[n - 1].y };
      if (d.x || d.y) return d;
    }
    return null;
  };

  const nodes: PlaneNode[] = entries.map(({ el, row, shape, parent, rect, comps, side }) => {
    const words = [row.definition ? 'def' : 'usage'];
    if (el.abstract && side === undefined) words.push('abstract');
    if (far) words.push('far');
    const base = { id: el.id, type: shape, handles: HANDLES, className: words.join(' ') };
    const sized = (width: number, height: number) => ({ width, height, measured: { width, height } });
    const withParent = parent === undefined ? {} : { parentId: parent };
    let data: NodeData;
    if (BOX_SHAPES.includes(shape)) {
      data = {
        form: 'box',
        far,
        keyword: far ? '' : keywordOf(shape, el, row),
        name: far ? '' : nameLine(lib, model, ids, el, row),
        compartments: far ? [] : comps,
        glyph: far ? null : shape === 'action' && (el.actionKind === 'send' || el.actionKind === 'accept') ? el.actionKind : null,
        least: { width: Math.min(80, row.size[0]), height: Math.min(40, row.size[1]) },
      };
      const lay = layout[el.id];
      return { ...base, ...withParent, position: { x: num(lay.x), y: num(lay.y) }, ...sized(rect.w, rect.h), data } as PlaneNode;
    }
    if (side !== undefined && parent !== undefined) {
      const raw = row.glyph ? row.glyph(model, el) : 'inout';
      data = {
        form: 'border',
        far,
        side,
        glyph: far ? null : raw === 'in' || raw === 'out' || raw === 'inout' ? raw : null,
        name: far ? '' : nameLine(lib, model, ids, el, row),
        nameAt: portName(side, lineWay(el.id), look.port),
      };
      const owner = rects.get(parent) as Rect;
      return { ...base, ...withParent, position: { x: rect.x - owner.x, y: rect.y - owner.y }, ...sized(rect.w, rect.h), data } as PlaneNode;
    }
    const lay = layout[el.id];
    const named = shape === 'event' ? nameLine(lib, model, ids, el, row) : shape === 'bar' || shape === 'diamond' ? lib.textName(el) || '' : '';
    data = { form: 'small', far, name: far ? '' : named };
    return { ...base, ...withParent, position: { x: num(lay.x), y: num(lay.y) }, ...sized(rect.w, rect.h), data } as PlaneNode;
  });

  const edges: PlaneEdge[] = lines.map(({ rel, row, how, a, b }) => ({
    id: rel.id,
    source: rel.from,
    target: rel.to,
    type: 'line',
    className: row.cls,
    data: {
      route: how,
      marker: row.marker ? markerId(row.marker) : null,
      label: far || !row.label ? '' : row.label(rel, model, ids),
      labelOffset: row.labelOffset ?? 30,
      far,
      sourceBorder: a.border,
      targetBorder: b.border,
    },
  }));
  return { nodes, edges, rects, bounds };
}

/** Whether a new node reads the same as the one before it: everything but `selected` and `dragging`. */
function sameNode(a: PlaneNode, b: PlaneNode): boolean {
  return a.type === b.type && a.parentId === b.parentId && a.width === b.width && a.height === b.height && a.className === b.className
    && a.position.x === b.position.x && a.position.y === b.position.y && sameValue(a.data, b.data);
}

function sameEdge(a: PlaneEdge, b: PlaneEdge): boolean {
  return a.type === b.type && a.source === b.source && a.target === b.target && a.className === b.className && sameValue(a.data, b.data);
}

/**
 * Projects one view of the model: the plan's six rules.
 *
 * 1. One node for each element the view's layout places, owners before what they hold; a box's parent is its
 *    nearest owner that the view shows. As on the old page, nothing is drawn for a place that is not an object or
 *    whose id names no element, for an element of a kind the library has no row for, for a border item with no
 *    shown owner, for anything whose nearest shown owner is a border item, or for elements that own each other in a
 *    ring; nor for a line with such an end.
 * 2. A box's position is its saved x, y. Its size is its saved w, h, or more: with the shape's header (BOX_SHAPES)
 *    and its compartments, `header + sum(head + lead * rows + tail)` high; and to hold each box inside it,
 *    `x + w + pad` wide and `y + h + pad` high, each inner box at its own grown size (graphLayout's size()).
 *    Compartments are wrapped to the box's saved width, not its grown one. With `look.rowType` (LOOK), by the font's
 *    own widths: a row of a doc, or of a send or accept, holds as many whole words, one space apart, as are together
 *    no wider than rowRoom(look, the saved width) by textWidth(row, look.rowType); a word wider than that stands on a
 *    row by itself, which the page cuts with an ellipsis; a line break in the text ends a row, a blank line is an
 *    empty row, and the blank rows at the end are dropped. A code link is one row and is never wrapped: its path
 *    whole when that is no wider than the room, else `…` and the longest tail of the path that is, with the `…`, no
 *    wider than the room (at least the path's last character). With `look.rowType` 0 (OLD_LOOK), by the old page's
 *    counts of characters, docChar and codeChar.
 * 3. A border item is a child node of its owner: its square, `look.port` a side, centred on the owner's border at
 *    `at` along its `side` (portRect).
 * 4. One edge for each relationship that is not hidden and has both ends placed. Its route, marker, class, label and
 *    label offset come from its row's `line`.
 * 5. A node or edge that reads the same as in `previous` is the same object, and its `data` too. A changed one is a
 *    new object that keeps `selected` and `dragging` from the one before, and its `data` object too when only its
 *    place or size changed. When every node and edge is the same object, in the same order, and `far` and `look` are
 *    the same, the result is `previous` itself.
 * 6. Far: words are left out (BoxData, BorderData, SmallData, EdgeData say which), sizes stay, and every node's
 *    className gains `far`.
 *
 * It reads the model inside `lib.reading(model, ...)`, so a view of thousands of elements is projected in
 * milliseconds, and it writes nothing to the model. A view of a kind no plane draws projects to nothing.
 */
export function project(lib: SysMLModelLibrary, model: Model, view: ModelView, options: ProjectOptions = {}): Projection {
  const far = options.far === true;
  const look = options.look ?? LOOK;
  const previous = options.previous && options.previous.view === view.id ? options.previous : null;
  const made: Made = isDrawn(lib, view.kind)
    ? lib.reading(model, () => build(lib, model, view, far, look))
    : { nodes: [], edges: [], rects: new Map(), bounds: null };

  // Rule 5: what reads the same as before is the object it was; what changed keeps what React Flow set on it.
  let same = previous !== null && previous.far === far && sameLook(previous.look, look)
    && previous.nodes.length === made.nodes.length && previous.edges.length === made.edges.length;
  let nodes = made.nodes;
  let edges = made.edges;
  if (previous) {
    const was = new Map<string, PlaneNode>();
    for (const node of previous.nodes) was.set(node.id, node);
    nodes = made.nodes.map((node, i) => {
      const old = was.get(node.id);
      let out = node;
      if (old) {
        if (sameNode(old, node)) out = old;
        else {
          // A node that only moved or grew says what it said: its component, memoized on `data`, does not render again.
          if (sameValue(old.data, node.data)) node.data = old.data;
          if (old.selected !== undefined) node.selected = old.selected;
          if (old.dragging !== undefined) node.dragging = old.dragging;
        }
      }
      if (out !== previous.nodes[i]) same = false;
      return out;
    });
    const wasEdge = new Map<string, PlaneEdge>();
    for (const edge of previous.edges) wasEdge.set(edge.id, edge);
    edges = made.edges.map((edge, i) => {
      const old = wasEdge.get(edge.id);
      let out = edge;
      if (old) {
        if (sameEdge(old, edge)) out = old;
        else {
          if (sameValue(old.data, edge.data)) edge.data = old.data;
          if (old.selected !== undefined) edge.selected = old.selected;
        }
      }
      if (out !== previous.edges[i]) same = false;
      return out;
    });
    if (same) return previous;
  }
  return { view: view.id, far, look, nodes, edges, rects: made.rects, bounds: made.bounds };
}

/**
 * The points of a line from `a` to `b`, and its middle, where its label goes: the old page's straight and elbow.
 *
 * - `straight`: from each end's centre toward the other's. A box's end is where that ray leaves its rectangle (its top
 *   centre when the two centres are one point). A border item's end is `port / 2 + 1` out from its square's centre.
 * - `elbow`: four points, when `b` lies wholly above `a`, wholly below, wholly right or wholly left of it, asked in
 *   that order: out of the facing sides at the two centres, with the turn halfway between. Otherwise as `straight`.
 *   When the two centres are no more than `look.snap` out of line, both ends are at `b`'s centre and the four points
 *   lie on one straight stroke.
 * - `mid` is the middle of the segment from point `floor(n / 2) - 1` to the next: of the middle one for an elbow.
 */
export function route(how: 'straight' | 'elbow', a: End, b: End, look: Look = LOOK): { points: Point[]; mid: Point } {
  const points = (how === 'elbow' ? elbow(a, b, look.snap) : null) ?? straight(a, b, look);
  const i = Math.floor(points.length / 2) - 1;
  return { points, mid: { x: (points[i].x + points[i + 1].x) / 2, y: (points[i].y + points[i + 1].y) / 2 } };
}

/**
 * The viewport that fits `bounds` into a window `width` by `height`: at no more than 100% and no less than MIN_ZOOM,
 * clear of the window's sides by fitMargins(width, height) (`pad` at the left, the right and the top, `band` at the
 * bottom), centred in the room that leaves. With nothing to fit (`bounds` null), 100% at the origin. A window too
 * small for any room fits at MIN_ZOOM.
 */
export function fit(bounds: Rect | null, width: number, height: number): Viewport {
  if (!bounds) return { x: 0, y: 0, zoom: 1 };
  const { pad, band } = fitMargins(width, height);
  const roomW = width - 2 * pad;
  const roomH = height - pad - band;
  const zoom = roomW <= 0 || roomH <= 0 ? MIN_ZOOM : Math.max(MIN_ZOOM, Math.min(1, roomW / bounds.w, roomH / bounds.h));
  return {
    x: pad + (roomW - bounds.w * zoom) / 2 - bounds.x * zoom,
    y: pad + (roomH - bounds.h * zoom) / 2 - bounds.y * zoom,
    zoom,
  };
}
