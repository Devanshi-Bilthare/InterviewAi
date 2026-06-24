"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Download,
  Loader2,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { GlowCard } from "@/components/ui/GlowCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  totalInterviews: number;
  averageScore: number;
  isSuspended: boolean;
  joinedAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        role,
      });
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [page, role, search]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchUsers, search]);

  const updateUser = async (
    userId: string,
    updates: { role?: string; isSuspended?: boolean }
  ) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...updates }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Update failed");
      return;
    }
    toast.success("User updated");
    fetchUsers();
  };

  const exportCsv = () => {
    const headers = ["Name", "Email", "Role", "Interviews", "Avg Score", "Joined"];
    const rows = users.map((u) => [
      u.name,
      u.email,
      u.role,
      u.totalInterviews,
      u.averageScore,
      format(new Date(u.joinedAt), "yyyy-MM-dd"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            User Management
          </h1>
          <p className="text-sm text-text-secondary">
            Search, filter, and manage platform users
          </p>
        </div>
        <Button
          variant="outline"
          onClick={exportCsv}
          className="border-deep-border"
        >
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email..."
            className="pl-9"
          />
        </div>
        <Tabs value={role} onValueChange={(v) => { setRole(v); setPage(1); }}>
          <TabsList className="bg-deep-card border border-deep-border">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="candidate">Candidates</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <GlowCard className="overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-intelligence-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-deep-border bg-deep-bg/50">
                <tr className="text-left text-xs uppercase text-text-secondary">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Interviews</th>
                  <th className="px-4 py-3">Avg Score</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const initials = user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={user.id}
                      className={cn(
                        "border-b border-deep-border/60 hover:bg-intelligence-primary/5",
                        user.isSuspended && "opacity-60"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            <AvatarFallback className="bg-intelligence-primary/20 text-xs text-intelligence-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-text-primary">
                              {user.name}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={cn(
                            "border-0 capitalize",
                            user.role === "admin"
                              ? "bg-warning/15 text-warning"
                              : "bg-intelligence-primary/15 text-intelligence-primary"
                          )}
                        >
                          {user.role}
                        </Badge>
                        {user.isSuspended && (
                          <Badge className="ml-1 border-0 bg-danger/15 text-danger">
                            Suspended
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-text-primary">
                        {user.totalInterviews}
                      </td>
                      <td className="px-4 py-3 font-mono text-intelligence-primary">
                        {user.averageScore}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {format(new Date(user.joinedAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon-sm" />
                            }
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="border-deep-border bg-deep-card">
                            <DropdownMenuItem
                              onClick={() =>
                                updateUser(user.id, {
                                  role:
                                    user.role === "admin"
                                      ? "candidate"
                                      : "admin",
                                })
                              }
                            >
                              Change to{" "}
                              {user.role === "admin" ? "Candidate" : "Admin"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateUser(user.id, {
                                  isSuspended: !user.isSuspended,
                                })
                              }
                              className="text-danger focus:text-danger"
                            >
                              {user.isSuspended ? "Unsuspend" : "Suspend"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-deep-border px-4 py-3">
          <p className="text-xs text-text-secondary">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="border-deep-border"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="border-deep-border"
            >
              Next
            </Button>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}
