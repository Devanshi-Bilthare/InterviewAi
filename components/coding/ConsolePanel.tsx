"use client";

import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";

export interface ConsoleTestResult {
  caseNumber?: number;
  input?: string;
  expectedOutput?: string;
  stdout?: string;
  stderr?: string;
  status: string;
  passed?: boolean;
  executionTime?: number;
  memory?: number;
  isHidden?: boolean;
}

interface ConsolePanelProps {
  open: boolean;
  loading?: boolean;
  results: ConsoleTestResult[];
  summary?: {
    status: string;
    passedCases?: number;
    totalCases?: number;
    executionTime?: number;
    memory?: number;
  };
}

export function ConsolePanel({
  open,
  loading,
  results,
  summary,
}: ConsolePanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 220, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden border-t border-deep-border bg-deep-bg"
        >
          <div className="flex h-full flex-col p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Console
              </p>
              {summary && (
                <p className="font-mono text-xs text-text-secondary">
                  {summary.passedCases ?? 0}/{summary.totalCases ?? 0} passed
                  {summary.executionTime
                    ? ` · ${summary.executionTime.toFixed(0)}ms`
                    : ""}
                  {summary.memory ? ` · ${summary.memory}KB` : ""}
                </p>
              )}
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Loader2 className="size-4 animate-spin" />
                  Running tests...
                </div>
              )}

              {!loading &&
                results.map((result, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-deep-border bg-deep-card/50 p-3"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      {result.passed ? (
                        <CheckCircle2 className="size-4 text-success" />
                      ) : (
                        <XCircle className="size-4 text-danger" />
                      )}
                      <span className="text-xs font-medium text-text-primary">
                        {result.isHidden
                          ? `Hidden Case ${result.caseNumber ?? index + 1}`
                          : `Case ${result.caseNumber ?? index + 1}`}
                      </span>
                      <span
                        className={cn(
                          "text-xs",
                          result.passed ? "text-success" : "text-danger"
                        )}
                      >
                        {result.status}
                      </span>
                    </div>
                    {result.input && !result.isHidden && (
                      <p className="font-mono text-xs text-text-secondary">
                        Input: {result.input}
                      </p>
                    )}
                    {result.stdout && !result.isHidden && (
                      <p className="font-mono text-xs text-text-primary">
                        Output: {result.stdout}
                      </p>
                    )}
                    {result.stderr && (
                      <p className="font-mono text-xs text-danger">
                        {result.stderr}
                      </p>
                    )}
                  </div>
                ))}

              {!loading && results.length === 0 && (
                <p className="text-sm text-text-secondary">
                  Run tests to see output here. Press Ctrl+Enter to run.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
