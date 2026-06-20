"use client";

import { useMemo } from "react";
import { Menu, Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { titleFromPath } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardAvatar } from "@/hooks/useDashboardAvatar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const { user, logout } = useAuth();
  const profileImageUrl = useDashboardAvatar(user);

  const mobileTitle = useMemo(() => titleFromPath(pathname), [pathname]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <header className="z-20 shrink-0 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Button type="button" variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={onOpenMobileSidebar}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
          <p className="truncate text-sm font-semibold lg:hidden">{mobileTitle}</p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto rounded-full px-1.5 py-1">
                <Avatar className="h-8 w-8 border border-border/60">
                  <AvatarImage src={profileImageUrl ?? undefined} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="ml-2 hidden text-left md:block">
                  <p className="text-sm font-medium leading-none">{user?.name ?? "User"}</p>
                  <p className="mt-0.5 text-xs capitalize text-muted-foreground">{user?.role?.replace("_", " ")}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
