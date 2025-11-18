import { Mood } from "@/types";

const TITLES: Record<Mood, string[]> = {
  stalwart: [
    "The Day of Firm Resolve",
    "The Iron March",
    "The Stalwart Advance",
  ],
  wavering: [
    "The Uncertain Step",
    "The Trembling Balance",
    "The Wavering Path",
  ],
  resilient: [
    "The Day of Quiet Endurance",
    "The Resilient Push",
    "The Steady Ascent",
  ],
  fractured: [
    "The Fractured Hour",
    "A Day of Thin Light",
    "The Broken Lantern",
  ],
  quiet: [
    "A Day of Soft Discipline",
    "The Quiet March",
    "The Still-Water Path",
  ],
  overclocked: [
    "The Overzealous Stride",
    "The Burning Wick",
    "The Overclocked Gambit",
  ],
  unburdened: [
    "The Gentle Respite",
    "An Unburdened Pause",
    "The Lightened Dawn",
  ],
};

function seededIndex(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++)
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;

  return h % mod;
}

export function getDailyTitle(mood: Mood, completedCount: number, seed: string) {
  const list = TITLES[mood] || TITLES.quiet;
  return list[seededIndex(seed, list.length)];
}

export function getNarratorLine(completedCount: number): string {
  if (completedCount === 0)
    return "The dungeon remains unexplored today. Even heroes need days to simply exist.";
  if (completedCount === 1)
    return "A single encounter faced. A small torch still pushes back the dark.";
  if (completedCount <= 3)
    return "Steel met shadow more than once. Imperfect, but undeniably forward.";
  if (completedCount <= 8)
    return "A measured assault on the day’s chaos. The hero paces himself wisely.";

  return "Every corridor cleared, every challenge met. Beware only of burning the wick too low.";
}
