import { useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, Image as ImageIcon, MoveVertical, Sparkles } from 'lucide-react';
import type { Project } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { ProjectIconDisplay, PROJECT_LUCIDE_ICONS } from './ProjectIconDisplay';
import { useToodles } from '../../store/useToodles';
import { useUi } from '../../store/useUi';

export interface ProjectHeaderProps {
  project: Project;
  doneCount: number;
  totalCount: number;
  children?: ReactNode;
}

const PRESET_COVERS = [
  { name: 'Peach Warmth', value: 'linear-gradient(135deg, #f4c3a8 0%, #ffd9c0 100%)' },
  { name: 'Mint Meadow', value: 'linear-gradient(135deg, #dce6d3 0%, #b7c9ac 100%)' },
  { name: 'Butter Sun', value: 'linear-gradient(135deg, #f6eac2 0%, #e3d39a 100%)' },
  { name: 'Sky Breeze', value: 'linear-gradient(135deg, #d3e2ec 0%, #a9c4d6 100%)' },
  { name: 'Lilac Dream', value: 'linear-gradient(135deg, #eadfea 0%, #d9bfcc 100%)' },
  { name: 'Night Calm', value: 'linear-gradient(135deg, #382c3c 0%, #231b26 100%)' },
];

/**
 * High-res image compressor matching Notion optimal dimensions:
 * - Cover: 1500px by 600px
 * - Icon: 280px by 280px
 */
function cropAndCompress(
  file: File,
  targetWidth: number,
  targetHeight: number,
  mode: 'cover' | 'square',
  callback: (dataUrl: string) => void,
) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let sx = 0,
        sy = 0,
        sWidth = img.width,
        sHeight = img.height;

      if (mode === 'square') {
        const minDim = Math.min(img.width, img.height);
        sx = (img.width - minDim) / 2;
        sy = (img.height - minDim) / 2;
        sWidth = minDim;
        sHeight = minDim;
      } else {
        const targetRatio = targetWidth / targetHeight;
        const imgRatio = img.width / img.height;
        if (imgRatio > targetRatio) {
          sWidth = img.height * targetRatio;
          sx = (img.width - sWidth) / 2;
        } else {
          sHeight = img.width / targetRatio;
          sy = (img.height - sHeight) / 2;
        }
      }

      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
      const compressed = canvas.toDataURL('image/jpeg', 0.88);
      callback(compressed);
    };
    img.src = reader.result as string;
  };
  reader.readAsDataURL(file);
}

