import { serverTimestamp, Timestamp } from 'firebase/firestore';
import type {
  AccentColor,
  AppSettings,
  BoardColumn,
  DiaryEntry,
  FocusSession,
  Habit,
  HabitCheck,
  MoodLevel,
  MoodLog,
  PomodoroSettings,
  Priority,
  Project,
  RepeatRule,
  Subtask,
  Task,
  TaskStatus,
  ThemeMode,
} from '../types';
import { nowTimestamp, todayString } from './date';

/**
 * Programmatic schema sanitization synchronized verbatim with
 * `firebase-blueprint.json` and `firestore.rules`.
 */

const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const ACCENTS: readonly AccentColor[] = ['lilac', 'peach', 'mint', 'butter', 'sky', 'rose'];
const PRIORITIES: readonly Priority[] = ['none', 'low', 'medium', 'high'];
const REPEATS: readonly RepeatRule[] = ['none', 'daily', 'weekdays', 'weekly', 'monthly'];
const STATUSES: readonly TaskStatus[] = ['todo', 'done'];
const MOODS: readonly MoodLevel[] = ['happy', 'good', 'okay', 'low', 'difficult'];
const THEMES: readonly ThemeMode[] = ['system', 'light', 'dark'];

export function sanitizeId(id: string): string {
  const cleaned = id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
  if (cleaned.length > 0 && ID_PATTERN.test(cleaned)) return cleaned;
  return `id_${Date.now().toString(36)}`;
}

export function sanitizeNullableId(id: string | null | undefined): string | null {
  if (!id || typeof id !== 'string') return null;
  const cleaned = id.trim();
  if (cleaned.length === 0 || cleaned.length > 128 || !ID_PATTERN.test(cleaned)) return null;
  return cleaned;
}

export function sanitizeString(value: unknown, maxLength: number, fallback = ''): string {
  const str = typeof value === 'string' ? value : fallback;
  return str.slice(0, maxLength);
}

export function sanitizeNonEmptyString(
  value: unknown,
  maxLength: number,
  fallback: string,
): string {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return (trimmed.length > 0 ? trimmed : fallback).slice(0, maxLength);
}

export function sanitizeNullableString(
  value: unknown,
  maxLength: number,
): string | null {
  if (typeof value !== 'string') return null;
  if (value.length === 0) return null;
  if (value.length > maxLength) return null;
  return value;
}

export function sanitizeDateString(value: unknown, fallback?: string): string {
  if (typeof value === 'string' && DATE_PATTERN.test(value)) return value;
  return fallback ?? todayString();
}

export function sanitizeNullableDate(value: unknown): string | null {
  if (typeof value === 'string' && DATE_PATTERN.test(value)) return value;
  return null;
}

export function sanitizeAccent(value: unknown, fallback: AccentColor = 'lilac'): AccentColor {
  return typeof value === 'string' && (ACCENTS as readonly string[]).includes(value)
    ? (value as AccentColor)
    : fallback;
}

export function sanitizePriority(value: unknown): Priority {
  return typeof value === 'string' && (PRIORITIES as readonly string[]).includes(value)
    ? (value as Priority)
    : 'none';
}

export function sanitizeRepeat(value: unknown): RepeatRule {
  return typeof value === 'string' && (REPEATS as readonly string[]).includes(value)
    ? (value as RepeatRule)
    : 'none';
}

export function sanitizeStatus(value: unknown): TaskStatus {
  return typeof value === 'string' && (STATUSES as readonly string[]).includes(value)
    ? (value as TaskStatus)
    : 'todo';
}

export function sanitizeMood(value: unknown): MoodLevel {
  return typeof value === 'string' && (MOODS as readonly string[]).includes(value)
    ? (value as MoodLevel)
    : 'okay';
}

export function sanitizeNullableMood(value: unknown): MoodLevel | null {
  return typeof value === 'string' && (MOODS as readonly string[]).includes(value)
    ? (value as MoodLevel)
    : null;
}

export function sanitizeTheme(value: unknown): ThemeMode {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value)
    ? (value as ThemeMode)
    : 'system';
}

export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const num = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, num));
}

