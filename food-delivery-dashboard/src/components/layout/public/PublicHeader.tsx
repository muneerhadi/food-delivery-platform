"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  PublicNavLink,
  PublicRouteButton,
} from "@/components/layout/public/PublicActionButtons";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#download", label: "Download" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="public-glass-header sticky top-0 z-30">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <PublicNavLink href="/" className="group font-semibold text-foreground hover:text-foreground">
          <span className="flex items-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-sofra-softGreen/80 ring-1 ring-primary/10">
              <Image
                src="/logo.png"
                alt={siteConfig.name}
                width={36}
                height={36}
                className="h-8 w-auto"
                unoptimized
              />
            </span>
            <span className="text-lg tracking-tight">{siteConfig.name}</span>
          </span>
        </PublicNavLink>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <PublicNavLink key={link.href} href={link.href} className="public-nav-link group">
              {link.label}
            </PublicNavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <PublicRouteButton
            href={siteConfig.dashboardLoginPath}
            size="sm"
            className="public-btn-premium hidden sm:inline-flex"
          >
            Partner login
          </PublicRouteButton>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw-2rem,20rem)] border-sofra-border/60">
              <SheetHeader>
                <SheetTitle className="text-left">{siteConfig.name}</SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <PublicNavLink
                    key={link.href}
                    href={link.href}
                    className="rounded-xl px-3 py-3 text-left text-base font-medium text-foreground hover:bg-sofra-softGreen/60"
                    onNavigate={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </PublicNavLink>
                ))}
              </nav>
              <div className="mt-6 border-t border-sofra-border/60 pt-6">
                <PublicRouteButton
                  href={siteConfig.dashboardLoginPath}
                  className="public-btn-premium w-full"
                >
                  Partner login
                </PublicRouteButton>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
