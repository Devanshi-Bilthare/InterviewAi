import { v2 as cloudinary } from "cloudinary";

import { auth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { analyzeResumeText } from "@/lib/resume-analysis";
import { formatGeminiUserError } from "@/lib/gemini";
import { extractTextFromFile } from "@/lib/resume-parser";
import connectDB from "@/lib/mongodb";
import Resume from "@/models/Resume";
import User from "@/models/User";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function serializeResume(resume: {
  _id: { toString(): string };
  fileUrl: string;
  fileName: string;
  skills: string[];
  missingSkills: string[];
  suggestedTopics: string[];
  experienceLevel?: string;
  overallScore?: number;
  summary?: string;
  analyzedAt?: Date;
}) {
  return {
    id: resume._id.toString(),
    fileUrl: resume.fileUrl,
    fileName: resume.fileName,
    skills: resume.skills,
    missingSkills: resume.missingSkills,
    suggestedTopics: resume.suggestedTopics,
    experienceLevel: resume.experienceLevel,
    overallScore: resume.overallScore,
    summary: resume.summary,
    analyzedAt: resume.analyzedAt,
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  await connectDB();
  const resume = await Resume.findOne({ userId: session.user.id })
    .sort({ analyzedAt: -1 })
    .lean();

  if (!resume) {
    return apiSuccess({ resume: null });
  }

  return apiSuccess({ resume: serializeResume(resume) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const pastedText = formData.get("text");

    let extractedText = "";
    let fileName = "pasted-resume.txt";
    let fileUrl = "";

    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_FILE_SIZE) {
        return apiError("File must be under 5MB", 400);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      extractedText = await extractTextFromFile(buffer, file.name);
      fileName = file.name;

      if (process.env.CLOUDINARY_CLOUD_NAME) {
        try {
          const base64 = `data:${file.type || "application/octet-stream"};base64,${buffer.toString("base64")}`;
          const uploaded = await cloudinary.uploader.upload(base64, {
            folder: "interview-ai/resumes",
            resource_type: "raw",
          });
          fileUrl = uploaded.secure_url;
        } catch (uploadError) {
          console.warn(
            "Cloudinary upload failed, continuing without file storage:",
            uploadError
          );
        }
      }
    } else if (typeof pastedText === "string" && pastedText.trim()) {
      extractedText = pastedText.trim().slice(0, 50_000);
      fileUrl = "inline";
    } else {
      return apiError("Please upload a PDF/TXT file or paste resume text", 400);
    }

    if (extractedText.trim().length < 50) {
      return apiError(
        "Could not extract enough text from the file. Try a text-based PDF or paste your resume.",
        400
      );
    }

    await connectDB();
    const user = await User.findById(session.user.id);
    const analysis = await analyzeResumeText(
      extractedText,
      user?.targetRole
    );

    const resume = await Resume.findOneAndUpdate(
      { userId: session.user.id },
      {
        userId: session.user.id,
        fileUrl: fileUrl || "local",
        fileName,
        extractedText: extractedText.slice(0, 10_000),
        skills: analysis.skills,
        missingSkills: analysis.missingSkills,
        suggestedTopics: analysis.suggestedTopics,
        experienceLevel: analysis.experienceLevel,
        overallScore: analysis.overallScore,
        summary: analysis.summary,
        analyzedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    if (analysis.skills.length > 0) {
      const mergedSkills = Array.from(
        new Set([...(user?.skills ?? []), ...analysis.skills])
      ).slice(0, 30);
      await User.findByIdAndUpdate(session.user.id, {
        skills: mergedSkills,
        ...(analysis.experienceLevel && !user?.experienceLevel
          ? { experienceLevel: analysis.experienceLevel }
          : {}),
      });
    }

    return apiSuccess({
      resume: serializeResume(resume),
      analysisSource: analysis.analysisSource,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return apiError(formatGeminiUserError(error), 500);
  }
}
