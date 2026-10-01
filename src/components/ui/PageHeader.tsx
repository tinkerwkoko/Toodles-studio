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

/** Every page opens with one friendly h1: the cat tags along when it helps. */
export function PageHeader({ title, subtitle, actions, pose, className }: PageHeaderProps) {
  return (
    <header className={cx('mb-5 flex items-start gap-4', className)}>
      {pose && <Cat pose={pose} size={64} animated={false} className="mt-1 hidden sm:block" />}
      <div className="min-w-0 flex-1">
        <h1 className="text-3xl leading-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-[0.95rem] text-ink-soft">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
