import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Answer from "@/models/Answer";
import Evaluation from "@/models/Evaluation";
import InterviewSession from "@/models/InterviewSession";

export async function GET(
  _request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const interviewSession = await InterviewSession.findOne({
      _id: params.sessionId,
      userId: session.user.id,
    }).populate("questions");

    if (!interviewSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const [answers, evaluations] = await Promise.all([
      Answer.find({ sessionId: params.sessionId }).lean(),
      Evaluation.find({ sessionId: params.sessionId }).lean(),
    ]);

    return NextResponse.json({
      session: {
        id: interviewSession._id.toString(),
        category: interviewSession.category,
        interviewType: interviewSession.interviewType,
        difficulty: interviewSession.difficulty,
        status: interviewSession.status,
        overallScore: interviewSession.overallScore,
        dimensionScores: interviewSession.dimensionScores,
        duration: interviewSession.duration,
        startedAt: interviewSession.startedAt,
        completedAt: interviewSession.completedAt,
        aiConversation: interviewSession.aiConversation.map(
          (m: { role: string; content: string; timestamp?: Date }) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          })
        ),
        questions: (interviewSession.questions as Array<{
          _id: { toString(): string };
          question: string;
          expectedAnswer?: string;
          keyPoints: string[];
          difficulty: string;
          type: string;
        }>).map((question) => ({
          id: question._id.toString(),
          question: question.question,
          expectedAnswer: question.expectedAnswer,
          keyPoints: question.keyPoints,
          difficulty: question.difficulty,
          type: question.type,
        })),
      },
      answers: answers.map((a) => ({
        id: a._id.toString(),
        questionId: a.questionId.toString(),
        transcript: a.transcript,
        duration: a.duration,
        recordedAt: a.recordedAt,
      })),
      evaluations: evaluations.map((e) => {
        const answer = answers.find(
          (a) => a._id.toString() === e.answerId.toString()
        );
        return {
          id: e._id.toString(),
          answerId: e.answerId.toString(),
          questionId: answer?.questionId?.toString(),
          overallScore: e.overallScore,
          dimensions: e.dimensions,
          strengths: e.strengths,
          weaknesses: e.weaknesses,
          suggestions: e.suggestions,
          missedKeyPoints: e.missedKeyPoints,
          idealAnswer: e.idealAnswer,
        };
      }),
    });
  } catch (error) {
    console.error("Fetch session error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    await connectDB();

    const interviewSession = await InterviewSession.findOneAndUpdate(
      { _id: params.sessionId, userId: session.user.id },
      body,
      { new: true }
    );

    if (!interviewSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session: interviewSession });
  } catch (error) {
    console.error("Update session error:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}
