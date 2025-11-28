import { Quest, QuestArchetype, QuestType } from "@/types";
import { todayISO } from "@/lib/date";

export interface QuestTemplate {
  id: string;
  title: string;
  slug: string;
  durationDays: number;
  introText: string;
  questType: QuestType;
  archetype: QuestArchetype;
  customPrompt?: string;
}

export const QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: "purge-black-brew",
    title: "The Purge of the Black Brew",
    slug: "purge-of-the-black-brew",
    durationDays: 7,
    introText: "Abstain from the bitter draught and let the nerves settle.",
    questType: "MANUAL",
    archetype: "recovery_vigil",
    customPrompt: "Avoid caffeine and its gnawing whispers today.",
  },
  {
    id: "dawn-pact",
    title: "The Dawn Pact",
    slug: "dawn-pact",
    durationDays: 7,
    introText: "Rise before the sun and greet the day on your own terms.",
    questType: "MANUAL",
    archetype: "discipline_pact",
    customPrompt: "Wake early and seize the morning before work begins.",
  },
  {
    id: "clock-out-covenant",
    title: "Clock-Out Covenant",
    slug: "clock-out-covenant",
    durationDays: 5,
    introText: "End work with the striking clock; step away from the glow.",
    questType: "MANUAL",
    archetype: "discipline_pact",
    customPrompt: "Log off at the appointed hour and leave the desk behind.",
  },
  {
    id: "iron-pill",
    title: "The Iron Pill",
    slug: "the-iron-pill",
    durationDays: 10,
    introText: "Keep the vitamins flowing and stoke the furnace within.",
    questType: "MANUAL",
    archetype: "health_rite",
    customPrompt: "Take a multivitamin to reinforce your defenses.",
  },
  {
    id: "custom-expedition",
    title: "Custom Expedition",
    slug: "custom-expedition",
    durationDays: 7,
    introText: "Name your own path through the dark.",
    questType: "MANUAL",
    archetype: "custom",
  },
];

export function createQuestFromTemplate(
  template: QuestTemplate,
  overrides?: Partial<Pick<Quest, "title" | "archetype" | "durationDays" | "introText" | "customPrompt">>
): Quest {
  const now = todayISO();
  return {
    id: `${template.id}-${now}`,
    title: overrides?.title ?? template.title,
    slug: template.slug,
    status: "ACTIVE",
    startDate: now,
    durationDays: overrides?.durationDays ?? template.durationDays,
    introText: overrides?.introText ?? template.introText,
    epilogues: [],
    questType: template.questType,
    metricConfig: undefined,
    customPrompt: overrides?.customPrompt ?? template.customPrompt,
    labels: {
      vigor: "Vigor",
      resolve: "Resolve",
      corruption: "Corruption",
    },
    archetype: overrides?.archetype ?? template.archetype,
  };
}
