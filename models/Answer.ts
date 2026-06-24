import mongoose, { Schema, models } from "mongoose";
import type { IAnswer } from "@/types";

const AnswerSchema = new Schema<IAnswer>({
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: "InterviewSession",
    required: true,
    index: true,
  },
  questionId: {
    type: Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  audioUrl: { type: String },
  transcript: { type: String },
  duration: { type: Number },
  recordedAt: { type: Date },
});

const Answer = models.Answer || mongoose.model<IAnswer>("Answer", AnswerSchema);

export default Answer;
