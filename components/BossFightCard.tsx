import { BossFight } from "@/lib/boss";
export default function BossFightCard({ boss }: { boss: BossFight }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded p-3 text-xs">
      <div className="font-semibold text-slate-100">{boss.name}</div>
      <div className="text-[0.65rem] text-slate-300 mt-1">{boss.description}</div>
      <div className="text-[0.6rem] text-slate-500 mt-2">
        Difficulty Score: {boss.difficulty}
      </div>
    </div>
  );
}