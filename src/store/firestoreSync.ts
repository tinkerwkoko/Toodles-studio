import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  deserializeBoardColumn,
  deserializeDiaryEntry,
  deserializeFocusSession,
  deserializeHabit,
  deserializeHabitCheck,
  deserializeMoodLog,
  deserializeProject,
  deserializeTask,
  habitCheckDocId,
  sanitizePomodoro,
  sanitizeString,
  sanitizeTheme,
  serializeBoardColumnCreate,
  serializeBoardColumnPatch,
  serializeDiaryEntryCreate,
  serializeDiaryEntryPatch,
  serializeFocusSessionCreate,
  serializeHabitCheckCreate,
  serializeHabitCreate,
  serializeHabitPatch,
  serializeMoodCreate,
  serializeMoodUpdate,
  serializeProjectCreate,
  serializeProjectPatch,
  serializeTaskCreate,
  serializeTaskPatch,
  serializeUserProfileCreate,
  serializeUserProfilePatch,
  clampNumber,
} from '../lib/firestoreSanitize';
import type {
  AppSettings,
  BoardColumn,
  DiaryEntry,
  FocusSession,
  Habit,
  HabitCheck,
  MoodLevel,
  MoodLog,
  Project,
  Task,
  ToodlesData,
} from '../types';

export interface WorkspaceCallbacks {
  onSettings: (patch: Partial<AppSettings>) => void;
  onProjects: (projects: Project[]) => void;
  onBoardColumns: (columns: BoardColumn[]) => void;
  onTasks: (tasks: Task[]) => void;
  onDiaryEntries: (entries: DiaryEntry[]) => void;
  onMoods: (moods: MoodLog[]) => void;
  onHabits: (habits: Habit[]) => void;
  onHabitChecks: (checks: HabitCheck[]) => void;
  onFocusSessions: (sessions: FocusSession[]) => void;
  onError: (error: Error) => void;
}

/**
 * Ensures `/users/{uid}` exists before any subcollection reads or writes.
 * Returns whether this user profile was newly created.
 */
