import { SCHEMA_VERSION } from '../types';
import type {
  AccentColor,
  AppSettings,
  BoardColumn,
  DiaryEntry,
  Habit,
  HabitCheck,
  MoodLevel,
  MoodLog,
  Priority,
  Project,
  RepeatRule,
  Subtask,
  Task,
  FocusSession,
  UserAccount,
  ToodlesData,
} from '../types';
import { createEmptyData, newId } from '../lib/factories';
import { isValidDateString, nowTimestamp } from '../lib/date';
import { ACCENT_KEYS } from '../lib/color';

/** The one and only localStorage key. Everything personal lives inside it. */
export const STORAGE_KEY = 'toodles';
/** Kept aside if we ever fail to parse the stored blob. */
export const BACKUP_KEY = 'toodles.recovery';

/* ------------------------------------------------------------- coercion */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function nullableStr(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function dateStr(value: unknown): string | null {
  return typeof value === 'string' && isValidDateString(value) ? value : null;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function optionalNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function idOf(value: unknown): string {
  const raw = str(value).trim();
  return raw.length > 0 ? raw : newId();
}

function isoOf(value: unknown): string {
  const raw = str(value).trim();
  if (raw.length === 0) return nowTimestamp();
  return Number.isNaN(new Date(raw).getTime()) ? nowTimestamp() : raw;
}

function accentOf(value: unknown, fallback: AccentColor = 'lilac'): AccentColor {
  return oneOf(value, ACCENT_KEYS, fallback);
}

const PRIORITIES: readonly Priority[] = ['none', 'low', 'medium', 'high'];
const REPEATS: readonly RepeatRule[] = ['none', 'daily', 'weekdays', 'weekly', 'monthly'];
const MOODS: readonly MoodLevel[] = ['happy', 'good', 'okay', 'low', 'difficult'];


/* --------------------------------------------------------- normalisation */

const THEMES = ['system', 'light', 'dark'] as const;

function normaliseAccount(raw: unknown): UserAccount | null {
  if (!isRecord(raw)) return null;
  const email = str(raw.email).trim();
  const name = str(raw.name).trim();
  if (email.length === 0 && name.length === 0) return null;
  return {
    id: idOf(raw.id),
    email,
    name: name || (email.includes('@') ? email.split('@')[0] : 'Friend'),
    avatar: nullableStr(raw.avatar) ?? undefined,
    provider: raw.provider === 'google' ? 'google' : 'email',
    syncedAt: nullableStr(raw.syncedAt),
    syncAcrossDevices: bool(raw.syncAcrossDevices, true),
  };
}

function normaliseSettings(raw: unknown): AppSettings {
  const record = isRecord(raw) ? raw : {};
  return {
    displayName: str(record.displayName).slice(0, 60),
    weekStartsOn: record.weekStartsOn === 0 ? 0 : 1,
    splashSeenAt: nullableStr(record.splashSeenAt),
    theme: oneOf(record.theme, THEMES, 'system'),
    sidebarOpen: bool(record.sidebarOpen, true),
    tagsSeeded: bool(record.tagsSeeded, false),
    account: normaliseAccount(record.account),
    guestMode: bool(record.guestMode, false),
  };
}

function normaliseSubtask(raw: unknown): Subtask | null {
  if (!isRecord(raw)) return null;
  const title = str(raw.title).trim();
  if (title.length === 0) return null;
  return { id: idOf(raw.id), title, done: bool(raw.done, false), color: accentOf(raw.color) };
}

function normaliseTask(raw: unknown): Task | null {
  if (!isRecord(raw)) return null;
  const title = str(raw.title).trim();
  if (title.length === 0) return null;
  const status = raw.status === 'done' ? 'done' : 'todo';
  return {
    id: idOf(raw.id),
    title,
    description: str(raw.description),
    projectId: nullableStr(raw.projectId),
    priority: oneOf(raw.priority, PRIORITIES, 'none'),
    startDate: dateStr(raw.startDate),
    dueDate: dateStr(raw.dueDate),
    dueTime: nullableStr(raw.dueTime),
    estimate: optionalNumber(raw.estimate),
    repeat: oneOf(raw.repeat, REPEATS, 'none'),
    reminder: bool(raw.reminder, false),
    tags: stringList(raw.tags),
    status,
    boardColumnId: nullableStr(raw.boardColumnId),
    color: accentOf(raw.color),
    completedAt: status === 'done' ? nullableStr(raw.completedAt) ?? nowTimestamp() : null,
    createdAt: isoOf(raw.createdAt),
    subtasks: normaliseList(raw.subtasks, normaliseSubtask),
    type: raw.type === 'study' ? 'study' : 'task',
    studyMinutes: optionalNumber(raw.studyMinutes) ?? 0,
  };
}

function normaliseProject(raw: unknown): Project | null {
  if (!isRecord(raw)) return null;
  const name = str(raw.name).trim();
  if (name.length === 0) return null;
  return {
    id: idOf(raw.id),
    name,
    description: str(raw.description),
    color: accentOf(raw.color),
    emoji: str(raw.emoji, '🌱').slice(0, 4) || '🌱',
    icon: nullableStr(raw.icon) ?? undefined,
    cover: nullableStr(raw.cover) ?? undefined,
    coverPosition: optionalNumber(raw.coverPosition) ?? 50,
    createdAt: isoOf(raw.createdAt),
    archived: bool(raw.archived, false),
  };
}

function normaliseColumn(raw: unknown): BoardColumn | null {
  if (!isRecord(raw)) return null;
  const name = str(raw.name).trim();
  const projectId = nullableStr(raw.projectId);
  if (name.length === 0 || !projectId) return null;
  return {
    id: idOf(raw.id),
    projectId,
    name,
    color: accentOf(raw.color),
    order: optionalNumber(raw.order) ?? 0,
  };
}

function normaliseDiaryEntry(raw: unknown): DiaryEntry | null {
  if (!isRecord(raw)) return null;
  const title = str(raw.title).trim();
  const body = str(raw.body);
  if (title.length === 0 && body.trim().length === 0) return null;
  return {
    id: idOf(raw.id),
    date: dateStr(raw.date) ?? nowTimestamp().slice(0, 10),
    title,
    body,
    mood: typeof raw.mood === 'string' ? oneOf(raw.mood, MOODS, 'okay') : null,
    projectId: nullableStr(raw.projectId),
    tags: stringList(raw.tags),
    photos: stringList(raw.photos),
    createdAt: isoOf(raw.createdAt),
    updatedAt: isoOf(raw.updatedAt),
  };
}

function normaliseMood(raw: unknown): MoodLog | null {
  if (!isRecord(raw)) return null;
  const date = dateStr(raw.date);
  if (!date) return null;
  return {
    date,
    mood: oneOf(raw.mood, MOODS, 'okay'),
    note: str(raw.note),
    updatedAt: isoOf(raw.updatedAt),
  };
}

function normaliseHabit(raw: unknown): Habit | null {
  if (!isRecord(raw)) return null;
  const name = str(raw.name).trim();
  if (name.length === 0) return null;
  const weekdays = Array.isArray(raw.weekdays)
    ? raw.weekdays.filter(
        (day): day is number => typeof day === 'number' && day >= 0 && day <= 6,
      )
    : [];
  return {
    id: idOf(raw.id),
    name,
    color: accentOf(raw.color, 'mint'),
    frequency: raw.frequency === 'weekly' ? 'weekly' : 'daily',
    weekdays:
      weekdays.length > 0 ? [...new Set(weekdays)].sort((a, b) => a - b) : [0, 1, 2, 3, 4, 5, 6],
    createdAt: isoOf(raw.createdAt),
    archived: bool(raw.archived, false),
  };
}

function normaliseHabitCheck(raw: unknown): HabitCheck | null {
  if (!isRecord(raw)) return null;
  const habitId = nullableStr(raw.habitId);
  const date = dateStr(raw.date);
  if (!habitId || !date) return null;
  return { habitId, date };
}

function normaliseList<T>(value: unknown, parse: (item: unknown) => T | null): T[] {
  if (!Array.isArray(value)) return [];
  return value.map(parse).filter((item): item is T => item !== null);
}

/** Turns any unknown blob into a safe, complete ToodlesData object. */
export function normaliseData(raw: unknown): ToodlesData {
  const record = isRecord(raw) ? raw : {};
  const projects = normaliseList(record.projects, normaliseProject);
  const projectIds = new Set(projects.map((project) => project.id));
  const columns = normaliseList(record.boardColumns, normaliseColumn).filter((column) =>
    projectIds.has(column.projectId),
  );
  const columnIds = new Set(columns.map((column) => column.id));
  const tasks = normaliseList(record.tasks, normaliseTask).map((task) => ({
    ...task,
    projectId: task.projectId && projectIds.has(task.projectId) ? task.projectId : null,
    boardColumnId:
      task.boardColumnId && columnIds.has(task.boardColumnId) ? task.boardColumnId : null,
  }));
  const habits = normaliseList(record.habits, normaliseHabit);
  const habitIds = new Set(habits.map((habit) => habit.id));
  const diaryEntries = normaliseList(record.diaryEntries, normaliseDiaryEntry).map((entry) => ({
    ...entry,
    projectId: entry.projectId && projectIds.has(entry.projectId) ? entry.projectId : null,
  }));

  return {
    version: SCHEMA_VERSION,
    settings: normaliseSettings(record.settings),
    projects,
    tasks,
    boardColumns: columns,
    diaryEntries,
    moods: normaliseList(record.moods, normaliseMood),
    habits,
    habitChecks: normaliseList(record.habitChecks, normaliseHabitCheck).filter((check) =>
      habitIds.has(check.habitId),
    ),
    focusSessions: Array.isArray(record.focusSessions) ? (record.focusSessions as FocusSession[]) : [],
  };
}

/* ----------------------------------------------------------- read / write */

/**
 * Forward-compatible migrations. Bump SCHEMA_VERSION and add a step here
 * rather than changing the shape silently (see AGENTS.md §9).
 */
function migrate(data: ToodlesData, fromVersion: number): ToodlesData {
  if (fromVersion > SCHEMA_VERSION) {
    console.warn('[toodles] local data comes from a newer version; reading best effort');
  }
  let migrated = { ...data };
  if (fromVersion < 2) {
    migrated = {
      ...migrated,
      settings: {
        ...migrated.settings,
        theme: migrated.settings.theme || 'system',
        sidebarOpen: migrated.settings.sidebarOpen ?? true,
        tagsSeeded: migrated.settings.tagsSeeded ?? false,
      },
      tags: migrated.tags ?? [],
      focusSessions: migrated.focusSessions ?? [],
    };
  }
  return { ...migrated, version: SCHEMA_VERSION };
}

/** Reads and repairs the stored workspace. Never throws. */
export function readData(): ToodlesData {
  if (typeof window === 'undefined') return createEmptyData();
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[toodles] localStorage is unavailable, starting empty', error);
    return createEmptyData();
  }
  if (!raw) return createEmptyData();

  try {
    const parsed: unknown = JSON.parse(raw);
    const version = isRecord(parsed) ? optionalNumber(parsed.version) ?? 0 : 0;
    return migrate(normaliseData(parsed), version);
  } catch (error) {
    console.warn('[toodles] could not read local data, starting empty', error);
    try {
      window.localStorage.setItem(BACKUP_KEY, raw);
    } catch {
      /* storage is full or blocked — nothing else we can do */
    }
    return createEmptyData();
  }
}

/** Saves the whole workspace under the single versioned key. */
export function writeData(data: ToodlesData): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...data, version: SCHEMA_VERSION }),
    );
    return true;
  } catch (error) {
    console.warn('[toodles] could not save local data', error);
    return false;
  }
}

