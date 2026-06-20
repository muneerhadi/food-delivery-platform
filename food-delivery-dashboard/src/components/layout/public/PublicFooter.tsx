"use client";

import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import {
  PublicNavLink,
  PublicRouteButton,
} from "@/components/layout/public/PublicActionButtons";

const footerLinks = {
  product: [
    { href: "/#features", label: "Features" },
    { href: "/#download", label: "Download app" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy policy" },
    { href: "/terms", label: "Terms of service" },
  ],
  partners: [{ href: siteConfig.dashboardLoginPath, label: "Partner dashboard" }],
};

export function PublicFooter() {
  return (
    <footer className="border-t border-sofra-border/60 bg-gradient-to-b from-sofra-softGreen/30 to-card">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 ring-1 ring-primary/10">
                <Image src="/logo.png" alt={siteConfig.name} width={28} height={28} className="h-7 w-auto" unoptimized />
              </span>
              <p className="text-lg font-semibold tracking-tight">{siteConfig.name}</p>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{siteConfig.tagline}</p>
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="inline-block text-sm font-medium text-primary underline-offset-4 transition hover:underline"
            >
              {siteConfig.supportEmail}
            </a>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</p>
            <ul className="mt-4 space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <PublicNavLink href={link.href} className="public-nav-link group text-sm">
                    {link.label}
                  </PublicNavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Legal</p>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <PublicNavLink href={link.href} className="public-nav-link group text-sm">
                    {link.label}
                  </PublicNavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Partners</p>
            <ul className="mt-4 space-y-3">
              {footerLinks.partners.map((link) => (
                <li key={link.href}>
                  <PublicRouteButton
                    href={link.href}
                    variant="link"
                    className="h-auto p-0 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </PublicRouteButton>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-sofra-border/50 pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p>Wholesome food, delivered with care.</p>
        </div>
      </div>
    </footer>
  );
}
