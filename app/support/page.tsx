import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/index";
import { MessageSquare, Mail, Phone, FileText, Clock, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Support Center | IGMART",
  description: "Get help with buying, selling, disputes and account issues on IGMART.",
};

const SUPPORT_CATEGORIES = [
  {
    icon: MessageSquare,
    title: "Live Chat",
    desc: "Get instant help from our support team.",
    action: "Start Chat",
    href: "/messages",
    badge: "24/7",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
  },
  {
    icon: Mail,
    title: "Email Support",
    desc: "Send us an email and we'll respond within a few hours.",
    action: "Send Email",
    href: "mailto:support@igmart.store",
    badge: "< 4h",
    color: "text-[#06B6D4]",
    bg: "bg-[#06B6D4]/10 border-[#06B6D4]/20",
  },
  {
    icon: FileText,
    title: "Submit a Ticket",
    desc: "For complex issues, raise a formal support ticket.",
    action: "Open Ticket",
    href: "/support/ticket",
    badge: "< 24h",
    color: "text-success",
    bg: "bg-success/10 border-success/20",
  },
];

const TOPICS = [
  {
    icon: "🔒",
    title: "Account & Security",
    links: ["Reset my password", "Two-factor authentication", "Account suspended / banned", "Change email address"],
  },
  {
    icon: "💳",
    title: "Payments & Billing",
    links: ["Add a payment method", "Refund policy", "Failed payment", "Invoice / receipt"],
  },
  {
    icon: "📦",
    title: "Orders & Delivery",
    links: ["Track my order", "Order not received", "Wrong item delivered", "Cancel an order"],
  },
  {
    icon: "⚖️",
    title: "Disputes & Refunds",
    links: ["Open a dispute", "Dispute resolution process", "Escalate to admin", "Refund timeline"],
  },
  {
    icon: "🏪",
    title: "Selling on IGMART",
    links: ["Create a listing", "Seller verification", "Withdraw earnings", "Seller fee structure"],
  },
  {
    icon: "📝",
    title: "Platform Rules",
    links: ["Prohibited items", "Seller code of conduct", "Buyer protection", "Terms of Service"],
  },
];

export default function SupportPage() {
  return (
    <div className="bg-background min-h-[calc(100vh-76px)] pb-20">
      {/* Hero */}
      <section className="bg-surface border-b border-border py-16 lg:py-20">
        <div className="container text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-4 py-1.5 rounded-full text-xs font-bold tracking-wide mb-6">
            <Clock size={14} /> 24/7 Available
          </div>
          <h1 className="font-heading font-black text-4xl sm:text-5xl text-text mb-4">
            How Can We <span className="bg-gradient-to-r from-primary to-[#06B6D4] text-transparent bg-clip-text">Help You?</span>
          </h1>
          <p className="text-text-muted text-base sm:text-lg leading-relaxed mb-8">
            Our dedicated support team is here around the clock to resolve any issues on your IGMART journey.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <input
              type="search"
              placeholder="Search for help articles..."
              className="w-full bg-card border border-border rounded-2xl px-6 py-4 text-text text-base placeholder:text-text-muted focus:outline-none focus:border-primary-hover focus:ring-2 focus:ring-primary/20 transition-all pr-14 min-h-[56px]"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-white p-2.5 rounded-xl hover:bg-primary-hover transition-colors" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="container py-16">
        <SectionHeading eyebrow="Contact Us" title="Choose How to Reach Us" center />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mt-10">
          {SUPPORT_CATEGORIES.map((cat) => (
            <div key={cat.title} className={`bg-card border rounded-2xl p-6 sm:p-8 flex flex-col ${cat.bg}`}>
              <div className={`w-14 h-14 rounded-xl border flex items-center justify-center mb-5 ${cat.bg}`}>
                <cat.icon size={28} className={cat.color} />
              </div>
              <span className={`self-start text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full mb-3 ${cat.bg} ${cat.color} border`}>
                {cat.badge}
              </span>
              <h3 className="font-heading font-black text-xl text-text mb-2">{cat.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed flex-grow mb-6">{cat.desc}</p>
              <Link href={cat.href} className={`inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl font-bold text-sm transition-colors bg-primary text-white hover:bg-primary-hover`}>
                {cat.action}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Topics Grid */}
      <section className="container pb-16">
        <div className="border-t border-border pt-16">
          <SectionHeading eyebrow="Browse Topics" title="Popular Help Topics" center />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-10">
            {TOPICS.map((topic) => (
              <div key={topic.title} className="bg-card border border-border rounded-2xl p-6 hover:border-primary-hover/40 transition-colors">
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-3xl">{topic.icon}</span>
                  <h3 className="font-heading font-bold text-lg text-text">{topic.title}</h3>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {topic.links.map((link) => (
                    <li key={link}>
                      <Link href="/faq" className="text-text-secondary hover:text-primary text-sm font-semibold flex items-center gap-2 transition-colors">
                        <svg className="w-4 h-4 text-border-strong shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="container pb-8">
        <div className="bg-gradient-to-r from-[#1a2040] via-card to-[#1a2a4a] border border-border rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 text-center sm:text-left">
          <div className="w-20 h-20 shrink-0 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
            <Shield size={40} className="text-primary" />
          </div>
          <div className="flex-grow">
            <h3 className="font-heading font-black text-2xl text-text mb-2">IGMART Trade Protection</h3>
            <p className="text-text-muted text-sm leading-relaxed max-w-xl">
              Every purchase is backed by our escrow system and dispute resolution service. If something goes wrong, we're on your side.
            </p>
          </div>
          <Link href="/how-it-works" className="shrink-0 inline-flex items-center gap-2 min-h-[48px] px-6 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors text-sm whitespace-nowrap">
            Learn More
          </Link>
        </div>
      </section>
    </div>
  );
}
