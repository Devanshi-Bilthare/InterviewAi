"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { CategoryCard } from "@/components/interview/CategoryCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  INTERVIEW_CATEGORIES,
  type InterviewCategoryId,
} from "@/lib/interview-categories";
import { cn } from "@/lib/utils";

type Difficulty = "easy" | "medium" | "hard" | "mixed";

export default function InterviewPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] =
    useState<InterviewCategoryId>("mern-stack");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          difficulty,
          count: 10,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Failed to start interview");
        return;
      }

      toast.success("Interview ready! Good luck!");
      router.push(`/interview/${data.sessionId}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold gradient-text md:text-4xl">
          Choose Your Interview Track
        </h1>
        <p className="mt-2 text-text-secondary">
          Select a category and difficulty to begin your AI-powered mock interview
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {INTERVIEW_CATEGORIES.map((category) => (
          <CategoryCard
            key={category.id}
            {...category}
            selected={selectedCategory === category.id}
            onClick={() => setSelectedCategory(category.id)}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium text-text-secondary">
            Select Difficulty
          </p>
          <Tabs
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as Difficulty)}
          >
            <TabsList className="bg-deep-card border border-deep-border">
              <TabsTrigger value="easy">Easy</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="hard">Hard</TabsTrigger>
              <TabsTrigger value="mixed">Mixed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Button
          onClick={handleStart}
          disabled={loading}
          className={cn(
            "h-12 px-8 text-base border-0 text-white",
            "bg-gradient-to-r from-intelligence-primary to-intelligence-secondary",
            "hover:opacity-90 hover:shadow-glow"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Generating Questions...
            </>
          ) : (
            "Start Interview"
          )}
        </Button>
      </div>
    </div>
  );
}
