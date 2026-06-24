import { z } from "zod";

export const updateUserSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["candidate", "admin"]).optional(),
  isSuspended: z.boolean().optional(),
});

export const questionSchema = z.object({
  category: z.string().min(1),
  question: z.string().min(1),
  expectedAnswer: z.string().optional(),
  keyPoints: z.array(z.string()).default([]),
  followUpQuestions: z.array(z.string()).default([]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  type: z.enum(["technical", "hr", "behavioral"]),
});

export const bulkImportSchema = z.object({
  questions: z.array(questionSchema).min(1),
});
