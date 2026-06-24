"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";

import {
  ChartTooltip,
  ProgressChart,
} from "@/components/dashboard/ProgressChart";

interface RadarDatum {
  dimension: string;
  score: number;
}

interface PerformanceRadarChartProps {
  data: RadarDatum[];
  colors: {
    primary: string;
    grid: string;
    text: string;
  };
}

export function PerformanceRadarChart({
  data,
  colors,
}: PerformanceRadarChartProps) {
  return (
    <ProgressChart height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke={colors.grid} />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: colors.text, fontSize: 10 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: colors.text, fontSize: 9 }}
        />
        <Radar
          dataKey="score"
          stroke={colors.primary}
          fill={colors.primary}
          fillOpacity={0.3}
        />
        <ChartTooltip />
      </RadarChart>
    </ProgressChart>
  );
}
