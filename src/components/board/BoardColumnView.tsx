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
  columns: BoardColumn[];
  dragEnabled: boolean;
  onOpenTask: (task: Task) => void;
  onAddTask: (column: BoardColumn) => void;
}

/** Soft botanical board column with warm ivory cards. */
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
      icon: <Pencil size={15} aria-hidden="true" />,
      onSelect: () => setEditing(true),
    },
    ...ACCENT_KEYS.map((key: AccentColor) => ({
      label: ACCENT_LABELS[key],
      icon: dot(key),
      onSelect: () => actions.updateColumn(column.id, { color: key }),
    })),
    {
      label: 'Move left',
      icon: <ChevronLeft size={15} aria-hidden="true" />,
      disabled: index === 0,
      onSelect: () => actions.moveColumn(column.id, -1),
    },
    {
      label: 'Move right',
      icon: <ChevronRight size={15} aria-hidden="true" />,
      disabled: index === total - 1,
      onSelect: () => actions.moveColumn(column.id, 1),
    },
    {
      label: 'Delete column',
      icon: <Trash2 size={15} aria-hidden="true" />,
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
        'flex w-[84vw] max-w-[19rem] shrink-0 snap-start flex-col rounded-[12px] bg-paper-2/50 p-3.5 transition',
        isOver && 'ring-2 ring-accent/45 bg-paper-2/85',
      )}
    >
      <header className="flex items-center gap-2 border-b border-divider/65 pb-2.5">
        <span className={cx('h-2.5 w-2.5 shrink-0 rounded-full', tone.mid)} aria-hidden="true" />
        <h3 className="min-w-0 flex-1 truncate font-display text-lg text-ink leading-none">
          {column.name}
        </h3>
        <span className="font-typewriter text-xs text-text-faint tabular-nums">
          {tasks.length}
        </span>
        <div className="flex items-center">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => actions.moveColumn(column.id, -1)}
            aria-label={`Move ${column.name} column left`}
            title="Move left"
            className="grid h-7 w-7 place-items-center rounded-[6px] text-ink-soft hover:bg-cream/80 hover:text-ink disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => actions.moveColumn(column.id, 1)}
            aria-label={`Move ${column.name} column right`}
            title="Move right"
            className="grid h-7 w-7 place-items-center rounded-[6px] text-ink-soft hover:bg-cream/80 hover:text-ink disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>
        </div>
        <Menu label={`Options for ${column.name}`} header="Column" items={columnMenu}>
          <MoreVertical size={15} aria-hidden="true" />
        </Menu>
      </header>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="mt-3 flex min-h-20 flex-1 flex-col gap-2.5">
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
        <p className="mt-2 flex-1 py-4 text-center font-typewriter text-xs text-text-faint">
          {dragEnabled ? 'Drop a card here' : 'Nothing here yet'}
        </p>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="mt-2.5 w-full justify-start text-ink-soft hover:text-ink"
        onClick={() => onAddTask(column)}
        icon={<Plus size={14} aria-hidden="true" />}
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
