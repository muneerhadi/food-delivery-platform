"use client";

import { Apple, ArrowUpRight, Play, Truck, UtensilsCrossed, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { PublicHeroCarousel } from "@/components/layout/public/PublicHeroCarousel";
import {
  PublicExternalButton,
  PublicHashButton,
  PublicNavLink,
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

export default function PublicHomePage() {
  return (
    <div className="overflow-hidden bg-white">
      <section className="relative">
        <div className="mx-auto max-w-4xl px-4 pt-16 text-center md:px-6 md:pt-24 lg:pt-28">
          <h1 className="font-serif text-[2.35rem] font-bold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-[3.75rem]">
            Healthy meals,{" "}
            <span className="italic text-sofra-mutedGold">delivered with care</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {siteConfig.description}
          </p>

          <div className="mt-10 flex justify-center">
            <PublicHashButton
              targetId="download"
              size="lg"
              className="public-hero-cta h-14 rounded-full bg-foreground px-8 text-base text-background shadow-[0_16px_40px_-12px_rgba(17,59,49,0.45)] hover:bg-foreground/90"
            >
              Download the app
              <ArrowUpRight className="h-5 w-5" />
            </PublicHashButton>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Restaurants and drivers can{" "}
            <PublicNavLink href={siteConfig.dashboardLoginPath} className="font-medium text-foreground hover:text-foreground">
              sign in here
            </PublicNavLink>
            .
          </p>
        </div>

        <PublicHeroCarousel />
      </section>

      <section id="features" className="relative mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-24">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Why choose us</p>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight md:text-4xl">Why {siteConfig.name}?</h2>
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
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight md:text-4xl">
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
