import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { executeWithTestCases } from "@/lib/judge0";
import connectDB from "@/lib/mongodb";
import { submitCodeSchema } from "@/lib/validations/coding";
import CodingProblem from "@/models/CodingProblem";
import CodingSubmission from "@/models/CodingSubmission";
import type { SubmissionStatus } from "@/types";

function deriveSubmissionStatus(
  passed: number,
  total: number,
  results: Array<{ status: string }>
): SubmissionStatus {
  if (passed === total && total > 0) return "accepted";
  if (results.some((r) => r.status === "time-limit")) return "time-limit";
  if (
    results.some(
      (r) => r.status === "runtime-error" || r.status === "compilation-error"
    )
  ) {
    return "runtime-error";
  }
  return "wrong-answer";
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = submitCodeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { code, language, problemId } = parsed.data;

    await connectDB();

    const problem = await CodingProblem.findById(problemId);
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const testCases = problem.testCases.map(
      (tc: { input: string; expectedOutput: string; isHidden: boolean }) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden,
      })
    );

    const results = await executeWithTestCases(code, language, testCases);

    const passedCases = results.filter((r) => r.passed).length;
    const totalCases = results.length;
    const status = deriveSubmissionStatus(passedCases, totalCases, results);
    const maxTime = Math.max(...results.map((r) => r.executionTime), 0);
    const maxMemory = Math.max(...results.map((r) => r.memory), 0);

    await CodingSubmission.create({
      userId: session.user.id,
      problemId,
      code,
      language,
      status,
      passedTestCases: passedCases,
      totalTestCases: totalCases,
      executionTime: maxTime,
      memoryUsed: maxMemory,
      submittedAt: new Date(),
    });

    const newTotalSubmissions = problem.totalSubmissions + 1;
    const previousAccepted = problem.acceptanceRate
      ? Math.round((problem.acceptanceRate / 100) * problem.totalSubmissions)
      : 0;
    const newAccepted =
      status === "accepted" ? previousAccepted + 1 : previousAccepted;
    const acceptanceRate = Math.round(
      (newAccepted / newTotalSubmissions) * 100
    );

    await CodingProblem.findByIdAndUpdate(problemId, {
      totalSubmissions: newTotalSubmissions,
      acceptanceRate,
    });

    return NextResponse.json({
      status,
      passedCases,
      totalCases,
      executionTime: maxTime,
      memory: maxMemory,
      results: results.map((r, index) => ({
        caseNumber: index + 1,
        passed: r.passed,
        status: r.status,
        stdout: testCases[index]?.isHidden ? undefined : r.stdout,
        stderr: r.stderr,
        executionTime: r.executionTime,
        memory: r.memory,
        isHidden: testCases[index]?.isHidden ?? false,
      })),
    });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to submit solution",
      },
      { status: 500 }
    );
  }
}
