const FLAVORS = {
  calm: ["The air feels still today.", "A quiet dusk settles."],
  stressed: ["A weight rides on your shoulders.", "Shadows cling a bit too long."],
  neutral: ["Another day, another small step forward."],
};
export function computeMood(entry) {
  const c = entry.completedHabitIds.length;
  if (c >= 8) return "calm";
  if (c <= 2) return "stressed";
  return "neutral";
}
export function moodLabel(mood: string): string {
  return mood === "calm"
    ? "Calm"
    : mood === "stressed"
    ? "Stressed"
    : "Steady";
}
export function dailyFlavor(mood: string, completed: number): string {
  const pool = FLAVORS[mood] ?? FLAVORS.neutral;
  return pool[completed % pool.length];
}