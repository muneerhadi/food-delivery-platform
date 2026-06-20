"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { navByRole } from "@/components/layout/nav-config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user || user.role === "customer") return null;

  const navItems = navByRole[user.role];

  return (
    <aside className={cn("flex h-full flex-col bg-sofra-gradient text-white", className)}>
      <div className="flex items-center gap-3 border-b border-white/15 px-5 py-5">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white">
          <Image src="/logo.png" alt="Sofra" width={36} height={36} className="h-9 w-9 object-contain" unoptimized />
        </div>
        <div>
          <p className="font-semibold">Sofra</p>
          <p className="text-xs text-white/80">Operations Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-white text-sofra-green shadow" : "text-white/85 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/15 p-3">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
