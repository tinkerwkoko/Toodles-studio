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
  { name: 'Peach Warmth', value: 'linear-gradient(135deg, #f4c3a8 0%, #ffd9c0 100%)' },
  { name: 'Mint Meadow', value: 'linear-gradient(135deg, #dce6d3 0%, #b7c9ac 100%)' },
  { name: 'Butter Sun', value: 'linear-gradient(135deg, #f6eac2 0%, #e3d39a 100%)' },
  { name: 'Sky Breeze', value: 'linear-gradient(135deg, #d3e2ec 0%, #a9c4d6 100%)' },
  { name: 'Lilac Dream', value: 'linear-gradient(135deg, #eadfea 0%, #d9bfcc 100%)' },
  { name: 'Night Calm', value: 'linear-gradient(135deg, #382c3c 0%, #231b26 100%)' },
];

/**
 * Standard Notion Image Sizes:
 * - Cover: 1500px by 600px
 * - Icon: 280px by 280px
 */
function cropAndCompressSquare(file: File, callback: (dataUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 280;
      canvas.height = 280;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;
      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 280, 280);
      callback(canvas.toDataURL('image/jpeg', 0.88));
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
      canvas.width = 1500;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const targetRatio = 1500 / 600;
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
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 1500, 600);
      callback(canvas.toDataURL('image/jpeg', 0.85));
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
      {/* Cover Preview (if any) */}
      {values.cover && (
        <div className="relative h-40 w-full overflow-hidden rounded-3xl border border-divider shadow-sm">
          <div
            className="h-full w-full transition-all"
            style={{
              background: isGradient
                ? values.cover
                : `url(${values.cover}) center ${verticalPos}% / cover no-repeat`,
            }}
          />
          <div className="absolute right-3 top-3 flex items-center gap-2">
            {!isGradient && (
              <button
                type="button"
                onClick={() => setShowReposition(!showReposition)}
                aria-label="Adjust header position"
                className="inline-flex items-center gap-1.5 rounded-full bg-card/90 px-2.5 py-1 text-xs font-title font-medium text-ink backdrop-blur border border-divider hover:bg-card transition"
              >
                <MoveVertical size={13} />
                <span>{showReposition ? 'Done' : 'Reposition'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => patch({ cover: undefined })}
              aria-label="Remove cover"
              className="grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition"
            >
              <X size={14} />
            </button>
          </div>

          {showReposition && !isGradient && (
            <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-card/95 border border-divider p-2.5 backdrop-blur shadow flex items-center gap-3">
              <span className="text-xs font-title font-medium text-ink shrink-0">Vertical: {verticalPos}%</span>
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
          className={`grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl border border-lilac-200 bg-card shadow-soft overflow-hidden shrink-0 ${
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

        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <span className="text-sm font-title font-medium text-ink">Project icon</span>
          <p className="text-xs font-sans text-ink-soft">
            Choose an icon from the collection below or upload a custom photo.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIconMode('icons')}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-title transition cursor-pointer ${
                iconMode === 'icons'
                  ? 'bg-lilac-200 text-ink font-semibold shadow-sm'
                  : 'text-ink-soft hover:text-ink hover:bg-lilac-100'
              }`}
            >
              <Sparkles size={14} />
              <span>Icons</span>
            </button>
            <button
              type="button"
              onClick={() => setIconMode('upload')}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-title transition cursor-pointer ${
                iconMode === 'upload'
                  ? 'bg-lilac-200 text-ink font-semibold shadow-sm'
                  : 'text-ink-soft hover:text-ink hover:bg-lilac-100'
              }`}
            >
              <Camera size={14} />
              <span>Photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Icon Pickers: Large, comfortable, tap-friendly with clear labels */}
      {iconMode === 'icons' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-56 overflow-y-auto p-2 border border-divider rounded-2xl bg-card">
          {Object.entries(PROJECT_LUCIDE_ICONS).map(([key, item]) => {
            const IconComponent = item.icon;
            const isSelected = values.icon === `lucide:${key}`;
            return (
              <button
                key={key}
                type="button"
                onClick={() => patch({ icon: `lucide:${key}` })}
                className={`flex flex-col items-center justify-center gap-1.5 h-18 rounded-2xl border transition ${
                  isSelected
                    ? 'border-accent bg-lilac-200 text-ink ring-2 ring-accent/30 shadow-sm'
                    : 'border-transparent hover:bg-lilac-100 text-ink-soft hover:text-ink'
                }`}
                title={item.label}
              >
                <IconComponent size={28} />
                <span className="text-xs font-title font-medium truncate max-w-[90%]">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {iconMode === 'upload' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-divider bg-card">
          <div className="space-y-0.5">
            <span className="text-sm font-title font-medium text-ink">Upload custom icon</span>
            <p className="text-xs font-sans text-ink-soft">
              Choose a square photo or graphic with gentle padding.
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
              icon={<Camera size={15} />}
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

      {/* Project name */}
      <Field label="Project name" htmlFor="project-name">
        <Input
          id="project-name"
          data-autofocus
          value={values.name}
          onChange={(event) => patch({ name: event.target.value })}
          placeholder="e.g. Final Year Project, Cozy Studio..."
          className="text-base"
        />
      </Field>

      {/* Project description */}
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

      {/* Colour selection */}
      <fieldset className="space-y-2">
        <legend className="text-xs font-title font-medium text-ink">Colour palette</legend>
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
                  'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-title font-medium transition cursor-pointer',
                  isSelected
                    ? 'border-accent bg-lilac-200 text-ink shadow-sm'
                    : 'border-divider bg-card text-ink-soft hover:bg-lilac-50',
                )}
              >
                <span className={cx('h-2.5 w-2.5 rounded-full', tone.mid)} aria-hidden="true" />
                <span>{ACCENT_LABELS[key]}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Optional Header Cover */}
      <div className="space-y-2.5 pt-2 border-t border-divider">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-title font-medium text-ink">Header cover (optional)</span>
            <p className="text-[11px] font-sans text-ink-soft">
              Choose a pastel atmosphere or upload a custom image.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCoverPicker(!showCoverPicker)}
            className="text-xs font-title text-accent hover:underline font-semibold"
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
                  className={`h-12 rounded-2xl border p-1 text-left transition hover:scale-101 flex flex-col justify-end ${
                    values.cover === preset.value ? 'border-accent ring-2 ring-accent/40' : 'border-divider'
                  }`}
                  style={{ background: preset.value }}
                >
                  <span className="text-[10px] font-title font-medium text-ink bg-card/85 px-1.5 py-0.5 rounded backdrop-blur truncate">
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
                variant="primary"
                icon={<ImageIcon size={14} />}
                onClick={() => coverInputRef.current?.click()}
              >
                Upload cover image
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-divider pt-3">
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
