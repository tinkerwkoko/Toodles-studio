import { useEffect, useState } from 'react';
import type { AccentColor } from '../../types';
import { ACCENT_KEYS, ACCENT_LABELS, accent } from '../../lib/color';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Field, Input } from '../ui/Field';
import { cx } from '../../lib/cx';

export interface ColumnDialogValues {
  name: string;
  color: AccentColor;
}

export interface ColumnDialogProps {
  open: boolean;
  title: string;
  initialName: string;
  initialColor: AccentColor;
  submitLabel: string;
  onSave: (values: ColumnDialogValues) => void;
  onClose: () => void;
}

/** One small dialog for both "add column" and "rename / recolour column". */
export function ColumnDialog({
  open,
  title,
  initialName,
  initialColor,
  submitLabel,
  onSave,
  onClose,
}: ColumnDialogProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState<AccentColor>(initialColor);

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setColor(initialColor);
  }, [open, initialName, initialColor]);

  const canSubmit = name.trim().length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Never mind
          </Button>
          <Button disabled={!canSubmit} onClick={() => onSave({ name: name.trim(), color })}>
            {submitLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Column name" htmlFor="column-name">
          <Input
            id="column-name"
            data-autofocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Waiting on someone"
          />
        </Field>

        <fieldset className="space-y-2">
          <legend className="text-[13px] font-sans font-medium text-ink">Ink colour</legend>
          <div className="flex flex-wrap gap-2">
            {ACCENT_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                title={ACCENT_LABELS[key]}
                aria-label={ACCENT_LABELS[key]}
                aria-pressed={color === key}
                onClick={() => setColor(key)}
                className={cx(
                  'h-8 w-8 rounded-full border-2 transition cursor-pointer',
                  accent(key).mid,
                  color === key
                    ? 'scale-110 border-ink ring-2 ring-paper-2'
                    : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105',
                )}
              />
            ))}
          </div>
        </fieldset>
      </div>
    </Dialog>
  );
}
