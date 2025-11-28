// === DARK SANCTUM — FULL VERSION ===

import { useEffect, useMemo, useState } from "react";
import TrainingLogSection from "@/components/TrainingLog";
import {
  loadDays,
  saveDays,
  exportDays,
  importDays,
  loadQuestState,
  saveQuestState,
  QuestStorageState,
} from "@/lib/storage";
import type {
  DayEntry,
  DaysState,
  Habit,
  Quest,
  QuestArchetype,
  QuestDayStatus,
  TrainingLog as TrainingLogType,
} from "@/types";
import {
  todayISO,
  shiftDate,
  getMonthKeyFromDate,
  getWeekStart,
} from "@/lib/date";
import { computeMood } from "@/lib/mood";
import { generateBossFight } from "@/lib/boss";
import HabitGrid from "@/components/HabitGrid";
import DailyTitle from "@/components/DailyTitle";
import MiniCalendar from "@/components/MiniCalendar";
import BossFightCard from "@/components/BossFightCard";
import DailyTasksSection from "@/components/DailyTasks";
import { QuestActiveCard } from "@/components/QuestActiveCard";
import { QuestLogDialog } from "@/components/QuestLogDialog";
import { QuestDetail } from "@/components/QuestDetail";
import {
  buildQuestNarrative,
  computeQuestStreakStats,
  isQuestCompleted,
  resolveQuestDeltas,
  upsertQuestDay,
} from "@/lib/quests/logic";
import { createQuestFromTemplate, QUEST_TEMPLATES } from "@/lib/quests/templates";


// === HABITS ===
const HABITS: Habit[] = [
  {
    id: "exercise",
    label: "Steel the Flesh",
    description: "Move the body until the blood stirs against the dark.",
  },
  {
    id: "two_meals",
    label: "Rations Secured",
    description: "Two honest meals — no scavenged scraps today.",
  },
  {
    id: "read",
    label: "Study the Tomes",
    description: "Sharpen the mind, even a page at a time.",
  },
  {
    id: "pro_dev",
    label: "Work the Craft",
    description: "Learn something that strengthens tomorrow.",
  },
  {
    id: "relax",
    label: "Lower the Torch",
    description: "Deliberate unwinding — resist the frantic scroll.",
  },
  {
    id: "quality_time",
    label: "Guard the Hearth",
    description: "Be present with Melissa and the cats.",
  },
  {
    id: "sleep_cpap",
    label: "Ward the Night",
    description: "CPAP on — safeguard the vulnerable hours.",
  },
  {
    id: "personal_project",
    label: "Advance the Side Quest",
    description: "Push a personal project one square further.",
  },
  {
    id: "work_project",
    label: "Carry the Banner",
    description: "Nudge a professional initiative forward.",
  },
  {
    id: "mental_health",
    label: "Mute the Sirens",
    description: "Keep social media’s lure at bay.",
  },
  {
    id: "physical_health",
    label: "Temper the Brew",
    description: "Mind the caffeine — protect the nerves.",
  },
];

interface DailyTask {
  id: string;
  label: string;
  completed: boolean;
}

const HEART_HABIT_IDS = [
  "exercise",
  "mental_health",
  "physical_health",
  "sleep_cpap",
] as const;

const HEART_HABIT_LABELS: Record<string, string> = {
  exercise: "Steel the Flesh",
  mental_health: "Mute the Sirens",
  physical_health: "Temper the Brew",
  sleep_cpap: "Ward the Night",
};

function computeHeartStatus(entry: DayEntry) {
  const totalHearts = HEART_HABIT_IDS.length;
  const missingLabels: string[] = [];

  for (const id of HEART_HABIT_IDS) {
    if (!entry.completedHabitIds.includes(id)) {
      const label = HEART_HABIT_LABELS[id];
      if (label) missingLabels.push(label);
    }
  }

  const heartsRemaining = totalHearts - missingLabels.length;

  let flavor: string;
  if (heartsRemaining === totalHearts) {
    flavor =
      "Resolutions intact. The vices skulk in silence—for now.";
  } else if (heartsRemaining <= 0) {
    flavor =
      "A grim tally. All four pillars were left undefended.";
  } else {
    const lostList = missingLabels.join(", ");
    flavor = `Cracks in the bulwark—today, you yielded on: ${lostList}.`;
  }

  return { heartsRemaining, totalHearts, missingLabels, flavor };
}

// === STREAK ===
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

