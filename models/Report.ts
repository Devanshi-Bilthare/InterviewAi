import mongoose, { Schema, models } from "mongoose";
import type { IReport } from "@/types";

const RecommendedSkillSchema = new Schema(
  {
    skill: { type: String, required: true },
    priority: { type: String, required: true },
    reason: { type: String, required: true },
  },
  { _id: false }
);

const RecommendedProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    skills: { type: [String], default: [] },
  },
  { _id: false }
);

const RoadmapWeekSchema = new Schema(
  {
    week: { type: Number, required: true },
    focus: { type: String, required: true },
    tasks: { type: [String], default: [] },
  },
  { _id: false }
);

const ReportSchema = new Schema<IReport>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  reportType: {
    type: String,
    enum: ["weekly", "monthly", "milestone"],
    required: true,
  },
  overallAssessment: { type: String, required: true },
  strengths: { type: [String], default: [] },
  areasToImprove: { type: [String], default: [] },
  recommendedSkills: { type: [RecommendedSkillSchema], default: [] },
  recommendedProjects: { type: [RecommendedProjectSchema], default: [] },
  thirtyDayRoadmap: { type: [RoadmapWeekSchema], default: [] },
  interviewsAnalyzed: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  generatedAt: { type: Date, default: Date.now },
});

const Report = models.Report || mongoose.model<IReport>("Report", ReportSchema);

export default Report;
