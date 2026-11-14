// What every component body is drawn inside (plan/slice-2.md, section 4, seam 2): its root, its clicks, its
// right-click palette, its context, and its hand to the shell. It does for a component body what plane/Plane.tsx
// does for a plane, so that no body writes it again. It knows no reader and none of the model's records.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { selectionOf, toolsOf } from '../core';
import type { Hit, Session } from '../core';
import { Palette } from '../plane/Palette';
import type { PaletteAt } from '../plane/Palette';
import { BodyContext } from './bodyContext';
import type { BodyHands } from './bodyContext';
import { lend } from './lends';
import './body-frame.css';

export interface BodyFrameProps {
  session: Session;
  viewId: string;
  /** The body's renderer: 'grid', 'browser'. */
  renderer: string;
  /** A point of the window, in the view's own units. */
  toView(client: { x: number; y: number }): { x: number; y: number };
  /** Brings a place of the view into the window: a scroll. */
  reveal?(rect: { x: number; y: number; w: number; h: number }): void;
  /** The root has a size again after having none: a tab shown again. */
  onShown?(): void;
  children: ReactNode;
}

/**
 * The contract.
 *
 * - **The root** carries `data-testid="body"`, `data-view` (the view's id) and `data-renderer`, and the class
 *   `grasp-body`. It fills the tab, and scrolls when what it holds is larger (a body that scrolls a part of itself,
 *   under a header that stays, fills the root and scrolls that part).
 * - **What a body draws for an element or a relationship** carries `data-thing="<type>:<id>"` ('el:<id>' or
 *   'rel:<id>') on the element that takes its click.
 * - **A click** inside the root becomes one Hit: `type` and `id` from the nearest `data-thing` the click's target is
 *   inside, else the ground (`type` 'ground', `id` null); `at` from `toView` of the pointer; `add` from the event's
 *   ctrlKey or metaKey. It is offered to the tool in hand first and then to the selection, as on a plane:
 *   `if (!toolsOf(session).click(hit)) selectionOf(session).click(hit)`. So a click on a row picks its element, and a
 *   click on the empty ground picks the view. A control of the body's own (a header that sorts, a triangle that
 *   folds, a pin) stops its click (`event.stopPropagation()`), and the frame then hears none.
 * - **A right-click** inside the root opens the palette at the pointer with that Hit (`add` false) and stops the
 *   browser's own menu. The frame mounts the one `<Palette />` (plane/Palette.tsx).
 * - **It provides BodyContext** (views/bodyContext.ts): `toView` is the prop; `hitAt` goes through
 *   document.elementsFromPoint, looks only inside the root, passes over what is inside `data-pass`, and answers with
 *   the first element that is inside a `data-thing`, else the ground; `zoom()` is 1; `menu` opens the palette;
 *   `inside` asks the root's rectangle; `mark` sets `data-over` ('fits' or 'no') on each element of the root that
 *   carries that thing's `data-thing`, and takes it off the ones before (body-frame.css outlines it); `swallow`
 *   makes the next click no click, until the next press on the root.
 * - **It lends `reveal`** to the shell's hand while it is mounted (views/lends.ts), when the body gave one.
 * - **`onShown`** is called each time the root gets a size after having had none: Dockview takes a hidden tab's body
 *   out of the document, which loses its scroll place, and puts it back when the tab is shown again. It is not
 *   called for the size the root has when it mounts: a body sets its scroll place then itself.
 */
