import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GUIDES } from "@/lib/data/igmartData";
import { ArrowLeft, Clock, Share2 } from "lucide-react";
import { JsonLd, getArticleSchema } from "@/components/seo/JsonLd";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const guide = GUIDES.find((g) => g.slug === resolvedParams.slug);
  if (!guide) return { title: "Guide Not Found" };
  return {
    title: `${guide.title} | IGMART Guides`,
    description: guide.excerpt,
    alternates: { canonical: `https://igmart.store/guides/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.excerpt,
      url: `https://igmart.store/guides/${guide.slug}`,
      type: "article",
      images: [{ url: guide.image, width: 1200, height: 630, alt: guide.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.excerpt,
      images: [guide.image],
    },
  };
}

export default async function GuideDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const guide = GUIDES.find((g) => g.slug === resolvedParams.slug);
  if (!guide) notFound();

  const articleSchema = getArticleSchema({
    title: guide.title,
    description: guide.excerpt,
    slug: guide.slug,
    publishedDate: new Date(guide.date).toISOString(),
    authorName: guide.author,
    imageUrl: guide.image,
  });

  return (
    <article className="pb-24">
      <JsonLd data={articleSchema} />
      {/* Hero */}
      <div style={{ position: "relative", height: 400, display: "flex", alignItems: "flex-end", paddingBottom: 48 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={guide.image} alt={guide.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", zIndex: 0 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0F1116 0%, rgba(15,17,22,0.8) 50%, transparent 100%)", zIndex: 1 }} />
        
        <div className="container relative z-10 max-w-4xl">
          <Link href="/guides" className="inline-flex items-center gap-2 text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors mb-6 text-sm font-medium">
            <ArrowLeft size={16} /> Back to Guides
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <span style={{ background: "#3381FF", color: "white", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
              {guide.category}
            </span>
            <span className="flex items-center gap-1 text-[#A1A1AA] text-sm"><Clock size={14} /> {guide.readTime}</span>
          </div>
          
          <h1 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 48, color: "#FAFAFA", lineHeight: 1.1, marginBottom: 16 }}>
            {guide.title}
          </h1>
          <p style={{ fontSize: 18, color: "#A1A1AA", lineHeight: 1.6, maxWidth: "800px" }}>
            {guide.excerpt}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mt-8">
        <div className="flex items-center justify-between py-4 border-y border-[#272A30] mb-8">
          <div className="flex items-center gap-3">
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#2563EB,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white" }}>
              IG
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#FAFAFA" }}>{guide.author}</p>
              <p style={{ fontSize: 12, color: "#71717A" }}>{guide.date}</p>
            </div>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 8, color: "#A1A1AA", fontSize: 14, fontWeight: 600 }}>
            <Share2 size={18} /> Share
          </button>
        </div>

        <div className="prose prose-invert prose-lg max-w-none" style={{ color: "#E4E4E7", lineHeight: 1.8 }}>
          <p>
            Welcome to the ultimate guide for {guide.title}. Whether you're a beginner looking to get started or a veteran aiming to optimize your strategy, this guide covers everything you need to know about the current meta and marketplace dynamics on IGMART.
          </p>
          <h2 style={{ fontFamily: "'Poppins',sans-serif", color: "#FAFAFA", marginTop: 40, marginBottom: 20 }}>Understanding the Basics</h2>
          <p>
            The foundation of success starts with understanding the core mechanics. Our verified sellers provide top-tier resources, but knowing how to utilize them efficiently is what separates good players from great ones.
          </p>
          <div style={{ background: "#171A21", borderLeft: "4px solid #3381FF", padding: 24, borderRadius: "0 12px 12px 0", marginBlock: 32 }}>
            <p style={{ margin: 0, fontSize: 16, fontStyle: "italic", color: "#A1A1AA" }}>
              "Pro Tip: Always verify the seller's rating and recent reviews before making a high-value purchase. IGMART's Trade Protection system guarantees your safety, but buying from top-rated sellers ensures instant delivery and premium service."
            </p>
          </div>
          <h2 style={{ fontFamily: "'Poppins',sans-serif", color: "#FAFAFA", marginTop: 40, marginBottom: 20 }}>Advanced Strategies</h2>
          <p>
            Once you have the basics down, it's time to explore advanced techniques. Many players find that investing in a high-level account or specific items early on can drastically reduce grinding time and improve the overall experience.
          </p>
          <ul>
            <li>Focus on core objectives first.</li>
            <li>Utilize IGMART boosting services if you're stuck at a specific rank.</li>
            <li>Join the community forums to stay updated on the latest patches.</li>
          </ul>
          <p>
            Remember, the IGMART marketplace is always evolving. Check back regularly for new listings and updated guides. Happy gaming!
          </p>
        </div>
      </div>
    </article>
  );
}
