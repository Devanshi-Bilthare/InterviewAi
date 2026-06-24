"use client";

import { ReactNode } from "react";
import {
  ResponsiveContainer,
} from "recharts";

import { cn } from "@/lib/utils";

interface ProgressChartProps {
  children: ReactNode;
  height?: number;
  className?: string;
}

export function ProgressChart({
  children,
  height = 280,
  className,
}: ProgressChartProps) {
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

interface ChartTooltipPayload {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  label?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-deep-border bg-deep-card/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      {label && (
        <p className="mb-1 text-xs font-medium text-text-secondary">{label}</p>
      )}
      {(payload as ChartTooltipPayload[]).map((entry, index) => (
        <p key={index} className="text-sm text-text-primary">
          <span
            className="mr-2 inline-block size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: <span className="font-mono">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export const CHART_COLORS = {
  primary: "#6366F1",
  secondary: "#8B5CF6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  grid: "#1F2937",
  text: "#9CA3AF",
};

export const chartAxisStyle = {
  tick: { fill: CHART_COLORS.text, fontSize: 11 },
};
