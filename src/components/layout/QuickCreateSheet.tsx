import { BookOpenText, Folder, ListChecks, Repeat, Smile } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { useUi } from '../../store/useUi';

/** The chooser behind the `+`: one tap to any creation flow. */
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
      <ul className="divide-y divide-divider">
        {options.map((option) => (
          <li key={option.kind}>
            <button
              type="button"
              onClick={() => openCreate(option.kind)}
              className="flex w-full items-center gap-3.5 px-2 py-3 text-left transition hover:bg-paper-2/60 rounded-[4px] cursor-pointer"
            >
              <span
                aria-hidden="true"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-[4px] border border-divider bg-cream text-accent"
              >
                <option.icon size={18} strokeWidth={1.8} />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-lg font-semibold text-ink leading-tight">
                  {option.label}
                </span>
                <span className="block text-xs font-sans italic text-ink-soft">{option.hint}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
