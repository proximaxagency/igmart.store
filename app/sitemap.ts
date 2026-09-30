import { MetadataRoute } from "next";
import { GAMES, CATEGORIES, GUIDES, LISTINGS } from "@/lib/data/igmartData";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://igmart.store";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/games`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/marketplace`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/sell`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/search`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${baseUrl}/support`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/legal/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const gameRoutes: MetadataRoute.Sitemap = GAMES.map((game) => ({
    url: `${baseUrl}/games/${game.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.85,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/marketplace/${cat.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const guideRoutes: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const listingRoutes: MetadataRoute.Sitemap = LISTINGS.map((listing) => ({
    url: `${baseUrl}/listing/${listing.id}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.75,
  }));

  return [
    ...staticRoutes,
    ...gameRoutes,
    ...categoryRoutes,
    ...guideRoutes,
    ...listingRoutes,
  ];
}
