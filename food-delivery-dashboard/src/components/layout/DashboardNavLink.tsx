"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { useNavigationLoading } from "@/contexts/NavigationLoadingContext";
import { cn } from "@/lib/utils";

interface DashboardNavLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  dashboardHref?: string;
  className?: string;
  activeClassName?: string;
  idleClassName?: string;
  onNavigate?: () => void;
}

export function DashboardNavLink({
  href,
  label,
  icon: Icon,
  dashboardHref,
  className,
  activeClassName,
  idleClassName,
  onNavigate,
}: DashboardNavLinkProps) {
  const pathname = usePathname();
  const { pendingHref, startNavigation } = useNavigationLoading();

  const active =
    pathname === href || (dashboardHref && href !== dashboardHref && pathname.startsWith(`${href}/`));

  const isPending = pendingHref === href;

  return (
    <Link
      href={href}
      onClick={() => {
        onNavigate?.();
        startNavigation(href);
      }}
      className={cn(className, active ? activeClassName : idleClassName)}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{label}</span>
      {isPending ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : null}
    </Link>
  );
}
