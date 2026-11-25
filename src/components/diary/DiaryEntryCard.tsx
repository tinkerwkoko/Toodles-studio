import { Pencil, Trash2 } from 'lucide-react';
import type { DiaryEntry } from '../../types';
import { formatLongDay } from '../../lib/date';
import { MoodBadge } from '../habits/MoodPicker';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { LeafMark, WildflowerSprig } from '../ui/BotanicalOrnaments';

export interface DiaryEntryCardProps {
  entry: DiaryEntry;
  featured?: boolean;
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (entry: DiaryEntry) => void;
}

/** A typewritten botanical journal page: typewriter date & body, editorial serif title, soft keepsakes. */
export function DiaryEntryCard({ entry, featured = false, onEdit, onDelete }: DiaryEntryCardProps) {
  return (
    <Card
      variant={featured ? 'stack' : 'paper'}
      padding="lg"
      className="relative overflow-hidden space-y-4"
    >
      {featured && (
        <WildflowerSprig className="absolute -top-1 -right-1 w-24 text-fern/18" />
      )}

      {/* Typewritten Dateline & Tags */}
      <div className="relative flex flex-wrap items-center justify-between gap-2 border-b border-divider/65 pb-3">
        <div className="flex flex-wrap items-center gap-3">
          <time
            dateTime={entry.date}
            className="inline-flex items-center gap-1.5 font-typewriter text-xs tracking-wide text-fern leading-none"
          >
            <LeafMark className="h-3.5 w-3.5 text-fern/75" />
            <span>{formatLongDay(entry.date)}</span>
          </time>
          {entry.mood && <MoodBadge mood={entry.mood} />}
        </div>

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 font-typewriter text-xs text-ink-soft">
            {entry.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Entry Title */}
      <h2 className="relative font-display text-2xl leading-snug text-ink">
        {entry.title || 'An untitled page'}
      </h2>

      {/* Typewritten Ruled Journal Body */}
      {entry.body && (
        <div className="ruled-paper rounded-[6px] border-l-2 border-sage/60 pl-4 pr-3 py-1.5">
          <p className="whitespace-pre-wrap font-typewriter text-[0.94rem] leading-[1.85rem] text-ink">
            {entry.body}
          </p>
        </div>
      )}

      {/* Soft Paper-Framed Photographs */}
      {entry.photos && entry.photos.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-1">
          {entry.photos.map((photo, i) => (
            <figure
              key={i}
              className="rounded-[8px] bg-paper-2/60 p-1.5 shadow-soft"
            >
              <img
                src={photo}
                alt=""
                className="h-28 w-28 rounded-[5px] object-cover"
              />
            </figure>
          ))}
        </div>
      )}

      {/* Quiet Footer Actions */}
      <div className="flex items-center justify-end gap-1 border-t border-divider/55 pt-3">
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
