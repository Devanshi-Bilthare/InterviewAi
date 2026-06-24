import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import connectDB from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";
import User from "@/models/User";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [
      userCount,
      newUsersThisMonth,
      completedInterviews,
      avgScoreResult,
      activeToday,
      monthlyRegistrations,
      interviewsByCategory,
      scoreTrend,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments({ isSuspended: { $ne: true } }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      InterviewSession.countDocuments({ status: "completed" }),
      InterviewSession.aggregate([
        { $match: { status: "completed", overallScore: { $exists: true } } },
        { $group: { _id: null, avg: { $avg: "$overallScore" } } },
      ]),
      InterviewSession.distinct("userId", {
        $or: [
          { startedAt: { $gte: startOfToday } },
          { completedAt: { $gte: startOfToday } },
        ],
      }),
      User.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      InterviewSession.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      InterviewSession.aggregate([
        {
          $match: {
            status: "completed",
            overallScore: { $exists: true },
            completedAt: { $gte: twelveMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$completedAt" },
              month: { $month: "$completedAt" },
            },
            avgScore: { $avg: "$overallScore" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      InterviewSession.find({ status: "completed" })
        .sort({ completedAt: -1 })
        .limit(10)
        .populate("userId", "name email")
        .lean(),
    ]);

    const monthLabels = buildMonthLabels(12);
    const registrationMap = new Map(
      monthlyRegistrations.map(
        (m: { _id: { year: number; month: number }; count: number }) => [
          `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
          m.count,
        ]
      )
    );

    const scoreMap = new Map(
      scoreTrend.map(
        (m: {
          _id: { year: number; month: number };
          avgScore: number;
          count: number;
        }) => [
          `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
          { avgScore: Math.round(m.avgScore), count: m.count },
        ]
      )
    );

    return NextResponse.json({
      stats: {
        userCount,
        newUsersThisMonth,
        interviewCount: completedInterviews,
        avgPlatformScore: Math.round(avgScoreResult[0]?.avg ?? 0),
        activeUsersToday: activeToday.length,
      },
      monthlyRegistrations: monthLabels.map((label) => ({
        month: label,
        users: registrationMap.get(label) ?? 0,
      })),
      interviewsByCategory: interviewsByCategory.map(
        (c: { _id: string; count: number }) => ({
          category: c._id,
          count: c.count,
        })
      ),
      scoreTrend: monthLabels.map((label) => ({
        month: label,
        avgScore: scoreMap.get(label)?.avgScore ?? 0,
        interviews: scoreMap.get(label)?.count ?? 0,
      })),
      recentActivity: recentActivity.map((s) => {
        const user = s.userId as { _id?: { toString(): string }; name?: string; email?: string } | null;
        return {
          sessionId: s._id.toString(),
          userName: user?.name ?? "Unknown",
          userEmail: user?.email ?? "",
          category: s.category,
          score: s.overallScore ?? 0,
          completedAt: s.completedAt,
        };
      }),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}

function buildMonthLabels(months: number): string[] {
  const labels: string[] = [];
  const cursor = new Date();
  cursor.setDate(1);
  cursor.setMonth(cursor.getMonth() - (months - 1));

  for (let i = 0; i < months; i += 1) {
    labels.push(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`
    );
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return labels;
}
