import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
import {
  createDefaultBoardColumns,
  createDiaryEntry,
  createHabit,
  createProject,
  createTask,
  newId,
} from '../lib/factories';
import {
  clearStoredData,
  exportJson,
  parseImport,
  readData,
  storageAvailable,
  writeData,
} from './storage';
import { applyTheme } from '../lib/theme';
import {
  addSubtaskToTask,
  clearMood,
  columnsForProject,
  insertColumn,
  insertDiaryEntry,
  insertHabit,
  insertProject,
  insertTask,
  moveColumn,
  moveTaskToColumn,
  placeTaskInColumn,
  removeColumn,
  removeDiaryEntry,
  removeHabit,
  removeProject,
  removeSubtask,
  removeTask,
  replaceColumn,
  replaceDiaryEntry,
  replaceHabit,
  replaceProject,
  replaceSubtask,
  replaceTask,
  setMood,
  setTaskStatus,
  toggleHabitCheck,
  toggleSubtaskDone,
} from './mutations';
import { ToodlesContext, type ToodlesActions, type ToodlesContextValue } from './toodlesContext';

/** Everything personal lives under this one key, in this one provider. */
export function ToodlesProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ToodlesData>(() => readData());
  const [isReady, setIsReady] = useState(false);
  const [storageBlocked] = useState(() => !storageAvailable());
  const initialRender = useRef(true);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    setIsReady(true);
  }, []);

  // Save on every change (skipping the very first render, which only loaded).
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    writeData(data);
  }, [data]);

  // Persist on every change (the first effect run only loaded data).
  const mutate = useCallback((updater: (current: ToodlesData) => ToodlesData) => {
    setData((current) => updater(current));
  }, []);

  useEffect(() => {
    applyTheme(data.settings.theme);
  }, [data.settings.theme]);

  // Keep two tabs of the same browser in sync: still device-local, no server.
  useEffect(() => {
    function handleStorage(event: StorageEvent): void {
      if (event.key !== 'toodles' || !event.newValue) return;
      setData(readData());
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const actions = useMemo<ToodlesActions>(() => {
    return {
      addTask: (input: NewTaskInput) => {
        const task = createTask(input);
        mutate((current) => insertTask(current, task));
        return task;
      },
      updateTask: (id: string, patch: Partial<Task>) =>
        mutate((current) => replaceTask(current, id, patch)),
      deleteTask: (id) => mutate((current) => removeTask(current, id)),
      setTaskStatus: (id: string, status: TaskStatus) =>
        mutate((current) => setTaskStatus(current, id, status)),
      toggleTaskDone: (id: string) =>
        mutate((current) => {
          const task = current.tasks.find((item) => item.id === id);
          if (!task) return current;
          return setTaskStatus(current, id, task.status === 'done' ? 'todo' : 'done');
        }),
      moveTaskToColumn: (taskId, columnId) =>
        mutate((current) => moveTaskToColumn(current, taskId, columnId)),
      placeTaskOnBoard: (taskId, columnId, beforeTaskId) =>
        mutate((current) => placeTaskInColumn(current, taskId, columnId, beforeTaskId)),
      /** Never overwrites an existing board — only fills in a project that has none. */
      ensureBoardColumns: (projectId) =>
        mutate((current) => {
          if (columnsForProject(current, projectId).length > 0) return current;
          return createDefaultBoardColumns(projectId).reduce(
            (next, column) => insertColumn(next, column),
            current,
          );
        }),

      addSubtask: (taskId, title, color: AccentColor = 'lilac') =>
        mutate((current) => addSubtaskToTask(current, taskId, title, color)),
      updateSubtask: (taskId, subtaskId, patch: Partial<Subtask>) =>
        mutate((current) => replaceSubtask(current, taskId, subtaskId, patch)),
      toggleSubtask: (taskId, subtaskId) =>
        mutate((current) => toggleSubtaskDone(current, taskId, subtaskId)),
      deleteSubtask: (taskId, subtaskId) =>
        mutate((current) => removeSubtask(current, taskId, subtaskId)),

      addProject: (input: NewProjectInput) => {
        const project = createProject(input);
        mutate((current) => insertProject(current, project));
        return project;
      },
      updateProject: (id: string, patch: Partial<Project>) =>
        mutate((current) => replaceProject(current, id, patch)),
      deleteProject: (id, options) => mutate((current) => removeProject(current, id, options)),

      addColumn: (projectId: string, name: string, color: AccentColor = 'lilac') =>
        mutate((current) => {
          const order = columnsForProject(current, projectId).length;
          const column: BoardColumn = {
            id: newId(),
            projectId,
            name: name.trim() || 'New column',
            color,
            order,
          };
          return insertColumn(current, column);
        }),
      updateColumn: (id: string, patch: Partial<BoardColumn>) =>
        mutate((current) => replaceColumn(current, id, patch)),
      deleteColumn: (id) => mutate((current) => removeColumn(current, id)),
      moveColumn: (id: string, direction: -1 | 1) =>
        mutate((current) => moveColumn(current, id, direction)),

      addDiaryEntry: (input: NewDiaryEntryInput) => {
        const entry = createDiaryEntry(input);
        mutate((current) => insertDiaryEntry(current, entry));
        return entry;
      },
      updateDiaryEntry: (id: string, patch: Partial<DiaryEntry>) =>
        mutate((current) => replaceDiaryEntry(current, id, patch)),
      deleteDiaryEntry: (id) => mutate((current) => removeDiaryEntry(current, id)),

      logMood: (date: DateString, mood: MoodLevel, note = '') =>
        mutate((current) => setMood(current, date, mood, note)),
      clearMood: (date: DateString) => mutate((current) => clearMood(current, date)),

      addHabit: (input: NewHabitInput) => {
        const habit = createHabit(input);
        mutate((current) => insertHabit(current, habit));
        return habit;
      },
      updateHabit: (id: string, patch: Partial<Habit>) =>
        mutate((current) => replaceHabit(current, id, patch)),
      deleteHabit: (id) => mutate((current) => removeHabit(current, id)),
      toggleHabitCheck: (habitId, date) =>
        mutate((current) => toggleHabitCheck(current, habitId, date)),

      logFocusSession: (sessionInput: Omit<FocusSession, 'id'>) => {
        const session: FocusSession = {
          ...sessionInput,
          id: newId(),
        };
        mutate((current) => ({
          ...current,
          focusSessions: [session, ...(current.focusSessions ?? [])],
        }));
        return session;
      },

      updateSettings: (patch: Partial<AppSettings>) =>
        mutate((current) => ({ ...current, settings: { ...current.settings, ...patch } })),
      exportData: () => exportJson(dataRef.current),
      importData: (text: string) => {
        const imported = parseImport(text);
        const settings: AppSettings = {
          ...dataRef.current.settings,
          ...imported.settings,
        };
        mutate((current) => ({
          ...current,
          projects: imported.projects,
          tasks: imported.tasks,
          boardColumns: imported.boardColumns,
          diaryEntries: imported.diaryEntries,
          moods: imported.moods,
          habits: imported.habits,
          habitChecks: imported.habitChecks,
          settings,
        }));
        return {
          tasks: imported.tasks.length,
          projects: imported.projects.length,
          entries: imported.diaryEntries.length,
        };
      },
      eraseAll: () => {
        clearStoredData();
        mutate(() => readData());
      },
    };
  }, [mutate]);

  const value = useMemo<ToodlesContextValue>(
    () => ({ data, actions, isReady, storageBlocked }),
    [data, actions, isReady, storageBlocked],
  );

  return <ToodlesContext.Provider value={value}>{children}</ToodlesContext.Provider>;
}
