import { DayEntry, Mood } from "@/types";

export function computeMood(entry: DayEntry): Mood {
  const n = entry.completedHabitIds.length;

  if (n === 0) return "fractured";
  if (n === 1) return "wavering";
  if (n === 2) return "quiet";
  if (n === 3) return "resilient";
  if (n === 4) return "stalwart";

  return "overclocked";
}

export function moodLabel(mood: Mood): string {
  return {
    stalwart: "Stalwart",
    wavering: "Wavering",
    resilient: "Resilient",
    fractured: "Fractured",
    quiet: "Quiet",
    overclocked: "Overclocked",
    unburdened: "Unburdened",
  }[mood];
}