function computeWeeklyScore(days: DaysState, weekStart: string): number {
  // Score is based on the calendar week (Mon–Sun) that begins at weekStart.
  // This prevents last week’s wins from making the new boss look “already beaten”
  // on Monday and aligns boss outcome with that specific week.
  let score = 0;
  for (let i = 0; i < 7; i++) {
    const d = shiftDate(weekStart, i);
    const entry = days[d];
    score += entry?.completedHabitIds.length ?? 0;
  }
  return score;
}

// === WEEKLY TASK HELPERS ===
function computeWeeklyTaskBuff(
  weekStart: string,
  tasksByDate: Record<string, DailyTask[]>
): string {
  const dailyPercents: number[] = [];

  for (let i = 0; i < 7; i++) {
    const d = shiftDate(weekStart, i);
    const tasks = tasksByDate[d] ?? [];
    if (!tasks.length) continue;

    const completed = tasks.filter((t) => t.completed).length;
    const percent = Math.round((completed / tasks.length) * 100);
    dailyPercents.push(percent);
  }

  if (dailyPercents.length === 0) return "";

  const avg =
    dailyPercents.reduce((sum, val) => sum + val, 0) / dailyPercents.length;

  if (avg < 40) {
    return "Yet your side contracts lay mostly neglected, granting the foe small but telling advantages.";
  }
  if (avg < 80) {
    return "Steady attention to lesser contracts blunted the enemy’s advance.";
  }
  return "Meticulous completion of every side contract turned small gains into a crushing strategic edge.";
}

function computeWeeklyTaskXP(
  weekStart: string,
  tasksByDate: Record<string, DailyTask[]>
) {
  let completedCount = 0;

  for (let i = 0; i < 7; i++) {
    const d = shiftDate(weekStart, i);
    const tasks = tasksByDate[d] ?? [];
    completedCount += tasks.filter((t) => t.completed).length;
  }

  const xpPerTask = 5;
  const maxXp = 100;
  let xp = completedCount * xpPerTask;
  if (xp > maxXp) xp = maxXp;

  const percent = Math.round((xp / maxXp) * 100);

  let label: string;
  if (xp === 0) {
    label = "No XP gained from side contracts.";
  } else if (percent < 40) {
    label = "A trickle of XP flows from scattered efforts.";
  } else if (percent < 80) {
    label = "Solid XP accumulates from consistent side contracts.";
  } else {
    label = "Task XP surges, empowering this week’s encounter.";
  }

  return { xp, maxXp, percent, label };
}

