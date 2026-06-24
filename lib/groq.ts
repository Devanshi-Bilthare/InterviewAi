import Groq, { toFile } from "groq-sdk";

let groqClient: Groq | null = null;

function getGroq() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is not configured. Get a free key at https://console.groq.com"
    );
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string,
  mimeType = "audio/webm"
): Promise<string> {
  if (audioBuffer.length < 500) {
    throw new Error(
      "Recording is too short or empty. Please record for at least 2–3 seconds."
    );
  }

  const groq = getGroq();
  const file = await toFile(audioBuffer, filename, { type: mimeType });

  const transcription = await groq.audio.transcriptions.create({
    file,
    model: "whisper-large-v3",
    language: "en",
    response_format: "json",
  });

  const text = transcription.text?.trim();
  if (!text) {
    throw new Error(
      "Could not detect speech in the recording. Please try again and speak clearly."
    );
  }

  return text;
}

function parseJsonResponse(text: string): unknown {
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
      throw new Error("Failed to parse Groq JSON response");
    }
    return JSON.parse(match[0]);
  }
}

export async function generateGroqJSON<T>(
  prompt: string,
  systemInstruction?: string
): Promise<T> {
  const groq = getGroq();
  const messages: Array<{ role: "system" | "user"; content: string }> = [];

  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }

  messages.push({ role: "user", content: prompt });

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
    messages,
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Empty Groq response");
  }

  return parseJsonResponse(text) as T;
}
