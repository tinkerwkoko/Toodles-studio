import { createContext } from 'react';
import type {
  AccentColor,
  AppSettings,
  BoardColumn,
  DateString,
  DiaryEntry,
  FocusSession,
  Habit,
  MoodLevel,
  NewDiaryEntryInput,
  NewHabitInput,
  NewProjectInput,
  NewTaskInput,
  Project,
  Subtask,
  Task,
  TaskStatus,
  ToodlesData,
} from '../types';

/**
 * The single mutation surface of the app. Components never touch localStorage
 * and never patch state directly — they call these actions.
 */
export interface ToodlesActions {
  addTask: (input: NewTaskInput) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  toggleTaskDone: (id: string) => void;
  moveTaskToColumn: (taskId: string, columnId: string | null) => void;
  /** Board drag-and-drop: puts a card in a column, optionally before another card. */
  placeTaskOnBoard: (taskId: string, columnId: string, beforeTaskId: string | null) => void;
  /** Seeds the default To do / Doing / Done columns only when a board is empty. */
  ensureBoardColumns: (projectId: string) => void;

  addSubtask: (taskId: string, title: string, color?: AccentColor) => void;
  updateSubtask: (taskId: string, subtaskId: string, patch: Partial<Subtask>) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  addProject: (input: NewProjectInput) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string, options: { mode: 'delete' | 'move'; moveTo?: string | null }) => void;

  addColumn: (projectId: string, name: string, color?: AccentColor) => void;
  updateColumn: (id: string, patch: Partial<BoardColumn>) => void;
  deleteColumn: (id: string) => void;
  moveColumn: (id: string, direction: -1 | 1) => void;

  addDiaryEntry: (input: NewDiaryEntryInput) => DiaryEntry;
  updateDiaryEntry: (id: string, patch: Partial<DiaryEntry>) => void;
  deleteDiaryEntry: (id: string) => void;

  logMood: (date: DateString, mood: MoodLevel, note?: string) => void;
  clearMood: (date: DateString) => void;

  addHabit: (input: NewHabitInput) => Habit;
  updateHabit: (id: string, patch: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCheck: (habitId: string, date: DateString) => void;

  logFocusSession: (session: Omit<FocusSession, 'id'>) => FocusSession;

  updateSettings: (patch: Partial<AppSettings>) => void;
  exportData: () => string;
  importData: (text: string) => { tasks: number; projects: number; entries: number };
  eraseAll: () => void;
}

export interface ToodlesContextValue {
  data: ToodlesData;
  actions: ToodlesActions;
  /** False until the first localStorage read has finished. */
  isReady: boolean;
  /** True when localStorage is blocked (private mode with storage disabled). */
  storageBlocked: boolean;
}

export const ToodlesContext = createContext<ToodlesContextValue | null>(null);
