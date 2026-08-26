"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("igmart_cookies_accepted")) setVisible(true);
    } catch { setVisible(false); }
  }, []);

  const accept = () => {
    try { localStorage.setItem("igmart_cookies_accepted", "1"); } catch {}
    setVisible(false);
  };

  const decline = () => {
    try { localStorage.setItem("igmart_cookies_accepted", "0"); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 2000,
        background: "#12151C", borderTop: "1px solid #272A30",
        padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
        boxShadow: "0 -4px 24px rgba(0,0,0,0.6)",
      }}
    >
      <p style={{ color: "#A1A1AA", fontSize: 13, lineHeight: 1.5, maxWidth: 640, flex: 1 }}>
        IGMART uses cookies to improve your experience and personalise content.{" "}
        <Link href="/cookies" style={{ color: "#3381FF", textDecoration: "underline", textUnderlineOffset: 3 }}>Learn more</Link>
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={decline}
          style={{ color: "#71717A", fontSize: 13, fontWeight: 600, background: "transparent", border: "none", cursor: "pointer", padding: "8px 12px" }}
        >
          Decline
        </button>
        <button
          id="cookie-accept-btn"
          onClick={accept}
          style={{
            background: "linear-gradient(135deg, #2563EB, #06B6D4)",
            color: "white", fontWeight: 700, fontSize: 13,
            padding: "9px 20px", borderRadius: 8, border: "none", cursor: "pointer",
          }}
        >
          Accept & Continue
        </button>
      </div>
    </div>
  );
}
