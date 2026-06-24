"use client";

import { cn } from "@/lib/utils";

interface HeatmapDay {
  date: string;
  count: number;
  avgScore: number;
}

interface ActivityHeatmapProps {
  data: HeatmapDay[];
}

function scoreColor(avgScore: number, count: number): string {
  if (count === 0) return "bg-deep-border/40";
  if (avgScore >= 80) return "bg-success/80";
  if (avgScore >= 60) return "bg-intelligence-primary/70";
  if (avgScore >= 40) return "bg-warning/70";
  return "bg-danger/70";
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {data.map((day) => (
          <div
            key={day.date}
            title={`${day.date}: ${day.count} interview(s), avg ${day.avgScore}`}
            className={cn(
              "size-3 rounded-sm transition-transform hover:scale-125 sm:size-3.5",
              scoreColor(day.avgScore, day.count)
            )}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs text-text-secondary">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="size-3 rounded-sm bg-deep-border/40" />
          <div className="size-3 rounded-sm bg-danger/70" />
          <div className="size-3 rounded-sm bg-warning/70" />
          <div className="size-3 rounded-sm bg-intelligence-primary/70" />
          <div className="size-3 rounded-sm bg-success/80" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
