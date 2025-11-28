import { QUEST_FLAVOR_BANKS } from "@/lib/quests/flavorConfig";
import {
  Quest,
  QuestArchetype,
  QuestDay,
  QuestDayStatus,
  QuestType,
} from "@/types";

export interface QuestStreakStats {
  currentSuccessStreak: number;
  recentFailCount: number;
}

export interface QuestSummaryStats extends QuestStreakStats {
  totalSuccesses: number;
  totalFails: number;
}

function sortQuestDays(questDays: QuestDay[]): QuestDay[] {
  return [...questDays].sort((a, b) => a.dayIndex - b.dayIndex);
}

function getRecentNonPendingDays(questDays: QuestDay[]): QuestDay[] {
  return sortQuestDays(questDays).filter((d) => d.status !== "PENDING");
}

export function computeQuestStreakStats(
  _quest: Quest,
  questDays: QuestDay[]
): QuestStreakStats {
  const loggedDays = getRecentNonPendingDays(questDays);
  let currentSuccessStreak = 0;

  for (let i = loggedDays.length - 1; i >= 0; i--) {
    const day = loggedDays[i];
    if (day.status === "SUCCESS") {
      currentSuccessStreak += 1;
    } else {
      break;
    }
  }

  const window = loggedDays.slice(-3);
  const recentFailCount = window.filter((d) => d.status === "FAIL").length;

  return { currentSuccessStreak, recentFailCount };
}

export function computeQuestSummary(
  quest: Quest,
  questDays: QuestDay[]
): QuestSummaryStats {
  const filtered = questDays.filter((d) => d.questId === quest.id);
  const { currentSuccessStreak, recentFailCount } = computeQuestStreakStats(
    quest,
    filtered
  );

  const totalSuccesses = filtered.filter((d) => d.status === "SUCCESS").length;
  const totalFails = filtered.filter((d) => d.status === "FAIL").length;

  return { currentSuccessStreak, recentFailCount, totalSuccesses, totalFails };
}

function pickRandom<T>(arr: T[]): T | undefined {
  if (!arr.length) return undefined;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

function pickFlavorLine(
  archetype: QuestArchetype,
  status: QuestDayStatus,
  stats: QuestStreakStats
): string | undefined {
  const bank = QUEST_FLAVOR_BANKS[archetype] ?? QUEST_FLAVOR_BANKS.custom;

  if (status === "SUCCESS") {
    const newStreak = stats.currentSuccessStreak + 1;
    const streakBucket = bank.streakSuccessLines.find(
      (bucket) => bucket.threshold === newStreak
    );
    if (streakBucket) return pickRandom(streakBucket.lines);
    return pickRandom(bank.successLines);
  }

  if (status === "FAIL") {
    const updatedFailCount = stats.recentFailCount + 1;
    const streakBucket = bank.streakFailLines.find(
      (bucket) => updatedFailCount >= bucket.threshold
    );
    if (streakBucket) return pickRandom(streakBucket.lines);
    return pickRandom(bank.failLines);
  }

  if (status === "SKIPPED") {
    return "The day passed in uneasy quiet.";
  }

  return undefined;
}

export function buildQuestNarrative(
  quest: Quest,
  questDays: QuestDay[],
  status: QuestDayStatus
): string | undefined {
  const stats = computeQuestStreakStats(quest, questDays);
  const archetype: QuestArchetype = quest.archetype ?? "custom";
  return pickFlavorLine(archetype, status, stats);
}

export function resolveQuestDeltas(
  status: QuestDayStatus,
  stats: QuestStreakStats
): Pick<QuestDay, "vigorDelta" | "resolveDelta" | "corruptionDelta"> {
  if (status === "SUCCESS") {
    const newStreak = stats.currentSuccessStreak + 1;
    const resolveDelta = newStreak >= 3 ? 1 : 0;
    return { vigorDelta: 1, resolveDelta, corruptionDelta: 0 };
  }

  if (status === "FAIL") {
    return { vigorDelta: 0, resolveDelta: 0, corruptionDelta: 1 };
  }

  return { vigorDelta: 0, resolveDelta: 0, corruptionDelta: 0 };
}

export function getQuestDayIndex(quest: Quest, date: string): number {
  const start = new Date(quest.startDate + "T00:00:00");
  const target = new Date(date + "T00:00:00");
  const diff = target.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function upsertQuestDay(
  quest: Quest,
  questDays: QuestDay[],
  day: Omit<QuestDay, "dayIndex"> & { date: string }
): QuestDay[] {
  const dayIndex = getQuestDayIndex(quest, day.date);
  const existingIdx = questDays.findIndex(
    (d) => d.questId === quest.id && d.date === day.date
  );

  const newEntry: QuestDay = { ...day, dayIndex, questId: quest.id };

  if (existingIdx >= 0) {
    const copy = [...questDays];
    copy[existingIdx] = newEntry;
    return copy;
  }

  return [...questDays, newEntry];
}

export function isQuestCompleted(quest: Quest, questDays: QuestDay[]): boolean {
  const lastIndexLogged = Math.max(
    ...questDays
      .filter((d) => d.questId === quest.id)
      .map((d) => d.dayIndex),
    -1
  );
  return lastIndexLogged + 1 >= quest.durationDays;
}

export function getQuestProgressLabel(quest: Quest, questDays: QuestDay[]): string {
  const dayIndex = Math.min(
    getQuestDayIndex(quest, new Date().toISOString().slice(0, 10)),
    quest.durationDays - 1
  );
  const displayDay = Math.min(dayIndex + 1, quest.durationDays);
  return `Day ${displayDay} of ${quest.durationDays}`;
}

export function getQuestOutcomeCounts(quest: Quest, questDays: QuestDay[]) {
  const days = questDays.filter((d) => d.questId === quest.id);
  return {
    successes: days.filter((d) => d.status === "SUCCESS").length,
    fails: days.filter((d) => d.status === "FAIL").length,
  };
}

export function questTypeLabel(type: QuestType): string {
  if (type === "METRIC") return "Metric";
  return "Manual";
}
