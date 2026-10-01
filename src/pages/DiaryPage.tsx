import { useMemo, useState } from 'react';
import { PenLine, Search, X } from 'lucide-react';
import type { DiaryEntry } from '../types';
import { DiaryEntryCard } from '../components/diary/DiaryEntryCard';
import { DiaryForm, diaryToFormValues } from '../components/diary/DiaryForm';
import { MonthPicker } from '../components/diary/MonthPicker';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Dialog } from '../components/ui/Dialog';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { useToodles } from '../store/useToodles';
import { useUi } from '../store/useUi';

/** `/diary`: private pages, newest first, with search and month navigation. */
export function DiaryPage() {
  const { data, actions } = useToodles();
  const { openCreate, pushToast } = useUi();

  const [query, setQuery] = useState('');
  const [month, setMonth] = useState<string | null>(null);
  const [editing, setEditing] = useState<DiaryEntry | null>(null);
  const [removing, setRemoving] = useState<DiaryEntry | null>(null);

  const entries = useMemo(
    () =>
      [...data.diaryEntries].sort(
        (a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt),
      ),
    [data.diaryEntries],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (month && !entry.date.startsWith(month)) return false;
      if (needle.length === 0) return true;
      return `${entry.title} ${entry.body} ${entry.tags.join(' ')}`.toLowerCase().includes(needle);
    });
  }, [entries, query, month]);

  return (
    <div className="pb-4">
      <PageHeader
        title="Diary"
        subtitle="Private pages that only ever live in this browser."
        pose={entries.length === 0 ? 'curious' : undefined}
        actions={
          <Button
            className="hidden sm:inline-flex"
            onClick={() => openCreate('diary')}
            icon={<PenLine size={18} aria-hidden="true" />}
          >
            New entry
          </Button>
        }
      />

      {entries.length === 0 ? (
        <EmptyState
          title="Your thoughts are welcome here"
          sentence="Write about a day, a feeling, an idea. Nobody else can read it, and it is never uploaded."
          actionLabel="Write your first entry"
          onAction={() => openCreate('diary')}
        />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search
                size={17}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-lilac-500"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search your pages"
                aria-label="Search diary entries"
                className="w-full rounded-2xl border border-lilac-200 bg-cream py-2.5 pr-10 pl-10 text-sm focus:border-lilac-400 focus:outline-none focus:ring-4 focus:ring-lilac-200/60"
              />
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-lilac-700 hover:bg-lilac-100"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              )}
            </div>
            <MonthPicker value={month} onChange={setMonth} />
          </div>

          {visible.length === 0 ? (
            <EmptyState
              small
              pose="curious"
              title="Nothing on those pages"
              sentence="No entries match this month or search. Try another month, or write something new."
              actionLabel="Write an entry"
              onAction={() => openCreate('diary')}
            />
          ) : (
            <div className="space-y-3">
              {visible.map((entry) => (
                <DiaryEntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={setEditing}
                  onDelete={setRemoving}
                />
              ))}
            </div>
          )}
        </>
      )}

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit this page"
        size="lg"
      >
        {editing && (
          <DiaryForm
            key={editing.id}
            initial={diaryToFormValues(editing)}
            submitLabel="Save changes"
            onSubmit={(values) => {
              actions.updateDiaryEntry(editing.id, {
                date: values.date,
                title: values.title,
                body: values.body,
                mood: values.mood,
                projectId: values.projectId === '' ? null : values.projectId,
                tags: values.tags,
                photos: values.photos,
              });
              setEditing(null);
              pushToast('Page saved', 'success');
            }}
          />
        )}
      </Dialog>

      <ConfirmDialog
        open={!!removing}
        title="Tear out this page?"
        tone="danger"
        confirmLabel="Delete entry"
        body={<p>“{removing?.title || 'This page'}” will be removed for good.</p>}
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) actions.deleteDiaryEntry(removing.id);
          setRemoving(null);
          pushToast('Entry deleted');
        }}
      />
    </div>
  );
}
