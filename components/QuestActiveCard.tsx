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
  onOpenLog: () => void;
  onViewDetail: () => void;
}

export function QuestActiveCard({
  quest,
  questDays,
  onOpenLog,
  onViewDetail,
}: QuestActiveCardProps) {
  const streak = computeQuestStreakStats(quest, questDays);
  const counts = getQuestOutcomeCounts(quest, questDays);
  const progressLabel = getQuestProgressLabel(quest, questDays);
  const highlight = streak.currentSuccessStreak >= 3;

  const label = quest.customPrompt ?? quest.introText ?? "Hold course.";

  return (
    <div
      className={`sanctum-card ${
        highlight ? "border-amber-500/80 shadow-[0_0_16px_rgba(245,158,11,0.25)]" : "border-[#3e1d26]"
      } p-3 shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-amber-400">Active Quest</p>
          <h3 className="text-lg font-semibold text-amber-50">{quest.title}</h3>
          <p className="text-[0.8rem] text-amber-200/80">{label}</p>
        </div>
        <span className="sanctum-pill text-[10px] px-2 py-1 font-semibold">
          {questTypeLabel(quest.questType)}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Progress" value={progressLabel} />
        <Stat label="Successes" value={counts.successes.toString()} />
        <Stat label="Failures" value={counts.fails.toString()} />
        <Stat
          label="Current streak"
          value={streak.currentSuccessStreak > 0 ? `${streak.currentSuccessStreak} days held` : "—"}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={onOpenLog}
          className="sanctum-button"
        >
          Log Today’s Outcome
        </button>
        <button
          onClick={onViewDetail}
          className="sanctum-button-ghost"
        >
          View Log
        </button>
      </div>
      {streak.currentSuccessStreak > 0 && (
        <p className="mt-2 text-[11px] text-amber-300">
          Current streak: {streak.currentSuccessStreak} days held.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#3e1d26] bg-[#0b0508]/80 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-amber-300/80">{label}</p>
      <p className="text-[0.9rem] font-semibold text-amber-50">{value}</p>
    </div>
  );
}
