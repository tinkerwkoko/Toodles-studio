import { BookOpenText, Folder, ListChecks, Repeat, Smile } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { useUi } from '../../store/useUi';

/** The chooser behind the big `+`: one tap to any creation flow. */
export function QuickCreateSheet() {
  const { quickOpen, closeQuickCreate, openCreate } = useUi();

  const options = [
    { kind: 'task' as const, label: 'Task', hint: 'Something to do', icon: ListChecks },
    { kind: 'project' as const, label: 'Project', hint: 'Something bigger', icon: Folder },
    { kind: 'diary' as const, label: 'Diary entry', hint: 'A page for today', icon: BookOpenText },
    { kind: 'habit' as const, label: 'Habit', hint: 'Something to repeat', icon: Repeat },
    { kind: 'mood' as const, label: 'Mood', hint: 'How today felt', icon: Smile },
  ];

  return (
    <Dialog
      open={quickOpen}
      onClose={closeQuickCreate}
      title="What would you like to add?"
      description="Pick one and we will keep it quick."
    >
      <ul className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <li key={option.kind}>
            <button
              type="button"
              onClick={() => openCreate(option.kind)}
              className="flex w-full items-center gap-3 rounded-2xl border border-lilac-200 bg-cream px-4 py-3 text-left transition hover:border-lilac-400 hover:bg-lilac-50"
            >
              <span
                aria-hidden="true"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-lilac-100 text-lilac-700"
              >
                <option.icon size={20} />
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-ink">{option.label}</span>
                <span className="block text-xs text-ink-soft">{option.hint}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
