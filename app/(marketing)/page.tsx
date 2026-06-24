import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Code2,
  MessageSquare,
  Mic,
  Sparkles,
} from "lucide-react";

import { GlowCard } from "@/components/ui/GlowCard";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: MessageSquare,
    title: "AI Mock Interviews",
    description:
      "Practice technical, HR, and behavioral interviews with AI-generated questions tailored to your experience level.",
  },
  {
    icon: Mic,
    title: "Voice Answers",
    description:
      "Record spoken answers, get instant transcription and detailed AI feedback on every response.",
  },
  {
    icon: Code2,
    title: "Coding Challenges",
    description:
      "Solve real-world coding problems with live execution and performance tracking.",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description:
      "Track scores across 5 dimensions with radar charts, reports, and personalized roadmaps.",
  },
];

const steps = [
  { step: "01", title: "Choose a track", desc: "Pick from MERN, Frontend, HR, System Design, and more." },
  { step: "02", title: "Answer aloud", desc: "Record your responses — our AI listens and transcribes in real time." },
  { step: "03", title: "Get scored", desc: "Receive instant feedback on relevance, accuracy, and communication." },
  { step: "04", title: "Improve", desc: "Review strengths, weaknesses, and a 30-day improvement plan." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center md:px-6 md:py-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-intelligence-primary/30 bg-intelligence-primary/10 px-4 py-1.5 text-sm text-intelligence-primary">
          <Sparkles className="size-4" />
          AI-Powered Interview Preparation
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight text-text-primary md:text-6xl">
          Ace Your Next Interview with{" "}
          <span className="gradient-text">InterviewAI</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
          Practice mock interviews, get real-time AI feedback, and track your
          progress — all in one intelligent platform built for developers and
          job seekers.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/register">
            <Button
              size="lg"
              className="h-12 border-0 bg-gradient-to-r from-intelligence-primary to-intelligence-secondary px-8 text-base text-white hover:opacity-90 hover:shadow-glow"
            >
              Get Started Free
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-deep-border px-8 text-base text-text-primary hover:bg-deep-border/50"
            >
              Sign In
            </Button>
          </Link>
        </div>
        <div className="mt-16 flex items-center justify-center gap-8 text-text-secondary">
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-text-primary">10+</p>
            <p className="text-sm">Interview Tracks</p>
          </div>
          <div className="h-10 w-px bg-deep-border" />
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-text-primary">5</p>
            <p className="text-sm">Score Dimensions</p>
          </div>
          <div className="h-10 w-px bg-deep-border" />
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-text-primary">AI</p>
            <p className="text-sm">Instant Feedback</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-text-primary">
            Everything You Need to <span className="gradient-text">Prepare</span>
          </h2>
          <p className="mt-3 text-text-secondary">
            A complete interview prep toolkit powered by Gemini AI and Groq Whisper (free tier).
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <GlowCard key={feature.title} hoverScale={1.03}>
              <feature.icon className="mb-4 size-8 text-intelligence-primary" />
              <h3 className="font-display text-lg font-semibold text-text-primary">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {feature.description}
              </p>
            </GlowCard>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-text-primary">
            How It <span className="gradient-text">Works</span>
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <div
              key={item.step}
              className="glass-card rounded-xl p-6 text-center"
            >
              <span className="font-mono text-3xl font-bold gradient-text">
                {item.step}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-text-primary">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-text-secondary">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="gradient-border rounded-2xl p-px">
          <div className="flex flex-col items-center rounded-2xl bg-deep-card px-8 py-16 text-center">
            <Brain className="mb-4 size-12 text-intelligence-primary" />
            <h2 className="font-display text-3xl font-bold text-text-primary">
              Ready to Start Practicing?
            </h2>
            <p className="mt-3 max-w-md text-text-secondary">
              Join InterviewAI and turn interview anxiety into interview confidence.
            </p>
            <Link href="/register" className="mt-8">
              <Button
                size="lg"
                className="h-12 border-0 bg-gradient-to-r from-intelligence-primary to-intelligence-secondary px-8 text-white hover:opacity-90"
              >
                Create Free Account
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-deep-border py-8 text-center text-sm text-text-secondary">
        <p>© {new Date().getFullYear()} InterviewAI. All rights reserved.</p>
      </footer>
    </>
  );
}
