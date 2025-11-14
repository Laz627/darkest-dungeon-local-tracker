export type Mood =
  | "stalwart"
  | "wavering"
  | "resilient"
  | "fractured"
  | "quiet"
  | "overclocked"
  | "unburdened";

export interface DayEntry {
  date: string;
  completedHabitIds: string[];
  note?: string;
  mood?: Mood;
}

export interface DaysState {
  [date: string]: DayEntry;
}

export interface Habit {
  id: string;
  label: string;
  description: string;
}
