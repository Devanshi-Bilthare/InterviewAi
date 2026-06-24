"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Menu } from "lucide-react";
import { Session } from "next-auth";
import { useState } from "react";

import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface SidebarProps {
  user: Session["user"];
}

function NavContent({
  user,
  pathname,
  onNavigate,
}: {
  user: Session["user"];
  pathname: string;
  onNavigate?: () => void;
}) {
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-deep-border px-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-intelligence-primary/15">
          <Brain className="size-5 text-intelligence-primary" />
        </div>
        <span className="font-display text-lg font-semibold gradient-text">
          InterviewAI
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "border-l-2 border-intelligence-primary bg-intelligence-primary/10 text-text-primary nav-glow"
                  : "border-l-2 border-transparent text-text-secondary hover:bg-intelligence-primary/5 hover:text-text-primary hover:shadow-glow"
              )}
            >
              <Icon
                className={cn(
                  "size-[18px] shrink-0 transition-colors",
                  isActive
                    ? "text-intelligence-primary"
                    : "text-text-secondary group-hover:text-intelligence-primary"
                )}
              />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-deep-border p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar size="sm">
            <AvatarFallback className="bg-intelligence-primary/20 text-xs text-intelligence-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">
              {user?.name ?? "User"}
            </p>
            <p className="truncate text-xs text-text-secondary">
              {user?.email ?? ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-deep-border bg-deep-bg md:flex md:flex-col">
        <NavContent user={user} pathname={pathname} />
      </aside>

      {/* Mobile sidebar */}
      <div className="fixed top-0 left-0 z-50 flex h-14 w-full items-center gap-3 border-b border-deep-border bg-deep-bg px-4 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Open menu" />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-60 border-deep-border bg-deep-bg p-0"
            showCloseButton
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <NavContent
              user={user}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Brain className="size-5 text-intelligence-primary" />
          <span className="font-display text-base font-semibold gradient-text">
            InterviewAI
          </span>
        </div>
      </div>
    </>
  );
}
