"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Code2,
  Loader2,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Problem {
  id: string;
  problemNumber?: number;
  title: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  acceptanceRate: number;
  status: "solved" | "attempted" | "unsolved";
}

interface Stats {
  total: number;
  solved: number;
  easy: number;
  medium: number;
  hard: number;
}

const CATEGORIES = [
  "all",
  "arrays",
  "strings",
  "trees",
  "linked-list",
  "javascript",
  "react",
  "node",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  arrays: "Arrays",
  strings: "Strings",
  trees: "Trees",
  "linked-list": "Linked List",
  javascript: "JS",
  react: "React",
  node: "Node",
};

export default function CodingPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        category,
        difficulty,
        status,
      });
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/coding/problems?${params}`);
      const data = await res.json();
      if (res.ok) {
        setProblems(data.problems);
        setStats(data.stats);
      }
    } finally {
      setLoading(false);
    }
  }, [page, category, difficulty, status, search]);

  useEffect(() => {
    const timer = setTimeout(fetchProblems, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchProblems, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-intelligence-primary/15">
            <Code2 className="size-5 text-intelligence-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold gradient-text md:text-3xl">
              Coding Challenges
            </h1>
            <p className="text-sm text-text-secondary">
              Practice algorithms and full-stack coding problems
            </p>
          </div>
        </div>

        {stats && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-0 bg-deep-card text-text-primary">
              Solved {stats.solved}/{stats.total}
            </Badge>
            <Badge className="border-0 bg-success/15 text-success">
              Easy {stats.easy}
            </Badge>
            <Badge className="border-0 bg-warning/15 text-warning">
              Medium {stats.medium}
            </Badge>
            <Badge className="border-0 bg-danger/15 text-danger">
              Hard {stats.hard}
            </Badge>
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-xl border border-deep-border bg-deep-card/40 p-4">
        <Tabs value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
          <TabsList className="h-auto flex-wrap bg-deep-bg">
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="text-xs sm:text-sm">
                {CATEGORY_LABELS[cat]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={difficulty} onValueChange={(v) => { setDifficulty(v); setPage(1); }}>
            <TabsList className="bg-deep-bg">
              {["all", "easy", "medium", "hard"].map((d) => (
                <TabsTrigger key={d} value={d} className="capitalize">
                  {d}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Tabs value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <TabsList className="bg-deep-bg">
              {["all", "solved", "unsolved", "attempted"].map((s) => (
                <TabsTrigger key={s} value={s} className="capitalize">
                  {s}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems..."
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-deep-border">
        <div className="grid grid-cols-[auto_auto_1fr_auto_auto_auto] gap-4 border-b border-deep-border bg-deep-card/60 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
          <span />
          <span>#</span>
          <span>Title</span>
          <span className="hidden sm:block">Category</span>
          <span>Difficulty</span>
          <span className="hidden md:block">Acceptance</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-intelligence-primary" />
          </div>
        ) : problems.length === 0 ? (
          <p className="py-16 text-center text-text-secondary">
            No problems found. Run{" "}
            <code className="text-intelligence-primary">npm run seed:problems</code>{" "}
            to populate the database.
          </p>
        ) : (
          problems.map((problem) => (
            <Link
              key={problem.id}
              href={`/coding/${problem.id}`}
              className="group grid grid-cols-[auto_auto_1fr_auto_auto_auto] items-center gap-4 border-b border-deep-border/60 px-4 py-3 transition-all hover:bg-intelligence-primary/5 hover:shadow-[inset_0_0_20px_rgba(99,102,241,0.08)]"
            >
              <span>
                {problem.status === "solved" ? (
                  <CheckCircle2 className="size-4 text-success" />
                ) : (
                  <Circle className="size-4 text-text-secondary/40" />
                )}
              </span>
              <span className="font-mono text-sm text-text-secondary">
                {problem.problemNumber ?? "—"}
              </span>
              <span className="font-medium text-text-primary group-hover:text-intelligence-primary">
                {problem.title}
              </span>
              <span className="hidden capitalize text-sm text-text-secondary sm:block">
                {problem.category}
              </span>
              <Badge
                className={cn(
                  "border-0 capitalize",
                  problem.difficulty === "easy" && "bg-success/15 text-success",
                  problem.difficulty === "medium" && "bg-warning/15 text-warning",
                  problem.difficulty === "hard" && "bg-danger/15 text-danger"
                )}
              >
                {problem.difficulty}
              </Badge>
              <span className="hidden font-mono text-sm text-text-secondary md:block">
                {problem.acceptanceRate}%
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
