import { Quest, QuestDayStatus } from "@/types";
import { X } from "lucide-react";

interface QuestLogDialogProps {
  quest: Quest;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (status: QuestDayStatus) => void;
}

const STATUS_STYLES: Record<QuestDayStatus, string> = {
  SUCCESS:
    "border border-[#c3a167] bg-[#1a1a1a] text-[#c3a167] hover:bg-[#8a1c1c]/30",
  FAIL:
    "border border-[#8a1c1c] bg-[#1a0c0c] text-[#f7d6d6] hover:bg-[#8a1c1c]/40",
  SKIPPED:
    "border border-[#333] bg-[#0c0c0c] text-[#e0e0e0] hover:border-[#c3a167]",
  PENDING: "border border-[#333] bg-[#0c0c0c] text-[#e0e0e0]",
};

export function QuestLogDialog({ quest, isOpen, onClose, onSubmit }: QuestLogDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0c0c]/80 p-4">
      <div className="w-full max-w-lg sanctum-card border-[#333] p-5 shadow-xl">
        <div className="flex items-center justify-between pb-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#c3a167] font-serif">Log Today</p>
            <h2 className="text-lg font-semibold text-[#e0e0e0] font-serif tracking-wider">{quest.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="sanctum-button-ghost rounded-full p-1"
            aria-label="Close log dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[0.9rem] text-[#e0e0e0]">
          How did you fare today? Choose an outcome and the Sanctum will record a fitting note.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {(["SUCCESS", "FAIL", "SKIPPED"] as QuestDayStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => onSubmit(status)}
              className={`rounded px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${STATUS_STYLES[status]}`}
            >
              {status === "SUCCESS" && "Triumph"}
              {status === "FAIL" && "Setback"}
              {status === "SKIPPED" && "Skipped"}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-[#7a7a7a]">
          Narratives draw from the quest’s archetype and streaks. Success feeds resolve; failure invites corruption.
        </p>
      </div>
    </div>
  );
}
