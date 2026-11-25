import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
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
  UserAccount,
} from '../types';
import {
  createDefaultBoardColumns,
  createDiaryEntry,
  createEmptyData,
  createHabit,
  createProject,
  createTask,
  newId,
} from '../lib/factories';
import { nowTimestamp } from '../lib/date';
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
  auth,
  signInWithGooglePopup,
  signOutFromFirebase,
} from '../lib/firebase';
import {
  cloudCreateColumns,
  cloudCreateDiaryEntry,
  cloudCreateFocusSession,
  cloudCreateHabit,
  cloudCreateProject,
  cloudCreateTask,
  cloudDeleteColumn,
  cloudDeleteDiaryEntry,
  cloudDeleteHabit,
  cloudDeleteMood,
  cloudDeleteProject,
  cloudDeleteTask,
  cloudEraseAllData,
  cloudReorderColumns,
  cloudSaveMood,
  cloudSetTaskStatus,
  cloudToggleHabitCheck,
  cloudUpdateColumn,
  cloudUpdateDiaryEntry,
  cloudUpdateHabit,
  cloudUpdateProject,
  cloudUpdateSettings,
  cloudUpdateTask,
  cloudUploadWorkspace,
  ensureUserProfile,
  subscribeToUserWorkspace,
} from './firestoreSync';
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

function hasLocalContent(d: ToodlesData): boolean {
  return (
    d.projects.length > 0 ||
    d.tasks.length > 0 ||
    d.diaryEntries.length > 0 ||
    d.moods.length > 0 ||
    d.habits.length > 0 ||
    (d.focusSessions?.length ?? 0) > 0
  );
}

