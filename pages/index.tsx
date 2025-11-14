import { useEffect, useMemo, useState } from "react";
import { DayEntry, DaysState, Habit } from "@/types";
import { loadDays, saveDays, exportDays, importDays } from "@/lib/storage";
import {
  todayISO,
  shiftDate,
  getMonthKeyFromDate,
  getWeekStart,
} from "@/lib/date";
import { computeMood, moodLabel } from "@/lib/mood";
import { generateBossFight } from "@/lib/boss";
import HabitGrid from "@/components/HabitGrid";
import DailyTitle from "@/components/DailyTitle";
import MiniCalendar from "@/components/MiniCalendar";
import BossFightCard from "@/components/BossFightCard";

const HABITS: Habit[] = [
  { id: "exercise", label: "Exercise", description: "Movement of any kind." },
  {
    id: "two_meals",
    label: "Eat Two Good Meals",
    description: "Nourish the body well.",
  },
  {
    id: "read",
    label: "Read Book",
    description: "A few pages is enough.",
  },
  {
    id: "pro_dev",
    label: "Professional Development",
    description: "Learn something useful.",
  },
  {
    id: "relax",
    label: "Relax at Night",
    description: "Deliberate unwinding.",
  },
  {
    id: "quality_time",
    label: "Quality Time",
    description: "Connection with Melissa & cats.",
  },
  {
    id: "sleep_cpap",
    label: "Quality Sleep / CPAP",
    description: "Proper sleep hygiene.",
  },
  {
    id: "personal_project",
    label: "Personal Project",
    description: "Work toward one goal.",
  },
  {
    id: "work_project",
    label: "Professional Project",
    description: "Forward progress at work.",
  },
  {
    id: "mental_health",
    label: "Mental Health Check",
    description: "Minimal social media.",
  },
  {
    id: "physical_health",
    label: "Physical Health Check",
    description: "Minimal caffeine.",
  },
];

function computeStreak(days: DaysState, startDate: string): number {
  let streak = 0;
  let cursor = startDate;

  while (true) {
    const entry = days[cursor];
    if (!entry || entry.completedHabitIds.length === 0) break;

    streak++;
    cursor = shiftDate(cursor, -1);
  }

  return streak;
}

function computeWeeklyScore(days: DaysState, endDate: string): number {
  // Sum of completed habits in last 7 days
  let score = 0;
  for (let i = 0; i < 7; i++) {
    const d = shiftDate(endDate, -i);
    const entry = days[d];
    score += entry?.completedHabitIds.length ?? 0;
  }
  return score;
}

