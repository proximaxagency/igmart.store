import type { Metadata } from "next";
import Link from "next/link";
import { FAQ_ITEMS } from "@/lib/data/igmartData";
import { SectionHeading } from "@/components/ui/index";
import HomepageClient from "@/components/home/HomepageClient";
import { JsonLd, getFAQSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | IGMART",
  description: "Find answers to the most common questions about buying and selling on IGMART. Learn about escrow protection, seller verification, delivery times, and dispute resolution.",
  alternates: { canonical: "https://igmart.store/faq" },
  openGraph: {
    title: "FAQ — Frequently Asked Questions | IGMART",
    description: "Get answers about buying, selling, escrow, and seller verification on IGMART.",
    url: "https://igmart.store/faq",
  },
};

export default function FAQPage() {
  const faqSchema = getFAQSchema(FAQ_ITEMS.map((item) => ({ question: item.q, answer: item.a })));

  return (
    <div className="bg-background min-h-[calc(100vh-76px)] py-12 lg:py-20">
      <JsonLd data={faqSchema} />
      <div className="container max-w-3xl">
        <SectionHeading 
          eyebrow="Help Center" 
          title="Frequently Asked Questions" 
          subtitle="Everything you need to know about trading securely on IGMART."
          center
        />
        
        <div className="mt-12">
          <HomepageClient action="faq" faqItems={FAQ_ITEMS} />
        </div>

        <div className="mt-16 text-center bg-card border border-border p-8 rounded-2xl">
          <h3 className="font-heading font-black text-xl text-text mb-3">Still have questions?</h3>
          <p className="text-text-muted text-sm mb-6 max-w-md mx-auto">
            Our support team is available 24/7 to help you with any issues or questions you might have.
          </p>
          <Link href="/support" className="inline-flex items-center justify-center bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
