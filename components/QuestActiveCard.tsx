import { NotebookPen, ScrollText } from "lucide-react";
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
        highlight ? "border-[#c3a167] shadow-[0_0_18px_rgba(195,161,103,0.25)]" : "border-[#333]"
      } p-4 shadow-md text-[0.95rem]`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#c3a167] font-serif">Active Quest</p>
          <h3 className="text-base font-semibold text-[#e0e0e0] font-serif tracking-wider">{quest.title}</h3>
          <p className="text-[0.78rem] text-[#7a7a7a] font-sans">{label}</p>
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
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          onClick={onOpenLog}
          className="sanctum-button"
        >
          <NotebookPen className="h-4 w-4" /> Log Outcome
        </button>
        <button
          onClick={onViewDetail}
          className="sanctum-link"
        >
          <ScrollText className="h-4 w-4" /> View Log Timeline
        </button>
      </div>
      {streak.currentSuccessStreak > 0 && (
        <p className="mt-2 text-[11px] text-[#c3a167]">
          Current streak: {streak.currentSuccessStreak} days held.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#333] bg-[#0c0c0c] px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#7a7a7a] font-serif">{label}</p>
      <p className="text-[0.9rem] font-semibold text-[#e0e0e0]">{value}</p>
    </div>
  );
}
