"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string) {
  if (!password) return { score: 0, label: "", color: "bg-deep-border" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 25, label: "Weak", color: "bg-danger" };
  if (score <= 4) return { score: 50, label: "Fair", color: "bg-warning" };
  if (score <= 5) return { score: 75, label: "Good", color: "bg-intelligence-primary" };
  return { score: 100, label: "Strong", color: "bg-success" };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, label, color } = getStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-deep-border">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs text-text-secondary">
        Password strength:{" "}
        <span className="font-medium text-text-primary">{label}</span>
      </p>
    </div>
  );
}
