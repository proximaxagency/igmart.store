import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/games",
          "/games/",
          "/marketplace",
          "/marketplace/",
          "/listing/",
          "/seller/",
          "/guides",
          "/guides/",
          "/faq",
          "/how-it-works",
          "/sell",
          "/search",
          "/support",
          "/legal/",
        ],
        disallow: [
          "/admin/",
          "/account/",
          "/checkout",
          "/messages",
          "/seller/dashboard",
          "/seller/verification",
          "/seller/inventory",
          "/seller/earnings",
          "/seller/analytics",
          "/seller/listings",
          "/seller/orders",
          "/api/",
          "/_next/",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
    ],
    sitemap: "https://igmart.store/sitemap.xml",
    host: "https://igmart.store",
  };
}
