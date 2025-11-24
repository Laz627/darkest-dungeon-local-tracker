export interface BossFight {
  name: string;
  lore: string; // static flavor text about the boss
  description: string; // dynamic outcome text for the current week
  difficulty: number;
  outcome: "win" | "loss" | "draw";
}

const BOSSES = [
  {
    name: "The Auditor of Chaos",
    diff: 1,
    lore:
      "An emaciated clerk hunched over endless ledgers, tallying every unfinished task as a debt you will one day pay.",
  },
  {
    name: "The Whispering Shade",
    diff: 2,
    lore:
      "A formless murmur that slips between thoughts, amplifying doubt and inviting you to trade focus for easy comforts.",
  },
  {
    name: "The Brass Warden",
    diff: 3,
    lore:
      "A towering sentinel of burnished metal, sworn to guard every rigid routine and punish any deviation from the plan.",
  },
  {
    name: "The Overgrowth Titan",
    diff: 4,
    lore:
      "A hulking mass of roots and wreckage, born of every neglected chore and deferred repair, now blocking the road ahead.",
  },
  {
    name: "The Hollow King",
    diff: 5,
    lore:
      "A crowned skeleton of old ambitions, ruling a kingdom of abandoned goals with a scepter of withered ‘somedays.’",
  },
  {
    name: "The Clockwork Jailer",
    diff: 3,
    lore:
      "A gaoler forged of gears and ticking chains, locking you into loops of distraction and stale routines.",
  },
  {
    name: "The Ashen Witness",
    diff: 2,
    lore:
      "A silent figure cloaked in soot, recording each day’s small betrayals of your better self in a book of cinders.",
  },
  {
    name: "The Gilded Parasite",
    diff: 4,
    lore:
      "A radiant leech that feeds on idle scrolling and cheap pleasures, growing fat on every hour you meant to use well.",
  },
];

function hashToFloat(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  const normalized = (h >>> 0) / 0xffffffff;
  return normalized;
}

export function generateBossFight(
  weekId: string,
  weeklyScore: number
): BossFight {
  // Deterministic boss for the given week
  const bossIndex = Math.floor(hashToFloat(weekId) * BOSSES.length);
  const baseBoss = BOSSES[bossIndex];
  const difficulty = Math.min(Math.max(baseBoss.diff, 1), 5);

  // Clamp weekly score for stability
  const score = Math.min(Math.max(weeklyScore, 0), 21);
  const rng = hashToFloat(weekId + "|" + score.toString());

  let outcome: "win" | "loss" | "draw";
  if (rng + score / 24 > 0.7) {
    outcome = "win";
  } else if (rng + score / 30 < 0.3) {
    outcome = "loss";
  } else {
    outcome = "draw";
  }

  const description = {
    win: "Your resolve outmatched the threat. The week closes with a quiet, earned victory.",
    loss: "The boss proved too much this time. Yet even defeat carves hard-won lessons.",
    draw: "Neither side claimed clear dominance. The struggle itself forges tempered steel.",
  }[outcome];

  return {
    name: baseBoss.name,
    lore: baseBoss.lore,
    description,
    difficulty,
    outcome,
  };
}
