"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  hoverScale?: number;
}

export function GlowCard({
  children,
  className,
  hoverScale = 1.02,
}: GlowCardProps) {
  return (
    <motion.div
      whileHover={{ scale: hoverScale }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative rounded-xl p-[1px] transition-shadow duration-300",
        "bg-gradient-to-br from-deep-border via-deep-border to-deep-border",
        "hover:from-intelligence-primary hover:via-intelligence-secondary hover:to-intelligence-violet",
        "hover:shadow-glow",
        className
      )}
    >
      <div className="glass-card h-full rounded-[calc(var(--radius)-1px)] p-5 transition-colors duration-300 group-hover:bg-deep-card/80">
        {children}
      </div>
    </motion.div>
  );
}
