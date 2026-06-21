"use client";

import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import { PublicNavLink } from "@/components/layout/public/PublicActionButtons";

const footerLinks = {
  product: [
    { href: "/#features", label: "Features" },
    { href: "/#download", label: "Download" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
  ],
  account: [{ href: siteConfig.dashboardLoginPath, label: "Login" }],
};

export function PublicFooter() {
  return (
    <footer className="border-t border-sofra-border/40 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-16">
        <div className="grid gap-12 md:grid-cols-[1.35fr_repeat(3,minmax(0,1fr))] md:gap-10">
          <div className="space-y-5">
            <PublicNavLink href="/" className="inline-flex hover:opacity-90">
              <Image
                src="/logo.png"
                alt={siteConfig.name}
                width={160}
                height={64}
                className="h-12 w-auto object-contain md:h-14"
                unoptimized
              />
            </PublicNavLink>

            <p className="max-w-xs font-serif text-lg leading-snug text-sofra-text">
              <span className="text-sofra-green">Healthy meals,</span>{" "}
              <span className="italic text-sofra-mutedGold">delivered with care.</span>
            </p>

            <p className="max-w-sm text-sm leading-relaxed text-sofra-textMuted">{siteConfig.description}</p>

            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="inline-block text-sm font-medium text-sofra-green underline-offset-4 transition hover:text-sofra-emerald hover:underline"
            >
              {siteConfig.supportEmail}
            </a>
          </div>

          <div>
            <p className="public-section-label">Product</p>
            <ul className="mt-5 space-y-3">
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
            <p className="public-section-label">Legal</p>
            <ul className="mt-5 space-y-3">
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
            <p className="public-section-label">Account</p>
            <ul className="mt-5 space-y-3">
              {footerLinks.account.map((link) => (
                <li key={link.href}>
                  <PublicNavLink href={link.href} className="public-nav-link group text-sm">
                    {link.label}
                  </PublicNavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-sofra-border/40 pt-8 text-xs text-sofra-textMuted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="italic text-sofra-mutedGold">Delivering goodness to your door.</p>
        </div>
      </div>
    </footer>
  );
}
