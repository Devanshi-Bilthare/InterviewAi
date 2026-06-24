import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  bulkImportSchema,
  questionSchema,
} from "@/lib/validations/admin";
import connectDB from "@/lib/mongodb";
import Question from "@/models/Question";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = 20;
    const skip = (page - 1) * limit;
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search")?.trim();

    await connectDB();

    const filter: Record<string, unknown> = {};

    if (category && category !== "all") filter.category = category;
    if (difficulty && difficulty !== "all") filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .sort({ usageCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Question.countDocuments(filter),
    ]);

    return NextResponse.json({
      questions: questions.map((q) => ({
        id: q._id.toString(),
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        type: q.type,
        usageCount: q.usageCount,
        keyPoints: q.keyPoints,
        expectedAnswer: q.expectedAnswer,
        followUpQuestions: q.followUpQuestions,
        isAIGenerated: q.isAIGenerated,
        createdAt: q.createdAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Admin questions fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();

    if (body.questions) {
      const parsed = bulkImportSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? "Invalid import data" },
          { status: 400 }
        );
      }

      await connectDB();
      const inserted = await Question.insertMany(
        parsed.data.questions.map((q) => ({ ...q, isAIGenerated: false }))
      );

      return NextResponse.json(
        { imported: inserted.length },
        { status: 201 }
      );
    }

    const parsed = questionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    await connectDB();
    const question = await Question.create({
      ...parsed.data,
      isAIGenerated: false,
    });

    return NextResponse.json(
      {
        question: {
          id: question._id.toString(),
          ...parsed.data,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Admin question create error:", err);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
