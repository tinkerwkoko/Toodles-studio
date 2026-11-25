import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Camera, Image as ImageIcon, MoveVertical, Sparkles, X } from 'lucide-react';
import type { AccentColor } from '../../types';
import { ACCENT_KEYS, ACCENT_LABELS, accent } from '../../lib/color';
import { Button } from '../ui/Button';
import { Field, Input, Textarea } from '../ui/Field';
import { ProjectIconDisplay, PROJECT_LUCIDE_ICONS } from './ProjectIconDisplay';
import { cx } from '../../lib/cx';

export interface ProjectFormValues {
  name: string;
  description: string;
  color: AccentColor;
  emoji: string;
  icon?: string;
  cover?: string;
  coverPosition?: number;
}

export const EMPTY_PROJECT_FORM: ProjectFormValues = {
  name: '',
  description: '',
  color: 'lilac',
  emoji: '🌱',
  icon: 'lucide:folder',
  cover: undefined,
  coverPosition: 50,
};

const PRESET_COVERS = [
  { name: 'Aged Parchment', value: 'linear-gradient(135deg, #efe4d2 0%, #dcc8ad 100%)' },
  { name: 'Pressed Olive', value: 'linear-gradient(135deg, #d7e0d4 0%, #a5b5a2 100%)' },
  { name: 'Dusty Rose', value: 'linear-gradient(135deg, #ebd9d6 0%, #c8a29c 100%)' },
  { name: 'Terracotta Clay', value: 'linear-gradient(135deg, #ecd8c9 0%, #c9997f 100%)' },
  { name: 'Archival Slate', value: 'linear-gradient(135deg, #d7e0e6 0%, #9eb1bf 100%)' },
  { name: 'Library Night', value: 'linear-gradient(135deg, #3c2b26 0%, #241916 100%)' },
];

function cropAndCompressSquare(file: File, callback: (dataUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;
      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 240, 240);
      callback(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = reader.result as string;
  };
  reader.readAsDataURL(file);
}

function cropAndCompressCover(file: File, callback: (dataUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const targetRatio = 1200 / 480;
      const imgRatio = img.width / img.height;
      let sx = 0,
        sy = 0,
        sWidth = img.width,
        sHeight = img.height;
      if (imgRatio > targetRatio) {
        sWidth = img.height * targetRatio;
        sx = (img.width - sWidth) / 2;
      } else {
        sHeight = img.width / targetRatio;
        sy = (img.height - sHeight) / 2;
      }
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 1200, 480);
      callback(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.src = reader.result as string;
  };
  reader.readAsDataURL(file);
}

export interface ProjectFormProps {
  initial?: ProjectFormValues;
  submitLabel: string;
  onSubmit: (values: ProjectFormValues) => void;
  onDelete?: () => void;
  extra?: ReactNode;
}

