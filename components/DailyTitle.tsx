import { useMemo } from "react";
import { Mood } from "@/types";
import { getDailyTitle, getNarratorLine } from "@/lib/flavor";

interface Props {
  date: string;
  mood: Mood;
  completedCount: number;
}

export default function DailyTitle({ date, mood, completedCount }: Props) {
  const title = useMemo(
    () => getDailyTitle(mood, completedCount, date),
    [mood, completedCount, date]
  );

  const line = useMemo(
    () => getNarratorLine(completedCount),
    [completedCount]
  );

  return (
    <div className="flex flex-col gap-1 mt-1">
      <div className="text-xs uppercase tracking-wide text-amber-400">
        {title}
      </div>
      <div className="text-[0.7rem] text-slate-400 italic">
        {line}
      </div>
    </div>
  );
}
