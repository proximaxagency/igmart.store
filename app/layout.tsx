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
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";
import { UserSync } from "@/components/providers/UserSync";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${redHatDisplay.variable}`} data-scroll-behavior="smooth">
      <head>
        <JsonLd data={getOrganizationSchema()} />
        <JsonLd data={getWebSiteSchema()} />
      </head>
      <body>
        <ConvexClientProvider>
          <CurrencyProvider>
            <UserSync />
            <Header />
            <main id="main-content">{children}</main>
            <Footer />
            <CookieBanner />
            <BackToTop />
            <FloatingChatWidget />
          </CurrencyProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
