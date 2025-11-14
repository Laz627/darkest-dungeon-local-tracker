import { DaysState } from "@/types";
export function loadDays(): DaysState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("days");
    return raw ? (JSON.parse(raw) as DaysState) : {};
  } catch {
    return {};
  }
}
export function saveDays(days: DaysState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("days", JSON.stringify(days));
}
export function exportDays(days: DaysState): void {
  const blob = new Blob([JSON.stringify(days, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dark_sanctum_export.json";
  a.click();
}
export function importDays(file: File, cb: (d: DaysState) => void): void {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result as string);
      cb(parsed);
    } catch {
      alert("Invalid file.");
    }
  };
  reader.readAsText(file);
}