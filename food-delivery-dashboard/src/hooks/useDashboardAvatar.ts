"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi, driverApi, restaurantApi } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/utils";
import type { User } from "@/types";

export function useDashboardAvatar(user: User | null) {
  const { data: adminProfile } = useQuery({
    queryKey: ["admin-profile", user?.id],
    queryFn: async () => (await adminApi.profile()).data.data,
    enabled: user?.role === "super_admin" && Boolean(user?.id),
    retry: false,
  });

  const { data: restaurantProfile } = useQuery({
    queryKey: ["restaurant-profile", user?.id],
    queryFn: async () => (await restaurantApi.profile()).data.data,
    enabled: user?.role === "restaurant_owner" && Boolean(user?.id),
    retry: false,
  });

  const { data: driverProfile } = useQuery({
    queryKey: ["driver-profile", user?.id],
    queryFn: async () => (await driverApi.profile()).data.data,
    enabled: user?.role === "driver" && Boolean(user?.id),
    retry: false,
  });

  if (user?.role === "super_admin" && adminProfile?.avatar) {
    return resolveMediaUrl(adminProfile.avatar);
  }

  if (user?.role === "restaurant_owner" && restaurantProfile?.logo) {
    return resolveMediaUrl(restaurantProfile.logo);
  }

  if (user?.role === "driver" && driverProfile?.avatar) {
    return resolveMediaUrl(driverProfile.avatar);
  }

  return resolveMediaUrl(user?.avatar);
}
