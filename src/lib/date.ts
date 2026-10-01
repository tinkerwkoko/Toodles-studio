import type { DateString, Timestamp } from '../types';

/** Local-day helpers. Toodles never sends dates anywhere, so everything is local time. */

export function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function toDateString(date: Date): DateString {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function todayString(): DateString {
  return toDateString(new Date());
}

export function nowTimestamp(): Timestamp {
  return new Date().toISOString();
}

/** Parses `YYYY-MM-DD` as a local-midnight Date (no UTC shifting). */
export function parseDateString(value: DateString): Date {
  const parts = value.split('-').map(Number);
  const year = parts[0] ?? 1970;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  return new Date(year, month - 1, day);
}

export function isValidDateString(value: string | null | undefined): boolean {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function addDays(value: DateString, days: number): DateString {
  const date = parseDateString(value);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

export function addMonths(value: DateString, months: number): DateString {
  const date = parseDateString(value);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return toDateString(date);
}

export function daysBetween(from: DateString, to: DateString): number {
  const a = parseDateString(from).getTime();
  const b = parseDateString(to).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function isToday(value: DateString | null): boolean {
  return value === todayString();
}

export function isPast(value: DateString | null): boolean {
  return !!value && value < todayString();
}

export function isFuture(value: DateString | null): boolean {
  return !!value && value > todayString();
}

/** A task is overdue when its due date is before today and it is still open. */
export function isOverdue(value: DateString | null): boolean {
  return isPast(value);
}

/* ---------------------------------------------------------------- labels */

export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEKDAY_MIN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const WEEKDAY_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
export const MONTH_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
export const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function monthName(monthIndex: number, short = false): string {
  const list = short ? MONTH_SHORT : MONTH_LONG;
  return list[monthIndex] ?? '';
}

export function weekdayName(value: DateString, short = false): string {
  const names = short ? WEEKDAY_SHORT : WEEKDAY_LONG;
  return names[parseDateString(value).getDay()] ?? '';
}

/** `Mon 5 May`, plus the year when it differs from the current year. */
export function formatDay(
  value: DateString,
  opts: { withWeekday?: boolean; withYear?: 'auto' | 'always' } = {},
): string {
  const date = parseDateString(value);
  const withWeekday = opts.withWeekday ?? true;
  const yearMode = opts.withYear ?? 'auto';
  const showYear = yearMode === 'always' || date.getFullYear() !== new Date().getFullYear();
  const parts: string[] = [];
  if (withWeekday) parts.push(WEEKDAY_SHORT[date.getDay()] ?? '');
  parts.push(`${date.getDate()} ${MONTH_SHORT[date.getMonth()] ?? ''}`);
  if (showYear) parts.push(String(date.getFullYear()));
  return parts.join(' ');
}

export function formatLongDay(value: DateString): string {
  const date = parseDateString(value);
  return `${WEEKDAY_LONG[date.getDay()] ?? ''} ${date.getDate()} ${
    MONTH_LONG[date.getMonth()] ?? ''
  } ${date.getFullYear()}`;
}

export function formatMonthYear(year: number, monthIndex: number): string {
  return `${MONTH_LONG[monthIndex] ?? ''} ${year}`;
}

/** Friendly grouping label: Today / Tomorrow / Yesterday / weekday / Next week / Later. */
export function dayLabel(value: DateString): string {
  const diff = daysBetween(todayString(), value);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff < 7) return weekdayName(value);
  if (diff >= 7 && diff < 14) return 'Next week';
  return 'Later';
}

/** Week start (Sunday or Monday) for a date. */
export function weekStart(value: DateString, weekStartsOn: 0 | 1 = 1): DateString {
  const date = parseDateString(value);
  const day = date.getDay();
  const diff = weekStartsOn === 1 ? (day + 6) % 7 : day;
  return addDays(value, -diff);
}

export function weekDates(start: DateString, count = 7): DateString[] {
  return Array.from({ length: count }, (_, index) => addDays(start, index));
}

export interface MonthCell {
  date: DateString;
  inMonth: boolean;
  day: number;
}

/** 6x7 grid of days for a month, padded to whole weeks. */
export function monthGrid(year: number, monthIndex: number, weekStartsOn: 0 | 1 = 1): MonthCell[] {
  const first = toDateString(new Date(year, monthIndex, 1));
  const start = weekStart(first, weekStartsOn);
  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index);
    const parsed = parseDateString(date);
    return { date, inMonth: parsed.getMonth() === monthIndex, day: parsed.getDate() };
  });
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/* --------------------------------------------------------------- formats */

export function formatTime(value: string | null): string {
  if (!value) return '';
  const parts = value.split(':');
  const hours = Number(parts[0] ?? 0);
  const minutes = Number(parts[1] ?? 0);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${pad2(minutes)} ${suffix}`;
}

export function formatEstimate(minutes: number | null): string {
  if (!minutes || minutes <= 0) return '';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

export function formatTimestamp(value: Timestamp): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${formatDay(toDateString(date))} · ${formatTime(
    `${pad2(date.getHours())}:${pad2(date.getMinutes())}`,
  )}`;
}

export function formatDurationWords(from: DateString, to: DateString): string {
  const diff = daysBetween(from, to);
  const abs = Math.abs(diff);
  if (abs === 0) return 'today';
  if (abs === 1) return diff > 0 ? 'tomorrow' : 'yesterday';
  if (abs < 30) return `${abs} days ${diff > 0 ? 'from now' : 'ago'}`;
  const months = Math.round(abs / 30);
  if (months < 24) {
    return `${months} month${months === 1 ? '' : 's'} ${diff > 0 ? 'from now' : 'ago'}`;
  }
  const years = Math.round(abs / 365);
  return `${years} year${years === 1 ? '' : 's'} ${diff > 0 ? 'from now' : 'ago'}`;
}

export function greetingTimeOfDay(now = new Date()): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = now.getHours();
  if (hour < 5) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'night';
}
