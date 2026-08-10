import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | IGMART",
  description: "Learn how IGMART collects, uses, and protects your personal data.",
};

const LAST_UPDATED = "August 1, 2026";

export default function PrivacyPage() {
  return (
    <div className="bg-background min-h-[calc(100vh-76px)] py-12 lg:py-20 pb-20">
      <div className="container max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/legal" className="text-text-muted font-semibold hover:text-text transition-colors">Legal</Link>
          <span className="text-border-strong">/</span>
          <span className="text-text font-bold">Privacy Policy</span>
        </div>

        <div>
          <div className="mb-10 pb-10 border-b border-border">
            <h1 className="font-heading font-black text-4xl text-text mb-4">Privacy Policy</h1>
            <p className="text-text-muted text-sm font-semibold">Last updated: {LAST_UPDATED}</p>
          </div>

          <div className="flex flex-col gap-10 text-text-secondary leading-relaxed text-base">

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">1. What Information We Collect</h2>
              <p className="mb-4">We collect information you provide directly to us, such as:</p>
              <ul className="list-disc pl-6 flex flex-col gap-2">
                <li><strong className="text-text font-bold">Account Data:</strong> Name, email address, username, password hash.</li>
                <li><strong className="text-text font-bold">Payment Data:</strong> Billing address, card type (not full card numbers — processed by Stripe).</li>
                <li><strong className="text-text font-bold">Profile Data:</strong> Avatar, bio, transaction history, listings.</li>
                <li><strong className="text-text font-bold">Communications:</strong> Support tickets, messages, dispute records.</li>
                <li><strong className="text-text font-bold">Usage Data:</strong> Pages visited, search queries, features used, time spent.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 flex flex-col gap-2">
                <li>To provide, maintain, and improve the IGMART platform.</li>
                <li>To process transactions and send you related information.</li>
                <li>To send promotional communications (you can opt out at any time).</li>
                <li>To respond to comments and support inquiries.</li>
                <li>To monitor and analyze trends, usage, and activities.</li>
                <li>To detect, investigate, and prevent fraudulent activity.</li>
                <li>To comply with legal obligations.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">3. Information Sharing</h2>
              <p className="mb-4">We do not sell your personal data. We may share your information with:</p>
              <ul className="list-disc pl-6 flex flex-col gap-2">
                <li><strong className="text-text font-bold">Service Providers:</strong> Third parties who help us operate our platform (Stripe, Convex, Clerk, Vercel).</li>
                <li><strong className="text-text font-bold">Legal Requirements:</strong> When required by law, court order, or government authority.</li>
                <li><strong className="text-text font-bold">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">4. Data Retention</h2>
              <p>We retain your personal data for as long as your account is active or as needed to provide you services. You may request deletion of your data at any time by contacting our support team. Note that we may retain some data for legal or fraud prevention purposes.</p>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">5. Your Rights (GDPR / CCPA)</h2>
              <p className="mb-4">Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-6 flex flex-col gap-2">
                <li>Access the personal data we hold about you.</li>
                <li>Correct inaccurate or incomplete data.</li>
                <li>Request deletion of your data.</li>
                <li>Object to or restrict how we process your data.</li>
                <li>Data portability (receive your data in a machine-readable format).</li>
              </ul>
              <p className="mt-4">To exercise these rights, contact <a href="mailto:privacy@igmart.store" className="text-primary hover:underline">privacy@igmart.store</a>.</p>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">6. Cookies</h2>
              <p>We use cookies and similar tracking technologies to track activity on our platform and store certain information. For details, see our <Link href="/legal/cookies" className="text-primary hover:underline">Cookie Policy</Link>.</p>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">7. Security</h2>
              <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure. We cannot guarantee the absolute security of your data.</p>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">8. Children's Privacy</h2>
              <p>IGMART is not directed to children under 16. We do not knowingly collect personal information from children. If we learn we have, we will delete it promptly.</p>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">9. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the effective date.</p>
            </section>

            <section>
              <h2 className="font-heading font-black text-2xl text-text mb-4">10. Contact</h2>
              <p>For privacy-related questions, contact our Data Protection Officer at <a href="mailto:privacy@igmart.store" className="text-primary hover:underline">privacy@igmart.store</a>.</p>
            </section>
          </div>

          <div className="mt-16 pt-10 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link href="/legal/terms" className="text-primary text-sm font-bold hover:underline">← Terms of Service</Link>
            <Link href="/legal/cookies" className="text-primary text-sm font-bold hover:underline">Cookie Policy →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
