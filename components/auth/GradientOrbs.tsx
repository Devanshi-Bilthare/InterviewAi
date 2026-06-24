"use client";

import { motion } from "framer-motion";

export function GradientOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-32 -left-32 size-96 rounded-full bg-intelligence-primary/20 blur-3xl"
        animate={{
          x: [0, 40, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-24 size-80 rounded-full bg-intelligence-secondary/20 blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-intelligence-violet/15 blur-3xl"
        animate={{
          x: [0, 20, 0],
          y: [0, -20, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
