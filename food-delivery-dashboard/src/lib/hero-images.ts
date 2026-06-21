export type HeroCarouselImage = {
  src: string;
  alt: string;
  height: "sm" | "md" | "lg" | "xl";
  width: "sm" | "md" | "lg";
};

export const heroCarouselLeftToRight: HeroCarouselImage[] = [
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
];

export const heroCarouselRightToLeft: HeroCarouselImage[] = [
  {
    src: "/hero/hero-food-tacos.png",
    alt: "Street tacos with lime",
    height: "lg",
    width: "sm",
  },
  {
    src: "/hero/hero-food-pasta.png",
    alt: "Creamy pasta carbonara",
    height: "md",
    width: "md",
  },
  {
    src: "/hero/hero-food-cafe.png",
    alt: "Coffee and pastry breakfast",
    height: "xl",
    width: "sm",
  },
  {
    src: "/hero/hero-food-dessert.png",
    alt: "Chocolate lava cake dessert",
    height: "md",
    width: "sm",
  },
  {
    src: "/hero/hero-food-wrap.png",
    alt: "Grilled chicken wrap",
    height: "lg",
    width: "md",
  },
];

/** @deprecated Use heroCarouselLeftToRight */
export const heroCarouselImages = heroCarouselLeftToRight;
