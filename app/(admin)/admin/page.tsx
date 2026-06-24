"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Activity,
  Loader2,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  CHART_COLORS,
  ChartTooltip,
  ProgressChart,
  chartAxisStyle,
} from "@/components/dashboard/ProgressChart";
import { GlowCard } from "@/components/ui/GlowCard";
import { getCategoryById } from "@/lib/interview-categories";

interface AdminStats {
  stats: {
    userCount: number;
    newUsersThisMonth: number;
    interviewCount: number;
    avgPlatformScore: number;
    activeUsersToday: number;
  };
  monthlyRegistrations: Array<{ month: string; users: number }>;
  interviewsByCategory: Array<{ category: string; count: number }>;
  scoreTrend: Array<{ month: string; avgScore: number; interviews: number }>;
  recentActivity: Array<{
    sessionId: string;
    userName: string;
    userEmail: string;
    category: string;
    score: number;
    completedAt?: string;
  }>;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/stats");
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
      <p className="text-center text-text-secondary">Failed to load admin stats.</p>
    );
  }

  const formatMonth = (m: string) => {
    const [year, month] = m.split("-");
    return format(new Date(Number(year), Number(month) - 1), "MMM yy");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Platform Overview
        </h1>
        <p className="text-sm text-text-secondary">
          Real-time metrics across InterviewAI
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={data.stats.userCount}
          icon={Users}
          color="primary"
        >
          <p className="mt-1 text-xs text-success">
            +{data.stats.newUsersThisMonth} this month
          </p>
        </StatsCard>
        <StatsCard
          title="Interviews Completed"
          value={data.stats.interviewCount}
          icon={Activity}
          color="success"
        />
        <StatsCard
          title="Avg Platform Score"
          value={data.stats.avgPlatformScore}
          icon={TrendingUp}
          color="warning"
        />
        <StatsCard
          title="Active Today"
          value={data.stats.activeUsersToday}
          icon={Users}
          color="danger"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlowCard className="lg:col-span-1">
          <h3 className="mb-3 font-display font-semibold text-text-primary">
            User Registrations
          </h3>
          <ProgressChart height={220}>
            <LineChart data={data.monthlyRegistrations}>
              <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                {...chartAxisStyle}
              />
              <YAxis {...chartAxisStyle} />
              <ChartTooltip />
              <Line
                type="monotone"
                dataKey="users"
                name="New Users"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ProgressChart>
        </GlowCard>

        <GlowCard className="lg:col-span-1">
          <h3 className="mb-3 font-display font-semibold text-text-primary">
            Interviews by Category
          </h3>
          <ProgressChart height={220}>
            <BarChart data={data.interviewsByCategory}>
              <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="category"
                tickFormatter={(v) =>
                  getCategoryById(v)?.name?.slice(0, 8) ?? v.slice(0, 8)
                }
                {...chartAxisStyle}
              />
              <YAxis {...chartAxisStyle} />
              <ChartTooltip />
              <Bar
                dataKey="count"
                name="Interviews"
                fill={CHART_COLORS.secondary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ProgressChart>
        </GlowCard>

        <GlowCard className="lg:col-span-1">
          <h3 className="mb-3 font-display font-semibold text-text-primary">
            Score Trend
          </h3>
          <ProgressChart height={220}>
            <AreaChart data={data.scoreTrend}>
              <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                {...chartAxisStyle}
              />
              <YAxis domain={[0, 100]} {...chartAxisStyle} />
              <ChartTooltip />
              <Area
                type="monotone"
                dataKey="avgScore"
                name="Avg Score"
                stroke={CHART_COLORS.success}
                fill={CHART_COLORS.success}
                fillOpacity={0.2}
              />
            </AreaChart>
          </ProgressChart>
        </GlowCard>
      </div>

      <GlowCard>
        <h3 className="mb-4 font-display text-lg font-semibold text-text-primary">
          Recent Activity
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-deep-border text-left text-xs uppercase text-text-secondary">
                <th className="pb-3 pr-4">User</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Score</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-secondary">
                    No completed interviews yet.
                  </td>
                </tr>
              ) : (
                data.recentActivity.map((row) => (
                  <tr
                    key={row.sessionId}
                    className="border-b border-deep-border/60 hover:bg-intelligence-primary/5"
                  >
                    <td className="py-3 pr-4">
                      <Link
                        href={`/interview/results/${row.sessionId}`}
                        className="font-medium text-text-primary hover:text-intelligence-primary"
                      >
                        {row.userName}
                      </Link>
                      <p className="text-xs text-text-secondary">{row.userEmail}</p>
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {getCategoryById(row.category)?.name ?? row.category}
                    </td>
                    <td className="py-3 pr-4 font-mono font-semibold text-intelligence-primary">
                      {row.score}
                    </td>
                    <td className="py-3 text-text-secondary">
                      {row.completedAt
                        ? format(new Date(row.completedAt), "MMM d, yyyy HH:mm")
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlowCard>
    </div>
  );
}
