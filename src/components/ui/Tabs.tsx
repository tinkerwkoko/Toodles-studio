import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Text tabs with a thin underline under the active one.
 * Inactive tabs are faint and darken on hover.
 */
export function Tabs({
  items,
  activeId,
  onChange,
  className,
  ariaLabel = 'Navigation tabs',
}: TabsProps) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const currentIndex = items.findIndex((item) => item.id === activeId);
    if (currentIndex === -1) return;

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % items.length;
      const nextItem = items[nextIndex];
      if (nextItem) onChange(nextItem.id);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const prevIndex = (currentIndex - 1 + items.length) % items.length;
      const prevItem = items[prevIndex];
      if (prevItem) onChange(prevItem.id);
    }
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cx(
        'flex items-center gap-4 overflow-x-auto no-scrollbar border-b border-divider',
        className,
      )}
    >
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cx(
              'group relative inline-flex items-center gap-1.5 pb-2 pt-1 text-sm font-title font-medium transition duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              isActive
                ? 'text-ink border-b-2 border-accent'
                : 'text-ink-soft hover:text-ink border-b-2 border-transparent',
            )}
          >
            {tab.icon && (
              <span
                className={cx(
                  'transition duration-150',
                  isActive ? 'text-ink' : 'text-text-faint group-hover:text-ink',
                )}
              >
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={cx(
                  'ml-0.5 rounded-full px-1.5 py-0.2 text-[11px] font-sans transition',
                  isActive ? 'bg-lilac-200 text-ink' : 'bg-lilac-100 text-ink-soft',
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