export function clampNullableNumber(
  value: unknown,
  min: number,
  max: number,
): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.min(max, Math.max(min, value));
}

export function sanitizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  const result: string[] = [];
  for (const item of tags) {
    if (typeof item === 'string') {
      const cleaned = item.trim().slice(0, 100);
      if (cleaned.length > 0 && !result.includes(cleaned)) {
        result.push(cleaned);
        if (result.length >= 20) break;
      }
    }
  }
  return result;
}

export function sanitizePhotos(photos: unknown): string[] {
  if (!Array.isArray(photos)) return [];
  const result: string[] = [];
  for (const item of photos) {
    if (typeof item === 'string' && item.length > 0 && item.length <= 200000) {
      result.push(item);
      if (result.length >= 4) break;
    }
  }
  return result;
}

export function sanitizeSubtasks(subtasks: unknown): Subtask[] {
  if (!Array.isArray(subtasks)) return [];
  const result: Subtask[] = [];
  for (const raw of subtasks) {
    if (!raw || typeof raw !== 'object') continue;
    const item = raw as Record<string, unknown>;
    result.push({
      id: sanitizeId(typeof item.id === 'string' ? item.id : `sub_${result.length}`),
      title: sanitizeString(item.title, 200),
      done: Boolean(item.done),
      color: sanitizeAccent(item.color),
    });
    if (result.length >= 50) break;
  }
  return result;
}

export function sanitizeWeekdays(weekdays: unknown): number[] {
  if (!Array.isArray(weekdays)) return [];
  const set = new Set<number>();
  for (const d of weekdays) {
    if (typeof d === 'number' && Number.isInteger(d) && d >= 0 && d <= 6) {
      set.add(d);
    }
  }
  return Array.from(set).sort((a, b) => a - b).slice(0, 7);
}

export function sanitizePomodoro(p: unknown): PomodoroSettings | null {
  if (!p || typeof p !== 'object') return null;
  const raw = p as Record<string, unknown>;
  return {
    focus: clampNumber(raw.focus, 1, 180, 25),
    shortBreak: clampNumber(raw.shortBreak, 1, 60, 5),
    longBreak: clampNumber(raw.longBreak, 1, 90, 15),
    rounds: clampNumber(raw.rounds, 1, 12, 4),
  };
}

export function timestampToIso(value: unknown, fallback = nowTimestamp()): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value && typeof value === 'object' && 'toDate' in value) {
    const maybe = (value as { toDate: () => Date }).toDate();
    if (maybe instanceof Date && !Number.isNaN(maybe.getTime())) {
      return maybe.toISOString();
    }
  }
  if (typeof value === 'string' && value.length > 0) return value;
  return fallback;
}

/* ------------------------------------------------------------------
   Firestore Write Serializers (Create & Update Payloads)
   ------------------------------------------------------------------ */

