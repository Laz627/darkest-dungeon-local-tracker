import { Quest, QuestDay } from "@/types";
import {
  computeQuestStreakStats,
  getQuestOutcomeCounts,
  getQuestProgressLabel,
  questTypeLabel,
} from "@/lib/quests/logic";

interface QuestActiveCardProps {
  quest: Quest;
  questDays: QuestDay[];
  onOpenLog?: () => void;
  onViewDetail: () => void;
  isToday?: boolean;
}

export function QuestActiveCard({
  quest,
  questDays,
  onOpenLog,
  onViewDetail,
  isToday,
}: QuestActiveCardProps) {
  const streak = computeQuestStreakStats(quest, questDays);
  const counts = getQuestOutcomeCounts(quest, questDays);
  const progressLabel = getQuestProgressLabel(quest, questDays);
  const highlight = streak.currentSuccessStreak >= 3;

  const label = quest.customPrompt ?? quest.introText ?? "Hold course.";

  return (
    <div
      className={`border ${
        highlight ? "border-amber-400/70" : "border-slate-700"
      } rounded-lg p-3 text-xs bg-slate-900/70`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[0.7rem] uppercase tracking-wide text-amber-400">
            Active Quest
          </p>
          <h3 className="text-sm font-semibold text-slate-100">{quest.title}</h3>
          <p className="text-[0.7rem] text-slate-300">{label}</p>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-[0.7rem] font-semibold text-slate-200">
          {questTypeLabel(quest.questType)}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Progress" value={progressLabel} />
        <Stat label="Successes" value={counts.successes.toString()} />
        <Stat label="Failures" value={counts.fails.toString()} />
        <Stat
          label="Current streak"
          value={
            streak.currentSuccessStreak > 0
              ? `${streak.currentSuccessStreak} days held`
              : "—"
          }
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {isToday && onOpenLog && (
          <button
            onClick={onOpenLog}
            className="rounded-md border border-amber-700 bg-[#3e1d26] px-3 py-1.5 text-xs font-semibold text-amber-100 transition hover:border-amber-400 hover:bg-[#3a0f0f]"
          >
            Log today&apos;s outcome
          </button>
        )}
        <button
          onClick={onViewDetail}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-amber-400 hover:text-amber-200"
        >
          View log
        </button>
      </div>
      {streak.currentSuccessStreak > 0 && (
        <p className="mt-2 text-[0.7rem] text-amber-300">
          Current streak: {streak.currentSuccessStreak} days held.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-800 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