export function ProjectHeader({ project, doneCount, totalCount, children }: ProjectHeaderProps) {
  const { actions } = useToodles();
  const { pushToast } = useUi();
  const percent = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const openCount = totalCount - doneCount;

  const [coverDialogOpen, setCoverDialogOpen] = useState(false);
  const [iconDialogOpen, setIconDialogOpen] = useState(false);
  const [iconTab, setIconTab] = useState<'icons' | 'upload'>('icons');
  const [repositioning, setRepositioning] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  function handleCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    cropAndCompress(file, 1500, 600, 'cover', (result) => {
      actions.updateProject(project.id, { cover: result, coverPosition: 50 });
      pushToast('Project cover updated');
      setCoverDialogOpen(false);
    });
  }

  function handleIconFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    cropAndCompress(file, 280, 280, 'square', (result) => {
      actions.updateProject(project.id, { icon: result });
      pushToast('Project icon updated');
      setIconDialogOpen(false);
    });
  }

  function handleSelectPresetCover(gradient: string) {
    actions.updateProject(project.id, { cover: gradient, coverPosition: 50 });
    pushToast('Project cover updated');
    setCoverDialogOpen(false);
  }

  function handleRemoveCover() {
    actions.updateProject(project.id, { cover: undefined });
    pushToast('Cover removed');
    setCoverDialogOpen(false);
  }

  function handleSelectLucideIcon(key: string) {
    actions.updateProject(project.id, { icon: `lucide:${key}` });
    pushToast('Icon updated');
    setIconDialogOpen(false);
  }

  function handleRemoveIcon() {
    actions.updateProject(project.id, { icon: 'lucide:folder' });
    pushToast('Custom icon reset');
    setIconDialogOpen(false);
  }

  const hasCustomCover = !!project.cover;
  const isGradient = project.cover?.startsWith('linear-gradient');
  const verticalPos = project.coverPosition ?? 50;

  return (
    <header className="mb-6 space-y-0">
      {/* Top back navigation pill */}
      <div className="mb-3 flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-lilac-200 bg-cream px-3.5 py-1 text-xs sm:text-sm font-title font-medium text-ink hover:bg-lilac-100 transition shadow-none"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>All projects</span>
        </Link>
      </div>

      {/* Notion-size Cover Banner: brought up, 1500x600 ratio with adjust controls */}
      <div className="relative overflow-hidden rounded-3xl border border-divider bg-card shadow-sm">
        <div
          className="h-48 sm:h-64 md:h-72 w-full transition-all duration-200"
          style={{
            background: hasCustomCover
              ? isGradient
                ? project.cover
                : `url(${project.cover}) center ${verticalPos}% / cover no-repeat`
              : 'linear-gradient(135deg, var(--sidebar) 0%, var(--card) 100%)',
          }}
        />

        {/* Action Controls on Banner */}
        <div className="absolute right-3.5 top-3.5 flex items-center gap-2 z-10">
          {hasCustomCover && !isGradient && (
            <button
              type="button"
              onClick={() => setRepositioning(!repositioning)}
              className="inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-xs font-title font-medium text-ink backdrop-blur hover:bg-card transition border border-divider shadow-sm cursor-pointer"
              title="Adjust cover vertical positioning"
            >
              <MoveVertical size={13} aria-hidden="true" />
              <span>{repositioning ? 'Done' : 'Reposition'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setCoverDialogOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-xs font-title font-medium text-ink backdrop-blur hover:bg-card transition border border-divider shadow-sm cursor-pointer"
          >
            <Camera size={13} aria-hidden="true" />
            <span>{hasCustomCover ? 'Change header' : 'Add header'}</span>
          </button>
        </div>

        {/* Reposition Control Overlay */}
        {repositioning && (
          <div className="absolute inset-x-4 bottom-3 mx-auto max-w-sm rounded-2xl bg-card/95 border border-divider p-3 shadow-lg backdrop-blur flex flex-col gap-2 animate-pop z-20">
            <div className="flex items-center justify-between text-xs font-title">
              <span className="text-ink font-semibold">Adjust header position</span>
              <span className="text-ink-soft">{verticalPos}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={verticalPos}
              onChange={(e) =>
                actions.updateProject(project.id, { coverPosition: Number(e.target.value) })
              }
              className="w-full accent-accent cursor-pointer"
            />
            <div className="flex justify-between items-center pt-1 text-[11px] font-sans">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => actions.updateProject(project.id, { coverPosition: 0 })}
                  className="px-2 py-0.5 rounded-md bg-lilac-100 hover:bg-lilac-200 text-ink"
                >
                  Top
                </button>
                <button
                  type="button"
                  onClick={() => actions.updateProject(project.id, { coverPosition: 50 })}
                  className="px-2 py-0.5 rounded-md bg-lilac-100 hover:bg-lilac-200 text-ink"
                >
                  Center
                </button>
                <button
                  type="button"
                  onClick={() => actions.updateProject(project.id, { coverPosition: 100 })}
                  className="px-2 py-0.5 rounded-md bg-lilac-100 hover:bg-lilac-200 text-ink"
                >
                  Bottom
                </button>
              </div>
              <button
                type="button"
                onClick={() => setRepositioning(false)}
                className="font-title text-ink font-semibold hover:underline"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notion Page Icon: overlaps bottom edge of cover banner */}
      <div className="relative px-6 sm:px-10 -mt-12 sm:-mt-16 flex items-center justify-between pointer-events-none z-10">
        <div className="relative group shrink-0 pointer-events-auto">
          <button
            type="button"
            onClick={() => setIconDialogOpen(true)}
            aria-label="Change project icon"
            className="grid h-24 w-24 sm:h-28 sm:w-28 place-items-center rounded-3xl border-4 border-card bg-card shadow-soft overflow-hidden transition group-hover:scale-102 p-2.5 cursor-pointer"
          >
            <ProjectIconDisplay icon={project.icon} emoji={project.emoji} size={46} />
          </button>
          <button
            type="button"
            onClick={() => setIconDialogOpen(true)}
            aria-label="Change icon"
            className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-card border border-divider text-ink shadow-sm hover:scale-105 transition cursor-pointer"
          >
            <Camera size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Project Title and Details: cleanly positioned below icon with safe clearance (no overlap!) */}
      <div className="px-4 sm:px-8 mt-5 sm:mt-6 space-y-3">
        <h1 className="wrap-break-word font-display text-3xl sm:text-4xl text-ink leading-tight">
          {project.name}
        </h1>
        {project.description && (
          <p className="text-sm sm:text-base font-sans text-ink-soft max-w-2xl">{project.description}</p>
        )}

        <div className="max-w-xl pt-1">
          <ProgressBar
            value={percent}
            label={`${project.name} progress`}
            size="md"
            tone={percent === 100 && totalCount > 0 ? 'bg-mint-500' : 'bg-peach-500'}
          />
          <p className="mt-1.5 text-xs sm:text-sm font-sans text-ink-soft">
            {totalCount === 0
              ? 'No tasks yet. Add the first one to get going.'
              : `${doneCount} of ${totalCount} done · ${openCount} still open`}
          </p>
        </div>

        {children && <div className="mt-5 pt-2">{children}</div>}
      </div>

      {/* Cover Dialog */}
      <Dialog
        open={coverDialogOpen}
        onClose={() => setCoverDialogOpen(false)}
        title="Project header cover"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm font-sans text-ink-soft">
            Choose a preset pastel atmosphere or upload your own 1500×600 header image (Notion standard).
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESET_COVERS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPresetCover(preset.value)}
                className="h-16 rounded-2xl border border-divider p-2 text-left transition hover:scale-102 flex flex-col justify-end"
                style={{ background: preset.value }}
              >
                <span className="text-[11px] font-title font-medium text-ink bg-card/85 px-1.5 py-0.5 rounded-md backdrop-blur">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-divider pt-3">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverFile}
            />
            <Button
              variant="primary"
              size="sm"
              icon={<ImageIcon size={14} />}
              onClick={() => coverInputRef.current?.click()}
            >
              Upload 1500×600 image
            </Button>
            {hasCustomCover && (
              <Button variant="danger" size="sm" onClick={handleRemoveCover}>
                Remove cover
              </Button>
            )}
          </div>
        </div>
      </Dialog>

      {/* Icon Dialog: React Icons & Photo only, no emoji */}
      <Dialog
        open={iconDialogOpen}
        onClose={() => setIconDialogOpen(false)}
        title="Project icon"
        size="md"
      >
        <div className="space-y-3">
          {/* Tabs: React Icons and Photo */}
          <div className="flex items-center gap-1 border-b border-divider pb-2">
            <button
              type="button"
              onClick={() => setIconTab('icons')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-title font-medium transition cursor-pointer ${
                iconTab === 'icons'
                  ? 'bg-lilac-200 text-ink font-semibold'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              <Sparkles size={14} />
              <span>React icons</span>
            </button>
            <button
              type="button"
              onClick={() => setIconTab('upload')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-title font-medium transition cursor-pointer ${
                iconTab === 'upload'
                  ? 'bg-lilac-200 text-ink font-semibold'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              <Camera size={14} />
              <span>Upload photo</span>
            </button>
          </div>

          {/* Icons Tab: Large, comfortable, tap-friendly buttons */}
          {iconTab === 'icons' && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1">
              {Object.entries(PROJECT_LUCIDE_ICONS).map(([key, item]) => {
                const IconComponent = item.icon;
                const isSelected = project.icon === `lucide:${key}`;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectLucideIcon(key)}
                    className={`flex flex-col items-center justify-center gap-1.5 h-18 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'border-accent bg-lilac-200 text-ink ring-2 ring-accent/30 shadow-sm'
                        : 'border-divider bg-card hover:bg-lilac-100 text-ink-soft hover:text-ink'
                    }`}
                  >
                    <IconComponent size={28} />
                    <span className="text-xs font-title font-medium truncate max-w-[90%]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Upload Tab: 280x280 square crop with breathing room */}
          {iconTab === 'upload' && (
            <div className="space-y-3 py-2">
              <p className="text-xs sm:text-sm font-sans text-ink-soft">
                Upload a 280×280 custom square icon. Recommended: square transparent PNG or JPG with breathing room.
              </p>
              <div className="flex items-center gap-2">
                <input
                  ref={iconInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleIconFile}
                />
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Camera size={14} />}
                  onClick={() => iconInputRef.current?.click()}
                >
                  Choose 280×280 photo
                </Button>
                {project.icon && (
                  <Button variant="danger" size="sm" onClick={handleRemoveIcon}>
                    Reset icon
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </header>
  );
}
