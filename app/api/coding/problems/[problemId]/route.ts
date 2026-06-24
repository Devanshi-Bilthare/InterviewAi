import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import CodingProblem from "@/models/CodingProblem";
import CodingSubmission from "@/models/CodingSubmission";

export async function GET(
  _request: Request,
  { params }: { params: { problemId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const problem = await CodingProblem.findById(params.problemId).lean();
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const submissions = await CodingSubmission.find({
      userId: session.user.id,
      problemId: params.problemId,
    })
      .sort({ submittedAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({
      problem: {
        id: problem._id.toString(),
        problemNumber: problem.problemNumber,
        title: problem.title,
        description: problem.description,
        category: problem.category,
        difficulty: problem.difficulty,
        examples: problem.examples,
        constraints: problem.constraints,
        hints: problem.hints,
        tags: problem.tags,
        starterCode: problem.starterCode,
        acceptanceRate: problem.acceptanceRate ?? 0,
        totalSubmissions: problem.totalSubmissions,
        sampleTestCount: problem.testCases.filter(
          (tc: { isHidden: boolean }) => !tc.isHidden
        ).length,
      },
      submissions: submissions.map((s) => ({
        id: s._id.toString(),
        language: s.language,
        status: s.status,
        passedTestCases: s.passedTestCases,
        totalTestCases: s.totalTestCases,
        executionTime: s.executionTime,
        memoryUsed: s.memoryUsed,
        submittedAt: s.submittedAt,
      })),
    });
  } catch (error) {
    console.error("Fetch problem error:", error);
    return NextResponse.json(
      { error: "Failed to fetch problem" },
      { status: 500 }
    );
  }
}
