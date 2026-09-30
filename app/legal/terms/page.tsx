import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | IGMART",
  description: "Read IGMART's Terms of Service to understand the rules governing your use of our platform.",
};

const LAST_UPDATED = "August 1, 2026";

export default function TermsPage() {
  return (
    <div className="bg-background min-h-[calc(100vh-76px)] py-12 lg:py-20 pb-20">
      <div className="container max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/legal" className="text-text-muted font-semibold hover:text-text transition-colors">Legal</Link>
          <span className="text-border-strong">/</span>
          <span className="text-text font-bold">Terms of Service</span>
        </div>

        <div className="prose-igmart">
          <div className="mb-10 pb-10 border-b border-border">
            <h1 className="font-heading font-black text-4xl text-text mb-4">Terms of Service</h1>
            <p className="text-text-muted text-sm font-semibold">Last updated: {LAST_UPDATED}</p>
          </div>

          <div className="flex flex-col gap-10 text-text-secondary leading-relaxed text-base">
            
            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">1. Acceptance of Terms</h2>
              <p>By accessing or using the IGMART platform ("Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site. These terms apply to all users of the Service, including browsers, vendors, customers, merchants, and contributors of content.</p>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">2. Description of Service</h2>
              <p>IGMART is a peer-to-peer marketplace that facilitates the buying and selling of digital gaming assets, including but not limited to virtual currency, in-game items, game accounts, and boosting services. IGMART acts as an intermediary and escrow agent between buyers and sellers. We do not sell any products directly.</p>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">3. User Accounts</h2>
              <p className="mb-4">To use the Service, you must register for an account. You agree to:</p>
              <ul className="list-disc pl-6 flex flex-col gap-2">
                <li>Provide accurate, current, and complete information during registration.</li>
                <li>Maintain the security of your password and accept all risks of unauthorized access.</li>
                <li>Promptly notify IGMART if you discover or suspect a security breach related to your account.</li>
                <li>Be responsible for all activities that occur under your account.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">4. Buyer & Seller Rules</h2>
              <p className="mb-4">Sellers on IGMART agree to accurately describe their listings, deliver items in a timely manner, and not engage in fraudulent behavior. Buyers agree to pay promptly and confirm receipt of items within the platform's review window.</p>
              <p>IGMART reserves the right to remove listings, suspend accounts, or withhold funds if rules are violated. All decisions by IGMART's moderation team are final.</p>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">5. Prohibited Conduct</h2>
              <p className="mb-4">You may not use IGMART to:</p>
              <ul className="list-disc pl-6 flex flex-col gap-2">
                <li>Sell hacked, stolen, or compromised accounts.</li>
                <li>Engage in money laundering or any illegal financial activity.</li>
                <li>Circumvent escrow or payment systems to conduct off-platform transactions.</li>
                <li>Harass, threaten, or discriminate against other users.</li>
                <li>Post false or misleading information in listings or reviews.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">6. Fees & Payments</h2>
              <p>IGMART charges a transaction fee on all completed sales. The current fee schedule is available in the Seller Dashboard. Fees are subject to change with 30 days' notice. Payment is processed via Stripe and other approved payment providers. IGMART is not responsible for fees charged by your bank or payment provider.</p>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">7. Disputes & Refunds</h2>
              <p>All disputes must be filed through IGMART's dispute resolution system within 72 hours of expected delivery. IGMART's decision in all disputes is final and binding. Refunds are issued at IGMART's discretion and may take 3-10 business days to process.</p>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">8. Intellectual Property</h2>
              <p>The IGMART platform, including its design, code, and content, is the exclusive property of IGMART Ltd. and is protected by intellectual property laws. You may not copy, distribute, or create derivative works without explicit written permission.</p>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">9. Limitation of Liability</h2>
              <p>IGMART shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of the Service. In no event shall IGMART's total liability exceed the amount you paid to IGMART in the twelve months preceding the claim.</p>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">10. Changes to Terms</h2>
              <p>IGMART reserves the right to modify these Terms at any time. We will provide notice of significant changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.</p>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">11. Contact</h2>
              <p>For questions about these Terms, please contact us at <a href="mailto:legal@igmart.store" className="text-primary hover:underline">legal@igmart.store</a>.</p>
            </section>
          </div>

          <div className="mt-16 pt-10 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link href="/legal" className="text-primary text-sm font-bold hover:underline">← Back to Legal</Link>
            <Link href="/legal/privacy" className="text-primary text-sm font-bold hover:underline">Privacy Policy →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
