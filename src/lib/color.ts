import type { AccentColor, Priority } from '../types';

export interface AccentClasses {
  /** soft botanical wash for accents and column tints */
  soft: string;
  /** slightly stronger fill for dots, bars and decorations */
  mid: string;
  /** delicate botanical hairline border */
  border: string;
  /** text that stays readable on the soft fill */
  text: string;
  /** solid botanical ink fill with high-contrast label */
  solid: string;
  /** raw value for SVG fills and icon tints */
  hex: string;
}

/**
 * Every class name is written out literally so Tailwind's scanner keeps it.
 * Palette keys are shared by projects, board columns, task cards and habits.
 * Mapped to Toodles' enchanted botanical forest & wildflower palette (see src/index.css).
 */
export const ACCENTS: Record<AccentColor, AccentClasses> = {
  lilac: {
    soft: 'bg-mint-100',
    mid: 'bg-lilac-300',
    border: 'border-mint-200',
    text: 'text-mint-700',
    solid: 'bg-lilac-300 text-primary-ink',
    hex: '#344B3C',
  },
  peach: {
    soft: 'bg-peach-100',
    mid: 'bg-peach-500',
    border: 'border-peach-200',
    text: 'text-peach-700',
    solid: 'bg-peach-500 text-primary-ink',
    hex: '#9D775A',
  },
  mint: {
    soft: 'bg-mint-100',
    mid: 'bg-mint-500',
    border: 'border-mint-200',
    text: 'text-mint-700',
    solid: 'bg-mint-500 text-primary-ink',
    hex: '#566B50',
  },
  butter: {
    soft: 'bg-butter-100',
    mid: 'bg-butter-500',
    border: 'border-butter-200',
    text: 'text-butter-700',
    solid: 'bg-butter-500 text-primary-ink',
    hex: '#8E8049',
  },
  sky: {
    soft: 'bg-sky-100',
    mid: 'bg-sky-500',
    border: 'border-sky-200',
    text: 'text-sky-700',
    solid: 'bg-sky-500 text-primary-ink',
    hex: '#7F6D89',
  },
  rose: {
    soft: 'bg-rose-100',
    mid: 'bg-rose-300',
    border: 'border-rose-200',
    text: 'text-rose-700',
    solid: 'bg-rose-500 text-primary-ink',
    hex: '#BC9995',
  },
};

export const ACCENT_KEYS: AccentColor[] = ['lilac', 'mint', 'rose', 'sky', 'butter', 'peach'];

export const ACCENT_LABELS: Record<AccentColor, string> = {
  lilac: 'Deep Forest',
  mint: 'Fern Moss',
  rose: 'Dusty Rose',
  sky: 'Soft Mauve',
  butter: 'Champagne',
  peach: 'Warm Blossom',
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
    chip: 'bg-paper-2/70 text-ink-soft border-divider',
    dot: 'bg-sage',
    icon: 'text-ink-soft',
  },
  low: {
    label: 'Low',
    chip: 'bg-sky-100 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
    icon: 'text-sky-700',
  },
  medium: {
    label: 'Medium',
    chip: 'bg-butter-100 text-butter-700 border-butter-200',
    dot: 'bg-butter-500',
    icon: 'text-butter-700',
  },
  high: {
    label: 'High',
    chip: 'bg-rose-100 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    icon: 'text-rose-700',
  },
};

export const PRIORITY_KEYS: Priority[] = ['none', 'low', 'medium', 'high'];
