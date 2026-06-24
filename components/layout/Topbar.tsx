"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { LogOut, Settings, User } from "lucide-react";

import { NotificationBell } from "@/components/layout/NotificationBell";
import { getPageTitle } from "@/lib/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopbarProps {
  user: Session["user"];
}

export default function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-deep-border bg-deep-bg/80 px-4 backdrop-blur-md md:px-6">
      <h1 className="font-display text-xl font-semibold text-text-primary md:text-2xl">
        {pageTitle}
      </h1>

      <div className="flex items-center gap-2 md:gap-4">
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 hover:bg-intelligence-primary/10"
              />
            }
          >
            <Avatar size="sm">
              <AvatarFallback className="bg-intelligence-primary/20 text-xs text-intelligence-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium text-text-primary sm:inline">
              {user?.name ?? "User"}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 border-deep-border bg-deep-card"
          >
            <DropdownMenuLabel className="text-text-secondary">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-deep-border" />
            <DropdownMenuItem
              render={<Link href="/profile" />}
              className="text-text-primary focus:bg-intelligence-primary/10"
            >
              <User className="size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-text-primary focus:bg-intelligence-primary/10">
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-deep-border" />
            <DropdownMenuItem
              className="text-danger focus:bg-danger/10 focus:text-danger"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
