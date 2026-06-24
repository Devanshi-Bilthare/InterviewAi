import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import CodingProblem from "@/models/CodingProblem";
import CodingSubmission from "@/models/CodingSubmission";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = 20;
    const skip = (page - 1) * limit;
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    await connectDB();

    const submissions = await CodingSubmission.find({
      userId: session.user.id,
    }).lean();

    const solvedProblemIds = new Set(
      submissions
        .filter((s) => s.status === "accepted")
        .map((s) => s.problemId.toString())
    );
    const attemptedProblemIds = new Set(
      submissions.map((s) => s.problemId.toString())
    );

    const filter: Record<string, unknown> = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (
      difficulty &&
      difficulty !== "all" &&
      ["easy", "medium", "hard"].includes(difficulty)
    ) {
      filter.difficulty = difficulty;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "solved") {
      filter._id = { $in: Array.from(solvedProblemIds) };
    } else if (status === "unsolved") {
      filter._id = { $nin: Array.from(solvedProblemIds) };
    } else if (status === "attempted") {
      filter._id = {
        $in: Array.from(attemptedProblemIds).filter(
          (id) => !solvedProblemIds.has(id)
        ),
      };
    }

    const [problems, total, allProblems] = await Promise.all([
      CodingProblem.find(filter)
        .sort({ problemNumber: 1 })
        .skip(skip)
        .limit(limit)
        .select(
          "problemNumber title category difficulty acceptanceRate totalSubmissions tags"
        )
        .lean(),
      CodingProblem.countDocuments(filter),
      CodingProblem.find({}).select("difficulty").lean(),
    ]);

    const stats = {
      total: allProblems.length,
      solved: solvedProblemIds.size,
      easy: allProblems.filter((p) => p.difficulty === "easy").length,
      medium: allProblems.filter((p) => p.difficulty === "medium").length,
      hard: allProblems.filter((p) => p.difficulty === "hard").length,
    };

    return NextResponse.json({
      problems: problems.map((p) => ({
        id: p._id.toString(),
        problemNumber: p.problemNumber,
        title: p.title,
        category: p.category,
        difficulty: p.difficulty,
        acceptanceRate: p.acceptanceRate ?? 0,
        totalSubmissions: p.totalSubmissions,
        tags: p.tags,
        status: solvedProblemIds.has(p._id.toString())
          ? "solved"
          : attemptedProblemIds.has(p._id.toString())
            ? "attempted"
            : "unsolved",
      })),
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch problems error:", error);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}
