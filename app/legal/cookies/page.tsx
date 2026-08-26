import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy | IGMART",
  description: "Learn how IGMART uses cookies and tracking technologies.",
};

const LAST_UPDATED = "August 1, 2026";

const COOKIE_TYPES = [
  {
    name: "Essential Cookies",
    required: true,
    desc: "These cookies are strictly necessary for the platform to function. They include session cookies, authentication tokens, and security cookies. You cannot opt out of these.",
    examples: ["igmart_session", "igmart_auth_token", "__cf_bm"],
  },
  {
    name: "Preference Cookies",
    required: false,
    desc: "These remember your settings and preferences, such as language, region, and display preferences, so you don't have to reconfigure them on each visit.",
    examples: ["igmart_locale", "igmart_theme"],
  },
  {
    name: "Analytics Cookies",
    required: false,
    desc: "We use analytics tools (Vercel Analytics, Google Analytics) to understand how users interact with IGMART so we can improve the experience.",
    examples: ["_ga", "_gid", "va_t"],
  },
  {
    name: "Marketing Cookies",
    required: false,
    desc: "Used to deliver relevant advertisements on third-party platforms and to measure the effectiveness of our marketing campaigns.",
    examples: ["_fbp", "__gtm"],
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="bg-background min-h-[calc(100vh-76px)] py-12 lg:py-20 pb-20">
      <div className="container max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/legal" className="text-text-muted font-semibold hover:text-text transition-colors">Legal</Link>
          <span className="text-border-strong">/</span>
          <span className="text-text font-bold">Cookie Policy</span>
        </div>

        <div>
          <div className="mb-10 pb-10 border-b border-border">
            <h1 className="font-heading font-black text-4xl text-text mb-4">Cookie Policy</h1>
            <p className="text-text-muted text-sm font-semibold">Last updated: {LAST_UPDATED}</p>
          </div>

          <div className="flex flex-col gap-10 text-text-secondary leading-relaxed text-base">

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">What Are Cookies?</h2>
              <p>Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work efficiently, remember your preferences, and provide information to site owners. IGMART uses cookies and similar technologies (e.g., localStorage, session storage) to operate and improve our platform.</p>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-6">Types of Cookies We Use</h2>
              <div className="flex flex-col gap-4">
                {COOKIE_TYPES.map((type) => (
                  <div key={type.name} className="bg-card border border-border rounded-xl p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="font-heading font-bold text-lg text-text">{type.name}</h3>
                      {type.required ? (
                        <span className="shrink-0 text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full">Required</span>
                      ) : (
                        <span className="shrink-0 text-[10px] font-black uppercase tracking-wider bg-elevated text-text-muted border border-border px-2.5 py-1 rounded-full">Optional</span>
                      )}
                    </div>
                    <p className="text-sm mb-4">{type.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {type.examples.map((ex) => (
                        <code key={ex} className="text-xs font-mono bg-background border border-border px-2 py-1 rounded-md text-text-secondary">{ex}</code>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">Managing Your Cookie Preferences</h2>
              <p className="mb-4">You can control and manage cookies in the following ways:</p>
              <ul className="list-disc pl-6 flex flex-col gap-2">
                <li><strong className="text-text font-bold">Cookie Banner:</strong> When you first visit IGMART, you can accept or decline optional cookies using our consent banner.</li>
                <li><strong className="text-text font-bold">Browser Settings:</strong> Most browsers allow you to block or delete cookies through your browser settings. Note this may affect site functionality.</li>
                <li><strong className="text-text font-bold">Third-Party Opt-Outs:</strong> You can opt out of Google Analytics at <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">tools.google.com/dlpage/gaoptout</a>.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">Third-Party Services</h2>
              <p>IGMART integrates with third-party services that may set their own cookies. These include Stripe (payment processing), Clerk (authentication), Vercel (hosting and analytics), and social login providers. We recommend reviewing their respective cookie policies.</p>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">Contact</h2>
              <p>For questions about our cookie use, contact us at <a href="mailto:privacy@igmart.store" className="text-primary hover:underline">privacy@igmart.store</a>.</p>
            </section>
          </div>

          <div className="mt-16 pt-10 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link href="/legal/privacy" className="text-primary text-sm font-bold hover:underline">← Privacy Policy</Link>
            <Link href="/legal" className="text-primary text-sm font-bold hover:underline">← All Legal Docs</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
