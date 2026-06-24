import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  buildQuestionGenerationPrompt,
  formatGeminiUserError,
  generateGeminiJSON,
} from "@/lib/gemini";
import {
  getCategoryById,
  resolveDifficultyForQuestion,
} from "@/lib/interview-categories";
import connectDB from "@/lib/mongodb";
import {
  generateInterviewSchema,
  generatedQuestionsResponseSchema,
} from "@/lib/validations/interview";
import InterviewSession from "@/models/InterviewSession";
import Question from "@/models/Question";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = generateInterviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { category, difficulty, experienceLevel, count } = parsed.data;
    const categoryMeta = getCategoryById(category);

    if (!categoryMeta) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    const level = experienceLevel ?? user?.experienceLevel ?? "junior";

    const prompt = buildQuestionGenerationPrompt({
      category: categoryMeta.name,
      difficulty,
      experienceLevel: level,
      count,
      interviewType: categoryMeta.interviewType,
    });

    const geminiResponse = await generateGeminiJSON<{
      questions: Array<{
        question: string;
        expectedAnswer?: string;
        keyPoints: string[];
        followUpQuestions: string[];
        difficulty: "easy" | "medium" | "hard";
        type: "technical" | "hr" | "behavioral";
      }>;
    }>(prompt);

    const validated = generatedQuestionsResponseSchema.safeParse(geminiResponse);

    if (!validated.success) {
      console.error("Gemini validation error:", validated.error.flatten());
      return NextResponse.json(
        {
          error:
            "AI generated invalid questions. Please try again in a few seconds.",
        },
        { status: 500 }
      );
    }

    const savedQuestions = await Question.insertMany(
      validated.data.questions.map((q, index) => ({
        category: categoryMeta.name,
        question: q.question,
        expectedAnswer: q.expectedAnswer,
        keyPoints: q.keyPoints,
        followUpQuestions: q.followUpQuestions,
        difficulty:
          difficulty === "mixed"
            ? resolveDifficultyForQuestion(difficulty, index)
            : q.difficulty,
        type: q.type,
        isAIGenerated: true,
      }))
    );

    const interviewSession = await InterviewSession.create({
      userId: session.user.id,
      category: categoryMeta.name,
      interviewType: categoryMeta.interviewType,
      difficulty,
      status: "in-progress",
      questions: savedQuestions.map((q) => q._id),
      startedAt: new Date(),
    });

    return NextResponse.json({
      sessionId: interviewSession._id.toString(),
      questions: savedQuestions.map((q) => ({
        id: q._id.toString(),
        question: q.question,
        keyPoints: q.keyPoints,
        difficulty: q.difficulty,
        type: q.type,
      })),
    });
  } catch (error) {
    console.error("Generate interview error:", error);
    const message = formatGeminiUserError(error);
    const status =
      error instanceof Error &&
      (message.includes("rate limits") || message.includes("busy"))
        ? 429
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
