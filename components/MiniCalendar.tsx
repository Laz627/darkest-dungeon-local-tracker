import { DaysState } from "@/types";
interface Props {
  monthKey: string;
  days: DaysState;
  onSelect: (d: string) => void;
}
function getDaysInMonth(key: string): string[] {
  const [y, m] = key.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const out: string[] = [];
  while (start.getMonth() === m - 1) {
    out.push(start.toISOString().slice(0, 10));
    start.setDate(start.getDate() + 1);
  }
  return out;
}
export default function MiniCalendar({ monthKey, days, onSelect }: Props) {
  const monthDays = getDaysInMonth(monthKey);
  return (
    <div className="grid grid-cols-7 gap-1 text-center text-[0.65rem]">
      {monthDays.map((d) => {
        const count = days[d]?.completedHabitIds.length ?? 0;
        const color =
          count === 0
            ? "bg-slate-700"
            : count <= 3
            ? "bg-emerald-600"
            : "bg-emerald-300";
        return (
          <button
            key={d}
            onClick={() => onSelect(d)}
            className={`aspect-square rounded ${color}`}
          >
            {d.slice(8)}
          </button>
        );
      })}
    </div>
  );
}