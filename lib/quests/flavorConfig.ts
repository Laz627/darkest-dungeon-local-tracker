import { QuestArchetype } from "@/types";

export interface QuestFlavorBank {
  successLines: string[];
  failLines: string[];
  streakSuccessLines: { threshold: number; lines: string[] }[];
  streakFailLines: { threshold: number; lines: string[] }[];
}

export const QUEST_FLAVOR_BANKS: Record<QuestArchetype, QuestFlavorBank> = {
  discipline_pact: {
    successLines: [
      "You turned from temptation and honored the pact. Routine hardens into armor.",
      "The clock struck five and you walked away. Chains of habit loosen slightly.",
    ],
    failLines: [
      "You lingered, and the hours drank your will. The pact wavers.",
      "Work’s shadow stretched long; you did not break free.",
    ],
    streakSuccessLines: [
      {
        threshold: 3,
        lines: [
          "Three days of discipline. Resolve begins to calcify like bone.",
          "The cadence of withdrawal becomes almost musical. A stronger march begins.",
        ],
      },
      {
        threshold: 5,
        lines: [
          "Your will becomes a blade; routine now cuts through resistance.",
          "Five days held. The banners of habit fly higher above the battlements.",
        ],
      },
    ],
    streakFailLines: [
      {
        threshold: 2,
        lines: [
          "Failure breeds failure. Corruption circles like carrion.",
          "Two slips in close succession; the pact’s ink runs thin.",
        ],
      },
    ],
  },
  health_rite: {
    successLines: [
      "The ritual is observed; the body remembers.",
      "Bitter draughts and stretches performed—small wards against decay.",
    ],
    failLines: [
      "Neglect festers quietly beneath the skin.",
      "You set aside the rite; unseen rust creeps in.",
    ],
    streakSuccessLines: [
      {
        threshold: 3,
        lines: [
          "Three rites kept. The flesh whispers its gratitude.",
          "Discipline stacks like bricks; sinew knits stronger.",
        ],
      },
      {
        threshold: 5,
        lines: [
          "Your regimen hums. Resolve rises like steady breath.",
          "Fivefold observance—the body becomes a wardstone.",
        ],
      },
    ],
    streakFailLines: [
      {
        threshold: 2,
        lines: [
          "Neglect twice in close company; malaise prowls the halls.",
          "The rite forgotten again—corruption tastes opportunity.",
        ],
      },
    ],
  },
  recovery_vigil: {
    successLines: [
      "The poison’s hold weakens; your blood runs clearer.",
      "You refused the old vice. The vigil lightened the darkness a shade.",
    ],
    failLines: [
      "You drank of the old poison; the parasite stirs.",
      "A relapse lets corruption lap at the door once more.",
    ],
    streakSuccessLines: [
      {
        threshold: 3,
        lines: [
          "Three nights watched. The craving’s howl grows faint.",
          "Steady abstinence—resolve girds itself anew.",
        ],
      },
      {
        threshold: 5,
        lines: [
          "Five victories; the toxin shrinks to a rumor.",
          "Your resolve today will echo in tomorrow’s battles.",
        ],
      },
    ],
    streakFailLines: [
      {
        threshold: 2,
        lines: [
          "Corruption seeps into your next encounter.",
          "A second lapse beckons darker hungers to the fore.",
        ],
      },
    ],
  },
  custom: {
    successLines: [
      "A small triumph recorded; the path opens slightly.",
      "Today’s work lands true—momentum gathers.",
    ],
    failLines: [
      "A misstep, but the expedition continues.",
      "Setbacks mark the map, yet the torch still burns.",
    ],
    streakSuccessLines: [
      {
        threshold: 3,
        lines: [
          "Three steady marches; the party moves in rhythm.",
          "Consistency sharpens your edge, even on a custom trail.",
        ],
      },
      {
        threshold: 5,
        lines: [
          "Five triumphs align. Fortune favors the deliberate.",
          "The campaign hums with gathered resolve.",
        ],
      },
    ],
    streakFailLines: [
      {
        threshold: 2,
        lines: [
          "A pair of stumbles invite creeping doubts.",
          "Corruption circles close; tighten formation.",
        ],
      },
    ],
  },
};
