import { useRef, useState, type FormEvent } from 'react';
import { ImagePlus, X } from 'lucide-react';
import type { DiaryEntry, MoodLevel } from '../../types';
import { todayString } from '../../lib/date';
import { Button } from '../ui/Button';
import { Field, Input, Select, Textarea } from '../ui/Field';
import { DatePicker } from '../ui/DatePicker';
import { MoodPicker } from '../habits/MoodPicker';
import { useToodles } from '../../store/useToodles';
import { parseTags } from '../tasks/taskFormValues';

export interface DiaryFormValues {
  date: string;
  title: string;
  body: string;
  mood: MoodLevel | null;
  projectId: string;
  tags: string[];
  photos: string[];
}

export function emptyDiaryForm(date = todayString()): DiaryFormValues {
  return { date, title: '', body: '', mood: null, projectId: '', tags: [], photos: [] };
}

export function diaryToFormValues(entry: DiaryEntry): DiaryFormValues {
  return {
    date: entry.date,
    title: entry.title,
    body: entry.body,
    mood: entry.mood,
    projectId: entry.projectId ?? '',
    tags: entry.tags,
    photos: entry.photos ?? [],
  };
}

export interface DiaryFormProps {
  initial?: DiaryFormValues;
  submitLabel: string;
  onSubmit: (values: DiaryFormValues) => void;
  onDelete?: () => void;
}

export function DiaryForm({ initial, submitLabel, onSubmit, onDelete }: DiaryFormProps) {
  const { data } = useToodles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<DiaryFormValues>(initial ?? emptyDiaryForm());
  const [tagDraft, setTagDraft] = useState(initial?.tags.join(', ') ?? '');
  const canSubmit = values.title.trim().length > 0 || values.body.trim().length > 0;

  function patch(next: Partial<DiaryFormValues>): void {
    setValues((current) => ({ ...current, ...next }));
  }

  function handleAddPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      patch({ photos: [...(values.photos ?? []), result] });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleRemovePhoto(index: number) {
    patch({ photos: values.photos.filter((_, i) => i !== index) });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({ ...values, tags: parseTags(tagDraft) });
    if (!initial) {
      setValues(emptyDiaryForm());
      setTagDraft('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Day">
          <DatePicker
            value={values.date}
            onChange={(date) => patch({ date: date || todayString() })}
            placeholder="Select date"
          />
        </Field>

        <Field label="Project (optional)" htmlFor="diary-project">
          <Select
            id="diary-project"
            value={values.projectId}
            onChange={(event) => patch({ projectId: event.target.value })}
          >
            <option value="">Not linked</option>
            {data.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.emoji} {project.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Title" htmlFor="diary-title">
        <Input
          id="diary-title"
          data-autofocus
          value={values.title}
          onChange={(event) => patch({ title: event.target.value })}
          placeholder="A small title for today"
        />
      </Field>

      <Field
        label="Notes"
        htmlFor="diary-body"
        hint="Nobody else can read this. It only lives in this browser."
      >
        <Textarea
          id="diary-body"
          rows={6}
          value={values.body}
          onChange={(event) => patch({ body: event.target.value })}
          placeholder="What happened today? What is on your mind?"
        />
      </Field>

      {/* Photos Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-title font-medium text-ink">Pictures</span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full bg-lilac-100 px-3 py-1 text-xs font-title font-medium text-ink hover:bg-lilac-200 transition"
          >
            <ImagePlus size={14} aria-hidden="true" />
            <span>Add picture</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAddPhoto}
          />
        </div>

        {values.photos && values.photos.length > 0 && (
          <div className="flex flex-wrap gap-2.5 pt-1">
            {values.photos.map((photo, index) => (
              <div
                key={index}
                className="relative h-20 w-20 overflow-hidden rounded-2xl border border-lilac-200 group"
              >
                <img src={photo} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  aria-label="Remove picture"
                  className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <MoodPicker
        value={values.mood}
        onChange={(mood) => patch({ mood })}
        label="Mood for this day (optional)"
      />

      <Field label="Tags" htmlFor="diary-tags" hint="Separate with commas: study, family, ideas">
        <Input
          id="diary-tags"
          value={tagDraft}
          onChange={(event) => setTagDraft(event.target.value)}
          placeholder="study, family, ideas"
        />
      </Field>

      <div className="flex items-center justify-end gap-2 border-t border-lilac-200 pt-4">
        {onDelete && (
          <Button variant="ghost" className="text-rose-700 hover:bg-rose-100" onClick={onDelete}>
            Delete entry
          </Button>
        )}
        <Button type="submit" disabled={!canSubmit}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
