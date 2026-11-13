import { forwardRef, useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import type React from 'react';
import { RichTreeView, TreeItemProvider, useRichTreeViewApiRef, useTreeItem } from '@mui/x-tree-view';
import type { TreeItemProps } from '@mui/x-tree-view';
import { selectionOf } from '../core';
import type { Session } from '../core';
import { useDock } from '../shell/dockContext';
import { explorerRowsOf, pickedOf, rowId, rowOf } from './explorerRows';
import type { ExplorerRows, TreeItem as Item } from './explorerRows';
import { SidePanel, SideText } from './SidePanel';
import './explorer.css';

export function ExplorerPanel(): JSX.Element {
  const { session, showView } = useDock();
  return (
    <SidePanel testId="explorer" title="Explorer">
      {session ? <Tree session={session} showView={showView} /> : <SideText>No model is open.</SideText>}
    </SidePanel>
  );
}

const RowsContext = { current: null as ExplorerRows | null };
const none = (): (() => void) => () => {};

function Words({ id }: { id: string }): JSX.Element {
  const rows = RowsContext.current;
  const words = useSyncExternalStore(rows ? rows.listen : none, () => (rows ? rows.wordsOf(id) : null));
  if (!words) return <span />;
  return (
    <span className="grasp-row-words" title={words.kw + words.name + words.type}>
      {words.kw && <span className="grasp-row-kw">{words.kw}</span>}
      <span className="grasp-row-name">{words.name}</span>
      {words.type && <span className="grasp-row-type">{words.type}</span>}
    </span>
  );
}

const Act = { current: null as null | ((id: string, how: 'click' | 'key') => boolean) };
const Front = { listen: none as (l: () => void) => () => void, get: (() => null) as () => string | null };
const RowItem = forwardRef(function RowItem(props: TreeItemProps, ref: React.Ref<HTMLLIElement>) {
  const { id, itemId, label, children, disabled } = props;
  const { getContextProviderProps, getRootProps, getContentProps, getIconContainerProps, getGroupTransitionProps, status } = useTreeItem({ id, itemId, label, children, disabled, rootRef: ref });
  const front = useSyncExternalStore(Front.listen, () => Front.get() === itemId);
  const onKeyDown = (event: React.KeyboardEvent & { defaultMuiPrevented?: boolean }): void => {
    if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return;
    if (Act.current?.(itemId, 'key')) { event.defaultMuiPrevented = true; event.preventDefault(); }
  };
  const { status: _status, ...content } = getContentProps({ 'data-row': itemId, className: 'grasp-row' } as never) as Record<string, unknown>;
  void _status;
  const group = getGroupTransitionProps() as { children?: React.ReactNode };
  const pickable = pickedOf(itemId) !== null;
  return (
    <TreeItemProvider {...getContextProviderProps()}>
      <li {...(getRootProps({ onKeyDown } as never) as React.HTMLAttributes<HTMLLIElement>)} className="grasp-row-item" aria-checked={undefined} aria-selected={pickable ? status.selected : undefined} aria-current={front ? 'true' : undefined}>
        <div {...(content as React.HTMLAttributes<HTMLDivElement>)}>
          <span {...(getIconContainerProps() as React.HTMLAttributes<HTMLSpanElement>)} className="grasp-row-icon">
            {status.expandable && (
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path className="grasp-row-chevron" d={status.expanded ? 'M4,6 L8,10 L12,6' : 'M6,4 L10,8 L6,12'} /></svg>
            )}
          </span>
          <Words id={itemId} />
        </div>
        {status.expandable && status.expanded && <ul role="group" className="grasp-row-group">{group.children}</ul>}
      </li>
    </TreeItemProvider>
  );
});
const SLOTS = { item: RowItem };
const unselectable = (item: Item): boolean => pickedOf(item.id) === null;

function Tree({ session, showView }: { session: Session; showView: (viewId: string) => void }): JSX.Element {
  const rows = explorerRowsOf(session);
  RowsContext.current = rows;
  const selection = selectionOf(session);
  const items = useSyncExternalStore(rows.listen, () => rows.items);
  const unfolded = useSyncExternalStore(rows.listen, () => rows.unfolded);
  const picked = useSyncExternalStore(selection.listen, () => selection.items);
  const selected = useMemo(() => picked.map((p) => rowId(p.type, p.id)), [picked]);
  const api = useRichTreeViewApiRef();
  const root = useRef<HTMLDivElement>(null);
  const onSelected = useCallback((_event: unknown, ids: string[]) => {
    selection.set(ids.map(pickedOf).filter((p): p is NonNullable<typeof p> => p !== null));
  }, [selection]);
  const onExpanded = useCallback((_event: unknown, ids: string[]) => rows.folded(ids), [rows]);
  const act = useCallback((id: string, how: 'click' | 'key'): boolean => {
    const row = rowOf(id);
    if (row?.type === 'view') {
      if (how === 'key') selection.set([{ type: 'view', id: row.id }]);
      showView(row.id);
      return true;
    }
    if (row?.type === 'more') { rows.showMore(row.id); return true; }
    return false;
  }, [rows, showView, selection]);
  Act.current = act;
  Front.listen = selection.listen;
  Front.get = () => (selection.view === null ? null : rowId('view', selection.view));
  const onItemClick = useCallback((_event: unknown, id: string) => { act(id, 'click'); }, [act]);
  useEffect(() => {
    const last = picked[0];
    if (!last) return;
    const el = root.current?.querySelector(`[data-row=${JSON.stringify(rowId(last.type, last.id))}]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [picked]);
  return (
    <div ref={root} className="grasp-explorer">
      <RichTreeView
        apiRef={api}
        items={items as Item[]}
        slots={SLOTS}
        multiSelect
        selectedItems={selected}
        onSelectedItemsChange={onSelected}
        expandedItems={unfolded as string[]}
        onExpandedItemsChange={onExpanded}
        expansionTrigger="iconContainer"
        isItemSelectionDisabled={unselectable}
        onItemClick={onItemClick}
        itemChildrenIndentation={16}
        aria-label="The model"
      />
    </div>
  );
}
