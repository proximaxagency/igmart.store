import React from "react";

export interface JsonLdProps {
  data: Record<string, any> | Array<Record<string, any>>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ── PRESET GENERATORS ───────────────────────────────────────────────

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "IGMART",
    url: "https://igmart.store",
    logo: "https://igmart.store/logo.png",
    description: "The Premier Global Marketplace for Digital Gaming Accounts, Items, Boosting, and Virtual Assets.",
    sameAs: [
      "https://twitter.com/igmartstore",
      "https://discord.gg/igmart",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-800-555-0199",
      contactType: "Customer Support",
      availableLanguage: ["English", "Spanish", "German", "Hindi"],
    },
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "IGMART",
    url: "https://igmart.store",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://igmart.store/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function getProductSchema(listing: {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  rating?: number;
  reviews?: number;
  seller?: string;
  game?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    image: listing.image,
    sku: listing.id,
    brand: {
      "@type": "Brand",
      name: listing.game || "Gaming Asset",
    },
    offers: {
      "@type": "Offer",
      url: `https://igmart.store/listing/${listing.id}`,
      priceCurrency: "USD",
      price: listing.price.toFixed(2),
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Person",
        name: listing.seller || "Verified Seller",
      },
    },
    ...(listing.rating && listing.reviews
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: listing.rating.toString(),
            reviewCount: listing.reviews.toString(),
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  };
}

export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `https://igmart.store${item.url}`,
    })),
  };
}

export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function getArticleSchema(article: {
  title: string;
  description: string;
  slug: string;
  publishedDate?: string;
  authorName?: string;
  imageUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: `https://igmart.store/guides/${article.slug}`,
    image: article.imageUrl || "https://igmart.store/og-image.jpg",
    datePublished: article.publishedDate || "2026-01-01T00:00:00Z",
    author: {
      "@type": "Person",
      name: article.authorName || "IGMART Editorial Staff",
    },
    publisher: {
      "@type": "Organization",
      name: "IGMART",
      logo: {
        "@type": "ImageObject",
        url: "https://igmart.store/logo.png",
      },
    },
  };
}