export default function HomePage() {
  const [days, setDays] = useState<DaysState>({});
  const [currentDate, setCurrentDate] = useState<string>(todayISO());
  const [ready, setReady] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const today = todayISO();
  const isToday = currentDate === today;

  useEffect(() => {
    setDays(loadDays());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveDays(days);
  }, [days, ready]);

  const entry: DayEntry =
    days[currentDate] || { date: currentDate, completedHabitIds: [] };

  const mood = computeMood(entry);

  const streak = useMemo(() => computeStreak(days, today), [days, today]);

  const last7 = useMemo(() => {
    const arr: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = shiftDate(today, -i);
      const e = days[d];
      arr.push({ date: d, count: e?.completedHabitIds.length ?? 0 });
    }
    return arr;
  }, [days, today]);

  const weeklyScore = computeWeeklyScore(days, today);
  const weekStart = getWeekStart(today);
  const boss = generateBossFight(weekStart, weeklyScore);

  const monthKey = getMonthKeyFromDate(currentDate);

  const toggleHabit = (id: string) => {
    setDays((prev) => {
      const existing = prev[currentDate] || {
        date: currentDate,
        completedHabitIds: [],
      };

      const done = existing.completedHabitIds.includes(id);
      const updated: DayEntry = {
        ...existing,
        completedHabitIds: done
          ? existing.completedHabitIds.filter((x) => x !== id)
          : [...existing.completedHabitIds, id],
      };

      return { ...prev, [currentDate]: updated };
    });
  };

  const updateNote = (text: string) => {
    setDays((prev) => ({
      ...prev,
      [currentDate]: {
        ...(prev[currentDate] || { date: currentDate, completedHabitIds: [] }),
        note: text,
      },
    }));
  };

  const handleImport = (file: File) => {
    importDays(file, (data) => setDays(data));
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        Summoning the Dark Sanctum…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-4xl mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dark Sanctum – Daily Tracker</h1>
          <div className="text-xs text-slate-400 mt-1">
            Track the dungeon of your day, not just your output.
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <div className="text-right">
            <div className="text-[0.65rem] uppercase text-slate-500">Streak</div>
            <div className="text-lg font-semibold">
              {streak} day{streak === 1 ? "" : "s"}
            </div>
          </div>

          <button
            className="text-xs px-3 py-1 border border-slate-700 rounded hover:bg-slate-800"
            onClick={() => exportDays(days)}
          >
            Export
          </button>

          <label className="text-xs px-3 py-1 border border-slate-700 rounded hover:bg-slate-800 cursor-pointer">
            Import
            <input
              type="file"
              className="hidden"
              accept=".json"
              onChange={(e) => {
                if (e.target.files?.[0]) handleImport(e.target.files[0]);
              }}
            />
          </label>

          <button
            className="text-xs px-3 py-1 border border-slate-700 rounded hover:bg-slate-800"
            onClick={() => setCalendarOpen(true)}
          >
            Calendar
          </button>
        </div>
      </header>

      {/* Date navigation */}
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between">
        <button
          className="px-3 py-1 text-xs border border-slate-700 rounded hover:bg-slate-800"
          onClick={() => setCurrentDate((d) => shiftDate(d, -1))}
        >
          ← Previous
        </button>

        <div className="text-xs text-slate-300">
          {currentDate}{" "}
          {isToday && <span className="text-amber-400 ml-1">(Today)</span>}
        </div>

        <button
          disabled={currentDate >= today}
          className="px-3 py-1 text-xs border border-slate-700 rounded hover:bg-slate-800 disabled:opacity-40"
          onClick={() => setCurrentDate((d) => shiftDate(d, 1))}
        >
          Next →
        </button>
      </div>

      {/* Main card */}
      <main className="w-full max-w-4xl bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-6">
        {/* Title + mood */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-100">
                {moodLabel(mood)}
              </div>
              <div className="text-[0.7rem] text-slate-400">
                {entry.completedHabitIds.length} encounter(s) completed
              </div>
            </div>
          </div>

          <DailyTitle
            date={currentDate}
            mood={mood}
            completedCount={entry.completedHabitIds.length}
          />
        </section>

        {/* Habits */}
        <section>
          <h3 className="text-sm font-semibold mb-2">Encounters</h3>
          <HabitGrid habits={HABITS} entry={entry} onToggle={toggleHabit} />
        </section>

        {/* Notes */}
        <section>
          <h3 className="text-sm font-semibold mb-1">Chronicle</h3>
          <textarea
            value={entry.note ?? ""}
            onChange={(e) => updateNote(e.target.value)}
            placeholder="How did today actually feel?"
            className="w-full bg-slate-950/60 border border-slate-700 rounded-md text-xs px-2 py-2 min-h-[70px]"
          />
        </section>

        {/* Torchline & Boss */}
        <section className="grid gap-4 md:grid-cols-[2fr,1fr]">
          {/* Torchline */}
          <div>
            <h3 className="text-sm font-semibold mb-2">
              Torchline (Last 7 Days)
            </h3>
            <div className="flex items-end gap-2">
              {last7.map(({ date, count }) => {
                const height = Math.min(2 + count * 0.8, 7);
                const bg =
                  count === 0
                    ? "bg-slate-700"
                    : count <= 3
                    ? "bg-emerald-600"
                    : "bg-emerald-300";

                return (
                  <div key={date} className="flex flex-col items-center">
                    <div
                      className={`w-5 rounded ${bg}`}
                      style={{ height: `${height}rem` }}
                    />
                    <span className="text-[0.6rem] text-slate-500">
                      {date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[0.65rem] text-slate-500 mt-1">
              Any completed encounter keeps the flame alive. Imperfect days still
              move the story forward.
            </p>
          </div>

          {/* Boss card */}
          <div>
            <h3 className="text-sm font-semibold mb-2">This Week&apos;s Boss</h3>
            <BossFightCard boss={boss} />
          </div>
        </section>
      </main>

      {/* Calendar modal */}
      {calendarOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold">Chronicle Calendar</h2>
              <button
                className="text-xs px-2 py-1 border border-slate-700 rounded hover:bg-slate-800"
                onClick={() => setCalendarOpen(false)}
              >
                Close
              </button>
            </div>

            <MiniCalendar
              monthKey={monthKey}
              days={days}
              onSelect={(d) => {
                setCurrentDate(d);
                setCalendarOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
