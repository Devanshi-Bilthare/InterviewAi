"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RotateCcw, Share2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import {
  staggerContainer,
  staggerItem,
} from "@/components/layout/PageTransition";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GlowCard } from "@/components/ui/GlowCard";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResultsData {
  session: {
    id: string;
    category: string;
    interviewType?: string;
    overallScore?: number;
    status: string;
    duration?: number;
    aiConversation?: Array<{
      role: string;
      content: string;
      timestamp?: string;
    }>;
  };
  questions: Array<{
    id: string;
    question: string;
    keyPoints: string[];
  }>;
  evaluations: Array<{
    id: string;
    questionId?: string;
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    missedKeyPoints: string[];
    idealAnswer?: string;
  }>;
  answers: Array<{
    id: string;
    questionId: string;
    transcript?: string;
  }>;
}

export default function InterviewResultsPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch(`/api/interview/sessions/${params.sessionId}`);
        const json = await res.json();
        if (res.ok) {
          setData({
            session: json.session,
            questions: json.session.questions,
            evaluations: json.evaluations,
            answers: json.answers,
          });
        }
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [params.sessionId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-intelligence-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-center text-text-secondary">Results not found.</p>
    );
  }

  const { session, questions, evaluations, answers } = data;

  const handleShare = async () => {
    const text = `I scored ${session.overallScore ?? 0}/100 on my ${session.category} mock interview on InterviewAI!`;
    if (navigator.share) {
      await navigator.share({ title: "InterviewAI Results", text });
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Results copied to clipboard!");
    }
  };

  const isAIConversation = session.interviewType === "ai-conversational";
  const aiConversation = session.aiConversation ?? [];

  return (
    <motion.div
      className="mx-auto max-w-4xl space-y-8"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div className="text-center" variants={staggerItem}>
        <h1 className="font-display text-3xl font-bold gradient-text">
          Interview Results
        </h1>
        <p className="mt-1 text-text-secondary">
          {session.category}
          {isAIConversation && " · AI Conversation"}
        </p>
      </motion.div>

      <motion.div className="flex justify-center" variants={staggerItem}>
        <ScoreRing
          score={session.overallScore ?? 0}
          size={160}
          label="Overall Score"
        />
      </motion.div>

      <motion.div className="space-y-3" variants={staggerItem}>
        <h2 className="font-display text-xl font-semibold text-text-primary">
          {isAIConversation ? "Conversation Transcript" : "Question Breakdown"}
        </h2>
        {isAIConversation ? (
          <Accordion className="space-y-2">
            {aiConversation.map((msg, index) => (
              <AccordionItem
                key={`${index}-${msg.role}`}
                value={`msg-${index}`}
                className="glass-card rounded-xl border-deep-border px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left text-sm font-medium text-text-primary">
                    {msg.role === "user" ? "You" : "Interviewer"}:{" "}
                    {msg.content.slice(0, 80)}
                    {msg.content.length > 80 ? "..." : ""}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      msg.role === "user"
                        ? "text-indigo-300"
                        : "text-text-primary"
                    )}
                  >
                    {msg.content}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
        <Accordion className="space-y-2">
          {questions.map((question, index) => {
            const evaluation = evaluations.find(
              (e) => e.questionId === question.id
            );
            const answer = answers.find(
              (a) => a.questionId === question.id
            );

            return (
              <AccordionItem
                key={question.id}
                value={question.id}
                className="glass-card rounded-xl border-deep-border px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-1 items-center justify-between pr-4">
                    <span className="text-left text-sm font-medium text-text-primary">
                      Q{index + 1}: {question.question.slice(0, 60)}...
                    </span>
                    {evaluation && (
                      <span className="font-mono text-sm font-bold text-intelligence-primary">
                        {evaluation.overallScore}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <p className="text-sm text-text-primary">
                    {question.question}
                  </p>
                  {answer?.transcript && (
                    <div className="rounded-lg bg-deep-bg/50 p-3">
                      <p className="text-xs font-semibold text-text-secondary mb-1">
                        Your Answer
                      </p>
                      <p className="text-sm text-text-primary">
                        {answer.transcript}
                      </p>
                    </div>
                  )}
                  {evaluation && (
                    <>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold text-success mb-1">
                            Strengths
                          </p>
                          <ul className="text-xs text-text-secondary space-y-0.5">
                            {evaluation.strengths.map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-intelligence-primary mb-1">
                            Suggestions
                          </p>
                          <ul className="text-xs text-text-secondary space-y-0.5">
                            {evaluation.suggestions.map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </>
                  )}
                  {!evaluation && (
                    <p className="text-xs text-text-secondary">Skipped</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        )}
      </motion.div>

      <motion.div
        className="flex flex-wrap justify-center gap-4"
        variants={staggerItem}
      >
        <Link
          href="/interview"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-intelligence-primary to-intelligence-secondary px-4 text-sm font-medium text-white"
        >
          <RotateCcw className="size-4" />
          Retake Interview
        </Link>
        <Link
          href="/progress"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-deep-border px-4 text-sm font-medium text-text-primary hover:bg-deep-border/50"
        >
          <TrendingUp className="size-4" />
          View Progress
        </Link>
        <Button
          variant="outline"
          onClick={handleShare}
          className="border-deep-border"
        >
          <Share2 className="size-4" />
          Share Results
        </Button>
      </motion.div>

      <motion.div variants={staggerItem}>
      <GlowCard className="text-center">
        <p className="text-sm text-text-secondary">
          Keep practicing to improve your scores. Consistent mock interviews are
          the fastest path to interview confidence.
        </p>
      </GlowCard>
      </motion.div>
    </motion.div>
  );
}
