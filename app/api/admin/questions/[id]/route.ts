import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { questionSchema } from "@/lib/validations/admin";
import connectDB from "@/lib/mongodb";
import Question from "@/models/Question";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = questionSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    await connectDB();

    const question = await Question.findByIdAndUpdate(
      params.id,
      parsed.data,
      { new: true }
    );

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({
      question: {
        id: question._id.toString(),
        question: question.question,
        category: question.category,
        difficulty: question.difficulty,
        type: question.type,
        usageCount: question.usageCount,
      },
    });
  } catch (err) {
    console.error("Admin question update error:", err);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();
    const question = await Question.findByIdAndDelete(params.id);

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin question delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
