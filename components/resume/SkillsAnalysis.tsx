"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

import { GlowCard } from "@/components/ui/GlowCard";
import { Badge } from "@/components/ui/badge";

interface SkillsAnalysisProps {
  skills: string[];
  missingSkills: string[];
  suggestedTopics: string[];
  summary?: string;
  experienceLevel?: string;
}

const tagVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.05 },
  }),
};

export function SkillsAnalysis({
  skills,
  missingSkills,
  suggestedTopics,
  summary,
  experienceLevel,
}: SkillsAnalysisProps) {
  return (
    <div className="space-y-4">
      {summary && (
        <GlowCard>
          <h2 className="font-display text-lg font-semibold text-text-primary">
            AI Summary
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {summary}
          </p>
          {experienceLevel && (
            <Badge className="mt-3 border-0 bg-intelligence-primary/15 text-intelligence-primary capitalize">
              {experienceLevel} level
            </Badge>
          )}
        </GlowCard>
      )}

      {skills.length > 0 && (
        <GlowCard>
          <h2 className="font-display text-lg font-semibold text-text-primary">
            Detected Skills
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <motion.div
                key={skill}
                custom={i}
                initial="hidden"
                animate="show"
                variants={tagVariants}
              >
                <Badge className="border-0 bg-success/15 text-success">
                  {skill}
                </Badge>
              </motion.div>
            ))}
          </div>
        </GlowCard>
      )}

      {missingSkills.length > 0 && (
        <GlowCard className="border-warning/20">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-text-primary">
            <AlertCircle className="size-5 text-warning" />
            Skill Gaps
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {missingSkills.map((skill, i) => (
              <motion.div
                key={skill}
                custom={i}
                initial="hidden"
                animate="show"
                variants={tagVariants}
              >
                <Badge className="border-0 bg-warning/15 text-warning">
                  {skill}
                </Badge>
              </motion.div>
            ))}
          </div>
        </GlowCard>
      )}

      {suggestedTopics.length > 0 && (
        <GlowCard>
          <h2 className="font-display text-lg font-semibold text-text-primary">
            Suggested Study Topics
          </h2>
          <ul className="mt-3 space-y-2">
            {suggestedTopics.map((topic, i) => (
              <motion.li
                key={topic}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-2 text-sm text-text-secondary"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-intelligence-primary" />
                {topic}
              </motion.li>
            ))}
          </ul>
        </GlowCard>
      )}
    </div>
  );
}
