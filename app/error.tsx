"use client";

import { useEffect } from "react";
import { Brain, Home, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-deep-bg px-4 text-center">
      <div className="flex size-20 items-center justify-center rounded-2xl bg-danger/10">
        <Brain className="size-10 text-danger" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold text-text-primary">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-text-secondary">
        We hit an unexpected error. Please try again or return to the dashboard.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset} className="border-0 bg-intelligence-primary text-white">
          <RotateCcw className="size-4" />
          Try Again
        </Button>
        <Link href="/dashboard">
          <Button variant="outline" className="border-deep-border">
            <Home className="size-4" />
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
