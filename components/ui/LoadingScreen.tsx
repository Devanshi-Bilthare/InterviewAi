"use client";

import { Brain } from "lucide-react";
import { motion } from "framer-motion";

export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-deep-bg">
      <motion.div
        animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="flex size-16 items-center justify-center rounded-2xl bg-intelligence-primary/20 shadow-glow"
      >
        <Brain className="size-8 text-intelligence-primary" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 font-display text-lg font-semibold gradient-text"
      >
        InterviewAI
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-2 text-sm text-text-secondary"
      >
        {message}
      </motion.p>
      <div className="mt-6 flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-2 rounded-full bg-intelligence-primary"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -6, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}
