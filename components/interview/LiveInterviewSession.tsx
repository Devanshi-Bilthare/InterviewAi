"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  ChevronRight,
  Loader2,
  SkipForward,
} from "lucide-react";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { cn } from "@/lib/utils";
import type { EvaluationResult } from "@/lib/validations/interview";

type InterviewState =
  | "idle"
  | "recording"
  | "transcribing"
  | "evaluating"
  | "showing-results"
  | "next-question";

interface Question {
  id: string;
  question: string;
  expectedAnswer?: string;
  keyPoints: string[];
  difficulty: string;
  type: string;
}

interface SessionData {
  id: string;
  category: string;
  difficulty: string;
  status: string;
  questions: Question[];
}

interface LiveInterviewSessionProps {
  sessionId: string;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function LiveInterviewSession({ sessionId }: LiveInterviewSessionProps) {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [state, setState] = useState<InterviewState>("idle");
  const [transcript, setTranscript] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [showKeyPoints, setShowKeyPoints] = useState(false);
  const processedBlobRef = useRef<string | null>(null);

  const {
    isRecording,
    audioBlob,
    duration: recordingDuration,
    permissionDenied,
    start,
    stop,
    reset: resetRecorder,
  } = useAudioRecorder();

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/interview/sessions/${sessionId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSession(data.session);
    } catch {
      toast.error("Failed to load interview session");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuestionTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  useEffect(() => {
    if (isRecording) setState("recording");
  }, [isRecording]);

  const transcribeAndEvaluate = useCallback(
    async (blob: Blob, recDuration: number) => {
      setState("transcribing");
      try {
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");

        const transcribeRes = await fetch("/api/speech/transcribe", {
          method: "POST",
          body: formData,
        });
        const transcribeData = await transcribeRes.json();

        if (!transcribeRes.ok) {
          throw new Error(transcribeData.error ?? "Transcription failed");
        }

        setTranscript(transcribeData.transcript);
        setState("evaluating");

        const currentQuestion = session?.questions[currentIndex];
        if (!currentQuestion) return;

        const evalRes = await fetch("/api/interview/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            transcript: transcribeData.transcript,
            sessionId,
            duration: recDuration,
          }),
        });

        const evalData = await evalRes.json();
        if (!evalRes.ok) {
          throw new Error(evalData.error ?? "Evaluation failed");
        }

        setEvaluation(evalData.evaluation);
        setShowKeyPoints(true);
        setState("showing-results");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to process answer"
        );
        setState("idle");
        resetRecorder();
        processedBlobRef.current = null;
      }
    },
    [session, currentIndex, sessionId, resetRecorder]
  );

  useEffect(() => {
    if (
      audioBlob &&
      !isRecording &&
      state !== "transcribing" &&
      state !== "evaluating" &&
      state !== "showing-results"
    ) {
      const blobId = `${audioBlob.size}-${recordingDuration}`;
      if (processedBlobRef.current === blobId) return;
      processedBlobRef.current = blobId;
      transcribeAndEvaluate(audioBlob, recordingDuration);
    }
  }, [
    audioBlob,
    isRecording,
    recordingDuration,
    state,
    transcribeAndEvaluate,
  ]);

  const handleRecordToggle = async () => {
    if (state === "transcribing" || state === "evaluating") return;
    if (isRecording) {
      stop();
    } else {
      processedBlobRef.current = null;
      setTranscript("");
      setEvaluation(null);
      setShowKeyPoints(false);
      await start();
    }
  };

  const handleSkip = () => {
    if (currentIndex < (session?.questions.length ?? 0) - 1) {
      setCurrentIndex((i) => i + 1);
      setState("idle");
      setTranscript("");
      setEvaluation(null);
      setShowKeyPoints(false);
      setQuestionTimer(0);
      resetRecorder();
      processedBlobRef.current = null;
    } else {
      router.push(`/interview/results/${sessionId}`);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < (session?.questions.length ?? 0) - 1) {
      setCurrentIndex((i) => i + 1);
      setState("next-question");
      setTimeout(() => {
        setState("idle");
        setTranscript("");
        setEvaluation(null);
        setShowKeyPoints(false);
        setQuestionTimer(0);
        resetRecorder();
        processedBlobRef.current = null;
      }, 300);
    } else {
      router.push(`/interview/results/${sessionId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-intelligence-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center text-text-secondary">
        Session not found.
      </div>
    );
  }

  const currentQuestion = session.questions[currentIndex];
  const totalQuestions = session.questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const questionPanel = (
    <motion.div
      key={`q-${currentIndex}`}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="glass-card rounded-2xl p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-intelligence-primary/15 px-3 py-1 text-xs font-semibold text-intelligence-primary">
          Question {currentIndex + 1}/{totalQuestions}
        </span>
        <span className="font-mono text-sm text-text-secondary">
          {formatTime(questionTimer)}
        </span>
      </div>

      <h2 className="text-xl font-medium leading-relaxed text-text-primary md:text-2xl">
        {currentQuestion?.question}
      </h2>

      <AnimatePresence>
        {showKeyPoints && currentQuestion?.keyPoints.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-2"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Key Points
            </p>
            <ul className="space-y-1">
              {currentQuestion.keyPoints.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-text-secondary"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-intelligence-primary" />
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSkip}
        className="text-text-secondary hover:text-text-primary"
      >
        <SkipForward className="size-4" />
        Skip Question
      </Button>
    </motion.div>
  );

  const recordingPanel = (
    <div className="glass-card rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-12 items-center justify-center rounded-full",
                state === "recording"
                  ? "bg-intelligence-primary/20 animate-pulse"
                  : "bg-deep-border"
              )}
            >
              <Bot
                className={cn(
                  "size-6",
                  state === "recording"
                    ? "text-intelligence-primary"
                    : "text-text-secondary"
                )}
              />
            </div>
            <div>
              <p className="font-medium text-text-primary">AI Interviewer</p>
              <p className="text-sm text-text-secondary">
                {state === "idle" && "Ready when you are"}
                {state === "recording" && "Listening..."}
                {state === "transcribing" && "Converting speech..."}
                {state === "evaluating" && "Analyzing your answer (this may take a moment)..."}
                {state === "showing-results" && "Here's your feedback"}
                {state === "next-question" && "Moving to next question..."}
              </p>
            </div>
          </div>

          {state === "recording" && (
            <div className="flex h-10 items-end justify-center gap-1">
              {Array.from({ length: 16 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-intelligence-primary"
                  animate={{ height: [8, 24 + Math.random() * 16, 8] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>
          )}

          <div className="flex flex-col items-center gap-3 py-4">
            <button
              type="button"
              onClick={handleRecordToggle}
              disabled={
                permissionDenied ||
                state === "transcribing" ||
                state === "evaluating"
              }
              className={cn(
                "relative flex size-20 items-center justify-center rounded-full transition-all",
                isRecording
                  ? "bg-danger shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse"
                  : "bg-intelligence-primary/20 hover:bg-intelligence-primary/30 hover:shadow-glow",
                (permissionDenied ||
                  state === "transcribing" ||
                  state === "evaluating") &&
                  "opacity-50 cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "size-8 rounded-full",
                  isRecording ? "bg-white" : "bg-danger"
                )}
              />
            </button>
            <p className="font-mono text-sm text-text-secondary">
              {formatTime(isRecording ? recordingDuration : 0)}
            </p>
            {isRecording && (
              <Button
                onClick={handleRecordToggle}
                className="mt-1 border-0 bg-gradient-to-r from-intelligence-primary to-intelligence-secondary text-white hover:opacity-90"
              >
                Stop & Analyze
              </Button>
            )}
            {!isRecording && state === "idle" && (
              <p className="text-xs text-text-secondary">
                Tap the red button to start recording
              </p>
            )}
          </div>

          {(state === "transcribing" || state === "evaluating") && (
            <div className="flex items-center justify-center gap-2 py-4 text-text-secondary">
              <Loader2 className="size-5 animate-spin text-intelligence-primary" />
              <span>
                {state === "transcribing"
                  ? "Transcribing your answer..."
                  : "Evaluating with AI..."}
              </span>
            </div>
          )}

          {transcript && (
            <div className="rounded-lg border border-deep-border bg-deep-bg/50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase text-text-secondary">
                Your Answer
              </p>
              <p className="text-sm leading-relaxed text-text-primary">
                {transcript}
              </p>
            </div>
          )}

          {evaluation && state === "showing-results" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-center">
                <ScoreRing
                  score={evaluation.overallScore}
                  size={100}
                  label="Answer Score"
                />
              </div>

              <Accordion>
                <AccordionItem value="strengths">
                  <AccordionTrigger className="text-sm text-success">
                    Strengths
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 text-sm text-text-secondary">
                      {evaluation.strengths.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="weaknesses">
                  <AccordionTrigger className="text-sm text-warning">
                    Areas to Improve
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 text-sm text-text-secondary">
                      {evaluation.weaknesses.map((w, i) => (
                        <li key={i}>• {w}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Button
                onClick={handleNextQuestion}
                className="w-full bg-gradient-to-r from-intelligence-primary to-intelligence-secondary text-white border-0"
              >
                {currentIndex < totalQuestions - 1 ? (
                  <>
                    Next Question
                    <ChevronRight className="size-4" />
                  </>
                ) : (
                  "View Results"
                )}
              </Button>
            </motion.div>
          )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Progress value={progress} className="h-2" />

      <div className="hidden gap-6 lg:grid lg:grid-cols-2">
        {questionPanel}
        {recordingPanel}
      </div>

      <div className="lg:hidden">
        <Tabs defaultValue="question" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-2 bg-deep-bg">
            <TabsTrigger value="question">Question</TabsTrigger>
            <TabsTrigger value="recorder">Recorder</TabsTrigger>
          </TabsList>
          <TabsContent value="question">{questionPanel}</TabsContent>
          <TabsContent value="recorder">{recordingPanel}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
