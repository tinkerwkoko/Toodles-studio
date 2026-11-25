import type { ReactNode } from 'react';
import { Card } from '../ui/Card';
import { cx } from '../../lib/cx';

export interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}

/** Small archival ledger figure. */
export function StatTile({ label, value, hint, icon, className }: StatTileProps) {
  return (
    <Card padding="sm" variant="aged" className={cx('flex items-center gap-3', className)}>
      {icon && (
        <span
          aria-hidden="true"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[4px] border border-divider bg-cream text-accent"
        >
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="font-display text-2xl font-semibold leading-none text-ink tabular-nums">{value}</p>
        <p className="mt-0.5 truncate text-xs font-sans text-ink-soft">{label}</p>
        {hint && <p className="truncate text-[11px] font-sans italic text-text-faint">{hint}</p>}
      </div>
    </Card>
  );
}
