"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { CategoryCard } from "@/components/interview/CategoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  INTERVIEW_CATEGORIES,
  type InterviewCategoryId,
} from "@/lib/interview-categories";
import { cn } from "@/lib/utils";

const STEPS = ["Profile", "Resume", "Category", "Ready"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState("junior");
  const [targetRole, setTargetRole] = useState("");
  const [category, setCategory] = useState<InterviewCategoryId>("mern-stack");
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    async function check() {
      const res = await fetch("/api/users/profile");
      const data = await res.json();
      if (data.success && data.user?.onboardingCompleted) {
        router.replace("/dashboard");
      }
      if (data.success && data.user) {
        setExperienceLevel(data.user.experienceLevel ?? "junior");
        setTargetRole(data.user.targetRole ?? "");
      }
    }
    check();
  }, [router]);

  const saveStep = async (extra?: Record<string, unknown>) => {
    await fetch("/api/users/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ experienceLevel, targetRole, ...extra }),
    });
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      if (step === 0) await saveStep();
      if (step === 2) await saveStep();
      if (step < STEPS.length - 1) {
        setStep((s) => s + 1);
        if (step === 2) setShowConfetti(true);
      } else {
        await saveStep({ onboardingCompleted: true });
        toast.success("Welcome to InterviewAI!");
        router.push("/interview");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-deep-bg px-4 py-12">
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute size-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ["#6366F1", "#8B5CF6", "#10B981", "#F59E0B"][
                  i % 4
                ],
              }}
              initial={{ top: "-5%", opacity: 1 }}
              animate={{ top: "105%", opacity: 0 }}
              transition={{ duration: 2 + Math.random(), delay: Math.random() }}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-2xl">
        <div className="mb-8 flex justify-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-bold",
                  i <= step
                    ? "bg-intelligence-primary text-white"
                    : "bg-deep-border text-text-secondary"
                )}
              >
                {i < step ? <CheckCircle2 className="size-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-8",
                    i < step ? "bg-intelligence-primary" : "bg-deep-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            className="glass-card rounded-2xl p-8"
          >
            {step === 0 && (
              <div className="space-y-5">
                <h1 className="font-display text-2xl font-bold gradient-text">
                  Tell us about yourself
                </h1>
                <FormField label="Experience Level">
                  <Select
                    value={experienceLevel}
                    onValueChange={(v) => setExperienceLevel(v ?? "junior")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fresher">Fresher</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Target Role">
                  <Input
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Full Stack Developer"
                  />
                </FormField>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4 text-center">
                <Upload className="mx-auto size-12 text-intelligence-primary" />
                <h1 className="font-display text-2xl font-bold text-text-primary">
                  Upload your resume
                </h1>
                <p className="text-sm text-text-secondary">
                  Optional — you can upload later from the Resume section.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push("/resume")}
                  className="border-deep-border"
                >
                  Go to Resume Upload
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h1 className="font-display text-2xl font-bold gradient-text">
                  Pick your first interview track
                </h1>
                <div className="grid gap-3 sm:grid-cols-2">
                  {INTERVIEW_CATEGORIES.slice(0, 4).map((cat) => (
                    <CategoryCard
                      key={cat.id}
                      {...cat}
                      selected={category === cat.id}
                      onClick={() => setCategory(cat.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 text-center">
                <Sparkles className="mx-auto size-12 text-intelligence-primary" />
                <h1 className="font-display text-3xl font-bold gradient-text">
                  You&apos;re all set!
                </h1>
                <p className="text-text-secondary">
                  Start your first mock interview and track your progress over time.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["First Interview", "Practice Daily", "Land Your Dream Job"].map(
                    (badge) => (
                      <span
                        key={badge}
                        className="flex items-center gap-1 rounded-full bg-intelligence-primary/10 px-3 py-1 text-xs text-intelligence-primary"
                      >
                        <Award className="size-3" />
                        {badge}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <Button
                variant="ghost"
                disabled={step === 0}
                onClick={() => setStep((s) => s - 1)}
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={loading}
                className="border-0 bg-gradient-to-r from-intelligence-primary to-intelligence-secondary text-white"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : step === STEPS.length - 1 ? (
                  "Start Interview"
                ) : step === 1 ? (
                  "Skip for now"
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
