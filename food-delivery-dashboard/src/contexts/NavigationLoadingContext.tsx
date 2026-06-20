"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useIsFetching } from "@tanstack/react-query";

const DASHBOARD_ROOTS = new Set(["/admin", "/restaurant", "/driver"]);

function matchesNavigationTarget(targetHref: string, pathname: string) {
  if (pathname === targetHref) return true;
  if (DASHBOARD_ROOTS.has(targetHref)) return false;
  return pathname.startsWith(`${targetHref}/`);
}

interface NavigationLoadingContextValue {
  pendingHref: string | null;
  isNavigating: boolean;
  startNavigation: (href: string) => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextValue | null>(null);

export function NavigationLoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [awaitingContent, setAwaitingContent] = useState(false);

  const fetchingCount = useIsFetching({
    predicate: (query) => {
      const rootKey = query.queryKey[0];
      if (rootKey === "notifications") return false;
      return query.state.fetchStatus === "fetching";
    },
  });

  const startNavigation = useCallback(
    (href: string) => {
      if (href === pathname) return;
      setPendingHref(href);
      setAwaitingContent(true);
    },
    [pathname]
  );

  useEffect(() => {
    if (!pendingHref) return;
    if (matchesNavigationTarget(pendingHref, pathname)) {
      setPendingHref(null);
    }
  }, [pathname, pendingHref]);

  useEffect(() => {
    if (!awaitingContent) return;
    if (fetchingCount > 0) return;

    const timer = window.setTimeout(() => setAwaitingContent(false), 80);
    return () => window.clearTimeout(timer);
  }, [awaitingContent, fetchingCount]);

  const isNavigating = pendingHref !== null || awaitingContent;

  const value = useMemo(
    () => ({
      pendingHref,
      isNavigating,
      startNavigation,
    }),
    [pendingHref, isNavigating, startNavigation]
  );

  return <NavigationLoadingContext.Provider value={value}>{children}</NavigationLoadingContext.Provider>;
}

export function useNavigationLoading() {
  const context = useContext(NavigationLoadingContext);
  if (!context) {
    throw new Error("useNavigationLoading must be used within NavigationLoadingProvider");
  }
  return context;
}
