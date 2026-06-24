"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

import { GlowCard } from "@/components/ui/GlowCard";
import { CHART_COLORS } from "@/components/dashboard/ProgressChart";

const RadarChartLazy = dynamic(
  () =>
    import("@/components/dashboard/PerformanceRadarChart").then(
      (m) => m.PerformanceRadarChart
    ),
  {
    loading: () => (
      <div className="flex h-[220px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-intelligence-primary" />
      </div>
    ),
    ssr: false,
  }
);

interface RadarDatum {
  dimension: string;
  score: number;
}

export function PerformanceRadar({ data }: { data: RadarDatum[] }) {
  return (
    <GlowCard>
      <h3 className="mb-3 text-center font-display text-lg font-semibold text-text-primary">
        Performance Radar
      </h3>
      <div className="overflow-x-auto">
        <RadarChartLazy data={data} colors={CHART_COLORS} />
      </div>
    </GlowCard>
  );
}
