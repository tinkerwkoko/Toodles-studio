import { Pencil, Trash2 } from 'lucide-react';
import type { DiaryEntry } from '../../types';
import { formatLongDay } from '../../lib/date';
import { MoodBadge } from '../habits/MoodPicker';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export interface DiaryEntryCardProps {
  entry: DiaryEntry;
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (entry: DiaryEntry) => void;
}

/** A notebook page: date, title, body and the little details around it. */
export function DiaryEntryCard({ entry, onEdit, onDelete }: DiaryEntryCardProps) {
  return (
    <Card padding="lg" className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-bold tracking-wide text-lilac-700 uppercase">
          {formatLongDay(entry.date)}
        </p>
        {entry.mood && <MoodBadge mood={entry.mood} />}
        {entry.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-lilac-200 bg-lilac-50 px-2.5 py-0.5 text-xs font-bold text-lilac-700"
          >
            #{tag}
          </span>
        ))}
      </div>

      <h2 className="text-lg text-ink">{entry.title || 'An untitled page'}</h2>
      {entry.body && <p className="text-[0.95rem] leading-relaxed whitespace-pre-wrap text-ink-soft">{entry.body}</p>}

      {entry.photos && entry.photos.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1.5">
          {entry.photos.map((photo, i) => (
            <img
              key={i}
              src={photo}
              alt=""
              className="h-28 w-28 rounded-2xl object-cover border border-lilac-200 shadow-sm"
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Button
          size="sm"
          variant="soft"
          onClick={() => onEdit(entry)}
          icon={<Pencil size={15} aria-hidden="true" />}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-rose-700 hover:bg-rose-100"
          onClick={() => onDelete(entry)}
          icon={<Trash2 size={15} aria-hidden="true" />}
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}
