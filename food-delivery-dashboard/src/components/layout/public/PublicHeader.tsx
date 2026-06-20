"use client";

import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import {
  PublicNavLink,
  PublicRouteButton,
} from "@/components/layout/public/PublicActionButtons";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <PublicNavLink href="/" className="font-semibold text-foreground hover:text-foreground">
          <span className="flex items-center gap-3">
            <Image src="/logo.png" alt={siteConfig.name} width={40} height={40} className="h-10 w-auto" unoptimized />
            <span className="text-lg tracking-tight">{siteConfig.name}</span>
          </span>
        </PublicNavLink>
        <nav className="hidden items-center gap-6 md:flex">
          <PublicNavLink href="/#features">Features</PublicNavLink>
          <PublicNavLink href="/#download">Download</PublicNavLink>
          <PublicNavLink href="/privacy">Privacy</PublicNavLink>
          <PublicNavLink href="/terms">Terms</PublicNavLink>
        </nav>
        <PublicRouteButton href={siteConfig.dashboardLoginPath} size="sm">
          Partner login
        </PublicRouteButton>
      </div>
    </header>
  );
}
