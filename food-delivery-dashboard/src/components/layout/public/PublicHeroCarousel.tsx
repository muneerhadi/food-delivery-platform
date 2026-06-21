"use client";

import Image from "next/image";
import {
  heroCarouselLeftToRight,
  heroCarouselRightToLeft,
  type HeroCarouselImage,
} from "@/lib/hero-images";
import { cn } from "@/lib/utils";

const heightMap = {
  sm: "h-40 md:h-48",
  md: "h-48 md:h-56",
  lg: "h-52 md:h-64",
  xl: "h-56 md:h-[18rem]",
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
    <div className={cn("public-hero-marquee overflow-hidden", className)}>
      <div
        className={cn(
          "public-hero-marquee-track flex w-max items-end gap-3 md:gap-4",
          direction === "left-to-right" ? "public-hero-marquee-ltr" : "public-hero-marquee-rtl"
        )}
      >
        {loop.map((image, index) => (
          <div
            key={`${image.src}-${index}`}
            className={cn(
              "public-hero-carousel-card shrink-0 overflow-hidden rounded-[1.35rem] shadow-[0_12px_40px_-16px_rgba(17,59,49,0.35)] ring-1 ring-black/5",
              heightMap[image.height],
              widthMap[image.width],
              index % 2 === 0 ? "md:translate-y-2" : "md:-translate-y-1"
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={400}
              height={560}
              className="h-full w-full object-cover"
              unoptimized
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
      <div className="space-y-4 md:space-y-5">
        <HeroMarqueeRow images={heroCarouselLeftToRight} direction="left-to-right" />
        <HeroMarqueeRow images={heroCarouselRightToLeft} direction="right-to-left" />
      </div>
    </div>
  );
}
