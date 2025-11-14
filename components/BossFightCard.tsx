import { BossFight } from "@/lib/boss";

interface Props {
  boss: BossFight;
}

export default function BossFightCard({ boss }: Props) {
  const color =
    boss.outcome === "win"
      ? "border-emerald-500"
      : boss.outcome === "loss"
      ? "border-rose-500"
      : "border-amber-400";

  const label =
    boss.outcome === "win"
      ? "Victory"
      : boss.outcome === "loss"
      ? "Defeat"
      : "Hard-Fought Draw";

  return (
    <div className={`border ${color} rounded-lg p-3 text-xs bg-slate-900/70`}>
      <div className="flex justify-between mb-1">
        <div className="font-semibold text-slate-100">{boss.name}</div>
        <div className="text-[0.65rem] uppercase text-slate-400">
          {label} · D{boss.difficulty}
        </div>
      </div>
      <p className="text-[0.7rem] text-slate-300">
        {boss.description}
      </p>
    </div>
  );
}
