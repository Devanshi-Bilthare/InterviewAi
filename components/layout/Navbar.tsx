"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Brain, Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "How it Works", href: "/#how-it-works" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = status === "authenticated" && !!session?.user;

  return (
    <header className="sticky top-0 z-50 border-b border-deep-border/60 bg-deep-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-intelligence-primary/15">
            <Brain className="size-5 text-intelligence-primary" />
          </div>
          <span className="font-display text-lg font-semibold gradient-text">
            InterviewAI
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-text-secondary hover:text-text-primary"
              >
                Dashboard
              </Link>
              <Link href="/interview">
                <Button className="border-0 bg-gradient-to-r from-intelligence-primary to-intelligence-secondary text-white hover:opacity-90">
                  Start Interview
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-text-secondary"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-text-secondary">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="border-0 bg-gradient-to-r from-intelligence-primary to-intelligence-secondary text-white hover:opacity-90">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden text-text-primary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-deep-border bg-deep-bg px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-text-secondary"
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-deep-border" />
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/interview" onClick={() => setMobileOpen(false)}>
                  Start Interview
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-left text-sm text-text-secondary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
