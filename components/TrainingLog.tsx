// components/TrainingLog.tsx

import type {
  CoreLiftId,
  ExerciseLog,
  TrainingLog as TrainingLogType,
} from "@/types";

interface TrainingLogProps {
  training?: TrainingLogType;
  onChange: (training: TrainingLogType) => void;
}

const EXERCISES: { id: "run" | CoreLiftId; label: string }[] = [
  { id: "run", label: "Run" },
  { id: "seated_leg_press", label: "Seated Leg Press" },
  { id: "chest_dips", label: "Chest Dips" },
  { id: "pull_ups", label: "Pull / Chin Ups" },
];

function getExerciseLog(
  training: TrainingLogType | undefined,
  id: "run" | CoreLiftId
): ExerciseLog | undefined {
  if (!training) return undefined;
  if (id === "run") return training.run;
  return training.lifts?.[id];
}

export default function TrainingLogSection({
  training,
  onChange,
}: TrainingLogProps) {
  const current: TrainingLogType = training ?? { lifts: {} };

  function updateExercise(
    id: "run" | CoreLiftId,
    partial: Partial<ExerciseLog>
  ) {
    const existing: ExerciseLog = {
      rpe: null,
      metric: "",
      ...(getExerciseLog(current, id) ?? {}),
    };

    const updated: ExerciseLog = { ...existing, ...partial };

    const next: TrainingLogType =
      id === "run"
        ? { ...current, run: updated }
        : {
            ...current,
            lifts: {
              ...(current.lifts ?? {}),
              [id]: updated,
            },
          };

    onChange(next);
  }

  return (
    <section className="mt-4 border border-slate-700 rounded-lg p-3 bg-slate-950/60">
      {/* DD-flavored header */}
      <div className="flex flex-col gap-0.5 mb-2">
        <div className="text-xs uppercase tracking-wide text-amber-400">
          Iron Rituals
        </div>
        <div className="text-[0.7rem] text-slate-400 italic">
          In this dim ledger, you record the miles marched and iron moved. The
          flesh remembers what the mind would rather forget.
        </div>
        <div className="text-[0.65rem] text-slate-500">
          Log today&apos;s run and core lifts – a quiet tithe of pain paid
          against future horrors.
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)_minmax(0,1.4fr)] gap-2 text-[0.7rem] text-slate-200">
        <div className="text-[0.65rem] uppercase text-slate-500">Exercise</div>
        <div className="text-[0.65rem] uppercase text-slate-500 text-center">
          RPE
        </div>
        <div className="text-[0.65rem] uppercase text-slate-500">
          Weight / Duration
        </div>

        {EXERCISES.map(({ id, label }) => {
          const log = getExerciseLog(current, id) ?? { rpe: null, metric: "" };

          return (
            <div
              key={id}
              className="contents border-t border-slate-800 pt-1 mt-1"
            >
              {/* Exercise label */}
              <div className="pr-2 flex items-center">{label}</div>

              {/* RPE input */}
              <div className="px-1 flex items-center justify-center">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={log.rpe ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const parsed = raw === "" ? null : parseInt(raw, 10);
                    const clamped =
                      parsed == null || Number.isNaN(parsed)
                        ? null
                        : Math.min(10, Math.max(1, parsed));
                    updateExercise(id, { rpe: clamped });
                  }}
                  className="w-12 rounded bg-slate-900 border border-slate-700 px-1 py-0.5 text-center text-[0.7rem] text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              {/* Weight / Duration input */}
              <div className="pl-1 flex items-center">
                <input
                  type="text"
                  value={log.metric}
                  onChange={(e) =>
                    updateExercise(id, { metric: e.target.value })
                  }
                  placeholder={
                    id === "run"
                      ? "e.g. 45 min @ 1% incline"
                      : "e.g. 200 lb x 8"
                  }
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-0.5 text-[0.7rem] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