export function serializeUserProfileCreate(
  uid: string,
  email: string,
  photoURL: string | null,
  settings: AppSettings,
): Record<string, unknown> {
  return {
    uid: sanitizeId(uid),
    displayName: sanitizeString(settings.displayName, 100),
    email: sanitizeString(email, 254),
    photoURL: sanitizeNullableString(photoURL, 1000),
    weekStartsOn: settings.weekStartsOn === 0 ? 0 : 1,
    theme: sanitizeTheme(settings.theme),
    sidebarOpen: Boolean(settings.sidebarOpen),
    dailyFocusGoalMinutes: clampNumber(settings.dailyFocusGoalMinutes, 0, 1440, 60),
    pomodoro: sanitizePomodoro(settings.pomodoro),
    tagsSeeded: Boolean(settings.tagsSeeded),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function serializeUserProfilePatch(
  patch: Partial<AppSettings>,
  email?: string,
  photoURL?: string | null,
): Record<string, unknown> {
  const out: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };
  if (patch.displayName !== undefined) out.displayName = sanitizeString(patch.displayName, 100);
  if (email !== undefined) out.email = sanitizeString(email, 254);
  if (photoURL !== undefined) out.photoURL = sanitizeNullableString(photoURL, 1000);
  if (patch.weekStartsOn !== undefined) out.weekStartsOn = patch.weekStartsOn === 0 ? 0 : 1;
  if (patch.theme !== undefined) out.theme = sanitizeTheme(patch.theme);
  if (patch.sidebarOpen !== undefined) out.sidebarOpen = Boolean(patch.sidebarOpen);
  if (patch.dailyFocusGoalMinutes !== undefined) {
    out.dailyFocusGoalMinutes = clampNumber(patch.dailyFocusGoalMinutes, 0, 1440, 60);
  }
  if (patch.pomodoro !== undefined) out.pomodoro = sanitizePomodoro(patch.pomodoro);
  if (patch.tagsSeeded !== undefined) out.tagsSeeded = Boolean(patch.tagsSeeded);
  return out;
}

export function serializeProjectCreate(uid: string, project: Project): Record<string, unknown> {
  return {
    id: sanitizeId(project.id),
    ownerId: sanitizeId(uid),
    name: sanitizeNonEmptyString(project.name, 120, 'Untitled project'),
    description: sanitizeString(project.description, 1000),
    color: sanitizeAccent(project.color),
    emoji: sanitizeString(project.emoji || '🌱', 16),
    icon: sanitizeNullableString(project.icon, 120000),
    cover: sanitizeNullableString(project.cover, 250000),
    coverPosition: clampNumber(project.coverPosition, 0, 100, 50),
    archived: Boolean(project.archived),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function serializeProjectPatch(patch: Partial<Project>): Record<string, unknown> {
  const out: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (patch.name !== undefined) out.name = sanitizeNonEmptyString(patch.name, 120, 'Untitled project');
  if (patch.description !== undefined) out.description = sanitizeString(patch.description, 1000);
  if (patch.color !== undefined) out.color = sanitizeAccent(patch.color);
  if (patch.emoji !== undefined) out.emoji = sanitizeString(patch.emoji || '🌱', 16);
  if ('icon' in patch) out.icon = sanitizeNullableString(patch.icon, 120000);
  if ('cover' in patch) out.cover = sanitizeNullableString(patch.cover, 250000);
  if (patch.coverPosition !== undefined) {
    out.coverPosition = clampNumber(patch.coverPosition, 0, 100, 50);
  }
  if (patch.archived !== undefined) out.archived = Boolean(patch.archived);
  return out;
}

export function serializeBoardColumnCreate(
  uid: string,
  column: BoardColumn,
): Record<string, unknown> {
  return {
    id: sanitizeId(column.id),
    ownerId: sanitizeId(uid),
    projectId: sanitizeId(column.projectId),
    name: sanitizeNonEmptyString(column.name, 80, 'Column'),
    color: sanitizeAccent(column.color),
    order: clampNumber(column.order, 0, 500, 0),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function serializeBoardColumnPatch(patch: Partial<BoardColumn>): Record<string, unknown> {
  const out: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (patch.name !== undefined) out.name = sanitizeNonEmptyString(patch.name, 80, 'Column');
  if (patch.color !== undefined) out.color = sanitizeAccent(patch.color);
  if (patch.order !== undefined) out.order = clampNumber(patch.order, 0, 500, 0);
  return out;
}

export function serializeTaskCreate(
  uid: string,
  task: Task,
  sortOrder = Date.now(),
): Record<string, unknown> {
  return {
    id: sanitizeId(task.id),
    ownerId: sanitizeId(uid),
    title: sanitizeNonEmptyString(task.title, 300, 'Untitled task'),
    description: sanitizeString(task.description, 5000),
    projectId: sanitizeNullableId(task.projectId),
    priority: sanitizePriority(task.priority),
    startDate: sanitizeNullableDate(task.startDate),
    dueDate: sanitizeNullableDate(task.dueDate),
    dueTime: sanitizeNullableString(task.dueTime, 40),
    estimate: clampNullableNumber(task.estimate, 0, 10080),
    repeat: sanitizeRepeat(task.repeat),
    reminder: Boolean(task.reminder),
    tags: sanitizeTags(task.tags),
    status: sanitizeStatus(task.status),
    boardColumnId: sanitizeNullableId(task.boardColumnId),
    color: sanitizeAccent(task.color),
    completedAt: sanitizeNullableString(task.completedAt, 64),
    subtasks: sanitizeSubtasks(task.subtasks),
    type: task.type === 'study' ? 'study' : 'task',
    targetMinutes: clampNullableNumber(task.targetMinutes, 0, 10080),
    studyMinutes: clampNumber(task.studyMinutes, 0, 100000, 0),
    sortOrder: clampNumber(sortOrder, -1000000000000, 100000000000000, Date.now()),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function serializeTaskPatch(
  patch: Partial<Task> & { sortOrder?: number },
): Record<string, unknown> {
  const out: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (patch.title !== undefined) out.title = sanitizeNonEmptyString(patch.title, 300, 'Untitled task');
  if (patch.description !== undefined) out.description = sanitizeString(patch.description, 5000);
  if ('projectId' in patch) out.projectId = sanitizeNullableId(patch.projectId);
  if (patch.priority !== undefined) out.priority = sanitizePriority(patch.priority);
  if ('startDate' in patch) out.startDate = sanitizeNullableDate(patch.startDate);
  if ('dueDate' in patch) out.dueDate = sanitizeNullableDate(patch.dueDate);
  if ('dueTime' in patch) out.dueTime = sanitizeNullableString(patch.dueTime, 40);
  if ('estimate' in patch) out.estimate = clampNullableNumber(patch.estimate, 0, 10080);
  if (patch.repeat !== undefined) out.repeat = sanitizeRepeat(patch.repeat);
  if (patch.reminder !== undefined) out.reminder = Boolean(patch.reminder);
  if (patch.tags !== undefined) out.tags = sanitizeTags(patch.tags);
  if (patch.status !== undefined) out.status = sanitizeStatus(patch.status);
  if ('boardColumnId' in patch) out.boardColumnId = sanitizeNullableId(patch.boardColumnId);
  if (patch.color !== undefined) out.color = sanitizeAccent(patch.color);
  if ('completedAt' in patch) out.completedAt = sanitizeNullableString(patch.completedAt, 64);
  if (patch.subtasks !== undefined) out.subtasks = sanitizeSubtasks(patch.subtasks);
  if (patch.type !== undefined) out.type = patch.type === 'study' ? 'study' : 'task';
  if ('targetMinutes' in patch) {
    out.targetMinutes = clampNullableNumber(patch.targetMinutes, 0, 10080);
  }
  if (patch.studyMinutes !== undefined) {
    out.studyMinutes = clampNumber(patch.studyMinutes, 0, 100000, 0);
  }
  if (patch.sortOrder !== undefined) {
    out.sortOrder = clampNumber(patch.sortOrder, -1000000000000, 100000000000000, Date.now());
  }
  return out;
}

export function serializeDiaryEntryCreate(
  uid: string,
  entry: DiaryEntry,
): Record<string, unknown> {
  return {
    id: sanitizeId(entry.id),
    ownerId: sanitizeId(uid),
    date: sanitizeDateString(entry.date),
    title: sanitizeString(entry.title, 200),
    body: sanitizeString(entry.body, 20000),
    mood: sanitizeNullableMood(entry.mood),
    projectId: sanitizeNullableId(entry.projectId),
    tags: sanitizeTags(entry.tags),
    photos: sanitizePhotos(entry.photos),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function serializeDiaryEntryPatch(patch: Partial<DiaryEntry>): Record<string, unknown> {
  const out: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (patch.date !== undefined) out.date = sanitizeDateString(patch.date);
  if (patch.title !== undefined) out.title = sanitizeString(patch.title, 200);
  if (patch.body !== undefined) out.body = sanitizeString(patch.body, 20000);
  if ('mood' in patch) out.mood = sanitizeNullableMood(patch.mood);
  if ('projectId' in patch) out.projectId = sanitizeNullableId(patch.projectId);
  if (patch.tags !== undefined) out.tags = sanitizeTags(patch.tags);
  if (patch.photos !== undefined) out.photos = sanitizePhotos(patch.photos);
  return out;
}

export function serializeMoodCreate(uid: string, log: MoodLog): Record<string, unknown> {
  return {
    date: sanitizeDateString(log.date),
    ownerId: sanitizeId(uid),
    mood: sanitizeMood(log.mood),
    note: sanitizeString(log.note, 1000),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function serializeMoodUpdate(mood: MoodLevel, note: string): Record<string, unknown> {
  return {
    mood: sanitizeMood(mood),
    note: sanitizeString(note, 1000),
    updatedAt: serverTimestamp(),
  };
}

export function serializeHabitCreate(uid: string, habit: Habit): Record<string, unknown> {
  return {
    id: sanitizeId(habit.id),
    ownerId: sanitizeId(uid),
    name: sanitizeNonEmptyString(habit.name, 120, 'Untitled habit'),
    color: sanitizeAccent(habit.color),
    frequency: habit.frequency === 'weekly' ? 'weekly' : 'daily',
    weekdays: sanitizeWeekdays(habit.weekdays),
    archived: Boolean(habit.archived),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function serializeHabitPatch(patch: Partial<Habit>): Record<string, unknown> {
  const out: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (patch.name !== undefined) out.name = sanitizeNonEmptyString(patch.name, 120, 'Untitled habit');
  if (patch.color !== undefined) out.color = sanitizeAccent(patch.color);
  if (patch.frequency !== undefined) {
    out.frequency = patch.frequency === 'weekly' ? 'weekly' : 'daily';
  }
  if (patch.weekdays !== undefined) out.weekdays = sanitizeWeekdays(patch.weekdays);
  if (patch.archived !== undefined) out.archived = Boolean(patch.archived);
  return out;
}

export function habitCheckDocId(habitId: string, date: string): string {
  return sanitizeId(`${habitId}_${date}`);
}

export function serializeHabitCheckCreate(
  uid: string,
  check: HabitCheck,
): Record<string, unknown> {
  const id = habitCheckDocId(check.habitId, check.date);
  return {
    id,
    ownerId: sanitizeId(uid),
    habitId: sanitizeId(check.habitId),
    date: sanitizeDateString(check.date),
    createdAt: serverTimestamp(),
  };
}

export function serializeFocusSessionCreate(
  uid: string,
  session: FocusSession,
): Record<string, unknown> {
  return {
    id: sanitizeId(session.id),
    ownerId: sanitizeId(uid),
    taskId: sanitizeNullableId(session.taskId),
    projectId: sanitizeNullableId(session.projectId),
    type: session.type === 'break' ? 'break' : 'focus',
    plannedMinutes: clampNumber(session.plannedMinutes, 0, 1440, 25),
    actualMinutes: clampNumber(session.actualMinutes, 0, 1440, 0),
    startedAt: sanitizeString(session.startedAt, 64, nowTimestamp()),
    endedAt: sanitizeString(session.endedAt, 64, nowTimestamp()),
    completed: Boolean(session.completed),
    createdAt: serverTimestamp(),
  };
}

/* ------------------------------------------------------------------
   Firestore Snapshot Deserializers
   ------------------------------------------------------------------ */

export function deserializeProject(raw: Record<string, unknown>): Project {
  return {
    id: sanitizeId(String(raw.id ?? '')),
    name: sanitizeNonEmptyString(raw.name, 120, 'Untitled project'),
    description: sanitizeString(raw.description, 1000),
    color: sanitizeAccent(raw.color),
    emoji: sanitizeString(raw.emoji, 16, '🌱'),
    icon: typeof raw.icon === 'string' && raw.icon.length > 0 ? raw.icon : undefined,
    cover: typeof raw.cover === 'string' && raw.cover.length > 0 ? raw.cover : undefined,
    coverPosition: clampNumber(raw.coverPosition, 0, 100, 50),
    createdAt: timestampToIso(raw.createdAt),
    archived: Boolean(raw.archived),
  };
}

export function deserializeBoardColumn(raw: Record<string, unknown>): BoardColumn {
  return {
    id: sanitizeId(String(raw.id ?? '')),
    projectId: sanitizeId(String(raw.projectId ?? '')),
    name: sanitizeNonEmptyString(raw.name, 80, 'Column'),
    color: sanitizeAccent(raw.color),
    order: clampNumber(raw.order, 0, 500, 0),
  };
}

export interface DeserializedTask {
  task: Task;
  sortOrder: number;
}

export function deserializeTask(raw: Record<string, unknown>): DeserializedTask {
  const createdAt = timestampToIso(raw.createdAt);
  const sortOrder =
    typeof raw.sortOrder === 'number' && Number.isFinite(raw.sortOrder)
      ? raw.sortOrder
      : Date.parse(createdAt) || 0;
  return {
    sortOrder,
    task: {
      id: sanitizeId(String(raw.id ?? '')),
      title: sanitizeNonEmptyString(raw.title, 300, 'Untitled task'),
      description: sanitizeString(raw.description, 5000),
      projectId: sanitizeNullableId(raw.projectId as string | null),
      priority: sanitizePriority(raw.priority),
      startDate: sanitizeNullableDate(raw.startDate),
      dueDate: sanitizeNullableDate(raw.dueDate),
      dueTime: sanitizeNullableString(raw.dueTime, 40),
      estimate: clampNullableNumber(raw.estimate, 0, 10080),
      repeat: sanitizeRepeat(raw.repeat),
      reminder: Boolean(raw.reminder),
      tags: sanitizeTags(raw.tags),
      status: sanitizeStatus(raw.status),
      boardColumnId: sanitizeNullableId(raw.boardColumnId as string | null),
      color: sanitizeAccent(raw.color),
      completedAt: sanitizeNullableString(raw.completedAt, 64),
      createdAt,
      subtasks: sanitizeSubtasks(raw.subtasks),
      type: raw.type === 'study' ? 'study' : 'task',
      targetMinutes: clampNullableNumber(raw.targetMinutes, 0, 10080),
      studyMinutes: clampNumber(raw.studyMinutes, 0, 100000, 0),
    },
  };
}

export function deserializeDiaryEntry(raw: Record<string, unknown>): DiaryEntry {
  return {
    id: sanitizeId(String(raw.id ?? '')),
    date: sanitizeDateString(raw.date),
    title: sanitizeString(raw.title, 200),
    body: sanitizeString(raw.body, 20000),
    mood: sanitizeNullableMood(raw.mood),
    projectId: sanitizeNullableId(raw.projectId as string | null),
    tags: sanitizeTags(raw.tags),
    photos: sanitizePhotos(raw.photos),
    createdAt: timestampToIso(raw.createdAt),
    updatedAt: timestampToIso(raw.updatedAt),
  };
}

export function deserializeMoodLog(raw: Record<string, unknown>): MoodLog {
  return {
    date: sanitizeDateString(raw.date),
    mood: sanitizeMood(raw.mood),
    note: sanitizeString(raw.note, 1000),
    updatedAt: timestampToIso(raw.updatedAt),
  };
}

export function deserializeHabit(raw: Record<string, unknown>): Habit {
  return {
    id: sanitizeId(String(raw.id ?? '')),
    name: sanitizeNonEmptyString(raw.name, 120, 'Untitled habit'),
    color: sanitizeAccent(raw.color),
    frequency: raw.frequency === 'weekly' ? 'weekly' : 'daily',
    weekdays: sanitizeWeekdays(raw.weekdays),
    createdAt: timestampToIso(raw.createdAt),
    archived: Boolean(raw.archived),
  };
}

export function deserializeHabitCheck(raw: Record<string, unknown>): HabitCheck {
  return {
    habitId: sanitizeId(String(raw.habitId ?? '')),
    date: sanitizeDateString(raw.date),
  };
}

export function deserializeFocusSession(raw: Record<string, unknown>): FocusSession {
  return {
    id: sanitizeId(String(raw.id ?? '')),
    taskId: sanitizeNullableId(raw.taskId as string | null),
    projectId: sanitizeNullableId(raw.projectId as string | null),
    type: raw.type === 'break' ? 'break' : 'focus',
    plannedMinutes: clampNumber(raw.plannedMinutes, 0, 1440, 25),
    actualMinutes: clampNumber(raw.actualMinutes, 0, 1440, 0),
    startedAt: sanitizeString(raw.startedAt, 64, nowTimestamp()),
    endedAt: sanitizeString(raw.endedAt, 64, nowTimestamp()),
    completed: Boolean(raw.completed),
  };
}
