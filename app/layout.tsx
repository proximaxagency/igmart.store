import type { Metadata } from "next";
import { Manrope, Red_Hat_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/layout/CookieBanner";
import BackToTop from "@/components/layout/BackToTop";
import { FloatingChatWidget } from "@/components/chat";
import { JsonLd, getOrganizationSchema, getWebSiteSchema } from "@/components/seo/JsonLd";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-redhat",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "IGMART — The #1 Gaming Marketplace", template: "%s | IGMART" },
  description: "Buy, sell and trade gaming accounts, items, currency, boosting and services across 300+ games. Secure transactions, verified sellers, 24/7 support.",
  keywords: "gaming marketplace, buy game accounts, sell game items, boosting services, game currency, IGMART, game account trading, buy sell gaming assets",
  metadataBase: new URL("https://igmart.store"),
  alternates: { canonical: "https://igmart.store" },
  openGraph: {
    title: "IGMART — The #1 Gaming Marketplace",
    description: "The premier destination for buying and selling gaming assets across 300+ games.",
    url: "https://igmart.store",
    siteName: "IGMART",
    type: "website",
    locale: "en_US",
    images: [{ url: "https://igmart.store/og-image.jpg", width: 1200, height: 630, alt: "IGMART — Gaming Marketplace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IGMART — The #1 Gaming Marketplace",
    description: "Buy, sell and trade gaming assets across 300+ games.",
    creator: "@igmartstore",
    images: ["https://igmart.store/og-image.jpg"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  manifest: "/manifest.webmanifest",
  verification: { google: "REPLACE_WITH_GOOGLE_SEARCH_CONSOLE_TOKEN" },
};

import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${redHatDisplay.variable}`}>
      <head>
        <JsonLd data={getOrganizationSchema()} />
        <JsonLd data={getWebSiteSchema()} />
      </head>
      <body>
        <ConvexClientProvider>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
          <CookieBanner />
          <BackToTop />
          <FloatingChatWidget />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