export async function ensureUserProfile(
  user: User,
  localSettings: AppSettings,
): Promise<{ isNewUser: boolean }> {
  const path = `users/${user.uid}`;
  const ref = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { isNewUser: false };
    }
    const displayName =
      localSettings.displayName.trim() || user.displayName?.trim() || 'Friend';
    const payload = serializeUserProfileCreate(
      user.uid,
      user.email ?? '',
      user.photoURL ?? null,
      { ...localSettings, displayName },
    );
    await setDoc(ref, payload);
    return { isNewUser: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribes to the user's private Firestore collections in real time.
 * Every list listener queries with `where('ownerId', '==', uid)` to satisfy
 * rule-side ownership enforcement without read-cost explosions.
 */
export function subscribeToUserWorkspace(
  uid: string,
  callbacks: WorkspaceCallbacks,
): Unsubscribe {
  const unsubs: Unsubscribe[] = [];

  const wrapError = (op: OperationType, path: string) => (error: unknown) => {
    try {
      handleFirestoreError(error, op, path);
    } catch (wrapped) {
      callbacks.onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
    }
  };

  // 1. User profile & settings
  const userPath = `users/${uid}`;
  unsubs.push(
    onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        if (!snap.exists()) return;
        const raw = snap.data() as Record<string, unknown>;
        callbacks.onSettings({
          displayName: sanitizeString(raw.displayName, 100),
          weekStartsOn: raw.weekStartsOn === 0 ? 0 : 1,
          theme: sanitizeTheme(raw.theme),
          sidebarOpen: typeof raw.sidebarOpen === 'boolean' ? raw.sidebarOpen : true,
          dailyFocusGoalMinutes: clampNumber(raw.dailyFocusGoalMinutes, 0, 1440, 60),
          pomodoro: sanitizePomodoro(raw.pomodoro) ?? undefined,
          tagsSeeded: Boolean(raw.tagsSeeded),
        });
      },
      wrapError(OperationType.GET, userPath),
    ),
  );

  // 2. Projects
  const projectsPath = `users/${uid}/projects`;
  unsubs.push(
    onSnapshot(
      query(collection(db, 'users', uid, 'projects'), where('ownerId', '==', uid)),
      (snap) => {
        const items = snap.docs
          .map((d) => deserializeProject(d.data() as Record<string, unknown>))
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        callbacks.onProjects(items);
      },
      wrapError(OperationType.LIST, projectsPath),
    ),
  );

  // 3. BoardColumns
  const columnsPath = `users/${uid}/boardColumns`;
  unsubs.push(
    onSnapshot(
      query(collection(db, 'users', uid, 'boardColumns'), where('ownerId', '==', uid)),
      (snap) => {
        const items = snap.docs
          .map((d) => deserializeBoardColumn(d.data() as Record<string, unknown>))
          .sort((a, b) => a.order - b.order);
        callbacks.onBoardColumns(items);
      },
      wrapError(OperationType.LIST, columnsPath),
    ),
  );

  // 4. Tasks
  const tasksPath = `users/${uid}/tasks`;
  unsubs.push(
    onSnapshot(
      query(collection(db, 'users', uid, 'tasks'), where('ownerId', '==', uid)),
      (snap) => {
        const items = snap.docs
          .map((d) => deserializeTask(d.data() as Record<string, unknown>))
          .sort((a, b) => b.sortOrder - a.sortOrder)
          .map((entry) => entry.task);
        callbacks.onTasks(items);
      },
      wrapError(OperationType.LIST, tasksPath),
    ),
  );

  // 5. DiaryEntries
  const diaryPath = `users/${uid}/diaryEntries`;
  unsubs.push(
    onSnapshot(
      query(collection(db, 'users', uid, 'diaryEntries'), where('ownerId', '==', uid)),
      (snap) => {
        const items = snap.docs
          .map((d) => deserializeDiaryEntry(d.data() as Record<string, unknown>))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        callbacks.onDiaryEntries(items);
      },
      wrapError(OperationType.LIST, diaryPath),
    ),
  );

  // 6. Moods
  const moodsPath = `users/${uid}/moods`;
  unsubs.push(
    onSnapshot(
      query(collection(db, 'users', uid, 'moods'), where('ownerId', '==', uid)),
      (snap) => {
        const items = snap.docs
          .map((d) => deserializeMoodLog(d.data() as Record<string, unknown>))
          .sort((a, b) => a.date.localeCompare(b.date));
        callbacks.onMoods(items);
      },
      wrapError(OperationType.LIST, moodsPath),
    ),
  );

  // 7. Habits
  const habitsPath = `users/${uid}/habits`;
  unsubs.push(
    onSnapshot(
      query(collection(db, 'users', uid, 'habits'), where('ownerId', '==', uid)),
      (snap) => {
        const items = snap.docs
          .map((d) => deserializeHabit(d.data() as Record<string, unknown>))
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        callbacks.onHabits(items);
      },
      wrapError(OperationType.LIST, habitsPath),
    ),
  );

  // 8. HabitChecks
  const checksPath = `users/${uid}/habitChecks`;
  unsubs.push(
    onSnapshot(
      query(collection(db, 'users', uid, 'habitChecks'), where('ownerId', '==', uid)),
      (snap) => {
        const items = snap.docs.map((d) =>
          deserializeHabitCheck(d.data() as Record<string, unknown>),
        );
        callbacks.onHabitChecks(items);
      },
      wrapError(OperationType.LIST, checksPath),
    ),
  );

  // 9. FocusSessions
  const sessionsPath = `users/${uid}/focusSessions`;
  unsubs.push(
    onSnapshot(
      query(collection(db, 'users', uid, 'focusSessions'), where('ownerId', '==', uid)),
      (snap) => {
        const items = snap.docs
          .map((d) => deserializeFocusSession(d.data() as Record<string, unknown>))
          .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
        callbacks.onFocusSessions(items);
      },
      wrapError(OperationType.LIST, sessionsPath),
    ),
  );

  return () => {
    for (const unsub of unsubs) unsub();
  };
}

