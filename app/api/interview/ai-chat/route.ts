import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  AI_INTERVIEW_MAX_EXCHANGES,
  AI_INTERVIEW_MIN_EXCHANGES,
  buildAlexSystemPrompt,
  buildConversationEvaluationPrompt,
  generateGeminiChat,
  generateGeminiJSON,
} from "@/lib/gemini";
import connectDB from "@/lib/mongodb";
import {
  interviewCompleteEmail,
  milestoneEmail,
  sendEmail,
} from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import {
  aiChatSchema,
  sessionSummarySchema,
} from "@/lib/validations/interview";
import InterviewSession from "@/models/InterviewSession";
import User from "@/models/User";

function countUserExchanges(
  messages: Array<{ role: string; content: string }>
) {
  return messages.filter((m) => m.role === "user").length;
}

function toGeminiHistory(
  messages: Array<{ role: string; content: string }>
): Array<{ role: "user" | "model"; content: string }> {
  return messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    content: m.content,
  }));
}

export async function POST(request: Request) {
  try {
    const authSession = await auth();
    if (!authSession?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = aiChatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const {
      message,
      category,
      experienceLevel: bodyExperienceLevel,
      sessionId: bodySessionId,
      endInterview,
      difficulty = "medium",
    } = parsed.data;

    await connectDB();

    const user = await User.findById(authSession.user.id);
    const experienceLevel =
      bodyExperienceLevel ?? user?.experienceLevel ?? "junior";

    let interviewSession = bodySessionId
      ? await InterviewSession.findOne({
          _id: bodySessionId,
          userId: authSession.user.id,
        })
      : null;

    if (bodySessionId && !interviewSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (!interviewSession) {
      interviewSession = await InterviewSession.create({
        userId: authSession.user.id,
        category,
        interviewType: "ai-conversational",
        difficulty,
        status: "in-progress",
        questions: [],
        aiConversation: [],
        startedAt: new Date(),
      });
    }

    const sessionId = interviewSession._id.toString();
    const conversation = [...interviewSession.aiConversation];
    const isOpening = conversation.length === 0 && !message.trim();

    if (message.trim()) {
      conversation.push({
        role: "user",
        content: message.trim(),
        timestamp: new Date(),
      });
    }

    const exchangeCount = countUserExchanges(conversation);
    const windingDown =
      exchangeCount >= AI_INTERVIEW_MIN_EXCHANGES &&
      exchangeCount < AI_INTERVIEW_MAX_EXCHANGES &&
      !endInterview;
    const shouldComplete =
      (endInterview && exchangeCount > 0) ||
      exchangeCount >= AI_INTERVIEW_MAX_EXCHANGES;

    const systemPrompt = buildAlexSystemPrompt({
      category: interviewSession.category || category,
      experienceLevel,
      exchangeCount,
      forceEnd: shouldComplete,
      windingDown,
    });

    let reply: string;

    if (isOpening) {
      reply = await generateGeminiChat(
        systemPrompt,
        [],
        "Begin the interview. Introduce yourself as Alex, briefly explain the format, and ask your opening question for this track."
      );
    } else if (shouldComplete && exchangeCount === 0) {
      return NextResponse.json(
        { error: "No conversation to evaluate yet" },
        { status: 400 }
      );
    } else {
      const lastEntry = conversation[conversation.length - 1];
      let history: Array<{ role: "user" | "model"; content: string }>;
      let promptMessage: string;

      if (lastEntry?.role === "user") {
        history = toGeminiHistory(conversation.slice(0, -1));
        promptMessage = lastEntry.content;
      } else if (endInterview) {
        history = toGeminiHistory(conversation);
        promptMessage =
          "The candidate has requested to end the interview. Please thank them and conclude the interview.";
      } else {
        return NextResponse.json(
          { error: "Invalid conversation state" },
          { status: 400 }
        );
      }

      if (shouldComplete) {
        reply = await generateGeminiChat(
          systemPrompt,
          history,
          promptMessage
        );
        if (!reply.includes("That concludes our interview")) {
          reply =
            "Thank you for your thoughtful answers today. That concludes our interview. Let me generate your report...";
        }
      } else {
        reply = await generateGeminiChat(
          systemPrompt,
          history,
          promptMessage
        );
      }
    }

    conversation.push({
      role: "assistant",
      content: reply,
      timestamp: new Date(),
    });

    const isInterviewComplete = shouldComplete && !isOpening;

    let sessionSummary = undefined;

    if (isInterviewComplete) {
      const evalPrompt = buildConversationEvaluationPrompt({
        category: interviewSession.category || category,
        experienceLevel,
        conversation,
      });

      const geminiEval = await generateGeminiJSON<unknown>(evalPrompt);
      const validated = sessionSummarySchema.safeParse(geminiEval);

      if (validated.success) {
        sessionSummary = validated.data;
        const overallScore = validated.data.overallScore;

        const startedAt = interviewSession.startedAt ?? new Date();
        const durationMinutes = Math.max(
          1,
          Math.round((Date.now() - startedAt.getTime()) / 60000)
        );

        await InterviewSession.findByIdAndUpdate(sessionId, {
          aiConversation: conversation,
          status: "completed",
          completedAt: new Date(),
          duration: durationMinutes,
          overallScore,
          dimensionScores: validated.data.dimensions,
        });

        if (user) {
          const newTotal = user.totalInterviews + 1;
          const newAvg =
            (user.averageScore * user.totalInterviews + overallScore) / newTotal;
          await User.findByIdAndUpdate(authSession.user.id, {
            totalInterviews: newTotal,
            averageScore: Math.round(newAvg),
          });

          const emailContent = interviewCompleteEmail(
            user.name,
            overallScore,
            interviewSession.category || category
          );
          await sendEmail({ to: user.email, ...emailContent });
          await createNotification({
            userId: authSession.user.id,
            type: "interview",
            title: "AI Interview Complete",
            message: `You scored ${overallScore}/100 with Alex.`,
            link: `/interview/results/${sessionId}`,
          });

          if (newTotal === 1 || newTotal === 10) {
            const milestone =
              newTotal === 1 ? "First Interview" : "10 Interviews";
            const mEmail = milestoneEmail(user.name, milestone);
            await sendEmail({ to: user.email, ...mEmail });
            await createNotification({
              userId: authSession.user.id,
              type: "milestone",
              title: "Milestone Achieved",
              message: `You've unlocked: ${milestone}!`,
              link: "/progress",
            });
          }
        }
      } else {
        console.error("Session summary validation error:", validated.error);
        await InterviewSession.findByIdAndUpdate(sessionId, {
          aiConversation: conversation,
          status: "completed",
          completedAt: new Date(),
        });
      }
    } else {
      await InterviewSession.findByIdAndUpdate(sessionId, {
        aiConversation: conversation,
        status: "in-progress",
      });
    }

    return NextResponse.json({
      sessionId,
      reply,
      isInterviewComplete,
      exchangeCount: countUserExchanges(conversation),
      sessionSummary,
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process AI interview",
      },
      { status: 500 }
    );
  }
}
