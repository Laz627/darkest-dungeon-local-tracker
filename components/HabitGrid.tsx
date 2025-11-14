import { Habit, DayEntry } from "@/types";
interface Props {
  habits: Habit[];
  entry: DayEntry;
  onToggle: (id: string) => void;
}
export default function HabitGrid({ habits, entry, onToggle }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {habits.map((h) => {
        const active = entry.completedHabitIds.includes(h.id);
        return (
          <button
            key={h.id}
            onClick={() => onToggle(h.id)}
            className={`p-3 rounded border text-left text-xs ${
              active
                ? "bg-emerald-700 border-emerald-500"
                : "bg-slate-800 border-slate-700"
            }`}
          >
            <div className="font-semibold">{h.label}</div>
            <div className="text-slate-300 text-[0.65rem]">{h.description}</div>
          </button>
        );
      })}
    </div>
  );
}