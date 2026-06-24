"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Minus,
  PanelLeft,
  PanelRight,
  Play,
  Plus,
  RotateCcw,
  Send,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";

import {
  CodeEditor,
  getStarterCode,
} from "@/components/coding/CodeEditor";
import {
  ConsolePanel,
  type ConsoleTestResult,
} from "@/components/coding/ConsolePanel";
import { MarkdownRenderer } from "@/components/coding/MarkdownRenderer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { CodingLanguage, StarterCode } from "@/types";

interface ProblemData {
  id: string;
  problemNumber?: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
  hints: string[];
  starterCode: StarterCode;
  acceptanceRate: number;
}

interface Submission {
  id: string;
  language: string;
  status: string;
  passedTestCases: number;
  totalTestCases: number;
  submittedAt?: string;
}

export default function CodingProblemPage({
  params,
}: {
  params: { problemId: string };
}) {
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<CodingLanguage>("javascript");
  const [code, setCode] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark");
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<ConsoleTestResult[]>([]);
  const [summary, setSummary] = useState<{
    status: string;
    passedCases?: number;
    totalCases?: number;
    executionTime?: number;
    memory?: number;
  }>();
  const [mobilePanel, setMobilePanel] = useState<"problem" | "editor">("editor");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/coding/problems/${params.problemId}`);
        const data = await res.json();
        if (res.ok) {
          setProblem(data.problem);
          setSubmissions(data.submissions);
          setCode(getStarterCode(data.problem.starterCode, "javascript"));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.problemId]);

  const handleLanguageChange = (value: CodingLanguage) => {
    setLanguage(value);
    if (problem) {
      setCode(getStarterCode(problem.starterCode, value));
    }
  };

  const handleReset = () => {
    if (problem) setCode(getStarterCode(problem.starterCode, language));
  };

  const handleRun = useCallback(async () => {
    if (!problem) return;
    setRunning(true);
    setConsoleOpen(true);
    setResults([]);
    try {
      const res = await fetch("/api/coding/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          problemId: problem.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Execution failed");
        return;
      }
      setResults(data.results ?? []);
      setSummary({
        status: data.status,
        passedCases: data.passedCases,
        totalCases: data.totalCases,
      });
    } catch {
      toast.error("Failed to run tests");
    } finally {
      setRunning(false);
    }
  }, [code, language, problem]);

  const handleSubmit = async () => {
    if (!problem) return;
    setSubmitting(true);
    setConsoleOpen(true);
    try {
      const res = await fetch("/api/coding/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          problemId: problem.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Submission failed");
        return;
      }
      setResults(data.results ?? []);
      setSummary({
        status: data.status,
        passedCases: data.passedCases,
        totalCases: data.totalCases,
        executionTime: data.executionTime,
        memory: data.memory,
      });
      if (data.status === "accepted") {
        toast.success("All test cases passed!");
      } else {
        toast.error(`${data.passedCases}/${data.totalCases} test cases passed`);
      }
      const refresh = await fetch(`/api/coding/problems/${params.problemId}`);
      const refreshData = await refresh.json();
      if (refresh.ok) setSubmissions(refreshData.submissions);
    } catch {
      toast.error("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-intelligence-primary" />
      </div>
    );
  }

  if (!problem) {
    return (
      <p className="text-center text-text-secondary">
        Problem not found.{" "}
        <Link href="/coding" className="text-intelligence-primary">
          Back to list
        </Link>
      </p>
    );
  }

  return (
    <div className="-m-4 flex h-[calc(100dvh-4rem)] flex-col md:-m-6">
      <div className="flex items-center gap-2 border-b border-deep-border bg-deep-card/40 px-3 py-2 md:hidden">
        <Button
          variant={mobilePanel === "problem" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMobilePanel("problem")}
          className="flex-1"
        >
          <PanelLeft className="size-4" />
          Problem
        </Button>
        <Button
          variant={mobilePanel === "editor" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMobilePanel("editor")}
          className="flex-1"
        >
          <PanelRight className="size-4" />
          Editor
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[2fr_3fr]">
        {/* Left — Problem */}
        <div
          className={cn(
            "overflow-y-auto border-r border-deep-border bg-deep-card/30 p-5",
            mobilePanel !== "problem" && "hidden lg:block"
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-text-secondary">
                #{problem.problemNumber} · {problem.category}
              </p>
              <h1 className="font-display text-xl font-bold text-text-primary">
                {problem.title}
              </h1>
            </div>
            <Badge
              className={cn(
                "border-0 capitalize",
                problem.difficulty === "easy" && "bg-success/15 text-success",
                problem.difficulty === "medium" && "bg-warning/15 text-warning",
                problem.difficulty === "hard" && "bg-danger/15 text-danger"
              )}
            >
              {problem.difficulty}
            </Badge>
          </div>

          <Tabs defaultValue="description">
            <TabsList className="mb-4 bg-deep-bg">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="solutions">Solutions</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-5">
              <MarkdownRenderer content={problem.description} />

              <div>
                <h3 className="mb-2 font-display text-sm font-semibold text-text-primary">
                  Examples
                </h3>
                {problem.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="mb-3 rounded-lg border border-deep-border bg-deep-bg/50 p-3"
                  >
                    <p className="font-mono text-xs text-text-secondary">
                      Input: {ex.input}
                    </p>
                    <p className="mt-1 font-mono text-xs text-intelligence-primary">
                      Output: {ex.output}
                    </p>
                    {ex.explanation && (
                      <p className="mt-2 text-xs text-text-secondary">
                        {ex.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {problem.constraints.length > 0 && (
                <div>
                  <h3 className="mb-2 font-display text-sm font-semibold text-text-primary">
                    Constraints
                  </h3>
                  <ul className="space-y-1 text-sm text-text-secondary">
                    {problem.constraints.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {problem.hints.length > 0 && (
                <Accordion>
                  <AccordionItem value="hints">
                    <AccordionTrigger className="text-sm text-intelligence-primary">
                      Hints
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-sm text-text-secondary">
                        {problem.hints.map((hint, i) => (
                          <li key={i}>
                            {i + 1}. {hint}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </TabsContent>

            <TabsContent value="submissions">
              {submissions.length === 0 ? (
                <p className="text-sm text-text-secondary">No submissions yet.</p>
              ) : (
                <div className="space-y-2">
                  {submissions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-lg border border-deep-border px-3 py-2 text-sm"
                    >
                      <span className="capitalize text-text-primary">
                        {s.status.replace("-", " ")}
                      </span>
                      <span className="text-text-secondary">
                        {s.passedTestCases}/{s.totalTestCases} · {s.language}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="solutions">
              <p className="text-sm text-text-secondary">
                Solve the problem first to unlock detailed solutions.
              </p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right — Editor */}
        <div
          className={cn(
            "flex min-h-0 flex-col",
            mobilePanel !== "editor" && "hidden lg:flex"
          )}
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-deep-border bg-deep-card/40 px-3 py-2">
            <Select
              value={language}
              onValueChange={(v) => handleLanguageChange(v as CodingLanguage)}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setFontSize((s) => Math.max(12, s - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-8 text-center text-xs text-text-secondary">
                {fontSize}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setFontSize((s) => Math.min(20, s + 1))}
              >
                <Plus className="size-4" />
              </Button>
            </div>

            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="size-4" />
              Reset
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setTheme((t) => (t === "vs-dark" ? "light" : "vs-dark"))
              }
            >
              {theme === "vs-dark" ? "Dark" : "Light"}
            </Button>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConsoleOpen((o) => !o)}
              >
                <Terminal className="size-4" />
                Console
              </Button>
              <Button
                size="sm"
                onClick={handleRun}
                disabled={running || submitting}
                className="border-0 bg-success text-white hover:bg-success/90"
              >
                {running ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Play className="size-4" />
                )}
                Run Tests
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={running || submitting}
                className="border-0 bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Submit
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1">
            <CodeEditor
              language={language}
              value={code}
              onChange={setCode}
              onRun={handleRun}
              fontSize={fontSize}
              theme={theme}
            />
          </div>

          <ConsolePanel
            open={consoleOpen}
            loading={running || submitting}
            results={results}
            summary={summary}
          />
        </div>
      </div>
    </div>
  );
}
