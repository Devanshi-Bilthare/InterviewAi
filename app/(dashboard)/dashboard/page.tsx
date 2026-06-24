"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  FileText,
  Flame,
  Loader2,
  MessageSquare,
  Play,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";

import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { PerformanceRadar } from "@/components/dashboard/PerformanceRadar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { GlowCard } from "@/components/ui/GlowCard";
import { ScoreRing } from "@/components/ui/ScoreRing";
import {
  staggerContainer,
  staggerItem,
} from "@/components/layout/PageTransition";
import { getCategoryById } from "@/lib/interview-categories";
import type { DimensionScores } from "@/types";

interface DashboardData {
  greeting: string;
  quote: string;
  user: { name: string; totalInterviews: number; averageScore: number };
  stats: {
    totalInterviews: number;
    interviewTrend: number;
    averageScore: number;
    scoreTrend: number;
    codingSolved: number;
    streak: number;
  };
  lastIncompleteSession: {
    id: string;
    category: string;
    interviewType: string;
    status: string;
  } | null;
  recentSessions: Array<{
    id: string;
    category: string;
    overallScore: number;
    completedAt?: string;
  }>;
  dimensionAverages: DimensionScores;
  weakestTopic: { category: string; score: number } | null;
  resumeScore: number | null;
  activityHeatmap: Array<{ date: string; count: number; avgScore: number }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/progress?range=30d");
        const json = await res.json();
        if (res.ok) setData(json);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-intelligence-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-center text-text-secondary">
        Unable to load dashboard data.
      </p>
    );
  }

  const radarData = [
    { dimension: "Relevance", score: data.dimensionAverages.relevance },
    { dimension: "Technical", score: data.dimensionAverages.technicalAccuracy },
    { dimension: "Communication", score: data.dimensionAverages.communication },
    { dimension: "Confidence", score: data.dimensionAverages.confidence },
    { dimension: "Completeness", score: data.dimensionAverages.completeness },
  ];

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {/* Row 1 */}
      <motion.div className="grid gap-4 lg:grid-cols-5" variants={staggerItem}>
        <GlowCard className="lg:col-span-2">
          <p className="text-sm text-text-secondary">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">
            {data.greeting}, {data.user.name.split(" ")[0]}! 👋
          </h1>
          <p className="mt-3 text-sm italic text-text-secondary">
            &ldquo;{data.quote}&rdquo;
          </p>
        </GlowCard>

        <StatsCard
          title="Total Interviews"
          value={data.stats.totalInterviews}
          change={data.stats.interviewTrend}
          icon={MessageSquare}
          color="primary"
        />
        <StatsCard
          title="Average Score"
          value={data.stats.averageScore}
          change={data.stats.scoreTrend}
          icon={TrendingUp}
          color="success"
        >
          <ScoreRing score={data.stats.averageScore} size={56} />
        </StatsCard>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 lg:col-span-1">
          <StatsCard
            title="Coding Solved"
            value={data.stats.codingSolved}
            icon={Code2}
            color="warning"
          />
          <StatsCard
            title="Current Streak"
            value={data.stats.streak}
            icon={Flame}
            color="danger"
            suffix="🔥 days"
          />
        </div>
      </motion.div>

      {/* Row 2 */}
      <motion.div className="grid gap-4 lg:grid-cols-5" variants={staggerItem}>
        <div className="space-y-4 lg:col-span-3">
          {data.lastIncompleteSession && (
            <GlowCard>
              <h2 className="font-display text-lg font-semibold text-text-primary">
                Continue Where You Left Off
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {getCategoryById(data.lastIncompleteSession.category)?.name ??
                  data.lastIncompleteSession.category}{" "}
                · {data.lastIncompleteSession.interviewType}
              </p>
              <Link
                href={
                  data.lastIncompleteSession.interviewType ===
                  "ai-conversational"
                    ? "/interview"
                    : `/interview/${data.lastIncompleteSession.id}`
                }
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-to-r from-intelligence-primary to-intelligence-secondary px-4 text-sm font-medium text-white"
              >
                <Play className="size-4" />
                Resume Session
              </Link>
            </GlowCard>
          )}

          <GlowCard>
            <h2 className="mb-4 font-display text-lg font-semibold text-text-primary">
              Recent Interview Sessions
            </h2>
            <div className="space-y-3">
              {data.recentSessions.length === 0 ? (
                <p className="text-sm text-text-secondary">
                  No completed interviews yet. Start your first mock interview!
                </p>
              ) : (
                data.recentSessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-deep-border bg-deep-bg/40 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-text-primary">
                        {getCategoryById(s.category)?.name ?? s.category}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {s.completedAt
                          ? format(new Date(s.completedAt), "MMM d, yyyy")
                          : "In progress"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-intelligence-primary">
                        {s.overallScore}
                      </span>
                      <Link
                        href={`/interview/results/${s.id}`}
                        className="text-xs text-intelligence-primary hover:underline"
                      >
                        View Results
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlowCard>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <PerformanceRadar data={radarData} />

          {data.weakestTopic && (
            <GlowCard className="border-danger/20">
              <div className="rounded-lg bg-danger/5 p-4">
                <p className="text-xs font-semibold uppercase text-danger">
                  Weakest Topic
                </p>
                <p className="mt-1 font-display text-lg font-semibold text-text-primary">
                  {getCategoryById(data.weakestTopic.category)?.name ??
                    data.weakestTopic.category}
                </p>
                <p className="text-sm text-text-secondary">
                  Avg score: {data.weakestTopic.score}/100
                </p>
              </div>
            </GlowCard>
          )}

          <GlowCard>
            <p className="text-sm font-medium text-text-secondary">
              Resume Score
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-text-primary">
              {data.resumeScore ?? "—"}
              {data.resumeScore !== null && (
                <span className="text-base text-text-secondary">/100</span>
              )}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-deep-border">
              <div
                className="h-full rounded-full bg-gradient-to-r from-intelligence-primary to-intelligence-secondary transition-all"
                style={{ width: `${data.resumeScore ?? 0}%` }}
              />
            </div>
            {!data.resumeScore && (
              <p className="mt-2 text-xs text-text-secondary">
                Upload your resume to get a score
              </p>
            )}
          </GlowCard>
        </div>
      </motion.div>

      {/* Row 3 — Quick Actions */}
      <motion.div variants={staggerItem}>
      <GlowCard>
        <h2 className="mb-4 font-display text-lg font-semibold text-text-primary">
          Quick Actions
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/interview"
            className="inline-flex h-11 items-center rounded-lg bg-gradient-to-r from-intelligence-primary to-intelligence-secondary px-6 text-sm font-medium text-white hover:opacity-90"
          >
            Start New Interview
          </Link>
          <Link
            href="/coding"
            className="inline-flex h-11 items-center rounded-lg border border-intelligence-primary/40 px-6 text-sm font-medium text-intelligence-primary hover:bg-intelligence-primary/10"
          >
            Practice Coding
          </Link>
          <Link
            href="/resume"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-deep-border px-6 text-sm font-medium text-text-primary hover:bg-deep-border/50"
          >
            <FileText className="size-4" />
            Upload Resume
          </Link>
          <Link
            href="/reports"
            className="text-sm text-intelligence-primary hover:underline"
          >
            View Full Report →
          </Link>
        </div>
      </GlowCard>
      </motion.div>

      {/* Row 4 — Activity */}
      <motion.div variants={staggerItem}>
      <GlowCard>
        <h2 className="mb-4 font-display text-lg font-semibold text-text-primary">
          Interview Activity
        </h2>
        <p className="mb-3 text-sm text-text-secondary">Last 30 days</p>
        <ActivityHeatmap data={data.activityHeatmap} />
      </GlowCard>
      </motion.div>
    </motion.div>
  );
}
