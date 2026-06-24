import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { createSessionSchema } from "@/lib/validations/interview";
import InterviewSession from "@/models/InterviewSession";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10))
    );
    const skip = (page - 1) * limit;

    await connectDB();

    const [sessions, total] = await Promise.all([
      InterviewSession.find({ userId: session.user.id })
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("questions", "question difficulty")
        .lean(),
      InterviewSession.countDocuments({ userId: session.user.id }),
    ]);

    return NextResponse.json({
      sessions: sessions.map((s) => ({
        id: s._id.toString(),
        category: s.category,
        interviewType: s.interviewType,
        difficulty: s.difficulty,
        status: s.status,
        overallScore: s.overallScore,
        questionCount: s.questions?.length ?? 0,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        duration: s.duration,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch sessions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    await connectDB();

    const interviewSession = await InterviewSession.create({
      userId: session.user.id,
      category: parsed.data.category,
      interviewType: parsed.data.interviewType,
      difficulty: parsed.data.difficulty,
      status: "pending",
      questions: parsed.data.questionIds ?? [],
      startedAt: new Date(),
    });

    return NextResponse.json(
      {
        sessionId: interviewSession._id.toString(),
        session: interviewSession,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
