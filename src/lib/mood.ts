import type { AccentColor, MoodLevel } from '../types';

export interface MoodMeta {
  level: MoodLevel;
  label: string;
  hint: string;
  phrase: string;
  color: AccentColor;
}

export const MOOD_PHRASES: Record<MoodLevel, string> = {
  difficult: 'A heavy one',
  low: 'A quiet one',
  okay: 'Somewhere in the middle',
  good: 'A gentle good one',
  happy: 'A bright one',
};

/**
 * Five mood levels from difficult to happy:
 * Difficult, Low, Okay, Good, Happy.
 */
export const MOODS: MoodMeta[] = [
  { level: 'difficult', label: 'Difficult', hint: 'A heavy one', phrase: 'A heavy one', color: 'rose' },
  { level: 'low', label: 'Low', hint: 'A quiet one', phrase: 'A quiet one', color: 'sky' },
  { level: 'okay', label: 'Okay', hint: 'Somewhere in the middle', phrase: 'Somewhere in the middle', color: 'butter' },
  { level: 'good', label: 'Good', hint: 'A gentle good one', phrase: 'A gentle good one', color: 'mint' },
  { level: 'happy', label: 'Happy', hint: 'A bright one', phrase: 'A bright one', color: 'peach' },
];

const MOOD_BY_LEVEL: Record<MoodLevel, MoodMeta> = MOODS.reduce(
  (accumulator, mood) => ({ ...accumulator, [mood.level]: mood }),
  {} as Record<MoodLevel, MoodMeta>,
);

export function moodMeta(level: MoodLevel): MoodMeta {
  return MOOD_BY_LEVEL[level] ?? MOODS[2];
}
