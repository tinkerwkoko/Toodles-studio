import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import type { Priority, Project } from '../../types';
import { PRIORITY_KEYS, PRIORITY_STYLES } from '../../lib/color';
import { TASK_SORT_LABELS, type TaskSort } from '../../lib/task';
import { cx } from '../../lib/cx';

export interface TaskFilterState {
  projectId: string;
  priority: Priority | 'all';
  tag: string;
  sort: TaskSort;
}

export const DEFAULT_FILTERS: TaskFilterState = {
  projectId: 'all',
  priority: 'all',
  tag: 'all',
  sort: 'smart',
};

export interface TaskFiltersProps {
  filters: TaskFilterState;
  onChange: (patch: Partial<TaskFilterState>) => void;
  projects: Project[];
  tags: string[];
  query: string;
  onQueryChange: (value: string) => void;
  /** Hidden on desktop where the top bar already has a search box. */
  showSearch?: boolean;
}

type OpenMenu = 'project' | 'priority' | 'tag' | 'sort' | null;

export function TaskFilters({
  filters,
  onChange,
  projects,
  tags,
  query,
  onQueryChange,
  showSearch = true,
}: TaskFiltersProps) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCount =
    (filters.projectId !== 'all' ? 1 : 0) +
    (filters.priority !== 'all' ? 1 : 0) +
    (filters.tag !== 'all' ? 1 : 0) +
    (filters.sort !== 'smart' ? 1 : 0);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    if (openMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openMenu]);

  const selectedProject = projects.find((p) => p.id === filters.projectId);
  const projectLabel =
    filters.projectId === 'all'
      ? 'All projects'
      : filters.projectId === 'none'
        ? 'No project'
        : selectedProject?.name ?? 'Project';

  const priorityLabel =
    filters.priority === 'all' ? 'Any priority' : PRIORITY_STYLES[filters.priority].label;

  const tagLabel = filters.tag === 'all' ? 'Any tag' : `#${filters.tag}`;
  const sortLabel = TASK_SORT_LABELS[filters.sort] ?? 'Smart sort';

  return (
    <div ref={containerRef} className="mb-3 space-y-2">
      {showSearch && (
        <div className="relative">
          <Search
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search your tasks..."
            aria-label="Search your tasks"
            className="w-full rounded-full border border-lilac-200 bg-cream/90 py-1.5 pr-8 pl-9 text-xs text-ink placeholder:text-ink-soft/70 focus:border-accent focus:outline-none"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-ink-soft hover:text-ink"
            >
              <X size={13} aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {/* Sleek inline filter strip without buttons or cards */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-soft">
        <div className="flex items-center gap-1 text-[11px] font-sans">
          <SlidersHorizontal size={13} className="text-accent" />
          <span>Filters:</span>
        </div>

        {/* Project Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'project' ? null : 'project')}
            className={cx(
              'inline-flex items-center gap-1 font-title transition cursor-pointer py-0.5 px-1.5 rounded-lg',
              filters.projectId !== 'all'
                ? 'bg-lilac-200 text-ink font-semibold'
                : 'hover:text-ink hover:bg-lilac-100/50',
            )}
          >
            <span>{projectLabel}</span>
            <ChevronDown size={11} className="opacity-70" />
          </button>

          {openMenu === 'project' && (
            <div className="absolute left-0 top-full z-50 mt-1 min-w-[170px] rounded-2xl border border-divider bg-card p-1 shadow-soft animate-pop">
              <button
                type="button"
                onClick={() => {
                  onChange({ projectId: 'all' });
                  setOpenMenu(null);
                }}
                className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-title text-ink hover:bg-lilac-100"
              >
                <span>All projects</span>
                {filters.projectId === 'all' && <Check size={13} className="text-accent" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange({ projectId: 'none' });
                  setOpenMenu(null);
                }}
                className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-title text-ink hover:bg-lilac-100"
              >
                <span>No project</span>
                {filters.projectId === 'none' && <Check size={13} className="text-accent" />}
              </button>
              {projects.length > 0 && <div className="my-1 border-t border-divider" />}
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    onChange({ projectId: project.id });
                    setOpenMenu(null);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-title text-ink hover:bg-lilac-100"
                >
                  <span className="truncate max-w-[130px]">
                    {project.emoji} {project.name}
                  </span>
                  {filters.projectId === project.id && (
                    <Check size={13} className="text-accent shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Priority Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'priority' ? null : 'priority')}
            className={cx(
              'inline-flex items-center gap-1 font-title transition cursor-pointer py-0.5 px-1.5 rounded-lg',
              filters.priority !== 'all'
                ? 'bg-lilac-200 text-ink font-semibold'
                : 'hover:text-ink hover:bg-lilac-100/50',
            )}
          >
            <span>{priorityLabel}</span>
            <ChevronDown size={11} className="opacity-70" />
          </button>

          {openMenu === 'priority' && (
            <div className="absolute left-0 top-full z-50 mt-1 min-w-[150px] rounded-2xl border border-divider bg-card p-1 shadow-soft animate-pop">
              <button
                type="button"
                onClick={() => {
                  onChange({ priority: 'all' });
                  setOpenMenu(null);
                }}
                className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-title text-ink hover:bg-lilac-100"
              >
                <span>Any priority</span>
                {filters.priority === 'all' && <Check size={13} className="text-accent" />}
              </button>
              {PRIORITY_KEYS.filter((k) => k !== 'none').map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onChange({ priority: key });
                    setOpenMenu(null);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-title text-ink hover:bg-lilac-100"
                >
                  <span>{PRIORITY_STYLES[key].label}</span>
                  {filters.priority === key && <Check size={13} className="text-accent" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tags Menu (if tags exist) */}
        {tags.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'tag' ? null : 'tag')}
              className={cx(
                'inline-flex items-center gap-1 font-title transition cursor-pointer py-0.5 px-1.5 rounded-lg',
                filters.tag !== 'all'
                  ? 'bg-lilac-200 text-ink font-semibold'
                  : 'hover:text-ink hover:bg-lilac-100/50',
              )}
            >
              <span>{tagLabel}</span>
              <ChevronDown size={11} className="opacity-70" />
            </button>

            {openMenu === 'tag' && (
              <div className="absolute left-0 top-full z-50 mt-1 max-h-52 overflow-y-auto min-w-[140px] rounded-2xl border border-divider bg-card p-1 shadow-soft animate-pop">
                <button
                  type="button"
                  onClick={() => {
                    onChange({ tag: 'all' });
                    setOpenMenu(null);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-title text-ink hover:bg-lilac-100"
                >
                  <span>Any tag</span>
                  {filters.tag === 'all' && <Check size={13} className="text-accent" />}
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      onChange({ tag });
                      setOpenMenu(null);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-title text-ink hover:bg-lilac-100"
                  >
                    <span>#{tag}</span>
                    {filters.tag === tag && <Check size={13} className="text-accent" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sort Menu */}
        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'sort' ? null : 'sort')}
            className={cx(
              'inline-flex items-center gap-1 font-title transition cursor-pointer py-0.5 px-1.5 rounded-lg',
              filters.sort !== 'smart'
                ? 'bg-lilac-200 text-ink font-semibold'
                : 'hover:text-ink hover:bg-lilac-100/50',
            )}
          >
            <span className="text-[11px] font-sans opacity-70">Sort:</span>
            <span>{sortLabel}</span>
            <ChevronDown size={11} className="opacity-70" />
          </button>

          {openMenu === 'sort' && (
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-2xl border border-divider bg-card p-1 shadow-soft animate-pop">
              {(Object.keys(TASK_SORT_LABELS) as TaskSort[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onChange({ sort: key });
                    setOpenMenu(null);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-title text-ink hover:bg-lilac-100"
                >
                  <span>{TASK_SORT_LABELS[key]}</span>
                  {filters.sort === key && <Check size={13} className="text-accent" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset filter tag */}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="text-[11px] font-sans text-ink-soft hover:text-ink underline transition cursor-pointer"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
}
