import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/index";

export const metadata: Metadata = {
  title: "Legal | IGMART",
  description: "IGMART legal documents including Terms of Service, Privacy Policy, and Cookie Policy.",
};

const SECTIONS = [
  {
    id: "terms",
    icon: "📜",
    title: "Terms of Service",
    href: "/legal/terms",
    updated: "Aug 1, 2026",
    desc: "The full legal agreement governing your use of the IGMART platform, marketplace, and services.",
  },
  {
    id: "privacy",
    icon: "🔐",
    title: "Privacy Policy",
    href: "/legal/privacy",
    updated: "Aug 1, 2026",
    desc: "How we collect, use, store and protect your personal data as part of the IGMART service.",
  },
  {
    id: "cookies",
    icon: "🍪",
    title: "Cookie Policy",
    href: "/legal/cookies",
    updated: "Aug 1, 2026",
    desc: "Information about the cookies and tracking technologies we use to improve your experience.",
  },
  {
    id: "aml",
    icon: "⚖️",
    title: "AML & KYC Policy",
    href: "/legal/aml",
    updated: "Aug 1, 2026",
    desc: "Our Anti-Money Laundering and Know Your Customer policies for seller verification.",
  },
];

export default function LegalPage() {
  return (
    <div className="bg-background min-h-[calc(100vh-76px)] pb-20">
      {/* Hero */}
      <section className="bg-surface border-b border-border py-16 lg:py-20">
        <div className="container max-w-3xl text-center">
          <h1 className="font-heading font-black text-4xl sm:text-5xl text-text mb-4">Legal Documents</h1>
          <p className="text-text-muted text-base sm:text-lg leading-relaxed">
            We believe in full transparency. Read our policies to understand how IGMART operates and how we protect you.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="container py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto">
          {SECTIONS.map((s) => (
            <Link
              key={s.id}
              href={s.href}
              className="group flex flex-col bg-card border border-border rounded-2xl p-6 sm:p-8 hover:border-primary-hover/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 transition-all duration-200"
            >
              <span className="text-4xl mb-5">{s.icon}</span>
              <h2 className="font-heading font-black text-xl text-text mb-2 group-hover:text-primary transition-colors">{s.title}</h2>
              <p className="text-text-muted text-sm leading-relaxed flex-grow mb-4">{s.desc}</p>
              <p className="text-xs font-bold text-text-muted mt-auto pt-4 border-t border-border/50">Last updated: {s.updated}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Contact Legal */}
      <section className="container pb-8">
        <div className="max-w-4xl mx-auto bg-elevated border border-border rounded-2xl p-8 sm:p-10 text-center">
          <h3 className="font-heading font-black text-2xl text-text mb-3">Legal Inquiries</h3>
          <p className="text-text-muted text-sm leading-relaxed max-w-xl mx-auto mb-6">
            For legal correspondence, copyright notices, or compliance requests, please contact our legal department directly.
          </p>
          <a href="mailto:legal@igmart.store" className="inline-flex items-center gap-2 min-h-[48px] px-6 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors text-sm">
            legal@igmart.store
          </a>
        </div>
      </section>
    </div>
  );
}
