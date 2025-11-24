// /types/index.ts

// === Moods ===
export type Mood =
  | "stalwart"
  | "wavering"
  | "resilient"
  | "fractured"
  | "quiet"
  | "overclocked"
  | "unburdened";

// === Training / Lifting / Running ===
export type CoreLiftId = "seated_leg_press" | "chest_dips" | "pull_ups";

export interface ExerciseLog {
  // Rate of Perceived Exertion (1–10). null = not logged.
  rpe: number | null;
  // Freeform metric: e.g. "200 lb x 8" or "45 min @ 1% incline".
  metric: string;
}

export interface TrainingLog {
  // Daily run entry
  run?: ExerciseLog;

  // Core lifts
  lifts?: {
    seated_leg_press?: ExerciseLog;
    chest_dips?: ExerciseLog;
    pull_ups?: ExerciseLog;
  };
}

// === Core Day Types ===
export interface DayEntry {
  date: string;
  completedHabitIds: string[];
  note?: string;
  mood?: Mood;
  // NEW: daily running / lifting log (Iron Rituals)
  training?: TrainingLog;
}

export interface DaysState {
  [date: string]: DayEntry;
}

export interface Habit {
  id: string;
  label: string;
  description: string;
}
