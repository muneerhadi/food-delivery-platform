"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  heroCarouselLeftToRight,
  heroCarouselRightToLeft,
  type HeroCarouselImage,
} from "@/lib/hero-images";
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

function HeroCarouselImageCard({
  image,
  index,
  copy,
}: {
  image: HeroCarouselImage;
  index: number;
  copy: number;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [image.src]);

  return (
    <div
      className={cn(
        "public-hero-carousel-card relative shrink-0 overflow-hidden rounded-[1.35rem] bg-[#e3efe8] shadow-[0_12px_40px_-16px_rgba(17,59,49,0.35)] ring-1 ring-black/5",
        heightMap[image.height],
        widthMap[image.width],
        index % 2 === 0 ? "md:translate-y-3" : "md:-translate-y-1"
      )}
    >
      <div
        className={cn(
          "public-hero-carousel-skeleton absolute inset-0 z-0",
          loaded ? "opacity-0" : "opacity-100"
        )}
        aria-hidden
      />
      <Image
        src={image.src}
        alt={copy === 0 ? image.alt : ""}
        width={400}
        height={560}
        className="relative z-10 h-full w-full object-cover"
        unoptimized
        draggable={false}
        aria-hidden={copy !== 0}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

type HeroMarqueeRowProps = {
  images: HeroCarouselImage[];
  direction: "left-to-right" | "right-to-left";
};

function HeroMarqueeRow({ images, direction }: HeroMarqueeRowProps) {
  return (
    <div className="public-hero-marquee w-full overflow-hidden">
      <div
        className={cn(
          "public-hero-marquee-inner flex w-max items-end gap-3 md:gap-4",
          direction === "left-to-right" ? "public-hero-marquee-ltr" : "public-hero-marquee-rtl"
        )}
      >
        {[0, 1].map((copy) =>
          images.map((image, index) => (
            <HeroCarouselImageCard
              key={`${copy}-${image.src}-${index}`}
              image={image}
              index={index}
              copy={copy}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function PublicHeroCarousel() {
  useEffect(() => {
    const sources = [...heroCarouselLeftToRight, ...heroCarouselRightToLeft].map((image) => image.src);
    sources.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  return (
    <div className="public-hero-carousel relative mt-16 w-full md:mt-20">
      <div className="public-hero-carousel-fade pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28" aria-hidden />
      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 space-y-4 bg-sofra-softGreen/30 py-3 md:space-y-5 md:py-4">
        <HeroMarqueeRow images={heroCarouselLeftToRight} direction="left-to-right" />
        <HeroMarqueeRow images={heroCarouselRightToLeft} direction="right-to-left" />
      </div>
    </div>
  );
}
