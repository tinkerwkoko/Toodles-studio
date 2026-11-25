import type { ReactNode } from 'react';
import { Cat, type CatPose } from '../Cat';
import { cx } from '../../lib/cx';

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
  pose?: CatPose;
  className?: string;
}

/** Editorial book-chapter page heading with subtle hairline rule. */
export function PageHeader({ title, subtitle, actions, pose, className }: PageHeaderProps) {
  return (
    <header className={cx('mb-6 pb-4 border-b border-divider flex items-end justify-between gap-4 flex-wrap', className)}>
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {pose && <Cat pose={pose} size={54} animated={false} className="mt-0.5 hidden sm:block shrink-0" />}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl sm:text-[2.45rem] font-semibold leading-[1.1] tracking-tight text-ink">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm font-sans italic text-ink-soft leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
