import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const GEMINI_FALLBACK_MODEL =
  process.env.GEMINI_FALLBACK_MODEL ?? "gemini-2.5-flash-lite";

const MAX_RATE_LIMIT_RETRIES = 4;

function getGenAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("429") ||
    message.includes("Too Many Requests") ||
    message.includes("quota") ||
    message.includes("Quota exceeded")
  );
}

function getRetryDelayMs(error: unknown, attempt: number): number {
  const message = error instanceof Error ? error.message : String(error);
  const secondsMatch = message.match(/retry in (\d+(?:\.\d+)?)s/i);
  if (secondsMatch) {
    return Math.ceil(parseFloat(secondsMatch[1]) * 1000) + 500;
  }

  const retryInfoMatch = message.match(/"retryDelay":"(\d+)s"/i);
  if (retryInfoMatch) {
    return parseInt(retryInfoMatch[1], 10) * 1000 + 500;
  }

  // Exponential backoff: 2s, 4s, 8s, 16s
  return Math.min(2000 * 2 ** attempt, 16000);
}

async function withGeminiRetry<T>(
  operation: () => Promise<T>,
  label: string
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RATE_LIMIT_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isRateLimitError(error) || attempt === MAX_RATE_LIMIT_RETRIES - 1) {
        throw error;
      }

      const delay = getRetryDelayMs(error, attempt);
      console.warn(
        `Gemini rate limited (${label}), retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RATE_LIMIT_RETRIES})`
      );
      await sleep(delay);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to generate AI response");
}

export function formatGeminiUserError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (isRateLimitError(error)) {
    return "AI is temporarily busy due to rate limits. Please wait a few seconds and try again.";
  }

  if (message.includes("GEMINI_API_KEY")) {
    return "AI service is not configured. Please contact support.";
  }

  return "Failed to generate AI response. Please try again.";
}

export function parseJsonResponse(text: string): unknown {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!match) {
      throw new Error("Failed to parse Gemini JSON response");
    }
    return JSON.parse(match[0]);
  }
}

