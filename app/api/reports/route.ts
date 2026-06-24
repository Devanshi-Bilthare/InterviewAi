import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { generateGeminiJSON } from "@/lib/gemini";
import connectDB from "@/lib/mongodb";
import {
  reportReadyEmail,
  sendEmail,
} from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import InterviewSession from "@/models/InterviewSession";
import Report from "@/models/Report";
import User from "@/models/User";

const reportResponseSchema = z.object({
  overallAssessment: z.string(),
  strengths: z.array(z.string()).default([]),
  areasToImprove: z.array(z.string()).default([]),
  recommendedSkills: z
    .array(
      z.object({
        skill: z.string(),
        priority: z.string(),
        reason: z.string(),
      })
    )
    .default([]),
  recommendedProjects: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        skills: z.array(z.string()).default([]),
      })
    )
    .default([]),
  thirtyDayRoadmap: z
    .array(
      z.object({
        week: z.number(),
        focus: z.string(),
        tasks: z.array(z.string()).default([]),
      })
    )
    .default([]),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const reports = await Report.find({ userId: session.user.id })
      .sort({ generatedAt: -1 })
      .lean();

    const completedCount = await InterviewSession.countDocuments({
      userId: session.user.id,
      status: "completed",
    });

    const lastReport = reports[0];
    const interviewsSinceLastReport = lastReport
      ? await InterviewSession.countDocuments({
          userId: session.user.id,
          status: "completed",
          completedAt: { $gt: lastReport.generatedAt },
        })
      : completedCount;

    return NextResponse.json({
      reports: reports.map((r) => ({
        id: r._id.toString(),
        reportType: r.reportType,
        overallAssessment: r.overallAssessment,
        strengths: r.strengths,
        areasToImprove: r.areasToImprove,
        recommendedSkills: r.recommendedSkills,
        recommendedProjects: r.recommendedProjects,
        thirtyDayRoadmap: r.thirtyDayRoadmap,
        interviewsAnalyzed: r.interviewsAnalyzed,
        averageScore: r.averageScore,
        generatedAt: r.generatedAt,
      })),
      canGenerate: interviewsSinceLastReport >= 10 || reports.length === 0,
      interviewsSinceLastReport,
      completedInterviews: completedCount,
    });
  } catch (error) {
    console.error("Reports fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const lastReport = await Report.findOne({ userId: session.user.id }).sort({
      generatedAt: -1,
    });

    const sessionFilter: Record<string, unknown> = {
      userId: session.user.id,
      status: "completed",
    };

    if (lastReport?.generatedAt) {
      sessionFilter.completedAt = { $gt: lastReport.generatedAt };
    }

    const sessions = await InterviewSession.find(sessionFilter)
      .sort({ completedAt: -1 })
      .lean();

    if (sessions.length === 0 && lastReport) {
      return NextResponse.json(
        { error: "Complete at least one new interview before generating a report" },
        { status: 400 }
      );
    }

    const allSessions =
      sessions.length > 0
        ? sessions
        : await InterviewSession.find({
            userId: session.user.id,
            status: "completed",
          })
            .sort({ completedAt: -1 })
            .limit(20)
            .lean();

    const avgScore =
      allSessions.length > 0
        ? Math.round(
            allSessions.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) /
              allSessions.length
          )
        : 0;

    const summary = allSessions
      .map(
        (s) =>
          `- ${s.category} (${s.interviewType}): score ${s.overallScore ?? 0}, dimensions: ${JSON.stringify(s.dimensionScores ?? {})}`
      )
      .join("\n");

    const prompt = `Generate a career development report for a candidate based on these mock interview results:

${summary}

Average score: ${avgScore}
Total sessions analyzed: ${allSessions.length}

Return JSON:
{
  "overallAssessment": "2-3 paragraph assessment",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areasToImprove": ["area 1", "area 2"],
  "recommendedSkills": [{ "skill": "...", "priority": "high|medium|low", "reason": "..." }],
  "recommendedProjects": [{ "title": "...", "description": "...", "skills": ["..."] }],
  "thirtyDayRoadmap": [{ "week": 1, "focus": "...", "tasks": ["..."] }]
}`;

    const geminiResult = await generateGeminiJSON<unknown>(prompt);
    const validated = reportResponseSchema.safeParse(geminiResult);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Failed to generate report" },
        { status: 500 }
      );
    }

    const report = await Report.create({
      userId: session.user.id,
      reportType: allSessions.length >= 10 ? "milestone" : "weekly",
      overallAssessment: validated.data.overallAssessment,
      strengths: validated.data.strengths,
      areasToImprove: validated.data.areasToImprove,
      recommendedSkills: validated.data.recommendedSkills,
      recommendedProjects: validated.data.recommendedProjects,
      thirtyDayRoadmap: validated.data.thirtyDayRoadmap,
      interviewsAnalyzed: allSessions.length,
      averageScore: avgScore,
      generatedAt: new Date(),
    });

    const user = await User.findById(session.user.id);
    if (user) {
      const emailContent = reportReadyEmail(user.name);
      await sendEmail({ to: user.email, ...emailContent });
      await createNotification({
        userId: session.user.id,
        type: "report",
        title: "Career Report Ready",
        message: "Your personalized career development report is ready to view.",
        link: "/reports",
      });
    }

    return NextResponse.json({
      report: {
        id: report._id.toString(),
        reportType: report.reportType,
        overallAssessment: report.overallAssessment,
        strengths: report.strengths,
        areasToImprove: report.areasToImprove,
        recommendedSkills: report.recommendedSkills,
        recommendedProjects: report.recommendedProjects,
        thirtyDayRoadmap: report.thirtyDayRoadmap,
        interviewsAnalyzed: report.interviewsAnalyzed,
        averageScore: report.averageScore,
        generatedAt: report.generatedAt,
      },
    });
  } catch (error) {
    console.error("Report generate error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate report",
      },
      { status: 500 }
    );
  }
}
