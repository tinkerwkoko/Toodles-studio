import { Pencil, Trash2 } from 'lucide-react';
import type { DiaryEntry } from '../../types';
import { formatLongDay } from '../../lib/date';
import { MoodBadge } from '../habits/MoodPicker';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export interface DiaryEntryCardProps {
  entry: DiaryEntry;
  featured?: boolean;
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (entry: DiaryEntry) => void;
}

/** A notebook page: handwritten date, serif heading, ruled journal body, and paper-framed keepsakes. */
export function DiaryEntryCard({ entry, featured = false, onEdit, onDelete }: DiaryEntryCardProps) {
  return (
    <Card
      variant={featured ? 'stack' : 'paper'}
      padding="lg"
      className="space-y-4"
    >
      {/* Dateline & Marginalia */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-divider/80 pb-3">
        <div className="flex flex-wrap items-center gap-3">
          <time
            dateTime={entry.date}
            className="font-hand text-[1.15rem] leading-none text-ink-soft"
          >
            {formatLongDay(entry.date)}
          </time>
          {entry.mood && <MoodBadge mood={entry.mood} />}
        </div>

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs italic text-ink-soft">
            {entry.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Entry Title */}
      <h2 className="font-display text-2xl font-semibold leading-snug text-ink">
        {entry.title || 'An untitled page'}
      </h2>

      {/* Ruled Journal Body */}
      {entry.body && (
        <div className="ruled-paper rounded-[3px] border-l-2 border-dusty-rose/40 pl-4 pr-2 py-1">
          <p className="whitespace-pre-wrap font-sans text-[0.96rem] leading-[1.85rem] text-ink">
            {entry.body}
          </p>
        </div>
      )}

      {/* Paper-Framed Photographs */}
      {entry.photos && entry.photos.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-1">
          {entry.photos.map((photo, i) => (
            <figure
              key={i}
              className="rounded-[3px] border border-lilac-200 bg-cream p-1.5 shadow-soft"
            >
              <img
                src={photo}
                alt=""
                className="h-28 w-28 rounded-[2px] object-cover"
              />
            </figure>
          ))}
        </div>
      )}

      {/* Quiet Footer Actions */}
      <div className="flex items-center justify-end gap-1 border-t border-divider/60 pt-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEdit(entry)}
          icon={<Pencil size={14} aria-hidden="true" />}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-rose-700 hover:bg-rose-100"
          onClick={() => onDelete(entry)}
          icon={<Trash2 size={14} aria-hidden="true" />}
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}
