"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types";

const roleHomeMap: Record<Exclude<UserRole, "customer">, string> = {
  super_admin: "/admin",
  restaurant_owner: "/restaurant",
  driver: "/driver",
};

export const useAuth = () => {
  const router = useRouter();
  const { user, token, isLoading, setAuth, clearAuth, checkAuth } = useAuthStore();

  const roleHome = useMemo(() => {
    if (!user || user.role === "customer") return "/login";
    return roleHomeMap[user.role];
  }, [user]);

  const logout = () => {
    clearAuth();
    router.replace("/login");
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(token && user),
    roleHome,
    setAuth,
    clearAuth,
    checkAuth,
    logout,
  };
};
