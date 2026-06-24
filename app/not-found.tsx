import Link from "next/link";
import { Brain, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-deep-bg px-4 text-center">
      <div className="relative">
        <p className="font-mono text-8xl font-bold text-intelligence-primary/20">
          404
        </p>
        <Brain className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-intelligence-primary animate-pulse" />
      </div>
      <h1 className="mt-4 font-display text-2xl font-bold text-text-primary">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="mt-8">
        <Button className="border-0 bg-intelligence-primary text-white">
          <Home className="size-4" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
