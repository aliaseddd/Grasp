// A plane's minimap, at its bottom right (plan/slice-1.md, section 4; plan/swarm/step-8.md, change 4). Until step 8
// draws one of our own, it is React Flow's. Plane.tsx renders it inside React Flow, only while the plane is as large
// as the adapter's hasMinimap(width, height) asks.

import { MiniMap } from '@xyflow/react';
import { MINIMAP } from '../core';
import type { ViewStore } from './viewStore';

export interface PlaneMiniMapProps {
  /** The store of the view the plane shows. */
  store: ViewStore;
}

const STYLE = { width: MINIMAP.width, height: MINIMAP.height };

/** The minimap of a plane: the adapter's MINIMAP in size, with the class react-flow__minimap, in a React Flow panel. */
export function PlaneMiniMap(_props: PlaneMiniMapProps): JSX.Element {
  return <MiniMap style={STYLE} />;
}
