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
  { name: 'Aged Parchment', value: 'linear-gradient(135deg, #efe4d2 0%, #dcc8ad 100%)' },
  { name: 'Pressed Olive', value: 'linear-gradient(135deg, #d7e0d4 0%, #a5b5a2 100%)' },
  { name: 'Dusty Rose', value: 'linear-gradient(135deg, #ebd9d6 0%, #c8a29c 100%)' },
  { name: 'Terracotta Clay', value: 'linear-gradient(135deg, #ecd8c9 0%, #c9997f 100%)' },
  { name: 'Archival Slate', value: 'linear-gradient(135deg, #d7e0e6 0%, #9eb1bf 100%)' },
  { name: 'Library Night', value: 'linear-gradient(135deg, #3c2b26 0%, #241916 100%)' },
];

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
      const compressed = canvas.toDataURL('image/jpeg', mode === 'cover' ? 0.72 : 0.8);
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
    cropAndCompress(file, 1200, 480, 'cover', (result) => {
      actions.updateProject(project.id, { cover: result, coverPosition: 50 });
      pushToast('Project cover updated');
      setCoverDialogOpen(false);
    });
  }

  function handleIconFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    cropAndCompress(file, 240, 240, 'square', (result) => {
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
    <header className="mb-7 pb-5 border-b border-divider">
      {/* Top back link + Add header button */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-sans text-ink-soft hover:text-accent transition"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          <span>All projects</span>
        </Link>

        {!hasCustomCover && (
          <button
            type="button"
            onClick={() => setCoverDialogOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-[4px] border border-divider bg-cream px-3 py-1.5 text-xs font-sans text-ink-soft hover:text-ink hover:border-dusty-rose transition cursor-pointer"
          >
            <Camera size={13} aria-hidden="true" />
            <span>Add header</span>
          </button>
        )}
      </div>

      {/* Custom Cover Banner */}
      {hasCustomCover && (
        <div className="relative mb-6 overflow-hidden rounded-[5px] border border-lilac-200 bg-card shadow-soft">
          <div
            className="h-44 sm:h-56 md:h-60 w-full transition-all duration-200"
            style={{
              background: isGradient
                ? project.cover
                : `url(${project.cover}) center ${verticalPos}% / cover no-repeat`,
            }}
          />

          <div className="absolute right-3 top-3 flex items-center gap-2 z-10">
            {!isGradient && (
              <button
                type="button"
                onClick={() => setRepositioning(!repositioning)}
                className="inline-flex items-center gap-1.5 rounded-[4px] bg-card/92 px-3 py-1.5 text-xs font-sans font-medium text-ink backdrop-blur-sm hover:bg-card transition border border-lilac-200 cursor-pointer"
                title="Adjust cover vertical positioning"
              >
                <MoveVertical size={13} aria-hidden="true" />
                <span>{repositioning ? 'Done' : 'Reposition'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setCoverDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-[4px] bg-card/92 px-3 py-1.5 text-xs font-sans font-medium text-ink backdrop-blur-sm hover:bg-card transition border border-lilac-200 cursor-pointer"
            >
              <Camera size={13} aria-hidden="true" />
              <span>Change header</span>
            </button>
          </div>

          {repositioning && (
            <div className="absolute inset-x-4 bottom-3 mx-auto max-w-sm rounded-[5px] bg-card/95 border border-lilac-200 p-3 shadow-lift backdrop-blur-sm flex flex-col gap-2 motion-safe:animate-fade-in z-20">
              <div className="flex items-center justify-between text-xs font-sans tabular-nums">
                <span className="text-ink font-medium">Adjust header position</span>
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
              <div className="flex justify-between items-center pt-1 text-xs font-sans">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => actions.updateProject(project.id, { coverPosition: 0 })}
                    className="px-2 py-0.5 rounded-[3px] bg-paper-2 hover:bg-lilac-200/70 text-ink cursor-pointer"
                  >
                    Top
                  </button>
                  <button
                    type="button"
                    onClick={() => actions.updateProject(project.id, { coverPosition: 50 })}
                    className="px-2 py-0.5 rounded-[3px] bg-paper-2 hover:bg-lilac-200/70 text-ink cursor-pointer"
                  >
                    Center
                  </button>
                  <button
                    type="button"
                    onClick={() => actions.updateProject(project.id, { coverPosition: 100 })}
                    className="px-2 py-0.5 rounded-[3px] bg-paper-2 hover:bg-lilac-200/70 text-ink cursor-pointer"
                  >
                    Bottom
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setRepositioning(false)}
                  className="text-accent font-medium hover:underline cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Project Info Section: Icon sits directly beside project title */}
      <div className="space-y-4">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="relative group shrink-0">
            <button
              type="button"
              onClick={() => setIconDialogOpen(true)}
              aria-label="Change project icon"
              title="Change project icon"
              className={`grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-[5px] border border-lilac-200 bg-card shadow-soft overflow-hidden transition group-hover:border-accent cursor-pointer ${
                project.icon &&
                (project.icon.startsWith('data:image') ||
                  project.icon.startsWith('http') ||
                  project.icon.startsWith('/'))
                  ? 'p-0'
                  : 'p-2'
              }`}
            >
              <ProjectIconDisplay icon={project.icon} emoji={project.emoji} size={25} />
            </button>
            <button
              type="button"
              onClick={() => setIconDialogOpen(true)}
              aria-label="Change icon"
              title="Change icon"
              className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-[3px] bg-card border border-lilac-200 text-ink-soft hover:text-accent transition cursor-pointer"
            >
              <Camera size={11} aria-hidden="true" />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="wrap-break-word font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight">
              {project.name}
            </h1>
          </div>
        </div>

        {project.description && (
          <p className="text-sm sm:text-[15px] font-sans italic text-ink-soft max-w-2xl leading-relaxed">
            {project.description}
          </p>
        )}

        <div className="max-w-xl">
          <ProgressBar
            value={percent}
            label={`${project.name} progress`}
            size="md"
            tone={percent === 100 && totalCount > 0 ? 'bg-mint-500' : 'bg-lilac-300'}
          />
          <p className="mt-1.5 text-xs font-sans text-ink-soft tabular-nums">
            {totalCount === 0
              ? 'No tasks yet. Add the first one to get going.'
              : `${doneCount} of ${totalCount} done · ${openCount} still open`}
          </p>
        </div>

        {children && <div className="pt-2">{children}</div>}
      </div>

      {/* Cover Dialog */}
      <Dialog
        open={coverDialogOpen}
        onClose={() => setCoverDialogOpen(false)}
        title="Project header cover"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm font-sans italic text-ink-soft">
            Choose an archival tone or upload your own header photograph.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {PRESET_COVERS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPresetCover(preset.value)}
                className="h-16 rounded-[4px] border border-lilac-200 p-2 text-left transition hover:border-accent flex flex-col justify-end cursor-pointer"
                style={{ background: preset.value }}
              >
                <span className="text-[11px] font-sans font-medium text-ink bg-card/90 px-1.5 py-0.5 rounded-[3px] backdrop-blur-sm self-start">
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
              Upload image
            </Button>
            {hasCustomCover && (
              <Button variant="danger" size="sm" onClick={handleRemoveCover}>
                Remove cover
              </Button>
            )}
          </div>
        </div>
      </Dialog>

      {/* Icon Dialog: Icons & Photo */}
      <Dialog
        open={iconDialogOpen}
        onClose={() => setIconDialogOpen(false)}
        title="Project icon"
        size="md"
      >
        <div className="space-y-3.5">
          <div className="flex items-center gap-4 border-b border-divider">
            <button
              type="button"
              onClick={() => setIconTab('icons')}
              className={`-mb-px inline-flex items-center gap-1.5 pb-2 text-xs sm:text-sm font-sans transition cursor-pointer border-b-2 ${
                iconTab === 'icons'
                  ? 'border-accent text-ink font-semibold'
                  : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              <Sparkles size={14} />
              <span>Icons</span>
            </button>
            <button
              type="button"
              onClick={() => setIconTab('upload')}
              className={`-mb-px inline-flex items-center gap-1.5 pb-2 text-xs sm:text-sm font-sans transition cursor-pointer border-b-2 ${
                iconTab === 'upload'
                  ? 'border-accent text-ink font-semibold'
                  : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              <Camera size={14} />
              <span>Upload photo</span>
            </button>
          </div>

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
                    className={`flex flex-col items-center justify-center gap-1.5 h-18 rounded-[4px] border transition cursor-pointer ${
                      isSelected
                        ? 'border-accent bg-paper-2 text-accent font-medium'
                        : 'border-divider bg-card hover:bg-paper-2/60 text-ink-soft hover:text-ink'
                    }`}
                  >
                    <IconComponent size={24} strokeWidth={1.7} />
                    <span className="text-[11px] font-sans truncate max-w-[90%]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {iconTab === 'upload' && (
            <div className="space-y-3 py-2">
              <p className="text-xs sm:text-sm font-sans italic text-ink-soft">
                Upload a custom photo or graphic for your project icon.
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
                  Choose photo
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
