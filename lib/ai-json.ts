import { generateGeminiJSON } from "@/lib/gemini";
import { generateGroqJSON } from "@/lib/groq";
import type { EvaluationResult } from "@/lib/validations/interview";

export type AISource = "gemini" | "groq" | "local";

export async function generateAIJSON<T>(
  prompt: string,
  systemInstruction?: string
): Promise<{ data: T; source: AISource }> {
  try {
    const data = await generateGeminiJSON<T>(prompt, systemInstruction);
    return { data, source: "gemini" };
  } catch (geminiError) {
    console.warn("Gemini failed, trying Groq fallback:", geminiError);
  }

  try {
    const data = await generateGroqJSON<T>(prompt, systemInstruction);
    return { data, source: "groq" };
  } catch (groqError) {
    console.warn("Groq fallback failed:", groqError);
    throw groqError;
  }
}

export function buildLocalEvaluationFallback(
  transcript: string,
  keyPoints: string[]
): EvaluationResult {
  const lower = transcript.toLowerCase();
  const matched = keyPoints.filter((point) => {
    const words = point
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3);
    return words.some((word) => lower.includes(word));
  });

  const wordCount = transcript.split(/\s+/).filter(Boolean).length;
  const completeness =
    keyPoints.length > 0
      ? Math.round((matched.length / keyPoints.length) * 100)
      : Math.min(100, wordCount * 5);
  const communication = Math.min(100, Math.max(20, wordCount * 3));
  const relevance = Math.min(100, Math.max(15, completeness));
  const overallScore = Math.round(
    (completeness + communication + relevance) / 3
  );

  return {
    overallScore,
    dimensions: {
      relevance,
      technicalAccuracy: relevance,
      communication,
      confidence: Math.min(100, 40 + wordCount),
      completeness,
    },
    strengths:
      wordCount > 30
        ? ["Provided a detailed spoken response"]
        : ["Attempted to answer the question"],
    weaknesses:
      matched.length < keyPoints.length / 2
        ? ["Several key points were not clearly addressed"]
        : ["Could add more specific examples and structure"],
    suggestions: [
      "Review the key points shown for this question",
      "Try again later for full AI-powered feedback when quota resets",
    ],
    missedKeyPoints: keyPoints.filter((point) => !matched.includes(point)),
    idealAnswer:
      "Full AI evaluation was temporarily unavailable. Compare your answer against the key points above.",
  };
}
