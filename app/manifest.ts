import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IGMART — Premier Gaming Marketplace",
    short_name: "IGMART",
    description:
      "Buy, sell and trade verified gaming accounts and items across top games: Clash of Clans, Pokémon GO, Free Fire, Roblox, and Clash Royale. 100% Escrow Protection.",
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