export async function generateGeminiJSON<T>(
  prompt: string,
  systemInstruction?: string
): Promise<T> {
  const models = [GEMINI_MODEL, GEMINI_FALLBACK_MODEL].filter(
    (m, i, arr) => arr.indexOf(m) === i
  );

  let lastError: unknown;

  for (const modelName of models) {
    try {
      return await withGeminiRetry(async () => {
        const ai = getGenAI();
        const model = ai.getGenerativeModel({
          model: modelName,
          systemInstruction,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return parseJsonResponse(text) as T;
      }, `generateGeminiJSON:${modelName}`);
    } catch (error) {
      lastError = error;
      console.warn(`Gemini model ${modelName} failed:`, error);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to generate AI response");
}

export function buildQuestionGenerationPrompt({
  category,
  difficulty,
  experienceLevel,
  count,
  interviewType,
}: {
  category: string;
  difficulty: string;
  experienceLevel?: string;
  count: number;
  interviewType: string;
}) {
  return `Generate exactly ${count} interview questions for a "${category}" interview track.

Candidate experience level: ${experienceLevel ?? "junior"}
Session difficulty: ${difficulty}
Interview type: ${interviewType}

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "The interview question text",
      "expectedAnswer": "A model answer a strong candidate would give",
      "keyPoints": ["key point 1", "key point 2", "key point 3"],
      "followUpQuestions": ["follow-up 1", "follow-up 2"],
      "difficulty": "easy|medium|hard",
      "type": "technical|hr|behavioral"
    }
  ]
}

Rules:
- Questions must be realistic and relevant to ${category}
- Match difficulty to "${difficulty}" (if mixed, vary across easy/medium/hard)
- Each question should have 3-5 key points
- HR questions should use type "hr", behavioral use "behavioral", others "technical"
- Do not include markdown or extra text outside JSON`;
}

export function buildEvaluationPrompt({
  question,
  expectedAnswer,
  keyPoints,
  transcript,
  category,
}: {
  question: string;
  expectedAnswer?: string;
  keyPoints: string[];
  transcript: string;
  category: string;
}) {
  return `Evaluate this interview answer for a "${category}" interview.

QUESTION:
${question}

EXPECTED ANSWER:
${expectedAnswer ?? "Not provided"}

KEY POINTS TO COVER:
${keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}

CANDIDATE'S TRANSCRIPT:
${transcript}

Return JSON with this exact structure:
{
  "overallScore": <0-100 integer>,
  "dimensions": {
    "relevance": <0-100>,
    "technicalAccuracy": <0-100>,
    "communication": <0-100>,
    "confidence": <0-100>,
    "completeness": <0-100>
  },
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "suggestions": ["actionable suggestion 1", "suggestion 2"],
  "missedKeyPoints": ["missed point 1"],
  "idealAnswer": "Improved version of the answer"
}

Be fair but rigorous. Score based on how well the transcript addresses the question and key points.`;
}

export const AI_INTERVIEW_MIN_EXCHANGES = 8;
export const AI_INTERVIEW_MAX_EXCHANGES = 10;

export function buildAlexSystemPrompt({
  category,
  experienceLevel,
  exchangeCount,
  forceEnd,
  windingDown,
}: {
  category: string;
  experienceLevel?: string;
  exchangeCount: number;
  forceEnd?: boolean;
  windingDown?: boolean;
}) {
  return `You are Alex, a Senior Technical Interviewer conducting a live mock interview on InterviewAI.

Personality: Warm, professional, and encouraging. Speak naturally as in a real video interview. Ask one question at a time and adapt follow-ups to what the candidate actually said.

Interview track: ${category}
Candidate experience level: ${experienceLevel ?? "junior"}
Exchanges completed so far: ${exchangeCount}

Guidelines:
- Keep replies concise: 2-4 sentences for follow-ups, up to 5 for your opening
- Probe vague answers with specific follow-up questions
- For technical tracks, include practical and scenario-based questions
- For HR/behavioral topics, use STAR-style behavioral questions
- Never use markdown, bullet points, or numbered lists in your speech
- Do not mention being an AI unless the candidate directly asks
${windingDown ? "\nThe interview is nearing its end. After addressing the candidate's last answer, transition toward closing." : ""}
${forceEnd ? '\nThis is your FINAL message. Thank the candidate and end with exactly: "That concludes our interview. Let me generate your report..."' : ""}`;
}

export function buildConversationEvaluationPrompt({
  category,
  experienceLevel,
  conversation,
}: {
  category: string;
  experienceLevel?: string;
  conversation: Array<{ role: string; content: string }>;
}) {
  const transcript = conversation
    .map((m) => `${m.role === "user" ? "CANDIDATE" : "INTERVIEWER (Alex)"}: ${m.content}`)
    .join("\n\n");

  return `Evaluate this complete AI conversational mock interview for "${category}".

Candidate experience level: ${experienceLevel ?? "junior"}

FULL CONVERSATION TRANSCRIPT:
${transcript}

Return JSON with this exact structure:
{
  "overallScore": <0-100 integer>,
  "dimensions": {
    "relevance": <0-100>,
    "technicalAccuracy": <0-100>,
    "communication": <0-100>,
    "confidence": <0-100>,
    "completeness": <0-100>
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "suggestions": ["actionable suggestion 1", "suggestion 2", "suggestion 3"],
  "missedKeyPoints": ["topic or skill gap 1"],
  "overallAssessment": "2-3 sentence summary of overall interview performance"
}

Score holistically across the entire conversation, not just the last answer.`;
}

export async function generateGeminiChat(
  systemInstruction: string,
  history: Array<{ role: "user" | "model"; content: string }>,
  userMessage: string
): Promise<string> {
  return withGeminiRetry(async () => {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction,
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 512,
      },
    });

    const chat = model.startChat({
      history: history.map((entry) => ({
        role: entry.role,
        parts: [{ text: entry.content }],
      })),
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text().trim();
  }, `generateGeminiChat:${GEMINI_MODEL}`);
}
