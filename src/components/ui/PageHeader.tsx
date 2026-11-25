import type { ReactNode } from 'react';
import { Cat, type CatPose } from '../Cat';
import { BotanicalDivider } from './BotanicalOrnaments';
import { cx } from '../../lib/cx';

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
  pose?: CatPose;
  className?: string;
}

/** Editorial botanical chapter heading with Special Elite subtitle and fine botanical rule. */
export function PageHeader({ title, subtitle, actions, pose, className }: PageHeaderProps) {
  return (
    <header className={cx('mb-7 space-y-4', className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          {pose && (
            <Cat
              pose={pose}
              size={52}
              animated={false}
              className="mt-0.5 hidden shrink-0 sm:block"
            />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl leading-[1.12] tracking-tight text-ink sm:text-[2.3rem]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 font-typewriter text-[13px] leading-relaxed text-ink-soft">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <BotanicalDivider />
    </header>
  );
}
