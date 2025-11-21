import { Habit, DayEntry } from "@/types";

interface Props {
  habits: Habit[];
  entry: DayEntry;
  onToggle: (id: string) => void;
}

export default function HabitGrid({ habits, entry, onToggle }: Props) {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
      {habits.map((h) => {
        const done = entry.completedHabitIds.includes(h.id);

        return (
          <button
            key={h.id}
            onClick={() => onToggle(h.id)}
            className={`border rounded-lg px-3 py-2 text-left transition text-xs
              ${
                done
                  ? "border-emerald-400 bg-emerald-950/40"
                  : "border-slate-700 bg-slate-900/50 hover:bg-slate-800/50"
              }`}
          >
            <div className="flex justify-between mb-1">
              <span className="font-semibold">{h.label}</span>
              <span
                className={`h-4 w-4 rounded-full border flex justify-center items-center
                  ${
                    done
                      ? "border-emerald-300 bg-emerald-400 text-slate-900"
                      : "border-slate-500"
                  }`}
              >
                {done ? "✓" : ""}
              </span>
            </div>
            <p className="text-[0.7rem] text-slate-300">{h.description}</p>
          </button>
        );
      })}
    </div>
  );
}
