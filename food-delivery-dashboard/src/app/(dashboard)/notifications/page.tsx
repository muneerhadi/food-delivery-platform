"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getNotificationMessage, useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import type { Notification, UserRole } from "@/types";

function notificationLink(notification: Notification, role?: UserRole): string | null {
  const orderNumber = notification.data?.order_number;
  if (!orderNumber || typeof orderNumber !== "string") return null;

  if (role === "super_admin") {
    return `/admin/orders/${orderNumber}`;
  }

  if (role === "restaurant_owner") {
    return "/restaurant/orders";
  }

  if (role === "driver" || notification.type === "order_ready") {
    return "/driver/orders";
  }

  return null;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  if (isLoading) {
    return <LoadingSpinner label="Loading notifications..." />;
  }

  return (
    <PageShell>
      <PageHeader
        title="Notifications"
        description="Order alerts and updates from the platform."
        actions={
          unreadCount > 0 ? (
            <Button variant="outline" onClick={() => void markAllAsRead()}>
              Mark all as read
            </Button>
          ) : null
        }
      />

      {notifications.length === 0 ? (
        <EmptyState message="You don't have any notifications yet." />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const href = notificationLink(notification, user?.role);
            const content = (
              <Card className={notification.read_at ? "border-border/60 opacity-75 shadow-sm" : "border-primary/30 shadow-sm"}>
                <CardContent className="flex items-start justify-between gap-4 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{notification.title ?? "Notification"}</p>
                      {!notification.read_at ? (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                          New
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{getNotificationMessage(notification)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(notification.created_at)}</p>
                  </div>
                  {!notification.read_at ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(event) => {
                        event.preventDefault();
                        void markAsRead(notification.id);
                      }}
                    >
                      Mark read
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            );

            if (href) {
              return (
                <Link key={notification.id} href={href} onClick={() => !notification.read_at && markAsRead(notification.id)}>
                  {content}
                </Link>
              );
            }

            return <div key={notification.id}>{content}</div>;
          })}
        </div>
      )}
    </PageShell>
  );
}
