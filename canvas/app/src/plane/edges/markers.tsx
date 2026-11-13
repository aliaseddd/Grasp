// The five markers at a line's far end, drawn once for the page: two planes side by side would otherwise each define
// the same ids (plan/notes.md, session 20). A line refers to one as url(#markerId(name)) (core/adapter.ts).

/**
 * The contract: one svg, 0 by 0 and out of the layout (not `display: none`, under which a marker is not painted),
 * `aria-hidden`, class `grasp-markers`, holding a `<marker>` for each of the library's five names, its id
 * markerId(name), `markerUnits="userSpaceOnUse"`, `orient="auto"`, in the old page's shapes and sizes:
 *
 * | name | box, ref | shape | old page |
 * |---|---|---|---|
 * | m-general | 18 by 16, (17, 8) | a hollow triangle, M3,1.5 L17,8 L3,14.5 Z, white inside | core/page/drawing.js 33-34 |
 * | m-defined | 24 by 16, (23, 8) | the triangle M9,1.5 L23,8 L9,14.5 Z, white inside, and two dots of radius 1.6 at (4, 4.5) and (4, 11.5) | core/page/drawing.js 35-36 |
 * | m-flow | 12 by 12, (11, 6) | a filled head, M1,1 L11,6 L1,11 Z | interconnection/page.js 27-28 |
 * | m-open | 12 by 12, (11, 6) | an open head, M2,1.5 L11,6 L2,10.5 | behavior/page.js 139-140 |
 * | m-message | 12 by 12, (11, 6) | M1,1.5 L11,6 L1,10.5 L3.5,6 Z, white inside | sequence/page.js 39-40 |
 *
 * Each paints its stroke, and the filled one its fill, with `context-stroke`, so a marker has its line's colour.
 * App renders it once, beside the dock.
 */
export function Markers(): JSX.Element {
  throw new Error('plane/edges/markers.tsx: Markers is not built yet (step 6).');
}
