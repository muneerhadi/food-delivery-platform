"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/lib/api";
import { playNotificationSound, shouldAlertForNotification } from "@/lib/notification-sound";
import type { Notification } from "@/types";

const POLL_INTERVAL_MS = 12000;

export function useNotifications(options?: { enableSound?: boolean }) {
  const queryClient = useQueryClient();
  const seenIdsRef = useRef<Set<number>>(new Set());
  const initializedRef = useRef(false);

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await notificationApi.list({ per_page: 50 })).data.data,
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });

  const notifications = query.data?.items ?? [];
  const unreadCount = notifications.filter((notification) => !notification.read_at).length;

  useEffect(() => {
    if (!options?.enableSound) return;

    const currentIds = new Set(notifications.map((notification) => notification.id));

    if (!initializedRef.current) {
      seenIdsRef.current = currentIds;
      initializedRef.current = true;
      return;
    }

    const newNotifications = notifications.filter((notification) => !seenIdsRef.current.has(notification.id));

    if (newNotifications.some((notification) => shouldAlertForNotification(notification.type))) {
      playNotificationSound();
    }

    seenIdsRef.current = currentIds;
  }, [notifications, options?.enableSound]);

  const markAsRead = async (id: number) => {
    await notificationApi.markAsRead(id);
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const markAllAsRead = async () => {
    await notificationApi.readAll();
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    markAsRead,
    markAllAsRead,
    refetch: query.refetch,
  };
}

export function getNotificationMessage(notification: Notification) {
  return notification.body ?? notification.message ?? "";
}
