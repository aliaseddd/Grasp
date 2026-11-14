// A view's tab (plan/slice-2.md, section 4, seam 2; plan/architecture.md, contract 6): the body its kind names, or the
// card. It is what the dock puts into a view's tab, and the one place that picks a view's body, so the dock does not
// know the kinds.

import { useCallback, useSyncExternalStore } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { notDrawnText, viewsOf } from '../core';
import { NotDrawnYet } from '../plane/NotDrawnYet';
import { Plane } from '../plane/Plane';
import { bodyOf, isBuilt } from './bodies';
import type { BodyProps } from './bodies';

/** What the card says of a view the model no longer holds. */
export const VIEW_GONE = 'This view is not in the model.';

/**
 * The contract.
 *
 * - **It reads the view's kind** through viewsOf(session) (core/session.ts), and follows it: it renders again when
 *   the view's kind changes or the view leaves the model or comes back, and at no other change of the model.
 * - **With an entry of the registry that is built** (views/bodies.ts, isBuilt: its reader and its body are both
 *   there): for `body: 'graph'` it renders `<Plane session viewId />`; for a component, that component, with
 *   `session` and `viewId` and nothing else. A body is keyed by its renderer, so a view whose kind changes renderer
 *   gets a new body.
 * - **Otherwise** (no entry, a body or node types that are null, no reader yet, or a view the model does not hold) it
 *   renders the card, NotDrawnYet, inside the same root as a plane's: the class `grasp-plane`,
 *   `data-testid="plane"` and `data-view`, with the browser's own menu stopped for a right-click. Its first sentence
 *   is the adapter's notDrawnText of the kind, or VIEW_GONE.
 */
export function ViewHost({ session, viewId }: BodyProps): JSX.Element {
  const subscribe = useCallback((listener: () => void) => session.listen(listener), [session]);
  // The view's kind, or '' for a view the model does not hold: a string, so nothing renders while it stays the same.
  const kind = useSyncExternalStore(subscribe, () => viewsOf(session).find((view) => view.id === viewId)?.kind ?? '');
  const entry = kind === '' ? null : bodyOf(session.lib, kind);
  if (entry && isBuilt(entry)) {
    if (entry.body === 'graph') return <Plane key={entry.renderer} session={session} viewId={viewId} />;
    if (entry.body) {
      const Body = entry.body;
      return <Body key={entry.renderer} session={session} viewId={viewId} />;
    }
  }
  return (
    <div className="grasp-plane" data-testid="plane" data-view={viewId} onContextMenu={noBrowserMenu}>
      <NotDrawnYet text={kind === '' ? VIEW_GONE : notDrawnText(session.lib, kind)} />
    </div>
  );
}

const noBrowserMenu = (event: ReactMouseEvent): void => event.preventDefault();
