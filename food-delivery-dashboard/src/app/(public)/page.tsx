"use client";

import Image from "next/image";
import { Apple, Play, Truck, UtensilsCrossed, MapPin } from "lucide-react";
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

export default function PublicHomePage() {
  return (
    <div className="bg-gradient-to-b from-sofra-softGreen/40 via-background to-background">
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Food delivery made simple</p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">{siteConfig.tagline}</h1>
            <p className="text-lg leading-relaxed text-muted-foreground">{siteConfig.description}</p>
            <div className="flex flex-wrap gap-3">
              <PublicHashButton targetId="download" size="lg">Download the app</PublicHashButton>
              <PublicRouteButton href={siteConfig.dashboardLoginPath} size="lg" variant="outline">
                Restaurant & driver login
              </PublicRouteButton>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative rounded-3xl border border-border/70 bg-card p-8 shadow-sm">
              <Image
                src="/logo.png"
                alt={siteConfig.name}
                width={280}
                height={280}
                className="mx-auto h-56 w-auto object-contain md:h-72"
                unoptimized
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">Why {siteConfig.name}?</h2>
          <p className="mt-2 text-muted-foreground">Everything you need for stress-free food delivery.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition hover:border-primary/30"
            >
              <feature.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="download" className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="rounded-2xl border border-border/70 bg-card p-8 text-center shadow-sm md:p-12">
          <h2 className="text-2xl font-semibold md:text-3xl">Get the {siteConfig.name} app</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Order on your phone. Available for iOS and Android — download links below.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <PublicExternalButton href={siteConfig.appStoreUrl} size="lg" className="min-w-[200px]">
              <Apple className="h-5 w-5" />
              App Store
            </PublicExternalButton>
            <PublicExternalButton href={siteConfig.playStoreUrl} size="lg" variant="outline" className="min-w-[200px]">
              <Play className="h-5 w-5" />
              Google Play
            </PublicExternalButton>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            By using {siteConfig.name} you agree to our{" "}
            <PublicNavLink href="/terms" className="text-primary hover:text-primary">Terms</PublicNavLink> and{" "}
            <PublicNavLink href="/privacy" className="text-primary hover:text-primary">Privacy Policy</PublicNavLink>.
          </p>
        </div>
      </section>
    </div>
  );
}
