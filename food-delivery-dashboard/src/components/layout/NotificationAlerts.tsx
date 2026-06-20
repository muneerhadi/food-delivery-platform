"use client";

import { useNotifications } from "@/hooks/useNotifications";

/** Polls notifications and plays a sound when new order alerts arrive. */
export function NotificationAlerts() {
  useNotifications({ enableSound: true });
  return null;
}
