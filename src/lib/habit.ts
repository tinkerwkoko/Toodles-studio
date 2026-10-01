import type { DateString, Habit, HabitCheck } from '../types';
import { WEEKDAY_MIN } from './date';

export function isHabitScheduled(habit: Habit, date: DateString): boolean {
  if (habit.frequency === 'daily') return true;
  const day = new Date(`${date}T00:00:00`).getDay();
  return habit.weekdays.includes(day);
}

export function isHabitChecked(
  checks: HabitCheck[],
  habitId: string,
  date: DateString,
): boolean {
  return checks.some((check) => check.habitId === habitId && check.date === date);
}

export function weekdayInitials(weekdays: number[]): string {
  return weekdays.map((day) => WEEKDAY_MIN[day] ?? '').join(' ');
}

export interface HabitStreaks {
  current: number;
  best: number;
  /** Checks in the last 7 days, for the little weekly bar. */
  weekDone: number;
}

/** Streaks only count days the habit was actually scheduled for. */
export function habitStreak(habit: Habit, checks: HabitCheck[], today: DateString): HabitStreaks {
  const done = new Set(
    checks.filter((check) => check.habitId === habit.id).map((check) => check.date),
  );

  let current = 0;
  const cursor = new Date(`${today}T00:00:00`);
  for (let step = 0; step < 366; step += 1) {
    const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(
      cursor.getDate(),
    ).padStart(2, '0')}`;
    if (!isHabitScheduled(habit, iso) && !done.has(iso)) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    if (done.has(iso)) {
      current += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    if (step === 0) {
      // Today is not done yet: it does not break the streak.
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    break;
  }

  let best = 0;
  let run = 0;
  const sorted = [...done].sort();
  let previous: string | null = null;
  sorted.forEach((date) => {
    if (previous === null) {
      run = 1;
    } else {
      const gap = Math.round(
        (new Date(`${date}T00:00:00`).getTime() - new Date(`${previous}T00:00:00`).getTime()) /
          86_400_000,
      );
      run = gap === 1 ? run + 1 : 1;
    }
    best = Math.max(best, run);
    previous = date;
  });

  return { current, best: Math.max(best, current), weekDone: 0 };
}
