import mongoose, { Schema, models } from "mongoose";
import type { IResume } from "@/types";

const ResumeSchema = new Schema<IResume>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  extractedText: { type: String },
  skills: { type: [String], default: [] },
  missingSkills: { type: [String], default: [] },
  suggestedTopics: { type: [String], default: [] },
  experienceLevel: { type: String },
  overallScore: { type: Number },
  summary: { type: String },
  analyzedAt: { type: Date },
});

const Resume = models.Resume || mongoose.model<IResume>("Resume", ResumeSchema);

export default Resume;
