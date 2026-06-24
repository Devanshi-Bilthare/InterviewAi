"use client";

import {
  Code2,
  Coffee,
  Database,
  GitBranch,
  Layers,
  Server,
  User,
  type LucideIcon,
} from "lucide-react";

import { GlowCard } from "@/components/ui/GlowCard";
import { cn } from "@/lib/utils";
import type { InterviewCategoryId } from "@/lib/interview-categories";

const iconMap: Record<string, LucideIcon> = {
  database: Database,
  react: Code2,
  server: Server,
  coffee: Coffee,
  code: Code2,
  "git-branch": GitBranch,
  user: User,
  layers: Layers,
};

interface CategoryCardProps {
  id: InterviewCategoryId;
  name: string;
  description: string;
  icon: string;
  color: string;
  avgDifficulty: string;
  selected?: boolean;
  onClick?: () => void;
}

export function CategoryCard({
  name,
  description,
  icon,
  color,
  avgDifficulty,
  selected,
  onClick,
}: CategoryCardProps) {
  const Icon = iconMap[icon] ?? Code2;

  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      <GlowCard
        hoverScale={1.03}
        className={cn(
          selected && "ring-2 ring-intelligence-primary shadow-glow"
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="size-6" style={{ color }} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base font-semibold text-text-primary">
              {name}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary line-clamp-2">
              {description}
            </p>
            <span className="mt-2 inline-block rounded-full bg-deep-border px-2 py-0.5 text-[10px] font-medium text-text-secondary">
              Avg: {avgDifficulty}
            </span>
          </div>
        </div>
      </GlowCard>
    </button>
  );
}
