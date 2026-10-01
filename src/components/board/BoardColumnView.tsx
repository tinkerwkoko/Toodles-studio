import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ChevronLeft, ChevronRight, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import type { AccentColor, BoardColumn, Task } from '../../types';
import { ACCENT_KEYS, ACCENT_LABELS, accent } from '../../lib/color';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Menu, type MenuItem } from '../ui/Menu';
import { BoardCard } from './BoardCard';
import { ColumnDialog, type ColumnDialogValues } from './ColumnDialog';
import { cx } from '../../lib/cx';
import { useToodles } from '../../store/useToodles';
import { useUi } from '../../store/useUi';

export interface BoardColumnViewProps {
  column: BoardColumn;
  index: number;
  total: number;
  tasks: Task[];
  /** All columns of the board, for each card's "Move to…" menu. */
  columns: BoardColumn[];
  dragEnabled: boolean;
  onOpenTask: (task: Task) => void;
  onAddTask: (column: BoardColumn) => void;
}

/** One board column: name, count, column menu and its stack of cards. */
export function BoardColumnView({
  column,
  index,
  total,
  tasks,
  columns,
  dragEnabled,
  onOpenTask,
  onAddTask,
}: BoardColumnViewProps) {
  const { actions } = useToodles();
  const { pushToast } = useUi();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const tone = accent(column.color);

  const dot = (key: AccentColor) => (
    <span className={cx('h-2.5 w-2.5 rounded-full', accent(key).mid)} aria-hidden="true" />
  );

  const columnMenu: MenuItem[] = [
    {
      label: 'Rename column',
      icon: <Pencil size={16} aria-hidden="true" />,
      onSelect: () => setEditing(true),
    },
    ...ACCENT_KEYS.map((key: AccentColor) => ({
      label: ACCENT_LABELS[key],
      icon: dot(key),
      onSelect: () => actions.updateColumn(column.id, { color: key }),
    })),
    {
      label: 'Move left',
      icon: <ChevronLeft size={16} aria-hidden="true" />,
      disabled: index === 0,
      onSelect: () => actions.moveColumn(column.id, -1),
    },
    {
      label: 'Move right',
      icon: <ChevronRight size={16} aria-hidden="true" />,
      disabled: index === total - 1,
      onSelect: () => actions.moveColumn(column.id, 1),
    },
    {
      label: 'Delete column',
      icon: <Trash2 size={16} aria-hidden="true" />,
      danger: true,
      disabled: total <= 1,
      onSelect: () => setConfirmDelete(true),
    },
  ];

  function saveColumn(values: ColumnDialogValues): void {
    actions.updateColumn(column.id, values);
    setEditing(false);
    pushToast('Column updated', 'success');
  }

  return (
    <section
      aria-label={`${column.name} column`}
      className={cx(
        'flex w-[84vw] max-w-[19rem] shrink-0 snap-start flex-col rounded-3xl border p-3',
        tone.soft,
        tone.border,
        isOver && 'ring-2 ring-lilac-400',
      )}
    >
      <header className="flex items-center gap-2">
        <span className={cx('h-3 w-3 shrink-0 rounded-full', tone.mid)} aria-hidden="true" />
        <h3 className={cx('min-w-0 flex-1 truncate text-base', tone.text)}>{column.name}</h3>
        <span className="rounded-full bg-cream/80 px-2 py-0.5 text-xs font-bold text-ink-soft">
          {tasks.length}
        </span>
        <Menu label={`Options for ${column.name}`} header="Column" items={columnMenu}>
          <MoreVertical size={17} aria-hidden="true" />
        </Menu>
      </header>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="mt-3 flex min-h-20 flex-1 flex-col gap-2">
          {tasks.map((task) => (
            <li key={task.id}>
              <BoardCard
                task={task}
                columns={columns}
                onOpen={onOpenTask}
                dragEnabled={dragEnabled}
              />
            </li>
          ))}
        </ul>
      </SortableContext>

      {tasks.length === 0 && (
        <p className="mt-2 flex-1 py-3 text-center text-sm text-ink-soft">
          {dragEnabled ? 'Drop a card here' : 'Nothing here yet'}
        </p>
      )}

      <Button
        variant="soft"
        className="mt-2 w-full"
        onClick={() => onAddTask(column)}
        icon={<Plus size={17} aria-hidden="true" />}
      >
        Add a card
      </Button>

      <ColumnDialog
        open={editing}
        title={`Edit “${column.name}”`}
        initialName={column.name}
        initialColor={column.color}
        submitLabel="Save column"
        onSave={saveColumn}
        onClose={() => setEditing(false)}
      />

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete “${column.name}”?`}
        tone="danger"
        confirmLabel="Delete column"
        body={
          <p>
            The column disappears. Its {tasks.length === 0 ? 'cards' : `${tasks.length} card${tasks.length === 1 ? '' : 's'}`}{' '}
            {total > 1 ? 'move to the first remaining column. Nothing is deleted.' : 'would be removed along with it.'}
          </p>
        }
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          actions.deleteColumn(column.id);
          setConfirmDelete(false);
          pushToast('Column deleted');
        }}
      />
    </section>
  );
}
