import { DaysState, Quest, QuestDay } from "@/types";

const KEY = "darkSanctumV1";
const QUEST_KEY = "darkSanctumQuestV1";

export function loadDays(): DaysState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveDays(days: DaysState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(days));
}

export function exportDays(days: DaysState) {
  const blob = new Blob([JSON.stringify(days, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dark_sanctum_export.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function importDays(file: File, callback: (data: DaysState) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result as string);
      callback(parsed);
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

export interface QuestStorageState {
  quests: Quest[];
  questDays: QuestDay[];
}

const DEFAULT_QUEST_STATE: QuestStorageState = { quests: [], questDays: [] };

export function loadQuestState(): QuestStorageState {
  if (typeof window === "undefined") return DEFAULT_QUEST_STATE;
  try {
    const raw = localStorage.getItem(QUEST_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_QUEST_STATE;
  } catch {
    return DEFAULT_QUEST_STATE;
  }
}

export function saveQuestState(state: QuestStorageState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(QUEST_KEY, JSON.stringify(state));
}
