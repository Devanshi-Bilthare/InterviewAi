import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { runCode } from "@/lib/judge0";
import connectDB from "@/lib/mongodb";
import { executeCodeSchema } from "@/lib/validations/coding";
import CodingProblem from "@/models/CodingProblem";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = executeCodeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { code, language, stdin, problemId } = parsed.data;

    const testInput = stdin ?? "";
    let expectedOutput: string | undefined;

    if (problemId) {
      await connectDB();
      const problem = await CodingProblem.findById(problemId).lean();
      if (!problem) {
        return NextResponse.json({ error: "Problem not found" }, { status: 404 });
      }

      const sampleCases = problem.testCases.filter(
        (tc: { isHidden: boolean }) => !tc.isHidden
      );
      if (sampleCases.length > 0) {
        const results = [];
        for (const testCase of sampleCases) {
          const result = await runCode(
            code,
            language,
            testCase.input,
            testCase.expectedOutput
          );
          results.push({
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            stdout: result.stdout,
            stderr: result.stderr,
            status: result.status,
            passed: result.passed,
            executionTime: result.executionTime,
            memory: result.memory,
          });
        }

        return NextResponse.json({
          results,
          status: results.every((r) => r.passed) ? "accepted" : "wrong-answer",
          passedCases: results.filter((r) => r.passed).length,
          totalCases: results.length,
        });
      }
    }

    const result = await runCode(code, language, testInput, expectedOutput);

    return NextResponse.json({
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
      executionTime: result.executionTime,
      memory: result.memory,
      results: [
        {
          input: testInput,
          stdout: result.stdout,
          stderr: result.stderr,
          status: result.status,
          passed: result.passed,
          executionTime: result.executionTime,
          memory: result.memory,
        },
      ],
    });
  } catch (error) {
    console.error("Execute error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to execute code",
      },
      { status: 500 }
    );
  }
}
