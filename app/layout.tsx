import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f1116",
};

export const metadata: Metadata = {
  title: { default: "IGMART — Premier Gaming Marketplace", template: "%s | IGMART" },
  description: "Buy, sell and trade verified gaming accounts and assets across 5 top games: Clash of Clans, Pokémon GO, Free Fire, Roblox, and Clash Royale. 100% Escrow Protection.",
  keywords: "clash of clans accounts, pokemon go accounts, free fire accounts, roblox accounts, clash royale accounts, buy game accounts, sell gaming assets, IGMART escrow",
  metadataBase: new URL("https://igmart.store"),
  alternates: { canonical: "https://igmart.store" },
  openGraph: {
    title: "IGMART — Premier Gaming Marketplace",
    description: "The dedicated marketplace for verified gaming accounts across 5 top games. 100% Escrow Protection.",
    url: "https://igmart.store",
    siteName: "IGMART",
    type: "website",
    locale: "en_US",
    images: [{ url: "https://igmart.store/og-image.jpg", width: 1200, height: 630, alt: "IGMART — Gaming Marketplace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IGMART — Premier Gaming Marketplace",
    description: "Buy, sell and trade verified gaming accounts across 5 top games.",
    creator: "@igmartstore",
    images: ["https://igmart.store/og-image.jpg"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
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
    <html lang="en" className={`${manrope.variable} ${redHatDisplay.variable} overflow-x-hidden`} data-scroll-behavior="smooth">
      <head>
        <JsonLd data={getOrganizationSchema()} />
        <JsonLd data={getWebSiteSchema()} />
      </head>
      <body className="overflow-x-hidden min-h-screen relative flex flex-col w-full max-w-[100vw]">
        <ConvexClientProvider>
          <CurrencyProvider>
            <UserSync />
            <Header />
            <main id="main-content" className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
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
