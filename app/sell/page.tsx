import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, ShieldCheck, TrendingUp, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Sell on IGMART | Start earning today",
};

export default function SellOnboardingPage() {
  return (
    <div>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0F1116 0%, #171A21 100%)", padding: "80px 0", borderBottom: "1px solid #272A30" }}>
        <div className="container text-center max-w-3xl">
          <Badge variant="hot">BECOME A SELLER</Badge>
          <h1 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 48, color: "#FAFAFA", marginTop: 24, marginBottom: 20, lineHeight: 1.1 }}>
            Turn Your Gaming Skills Into <span style={{ color: "#3381FF" }}>Real Cash</span>
          </h1>
          <p style={{ fontSize: 18, color: "#A1A1AA", marginBottom: 32, lineHeight: 1.6 }}>
            Join thousands of gamers earning a living by selling accounts, items, and boosting services to our massive community of over 3 million users.
          </p>
          <Link href="/seller/dashboard" className="inline-flex py-4 px-8 rounded-lg font-bold text-lg text-white transition-opacity duration-200 hover:opacity-90" style={{
            background: "linear-gradient(135deg, #2563EB, #06B6D4)"
          }}>
            Start Selling Now
          </Link>
          <p style={{ fontSize: 13, color: "#71717A", marginTop: 16 }}>Free to join. Setup takes less than 2 minutes.</p>
        </div>
      </div>

      {/* Benefits */}
      <div className="container py-24">
        <div className="text-center mb-16">
          <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 32, color: "#FAFAFA" }}>Why Sell on IGMART?</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: TrendingUp, title: "Massive Audience", desc: "Access 3M+ active buyers looking for exactly what you're selling." },
            { icon: ShieldCheck, title: "100% Secure", desc: "Our advanced escrow system guarantees you get paid for every successful delivery." },
            { icon: DollarSign, title: "Lowest Fees", desc: "Keep more of your earnings with our industry-low 5% flat seller fee." },
            { icon: Zap, title: "Instant Payouts", desc: "Withdraw your earnings instantly to Crypto, PayPal, or Bank Transfer." },
          ].map((benefit, i) => (
            <div key={i} style={{ background: "#171A21", border: "1px solid #272A30", borderRadius: 16, padding: 32, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(51,129,255,0.1)", color: "#3381FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <benefit.icon size={32} />
              </div>
              <h3 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 20, color: "#FAFAFA", marginBottom: 12 }}>{benefit.title}</h3>
              <p style={{ color: "#A1A1AA", fontSize: 14, lineHeight: 1.6 }}>{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: "#171A21", borderTop: "1px solid #272A30", borderBottom: "1px solid #272A30", padding: "80px 0" }}>
        <div className="container">
          <div className="text-center mb-16">
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 32, color: "#FAFAFA" }}>How It Works</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center relative">
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#3381FF", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, margin: "0 auto 20px" }}>1</div>
              <h3 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 18, color: "#FAFAFA", marginBottom: 12 }}>Create a Listing</h3>
              <p style={{ color: "#A1A1AA", fontSize: 14, lineHeight: 1.6 }}>List your account, item, or service. Add details, images, and set your price.</p>
            </div>
            <div className="text-center relative">
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#3381FF", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, margin: "0 auto 20px" }}>2</div>
              <h3 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 18, color: "#FAFAFA", marginBottom: 12 }}>Deliver to Buyer</h3>
              <p style={{ color: "#A1A1AA", fontSize: 14, lineHeight: 1.6 }}>When a buyer purchases, their funds are held securely. Deliver the item as promised.</p>
            </div>
            <div className="text-center relative">
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#3381FF", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, margin: "0 auto 20px" }}>3</div>
              <h3 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 18, color: "#FAFAFA", marginBottom: 12 }}>Get Paid</h3>
              <p style={{ color: "#A1A1AA", fontSize: 14, lineHeight: 1.6 }}>Once the buyer confirms delivery, the funds are instantly released to your wallet.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Badge import */}
    </div>
  );
}

import { Badge } from "@/components/ui/index";
