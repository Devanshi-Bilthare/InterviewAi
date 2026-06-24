import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { transcribeAudio } from "@/lib/groq";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "audio/webm",
      "audio/mp3",
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "video/webm",
    ];

    if (!allowedTypes.some((t) => audioFile.type.includes(t.split("/")[1]))) {
      // Allow webm even if type is empty (some browsers)
      if (audioFile.type && !audioFile.type.startsWith("audio/") && !audioFile.type.startsWith("video/webm")) {
        return NextResponse.json(
          { error: "Unsupported audio format. Use webm or mp3." },
          { status: 400 }
        );
      }
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());

    if (buffer.length < 500) {
      return NextResponse.json(
        {
          error:
            "Recording is too short. Please speak for at least 2–3 seconds before stopping.",
        },
        { status: 400 }
      );
    }

    const ext = audioFile.name?.split(".").pop() ?? "webm";
    const filename = `recording.${ext}`;

    const transcript = await transcribeAudio(
      buffer,
      filename,
      audioFile.type || "audio/webm"
    );

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to transcribe audio",
      },
      { status: 500 }
    );
  }
}
