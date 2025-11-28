import { Quest, QuestDayStatus } from "@/types";

interface QuestLogDialogProps {
  quest: Quest;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (status: QuestDayStatus) => void;
}

const STATUS_STYLES: Record<QuestDayStatus, string> = {
  SUCCESS: "bg-emerald-600 hover:bg-emerald-500",
  FAIL: "bg-red-600 hover:bg-red-500",
  SKIPPED: "bg-slate-600 hover:bg-slate-500",
  PENDING: "bg-slate-700",
};

export function QuestLogDialog({ quest, isOpen, onClose, onSubmit }: QuestLogDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-lg bg-slate-900 p-6 shadow-lg ring-1 ring-slate-700">
        <div className="flex items-center justify-between pb-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-amber-400">Log Today</p>
            <h2 className="text-xl font-semibold text-white">{quest.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 transition hover:text-white"
            aria-label="Close log dialog"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-slate-300">
          How did you fare today? Choose an outcome and the Sanctum will record a fitting note.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(["SUCCESS", "FAIL", "SKIPPED"] as QuestDayStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => onSubmit(status)}
              className={`rounded-md px-4 py-3 text-sm font-semibold text-white transition ${STATUS_STYLES[status]}`}
            >
              {status === "SUCCESS" && "Triumph"}
              {status === "FAIL" && "Setback"}
              {status === "SKIPPED" && "Skipped"}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Narratives draw from the quest’s archetype and streaks. Success feeds resolve; failure invites corruption.
        </p>
      </div>
    </div>
  );
}
