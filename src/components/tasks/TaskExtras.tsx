import type { AccentColor } from '../../types';
import { ACCENT_KEYS, ACCENT_LABELS, accent } from '../../lib/color';
import { Field } from '../ui/Field';
import { cx } from '../../lib/cx';
import type { TaskFormValues } from './taskFormValues';

export interface TaskExtrasProps {
  values: TaskFormValues;
  patch: (next: Partial<TaskFormValues>) => void;
  tagDraft: string;
  onTagDraftChange: (value: string) => void;
  onCommitTag: () => void;
}

/** Colour, reminder and tags — the "nice to have" half of the grid. */
export function TaskExtras({
  values,
  patch,
  tagDraft,
  onTagDraftChange,
  onCommitTag,
}: TaskExtrasProps) {
  return (
    <>
      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-bold text-lilac-700">Colour</legend>
        <div className="flex flex-wrap items-center gap-2 py-1.5">
          {ACCENT_KEYS.map((key: AccentColor) => (
            <button
              key={key}
              type="button"
              aria-label={ACCENT_LABELS[key]}
              aria-pressed={values.color === key}
              onClick={() => patch({ color: key })}
              className={cx(
                'h-9 w-9 rounded-full border-2 transition',
                accent(key).mid,
                values.color === key
                  ? 'scale-105 border-lilac-700'
                  : 'border-transparent hover:scale-105',
              )}
            />
          ))}
        </div>
      </fieldset>

      <div className="sm:col-span-1 flex flex-col justify-end">
        <label className="flex min-h-[42px] cursor-pointer items-center gap-2.5 rounded-2xl border border-lilac-200 bg-cream px-3 py-2 transition hover:bg-lilac-50">
          <input
            type="checkbox"
            checked={values.reminder}
            onChange={(event) => patch({ reminder: event.target.checked })}
            className="h-4 w-4 rounded accent-accent shrink-0"
          />
          <span className="text-xs font-title font-medium text-ink leading-tight">
            Remind me on this device
            <span className="block text-[11px] font-sans font-normal text-ink-soft">
              While open, with notifications allowed
            </span>
          </span>
        </label>
      </div>

      <div className="sm:col-span-1">
        <Field label="Tags" htmlFor="task-tags">
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-lilac-200 bg-cream px-2 py-1.5 min-h-[42px]">
            {values.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-lilac-100 px-2 py-0.5 text-xs font-sans text-ink"
              >
                {tag}
                <button
                  type="button"
                  aria-label={`Remove tag ${tag}`}
                  onClick={() => patch({ tags: values.tags.filter((item) => item !== tag) })}
                  className="grid h-4 w-4 place-items-center rounded-full hover:bg-lilac-200"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </span>
            ))}
            <input
              id="task-tags"
              value={tagDraft}
              onChange={(event) => onTagDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ',') {
                  event.preventDefault();
                  onCommitTag();
                }
              }}
              onBlur={onCommitTag}
              placeholder={values.tags.length === 0 ? 'study, home...' : '+ tag'}
              className="min-w-20 flex-1 bg-transparent px-1 text-xs outline-none placeholder:text-ink-soft/70 font-sans"
            />
          </div>
        </Field>
      </div>
    </>
  );
}
