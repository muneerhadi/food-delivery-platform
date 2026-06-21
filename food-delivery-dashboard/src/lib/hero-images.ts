export type HeroCarouselImage = {
  src: string;
  alt: string;
  height: "sm" | "md" | "lg" | "xl";
  width: "sm" | "md" | "lg";
};

export const heroCarouselImages: HeroCarouselImage[] = [
  {
    src: "/hero/hero-food-salad.png",
    alt: "Fresh healthy salad bowl",
    height: "xl",
    width: "sm",
  },
  {
    src: "/hero/hero-food-burger.png",
    alt: "Gourmet burger with fries",
    height: "md",
    width: "md",
  },
  {
    src: "/hero/hero-food-delivery.png",
    alt: "Healthy meals ready for delivery",
    height: "lg",
    width: "lg",
  },
  {
    src: "/hero/hero-food-pizza.png",
    alt: "Fresh margherita pizza",
    height: "md",
    width: "sm",
  },
  {
    src: "/hero/hero-food-noodles.png",
    alt: "Asian noodle bowl",
    height: "xl",
    width: "sm",
  },
  {
    src: "/hero/hero-food-burger.png",
    alt: "Comfort food delivery",
    height: "sm",
    width: "md",
  },
  {
    src: "/hero/hero-food-pizza.png",
    alt: "Artisan pizza slices",
    height: "lg",
    width: "sm",
  },
];