export default function HomePage() {
  const [days, setDays] = useState<DaysState>({});
  const [currentDate, setCurrentDate] = useState<string>(todayISO());
  const [ready, setReady] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [tasksByDate, setTasksByDate] = useState<Record<string, DailyTask[]>>(
    {}
  );
  const [questState, setQuestState] = useState<QuestStorageState>({
    quests: [],
    questDays: [],
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    QUEST_TEMPLATES[0]?.id ?? "custom-expedition"
  );
  const [customTitle, setCustomTitle] = useState<string>("");
  const [customIntro, setCustomIntro] = useState<string>("");
  const [customDuration, setCustomDuration] = useState<number>(
    QUEST_TEMPLATES[0]?.durationDays ?? 7
  );
  const [customArchetype, setCustomArchetype] = useState<QuestArchetype>(
    "custom"
  );
  const [logOpen, setLogOpen] = useState(false);

  const today = todayISO();
  const isToday = currentDate === today;
  const questVisibleForDate = !!activeQuest && currentDate >= activeQuest.startDate;


  // === INITIAL LOAD ===
  useEffect(() => {
    setDays(loadDays());
    setQuestState(loadQuestState());
    try {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem("darkSanctumTasksV1")
          : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setTasksByDate(parsed);
        }
      }
    } catch {
      // ignore malformed task data
    }
    setReady(true);
  }, []);

  // === SAVE ===
  useEffect(() => {
    if (ready) saveDays(days);
  }, [days, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "darkSanctumTasksV1",
          JSON.stringify(tasksByDate)
        );
      }
    } catch {
      // ignore
    }
  }, [tasksByDate, ready]);

  useEffect(() => {
    if (ready) saveQuestState(questState);
  }, [questState, ready]);

  const entry: DayEntry =
    days[currentDate] || { date: currentDate, completedHabitIds: [] };

  const heartStatus = useMemo(() => computeHeartStatus(entry), [entry]);

  const tasksForDay: DailyTask[] = tasksByDate[currentDate] ?? [];

  const addTask = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    setTasksByDate((prev) => {
      const existing = prev[currentDate] ?? [];
      const newTask: DailyTask = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label: trimmed,
        completed: false,
      };
      return { ...prev, [currentDate]: [...existing, newTask] };
    });
  };

  const startQuest = () => {
    const template = QUEST_TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (!template) return;
    if (activeQuest) {
      alert("Finish or abandon the current quest before starting another.");
      return;
    }

    const quest = createQuestFromTemplate(template, {
      title: customTitle || template.title,
      introText: customIntro || template.introText,
      durationDays: customDuration,
      archetype: customArchetype,
      customPrompt: template.customPrompt,
    });
    setQuestState((prev) => ({ quests: [...prev.quests, quest], questDays: prev.questDays }));
  };

  const logQuestDay = (status: QuestDayStatus) => {
    if (!activeQuest) return;
    const todayDate = todayISO();
    const narrative = buildQuestNarrative(activeQuest, activeQuestDays, status);
    const streakStats = computeQuestStreakStats(activeQuest, activeQuestDays);
    const deltas = resolveQuestDeltas(status, streakStats);

    setQuestState((prev) => {
      const updatedDays = upsertQuestDay(activeQuest, prev.questDays, {
        ...deltas,
        status,
        date: todayDate,
        autogeneratedNarrative: narrative,
        questId: activeQuest.id,
      });

      const updatedQuests: Quest[] = prev.quests.map((q) => {
        if (q.id !== activeQuest.id) return q;
        if (isQuestCompleted(activeQuest, updatedDays)) {
          return { ...q, status: "COMPLETED" };
        }
        return q;
      });

      return { quests: updatedQuests, questDays: updatedDays };
    });
    setLogOpen(false);
  };

  const activeQuest = useMemo(
    () => questState.quests.find((q) => q.status === "ACTIVE"),
    [questState.quests]
  );

  const activeQuestDays = useMemo(
    () =>
      activeQuest
        ? questState.questDays
            .filter((d) => d.questId === activeQuest.id)
            .sort((a, b) => a.dayIndex - b.dayIndex)
        : [],
    [activeQuest, questState.questDays]
  );

  useEffect(() => {
    const template = QUEST_TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (!template) return;
    setCustomDuration(template.durationDays);
    setCustomIntro(template.introText);
    setCustomTitle(template.title);
    setCustomArchetype(template.archetype);
  }, [selectedTemplateId]);

  const toggleTaskCompletion = (id: string) => {
    setTasksByDate((prev) => {
      const existing = prev[currentDate] ?? [];
      const updated = existing.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      return { ...prev, [currentDate]: updated };
    });
  };

  const deleteTask = (id: string) => {
    setTasksByDate((prev) => {
      const existing = prev[currentDate] ?? [];
      const updated = existing.filter((task) => task.id !== id);
      return { ...prev, [currentDate]: updated };
    });
  };

  const handleTrainingChange = (nextTraining: TrainingLogType) => {
    setDays((prev) => {
      const existing: DayEntry =
        prev[currentDate] || { date: currentDate, completedHabitIds: [] };
  
      // Build the updated entry first, then assert its type so TS
      // doesn’t run the “object literal may only specify known properties”
      // check against DayEntry.
      const updated = {
        ...existing,
        training: nextTraining,
      } as DayEntry;
  
      const nextDays = {
        ...prev,
        [currentDate]: updated,
      };
  
      saveDays(nextDays);
      return nextDays;
    });
  };

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

  const weekStart = getWeekStart(currentDate);
  const weeklyScore = computeWeeklyScore(days, weekStart);
  const boss = generateBossFight(weekStart, weeklyScore);

  const taskBuff = useMemo(
    () => computeWeeklyTaskBuff(weekStart, tasksByDate),
    [weekStart, tasksByDate]
  );

  const enhancedBoss = useMemo(
    () => ({
      ...boss,
      description: taskBuff ? boss.description + " " + taskBuff : boss.description,
    }),
    [boss, taskBuff]
  );

  const weeklyTaskXP = useMemo(
    () => computeWeeklyTaskXP(weekStart, tasksByDate),
    [weekStart, tasksByDate]
  );

  const monthKey = getMonthKeyFromDate(currentDate);

  // === TASK TOGGLE ===
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

  // === NOTES ===
  const updateNote = (text: string) => {
    setDays((prev) => ({
      ...prev,
      [currentDate]: {
        ...(prev[currentDate] || { date: currentDate, completedHabitIds: [] }),
        note: text,
      },
    }));
  };

  // === IMPORT ===
  const handleImport = (file: File) => {
    importDays(file, (data) => setDays(data));
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-amber-100">
        Summoning the Dark Sanctum…
      </div>
    );
  }

  return (
    <div className="sanctum-shell text-amber-50">
      {/* HEADER */}
      <header className="w-full max-w-4xl mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-[0.18em] uppercase text-amber-200">
            The Dark Sanctum
          </h1>
          <div className="text-[0.7rem] text-amber-300/80 mt-1 uppercase tracking-[0.16em]">
            Daily rituals of the adept
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <div className="text-right">
            <div className="text-[0.65rem] uppercase text-amber-300/80">
              Streak
            </div>
            <div className="text-lg font-semibold text-amber-100">
              {streak} day{streak === 1 ? "" : "s"}
            </div>
          </div>

          <button
            className="text-xs px-3 py-1 border border-[#6e3524] rounded-full bg-[#1b0707] text-amber-200 hover:bg-[#2a0b0b]"
            onClick={() => exportDays(days)}
          >
            Export
          </button>

          <label className="text-xs px-3 py-1 border border-[#6e3524] rounded-full bg-[#1b0707] text-amber-200 hover:bg-[#2a0b0b] cursor-pointer">
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
            className="text-xs px-3 py-1 border border-[#6e3524] rounded-full bg-[#1b0707] text-amber-200"
            onClick={() => setCalendarOpen(true)}
          >
            Calendar
          </button>
        </div>
      </header>

      {/* DATE NAV */}
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between">
        <button
          className="px-3 py-1 text-xs sanctum-pill"
          onClick={() => setCurrentDate((d) => shiftDate(d, -1))}
        >
          ← Previous
        </button>

        <div className="text-xs text-amber-200">
          {currentDate} {isToday && <span className="text-amber-400">(Today)</span>}
        </div>

        <button
          disabled={currentDate >= today}
          className="px-3 py-1 text-xs sanctum-pill disabled:opacity-40"
          onClick={() => setCurrentDate((d) => shiftDate(d, 1))}
        >
          Next →
        </button>
      </div>

      {/* MAIN CARD */}
      <main className="w-full max-w-4xl sanctum-card p-5 flex flex-col gap-6">
        {/* TITLE */}
        <section>
          {/* Hearts */}
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: heartStatus.totalHearts }).map((_, i) => {
                  const filled = i < heartStatus.heartsRemaining;
                  return (
                    <span
                      key={i}
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                        filled
                          ? "border-rose-300 bg-rose-500/90 text-slate-900 shadow-[0_0_8px_rgba(248,113,113,0.7)]"
                          : "border-slate-600 bg-slate-900 text-slate-500"
                      }`}
                    >
                      ♥
                    </span>
                  );
                })}
              </div>
              <div className="text-[0.65rem] uppercase tracking-wide text-amber-300/80">
                {heartStatus.heartsRemaining}/{heartStatus.totalHearts} Hearts
              </div>
            </div>
            <p className="mt-1 text-[0.7rem] text-amber-300/80">
              {heartStatus.flavor}
            </p>
          </div>

          <DailyTitle
            date={currentDate}
            mood={mood}
            completedCount={entry.completedHabitIds.length}
          />
          <div className="text-[0.7rem] text-amber-300/80">
            {entry.completedHabitIds.length} encounter(s) completed
          </div>
        </section>

        

        {/* HABITS */}
        <HabitGrid habits={HABITS} entry={entry} onToggle={toggleHabit} />

        {/* DAILY TASKS */}
        <DailyTasksSection
          tasks={tasksForDay}
          onAddTask={addTask}
          onToggleTask={toggleTaskCompletion}
          onDeleteTask={deleteTask}
        />

        {/* Habits + tasks already here */}

        <TrainingLogSection
          training={entry.training}
          onChange={handleTrainingChange}
        />

        {/* QUESTS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-amber-100">Quest Campaign</h3>
            {!activeQuest && (
              <span className="text-xs text-slate-300">
                Choose a template and begin a mini-campaign.
              </span>
            )}
          </div>

          {questVisibleForDate && activeQuest ? (
            <div className="space-y-3">
              {isToday ? (
                <QuestActiveCard
                  quest={activeQuest}
                  questDays={activeQuestDays}
                  onOpenLog={() => setLogOpen(true)}
                  onViewDetail={() =>
                    document.getElementById("quest-detail")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                  isToday
                />
              ) : (
                <QuestActiveCard
                  quest={activeQuest}
                  questDays={activeQuestDays}
                  onViewDetail={() =>
                    document.getElementById("quest-detail")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                />
              )}
              <div id="quest-detail">
                <QuestDetail quest={activeQuest} questDays={activeQuestDays} />
              </div>
            </div>
          ) : isToday && !activeQuest ? (
            <div className="sanctum-card border-[#3e1d26] p-3 shadow">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-amber-100">
                  Template
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-sm text-amber-50"
                  >
                    {QUEST_TEMPLATES.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs text-amber-100">
                  Archetype
                  <select
                    value={customArchetype}
                    onChange={(e) =>
                      setCustomArchetype(e.target.value as QuestArchetype)
                    }
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-sm text-amber-50"
                  >
                    <option value="discipline_pact">Discipline Pact</option>
                    <option value="health_rite">Health Rite</option>
                    <option value="recovery_vigil">Recovery Vigil</option>
                    <option value="custom">Custom</option>
                  </select>
                </label>

                <label className="text-xs text-amber-100">
                  Title
                  <input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Name your quest"
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-sm text-amber-50"
                  />
                </label>

                <label className="text-xs text-amber-100">
                  Duration (days)
                  <input
                    type="number"
                    min={1}
                    value={customDuration}
                    onChange={(e) => setCustomDuration(Number(e.target.value))}
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-sm text-amber-50"
                  />
                </label>

                <label className="text-xs text-amber-100 sm:col-span-2">
                  Objective prompt
                  <input
                    value={customIntro}
                    onChange={(e) => setCustomIntro(e.target.value)}
                    placeholder="What vow are you making?"
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-sm text-amber-50"
                  />
                </label>
              </div>
              <button
                onClick={startQuest}
                className="mt-3 rounded-md border border-amber-700 bg-[#3e1d26] px-4 py-1.5 text-xs font-semibold text-amber-100 transition hover:border-amber-400 hover:bg-[#3a0f0f]"
              >
                Begin Quest
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              No quest is active on this date.
            </p>
          )}
        </section>

        {/* NOTES */}
        <section>
          <h3 className="text-sm font-semibold mb-1 text-amber-100">
            Chronicle
          </h3>
          <textarea
            value={entry.note ?? ""}
            onChange={(e) => updateNote(e.target.value)}
            placeholder="How did today actually feel?"
            className="w-full bg-[#0b0508]/80 border border-[#3e1d26] rounded-md text-xs px-2 py-2 min-h-[70px]"
          />
        </section>

        {/* TORCHLINE + BOSS */}
        <section className="grid gap-4 md:grid-cols-[2fr,1fr]">
          {/* Torchline */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-amber-100">
              Torchline (Last 7 Days)
            </h3>

            <div className="flex items-end gap-2">
              {last7.map(({ date, count }) => {
                const height = Math.min(2 + count * 0.8, 7);
                const bg =
                  count === 0
                    ? "bg-slate-800"
                    : count <= 3
                    ? "bg-amber-700"
                    : "bg-amber-400";

                return (
                  <div key={date} className="flex flex-col items-center">
                    <div
                      className={`w-5 rounded ${bg}`}
                      style={{ height: `${height}rem` }}
                    />
                    <span className="text-[0.6rem] text-amber-300/80">
                      {date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Boss */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-amber-100">
              This Week&apos;s Boss
            </h3>

            <div className="mb-2">
              <div className="flex justify-between text-[0.65rem] text-amber-300/80 mb-1">
                <span>Task XP</span>
                <span>
                  {weeklyTaskXP.xp}/{weeklyTaskXP.maxXp}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-400"
                  style={{ width: `${weeklyTaskXP.percent}%` }}
                />
              </div>
              <p className="mt-1 text-[0.65rem] text-amber-300/80">
                {weeklyTaskXP.label}
              </p>
            </div>

            <BossFightCard boss={enhancedBoss} />
          </div>
        </section>
      </main>

      {activeQuest && (
        <QuestLogDialog
          quest={activeQuest}
          isOpen={logOpen}
          onClose={() => setLogOpen(false)}
          onSubmit={logQuestDay}
        />
      )}

      {/* CALENDAR MODAL */}
      {calendarOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#12060b] border border-[#3e1d26] rounded-xl p-4 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-amber-100">
                Chronicle Calendar
              </h2>
              <button
                className="text-xs sanctum-pill"
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
