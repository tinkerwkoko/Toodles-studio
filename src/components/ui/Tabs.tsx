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
 * Editorial ledger tabs with a refined burgundy rule beneath the active tab.
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
        'flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-lilac-200/80',
        className,
      )}
    >
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cx(
              'group relative -mb-px inline-flex shrink-0 items-center gap-1.5 pb-2.5 pt-1 text-sm font-sans transition duration-150 cursor-pointer',
              'focus-visible:outline-none focus-visible:text-accent',
              isActive
                ? 'border-b-2 border-accent font-semibold text-ink'
                : 'border-b-2 border-transparent text-ink-soft hover:text-ink',
            )}
          >
            {tab.icon && (
              <span
                className={cx(
                  'transition duration-150',
                  isActive ? 'text-accent' : 'text-text-faint group-hover:text-ink',
                )}
              >
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={cx(
                  'ml-0.5 text-xs tabular-nums transition',
                  isActive ? 'text-accent font-semibold' : 'text-text-faint',
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
