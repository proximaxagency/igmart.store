import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gaming Marketplace — Buy & Sell Accounts, Items, Boosting | IGMART",
  description: "Browse thousands of verified gaming accounts, in-game currency, rare skins, and boosting services across top games. 100% Escrow Protection on IGMART.",
  keywords: "gaming marketplace, buy game accounts, sell game accounts, clash of clans th16, pokemon go accounts, free fire sakura, roblox korblox, instant delivery escrow",
  alternates: {
    canonical: "https://igmart.store/marketplace",
  },
  openGraph: {
    title: "Gaming Marketplace — Buy & Sell Accounts & In-Game Items | IGMART",
    description: "Browse verified gaming accounts, in-game currency, and rare items across 5 top games. 100% Escrow Protection.",
    url: "https://igmart.store/marketplace",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gaming Marketplace — Buy & Sell Accounts & In-Game Items | IGMART",
    description: "Browse verified gaming accounts, in-game currency, and rare items across 5 top games.",
  },
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
