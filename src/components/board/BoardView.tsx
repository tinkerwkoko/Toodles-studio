import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { AccentColor, BoardColumn, Project, Task } from '../../types';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { BoardColumnView } from './BoardColumnView';
import { ColumnDialog } from './ColumnDialog';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useToodles } from '../../store/useToodles';

export interface BoardViewProps {
  project: Project;
  tasks: Task[];
  columns: BoardColumn[];
  onOpenTask: (task: Task) => void;
  onAddTask: (column: BoardColumn) => void;
}

/**
 * Kanban board. Phones get horizontal scroll with snap plus a "Move to…" menu on
 * every card; from tablet width up cards can also be dragged between columns.
 */
export function BoardView({ project, tasks, columns, onOpenTask, onAddTask }: BoardViewProps) {
  const { actions } = useToodles();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // Dragging needs a mouse-ish pointer; touch boards rely on the card menu.
  const dragEnabled = useMediaQuery('(min-width: 768px)');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeTask = activeId ? tasks.find((task) => task.id === activeId) ?? null : null;

  function handleDragStart(event: DragStartEvent): void {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent): void {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const overId = String(over.id);
    if (taskId === overId) return;

    const overTask = tasks.find((task) => task.id === overId);
    const targetColumnId = overTask
      ? overTask.boardColumnId
      : columns.some((column) => column.id === overId)
        ? overId
        : null;
    if (!targetColumnId) return;

    // Dropping on a card inserts above it; dropping on the column puts it on top.
    const beforeTaskId =
      overTask && overTask.boardColumnId === targetColumnId ? overTask.id : null;
    actions.placeTaskOnBoard(taskId, targetColumnId, beforeTaskId);
  }

  function addColumn(values: { name: string; color: AccentColor }): void {
    actions.addColumn(project.id, values.name, values.color);
    setAdding(false);
  }

  if (columns.length === 0) {
    return (
      <EmptyState
        title="This board is empty"
        sentence="Give it some columns: a gentle To do, Doing and Done is a good place to start."
        actionLabel="Add a column"
        onAction={() => setAdding(true)}
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 md:snap-none">
        {columns.map((column, index) => (
          <BoardColumnView
            key={column.id}
            column={column}
            index={index}
            total={columns.length}
            columns={columns}
            tasks={tasks.filter((task) => task.boardColumnId === column.id)}
            dragEnabled={dragEnabled}
            onOpenTask={onOpenTask}
            onAddTask={onAddTask}
          />
        ))}

        <div className="w-[84vw] max-w-[19rem] shrink-0 snap-start md:w-[17rem]">
          <Button
            variant="outline"
            block
            onClick={() => setAdding(true)}
            icon={<Plus size={17} aria-hidden="true" />}
          >
            Add a column
          </Button>
          {!dragEnabled && (
            <p className="mt-2 px-1 text-xs text-ink-soft">
              Swipe sideways to see every column. Use “Move to…” on a card to change its column.
            </p>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <p className="rotate-2 rounded-2xl border-[1.5px] border-lilac-200 bg-cream px-4 py-3 font-title font-medium shadow-lift">
            {activeTask.title}
          </p>
        ) : null}
      </DragOverlay>

      <ColumnDialog
        open={adding}
        title="A new column"
        initialName=""
        initialColor="sky"
        submitLabel="Add column"
        onSave={addColumn}
        onClose={() => setAdding(false)}
      />
    </DndContext>
  );
}
