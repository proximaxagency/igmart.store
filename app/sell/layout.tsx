import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start Selling Gaming Assets & Accounts | IGMART Merchant Gateway",
  description: "Become a verified seller on IGMART. Turn your gaming assets into cash with a flat 5% fee, automatic credential delivery, and guaranteed escrow payouts.",
  keywords: "sell game accounts, become game seller, sell coc account, sell pokemon go account, gaming merchant, instant payout escrow",
  alternates: {
    canonical: "https://igmart.store/sell",
  },
  openGraph: {
    title: "Start Selling Gaming Assets & Accounts | IGMART Merchant Gateway",
    description: "Sell gaming accounts, currency, and boosting to 3M+ verified gamers. Enjoy 100% escrow protection and instant withdrawals.",
    url: "https://igmart.store/sell",
  },
};

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
