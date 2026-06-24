"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { GlowCard } from "@/components/ui/GlowCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INTERVIEW_CATEGORIES } from "@/lib/interview-categories";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  type: string;
  usageCount: number;
  expectedAnswer?: string;
  keyPoints: string[];
  followUpQuestions: string[];
}

const emptyForm = {
  category: "mern-stack",
  question: "",
  expectedAnswer: "",
  keyPoints: "",
  followUpQuestions: "",
  difficulty: "medium" as "easy" | "medium" | "hard",
  type: "technical" as "technical" | "hr" | "behavioral",
};

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [importJson, setImportJson] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), category, difficulty });
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/questions?${params}`);
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions);
        setTotalPages(data.pagination.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [page, category, difficulty, search]);

  useEffect(() => {
    const timer = setTimeout(fetchQuestions, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchQuestions, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (q: Question) => {
    setEditingId(q.id);
    setForm({
      category: q.category,
      question: q.question,
      expectedAnswer: q.expectedAnswer ?? "",
      keyPoints: q.keyPoints.join("\n"),
      followUpQuestions: q.followUpQuestions.join("\n"),
      difficulty: q.difficulty as "easy" | "medium" | "hard",
      type: q.type as "technical" | "hr" | "behavioral",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        category: form.category,
        question: form.question,
        expectedAnswer: form.expectedAnswer || undefined,
        keyPoints: form.keyPoints.split("\n").filter(Boolean),
        followUpQuestions: form.followUpQuestions.split("\n").filter(Boolean),
        difficulty: form.difficulty,
        type: form.type,
      };

      const res = await fetch(
        editingId ? `/api/admin/questions/${editingId}` : "/api/admin/questions",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Save failed");
        return;
      }

      toast.success(editingId ? "Question updated" : "Question created");
      setDialogOpen(false);
      fetchQuestions();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Delete failed");
      return;
    }
    toast.success("Question deleted");
    fetchQuestions();
  };

  const handleImport = async () => {
    setSaving(true);
    try {
      const parsed = JSON.parse(importJson);
      const questionsList = Array.isArray(parsed) ? parsed : parsed.questions;

      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: questionsList }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Import failed");
        return;
      }

      toast.success(`Imported ${data.imported} questions`);
      setImportOpen(false);
      setImportJson("");
      fetchQuestions();
    } catch {
      toast.error("Invalid JSON format");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Question Bank
          </h1>
          <p className="text-sm text-text-secondary">
            Manage interview questions across categories
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger
              render={
                <Button variant="outline" className="border-deep-border" />
              }
            >
              <Upload className="size-4" />
              Bulk Import
            </DialogTrigger>
            <DialogContent className="max-w-lg border-deep-border bg-deep-bg">
              <DialogHeader>
                <DialogTitle>Import Questions (JSON)</DialogTitle>
              </DialogHeader>
              <Textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                rows={10}
                placeholder='[{"category":"frontend","question":"...","difficulty":"easy","type":"technical","keyPoints":[]}]'
                className="font-mono text-xs"
              />
              <Button onClick={handleImport} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : "Import"}
              </Button>
            </DialogContent>
          </Dialog>
          <Button onClick={openCreate} className="border-0 bg-intelligence-primary text-white">
            <Plus className="size-4" />
            Add Question
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search questions..."
            className="pl-9"
          />
        </div>
        <Tabs value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
          <TabsList className="h-auto flex-wrap bg-deep-card">
            <TabsTrigger value="all">All</TabsTrigger>
            {INTERVIEW_CATEGORIES.slice(0, 4).map((c) => (
              <TabsTrigger key={c.id} value={c.id} className="text-xs">
                {c.name.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Select value={difficulty} onValueChange={(v) => { setDifficulty(v ?? "all"); setPage(1); }}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <GlowCard className="overflow-hidden p-0">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-8 animate-spin text-intelligence-primary" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-deep-border bg-deep-bg/50 text-left text-xs uppercase text-text-secondary">
              <tr>
                <th className="px-4 py-3">Question</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Difficulty</th>
                <th className="px-4 py-3">Usage</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b border-deep-border/60 hover:bg-intelligence-primary/5">
                  <td className="max-w-md px-4 py-3 text-text-primary">
                    {q.question.slice(0, 80)}
                    {q.question.length > 80 ? "..." : ""}
                  </td>
                  <td className="px-4 py-3 capitalize text-text-secondary">{q.category}</td>
                  <td className="px-4 py-3">
                    <Badge
                      className={cn(
                        "border-0 capitalize",
                        q.difficulty === "easy" && "bg-success/15 text-success",
                        q.difficulty === "medium" && "bg-warning/15 text-warning",
                        q.difficulty === "hard" && "bg-danger/15 text-danger"
                      )}
                    >
                      {q.difficulty}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-text-primary">{q.usageCount}</td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="border-deep-border bg-deep-card">
                        <DropdownMenuItem onClick={() => openEdit(q)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(q.id)}
                          className="text-danger focus:text-danger"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="flex justify-between border-t border-deep-border px-4 py-3">
          <p className="text-xs text-text-secondary">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </GlowCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto border-deep-border bg-deep-bg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Question" : "Add Question"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v ?? f.category }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INTERVIEW_CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={(v) => setForm((f) => ({ ...f, difficulty: (v ?? "medium") as typeof f.difficulty }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Question</Label>
              <Textarea
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Expected Answer</Label>
              <Textarea
                value={form.expectedAnswer}
                onChange={(e) => setForm((f) => ({ ...f, expectedAnswer: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Key Points (one per line)</Label>
              <Textarea
                value={form.keyPoints}
                onChange={(e) => setForm((f) => ({ ...f, keyPoints: e.target.value }))}
                rows={3}
              />
            </div>
            <Button onClick={handleSave} disabled={saving || !form.question.trim()} className="w-full border-0 bg-intelligence-primary text-white">
              {saving ? <Loader2 className="size-4 animate-spin" /> : "Save Question"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
