import { z } from "zod";

import { generateGeminiJSON } from "@/lib/gemini";

export const resumeAnalysisSchema = z.object({
  skills: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  suggestedTopics: z.array(z.string()).default([]),
  experienceLevel: z
    .enum(["fresher", "junior", "mid", "senior"])
    .optional(),
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
});

export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;

export async function analyzeResumeText(
  resumeText: string,
  targetRole?: string
): Promise<ResumeAnalysis> {
  const prompt = `Analyze this resume for a candidate${
    targetRole ? ` targeting the role: ${targetRole}` : ""
  }.

Resume text:
"""
${resumeText.slice(0, 12000)}
"""

Return JSON:
{
  "skills": ["skill1", "skill2"],
  "missingSkills": ["gap1", "gap2"],
  "suggestedTopics": ["topic to study 1", "topic 2"],
  "experienceLevel": "fresher|junior|mid|senior",
  "overallScore": 0-100,
  "summary": "2-3 sentence assessment of resume strength and interview readiness"
}

Score based on: clarity, relevant skills, project depth, formatting signals, and role fit.`;

  const result = await generateGeminiJSON<unknown>(prompt);
  const parsed = resumeAnalysisSchema.safeParse(result);

  if (!parsed.success) {
    console.error("Resume analysis validation error:", parsed.error.flatten());
    throw new Error(
      "AI returned an invalid analysis format. Please try again."
    );
  }

  return parsed.data;
}