export function BodyFrame({ session, viewId, renderer, toView, reveal, onShown, children }: BodyFrameProps): JSX.Element {
  const root = useRef<HTMLDivElement>(null);
  const [palette, setPalette] = useState<PaletteAt | null>(null);
  const closePalette = useCallback(() => setPalette(null), []);
  // What the hands reach: the body's own functions as they are now, the flag of swallow(), and what is outlined.
  const now = useRef({ toView, reveal, onShown });
  now.current = { toView, reveal, onShown };
  const noClick = useRef(false);
  const over = useRef<{ key: string; marked: Element[] }>({ key: '', marked: [] });

  const hands = useMemo<BodyHands>(() => {
    const hitAt = (client: { x: number; y: number }): Hit => {
      const at = now.current.toView(client);
      const el = root.current;
      if (el) {
        for (const found of document.elementsFromPoint(client.x, client.y)) {
          if (!el.contains(found) || found === el || found.closest('[data-pass]')) continue;
          const thing = thingOf(found, el);
          if (thing) return { view: viewId, type: thing.type, id: thing.id, at, add: false };
        }
      }
      return { view: viewId, type: 'ground', id: null, at, add: false };
    };
    return {
      session,
      viewId,
      toView: (client) => now.current.toView(client),
      hitAt,
      zoom: () => 1,
      menu: (hit, client) => setPalette({ hit, left: client.x, top: client.y }),
      inside: (client) => {
        const r = root.current?.getBoundingClientRect();
        return !!r && client.x >= r.left && client.x <= r.right && client.y >= r.top && client.y <= r.bottom;
      },
      mark: (hit, fits) => {
        const key = hit && hit.id !== null && hit.type !== 'ground' ? `${hit.type}:${hit.id}|${fits ? 'fits' : 'no'}` : '';
        const was = over.current;
        if (key === was.key && was.marked.every((el) => el.isConnected)) return;
        for (const el of was.marked) el.removeAttribute('data-over');
        const marked: Element[] = [];
        if (key !== '' && root.current) {
          const thing = key.slice(0, key.lastIndexOf('|'));
          for (const el of root.current.querySelectorAll('[data-thing]')) {
            if (el.getAttribute('data-thing') !== thing) continue;
            el.setAttribute('data-over', fits ? 'fits' : 'no');
            marked.push(el);
          }
        }
        over.current = { key, marked };
      },
      swallow: () => { noClick.current = true; },
    };
  }, [session, viewId]);

  const hitOf = (event: ReactMouseEvent, add: boolean): Hit => {
    const el = root.current;
    const thing = el && event.target instanceof Element ? thingOf(event.target, el) : null;
    const at = toView({ x: event.clientX, y: event.clientY });
    return thing ? { view: viewId, type: thing.type, id: thing.id, at, add } : { view: viewId, type: 'ground', id: null, at, add };
  };
  // React hands an event from inside a portal (a tooltip, a menu of the body's) on to the root; only what is inside
  // the root's own element is the frame's.
  const within = (event: ReactMouseEvent): boolean => event.target instanceof Node && !!root.current?.contains(event.target);
  const clicked = (event: ReactMouseEvent): void => {
    if (noClick.current || !within(event)) return;
    const hit = hitOf(event, event.ctrlKey || event.metaKey);
    if (!toolsOf(session).click(hit)) selectionOf(session).click(hit);
  };
  const rightClicked = (event: ReactMouseEvent): void => {
    if (!within(event)) return;
    event.preventDefault();
    setPalette({ hit: hitOf(event, false), left: event.clientX, top: event.clientY });
  };

  // The press that follows a swallowed click takes the flag away, before any click of its own.
  useEffect(() => {
    const el = root.current;
    const clear = (): void => { noClick.current = false; };
    el?.addEventListener('pointerdown', clear, true);
    return () => el?.removeEventListener('pointerdown', clear, true);
  }, []);

  // What the frame lends the shell while it is mounted.
  const reveals = reveal !== undefined;
  useEffect(() => {
    if (!reveals) return undefined;
    return lend(session, viewId, { reveal: (rect) => now.current.reveal?.(rect) });
  }, [session, viewId, reveals]);

  // Shown again: the root has a size after having had none.
  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    let had = el.clientWidth > 0 && el.clientHeight > 0;
    const observer = new ResizeObserver((entries) => {
      const box = entries[entries.length - 1].contentRect;
      const has = box.width > 0 && box.height > 0;
      if (has && !had) now.current.onShown?.();
      had = has;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The palette is beside the root, not inside it: a click on one of its entries is no click on the body.
  return (
    <>
      <div
        ref={root}
        className="grasp-body"
        data-testid="body"
        data-view={viewId}
        data-renderer={renderer}
        onClick={clicked}
        onContextMenu={rightClicked}
      >
        <BodyContext.Provider value={hands}>{children}</BodyContext.Provider>
      </div>
      <Palette session={session} at={palette} onClose={closePalette} />
    </>
  );
}

/** The thing an element of a body stands for: the nearest `data-thing` it is inside, within the root, as its type and id; null for none, and for a word that is neither 'el:' nor 'rel:'. */
function thingOf(target: Element, root: Element): { type: 'el' | 'rel'; id: string } | null {
  const holder = target.closest('[data-thing]');
  if (!holder || !root.contains(holder) || holder === root) return null;
  const thing = holder.getAttribute('data-thing') ?? '';
  const colon = thing.indexOf(':');
  const type = thing.slice(0, colon);
  return (type === 'el' || type === 'rel') && colon < thing.length - 1 ? { type, id: thing.slice(colon + 1) } : null;
}
