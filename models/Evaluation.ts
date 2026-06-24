import mongoose, { Schema, models } from "mongoose";
import type { IEvaluation } from "@/types";

const DimensionScoresSchema = new Schema(
  {
    relevance: { type: Number, required: true },
    technicalAccuracy: { type: Number, required: true },
    communication: { type: Number, required: true },
    confidence: { type: Number, required: true },
    completeness: { type: Number, required: true },
  },
  { _id: false }
);

const EvaluationSchema = new Schema<IEvaluation>({
  answerId: { type: Schema.Types.ObjectId, ref: "Answer", required: true, index: true },
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: "InterviewSession",
    required: true,
    index: true,
  },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  overallScore: { type: Number, required: true },
  dimensions: { type: DimensionScoresSchema, required: true },
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },
  suggestions: { type: [String], default: [] },
  missedKeyPoints: { type: [String], default: [] },
  idealAnswer: { type: String },
  evaluatedAt: { type: Date, default: Date.now },
});

const Evaluation =
  models.Evaluation || mongoose.model<IEvaluation>("Evaluation", EvaluationSchema);

export default Evaluation;
