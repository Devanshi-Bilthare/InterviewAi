import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  buildLocalEvaluationFallback,
  generateAIJSON,
} from "@/lib/ai-json";
import {
  buildEvaluationPrompt,
  formatGeminiUserError,
} from "@/lib/gemini";
import {
  averageDimensionScores,
  overallFromDimensions,
} from "@/lib/interview-scores";
import connectDB from "@/lib/mongodb";
import {
  interviewCompleteEmail,
  milestoneEmail,
  sendEmail,
} from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import {
  evaluateAnswerSchema,
  evaluationResponseSchema,
  type EvaluationResult,
} from "@/lib/validations/interview";
import Answer from "@/models/Answer";
import Evaluation from "@/models/Evaluation";
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
    const parsed = evaluateAnswerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { questionId, transcript, sessionId, duration } = parsed.data;
    let { answerId } = parsed.data;

    await connectDB();

    const interviewSession = await InterviewSession.findOne({
      _id: sessionId,
      userId: session.user.id,
    });

    if (!interviewSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    if (!answerId) {
      const answer = await Answer.create({
        sessionId,
        questionId,
        userId: session.user.id,
        transcript,
        duration,
        recordedAt: new Date(),
      });
      answerId = answer._id.toString();
    } else {
      await Answer.findByIdAndUpdate(answerId, { transcript, duration });
    }

    const prompt = buildEvaluationPrompt({
      question: question.question,
      expectedAnswer: question.expectedAnswer,
      keyPoints: question.keyPoints,
      transcript,
      category: interviewSession.category,
    });

    let evaluationData: EvaluationResult;
    let evaluationSource: "gemini" | "groq" | "local" = "gemini";

    try {
      const aiResult = await generateAIJSON<unknown>(prompt);
      const validated = evaluationResponseSchema.safeParse(aiResult.data);

      if (!validated.success) {
        console.error("Evaluation validation error:", validated.error);
        evaluationData = buildLocalEvaluationFallback(
          transcript,
          question.keyPoints
        );
        evaluationSource = "local";
      } else {
        evaluationData = validated.data;
        evaluationSource = aiResult.source;
      }
    } catch (error) {
      console.error("AI evaluation failed, using local fallback:", error);
      evaluationData = buildLocalEvaluationFallback(
        transcript,
        question.keyPoints
      );
      evaluationSource = "local";
    }

    const evaluation = await Evaluation.create({
      answerId,
      sessionId,
      userId: session.user.id,
      overallScore: evaluationData.overallScore,
      dimensions: evaluationData.dimensions,
      strengths: evaluationData.strengths,
      weaknesses: evaluationData.weaknesses,
      suggestions: evaluationData.suggestions,
      missedKeyPoints: evaluationData.missedKeyPoints,
      idealAnswer: evaluationData.idealAnswer,
      evaluatedAt: new Date(),
    });

    const allEvaluations = await Evaluation.find({ sessionId });
    const avgDimensions = averageDimensionScores(
      allEvaluations.map((e) => e.dimensions)
    );
    const overallScore = overallFromDimensions(avgDimensions);

    await InterviewSession.findByIdAndUpdate(sessionId, {
      overallScore,
      dimensionScores: avgDimensions,
    });

    await Question.findByIdAndUpdate(questionId, {
      $inc: { usageCount: 1 },
    });

    const totalQuestions = interviewSession.questions.length;
    const answeredCount = allEvaluations.length;

    if (answeredCount >= totalQuestions) {
      const startedAt = interviewSession.startedAt ?? new Date();
      const durationMinutes = Math.round(
        (Date.now() - startedAt.getTime()) / 60000
      );

      await InterviewSession.findByIdAndUpdate(sessionId, {
        status: "completed",
        completedAt: new Date(),
        duration: durationMinutes,
      });

      const user = await User.findById(session.user.id);
      if (user) {
        const newTotal = user.totalInterviews + 1;
        const newAvg =
          (user.averageScore * user.totalInterviews + overallScore) / newTotal;
        await User.findByIdAndUpdate(session.user.id, {
          totalInterviews: newTotal,
          averageScore: Math.round(newAvg),
        });

        const emailContent = interviewCompleteEmail(
          user.name,
          overallScore,
          interviewSession.category
        );
        await sendEmail({
          to: user.email,
          ...emailContent,
        });

        await createNotification({
          userId: session.user.id,
          type: "interview",
          title: "Interview Complete",
          message: `You scored ${overallScore}/100 on your ${interviewSession.category} interview.`,
          link: `/interview/results/${sessionId}`,
        });

        if (newTotal === 1 || newTotal === 10) {
          const milestone =
            newTotal === 1 ? "First Interview" : "10 Interviews";
          const mEmail = milestoneEmail(user.name, milestone);
          await sendEmail({ to: user.email, ...mEmail });
          await createNotification({
            userId: session.user.id,
            type: "milestone",
            title: "Milestone Achieved",
            message: `You've unlocked: ${milestone}!`,
            link: "/progress",
          });
        }
      }
    }

    return NextResponse.json({
      answerId,
      questionId,
      evaluationSource,
      evaluation: {
        id: evaluation._id.toString(),
        overallScore: evaluation.overallScore,
        dimensions: evaluation.dimensions,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        suggestions: evaluation.suggestions,
        missedKeyPoints: evaluation.missedKeyPoints,
        idealAnswer: evaluation.idealAnswer,
      },
    });
  } catch (error) {
    console.error("Evaluate error:", error);
    return NextResponse.json(
      { error: formatGeminiUserError(error) },
      { status: 500 }
    );
  }
}
