import type { AccentColor, Priority } from '../types';

export interface AccentClasses {
  /** soft paper wash for accents and column tints */
  soft: string;
  /** slightly stronger fill for dots, bars and decorations */
  mid: string;
  /** gentle archival border */
  border: string;
  /** text that stays readable on the soft fill */
  text: string;
  /** solid ink fill with high-contrast label */
  solid: string;
  /** raw value for SVG fills and icon tints */
  hex: string;
}

/**
 * Every class name is written out literally so Tailwind's scanner keeps it.
 * Palette keys are shared by projects, board columns, task cards and habits.
 * Mapped to Toodles' vintage stationery & library ink palette (see src/index.css).
 */
export const ACCENTS: Record<AccentColor, AccentClasses> = {
  lilac: {
    soft: 'bg-rose-100',
    mid: 'bg-lilac-300',
    border: 'border-rose-200',
    text: 'text-rose-700',
    solid: 'bg-lilac-300 text-primary-ink',
    hex: '#713F46',
  },
  peach: {
    soft: 'bg-peach-100',
    mid: 'bg-peach-500',
    border: 'border-peach-200',
    text: 'text-peach-700',
    solid: 'bg-peach-500 text-primary-ink',
    hex: '#A4664B',
  },
  mint: {
    soft: 'bg-mint-100',
    mid: 'bg-mint-500',
    border: 'border-mint-200',
    text: 'text-mint-700',
    solid: 'bg-mint-500 text-primary-ink',
    hex: '#465747',
  },
  butter: {
    soft: 'bg-butter-100',
    mid: 'bg-butter-500',
    border: 'border-butter-200',
    text: 'text-butter-700',
    solid: 'bg-butter-500 text-primary-ink',
    hex: '#9B7C39',
  },
  sky: {
    soft: 'bg-sky-100',
    mid: 'bg-sky-500',
    border: 'border-sky-200',
    text: 'text-sky-700',
    solid: 'bg-sky-500 text-primary-ink',
    hex: '#526A7C',
  },
  rose: {
    soft: 'bg-rose-100',
    mid: 'bg-rose-300',
    border: 'border-rose-200',
    text: 'text-rose-700',
    solid: 'bg-rose-500 text-primary-ink',
    hex: '#B88F89',
  },
};

export const ACCENT_KEYS: AccentColor[] = ['lilac', 'peach', 'mint', 'butter', 'sky', 'rose'];

export const ACCENT_LABELS: Record<AccentColor, string> = {
  lilac: 'Burgundy',
  peach: 'Terracotta',
  mint: 'Forest',
  butter: 'Ochre',
  sky: 'Slate',
  rose: 'Dusty Rose',
};

export function accent(color: AccentColor | null | undefined): AccentClasses {
  return ACCENTS[color ?? 'lilac'] ?? ACCENTS.lilac;
}

export interface PriorityStyle {
  label: string;
  chip: string;
  dot: string;
  icon: string;
}

export const PRIORITY_STYLES: Record<Priority, PriorityStyle> = {
  none: {
    label: 'No priority',
    chip: 'bg-paper-2/70 text-ink-soft border-lilac-200',
    dot: 'bg-lilac-200',
    icon: 'text-ink-soft',
  },
  low: {
    label: 'Low',
    chip: 'bg-sky-100 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
    icon: 'text-sky-500',
  },
  medium: {
    label: 'Medium',
    chip: 'bg-butter-100 text-butter-700 border-butter-200',
    dot: 'bg-butter-500',
    icon: 'text-butter-500',
  },
  high: {
    label: 'High',
    chip: 'bg-rose-100 text-rose-700 border-rose-200',
    dot: 'bg-lilac-300',
    icon: 'text-rose-700',
  },
};

export const PRIORITY_KEYS: Priority[] = ['none', 'low', 'medium', 'high'];
