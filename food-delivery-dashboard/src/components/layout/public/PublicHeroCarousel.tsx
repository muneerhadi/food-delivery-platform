"use client";

import Image from "next/image";
import { heroCarouselImages } from "@/lib/hero-images";
import { cn } from "@/lib/utils";

const heightMap = {
  sm: "h-44 md:h-52",
  md: "h-52 md:h-64",
  lg: "h-60 md:h-72",
  xl: "h-72 md:h-[22rem]",
} as const;

const widthMap = {
  sm: "w-36 md:w-44",
  md: "w-44 md:w-56",
  lg: "w-52 md:w-64",
} as const;

export function PublicHeroCarousel() {
  return (
    <div className="public-hero-carousel relative mt-16 md:mt-20">
      <div className="public-hero-carousel-fade pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28" aria-hidden />
      <div className="overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="public-hero-carousel-track mx-auto flex w-max items-end justify-center gap-3 px-6 md:gap-4 md:px-10">
          {heroCarouselImages.map((image, index) => (
            <div
              key={`${image.src}-${index}`}
              className={cn(
                "public-hero-carousel-card shrink-0 overflow-hidden rounded-[1.35rem] shadow-[0_12px_40px_-16px_rgba(17,59,49,0.35)] ring-1 ring-black/5",
                heightMap[image.height],
                widthMap[image.width],
                index % 2 === 0 ? "md:translate-y-3" : "md:-translate-y-1"
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
    </div>
  );
}
