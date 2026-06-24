import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  averageDimensionsFromSessions,
  buildActivityHeatmap,
  calculateStreak,
  calculateTrend,
  findWeakestTopic,
  getGreeting,
  getRangeStart,
  MILESTONE_DEFINITIONS,
  pickQuote,
  type DateRange,
} from "@/lib/progress-metrics";
import connectDB from "@/lib/mongodb";
import CodingProblem from "@/models/CodingProblem";
import CodingSubmission from "@/models/CodingSubmission";
import InterviewSession from "@/models/InterviewSession";
import Resume from "@/models/Resume";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = (searchParams.get("range") ?? "30d") as DateRange;
    const rangeStart = getRangeStart(range);

    await connectDB();

    const [user, allSessions, codingSubmissions, resume] = await Promise.all([
      User.findById(session.user.id).lean(),
      InterviewSession.find({ userId: session.user.id })
        .sort({ startedAt: -1 })
        .lean(),
      CodingSubmission.find({
        userId: session.user.id,
        status: "accepted",
      }).lean(),
      Resume.findOne({ userId: session.user.id })
        .sort({ analyzedAt: -1 })
        .lean(),
    ]);

    const completedSessions = allSessions.filter(
      (s) => s.status === "completed"
    );

    const filteredSessions = rangeStart
      ? completedSessions.filter((s) => {
          const date = s.completedAt ?? s.startedAt;
          return date && new Date(date) >= rangeStart;
        })
      : completedSessions;

    const previousStart = rangeStart
      ? new Date(rangeStart.getTime() - (Date.now() - rangeStart.getTime()))
      : null;
    const previousSessions =
      rangeStart && previousStart
        ? completedSessions.filter((s) => {
            const date = s.completedAt ?? s.startedAt;
            if (!date) return false;
            const d = new Date(date);
            return d >= previousStart && d < rangeStart;
          })
        : [];

    const avgScore =
      filteredSessions.length > 0
        ? Math.round(
            filteredSessions.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) /
              filteredSessions.length
          )
        : user?.averageScore ?? 0;

    const prevAvgScore =
      previousSessions.length > 0
        ? Math.round(
            previousSessions.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) /
              previousSessions.length
          )
        : 0;

    const streak = calculateStreak(completedSessions);
    const codingSolved = new Set(
      codingSubmissions.map((s) => s.problemId.toString())
    ).size;

    const categoryMap = new Map<string, { total: number; count: number }>();
    for (const s of filteredSessions) {
      const entry = categoryMap.get(s.category) ?? { total: 0, count: 0 };
      entry.total += s.overallScore ?? 0;
      entry.count += 1;
      categoryMap.set(s.category, entry);
    }

    const categoryBreakdown = Array.from(categoryMap.entries()).map(
      ([category, { total, count }]) => ({
        category,
        avgScore: Math.round(total / count),
        count,
      })
    );

    const dimensionAverages = averageDimensionsFromSessions(filteredSessions);
    const weakestTopic = findWeakestTopic(categoryBreakdown);

    const scoreOverTime = [...filteredSessions]
      .reverse()
      .map((s) => ({
        date: (s.completedAt ?? s.startedAt)?.toISOString().slice(0, 10) ?? "",
        overall: s.overallScore ?? 0,
        technical: s.dimensionScores?.technicalAccuracy ?? 0,
        communication: s.dimensionScores?.communication ?? 0,
        sessionId: s._id.toString(),
        category: s.category,
      }));

    const firstSession = completedSessions[completedSessions.length - 1];
    const latestSession = completedSessions[0];
    const bestSession = [...completedSessions].sort(
      (a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0)
    )[0];

    const dimensionComparison = {
      first: firstSession?.dimensionScores ?? dimensionAverages,
      latest: latestSession?.dimensionScores ?? dimensionAverages,
      best: bestSession?.dimensionScores ?? dimensionAverages,
    };

    const codingByDifficulty = { easy: 0, medium: 0, hard: 0 };
    const codingByLanguage = new Map<string, number>();
    const codingOverTime = new Map<string, number>();

    const solvedProblemIds = Array.from(
      new Set(codingSubmissions.map((s) => s.problemId.toString()))
    );
    const solvedProblems = solvedProblemIds.length
      ? await CodingProblem.find({ _id: { $in: solvedProblemIds } })
          .select("difficulty")
          .lean()
      : [];

    for (const problem of solvedProblems) {
      const diff = problem.difficulty as "easy" | "medium" | "hard";
      if (diff in codingByDifficulty) codingByDifficulty[diff] += 1;
    }

    for (const sub of codingSubmissions) {
      const date = sub.submittedAt
        ? new Date(sub.submittedAt).toISOString().slice(0, 10)
        : "";
      if (date) {
        codingOverTime.set(date, (codingOverTime.get(date) ?? 0) + 1);
      }
      codingByLanguage.set(
        sub.language,
        (codingByLanguage.get(sub.language) ?? 0) + 1
      );
    }

    const milestones = MILESTONE_DEFINITIONS.map((m) => {
      let achieved = false;
      if ("minInterviews" in m && m.minInterviews) {
        achieved = completedSessions.length >= m.minInterviews;
      }
      if ("requiresPerfect" in m && m.requiresPerfect) {
        achieved = completedSessions.some((s) => (s.overallScore ?? 0) >= 95);
      }
      if ("minCoding" in m && m.minCoding) {
        achieved = codingSolved >= m.minCoding;
      }
      if ("minStreak" in m && m.minStreak) {
        achieved = streak >= m.minStreak;
      }
      return { id: m.id, title: m.title, achieved };
    });

    const lastIncomplete = allSessions.find(
      (s) => s.status === "in-progress" || s.status === "pending"
    );

    return NextResponse.json({
      greeting: getGreeting(),
      quote: pickQuote(completedSessions.length),
      user: {
        name: user?.name ?? session.user.name ?? "Candidate",
        totalInterviews: user?.totalInterviews ?? completedSessions.length,
        averageScore: user?.averageScore ?? avgScore,
      },
      stats: {
        totalInterviews: completedSessions.length,
        interviewTrend: calculateTrend(
          filteredSessions.length,
          previousSessions.length
        ),
        averageScore: avgScore,
        scoreTrend: calculateTrend(avgScore, prevAvgScore),
        codingSolved,
        codingTrend: 0,
        streak,
      },
      lastIncompleteSession: lastIncomplete
        ? {
            id: lastIncomplete._id.toString(),
            category: lastIncomplete.category,
            interviewType: lastIncomplete.interviewType,
            status: lastIncomplete.status,
            startedAt: lastIncomplete.startedAt,
          }
        : null,
      recentSessions: completedSessions.slice(0, 5).map((s) => ({
        id: s._id.toString(),
        category: s.category,
        interviewType: s.interviewType,
        overallScore: s.overallScore ?? 0,
        completedAt: s.completedAt,
        startedAt: s.startedAt,
      })),
      dimensionAverages,
      weakestTopic,
      resumeScore: resume?.overallScore ?? null,
      activityHeatmap: buildActivityHeatmap(completedSessions, 30),
      scoreOverTime,
      categoryBreakdown,
      dimensionComparison,
      codingProgress: {
        byDifficulty: codingByDifficulty,
        overTime: Array.from(codingOverTime.entries()).map(([date, count]) => ({
          date,
          count,
        })),
        byLanguage: Array.from(codingByLanguage.entries()).map(
          ([language, count]) => ({ language, count })
        ),
        totalSolved: codingSolved,
      },
      milestones,
    });
  } catch (error) {
    console.error("Progress API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress data" },
      { status: 500 }
    );
  }
}
