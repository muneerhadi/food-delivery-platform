"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: User) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      setAuth: (user, token) => {
        queryClient.clear();
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
        }
        set({ user, token, isLoading: false });
      },
      updateUser: (user) => set({ user }),
      clearAuth: () => {
        queryClient.clear();
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        set({ user: null, token: null, isLoading: false });
      },
      checkAuth: async () => {
        const token = get().token ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);
        if (!token) {
          set({ user: null, token: null, isLoading: false });
          return;
        }

        set({ isLoading: true, token });
        try {
          const response = await authApi.me();
          set({ user: response.data.data, token, isLoading: false });
        } catch {
          get().clearAuth();
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
