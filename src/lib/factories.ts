import {
  SCHEMA_VERSION,
  type AccentColor,
  type BoardColumn,
  type DiaryEntry,
  type Habit,
  type NewDiaryEntryInput,
  type NewHabitInput,
  type NewProjectInput,
  type NewTaskInput,
  type Project,
  type Subtask,
  type Task,
  type ToodlesData,
} from '../types';
import { nowTimestamp, todayString } from './date';

/** Stable ids everywhere: never array indexes. */
export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyData(): ToodlesData {
  return {
    version: SCHEMA_VERSION,
    settings: {
      displayName: '',
      weekStartsOn: 1,
      splashSeenAt: null,
      theme: 'system',
      sidebarOpen: true,
      tagsSeeded: false,
    },
    projects: [],
    tasks: [],
    boardColumns: [],
    diaryEntries: [],
    moods: [],
    habits: [],
    habitChecks: [],
    tags: [],
    focusSessions: [],
  };
}

export function createSubtask(title: string, color: AccentColor = 'lilac'): Subtask {
  return { id: newId(), title: title.trim(), done: false, color };
}

export function createTask(input: NewTaskInput): Task {
  const title = input.title.trim();
  return {
    id: newId(),
    title: title.length > 0 ? title : 'Untitled task',
    description: input.description?.trim() ?? '',
    projectId: input.projectId ?? null,
    priority: input.priority ?? 'none',
    startDate: input.startDate ?? null,
    dueDate: input.dueDate ?? null,
    dueTime: input.dueTime ?? null,
    estimate: input.estimate ?? null,
    repeat: input.repeat ?? 'none',
    reminder: input.reminder ?? false,
    tags: input.tags ?? [],
    status: 'todo',
    boardColumnId: input.boardColumnId ?? null,
    color: input.color ?? 'lilac',
    completedAt: null,
    createdAt: nowTimestamp(),
    subtasks: (input.subtasks ?? [])
      .filter((subtask) => subtask.title.trim().length > 0)
      .map((subtask) => createSubtask(subtask.title, subtask.color ?? input.color ?? 'lilac')),
  };
}

export function createProject(input: NewProjectInput): Project {
  const name = input.name.trim();
  return {
    id: newId(),
    name: name.length > 0 ? name : 'Untitled project',
    description: input.description?.trim() ?? '',
    color: input.color ?? 'lilac',
    emoji: input.emoji ?? '🌱',
    icon: input.icon,
    cover: input.cover,
    coverPosition: input.coverPosition ?? 50,
    createdAt: nowTimestamp(),
    archived: false,
  };
}

/** Fresh projects get the classic three columns so the board works immediately. */
export function createDefaultBoardColumns(projectId: string): BoardColumn[] {
  const presets: Array<{ name: string; color: AccentColor }> = [
    { name: 'To do', color: 'lilac' },
    { name: 'Doing', color: 'butter' },
    { name: 'Done', color: 'mint' },
  ];
  return presets.map((preset, index) => ({
    id: newId(),
    projectId,
    name: preset.name,
    color: preset.color,
    order: index,
  }));
}

export function createDiaryEntry(input: NewDiaryEntryInput): DiaryEntry {
  const timestamp = nowTimestamp();
  return {
    id: newId(),
    date: input.date || todayString(),
    title: input.title.trim(),
    body: input.body.trim(),
    mood: input.mood ?? null,
    projectId: input.projectId ?? null,
    tags: input.tags ?? [],
    photos: input.photos ?? [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createHabit(input: NewHabitInput): Habit {
  const name = input.name.trim();
  return {
    id: newId(),
    name: name.length > 0 ? name : 'New habit',
    color: input.color ?? 'mint',
    frequency: input.frequency ?? 'daily',
    weekdays: input.weekdays ?? [0, 1, 2, 3, 4, 5, 6],
    createdAt: nowTimestamp(),
    archived: false,
  };
}
