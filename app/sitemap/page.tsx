import Link from "next/link";
import { SectionHeading } from "@/components/ui/index";

export default function SitemapPage() {
  const sections = [
    {
      title: "Marketplace",
      links: [
        { label: "All Games", href: "/games" },
        { label: "Accounts", href: "/marketplace/accounts" },
        { label: "Items", href: "/marketplace/items" },
        { label: "Currency", href: "/marketplace/currency" },
        { label: "Boosting", href: "/marketplace/boosting" },
        { label: "Services", href: "/marketplace/services" },
      ],
    },
    {
      title: "Support & Help",
      links: [
        { label: "Help Center", href: "/support" },
        { label: "FAQ", href: "/faq" },
        { label: "Guides", href: "/guides" },
      ],
    },
    {
      title: "Account & Seller",
      links: [
        { label: "My Orders", href: "/account/orders" },
        { label: "Wallet", href: "/account/wallet" },
        { label: "Start Selling", href: "/sell" },
        { label: "Seller Dashboard", href: "/seller/dashboard" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", href: "/legal/terms" },
        { label: "Privacy Policy", href: "/legal/privacy" },
        { label: "Cookies Policy", href: "/legal/cookies" },
      ],
    },
  ];

  return (
    <div className="container py-16 min-h-screen">
      <SectionHeading 
        title="Sitemap" 
        subtitle="Find your way around IGMART"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-12">
        {sections.map((section) => (
          <div key={section.title} className="bg-card border border-border p-6 rounded-2xl">
            <h3 className="font-heading font-bold text-lg mb-4 text-text">{section.title}</h3>
            <ul className="flex flex-col gap-3">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-text-secondary hover:text-primary transition-colors text-sm font-semibold">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
