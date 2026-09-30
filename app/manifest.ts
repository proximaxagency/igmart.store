import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IGMART — The #1 Gaming Marketplace",
    short_name: "IGMART",
    description:
      "Buy, sell and trade gaming accounts, items, currency, boosting and services across 300+ games. Secure escrow, verified sellers, 24/7 support.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#7c3aed",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["games", "shopping", "entertainment"],
    lang: "en",
    dir: "ltr",
    orientation: "portrait-primary",
    shortcuts: [
      {
        name: "Browse Marketplace",
        url: "/marketplace",
        description: "Browse gaming assets across all categories",
      },
      {
        name: "Start Selling",
        url: "/sell",
        description: "List your gaming items for sale",
      },
      {
        name: "My Orders",
        url: "/account/orders",
        description: "View your order history",
      },
    ],
  };
}
