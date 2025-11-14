import { dailyFlavor } from "@/lib/mood";
interface Props {
  date: string;
  mood: string;
  completedCount: number;
}
export default function DailyTitle({ date, mood, completedCount }: Props) {
  return (
    <div className="text-sm text-slate-300 italic">
      {dailyFlavor(mood, completedCount)}
    </div>
  );
}