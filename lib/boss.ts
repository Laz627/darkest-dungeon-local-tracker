export interface BossFight {
  name: string;
  difficulty: number;
  description: string;
}
export function generateBossFight(weekKey: string, score: number): BossFight {
  const tier = score >= 40 ? "Eldritch Overlord" : score >= 25 ? "Grim Captain" : "Wayward Shade";
  const description =
    tier === "Eldritch Overlord"
      ? "A towering force awaits, feeding on momentum."
      : tier === "Grim Captain"
      ? "A disciplined foe testing your resolve."
      : "A drifting specter feeding on neglect.";
  return { name: tier, difficulty: score, description };
}