export function clearStoredData(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(BACKUP_KEY);
  } catch (error) {
    console.warn('[toodles] could not clear local data', error);
  }
}

/** Pretty JSON file contents for the "Export data" button. */
export function exportJson(data: ToodlesData): string {
  return JSON.stringify(
    { app: 'Toodles', exportedAt: nowTimestamp(), version: SCHEMA_VERSION, data },
    null,
    2,
  );
}

/** Parses an imported file. Throws a friendly Error when it is not Toodles JSON. */
export function parseImport(text: string): ToodlesData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That file isn't Toodles JSON, so I couldn't read it.");
  }
  const source = isRecord(parsed) && isRecord(parsed.data) ? parsed.data : parsed;
  if (!isRecord(source)) {
    throw new Error("That file isn't Toodles JSON, so I couldn't read it.");
  }
  const hasKnownShape = [
    'tasks',
    'projects',
    'boardColumns',
    'diaryEntries',
    'moods',
    'habits',
    'habitChecks',
  ].some((key) => Array.isArray(source[key]));
  if (!hasKnownShape) {
    throw new Error('No tasks, projects or notes were found in that file.');
  }
  return normaliseData(source);
}

/** Rough size of the saved workspace, shown in Settings. */
export function storedSize(data: ToodlesData): string {
  const bytes = new Blob([JSON.stringify(data)]).size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function storageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const probe = '__toodles_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
