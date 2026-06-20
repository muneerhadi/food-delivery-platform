"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
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
    return <LoadingSpinner label="Checking session..." />;
  }

  return (
    <div className="flex min-h-screen bg-sofra-bg/70">
      <aside className="hidden h-screen w-72 shrink-0 lg:block">
        <Sidebar />
      </aside>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0">
          <Sidebar className="h-full" onNavigate={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
