"use client";

import { motion } from "framer-motion";
import { useEffect, useId, useState } from "react";

import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  label?: string;
  className?: string;
}

export function ScoreRing({
  score,
  size = 120,
  label,
  className,
}: ScoreRingProps) {
  const gradientId = useId();
  const [mounted, setMounted] = useState(false);

  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn("relative inline-flex flex-col items-center gap-2", className)}
    >
      <div className="relative score-ring-glow">
        <div
          className="absolute inset-0 animate-pulse-ring rounded-full bg-intelligence-primary/20"
          style={{ margin: -strokeWidth }}
        />
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
          </defs>

          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#1F2937"
            strokeWidth={strokeWidth}
          />

          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{
              strokeDashoffset:
                circumference - (mounted ? clampedScore / 100 : 0) * circumference,
            }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-mono font-bold text-text-primary"
            style={{ fontSize: size * 0.22 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {clampedScore}
          </motion.span>
        </div>
      </div>

      {label && (
        <span className="text-sm font-medium text-text-secondary">{label}</span>
      )}
    </div>
  );
}
