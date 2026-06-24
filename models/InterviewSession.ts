import mongoose, { Schema, models } from "mongoose";
import type { IInterviewSession } from "@/types";

const DimensionScoresSchema = new Schema(
  {
    relevance: { type: Number },
    technicalAccuracy: { type: Number },
    communication: { type: Number },
    confidence: { type: Number },
    completeness: { type: Number },
  },
  { _id: false }
);

const AIConversationSchema = new Schema(
  {
    role: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const InterviewSessionSchema = new Schema<IInterviewSession>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  category: { type: String, required: true },
  interviewType: {
    type: String,
    enum: ["technical", "hr", "behavioral", "ai-conversational"],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard", "mixed"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  },
  questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
  overallScore: { type: Number },
  dimensionScores: { type: DimensionScoresSchema },
  duration: { type: Number },
  aiConversation: { type: [AIConversationSchema], default: [] },
  startedAt: { type: Date },
  completedAt: { type: Date },
});

const InterviewSession =
  models.InterviewSession ||
  mongoose.model<IInterviewSession>("InterviewSession", InterviewSessionSchema);

export default InterviewSession;
