import { z } from "zod";

export const generateInterviewSchema = z.object({
  category: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
  experienceLevel: z.enum(["fresher", "junior", "mid", "senior"]).optional(),
  count: z.number().int().min(1).max(20).default(10),
});

export const createSessionSchema = z.object({
  category: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
  interviewType: z.enum(["technical", "hr", "behavioral", "ai-conversational"]),
  questionIds: z.array(z.string()).optional(),
});

export const evaluateAnswerSchema = z.object({
  answerId: z.string().optional(),
  questionId: z.string().min(1),
  transcript: z.string().min(1),
  sessionId: z.string().min(1),
  duration: z.number().optional(),
});

export const generatedQuestionSchema = z.object({
  question: z.string(),
  expectedAnswer: z.string().optional(),
  keyPoints: z.array(z.string()).default([]),
  followUpQuestions: z.array(z.string()).default([]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  type: z.enum(["technical", "hr", "behavioral"]),
});

export const generatedQuestionsResponseSchema = z.object({
  questions: z.array(generatedQuestionSchema),
});

export const evaluationResponseSchema = z.object({
  overallScore: z.number().min(0).max(100),
  dimensions: z.object({
    relevance: z.number().min(0).max(100),
    technicalAccuracy: z.number().min(0).max(100),
    communication: z.number().min(0).max(100),
    confidence: z.number().min(0).max(100),
    completeness: z.number().min(0).max(100),
  }),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  suggestions: z.array(z.string()).default([]),
  missedKeyPoints: z.array(z.string()).default([]),
  idealAnswer: z.string().optional(),
});

export const aiChatSchema = z.object({
  message: z.string().default(""),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
  category: z.string().min(1),
  experienceLevel: z.enum(["fresher", "junior", "mid", "senior"]).optional(),
  sessionId: z.string().optional(),
  endInterview: z.boolean().optional(),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]).optional(),
});

export const sessionSummarySchema = evaluationResponseSchema.extend({
  overallAssessment: z.string(),
});

export type SessionSummary = z.infer<typeof sessionSummarySchema>;

export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;
export type EvaluationResult = z.infer<typeof evaluationResponseSchema>;
