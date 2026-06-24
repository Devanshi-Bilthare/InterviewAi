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
