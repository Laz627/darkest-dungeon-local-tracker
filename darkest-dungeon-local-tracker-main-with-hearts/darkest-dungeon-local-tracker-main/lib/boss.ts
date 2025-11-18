export interface BossFight {
  name: string;
  description: string;
  difficulty: number;
  outcome: "win" | "loss" | "draw";
}

const BOSSES = [
  { name: "The Auditor of Chaos", diff: 1 },
  { name: "The Whispering Shade", diff: 2 },
  { name: "The Brass Warden", diff: 3 },
  { name: "The Overgrowth Titan", diff: 4 },
  { name: "The Hollow King", diff: 5 },
  { name: "The Clockwork Jailer", diff: 3 },
  { name: "The Ashen Witness", diff: 2 },
  { name: "The Gilded Parasite", diff: 4 },
];

function hashToFloat(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++)
    h = (h * 31 + input.charCodeAt(i)) >>> 0;

  return (h % 10000) / 10000;
}

/**
 * weekId: YYYY-MM-DD (Monday)
 * weeklyScore: total habits completed in last 7 days
 */
export function generateBossFight(
  weekId: string,
  weeklyScore: number
): BossFight {
  const bossIndex = Math.floor(hashToFloat(weekId) * BOSSES.length);

  const baseBoss = BOSSES[bossIndex];
  const difficulty = Math.min(Math.max(baseBoss.diff, 1), 5);

  const score = Math.min(Math.max(weeklyScore, 0), 15);
  const rng = hashToFloat(weekId + "|" + score.toString());

  let outcome: "win" | "loss" | "draw";

  if (rng + score / 20 > 0.7) outcome = "win";
  else if (rng + score / 30 < 0.3) outcome = "loss";
  else outcome = "draw";

  const description = {
    win: "Your resolve outmatched the threat. The week closes with a quiet, earned victory.",
    loss: "The boss proved too much this time. Yet even defeat carves hard-won lessons.",
    draw: "Neither side claimed clear dominance. The struggle itself forges tempered steel.",
  }[outcome];

  return {
    name: baseBoss.name,
    description,
    difficulty,
    outcome,
  };
}
