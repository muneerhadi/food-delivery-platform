export const showcaseImages = {
  main: {
    src: "/sections/section-delivery-main.png",
    alt: "Customer receiving a Sofra food delivery at home",
  },
  sideTop: {
    src: "/sections/section-food-mezze.png",
    alt: "Fresh Mediterranean mezze platter",
  },
  sideBottom: {
    src: "/sections/section-food-breakfast.png",
    alt: "Breakfast pancakes with berries",
  },
  thumbs: [
    { src: "/sections/section-food-sushi.png", alt: "Sushi rolls" },
    { src: "/sections/section-food-smoothie.png", alt: "Smoothie bowl" },
    { src: "/sections/section-food-mezze.png", alt: "Mezze platter" },
    { src: "/sections/section-food-breakfast.png", alt: "Breakfast spread" },
  ],
} as const;

export const whyChooseFeatures = [
  {
    title: "Trusted kitchens",
    description: "Order from approved local restaurants with menus you can count on every time.",
  },
  {
    title: "Live order tracking",
    description: "Watch your meal move from confirmed to preparing to on the way in real time.",
  },
  {
    title: "Promos & savings",
    description: "Apply promo codes at checkout and save on your favorite meals.",
  },
  {
    title: "Fast delivery",
    description: "Reliable drivers and clear ETAs so your food arrives hot and on schedule.",
  },
] as const;
