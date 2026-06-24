"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const unread = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    if (res.ok && data.success) setNotifications(data.notifications);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id?: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { id } : { markAll: true }),
    });
    fetchNotifications();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative text-text-secondary hover:text-text-primary"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            {unread > 0 && (
              <Badge className="absolute -top-0.5 -right-0.5 size-4 justify-center rounded-full bg-intelligence-primary p-0 text-[10px] text-white">
                {unread}
              </Badge>
            )}
          </Button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="w-80 border-deep-border bg-deep-card"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => markRead()}
              className="flex items-center gap-1 text-xs text-intelligence-primary"
            >
              <Check className="size-3" />
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-deep-border" />
        {notifications.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-text-secondary">
            No notifications yet
          </p>
        ) : (
          notifications.slice(0, 8).map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={cn(
                "flex flex-col items-start gap-0.5 p-3",
                !n.read && "bg-intelligence-primary/5"
              )}
              onClick={() => {
                markRead(n.id);
                if (n.link) window.location.href = n.link;
              }}
            >
              <p className="text-sm font-medium text-text-primary">{n.title}</p>
              <p className="line-clamp-2 text-xs text-text-secondary">
                {n.message}
              </p>
              <p className="text-[10px] text-text-secondary">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
