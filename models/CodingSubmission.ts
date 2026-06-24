import mongoose, { Schema, models } from "mongoose";
import type { ICodingSubmission } from "@/types";

const CodingSubmissionSchema = new Schema<ICodingSubmission>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  problemId: {
    type: Schema.Types.ObjectId,
    ref: "CodingProblem",
    required: true,
    index: true,
  },
  code: { type: String, required: true },
  language: {
    type: String,
    enum: ["javascript", "python", "java", "cpp"],
    required: true,
  },
  status: {
    type: String,
    enum: ["accepted", "wrong-answer", "time-limit", "runtime-error", "pending"],
    default: "pending",
  },
  passedTestCases: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  executionTime: { type: Number },
  memoryUsed: { type: Number },
  submittedAt: { type: Date, default: Date.now },
});

const CodingSubmission =
  models.CodingSubmission ||
  mongoose.model<ICodingSubmission>("CodingSubmission", CodingSubmissionSchema);

export default CodingSubmission;
