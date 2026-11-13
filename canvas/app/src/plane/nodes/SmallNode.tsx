// The node of the six small shapes, which keep the old page's forms (plan/slice-1.md, section 4): bar (a fork or a
// join), diamond (a decision or a merge), dot (a start), bullseye (a done), entry (a state's initial node), event.

import { memo } from 'react';
import type { Node, NodeProps } from '@xyflow/react';
import type { Shape, SmallData } from '../../core';

export type SmallNodeProps = NodeProps<Node<SmallData, Shape>>;

/**
 * The contract.
 *
 * - The shape fills the node's own size and is drawn far and near alike, as on the old page
 *   (canvas/src/behavior/page.js 86-117, canvas/src/sequence/page.js 28-37): a bar is an ink rectangle with corners
 *   of 3 px; a diamond joins the middles of the node's four sides; a dot is an ink disc; a bullseye a ring with an
 *   ink disc 5 px inside it; an entry an ink rectangle with corners of 4 px; an event an ink disc of radius 6.
 * - **Near**, a name when data.name has one, `.grasp-small-name`, 12 px, outside the shape: below and to the right of
 *   a bar or a diamond, to the right of and above an event.
 * - Always the one inert element with the classes `source target`, as BoxNode has it. Memoized.
 */
export function SmallNode({ data, selected, type, width, height }: SmallNodeProps): JSX.Element {
  return <Small data={data} selected={selected} shape={type} width={width} height={height} />;
}

interface SmallViewProps {
  data: SmallData;
  selected: boolean;
  shape: Shape;
  width: number | undefined;
  height: number | undefined;
}

const Small = memo(function Small({ data, shape, width, height }: SmallViewProps): JSX.Element {
  const w = width ?? 0;
  const h = height ?? 0;
  const cx = w / 2;
  const cy = h / 2;
  let form: JSX.Element | null = null;
  let name: { x: number; y: number } | null = null;
  if (shape === 'bar') {
    form = <rect className="grasp-small-fill" x="0" y="0" width={w} height={h} rx="3" />;
    name = { x: w + 2, y: h + 9 };
  } else if (shape === 'diamond') {
    form = <path className="grasp-small-outline" d={`M${cx},0.5 L${w - 0.5},${cy} L${cx},${h - 0.5} L0.5,${cy} Z`} />;
    name = { x: w + 2, y: h + 9 };
  } else if (shape === 'dot') {
    form = <circle className="grasp-small-fill" cx={cx} cy={cy} r={cx} />;
  } else if (shape === 'bullseye') {
    form = (
      <>
        <circle className="grasp-small-outline" cx={cx} cy={cy} r={cx - 0.5} />
        <circle className="grasp-small-fill" cx={cx} cy={cy} r={cx - 5} />
      </>
    );
  } else if (shape === 'entry') {
    form = <rect className="grasp-small-fill" x="0" y="0" width={w} height={h} rx="4" />;
  } else if (shape === 'event') {
    form = <circle className="grasp-small-fill" cx={cx} cy={cy} r="6" />;
    name = { x: cx + 10, y: cy - 5 };
  }
  return (
    <>
      <span className="grasp-node-handle source target" />
      <svg className="grasp-small-svg" width={w} height={h} aria-hidden="true">
        {form}
        {!data.far && data.name !== '' && name && <text className="grasp-small-name" x={name.x} y={name.y}>{data.name}</text>}
      </svg>
    </>
  );
}, (a, b) => a.data === b.data && a.selected === b.selected && a.shape === b.shape && a.width === b.width && a.height === b.height);
