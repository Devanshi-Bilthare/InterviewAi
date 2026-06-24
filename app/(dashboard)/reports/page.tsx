"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Download,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { GlowCard } from "@/components/ui/GlowCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Report {
  id: string;
  reportType: string;
  overallAssessment: string;
  strengths: string[];
  areasToImprove: string[];
  recommendedSkills: Array<{
    skill: string;
    priority: string;
    reason: string;
  }>;
  recommendedProjects: Array<{
    title: string;
    description: string;
    skills: string[];
  }>;
  thirtyDayRoadmap: Array<{
    week: number;
    focus: string;
    tasks: string[];
  }>;
  interviewsAnalyzed: number;
  averageScore: number;
  generatedAt?: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [canGenerate, setCanGenerate] = useState(false);
  const [interviewsSinceLast, setInterviewsSinceLast] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState<Report | null>(null);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      if (res.ok) {
        setReports(data.reports);
        setCanGenerate(data.canGenerate);
        setInterviewsSinceLast(data.interviewsSinceLastReport);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/reports", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to generate report");
        return;
      }
      toast.success("Report generated successfully!");
      setSelected(data.report);
      await fetchReports();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-intelligence-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold gradient-text">
            Career Reports
          </h1>
          <p className="mt-1 text-text-secondary">
            AI-generated assessments of your interview performance
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generating || (!canGenerate && reports.length > 0)}
          className="border-0 bg-gradient-to-r from-intelligence-primary to-intelligence-secondary text-white"
        >
          {generating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Generate New Report
        </Button>
      </div>

      {!canGenerate && reports.length > 0 && (
        <p className="text-sm text-text-secondary">
          Complete {10 - interviewsSinceLast} more interview(s) since your last
          report to unlock a new generation.
        </p>
      )}

      {reports.length === 0 ? (
        <GlowCard className="text-center">
          <FileText className="mx-auto size-12 text-text-secondary" />
          <p className="mt-4 text-text-secondary">
            No reports yet. Complete interviews and generate your first AI career
            report.
          </p>
        </GlowCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((report) => (
            <GlowCard
              key={report.id}
              className="cursor-pointer"
              hoverScale={1.01}
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setSelected(report)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase text-text-secondary">
                      {report.reportType} report
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold text-text-primary">
                      {report.generatedAt
                        ? format(new Date(report.generatedAt), "MMMM d, yyyy")
                        : "Report"}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-intelligence-primary">
                    {report.averageScore}/100
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
                  {report.overallAssessment}
                </p>
                <p className="mt-3 text-xs text-text-secondary">
                  {report.interviewsAnalyzed} interviews analyzed
                </p>
              </button>
            </GlowCard>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-deep-border bg-deep-bg print:max-h-none">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display gradient-text">
                  Career Report —{" "}
                  {selected.generatedAt
                    ? format(new Date(selected.generatedAt), "MMM d, yyyy")
                    : ""}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 print:text-black">
                <section>
                  <h3 className="font-semibold text-text-primary">
                    Overall Assessment
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {selected.overallAssessment}
                  </p>
                </section>

                <section className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-semibold text-success">
                      Strengths
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                      {selected.strengths.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-warning">
                      Areas to Improve
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                      {selected.areasToImprove.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section>
                  <h4 className="font-semibold text-text-primary">
                    Recommended Skills
                  </h4>
                  <div className="mt-2 space-y-2">
                    {selected.recommendedSkills.map((skill, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-deep-border p-3"
                      >
                        <p className="font-medium text-text-primary">
                          {skill.skill}{" "}
                          <span
                            className={cn(
                              "text-xs uppercase",
                              skill.priority === "high"
                                ? "text-danger"
                                : "text-text-secondary"
                            )}
                          >
                            ({skill.priority})
                          </span>
                        </p>
                        <p className="text-sm text-text-secondary">
                          {skill.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="font-semibold text-text-primary">
                    Recommended Projects
                  </h4>
                  <div className="mt-2 space-y-2">
                    {selected.recommendedProjects.map((project, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-deep-border p-3"
                      >
                        <p className="font-medium text-text-primary">
                          {project.title}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {project.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="font-semibold text-text-primary">
                    30-Day Roadmap
                  </h4>
                  <div className="mt-2 space-y-3">
                    {selected.thirtyDayRoadmap.map((week) => (
                      <div
                        key={week.week}
                        className="rounded-lg border border-deep-border p-3"
                      >
                        <p className="font-medium text-text-primary">
                          Week {week.week}: {week.focus}
                        </p>
                        <ul className="mt-1 text-sm text-text-secondary">
                          {week.tasks.map((task, i) => (
                            <li key={i}>• {task}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>

                <Button
                  variant="outline"
                  onClick={handleDownloadPdf}
                  className="border-deep-border print:hidden"
                >
                  <Download className="size-4" />
                  Download as PDF
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
