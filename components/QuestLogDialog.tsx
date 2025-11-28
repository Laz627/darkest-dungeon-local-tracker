import { Quest, QuestDayStatus } from "@/types";

interface QuestLogDialogProps {
  quest: Quest;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (status: QuestDayStatus) => void;
}

const STATUS_STYLES: Record<QuestDayStatus, string> = {
  SUCCESS:
    "border border-emerald-700 bg-[#12251c] text-emerald-100 hover:border-emerald-500 hover:bg-[#183323]",
  FAIL: "border border-[#7a1d1d] bg-[#2b0f10] text-rose-100 hover:border-rose-500 hover:bg-[#3b1314]",
  SKIPPED: "border border-slate-700 bg-[#0f1117] text-slate-200 hover:border-amber-400 hover:text-amber-100",
  PENDING: "border border-slate-800 bg-slate-900 text-slate-300",
};

export function QuestLogDialog({ quest, isOpen, onClose, onSubmit }: QuestLogDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg sanctum-card border-[#3e1d26] p-5 shadow-xl">
        <div className="flex items-center justify-between pb-2">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-amber-400">Log Today</p>
            <h2 className="text-lg font-semibold text-amber-50">{quest.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-amber-200/70 transition hover:text-amber-100"
            aria-label="Close log dialog"
          >
            ✕
          </button>
        </div>
        <p className="text-[0.9rem] text-amber-100/80">
          How did you fare today? Choose an outcome and the Sanctum will record a fitting note.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {(["SUCCESS", "FAIL", "SKIPPED"] as QuestDayStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => onSubmit(status)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${STATUS_STYLES[status]}`}
            >
              {status === "SUCCESS" && "Triumph"}
              {status === "FAIL" && "Setback"}
              {status === "SKIPPED" && "Skipped"}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-amber-200/70">
          Narratives draw from the quest’s archetype and streaks. Success feeds resolve; failure invites corruption.
        </p>
      </div>
    </div>
  );
}
