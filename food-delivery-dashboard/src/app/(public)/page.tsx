"use client";

import {
  Apple,
  ArrowUpRight,
  BadgePercent,
  Clock3,
  MapPin,
  Play,
  Store,
} from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { whyChooseFeatures } from "@/lib/public-sections";
import { PublicHeroCarousel } from "@/components/layout/public/PublicHeroCarousel";
import { PublicImageCollage } from "@/components/layout/public/PublicImageCollage";
import {
  PublicExternalButton,
  PublicHashButton,
  PublicNavLink,
} from "@/components/layout/public/PublicActionButtons";

const featureIcons = [Store, MapPin, BadgePercent, Clock3];

export default function PublicHomePage() {
  return (
    <div className="overflow-hidden bg-white">
      <section className="relative">
        <div className="mx-auto max-w-4xl px-4 pt-16 text-center md:px-6 md:pt-24 lg:pt-28">
          <h1 className="font-serif text-[2.35rem] font-bold leading-[1.08] tracking-tight md:text-5xl lg:text-[3.75rem]">
            <span className="text-sofra-green">Healthy meals,</span>{" "}
            <span className="bg-gradient-to-r from-sofra-gold to-sofra-mutedGold bg-clip-text italic text-transparent">
              delivered with care
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {siteConfig.description}
          </p>

          <div className="mt-10 flex justify-center">
            <PublicHashButton
              targetId="download"
              size="lg"
              className="public-hero-cta h-14 rounded-full px-8 text-base shadow-[0_16px_40px_-12px_rgba(17,59,49,0.45)]"
            >
              Download the app
              <ArrowUpRight className="h-5 w-5" />
            </PublicHashButton>
          </div>
        </div>

        <PublicHeroCarousel />
      </section>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-16 md:px-6 md:py-20">
        <section id="download" className="public-panel">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
            <div className="space-y-6">
              <p className="public-section-label">Get started</p>
              <h2 className="max-w-lg font-serif text-3xl font-bold leading-tight tracking-tight text-sofra-text md:text-4xl lg:text-[2.65rem]">
                Ready to enjoy your next meal,{" "}
                <span className="bg-gradient-to-r from-sofra-gold to-sofra-mutedGold bg-clip-text italic text-transparent">
                  delivered with care?
                </span>
              </h2>
              <p className="max-w-md text-base leading-relaxed text-sofra-textMuted md:text-lg">
                Browse trusted restaurants near you, place an order in seconds, and track every step until your meal
                arrives at your door.
              </p>

              <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
                <PublicHashButton
                  targetId="download"
                  size="lg"
                  className="public-hero-cta public-cta-pill h-14 rounded-full px-6 text-base"
                >
                  Download the app
                  <span className="public-cta-pill-icon">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </PublicHashButton>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <PublicExternalButton href={siteConfig.appStoreUrl} size="lg" className="public-btn-premium h-11 min-w-[180px]">
                  <Apple className="h-5 w-5" />
                  App Store
                </PublicExternalButton>
                <PublicExternalButton
                  href={siteConfig.playStoreUrl}
                  size="lg"
                  variant="outline"
                  className="public-btn-outline-premium h-11 min-w-[180px]"
                >
                  <Play className="h-5 w-5" />
                  Google Play
                </PublicExternalButton>
              </div>
            </div>

            <PublicImageCollage />
          </div>
        </section>

        <section id="features" className="public-panel">
          <div className="mx-auto max-w-3xl text-center">
            <p className="public-section-label">Why choose us</p>
            <h2 className="mt-4 font-serif text-3xl font-bold leading-tight tracking-tight text-sofra-text md:text-4xl lg:text-[2.65rem]">
              We deliver with purpose,{" "}
              <span className="bg-gradient-to-r from-sofra-gold to-sofra-mutedGold bg-clip-text italic text-transparent">
                speed, and care.
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-sofra-textMuted md:text-lg">
              {siteConfig.name} brings together great local food, live tracking, and reliable delivery — so every order
              feels simple from start to finish.
            </p>
          </div>

          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {whyChooseFeatures.map((feature, index) => {
              const Icon = featureIcons[index];
              return (
                <div key={feature.title} className="public-benefit-item text-center lg:text-left">
                  <div className="public-benefit-icon mx-auto lg:mx-0">
                    <Icon className="h-5 w-5 text-sofra-green" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-sofra-text">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-sofra-textMuted">{feature.description}</p>
                </div>
              );
            })}
          </div>

          <p className="mt-12 text-center text-xs text-sofra-textMuted">
            By using {siteConfig.name} you agree to our{" "}
            <PublicNavLink href="/terms" className="font-medium text-sofra-green hover:text-sofra-emerald">
              Terms
            </PublicNavLink>{" "}
            and{" "}
            <PublicNavLink href="/privacy" className="font-medium text-sofra-green hover:text-sofra-emerald">
              Privacy Policy
            </PublicNavLink>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
