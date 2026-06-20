"use client";

import Image from "next/image";
import { LogOut } from "lucide-react";
import { DashboardNavLink } from "@/components/layout/DashboardNavLink";
import { navByRole } from "@/components/layout/nav-config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();

  if (!user || user.role === "customer") return null;

  const navItems = navByRole[user.role];
  const dashboardHref = navItems[0]?.href;

  return (
    <aside className={cn("dashboard-sidebar", className)}>
      <div className="px-5 py-6">
        <Image
          src="/logo.png"
          alt="Sofra"
          width={160}
          height={160}
          className="h-24 w-auto max-w-full object-contain sm:h-28"
          unoptimized
          priority
        />
      </div>

      <nav className="flex-1 space-y-1 px-3 pb-5">
        {navItems.map((item) => (
          <DashboardNavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            dashboardHref={dashboardHref}
            onNavigate={onNavigate}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            activeClassName="bg-primary text-primary-foreground shadow-sm"
            idleClassName="text-muted-foreground hover:bg-primary/10 hover:text-foreground"
          />
        ))}
      </nav>

      <div className="border-t border-sofra-border/80 p-3 dark:border-border">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:bg-primary/5 hover:text-foreground"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
