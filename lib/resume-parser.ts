import { PDFParse } from "pdf-parse";

const MAX_TEXT_LENGTH = 50_000;

export async function extractTextFromFile(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".txt")) {
    return buffer.toString("utf-8").slice(0, MAX_TEXT_LENGTH);
  }

  if (lower.endsWith(".pdf")) {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      return result.text.slice(0, MAX_TEXT_LENGTH);
    } finally {
      await parser.destroy();
    }
  }

  throw new Error("Unsupported file type. Please upload a PDF or TXT file.");
}
