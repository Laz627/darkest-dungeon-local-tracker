import { useState, useEffect, useMemo } from "react";
import { format, addDays, subDays } from "date-fns";
import {
  loadDay,
  saveDay,
  createEmptyDay,
  exportData,
  importData,
} from "@/lib/storage";
import { getDailyTitle, getNarratorLine } from "@/lib/flavor";
import { encounters } from "@/lib/encounters";
import MiniCalendar from "@/components/MiniCalendar";
import BossFightCard from "@/components/BossFightCard";

export default function Home() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [data, setData] = useState<any>(createEmptyDay());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBoss, setShowBoss] = useState(false);

  // Load daily data when date changes
  useEffect(() => {
    const loaded = loadDay(format(currentDate, "yyyy-MM-dd"));
    setData(loaded ?? createEmptyDay());
  }, [currentDate]);

  // Derived state
  const completedCount = useMemo(
    () => Object.values(data.tasks).filter(Boolean).length,
    [data]
  );

  const dayKey = format(currentDate, "yyyy-MM-dd");

  function toggleTask(key: string) {
    const updated = {
      ...data,
      tasks: {
        ...data.tasks,
        [key]: !data.tasks[key],
      },
    };
    setData(updated);
    saveDay(dayKey, updated);
  }

  function updateNote(text: string) {
    const updated = { ...data, note: text };
    setData(updated);
    saveDay(dayKey, updated);
  }

  function goPrev() {
    setCurrentDate((d) => subDays(d, 1));
  }

  function goNext() {
    setCurrentDate((d) => addDays(d, 1));
  }

  return (
    <main className="min-h-screen bg-[#0c0a09] text-gray-200 px-6 py-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-wide text-amber-500">
            Dark Sanctum — Daily Tracker
          </h1>

          <div className="space-x-4">
            <button
              className="px-4 py-1 rounded bg-amber-700/20 border border-amber-600/40 hover:bg-amber-700/40 transition"
              onClick={() => exportData()}
            >
              Export
            </button>
            <button
              className="px-4 py-1 rounded bg-amber-700/20 border border-amber-600/40 hover:bg-amber-700/40 transition"
              onClick={() => importData(setCurrentDate, setData)}
            >
              Import
            </button>
            <button
              className="px-4 py-1 rounded bg-amber-700/20 border border-amber-600/40 hover:bg-amber-700/40 transition"
              onClick={() => setShowCalendar(true)}
            >
              Calendar
            </button>
          </div>
        </header>

        {/* Date + Navigation */}
        <section className="flex items-center justify-between text-lg">
          <button
            onClick={goPrev}
            className="px-3 py-1 rounded bg-gray-800/50 border border-gray-700 hover:bg-gray-700/40"
          >
            ← Previous
          </button>

          <div className="text-center">
            <p className="font-medium text-gray-300">
              {format(currentDate, "yyyy-MM-dd")}
            </p>
            <p className="text-amber-500 text-sm mt-1">
              {dayKey === format(new Date(), "yyyy-MM-dd") && "(Today)"}
            </p>
          </div>

          <button
            onClick={goNext}
            className="px-3 py-1 rounded bg-gray-800/50 border border-gray-700 hover:bg-gray-700/40"
          >
            Next →
          </button>
        </section>

        {/* Daily Title & Narration */}
        <section className="p-6 bg-[#1a1412] rounded-xl border border-amber-800/40 shadow-lg space-y-3">
          <h2 className="text-2xl text-amber-400 tracking-wide">
            {getDailyTitle(completedCount)}
          </h2>
          <p className="italic text-gray-400">{getNarratorLine(completedCount)}</p>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setShowBoss(true)}
              className="px-4 py-1 rounded bg-red-900/40 border border-red-700 hover:bg-red-700/40 text-red-300 transition"
            >
              Face Today’s Boss
            </button>
          </div>
        </section>

        {/* Encounter Tasks */}
        <section className="p-6 bg-[#14100f] rounded-xl border border-gray-800 shadow space-y-4">
          <h3 className="text-xl text-amber-400 tracking-wide">Encounters</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {encounters.map((task) => (
              <button
                key={task.key}
                onClick={() => toggleTask(task.key)}
                className={`p-4 rounded-xl border text-left transition ${
                  data.tasks[task.key]
                    ? "border-amber-500 bg-amber-500/10 shadow-md"
                    : "border-gray-700 bg-black/20 hover:bg-gray-800/40"
                }`}
              >
                <p className="font-semibold text-gray-200">{task.title}</p>
                <p className="text-sm text-gray-400 mt-1">{task.flavor}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Notes */}
        <section className="p-6 bg-[#14100f] rounded-xl border border-gray-800 shadow space-y-2">
          <h3 className="text-xl text-amber-400 tracking-wide">Chronicle</h3>
          <textarea
            className="w-full h-28 bg-black/30 rounded p-3 border border-gray-700 text-gray-200"
            value={data.note}
            onChange={(e) => updateNote(e.target.value)}
            placeholder="How did today actually feel?"
          />
        </section>
      </div>

      {showCalendar && <MiniCalendar close={() => setShowCalendar(false)} />}
      {showBoss && (
        <BossFightCard
          encounters={completedCount}
          close={() => setShowBoss(false)}
        />
      )}
    </main>
  );
}
