import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { newId } from '../../lib/factories';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Field';
import { useToodles } from '../../store/useToodles';
import { TaskFields } from './TaskFields';
import { TaskExtras } from './TaskExtras';
import { SubtaskDrafts } from './SubtaskDrafts';
import { EMPTY_TASK_FORM, parseTags, type TaskFormValues } from './taskFormValues';

export interface TaskFormProps {
  initial?: TaskFormValues;
  submitLabel: string;
  onSubmit: (values: TaskFormValues) => void;
  onDelete?: () => void;
  /** Pinned project: hides the project picker (used inside a project). */
  lockedProjectId?: string | null;
  hint?: string;
  children?: ReactNode;
  quickCreate?: ReactNode;
}

export function TaskForm({
  initial,
  submitLabel,
  onSubmit,
  onDelete,
  lockedProjectId,
  hint,
  children,
  quickCreate,
}: TaskFormProps) {
  const { data } = useToodles();
  const [values, setValues] = useState<TaskFormValues>(initial ?? EMPTY_TASK_FORM);
  const [tagDraft, setTagDraft] = useState('');
  const [subtaskDraft, setSubtaskDraft] = useState('');

  const projects = useMemo(
    () => data.projects.filter((project) => !project.archived),
    [data.projects],
  );

  const canSubmit = values.title.trim().length > 0;

  function patch(next: Partial<TaskFormValues>): void {
    setValues((current) => ({ ...current, ...next }));
  }

  function commitTag(): void {
    const tags = parseTags(tagDraft);
    if (tags.length === 0) return;
    patch({ tags: [...new Set([...values.tags, ...tags])] });
    setTagDraft('');
  }

  function addDraftSubtask(): void {
    const title = subtaskDraft.trim();
    if (title.length === 0) return;
    patch({ subtasks: [...values.subtasks, { id: newId(), title, color: values.color }] });
    setSubtaskDraft('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(values);
    if (!initial) {
      setValues(EMPTY_TASK_FORM);
      setTagDraft('');
      setSubtaskDraft('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="task-title" className="sr-only">
          Task title
        </label>
        <input
          id="task-title"
          data-autofocus
          value={values.title}
          onChange={(event) => patch({ title: event.target.value })}
          placeholder="What needs to get done?"
          className="w-full rounded-2xl border border-lilac-200 bg-cream px-4 py-3 font-display text-xl text-ink placeholder:text-ink-soft/60 focus:border-lilac-400 focus:outline-none focus:ring-4 focus:ring-lilac-200/70"
        />
        <label htmlFor="task-notes" className="sr-only">
          Notes
        </label>
        <Textarea
          id="task-notes"
          rows={2}
          value={values.description}
          onChange={(event) => patch({ description: event.target.value })}
          placeholder="Add a little context..."
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TaskFields
          values={values}
          patch={patch}
          projects={projects}
          lockedProjectId={lockedProjectId}
        />
        <TaskExtras
          values={values}
          patch={patch}
          tagDraft={tagDraft}
          onTagDraftChange={setTagDraft}
          onCommitTag={commitTag}
        />
      </div>

      <SubtaskDrafts
        values={values}
        draft={subtaskDraft}
        onDraftChange={setSubtaskDraft}
        onAdd={addDraftSubtask}
        onRemove={(id) =>
          patch({ subtasks: values.subtasks.filter((subtask) => subtask.id !== id) })
        }
        onRename={(id, title) =>
          patch({
            subtasks: values.subtasks.map((subtask) =>
              subtask.id === id ? { ...subtask, title } : subtask,
            ),
          })
        }
      />

      {children}

      <div className="flex flex-col gap-3 border-t border-lilac-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-soft">
          {hint ?? 'A title is all you need. Everything else can wait until later.'}
        </p>
        <div className="flex items-center gap-2">
          {onDelete && (
            <Button
              variant="ghost"
              onClick={onDelete}
              icon={<Trash2 size={17} aria-hidden="true" />}
              className="text-rose-700 hover:bg-rose-100"
            >
              Delete
            </Button>
          )}
          <Button type="submit" disabled={!canSubmit} className="flex-1 sm:flex-none">
            {submitLabel}
          </Button>
        </div>
      </div>

      {quickCreate && (
        <div className="border-t border-dashed border-lilac-200 pt-3 text-center text-sm text-ink-soft">
          {quickCreate}
        </div>
      )}
    </form>
  );
}
