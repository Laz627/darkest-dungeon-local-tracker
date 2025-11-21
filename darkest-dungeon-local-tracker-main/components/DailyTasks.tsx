
import { useMemo, useState, FormEvent } from "react";

export interface DailyTask {
  id: string;
  label: string;
  completed: boolean;
}

interface Props {
  tasks: DailyTask[];
  onAddTask: (label: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

function getCompletionMeta(tasks: DailyTask[]) {
  if (!tasks.length) {
    return {
      percent: 0,
      titleSuffix: "No Contracts Posted",
      flavor:
        "No contracts were posted for this day. The ledger waits in eerie silence.",
    };
  }

  const completed = tasks.filter((t) => t.completed).length;
  const percent = Math.round((completed / tasks.length) * 100);

  if (percent === 0) {
    return {
      percent,
      titleSuffix: "A Day Unscripted",
      flavor:
        "The ledger lies untouched—ambition idle and unspent.",
    };
  }

  if (percent > 0 && percent < 50) {
    return {
      percent,
      titleSuffix: "Unfinished Errands",
      flavor:
        "Some contracts were honored. Many yet gather dust.",
    };
  }

  if (percent >= 50 && percent < 90) {
    return {
      percent,
      titleSuffix: "A Hard-Fought Campaign",
      flavor:
        "The day’s labors have broken the back of indolence.",
    };
  }

  if (percent >= 90 && percent < 100) {
    return {
      percent,
      titleSuffix: "Only Trifles Remain",
      flavor:
        "Only trifling deeds remain, taunting from the margins.",
    };
  }

  return {
    percent,
    titleSuffix: "Every Deed Accounted For",
    flavor:
      "Every task struck from the ledger. A rare and precious thing.",
  };
}

export default function DailyTasksSection({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: Props) {
  const [draft, setDraft] = useState("");
  const meta = useMemo(() => getCompletionMeta(tasks), [tasks]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAddTask(trimmed);
    setDraft("");
  };

  return (
    <section>
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-sm font-semibold text-amber-100">
          Daily Tasks{" "}
          <span className="text-[0.65rem] text-amber-300/80">
            — {meta.titleSuffix}
          </span>
        </h3>
        <div className="text-[0.65rem] text-amber-300/80">
          {tasks.length > 0
            ? `${meta.percent}% · ${tasks.filter((t) => t.completed).length}/${
                tasks.length
              } complete`
            : "No tasks"}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 mb-2"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 bg-[#0b0508]/80 border border-[#3e1d26] rounded-md text-xs px-2 py-1"
        />
        <button
          type="submit"
          className="text-xs px-3 py-1 border border-[#6e3524] rounded-full bg-[#1b0707] text-amber-200 hover:bg-[#2a0b0b]"
        >
          Add
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className="text-[0.7rem] text-amber-300/70 italic">
          No contracts posted for this day. Add a task to begin the campaign.
        </p>
      ) : (
        <ul className="space-y-1">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-2 text-xs bg-[#0b0508]/80 border border-[#3e1d26] rounded-md px-2 py-1"
            >
              <button
                type="button"
                onClick={() => onToggleTask(task.id)}
                className={`h-4 w-4 rounded-sm border flex items-center justify-center text-[0.65rem] ${
                  task.completed
                    ? "border-emerald-300 bg-emerald-400 text-slate-900"
                    : "border-slate-500 bg-slate-900"
                }`}
              >
                {task.completed ? "✓" : ""}
              </button>
              <span
                className={`flex-1 ${
                  task.completed ? "line-through text-slate-400" : "text-slate-100"
                }`}
              >
                {task.label}
              </span>
              <button
                type="button"
                onClick={() => onDeleteTask(task.id)}
                className="text-[0.65rem] text-slate-400 hover:text-red-400"
                aria-label="Delete task"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-2 text-[0.7rem] text-amber-300/80">
        {meta.flavor}
      </p>
    </section>
  );
}
