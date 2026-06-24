import { Brain } from "lucide-react";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "glass-card w-full max-w-md rounded-2xl border border-deep-border/80 p-8 shadow-glow",
        className
      )}
    >
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex size-12 items-center justify-center rounded-xl bg-intelligence-primary/15">
          <Brain className="size-7 text-intelligence-primary" />
        </div>
        <span className="font-display text-2xl font-semibold gradient-text">
          InterviewAI
        </span>
      </div>
      {children}
    </div>
  );
}
