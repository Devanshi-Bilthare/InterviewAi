"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect } from "react";

import { GlowCard } from "@/components/ui/GlowCard";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  change?: number;
  icon: LucideIcon;
  color?: "primary" | "success" | "warning" | "danger";
  suffix?: string;
  children?: React.ReactNode;
}

const colorMap = {
  primary: "bg-intelligence-primary/15 text-intelligence-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
};

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  color = "primary",
  suffix,
  children,
}: StatsCardProps) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.2,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, motionValue]);

  const trendUp = (change ?? 0) >= 0;

  return (
    <GlowCard>
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-full",
            colorMap[color]
          )}
        >
          <Icon className="size-5" />
        </div>
        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              trendUp ? "text-success" : "text-danger"
            )}
          >
            {trendUp ? (
              <TrendingUp className="size-3.5" />
            ) : (
              <TrendingDown className="size-3.5" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-text-secondary">{title}</p>
        <div className="mt-1 flex items-end gap-2">
          <motion.span className="font-mono text-3xl font-bold text-text-primary">
            {rounded}
          </motion.span>
          {suffix && (
            <span className="mb-1 text-sm text-text-secondary">{suffix}</span>
          )}
        </div>
        {children}
      </div>
    </GlowCard>
  );
}
