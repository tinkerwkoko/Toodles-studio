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

/** Colour ink swatch, reminder toggle and tags. */
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
        <legend className="text-[13px] font-sans font-medium text-ink">Ink colour</legend>
        <div className="flex flex-wrap items-center gap-2 py-1">
          {ACCENT_KEYS.map((key: AccentColor) => (
            <button
              key={key}
              type="button"
              title={ACCENT_LABELS[key]}
              aria-label={ACCENT_LABELS[key]}
              aria-pressed={values.color === key}
              onClick={() => patch({ color: key })}
              className={cx(
                'h-7 w-7 rounded-full border-2 transition cursor-pointer',
                accent(key).mid,
                values.color === key
                  ? 'scale-110 border-ink ring-2 ring-paper-2'
                  : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105',
              )}
            />
          ))}
        </div>
      </fieldset>

      <div className="sm:col-span-1 flex flex-col justify-end">
        <label className="flex min-h-[40px] cursor-pointer items-center gap-2.5 rounded-[4px] border border-lilac-200 bg-cream px-3 py-2 transition hover:bg-paper-2/50">
          <input
            type="checkbox"
            checked={values.reminder}
            onChange={(event) => patch({ reminder: event.target.checked })}
            className="h-4 w-4 rounded-[2px] accent-accent shrink-0"
          />
          <span className="text-xs font-sans font-medium text-ink leading-tight">
            Remind me on this device
            <span className="block text-[11px] font-normal italic text-ink-soft">
              While open, with notifications allowed
            </span>
          </span>
        </label>
      </div>

      <div className="sm:col-span-1">
        <Field label="Tags" htmlFor="task-tags">
          <div className="flex flex-wrap items-center gap-1.5 rounded-[4px] border border-lilac-200 bg-cream px-2.5 py-1.5 min-h-[40px] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15">
            {values.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-[3px] bg-paper-2 px-1.5 py-0.5 text-xs font-sans text-ink"
              >
                #{tag}
                <button
                  type="button"
                  aria-label={`Remove tag ${tag}`}
                  onClick={() => patch({ tags: values.tags.filter((item) => item !== tag) })}
                  className="grid h-4 w-4 place-items-center rounded-[2px] hover:bg-lilac-200/70 cursor-pointer"
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
              className="min-w-20 flex-1 bg-transparent px-1 text-xs outline-none placeholder:text-text-faint font-sans"
            />
          </div>
        </Field>
      </div>
    </>
  );
}
