import mongoose, { Schema, models } from "mongoose";
import type { ICodingProblem } from "@/types";

const ExampleSchema = new Schema(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String },
  },
  { _id: false }
);

const TestCaseSchema = new Schema(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const StarterCodeSchema = new Schema(
  {
    javascript: { type: String, default: "" },
    python: { type: String, default: "" },
    java: { type: String, default: "" },
    cpp: { type: String, default: "" },
  },
  { _id: false }
);

const CodingProblemSchema = new Schema<ICodingProblem>({
  problemNumber: { type: Number, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  examples: { type: [ExampleSchema], default: [] },
  testCases: { type: [TestCaseSchema], default: [] },
  starterCode: { type: StarterCodeSchema, default: () => ({}) },
  solution: { type: String },
  constraints: { type: [String], default: [] },
  hints: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  acceptanceRate: { type: Number },
  totalSubmissions: { type: Number, default: 0 },
});

const CodingProblem =
  models.CodingProblem ||
  mongoose.model<ICodingProblem>("CodingProblem", CodingProblemSchema);

export default CodingProblem;