/** Everything personal lives under this provider — localStorage cache + real-time Firestore cloud sync. */
export function ToodlesProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ToodlesData>(() => readData());
  const [authReady, setAuthReady] = useState(false);
  const [cloudUser, setCloudUser] = useState<User | null>(null);
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [fatalCloudError, setFatalCloudError] = useState<Error | null>(null);
  const [storageBlocked] = useState(() => !storageAvailable());

  const initialRender = useRef(true);
  const dataRef = useRef(data);
  dataRef.current = data;
  const cloudUserRef = useRef<User | null>(cloudUser);
  cloudUserRef.current = cloudUser;

  const runCloudOp = useCallback((op: Promise<void>) => {
    op.catch((err: unknown) => {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Cloud sync write error:', error);
      if (
        error.message.includes('Missing or insufficient permissions') ||
        error.message.includes('Quota exceeded')
      ) {
        setFatalCloudError(error);
      }
    });
  }, []);

  // Save local cache on every change (skipping the initial hydration render).
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    writeData(data);
  }, [data]);

  const mutate = useCallback((updater: (current: ToodlesData) => ToodlesData) => {
    setData((current) => updater(current));
  }, []);

  useEffect(() => {
    applyTheme(data.settings.theme);
  }, [data.settings.theme]);

  // Keep multiple tabs in sync when operating in local guest mode.
  useEffect(() => {
    function handleStorage(event: StorageEvent): void {
      if (cloudUserRef.current) return;
      if (event.key !== 'toodles' || !event.newValue) return;
      setData(readData());
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Firebase Auth listener + real-time Firestore workspace subscription.
  useEffect(() => {
    let unsubscribeWorkspace: (() => void) | null = null;
    let cancelled = false;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeWorkspace) {
        unsubscribeWorkspace();
        unsubscribeWorkspace = null;
      }

      if (!user) {
        if (!cancelled) {
          setCloudUser(null);
          setCloudSyncing(false);
          setAuthReady(true);
          // If local settings still reference a Google account, clear it when signed out.
          setData((current) =>
            current.settings.account
              ? { ...current, settings: { ...current.settings, account: null } }
              : current,
          );
        }
        return;
      }

      if (!cancelled) {
        setCloudUser(user);
        setCloudSyncing(true);
      }

      const accountObj: UserAccount = {
        id: user.uid,
        email: user.email ?? '',
        name: dataRef.current.settings.displayName.trim() || user.displayName?.trim() || 'Friend',
        avatar: user.photoURL ?? undefined,
        provider: 'google',
        syncAcrossDevices: true,
        syncedAt: nowTimestamp(),
      };

      setData((current) => ({
        ...current,
        settings: {
          ...current.settings,
          displayName: current.settings.displayName.trim() || accountObj.name,
          account: accountObj,
          guestMode: false,
        },
      }));

      try {
        const snapshotBeforeSync = dataRef.current;
        const { isNewUser } = await ensureUserProfile(user, snapshotBeforeSync.settings);
        if (cancelled) return;

        // If user created guest items locally before their very first sign-in, migrate them once.
        if (isNewUser && hasLocalContent(snapshotBeforeSync)) {
          await cloudUploadWorkspace(user.uid, snapshotBeforeSync);
          if (cancelled) return;
        }

        unsubscribeWorkspace = subscribeToUserWorkspace(user.uid, {
          onSettings: (settingsPatch) => {
            setData((current) => {
              const nextName =
                settingsPatch.displayName?.trim() ||
                user.displayName?.trim() ||
                current.settings.displayName ||
                'Friend';
              return {
                ...current,
                settings: {
                  ...current.settings,
                  ...settingsPatch,
                  displayName: nextName,
                  guestMode: false,
                  account: {
                    id: user.uid,
                    email: user.email ?? '',
                    name: nextName,
                    avatar: user.photoURL ?? undefined,
                    provider: 'google',
                    syncAcrossDevices: true,
                    syncedAt: nowTimestamp(),
                  },
                },
              };
            });
          },
          onProjects: (projects) => {
            setData((current) => ({ ...current, projects }));
          },
          onBoardColumns: (boardColumns) => {
            setData((current) => ({ ...current, boardColumns }));
          },
          onTasks: (tasks) => {
            setData((current) => ({ ...current, tasks }));
          },
          onDiaryEntries: (diaryEntries) => {
            setData((current) => ({ ...current, diaryEntries }));
          },
          onMoods: (moods) => {
            setData((current) => ({ ...current, moods }));
          },
          onHabits: (habits) => {
            setData((current) => ({ ...current, habits }));
          },
          onHabitChecks: (habitChecks) => {
            setData((current) => ({ ...current, habitChecks }));
          },
          onFocusSessions: (focusSessions) => {
            setData((current) => ({ ...current, focusSessions }));
          },
          onError: (error) => {
            setFatalCloudError(error);
          },
        });
      } catch (err) {
        if (!cancelled) {
          setFatalCloudError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) {
          setCloudSyncing(false);
          setAuthReady(true);
        }
      }
    });

    return () => {
      cancelled = true;
      unsubscribeAuth();
      if (unsubscribeWorkspace) unsubscribeWorkspace();
    };
  }, []);

  const actions = useMemo<ToodlesActions>(() => {
    const getUid = (): string | null => cloudUserRef.current?.uid ?? null;

    return {
      addTask: (input: NewTaskInput) => {
        const current = dataRef.current;
        const task = createTask(input);
        const next = insertTask(current, task);
        const normalized = next.tasks.find((t) => t.id === task.id) ?? task;
        mutate(() => next);

        const uid = getUid();
        if (uid) runCloudOp(cloudCreateTask(uid, normalized, Date.now()));
        return normalized;
      },

      updateTask: (id: string, patch: Partial<Task>) => {
        const current = dataRef.current;
        const next = replaceTask(current, id, patch);
        mutate(() => next);

        const uid = getUid();
        const updated = next.tasks.find((t) => t.id === id);
        if (uid && updated) {
          runCloudOp(
            cloudUpdateTask(uid, id, {
              ...patch,
              projectId: updated.projectId,
              boardColumnId: updated.boardColumnId,
              status: updated.status,
              completedAt: updated.completedAt,
            }),
          );
        }
      },

      deleteTask: (id: string) => {
        mutate((current) => removeTask(current, id));
        const uid = getUid();
        if (uid) runCloudOp(cloudDeleteTask(uid, id));
      },

      setTaskStatus: (id: string, status: TaskStatus) => {
        const current = dataRef.current;
        const next = setTaskStatus(current, id, status);
        if (next === current) return;
        mutate(() => next);

        const uid = getUid();
        if (uid) {
          const updated = next.tasks.find((t) => t.id === id);
          const existingIds = new Set(current.tasks.map((t) => t.id));
          const repeated = next.tasks.find((t) => !existingIds.has(t.id)) ?? null;
          if (updated) {
            runCloudOp(cloudSetTaskStatus(uid, updated, repeated));
          }
        }
      },

      toggleTaskDone: (id: string) => {
        const current = dataRef.current;
        const task = current.tasks.find((item) => item.id === id);
        if (!task) return;
        const nextStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
        const next = setTaskStatus(current, id, nextStatus);
        if (next === current) return;
        mutate(() => next);

        const uid = getUid();
        if (uid) {
          const updated = next.tasks.find((t) => t.id === id);
          const existingIds = new Set(current.tasks.map((t) => t.id));
          const repeated = next.tasks.find((t) => !existingIds.has(t.id)) ?? null;
          if (updated) {
            runCloudOp(cloudSetTaskStatus(uid, updated, repeated));
          }
        }
      },

      moveTaskToColumn: (taskId, columnId) => {
        const current = dataRef.current;
        const next = moveTaskToColumn(current, taskId, columnId);
        mutate(() => next);

        const uid = getUid();
        const updated = next.tasks.find((t) => t.id === taskId);
        if (uid && updated) {
          runCloudOp(
            cloudUpdateTask(uid, taskId, {
              projectId: updated.projectId,
              boardColumnId: updated.boardColumnId,
              status: updated.status,
              completedAt: updated.completedAt,
            }),
          );
        }
      },

      placeTaskOnBoard: (taskId, columnId, beforeTaskId) => {
        const current = dataRef.current;
        const next = placeTaskInColumn(current, taskId, columnId, beforeTaskId);
        mutate(() => next);

        const uid = getUid();
        const updated = next.tasks.find((t) => t.id === taskId);
        if (uid && updated) {
          const idx = next.tasks.findIndex((t) => t.id === taskId);
          const sortOrder = Date.now() - idx * 10;
          runCloudOp(
            cloudUpdateTask(uid, taskId, {
              projectId: updated.projectId,
              boardColumnId: updated.boardColumnId,
              status: updated.status,
              completedAt: updated.completedAt,
              sortOrder,
            }),
          );
        }
      },

      ensureBoardColumns: (projectId) => {
        const current = dataRef.current;
        if (columnsForProject(current, projectId).length > 0) return;
        const defaults = createDefaultBoardColumns(projectId);
        mutate((cur) => {
          if (columnsForProject(cur, projectId).length > 0) return cur;
          return defaults.reduce((next, column) => insertColumn(next, column), cur);
        });

        const uid = getUid();
        if (uid) runCloudOp(cloudCreateColumns(uid, defaults));
      },

      addSubtask: (taskId, title, color: AccentColor = 'lilac') => {
        const current = dataRef.current;
        const next = addSubtaskToTask(current, taskId, title, color);
        if (next === current) return;
        mutate(() => next);

        const uid = getUid();
        const updated = next.tasks.find((t) => t.id === taskId);
        if (uid && updated) runCloudOp(cloudUpdateTask(uid, taskId, { subtasks: updated.subtasks }));
      },

      updateSubtask: (taskId, subtaskId, patch: Partial<Subtask>) => {
        const current = dataRef.current;
        const next = replaceSubtask(current, taskId, subtaskId, patch);
        mutate(() => next);

        const uid = getUid();
        const updated = next.tasks.find((t) => t.id === taskId);
        if (uid && updated) runCloudOp(cloudUpdateTask(uid, taskId, { subtasks: updated.subtasks }));
      },

      toggleSubtask: (taskId, subtaskId) => {
        const current = dataRef.current;
        const next = toggleSubtaskDone(current, taskId, subtaskId);
        mutate(() => next);

        const uid = getUid();
        const updated = next.tasks.find((t) => t.id === taskId);
        if (uid && updated) runCloudOp(cloudUpdateTask(uid, taskId, { subtasks: updated.subtasks }));
      },

      deleteSubtask: (taskId, subtaskId) => {
        const current = dataRef.current;
        const next = removeSubtask(current, taskId, subtaskId);
        mutate(() => next);

        const uid = getUid();
        const updated = next.tasks.find((t) => t.id === taskId);
        if (uid && updated) runCloudOp(cloudUpdateTask(uid, taskId, { subtasks: updated.subtasks }));
      },

      addProject: (input: NewProjectInput) => {
        const current = dataRef.current;
        const project = createProject(input);
        const next = insertProject(current, project);
        const createdColumns = next.boardColumns.filter((c) => c.projectId === project.id);
        mutate(() => next);

        const uid = getUid();
        if (uid) runCloudOp(cloudCreateProject(uid, project, createdColumns));
        return project;
      },

      updateProject: (id: string, patch: Partial<Project>) => {
        mutate((current) => replaceProject(current, id, patch));
        const uid = getUid();
        if (uid) runCloudOp(cloudUpdateProject(uid, id, patch));
      },

      deleteProject: (id, options) => {
        const current = dataRef.current;
        const next = removeProject(current, id, options);
        const columnIds = current.boardColumns
          .filter((c) => c.projectId === id)
          .map((c) => c.id);
        const tasksToDelete =
          options.mode === 'delete'
            ? current.tasks.filter((t) => t.projectId === id).map((t) => t.id)
            : [];
        const tasksToUpdate =
          options.mode === 'move'
            ? current.tasks
                .filter((t) => t.projectId === id)
                .map((t) => {
                  const updated = next.tasks.find((nt) => nt.id === t.id);
                  return {
                    id: t.id,
                    projectId: updated?.projectId ?? options.moveTo ?? null,
                    boardColumnId: updated?.boardColumnId ?? null,
                  };
                })
            : [];
        mutate(() => next);

        const uid = getUid();
        if (uid) {
          runCloudOp(cloudDeleteProject(uid, id, columnIds, tasksToDelete, tasksToUpdate));
        }
      },

      addColumn: (projectId: string, name: string, color: AccentColor = 'lilac') => {
        const current = dataRef.current;
        const order = columnsForProject(current, projectId).length;
        const column: BoardColumn = {
          id: newId(),
          projectId,
          name: name.trim() || 'New column',
          color,
          order,
        };
        mutate((cur) => insertColumn(cur, column));

        const uid = getUid();
        if (uid) runCloudOp(cloudCreateColumns(uid, [column]));
      },

      updateColumn: (id: string, patch: Partial<BoardColumn>) => {
        mutate((current) => replaceColumn(current, id, patch));
        const uid = getUid();
        if (uid) runCloudOp(cloudUpdateColumn(uid, id, patch));
      },

      deleteColumn: (id: string) => {
        const current = dataRef.current;
        const next = removeColumn(current, id);
        const reassignedTasks = current.tasks
          .filter((t) => t.boardColumnId === id)
          .map((t) => {
            const updated = next.tasks.find((nt) => nt.id === t.id);
            return { id: t.id, boardColumnId: updated?.boardColumnId ?? null };
          });
        mutate(() => next);

        const uid = getUid();
        if (uid) runCloudOp(cloudDeleteColumn(uid, id, reassignedTasks));
      },

      moveColumn: (id: string, direction: -1 | 1) => {
        const current = dataRef.current;
        const target = current.boardColumns.find((c) => c.id === id);
        if (!target) return;
        const next = moveColumn(current, id, direction);
        if (next === current) return;
        mutate(() => next);

        const uid = getUid();
        if (uid) {
          const updatedCols = next.boardColumns.filter((c) => c.projectId === target.projectId);
          runCloudOp(cloudReorderColumns(uid, updatedCols));
        }
      },

      addDiaryEntry: (input: NewDiaryEntryInput) => {
        const entry = createDiaryEntry(input);
        mutate((current) => insertDiaryEntry(current, entry));

        const uid = getUid();
        if (uid) runCloudOp(cloudCreateDiaryEntry(uid, entry));
        return entry;
      },

      updateDiaryEntry: (id: string, patch: Partial<DiaryEntry>) => {
        mutate((current) => replaceDiaryEntry(current, id, patch));
        const uid = getUid();
        if (uid) runCloudOp(cloudUpdateDiaryEntry(uid, id, patch));
      },

      deleteDiaryEntry: (id: string) => {
        mutate((current) => removeDiaryEntry(current, id));
        const uid = getUid();
        if (uid) runCloudOp(cloudDeleteDiaryEntry(uid, id));
      },

      logMood: (date: DateString, mood: MoodLevel, note = '') => {
        const alreadyExists = dataRef.current.moods.some((m) => m.date === date);
        mutate((current) => setMood(current, date, mood, note));

        const uid = getUid();
        if (uid) runCloudOp(cloudSaveMood(uid, date, mood, note, alreadyExists));
      },

      clearMood: (date: DateString) => {
        mutate((current) => clearMood(current, date));
        const uid = getUid();
        if (uid) runCloudOp(cloudDeleteMood(uid, date));
      },

      addHabit: (input: NewHabitInput) => {
        const habit = createHabit(input);
        mutate((current) => insertHabit(current, habit));

        const uid = getUid();
        if (uid) runCloudOp(cloudCreateHabit(uid, habit));
        return habit;
      },

      updateHabit: (id: string, patch: Partial<Habit>) => {
        mutate((current) => replaceHabit(current, id, patch));
        const uid = getUid();
        if (uid) runCloudOp(cloudUpdateHabit(uid, id, patch));
      },

      deleteHabit: (id: string) => {
        const checksToDelete = dataRef.current.habitChecks.filter((c) => c.habitId === id);
        mutate((current) => removeHabit(current, id));

        const uid = getUid();
        if (uid) runCloudOp(cloudDeleteHabit(uid, id, checksToDelete));
      },

      toggleHabitCheck: (habitId, date) => {
        const currentlyChecked = dataRef.current.habitChecks.some(
          (c) => c.habitId === habitId && c.date === date,
        );
        mutate((current) => toggleHabitCheck(current, habitId, date));

        const uid = getUid();
        if (uid) runCloudOp(cloudToggleHabitCheck(uid, habitId, date, currentlyChecked));
      },

      logFocusSession: (sessionInput: Omit<FocusSession, 'id'>) => {
        const session: FocusSession = {
          ...sessionInput,
          id: newId(),
        };
        mutate((current) => ({
          ...current,
          focusSessions: [session, ...(current.focusSessions ?? [])],
        }));

        const uid = getUid();
        if (uid) runCloudOp(cloudCreateFocusSession(uid, session));
        return session;
      },

      updateSettings: (patch: Partial<AppSettings>) => {
        mutate((current) => ({ ...current, settings: { ...current.settings, ...patch } }));
        const user = cloudUserRef.current;
        if (user) {
          runCloudOp(cloudUpdateSettings(user.uid, patch, user.email ?? undefined, user.photoURL));
        }
      },

      exportData: () => exportJson(dataRef.current),

      importData: (text: string) => {
        const imported = parseImport(text);
        const current = dataRef.current;
        const settings: AppSettings = {
          ...current.settings,
          ...imported.settings,
          account: current.settings.account,
          guestMode: current.settings.guestMode,
        };
        const merged: ToodlesData = {
          ...current,
          projects: imported.projects,
          tasks: imported.tasks,
          boardColumns: imported.boardColumns,
          diaryEntries: imported.diaryEntries,
          moods: imported.moods,
          habits: imported.habits,
          habitChecks: imported.habitChecks,
          focusSessions: imported.focusSessions ?? current.focusSessions ?? [],
          settings,
        };
        mutate(() => merged);

        const uid = getUid();
        if (uid) {
          runCloudOp(
            cloudEraseAllData(uid, current)
              .then(() => cloudUploadWorkspace(uid, merged))
              .then(() => cloudUpdateSettings(uid, settings)),
          );
        }

        return {
          tasks: imported.tasks.length,
          projects: imported.projects.length,
          entries: imported.diaryEntries.length,
        };
      },

      eraseAll: () => {
        const current = dataRef.current;
        const uid = getUid();
        if (uid) {
          runCloudOp(cloudEraseAllData(uid, current));
          mutate((cur) => ({
            ...createEmptyData(),
            settings: cur.settings,
          }));
        } else {
          clearStoredData();
          mutate(() => createEmptyData());
        }
      },

      signInWithGoogle: async () => {
        const user = await signInWithGooglePopup();
        const displayName =
          dataRef.current.settings.displayName.trim() || user.displayName?.trim() || 'Friend';
        return {
          id: user.uid,
          email: user.email ?? '',
          name: displayName,
          avatar: user.photoURL ?? undefined,
          provider: 'google',
          syncAcrossDevices: true,
          syncedAt: nowTimestamp(),
        };
      },

      signOutUser: async () => {
        await signOutFromFirebase();
        clearStoredData();
        setCloudUser(null);
        setData(createEmptyData());
      },
    };
  }, [mutate, runCloudOp]);

  // Surface critical Firestore permission or quota errors to the ErrorBoundary.
  if (fatalCloudError) {
    throw fatalCloudError;
  }

  const value = useMemo<ToodlesContextValue>(
    () => ({
      data,
      actions,
      isReady: authReady,
      cloudSyncing,
      isCloudConnected: Boolean(cloudUser),
      storageBlocked,
    }),
    [data, actions, authReady, cloudSyncing, cloudUser, storageBlocked],
  );

  return <ToodlesContext.Provider value={value}>{children}</ToodlesContext.Provider>;
}
