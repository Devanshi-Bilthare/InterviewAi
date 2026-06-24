"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  Download,
  Loader2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";

import {
  CHART_COLORS,
  ChartTooltip,
  ProgressChart,
  chartAxisStyle,
} from "@/components/dashboard/ProgressChart";
import { GlowCard } from "@/components/ui/GlowCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCategoryById } from "@/lib/interview-categories";
import { cn } from "@/lib/utils";

type DateRange = "7d" | "30d" | "90d" | "all";

interface ProgressData {
  stats: { streak: number };
  scoreOverTime: Array<{
    date: string;
    overall: number;
    technical: number;
    communication: number;
    sessionId: string;
    category: string;
  }>;
  categoryBreakdown: Array<{
    category: string;
    avgScore: number;
    count: number;
  }>;
  codingProgress: {
    byDifficulty: { easy: number; medium: number; hard: number };
    overTime: Array<{ date: string; count: number }>;
    byLanguage: Array<{ language: string; count: number }>;
    totalSolved: number;
  };
  milestones: Array<{ id: string; title: string; achieved: boolean }>;
}

const CATEGORY_COLORS = [
  "#6366F1",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#61DAFB",
  "#47A248",
  "#E76F00",
];

export default function ProgressPage() {
  const router = useRouter();
  const [range, setRange] = useState<DateRange>("30d");
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/progress?range=${range}`);
      const json = await res.json();
      if (res.ok) setData(json);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportPdf = () => {
    window.print();
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-intelligence-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-center text-text-secondary">Unable to load progress.</p>
    );
  }

  const pieData = [
    { name: "Easy", value: data.codingProgress.byDifficulty.easy, color: CHART_COLORS.success },
    { name: "Medium", value: data.codingProgress.byDifficulty.medium, color: CHART_COLORS.warning },
    { name: "Hard", value: data.codingProgress.byDifficulty.hard, color: CHART_COLORS.danger },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8 print:space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold gradient-text">
            Progress Analytics
          </h1>
          <p className="mt-1 text-text-secondary">
            Track your interview and coding improvement over time
          </p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <Tabs
            value={range}
            onValueChange={(v) => setRange(v as DateRange)}
          >
            <TabsList className="bg-deep-card border border-deep-border">
              <TabsTrigger value="7d">7 days</TabsTrigger>
              <TabsTrigger value="30d">30 days</TabsTrigger>
              <TabsTrigger value="90d">90 days</TabsTrigger>
              <TabsTrigger value="all">All time</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" onClick={handleExportPdf} className="border-deep-border">
            <Download className="size-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Score Over Time */}
      <GlowCard>
        <h2 className="mb-4 font-display text-xl font-semibold text-text-primary">
          Score Over Time
        </h2>
        <ProgressChart height={300}>
          <LineChart
            data={data.scoreOverTime}
            onClick={(state) => {
              const chartState = state as {
                activePayload?: Array<{ payload?: { sessionId?: string } }>;
              };
              const point = chartState.activePayload?.[0]?.payload;
              if (point?.sessionId) {
                router.push(`/interview/results/${point.sessionId}`);
              }
            }}
          >
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis dataKey="date" {...chartAxisStyle} />
            <YAxis domain={[0, 100]} {...chartAxisStyle} />
            <ChartTooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="overall"
              name="Overall"
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              dot={{ r: 4, cursor: "pointer" }}
            />
            <Line
              type="monotone"
              dataKey="technical"
              name="Technical"
              stroke={CHART_COLORS.secondary}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="communication"
              name="Communication"
              stroke={CHART_COLORS.success}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ProgressChart>
      </GlowCard>

      {/* Category Breakdown */}
      <GlowCard>
        <h2 className="mb-4 font-display text-xl font-semibold text-text-primary">
          Category Breakdown
        </h2>
        <ProgressChart height={280}>
          <BarChart data={data.categoryBreakdown}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="category"
              tickFormatter={(v) =>
                getCategoryById(v)?.name?.slice(0, 10) ?? v
              }
              {...chartAxisStyle}
            />
            <YAxis domain={[0, 100]} {...chartAxisStyle} />
            <ChartTooltip />
            <Bar dataKey="avgScore" name="Avg Score" radius={[6, 6, 0, 0]}>
              {data.categoryBreakdown.map((_, i) => (
                <Cell
                  key={i}
                  fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ProgressChart>
      </GlowCard>

      {/* Coding Progress */}
      <div className="grid gap-4 lg:grid-cols-3">
        <GlowCard>
          <h3 className="mb-3 font-display font-semibold text-text-primary">
            Difficulty Solved
          </h3>
          <ProgressChart height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip />
              <Legend />
            </PieChart>
          </ProgressChart>
        </GlowCard>

        <GlowCard className="lg:col-span-2">
          <h3 className="mb-3 font-display font-semibold text-text-primary">
            Problems Solved Over Time
          </h3>
          <ProgressChart height={200}>
            <LineChart data={data.codingProgress.overTime}>
              <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
              <XAxis dataKey="date" {...chartAxisStyle} />
              <YAxis {...chartAxisStyle} />
              <ChartTooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke={CHART_COLORS.warning}
                strokeWidth={2}
              />
            </LineChart>
          </ProgressChart>
        </GlowCard>

        <GlowCard className="lg:col-span-3">
          <h3 className="mb-3 font-display font-semibold text-text-primary">
            Language Distribution
          </h3>
          <ProgressChart height={200}>
            <BarChart data={data.codingProgress.byLanguage}>
              <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
              <XAxis dataKey="language" {...chartAxisStyle} />
              <YAxis {...chartAxisStyle} />
              <ChartTooltip />
              <Bar
                dataKey="count"
                fill={CHART_COLORS.primary}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ProgressChart>
        </GlowCard>
      </div>

      {/* Streaks & Milestones */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlowCard>
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex size-16 items-center justify-center rounded-full bg-danger/15 text-3xl"
            >
              🔥
            </motion.div>
            <div>
              <p className="text-sm text-text-secondary">Current Streak</p>
              <p className="font-mono text-4xl font-bold text-text-primary">
                {data.stats.streak}
                <span className="text-lg text-text-secondary"> days</span>
              </p>
            </div>
          </div>
        </GlowCard>

        <GlowCard>
          <h3 className="mb-4 font-display font-semibold text-text-primary">
            Achievement Badges
          </h3>
          <div className="flex flex-wrap gap-3">
            {data.milestones.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                  m.achieved
                    ? "border-intelligence-primary/40 bg-intelligence-primary/10 text-text-primary"
                    : "border-deep-border text-text-secondary opacity-50"
                )}
              >
                <Award className="size-4" />
                {m.title}
              </div>
            ))}
          </div>
        </GlowCard>
      </div>

      <GlowCard>
        <h3 className="mb-4 font-display font-semibold text-text-primary">
          Milestones Timeline
        </h3>
        <div className="space-y-3">
          {data.milestones.map((m, i) => (
            <div key={m.id} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-bold",
                  m.achieved
                    ? "bg-success/20 text-success"
                    : "bg-deep-border text-text-secondary"
                )}
              >
                {i + 1}
              </div>
              <p
                className={cn(
                  "text-sm",
                  m.achieved ? "text-text-primary" : "text-text-secondary"
                )}
              >
                {m.title}
              </p>
              {m.achieved && (
                <span className="text-xs text-success">Achieved</span>
              )}
            </div>
          ))}
        </div>
      </GlowCard>
    </div>
  );
}
