import { DaysState } from "@/types";

interface Props {
  monthKey: string; // "YYYY-MM"
  days: DaysState;
  onSelect: (date: string) => void;
}

export default function MiniCalendar({ monthKey, days, onSelect }: Props) {
  const startStr = `${monthKey}-01`;
  const first = new Date(startStr + "T00:00:00");
  const startDay = first.getDay(); // 0–6, Sunday-based
  const totalDays = new Date(
    first.getFullYear(),
    first.getMonth() + 1,
    0
  ).getDate();

  const cells: (string | null)[] = [];

  for (let i = 0; i < startDay; i++) {
    cells.push(null);
  }

  for (let d = 1; d <= totalDays; d++) {
    const ds = `${monthKey}-${String(d).padStart(2, "0")}`;
    cells.push(ds);
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 text-[0.65rem] text-slate-400 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs">
        {cells.map((date, idx) => {
          if (!date) {
            return <div key={idx} className="h-6" />;
          }

          const completed = days[date]?.completedHabitIds.length ?? 0;

          const bg =
            completed === 0
              ? "bg-slate-800"
              : completed <= 3
              ? "bg-emerald-700"
              : "bg-emerald-400";

          return (
            <button
              key={date}
              onClick={() => onSelect(date)}
              className={`h-6 rounded ${bg} text-[0.7rem] flex items-center justify-center`}
            >
              {date.slice(8)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
