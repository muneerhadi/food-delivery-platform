"use client";

import Image from "next/image";
import {
  heroCarouselLeftToRight,
  heroCarouselRightToLeft,
  type HeroCarouselImage,
} from "@/lib/hero-images";
import { cn } from "@/lib/utils";

const heightMap = {
  sm: "h-full",
  md: "h-full",
  lg: "h-full",
  xl: "h-full",
} as const;

const widthMap = {
  sm: "w-32 md:w-40",
  md: "w-40 md:w-48",
  lg: "w-44 md:w-52",
} as const;

type HeroMarqueeRowProps = {
  images: HeroCarouselImage[];
  direction: "left-to-right" | "right-to-left";
  className?: string;
};

function HeroMarqueeRow({ images, direction, className }: HeroMarqueeRowProps) {
  const loop = [...images, ...images];

  return (
    <div className={cn("public-hero-marquee h-44 overflow-hidden md:h-52", className)}>
      <div
        className={cn(
          "public-hero-marquee-track flex w-max items-stretch gap-0",
          direction === "left-to-right" ? "public-hero-marquee-ltr" : "public-hero-marquee-rtl"
        )}
      >
        {loop.map((image, index) => (
          <div
            key={`${image.src}-${index}`}
            className={cn(
              "public-hero-carousel-card shrink-0 overflow-hidden",
              heightMap[image.height],
              widthMap[image.width]
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={400}
              height={560}
              className="h-full w-full object-cover"
              unoptimized
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PublicHeroCarousel() {
  return (
    <div className="public-hero-carousel relative mt-16 md:mt-20">
      <div className="public-hero-carousel-fade pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28" aria-hidden />
      <div className="space-y-0">
        <HeroMarqueeRow images={heroCarouselLeftToRight} direction="left-to-right" />
        <HeroMarqueeRow images={heroCarouselRightToLeft} direction="right-to-left" />
      </div>
    </div>
  );
}
