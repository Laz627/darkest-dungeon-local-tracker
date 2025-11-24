export type Mood =
  | "stalwart"
  | "wavering"
  | "resilient"
  | "fractured"
  | "quiet"
  | "overclocked"
  | "unburdened";

export type CoreLiftId = "seated_leg_press" | "chest_dips" | "pull_ups";

export interface ExerciseLog {
  rpe: number | null;  // 1–10, null = not logged
  metric: string;      // e.g. "200 lb x 8" or "45 min @ 1% incline"
}

export interface TrainingLog {
  run?: ExerciseLog;
  lifts?: {
    seated_leg_press?: ExerciseLog;
    chest_dips?: ExerciseLog;
    pull_ups?: ExerciseLog;
  };
}


// === Dark Sanctum Extended Types ===

// Optional: at top of file or before DayEntry
export type CoreLiftId = "seated_leg_press" | "chest_dips" | "pull_ups";

export interface ExerciseLog {
  rpe: number | null;         // Rate of Perceived Exertion (1–10)
  metric: string;             // e.g., "200 lb x 8" or "45 min @ 1% incline"
}

export interface TrainingLog {
  run?: ExerciseLog;          // For daily run
  lifts?: {
    seated_leg_press?: ExerciseLog;
    chest_dips?: ExerciseLog;
    pull_ups?: ExerciseLog;
  };
}

export interface DayEntry {
  date: string;
  completedHabitIds: string[];
  note?: string;
  mood?: Mood;
  training?: TrainingLog;     // ✅ NEW FIELD
}



export interface DaysState {
  [date: string]: DayEntry;
}

export interface Habit {
  id: string;
  label: string;
  description: string;
}
