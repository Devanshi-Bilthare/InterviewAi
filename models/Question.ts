import mongoose, { Schema, models } from "mongoose";
import type { IQuestion } from "@/types";

const QuestionSchema = new Schema<IQuestion>(
  {
    category: { type: String, required: true },
    question: { type: String, required: true },
    expectedAnswer: { type: String },
    keyPoints: { type: [String], default: [] },
    followUpQuestions: { type: [String], default: [] },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    type: {
      type: String,
      enum: ["technical", "hr", "behavioral"],
      required: true,
    },
    isAIGenerated: { type: Boolean, default: false },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Question =
  models.Question || mongoose.model<IQuestion>("Question", QuestionSchema);

export default Question;
