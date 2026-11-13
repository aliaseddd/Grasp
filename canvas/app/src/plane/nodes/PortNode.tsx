// The node of a border item: a port or a parameter, a child node of its owner that the adapter keeps on the owner's
// border (plan/slice-1.md, section 4 and decision 5 of section 7).

import { memo } from 'react';
import type { Node, NodeProps } from '@xyflow/react';
import type { BorderData, Shape } from '../../core';

export type PortNodeProps = NodeProps<Node<BorderData, Shape>>;

/**
 * The contract.
 *
 * - The square is React Flow's own node element, by CSS: white, a 1.5 px teal border, corners of 2.5 px for `port` and
 *   5 px for `param`.
 * - **Near**: the arrow that data.glyph names, as the old page draws it (canvas/src/core/page/drawing.js 126-149): a
 *   shaft through the square's middle, across the owner's border, with a head pointing into the owner (`in`), out of
 *   it (`out`) or both (`inout`); none for null. And the name, `.grasp-port-name`, 12 px, outside the square at
 *   data.nameAt (a baseline's start, middle or end, from the square's corner), in an svg that does not clip.
 * - **Far**: neither. Always the one inert element with the classes `source target`, as BoxNode has it. Memoized.
 */
export function PortNode({ data, selected, width, height }: PortNodeProps): JSX.Element {
  return <Port data={data} selected={selected} width={width} height={height} />;
}

interface PortViewProps {
  data: BorderData;
  selected: boolean;
  width: number | undefined;
  height: number | undefined;
}

const f = (n: number): string => String(Math.round(n * 100) / 100);

/**
 * The arrow in a square `w` by `h`, as the old page draws it (core/page/drawing.js 126-149): a shaft through the
 * middle along the way in and out, 4.5 either side, and a head at the end that points into the owner, out of it, or
 * both. The owner is to the left of a port on a right border, above one on a bottom border, and so on.
 */
function arrow(side: BorderData['side'], way: 'in' | 'out' | 'inout', w: number, h: number): string {
  const horizontal = side === 'left' || side === 'right';
  const ix = side === 'right' ? -1 : side === 'left' ? 1 : 0;
  const iy = side === 'bottom' ? -1 : side === 'top' ? 1 : 0;
  const cx = w / 2;
  const cy = h / 2;
  const head = (dx: number, dy: number): string => {
    const bx = cx + 2 * dx;
    const by = cy + 2 * dy;
    const px = Math.abs(dy) * 2.5;
    const py = Math.abs(dx) * 2.5;
    return ` M${f(bx - px)},${f(by - py)} L${f(cx + 4.5 * dx)},${f(cy + 4.5 * dy)} L${f(bx + px)},${f(by + py)}`;
  };
  let d = horizontal ? `M${f(cx - 4.5)},${f(cy)} H${f(cx + 4.5)}` : `M${f(cx)},${f(cy - 4.5)} V${f(cy + 4.5)}`;
  for (const [dx, dy] of horizontal ? [[-1, 0], [1, 0]] : [[0, -1], [0, 1]]) {
    const into = dx === ix && dy === iy;
    if (way === 'inout' || (way === 'in') === into) d += head(dx, dy);
  }
  return d;
}

const Port = memo(function Port({ data, width, height }: PortViewProps): JSX.Element {
  const w = width ?? 16;
  const h = height ?? 16;
  return (
    <>
      <span className="grasp-node-handle source target" />
      {!data.far && (
        <svg className="grasp-port-svg" width={w} height={h} aria-hidden="true">
          {data.glyph && <path className="grasp-port-glyph" d={arrow(data.side, data.glyph, w, h)} />}
          {data.name !== '' && (
            <text className="grasp-port-name" x={data.nameAt.x} y={data.nameAt.y} textAnchor={data.nameAt.anchor}>{data.name}</text>
          )}
        </svg>
      )}
    </>
  );
}, (a, b) => a.data === b.data && a.selected === b.selected && a.width === b.width && a.height === b.height);
