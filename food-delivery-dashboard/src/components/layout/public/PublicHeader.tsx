"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Menu } from "lucide-react";
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
  PublicHashButton,
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
    <header className="relative z-30 border-b border-sofra-border/40 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto grid h-[4.5rem] max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-8">
        <PublicNavLink href="/" className="group flex self-stretch items-center justify-self-start py-2 hover:opacity-90">
          <Image
            src="/logo.png"
            alt={siteConfig.name}
            width={180}
            height={72}
            className="h-full max-h-[3.5rem] w-auto object-contain md:max-h-[3.75rem]"
            unoptimized
            priority
          />
        </PublicNavLink>

        <nav className="hidden items-center justify-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <PublicNavLink key={link.href} href={link.href} className="public-nav-link group text-[0.9375rem]">
              {link.label}
            </PublicNavLink>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <PublicHashButton
            targetId="download"
            size="sm"
            className="public-hero-cta hidden h-10 rounded-full px-5 sm:inline-flex"
          >
            Get the app
            <ArrowUpRight className="h-4 w-4" />
          </PublicHashButton>

          <PublicRouteButton
            href={siteConfig.dashboardLoginPath}
            size="sm"
            variant="outline"
            className="public-btn-outline-premium hidden h-10 rounded-full px-4 md:inline-flex"
          >
            Login
          </PublicRouteButton>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-sofra-text hover:bg-sofra-softGreen hover:text-sofra-text lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw-2rem,20rem)] border-sofra-border/60">
              <SheetHeader>
                <SheetTitle className="text-left font-serif">{siteConfig.name}</SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <PublicNavLink
                    key={link.href}
                    href={link.href}
                    className="rounded-xl px-3 py-3 text-left text-base font-medium text-sofra-text hover:bg-sofra-softGreen hover:text-sofra-text"
                    onNavigate={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </PublicNavLink>
                ))}
              </nav>
              <div className="mt-6 space-y-3 border-t border-sofra-border/60 pt-6">
                <PublicHashButton
                  targetId="download"
                  className="public-hero-cta h-11 w-full rounded-full"
                  onAction={() => setMobileOpen(false)}
                >
                  Get the app
                  <ArrowUpRight className="h-4 w-4" />
                </PublicHashButton>
                <PublicRouteButton
                  href={siteConfig.dashboardLoginPath}
                  variant="outline"
                  className="public-btn-outline-premium w-full rounded-full"
                >
                  Login
                </PublicRouteButton>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
