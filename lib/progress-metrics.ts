import type { DimensionScores } from "@/types";
import { averageDimensionScores } from "@/lib/interview-scores";

export type DateRange = "7d" | "30d" | "90d" | "all";

export function getRangeStart(range: DateRange): Date | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days);
  return start;
}

export function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export const MOTIVATIONAL_QUOTES = [
  "Every mock interview is one step closer to your dream offer.",
  "Consistency beats intensity — show up today.",
  "Your next interview is your best interview.",
  "Great engineers are made in practice, not in theory.",
  "Small daily improvements lead to stunning results.",
  "Confidence is built one answer at a time.",
];

export function pickQuote(seed: number): string {
  return MOTIVATIONAL_QUOTES[seed % MOTIVATIONAL_QUOTES.length];
}

interface SessionLike {
  completedAt?: Date | string | null;
  startedAt?: Date | string | null;
  overallScore?: number | null;
}

export function calculateStreak(sessions: SessionLike[]): number {
  const completedDays = new Set<string>();

  for (const session of sessions) {
    const date = session.completedAt ?? session.startedAt;
    if (!date) continue;
    completedDays.add(formatDateKey(new Date(date)));
  }

  if (completedDays.size === 0) return 0;

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (completedDays.has(formatDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function calculateTrend(
  current: number,
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function findWeakestTopic(
  breakdown: Array<{ category: string; avgScore: number }>
): { category: string; score: number } | null {
  if (breakdown.length === 0) return null;
  const weakest = breakdown.reduce((min, item) =>
    item.avgScore < min.avgScore ? item : min
  );
  return { category: weakest.category, score: weakest.avgScore };
}

export function buildActivityHeatmap(
  sessions: Array<{
    completedAt?: Date | string | null;
    overallScore?: number | null;
  }>,
  days = 30
) {
  const map = new Map<string, { count: number; totalScore: number }>();

  for (const session of sessions) {
    if (!session.completedAt) continue;
    const key = formatDateKey(new Date(session.completedAt));
    const entry = map.get(key) ?? { count: 0, totalScore: 0 };
    entry.count += 1;
    entry.totalScore += session.overallScore ?? 0;
    map.set(key, entry);
  }

  const result: Array<{
    date: string;
    count: number;
    avgScore: number;
  }> = [];

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() - (days - 1));

  for (let i = 0; i < days; i += 1) {
    const key = formatDateKey(cursor);
    const entry = map.get(key);
    result.push({
      date: key,
      count: entry?.count ?? 0,
      avgScore: entry ? Math.round(entry.totalScore / entry.count) : 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

export function averageDimensionsFromSessions(
  sessions: Array<{ dimensionScores?: DimensionScores | null }>
): DimensionScores {
  const scores = sessions
    .map((s) => s.dimensionScores)
    .filter((d): d is DimensionScores => Boolean(d));
  return averageDimensionScores(scores);
}

export const MILESTONE_DEFINITIONS = [
  { id: "first-interview", title: "First Interview", minInterviews: 1 },
  { id: "five-interviews", title: "5 Interviews", minInterviews: 5 },
  { id: "ten-interviews", title: "10 Interviews", minInterviews: 10 },
  { id: "perfect-score", title: "Perfect Score", requiresPerfect: true },
  { id: "coding-starter", title: "First Problem Solved", minCoding: 1 },
  { id: "week-streak", title: "7-Day Streak", minStreak: 7 },
] as const;