/* ------------------------------------------------------------------
   Chunked Batch Commit Helper (Firestore max 500 ops per batch)
   ------------------------------------------------------------------ */

interface BatchOp {
  type: 'set' | 'update' | 'delete';
  pathSegments: [string, ...string[]];
  data?: Record<string, unknown>;
}

async function commitOpsInChunks(ops: BatchOp[], logPath: string): Promise<void> {
  const CHUNK_SIZE = 400;
  for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
    const chunk = ops.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    for (const op of chunk) {
      const ref = doc(db, ...op.pathSegments);
      if (op.type === 'set' && op.data) {
        batch.set(ref, op.data);
      } else if (op.type === 'update' && op.data) {
        batch.update(ref, op.data);
      } else if (op.type === 'delete') {
        batch.delete(ref);
      }
    }
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, logPath);
    }
  }
}

/* ------------------------------------------------------------------
   Granular Cloud Mutations
   ------------------------------------------------------------------ */

export async function cloudUpdateSettings(
  uid: string,
  patch: Partial<AppSettings>,
  email?: string,
  photoURL?: string | null,
): Promise<void> {
  const payload = serializeUserProfilePatch(patch, email, photoURL);
  if (Object.keys(payload).length <= 1) return; // only updatedAt
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function cloudCreateProject(
  uid: string,
  project: Project,
  defaultColumns: BoardColumn[],
): Promise<void> {
  const ops: BatchOp[] = [
    {
      type: 'set',
      pathSegments: ['users', uid, 'projects', project.id],
      data: serializeProjectCreate(uid, project),
    },
    ...defaultColumns.map((col): BatchOp => ({
      type: 'set',
      pathSegments: ['users', uid, 'boardColumns', col.id],
      data: serializeBoardColumnCreate(uid, col),
    })),
  ];
  await commitOpsInChunks(ops, `users/${uid}/projects/${project.id}`);
}

export async function cloudUpdateProject(
  uid: string,
  projectId: string,
  patch: Partial<Project>,
): Promise<void> {
  const path = `users/${uid}/projects/${projectId}`;
  try {
    await updateDoc(doc(db, 'users', uid, 'projects', projectId), serializeProjectPatch(patch));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function cloudDeleteProject(
  uid: string,
  projectId: string,
  columnIds: string[],
  tasksToDelete: string[],
  tasksToUpdate: Array<{ id: string; projectId: string | null; boardColumnId: string | null }>,
): Promise<void> {
  const ops: BatchOp[] = [
    ...tasksToDelete.map(
      (taskId): BatchOp => ({
        type: 'delete',
        pathSegments: ['users', uid, 'tasks', taskId],
      }),
    ),
    ...tasksToUpdate.map(
      (task): BatchOp => ({
        type: 'update',
        pathSegments: ['users', uid, 'tasks', task.id],
        data: serializeTaskPatch({
          projectId: task.projectId,
          boardColumnId: task.boardColumnId,
        }),
      }),
    ),
    ...columnIds.map(
      (colId): BatchOp => ({
        type: 'delete',
        pathSegments: ['users', uid, 'boardColumns', colId],
      }),
    ),
    {
      type: 'delete',
      pathSegments: ['users', uid, 'projects', projectId],
    },
  ];
  await commitOpsInChunks(ops, `users/${uid}/projects/${projectId}`);
}

export async function cloudCreateColumns(uid: string, columns: BoardColumn[]): Promise<void> {
  const ops: BatchOp[] = columns.map((col) => ({
    type: 'set',
    pathSegments: ['users', uid, 'boardColumns', col.id],
    data: serializeBoardColumnCreate(uid, col),
  }));
  await commitOpsInChunks(ops, `users/${uid}/boardColumns`);
}

export async function cloudUpdateColumn(
  uid: string,
  columnId: string,
  patch: Partial<BoardColumn>,
): Promise<void> {
  const path = `users/${uid}/boardColumns/${columnId}`;
  try {
    await updateDoc(
      doc(db, 'users', uid, 'boardColumns', columnId),
      serializeBoardColumnPatch(patch),
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function cloudDeleteColumn(
  uid: string,
  columnId: string,
  reassignedTasks: Array<{ id: string; boardColumnId: string | null }>,
): Promise<void> {
  const ops: BatchOp[] = [
    ...reassignedTasks.map(
      (t): BatchOp => ({
        type: 'update',
        pathSegments: ['users', uid, 'tasks', t.id],
        data: serializeTaskPatch({ boardColumnId: t.boardColumnId }),
      }),
    ),
    {
      type: 'delete',
      pathSegments: ['users', uid, 'boardColumns', columnId],
    },
  ];
  await commitOpsInChunks(ops, `users/${uid}/boardColumns/${columnId}`);
}

export async function cloudReorderColumns(uid: string, columns: BoardColumn[]): Promise<void> {
  const ops: BatchOp[] = columns.map((col) => ({
    type: 'update',
    pathSegments: ['users', uid, 'boardColumns', col.id],
    data: serializeBoardColumnPatch({ order: col.order }),
  }));
  await commitOpsInChunks(ops, `users/${uid}/boardColumns`);
}

export async function cloudCreateTask(
  uid: string,
  task: Task,
  sortOrder = Date.now(),
): Promise<void> {
  const path = `users/${uid}/tasks/${task.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'tasks', task.id), serializeTaskCreate(uid, task, sortOrder));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function cloudUpdateTask(
  uid: string,
  taskId: string,
  patch: Partial<Task> & { sortOrder?: number },
): Promise<void> {
  const path = `users/${uid}/tasks/${taskId}`;
  try {
    await updateDoc(doc(db, 'users', uid, 'tasks', taskId), serializeTaskPatch(patch));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function cloudSetTaskStatus(
  uid: string,
  updatedTask: Task,
  nextRepeatingTask: Task | null,
): Promise<void> {
  const ops: BatchOp[] = [
    {
      type: 'update',
      pathSegments: ['users', uid, 'tasks', updatedTask.id],
      data: serializeTaskPatch({
        status: updatedTask.status,
        completedAt: updatedTask.completedAt,
        subtasks: updatedTask.subtasks,
      }),
    },
  ];
  if (nextRepeatingTask) {
    ops.push({
      type: 'set',
      pathSegments: ['users', uid, 'tasks', nextRepeatingTask.id],
      data: serializeTaskCreate(uid, nextRepeatingTask, Date.now()),
    });
  }
  await commitOpsInChunks(ops, `users/${uid}/tasks/${updatedTask.id}`);
}

export async function cloudDeleteTask(uid: string, taskId: string): Promise<void> {
  const path = `users/${uid}/tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'tasks', taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function cloudCreateDiaryEntry(uid: string, entry: DiaryEntry): Promise<void> {
  const path = `users/${uid}/diaryEntries/${entry.id}`;
  try {
    await setDoc(
      doc(db, 'users', uid, 'diaryEntries', entry.id),
      serializeDiaryEntryCreate(uid, entry),
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function cloudUpdateDiaryEntry(
  uid: string,
  entryId: string,
  patch: Partial<DiaryEntry>,
): Promise<void> {
  const path = `users/${uid}/diaryEntries/${entryId}`;
  try {
    await updateDoc(
      doc(db, 'users', uid, 'diaryEntries', entryId),
      serializeDiaryEntryPatch(patch),
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function cloudDeleteDiaryEntry(uid: string, entryId: string): Promise<void> {
  const path = `users/${uid}/diaryEntries/${entryId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'diaryEntries', entryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function cloudSaveMood(
  uid: string,
  date: string,
  mood: MoodLevel,
  note: string,
  alreadyExists: boolean,
): Promise<void> {
  const path = `users/${uid}/moods/${date}`;
  const ref = doc(db, 'users', uid, 'moods', date);
  try {
    if (alreadyExists) {
      await updateDoc(ref, serializeMoodUpdate(mood, note));
    } else {
      await setDoc(ref, serializeMoodCreate(uid, { date, mood, note, updatedAt: '' }));
    }
  } catch (error) {
    // Handle edge case where local state and server differ on existence
    if (alreadyExists) {
      try {
        await setDoc(ref, serializeMoodCreate(uid, { date, mood, note, updatedAt: '' }));
        return;
      } catch (fallbackErr) {
        handleFirestoreError(fallbackErr, OperationType.WRITE, path);
      }
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function cloudDeleteMood(uid: string, date: string): Promise<void> {
  const path = `users/${uid}/moods/${date}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'moods', date));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function cloudCreateHabit(uid: string, habit: Habit): Promise<void> {
  const path = `users/${uid}/habits/${habit.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'habits', habit.id), serializeHabitCreate(uid, habit));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function cloudUpdateHabit(
  uid: string,
  habitId: string,
  patch: Partial<Habit>,
): Promise<void> {
  const path = `users/${uid}/habits/${habitId}`;
  try {
    await updateDoc(doc(db, 'users', uid, 'habits', habitId), serializeHabitPatch(patch));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function cloudDeleteHabit(
  uid: string,
  habitId: string,
  checksToDelete: HabitCheck[],
): Promise<void> {
  const ops: BatchOp[] = [
    ...checksToDelete.map(
      (check): BatchOp => ({
        type: 'delete',
        pathSegments: ['users', uid, 'habitChecks', habitCheckDocId(check.habitId, check.date)],
      }),
    ),
    {
      type: 'delete',
      pathSegments: ['users', uid, 'habits', habitId],
    },
  ];
  await commitOpsInChunks(ops, `users/${uid}/habits/${habitId}`);
}

export async function cloudToggleHabitCheck(
  uid: string,
  habitId: string,
  date: string,
  currentlyChecked: boolean,
): Promise<void> {
  const checkId = habitCheckDocId(habitId, date);
  const path = `users/${uid}/habitChecks/${checkId}`;
  const ref = doc(db, 'users', uid, 'habitChecks', checkId);
  try {
    if (currentlyChecked) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, serializeHabitCheckCreate(uid, { habitId, date }));
    }
  } catch (error) {
    handleFirestoreError(
      error,
      currentlyChecked ? OperationType.DELETE : OperationType.CREATE,
      path,
    );
  }
}

export async function cloudCreateFocusSession(
  uid: string,
  session: FocusSession,
): Promise<void> {
  const path = `users/${uid}/focusSessions/${session.id}`;
  try {
    await setDoc(
      doc(db, 'users', uid, 'focusSessions', session.id),
      serializeFocusSessionCreate(uid, session),
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Uploads a full ToodlesData workspace to Firestore in dependency-safe order
 * (projects -> columns/tasks/diary/moods/habits -> habitChecks/focusSessions).
 * Used for first-time guest migration and JSON backup import.
 */
export async function cloudUploadWorkspace(uid: string, workspace: ToodlesData): Promise<void> {
  const validProjectIds = new Set(workspace.projects.map((p) => p.id));
  const validHabitIds = new Set(workspace.habits.map((h) => h.id));
  const validTaskIds = new Set(workspace.tasks.map((t) => t.id));

  // Stage 1: Projects & Habits (parent records)
  const stage1: BatchOp[] = [
    ...workspace.projects.map(
      (project): BatchOp => ({
        type: 'set',
        pathSegments: ['users', uid, 'projects', project.id],
        data: serializeProjectCreate(uid, project),
      }),
    ),
    ...workspace.habits.map(
      (habit): BatchOp => ({
        type: 'set',
        pathSegments: ['users', uid, 'habits', habit.id],
        data: serializeHabitCreate(uid, habit),
      }),
    ),
  ];
  if (stage1.length > 0) {
    await commitOpsInChunks(stage1, `users/${uid}/projects`);
  }

  // Stage 2: BoardColumns, Tasks, DiaryEntries, Moods
  const baseTime = Date.now();
  const stage2: BatchOp[] = [
    ...workspace.boardColumns
      .filter((c) => validProjectIds.has(c.projectId))
      .map(
        (col): BatchOp => ({
          type: 'set',
          pathSegments: ['users', uid, 'boardColumns', col.id],
          data: serializeBoardColumnCreate(uid, col),
        }),
      ),
    ...workspace.tasks.map((task, idx): BatchOp => {
      const safeTask: Task =
        task.projectId && !validProjectIds.has(task.projectId)
          ? { ...task, projectId: null, boardColumnId: null }
          : task;
      return {
        type: 'set',
        pathSegments: ['users', uid, 'tasks', safeTask.id],
        data: serializeTaskCreate(uid, safeTask, baseTime - idx),
      };
    }),
    ...workspace.diaryEntries.map((entry): BatchOp => {
      const safeEntry: DiaryEntry =
        entry.projectId && !validProjectIds.has(entry.projectId)
          ? { ...entry, projectId: null }
          : entry;
      return {
        type: 'set',
        pathSegments: ['users', uid, 'diaryEntries', safeEntry.id],
        data: serializeDiaryEntryCreate(uid, safeEntry),
      };
    }),
    ...workspace.moods.map(
      (mood): BatchOp => ({
        type: 'set',
        pathSegments: ['users', uid, 'moods', mood.date],
        data: serializeMoodCreate(uid, mood),
      }),
    ),
  ];
  if (stage2.length > 0) {
    await commitOpsInChunks(stage2, `users/${uid}/tasks`);
  }

  // Stage 3: HabitChecks & FocusSessions
  const stage3: BatchOp[] = [
    ...workspace.habitChecks
      .filter((c) => validHabitIds.has(c.habitId))
      .map(
        (check): BatchOp => ({
          type: 'set',
          pathSegments: ['users', uid, 'habitChecks', habitCheckDocId(check.habitId, check.date)],
          data: serializeHabitCheckCreate(uid, check),
        }),
      ),
    ...(workspace.focusSessions ?? []).map((sess): BatchOp => {
      const safeSess: FocusSession = {
        ...sess,
        projectId: sess.projectId && validProjectIds.has(sess.projectId) ? sess.projectId : null,
        taskId: sess.taskId && validTaskIds.has(sess.taskId) ? sess.taskId : null,
      };
      return {
        type: 'set',
        pathSegments: ['users', uid, 'focusSessions', safeSess.id],
        data: serializeFocusSessionCreate(uid, safeSess),
      };
    }),
  ];
  if (stage3.length > 0) {
    await commitOpsInChunks(stage3, `users/${uid}/habitChecks`);
  }
}

export async function cloudEraseAllData(uid: string, current: ToodlesData): Promise<void> {
  const ops: BatchOp[] = [
    ...current.habitChecks.map(
      (c): BatchOp => ({
        type: 'delete',
        pathSegments: ['users', uid, 'habitChecks', habitCheckDocId(c.habitId, c.date)],
      }),
    ),
    ...(current.focusSessions ?? []).map(
      (s): BatchOp => ({
        type: 'delete',
        pathSegments: ['users', uid, 'focusSessions', s.id],
      }),
    ),
    ...current.tasks.map(
      (t): BatchOp => ({
        type: 'delete',
        pathSegments: ['users', uid, 'tasks', t.id],
      }),
    ),
    ...current.boardColumns.map(
      (c): BatchOp => ({
        type: 'delete',
        pathSegments: ['users', uid, 'boardColumns', c.id],
      }),
    ),
    ...current.diaryEntries.map(
      (d): BatchOp => ({
        type: 'delete',
        pathSegments: ['users', uid, 'diaryEntries', d.id],
      }),
    ),
    ...current.moods.map(
      (m): BatchOp => ({
        type: 'delete',
        pathSegments: ['users', uid, 'moods', m.date],
      }),
    ),
    ...current.habits.map(
      (h): BatchOp => ({
        type: 'delete',
        pathSegments: ['users', uid, 'habits', h.id],
      }),
    ),
    ...current.projects.map(
      (p): BatchOp => ({
        type: 'delete',
        pathSegments: ['users', uid, 'projects', p.id],
      }),
    ),
  ];
  if (ops.length > 0) {
    await commitOpsInChunks(ops, `users/${uid}`);
  }
}
