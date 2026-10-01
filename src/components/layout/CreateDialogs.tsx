import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MoodLevel } from '../../types';
import { Dialog } from '../ui/Dialog';
import { TaskForm } from '../tasks/TaskForm';
import { ProjectForm } from '../projects/ProjectForm';
import { DiaryForm, emptyDiaryForm } from '../diary/DiaryForm';
import { HabitForm } from '../habits/HabitForm';
import { MoodPicker } from '../habits/MoodPicker';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Field';
import { todayString } from '../../lib/date';
import { useUi } from '../../store/useUi';
import { useToodles } from '../../store/useToodles';
import { formValuesFromDefaults, formValuesToInput } from '../tasks/taskFormValues';

/** The single place where every create sheet lives. */
export function CreateDialogs() {
  const { create, closeCreate, openCreate, pushToast } = useUi();
  const { actions } = useToodles();
  const navigate = useNavigate();

  const defaultProjectId = create.defaults?.projectId ?? null;

  return (
    <>
      <Dialog
        open={create.kind === 'task'}
        onClose={closeCreate}
        title="A new little thing"
        description={defaultProjectId ? 'It will land in this project.' : undefined}
        size="md"
      >
        <TaskForm
          key={`task-${defaultProjectId ?? 'none'}-${create.kind === 'task' ? 'open' : 'closed'}`}
          initial={formValuesFromDefaults(create.defaults)}
          lockedProjectId={defaultProjectId ? defaultProjectId : undefined}
          submitLabel="Create task"
          hint="Only a title is needed. You can always add more later."
          onSubmit={(values) => {
            const input = formValuesToInput(values);
            // Keep the column a board card was added from.
            const created = actions.addTask({
              ...input,
              boardColumnId: create.defaults?.boardColumnId ?? input.boardColumnId ?? null,
            });
            pushToast(`“${created.title}” is tucked away ✨`, 'success');
            closeCreate();
          }}
          quickCreate={
            <span className="flex flex-wrap items-center justify-center gap-2">
              Or start something else:
              <Button size="sm" variant="soft" onClick={() => openCreate('project')}>
                A project
              </Button>
              <Button size="sm" variant="soft" onClick={() => openCreate('diary')}>
                A diary entry
              </Button>
              <Button
                size="sm"
                variant="soft"
                onClick={() => {
                  closeCreate();
                  navigate('/wellbeing');
                }}
              >
                A habit or mood
              </Button>
            </span>
          }
        />
      </Dialog>

      <Dialog
        open={create.kind === 'project'}
        onClose={closeCreate}
        title="Give it a home"
        description="Projects gather tasks, notes and a board in one place."
      >
        <ProjectForm
          key={create.kind === 'project' ? 'project-open' : 'project-closed'}
          submitLabel="Create project"
          onSubmit={(values) => {
            const project = actions.addProject(values);
            pushToast(`“${project.name}” is ready 🌱`, 'success');
            closeCreate();
            navigate(`/projects/${project.id}`);
          }}
        />
      </Dialog>

      <Dialog
        open={create.kind === 'diary'}
        onClose={closeCreate}
        title="Today's page"
        description="Your thoughts stay on this device."
        size="lg"
      >
        <DiaryForm
          key={create.kind === 'diary' ? `diary-${create.diaryDate ?? 'today'}` : 'diary-closed'}
          initial={emptyDiaryForm(create.diaryDate ?? undefined)}
          submitLabel="Save entry"
          onSubmit={(values) => {
            actions.addDiaryEntry({
              date: values.date,
              title: values.title,
              body: values.body,
              mood: values.mood,
              projectId: values.projectId === '' ? null : values.projectId,
              tags: values.tags,
              photos: values.photos,
            });
            pushToast('Saved to your diary 🍵', 'success');
            closeCreate();
            navigate('/diary');
          }}
        />
      </Dialog>
      <Dialog
        open={create.kind === 'habit'}
        onClose={closeCreate}
        title="A new habit"
        description="Keep it small enough that a bad day cannot break it."
      >
        <HabitForm
          key={create.kind === 'habit' ? 'habit-open' : 'habit-closed'}
          submitLabel="Create habit"
          onSubmit={(values) => {
            actions.addHabit(values);
            pushToast(`“${values.name}” is on your list 🌱`, 'success');
            closeCreate();
          }}
        />
      </Dialog>

      <Dialog
        open={create.kind === 'mood'}
        onClose={closeCreate}
        title="How is today feeling?"
        description="Just for you, and only in this browser."
      >
        <QuickMoodPicker
          onDone={(mood, note) => {
            actions.logMood(todayString(), mood, note);
            pushToast('Mood logged 🌤️', 'success');
            closeCreate();
          }}
        />
      </Dialog>
    </>
  );
}

/** Small standalone mood logger used by the quick-create flow. */
function QuickMoodPicker({
  onDone,
}: {
  onDone: (mood: MoodLevel, note: string) => void;
}) {
  const [mood, setMood] = useState<MoodLevel | null>(null);
  const [note, setNote] = useState('');

  return (
    <div className="space-y-4">
      <MoodPicker
        value={mood}
        onChange={setMood}
        label="Pick the face that fits"
        compact
      />
      <Textarea
        rows={2}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="A short note (optional)"
        aria-label="Note for today"
      />
      <div className="flex justify-end">
        <Button disabled={!mood} onClick={() => mood && onDone(mood, note)}>
          Save today's mood
        </Button>
      </div>
    </div>
  );
}
