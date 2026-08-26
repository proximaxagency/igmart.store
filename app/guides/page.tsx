import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/data/igmartData";
import { SectionHeading } from "@/components/ui/index";
import { ArrowRight, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Gaming Guides & News | IGMART",
  description: "Read the latest guides, tips, and news for your favorite games.",
};

export default function GuidesPage() {
  const featuredGuide = GUIDES[0];
  const otherGuides = GUIDES.slice(1);

  return (
    <div className="container py-12">
      <SectionHeading eyebrow="Content Hub" title="Guides & News" subtitle="Level up your gaming experience with our expert guides and market insights." />

      {/* Featured Guide */}
      {featuredGuide && (
        <Link href={`/guides/${featuredGuide.slug}`} className="group block mb-12">
          <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", minHeight: 400, display: "flex", alignItems: "flex-end" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={featuredGuide.image} alt={featuredGuide.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", transition: "transform 700ms" }} className="group-hover:scale-105" />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,17,22,1) 0%, rgba(15,17,22,0.4) 50%, transparent 100%)" }} />
            
            <div style={{ position: "relative", zIndex: 10, padding: 40, width: "100%", maxWidth: 800 }}>
              <div className="flex items-center gap-3 mb-4">
                <span style={{ background: "#3381FF", color: "white", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>{featuredGuide.category}</span>
                <span className="flex items-center gap-1 text-[#A1A1AA] text-sm"><Clock size={14} /> {featuredGuide.readTime}</span>
              </div>
              <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 40, color: "#FAFAFA", lineHeight: 1.2, marginBottom: 16 }} className="group-hover:text-[#3381FF] transition-colors">
                {featuredGuide.title}
              </h2>
              <p style={{ fontSize: 16, color: "#A1A1AA", lineHeight: 1.6, marginBottom: 24 }}>
                {featuredGuide.excerpt}
              </p>
              <div className="flex items-center gap-2 text-[#FAFAFA] font-semibold text-sm">
                Read Full Guide <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {otherGuides.map(guide => (
          <Link key={guide.id} href={`/guides/${guide.slug}`} className="group block" style={{ background: "#171A21", border: "1px solid #272A30", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ aspectRatio: "16/9", position: "relative", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={guide.image} alt={guide.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", transition: "transform 500ms" }} className="group-hover:scale-110" />
              <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, color: "#FAFAFA", textTransform: "uppercase" }}>
                {guide.category}
              </div>
            </div>
            <div style={{ padding: 24 }}>
              <h3 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 18, color: "#FAFAFA", lineHeight: 1.4, marginBottom: 12 }} className="group-hover:text-[#3381FF] transition-colors line-clamp-2">
                {guide.title}
              </h3>
              <p style={{ fontSize: 14, color: "#A1A1AA", lineHeight: 1.6, marginBottom: 16 }} className="line-clamp-3">
                {guide.excerpt}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="flex items-center gap-1 text-[#71717A] text-xs"><Clock size={12} /> {guide.readTime}</span>
                <span style={{ color: "#3381FF", fontSize: 13, fontWeight: 600 }}>Read More →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
