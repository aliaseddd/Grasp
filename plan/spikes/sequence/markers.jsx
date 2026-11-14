// The two arrowheads, drawn once for the page, as the page's plane/edges/markers.tsx does. Both candidates use them.

/** The two markers: a message's closed, unfilled head and a succession's open one. Each takes its line's colour. */
export function Markers() {
  return (
    <svg className="seq-markers" width="0" height="0" aria-hidden="true">
      <defs>
        <marker id="seq-message" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto" overflow="visible">
          <path className="seq-marker-closed" d="M1,1.5 L11,6 L1,10.5 L3.5,6 Z" />
        </marker>
        <marker id="seq-open" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto" overflow="visible">
          <path className="seq-marker-open" d="M2,1.5 L11,6 L2,10.5" />
        </marker>
      </defs>
    </svg>
  );
}
