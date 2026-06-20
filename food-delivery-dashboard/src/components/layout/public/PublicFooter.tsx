"use client";

import { siteConfig } from "@/lib/site-config";
import {
  PublicNavLink,
  PublicRouteButton,
} from "@/components/layout/public/PublicActionButtons";

export function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="font-semibold">{siteConfig.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{siteConfig.tagline}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <PublicNavLink href="/privacy">Privacy policy</PublicNavLink>
          <PublicNavLink href="/terms">Terms of service</PublicNavLink>
          <PublicNavLink href={siteConfig.dashboardLoginPath}>Partner dashboard</PublicNavLink>
          <a href={`mailto:${siteConfig.supportEmail}`} className="text-sm text-muted-foreground hover:text-foreground">
            {siteConfig.supportEmail}
          </a>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
