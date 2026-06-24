"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { ResumeUploader } from "@/components/resume/ResumeUploader";
import { SkillsAnalysis } from "@/components/resume/SkillsAnalysis";
import { GlowCard } from "@/components/ui/GlowCard";
import { ScoreRing } from "@/components/ui/ScoreRing";

interface ResumeData {
  id: string;
  fileName: string;
  fileUrl: string;
  skills: string[];
  missingSkills: string[];
  suggestedTopics: string[];
  experienceLevel?: string;
  overallScore?: number;
  summary?: string;
  analyzedAt?: string;
}

export default function ResumePage() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [pastedText, setPastedText] = useState("");

  const loadResume = useCallback(async () => {
    try {
      const res = await fetch("/api/resume");
      const data = await res.json();
      if (data.success) setResume(data.resume);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResume();
  }, [loadResume]);

  const analyze = async (file?: File) => {
    setAnalyzing(true);
    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      } else if (pastedText.trim()) {
        formData.append("text", pastedText.trim());
      } else {
        toast.error("Upload a file or paste your resume text");
        return;
      }

      const res = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.error ?? "Analysis failed");
        return;
      }

      setResume(data.resume);
      setPastedText("");
      toast.success("Resume analyzed successfully!");
    } catch {
      toast.error("Failed to upload resume");
    } finally {
      setAnalyzing(false);
    }
  };

  const onFile = (file: File) => {
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".pdf") && !lower.endsWith(".txt")) {
      toast.error("Only PDF and TXT files are supported");
      return;
    }
    analyze(file);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-intelligence-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold gradient-text">
          Resume Analyzer
        </h1>
        <p className="mt-1 text-text-secondary">
          Upload your resume for AI-powered scoring, skill extraction, and
          interview prep suggestions.
        </p>
      </div>

      <GlowCard>
        <ResumeUploader
          analyzing={analyzing}
          onFile={onFile}
          pastedText={pastedText}
          onPastedTextChange={setPastedText}
          onAnalyzeText={() => analyze()}
        />
      </GlowCard>

      {resume?.overallScore !== undefined && (
        <div className="grid gap-6 md:grid-cols-[auto_1fr]">
          <GlowCard className="flex flex-col items-center justify-center p-8">
            <ScoreRing
              score={resume.overallScore}
              size={140}
              label="Resume Score"
            />
            {resume.analyzedAt && (
              <p className="mt-3 text-xs text-text-secondary">
                Analyzed {format(new Date(resume.analyzedAt), "MMM d, yyyy")}
              </p>
            )}
            <p className="mt-1 text-xs text-text-secondary">{resume.fileName}</p>
          </GlowCard>

          <SkillsAnalysis
            skills={resume.skills}
            missingSkills={resume.missingSkills}
            suggestedTopics={resume.suggestedTopics}
            summary={resume.summary}
            experienceLevel={resume.experienceLevel}
          />
        </div>
      )}

      <GlowCard>
        <h2 className="font-display text-lg font-semibold text-text-primary">
          Next Steps
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Use your analysis to target weak areas in mock interviews.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/interview"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-to-r from-intelligence-primary to-intelligence-secondary px-4 text-sm font-medium text-white"
          >
            <MessageSquare className="size-4" />
            Start Mock Interview
          </Link>
          <Link
            href="/progress"
            className="inline-flex h-9 items-center rounded-lg border border-deep-border px-4 text-sm font-medium text-text-primary hover:bg-deep-border/50"
          >
            View Progress
          </Link>
        </div>
      </GlowCard>
    </div>
  );
}
