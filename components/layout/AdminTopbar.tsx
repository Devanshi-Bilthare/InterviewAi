"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { LogOut, Shield } from "lucide-react";

import { getAdminPageTitle } from "@/lib/admin-navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminTopbarProps {
  user: Session["user"];
}

export default function AdminTopbar({ user }: AdminTopbarProps) {
  const pathname = usePathname();
  const pageTitle = getAdminPageTitle(pathname);

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "A";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-deep-border bg-deep-bg/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-xl font-semibold text-text-primary md:text-2xl">
          {pageTitle}
        </h1>
        <Badge className="border-0 bg-warning/15 text-warning">Admin</Badge>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 hover:bg-intelligence-primary/10"
            />
          }
        >
          <div className="relative">
            <Avatar size="sm">
              <AvatarFallback className="bg-intelligence-primary/20 text-xs text-intelligence-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Shield className="absolute -bottom-0.5 -right-0.5 size-3.5 text-warning" />
          </div>
          <span className="hidden text-sm font-medium text-text-primary sm:inline">
            {user?.name ?? "Admin"}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-52 border-deep-border bg-deep-card"
        >
          <DropdownMenuLabel className="text-text-secondary">
            Administrator
          </DropdownMenuLabel>
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
    </header>
  );
}
