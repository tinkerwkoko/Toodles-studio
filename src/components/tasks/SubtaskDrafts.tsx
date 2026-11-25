import { Plus, Trash2 } from 'lucide-react';
import { accent } from '../../lib/color';
import { Button } from '../ui/Button';
import { cx } from '../../lib/cx';
import type { TaskFormValues } from './taskFormValues';

export interface SubtaskDraftProps {
  values: TaskFormValues;
  draft: string;
  onDraftChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

/** Inline subtask editing while a task is still being created or edited. */
export function SubtaskDrafts({
  values,
  draft,
  onDraftChange,
  onAdd,
  onRemove,
  onRename,
}: SubtaskDraftProps) {
  return (
    <fieldset className="space-y-2.5 border-t border-divider pt-4">
      <legend className="text-[13px] font-sans font-medium text-ink tabular-nums">
        Little steps {values.subtasks.length > 0 && `(${values.subtasks.length})`}
      </legend>

      {values.subtasks.length > 0 && (
        <ul className="space-y-2">
          {values.subtasks.map((subtask) => (
            <li key={subtask.id} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cx('h-2 w-2 rounded-full shrink-0', accent(subtask.color).mid)}
              />
              <input
                value={subtask.title}
                onChange={(event) => onRename(subtask.id, event.target.value)}
                aria-label="Subtask title"
                className="h-9 flex-1 rounded-[4px] border border-lilac-200 bg-cream px-3 font-sans text-sm text-ink focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onRemove(subtask.id)}
                aria-label={`Remove subtask ${subtask.title}`}
                className="grid h-9 w-9 place-items-center rounded-[4px] text-rose-700 transition hover:bg-rose-100 cursor-pointer"
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onAdd();
            }
          }}
          placeholder="Break it into small steps..."
          aria-label="Add a subtask"
          className="h-9 flex-1 rounded-[4px] border border-lilac-200 bg-cream px-3 font-sans text-sm text-ink placeholder:text-text-faint placeholder:italic focus:border-accent focus:outline-none"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={draft.trim().length === 0}
          icon={<Plus size={14} aria-hidden="true" />}
        >
          Add
        </Button>
      </div>
    </fieldset>
  );
}
