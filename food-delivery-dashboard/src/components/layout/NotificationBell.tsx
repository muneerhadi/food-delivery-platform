"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useNavigationLoading } from "@/contexts/NavigationLoadingContext";
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
import { getNotificationMessage, useNotifications } from "@/hooks/useNotifications";
import { formatDate } from "@/lib/utils";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { startNavigation } = useNavigationLoading();
  const recent = notifications.slice(0, 6);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          ) : null}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between gap-2">
          <span>Notifications</span>
          {unreadCount > 0 ? (
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => void markAllAsRead()}
            >
              Mark all read
            </button>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {recent.length === 0 ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">No notifications yet.</div>
        ) : (
          recent.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex cursor-pointer flex-col items-start gap-1 py-2"
              onClick={() => {
                if (!notification.read_at) {
                  void markAsRead(notification.id);
                }
              }}
            >
              <div className="flex w-full items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-tight">{notification.title ?? "Notification"}</p>
                {!notification.read_at ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
              </div>
              <p className="text-xs text-muted-foreground">{getNotificationMessage(notification)}</p>
              <p className="text-[11px] text-muted-foreground">{formatDate(notification.created_at)}</p>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/notifications"
            className="w-full justify-center text-center font-medium"
            onClick={() => startNavigation("/notifications")}
          >
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
