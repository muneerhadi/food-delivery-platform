export const siteConfig = {
  name: "Sofra",
  tagline: "Healthy meals, delivered with care",
  description:
    "Order from trusted local restaurants, track your delivery in real time, and enjoy wholesome food at home.",
  supportEmail: "support@sofra.app",
  dashboardLoginPath: "/login",
  appStoreUrl: process.env.NEXT_PUBLIC_APP_STORE_URL ?? "#download-ios",
  playStoreUrl: process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? "#download-android",
};
