import { useMemo, useState } from 'react';
import type { DateString, Habit, MoodLevel } from '../types';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitForm } from '../components/habits/HabitForm';
import { MoodCalendar } from '../components/habits/MoodCalendar';
import { MoodPicker } from '../components/habits/MoodPicker';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Dialog } from '../components/ui/Dialog';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { Textarea } from '../components/ui/Field';
import { todayString } from '../lib/date';
import { useToodles } from '../store/useToodles';
import { useUi } from '../store/useUi';

/** `/wellbeing` — mood logging with a month calendar, and habit tracking. */
export function WellbeingPage() {
  const { data, actions } = useToodles();
  const { pushToast } = useUi();

  const today = todayString();
  const [selectedDate, setSelectedDate] = useState<DateString>(today);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [note, setNote] = useState('');
  const [editing, setEditing] = useState<Habit | null>(null);
  const [creating, setCreating] = useState(false);

  const selectedLog = useMemo(
    () => data.moods.find((log) => log.date === selectedDate) ?? null,
    [data.moods, selectedDate],
  );
  const habits = useMemo(() => data.habits.filter((habit) => !habit.archived), [data.habits]);

  function logMood(mood: MoodLevel): void {
    actions.logMood(selectedDate, mood, selectedLog?.note ?? note);
    setNote('');
    pushToast('Mood logged 🌤️', 'success');
  }

  function stepMonth(delta: number): void {
    setCursor((current) => {
      const date = new Date(current.year, current.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  const moodPanel = (
    <Card padding="lg" className="space-y-4">
      <h2 className="text-lg">Mood</h2>
      <p className="text-sm text-ink-soft">
        {selectedDate === today ? 'How is today feeling?' : `How was ${selectedDate}?`}
      </p>

      <MoodPicker value={selectedLog?.mood ?? null} onChange={logMood} />

      <Textarea
        rows={2}
        value={selectedLog ? selectedLog.note : note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="A short note (optional)"
        aria-label="Note for this day"
      />

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={!selectedLog || note.trim().length === 0}
          onClick={() => {
            if (!selectedLog) return;
            actions.logMood(selectedDate, selectedLog.mood, note);
            setNote('');
            pushToast('Note saved');
          }}
        >
          Save note
        </Button>
        {selectedLog && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              actions.clearMood(selectedDate);
              setNote('');
              pushToast('Mood removed');
            }}
          >
            Clear this day
          </Button>
        )}
      </div>

      <MoodCalendar
        year={cursor.year}
        month={cursor.month}
        logs={data.moods}
        selected={selectedDate}
        onSelect={setSelectedDate}
        onStep={stepMonth}
      />
    </Card>
  );

  const habitPanel = (
    <Card padding="lg" className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg">Habits</h2>
        <Button size="sm" onClick={() => setCreating(true)}>
          New habit
        </Button>
      </div>

      {habits.length === 0 ? (
        <EmptyState
          small
          pose="sleepy"
          title="No habits yet"
          sentence="Start with one small thing you would like to do most days: reading, water, a short walk."
          actionLabel="Start your first habit"
          onAction={() => setCreating(true)}
        />
      ) : (
        <ul className="space-y-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              checks={data.habitChecks}
              weekStartsOn={data.settings.weekStartsOn}
              onEdit={setEditing}
            />
          ))}
        </ul>
      )}
    </Card>
  );

  return (
    <div className="pb-4">
      <PageHeader
        title="Mood & habits"
        subtitle="Gentle, private notes to yourself. No scores, no pressure."
        pose="curious"
      />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        {moodPanel}
        {habitPanel}
      </div>

      <Dialog open={creating} onClose={() => setCreating(false)} title="A new habit">
        <HabitForm
          key="habit-create"
          submitLabel="Create habit"
          onSubmit={(values) => {
            actions.addHabit(values);
            setCreating(false);
            pushToast(`“${values.name}” is on your list 🌱`, 'success');
          }}
        />
      </Dialog>

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Edit “${editing?.name ?? ''}”`}
      >
        {editing && (
          <HabitForm
            key={editing.id}
            initial={editing}
            submitLabel="Save changes"
            onSubmit={(values) => {
              actions.updateHabit(editing.id, values);
              setEditing(null);
              pushToast('Habit updated', 'success');
            }}
            onDelete={() => {
              actions.deleteHabit(editing.id);
              setEditing(null);
              pushToast('Habit deleted');
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

