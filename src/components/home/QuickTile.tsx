import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cx } from '../../lib/cx';

export interface QuickTileProps {
  to: string;
  label: string;
  /** Big, glanceable number or short word. */
  value: string;
  hint?: string;
  icon: ReactNode;
  tone?: 'lilac' | 'peach' | 'mint' | 'butter' | 'sky' | 'rose';
}

const TONES: Record<NonNullable<QuickTileProps['tone']>, string> = {
  lilac: 'bg-lilac-100 border-lilac-200 text-ink',
  peach: 'bg-peach-100 border-peach-200 text-ink',
  mint: 'bg-mint-100 border-mint-200 text-ink',
  butter: 'bg-butter-100 border-butter-200 text-ink',
  sky: 'bg-sky-100 border-sky-200 text-ink',
  rose: 'bg-rose-100 border-rose-200 text-ink',
};

/** One quiet archival tile that leads somewhere useful. */
export function QuickTile({ to, label, value, hint, icon, tone = 'lilac' }: QuickTileProps) {
  return (
    <Link
      to={to}
      className={cx(
        'flex min-h-24 flex-col justify-between rounded-[5px] border p-4 transition',
        'hover:shadow-soft',
        TONES[tone],
      )}
    >
      <div className="flex items-start justify-between gap-2 text-ink-soft">
        <span aria-hidden="true">{icon}</span>
        <ChevronRight size={15} aria-hidden="true" className="opacity-65" />
      </div>
      <div>
        <p className="font-display text-2xl font-semibold leading-none tabular-nums text-ink">
          {value}
        </p>
        <p className="mt-1 text-xs font-medium text-ink">{label}</p>
        {hint && <p className="text-[11px] text-ink-soft">{hint}</p>}
      </div>
    </Link>
  );
}