export function ProjectForm({
  initial,
  submitLabel,
  onSubmit,
  onDelete,
  extra,
}: ProjectFormProps) {
  const [values, setValues] = useState<ProjectFormValues>(initial ?? EMPTY_PROJECT_FORM);
  const [iconMode, setIconMode] = useState<'icons' | 'upload'>('icons');
  const [showCoverPicker, setShowCoverPicker] = useState(!!initial?.cover);
  const [showReposition, setShowReposition] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = values.name.trim().length > 0;

  function patch(next: Partial<ProjectFormValues>): void {
    setValues((current) => ({ ...current, ...next }));
  }

  function handleIconFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    cropAndCompressSquare(file, (compressed) => {
      patch({ icon: compressed });
    });
  }

  function handleCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    cropAndCompressCover(file, (compressed) => {
      patch({ cover: compressed, coverPosition: 50 });
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(values);
    if (!initial) setValues(EMPTY_PROJECT_FORM);
  }

  const verticalPos = values.coverPosition ?? 50;
  const isGradient = values.cover?.startsWith('linear-gradient');

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {values.cover && (
        <div className="relative h-36 w-full overflow-hidden rounded-[5px] border border-lilac-200 shadow-soft">
          <div
            className="h-full w-full transition-all"
            style={{
              background: isGradient
                ? values.cover
                : `url(${values.cover}) center ${verticalPos}% / cover no-repeat`,
            }}
          />
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
            {!isGradient && (
              <button
                type="button"
                onClick={() => setShowReposition(!showReposition)}
                aria-label="Adjust header position"
                className="inline-flex items-center gap-1.5 rounded-[4px] bg-card/92 px-2.5 py-1 text-xs font-sans font-medium text-ink backdrop-blur-sm border border-lilac-200 hover:bg-card transition cursor-pointer"
              >
                <MoveVertical size={13} />
                <span>{showReposition ? 'Done' : 'Reposition'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => patch({ cover: undefined })}
              aria-label="Remove cover"
              className="grid h-7 w-7 place-items-center rounded-[4px] bg-[#1b1511]/70 text-[#fbf7ef] hover:bg-[#1b1511] transition cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {showReposition && !isGradient && (
            <div className="absolute inset-x-3 bottom-3 rounded-[4px] bg-card/95 border border-lilac-200 p-2.5 backdrop-blur-sm shadow flex items-center gap-3">
              <span className="text-xs font-sans font-medium text-ink shrink-0 tabular-nums">
                Vertical: {verticalPos}%
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={verticalPos}
                onChange={(e) => patch({ coverPosition: Number(e.target.value) })}
                className="flex-1 accent-accent cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {/* Project Icon Preview and Mode Selector */}
      <div className="flex items-center gap-4">
        <div
          className={`grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-[5px] border border-lilac-200 bg-card shadow-soft overflow-hidden shrink-0 ${
            values.icon &&
            (values.icon.startsWith('data:image') ||
              values.icon.startsWith('http') ||
              values.icon.startsWith('/'))
              ? 'p-0'
              : 'p-2'
          }`}
        >
          <ProjectIconDisplay icon={values.icon} emoji={values.emoji} size={24} />
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="text-sm font-sans font-medium text-ink">Project icon</span>
          <p className="text-xs font-sans italic text-ink-soft">
            Choose an icon from the collection below or upload a custom photo.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIconMode('icons')}
              className={`inline-flex items-center gap-1.5 pb-1 text-xs font-sans border-b-2 transition cursor-pointer ${
                iconMode === 'icons'
                  ? 'border-accent text-ink font-semibold'
                  : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              <Sparkles size={13} />
              <span>Icons</span>
            </button>
            <button
              type="button"
              onClick={() => setIconMode('upload')}
              className={`inline-flex items-center gap-1.5 pb-1 text-xs font-sans border-b-2 transition cursor-pointer ${
                iconMode === 'upload'
                  ? 'border-accent text-ink font-semibold'
                  : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              <Camera size={13} />
              <span>Photo</span>
            </button>
          </div>
        </div>
      </div>

      {iconMode === 'icons' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-52 overflow-y-auto p-2 border border-divider rounded-[4px] bg-card">
          {Object.entries(PROJECT_LUCIDE_ICONS).map(([key, item]) => {
            const IconComponent = item.icon;
            const isSelected = values.icon === `lucide:${key}`;
            return (
              <button
                key={key}
                type="button"
                onClick={() => patch({ icon: `lucide:${key}` })}
                className={`flex flex-col items-center justify-center gap-1.5 h-16 rounded-[4px] border transition cursor-pointer ${
                  isSelected
                    ? 'border-accent bg-paper-2 text-accent font-medium'
                    : 'border-transparent hover:bg-paper-2/60 text-ink-soft hover:text-ink'
                }`}
                title={item.label}
              >
                <IconComponent size={22} strokeWidth={1.7} />
                <span className="text-[11px] font-sans truncate max-w-[90%]">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {iconMode === 'upload' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[4px] border border-divider bg-card">
          <div className="space-y-0.5">
            <span className="text-sm font-sans font-medium text-ink">Upload custom icon</span>
            <p className="text-xs font-sans italic text-ink-soft">
              Choose a square photo or graphic.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={iconInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleIconFile}
            />
            <Button
              type="button"
              size="sm"
              variant="primary"
              icon={<Camera size={14} />}
              onClick={() => iconInputRef.current?.click()}
            >
              Choose photo
            </Button>
            {values.icon && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => patch({ icon: 'lucide:folder' })}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      )}

      <Field label="Project name" htmlFor="project-name">
        <Input
          id="project-name"
          data-autofocus
          value={values.name}
          onChange={(event) => patch({ name: event.target.value })}
          placeholder="e.g. Autumn Reading List, Thesis Draft..."
          className="text-base"
        />
      </Field>

      <Field label="What is it about?" htmlFor="project-description">
        <Textarea
          id="project-description"
          rows={3}
          value={values.description}
          onChange={(event) => patch({ description: event.target.value })}
          placeholder="A few words to describe your goals and milestones."
          className="text-sm"
        />
      </Field>

      <fieldset className="space-y-2">
        <legend className="text-[13px] font-sans font-medium text-ink">Ink colour</legend>
        <div className="flex flex-wrap gap-2">
          {ACCENT_KEYS.map((key) => {
            const tone = accent(key);
            const isSelected = values.color === key;
            return (
              <button
                key={key}
                type="button"
                aria-label={`Use ${ACCENT_LABELS[key]} colour`}
                aria-pressed={isSelected}
                onClick={() => patch({ color: key })}
                className={cx(
                  'flex items-center gap-1.5 rounded-[4px] border px-2.5 py-1 text-xs font-sans transition cursor-pointer',
                  isSelected
                    ? 'border-accent bg-paper-2 text-ink font-semibold'
                    : 'border-divider bg-card text-ink-soft hover:bg-paper-2/50',
                )}
              >
                <span className={cx('h-2.5 w-2.5 rounded-full', tone.mid)} aria-hidden="true" />
                <span>{ACCENT_LABELS[key]}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-2.5 pt-3 border-t border-divider">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[13px] font-sans font-medium text-ink">Header cover (optional)</span>
            <p className="text-xs font-sans italic text-ink-soft">
              Choose an archival tone or upload a custom image.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCoverPicker(!showCoverPicker)}
            className="text-xs font-sans text-accent hover:underline underline-offset-4 font-medium cursor-pointer"
          >
            {showCoverPicker ? 'Hide' : 'Add header cover'}
          </button>
        </div>

        {showCoverPicker && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {PRESET_COVERS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => patch({ cover: preset.value, coverPosition: 50 })}
                  className={`h-13 rounded-[4px] border p-1.5 text-left transition flex flex-col justify-end cursor-pointer ${
                    values.cover === preset.value ? 'border-accent ring-2 ring-accent/30' : 'border-lilac-200'
                  }`}
                  style={{ background: preset.value }}
                >
                  <span className="text-[10px] font-sans font-medium text-ink bg-card/90 px-1.5 py-0.5 rounded-[2px] backdrop-blur-sm truncate self-start">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverFile}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                icon={<ImageIcon size={14} />}
                onClick={() => coverInputRef.current?.click()}
              >
                Upload cover image
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-divider pt-4">
        {onDelete && (
          <Button type="button" variant="danger" size="sm" onClick={onDelete}>
            Delete project
          </Button>
        )}
        {extra}
        <Button type="submit" disabled={!canSubmit}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
