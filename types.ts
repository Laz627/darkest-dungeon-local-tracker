export interface Habit { id: string; label: string; description: string; }
export interface DayEntry { date: string; completedHabitIds: string[]; note?: string; }
export type DaysState = Record<string, DayEntry>;