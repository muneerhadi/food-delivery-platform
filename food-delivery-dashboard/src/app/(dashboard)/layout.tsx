"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { NotificationAlerts } from "@/components/layout/NotificationAlerts";
import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";
import { Sidebar } from "@/components/layout/Sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { NavigationLoadingProvider } from "@/contexts/NavigationLoadingContext";
import { useAuth } from "@/hooks/useAuth";

const rolePathPrefix = {
  super_admin: "/admin",
  restaurant_owner: "/restaurant",
  driver: "/driver",
} as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, token, isLoading, checkAuth, roleHome } = useAuth();

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const isRouteAllowed = useMemo(() => {
    if (!user || user.role === "customer") return false;
    if (pathname.startsWith("/notifications")) return true;
    return pathname.startsWith(rolePathPrefix[user.role]);
  }, [pathname, user]);

  useEffect(() => {
    if (isLoading) return;

    if (!token || !user) {
      router.replace("/login");
      return;
    }

    if (user.role === "customer") {
      router.replace("/login");
      return;
    }

    if (!isRouteAllowed) {
      router.replace(roleHome);
    }
  }, [isLoading, token, user, isRouteAllowed, roleHome, router]);

  if (isLoading || !token || !user || user.role === "customer") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner label="Checking session..." />
      </div>
    );
  }

  return (
    <NavigationLoadingProvider>
      <div className="flex h-dvh overflow-hidden bg-background">
        <aside className="hidden h-full w-72 shrink-0 lg:block">
          <Sidebar className="h-full" />
        </aside>

        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="p-0">
            <Sidebar className="h-full" onNavigate={() => setMobileSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <NotificationAlerts />
          <Header onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
          <main className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-muted/25 px-4 py-6 md:px-8 md:py-8">
            <PageLoadingOverlay />
            {children}
          </main>
        </div>
      </div>
    </NavigationLoadingProvider>
  );
}
