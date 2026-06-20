"use client";

import Image from "next/image";
import { Apple, Play, Sparkles, Truck, UtensilsCrossed, MapPin, Clock3, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import {
  PublicExternalButton,
  PublicHashButton,
  PublicNavLink,
  PublicRouteButton,
} from "@/components/layout/public/PublicActionButtons";

const features = [
  {
    icon: UtensilsCrossed,
    title: "Curated restaurants",
    description: "Discover kitchens and restaurants near you with menus that fit your taste.",
  },
  {
    icon: MapPin,
    title: "Live order tracking",
    description: "Follow every step from preparation to delivery at your door.",
  },
  {
    icon: Truck,
    title: "Fast local delivery",
    description: "Reliable drivers and clear ETAs so dinner arrives when you need it.",
  },
];

const highlights = [
  { icon: Clock3, label: "Real-time updates" },
  { icon: ShieldCheck, label: "Trusted local partners" },
  { icon: Sparkles, label: "Wholesome choices" },
];

export default function PublicHomePage() {
  return (
    <div className="public-mesh-bg overflow-hidden">
      <section className="relative">
        <div className="public-orb -left-24 top-8 h-72 w-72 bg-primary/15" aria-hidden />
        <div className="public-orb -right-16 top-32 h-80 w-80 bg-sofra-gold/10" aria-hidden />
        <div className="public-orb bottom-0 left-1/3 h-64 w-64 bg-emerald-400/10" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 md:px-6 md:pb-28 md:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="space-y-8">
              <div className="public-stat-pill">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Food delivery, refined
              </div>

              <div className="space-y-5">
                <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
                  {siteConfig.tagline}
                </h1>
                <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                  {siteConfig.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <PublicHashButton targetId="download" size="lg" className="public-btn-premium h-12 px-8">
                  Download the app
                </PublicHashButton>
                <PublicRouteButton
                  href={siteConfig.dashboardLoginPath}
                  size="lg"
                  variant="outline"
                  className="public-btn-outline-premium h-12 px-8"
                >
                  Restaurant & driver login
                </PublicRouteButton>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {highlights.map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-2 rounded-full border border-sofra-border/70 bg-white/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm"
                  >
                    <item.icon className="h-3.5 w-3.5 text-primary" />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="public-logo-frame relative w-full max-w-md">
                <div className="relative z-10 flex flex-col items-center">
                  <Image
                    src="/logo.png"
                    alt={siteConfig.name}
                    width={320}
                    height={320}
                    className="mx-auto h-52 w-auto object-contain md:h-64"
                    unoptimized
                    priority
                  />
                  <div className="mt-6 w-full rounded-2xl border border-sofra-border/60 bg-white/70 p-4 text-center shadow-sm backdrop-blur-sm">
                    <p className="text-sm font-semibold text-foreground">Your table, delivered</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Order in seconds. Track every mile.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-24">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Why choose us</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Why {siteConfig.name}?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need for stress-free food delivery — thoughtfully designed from order to doorstep.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="public-feature-card">
              <div className="public-icon-shell">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-semibold tracking-tight">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="download" className="mx-auto max-w-6xl px-4 pb-24 md:px-6 md:pb-32">
        <div className="public-cta-card text-center">
          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Get started</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Get the {siteConfig.name} app
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Order on your phone. Available for iOS and Android — download links below.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <PublicExternalButton href={siteConfig.appStoreUrl} size="lg" className="public-btn-premium h-12 min-w-[220px]">
                <Apple className="h-5 w-5" />
                App Store
              </PublicExternalButton>
              <PublicExternalButton
                href={siteConfig.playStoreUrl}
                size="lg"
                variant="outline"
                className="public-btn-outline-premium h-12 min-w-[220px] bg-white/90"
              >
                <Play className="h-5 w-5" />
                Google Play
              </PublicExternalButton>
            </div>

            <p className="mt-8 text-xs text-muted-foreground">
              By using {siteConfig.name} you agree to our{" "}
              <PublicNavLink href="/terms" className="font-medium text-primary hover:text-primary">
                Terms
              </PublicNavLink>{" "}
              and{" "}
              <PublicNavLink href="/privacy" className="font-medium text-primary hover:text-primary">
                Privacy Policy
              </PublicNavLink>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
