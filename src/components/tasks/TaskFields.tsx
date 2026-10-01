import type { Priority, RepeatRule } from '../../types';
import { PRIORITY_KEYS, PRIORITY_STYLES } from '../../lib/color';
import { REPEAT_LABELS } from '../../lib/task';
import { Field, Input, Select } from '../ui/Field';
import { DatePicker } from '../ui/DatePicker';
import { TimePicker } from '../ui/TimePicker';
import type { TaskFormValues } from './taskFormValues';

export interface TaskFieldsProps {
  values: TaskFormValues;
  patch: (next: Partial<TaskFormValues>) => void;
  projects: Array<{ id: string; name: string; emoji: string }>;
  /** When set, the project picker is hidden (we are already inside it). */
  lockedProjectId?: string | null;
}

const ESTIMATE_SUGGESTIONS = [15, 30, 45, 60, 90, 120, 180];

/** Priority, project, dates, time and estimate — the tidy two-column grid. */
export function TaskFields({ values, patch, projects, lockedProjectId }: TaskFieldsProps) {
  return (
    <>
      <Field label="Priority" htmlFor="task-priority">
        <Select
          id="task-priority"
          value={values.priority}
          onChange={(event) => patch({ priority: event.target.value as Priority })}
        >
          {PRIORITY_KEYS.map((key) => (
            <option key={key} value={key}>
              {PRIORITY_STYLES[key].label}
            </option>
          ))}
        </Select>
      </Field>

      {lockedProjectId === undefined && (
        <Field label="Project" htmlFor="task-project">
          <Select
            id="task-project"
            value={values.projectId}
            onChange={(event) => patch({ projectId: event.target.value })}
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.emoji} {project.name}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Field label="Start date">
        <DatePicker
          value={values.startDate}
          onChange={(startDate) => patch({ startDate })}
          placeholder="Pick start date"
        />
      </Field>

      <Field label="Due date">
        <DatePicker
          value={values.dueDate}
          onChange={(dueDate) => patch({ dueDate })}
          placeholder="Pick due date"
        />
      </Field>

      <Field label="Time">
        <TimePicker
          value={values.dueTime}
          onChange={(dueTime) => patch({ dueTime })}
          placeholder="Pick quiet time"
        />
      </Field>

      <Field label="Estimate (minutes)" htmlFor="task-estimate">
        <Input
          id="task-estimate"
          type="number"
          min={5}
          step={5}
          list="task-estimate-options"
          value={values.estimate}
          onChange={(event) => patch({ estimate: event.target.value })}
          placeholder="30"
        />
        <datalist id="task-estimate-options">
          {ESTIMATE_SUGGESTIONS.map((minutes) => (
            <option key={minutes} value={minutes} />
          ))}
        </datalist>
      </Field>

      <Field label="Repeat" htmlFor="task-repeat">
        <Select
          id="task-repeat"
          value={values.repeat}
          onChange={(event) => patch({ repeat: event.target.value as RepeatRule })}
        >
          {(Object.keys(REPEAT_LABELS) as RepeatRule[]).map((key) => (
            <option key={key} value={key}>
              {REPEAT_LABELS[key]}
            </option>
          ))}
        </Select>
      </Field>
    </>
  );
}
